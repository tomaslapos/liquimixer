// ============================================
// EDGE FUNCTION: User Cleanup CRON Job
// Automatické mazání neaktivních účtů
// WOOs, s. r. o.
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  getCorsHeaders, 
  handleCorsPreflight
} from '../_shared/cors.ts'

// ============================================
// KONFIGURACE
// ============================================

// Časové limity pro mazání (v hodinách)
const DELETION_RULES = {
  // Uživatel bez historie předplatného - mazání po 48 hodinách
  noSubscriptionHistory: 48,
  
  // Uživatel s historií předplatného - mazání 3 měsíce po vypršení
  withSubscriptionHistory: 90 * 24, // 90 dní v hodinách
  
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
  host: Deno.env.get('SMTP_HOST') || '',
  port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
  user: Deno.env.get('SMTP_USER') || '',
  password: Deno.env.get('SMTP_PASSWORD') || '',
  from: Deno.env.get('EMAIL_FROM') || 'noreply@liquimixer.com'
}

// ============================================
// POMOCNÉ FUNKCE
// ============================================

// Odeslat email
async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  try {
    // Použijeme SMTP přes externí službu nebo fetch na email API
    // Pro Deno Edge Functions použijeme Resend nebo podobnou službu
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'LiquiMixer <noreply@liquimixer.com>',
          to: [to],
          subject: subject,
          html: htmlBody
        })
      })
      
      return response.ok
    }
    
    // Fallback - log pouze
    console.log(`Would send email to ${to}: ${subject}`)
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

// Generovat email pro upozornění
function generateWarningEmail(userName: string, daysLeft: number, locale: string = 'cs'): { subject: string; html: string } {
  const translations: Record<string, { subject: string; html: string }> = {
    cs: {
      subject: `LiquiMixer: Váš účet bude smazán za ${daysLeft} ${daysLeft === 1 ? 'den' : daysLeft < 5 ? 'dny' : 'dní'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">LiquiMixer</h2>
          <p>Dobrý den${userName ? ` ${userName}` : ''},</p>
          <p>Váš účet na LiquiMixer bude <strong>automaticky smazán za ${daysLeft} ${daysLeft === 1 ? 'den' : daysLeft < 5 ? 'dny' : 'dní'}</strong> z důvodu neaktivity.</p>
          <p>Pokud si přejete zachovat svůj účet a uložené recepty, prosím obnovte své předplatné:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.liquimixer.com/?action=renew" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Obnovit předplatné
            </a>
          </p>
          <p>Po smazání účtu budou <strong>nenávratně ztracena</strong> všechna vaše data:</p>
          <ul>
            <li>Uložené recepty</li>
            <li>Oblíbené produkty</li>
            <li>Nastavení a preference</li>
          </ul>
          <p>Děkujeme za používání LiquiMixer!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Tento email byl odeslán automaticky. Pokud máte dotazy, kontaktujte nás na support@liquimixer.com
          </p>
        </div>
      `
    },
    en: {
      subject: `LiquiMixer: Your account will be deleted in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">LiquiMixer</h2>
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          <p>Your LiquiMixer account will be <strong>automatically deleted in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> due to inactivity.</p>
          <p>If you wish to keep your account and saved recipes, please renew your subscription:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.liquimixer.com/?action=renew" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Renew subscription
            </a>
          </p>
          <p>After deletion, all your data will be <strong>permanently lost</strong>:</p>
          <ul>
            <li>Saved recipes</li>
            <li>Favorite products</li>
            <li>Settings and preferences</li>
          </ul>
          <p>Thank you for using LiquiMixer!</p>
        </div>
      `
    }
  }
  
  return translations[locale] || translations['cs']
}

// Generovat email pro potvrzení smazání
function generateDeletionEmail(userName: string, locale: string = 'cs'): { subject: string; html: string } {
  const translations: Record<string, { subject: string; html: string }> = {
    cs: {
      subject: 'LiquiMixer: Váš účet byl smazán',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">LiquiMixer</h2>
          <p>Dobrý den${userName ? ` ${userName}` : ''},</p>
          <p>Váš účet na LiquiMixer byl <strong>smazán</strong> z důvodu dlouhodobé neaktivity.</p>
          <p>Všechna vaše data (recepty, produkty, nastavení) byla nenávratně odstraněna.</p>
          <p>Pokud si budete přát znovu využívat LiquiMixer, můžete si kdykoliv vytvořit nový účet na:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.liquimixer.com" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              www.liquimixer.com
            </a>
          </p>
          <p>Děkujeme, že jste používali LiquiMixer!</p>
        </div>
      `
    },
    en: {
      subject: 'LiquiMixer: Your account has been deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">LiquiMixer</h2>
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          <p>Your LiquiMixer account has been <strong>deleted</strong> due to prolonged inactivity.</p>
          <p>All your data (recipes, products, settings) has been permanently removed.</p>
          <p>If you wish to use LiquiMixer again, you can create a new account at:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.liquimixer.com" style="background: linear-gradient(135deg, #ff00ff, #aa00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              www.liquimixer.com
            </a>
          </p>
          <p>Thank you for using LiquiMixer!</p>
        </div>
      `
    }
  }
  
  return translations[locale] || translations['cs']
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
      errors: [] as string[]
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
