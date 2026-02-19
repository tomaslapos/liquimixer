// ============================================
// EDGE FUNCTION: Contact Form
// Ukládání zpráv do databáze s N8N webhook
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  getCorsHeaders, 
  handleCorsPreflight, 
  checkRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse,
  addRateLimitHeaders 
} from '../_shared/cors.ts'
import { verifyClerkToken } from '../_shared/clerk-jwt.ts'

const N8N_WEBHOOK_URL = Deno.env.get('N8N_CONTACT_WEBHOOK_URL') || ''
const N8N_WEBHOOK_SECRET = Deno.env.get('N8N_WEBHOOK_SECRET') || ''

// Valid categories
const VALID_CATEGORIES = [
  'technical',   // Technický problém / Chyba aplikace
  'payment',     // Platba / Předplatné / Fakturace
  'refund',      // Požadavek na vrácení peněz
  'recipe',      // Dotaz k receptům / Míchání
  'account',     // Můj účet / Přihlášení
  'gdpr',        // GDPR / Smazání údajů
  'suggestion',  // Návrh na vylepšení
  'bug',         // Bug report
  'business',    // Obchodní nabídka
  'partnership', // Affiliate / Partnerství
  'media',       // Média / PR
  'other'        // Jiné
]

// Sanitize input
function sanitizeInput(input: string, maxLength: number = 5000): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, maxLength)
}

// Validate email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
  const rateCheck = checkRateLimit(identifier, 'contact')
  
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetAt, origin)
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { action, data } = await req.json()

    switch (action) {
      // ============================================
      // SUBMIT CONTACT MESSAGE
      // ============================================
      case 'submit': {
        const { email, category, subject, message, locale } = data

        // 1. Validate required fields
        if (!email || !category || !subject || !message) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 2. Validate email
        if (!isValidEmail(email)) {
          return new Response(
            JSON.stringify({ error: 'Invalid email address' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 3. Validate category
        if (!VALID_CATEGORIES.includes(category)) {
          return new Response(
            JSON.stringify({ error: 'Invalid category' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 4. Validate lengths
        const sanitizedSubject = sanitizeInput(subject, 200)
        const sanitizedMessage = sanitizeInput(message, 5000)

        if (sanitizedSubject.length < 3) {
          return new Response(
            JSON.stringify({ error: 'Subject too short (min 3 characters)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (sanitizedMessage.length < 10) {
          return new Response(
            JSON.stringify({ error: 'Message too short (min 10 characters)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 5. Rate limiting by IP
        const ipAddress = req.headers.get('x-forwarded-for') || 
                         req.headers.get('cf-connecting-ip') || 
                         'unknown'
        
        if (!checkRateLimit(ipAddress)) {
          return new Response(
            JSON.stringify({ error: 'Too many messages. Please wait 5 minutes.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 6. Check for logged in user (optional - contact form works without login)
        let clerkId = null
        const clerkToken = req.headers.get('x-clerk-token')
        if (clerkToken) {
          try {
            // Plná verifikace JWT pokud je token přítomen
            const tokenPayload = await verifyClerkToken(clerkToken, {
              authorizedParties: ['https://www.liquimixer.com', 'https://liquimixer.com']
            })
            if (tokenPayload) {
              clerkId = tokenPayload.sub
            }
          } catch {
            // Token verification failed, continue without clerk_id
          }
        }

        // 7. Create message record
        const { data: contactMessage, error } = await supabaseAdmin
          .from('contact_messages')
          .insert({
            clerk_id: clerkId,
            email: sanitizeInput(email, 255),
            category,
            subject: sanitizedSubject,
            message: sanitizedMessage,
            status: 'new',
            priority: ['payment', 'gdpr', 'bug', 'business', 'partnership', 'media'].includes(category) ? 'high' : 'normal',
            ip_address: ipAddress,
            user_agent: req.headers.get('user-agent') || 'unknown',
            locale: locale || 'cs'
          })
          .select()
          .single()

        if (error) {
          console.error('Error saving message:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to save message' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // 8. Send to N8N webhook for AI processing
        if (N8N_WEBHOOK_URL) {
          const webhookData = {
            id: contactMessage.id,
            email: contactMessage.email,
            category: contactMessage.category,
            subject: contactMessage.subject,
            message: contactMessage.message,
            clerkId: contactMessage.clerk_id,
            locale: contactMessage.locale,
            createdAt: contactMessage.created_at,
            secret: N8N_WEBHOOK_SECRET // For webhook authentication
          }

          fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
          }).catch(err => {
            console.error('N8N webhook error:', err)
          })
        }

        // 9. Audit log
        await supabaseAdmin.from('audit_logs').insert({
          clerk_id: clerkId,
          action: 'contact_message_submitted',
          resource_type: 'contact',
          resource_id: contactMessage.id,
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent'),
          details: { category, hasClerkId: !!clerkId },
          success: true
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: contactMessage.id,
            message: 'Message sent successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // GET CATEGORIES (for frontend dropdown)
      // ============================================
      case 'categories': {
        const categories = [
          { id: 'technical', label_cs: 'Technický problém / Chyba aplikace', label_en: 'Technical problem / App error', label_sk: 'Technický problém / Chyba aplikácie' },
          { id: 'payment', label_cs: 'Platba / Předplatné / Fakturace', label_en: 'Payment / Subscription / Billing', label_sk: 'Platba / Predplatné / Fakturácia' },
          { id: 'recipe', label_cs: 'Dotaz k receptům / Míchání', label_en: 'Recipe / Mixing question', label_sk: 'Otázka k receptom / Miešanie' },
          { id: 'account', label_cs: 'Můj účet / Přihlášení', label_en: 'My account / Login', label_sk: 'Môj účet / Prihlásenie' },
          { id: 'suggestion', label_cs: 'Návrh na vylepšení', label_en: 'Improvement suggestion', label_sk: 'Návrh na vylepšenie' },
          { id: 'gdpr', label_cs: 'GDPR / Smazání údajů', label_en: 'GDPR / Data deletion', label_sk: 'GDPR / Zmazanie údajov' },
          { id: 'other', label_cs: 'Jiné', label_en: 'Other', label_sk: 'Iné' }
        ]

        return new Response(
          JSON.stringify({ categories }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // UPDATE MESSAGE STATUS (for N8N callback)
      // ============================================
      case 'update': {
        // Verify N8N webhook secret
        const { secret, messageId, updates } = data
        
        if (secret !== N8N_WEBHOOK_SECRET) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
          n8n_processed: true,
          n8n_processed_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        }

        // Core AI fields
        if (updates.status !== undefined) updateData.status = updates.status
        if (updates.priority !== undefined) updateData.priority = updates.priority
        if (updates.ai_analysis !== undefined) updateData.ai_analysis = updates.ai_analysis
        if (updates.ai_priority !== undefined) updateData.ai_priority = updates.ai_priority
        if (updates.ai_category !== undefined) updateData.ai_category = updates.ai_category
        if (updates.ai_suggested_response !== undefined) updateData.ai_suggested_response = updates.ai_suggested_response
        if (updates.ai_is_refund_request !== undefined) updateData.ai_is_refund_request = updates.ai_is_refund_request
        if (updates.ai_confidence !== undefined) updateData.ai_confidence = updates.ai_confidence
        if (updates.workflow_id !== undefined) updateData.n8n_workflow_id = updates.workflow_id

        // Dashboard / translation fields
        if (updates.detected_language !== undefined) updateData.detected_language = updates.detected_language
        if (updates.subject_cs !== undefined) updateData.subject_cs = updates.subject_cs
        if (updates.message_cs !== undefined) updateData.message_cs = updates.message_cs
        if (updates.ai_sentiment !== undefined) updateData.ai_sentiment = updates.ai_sentiment
        if (updates.ai_notes !== undefined) updateData.ai_notes = updates.ai_notes
        if (updates.ai_auto_resolved !== undefined) updateData.ai_auto_resolved = updates.ai_auto_resolved
        if (updates.ai_response_sent !== undefined) updateData.ai_response_sent = updates.ai_response_sent
        if (updates.is_business_offer !== undefined) updateData.is_business_offer = updates.is_business_offer
        if (updates.thread_id !== undefined) updateData.thread_id = updates.thread_id

        // Admin reply fields (from dashboard)
        if (updates.admin_reply_cs !== undefined) updateData.admin_reply_cs = updates.admin_reply_cs
        if (updates.admin_reply_formatted !== undefined) updateData.admin_reply_formatted = updates.admin_reply_formatted
        if (updates.admin_reply_translated !== undefined) updateData.admin_reply_translated = updates.admin_reply_translated
        if (updates.email_sent_at !== undefined) updateData.email_sent_at = updates.email_sent_at
        if (updates.email_message_id !== undefined) updateData.email_message_id = updates.email_message_id
        if (updates.resolved_at !== undefined) updateData.resolved_at = updates.resolved_at
        if (updates.resolved_by !== undefined) updateData.resolved_by = updates.resolved_by

        const { error } = await supabaseAdmin
          .from('contact_messages')
          .update(updateData)
          .eq('id', messageId)

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to update message' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // If AI detected refund request, create refund request
        if (updates.ai_is_refund_request) {
          const { data: message } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .eq('id', messageId)
            .single()

          if (message && message.clerk_id) {
            // Call refund function to create refund request
            const REFUND_FUNCTION_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/refund`
            fetch(REFUND_FUNCTION_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                action: 'create',
                data: {
                  contactMessageId: messageId,
                  clerkId: message.clerk_id,
                  reason: updates.ai_analysis?.reason || 'AI detected refund request'
                }
              })
            }).catch(err => console.error('Refund creation error:', err))
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Contact error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


















