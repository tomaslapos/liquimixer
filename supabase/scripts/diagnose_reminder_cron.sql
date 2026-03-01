-- ============================================
-- DIAGNOSTIKA: Reminder CRON job + pending remindery
-- Spusťte v Supabase Dashboard → SQL Editor
-- Datum: 28.02.2026
-- ============================================

-- 1. Zkontrolovat pg_cron extension
SELECT 'pg_cron extension' AS check_name, 
       CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'CHYBÍ!' END AS status
FROM pg_extension WHERE extname = 'pg_cron';

-- 2. Zobrazit VŠECHNY CRON joby (hledat reminder-notify)
SELECT jobid, schedule, command, nodename, active,
       CASE WHEN active THEN 'AKTIVNÍ' ELSE 'NEAKTIVNÍ!' END AS stav
FROM cron.job 
ORDER BY jobid;

-- 3. Historie posledních 30 spuštění CRON jobů (hledat chyby)
SELECT j.command AS cron_command,
       d.runid, 
       d.status,
       d.return_message,
       d.start_time,
       d.end_time,
       (d.end_time - d.start_time) AS duration
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
ORDER BY d.start_time DESC 
LIMIT 30;

-- 4. Pending remindery které MĚLY být odeslány (remind_at <= dnes, sent_at IS NULL)
SELECT id, clerk_id, recipe_name, flavor_name, 
       mixed_at, remind_at, remind_time, 
       status, sent_at, consumed_at, stock_percent,
       timezone
FROM recipe_reminders 
WHERE status = 'pending' 
  AND remind_at <= CURRENT_DATE
  AND consumed_at IS NULL
  AND sent_at IS NULL
ORDER BY remind_at DESC;

-- 5. Všechny remindery (posledních 20) pro přehled stavů
SELECT id, clerk_id, recipe_name, flavor_name,
       remind_at, status, sent_at, consumed_at, stock_percent,
       created_at
FROM recipe_reminders
ORDER BY created_at DESC
LIMIT 20;

-- 6. FCM tokeny — kolik uživatelů má aktivní tokeny
SELECT clerk_id, COUNT(*) AS token_count, 
       MAX(updated_at) AS last_updated
FROM fcm_tokens
GROUP BY clerk_id
ORDER BY last_updated DESC
LIMIT 10;

-- 7. Kontrola: existují FCM tokeny pro uživatele s pending remindery?
SELECT r.clerk_id, r.recipe_name, r.remind_at, r.status,
       COUNT(t.token) AS fcm_token_count
FROM recipe_reminders r
LEFT JOIN fcm_tokens t ON t.clerk_id = r.clerk_id
WHERE r.status = 'pending'
  AND r.remind_at <= CURRENT_DATE
  AND r.consumed_at IS NULL
  AND r.sent_at IS NULL
GROUP BY r.id, r.clerk_id, r.recipe_name, r.remind_at, r.status;

-- 8. Kontrola constraint na status sloupci
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'recipe_reminders'::regclass 
  AND conname LIKE '%status%';
