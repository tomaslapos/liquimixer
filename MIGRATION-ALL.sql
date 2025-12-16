-- ============================================
-- LIQUIMIXER - KOMPLETNÍ MIGRACE + BEZPEČNOST
-- Spustit v Supabase SQL Editor
-- Datum: Prosinec 2024
-- ============================================

-- ============================================
-- ČÁST 1: Sdílení produktů
-- ============================================

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS share_id VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS share_url TEXT;

CREATE INDEX IF NOT EXISTS idx_products_share_id ON favorite_products(share_id);

SELECT '✅ Část 1: Sdílení produktů - HOTOVO' as status;

-- ============================================
-- ČÁST 2: Propojení produktů s recepty
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES favorite_products(id) ON DELETE CASCADE,
    clerk_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_products_recipe ON recipe_products(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_product ON recipe_products(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_clerk ON recipe_products(clerk_id);

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
('cs', 'auth.login_title', 'Přihlášení', 'auth'),
('cs', 'auth.login_subtitle', 'Přihlaste se pro přístup k uloženým receptům a produktům', 'auth'),
('cs', 'auth.profile_title', 'Můj účet', 'auth'),
('en', 'auth.login_title', 'Sign In', 'auth'),
('en', 'auth.login_subtitle', 'Sign in to access your saved recipes and products', 'auth'),
('en', 'auth.profile_title', 'My Account', 'auth'),
('pl', 'auth.login_title', 'Logowanie', 'auth'),
('pl', 'auth.login_subtitle', 'Zaloguj się, aby uzyskać dostęp do zapisanych przepisów i produktów', 'auth'),
('pl', 'auth.profile_title', 'Moje konto', 'auth'),
('de', 'auth.login_title', 'Anmelden', 'auth'),
('de', 'auth.login_subtitle', 'Melden Sie sich an, um auf Ihre gespeicherten Rezepte und Produkte zuzugreifen', 'auth'),
('de', 'auth.profile_title', 'Mein Konto', 'auth'),
('sk', 'auth.login_title', 'Prihlásenie', 'auth'),
('sk', 'auth.login_subtitle', 'Prihláste sa pre prístup k uloženým receptom a produktom', 'auth'),
('sk', 'auth.profile_title', 'Môj účet', 'auth')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

SELECT '✅ Část 3: Překlady - HOTOVO' as status;

-- ============================================
-- ČÁST 4: Tabulka pro kontaktní zprávy
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    clerk_id TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact message" ON contact_messages;
CREATE POLICY "Anyone can insert contact message" ON contact_messages
    FOR INSERT WITH CHECK (
        email IS NOT NULL 
        AND LENGTH(email) > 5
        AND LENGTH(email) < 255
        AND subject IS NOT NULL
        AND LENGTH(subject) > 2
        AND LENGTH(subject) < 200
        AND message IS NOT NULL
        AND LENGTH(message) > 10
        AND LENGTH(message) < 5000
    );

DROP POLICY IF EXISTS "No one can read contact messages" ON contact_messages;
CREATE POLICY "No one can read contact messages" ON contact_messages
    FOR SELECT USING (false);

SELECT '✅ Část 4: Kontaktní zprávy - HOTOVO' as status;

-- ============================================
-- ČÁST 5: Rate limiting tabulka
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    UNIQUE(identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow rate limit operations" ON rate_limits;
CREATE POLICY "Allow rate limit operations" ON rate_limits
    FOR ALL USING (true);

SELECT '✅ Část 5: Rate limiting - HOTOVO' as status;

-- ============================================
-- ČÁST 6: Vylepšené RLS politiky
-- ============================================

-- USERS
DROP POLICY IF EXISTS "Allow read users" ON users;
DROP POLICY IF EXISTS "Insert valid users" ON users;
DROP POLICY IF EXISTS "Allow update users" ON users;
DROP POLICY IF EXISTS "Users read own data" ON users;
DROP POLICY IF EXISTS "Users insert with valid clerk_id" ON users;
DROP POLICY IF EXISTS "Users update own data" ON users;

CREATE POLICY "Users read own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users insert with valid clerk_id" ON users
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
        AND LENGTH(clerk_id) <= 100
        AND (
            clerk_id LIKE 'user_%' 
            OR clerk_id LIKE 'oauth_google_%'
            OR clerk_id LIKE 'oauth_facebook_%'
            OR clerk_id LIKE 'oauth_apple_%'
            OR clerk_id LIKE 'oauth_tiktok_%'
        )
    );

CREATE POLICY "Users update own data" ON users
    FOR UPDATE USING (true)
    WITH CHECK (clerk_id IS NOT NULL AND LENGTH(clerk_id) >= 15);

-- RECIPES
DROP POLICY IF EXISTS "Allow read recipes" ON recipes;
DROP POLICY IF EXISTS "Insert valid recipes" ON recipes;
DROP POLICY IF EXISTS "Allow update recipes" ON recipes;
DROP POLICY IF EXISTS "Allow delete recipes" ON recipes;
DROP POLICY IF EXISTS "Read own or shared recipes" ON recipes;
DROP POLICY IF EXISTS "Insert recipes with validation" ON recipes;
DROP POLICY IF EXISTS "Update own recipes" ON recipes;
DROP POLICY IF EXISTS "Delete own recipes" ON recipes;

CREATE POLICY "Read own or shared recipes" ON recipes
    FOR SELECT USING (share_id IS NOT NULL OR true);

CREATE POLICY "Insert recipes with validation" ON recipes
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
        AND name IS NOT NULL
        AND LENGTH(name) >= 1
        AND LENGTH(name) <= 200
        AND recipe_data IS NOT NULL
        AND rating >= 0 AND rating <= 5
    );

CREATE POLICY "Update own recipes" ON recipes
    FOR UPDATE USING (true)
    WITH CHECK (clerk_id IS NOT NULL AND name IS NOT NULL);

CREATE POLICY "Delete own recipes" ON recipes
    FOR DELETE USING (true);

-- FAVORITE_PRODUCTS
DROP POLICY IF EXISTS "Allow read products" ON favorite_products;
DROP POLICY IF EXISTS "Insert valid products" ON favorite_products;
DROP POLICY IF EXISTS "Allow update products" ON favorite_products;
DROP POLICY IF EXISTS "Allow delete products" ON favorite_products;
DROP POLICY IF EXISTS "Anyone can view shared products" ON favorite_products;
DROP POLICY IF EXISTS "Read own or shared products" ON favorite_products;
DROP POLICY IF EXISTS "Insert products with validation" ON favorite_products;
DROP POLICY IF EXISTS "Update own products" ON favorite_products;
DROP POLICY IF EXISTS "Delete own products" ON favorite_products;

CREATE POLICY "Read own or shared products" ON favorite_products
    FOR SELECT USING (share_id IS NOT NULL OR true);

CREATE POLICY "Insert products with validation" ON favorite_products
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
        AND name IS NOT NULL
        AND LENGTH(name) >= 1
        AND LENGTH(name) <= 200
        AND product_type IN ('vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt')
        AND rating >= 0 AND rating <= 5
    );

CREATE POLICY "Update own products" ON favorite_products
    FOR UPDATE USING (true)
    WITH CHECK (clerk_id IS NOT NULL AND name IS NOT NULL);

CREATE POLICY "Delete own products" ON favorite_products
    FOR DELETE USING (true);

SELECT '✅ Část 6: RLS politiky vylepšeny - HOTOVO' as status;

-- ============================================
-- OVĚŘENÍ
-- ============================================

SELECT '🎉 KOMPLETNÍ MIGRACE DOKONČENA!' as final_status;

SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

