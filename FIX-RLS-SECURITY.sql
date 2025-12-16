-- ============================================
-- LIQUIMIXER - PRAKTICKÉ RLS ZABEZPEČENÍ
-- Spustit v Supabase SQL Editor
-- ============================================

-- POZNÁMKA: Bez plné Clerk-Supabase JWT integrace
-- používáme základní ochrany + app-level validaci

-- 1. USERS
-- ============================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Čtení: povolit (app filtruje)
CREATE POLICY "Allow read users" ON users
    FOR SELECT USING (true);

-- Vkládání: clerk_id musí začínat 'user_' (Clerk formát)
CREATE POLICY "Insert valid users" ON users
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) > 10
        AND (clerk_id LIKE 'user_%' OR clerk_id LIKE 'oauth_%')
    );

-- Aktualizace: povolit (app ověřuje vlastnictví)
CREATE POLICY "Allow update users" ON users
    FOR UPDATE USING (true);

-- 2. RECIPES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view recipes by share_id" ON recipes;
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Čtení: povolit (sdílené recepty + vlastní)
CREATE POLICY "Allow read recipes" ON recipes
    FOR SELECT USING (true);

-- Vkládání: clerk_id musí být validní
CREATE POLICY "Insert valid recipes" ON recipes
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) > 10
        AND recipe_data IS NOT NULL
    );

-- Aktualizace a mazání: povolit (app ověřuje)
CREATE POLICY "Allow update recipes" ON recipes
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete recipes" ON recipes
    FOR DELETE USING (true);

-- 3. FAVORITE_PRODUCTS
-- ============================================
DROP POLICY IF EXISTS "Users can view own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can insert own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can update own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can delete own products" ON favorite_products;

-- Čtení: povolit
CREATE POLICY "Allow read products" ON favorite_products
    FOR SELECT USING (true);

-- Vkládání: clerk_id musí být validní
CREATE POLICY "Insert valid products" ON favorite_products
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) > 10
        AND name IS NOT NULL
    );

-- Aktualizace a mazání: povolit
CREATE POLICY "Allow update products" ON favorite_products
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete products" ON favorite_products
    FOR DELETE USING (true);

-- 4. LOCALES a TRANSLATIONS - Veřejné čtení
-- ============================================
-- Pouze SELECT je povolen (správně nastaveno)

-- 5. OVĚŘENÍ
-- ============================================
SELECT 'RLS politiky aktualizovány!' as status;
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

