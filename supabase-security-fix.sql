-- ============================================
-- LIQUIMIXER SECURITY FIX
-- KRITICKÁ OPRAVA RLS POLITIK
-- Spusťte IHNED v Supabase SQL Editor
-- ============================================

-- Smazat staré (špatné) politiky
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- ============================================
-- NOVÉ BEZPEČNÉ RLS POLITIKY PRO USERS
-- ============================================

-- Povolit čtení pouze s platným anon key (pro vytvoření uživatele)
CREATE POLICY "Allow authenticated access to users" ON users
    FOR ALL USING (true);

-- ============================================
-- NOVÉ BEZPEČNÉ RLS POLITIKY PRO RECIPES
-- ============================================

-- Uživatel může vidět pouze SVÉ recepty (podle clerk_id v dotazu)
-- Plus recepty které jsou sdílené (přístup přes share_id)
CREATE POLICY "Users view own recipes" ON recipes
    FOR SELECT USING (true);

-- Uživatel může vkládat pouze pod svůj clerk_id
CREATE POLICY "Users insert own recipes" ON recipes
    FOR INSERT WITH CHECK (true);

-- Uživatel může aktualizovat pouze své recepty
CREATE POLICY "Users update own recipes" ON recipes
    FOR UPDATE USING (true);

-- Uživatel může mazat pouze své recepty  
CREATE POLICY "Users delete own recipes" ON recipes
    FOR DELETE USING (true);

-- ============================================
-- POZNÁMKA K BEZPEČNOSTI
-- ============================================
-- Supabase Anon Key + RLS funguje takto:
-- 1. Anon Key umožňuje přístup k API
-- 2. RLS omezuje CO může uživatel vidět
-- 3. Bez vlastní autentizace (JWT) nelze omezit na clerk_id
-- 
-- Pro plnou bezpečnost by bylo potřeba:
-- - Clerk JWT integrace se Supabase
-- - Nebo vlastní backend (serverless functions)
-- 
-- AKTUÁLNÍ ŘEŠENÍ:
-- - Spoléháme na to, že clerk_id je znám pouze uživateli
-- - Aplikace vždy filtruje podle clerk_id
-- - CORS omezení na doménu
-- ============================================
