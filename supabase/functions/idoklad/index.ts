// ============================================
// EDGE FUNCTION: iDoklad Export
// Export hotových faktur do iDoklad API
// WOOs, s. r. o.
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// iDoklad API konfigurace - credentials z Supabase Secrets
const IDOKLAD_CONFIG = {
  clientId: Deno.env.get('IDOKLAD_CLIENT_ID') || '',
  clientSecret: Deno.env.get('IDOKLAD_CLIENT_SECRET') || '',
  tokenUrl: 'https://app.idoklad.cz/identity/server/connect/token',
  apiUrl: 'https://app.idoklad.cz/api/v3',
}

// Cache pro access token
let accessToken: string | null = null
let tokenExpiry: number = 0

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
      case 'export': {
        // Exportovat fakturu do iDoklad
        const { invoiceId } = data

        if (!invoiceId) {
          return new Response(
            JSON.stringify({ error: 'Chybí ID faktury' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat fakturu z DB
        const { data: invoice, error: invError } = await supabaseAdmin
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (invError || !invoice) {
          return new Response(
            JSON.stringify({ error: 'Faktura nenalezena' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Zkontrolovat, zda už není exportována
        if (invoice.idoklad_exported && invoice.idoklad_id) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Faktura již byla exportována',
              idoklad_id: invoice.idoklad_id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat access token
        const token = await getAccessToken()
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat přístup k iDoklad API' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Připravit data pro iDoklad
        const idokladInvoice = await prepareIdokladInvoice(invoice, supabaseAdmin)

        // Odeslat do iDoklad API
        const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(idokladInvoice)
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('iDoklad API error:', errorText)
          return new Response(
            JSON.stringify({ 
              error: 'Chyba při exportu do iDoklad',
              details: errorText
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const idokladResult = await createResponse.json()

        // Aktualizovat fakturu v DB
        await supabaseAdmin
          .from('invoices')
          .update({
            idoklad_exported: true,
            idoklad_id: idokladResult.Id?.toString() || idokladResult.id?.toString(),
            idoklad_exported_at: new Date().toISOString()
          })
          .eq('id', invoiceId)

        return new Response(
          JSON.stringify({ 
            success: true, 
            idoklad_id: idokladResult.Id || idokladResult.id,
            message: 'Faktura úspěšně exportována do iDoklad'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'sync': {
        // Synchronizovat stav faktury z iDoklad
        const { invoiceId } = data

        const { data: invoice } = await supabaseAdmin
          .from('invoices')
          .select('idoklad_id')
          .eq('id', invoiceId)
          .single()

        if (!invoice?.idoklad_id) {
          return new Response(
            JSON.stringify({ error: 'Faktura není exportována do iDoklad' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const token = await getAccessToken()
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat přístup k iDoklad API' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const statusResponse = await fetch(
          `${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices/${invoice.idoklad_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
        )

        if (!statusResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat stav z iDoklad' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const idokladData = await statusResponse.json()

        return new Response(
          JSON.stringify({ 
            success: true,
            idoklad_status: idokladData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'exportPending': {
        // Exportovat všechny neexportované faktury
        const { data: pendingInvoices } = await supabaseAdmin
          .from('invoices')
          .select('id')
          .eq('idoklad_exported', false)
          .eq('status', 'paid')
          .limit(50)

        if (!pendingInvoices || pendingInvoices.length === 0) {
          return new Response(
            JSON.stringify({ success: true, message: 'Žádné faktury k exportu', count: 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        let exported = 0
        let failed = 0

        for (const inv of pendingInvoices) {
          try {
            const response = await fetch(req.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'export', data: { invoiceId: inv.id } })
            })
            
            const result = await response.json()
            if (result.success) {
              exported++
            } else {
              failed++
            }
          } catch (err) {
            console.error('Export error:', err)
            failed++
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            exported,
            failed,
            total: pendingInvoices.length
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
    console.error('iDoklad error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Získat access token pro iDoklad API
async function getAccessToken(): Promise<string | null> {
  // Použít cache pokud je token platný
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch(IDOKLAD_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: IDOKLAD_CONFIG.clientId,
        client_secret: IDOKLAD_CONFIG.clientSecret,
        scope: 'idoklad_api',
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('iDoklad token error:', errorText)
      return null
    }

    const tokenData = await response.json()
    
    accessToken = tokenData.access_token
    // Token platí typicky 3600 sekund, odečteme 60 sekund pro jistotu
    tokenExpiry = Date.now() + (tokenData.expires_in - 60) * 1000

    return accessToken
  } catch (error) {
    console.error('Token fetch error:', error)
    return null
  }
}

// Připravit data faktury pro iDoklad API
async function prepareIdokladInvoice(invoice: any, supabase: any): Promise<any> {
  // Parsovat položky
  let items = []
  try {
    items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
  } catch {
    items = [{
      description: invoice.currency === 'CZK' 
        ? 'Roční předplatné LiquiMixer (365 dní)' 
        : 'LiquiMixer Annual Subscription (365 days)',
      quantity: 1,
      unit_price_net: invoice.subtotal,
      vat_rate: invoice.vat_rate
    }]
  }

  // Mapování DPH sazeb na iDoklad VatRateType
  // 0 = základní sazba, 1 = snížená, 2 = druhá snížená, 3 = nulová
  const getVatRateType = (rate: number): number => {
    if (rate === 0) return 3
    if (rate === 21 || rate === 19 || rate === 20) return 0 // základní
    if (rate === 15 || rate === 12 || rate === 10) return 1 // snížená
    return 0
  }

  // Formát pro iDoklad API v3
  return {
    // Číslo dokladu
    DocumentNumber: invoice.invoice_number,
    
    // Odběratel
    PartnerName: invoice.customer_name,
    PartnerAddress: {
      Street: invoice.customer_street || '',
      City: invoice.customer_city || '',
      PostalCode: invoice.customer_zip || '',
      CountryId: getCountryId(invoice.customer_country)
    },
    
    // Datumy
    DateOfIssue: invoice.issue_date,
    DateOfTaxing: invoice.taxable_supply_date,
    DateOfMaturity: invoice.due_date,
    DateOfPayment: invoice.paid_at ? invoice.paid_at.split('T')[0] : null,
    
    // Měna
    CurrencyId: invoice.currency === 'CZK' ? 1 : 2, // 1 = CZK, 2 = EUR
    
    // Položky
    Items: items.map((item: any) => ({
      Name: item.description,
      Amount: item.quantity || 1,
      Unit: item.unit || 'ks',
      UnitPrice: item.unit_price_net,
      VatRateType: getVatRateType(item.vat_rate || invoice.vat_rate),
      PriceType: 0, // 0 = bez DPH
    })),
    
    // Platba
    IsPaid: true,
    PaymentStatus: 2, // 2 = Paid
    
    // Poznámka
    Note: invoice.locale === 'cs' 
      ? 'Faktura vygenerována automaticky systémem LiquiMixer'
      : 'Invoice generated automatically by LiquiMixer system',
    
    // Typ dokladu
    DocumentType: 0, // 0 = Faktura
    
    // Email
    PartnerEmail: invoice.customer_email,
  }
}

// Mapování kódu země na iDoklad CountryId
function getCountryId(countryCode: string): number {
  const countryMap: Record<string, number> = {
    'CZ': 1,
    'SK': 2,
    'DE': 4,
    'AT': 5,
    'PL': 6,
    'HU': 7,
    'FR': 8,
    'IT': 9,
    'ES': 10,
    'NL': 11,
    'BE': 12,
    'GB': 13,
    'US': 14,
  }
  return countryMap[countryCode] || 1 // Default CZ
}























