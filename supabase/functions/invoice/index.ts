// ============================================
// EDGE FUNCTION: Invoice Generation & Email
// Generování PDF faktur a odesílání emailem
// WOOs, s. r. o. - Plátce DPH
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { 
  getCorsHeaders, 
  handleCorsPreflight, 
  checkRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse 
} from '../_shared/cors.ts'
import { getEmailTranslations } from '../_shared/email-translations.ts'

// Firemní údaje - správné hodnoty
const COMPANY = {
  name: 'WOOs, s. r. o.',
  street: 'Brloh 12',
  city: 'Drhovle',
  zip: '397 01',
  country: 'CZ',
  ico: '05117810',
  dic: 'CZ05117810',
}

// SMTP konfigurace
// Port 587 = STARTTLS, Port 465 = přímé TLS
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'smtp.websupport.cz',
  port: SMTP_PORT,
  username: Deno.env.get('SMTP_USER') || '',
  password: Deno.env.get('SMTP_PASSWORD') || '',
  tls: SMTP_PORT === 465, // true pro port 465 (přímé TLS), false pro 587 (STARTTLS)
}

const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'faktury@liquimixer.com'

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req)
  const rateCheck = checkRateLimit(identifier, 'default')
  
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetAt, origin)
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
      case 'getInvoice': {
        // Získat fakturu pro zobrazení na stránce
        const { invoiceId, clerkId: requestClerkId } = data

        if (!invoiceId) {
          return new Response(
            JSON.stringify({ error: 'Chybí ID faktury' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Načíst fakturu z DB - zkusit nejprve podle ID, pak podle iDoklad ID
        let invoice = null
        let invoiceError = null

        // Zkusit najít podle našeho ID
        const { data: invoiceById, error: errorById } = await supabaseAdmin
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (invoiceById) {
          invoice = invoiceById
        } else {
          // Fallback: zkusit najít podle iDoklad ID
          const { data: invoiceByIdoklad, error: errorByIdoklad } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('idoklad_id', invoiceId)
            .single()

          if (invoiceByIdoklad) {
            invoice = invoiceByIdoklad
          } else {
            invoiceError = errorById || errorByIdoklad
          }
        }

        if (invoiceError || !invoice) {
          return new Response(
            JSON.stringify({ error: 'Faktura nenalezena' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Ověřit, že faktura patří uživateli (pokud byl předán clerkId)
        if (requestClerkId && invoice.clerk_id !== requestClerkId) {
          return new Response(
            JSON.stringify({ error: 'Přístup odepřen' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Vrátit data faktury
        return new Response(
          JSON.stringify({
            success: true,
            invoice: {
              id: invoice.id,
              number: invoice.invoice_number,
              dateOfIssue: invoice.issue_date,
              dateOfMaturity: invoice.due_date,
              dateOfPayment: invoice.paid_at,
              totalWithVat: invoice.total_amount,
              totalWithoutVat: invoice.subtotal,
              vatAmount: invoice.vat_amount,
              vatRate: invoice.vat_rate,
              currency: invoice.currency,
              customerName: invoice.customer_name,
              customerEmail: invoice.customer_email,
              locale: invoice.locale,
              status: invoice.status,
              items: [{
                name: 'Roční předplatné LiquiMixer',
                amount: 1,
                unitPrice: invoice.total_amount,
                totalWithVat: invoice.total_amount
              }],
              supplier: COMPANY
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'generate': {
        // Generovat fakturu pro předplatné
        const { subscriptionId } = data

        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Chybí ID předplatného' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat předplatné
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .single()

        if (subError || !subscription) {
          return new Response(
            JSON.stringify({ error: 'Předplatné nenalezeno' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat uživatele
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('clerk_id', subscription.clerk_id)
          .single()

        // Generovat číslo faktury
        const { data: invoiceNumber } = await supabaseAdmin.rpc('generate_invoice_number')

        const now = new Date()
        const issueDate = now.toISOString().split('T')[0]

        // Vypočítat DPH (ceny jsou s DPH)
        const grossAmount = subscription.total_amount || subscription.gross_amount
        const vatRate = subscription.vat_rate || 21
        const netAmount = grossAmount / (1 + vatRate / 100)
        const vatAmount = grossAmount - netAmount

        // Vytvořit fakturu v DB
        const invoiceData = {
          clerk_id: subscription.clerk_id,
          subscription_id: subscriptionId,
          invoice_number: invoiceNumber || `3${now.getFullYear().toString().slice(-2)}${Date.now().toString().slice(-7)}`,
          document_type: 'invoice',
          issue_date: issueDate,
          taxable_supply_date: issueDate, // DUZP
          due_date: issueDate, // Ihned - již zaplaceno

          // Dodavatel
          supplier_name: COMPANY.name,
          supplier_street: COMPANY.street,
          supplier_city: COMPANY.city,
          supplier_zip: COMPANY.zip,
          supplier_country: COMPANY.country,
          supplier_ico: COMPANY.ico,
          supplier_dic: COMPANY.dic,
          supplier_bank_account: COMPANY.bankAccount,
          supplier_bank_name: COMPANY.bankName,

          // Odběratel
          customer_type: 'person',
          customer_name: user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user?.email || 'Zákazník',
          customer_email: user?.email,
          customer_country: subscription.user_country || 'CZ',

          // Položky
          items: JSON.stringify([{
            description: getItemDescription(subscription.currency, getLocaleFromCountry(subscription.user_country)),
            quantity: 1,
            unit: 'ks',
            unit_price_net: Math.round(netAmount * 100) / 100,
            vat_rate: vatRate,
            vat_amount: Math.round(vatAmount * 100) / 100,
            total_net: Math.round(netAmount * 100) / 100,
            total_gross: Math.round(grossAmount * 100) / 100
          }]),

          // Částky
          subtotal: Math.round(netAmount * 100) / 100,
          vat_rate: vatRate,
          vat_amount: Math.round(vatAmount * 100) / 100,
          total: Math.round(grossAmount * 100) / 100,
          currency: subscription.currency,

          // Stav
          status: 'paid',
          paid_at: now.toISOString(),
          payment_method: subscription.payment_method,
          payment_reference: subscription.payment_id,

          locale: getLocaleFromCountry(subscription.user_country)
        }

        const { data: invoice, error: invoiceError } = await supabaseAdmin
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single()

        if (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          return new Response(
            JSON.stringify({ error: 'Chyba při vytváření faktury' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Generovat PDF
        const pdfContent = generateInvoicePDF(invoice, subscription)

        // Uložit PDF do Storage
        const pdfFileName = `invoices/${invoice.clerk_id}/${invoice.invoice_number}.pdf`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(pdfFileName, pdfContent, {
            contentType: 'application/pdf',
            upsert: true
          })

        let pdfUrl = null
        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(pdfFileName)
          pdfUrl = urlData?.publicUrl
        }

        // Aktualizovat fakturu s PDF URL
        if (pdfUrl) {
          await supabaseAdmin
            .from('invoices')
            .update({ pdf_url: pdfUrl })
            .eq('id', invoice.id)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            invoice: {
              id: invoice.id,
              invoice_number: invoice.invoice_number,
              pdf_url: pdfUrl
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'sendEmail': {
        // Odeslat fakturu emailem - přijímá data z iDoklad
        const { invoice, customerEmail, customerName, locale } = data

        if (!invoice || !customerEmail) {
          return new Response(
            JSON.stringify({ error: 'Chybí data faktury nebo email zákazníka' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Sending invoice email to:', customerEmail)
        console.log('Invoice number:', invoice.number)

        // Připravit email s daty z iDoklad
        const emailLocale = locale || 'cs'
        const emailSubject = getEmailSubject(emailLocale, invoice.number)
        const emailBody = getEmailBodyFromIdoklad(emailLocale, invoice, customerName, customerEmail)

        try {
          const client = new SMTPClient({
            connection: {
              hostname: SMTP_CONFIG.hostname,
              port: SMTP_CONFIG.port,
              tls: SMTP_CONFIG.port === 465,
              auth: {
                username: SMTP_CONFIG.username,
                password: SMTP_CONFIG.password,
              },
            },
          })

          await client.send({
            from: EMAIL_FROM,
            to: customerEmail,
            subject: emailSubject,
            content: emailBody,
            html: emailBody,
          })

          await client.close()

          console.log('Email sent successfully to:', customerEmail)

          return new Response(
            JSON.stringify({ success: true, message: 'Email odeslán' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } catch (emailError: any) {
          console.error('Email error:', emailError.message)
          return new Response(
            JSON.stringify({ error: 'Chyba při odesílání emailu', details: emailError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'generateAndSend': {
        // Kombinovaná akce - generovat a odeslat
        const { subscriptionId, clerkId } = data
        
        console.log('generateAndSend: subscriptionId =', subscriptionId, 'clerkId =', clerkId)

        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Chybí ID předplatného' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 1. Získat předplatné
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .single()

        if (subError || !subscription) {
          console.error('Subscription not found:', subError)
          return new Response(
            JSON.stringify({ error: 'Předplatné nenalezeno', details: subError?.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Found subscription:', subscription.id, 'clerk_id:', subscription.clerk_id)

        // 2. Získat uživatele
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('clerk_id', subscription.clerk_id)
          .single()

        console.log('Found user:', user?.email)

        // 3. Generovat číslo faktury
        const { data: invoiceNumber } = await supabaseAdmin.rpc('generate_invoice_number')

        const now = new Date()
        const issueDate = now.toISOString().split('T')[0]

        // Vypočítat DPH (ceny jsou s DPH)
        const grossAmount = subscription.total_amount || subscription.gross_amount
        const vatRate = subscription.vat_rate || 21
        const netAmount = grossAmount / (1 + vatRate / 100)
        const vatAmount = grossAmount - netAmount

        // 4. Vytvořit fakturu v DB
        const invoiceData = {
          clerk_id: subscription.clerk_id,
          subscription_id: subscriptionId,
          invoice_number: invoiceNumber || `3${now.getFullYear().toString().slice(-2)}${Date.now().toString().slice(-7)}`,
          document_type: 'invoice',
          issue_date: issueDate,
          taxable_supply_date: issueDate,
          due_date: issueDate,
          supplier_name: COMPANY.name,
          supplier_street: COMPANY.street,
          supplier_city: COMPANY.city,
          supplier_zip: COMPANY.zip,
          supplier_country: COMPANY.country,
          supplier_ico: COMPANY.ico,
          supplier_dic: COMPANY.dic,
          supplier_bank_account: COMPANY.bankAccount,
          supplier_bank_name: COMPANY.bankName,
          customer_type: 'person',
          customer_name: user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user?.email || 'Zákazník',
          customer_email: user?.email,
          customer_country: subscription.user_country || 'CZ',
          items: JSON.stringify([{
            description: getItemDescription(subscription.currency),
            quantity: 1,
            unit: 'ks',
            unit_price_net: Math.round(netAmount * 100) / 100,
            vat_rate: vatRate,
            vat_amount: Math.round(vatAmount * 100) / 100,
            total_net: Math.round(netAmount * 100) / 100,
            total_gross: Math.round(grossAmount * 100) / 100
          }]),
          subtotal: Math.round(netAmount * 100) / 100,
          vat_rate: vatRate,
          vat_amount: Math.round(vatAmount * 100) / 100,
          total: Math.round(grossAmount * 100) / 100,
          currency: subscription.currency,
          status: 'paid',
          paid_at: now.toISOString(),
          payment_method: subscription.payment_method,
          payment_reference: subscription.payment_id,
          locale: getLocaleFromCountry(subscription.user_country)
        }

        const { data: invoice, error: invoiceError } = await supabaseAdmin
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single()

        if (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          return new Response(
            JSON.stringify({ error: 'Chyba při vytváření faktury', details: invoiceError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Invoice created:', invoice.id, invoice.invoice_number)

        // 5. Generovat PDF
        const pdfContent = generateInvoicePDF(invoice, subscription)

        // 6. Uložit PDF do Storage
        const pdfFileName = `invoices/${invoice.clerk_id}/${invoice.invoice_number}.pdf`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(pdfFileName, pdfContent, {
            contentType: 'application/pdf',
            upsert: true
          })

        let pdfUrl = null
        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(pdfFileName)
          pdfUrl = urlData?.publicUrl
        } else {
          console.warn('PDF upload error (non-critical):', uploadError.message)
        }

        // 7. Aktualizovat fakturu s PDF URL
        if (pdfUrl) {
          await supabaseAdmin
            .from('invoices')
            .update({ pdf_url: pdfUrl })
            .eq('id', invoice.id)
        }

        // 8. Odeslat email s fakturou
        if (!invoice.customer_email) {
          console.warn('No customer email, skipping email send')
          return new Response(
            JSON.stringify({ 
              success: true, 
              invoice: { id: invoice.id, invoice_number: invoice.invoice_number, pdf_url: pdfUrl },
              emailSent: false,
              emailError: 'No customer email'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const emailSubject = getEmailSubject(invoice.locale, invoice.invoice_number)
        const emailBody = getEmailBody(invoice.locale, invoice)

        console.log('Sending email to:', invoice.customer_email)
        console.log('SMTP config:', SMTP_CONFIG.hostname, SMTP_CONFIG.port, 'user:', SMTP_CONFIG.username, 'tls:', SMTP_CONFIG.tls)

        try {
          // Port 587 = STARTTLS (tls: false, ale STARTTLS se provede automaticky)
          // Port 465 = přímé TLS (tls: true)
          const client = new SMTPClient({
            connection: {
              hostname: SMTP_CONFIG.hostname,
              port: SMTP_CONFIG.port,
              tls: SMTP_CONFIG.port === 465, // Přímé TLS pouze pro port 465
              auth: {
                username: SMTP_CONFIG.username,
                password: SMTP_CONFIG.password,
              },
            },
          })

          // Email BEZ přílohy - faktura je přímo v těle emailu jako HTML tabulka
          await client.send({
            from: EMAIL_FROM,
            to: invoice.customer_email,
            subject: emailSubject,
            content: emailBody,
            html: emailBody,
          })

          await client.close()

          console.log('Email sent successfully')

          // Aktualizovat fakturu
          await supabaseAdmin
            .from('invoices')
            .update({ 
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('id', invoice.id)

          return new Response(
            JSON.stringify({ 
              success: true,
              invoice: { id: invoice.id, invoice_number: invoice.invoice_number, pdf_url: pdfUrl },
              emailSent: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } catch (emailError: any) {
          console.error('Email send error:', emailError.message, emailError.stack)
        return new Response(
          JSON.stringify({ 
            success: true,
              invoice: { id: invoice.id, invoice_number: invoice.invoice_number, pdf_url: pdfUrl },
              emailSent: false,
              emailError: emailError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Neznámá akce' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Invoice error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Pomocné funkce

// Mapování země na locale
function getLocaleFromCountry(country: string): string {
  const localeMap: Record<string, string> = {
    'CZ': 'cs',
    'SK': 'sk',
    'DE': 'de',
    'AT': 'de',
    'PL': 'pl',
    'HU': 'hu',
    'US': 'en',
    'GB': 'en',
    'FR': 'fr',
    'ES': 'es',
    'IT': 'it',
  }
  return localeMap[country] || 'en'
}

function getItemDescription(currency: string, locale: string = 'en'): string {
  const t = getEmailTranslations(locale)
  return t.idoklad_item_name
}

function getEmailSubject(locale: string, invoiceNumber: string): string {
  const t = getEmailTranslations(locale)
  return `${t.invoice_number} ${invoiceNumber} - LiquiMixer`
}

// Generovat HTML jedné iDoklad faktury v daném jazyce (pomocná funkce)
function generateSingleIdokladInvoiceHtml(locale: string, invoice: any, customerName: string, customerEmail: string): string {
  const trans = getEmailTranslations(locale)
  
  const t = {
    invoiceTitle: trans.invoice_email_invoice_title,
    invoiceNumber: trans.invoice_number,
    issueDate: trans.invoice_email_issue_date,
    dueDate: trans.invoice_email_due_date,
    supplier: trans.invoice_email_supplier,
    customer: trans.invoice_email_customer,
    ico: trans.invoice_email_ico,
    dic: trans.invoice_email_dic,
    item: trans.invoice_email_item,
    quantity: trans.invoice_email_quantity,
    total: trans.invoice_email_total,
    subtotal: trans.invoice_email_subtotal,
    vatAmount: trans.invoice_email_vat_amount,
    totalToPay: trans.invoice_email_total_to_pay,
    status: trans.invoice_email_status,
    paid: trans.invoice_email_paid,
    paymentDate: trans.invoice_email_payment_date,
    vatPayer: trans.invoice_email_vat_payer,
  }
  
  const dateLocale = locale === 'cs' ? 'cs-CZ' : locale === 'sk' ? 'sk-SK' : 'en-GB'
  const currency = invoice.currency || 'CZK'
  
  const supplier = {
    name: COMPANY.name,
    street: COMPANY.street,
    city: COMPANY.city,
    zip: COMPANY.zip,
    ico: COMPANY.ico,
    dic: COMPANY.dic,
  }

  const totalAmount = invoice.totalWithVat || invoice.total || 59
  const subtotal = invoice.totalWithoutVat || Math.round((totalAmount / 1.21) * 100) / 100
  const vatRate = 21
  const vatAmount = Math.round((totalAmount - subtotal) * 100) / 100
  
  const items = invoice.items || [{
    name: trans.idoklad_item_name,
    amount: 1,
    unitPrice: subtotal,
    totalWithVat: totalAmount
  }]

  // Použít přeložený název položky (trans.idoklad_item_name) místo item.name z iDoklad
  // protože iDoklad vrací český název a my potřebujeme přeložený
  const itemsHtml = items.map((item: any) => {
    const itemTotal = item.totalWithVat || item.unitPrice || totalAmount
    const itemName = trans.idoklad_item_name // Vždy použít přeložený název
    return `<tr><td style="padding:8px;border:1px solid #ddd;">${itemName}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.amount || 1}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${Number(itemTotal).toFixed(2)} ${currency}</td></tr>`
  }).join('')

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString(dateLocale)
    } catch {
      return dateStr
    }
  }

  return `
  <div style="border:2px solid #333;padding:20px;background:#fff;margin-bottom:30px;">
    <h1 style="text-align:center;margin:0 0 20px 0;color:#333;border-bottom:2px solid #333;padding-bottom:10px;">${t.invoiceTitle}</h1>
    <table style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="width:50%;vertical-align:top;">
          <strong>${t.invoiceNumber}:</strong> ${invoice.number}<br>
          <strong>${t.issueDate}:</strong> ${formatDate(invoice.dateOfIssue)}<br>
          <strong>${t.dueDate}:</strong> ${formatDate(invoice.dateOfMaturity)}
        </td>
        <td style="width:50%;vertical-align:top;text-align:right;">
          <span style="background:#4caf50;color:white;padding:5px 15px;border-radius:4px;font-weight:bold;">${t.paid}</span>
        </td>
      </tr>
    </table>
    <table style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:20px;">
          <div style="background:#f5f5f5;padding:15px;border-radius:4px;">
            <strong style="font-size:14px;">${t.supplier}</strong><br><br>
            <strong>${supplier.name}</strong><br>${supplier.street}<br>${supplier.zip} ${supplier.city}<br><br>
            ${t.ico}: ${supplier.ico}<br>${t.dic}: ${supplier.dic}
          </div>
        </td>
        <td style="width:50%;vertical-align:top;">
          <div style="background:#f5f5f5;padding:15px;border-radius:4px;">
            <strong style="font-size:14px;">${t.customer}</strong><br><br>
            <strong>${customerName}</strong><br>${customerEmail}
          </div>
        </td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#333;color:white;">
          <th style="padding:10px;text-align:left;">${t.item}</th>
          <th style="padding:10px;text-align:center;">${t.quantity}</th>
          <th style="padding:10px;text-align:right;">${t.total}</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <table style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="width:60%;"></td>
        <td style="width:40%;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:5px;border-bottom:1px solid #ddd;">${t.subtotal}:</td>
              <td style="padding:5px;border-bottom:1px solid #ddd;text-align:right;">${subtotal.toFixed(2)} ${currency}</td>
            </tr>
            <tr>
              <td style="padding:5px;border-bottom:1px solid #ddd;">${t.vatAmount} ${vatRate}%:</td>
              <td style="padding:5px;border-bottom:1px solid #ddd;text-align:right;">${vatAmount.toFixed(2)} ${currency}</td>
            </tr>
            <tr style="font-size:18px;font-weight:bold;background:#f5f5f5;">
              <td style="padding:10px;">${t.totalToPay}:</td>
              <td style="padding:10px;text-align:right;">${Number(totalAmount).toFixed(2)} ${currency}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div style="border-top:1px solid #ddd;padding-top:15px;">
      <p><strong>${t.status}:</strong> <span style="color:#4caf50;font-weight:bold;">${t.paid}</span></p>
      ${invoice.dateOfPayment ? `<p><strong>${t.paymentDate}:</strong> ${formatDate(invoice.dateOfPayment)}</p>` : ''}
    </div>
    <div style="text-align:center;margin-top:20px;padding-top:15px;border-top:1px solid #ddd;font-size:12px;color:#666;">
      ${supplier.name} | ${t.vatPayer} | ${t.dic}: ${supplier.dic}
    </div>
  </div>
  `
}

// Generovat email z dat z iDoklad - DVOJJAZYČNÁ VERZE
function getEmailBodyFromIdoklad(locale: string, invoice: any, customerName: string, customerEmail: string): string {
  const trans = getEmailTranslations(locale)
  
  const t = {
    title: trans.invoice_email_title,
    greeting: trans.invoice_greeting,
    intro: trans.invoice_email_intro,
    subscriptionActive: trans.invoice_email_subscription_active,
    printLink: trans.invoice_email_print_link,
    regards: trans.invoice_email_regards,
    team: trans.invoice_email_team,
    ico: trans.invoice_email_ico,
    dic: trans.invoice_email_dic,
  }

  // Link na online zobrazení faktury - prioritně použít dbId (naše DB), pak id jako fallback
  console.log('Invoice IDs - dbId:', invoice.dbId, 'id:', invoice.id)
  const invoiceDbId = invoice.dbId || invoice.id
  const invoiceLink = invoiceDbId ? `https://www.liquimixer.com/invoice.html?id=${invoiceDbId}` : ''
  console.log('Invoice link:', invoiceLink)

  // Generovat dvojjazyčnou fakturu: nahoře v jazyku uživatele, dole anglická verze
  const invoiceUserLocale = generateSingleIdokladInvoiceHtml(locale, invoice, customerName, customerEmail)
  const invoiceEnglish = locale !== 'en' ? generateSingleIdokladInvoiceHtml('en', invoice, customerName, customerEmail) : ''

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@media print{.no-print{display:none!important}body{font-size:12px}}</style></head><body style="font-family:Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px;color:#333;">

<div class="no-print" style="background:#e8f5e9;padding:15px;border-radius:8px;margin-bottom:20px;">
  <h2 style="margin:0 0 10px 0;color:#2e7d32;">&#10003; ${t.title}</h2>
  <p style="margin:0;">${t.greeting} ${t.intro}</p>
  <p style="margin:10px 0 0 0;"><strong>${t.subscriptionActive}</strong></p>
</div>

<!-- FAKTURA V JAZYKU UŽIVATELE -->
${invoiceUserLocale}

${invoiceEnglish ? `
<!-- ODDĚLOVAČ -->
<div style="text-align:center;margin:30px 0;padding:15px;background:#f0f0f0;border-radius:4px;">
  <strong style="color:#666;">English version / Anglická verze</strong>
</div>

<!-- FAKTURA V ANGLIČTINĚ -->
${invoiceEnglish}
` : ''}

${invoiceLink ? `<div class="no-print" style="margin-top:20px;padding:15px;background:#e3f2fd;border-radius:8px;text-align:center;"><a href="${invoiceLink}" style="color:#1976d2;text-decoration:none;font-weight:bold;">&#128196; ${t.printLink}</a></div>` : ''}

<div class="no-print" style="margin-top:20px;text-align:center;color:#666;">
  <p>${t.regards},<br><strong>${t.team}</strong></p>
  <p style="font-size:12px;">${COMPANY.name} | ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}<br>${t.ico}: ${COMPANY.ico} | ${t.dic}: ${COMPANY.dic}</p>
</div>

</body></html>`
}

// Generovat HTML jedné faktury v daném jazyce (pomocná funkce)
function generateSingleInvoiceHtml(locale: string, invoice: any, items: any[]): string {
  const trans = getEmailTranslations(locale)
  
  const t = {
    invoiceTitle: trans.invoice_email_invoice_title,
    invoiceNumber: trans.invoice_number,
    issueDate: trans.invoice_email_issue_date,
    duzp: trans.invoice_email_duzp,
    dueDate: trans.invoice_email_due_date,
    supplier: trans.invoice_email_supplier,
    customer: trans.invoice_email_customer,
    ico: trans.invoice_email_ico,
    dic: trans.invoice_email_dic,
    bankAccount: trans.invoice_email_bank_account,
    item: trans.invoice_email_item,
    quantity: trans.invoice_email_quantity,
    unitPrice: trans.invoice_email_unit_price,
    vat: trans.invoice_email_vat,
    total: trans.invoice_email_total,
    subtotal: trans.invoice_email_subtotal,
    vatAmount: trans.invoice_email_vat_amount,
    totalToPay: trans.invoice_email_total_to_pay,
    status: trans.invoice_email_status,
    paid: trans.invoice_email_paid,
    paymentMethod: trans.invoice_email_payment_method,
    paymentDate: trans.invoice_email_payment_date,
    vatPayer: trans.invoice_email_vat_payer,
    gateway: trans.invoice_email_gateway,
  }

  const dateLocale = locale === 'cs' ? 'cs-CZ' : locale === 'sk' ? 'sk-SK' : 'en-GB'

  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.unit_price_net || 0).toFixed(2)} ${invoice.currency}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.vat_rate || invoice.vat_rate || 21}%</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.total_gross || invoice.total || 0).toFixed(2)} ${invoice.currency}</td>
    </tr>
  `).join('')

  return `
  <div style="border: 2px solid #333; padding: 20px; background: #fff; margin-bottom: 30px;">
    
    <h1 style="text-align: center; margin: 0 0 20px 0; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
      ${t.invoiceTitle}
    </h1>

    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 50%; vertical-align: top;">
          <strong>${t.invoiceNumber}:</strong> ${invoice.invoice_number}<br>
          <strong>${t.issueDate}:</strong> ${new Date(invoice.issue_date).toLocaleDateString(dateLocale)}<br>
          <strong>${t.duzp}:</strong> ${new Date(invoice.taxable_supply_date || invoice.issue_date).toLocaleDateString(dateLocale)}<br>
          <strong>${t.dueDate}:</strong> ${new Date(invoice.due_date || invoice.issue_date).toLocaleDateString(dateLocale)}
        </td>
        <td style="width: 50%; vertical-align: top; text-align: right;">
          <span style="background: #4caf50; color: white; padding: 5px 15px; border-radius: 4px; font-weight: bold;">
            ${t.paid}
          </span>
        </td>
      </tr>
    </table>

    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
            <strong style="font-size: 14px;">${t.supplier}</strong><br><br>
            <strong>${COMPANY.name}</strong><br>
            ${COMPANY.street}<br>
            ${COMPANY.zip} ${COMPANY.city}<br><br>
            ${t.ico}: ${COMPANY.ico}<br>
            ${t.dic}: ${COMPANY.dic}
          </div>
        </td>
        <td style="width: 50%; vertical-align: top;">
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
            <strong style="font-size: 14px;">${t.customer}</strong><br><br>
            <strong>${invoice.customer_name}</strong><br>
            ${invoice.customer_email || ''}<br>
            ${invoice.customer_country || ''}
          </div>
        </td>
      </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #333; color: white;">
          <th style="padding: 10px; text-align: left;">${t.item}</th>
          <th style="padding: 10px; text-align: center;">${t.quantity}</th>
          <th style="padding: 10px; text-align: right;">${t.unitPrice}</th>
          <th style="padding: 10px; text-align: center;">${t.vat}</th>
          <th style="padding: 10px; text-align: right;">${t.total}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 60%;"></td>
        <td style="width: 40%;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #ddd;">${t.subtotal}:</td>
              <td style="padding: 5px; border-bottom: 1px solid #ddd; text-align: right;">${(invoice.subtotal || 0).toFixed(2)} ${invoice.currency}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #ddd;">${t.vatAmount} ${invoice.vat_rate || 21}%:</td>
              <td style="padding: 5px; border-bottom: 1px solid #ddd; text-align: right;">${(invoice.vat_amount || 0).toFixed(2)} ${invoice.currency}</td>
            </tr>
            <tr style="font-size: 18px; font-weight: bold;">
              <td style="padding: 10px 5px;">${t.totalToPay}:</td>
              <td style="padding: 10px 5px; text-align: right;">${(invoice.total || 0).toFixed(2)} ${invoice.currency}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="border-top: 1px solid #ddd; padding-top: 15px;">
      <p><strong>${t.status}:</strong> <span style="color: #4caf50; font-weight: bold;">${t.paid}</span></p>
      <p><strong>${t.paymentMethod}:</strong> ${t.gateway}</p>
      ${invoice.paid_at ? `<p><strong>${t.paymentDate}:</strong> ${new Date(invoice.paid_at).toLocaleDateString(dateLocale)}</p>` : ''}
    </div>

    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      ${COMPANY.name} | ${t.vatPayer} | ${t.dic}: ${COMPANY.dic}
    </div>

  </div>
  `
}

function getEmailBody(locale: string, invoice: any): string {
  // Získat překlady z centrální překladové struktury
  const trans = getEmailTranslations(locale)
  const transEn = getEmailTranslations('en')
  
  // Parsovat položky
  let items = []
  try {
    items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items || []
  } catch {
    items = [{
      description: trans.idoklad_item_name,
      quantity: 1,
      unit_price_net: invoice.subtotal,
      vat_rate: invoice.vat_rate,
      vat_amount: invoice.vat_amount,
      total_gross: invoice.total
    }]
  }

  // Mapování na lokální proměnné pro header/footer
  const t = {
    title: trans.invoice_email_title,
    greeting: trans.invoice_greeting,
    intro: trans.invoice_email_intro,
    subscriptionActive: trans.invoice_email_subscription_active,
    printLink: trans.invoice_email_print_link,
    regards: trans.invoice_email_regards,
    team: trans.invoice_email_team,
    ico: trans.invoice_email_ico,
    dic: trans.invoice_email_dic,
  }

  // Generovat dvojjazyčnou fakturu: nahoře v jazyku uživatele, dole anglická verze
  const invoiceUserLocale = generateSingleInvoiceHtml(locale, invoice, items)
  const invoiceEnglish = locale !== 'en' ? generateSingleInvoiceHtml('en', invoice, items) : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @media print {
      .no-print { display: none !important; }
      body { font-size: 12px; }
    }
  </style>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
  
  <div class="no-print" style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 10px 0; color: #2e7d32;">✓ ${t.title}</h2>
    <p style="margin: 0;">${t.greeting} ${t.intro}</p>
    <p style="margin: 10px 0 0 0;"><strong>${t.subscriptionActive}</strong></p>
  </div>

  <!-- FAKTURA V JAZYKU UŽIVATELE -->
  ${invoiceUserLocale}

  ${invoiceEnglish ? `
  <!-- ODDĚLOVAČ -->
  <div style="text-align: center; margin: 30px 0; padding: 15px; background: #f0f0f0; border-radius: 4px;">
    <strong style="color: #666;">English version / Anglická verze</strong>
  </div>

  <!-- FAKTURA V ANGLIČTINĚ -->
  ${invoiceEnglish}
  ` : ''}

  <div class="no-print" style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px;">
    <p style="margin: 0;">📄 <strong>${t.printLink}</strong></p>
  </div>

  <div class="no-print" style="margin-top: 20px; text-align: center; color: #666;">
    <p>${t.regards},<br><strong>${t.team}</strong></p>
    <p style="font-size: 12px;">
      ${COMPANY.name} | ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}<br>
      ${t.ico}: ${COMPANY.ico} | ${t.dic}: ${COMPANY.dic}
    </p>
  </div>

</body>
</html>
  `
}

// Generování PDF faktury (jednoduchý textový formát - pro produkci použít knihovnu jako pdfkit)
function generateInvoicePDF(invoice: any, subscription: any): Uint8Array {
  const locale = invoice.locale || 'cs'
  const t = getEmailTranslations(locale)

  // Parsovat položky
  let items = []
  try {
    items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
  } catch {
    items = [{
      description: t.idoklad_item_name,
      quantity: 1,
      unit_price_net: invoice.subtotal,
      vat_rate: invoice.vat_rate,
      vat_amount: invoice.vat_amount,
      total_gross: invoice.total
    }]
  }

  const dateLocale = locale === 'cs' ? 'cs-CZ' : locale === 'sk' ? 'sk-SK' : 'en-GB'

  // Pro jednoduchost generujeme textový obsah
  // V produkci by se použila knihovna pro PDF generování
  const content = `
${t.invoice_email_invoice_title}
==========================================
${t.invoice_number}: ${invoice.invoice_number}
${t.invoice_email_issue_date}: ${invoice.issue_date}
${t.invoice_email_duzp}: ${invoice.taxable_supply_date}
${t.invoice_email_due_date}: ${invoice.due_date}

${t.invoice_email_supplier}
------------------------------------------
${invoice.supplier_name}
${invoice.supplier_street}
${invoice.supplier_zip} ${invoice.supplier_city}
${t.invoice_email_ico}: ${invoice.supplier_ico}
${t.invoice_email_dic}: ${invoice.supplier_dic}
${t.invoice_email_bank_account}: ${invoice.supplier_bank_account}
${invoice.supplier_bank_name}

${t.invoice_email_customer}
------------------------------------------
${invoice.customer_name}
${invoice.customer_email}

${t.invoice_email_item}
------------------------------------------
${items.map((item: any) => `
${item.description}
  ${t.invoice_email_quantity}: ${item.quantity} ${item.unit || t.idoklad_unit}
  ${t.invoice_email_unit_price}: ${item.unit_price_net} ${invoice.currency}
  ${t.invoice_email_vat} ${item.vat_rate}%: ${item.vat_amount} ${invoice.currency}
  ${t.invoice_email_total}: ${item.total_gross} ${invoice.currency}
`).join('\n')}

${t.invoice_email_subtotal}
------------------------------------------
${t.invoice_email_subtotal}: ${invoice.subtotal} ${invoice.currency}
${t.invoice_email_vat_amount} ${invoice.vat_rate}%: ${invoice.vat_amount} ${invoice.currency}
${t.invoice_email_total_to_pay}: ${invoice.total} ${invoice.currency}

${t.invoice_email_status}: ${t.invoice_email_paid}
${t.invoice_email_payment_method}: ${invoice.payment_method || t.invoice_email_gateway}
${invoice.paid_at ? `${t.invoice_email_payment_date}: ${new Date(invoice.paid_at).toLocaleDateString(dateLocale)}` : ''}

==========================================
${COMPANY.name}
${t.invoice_email_vat_payer}
  `.trim()

  // Převést na Uint8Array (pro skutečné PDF by se použila jiná metoda)
  return new TextEncoder().encode(content)
}























