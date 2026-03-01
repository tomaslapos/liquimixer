-- ============================================
-- CRON JOB: Záložní odesílání neodeslaných faktur
-- Datum: 01.03.2026
-- Spouští invoice edge funkci s akcí 'resendUnsent' každou hodinu
-- Zajišťuje, že žádná faktura nezůstane neodeslána
-- ============================================

-- Zajistit pg_net extension pro HTTP requesty z PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- POZNÁMKA: current_setting('supabase.service_role_key') NEFUNGUJE v kontextu pg_cron!
-- Proto je nutné hardcoded service_role_key přímo v SQL.
-- Tento soubor je POUZE referenční — CRON job se vytváří ručně v SQL Editor.
--
-- SELECT cron.unschedule('resend-unsent-invoices');
-- SELECT cron.schedule(
--   'resend-unsent-invoices',
--   '30 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/invoice',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
--     body := '{"action": "resendUnsent", "data": {}}'::jsonb
--   );
--   $$
-- );
