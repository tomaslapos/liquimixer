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
          // Check for subscription_grants (GDPR re-registration)
          // Get user email from Clerk token or users table
          let userEmail = tokenPayload.email
          if (!userEmail) {
            const { data: userData } = await supabaseAdmin
              .from('users')
              .select('email')
              .eq('clerk_id', clerkId)
              .single()
            userEmail = userData?.email
          }

          if (userEmail) {
            const { data: grant } = await supabaseAdmin
              .from('subscription_grants')
              .select('*')
              .eq('email', userEmail)
              .is('redeemed_at', null)
              .gte('valid_to', new Date().toISOString())
              .order('valid_to', { ascending: false })
              .limit(1)
              .single()

            if (grant) {
              // Double-check: grant must not be expired
              const now = new Date()
              const grantValidTo = new Date(grant.valid_to)
              
              if (grantValidTo <= now) {
                // Grant expired — do NOT redeem, mark as expired
                console.log(`Grant ${grant.id} expired (valid_to: ${grant.valid_to}), skipping`)
                await supabaseAdmin
                  .from('subscription_grants')
                  .update({ notes: (grant.notes || '') + ` | Expired at check: ${now.toISOString()}` })
                  .eq('id', grant.id)
              } else {
              // Redeem the grant — create active subscription
              console.log(`Redeeming subscription grant ${grant.id} for ${userEmail}, valid until ${grant.valid_to}`)

              const { data: newSub } = await supabaseAdmin
                .from('subscriptions')
                .insert({
                  clerk_id: clerkId,
                  plan_type: grant.plan_type || 'yearly',
                  status: 'active',
                  payment_status: 'paid',
                  valid_from: grant.valid_from,
                  valid_to: grant.valid_to,
                  amount: grant.amount,
                  currency: grant.currency,
                  auto_renew: false,
                  paid_at: grant.valid_from,
                })
                .select()
                .single()

              // Mark grant as redeemed
              await supabaseAdmin
                .from('subscription_grants')
                .update({
                  redeemed_at: new Date().toISOString(),
                  redeemed_by: clerkId
                })
                .eq('id', grant.id)

              if (newSub) {
                const now2 = new Date()
                const validTo = new Date(newSub.valid_to)
                const daysLeft = Math.ceil((validTo.getTime() - now2.getTime()) / (1000 * 60 * 60 * 24))

                return new Response(
                  JSON.stringify({
                    valid: true,
                    subscription: {
                      id: newSub.id,
                      plan_type: newSub.plan_type,
                      status: newSub.status,
                      valid_from: newSub.valid_from,
                      valid_to: newSub.valid_to,
                      auto_renew: newSub.auto_renew
                    },
                    expiresAt: newSub.valid_to,
                    daysLeft: daysLeft,
                    needsRenewal: daysLeft <= RENEWAL_REMINDER_DAYS,
                    restoredFromGrant: true
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
              }
              } // close else (grant not expired)
            } // close if (grant)
          } // close if (userEmail)

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

        console.log(`Subscription create: userLocale=${userLocale}, userCountry=${userCountry}`)

        // Získat cenu podle země (country_code) z tabulky pricing
        // Tabulka pricing nyní obsahuje záznamy pro všechny země světa
        let pricing = null
        const { data: pricingData } = await supabaseAdmin
          .from('pricing')
          .select('*')
          .eq('plan_type', planType)
          .eq('is_active', true)
          .eq('country_code', userCountry)
          .single()
        
        if (pricingData) {
          pricing = pricingData
          console.log(`Pricing found for country ${userCountry}: ${pricing.currency} ${pricing.price}`)
        } else {
          // Fallback pro neznámé země: EUR, 2.40, 0% DPH
          console.log(`Pricing not found for country ${userCountry}, using fallback (EUR, 2.40, 0%)`)
          pricing = {
            price: 2.40,
            vat_rate: 0,
            currency: 'EUR',
            name: 'Annual subscription LiquiMixer PRO',
            description: 'Access to all features for 365 days',
            duration_days: 365
          }
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

        // Aktualizovat preferred_locale u uživatele pro budoucí faktury
        // Toto zajistí, že jazyk je uložen v users tabulce
        if (userLocale && userLocale !== 'cs') {
          try {
            await supabaseAdmin
              .from('users')
              .update({ 
                preferred_locale: userLocale,
                updated_at: new Date().toISOString()
              })
              .eq('clerk_id', clerkId)
            console.log(`Updated user preferred_locale to: ${userLocale}`)
          } catch (e) {
            console.warn('Could not update user preferred_locale:', e)
          }
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
        // Použít zemi z existujícího předplatného nebo fallback na CZ
        const renewCountry = currentSub.user_country || 'CZ'
        console.log(`Renewal: using country ${renewCountry} from existing subscription`)
        
        let pricing = null
        const { data: pricingData } = await supabaseAdmin
          .from('pricing')
          .select('*')
          .eq('plan_type', 'yearly')
          .eq('is_active', true)
          .eq('country_code', renewCountry)
          .single()

        if (pricingData) {
          pricing = pricingData
        } else {
          // Fallback pro neznámé země: EUR, 2.40, 0% DPH
          console.log(`Pricing not found for country ${renewCountry}, using fallback`)
          pricing = {
            price: 2.40,
            vat_rate: 0,
            currency: 'EUR',
            name: 'Annual subscription LiquiMixer PRO',
            description: 'Access to all features for 365 days',
            duration_days: 365
          }
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































