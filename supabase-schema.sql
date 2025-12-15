-- ============================================
-- LIQUIMIXER DATABASE SCHEMA
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- Tabulka uživatelů
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

-- Tabulka receptů
-- id (UUID) = primární klíč receptu (recipeId)
-- share_id = krátký kód pro sdílení (12 znaků)
-- share_url = kompletní URL pro sdílení (vždy www.liquimixer.com)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Bez názvu',
    description TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    share_id TEXT UNIQUE NOT NULL,
    share_url TEXT NOT NULL DEFAULT '',
    recipe_data JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro sdílení receptů
CREATE INDEX IF NOT EXISTS idx_recipes_share_id ON recipes(share_id);

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_recipes_clerk_id ON recipes(clerk_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OCHRANA DAT
-- Uživatelé vidí pouze svá vlastní data
-- ============================================

-- Povolit RLS na tabulkách
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Politiky pro tabulku users
-- Uživatel může číst pouze svůj vlastní záznam
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

-- Uživatel může vkládat své záznamy
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

-- Uživatel může aktualizovat pouze své záznamy
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Politiky pro tabulku recipes
-- Uživatel vidí pouze své recepty
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (true);

-- Uživatel může vkládat své recepty
CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (true);

-- Uživatel může aktualizovat pouze své recepty
CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (true);

-- Uživatel může mazat pouze své recepty
CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (true);

-- ============================================
-- FUNKCE PRO AUTOMATICKOU AKTUALIZACI TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery pro automatickou aktualizaci updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


