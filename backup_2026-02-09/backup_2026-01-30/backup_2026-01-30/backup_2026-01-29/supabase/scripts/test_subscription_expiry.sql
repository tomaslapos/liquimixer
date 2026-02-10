-- ============================================
-- SQL Skripty pro testování expirace předplatného
-- Účet: tomas.lapos@woos.cz
-- Clerk ID: user_383xxAzQSM4o5LBe5cmGwjAswWY
-- Datum: 2026-01-16
-- ============================================

-- ============================================
-- 1. ZOBRAZIT AKTUÁLNÍ STAV PŘEDPLATNÉHO
-- ============================================

SELECT 
    id,
    clerk_id,
    plan_type,
    status,
    valid_from,
    valid_to,
    valid_to - NOW() AS time_remaining
FROM subscriptions 
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY'
ORDER BY valid_to DESC
LIMIT 1;

-- ============================================
-- 2. TESTOVACÍ SCÉNÁŘE
-- Spouštějte POUZE JEDEN scénář najednou!
-- ============================================

-- SCÉNÁŘ A: Předplatné vypršelo včera
-- Očekávání: Uživatel bude vyzván k platbě (subscription modal)
UPDATE subscriptions 
SET valid_to = NOW() - INTERVAL '1 day'
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY' AND status = 'active';

-- ============================================

-- SCÉNÁŘ B: Předplatné vyprší za 30 dní (hranice pro upozornění)
-- Očekávání: Uživatel uvidí upozornění na blížící se expiraci
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '30 days'
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY' AND status = 'active';

-- ============================================

-- SCÉNÁŘ C: Předplatné vyprší za 7 dní
-- Očekávání: Urgentní upozornění na blížící se expiraci
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '7 days'
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY' AND status = 'active';

-- ============================================

-- SCÉNÁŘ D: Předplatné vyprší za 1 den
-- Očekávání: Velmi urgentní upozornění
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '1 day'
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY' AND status = 'active';

-- ============================================

-- SCÉNÁŘ E: Obnovit platné předplatné na 1 rok
-- Použití: Po dokončení testování
UPDATE subscriptions 
SET valid_to = NOW() + INTERVAL '365 days'
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY' AND status = 'active';

-- ============================================
-- 3. KONTROLA PO TESTU
-- ============================================

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
WHERE clerk_id = 'user_383xxAzQSM4o5LBe5cmGwjAswWY'
ORDER BY valid_to DESC
LIMIT 1;
