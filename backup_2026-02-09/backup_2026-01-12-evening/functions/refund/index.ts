// ============================================
// EDGE FUNCTION: Refund Operations
// Polo-automatické vrácení plateb s AI analýzou
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

// GP webpay konfigurace pro refund
const GPWEBPAY_CONFIG = {
  merchantNumber: Deno.env.get('GPWEBPAY_MERCHANT_NUMBER') || '',
  refundUrl: Deno.env.get('GPWEBPAY_REFUND_URL') || 'https://test.3dsecure.gpwebpay.com/pgw/order.do',
  privateKey: Deno.env.get('GPWEBPAY_PRIVATE_KEY') || '',
  privateKeyPassword: Deno.env.get('GPWEBPAY_PRIVATE_KEY_PASSWORD') || '',
}

const N8N_WEBHOOK_URL = Deno.env.get('N8N_REFUND_WEBHOOK_URL') || ''
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || ''
const REFUND_PERIOD_DAYS = 14

// Audit logging helper
async function logAudit(supabase: any, clerkId: string | null, action: string, resourceType: string, resourceId: string | null, details: any, success: boolean, errorMessage?: string, req?: Request) {
  try {
    await supabase.from('audit_logs').insert({
      clerk_id: clerkId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req?.headers.get('user-agent') || 'unknown',
      details,
      success,
      error_message: errorMessage,
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

// Generate secure approval token
function generateApprovalToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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
  const rateCheck = checkRateLimit(identifier, 'refund')
  
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
      // CREATE REFUND REQUEST (from contact message)
      // ============================================
      case 'create': {
        const { contactMessageId, clerkId, reason } = data

        // Get contact message
        const { data: message } = await supabaseAdmin
          .from('contact_messages')
          .select('*')
          .eq('id', contactMessageId)
          .single()

        if (!message) {
          return new Response(
            JSON.stringify({ error: 'Message not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get user's active subscription
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('*, payments(*)')
          .eq('clerk_id', clerkId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!subscription) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get latest payment for this subscription
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('subscription_id', subscription.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        if (!payment) {
          return new Response(
            JSON.stringify({ error: 'No payment found for subscription' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Calculate payment age
        const paymentDate = new Date(payment.completed_at)
        const now = new Date()
        const paymentAgeDays = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
        const isWithinRefundPeriod = paymentAgeDays <= REFUND_PERIOD_DAYS

        // Check for previous refunds
        const { count: previousRefunds } = await supabaseAdmin
          .from('refund_requests')
          .select('*', { count: 'exact', head: true })
          .eq('clerk_id', clerkId)
          .eq('status', 'completed')

        // Generate approval token
        const approvalToken = generateApprovalToken()
        const tokenExpiresAt = new Date()
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24) // 24 hour expiry

        // Create refund request
        const { data: refundRequest, error } = await supabaseAdmin
          .from('refund_requests')
          .insert({
            contact_message_id: contactMessageId,
            subscription_id: subscription.id,
            clerk_id: clerkId,
            original_order_number: payment.order_number,
            original_transaction_id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'pending_review',
            payment_age_days: paymentAgeDays,
            is_within_refund_period: isWithinRefundPeriod,
            previous_refunds_count: previousRefunds || 0,
            approval_token: approvalToken,
            approval_token_expires_at: tokenExpiresAt.toISOString(),
            ai_reason: reason
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating refund request:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create refund request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send to N8N for AI analysis and notification
        if (N8N_WEBHOOK_URL) {
          fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'refund_request',
              refundRequest,
              subscription,
              payment,
              message,
              approveUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/refund?action=approve&token=${approvalToken}`,
              rejectUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/refund?action=reject&token=${approvalToken}`
            })
          }).catch(err => console.error('N8N webhook error:', err))
        }

        await logAudit(supabaseAdmin, clerkId, 'refund_request_created', 'refund', refundRequest.id, {
          amount: payment.amount,
          currency: payment.currency,
          paymentAgeDays,
          isWithinRefundPeriod
        }, true, undefined, req)

        return new Response(
          JSON.stringify({ 
            success: true, 
            refundId: refundRequest.id,
            status: 'pending_review'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // APPROVE REFUND (admin action via secure link)
      // ============================================
      case 'approve': {
        const { token, adminId } = data

        // Find refund request by token
        const { data: refundRequest } = await supabaseAdmin
          .from('refund_requests')
          .select('*')
          .eq('approval_token', token)
          .single()

        if (!refundRequest) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired approval token' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if token expired
        if (new Date(refundRequest.approval_token_expires_at) < new Date()) {
          return new Response(
            JSON.stringify({ error: 'Approval token has expired' }),
            { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if already processed
        if (refundRequest.status !== 'pending_review' && refundRequest.status !== 'pending_approval') {
          return new Response(
            JSON.stringify({ error: 'Refund request already processed', status: refundRequest.status }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update status to approved
        await supabaseAdmin
          .from('refund_requests')
          .update({
            status: 'approved',
            approved_by: adminId || 'admin',
            approved_at: new Date().toISOString(),
            approval_token: null // Invalidate token
          })
          .eq('id', refundRequest.id)

        // Process refund via GP webpay (in background)
        processGPWebpayRefund(supabaseAdmin, refundRequest).catch(err => {
          console.error('GP webpay refund error:', err)
        })

        await logAudit(supabaseAdmin, refundRequest.clerk_id, 'refund_approved', 'refund', refundRequest.id, {
          approvedBy: adminId || 'admin',
          amount: refundRequest.amount
        }, true, undefined, req)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Refund approved and processing',
            refundId: refundRequest.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // REJECT REFUND
      // ============================================
      case 'reject': {
        const { token, reason, adminId } = data

        const { data: refundRequest } = await supabaseAdmin
          .from('refund_requests')
          .select('*')
          .eq('approval_token', token)
          .single()

        if (!refundRequest) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired token' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        await supabaseAdmin
          .from('refund_requests')
          .update({
            status: 'rejected',
            rejection_reason: reason || 'Rejected by admin',
            approved_by: adminId || 'admin',
            approval_token: null
          })
          .eq('id', refundRequest.id)

        await logAudit(supabaseAdmin, refundRequest.clerk_id, 'refund_rejected', 'refund', refundRequest.id, {
          rejectedBy: adminId || 'admin',
          reason: reason || 'No reason provided'
        }, true, undefined, req)

        return new Response(
          JSON.stringify({ success: true, message: 'Refund rejected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ============================================
      // GET REFUND STATUS (for user)
      // ============================================
      case 'status': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token.split('.')[1]))
        const clerkId = payload.sub

        const { data: refunds } = await supabaseAdmin
          .from('refund_requests')
          .select('id, status, amount, currency, created_at, refunded_at')
          .eq('clerk_id', clerkId)
          .order('created_at', { ascending: false })
          .limit(10)

        return new Response(
          JSON.stringify({ refunds: refunds || [] }),
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
    console.error('Refund error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Process GP webpay CREDIT operation
async function processGPWebpayRefund(supabase: any, refundRequest: any): Promise<void> {
  try {
    // Update status to processing
    await supabase
      .from('refund_requests')
      .update({ status: 'processing' })
      .eq('id', refundRequest.id)

    // TODO: Implement actual GP webpay CREDIT API call
    // This requires RSA signing similar to payment creation
    
    // For now, simulate successful refund
    const refundTransactionId = `REF${Date.now()}`

    // Update refund request
    await supabase
      .from('refund_requests')
      .update({
        status: 'completed',
        refund_transaction_id: refundTransactionId,
        refunded_at: new Date().toISOString(),
        refund_response: { simulated: true }
      })
      .eq('id', refundRequest.id)

    // Update payment
    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundRequest.amount,
        refund_id: refundRequest.id
      })
      .eq('order_number', refundRequest.original_order_number)

    // Deactivate subscription
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'refunded'
      })
      .eq('id', refundRequest.subscription_id)

    // Update user
    await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        subscription_tier: 'free'
      })
      .eq('clerk_id', refundRequest.clerk_id)

    // Log audit
    await supabase.from('audit_logs').insert({
      clerk_id: refundRequest.clerk_id,
      action: 'refund_completed',
      resource_type: 'refund',
      resource_id: refundRequest.id,
      details: {
        amount: refundRequest.amount,
        currency: refundRequest.currency,
        refundTransactionId
      },
      success: true
    })

    console.log('Refund completed:', refundRequest.id)

  } catch (error) {
    console.error('GP webpay refund processing error:', error)
    
    await supabase
      .from('refund_requests')
      .update({
        status: 'failed',
        refund_response: { error: error.message }
      })
      .eq('id', refundRequest.id)

    await supabase.from('audit_logs').insert({
      clerk_id: refundRequest.clerk_id,
      action: 'refund_failed',
      resource_type: 'refund',
      resource_id: refundRequest.id,
      details: { error: error.message },
      success: false,
      error_message: error.message
    })
  }
}


















