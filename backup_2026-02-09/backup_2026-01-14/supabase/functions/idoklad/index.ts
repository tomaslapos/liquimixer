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

// ============================================
// Získat směnný kurz z ČNB API
// https://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.txt
// ============================================
async function getCnbExchangeRate(currency: string): Promise<number> {
  if (currency === 'CZK') return 1
  
  try {
    const response = await fetch(
      'https://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.txt'
    )
    const text = await response.text()
    
    // Formát CNB: země|měna|množství|kód|kurz
    const lines = text.split('\n')
    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length >= 5 && parts[3] === currency) {
        const amount = parseInt(parts[2])
        const rate = parseFloat(parts[4].replace(',', '.'))
        return rate / amount
      }
    }
  } catch (e) {
    console.error('CNB rate fetch error:', e)
  }
  
  // Fallback kurzy
  const fallback: Record<string, number> = { 'EUR': 25.0, 'USD': 24.0, 'GBP': 30.0, 'PLN': 5.8 }
  return fallback[currency] || 1
}

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


        // 1. Určit DPH sazbu podle země (OSS režim - české DPH 21% pro EU, 0% mimo EU)
        const vatRate = getVatRateForCountry(country || 'CZ')

        // 2. Získat access token
        const token = await getAccessToken()
        if (!token) {
          console.error('Failed to get iDoklad access token')
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat přístup k iDoklad API' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Určit skutečnou zemi zákazníka
        const actualCountry = country || 'CZ'
        
        // 2.5 Načíst VatCodeId z databáze (pokud existuje)
        let dbVatInfo: { idoklad_vat_code_id?: number; idoklad_vat_rate_id?: number; vat_rate?: number; country_name?: string } | null = null
        try {
          const { data: vatData } = await supabaseAdmin
            .from('vat_rates')
            .select('idoklad_vat_code_id, idoklad_vat_rate_id, vat_rate, country_name')
            .eq('country_code', actualCountry)
            .single()
          dbVatInfo = vatData
        } catch (e) {
          // No vat_rates entry, using dynamic lookup
        }

        // Získat VatCodeDivisions pro určení správného členění DPH
        const vatCodeDivisions = await getVatCodeDivisions(token)

        // 3. Získat nebo vytvořit kontakt
        // Pro EU země: kontakt MUSÍ mít CZ (OSS režim - české DPH 21%)
        // Pro mimo EU: kontakt má skutečnou zemi (DPH 0%)
        const isEuCountry = vatRate.rate === 21
        const contactCountry = isEuCountry ? 'CZ' : actualCountry
        
        const partnerId = await getOrCreateContact(token, {
          name: customerName || customerEmail,
          email: customerEmail,
          country: contactCountry
        })

        // 4. Získat výchozí nastavení faktury (včetně NumericSequenceId)
        const defaultSettings = await getDefaultInvoiceSettings(token)

        // 5. Získat správné PaymentOptionId pro platbu kartou
        const paymentOptionId = await getCardPaymentOptionId(token)

        // 6. Připravit data pro fakturu
        const today = new Date().toISOString().split('T')[0]
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        // DŮLEŽITÉ: Překlady pro iDoklad VŽDY v češtině (požadavek účetnictví)
        // Jazyk zákazníka se použije pro email faktury, ne pro iDoklad
        const t = getEmailTranslations('cs') // Vždy čeština pro iDoklad
        const itemName = t.idoklad_item_name
        const invoiceDescription = t.idoklad_description
        
        // Základní poznámka
        let invoiceNote = orderNumber 
          ? formatEmailText(t.idoklad_note_with_order, { orderNumber })
          : t.idoklad_note
        
        // Vždy přidat skutečnou zemi zákazníka do poznámky (pro analýzu a evidenci)
        const countryName = getCountryName(actualCountry)
        invoiceNote += `\n\nZemě zákazníka: ${countryName} (${actualCountry})`
        
        const unit = t.idoklad_unit

        // amount je konečná cena S DPH (59 Kč, 2.40 EUR, 2.90 USD)
        // Pro iDoklad: PriceType=1 (WithoutVat) znamená, že UnitPrice je cena BEZ DPH
        // PriceType hodnoty: 0=WithVat(s DPH), 1=WithoutVat(bez DPH), 2=OnlyBase(pouze základ)
        // iDoklad pak správně dopočítá DPH a celkovou cenu S DPH
        // Cena bez DPH = amount / (1 + vatRate/100)
        const unitPriceWithoutVat = vatRate.rate > 0 
          ? Math.round((amount / (1 + vatRate.rate / 100)) * 100) / 100
          : amount
        const vatAmount = Math.round((amount - unitPriceWithoutVat) * 100) / 100

        // Získat správné VatCodeId pro členění DPH podle země
        // Priorita: 1) z databáze (vat_rates.idoklad_vat_code_id), 2) dynamicky z API
        // Pro tuzemské plnění (CZ): kód "01" nebo "02" (ř. 1 a 2 přiznání DPH)
        // Pro EU OSS pod limit: kód "25" (ř. 25 přiznání DPH)
        // Pro mimo EU: kód pro export/osvobození
        const vatCodeId = dbVatInfo?.idoklad_vat_code_id || getVatCodeIdForCountry(country || 'CZ', vatCodeDivisions)
        const vatRateId = dbVatInfo?.idoklad_vat_rate_id || (vatRate.rate === 21 ? 747 : 3)

        // Získat směnný kurz z ČNB pro cizí měny
        const exchangeRate = currency !== 'CZK' ? await getCnbExchangeRate(currency) : 1

        const invoiceData: any = {
          Description: invoiceDescription,
          DateOfIssue: today,
          DateOfTaxing: today,
          DateOfMaturity: dueDate,
          DateOfPayment: today, // Zaplaceno ihned
          CurrencyId: getCurrencyId(currency),
          // Směnný kurz pro cizí měny (z ČNB)
          ...(currency !== 'CZK' && {
            ExchangeRate: exchangeRate,
            ExchangeRateAmount: 1, // Kurz za 1 jednotku měny
          }),
          PartnerId: partnerId,
          IsEet: false,
          IsIncomeTax: false,
          PaymentOptionId: paymentOptionId, // Dynamicky získané ID pro platbu kartou
          IsPaid: true, // Již zaplaceno
          Items: [{
            Name: itemName,
            Amount: 1,
            Unit: unit,
            UnitPrice: unitPriceWithoutVat, // Cena BEZ DPH (48.76 CZK)
            VatRateType: vatRate.type, // 1 = Basic (21%), 2 = Zero (0%) - dynamicky podle země
            VatRateId: vatRateId, // ID sazby DPH z DB nebo fallback
            VatCodeId: vatCodeId, // ID členění DPH z DB nebo fallback
            PriceType: 1, // 1 = WithoutVat - cena BEZ DPH (konzistentní s UnitPrice)
            DiscountPercentage: 0,
            IsTaxMovement: false,
          }],
          Note: invoiceNote,
          OrderNumber: orderNumber || '',
        }

        // Přidat NumericSequenceId a DocumentSerialNumber z default nastavení
        if (defaultSettings.NumericSequenceId) {
          invoiceData.NumericSequenceId = defaultSettings.NumericSequenceId
        }
        if (defaultSettings.DocumentSerialNumber) {
          invoiceData.DocumentSerialNumber = defaultSettings.DocumentSerialNumber
        }

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
            amount: amount, // Celková částka s DPH
            total: amount, // Alias pro amount - NOT NULL sloupec
            status: 'paid',
            paid_at: new Date().toISOString(),
            issue_date: today,
            due_date: dueDate,
            taxable_supply_date: today, // DUZP - datum zdanitelného plnění
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
              totalWithoutVat: invoice.TotalWithoutVat || unitPriceWithoutVat,
              vatRate: vatRate.rate, // DŮLEŽITÉ: Přidat vatRate pro email a online fakturu
              vatAmount: vatAmount,
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
  const targetCountryId = getCountryId(contact.country)
  
  // Zkusit najít existující kontakt podle emailu A správné země
  try {
    const searchResponse = await fetch(
      `${IDOKLAD_CONFIG.apiUrl}/Contacts?filter=Email~eq~'${encodeURIComponent(contact.email)}'`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (searchResponse.ok) {
      const result = await searchResponse.json()
      let contacts: any[] = []
      if (Array.isArray(result.Data)) {
        contacts = result.Data
      } else if (result.Data?.Items && Array.isArray(result.Data.Items)) {
        contacts = result.Data.Items
      } else if (Array.isArray(result.Items)) {
        contacts = result.Items
      } else if (Array.isArray(result)) {
        contacts = result
      }
      
      // Najít kontakt se správnou zemí
      const matchingContact = contacts.find((c: any) => c.CountryId === targetCountryId)
      if (matchingContact) {
        return matchingContact.Id
      }
    }
  } catch (e) {
    console.error('Contact search error:', e)
  }

  // Vytvořit nový kontakt se správnou zemí
  const timestamp = new Date().toISOString().slice(0, 10)
  const uniqueName = `${contact.name} (${new Date().getTime()})`
  
  try {
    const contactData = {
      CompanyName: uniqueName,
      Email: contact.email,
      CountryId: targetCountryId,
      Country: {
        Id: targetCountryId,
        Code: contact.country,
      },
      Note: `Vytvořeno: ${timestamp}, Země pro DPH: ${contact.country}`,
    }
    
    const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/Contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    })

    if (createResponse.ok) {
      const result = await createResponse.json()
      const newContact = result.Data || result
      return newContact.Id
    }
  } catch (e) {
    console.error('Contact create error:', e)
  }

  return 0 // Fallback
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

// Získat PaymentOptionId pro platbu kartou
async function getCardPaymentOptionId(token: string): Promise<number> {
  try {
    const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/PaymentOptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      const result = await response.json()
      let options: any[] = []
      if (Array.isArray(result)) {
        options = result
      } else if (Array.isArray(result.Data)) {
        options = result.Data
      } else if (result.Data?.Items && Array.isArray(result.Data.Items)) {
        options = result.Data.Items
      } else if (Array.isArray(result.Items)) {
        options = result.Items
      }
      
      // Hledat platbu kartou
      const cardKeywords = ['kart', 'card', 'online', 'platba kartou']
      const cardOption = options.find((opt: any) => {
        const name = opt.Name?.toLowerCase() || ''
        return cardKeywords.some(kw => name.includes(kw))
      })
      
      if (cardOption) {
        return cardOption.Id
      }
      
      if (options.length > 0) {
        return options[0].Id
      }
    }
  } catch (e) {
    console.error('Payment options error:', e)
  }
  
  return 1 // Fallback
}

// Získat kódy členění DPH z iDoklad API (potřebné pro VatCodeId)
async function getVatCodeDivisions(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${IDOKLAD_CONFIG.apiUrl}/VatCodes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const result = await response.json()
      let vatCodes: any[] = []
      if (Array.isArray(result)) {
        vatCodes = result
      } else if (Array.isArray(result.Data)) {
        vatCodes = result.Data
      } else if (result.Data?.Items && Array.isArray(result.Data.Items)) {
        vatCodes = result.Data.Items
      }
      return vatCodes
    }
  } catch (e) {
    console.error('VatCodes fetch error:', e)
  }
  return []
}

// Získat CurrencyId pro měnu
// iDoklad CurrencyId hodnoty (z API /Currencies - ověřeno 14.1.2026):
// 1 = CZK (Česká koruna)
// 2 = EUR (Euro)
// 11 = USD (American dollar) - OPRAVENO!
function getCurrencyId(currency: string): number {
  const currencyMap: Record<string, number> = {
    'CZK': 1,
    'EUR': 2,
    'USD': 11,
  }
  return currencyMap[currency] || 1
}

function getCountryId(countryCode: string): number {
  // iDoklad CountryId mapování (SK=1, CZ=2)
  const countryMap: Record<string, number> = {
    'SK': 1, 'CZ': 2, 'AF': 3, 'AL': 4,
    'DE': 5, 'AT': 6, 'PL': 7, 'HU': 8,
    'FR': 9, 'IT': 10, 'ES': 11, 'NL': 12, 'BE': 13,
    'GB': 14, 'US': 15,
  }
  return countryMap[countryCode] || 2 // Fallback na CZ
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

// Získat VatCodeId (členění DPH) pro danou zemi
function getVatCodeIdForCountry(countryCode: string, vatCodeDivisions: any[]): number | null {
  // EU členské státy
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]
  
  // Pro CZ (tuzemsko) - kód 01 nebo 02
  if (countryCode === 'CZ') {
    const tuzemskoCodes = vatCodeDivisions.filter((vc: any) => {
      const code = vc.Code?.toString() || ''
      const name = vc.Name?.toLowerCase() || ''
      return code === '01' || code === '02' || code === '1' || code === '2' ||
             name.includes('tuzemsk') || name.includes('01-02') || name.includes('01 02')
    })
    if (tuzemskoCodes.length > 0) return tuzemskoCodes[0].Id
  }
  
  // Pro EU země (mimo CZ) v OSS režimu - kód 25
  if (euCountries.includes(countryCode) && countryCode !== 'CZ') {
    const ossCode = vatCodeDivisions.find((vc: any) => vc.Code?.toString() === '25')
    if (ossCode) return ossCode.Id
    
    // Fallback na tuzemsko kód
    const fallbackCode = vatCodeDivisions.find((vc: any) => {
      const code = vc.Code?.toString() || ''
      return code === '01' || code === '02' || code === '1' || code === '2'
    })
    if (fallbackCode) return fallbackCode.Id
  }
  
  // Pro země mimo EU - kód 20 nebo 21 (export)
  if (!euCountries.includes(countryCode)) {
    const exportCode = vatCodeDivisions.find((vc: any) => {
      const code = vc.Code?.toString() || ''
      const name = vc.Name?.toLowerCase() || ''
      return code === '20' || code === '21' || name.includes('export') || name.includes('osvobozen')
    })
    if (exportCode) return exportCode.Id
  }
  
  // Fallback
  return vatCodeDivisions.length > 0 ? vatCodeDivisions[0].Id : null
}

function getVatRateForCountry(countryCode: string): { rate: number, type: number } {
  // VatRateType: 1=Basic(21%), 2=Zero(0%)
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]
  
  // EU země: české DPH 21%, mimo EU: 0%
  if (euCountries.includes(countryCode)) {
    return { rate: 21, type: 1 }
  }
  return { rate: 0, type: 2 }
}
