// ============================================
// EDGE FUNCTION: User Cleanup CRON Job
// Automatické mazání neaktivních účtů
// WOOs, s. r. o.
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { 
  getCorsHeaders, 
  handleCorsPreflight
} from '../_shared/cors.ts'
import {
  getEmailTranslations,
  getDayWord,
  formatEmailText
} from '../_shared/email-translations.ts'

// ============================================
// KONFIGURACE
// ============================================

// Časové limity pro mazání (v hodinách)
const DELETION_RULES = {
  // Uživatel bez historie předplatného - mazání po 48 hodinách
  noSubscriptionHistory: 48,
  
  // Uživatel s historií předplatného - mazání 3 měsíce po vypršení
  withSubscriptionHistory: 90 * 24, // 90 dní v hodinách
  
  // Pending subscriptions - mazání po 24 hodinách
  pendingSubscription: 24, // 24 hodin
  
  // Upozornění před mazáním (pro uživatele s historií)
  warnings: {
    oneMonth: 30 * 24,   // 30 dní před
    oneWeek: 7 * 24,     // 7 dní před
    oneDay: 24           // 1 den před
  }
}

// Clerk Backend API
const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY') || ''
const CLERK_API_URL = 'https://api.clerk.com/v1'

// SMTP konfigurace
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'smtp.websupport.cz',
  port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
  username: Deno.env.get('SMTP_USER') || 'noreply@liquimixer.com',
  password: Deno.env.get('SMTP_PASSWORD') || '',
  tls: true,
}

const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'noreply@liquimixer.com'

// ============================================
// POMOCNÉ FUNKCE
// ============================================

// Odeslat email přes SMTP
async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  try {
    if (!SMTP_CONFIG.password) {
      console.log(`SMTP not configured. Would send email to ${to}: ${subject}`)
      return true // Pretend success for testing
    }

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
      from: `LiquiMixer <${EMAIL_FROM}>`,
      to: to,
      subject: subject,
      content: htmlBody.replace(/<[^>]*>/g, ''), // Plain text fallback
      html: htmlBody,
    })

    await client.close()
    console.log(`Email sent successfully to ${to}: ${subject}`)
    return true
    
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Smazat uživatele v Clerk
async function deleteClerkUser(clerkId: string): Promise<boolean> {
  if (!CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY not configured')
    return false
  }
  
  try {
    const response = await fetch(`${CLERK_API_URL}/users/${clerkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log(`Clerk user ${clerkId} deleted successfully`)
      return true
    } else {
      const error = await response.text()
      console.error(`Failed to delete Clerk user ${clerkId}:`, error)
      return false
    }
  } catch (error) {
    console.error(`Error deleting Clerk user ${clerkId}:`, error)
    return false
  }
}

// Získat hodiny od data
function getHoursSince(date: string | Date): number {
  const then = new Date(date)
  const now = new Date()
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60)
}

// Generovat email pro upozornění - používá centrální překlady
function generateWarningEmail(userName: string, daysLeft: number, locale: string = 'cs'): { subject: string; html: string } {
  const t = getEmailTranslations(locale)
  const dayWord = getDayWord(daysLeft, locale)
  
  const subject = formatEmailText(t.warning_subject, { days: daysLeft, dayWord })
  const bodyText = formatEmailText(t.warning_body, { days: daysLeft, dayWord })
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a15; color: #ffffff;">
      <h2 style="color: #ff00ff;">LiquiMixer</h2>
      <p>${t.warning_greeting}${userName ? ` ${userName}` : ''},</p>
      <p><strong>${bodyText}</strong></p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://www.liquimixer.com/?action=renew" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          ${t.warning_cta}
        </a>
      </p>
      <p>${t.warning_data_lost}</p>
      <ul>
        <li>${t.warning_data_recipes}</li>
        <li>${t.warning_data_products}</li>
        <li>${t.warning_data_settings}</li>
      </ul>
      <p>${t.warning_thanks}</p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        ${t.warning_footer}
      </p>
    </div>
  `
  
  return { subject, html }
}

// Generovat email pro potvrzení smazání - používá centrální překlady
function generateDeletionEmail(userName: string, locale: string = 'cs'): { subject: string; html: string } {
  const t = getEmailTranslations(locale)
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a15; color: #ffffff;">
      <h2 style="color: #ff00ff;">LiquiMixer</h2>
      <p>${t.warning_greeting}${userName ? ` ${userName}` : ''},</p>
      <p><strong>${t.deletion_body}</strong></p>
      <p>${t.deletion_data_removed}</p>
      <p>${t.deletion_new_account}</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://www.liquimixer.com" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          www.liquimixer.com
        </a>
      </p>
      <p>${t.warning_thanks}</p>
    </div>
  `
  
  return { subject: t.deletion_subject, html }
}

// ============================================
// HLAVNÍ HANDLER
// ============================================

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  // Ověřit že je to CRON job nebo admin
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  
  // Povolit přístup pro CRON job (s tajným klíčem) nebo service role
  const isAuthorized = authHeader?.includes(cronSecret || 'INVALID') || 
                       authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
  
  if (!isAuthorized && cronSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { action } = await req.json().catch(() => ({ action: 'run' }))
    
    const results = {
      usersChecked: 0,
      warningsSent: 0,
      usersDeleted: 0,
      pendingSubscriptionsCleaned: 0,
      errors: [] as string[]
    }

    // 0. Cleanup starých pending subscriptions (starší než 24 hodin)
    const pendingCutoff = new Date(Date.now() - DELETION_RULES.pendingSubscription * 60 * 60 * 1000)
    const { data: oldPendingSubscriptions, error: pendingError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, clerk_id, created_at')
      .eq('status', 'pending')
      .lt('created_at', pendingCutoff.toISOString())
    
    if (!pendingError && oldPendingSubscriptions) {
      for (const sub of oldPendingSubscriptions) {
        try {
          const { error: deleteError } = await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('id', sub.id)
          
          if (!deleteError) {
            results.pendingSubscriptionsCleaned++
            console.log(`Deleted old pending subscription ${sub.id} (created: ${sub.created_at})`)
          }
        } catch (e) {
          results.errors.push(`Failed to delete pending subscription ${sub.id}`)
        }
      }
    }

    // 1. Získat všechny uživatele
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        clerk_id,
        email,
        first_name,
        locale,
        created_at,
        subscription_status,
        subscription_expires_at,
        deletion_warning_sent,
        deletion_scheduled_at
      `)
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    results.usersChecked = users?.length || 0
    console.log(`Checking ${results.usersChecked} users...`)

    for (const user of users || []) {
      try {
        // Získat historii předplatného
        const { data: subscriptions } = await supabaseAdmin
          .from('subscriptions')
          .select('id, status, valid_to, paid_at')
          .eq('clerk_id', user.clerk_id)
          .order('created_at', { ascending: false })
        
        const hasSubscriptionHistory = subscriptions && subscriptions.some(s => s.paid_at)
        const hasActiveSubscription = user.subscription_status === 'active'
        
        // Přeskočit uživatele s aktivním předplatným
        if (hasActiveSubscription) {
          // Resetovat případné deletion warnings
          if (user.deletion_scheduled_at) {
            await supabaseAdmin
              .from('users')
              .update({ 
                deletion_scheduled_at: null,
                deletion_warning_sent: null
              })
              .eq('id', user.id)
          }
          continue
        }

        const hoursSinceCreation = getHoursSince(user.created_at)
        
        // Logika pro uživatele BEZ historie předplatného
        if (!hasSubscriptionHistory) {
          // Mazání po 48 hodinách
          if (hoursSinceCreation >= DELETION_RULES.noSubscriptionHistory) {
            console.log(`Deleting user ${user.clerk_id} - no subscription after 48h`)
            
            // Smazat v Clerk
            const clerkDeleted = await deleteClerkUser(user.clerk_id)
            
            if (clerkDeleted) {
              // Smazat v Supabase
              await supabaseAdmin.from('users').delete().eq('id', user.id)
              await supabaseAdmin.from('recipes').delete().eq('clerk_id', user.clerk_id)
              await supabaseAdmin.from('products').delete().eq('clerk_id', user.clerk_id)
              await supabaseAdmin.from('reminders').delete().eq('clerk_id', user.clerk_id)
              
              results.usersDeleted++
              
              // Odeslat email o smazání (pokud máme email)
              if (user.email) {
                const emailContent = generateDeletionEmail(user.first_name, user.locale)
                await sendEmail(user.email, emailContent.subject, emailContent.html)
              }
            } else {
              results.errors.push(`Failed to delete Clerk user ${user.clerk_id}`)
            }
          }
          continue
        }

        // Logika pro uživatele S historií předplatného
        // Najít datum vypršení posledního předplatného
        const lastSubscription = subscriptions?.find(s => s.paid_at)
        if (!lastSubscription?.valid_to) continue
        
        const hoursSinceExpiry = getHoursSince(lastSubscription.valid_to)
        const hoursUntilDeletion = DELETION_RULES.withSubscriptionHistory - hoursSinceExpiry
        const daysUntilDeletion = Math.ceil(hoursUntilDeletion / 24)

        // Nastavit datum smazání pokud ještě není nastaveno
        if (!user.deletion_scheduled_at && hoursSinceExpiry > 0) {
          const deletionDate = new Date(lastSubscription.valid_to)
          deletionDate.setDate(deletionDate.getDate() + 90)
          
          await supabaseAdmin
            .from('users')
            .update({ deletion_scheduled_at: deletionDate.toISOString() })
            .eq('id', user.id)
        }

        // Kontrola upozornění
        const warningsSent = user.deletion_warning_sent || []
        
        // 1 měsíc před
        if (daysUntilDeletion <= 30 && daysUntilDeletion > 7 && !warningsSent.includes('1month')) {
          if (user.email) {
            const emailContent = generateWarningEmail(user.first_name, 30, user.locale)
            const sent = await sendEmail(user.email, emailContent.subject, emailContent.html)
            if (sent) {
              await supabaseAdmin
                .from('users')
                .update({ deletion_warning_sent: [...warningsSent, '1month'] })
                .eq('id', user.id)
              results.warningsSent++
              console.log(`Sent 1-month warning to ${user.email}`)
            }
          }
        }
        
        // 1 týden před
        if (daysUntilDeletion <= 7 && daysUntilDeletion > 1 && !warningsSent.includes('1week')) {
          if (user.email) {
            const emailContent = generateWarningEmail(user.first_name, 7, user.locale)
            const sent = await sendEmail(user.email, emailContent.subject, emailContent.html)
            if (sent) {
              await supabaseAdmin
                .from('users')
                .update({ deletion_warning_sent: [...warningsSent, '1week'] })
                .eq('id', user.id)
              results.warningsSent++
              console.log(`Sent 1-week warning to ${user.email}`)
            }
          }
        }
        
        // 1 den před
        if (daysUntilDeletion <= 1 && daysUntilDeletion > 0 && !warningsSent.includes('1day')) {
          if (user.email) {
            const emailContent = generateWarningEmail(user.first_name, 1, user.locale)
            const sent = await sendEmail(user.email, emailContent.subject, emailContent.html)
            if (sent) {
              await supabaseAdmin
                .from('users')
                .update({ deletion_warning_sent: [...warningsSent, '1day'] })
                .eq('id', user.id)
              results.warningsSent++
              console.log(`Sent 1-day warning to ${user.email}`)
            }
          }
        }

        // Smazání po 90 dnech
        if (hoursSinceExpiry >= DELETION_RULES.withSubscriptionHistory) {
          console.log(`Deleting user ${user.clerk_id} - subscription expired 90+ days ago`)
          
          // Smazat v Clerk
          const clerkDeleted = await deleteClerkUser(user.clerk_id)
          
          if (clerkDeleted) {
            // Smazat v Supabase (soft delete nebo hard delete)
            await supabaseAdmin.from('users').delete().eq('id', user.id)
            await supabaseAdmin.from('recipes').delete().eq('clerk_id', user.clerk_id)
            await supabaseAdmin.from('products').delete().eq('clerk_id', user.clerk_id)
            await supabaseAdmin.from('reminders').delete().eq('clerk_id', user.clerk_id)
            await supabaseAdmin.from('subscriptions').delete().eq('clerk_id', user.clerk_id)
            await supabaseAdmin.from('payments').delete().eq('clerk_id', user.clerk_id)
            
            results.usersDeleted++
            
            // Odeslat email o smazání
            if (user.email) {
              const emailContent = generateDeletionEmail(user.first_name, user.locale)
              await sendEmail(user.email, emailContent.subject, emailContent.html)
            }
          } else {
            results.errors.push(`Failed to delete Clerk user ${user.clerk_id}`)
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${user.clerk_id}:`, userError)
        results.errors.push(`User ${user.clerk_id}: ${userError.message}`)
      }
    }

    console.log('Cleanup results:', results)

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('User cleanup error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
