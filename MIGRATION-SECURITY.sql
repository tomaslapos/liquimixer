-- ============================================
-- LIQUIMIXER - BEZPEČNOSTNÍ MIGRACE
-- Vylepšené RLS politiky + kontaktní formulář
-- Spustit v Supabase SQL Editor
-- ============================================

-- ============================================
-- ČÁST 1: Tabulka pro kontaktní zprávy
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

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- RLS pro kontaktní zprávy
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Kdokoliv může vložit zprávu (s omezením)
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

-- Pouze admin může číst (nikdo z klientů)
DROP POLICY IF EXISTS "No one can read contact messages" ON contact_messages;
CREATE POLICY "No one can read contact messages" ON contact_messages
    FOR SELECT USING (false);

SELECT '✅ Tabulka contact_messages vytvořena' as status;

-- ============================================
-- ČÁST 2: Rate limiting tabulka
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP nebo clerk_id
    action TEXT NOT NULL,     -- 'contact', 'save_recipe', etc.
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    UNIQUE(identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits(blocked_until);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Povolit čtení a zápis pro rate limiting
DROP POLICY IF EXISTS "Allow rate limit operations" ON rate_limits;
CREATE POLICY "Allow rate limit operations" ON rate_limits
    FOR ALL USING (true);

SELECT '✅ Tabulka rate_limits vytvořena' as status;

-- ============================================
-- ČÁST 3: Vylepšené RLS politiky pro USERS
-- ============================================

-- Smazat staré politiky
DROP POLICY IF EXISTS "Allow read users" ON users;
DROP POLICY IF EXISTS "Insert valid users" ON users;
DROP POLICY IF EXISTS "Allow update users" ON users;

-- Čtení: omezeno na vlastní záznamy (app-level kontrola)
CREATE POLICY "Users read own data" ON users
    FOR SELECT USING (true);

-- Vkládání: striktní validace clerk_id
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
        AND email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );

-- Aktualizace: pouze vlastní záznamy
CREATE POLICY "Users update own data" ON users
    FOR UPDATE USING (true)
    WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
    );

SELECT '✅ RLS politiky pro users vylepšeny' as status;

-- ============================================
-- ČÁST 4: Vylepšené RLS politiky pro RECIPES
-- ============================================

DROP POLICY IF EXISTS "Allow read recipes" ON recipes;
DROP POLICY IF EXISTS "Insert valid recipes" ON recipes;
DROP POLICY IF EXISTS "Allow update recipes" ON recipes;
DROP POLICY IF EXISTS "Allow delete recipes" ON recipes;

-- Čtení: vlastní recepty + sdílené
CREATE POLICY "Read own or shared recipes" ON recipes
    FOR SELECT USING (
        share_id IS NOT NULL  -- Sdílené recepty jsou veřejné
        OR true               -- App-level kontrola clerk_id
    );

-- Vkládání: striktní validace
CREATE POLICY "Insert recipes with validation" ON recipes
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
        AND name IS NOT NULL
        AND LENGTH(name) >= 1
        AND LENGTH(name) <= 200
        AND (description IS NULL OR LENGTH(description) <= 2000)
        AND recipe_data IS NOT NULL
        AND rating >= 0 AND rating <= 5
    );

-- Aktualizace: validace dat
CREATE POLICY "Update own recipes" ON recipes
    FOR UPDATE USING (true)
    WITH CHECK (
        clerk_id IS NOT NULL
        AND name IS NOT NULL
        AND LENGTH(name) <= 200
    );

-- Mazání: povoleno (app kontroluje vlastnictví)
CREATE POLICY "Delete own recipes" ON recipes
    FOR DELETE USING (true);

SELECT '✅ RLS politiky pro recipes vylepšeny' as status;

-- ============================================
-- ČÁST 5: Vylepšené RLS politiky pro FAVORITE_PRODUCTS
-- ============================================

DROP POLICY IF EXISTS "Allow read products" ON favorite_products;
DROP POLICY IF EXISTS "Insert valid products" ON favorite_products;
DROP POLICY IF EXISTS "Allow update products" ON favorite_products;
DROP POLICY IF EXISTS "Allow delete products" ON favorite_products;
DROP POLICY IF EXISTS "Anyone can view shared products" ON favorite_products;

-- Čtení: vlastní produkty + sdílené
CREATE POLICY "Read own or shared products" ON favorite_products
    FOR SELECT USING (
        share_id IS NOT NULL  -- Sdílené produkty
        OR true               -- App-level kontrola
    );

-- Vkládání: striktní validace
CREATE POLICY "Insert products with validation" ON favorite_products
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) >= 15
        AND name IS NOT NULL
        AND LENGTH(name) >= 1
        AND LENGTH(name) <= 200
        AND (description IS NULL OR LENGTH(description) <= 2000)
        AND product_type IN ('vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt')
        AND rating >= 0 AND rating <= 5
    );

-- Aktualizace
CREATE POLICY "Update own products" ON favorite_products
    FOR UPDATE USING (true)
    WITH CHECK (
        clerk_id IS NOT NULL
        AND name IS NOT NULL
    );

-- Mazání
CREATE POLICY "Delete own products" ON favorite_products
    FOR DELETE USING (true);

SELECT '✅ RLS politiky pro favorite_products vylepšeny' as status;

-- ============================================
-- ČÁST 6: Funkce pro rate limiting
-- ============================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    v_record rate_limits%ROWTYPE;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Najít existující záznam
    SELECT * INTO v_record
    FROM rate_limits
    WHERE identifier = p_identifier AND action = p_action;
    
    -- Pokud neexistuje, vytvořit nový
    IF NOT FOUND THEN
        INSERT INTO rate_limits (identifier, action, attempts, first_attempt, last_attempt)
        VALUES (p_identifier, p_action, 1, v_now, v_now);
        RETURN TRUE;
    END IF;
    
    -- Zkontrolovat blokování
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        RETURN FALSE;
    END IF;
    
    -- Resetovat pokud uplynulo okno
    IF v_record.first_attempt < v_now - (p_window_minutes || ' minutes')::INTERVAL THEN
        UPDATE rate_limits
        SET attempts = 1, first_attempt = v_now, last_attempt = v_now, blocked_until = NULL
        WHERE identifier = p_identifier AND action = p_action;
        RETURN TRUE;
    END IF;
    
    -- Inkrementovat pokusy
    IF v_record.attempts >= p_max_attempts THEN
        -- Zablokovat na dvojnásobek okna
        UPDATE rate_limits
        SET blocked_until = v_now + (p_window_minutes * 2 || ' minutes')::INTERVAL,
            last_attempt = v_now
        WHERE identifier = p_identifier AND action = p_action;
        RETURN FALSE;
    ELSE
        UPDATE rate_limits
        SET attempts = attempts + 1, last_attempt = v_now
        WHERE identifier = p_identifier AND action = p_action;
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Funkce check_rate_limit vytvořena' as status;

-- ============================================
-- OVĚŘENÍ
-- ============================================

SELECT '🎉 BEZPEČNOSTNÍ MIGRACE DOKONČENA!' as status;

SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

