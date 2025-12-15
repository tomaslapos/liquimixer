// ============================================
// EDGE FUNCTION: Billing Operations
// Bezpečné operace s fakturačními údaji
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validace fakturačních údajů
function validateBillingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Povinné pole pro firmu
  if (data.type === 'company') {
    if (!data.company || data.company.length < 2) {
      errors.push('Název firmy je povinný')
    }
    if (!data.ico || !/^\d{8}$/.test(data.ico)) {
      errors.push('IČO musí být 8 číslic')
    }
    // DIČ je volitelné, ale pokud je zadáno, musí být validní
    if (data.dic && !/^CZ\d{8,10}$/.test(data.dic)) {
      errors.push('DIČ musí být ve formátu CZxxxxxxxx')
    }
  }
  
  // Validace jména
  if (!data.name || data.name.length < 2) {
    errors.push('Jméno je povinné (min. 2 znaky)')
  }
  if (data.name && data.name.length > 200) {
    errors.push('Jméno je příliš dlouhé (max. 200 znaků)')
  }
  
  // Validace adresy
  if (data.street && data.street.length > 200) {
    errors.push('Ulice je příliš dlouhá')
  }
  if (data.city && data.city.length > 100) {
    errors.push('Město je příliš dlouhé')
  }
  if (data.zip && !/^\d{3}\s?\d{2}$/.test(data.zip)) {
    errors.push('PSČ musí být ve formátu XXX XX')
  }
  
  // Validace telefonu
  if (data.phone && !/^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Neplatný formát telefonu')
  }
  
  // Sanitizace - odstranit nebezpečné znaky
  const dangerousChars = /<|>|script|javascript|onclick|onerror/gi
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && dangerousChars.test(value)) {
      errors.push(`Pole ${key} obsahuje nepovolené znaky`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Sanitizace vstupních dat
function sanitizeInput(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
    .substring(0, 500) // Max délka
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Získat Supabase klienta s admin právy
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

    // Ověřit JWT token z hlavičky
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Chybí autorizační token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Získat uživatele z tokenu (Clerk JWT)
    const token = authHeader.replace('Bearer ', '')
    
    // Dekódovat Clerk JWT a získat user ID
    // V produkci použijte Clerk SDK pro ověření tokenu
    const payload = JSON.parse(atob(token.split('.')[1]))
    const clerkId = payload.sub
    
    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: 'Neplatný token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, data } = await req.json()

    // Audit log - zaznamenat operaci
    const auditLog = {
      clerk_id: clerkId,
      action: action,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    }
    console.log('Billing operation:', JSON.stringify(auditLog))

    switch (action) {
      case 'save': {
        // Validace dat
        const validation = validateBillingData(data)
        if (!validation.valid) {
          return new Response(
            JSON.stringify({ error: 'Validační chyby', details: validation.errors }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sanitizovat a uložit
        const sanitizedData = {
          billing_type: data.type === 'company' ? 'company' : 'person',
          billing_name: sanitizeInput(data.name),
          billing_company: sanitizeInput(data.company),
          billing_street: sanitizeInput(data.street),
          billing_city: sanitizeInput(data.city),
          billing_zip: sanitizeInput(data.zip)?.replace(/\s/g, ''),
          billing_country: sanitizeInput(data.country) || 'CZ',
          billing_ico: sanitizeInput(data.ico)?.replace(/\s/g, ''),
          billing_dic: sanitizeInput(data.dic)?.toUpperCase(),
          phone: sanitizeInput(data.phone)?.replace(/\s/g, ''),
          updated_at: new Date().toISOString()
        }

        const { data: result, error } = await supabaseAdmin
          .from('users')
          .update(sanitizedData)
          .eq('clerk_id', clerkId)
          .select('billing_type, billing_name, billing_company, billing_city, billing_country')
          .single()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Chyba při ukládání' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get': {
        const { data: result, error } = await supabaseAdmin
          .from('users')
          .select('billing_type, billing_name, billing_company, billing_street, billing_city, billing_zip, billing_country, billing_ico, billing_dic, phone, email')
          .eq('clerk_id', clerkId)
          .single()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Chyba při načítání' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
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
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
