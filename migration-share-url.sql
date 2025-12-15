-- ============================================
-- KOMPLETNÍ MIGRACE PRO LIQUIMIXER
-- Vytvoří tabulky pokud neexistují a přidá share_url
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VYTVOŘENÍ TABULKY USERS (pokud neexistuje)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image TEXT,
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. VYTVOŘENÍ TABULKY RECIPES (pokud neexistuje)
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Bez názvu',
    description TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    share_id TEXT UNIQUE,
    share_url TEXT DEFAULT '',
    recipe_data JSONB NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PŘIDÁNÍ CHYBĚJÍCÍCH SLOUPCŮ (pokud tabulka existuje)
-- ============================================
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS share_id TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS share_url TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;

-- ============================================
-- 4. AKTUALIZACE EXISTUJÍCÍCH ZÁZNAMŮ
-- ============================================

-- Vygenerovat share_id pro záznamy kde chybí
UPDATE recipes 
SET share_id = substr(md5(random()::text || id::text), 1, 12)
WHERE share_id IS NULL OR share_id = '';

-- Vygenerovat share_url pro záznamy kde chybí
UPDATE recipes 
SET share_url = 'https://www.liquimixer.com/?recipe=' || share_id
WHERE (share_url IS NULL OR share_url = '') AND share_id IS NOT NULL;

-- ============================================
-- 5. VYTVOŘENÍ INDEXŮ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_recipes_share_id ON recipes(share_id);
CREATE INDEX IF NOT EXISTS idx_recipes_share_url ON recipes(share_url);
CREATE INDEX IF NOT EXISTS idx_recipes_clerk_id ON recipes(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- ============================================
-- 6. RLS POLITIKY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Smazat staré politiky (ignorovat chyby pokud neexistují)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Vytvořit nové politiky
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (true);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (true);

-- ============================================
-- 7. TRIGGER PRO UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- OVĚŘENÍ
-- ============================================
SELECT 'Tabulky vytvořeny/aktualizovány:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'recipes');

SELECT 'Sloupce v tabulce recipes:' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'recipes' ORDER BY ordinal_position;

SELECT 'Migrace dokončena!' as status;


