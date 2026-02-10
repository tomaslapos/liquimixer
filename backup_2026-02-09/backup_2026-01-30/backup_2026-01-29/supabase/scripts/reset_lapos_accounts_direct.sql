-- ============================================
-- PŘÍMÝ RESET: Smazání všech dat pro účty s "lapos" v emailu
-- Spustit v Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Smazat platby
DELETE FROM payments 
WHERE clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

-- 2. Smazat faktury  
DELETE FROM invoices 
WHERE clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

-- 3. Smazat předplatné
DELETE FROM subscriptions 
WHERE clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

-- 4. Resetovat stav uživatelů
UPDATE users
SET subscription_status = NULL,
    subscription_tier = NULL,
    subscription_id = NULL,
    subscription_expires_at = NULL
WHERE email ILIKE '%lapos%';

-- 5. Ověření - zobrazit aktuální stav
SELECT 'VÝSLEDEK - Uživatelé:' as info;
SELECT id, clerk_id, email, subscription_status, subscription_tier, subscription_expires_at 
FROM users 
WHERE email ILIKE '%lapos%';

SELECT 'VÝSLEDEK - Předplatné (mělo by být prázdné):' as info;
SELECT * FROM subscriptions 
WHERE clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');
