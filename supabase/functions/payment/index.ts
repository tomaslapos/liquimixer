// ============================================
// EDGE FUNCTION: Payment Operations (Comgate)
// Bezpečné zpracování plateb s DPH a fakturací
// WOOs, s. r. o. - Plátce DPH
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Comgate konfigurace - TAJNÉ KLÍČE POUZE ZDE!
const COMGATE_CONFIG = {
  merchant: Deno.env.get('COMGATE_MERCHANT_ID') || '',
  secret: Deno.env.get('COMGATE_SECRET') || '',
  testMode: Deno.env.get('COMGATE_TEST_MODE') === 'true',
  apiUrl: 'https://payments.comgate.cz/v1.0'
}

// Edge Function URLs pro interní volání
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const INVOICE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/invoice`
const IDOKLAD_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/idoklad`

// Konstanty
const SUBSCRIPTION_DURATION_DAYS = 365

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'create': {
        // Vytvořit platbu v Comgate
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Chybí autorizační token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        const clerkId = payload.sub

        // Získat předplatné
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', data.subscriptionId)
          .eq('clerk_id', clerkId)
          .eq('status', 'pending')
          .single()

        if (!subscription) {
          return new Response(
            JSON.stringify({ error: 'Předplatné nenalezeno nebo již zaplaceno' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat e-mail uživatele
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('clerk_id', clerkId)
          .single()

        // Připravit data pro Comgate
        const comgateData = new URLSearchParams({
          merchant: COMGATE_CONFIG.merchant,
          secret: COMGATE_CONFIG.secret,
          price: Math.round(subscription.total_amount * 100).toString(), // V haléřích
          curr: subscription.currency,
          label: 'LiquiMixer předplatné',
          refId: subscription.id,
          email: user?.email || data.email || '',
          country: 'CZ',
          lang: 'cs',
          prepareOnly: 'true',
          test: COMGATE_CONFIG.testMode ? 'true' : 'false'
        })

        // Volat Comgate API
        const comgateResponse = await fetch(`${COMGATE_CONFIG.apiUrl}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: comgateData
        })

        const comgateResult = await comgateResponse.text()
        const resultParams = new URLSearchParams(comgateResult)

        if (resultParams.get('code') !== '0') {
          console.error('Comgate error:', comgateResult)
          return new Response(
            JSON.stringify({ 
              error: 'Chyba při vytváření platby',
              details: resultParams.get('message')
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const transId = resultParams.get('transId')
        const redirectUrl = resultParams.get('redirect')

        // Uložit transakci
        await supabaseAdmin
          .from('payment_transactions')
          .insert({
            clerk_id: clerkId,
            subscription_id: subscription.id,
            comgate_trans_id: transId,
            comgate_ref_id: subscription.id,
            amount: subscription.total_amount,
            currency: subscription.currency,
            status: 'pending',
            client_ip: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown'
          })

        // Aktualizovat předplatné
        await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_id: transId,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            transId: transId,
            redirectUrl: redirectUrl
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'callback': {
        // Zpracovat callback z Comgate (volá Comgate server)
        // Toto by mělo být na samostatné URL bez autorizace
        
        const { transId, status, refId } = data

        if (!transId || !refId) {
          return new Response(
            JSON.stringify({ error: 'Chybí data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Ověřit transakci u Comgate
        const verifyData = new URLSearchParams({
          merchant: COMGATE_CONFIG.merchant,
          secret: COMGATE_CONFIG.secret,
          transId: transId
        })

        const verifyResponse = await fetch(`${COMGATE_CONFIG.apiUrl}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: verifyData
        })

        const verifyResult = await verifyResponse.text()
        const verifyParams = new URLSearchParams(verifyResult)

        const paymentStatus = verifyParams.get('status')

        // Aktualizovat transakci
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: paymentStatus === 'PAID' ? 'paid' : paymentStatus?.toLowerCase() || 'unknown',
            payment_method: verifyParams.get('method'),
            response_code: verifyParams.get('code'),
            response_message: verifyParams.get('message'),
            completed_at: paymentStatus === 'PAID' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('comgate_trans_id', transId)

        if (paymentStatus === 'PAID') {
          // Aktivovat předplatné
          const now = new Date()
          const validTo = new Date(now)
          validTo.setDate(validTo.getDate() + SUBSCRIPTION_DURATION_DAYS)

          const { data: activatedSub } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              payment_status: 'paid',
              payment_method: verifyParams.get('method'),
              valid_from: now.toISOString(),
              valid_to: validTo.toISOString(),
              paid_at: now.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', refId)
            .select()
            .single()

          // Aktualizovat stav předplatného v users tabulce
          if (activatedSub) {
            await supabaseAdmin
              .from('users')
              .update({
                subscription_status: 'active',
                subscription_expires_at: validTo.toISOString(),
                last_subscription_check: now.toISOString()
              })
              .eq('clerk_id', activatedSub.clerk_id)

            // Generovat fakturu a odeslat email
            await generateAndSendInvoice(activatedSub.id)

            // Exportovat do iDoklad (async, neblokující)
            exportToIdoklad(activatedSub.id).catch(err => {
              console.error('iDoklad export failed (non-blocking):', err)
            })
          }

          return new Response(
            JSON.stringify({ success: true, status: 'paid' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Aktualizovat stav předplatného
          await supabaseAdmin
            .from('subscriptions')
            .update({
              payment_status: paymentStatus?.toLowerCase() || 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', refId)

          return new Response(
            JSON.stringify({ success: false, status: paymentStatus }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'verify': {
        // Ověřit stav platby (pro frontend polling)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Chybí autorizační token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        const clerkId = payload.sub

        const { data: transaction } = await supabaseAdmin
          .from('payment_transactions')
          .select('status, comgate_trans_id')
          .eq('subscription_id', data.subscriptionId)
          .eq('clerk_id', clerkId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!transaction) {
          return new Response(
            JSON.stringify({ error: 'Transakce nenalezena' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            status: transaction.status,
            isPaid: transaction.status === 'paid'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Neznámá akce' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Payment error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Generovat fakturu a odeslat email přes invoice Edge Function
async function generateAndSendInvoice(subscriptionId: string): Promise<void> {
  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const response = await fetch(INVOICE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: 'generateAndSend',
        data: { subscriptionId }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Invoice generation failed:', errorText)
    } else {
      const result = await response.json()
      console.log('Invoice generated and sent:', result)
    }
  } catch (error) {
    console.error('Error calling invoice function:', error)
  }
}

// Exportovat fakturu do iDoklad (async, neblokující)
async function exportToIdoklad(subscriptionId: string): Promise<void> {
  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Počkat chvíli, aby se faktura stihla vytvořit
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Nejprve získat ID faktury
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!invoice) {
      console.error('Invoice not found for subscription:', subscriptionId)
      return
    }

    const response = await fetch(IDOKLAD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: 'export',
        data: { invoiceId: invoice.id }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('iDoklad export failed:', errorText)
    } else {
      const result = await response.json()
      console.log('Invoice exported to iDoklad:', result)
    }
  } catch (error) {
    console.error('Error calling iDoklad function:', error)
  }
}










