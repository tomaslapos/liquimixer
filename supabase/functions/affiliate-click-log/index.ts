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

// Analytics DB — separátní projekt
const ANALYTICS_URL = Deno.env.get('ANALYTICS_SUPABASE_URL')!
const ANALYTICS_KEY = Deno.env.get('ANALYTICS_SUPABASE_KEY')!

// Rate limit: 10 kliků za minutu
RATE_LIMITS['affiliate-click-log'] = { maxRequests: 10, windowMs: 60 * 1000 }

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
  }

  try {
    // Rate limit
    const rlId = getRateLimitIdentifier(req)
    const rl = sharedCheckRateLimit(rlId, 'affiliate-click-log')
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetAt, origin)
    }

    const body = await req.json()

    // Validace
    if (!body.affiliate_shop_name || !body.affiliate_shop_slug || !body.click_source) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers })
    }

    const validSources = ['button', 'modal']
    if (!validSources.includes(body.click_source)) {
      return new Response(JSON.stringify({ error: 'Invalid click_source' }), { status: 400, headers })
    }

    const record: Record<string, unknown> = {
      affiliate_shop_name: String(body.affiliate_shop_name).substring(0, 200),
      affiliate_shop_slug: String(body.affiliate_shop_slug).substring(0, 100),
      click_source: body.click_source,
      locale: body.locale ? String(body.locale).substring(0, 10) : null,
      device_type: ['desktop', 'mobile', 'tablet'].includes(body.device_type) ? body.device_type : 'desktop',
    }

    // Anonymní ID
    if (body.anonymous_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.anonymous_id)) {
      record.anonymous_id = body.anonymous_id
    }

    // Clerk ID
    if (body.clerk_id && typeof body.clerk_id === 'string' && body.clerk_id.startsWith('user_')) {
      record.clerk_id = body.clerk_id.substring(0, 50)
    }

    // INSERT do analytics DB
    const analytics = createClient(ANALYTICS_URL, ANALYTICS_KEY)
    const { error } = await analytics
      .from('report_affiliate_clicks')
      .insert(record)

    if (error) {
      console.error('Affiliate click insert error:', error)
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers })
  } catch (err) {
    console.error('Affiliate click error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers })
  }
})
