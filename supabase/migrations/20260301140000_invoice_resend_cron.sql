-- ============================================
-- CRON JOB: Záložní odesílání neodeslaných faktur
-- Datum: 01.03.2026
-- Spouští invoice edge funkci s akcí 'resendUnsent' každou hodinu
-- Zajišťuje, že žádná faktura nezůstane neodeslána
-- ============================================

-- Zajistit pg_net extension pro HTTP requesty z PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Vytvořit CRON job pro resend neodeslaných faktur (každou hodinu v :30)
-- Používá pg_net pro HTTP POST volání invoice edge funkce
SELECT cron.schedule(
  'resend-unsent-invoices',
  '30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/invoice',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body := '{"action": "resendUnsent", "data": {}}'::jsonb
  );
  $$
);

-- POZNÁMKA: Pokud current_setting('supabase.service_role_key') nefunguje,
-- je potřeba nastavit CRON job ručně v Supabase Dashboard → SQL Editor:
--
-- Alternativní verze s hardcoded URL (pro ruční spuštění v SQL Editor):
--
-- SELECT cron.schedule(
--   'resend-unsent-invoices',
--   '30 * * * *',
--   $$
--   SELECT net.http_post(
--     url := '<SUPABASE_URL>/functions/v1/invoice'::text,
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
--     body := '{"action": "resendUnsent", "data": {}}'::jsonb
--   );
--   $$
-- );
