// ============================================
// EDGE FUNCTION: GDPR Confirm / Cancel
// Zpracování potvrzení nebo zrušení GDPR smazání účtu
// GET ?token=XXX&action=delete|cancel
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Clerk Backend API
const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY') || ''
const CLERK_API_URL = 'https://api.clerk.com/v1'

// GDPR HTML page translations (key languages + fallback to English)
const GDPR_TRANSLATIONS: Record<string, {
  deleted_title: string
  deleted_heading: string
  deleted_message: string
  deleted_detail: string
  cancelled_title: string
  cancelled_heading: string
  cancelled_message: string
  cancelled_detail: string
  error_title: string
  error_heading: string
  expired_heading: string
  expired_message: string
  invalid_heading: string
  invalid_message: string
  already_used_heading: string
  already_used_message: string
  back_link: string
  footer: string
}> = {
  cs: {
    deleted_title: 'Účet smazán — LiquiMixer',
    deleted_heading: 'Váš účet byl smazán',
    deleted_message: 'Všechna vaše data byla nenávratně odstraněna v souladu s GDPR.',
    deleted_detail: 'Smazáno: recepty, produkty, připomínky, předplatné a osobní údaje.',
    cancelled_title: 'Účet zachován — LiquiMixer',
    cancelled_heading: 'Váš účet zůstává aktivní',
    cancelled_message: 'Požadavek na smazání byl zrušen. Váš účet a všechna data zůstávají beze změny.',
    cancelled_detail: 'Děkujeme, že zůstáváte s LiquiMixer!',
    error_title: 'Chyba — LiquiMixer',
    error_heading: 'Nastala chyba',
    expired_heading: 'Odkaz vypršel',
    expired_message: 'Platnost tohoto odkazu vypršela (24 hodin). Pokud si stále přejete smazat účet, podejte nový požadavek.',
    invalid_heading: 'Neplatný odkaz',
    invalid_message: 'Tento odkaz je neplatný nebo byl již použit.',
    already_used_heading: 'Odkaz již byl použit',
    already_used_message: 'Tento požadavek již byl zpracován.',
    back_link: 'Zpět na LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  sk: {
    deleted_title: 'Účet zmazaný — LiquiMixer',
    deleted_heading: 'Váš účet bol zmazaný',
    deleted_message: 'Všetky vaše dáta boli nenávratne odstránené v súlade s GDPR.',
    deleted_detail: 'Zmazané: recepty, produkty, pripomienky, predplatné a osobné údaje.',
    cancelled_title: 'Účet zachovaný — LiquiMixer',
    cancelled_heading: 'Váš účet zostáva aktívny',
    cancelled_message: 'Požiadavka na zmazanie bola zrušená. Váš účet a všetky dáta zostávajú bez zmeny.',
    cancelled_detail: 'Ďakujeme, že zostávate s LiquiMixer!',
    error_title: 'Chyba — LiquiMixer',
    error_heading: 'Nastala chyba',
    expired_heading: 'Odkaz vypršal',
    expired_message: 'Platnosť tohto odkazu vypršala (24 hodín). Ak si stále prajete zmazať účet, podajte novú požiadavku.',
    invalid_heading: 'Neplatný odkaz',
    invalid_message: 'Tento odkaz je neplatný alebo bol už použitý.',
    already_used_heading: 'Odkaz už bol použitý',
    already_used_message: 'Táto požiadavka už bola spracovaná.',
    back_link: 'Späť na LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  en: {
    deleted_title: 'Account Deleted — LiquiMixer',
    deleted_heading: 'Your account has been deleted',
    deleted_message: 'All your data has been permanently removed in compliance with GDPR.',
    deleted_detail: 'Deleted: recipes, products, reminders, subscriptions and personal data.',
    cancelled_title: 'Account Kept — LiquiMixer',
    cancelled_heading: 'Your account remains active',
    cancelled_message: 'The deletion request has been cancelled. Your account and all data remain unchanged.',
    cancelled_detail: 'Thank you for staying with LiquiMixer!',
    error_title: 'Error — LiquiMixer',
    error_heading: 'An error occurred',
    expired_heading: 'Link expired',
    expired_message: 'This link has expired (24 hours). If you still wish to delete your account, please submit a new request.',
    invalid_heading: 'Invalid link',
    invalid_message: 'This link is invalid or has already been used.',
    already_used_heading: 'Link already used',
    already_used_message: 'This request has already been processed.',
    back_link: 'Back to LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  de: {
    deleted_title: 'Konto gelöscht — LiquiMixer',
    deleted_heading: 'Ihr Konto wurde gelöscht',
    deleted_message: 'Alle Ihre Daten wurden gemäß DSGVO dauerhaft entfernt.',
    deleted_detail: 'Gelöscht: Rezepte, Produkte, Erinnerungen, Abonnements und persönliche Daten.',
    cancelled_title: 'Konto beibehalten — LiquiMixer',
    cancelled_heading: 'Ihr Konto bleibt aktiv',
    cancelled_message: 'Der Löschantrag wurde storniert. Ihr Konto und alle Daten bleiben unverändert.',
    cancelled_detail: 'Danke, dass Sie bei LiquiMixer bleiben!',
    error_title: 'Fehler — LiquiMixer',
    error_heading: 'Ein Fehler ist aufgetreten',
    expired_heading: 'Link abgelaufen',
    expired_message: 'Dieser Link ist abgelaufen (24 Stunden). Wenn Sie Ihr Konto weiterhin löschen möchten, stellen Sie bitte einen neuen Antrag.',
    invalid_heading: 'Ungültiger Link',
    invalid_message: 'Dieser Link ist ungültig oder wurde bereits verwendet.',
    already_used_heading: 'Link bereits verwendet',
    already_used_message: 'Dieser Antrag wurde bereits bearbeitet.',
    back_link: 'Zurück zu LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  fr: {
    deleted_title: 'Compte supprimé — LiquiMixer',
    deleted_heading: 'Votre compte a été supprimé',
    deleted_message: 'Toutes vos données ont été définitivement supprimées conformément au RGPD.',
    deleted_detail: 'Supprimé : recettes, produits, rappels, abonnements et données personnelles.',
    cancelled_title: 'Compte conservé — LiquiMixer',
    cancelled_heading: 'Votre compte reste actif',
    cancelled_message: 'La demande de suppression a été annulée. Votre compte et toutes vos données restent inchangés.',
    cancelled_detail: 'Merci de rester avec LiquiMixer !',
    error_title: 'Erreur — LiquiMixer',
    error_heading: 'Une erreur est survenue',
    expired_heading: 'Lien expiré',
    expired_message: 'Ce lien a expiré (24 heures). Si vous souhaitez toujours supprimer votre compte, veuillez soumettre une nouvelle demande.',
    invalid_heading: 'Lien invalide',
    invalid_message: 'Ce lien est invalide ou a déjà été utilisé.',
    already_used_heading: 'Lien déjà utilisé',
    already_used_message: 'Cette demande a déjà été traitée.',
    back_link: 'Retour à LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  es: {
    deleted_title: 'Cuenta eliminada — LiquiMixer',
    deleted_heading: 'Tu cuenta ha sido eliminada',
    deleted_message: 'Todos tus datos han sido eliminados permanentemente de acuerdo con el RGPD.',
    deleted_detail: 'Eliminado: recetas, productos, recordatorios, suscripciones y datos personales.',
    cancelled_title: 'Cuenta conservada — LiquiMixer',
    cancelled_heading: 'Tu cuenta sigue activa',
    cancelled_message: 'La solicitud de eliminación ha sido cancelada. Tu cuenta y todos tus datos permanecen sin cambios.',
    cancelled_detail: '¡Gracias por quedarte con LiquiMixer!',
    error_title: 'Error — LiquiMixer',
    error_heading: 'Se produjo un error',
    expired_heading: 'Enlace caducado',
    expired_message: 'Este enlace ha caducado (24 horas). Si aún deseas eliminar tu cuenta, envía una nueva solicitud.',
    invalid_heading: 'Enlace inválido',
    invalid_message: 'Este enlace es inválido o ya ha sido utilizado.',
    already_used_heading: 'Enlace ya utilizado',
    already_used_message: 'Esta solicitud ya ha sido procesada.',
    back_link: 'Volver a LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  ru: {
    deleted_title: 'Аккаунт удалён — LiquiMixer',
    deleted_heading: 'Ваш аккаунт был удалён',
    deleted_message: 'Все ваши данные были безвозвратно удалены в соответствии с GDPR.',
    deleted_detail: 'Удалено: рецепты, продукты, напоминания, подписки и личные данные.',
    cancelled_title: 'Аккаунт сохранён — LiquiMixer',
    cancelled_heading: 'Ваш аккаунт остаётся активным',
    cancelled_message: 'Запрос на удаление был отменён. Ваш аккаунт и все данные остаются без изменений.',
    cancelled_detail: 'Спасибо, что остаётесь с LiquiMixer!',
    error_title: 'Ошибка — LiquiMixer',
    error_heading: 'Произошла ошибка',
    expired_heading: 'Ссылка истекла',
    expired_message: 'Срок действия этой ссылки истёк (24 часа). Если вы всё ещё хотите удалить аккаунт, отправьте новый запрос.',
    invalid_heading: 'Недействительная ссылка',
    invalid_message: 'Эта ссылка недействительна или уже была использована.',
    already_used_heading: 'Ссылка уже использована',
    already_used_message: 'Этот запрос уже был обработан.',
    back_link: 'Вернуться на LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  },
  pl: {
    deleted_title: 'Konto usunięte — LiquiMixer',
    deleted_heading: 'Twoje konto zostało usunięte',
    deleted_message: 'Wszystkie Twoje dane zostały trwale usunięte zgodnie z RODO.',
    deleted_detail: 'Usunięto: przepisy, produkty, przypomnienia, subskrypcje i dane osobowe.',
    cancelled_title: 'Konto zachowane — LiquiMixer',
    cancelled_heading: 'Twoje konto pozostaje aktywne',
    cancelled_message: 'Żądanie usunięcia zostało anulowane. Twoje konto i wszystkie dane pozostają bez zmian.',
    cancelled_detail: 'Dziękujemy, że zostajesz z LiquiMixer!',
    error_title: 'Błąd — LiquiMixer',
    error_heading: 'Wystąpił błąd',
    expired_heading: 'Link wygasł',
    expired_message: 'Ten link wygasł (24 godziny). Jeśli nadal chcesz usunąć konto, złóż nowe żądanie.',
    invalid_heading: 'Nieprawidłowy link',
    invalid_message: 'Ten link jest nieprawidłowy lub został już użyty.',
    already_used_heading: 'Link już użyty',
    already_used_message: 'To żądanie zostało już przetworzone.',
    back_link: 'Powrót do LiquiMixer',
    footer: '© 2026 LiquiMixer — WOOs, s. r. o.'
  }
}

// Get translations with fallback to English
function getTranslations(lang: string) {
  return GDPR_TRANSLATIONS[lang] || GDPR_TRANSLATIONS['en']
}

// Generate HTML response page
function generateHtmlPage(
  title: string,
  heading: string,
  message: string,
  detail: string,
  isSuccess: boolean,
  isError: boolean,
  backLink: string,
  footer: string
): string {
  const iconColor = isError ? '#ff4444' : (isSuccess ? '#00ff88' : '#ffaa00')
  const icon = isError ? '✕' : (isSuccess ? '✓' : '⚠')
  const bgGradient = isError 
    ? 'linear-gradient(135deg, #1a0000, #0a0a15)' 
    : (isSuccess 
      ? 'linear-gradient(135deg, #001a0a, #0a0a15)' 
      : 'linear-gradient(135deg, #1a1a00, #0a0a15)')

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${bgGradient};
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      text-align: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 40px 30px;
      backdrop-filter: blur(10px);
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid ${iconColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      color: ${iconColor};
    }
    h1 {
      font-size: 24px;
      margin-bottom: 16px;
      color: ${iconColor};
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #cccccc;
      margin-bottom: 12px;
    }
    .detail {
      font-size: 14px;
      color: #999999;
      margin-bottom: 30px;
    }
    .back-link {
      display: inline-block;
      background: linear-gradient(135deg, #ff00ff, #aa00ff);
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .back-link:hover { opacity: 0.85; }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666666;
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">LiquiMixer</div>
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p class="message">${message}</p>
    <p class="detail">${detail}</p>
    <a href="https://www.liquimixer.com" class="back-link">${backLink}</a>
    <p class="footer">${footer}</p>
  </div>
</body>
</html>`
}

// Delete Clerk user via Backend API
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
    
    if (response.ok || response.status === 404) {
      // 404 = user already deleted, that's fine
      console.log(`Clerk user ${clerkId} deleted (status: ${response.status})`)
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

// ============================================
// HLAVNÍ HANDLER
// ============================================

serve(async (req) => {
  // Only GET requests
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const action = url.searchParams.get('action')
  const lang = url.searchParams.get('lang') || 'en'
  const t = getTranslations(lang)

  // Validate parameters
  if (!token || !action || !['delete', 'cancel'].includes(action)) {
    return new Response(
      generateHtmlPage(
        t.error_title, t.invalid_heading, t.invalid_message, '',
        false, true, t.back_link, t.footer
      ),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return new Response(
      generateHtmlPage(
        t.error_title, t.invalid_heading, t.invalid_message, '',
        false, true, t.back_link, t.footer
      ),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Initialize Supabase with service role (bypasses RLS)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // 1. Find GDPR request by token
    const { data: gdprRequest, error: fetchError } = await supabaseAdmin
      .from('gdpr_deletion_requests')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !gdprRequest) {
      console.error('GDPR request not found for token:', token)
      return new Response(
        generateHtmlPage(
          t.error_title, t.invalid_heading, t.invalid_message, '',
          false, true, t.back_link, t.footer
        ),
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 2. Check if already processed
    if (gdprRequest.status !== 'pending') {
      return new Response(
        generateHtmlPage(
          t.error_title, t.already_used_heading, t.already_used_message, '',
          false, false, t.back_link, t.footer
        ),
        { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 3. Check expiration (24 hours)
    const expiresAt = new Date(gdprRequest.expires_at)
    if (expiresAt < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from('gdpr_deletion_requests')
        .update({ status: 'expired' })
        .eq('id', gdprRequest.id)

      return new Response(
        generateHtmlPage(
          t.error_title, t.expired_heading, t.expired_message, '',
          false, false, t.back_link, t.footer
        ),
        { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const clerkId = gdprRequest.clerk_id
    const userEmail = gdprRequest.email

    // ============================================
    // ACTION: CANCEL — Keep account
    // ============================================
    if (action === 'cancel') {
      // Update GDPR request status
      await supabaseAdmin
        .from('gdpr_deletion_requests')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', gdprRequest.id)

      // Update contact message status if linked
      if (gdprRequest.contact_message_id) {
        await supabaseAdmin
          .from('contact_messages')
          .update({ 
            status: 'auto_resolved',
            resolved_at: new Date().toISOString(),
            ai_notes: (gdprRequest.ai_notes || '') + '\n[GDPR] Uživatel zrušil požadavek na smazání účtu.'
          })
          .eq('id', gdprRequest.contact_message_id)
      }

      // Audit log
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          clerk_id: clerkId,
          action: 'gdpr_deletion_cancelled',
          resource_type: 'gdpr_deletion_requests',
          resource_id: gdprRequest.id,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          details: { email: userEmail, token: token },
          success: true
        })

      console.log(`GDPR deletion CANCELLED for ${clerkId} (${userEmail})`)

      return new Response(
        generateHtmlPage(
          t.cancelled_title, t.cancelled_heading, t.cancelled_message, t.cancelled_detail,
          true, false, t.back_link, t.footer
        ),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // ============================================
    // ACTION: DELETE — Delete account and all data
    // ============================================
    const deletionLog: Record<string, number> = {}

    // 4a. Delete recipes
    const { data: deletedRecipes } = await supabaseAdmin
      .from('recipes')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.recipes = deletedRecipes?.length || 0

    // 4b. Delete favorite products
    const { data: deletedProducts } = await supabaseAdmin
      .from('favorite_products')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.favorite_products = deletedProducts?.length || 0

    // 4c. Delete reminders
    const { data: deletedReminders } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.reminders = deletedReminders?.length || 0

    // 4d. Delete FCM tokens
    const { data: deletedFcmTokens } = await supabaseAdmin
      .from('fcm_tokens')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.fcm_tokens = deletedFcmTokens?.length || 0

    // 4e. Delete subscriptions
    const { data: deletedSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.subscriptions = deletedSubscriptions?.length || 0

    // 4f. Delete payments
    const { data: deletedPayments } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.payments = deletedPayments?.length || 0

    // 4g. Anonymize contact messages (keep for audit, remove PII)
    const { data: anonymizedMessages } = await supabaseAdmin
      .from('contact_messages')
      .update({
        clerk_id: null,
        email: `deleted_${gdprRequest.id.substring(0, 8)}@anonymized.local`,
        status: 'closed',
        resolved_at: new Date().toISOString(),
        ai_notes: '[GDPR] Účet smazán na žádost uživatele. Osobní údaje anonymizovány.'
      })
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.contact_messages_anonymized = anonymizedMessages?.length || 0

    // 4h. Delete user record
    const { data: deletedUser } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.users = deletedUser?.length || 0

    // 5. Delete Clerk account
    const clerkDeleted = await deleteClerkUser(clerkId)
    deletionLog.clerk_deleted = clerkDeleted ? 1 : 0

    // 6. Update GDPR request
    await supabaseAdmin
      .from('gdpr_deletion_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        deleted_data: deletionLog
      })
      .eq('id', gdprRequest.id)

    // 7. Audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        clerk_id: clerkId,
        action: 'gdpr_account_deleted',
        resource_type: 'gdpr_deletion_requests',
        resource_id: gdprRequest.id,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: {
          email: userEmail,
          token: token,
          deletion_log: deletionLog,
          clerk_deleted: clerkDeleted
        },
        success: true
      })

    console.log(`GDPR account DELETED for ${clerkId} (${userEmail}):`, deletionLog)

    return new Response(
      generateHtmlPage(
        t.deleted_title, t.deleted_heading, t.deleted_message, t.deleted_detail,
        true, false, t.back_link, t.footer
      ),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )

  } catch (error) {
    console.error('GDPR confirm error:', error)

    // Audit log for error
    try {
      const supabaseAdmin2 = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await supabaseAdmin2
        .from('audit_logs')
        .insert({
          action: 'gdpr_confirm_error',
          resource_type: 'gdpr_deletion_requests',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          details: { token, action, error: error.message },
          success: false,
          error_message: error.message
        })
    } catch (_) {
      // Ignore audit log errors
    }

    return new Response(
      generateHtmlPage(
        t.error_title, t.error_heading, error.message || 'Internal server error', '',
        false, true, t.back_link, t.footer
      ),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
})
