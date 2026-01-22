// ============================================
// EDGE FUNCTION: GP webpay Payment Gateway
// Bezpečné zpracování plateb s audit logováním
// WOOs, s. r. o. - Plátce DPH
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode as base64Decode, encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
import { 
  getCorsHeaders, 
  handleCorsPreflight, 
  checkRateLimit as sharedRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse 
} from '../_shared/cors.ts'
import { verifyClerkToken as verifyClerkTokenFull } from '../_shared/clerk-jwt.ts'

// ============================================
// GP WEBPAY KONFIGURACE
// ============================================

// Testovací vs. produkční prostředí
const IS_TEST_MODE = Deno.env.get('GPWEBPAY_TEST_MODE') !== 'false'

// Gateway URLs
const GATEWAY_URLS = {
  test: 'https://test.3dsecure.gpwebpay.com/pgw/order.do',
  production: 'https://3dsecure.gpwebpay.com/pgw/order.do'
}

// Konfigurace
const GPWEBPAY_CONFIG = {
  // Merchant number - vždy z env, fallback na testovací číslo
  merchantNumber: Deno.env.get('GPWEBPAY_MERCHANT_NUMBER') || '20263539',
  
  // Gateway URL podle režimu
  gatewayUrl: IS_TEST_MODE 
    ? GATEWAY_URLS.test 
    : (Deno.env.get('GPWEBPAY_GATEWAY_URL') || GATEWAY_URLS.production),
  
  // Privátní klíč obchodníka (PEM formát, Base64 encoded v env)
  privateKey: Deno.env.get('GPWEBPAY_PRIVATE_KEY') || '',
  
  // Heslo k privátnímu klíči (povinné v produkci)
  privateKeyPassword: Deno.env.get('GPWEBPAY_PRIVATE_KEY_PASSWORD') || '',
  
  // Veřejný klíč GPE pro ověření odpovědí (PEM formát, Base64 encoded v env)
  gpePublicKey: Deno.env.get('GPWEBPAY_GPE_PUBLIC_KEY') || '',
}

// Callback a redirect URLs
const BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.liquimixer.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''

// URL pro callback od GP WebPay (GET/POST zpět na naši funkci)
const CALLBACK_URL = `${SUPABASE_URL}/functions/v1/gpwebpay`

// URL pro přesměrování uživatele po platbě
const SUCCESS_URL = `${BASE_URL}/?payment=success`
const FAIL_URL = `${BASE_URL}/?payment=failed`

// Konstanty
const SUBSCRIPTION_DURATION_DAYS = 365

// ============================================
// RSA PODPIS A OVĚŘENÍ (Node.js crypto)
// ============================================

// Podepsat data pomocí RSA-SHA1 (podporuje šifrované i nešifrované klíče)
async function signData(data: string, privateKeyPem: string, passphrase?: string): Promise<string> {
  try {
    const { createSign, createPrivateKey } = await import('node:crypto')
    
    let privateKey: any
    
    // Podpora pro šifrované klíče - nejprve dešifrovat pomocí createPrivateKey
    if (passphrase && privateKeyPem.includes('ENCRYPTED')) {
      try {
        privateKey = createPrivateKey({
          key: privateKeyPem,
          passphrase: passphrase,
          format: 'pem'
        })
      } catch (decryptError: any) {
        console.error('Failed to decrypt private key:', decryptError.message)
        throw new Error(`Failed to decrypt private key: ${decryptError.message}`)
      }
    } else {
      privateKey = privateKeyPem
    }
    
    const sign = createSign('RSA-SHA1')
    sign.update(data)
    const signature = sign.sign(privateKey, 'base64')
    
    return signature
    
  } catch (error: any) {
    console.error('Signing error:', error.message)
    throw new Error(`Failed to sign data: ${error.message}`)
  }
}

// Ověřit podpis odpovědi od GP WebPay
async function verifySignature(data: string, signatureBase64: string, publicKeyPem: string): Promise<boolean> {
  try {
    const { createVerify } = await import('node:crypto')
    
    const verify = createVerify('RSA-SHA1')
    verify.update(data)
    
    return verify.verify(publicKeyPem, signatureBase64, 'base64')
    
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// ============================================
// CLERK JWT VERIFIKACE
// Používá sdílenou funkci s plnou verifikací podpisu
// ============================================

async function verifyClerkToken(token: string): Promise<{ sub: string; email?: string } | null> {
  const payload = await verifyClerkTokenFull(token, {
    authorizedParties: ['https://www.liquimixer.com', 'https://liquimixer.com']
  })
  
  if (!payload) return null
  
  return { sub: payload.sub, email: payload.email }
}

// ============================================
// AUDIT LOGGING
// ============================================

async function logAudit(
  supabase: any,
  clerkId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: any,
  success: boolean,
  errorMessage?: string,
  req?: Request
) {
  try {
    await supabase.from('audit_logs').insert({
      clerk_id: clerkId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: req?.headers.get('x-forwarded-for') || req?.headers.get('cf-connecting-ip') || 'unknown',
      user_agent: req?.headers.get('user-agent') || 'unknown',
      details,
      success,
      error_message: errorMessage,
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

// ============================================
// RATE LIMITING (per user)
// ============================================

const userRateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = userRateLimits.get(userId)
  
  if (!limit || limit.resetAt < now) {
    userRateLimits.set(userId, { count: 1, resetAt: now + 60000 }) // 1 minuta
    return true
  }
  
  if (limit.count >= 5) { // Max 5 plateb za minutu
    return false
  }
  
  limit.count++
  return true
}

// ============================================
// HLAVNÍ HANDLER
// ============================================

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req)
  const rateCheck = sharedRateLimit(identifier, 'payment')
  
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetAt, origin)
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const url = new URL(req.url)
    
    // Rozlišit mezi POST JSON a GET/POST callback od GP WebPay
    let action: string
    let data: any = {}
    
    // GP WebPay callback přichází jako GET nebo POST s form data
    if (url.searchParams.has('PRCODE') || url.searchParams.has('OPERATION')) {
      action = 'callback'
      
      // Funkce pro čištění hodnoty - odstranit VŠECHNY whitespace a speciální znaky
      const cleanValue = (val: any): string => {
        const str = String(val || '')
        return str.replace(/[\s\r\n\t\u0000-\u001F\u007F-\u009F]+/g, '')
      }
      
      // Parsovat parametry z URL nebo POST body
      if (req.method === 'GET') {
        url.searchParams.forEach((value, key) => {
          data[key] = cleanValue(value)
        })
      } else {
        const formData = await req.formData().catch(() => null)
        if (formData) {
          formData.forEach((value, key) => {
            data[key] = cleanValue(value)
          })
        } else {
          url.searchParams.forEach((value, key) => {
            data[key] = cleanValue(value)
          })
        }
      }
    } else {
      // Standardní JSON API volání
      const body = await req.json()
      action = body.action
      data = body.data || {}
    }

    switch (action) {
      // ============================================
      // CREATE PAYMENT - Vytvořit platbu a přesměrovat na bránu
      // ============================================
      case 'create': {
        // 1. Ověřit Clerk token (přijatý v custom headeru x-clerk-token)
        const clerkToken = req.headers.get('x-clerk-token')
        if (!clerkToken) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - missing Clerk token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const payload = await verifyClerkToken(clerkToken)
        
        if (!payload) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const clerkId = payload.sub

        // 2. Rate limiting per user
        if (!checkRateLimit(clerkId)) {
          await logAudit(supabaseAdmin, clerkId, 'payment_create_rate_limited', 'payment', null, {}, false, 'Rate limit exceeded', req)
          return new Response(
            JSON.stringify({ error: 'Too many requests. Please wait.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 3. Validovat vstup
        if (!data.subscriptionId || typeof data.subscriptionId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid subscription ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 4. Získat subscription
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', data.subscriptionId)
          .eq('clerk_id', clerkId)
          .eq('status', 'pending')
          .single()

        if (subError || !subscription) {
          console.error('Subscription lookup error:', subError?.message)
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', null, { subscriptionId: data.subscriptionId }, false, 'Subscription not found', req)
          return new Response(
            JSON.stringify({ error: 'Subscription not found or already paid', details: subError?.message, subscriptionId: data.subscriptionId }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 5. Hledat existující pending platbu pro tuto subscription
        const { data: existingPayment } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('subscription_id', subscription.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let payment: any
        let orderNumber: string

        if (existingPayment) {
          payment = existingPayment
          orderNumber = existingPayment.order_number
        } else {
          // Vytvořit novou platbu
          // ORDERNUMBER musí být POUZE NUMERICKÝ (čísla), max 15 znaků!
          const timestamp = Date.now().toString().slice(-10)
          const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
          orderNumber = `${timestamp}${random}`.substring(0, 15)

          const { data: newPayment, error: payError } = await supabaseAdmin
            .from('payments')
            .insert({
              clerk_id: clerkId,
              subscription_id: subscription.id,
              order_number: orderNumber,
              amount: subscription.total_amount,
              currency: subscription.currency,
              status: 'pending',
              gateway: 'gpwebpay',
              test_mode: IS_TEST_MODE
            })
            .select()
            .single()

          if (payError) {
            console.error('Payment insert error:', payError.message)
            await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', null, { error: payError.message }, false, payError.message, req)
            return new Response(
              JSON.stringify({ error: 'Failed to create payment', details: payError.message, code: payError.code }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          payment = newPayment
        }
        
        // 6. Získat email uživatele
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('clerk_id', clerkId)
          .single()

        // 7. Připravit parametry pro GP WebPay
        const amountInSmallestUnit = Math.round(subscription.total_amount * 100)
        
        const currencyCodes: Record<string, string> = {
          'CZK': '203',
          'EUR': '978',
          'USD': '840'
        }
        const currencyCode = currencyCodes[subscription.currency] || '978'

        const operation = 'CREATE_ORDER'
        const depositFlag = '1'
        
        // Data pro podpis (pipe-delimited)
        const dataToSign = [
          GPWEBPAY_CONFIG.merchantNumber,
          operation,
          orderNumber,
          amountInSmallestUnit.toString(),
          currencyCode,
          depositFlag,
          CALLBACK_URL
        ].join('|')

        // 8. Získat privátní klíč a podepsat
        let privateKeyPem: string
        
        if (GPWEBPAY_CONFIG.privateKey) {
          try {
            privateKeyPem = new TextDecoder().decode(base64Decode(GPWEBPAY_CONFIG.privateKey))
          } catch {
            privateKeyPem = GPWEBPAY_CONFIG.privateKey
          }
        } else {
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', payment.id, {}, false, 'Private key not configured', req)
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Podepsat data
        let signature: string
        try {
          signature = await signData(dataToSign, privateKeyPem, GPWEBPAY_CONFIG.privateKeyPassword)
        } catch (signError: any) {
          console.error('Signing failed:', signError.message)
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', payment.id, { error: signError.message }, false, signError.message, req)
          return new Response(
            JSON.stringify({ error: 'Failed to create payment', details: signError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 9. Sestavit URL pro přesměrování
        const gatewayParams = new URLSearchParams({
          MERCHANTNUMBER: GPWEBPAY_CONFIG.merchantNumber,
          OPERATION: operation,
          ORDERNUMBER: orderNumber,
          AMOUNT: amountInSmallestUnit.toString(),
          CURRENCY: currencyCode,
          DEPOSITFLAG: depositFlag,
          URL: CALLBACK_URL,
          DIGEST: signature
        })

        const redirectUrl = `${GPWEBPAY_CONFIG.gatewayUrl}?${gatewayParams.toString()}`

        // 10. Aktualizovat subscription s payment ID
        await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_id: payment.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id)

        // 11. Audit log
        await logAudit(supabaseAdmin, clerkId, 'payment_created', 'payment', payment.id, {
          orderNumber,
          amount: subscription.total_amount,
          currency: subscription.currency,
          testMode: IS_TEST_MODE
        }, true, undefined, req)

        return new Response(
          JSON.stringify({
            success: true,
            paymentId: payment.id,
            orderNumber,
            redirectUrl,
            testMode: IS_TEST_MODE
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // CALLBACK - Zpracování odpovědi od GP WebPay
      // ============================================
      case 'callback': {
        const OPERATION = data.OPERATION || ''
        const ORDERNUMBER = data.ORDERNUMBER || ''
        const PRCODE = data.PRCODE || ''
        const SRCODE = data.SRCODE || ''
        const RESULTTEXT = data.RESULTTEXT || ''
        const DIGEST = data.DIGEST || ''
        const DIGEST1 = data.DIGEST1 || ''

        // 1. Ověřit podpis odpovědi
        const digestData = [OPERATION, ORDERNUMBER, PRCODE, SRCODE, RESULTTEXT]
          .filter(v => v !== undefined && v !== null && v !== '')
          .join('|')

        const digest1Data = `${digestData}|${GPWEBPAY_CONFIG.merchantNumber}`

        // Získat veřejný klíč GPE
        let gpePublicKeyPem: string | null = null
        
        if (GPWEBPAY_CONFIG.gpePublicKey) {
          try {
            gpePublicKeyPem = new TextDecoder().decode(base64Decode(GPWEBPAY_CONFIG.gpePublicKey))
          } catch {
            gpePublicKeyPem = GPWEBPAY_CONFIG.gpePublicKey
          }
        }

        // Ověřit podpisy (pokud máme klíč)
        let digestValid = true
        let digest1Valid = true
        
        if (gpePublicKeyPem && DIGEST) {
          digestValid = await verifySignature(digestData, DIGEST, gpePublicKeyPem)
        }
        
        if (gpePublicKeyPem && DIGEST1) {
          digest1Valid = await verifySignature(digest1Data, DIGEST1, gpePublicKeyPem)
        }

        if (!digestValid || !digest1Valid) {
          await logAudit(supabaseAdmin, null, 'payment_callback_invalid_signature', 'payment', null, { 
            ORDERNUMBER, 
            digestValid, 
            digest1Valid 
          }, false, 'Invalid signature', req)
          
          return Response.redirect(`${FAIL_URL}&error=invalid_signature`, 302)
        }

        // 2. Získat payment záznam podle order_number pomocí RPC
        const { data: paymentRows, error: paymentLookupError } = await supabaseAdmin
          .rpc('find_payment_by_order_number', { p_order_number: ORDERNUMBER })

        if (paymentLookupError) {
          console.error('Payment RPC lookup error:', paymentLookupError.message)
        }

        const payment = paymentRows && paymentRows.length > 0 ? paymentRows[0] : null

        if (!payment) {
          console.error('Payment not found for order_number:', ORDERNUMBER)
          await logAudit(supabaseAdmin, null, 'payment_callback_not_found', 'payment', null, { ORDERNUMBER }, false, 'Payment not found', req)
          return Response.redirect(`${FAIL_URL}&error=payment_not_found`, 302)
        }

        // 3. Zkontrolovat výsledek (PRCODE = 0 znamená úspěch)
        const isSuccess = PRCODE === '0' && SRCODE === '0'

        // 4. Aktualizovat payment
        const { error: paymentUpdateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: isSuccess ? 'completed' : 'failed',
            prcode: PRCODE,
            srcode: SRCODE,
            result_text: RESULTTEXT,
            completed_at: isSuccess ? new Date().toISOString() : null
          })
          .eq('id', payment.id)

        if (paymentUpdateError) {
          console.error('Payment update error:', paymentUpdateError.message)
        }

        if (isSuccess) {
          // 5. Aktivovat subscription
          const now = new Date()
          const validTo = new Date(now)
          validTo.setDate(validTo.getDate() + SUBSCRIPTION_DURATION_DAYS)

          const { error: subUpdateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              payment_status: 'paid',
              valid_from: now.toISOString(),
              valid_to: validTo.toISOString(),
              paid_at: now.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', payment.subscription_id)

          if (subUpdateError) {
            console.error('Subscription update error:', subUpdateError.message)
          }

          // 6. Aktualizovat uživatele
          const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_id: payment.subscription_id,
              subscription_expires_at: validTo.toISOString()
            })
            .eq('clerk_id', payment.clerk_id)

          if (userUpdateError) {
            console.error('User update error:', userUpdateError.message)
          }

          // 7. Vytvořit fakturu a odeslat email
          const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
          
          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('id', payment.subscription_id)
            .single()
          
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('email, first_name, last_name, preferred_locale')
            .eq('clerk_id', payment.clerk_id)
            .single()
          
          const customerEmail = user?.email || ''
          const customerName = user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : (user?.first_name || customerEmail)
          
          // Jazyk faktury: 1) user.preferred_locale, 2) subscription.user_locale, 3) 'en' jako fallback
          const invoiceLocale = user?.preferred_locale || subscription?.user_locale || 'en'
          
          // Vytvořit fakturu v iDoklad
          const idokladFunctionUrl = `${SUPABASE_URL}/functions/v1/idoklad`
          let invoiceData = null
          
          try {
            const idokladResponse = await fetch(idokladFunctionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
              },
              body: JSON.stringify({
                action: 'createInvoice',
                data: {
                  subscriptionId: payment.subscription_id,
                  clerkId: payment.clerk_id,
                  customerEmail: customerEmail,
                  customerName: customerName,
                  amount: subscription?.total_amount || payment.amount,
                  currency: subscription?.currency || payment.currency,
                  locale: invoiceLocale,
                  country: subscription?.user_country || 'CZ',
                  orderNumber: ORDERNUMBER
                }
              })
            })
            
            const idokladResult = await idokladResponse.json().catch(() => ({ error: 'Invalid JSON response' }))
            
            if (idokladResult.success && idokladResult.invoice) {
              invoiceData = idokladResult.invoice
            } else {
              console.error('iDoklad invoice creation failed:', idokladResult.error)
            }
          } catch (idokladErr: any) {
            console.error('iDoklad error:', idokladErr.message)
          }
          
          // Odeslat email s fakturou
          if (invoiceData && customerEmail) {
            const invoiceFunctionUrl = `${SUPABASE_URL}/functions/v1/invoice`
            try {
              const emailResponse = await fetch(invoiceFunctionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey,
                },
                body: JSON.stringify({
                  action: 'sendEmail',
                  data: {
                    invoice: invoiceData,
                    customerEmail: customerEmail,
                    customerName: customerName,
                    locale: invoiceLocale
                  }
                })
              })
              
              await emailResponse.json().catch(() => ({ error: 'Invalid JSON response' }))
            } catch (emailErr: any) {
              console.error('Email send error:', emailErr.message)
            }
          }

          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_completed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            amount: payment.amount,
            currency: payment.currency,
            testMode: payment.test_mode || false
          }, true, undefined, req)

          return Response.redirect(SUCCESS_URL, 302)
          
        } else {
          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_failed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            prcode: PRCODE,
            srcode: SRCODE,
            resultText: RESULTTEXT
          }, false, RESULTTEXT, req)

          return Response.redirect(`${FAIL_URL}&prcode=${PRCODE}&srcode=${SRCODE}`, 302)
        }
      }

      // ============================================
      // VERIFY - Ověřit stav platby
      // ============================================
      case 'verify': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const payload = await verifyClerkToken(token)
        
        if (!payload) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('status, prcode, srcode, result_text')
          .eq('subscription_id', data.subscriptionId)
          .eq('clerk_id', payload.sub)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return new Response(
          JSON.stringify({
            status: payment?.status || 'not_found',
            isPaid: payment?.status === 'completed',
            prcode: payment?.prcode,
            srcode: payment?.srcode,
            resultText: payment?.result_text
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // STATUS - Informace o konfiguraci (pro admin/debug)
      // ============================================
      case 'status': {
        return new Response(
          JSON.stringify({
            testMode: IS_TEST_MODE,
            merchantNumber: IS_TEST_MODE ? GPWEBPAY_CONFIG.merchantNumber : '***hidden***',
            gatewayUrl: GPWEBPAY_CONFIG.gatewayUrl,
            callbackUrl: CALLBACK_URL,
            privateKeyConfigured: !!GPWEBPAY_CONFIG.privateKey,
            gpePublicKeyConfigured: !!GPWEBPAY_CONFIG.gpePublicKey
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('GP webpay error:', error)
    await logAudit(supabaseAdmin, null, 'payment_error', 'payment', null, { error: error.message }, false, error.message, req)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
