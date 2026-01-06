// ============================================
// EDGE FUNCTION: Invoice Generation & Email
// Generování PDF faktur a odesílání emailem
// WOOs, s. r. o. - Plátce DPH
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Firemní údaje z Secrets
const COMPANY = {
  name: Deno.env.get('COMPANY_NAME') || 'WOOs, s. r. o.',
  street: Deno.env.get('COMPANY_STREET') || 'Brloh 12',
  city: Deno.env.get('COMPANY_CITY') || 'Drhovle',
  zip: Deno.env.get('COMPANY_ZIP') || '397 01',
  country: 'CZ',
  ico: Deno.env.get('COMPANY_ICO') || '05117810',
  dic: Deno.env.get('COMPANY_DIC') || 'CZ05117810',
  bankAccount: Deno.env.get('COMPANY_BANK_ACCOUNT') || 'CZ9520100000002601012639',
  bankName: Deno.env.get('COMPANY_BANK_NAME') || 'Fio banka',
}

// SMTP konfigurace
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'smtp.active24.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
  username: Deno.env.get('SMTP_USER') || '',
  password: Deno.env.get('SMTP_PASSWORD') || '',
  tls: true,
}

const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'faktury@liquimixer.com'

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
            description: getItemDescription(subscription.currency),
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

          locale: subscription.user_country === 'CZ' ? 'cs' : 'en'
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
        // Odeslat fakturu emailem
        const { invoiceId } = data

        if (!invoiceId) {
          return new Response(
            JSON.stringify({ error: 'Chybí ID faktury' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Získat fakturu
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

        if (!invoice.customer_email) {
          return new Response(
            JSON.stringify({ error: 'Chybí email zákazníka' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Generovat PDF pro přílohu
        const pdfContent = generateInvoicePDF(invoice, null)

        // Připravit email
        const emailSubject = getEmailSubject(invoice.locale, invoice.invoice_number)
        const emailBody = getEmailBody(invoice.locale, invoice)

        try {
          const client = new SMTPClient({
            connection: {
              hostname: SMTP_CONFIG.hostname,
              port: SMTP_CONFIG.port,
              tls: SMTP_CONFIG.tls,
              auth: {
                username: SMTP_CONFIG.username,
                password: SMTP_CONFIG.password,
              },
            },
          })

          await client.send({
            from: EMAIL_FROM,
            to: invoice.customer_email,
            subject: emailSubject,
            content: emailBody,
            html: emailBody,
            attachments: [{
              filename: `faktura-${invoice.invoice_number}.pdf`,
              content: pdfContent,
              contentType: 'application/pdf',
            }],
          })

          await client.close()

          // Aktualizovat fakturu
          await supabaseAdmin
            .from('invoices')
            .update({ 
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('id', invoiceId)

          return new Response(
            JSON.stringify({ success: true, message: 'Email odeslán' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } catch (emailError) {
          console.error('Email error:', emailError)
          return new Response(
            JSON.stringify({ error: 'Chyba při odesílání emailu', details: String(emailError) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'generateAndSend': {
        // Kombinovaná akce - generovat a odeslat
        const { subscriptionId } = data

        // Nejprve generovat
        const generateResponse = await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate', data: { subscriptionId } })
        })

        const generateResult = await generateResponse.json()

        if (!generateResult.success) {
          return new Response(
            JSON.stringify(generateResult),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Pak odeslat email
        const sendResponse = await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sendEmail', data: { invoiceId: generateResult.invoice.id } })
        })

        const sendResult = await sendResponse.json()

        return new Response(
          JSON.stringify({ 
            success: true,
            invoice: generateResult.invoice,
            emailSent: sendResult.success
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
    console.error('Invoice error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Pomocné funkce

function getItemDescription(currency: string): string {
  if (currency === 'CZK') {
    return 'Roční předplatné LiquiMixer (365 dní)'
  }
  if (currency === 'EUR') {
    return 'LiquiMixer Annual Subscription (365 days)'
  }
  if (currency === 'USD') {
    return 'LiquiMixer Annual Subscription (365 days)'
  }
  return 'LiquiMixer Annual Subscription (365 days)'
}

function getEmailSubject(locale: string, invoiceNumber: string): string {
  if (locale === 'cs') {
    return `Faktura ${invoiceNumber} - LiquiMixer`
  }
  if (locale === 'sk') {
    return `Faktúra ${invoiceNumber} - LiquiMixer`
  }
  return `Invoice ${invoiceNumber} - LiquiMixer`
}

function getEmailBody(locale: string, invoice: any): string {
  const isCzech = locale === 'cs'
  const isSlovak = locale === 'sk'

  if (isCzech) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Děkujeme za Váš nákup!</h2>
        <p>Dobrý den,</p>
        <p>v příloze zasíláme daňový doklad č. <strong>${invoice.invoice_number}</strong> za předplatné služby LiquiMixer.</p>
        <p><strong>Částka:</strong> ${invoice.total} ${invoice.currency}</p>
        <p><strong>Datum úhrady:</strong> ${new Date(invoice.paid_at).toLocaleDateString('cs-CZ')}</p>
        <p>Vaše předplatné je nyní aktivní.</p>
        <br>
        <p>S pozdravem,<br>tým LiquiMixer</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          ${COMPANY.name}<br>
          ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}<br>
          IČ: ${COMPANY.ico}, DIČ: ${COMPANY.dic}
        </p>
      </body>
      </html>
    `
  }

  if (isSlovak) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Ďakujeme za Váš nákup!</h2>
        <p>Dobrý deň,</p>
        <p>v prílohe zasielame daňový doklad č. <strong>${invoice.invoice_number}</strong> za predplatné služby LiquiMixer.</p>
        <p><strong>Čiastka:</strong> ${invoice.total} ${invoice.currency}</p>
        <p><strong>Dátum úhrady:</strong> ${new Date(invoice.paid_at).toLocaleDateString('sk-SK')}</p>
        <p>Vaše predplatné je teraz aktívne.</p>
        <br>
        <p>S pozdravom,<br>tím LiquiMixer</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          ${COMPANY.name}<br>
          ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}<br>
          IČ: ${COMPANY.ico}, DIČ: ${COMPANY.dic}
        </p>
      </body>
      </html>
    `
  }

  // English
  return `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thank you for your purchase!</h2>
      <p>Hello,</p>
      <p>Please find attached invoice no. <strong>${invoice.invoice_number}</strong> for your LiquiMixer subscription.</p>
      <p><strong>Amount:</strong> ${invoice.total} ${invoice.currency}</p>
      <p><strong>Payment date:</strong> ${new Date(invoice.paid_at).toLocaleDateString('en-GB')}</p>
      <p>Your subscription is now active.</p>
      <br>
      <p>Best regards,<br>The LiquiMixer Team</p>
      <hr>
      <p style="font-size: 12px; color: #666;">
        ${COMPANY.name}<br>
        ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}, Czech Republic<br>
        Company ID: ${COMPANY.ico}, VAT ID: ${COMPANY.dic}
      </p>
    </body>
    </html>
  `
}

// Generování PDF faktury (jednoduchý textový formát - pro produkci použít knihovnu jako pdfkit)
function generateInvoicePDF(invoice: any, subscription: any): Uint8Array {
  const locale = invoice.locale || 'cs'
  const isCzech = locale === 'cs'

  // Parsovat položky
  let items = []
  try {
    items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
  } catch {
    items = [{
      description: getItemDescription(invoice.currency),
      quantity: 1,
      unit_price_net: invoice.subtotal,
      vat_rate: invoice.vat_rate,
      vat_amount: invoice.vat_amount,
      total_gross: invoice.total
    }]
  }

  // Pro jednoduchost generujeme textový obsah
  // V produkci by se použila knihovna pro PDF generování
  const content = `
${isCzech ? 'FAKTURA - DAŇOVÝ DOKLAD' : 'INVOICE - TAX DOCUMENT'}
==========================================
${isCzech ? 'Číslo faktury' : 'Invoice number'}: ${invoice.invoice_number}
${isCzech ? 'Datum vystavení' : 'Issue date'}: ${invoice.issue_date}
${isCzech ? 'Datum uskutečnění zdanitelného plnění' : 'Taxable supply date'}: ${invoice.taxable_supply_date}
${isCzech ? 'Datum splatnosti' : 'Due date'}: ${invoice.due_date}

${isCzech ? 'DODAVATEL' : 'SUPPLIER'}
------------------------------------------
${invoice.supplier_name}
${invoice.supplier_street}
${invoice.supplier_zip} ${invoice.supplier_city}
${isCzech ? 'IČ' : 'Company ID'}: ${invoice.supplier_ico}
${isCzech ? 'DIČ' : 'VAT ID'}: ${invoice.supplier_dic}
${isCzech ? 'Bankovní účet' : 'Bank account'}: ${invoice.supplier_bank_account}
${invoice.supplier_bank_name}

${isCzech ? 'ODBĚRATEL' : 'CUSTOMER'}
------------------------------------------
${invoice.customer_name}
${invoice.customer_email}

${isCzech ? 'POLOŽKY' : 'ITEMS'}
------------------------------------------
${items.map((item: any) => `
${item.description}
  ${isCzech ? 'Množství' : 'Quantity'}: ${item.quantity} ${item.unit || 'ks'}
  ${isCzech ? 'Cena bez DPH' : 'Price excl. VAT'}: ${item.unit_price_net} ${invoice.currency}
  ${isCzech ? 'DPH' : 'VAT'} ${item.vat_rate}%: ${item.vat_amount} ${invoice.currency}
  ${isCzech ? 'Celkem s DPH' : 'Total incl. VAT'}: ${item.total_gross} ${invoice.currency}
`).join('\n')}

${isCzech ? 'SOUHRN' : 'SUMMARY'}
------------------------------------------
${isCzech ? 'Základ daně' : 'Tax base'}: ${invoice.subtotal} ${invoice.currency}
${isCzech ? 'DPH' : 'VAT'} ${invoice.vat_rate}%: ${invoice.vat_amount} ${invoice.currency}
${isCzech ? 'CELKEM K ÚHRADĚ' : 'TOTAL'}: ${invoice.total} ${invoice.currency}

${isCzech ? 'Stav' : 'Status'}: ${isCzech ? 'UHRAZENO' : 'PAID'}
${isCzech ? 'Způsob platby' : 'Payment method'}: ${invoice.payment_method || 'Platební brána'}
${invoice.paid_at ? `${isCzech ? 'Datum úhrady' : 'Payment date'}: ${new Date(invoice.paid_at).toLocaleDateString(isCzech ? 'cs-CZ' : 'en-GB')}` : ''}

==========================================
${COMPANY.name}
${isCzech ? 'Plátce DPH' : 'VAT payer'}
  `.trim()

  // Převést na Uint8Array (pro skutečné PDF by se použila jiná metoda)
  return new TextEncoder().encode(content)
}























