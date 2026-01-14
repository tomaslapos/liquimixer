-- ============================================
-- SCRIPT: Smazání všech faktur z databáze
-- Použití: Spustit v Supabase Dashboard → SQL Editor
-- VAROVÁNÍ: Toto smaže VŠECHNY faktury!
-- ============================================

-- 1. Zobrazit počet faktur před smazáním
SELECT 'Počet faktur před smazáním:' as info, COUNT(*) as count FROM invoices;

-- 2. Smazat všechny faktury
DELETE FROM invoices;

-- 3. Potvrdit smazání
SELECT 'Počet faktur po smazání:' as info, COUNT(*) as count FROM invoices;

-- ============================================
-- VOLITELNĚ: Smazat i související platby a předplatná
-- Odkomentujte pokud chcete kompletní reset
-- ============================================

/*
-- Smazat všechny platby
DELETE FROM payments;
SELECT 'Platby smazány' as info, COUNT(*) as remaining FROM payments;

-- Smazat všechna předplatná
DELETE FROM subscriptions;
SELECT 'Předplatná smazána' as info, COUNT(*) as remaining FROM subscriptions;

-- Resetovat subscription info u všech uživatelů
UPDATE users SET 
    subscription_status = NULL,
    subscription_tier = NULL,
    subscription_id = NULL,
    subscription_expires_at = NULL;
SELECT 'Uživatelé resetováni' as info, COUNT(*) as affected FROM users WHERE subscription_status IS NULL;
*/
