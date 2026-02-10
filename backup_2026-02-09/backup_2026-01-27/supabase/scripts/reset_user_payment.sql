-- ============================================
-- SCRIPT: Reset uživatele pro opětovné testování platby
-- Použití: Spustit v Supabase Dashboard → SQL Editor
-- ============================================

-- Nastavte email uživatele, kterého chcete resetovat:
DO $$
DECLARE
    target_email TEXT := 'tomas.lapos@woos.cz';  -- << ZMĚŇTE NA POŽADOVANÝ EMAIL
    target_clerk_id TEXT;
BEGIN
    -- Najít clerk_id podle emailu
    SELECT clerk_id INTO target_clerk_id FROM users WHERE email = target_email;
    
    IF target_clerk_id IS NULL THEN
        RAISE NOTICE 'Uživatel s emailem % nenalezen', target_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Resetuji uživatele: % (clerk_id: %)', target_email, target_clerk_id;
    
    -- 1. Smazat platby
    DELETE FROM payments WHERE clerk_id = target_clerk_id;
    RAISE NOTICE 'Platby smazány';
    
    -- 2. Smazat faktury
    DELETE FROM invoices WHERE clerk_id = target_clerk_id;
    RAISE NOTICE 'Faktury smazány';
    
    -- 3. Smazat předplatné
    DELETE FROM subscriptions WHERE clerk_id = target_clerk_id;
    RAISE NOTICE 'Předplatné smazáno';
    
    -- 4. Resetovat uživatele
    UPDATE users 
    SET subscription_status = NULL,
        subscription_tier = NULL,
        subscription_id = NULL,
        subscription_expires_at = NULL
    WHERE clerk_id = target_clerk_id;
    RAISE NOTICE 'Uživatel resetován';
    
    RAISE NOTICE 'HOTOVO: Uživatel % byl kompletně resetován pro nové testování platby', target_email;
END $$;

-- ============================================
-- ALTERNATIVNÍ VERZE - přímé SQL příkazy
-- (odkomentujte a upravte email)
-- ============================================

/*
-- Pro email: tomas.lapos@woos.cz
DELETE FROM payments WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomas.lapos@woos.cz');
DELETE FROM invoices WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomas.lapos@woos.cz');
DELETE FROM subscriptions WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomas.lapos@woos.cz');
UPDATE users SET subscription_status = NULL, subscription_tier = NULL, subscription_id = NULL, subscription_expires_at = NULL WHERE email = 'tomas.lapos@woos.cz';

-- Pro email: tomaslapos@gmail.com
DELETE FROM payments WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomaslapos@gmail.com');
DELETE FROM invoices WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomaslapos@gmail.com');
DELETE FROM subscriptions WHERE clerk_id = (SELECT clerk_id FROM users WHERE email = 'tomaslapos@gmail.com');
UPDATE users SET subscription_status = NULL, subscription_tier = NULL, subscription_id = NULL, subscription_expires_at = NULL WHERE email = 'tomaslapos@gmail.com';
*/

-- ============================================
-- KONTROLA - zobrazit stav uživatele
-- ============================================

SELECT 
    u.email,
    u.subscription_status,
    u.subscription_tier,
    u.subscription_expires_at,
    (SELECT COUNT(*) FROM subscriptions s WHERE s.clerk_id = u.clerk_id) as subscription_count,
    (SELECT COUNT(*) FROM payments p WHERE p.clerk_id = u.clerk_id) as payment_count,
    (SELECT COUNT(*) FROM invoices i WHERE i.clerk_id = u.clerk_id) as invoice_count
FROM users u
WHERE u.email IN ('tomas.lapos@woos.cz', 'tomaslapos@gmail.com');
