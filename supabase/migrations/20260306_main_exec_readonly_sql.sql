-- =============================================
-- CRON: BigData Sync — HLAVNÍ DB (krwdfxnvhnxtkhtkbadi)
-- Spustit v SQL Editoru HLAVNÍHO projektu
-- Denní synchronizace dat z hlavní DB do analytics DB
-- 06.03.2026
-- =============================================

-- CRON job pro bigdata-sync: 4× denně každých 6 hodin (01:00, 07:00, 13:00, 19:00 UTC = 02:00, 08:00, 14:00, 20:00 CZ)
-- Edge funkce bigdata-sync je deployovaná na hlavním projektu
SELECT cron.unschedule('bigdata-sync-daily')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'bigdata-sync-daily'
);

SELECT cron.schedule(
    'bigdata-sync-daily',
    '0 1,7,13,19 * * *',
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
