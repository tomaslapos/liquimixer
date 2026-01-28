-- ============================================
-- CRON JOB PRO ODESÍLÁNÍ PŘIPOMÍNEK ZRÁNÍ
-- ============================================
-- Tento skript nastaví automatické volání reminder-notify edge function
-- Spouští se každý den v 09:00 UTC (10:00 CET zimní čas, 11:00 CEST letní čas)
-- 
-- PŘED SPUŠTĚNÍM:
-- 1. Ujistěte se, že máte povolenou pg_cron extension (Database → Extensions → pg_cron → Enable)
-- 2. Ujistěte se, že máte povolenou pg_net extension (pro HTTP requesty)
-- 3. Nastavte service_role_key v app.settings (viz níže)
--
-- SPUSTIT V SUPABASE SQL EDITOR
-- ============================================

-- Odstranit existující job pokud existuje
SELECT cron.unschedule('send-maturity-reminders') 
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'send-maturity-reminders'
);

-- Vytvořit nový CRON job
-- Volá reminder-notify edge function každý den v 09:00 UTC
-- 
-- DŮLEŽITÉ: Service role key musí být uložen v Vault a načten pomocí:
-- SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
--
-- POSTUP NASTAVENÍ:
-- 1. V Supabase Dashboard → Settings → Vault → New Secret
-- 2. Name: service_role_key
-- 3. Value: [váš nový service_role_key z Settings → API]
-- 4. Pak spusťte tento SQL s vault referencí:
--
-- SELECT cron.schedule(
--     'send-maturity-reminders',
--     '0 9 * * *',
--     $$
--     SELECT net.http_post(
--         url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/reminder-notify',
--         headers := jsonb_build_object(
--             'Content-Type', 'application/json',
--             'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
--         ),
--         body := '{}'::jsonb
--     ) AS request_id;
--     $$
-- );
--
-- ALTERNATIVA: Použít ANON key pokud reminder-notify má verify_jwt = false

SELECT cron.schedule(
    'send-maturity-reminders',           -- název jobu
    '0 9 * * *',                          -- každý den v 09:00 UTC
    $$
    SELECT net.http_post(
        url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/reminder-notify',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
        ),
        body := '{}'::jsonb
    ) AS request_id;
    $$
);

-- Ověřit, že job byl vytvořen
SELECT jobid, jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'send-maturity-reminders';

-- ============================================
-- POZNÁMKY K NASTAVENÍ
-- ============================================
-- 
-- 1. SCHEDULE FORMÁT: '0 9 * * *'
--    - 0 = minuta (0-59)
--    - 9 = hodina (0-23, UTC!)
--    - * = den v měsíci (1-31)
--    - * = měsíc (1-12)
--    - * = den v týdnu (0-7, 0 a 7 = neděle)
--
-- 2. PRO TESTOVÁNÍ můžete nastavit kratší interval:
--    '*/5 * * * *' = každých 5 minut
--    '0 * * * *' = každou hodinu
--
-- 3. MANUÁLNÍ SPUŠTĚNÍ pro test:
--    SELECT cron.schedule('test-reminder-now', '* * * * *', $$ ... $$);
--    -- počkat minutu
--    SELECT cron.unschedule('test-reminder-now');
--
-- 4. ZOBRAZIT HISTORII SPUŠTĚNÍ:
--    SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- 5. SMAZAT JOB:
--    SELECT cron.unschedule('send-maturity-reminders');
-- ============================================
