-- ============================================
-- LIQUIMIXER - KOMPLETNÍ DATABÁZOVÁ MIGRACE
-- Spustit v Supabase SQL Editor
-- ============================================

-- 1. USERS TABULKA
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 2. RECIPES TABULKA
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Bez názvu',
    description TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    share_id TEXT UNIQUE,
    share_url TEXT,
    recipe_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_recipes_clerk_id ON recipes(clerk_id);
CREATE INDEX IF NOT EXISTS idx_recipes_share_id ON recipes(share_id);

-- 3. FAVORITE_PRODUCTS TABULKA
-- ============================================
CREATE TABLE IF NOT EXISTS favorite_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Bez názvu',
    product_type TEXT DEFAULT 'flavor' CHECK (product_type IN ('vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt')),
    description TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    image_url TEXT DEFAULT '',
    product_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_favorite_products_clerk_id ON favorite_products(clerk_id);
CREATE INDEX IF NOT EXISTS idx_favorite_products_type ON favorite_products(product_type);

-- 4. LOCALES TABULKA (pro překlady)
-- ============================================
CREATE TABLE IF NOT EXISTS locales (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT,
    currency TEXT DEFAULT 'EUR',
    currency_symbol TEXT DEFAULT '€',
    date_format TEXT DEFAULT 'DD.MM.YYYY',
    is_active BOOLEAN DEFAULT true
);

-- 5. TRANSLATIONS TABULKA
-- ============================================
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    locale TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    UNIQUE(locale, key)
);

CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);

-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Povolit RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_products ENABLE ROW LEVEL SECURITY;

-- USERS policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- RECIPES policies
DROP POLICY IF EXISTS "Anyone can view recipes by share_id" ON recipes;
CREATE POLICY "Anyone can view recipes by share_id" ON recipes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (true);

-- FAVORITE_PRODUCTS policies
DROP POLICY IF EXISTS "Users can view own products" ON favorite_products;
CREATE POLICY "Users can view own products" ON favorite_products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own products" ON favorite_products;
CREATE POLICY "Users can insert own products" ON favorite_products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own products" ON favorite_products;
CREATE POLICY "Users can update own products" ON favorite_products
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own products" ON favorite_products;
CREATE POLICY "Users can delete own products" ON favorite_products
    FOR DELETE USING (true);

-- LOCALES policies (veřejné čtení)
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read locales" ON locales;
CREATE POLICY "Anyone can read locales" ON locales
    FOR SELECT USING (true);

-- TRANSLATIONS policies (veřejné čtení)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read translations" ON translations;
CREATE POLICY "Anyone can read translations" ON translations
    FOR SELECT USING (true);

-- 7. FUNKCE PRO UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_favorite_products_updated_at ON favorite_products;
CREATE TRIGGER update_favorite_products_updated_at
    BEFORE UPDATE ON favorite_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. ZÁKLADNÍ DATA - LOCALES
-- ============================================
INSERT INTO locales (code, name, native_name, currency, currency_symbol, is_active)
VALUES 
    ('cs', 'Czech', 'Čeština', 'CZK', 'Kč', true),
    ('en', 'English', 'English', 'EUR', '€', true),
    ('sk', 'Slovak', 'Slovenčina', 'EUR', '€', true),
    ('de', 'German', 'Deutsch', 'EUR', '€', true),
    ('pl', 'Polish', 'Polski', 'PLN', 'zł', true)
ON CONFLICT (code) DO NOTHING;

-- 9. OVĚŘENÍ
-- ============================================
SELECT 'Tabulky vytvořeny:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'recipes', 'favorite_products', 'locales', 'translations');

