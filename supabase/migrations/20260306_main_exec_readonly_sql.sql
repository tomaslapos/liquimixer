-- =============================================
-- CRON: BigData Sync — HLAVNÍ DB (krwdfxnvhnxtkhtkbadi)
-- Spustit v SQL Editoru HLAVNÍHO projektu
-- Denní synchronizace dat z hlavní DB do analytics DB
-- 06.03.2026
-- =============================================

-- CRON job pro bigdata-sync: 1× denně v 03:00 UTC (04:00 CZ)
-- Edge funkce bigdata-sync je deployovaná na hlavním projektu
SELECT cron.unschedule('bigdata-sync-daily')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'bigdata-sync-daily'
);

SELECT cron.schedule(
    'bigdata-sync-daily',
    '0 3 * * *',
    $$
    SELECT net.http_post(
        url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/bigdata-sync',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
        ),
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
