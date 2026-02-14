-- Zkontrolovat CRON joby v Supabase
-- Spusťte tento dotaz v Supabase Dashboard → SQL Editor

-- 1. Zkontrolovat, zda je pg_cron extension povolena
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 2. Zobrazit všechny naplánované CRON joby
SELECT jobid, schedule, command, nodename, active 
FROM cron.job 
ORDER BY jobid;

-- 3. Zobrazit historii posledních spuštění
SELECT jobid, runid, job_pid, status, return_message, start_time, end_time
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
