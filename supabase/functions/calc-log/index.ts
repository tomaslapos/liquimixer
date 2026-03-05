import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  getCorsHeaders,
  handleCorsPreflight,
  isAllowedOrigin,
  getRateLimitIdentifier,
  checkRateLimit as sharedCheckRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from '../_shared/cors.ts'

// Analytics DB — separátní projekt (nezahlcuje hlavní DB)
const ANALYTICS_URL = Deno.env.get('ANALYTICS_SUPABASE_URL') || 'https://ikgtygabrrvbqyffcqjd.supabase.co'
const ANALYTICS_KEY = Deno.env.get('ANALYTICS_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZ3R5Z2FicnJ2YnF5ZmZjcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjcxNTUzMCwiZXhwIjoyMDg4MjkxNTMwfQ.FDeUBb-b7qx25NyZljhmJ5bWAczQ0F3YYuSoUDGSao8'

// Registrovat rate limit: 25 za minutu
RATE_LIMITS['calc-log'] = { maxRequests: 25, windowMs: 60 * 1000 }

// Povolené calc_type hodnoty
const VALID_CALC_TYPES = new Set([
  'liquid', 'shakevape', 'liquidpro', 'shortfill', 'dilution',
  'shisha_mix', 'shisha_diy', 'shisha_molasses', 'shisha_tweak'
])

// Povolené device_type hodnoty
const VALID_DEVICE_TYPES = new Set(['desktop', 'mobile', 'tablet'])

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }

  // Pouze POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  // Origin check
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
  }

  try {
    // Rate limit (25/min per IP)
    const rlId = getRateLimitIdentifier(req)
    const rl = sharedCheckRateLimit(rlId, 'calc-log')
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetAt, origin)
    }

    const body = await req.json()

    // Validace
    if (!body.calc_type || !VALID_CALC_TYPES.has(body.calc_type)) {
      return new Response(JSON.stringify({ error: 'Invalid calc_type' }), { status: 400, headers })
    }

    // Sanitizace a omezení velikosti
    const params = body.params || {}
    const results = body.results || {}
    const paramsStr = JSON.stringify(params)
    const resultsStr = JSON.stringify(results)

    // Max 50KB pro params + results
    if (paramsStr.length + resultsStr.length > 51200) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers })
    }

    // Detekce země z IP (Cloudflare header)
    const country = req.headers.get('cf-ipcountry') || null

    // Sestavit záznam
    const record: Record<string, unknown> = {
      calc_type: body.calc_type,
      params: params,
      results: results,
      locale: (body.locale || 'en').substring(0, 10),
      country: country,
      device_type: VALID_DEVICE_TYPES.has(body.device_type) ? body.device_type : 'desktop',
      screen_resolution: body.screen_resolution ? String(body.screen_resolution).substring(0, 20) : null,
      is_pwa: !!body.is_pwa,
      user_agent: body.user_agent ? String(body.user_agent).substring(0, 300) : null,
      referrer: body.referrer ? String(body.referrer).substring(0, 500) : null,
      session_hash: body.session_hash ? String(body.session_hash).substring(0, 64) : null
    }

    // Anonymní ID (UUID z localStorage)
    if (body.anonymous_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.anonymous_id)) {
      record.anonymous_id = body.anonymous_id
    }

    // Clerk ID (pokud přihlášen)
    if (body.clerk_id && typeof body.clerk_id === 'string' && body.clerk_id.startsWith('user_')) {
      record.clerk_id = body.clerk_id.substring(0, 50)
    }

    // INSERT do ANALYTICS DB (separátní projekt)
    const analytics = createClient(ANALYTICS_URL, ANALYTICS_KEY)
    const { error } = await analytics
      .from('calculation_logs')
      .insert(record)

    if (error) {
      console.error('Insert error:', error)
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers })
  } catch (err) {
    console.error('Calc-log error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers })
  }
})
