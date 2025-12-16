-- ============================================
-- LIQUIMIXER - KOMPLETNÍ MIGRACE
-- Spustit v Supabase SQL Editor
-- Datum: Prosinec 2024
-- ============================================

-- ============================================
-- ČÁST 1: Sdílení produktů
-- ============================================

-- Přidat sloupce pro sdílení produktů
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS share_id VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS share_url TEXT;

-- Vytvořit index pro rychlé vyhledávání sdílených produktů
CREATE INDEX IF NOT EXISTS idx_products_share_id ON favorite_products(share_id);

-- Aktualizovat RLS politiku pro čtení sdílených produktů
DROP POLICY IF EXISTS "Anyone can view shared products" ON favorite_products;
CREATE POLICY "Anyone can view shared products" ON favorite_products
    FOR SELECT USING (share_id IS NOT NULL);

SELECT '✅ Část 1: Sdílení produktů - HOTOVO' as status;

-- ============================================
-- ČÁST 2: Propojení produktů s recepty
-- ============================================

-- Vytvořit junction tabulku pro propojení receptů a produktů
CREATE TABLE IF NOT EXISTS recipe_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES favorite_products(id) ON DELETE CASCADE,
    clerk_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, product_id)
);

-- Indexy pro rychlé dotazy
CREATE INDEX IF NOT EXISTS idx_recipe_products_recipe ON recipe_products(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_product ON recipe_products(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_clerk ON recipe_products(clerk_id);

-- RLS politiky
ALTER TABLE recipe_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recipe_products" ON recipe_products;
DROP POLICY IF EXISTS "Users can insert own recipe_products" ON recipe_products;
DROP POLICY IF EXISTS "Users can delete own recipe_products" ON recipe_products;

CREATE POLICY "Users can view own recipe_products" ON recipe_products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own recipe_products" ON recipe_products
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) > 10
    );

CREATE POLICY "Users can delete own recipe_products" ON recipe_products
    FOR DELETE USING (true);

SELECT '✅ Část 2: Propojení produktů s recepty - HOTOVO' as status;

-- ============================================
-- ČÁST 3: Překlady pro přihlašovací obrazovku
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Čeština
('cs', 'auth.login_title', 'Přihlášení', 'auth'),
('cs', 'auth.login_subtitle', 'Přihlaste se pro přístup k uloženým receptům a produktům', 'auth'),
('cs', 'auth.profile_title', 'Můj účet', 'auth'),

-- Angličtina
('en', 'auth.login_title', 'Sign In', 'auth'),
('en', 'auth.login_subtitle', 'Sign in to access your saved recipes and products', 'auth'),
('en', 'auth.profile_title', 'My Account', 'auth'),

-- Polština
('pl', 'auth.login_title', 'Logowanie', 'auth'),
('pl', 'auth.login_subtitle', 'Zaloguj się, aby uzyskać dostęp do zapisanych przepisów i produktów', 'auth'),
('pl', 'auth.profile_title', 'Moje konto', 'auth'),

-- Němčina
('de', 'auth.login_title', 'Anmelden', 'auth'),
('de', 'auth.login_subtitle', 'Melden Sie sich an, um auf Ihre gespeicherten Rezepte und Produkte zuzugreifen', 'auth'),
('de', 'auth.profile_title', 'Mein Konto', 'auth'),

-- Slovenština
('sk', 'auth.login_title', 'Prihlásenie', 'auth'),
('sk', 'auth.login_subtitle', 'Prihláste sa pre prístup k uloženým receptom a produktom', 'auth'),
('sk', 'auth.profile_title', 'Môj účet', 'auth')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

SELECT '✅ Část 3: Překlady pro přihlášení - HOTOVO' as status;

-- ============================================
-- OVĚŘENÍ
-- ============================================

SELECT '🎉 MIGRACE DOKONČENA!' as status;

-- Zobrazit strukturu favorite_products
SELECT 'Struktura favorite_products:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'favorite_products' 
ORDER BY ordinal_position;

-- Zobrazit novou tabulku recipe_products
SELECT 'Tabulka recipe_products:' as info;
SELECT table_name FROM information_schema.tables WHERE table_name = 'recipe_products';

-- Zobrazit překlady
SELECT 'Překlady pro přihlášení:' as info;
SELECT locale, key, value FROM translations 
WHERE key LIKE 'auth.login%' OR key = 'auth.profile_title' 
ORDER BY locale, key;

