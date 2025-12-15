-- ============================================
-- CLERK + SUPABASE JWT INTEGRACE
-- Pro plné zabezpečení RLS
-- ============================================

-- KROK 1: V Supabase Dashboard -> Settings -> API
-- Přidejte Clerk JWKS endpoint jako JWT Secret:
-- https://star-chow-45.clerk.accounts.dev/.well-known/jwks.json

-- KROK 2: Vytvořte funkci pro získání Clerk user ID z JWT
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- KROK 3: Nové RLS politiky používající Clerk JWT
-- Smazat staré politiky
DROP POLICY IF EXISTS "Allow authenticated access to users" ON users;
DROP POLICY IF EXISTS "Users view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users delete own recipes" ON recipes;

-- Politiky pro USERS
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        clerk_id = auth.clerk_user_id()
    );

CREATE POLICY "Users can create profile" ON users
    FOR INSERT WITH CHECK (
        clerk_id = auth.clerk_user_id()
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        clerk_id = auth.clerk_user_id()
    );

-- Politiky pro RECIPES
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (
        clerk_id = auth.clerk_user_id()
    );

-- Povolí i sdílené recepty (přístup přes share_id)
CREATE POLICY "Anyone can view shared recipes" ON recipes
    FOR SELECT USING (
        share_id IS NOT NULL
    );

CREATE POLICY "Users can create recipes" ON recipes
    FOR INSERT WITH CHECK (
        clerk_id = auth.clerk_user_id()
    );

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (
        clerk_id = auth.clerk_user_id()
    );

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (
        clerk_id = auth.clerk_user_id()
    );
