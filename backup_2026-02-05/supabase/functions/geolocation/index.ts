// ============================================
// EDGE FUNCTION: Geolocation & VAT Detection
// Detekce země uživatele pro DPH účely a OSS
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

// Cenové konfigurace dle regionu (ceny VČETNĚ DPH)
const PRICING = {
  CZ: { amount: 59, currency: 'CZK', vatRate: 21 },
  EU: { amount: 2.40, currency: 'EUR', vatRate: 0 }, // VAT rate bude z vat_rates tabulky
  OTHER: { amount: 2.40, currency: 'EUR', vatRate: 0 }, // Mimo EU - bez DPH
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req)
  const rateCheck = checkRateLimit(identifier, 'geolocation')
  
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
      case 'detect': {
        // Detekovat zemi uživatele z IP adresy
        const clientIp = getClientIp(req)
        
        // Použít IP geolokační službu
        const geoData = await detectCountryFromIp(clientIp)
        
        // Získat DPH sazbu z databáze
        let vatInfo = null
        if (geoData.countryCode) {
          const { data: vatRate } = await supabaseAdmin
            .from('vat_rates')
            .select('*')
            .eq('country_code', geoData.countryCode)
            .single()
          
          vatInfo = vatRate
        }

        // Určit region a cenu
        const region = determineRegion(geoData.countryCode)
        const pricing = getPricing(geoData.countryCode, region, vatInfo)

        const result = {
          countryCode: geoData.countryCode,
          countryName: vatInfo?.country_name || geoData.countryName,
          region: region, // 'CZ', 'EU', 'OTHER'
          vatRate: vatInfo?.vat_rate || 0,
          currency: pricing.currency,
          grossAmount: pricing.grossAmount,
          netAmount: pricing.netAmount,
          vatAmount: pricing.vatAmount,
          detectionMethod: geoData.method,
          ip: clientIp,
        }

        // Uložit lokaci pokud máme clerk_id
        if (data?.clerkId) {
          await supabaseAdmin
            .from('user_locations')
            .insert({
              clerk_id: data.clerkId,
              country_code: result.countryCode,
              country_name: result.countryName,
              region: result.region,
              ip_address: clientIp,
              detection_method: result.detectionMethod,
              vat_rate: result.vatRate,
              currency: result.currency,
              subscription_id: data.subscriptionId || null
            })
        }

        return new Response(
          JSON.stringify({ success: true, location: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getVatRates': {
        // Získat všechny DPH sazby
        const { data: vatRates } = await supabaseAdmin
          .from('vat_rates')
          .select('*')
          .eq('is_active', true)
          .order('country_name')

        return new Response(
          JSON.stringify({ success: true, vatRates }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getPricing': {
        // Získat cenu pro konkrétní zemi
        const { countryCode } = data

        if (!countryCode) {
          return new Response(
            JSON.stringify({ error: 'Chybí kód země' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: vatInfo } = await supabaseAdmin
          .from('vat_rates')
          .select('*')
          .eq('country_code', countryCode)
          .single()

        const region = determineRegion(countryCode)
        const pricing = getPricing(countryCode, region, vatInfo)

        return new Response(
          JSON.stringify({ 
            success: true, 
            pricing: {
              countryCode,
              region,
              ...pricing
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'manual': {
        // Manuální výběr země (uživatel zvolí sám)
        const { clerkId, countryCode, subscriptionId } = data

        if (!clerkId || !countryCode) {
          return new Response(
            JSON.stringify({ error: 'Chybí povinné údaje' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: vatInfo } = await supabaseAdmin
          .from('vat_rates')
          .select('*')
          .eq('country_code', countryCode)
          .single()

        const region = determineRegion(countryCode)
        const pricing = getPricing(countryCode, region, vatInfo)

        // Uložit manuální výběr
        await supabaseAdmin
          .from('user_locations')
          .insert({
            clerk_id: clerkId,
            country_code: countryCode,
            country_name: vatInfo?.country_name,
            region: region,
            ip_address: getClientIp(req),
            detection_method: 'manual',
            vat_rate: vatInfo?.vat_rate || 0,
            currency: pricing.currency,
            subscription_id: subscriptionId || null
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            location: {
              countryCode,
              countryName: vatInfo?.country_name,
              region,
              vatRate: vatInfo?.vat_rate || 0,
              ...pricing,
              detectionMethod: 'manual'
            }
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
    console.error('Geolocation error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Získat IP adresu klienta
function getClientIp(req: Request): string {
  // Cloudflare
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // X-Forwarded-For (může obsahovat více IP)
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // X-Real-IP
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp

  return 'unknown'
}

// Detekovat zemi z IP adresy
async function detectCountryFromIp(ip: string): Promise<{
  countryCode: string | null
  countryName: string | null
  method: string
}> {
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { countryCode: 'CZ', countryName: 'Czech Republic', method: 'default_localhost' }
  }

  try {
    // Použít bezplatnou IP geolokační službu
    // ip-api.com - 45 požadavků/minutu zdarma
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,country`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success') {
        return {
          countryCode: data.countryCode,
          countryName: data.country,
          method: 'geoip'
        }
      }
    }
  } catch (error) {
    console.error('GeoIP lookup failed:', error)
  }

  // Alternativní služba - ipapi.co
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (response.ok) {
      const data = await response.json()
      if (data.country_code) {
        return {
          countryCode: data.country_code,
          countryName: data.country_name,
          method: 'geoip_alt'
        }
      }
    }
  } catch (error) {
    console.error('Alternative GeoIP lookup failed:', error)
  }

  // Fallback - výchozí Česko
  return { countryCode: 'CZ', countryName: 'Czech Republic', method: 'fallback' }
}

// Určit region (CZ, EU, OTHER)
function determineRegion(countryCode: string | null): string {
  if (!countryCode) return 'OTHER'
  
  if (countryCode === 'CZ') return 'CZ'
  
  // EU členské státy
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]
  
  if (euCountries.includes(countryCode)) return 'EU'
  
  return 'OTHER'
}

// Získat ceny dle země a regionu
// Země, které používají USD
const USD_COUNTRIES = [
  'US', 'AS', 'GU', 'MP', 'PR', 'VI', // USA a teritoria
  'EC', 'SV', 'PA', 'TL', 'ZW', // Země s USD jako oficiální měnou
  'JP', 'KR', 'CN', 'TW', 'HK', 'SG', // Asijské země (preferují USD)
  'AU', 'NZ', // Oceánie
  'SA', 'AE', 'KW', 'QA', 'BH', 'OM', // Blízký východ
  'IL', // Izrael
]

function getPricing(
  countryCode: string | null, 
  region: string, 
  vatInfo: any
): {
  currency: string
  grossAmount: number
  netAmount: number
  vatAmount: number
  vatRate: number
} {
  // Česko - 59 Kč včetně 21% DPH
  if (region === 'CZ' || countryCode === 'CZ') {
    const grossAmount = 59
    const vatRate = 21
    const netAmount = Math.round((grossAmount / (1 + vatRate / 100)) * 100) / 100
    const vatAmount = Math.round((grossAmount - netAmount) * 100) / 100
    
    return {
      currency: 'CZK',
      grossAmount,
      netAmount,
      vatAmount,
      vatRate
    }
  }
  
  // USD země - 2.90 USD bez DPH (mimo EU)
  if (countryCode && USD_COUNTRIES.includes(countryCode)) {
    return {
      currency: 'USD',
      grossAmount: 2.90,
      netAmount: 2.90,
      vatAmount: 0,
      vatRate: 0
    }
  }
  
  // EU země - 2.40 EUR včetně DPH dle země
  if (region === 'EU') {
    const grossAmount = 2.40
    const vatRate = vatInfo?.vat_rate || 20 // Výchozí 20% pro EU
    const netAmount = Math.round((grossAmount / (1 + vatRate / 100)) * 100) / 100
    const vatAmount = Math.round((grossAmount - netAmount) * 100) / 100
    
    return {
      currency: 'EUR',
      grossAmount,
      netAmount,
      vatAmount,
      vatRate
    }
  }
  
  // Mimo EU (ostatní) - 2.40 EUR bez DPH
  return {
    currency: 'EUR',
    grossAmount: 2.40,
    netAmount: 2.40,
    vatAmount: 0,
    vatRate: 0
  }
}























