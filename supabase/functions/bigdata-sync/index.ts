// ============================================
// EDGE FUNCTION: BigData Sync
// Synchronizace dat z hlavní DB do Analytics DB
// Spouštěno přes CRON 1× denně (03:00 UTC = 04:00 CZ)
// 06.03.2026
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Hlavní produkční DB
const MAIN_URL = Deno.env.get('SUPABASE_URL')!
const MAIN_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Analytics DB
const ANALYTICS_URL = Deno.env.get('ANALYTICS_SUPABASE_URL')!
const ANALYTICS_KEY = Deno.env.get('ANALYTICS_SUPABASE_KEY')!

// Secret pro manuální spuštění
const SYNC_SECRET = Deno.env.get('DASHBOARD_BIGDATA_SECRET')

interface SyncResult {
  table: string
  rows: number
  error?: string
}

Deno.serve(async (req) => {
  const startTime = Date.now()
  const headers = { 'Content-Type': 'application/json' }

  // Ověření — buď CRON (Authorization: Bearer), nebo manuální (x-dashboard-secret)
  const authHeader = req.headers.get('authorization')
  const dashboardSecret = req.headers.get('x-dashboard-secret')
  const isCron = authHeader?.startsWith('Bearer ')
  const isManual = dashboardSecret && dashboardSecret === SYNC_SECRET

  if (!isCron && !isManual) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  try {
    const mainDb = createClient(MAIN_URL, MAIN_KEY)
    const analyticsDb = createClient(ANALYTICS_URL, ANALYTICS_KEY)

    const results: SyncResult[] = []

    // ========== 1. USERS ==========
    try {
      const { data: users, error } = await mainDb
        .from('users')
        .select('clerk_id, email, first_name, last_name, locale, subscription_tier, subscription_status, subscription_expires_at, created_at, last_login, updated_at')

      if (error) throw error

      if (users && users.length > 0) {
        const reportUsers = users.map(u => ({
          clerk_id: u.clerk_id,
          email_domain: u.email ? u.email.split('@')[1] : null,
          locale: u.locale || null,
          country: null, // Bude doplněno z subscriptions
          has_subscription: u.subscription_status === 'active',
          subscription_tier: u.subscription_tier || 'free',
          subscription_status: u.subscription_status || 'none',
          recipe_count: 0, // Bude aktualizováno níže
          product_count: 0,
          reminder_count: 0,
          first_name: u.first_name,
          last_name: u.last_name,
          created_at: u.created_at,
          last_active_at: u.last_login || u.updated_at,
          synced_at: new Date().toISOString(),
        }))

        const { error: upsertError } = await analyticsDb
          .from('report_users')
          .upsert(reportUsers, { onConflict: 'clerk_id' })

        if (upsertError) throw upsertError
        results.push({ table: 'report_users', rows: reportUsers.length })
      } else {
        results.push({ table: 'report_users', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_users', rows: 0, error: e.message })
    }

    // ========== 2. RECIPES ==========
    try {
      const { data: recipes, error } = await mainDb
        .from('recipes')
        .select('id, clerk_id, name, description, form_type, is_public, public_status, difficulty_level, rating, public_rating_avg, public_rating_count, is_pro_recipe, recipe_data, flavors_data, created_at, updated_at')

      if (error) throw error

      if (recipes && recipes.length > 0) {
        // Upsert ve dávkách po 500
        for (let i = 0; i < recipes.length; i += 500) {
          const batch = recipes.slice(i, i + 500).map(r => ({
            ...r,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_recipes')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_recipes', rows: recipes.length })
      } else {
        results.push({ table: 'report_recipes', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_recipes', rows: 0, error: e.message })
    }

    // ========== 3. FAVORITE PRODUCTS ==========
    try {
      const { data: products, error } = await mainDb
        .from('favorite_products')
        .select('id, clerk_id, name, product_type, description, manufacturer, flavor_category, flavor_product_type, flavor_id, steep_days, stock_quantity, rating, product_url, created_at, updated_at')

      if (error) throw error

      if (products && products.length > 0) {
        // Doplnit percent_min, percent_max, percent_optimal z flavors tabulky
        const flavorIds = products
          .filter(p => p.flavor_id)
          .map(p => p.flavor_id)
        
        let flavorMap: Record<string, any> = {}
        if (flavorIds.length > 0) {
          // Načíst unikátní flavor IDs ve dávkách
          const uniqueIds = [...new Set(flavorIds)]
          for (let i = 0; i < uniqueIds.length; i += 500) {
            const batch = uniqueIds.slice(i, i + 500)
            const { data: flavors } = await mainDb
              .from('flavors')
              .select('id, min_percent, max_percent, recommended_percent')
              .in('id', batch)

            if (flavors) {
              for (const f of flavors) {
                flavorMap[f.id] = f
              }
            }
          }
        }

        for (let i = 0; i < products.length; i += 500) {
          const batch = products.slice(i, i + 500).map(p => {
            const flavor = p.flavor_id ? flavorMap[p.flavor_id] : null
            return {
              id: p.id,
              clerk_id: p.clerk_id,
              name: p.name,
              product_type: p.product_type,
              description: p.description,
              manufacturer: p.manufacturer,
              flavor_category: p.flavor_category,
              flavor_product_type: p.flavor_product_type,
              flavor_id: p.flavor_id,
              steep_days: p.steep_days,
              stock_quantity: p.stock_quantity,
              rating: p.rating,
              product_url: p.product_url,
              percent_min: flavor?.min_percent || null,
              percent_max: flavor?.max_percent || null,
              percent_optimal: flavor?.recommended_percent || null,
              created_at: p.created_at,
              updated_at: p.updated_at,
              synced_at: new Date().toISOString(),
            }
          })

          const { error: upsertError } = await analyticsDb
            .from('report_products')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_products', rows: products.length })
      } else {
        results.push({ table: 'report_products', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_products', rows: 0, error: e.message })
    }

    // ========== 4. SUBSCRIPTIONS ==========
    try {
      const { data: subs, error } = await mainDb
        .from('subscriptions')
        .select('id, clerk_id, plan_type, status, payment_status, amount, vat_rate, vat_amount, total_amount, currency, user_locale, user_country, auto_renew, valid_from, valid_to, paid_at, created_at, updated_at')

      if (error) throw error

      if (subs && subs.length > 0) {
        for (let i = 0; i < subs.length; i += 500) {
          const batch = subs.slice(i, i + 500).map(s => ({
            ...s,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_subscriptions')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_subscriptions', rows: subs.length })

        // Aktualizovat user_country v report_users
        for (const sub of subs) {
          if (sub.user_country && sub.clerk_id) {
            await analyticsDb
              .from('report_users')
              .update({ country: sub.user_country })
              .eq('clerk_id', sub.clerk_id)
          }
        }
      } else {
        results.push({ table: 'report_subscriptions', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_subscriptions', rows: 0, error: e.message })
    }

    // ========== 5. REMINDERS ==========
    try {
      const { data: reminders, error } = await mainDb
        .from('recipe_reminders')
        .select('id, clerk_id, recipe_id, recipe_name, flavor_name, flavor_type, status, mixed_at, remind_at, stock_percent, consumed_at, created_at, updated_at')

      if (error) throw error

      if (reminders && reminders.length > 0) {
        for (let i = 0; i < reminders.length; i += 500) {
          const batch = reminders.slice(i, i + 500).map(r => {
            // Vypočítat steep_days
            let steepDays: number | null = null
            if (r.mixed_at && r.remind_at) {
              const mixed = new Date(r.mixed_at)
              const remind = new Date(r.remind_at)
              steepDays = Math.round((remind.getTime() - mixed.getTime()) / (1000 * 60 * 60 * 24))
            }

            return {
              id: r.id,
              clerk_id: r.clerk_id,
              recipe_id: r.recipe_id,
              recipe_name: r.recipe_name,
              flavor_name: r.flavor_name,
              flavor_type: r.flavor_type,
              status: r.status,
              mixed_at: r.mixed_at,
              remind_at: r.remind_at,
              steep_days: steepDays,
              stock_percent: r.stock_percent,
              consumed_at: r.consumed_at,
              created_at: r.created_at,
              updated_at: r.updated_at,
              synced_at: new Date().toISOString(),
            }
          })

          const { error: upsertError } = await analyticsDb
            .from('report_reminders')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_reminders', rows: reminders.length })
      } else {
        results.push({ table: 'report_reminders', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_reminders', rows: 0, error: e.message })
    }

    // ========== 6. RECIPE RATINGS ==========
    try {
      const { data: ratings, error } = await mainDb
        .from('recipe_ratings')
        .select('id, recipe_id, clerk_id, rating, created_at, updated_at')

      if (error) throw error

      if (ratings && ratings.length > 0) {
        for (let i = 0; i < ratings.length; i += 500) {
          const batch = ratings.slice(i, i + 500).map(r => ({
            ...r,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_recipe_ratings')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_recipe_ratings', rows: ratings.length })
      } else {
        results.push({ table: 'report_recipe_ratings', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_recipe_ratings', rows: 0, error: e.message })
    }

    // ========== 7. FLAVORS ==========
    try {
      const { data: flavors, error } = await mainDb
        .from('flavors')
        .select('id, name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status, avg_rating, rating_count, usage_count, created_at, updated_at')

      if (error) throw error

      if (flavors && flavors.length > 0) {
        for (let i = 0; i < flavors.length; i += 500) {
          const batch = flavors.slice(i, i + 500).map(f => ({
            ...f,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_flavors')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_flavors', rows: flavors.length })
      } else {
        results.push({ table: 'report_flavors', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_flavors', rows: 0, error: e.message })
    }

    // ========== 8. PAYMENTS ==========
    try {
      const { data: payments, error } = await mainDb
        .from('payments')
        .select('id, clerk_id, subscription_id, order_number, amount, currency, status, prcode, srcode, created_at, completed_at, refunded_at, refund_amount')

      if (error) throw error

      if (payments && payments.length > 0) {
        for (let i = 0; i < payments.length; i += 500) {
          const batch = payments.slice(i, i + 500).map(p => ({
            ...p,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_payments')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_payments', rows: payments.length })
      } else {
        results.push({ table: 'report_payments', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_payments', rows: 0, error: e.message })
    }

    // ========== 9. CONTACT MESSAGES ==========
    try {
      const { data: messages, error } = await mainDb
        .from('contact_messages')
        .select('id, clerk_id, category, status, priority, locale, detected_language, ai_sentiment, ai_category, ai_auto_resolved, is_business_offer, created_at, resolved_at')

      if (error) throw error

      if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i += 500) {
          const batch = messages.slice(i, i + 500).map(m => ({
            ...m,
            synced_at: new Date().toISOString(),
          }))

          const { error: upsertError } = await analyticsDb
            .from('report_contact_messages')
            .upsert(batch, { onConflict: 'id' })

          if (upsertError) throw upsertError
        }
        results.push({ table: 'report_contact_messages', rows: messages.length })
      } else {
        results.push({ table: 'report_contact_messages', rows: 0 })
      }
    } catch (e: any) {
      results.push({ table: 'report_contact_messages', rows: 0, error: e.message })
    }

    // ========== 10. AKTUALIZOVAT POČTY V REPORT_USERS ==========
    try {
      // Počty receptů per user
      const { data: recipeCounts } = await analyticsDb
        .rpc('exec_readonly_sql', {
          query: `SELECT clerk_id, COUNT(*) as cnt FROM report_recipes GROUP BY clerk_id`
        })

      if (recipeCounts) {
        for (const rc of recipeCounts) {
          await analyticsDb
            .from('report_users')
            .update({ recipe_count: rc.cnt })
            .eq('clerk_id', rc.clerk_id)
        }
      }

      // Počty produktů per user
      const { data: productCounts } = await analyticsDb
        .rpc('exec_readonly_sql', {
          query: `SELECT clerk_id, COUNT(*) as cnt FROM report_products GROUP BY clerk_id`
        })

      if (productCounts) {
        for (const pc of productCounts) {
          await analyticsDb
            .from('report_users')
            .update({ product_count: pc.cnt })
            .eq('clerk_id', pc.clerk_id)
        }
      }

      // Počty připomínek per user
      const { data: reminderCounts } = await analyticsDb
        .rpc('exec_readonly_sql', {
          query: `SELECT clerk_id, COUNT(*) as cnt FROM report_reminders GROUP BY clerk_id`
        })

      if (reminderCounts) {
        for (const rc of reminderCounts) {
          await analyticsDb
            .from('report_users')
            .update({ reminder_count: rc.cnt })
            .eq('clerk_id', rc.clerk_id)
        }
      }
    } catch (e: any) {
      console.error('Error updating user counts:', e.message)
    }

    // ========== LOG SYNC ==========
    const duration = Date.now() - startTime
    const rowsSynced: Record<string, number> = {}
    for (const r of results) {
      rowsSynced[r.table] = r.rows
    }

    const hasErrors = results.some(r => r.error)

    await analyticsDb
      .from('sync_log')
      .insert({
        sync_type: isManual ? 'manual' : 'cron',
        tables_synced: results.map(r => r.table),
        rows_synced: rowsSynced,
        duration_ms: duration,
        status: hasErrors ? 'partial' : 'success',
        error_message: hasErrors ? results.filter(r => r.error).map(r => `${r.table}: ${r.error}`).join('; ') : null,
      })

    console.log(`BigData sync completed in ${duration}ms:`, JSON.stringify(rowsSynced))

    return new Response(JSON.stringify({
      success: !hasErrors,
      duration_ms: duration,
      results,
    }), { status: 200, headers })

  } catch (err: any) {
    console.error('BigData sync fatal error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
})
