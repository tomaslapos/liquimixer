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

// Testovací merchant number z dokumentace GP WebPay
const TEST_MERCHANT_NUMBER = '123456'

// Konfigurace
const GPWEBPAY_CONFIG = {
  // Merchant number - v test režimu použít testovací, jinak z env
  merchantNumber: IS_TEST_MODE 
    ? TEST_MERCHANT_NUMBER 
    : (Deno.env.get('GPWEBPAY_MERCHANT_NUMBER') || TEST_MERCHANT_NUMBER),
  
  // Gateway URL podle režimu
  gatewayUrl: IS_TEST_MODE 
    ? GATEWAY_URLS.test 
    : (Deno.env.get('GPWEBPAY_GATEWAY_URL') || GATEWAY_URLS.production),
  
  // Privátní klíč obchodníka (PEM formát, Base64 encoded v env)
  privateKey: Deno.env.get('GPWEBPAY_PRIVATE_KEY') || '',
  
  // Heslo k privátnímu klíči
  privateKeyPassword: Deno.env.get('GPWEBPAY_PRIVATE_KEY_PASSWORD') || '111111',
  
  // Veřejný klíč GPE pro ověření odpovědí (PEM formát, Base64 encoded v env)
  gpePublicKey: Deno.env.get('GPWEBPAY_GPE_PUBLIC_KEY') || '',
}

// Callback a redirect URLs
const BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.liquimixer.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''

// URL pro callback od GP WebPay (POST zpět na naši funkci)
const CALLBACK_URL = `${SUPABASE_URL}/functions/v1/gpwebpay`

// URL pro přesměrování uživatele po platbě
const SUCCESS_URL = `${BASE_URL}/?payment=success`
const FAIL_URL = `${BASE_URL}/?payment=failed`

// Konstanty
const SUBSCRIPTION_DURATION_DAYS = 365

// ============================================
// RSA PODPIS A OVĚŘENÍ (node-forge)
// ============================================

// Podepsat data pomocí RSA-SHA1
async function signData(data: string, privateKeyPem: string, password: string): Promise<string> {
  console.log('Signing data:', data.substring(0, 100) + '...')
  
  // Import node-forge pro práci se šifrovanými klíči
  const forge = await import('https://esm.sh/node-forge@1.3.1')
  
  try {
    // Dekódovat privátní klíč s heslem
    let privateKey: any
    
    if (privateKeyPem.includes('ENCRYPTED')) {
      // Šifrovaný klíč - použít heslo
      privateKey = forge.pki.decryptRsaPrivateKey(privateKeyPem, password)
      if (!privateKey) {
        throw new Error('Failed to decrypt private key with provided password')
      }
    } else {
      // Nešifrovaný klíč
      privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
    }
    
    // Vytvořit SHA-1 hash dat
    const md = forge.md.sha1.create()
    md.update(data, 'utf8')
    
    // Podepsat pomocí RSASSA-PKCS1-v1_5
    const signature = privateKey.sign(md)
    
    // Převést na Base64
    const signatureBase64 = forge.util.encode64(signature)
    
    console.log('Signature generated successfully')
    return signatureBase64
    
  } catch (error) {
    console.error('Signing error:', error)
    throw new Error(`Failed to sign data: ${error.message}`)
  }
}

// Ověřit podpis odpovědi od GP WebPay
async function verifySignature(data: string, signatureBase64: string, publicKeyPem: string): Promise<boolean> {
  console.log('Verifying signature for data:', data.substring(0, 100) + '...')
  
  const forge = await import('https://esm.sh/node-forge@1.3.1')
  
  try {
    // Načíst veřejný klíč/certifikát
    let publicKey: any
    
    if (publicKeyPem.includes('BEGIN CERTIFICATE')) {
      // X.509 certifikát - extrahovat veřejný klíč
      const cert = forge.pki.certificateFromPem(publicKeyPem)
      publicKey = cert.publicKey
    } else {
      // Samostatný veřejný klíč
      publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
    }
    
    // Dekódovat podpis z Base64
    const signature = forge.util.decode64(signatureBase64)
    
    // Vytvořit SHA-1 hash dat
    const md = forge.md.sha1.create()
    md.update(data, 'utf8')
    
    // Ověřit podpis
    const isValid = publicKey.verify(md.digest().bytes(), signature)
    
    console.log('Signature verification result:', isValid)
    return isValid
    
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// ============================================
// CLERK JWT VERIFIKACE
// ============================================

async function verifyClerkToken(token: string): Promise<{ sub: string; email?: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Kontrola expirace
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }
    
    return { sub: payload.sub, email: payload.email }
  } catch {
    return null
  }
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
      // Parsovat parametry z URL nebo POST body
      if (req.method === 'GET') {
        url.searchParams.forEach((value, key) => {
          data[key] = value
        })
      } else {
        const formData = await req.formData().catch(() => null)
        if (formData) {
          formData.forEach((value, key) => {
            data[key] = value
          })
        } else {
          url.searchParams.forEach((value, key) => {
            data[key] = value
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
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', null, { subscriptionId: data.subscriptionId }, false, 'Subscription not found', req)
          return new Response(
            JSON.stringify({ error: 'Subscription not found or already paid' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 5. Generovat číslo objednávky (max 15 znaků pro GP WebPay)
        const timestamp = Date.now().toString().slice(-10)
        const random = Math.random().toString(36).substring(2, 6).toUpperCase()
        const orderNumber = `${timestamp}${random}`.substring(0, 15)
        
        // 6. Získat email uživatele
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('clerk_id', clerkId)
          .single()

        // 7. Vytvořit payment záznam
        const { data: payment, error: payError } = await supabaseAdmin
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
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', null, { error: payError.message }, false, payError.message, req)
          return new Response(
            JSON.stringify({ error: 'Failed to create payment' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 8. Připravit parametry pro GP WebPay
        // Částka v haléřích/centech (nejmenší jednotka měny)
        const amountInSmallestUnit = Math.round(subscription.total_amount * 100)
        
        // ISO 4217 číselné kódy měn
        const currencyCodes: Record<string, string> = {
          'CZK': '203',
          'EUR': '978',
          'USD': '840'
        }
        const currencyCode = currencyCodes[subscription.currency] || '978'

        // Sestavit data pro podpis
        // Pořadí: MERCHANTNUMBER|OPERATION|ORDERNUMBER|AMOUNT|CURRENCY|DEPOSITFLAG|MERORDERNUM|URL
        const operation = 'CREATE_ORDER'
        const depositFlag = '1' // 1 = okamžitá platba
        const merOrderNum = payment.id // Naše interní ID platby
        
        // MD (Merchant Data) - volitelný parametr pro přenos dat
        const md = JSON.stringify({ 
          paymentId: payment.id, 
          subscriptionId: subscription.id,
          testMode: IS_TEST_MODE 
        })

        // Data pro podpis (pipe-delimited)
        const dataToSign = [
          GPWEBPAY_CONFIG.merchantNumber,
          operation,
          orderNumber,
          amountInSmallestUnit.toString(),
          currencyCode,
          depositFlag,
          merOrderNum,
          CALLBACK_URL,
          md
        ].join('|')

        console.log('Data to sign:', dataToSign)
        console.log('Test mode:', IS_TEST_MODE)
        console.log('Merchant number:', GPWEBPAY_CONFIG.merchantNumber)

        // 9. Získat privátní klíč a podepsat
        let privateKeyPem: string
        
        if (GPWEBPAY_CONFIG.privateKey) {
          // Dekódovat z Base64 pokud je v env
          try {
            privateKeyPem = new TextDecoder().decode(base64Decode(GPWEBPAY_CONFIG.privateKey))
          } catch {
            privateKeyPem = GPWEBPAY_CONFIG.privateKey
          }
        } else {
          // Použít testovací klíč (pro vývoj)
          await logAudit(supabaseAdmin, clerkId, 'payment_create_failed', 'payment', payment.id, {}, false, 'Private key not configured', req)
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Podepsat data
        const signature = await signData(
          dataToSign,
          privateKeyPem,
          GPWEBPAY_CONFIG.privateKeyPassword
        )

        // 10. Sestavit URL pro přesměrování
        const gatewayParams = new URLSearchParams({
          MERCHANTNUMBER: GPWEBPAY_CONFIG.merchantNumber,
          OPERATION: operation,
          ORDERNUMBER: orderNumber,
          AMOUNT: amountInSmallestUnit.toString(),
          CURRENCY: currencyCode,
          DEPOSITFLAG: depositFlag,
          MERORDERNUM: merOrderNum,
          URL: CALLBACK_URL,
          MD: md,
          DIGEST: signature
        })

        // Přidat volitelné parametry
        if (user?.email) {
          gatewayParams.set('EMAIL', user.email)
        }

        const redirectUrl = `${GPWEBPAY_CONFIG.gatewayUrl}?${gatewayParams.toString()}`

        // 11. Aktualizovat subscription s payment ID
        await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_id: payment.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id)

        // 12. Audit log
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
        console.log('Received callback from GP WebPay:', data)
        
        const { 
          OPERATION, ORDERNUMBER, MERORDERNUM, MD,
          PRCODE, SRCODE, RESULTTEXT, 
          DIGEST, DIGEST1 
        } = data

        // 1. Parsovat MD pro získání paymentId
        let paymentId = MERORDERNUM
        let subscriptionId: string | null = null
        let isTestMode = false
        
        try {
          if (MD) {
            const mdData = JSON.parse(MD)
            paymentId = mdData.paymentId || MERORDERNUM
            subscriptionId = mdData.subscriptionId
            isTestMode = mdData.testMode || false
          }
        } catch {
          console.log('Could not parse MD, using MERORDERNUM')
        }

        // 2. Ověřit podpis odpovědi
        // Data pro DIGEST: OPERATION|ORDERNUMBER|MERORDERNUM|MD|PRCODE|SRCODE|RESULTTEXT
        const digestData = [OPERATION, ORDERNUMBER, MERORDERNUM, MD, PRCODE, SRCODE, RESULTTEXT]
          .filter(v => v !== undefined && v !== null && v !== '')
          .join('|')

        // Data pro DIGEST1: DIGEST data + |MERCHANTNUMBER
        const digest1Data = `${digestData}|${GPWEBPAY_CONFIG.merchantNumber}`

        // Získat veřejný klíč GPE
        let gpePublicKeyPem: string | null = null
        
        if (GPWEBPAY_CONFIG.gpePublicKey) {
          try {
            gpePublicKeyPem = new TextDecoder().decode(base64Decode(GPWEBPAY_CONFIG.gpePublicKey))
          } catch {
            gpePublicKeyPem = GPWEBPAY_CONFIG.gpePublicKey
          }
        } else {
          console.warn('GPE public key not configured - skipping signature verification')
        }

        // Ověřit podpisy (pokud máme klíč)
        let digestValid = true
        let digest1Valid = true
        
        if (gpePublicKeyPem && DIGEST) {
          digestValid = await verifySignature(digestData, DIGEST, gpePublicKeyPem)
          console.log('DIGEST verification:', digestValid)
        }
        
        if (gpePublicKeyPem && DIGEST1) {
          digest1Valid = await verifySignature(digest1Data, DIGEST1, gpePublicKeyPem)
          console.log('DIGEST1 verification:', digest1Valid)
        }

        if (!digestValid || !digest1Valid) {
          await logAudit(supabaseAdmin, null, 'payment_callback_invalid_signature', 'payment', paymentId, { 
            ORDERNUMBER, 
            digestValid, 
            digest1Valid 
          }, false, 'Invalid signature', req)
          
          // Přesměrovat na error stránku
          return Response.redirect(`${FAIL_URL}&error=invalid_signature`, 302)
        }

        // 3. Získat payment záznam
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*, subscriptions(*)')
          .eq('id', paymentId)
          .single()

        if (!payment) {
          await logAudit(supabaseAdmin, null, 'payment_callback_not_found', 'payment', paymentId, { ORDERNUMBER }, false, 'Payment not found', req)
          return Response.redirect(`${FAIL_URL}&error=payment_not_found`, 302)
        }

        // 4. Zkontrolovat výsledek (PRCODE = 0 znamená úspěch)
        const isSuccess = PRCODE === '0' && SRCODE === '0'

        // 5. Aktualizovat payment
        await supabaseAdmin
          .from('payments')
          .update({
            status: isSuccess ? 'completed' : 'failed',
            prcode: PRCODE,
            srcode: SRCODE,
            result_text: RESULTTEXT,
            completed_at: isSuccess ? new Date().toISOString() : null,
            gateway_response: data
          })
          .eq('id', payment.id)

        if (isSuccess) {
          // 6. Aktivovat subscription
          const now = new Date()
          const validTo = new Date(now)
          validTo.setDate(validTo.getDate() + SUBSCRIPTION_DURATION_DAYS)

          await supabaseAdmin
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

          // 7. Aktualizovat uživatele
          await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_id: payment.subscription_id,
              subscription_expires_at: validTo.toISOString()
            })
            .eq('clerk_id', payment.clerk_id)

          // 8. Generovat fakturu a exportovat do iDoklad (asynchronně)
          const invoiceFunctionUrl = `${SUPABASE_URL}/functions/v1/invoice`
          
          fetch(invoiceFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              action: 'generateAndSend',
              data: { subscriptionId: payment.subscription_id }
            })
          }).then(async (res) => {
            const result = await res.json()
            console.log('Invoice generation result:', result)
            
            // Export do iDoklad
            if (result.success && result.invoice?.id) {
              const idokladFunctionUrl = `${SUPABASE_URL}/functions/v1/idoklad`
              fetch(idokladFunctionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  action: 'export',
                  data: { invoiceId: result.invoice.id }
                })
              }).then(async (res) => {
                const idokladResult = await res.json()
                console.log('iDoklad export result:', idokladResult)
              }).catch(err => console.error('iDoklad export error:', err))
            }
          }).catch(err => console.error('Invoice generation error:', err))

          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_completed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            amount: payment.amount,
            currency: payment.currency,
            testMode: isTestMode
          }, true, undefined, req)

          // Přesměrovat na success stránku
          return Response.redirect(SUCCESS_URL, 302)
          
        } else {
          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_failed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            prcode: PRCODE,
            srcode: SRCODE,
            resultText: RESULTTEXT
          }, false, RESULTTEXT, req)

          // Přesměrovat na error stránku
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
            merchantNumber: IS_TEST_MODE ? TEST_MERCHANT_NUMBER : '***hidden***',
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
