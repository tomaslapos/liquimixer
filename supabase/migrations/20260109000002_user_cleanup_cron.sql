-- ============================================
-- Migration: Setup CRON job for user cleanup
-- Date: 2026-01-09
-- Description: CRON job pro automatické mazání neaktivních účtů
-- ============================================

-- Povolit pg_cron extension (pokud není povolena)
-- POZOR: V Supabase je pg_cron předinstalován, ale musí být povolen v Dashboard
-- Project Settings -> Extensions -> pg_cron

-- Vytvořit funkci pro volání Edge Function
CREATE OR REPLACE FUNCTION call_user_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response json;
  edge_function_url text;
  service_role_key text;
BEGIN
  -- Získat URL a klíč ze secrets
  edge_function_url := current_setting('app.supabase_url', true) || '/functions/v1/user-cleanup';
  service_role_key := current_setting('app.service_role_key', true);
  
  -- Volat Edge Function
  SELECT content::json INTO response
  FROM http_post(
    edge_function_url,
    '{"action": "run"}',
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer ' || service_role_key)
    ]
  );
  
  -- Logovat výsledek
  INSERT INTO audit_log (action, entity_type, details, created_at)
  VALUES ('user_cleanup_cron', 'system', response::text, NOW());
  
EXCEPTION WHEN OTHERS THEN
  -- Logovat chybu
  INSERT INTO audit_log (action, entity_type, details, created_at)
  VALUES ('user_cleanup_cron_error', 'system', SQLERRM, NOW());
END;
$$;

-- Vytvořit CRON job - spustit každý den v 3:00 ráno
-- POZOR: Tento příkaz funguje pouze pokud je povolena pg_cron extension
-- SELECT cron.schedule(
--   'user-cleanup-daily',           -- Název jobu
--   '0 3 * * *',                     -- Každý den ve 3:00
--   $$SELECT call_user_cleanup()$$
-- );

-- ALTERNATIVA: Použít Supabase Database Webhooks nebo externí CRON službu
-- Doporučujeme nastavit CRON job přes Dashboard:
-- 1. Jít do Database -> Extensions -> Povolit pg_cron
-- 2. Jít do SQL Editor -> Spustit:
--    SELECT cron.schedule('user-cleanup-daily', '0 3 * * *', 'SELECT call_user_cleanup()');

COMMENT ON FUNCTION call_user_cleanup IS 
'Volá Edge Function user-cleanup pro automatické mazání neaktivních účtů. 
Spouštěno denně ve 3:00 přes pg_cron.';
