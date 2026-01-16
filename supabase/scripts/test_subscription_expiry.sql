-- ============================================
-- SQL Skripty pro testování expirace předplatného
-- Datum: 2026-01-16
-- ============================================

-- POZNÁMKA: Tyto skripty spouštějte v Supabase Dashboard → SQL Editor
-- Nejprve zjistěte clerk_id vašeho testovacího účtu

-- ============================================
-- 1. ZJISTIT CLERK_ID PRO TESTOVACÍ ÚČET
-- ============================================

-- Nahraďte 'vas@email.cz' vaším testovacím emailem
SELECT clerk_id, email, subscription_status 
FROM users 
WHERE email ILIKE '%lapos%';

-- ============================================
-- 2. ZOBRAZIT AKTUÁLNÍ STAV PŘEDPLATNÉHO
-- ============================================

-- Nahraďte 'user_XXXXX' vaším clerk_id
SELECT 
    id,
    clerk_id,
    plan_type,
    status,
    valid_from,
    valid_to,
    valid_to - NOW() AS time_remaining
FROM subscriptions 
WHERE clerk_id = 'user_XXXXX'
ORDER BY valid_to DESC
LIMIT 1;

-- ============================================
-- 3. TESTOVACÍ SCÉNÁŘE
-- ============================================

-- SCÉNÁŘ A: Předplatné vypršelo včera
-- Očekávání: Uživatel bude vyzván k platbě (subscription modal)
-- Nahraďte 'user_XXXXX' vaším clerk_id
UPDATE subscriptions 
SET valid_to = NOW() - INTERVAL '1 day'
WHERE clerk_id = 'user_XXXXX' AND status = 'active';

-- ============================================

-- SCÉNÁŘ B: Předplatné vyprší za 30 dní (hranice pro upozornění)
-- Očekávání: Uživatel uvidí upozornění na blížící se expiraci
-- Nahraďte 'user_XXXXX' vaším clerk_id
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '30 days'
WHERE clerk_id = 'user_XXXXX' AND status = 'active';

-- ============================================

-- SCÉNÁŘ C: Předplatné vyprší za 7 dní
-- Očekávání: Urgentní upozornění na blížící se expiraci
-- Nahraďte 'user_XXXXX' vaším clerk_id
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '7 days'
WHERE clerk_id = 'user_XXXXX' AND status = 'active';

-- ============================================

-- SCÉNÁŘ D: Předplatné vyprší za 1 den
-- Očekávání: Velmi urgentní upozornění
-- Nahraďte 'user_XXXXX' vaším clerk_id
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '1 day'
WHERE clerk_id = 'user_XXXXX' AND status = 'active';

-- ============================================

-- SCÉNÁŘ E: Obnovit platné předplatné na 1 rok
-- Použití: Po dokončení testování
-- Nahraďte 'user_XXXXX' vaším clerk_id
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '365 days'
WHERE clerk_id = 'user_XXXXX' AND status = 'active';

-- ============================================
-- 4. RESET - VRÁTIT VŠE DO PŮVODNÍHO STAVU
-- ============================================

-- Smazat všechna testovací předplatná a vytvořit nové aktivní
-- POZOR: Toto smaže historii předplatného!
-- Nahraďte 'user_XXXXX' vaším clerk_id

-- Krok 1: Smazat stará předplatná
DELETE FROM subscriptions WHERE clerk_id = 'user_XXXXX';

-- Krok 2: Vytvořit nové aktivní předplatné
INSERT INTO subscriptions (
    clerk_id,
    plan_type,
    status,
    amount,
    currency,
    valid_from,
    valid_to,
    auto_renew,
    created_at
) VALUES (
    'user_XXXXX',
    'yearly',
    'active',
    59.00,
    'CZK',
    NOW(),
    NOW() + INTERVAL '365 days',
    false,
    NOW()
);

-- ============================================
-- 5. KONTROLA PO TESTU
-- ============================================

-- Ověřit stav předplatného
SELECT 
    id,
    status,
    valid_from,
    valid_to,
    CASE 
        WHEN valid_to > NOW() THEN 'AKTIVNÍ'
        ELSE 'VYPRŠELO'
    END AS stav,
    CASE 
        WHEN valid_to > NOW() THEN 
            EXTRACT(DAY FROM valid_to - NOW()) || ' dní'
        ELSE 
            'Vypršelo před ' || EXTRACT(DAY FROM NOW() - valid_to) || ' dny'
    END AS zbyvajici_cas
FROM subscriptions 
WHERE clerk_id = 'user_XXXXX'
ORDER BY valid_to DESC
LIMIT 1;
