// ============================================
// EDGE FUNCTION: Payment Operations (Comgate)
// Bezpečné zpracování plateb
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

          // Vytvořit fakturu
          if (activatedSub) {
            await createInvoice(supabaseAdmin, activatedSub)
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

// Pomocná funkce pro vytvoření faktury
async function createInvoice(supabase: any, subscription: any) {
  try {
    // Získat fakturační údaje uživatele
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', subscription.clerk_id)
      .single()

    const now = new Date()
    
    // Generovat číslo faktury
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number')

    const invoiceData = {
      clerk_id: subscription.clerk_id,
      subscription_id: subscription.id,
      invoice_number: invoiceNumber || `${now.getFullYear()}-${Date.now()}`,
      document_type: 'invoice',
      issue_date: now.toISOString().split('T')[0],
      taxable_supply_date: now.toISOString().split('T')[0],
      due_date: now.toISOString().split('T')[0],
      
      // Dodavatel
      supplier_name: Deno.env.get('COMPANY_NAME') || 'WOOs s.r.o.',
      supplier_street: Deno.env.get('COMPANY_STREET') || '',
      supplier_city: Deno.env.get('COMPANY_CITY') || '',
      supplier_zip: Deno.env.get('COMPANY_ZIP') || '',
      supplier_country: 'CZ',
      supplier_ico: Deno.env.get('COMPANY_ICO') || '',
      supplier_dic: Deno.env.get('COMPANY_DIC') || '',
      supplier_bank_account: Deno.env.get('COMPANY_BANK_ACCOUNT') || '',
      supplier_bank_name: Deno.env.get('COMPANY_BANK_NAME') || '',
      
      // Odběratel
      customer_type: user?.billing_type || 'person',
      customer_name: user?.billing_name || user?.name || '',
      customer_company: user?.billing_company,
      customer_street: user?.billing_street,
      customer_city: user?.billing_city,
      customer_zip: user?.billing_zip,
      customer_country: user?.billing_country || 'CZ',
      customer_ico: user?.billing_ico,
      customer_dic: user?.billing_dic,
      customer_email: user?.email,
      customer_phone: user?.phone,
      
      // Položky
      items: JSON.stringify([{
        description: 'Roční předplatné LiquiMixer (365 dní)',
        quantity: 1,
        unit: 'ks',
        unit_price: subscription.amount,
        vat_rate: subscription.vat_rate,
        vat_amount: subscription.vat_amount,
        total_without_vat: subscription.amount,
        total_with_vat: subscription.total_amount
      }]),
      
      // Částky
      subtotal: subscription.amount,
      vat_amount: subscription.vat_amount,
      total: subscription.total_amount,
      currency: subscription.currency,
      
      // Stav
      status: 'paid',
      paid_at: now.toISOString(),
      payment_method: subscription.payment_method,
      payment_reference: subscription.payment_id,
      
      locale: 'cs'
    }

    await supabase
      .from('invoices')
      .insert(invoiceData)

  } catch (error) {
    console.error('Error creating invoice:', error)
  }
}
