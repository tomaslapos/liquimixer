-- ============================================
-- DIAGNOSTIKA: FCM tokeny a push notifikace
-- Spusťte v Supabase Dashboard → SQL Editor
-- Datum: 04.03.2026
-- ============================================

-- 1. Existuje tabulka fcm_tokens?
SELECT 'fcm_tokens table' AS check_name,
       CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING!' END AS status
FROM information_schema.tables 
WHERE table_name = 'fcm_tokens';

-- 2. Struktura tabulky fcm_tokens
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fcm_tokens'
ORDER BY ordinal_position;

-- 3. Constraints na fcm_tokens
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'fcm_tokens';

-- 4. RLS status na fcm_tokens
SELECT relname, 
       relrowsecurity AS rls_enabled, 
       relforcerowsecurity AS rls_forced
FROM pg_class 
WHERE relname = 'fcm_tokens';

-- 5. RLS policies na fcm_tokens (KLÍČOVÉ!)
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'fcm_tokens';

-- 6. Kolik FCM tokenů existuje celkem?
SELECT count(*) AS total_fcm_tokens FROM fcm_tokens;

-- 7. FCM tokeny per uživatel
SELECT clerk_id, COUNT(*) AS token_count, 
       MAX(updated_at) AS last_updated,
       MAX(last_used_at) AS last_used
FROM fcm_tokens
GROUP BY clerk_id
ORDER BY last_updated DESC
LIMIT 20;

-- 8. FCM tokeny pro konkrétního uživatele (tomaslapos)
SELECT * FROM fcm_tokens 
WHERE clerk_id = 'user_38Zd900CY8GoiwqHKbeb1RpUz3';

-- 9. Remindery pro tohoto uživatele
SELECT id, recipe_name, flavor_name, mixed_at, remind_at, 
       status, sent_at, consumed_at, stock_percent, timezone
FROM recipe_reminders 
WHERE clerk_id = 'user_38Zd900CY8GoiwqHKbeb1RpUz3'
ORDER BY created_at DESC
LIMIT 10;

-- 10. CRON job existence a stav
SELECT jobid, schedule, command, nodename, active,
       CASE WHEN active THEN 'AKTIVNÍ' ELSE 'NEAKTIVNÍ!' END AS stav
FROM cron.job 
ORDER BY jobid;

-- 11. Poslední CRON executions (hledat reminder-notify)
SELECT j.command AS cron_command,
       d.runid, d.status, d.return_message,
       d.start_time, d.end_time,
       (d.end_time - d.start_time) AS duration
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
ORDER BY d.start_time DESC 
LIMIT 15;

-- 12. Test: zkusit INSERT do fcm_tokens jako anon (simulace RLS)
-- Pokud RLS blokuje anon INSERT, toto selže
-- ZAKOMENTOVANÉ - odkomentujte pro test:
-- INSERT INTO fcm_tokens (clerk_id, token, device_info, updated_at, last_used_at)
-- VALUES ('test_user', 'test_token_delete_me', '{}', now(), now());
-- SELECT * FROM fcm_tokens WHERE clerk_id = 'test_user';
-- DELETE FROM fcm_tokens WHERE clerk_id = 'test_user';
