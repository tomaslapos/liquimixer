// ============================================
// EDGE FUNCTION: Reminder Notify
// Odesílání push notifikací pro připomínky zrání liquidů
// Volá se pomocí cron jobu nebo manuálně
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Firebase Server Key pro odesílání push notifikací
const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY') || ''
const FCM_URL = 'https://fcm.googleapis.com/fcm/send'

// Supabase konfigurace
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface Reminder {
  id: string
  recipe_id: string
  clerk_id: string
  mixed_at: string
  remind_at: string
  remind_time: string
  flavor_name: string
  recipe_name: string
  timezone: string
  status: string
}

interface FcmToken {
  id: string
  clerk_id: string
  token: string
}

// Odeslat push notifikaci přes FCM
async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  if (!FIREBASE_SERVER_KEY) {
    console.error('FIREBASE_SERVER_KEY not configured')
    return false
  }
  
  try {
    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          click_action: 'https://www.liquimixer.com/',
        },
        data: {
          ...data,
          tag: 'liquimixer-reminder',
        },
        webpush: {
          fcm_options: {
            link: data.recipeId 
              ? `https://www.liquimixer.com/?viewRecipe=${data.recipeId}`
              : 'https://www.liquimixer.com/',
          },
        },
      }),
    })
    
    const result = await response.json()
    
    if (result.success === 1) {
      console.log('Push notification sent successfully')
      return true
    } else {
      console.error('FCM error:', result)
      return false
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}

// Formátovat datum pro notifikaci
function formatDate(dateStr: string, locale: string = 'cs-CZ'): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Zkontrolovat, zda je nyní správný čas pro odeslání připomínky
function isTimeToSend(reminderTime: string, timezone: string): boolean {
  try {
    const now = new Date()
    
    // Převést na lokální čas uživatele
    const localTime = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
    
    // Porovnat s časem připomínky (formát HH:MM)
    const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number)
    const [currentHour, currentMinute] = localTime.split(':').map(Number)
    
    // Povolit 30 minut tolerance
    const reminderMinutes = reminderHour * 60 + reminderMinute
    const currentMinutes = currentHour * 60 + currentMinute
    
    return Math.abs(currentMinutes - reminderMinutes) <= 30
  } catch (error) {
    console.error('Error checking time:', error)
    // V případě chyby odeslat připomínku
    return true
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Vytvořit Supabase klienta s service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Získat dnešní datum
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`Processing reminders for date: ${today}`)
    
    // Načíst pending připomínky pro dnešek
    const { data: reminders, error: remindersError } = await supabase
      .from('recipe_reminders')
      .select('*')
      .eq('remind_at', today)
      .eq('status', 'pending')
    
    if (remindersError) {
      console.error('Error fetching reminders:', remindersError)
      return new Response(
        JSON.stringify({ error: 'Error fetching reminders', details: remindersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!reminders || reminders.length === 0) {
      console.log('No pending reminders for today')
      return new Response(
        JSON.stringify({ message: 'No pending reminders', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Found ${reminders.length} pending reminders`)
    
    let processedCount = 0
    let sentCount = 0
    const errors: string[] = []
    
    // Zpracovat každou připomínku
    for (const reminder of reminders as Reminder[]) {
      try {
        // Zkontrolovat čas (pokud není správný čas, přeskočit)
        if (!isTimeToSend(reminder.remind_time, reminder.timezone)) {
          console.log(`Skipping reminder ${reminder.id}: not time yet`)
          continue
        }
        
        processedCount++
        
        // Načíst FCM tokeny uživatele
        const { data: tokens, error: tokensError } = await supabase
          .from('fcm_tokens')
          .select('*')
          .eq('clerk_id', reminder.clerk_id)
        
        if (tokensError || !tokens || tokens.length === 0) {
          console.warn(`No FCM tokens for user ${reminder.clerk_id}`)
          errors.push(`No tokens for reminder ${reminder.id}`)
          continue
        }
        
        // Připravit notifikaci
        const title = 'LiquiMixer - Liquid vyzrálý! 🎉'
        const flavorName = reminder.flavor_name || 'váš liquid'
        const mixedDate = formatDate(reminder.mixed_at)
        const body = `Váš liquid s příchutí ${flavorName} namíchaný dne ${mixedDate} je vyzrálý a připraven.`
        
        const notificationData = {
          reminderId: reminder.id,
          recipeId: reminder.recipe_id,
          type: 'maturity_reminder',
        }
        
        // Odeslat notifikaci na všechna zařízení uživatele
        let anySent = false
        for (const tokenRecord of tokens as FcmToken[]) {
          const sent = await sendPushNotification(
            tokenRecord.token,
            title,
            body,
            notificationData
          )
          
          if (sent) {
            anySent = true
          }
        }
        
        // Aktualizovat stav připomínky
        if (anySent) {
          const { error: updateError } = await supabase
            .from('recipe_reminders')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', reminder.id)
          
          if (updateError) {
            console.error(`Error updating reminder ${reminder.id}:`, updateError)
            errors.push(`Update error for ${reminder.id}`)
          } else {
            sentCount++
            console.log(`Reminder ${reminder.id} sent successfully`)
          }
        } else {
          errors.push(`Failed to send reminder ${reminder.id}`)
        }
      } catch (reminderError) {
        console.error(`Error processing reminder ${reminder.id}:`, reminderError)
        errors.push(`Processing error for ${reminder.id}: ${reminderError}`)
      }
    }
    
    const response = {
      message: 'Reminders processed',
      date: today,
      found: reminders.length,
      processed: processedCount,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    }
    
    console.log('Processing complete:', response)
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

