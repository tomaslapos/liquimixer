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
  console.log('=== iDoklad function called ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
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

        // 1. Určit DPH sazbu podle země (OSS režim - české DPH 21% pro EU, 0% mimo EU)
        // MUSÍ být PŘED vytvořením kontaktu, protože určuje zemi kontaktu
        const vatRate = getVatRateForCountry(country || 'CZ')
        console.log(`=== VAT CALCULATION ===`)
        console.log(`Country: ${country || 'CZ'}`)
        console.log(`VatRate: rate=${vatRate.rate}%, type=${vatRate.type}`)
        console.log(`Type 0=Basic(21%), Type 3=Zero(0%)`)

        // 2. Získat access token
        const token = await getAccessToken()
        if (!token) {
          console.error('Failed to get iDoklad access token')
          return new Response(
            JSON.stringify({ error: 'Nepodařilo se získat přístup k iDoklad API' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 3. Získat nebo vytvořit kontakt
        // Pro EU země: kontakt MUSÍ mít CZ (OSS režim - české DPH 21%)
        // Pro mimo EU: kontakt má skutečnou zemi (DPH 0% - na zemi nezáleží)
        const isEuCountry = vatRate.rate === 21 // EU země mají 21% DPH
        const actualCountry = country || 'CZ'
        const contactCountry = isEuCountry ? 'CZ' : actualCountry
        console.log(`Creating contact: EU=${isEuCountry}, contactCountry=${contactCountry}, actualCountry=${actualCountry}`)
        
        const partnerId = await getOrCreateContact(token, {
          name: customerName || customerEmail,
          email: customerEmail,
          country: contactCountry // CZ pro EU (OSS režim), skutečná země pro mimo EU
        })
        console.log('Partner ID:', partnerId)

        // 4. Získat výchozí nastavení faktury (včetně NumericSequenceId)
        const defaultSettings = await getDefaultInvoiceSettings(token)
        console.log('Default settings:', JSON.stringify(defaultSettings))

        // 5. Získat správné PaymentOptionId pro platbu kartou
        const paymentOptionId = await getCardPaymentOptionId(token)
        console.log('Using PaymentOptionId:', paymentOptionId)

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
        // Pro iDoklad: PriceType=0 znamená, že UnitPrice je cena BEZ DPH
        // iDoklad pak správně dopočítá DPH a celkovou cenu S DPH
        // Cena bez DPH = amount / (1 + vatRate/100)
        const unitPriceWithoutVat = vatRate.rate > 0 
          ? Math.round((amount / (1 + vatRate.rate / 100)) * 100) / 100
          : amount
        const vatAmount = Math.round((amount - unitPriceWithoutVat) * 100) / 100
        
        console.log(`Price calculation: totalWithVat=${amount} ${currency}, vatRate=${vatRate.rate}%, baseWithoutVat=${unitPriceWithoutVat}, vat=${vatAmount}`)

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
            UnitPrice: unitPriceWithoutVat, // Cena BEZ DPH - iDoklad dopočítá DPH
            VatRateType: vatRate.type, // 0 = Basic (21%), 3 = Zero (0%) - bez VatRate, iDoklad určí sazbu z typu
            PriceType: 0, // 0 = cena BEZ DPH (iDoklad přidá DPH)
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
  const targetCountryId = getCountryId(contact.country)
  console.log(`=== GET OR CREATE CONTACT ===`)
  console.log(`Email: ${contact.email}, TargetCountry: ${contact.country} (CountryId=${targetCountryId})`)
  
  // DŮLEŽITÉ: Pro OSS režim VŽDY potřebujeme kontakt s CZ (CountryId=1)
  // Aktualizace existujícího kontaktu v iDoklad API nefunguje spolehlivě
  // Proto: pokud existující kontakt nemá správnou zemi, vytvoříme NOVÝ kontakt
  
  // Zkusit najít existující kontakt podle emailu A správné země
  try {
    const searchResponse = await fetch(
      `${IDOKLAD_CONFIG.apiUrl}/Contacts?filter=Email~eq~'${encodeURIComponent(contact.email)}'`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (searchResponse.ok) {
      const result = await searchResponse.json()
      const contacts = result.Data || result.Items || []
      
      // Najít kontakt se SPRÁVNOU zemí
      const matchingContact = contacts.find((c: any) => c.CountryId === targetCountryId)
      
      if (matchingContact) {
        console.log(`Found existing contact with correct country: Id=${matchingContact.Id}, CountryId=${matchingContact.CountryId}`)
        return matchingContact.Id
      }
      
      if (contacts.length > 0) {
        console.log(`Found ${contacts.length} contacts but none with CountryId=${targetCountryId}. Creating new contact with correct country.`)
        // Existující kontakty mají špatnou zemi - vytvoříme nový
      }
    }
  } catch (e) {
    console.error('Contact search error:', e)
  }

  // Vytvořit nový kontakt se správnou zemí
  const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  // DŮLEŽITÉ: Přidat timestamp k názvu aby se vyhnulo duplicitním emailům v iDoklad
  const uniqueName = `${contact.name} (${new Date().getTime()})`
  
  try {
    console.log(`Creating NEW contact: name=${uniqueName}, email=${contact.email}, CountryId=${targetCountryId}`)
    const contactData = {
      CompanyName: uniqueName,
      Email: contact.email,
      CountryId: targetCountryId,
      Note: `Vytvořeno: ${timestamp}, Země pro DPH: ${contact.country}`,
    }
    console.log('Contact data to POST:', JSON.stringify(contactData))
    
    const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/Contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    })

    const responseText = await createResponse.text()
    console.log('Contact create response status:', createResponse.status)
    console.log('Contact create response:', responseText.substring(0, 500))

    if (createResponse.ok) {
      const result = JSON.parse(responseText)
      const newContact = result.Data || result
      console.log(`SUCCESS: Created new contact Id=${newContact.Id}, CountryId=${newContact.CountryId}`)
      
      // VERIFIKACE: Ověřit že kontakt má správnou zemi
      if (newContact.CountryId !== targetCountryId) {
        console.error(`WARNING: Contact created with wrong CountryId! Expected ${targetCountryId}, got ${newContact.CountryId}`)
      }
      
      return newContact.Id
    } else {
      console.error('Contact create FAILED:', responseText)
    }
  } catch (e) {
    console.error('Contact create error:', e)
  }

  console.error('CRITICAL: Failed to create contact, returning 0')
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
      // iDoklad API může vracet různé formáty - ošetřit všechny varianty
      let options: any[] = []
      if (Array.isArray(result)) {
        options = result
      } else if (Array.isArray(result.Data)) {
        options = result.Data
      } else if (Array.isArray(result.Items)) {
        options = result.Items
      } else {
        console.warn('Unexpected PaymentOptions response format:', JSON.stringify(result).substring(0, 200))
      }
      
      if (options.length > 0) {
        console.log('Available payment options:', JSON.stringify(options.map((o: any) => ({ Id: o.Id, Name: o.Name }))))
      } else {
        console.log('No payment options found in response')
      }
      
      // Hledat platbu kartou (různé varianty názvu) - rozšířený seznam
      // DŮLEŽITÉ: Nejdřív logovat všechny dostupné možnosti pro debugging
      console.log('=== PAYMENT OPTIONS SEARCH ===')
      options.forEach((opt: any) => {
        console.log(`  - Id: ${opt.Id}, Name: "${opt.Name}", IsDefault: ${opt.IsDefault}`)
      })
      
      const cardKeywords = ['kart', 'card', 'online']
      const cardOption = options.find((opt: any) => {
        const name = opt.Name?.toLowerCase() || ''
        return cardKeywords.some(kw => name.includes(kw))
      })
      
      if (cardOption) {
        console.log('Found card payment option:', cardOption.Id, cardOption.Name)
        return cardOption.Id
      }
      
      // Platba kartou neexistuje - vytvořit ji
      console.log('Card payment option not found in options, creating "Platba kartou"...')
      const createResponse = await fetch(`${IDOKLAD_CONFIG.apiUrl}/PaymentOptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: 'Platba kartou',
          IsDefault: false,
        })
      })
      
      if (createResponse.ok) {
        const newOption = await createResponse.json()
        const optionData = newOption.Data || newOption
        console.log('Created card payment option:', optionData.Id, optionData.Name)
        return optionData.Id
      } else {
        const errorText = await createResponse.text()
        console.error('Failed to create payment option:', errorText)
        
        // Pokud vytvoření selhalo, zkusit najít existující nebo použít první dostupný
        if (options.length > 0) {
          // Preferovat "Hotovost" před "Převodným příkazem"
          const cashOption = options.find((opt: any) => 
            opt.Name?.toLowerCase().includes('hotov') || 
            opt.Name?.toLowerCase().includes('cash')
          )
          if (cashOption) {
            console.log('Using cash option as fallback:', cashOption.Id, cashOption.Name)
            return cashOption.Id
          }
          // Jinak použít první
          console.log('Using first available payment option:', options[0].Id, options[0].Name)
          return options[0].Id
        }
      }
    } else {
      console.error('Failed to fetch payment options:', await response.text())
    }
  } catch (e) {
    console.error('Payment options error:', e)
  }
  
  // Fallback - vrátit ID pro "Hotově" (typicky 1) aby faktura prošla
  console.warn('Using fallback payment option ID 1')
  return 1
}

function getCountryId(countryCode: string): number {
  // iDoklad CountryId - mapování ISO kódů na iDoklad ID
  // DŮLEŽITÉ: Pokud země není v seznamu, vrátí 1 (CZ) - to je správné pro místo plnění
  const countryMap: Record<string, number> = {
    // EU země
    'CZ': 1, 'SK': 2, 'DE': 4, 'AT': 5, 'PL': 6, 'HU': 7,
    'FR': 8, 'IT': 9, 'ES': 10, 'NL': 11, 'BE': 12,
    'PT': 15, 'GR': 16, 'SE': 17, 'DK': 18, 'FI': 19,
    'IE': 20, 'LU': 21, 'SI': 22, 'EE': 23, 'LV': 24,
    'LT': 25, 'MT': 26, 'CY': 27, 'BG': 28, 'RO': 29,
    'HR': 30,
    // Mimo EU
    'GB': 13, 'US': 14, 'CH': 31, 'NO': 32,
    'UA': 33, 'RU': 34, 'JP': 35, 'KR': 36, 'CN': 37,
    'AU': 38, 'CA': 39, 'TR': 40,
    // Blízký východ
    'SA': 41, 'AE': 42, 'IL': 43, 'QA': 44, 'KW': 45,
    // Další
    'TW': 46, 'SG': 47, 'HK': 48, 'NZ': 49,
  }
  // Fallback na CZ (1) - místo plnění je vždy CZ pokud není specifikováno jinak
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
  // iDoklad VatRateType hodnoty (dle API dokumentace):
  // 0 = Basic (základní sazba - 21%)
  // 1 = Reduced1 (snížená 1 - 12%)
  // 2 = Reduced2 (snížená 2 - 0%)
  // 3 = Zero (nulová/osvobozeno - 0%)
  
  // EU členské státy (platí české DPH 21%)
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]
  
  // Pokud je země v EU, použít české DPH 21%
  if (euCountries.includes(countryCode)) {
    return { rate: 21, type: 0 } // type: 0 = Basic (základní sazba 21%)
  }
  
  // Všechny ostatní země (mimo EU) - bez DPH, osvobozeno
  // Např: GB, US, CH, NO, UA, RU, JP, KR, CN, AU, CA, SA, AE, TR, etc.
  return { rate: 0, type: 3 } // type: 3 = Zero (osvobozeno od DPH - export mimo EU)
}
