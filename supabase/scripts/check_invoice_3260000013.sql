-- ============================================
-- DIAGNOSTIKA: Faktura 3260000013
-- Spusťte v Supabase Dashboard → SQL Editor
-- Datum: 01.03.2026
-- ============================================

-- 1. Zjistit strukturu payments tabulky
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- 2. Zjistit strukturu subscriptions tabulky
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 3. Zjistit strukturu invoices tabulky
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- 4. Hledat fakturu 3260000013 v invoices tabulce
SELECT *
FROM invoices
WHERE invoice_number LIKE '%3260000013%'
LIMIT 5;

-- 5. Všechny faktury (posledních 20) — pro přehled
SELECT id, clerk_id, invoice_number, subscription_id, status, 
       total, currency, paid_at, created_at,
       customer_email, locale
FROM invoices
ORDER BY created_at DESC
LIMIT 20;

-- 6. Všechny platby (posledních 10)
SELECT *
FROM payments
ORDER BY created_at DESC
LIMIT 10;
