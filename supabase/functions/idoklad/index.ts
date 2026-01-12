// ============================================
// EDGE FUNCTION: iDoklad - Hlavní fakturační systém
// Vytváří faktury v iDoklad a vrací jejich údaje
// WOOs, s. r. o.
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  getCorsHeaders, 
  handleCorsPreflight, 
  checkRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse 
} from '../_shared/cors.ts'
import { getEmailTranslations, formatEmailText } from '../_shared/email-translations.ts'

// iDoklad API konfigurace
const IDOKLAD_CONFIG = {
  clientId: Deno.env.get('IDOKLAD_CLIENT_ID') || '',
  clientSecret: Deno.env.get('IDOKLAD_CLIENT_SECRET') || '',
  tokenUrl: 'https://identity.idoklad.cz/server/connect/token',
  apiUrl: 'https://api.idoklad.cz/v3',
}

// Cache pro access token
let accessToken: string | null = null
let tokenExpiry: number = 0

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const identifier = getRateLimitIdentifier(req)
  const rateCheck = checkRateLimit(identifier, 'default')
  
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetAt, origin)
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { action, data } = await req.json()

    switch (action) {
      // ============================================
      // HLAVNÍ AKCE: Vytvořit fakturu v iDoklad
      // Volá se po úspěšné platbě
      // ============================================
      case 'createInvoice': {
        const { subscriptionId, clerkId, customerEmail, customerName, amount, currency, locale, country, orderNumber } = data

        if (!subscriptionId || !clerkId) {
          return new Response(
            JSON.stringify({ error: 'Chybí subscriptionId nebo clerkId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Creating invoice in iDoklad for subscription:', subscriptionId)

        // 1. Získat access token
        const token = await getAccessToken()
        if (!token) {
          console.error('Failed to get iDoklad access token')
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat přístup k iDoklad API' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 2. Získat nebo vytvořit kontakt
        const partnerId = await getOrCreateContact(token, {
          name: customerName || customerEmail,
          email: customerEmail,
          country: country || 'CZ'
        })
        console.log('Partner ID:', partnerId)

        // 3. Získat výchozí nastavení faktury (včetně NumericSequenceId)
        const defaultSettings = await getDefaultInvoiceSettings(token)
        console.log('Default settings:', JSON.stringify(defaultSettings))

        // 3b. Získat správné PaymentOptionId pro platbu kartou
        const paymentOptionId = await getCardPaymentOptionId(token)
        console.log('Using PaymentOptionId:', paymentOptionId)

        // 4. Připravit data pro fakturu
        const today = new Date().toISOString().split('T')[0]
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        // Získat překlady podle locale
        const t = getEmailTranslations(locale || 'en')
        const itemName = t.idoklad_item_name
        const invoiceDescription = t.idoklad_description
        const invoiceNote = orderNumber 
          ? formatEmailText(t.idoklad_note_with_order, { orderNumber })
          : t.idoklad_note
        const unit = t.idoklad_unit

        // Určit DPH sazbu podle země (OSS režim - české DPH 21% pro EU, 0% mimo EU)
        const vatRate = getVatRateForCountry(country || 'CZ')
        
        // amount je konečná cena S DPH (59 Kč, 2.40 EUR, 2.90 USD)
        // Pro iDoklad: PriceType=1 znamená, že UnitPrice je cena S DPH
        // Cena bez DPH = amount / (1 + vatRate/100)
        const unitPriceWithoutVat = vatRate.rate > 0 
          ? Math.round((amount / (1 + vatRate.rate / 100)) * 100) / 100
          : amount
        const vatAmount = amount - unitPriceWithoutVat
        
        console.log(`Price calculation: total=${amount} ${currency}, vatRate=${vatRate.rate}%, base=${unitPriceWithoutVat}, vat=${vatAmount}`)

        const invoiceData: any = {
          Description: invoiceDescription,
          DateOfIssue: today,
          DateOfTaxing: today,
          DateOfMaturity: dueDate,
          DateOfPayment: today, // Zaplaceno ihned
          CurrencyId: currency === 'EUR' ? 2 : 1,
          PartnerId: partnerId,
          IsEet: false,
          IsIncomeTax: false,
          PaymentOptionId: paymentOptionId, // Dynamicky získané ID pro platbu kartou
          IsPaid: true, // Již zaplaceno
          Items: [{
            Name: itemName,
            Amount: 1,
            Unit: unit,
            UnitPrice: amount, // Konečná cena S DPH
            VatRateType: vatRate.type, // 0 = základní 21%, 3 = osvobozeno 0%
            PriceType: 1, // 1 = cena S DPH
            DiscountPercentage: 0,
            IsTaxMovement: false,
          }],
          Note: invoiceNote,
          OrderNumber: orderNumber || '', // Číslo objednávky z platební brány
        }

        // Přidat NumericSequenceId a DocumentSerialNumber z default nastavení
        if (defaultSettings.NumericSequenceId) {
          invoiceData.NumericSequenceId = defaultSettings.NumericSequenceId
        }
        if (defaultSettings.DocumentSerialNumber) {
          invoiceData.DocumentSerialNumber = defaultSettings.DocumentSerialNumber
        }

        console.log('Creating invoice with data:', JSON.stringify(invoiceData))

        // 5. Vytvořit fakturu v iDoklad
        const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData)
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('iDoklad create invoice error:', errorText)
          return new Response(
            JSON.stringify({ error: 'Chyba při vytváření faktury v iDoklad', details: errorText }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const invoiceResult = await createResponse.json()
        const invoice = invoiceResult.Data || invoiceResult
        console.log('Invoice created:', JSON.stringify(invoice).substring(0, 500))

        // 6. Uložit referenci do naší DB a získat ID
        const { data: dbInvoice, error: dbError } = await supabaseAdmin
          .from('invoices')
          .insert({
            clerk_id: clerkId,
            subscription_id: subscriptionId,
            idoklad_id: invoice.Id?.toString(),
            idoklad_exported: true,
            idoklad_exported_at: new Date().toISOString(),
            invoice_number: invoice.DocumentNumber || invoice.DocumentSerialNumber?.toString(),
            customer_email: customerEmail,
            customer_name: customerName,
            customer_country: country,
            currency: currency,
            subtotal: unitPriceWithoutVat,
            vat_rate: vatRate.rate,
            vat_amount: vatAmount,
            total_amount: amount,
            status: 'paid',
            paid_at: new Date().toISOString(),
            issue_date: today,
            due_date: dueDate,
            locale: locale,
          })
          .select('id')
          .single()

        if (dbError) {
          console.error('DB insert error:', dbError)
          // Pokračujeme - faktura je vytvořena v iDoklad
        }

        const dbInvoiceId = dbInvoice?.id

        // 7. Vrátit data faktury pro email
        return new Response(
          JSON.stringify({
            success: true,
            invoice: {
              id: invoice.Id,
              dbId: dbInvoiceId, // ID z naší databáze pro link na fakturu
              number: invoice.DocumentNumber || invoice.DocumentSerialNumber?.toString(),
              dateOfIssue: invoice.DateOfIssue,
              dateOfMaturity: invoice.DateOfMaturity,
              dateOfPayment: invoice.DateOfPayment,
              totalWithVat: invoice.TotalWithVat || amount,
              totalWithoutVat: invoice.TotalWithoutVat,
              currency: currency,
              items: invoice.Items?.map((item: any) => ({
                name: item.Name,
                amount: item.Amount,
                unitPrice: item.UnitPrice,
                totalWithVat: item.TotalWithVat,
              })),
              supplier: {
                name: 'WOOs, s. r. o.',
                street: 'Brloh 12',
                city: 'Drhovle',
                zip: '397 01',
                country: 'CZ',
                ico: '05117810',
                dic: 'CZ05117810',
              },
              customer: {
                name: customerName || customerEmail,
                email: customerEmail,
              }
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // Získat detail faktury z iDoklad
      // ============================================
      case 'getInvoice': {
        const { idokladId } = data

        if (!idokladId) {
          return new Response(
            JSON.stringify({ error: 'Chybí idokladId' }),
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

        const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices/${idokladId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: 'Faktura nenalezena v iDoklad' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const result = await response.json()
        return new Response(
          JSON.stringify({ success: true, invoice: result.Data || result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // Stáhnout PDF faktury z iDoklad
      // ============================================
      case 'getPdf': {
        const { idokladId } = data

        if (!idokladId) {
          return new Response(
            JSON.stringify({ error: 'Chybí idokladId' }),
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

        const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices/${idokladId}/GetPdf`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se stáhnout PDF' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const result = await response.json()
        return new Response(
          JSON.stringify({ success: true, pdfBase64: result.Data || result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Neznámá akce' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error: any) {
    console.error('iDoklad error:', error.message, error.stack)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// POMOCNÉ FUNKCE
// ============================================

async function getAccessToken(): Promise<string | null> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch(IDOKLAD_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: IDOKLAD_CONFIG.clientId,
        client_secret: IDOKLAD_CONFIG.clientSecret,
        scope: 'idoklad_api',
      })
    })

    if (!response.ok) {
      console.error('iDoklad token error:', await response.text())
      return null
    }

    const tokenData = await response.json()
    accessToken = tokenData.access_token
    tokenExpiry = Date.now() + (tokenData.expires_in - 60) * 1000
    return accessToken
  } catch (error) {
    console.error('Token fetch error:', error)
    return null
  }
}

async function getOrCreateContact(token: string, contact: { name: string, email: string, country: string }): Promise<number> {
  // Zkusit najít existující kontakt podle emailu
  try {
    const searchResponse = await fetch(
      `${IDOKLAD_CONFIG.apiUrl}/Contacts?filter=Email~eq~'${encodeURIComponent(contact.email)}'`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (searchResponse.ok) {
      const result = await searchResponse.json()
      const contacts = result.Data || result.Items || []
      if (contacts.length > 0) {
        console.log('Found existing contact:', contacts[0].Id)
        return contacts[0].Id
      }
    }
  } catch (e) {
    console.error('Contact search error:', e)
  }

  // Vytvořit nový kontakt
  try {
    const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/Contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CompanyName: contact.name,
        Email: contact.email,
        CountryId: getCountryId(contact.country),
        // Nechat City prázdné - iDoklad zobrazí pouze zemi
      })
    })

    if (createResponse.ok) {
      const result = await createResponse.json()
      const newContact = result.Data || result
      console.log('Created new contact:', newContact.Id)
      return newContact.Id
    } else {
      console.error('Contact create error:', await createResponse.text())
    }
  } catch (e) {
    console.error('Contact create error:', e)
  }

  return 0 // Fallback - bez partnera
}

async function getDefaultInvoiceSettings(token: string): Promise<any> {
  try {
    const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/IssuedInvoices/Default`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      const result = await response.json()
      return result.Data || result
    }
  } catch (e) {
    console.error('Default settings error:', e)
  }
  return {}
}

// Získat nebo vytvořit PaymentOptionId pro platbu kartou
async function getCardPaymentOptionId(token: string): Promise<number> {
  try {
    const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/PaymentOptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      const result = await response.json()
      const options = result.Data || result.Items || []
      console.log('Available payment options:', JSON.stringify(options))
      
      // Hledat platbu kartou (různé varianty názvu)
      const cardOption = options.find((opt: any) => 
        opt.Name?.toLowerCase().includes('kart') || 
        opt.Name?.toLowerCase().includes('card') ||
        opt.Name?.toLowerCase().includes('platební karta') ||
        opt.Name?.toLowerCase().includes('online')
      )
      
      if (cardOption) {
        console.log('Found card payment option:', cardOption.Id, cardOption.Name)
        return cardOption.Id
      }
      
      // Platba kartou neexistuje - vytvořit ji
      console.log('Card payment option not found, creating new one...')
      const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/PaymentOptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: 'Platební kartou',
          IsDefault: false,
        })
      })
      
      if (createResponse.ok) {
        const newOption = await createResponse.json()
        const optionData = newOption.Data || newOption
        console.log('Created card payment option:', optionData.Id, optionData.Name)
        return optionData.Id
      } else {
        console.error('Failed to create payment option:', await createResponse.text())
      }
    }
  } catch (e) {
    console.error('Payment options error:', e)
  }
  
  // Fallback - vrátit ID pro "Hotově" (1) aby faktura prošla, ale zalogovat varování
  console.warn('Using fallback payment option ID 1 (Hotově)')
  return 1
}

function getCountryId(countryCode: string): number {
  const countryMap: Record<string, number> = {
    'CZ': 1, 'SK': 2, 'DE': 4, 'AT': 5, 'PL': 6, 'HU': 7,
    'FR': 8, 'IT': 9, 'ES': 10, 'NL': 11, 'BE': 12, 'GB': 13, 'US': 14,
  }
  return countryMap[countryCode] || 1
}

function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'CZ': 'Česká republika',
    'SK': 'Slovensko',
    'DE': 'Německo',
    'AT': 'Rakousko',
    'PL': 'Polsko',
    'HU': 'Maďarsko',
    'FR': 'Francie',
    'IT': 'Itálie',
    'ES': 'Španělsko',
    'NL': 'Nizozemsko',
    'BE': 'Belgie',
    'GB': 'Velká Británie',
    'US': 'USA',
  }
  return countryNames[countryCode] || countryCode
}

function getVatRateForCountry(countryCode: string): { rate: number, type: number } {
  // REŽIM OSS do 10 000 EUR: české DPH 21% pro všechny EU země
  // type: 0 = základní (21%), 1 = snížená, 2 = druhá snížená, 3 = nulová/osvobozeno
  
  // Země mimo EU - bez DPH
  const nonEuCountries = ['GB', 'US', 'CH', 'NO', 'UA', 'RU', 'JP', 'KR', 'CN', 'AU', 'CA']
  
  if (nonEuCountries.includes(countryCode)) {
    return { rate: 0, type: 3 } // Osvobozeno od DPH - export mimo EU
  }
  
  // Všechny EU země - české DPH 21% (režim OSS do 10 000 EUR)
  return { rate: 21, type: 0 }
}
