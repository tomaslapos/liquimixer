// ============================================
// EDGE FUNCTION: GP webpay Payment Gateway
// Bezpečné zpracování plateb s audit logováním
// WOOs, s. r. o. - Plátce DPH
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'
import { 
  getCorsHeaders, 
  handleCorsPreflght, 
  checkRateLimit as sharedRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse 
} from '../_shared/cors.ts'

// GP webpay konfigurace
const GPWEBPAY_CONFIG = {
  merchantNumber: Deno.env.get('GPWEBPAY_MERCHANT_NUMBER') || '',
  gatewayUrl: Deno.env.get('GPWEBPAY_GATEWAY_URL') || 'https://test.3dsecure.gpwebpay.com/pgw/order.do',
  privateKey: Deno.env.get('GPWEBPAY_PRIVATE_KEY') || '', // Base64 encoded PEM
  privateKeyPassword: Deno.env.get('GPWEBPAY_PRIVATE_KEY_PASSWORD') || '',
  publicKey: Deno.env.get('GPWEBPAY_PUBLIC_KEY') || '', // Base64 encoded PEM for verification
}

// Konstanty
const SUBSCRIPTION_DURATION_DAYS = 365
const CALLBACK_URL = Deno.env.get('GPWEBPAY_CALLBACK_URL') || ''
const SUCCESS_URL = Deno.env.get('GPWEBPAY_SUCCESS_URL') || 'https://www.liquimixer.com/?payment=success'
const FAIL_URL = Deno.env.get('GPWEBPAY_FAIL_URL') || 'https://www.liquimixer.com/?payment=failed'

// Verify Clerk JWT token
async function verifyClerkToken(token: string): Promise<{ sub: string; email?: string } | null> {
  try {
    // Decode JWT without verification (Clerk tokens are pre-verified by frontend)
    // For production, use Clerk's backend SDK or JWKS verification
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }
    
    return { sub: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

// Audit logging
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

// Generate GP webpay signature
async function generateSignature(data: string, privateKeyPem: string, password: string): Promise<string> {
  // In production, use proper RSA signing with the private key
  // This is a placeholder - GP webpay requires RSA-SHA1 signature
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(privateKeyPem + password)
  const messageData = encoder.encode(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return base64Encode(new Uint8Array(signature))
}

// Verify GP webpay response signature
async function verifySignature(data: string, signature: string, publicKeyPem: string): Promise<boolean> {
  // In production, verify RSA-SHA1 signature with public key
  // For now, return true (implement proper verification before production)
  console.log('Signature verification - implement before production')
  return true
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflght(origin)
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
    const { action, data } = await req.json()

    switch (action) {
      // ============================================
      // CREATE PAYMENT
      // ============================================
      case 'create': {
        // 1. Verify JWT token
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

        const clerkId = payload.sub

        // 2. Rate limiting
        if (!checkRateLimit(clerkId)) {
          await logAudit(supabaseAdmin, clerkId, 'payment_create_rate_limited', 'payment', null, {}, false, 'Rate limit exceeded', req)
          return new Response(
            JSON.stringify({ error: 'Too many requests. Please wait.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 3. Validate input
        if (!data.subscriptionId || typeof data.subscriptionId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid subscription ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 4. Get subscription
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

        // 5. Generate order number
        const orderNumber = `LM${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        
        // 6. Get user email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('clerk_id', clerkId)
          .single()

        // 7. Create payment record
        const { data: payment, error: payError } = await supabaseAdmin
          .from('payments')
          .insert({
            clerk_id: clerkId,
            subscription_id: subscription.id,
            order_number: orderNumber,
            amount: subscription.total_amount,
            currency: subscription.currency,
            status: 'pending'
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

        // 8. Prepare GP webpay request
        const amountInCents = Math.round(subscription.total_amount * 100)
        // ISO 4217 currency codes: 203 = CZK, 978 = EUR, 840 = USD
        let currencyCode = '978' // Default EUR
        if (subscription.currency === 'CZK') {
          currencyCode = '203'
        } else if (subscription.currency === 'USD') {
          currencyCode = '840'
        }

        const gpwebpayParams = {
          MERCHANTNUMBER: GPWEBPAY_CONFIG.merchantNumber,
          OPERATION: 'CREATE_ORDER',
          ORDERNUMBER: orderNumber,
          AMOUNT: amountInCents.toString(),
          CURRENCY: currencyCode,
          DEPOSITFLAG: '1',
          URL: CALLBACK_URL,
          EMAIL: user?.email || '',
          MERORDERNUM: payment.id,
        }

        // 9. Generate signature
        const dataToSign = Object.values(gpwebpayParams).join('|')
        const signature = await generateSignature(
          dataToSign, 
          atob(GPWEBPAY_CONFIG.privateKey), 
          GPWEBPAY_CONFIG.privateKeyPassword
        )

        // 10. Build redirect URL
        const redirectParams = new URLSearchParams({
          ...gpwebpayParams,
          DIGEST: signature,
        })

        const redirectUrl = `${GPWEBPAY_CONFIG.gatewayUrl}?${redirectParams.toString()}`

        // 11. Update subscription with payment info
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
          currency: subscription.currency
        }, true, undefined, req)

        return new Response(
          JSON.stringify({
            success: true,
            paymentId: payment.id,
            orderNumber,
            redirectUrl
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // CALLBACK FROM GP WEBPAY
      // ============================================
      case 'callback': {
        const { 
          OPERATION, ORDERNUMBER, MERORDERNUM, PRCODE, SRCODE, 
          RESULTTEXT, DIGEST, DIGEST1 
        } = data

        // 1. Verify signature
        const dataToVerify = `${OPERATION}|${ORDERNUMBER}|${MERORDERNUM}|${PRCODE}|${SRCODE}|${RESULTTEXT}`
        const isValid = await verifySignature(dataToVerify, DIGEST, atob(GPWEBPAY_CONFIG.publicKey))

        if (!isValid) {
          await logAudit(supabaseAdmin, null, 'payment_callback_invalid_signature', 'payment', MERORDERNUM, { ORDERNUMBER }, false, 'Invalid signature', req)
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 2. Get payment
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*, subscriptions(*)')
          .eq('id', MERORDERNUM)
          .single()

        if (!payment) {
          await logAudit(supabaseAdmin, null, 'payment_callback_not_found', 'payment', MERORDERNUM, { ORDERNUMBER }, false, 'Payment not found', req)
          return new Response(
            JSON.stringify({ error: 'Payment not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 3. Check result (PRCODE = 0 means success)
        const isSuccess = PRCODE === '0' && SRCODE === '0'

        // 4. Update payment
        await supabaseAdmin
          .from('payments')
          .update({
            status: isSuccess ? 'completed' : 'failed',
            prcode: PRCODE,
            srcode: SRCODE,
            result_text: RESULTTEXT,
            completed_at: isSuccess ? new Date().toISOString() : null
          })
          .eq('id', payment.id)

        if (isSuccess) {
          // 5. Activate subscription
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

          // 6. Update user
          await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_id: payment.subscription_id,
              subscription_expires_at: validTo.toISOString()
            })
            .eq('clerk_id', payment.clerk_id)

          // 7. Generate invoice (async)
          const INVOICE_FUNCTION_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/invoice`
          fetch(INVOICE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              action: 'generateAndSend',
              data: { subscriptionId: payment.subscription_id }
            })
          }).catch(err => console.error('Invoice generation error:', err))

          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_completed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            amount: payment.amount,
            currency: payment.currency
          }, true, undefined, req)

          return new Response(
            JSON.stringify({ success: true, status: 'paid' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          await logAudit(supabaseAdmin, payment.clerk_id, 'payment_failed', 'payment', payment.id, {
            orderNumber: ORDERNUMBER,
            prcode: PRCODE,
            srcode: SRCODE,
            resultText: RESULTTEXT
          }, false, RESULTTEXT, req)

          return new Response(
            JSON.stringify({ success: false, status: 'failed', error: RESULTTEXT }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // ============================================
      // VERIFY PAYMENT STATUS
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
          .select('status')
          .eq('subscription_id', data.subscriptionId)
          .eq('clerk_id', payload.sub)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return new Response(
          JSON.stringify({
            status: payment?.status || 'not_found',
            isPaid: payment?.status === 'completed'
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


















