-- ============================================
-- SCRIPT: Reset testovacích účtů pro nové testování platby
-- Účty: tomas.lapos@woos.cz a tomaslapos@gmail.com
-- Spustit v Supabase Dashboard → SQL Editor
-- ============================================

-- KROK 1: Zobrazit aktuální stav (informativní)
SELECT 'UŽIVATELÉ:' as info;
SELECT id, clerk_id, email, subscription_status, subscription_tier, subscription_expires_at 
FROM users 
WHERE email ILIKE '%lapos%';

SELECT 'PŘEDPLATNÉ:' as info;
SELECT s.id, s.clerk_id, s.status, s.tier, s.expires_at, u.email
FROM subscriptions s
LEFT JOIN users u ON s.clerk_id = u.clerk_id
WHERE u.email ILIKE '%lapos%' OR s.clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

SELECT 'PLATBY:' as info;
SELECT p.id, p.clerk_id, p.amount, p.status, p.created_at, u.email
FROM payments p
LEFT JOIN users u ON p.clerk_id = u.clerk_id
WHERE u.email ILIKE '%lapos%' OR p.clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

SELECT 'FAKTURY:' as info;
SELECT i.id, i.clerk_id, i.invoice_number, i.total_amount, i.status, u.email
FROM invoices i
LEFT JOIN users u ON i.clerk_id = u.clerk_id
WHERE u.email ILIKE '%lapos%' OR i.clerk_id IN (SELECT clerk_id FROM users WHERE email ILIKE '%lapos%');

-- KROK 2: Skutečné mazání dat
-- Odkomentujte níže a spusťte SAMOSTATNĚ po ověření dat v kroku 1

/*
DO $$
DECLARE
    v_clerk_ids TEXT[];
BEGIN
    -- Najít všechny clerk_id pro účty obsahující 'lapos'
    SELECT ARRAY_AGG(clerk_id) INTO v_clerk_ids 
    FROM users 
    WHERE email ILIKE '%lapos%';
    
    RAISE NOTICE 'Nalezené Clerk IDs: %', v_clerk_ids;
    
    IF v_clerk_ids IS NULL OR array_length(v_clerk_ids, 1) IS NULL THEN
        RAISE NOTICE 'Žádní uživatelé nenalezeni!';
        RETURN;
    END IF;
    
    -- Smazat platby
    DELETE FROM payments WHERE clerk_id = ANY(v_clerk_ids);
    RAISE NOTICE 'Platby smazány.';
    
    -- Smazat faktury
    DELETE FROM invoices WHERE clerk_id = ANY(v_clerk_ids);
    RAISE NOTICE 'Faktury smazány.';
    
    -- Smazat předplatné
    DELETE FROM subscriptions WHERE clerk_id = ANY(v_clerk_ids);
    RAISE NOTICE 'Předplatné smazáno.';
    
    -- Resetovat stav předplatného u uživatelů
    UPDATE users
    SET subscription_status = NULL,
        subscription_tier = NULL,
        subscription_id = NULL,
        subscription_expires_at = NULL
    WHERE clerk_id = ANY(v_clerk_ids);
    RAISE NOTICE 'Stav uživatelů resetován.';
    
    RAISE NOTICE 'HOTOVO: Všechny účty s "lapos" v emailu jsou připraveny pro nové testování.';
END $$;
*/
