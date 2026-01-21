// ============================================
// EDGE FUNCTION: Subscription Operations
// Bezpečné operace s předplatným
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
import { verifyClerkToken } from '../_shared/clerk-jwt.ts'

// Konstanty
const SUBSCRIPTION_DURATION_DAYS = 365 // 1 rok
const RENEWAL_REMINDER_DAYS = 30 // Upozornění 30 dní před expirací

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  // Rate limiting
  const identifier = getRateLimitIdentifier(req)
  const rateCheck = checkRateLimit(identifier, 'subscription')
  
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

    // Ověřit Clerk token (přijatý v custom headeru x-clerk-token)
    // Plná verifikace podpisu pomocí JWKS
    const clerkToken = req.headers.get('x-clerk-token')
    if (!clerkToken) {
      return new Response(
        JSON.stringify({ error: 'Chybí Clerk token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Plná JWT verifikace včetně podpisu
    const tokenPayload = await verifyClerkToken(clerkToken, {
      authorizedParties: ['https://www.liquimixer.com', 'https://liquimixer.com']
    })
    
    if (!tokenPayload) {
      return new Response(
        JSON.stringify({ error: 'Neplatný nebo expirovaný token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const clerkId = tokenPayload.sub

    const { action, data } = await req.json()

    switch (action) {
      case 'check': {
        // Zkontrolovat stav předplatného
        const { data: subscription, error } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('clerk_id', clerkId)
          .eq('status', 'active')
          .gte('valid_to', new Date().toISOString())
          .order('valid_to', { ascending: false })
          .limit(1)
          .single()

        if (error || !subscription) {
          // Zkontrolovat expirované předplatné
          const { data: expiredSub } = await supabaseAdmin
            .from('subscriptions')
            .select('valid_to, status')
            .eq('clerk_id', clerkId)
            .order('valid_to', { ascending: false })
            .limit(1)
            .single()

          return new Response(
            JSON.stringify({
              valid: false,
              reason: expiredSub ? 'expired' : 'no_subscription',
              lastExpired: expiredSub?.valid_to || null
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const now = new Date()
        const validTo = new Date(subscription.valid_to)
        const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const needsRenewal = daysLeft <= RENEWAL_REMINDER_DAYS

        return new Response(
          JSON.stringify({
            valid: true,
            subscription: {
              id: subscription.id,
              plan_type: subscription.plan_type,
              status: subscription.status,
              valid_from: subscription.valid_from,
              valid_to: subscription.valid_to,
              auto_renew: subscription.auto_renew
            },
            expiresAt: subscription.valid_to,
            daysLeft: daysLeft,
            needsRenewal: needsRenewal,
            renewalMessage: needsRenewal 
              ? `Vaše předplatné vyprší za ${daysLeft} dní. Obnovte ho pro nepřerušený přístup.`
              : null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create': {
        // Vytvořit nové předplatné (před platbou)
        const planType = data?.planType || 'yearly'
        const userLocale = data?.locale || 'cs'
        const userCountry = data?.country || 'CZ'

        // Získat cenu podle země (country), NE podle jazyka (locale)
        // Jazyk je pro fakturu, země je pro DPH a měnu
        // Mapování země na locale pro pricing tabulku
        const countryToPricingLocale: Record<string, string> = {
          'CZ': 'cs', 'SK': 'sk',
          // EU země používají EUR
          'DE': 'de', 'AT': 'de', 'FR': 'fr', 'IT': 'it', 'ES': 'es',
          'NL': 'nl', 'BE': 'nl', 'PT': 'pt', 'PL': 'pl', 'HU': 'hu',
          'GR': 'el', 'SE': 'sv', 'DK': 'da', 'FI': 'fi', 'IE': 'en',
          'LU': 'de', 'SI': 'en', 'EE': 'et', 'LV': 'lv', 'LT': 'lt',
          'MT': 'en', 'CY': 'el', 'BG': 'bg', 'RO': 'ro', 'HR': 'hr',
          // Mimo EU - USD nebo EUR
          'US': 'en', 'GB': 'en', 'JP': 'ja', 'KR': 'ko', 
          'CN': 'zh-CN', 'TW': 'zh-TW', 'AU': 'en', 'CA': 'en',
          'SA': 'ar-SA', 'AE': 'ar-SA',
        }
        const pricingLocale = countryToPricingLocale[userCountry] || 'en'
        console.log(`Subscription create: userLocale=${userLocale}, userCountry=${userCountry}, pricingLocale=${pricingLocale}`)

        // Získat cenu - zkusit podle pricingLocale, pak fallback na 'en'
        let pricing = null
        const { data: pricingData } = await supabaseAdmin
          .from('pricing')
          .select('*')
          .eq('plan_type', planType)
          .eq('is_active', true)
          .eq('locale', pricingLocale)
          .single()
        
        if (pricingData) {
          pricing = pricingData
        } else {
          // Fallback na angličtinu (EUR)
          console.log(`Pricing not found for locale ${pricingLocale}, trying 'en'`)
          const { data: fallbackPricing } = await supabaseAdmin
            .from('pricing')
            .select('*')
            .eq('plan_type', planType)
            .eq('is_active', true)
            .eq('locale', 'en')
            .single()
          pricing = fallbackPricing
        }

        if (!pricing) {
          return new Response(
            JSON.stringify({ error: 'Cenový plán nenalezen' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const vatAmount = pricing.price * (pricing.vat_rate / 100)
        const totalAmount = pricing.price + vatAmount

        // Základní data pro subscription
        const subscriptionData: Record<string, any> = {
          clerk_id: clerkId,
          plan_type: planType,
          status: 'pending',
          amount: pricing.price,
          vat_rate: pricing.vat_rate,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          currency: pricing.currency,
          auto_renew: false,
        }
        
        // Přidat volitelná pole pokud existují v databázi
        // user_locale = jazyk pro fakturu (uživatelská volba)
        // user_country = země pro DPH (místo plnění z IP geolokace)
        try {
          subscriptionData.user_locale = userLocale // Jazyk uživatele pro fakturu
          subscriptionData.user_country = userCountry // Země pro DPH
        } catch (e) {
          console.log('Optional fields user_locale/user_country not added')
        }

        const { data: newSubscription, error } = await supabaseAdmin
          .from('subscriptions')
          .insert(subscriptionData)
          .select()
          .single()

        if (error) {
          console.error('Error creating subscription:', error)
          return new Response(
            JSON.stringify({ error: 'Chyba při vytváření předplatného' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, subscription: newSubscription }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'activate': {
        // Aktivovat předplatné po úspěšné platbě
        const { subscriptionId, paymentData } = data

        if (!subscriptionId || !paymentData) {
          return new Response(
            JSON.stringify({ error: 'Chybí data pro aktivaci' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Ověřit, že předplatné patří uživateli
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .eq('clerk_id', clerkId)
          .single()

        if (!existingSub) {
          return new Response(
            JSON.stringify({ error: 'Předplatné nenalezeno nebo nepatří uživateli' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const now = new Date()
        const validTo = new Date(now)
        validTo.setDate(validTo.getDate() + SUBSCRIPTION_DURATION_DAYS)

        const { data: activatedSub, error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            payment_status: 'paid',
            payment_id: paymentData.transId,
            payment_method: paymentData.method,
            valid_from: now.toISOString(),
            valid_to: validTo.toISOString(),
            paid_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', subscriptionId)
          .select()
          .single()

        if (error) {
          console.error('Error activating subscription:', error)
          return new Response(
            JSON.stringify({ error: 'Chyba při aktivaci předplatného' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            subscription: activatedSub,
            message: `Předplatné aktivováno do ${validTo.toLocaleDateString('cs-CZ')}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'renew': {
        // Obnovit předplatné (prodloužit)
        const { subscriptionId } = data

        // Najít existující předplatné
        const { data: currentSub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('clerk_id', clerkId)
          .order('valid_to', { ascending: false })
          .limit(1)
          .single()

        if (!currentSub) {
          return new Response(
            JSON.stringify({ error: 'Žádné předplatné k obnovení' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Vytvořit nové předplatné pro obnovu
        const { data: pricing } = await supabaseAdmin
          .from('pricing')
          .select('*')
          .eq('plan_type', 'yearly')
          .eq('is_active', true)
          .eq('locale', 'cs')
          .single()

        if (!pricing) {
          return new Response(
            JSON.stringify({ error: 'Cenový plán nenalezen' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const vatAmount = pricing.price * (pricing.vat_rate / 100)
        const totalAmount = pricing.price + vatAmount

        const renewalData = {
          clerk_id: clerkId,
          plan_type: 'yearly',
          status: 'pending',
          amount: pricing.price,
          vat_rate: pricing.vat_rate,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          currency: pricing.currency,
          auto_renew: currentSub.auto_renew
        }

        const { data: renewalSub, error } = await supabaseAdmin
          .from('subscriptions')
          .insert(renewalData)
          .select()
          .single()

        if (error) {
          console.error('Error creating renewal:', error)
          return new Response(
            JSON.stringify({ error: 'Chyba při vytváření obnovy' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            subscription: renewalSub,
            message: 'Obnova předplatného vytvořena, čeká na platbu'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'setAutoRenew': {
        // Nastavit automatické obnovení
        const { enabled } = data

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ 
            auto_renew: !!enabled,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', clerkId)
          .eq('status', 'active')

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Chyba při nastavení' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoRenew: !!enabled,
            message: enabled ? 'Automatické obnovení zapnuto' : 'Automatické obnovení vypnuto'
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
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Interní chyba serveru' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})































