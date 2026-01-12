-- ============================================
-- SCRIPT: Reset testovacích účtů pro nové testování platby
-- Účty: tomas.lapos@woos.cz a tomaslapos@gmail.com
-- Spustit v Supabase Dashboard → SQL Editor
-- ============================================

DO $$
DECLARE
    v_clerk_id_1 TEXT;
    v_clerk_id_2 TEXT;
BEGIN
    -- Najít clerk_id pro oba účty
    SELECT clerk_id INTO v_clerk_id_1 FROM users WHERE email = 'tomas.lapos@woos.cz' LIMIT 1;
    SELECT clerk_id INTO v_clerk_id_2 FROM users WHERE email = 'tomaslapos@gmail.com' LIMIT 1;
    
    RAISE NOTICE 'Clerk ID pro tomas.lapos@woos.cz: %', v_clerk_id_1;
    RAISE NOTICE 'Clerk ID pro tomaslapos@gmail.com: %', v_clerk_id_2;
    
    -- Smazat platby
    DELETE FROM payments WHERE clerk_id IN (v_clerk_id_1, v_clerk_id_2);
    RAISE NOTICE 'Platby smazány.';
    
    -- Smazat faktury
    DELETE FROM invoices WHERE clerk_id IN (v_clerk_id_1, v_clerk_id_2);
    RAISE NOTICE 'Faktury smazány.';
    
    -- Smazat předplatné
    DELETE FROM subscriptions WHERE clerk_id IN (v_clerk_id_1, v_clerk_id_2);
    RAISE NOTICE 'Předplatné smazáno.';
    
    -- Resetovat stav předplatného u uživatelů
    UPDATE users
    SET subscription_status = NULL,
        subscription_tier = NULL,
        subscription_id = NULL,
        subscription_expires_at = NULL
    WHERE clerk_id IN (v_clerk_id_1, v_clerk_id_2);
    RAISE NOTICE 'Stav uživatelů resetován.';
    
    RAISE NOTICE 'HOTOVO: Účty tomas.lapos@woos.cz a tomaslapos@gmail.com jsou připraveny pro nové testování.';
END $$;
