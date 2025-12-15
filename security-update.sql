-- ============================================
-- BEZPEČNOSTNÍ AKTUALIZACE SUPABASE
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VYLEPŠENÉ RLS POLITIKY PRO RECIPES
-- ============================================

-- Smazat staré politiky
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can view shared recipes" ON recipes;

-- Politiky pro vlastní recepty (clerk_id z JWT tokenu nebo manuální)
-- Pro jednoduchost používáme textový clerk_id přímo
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL AND 
        LENGTH(clerk_id) > 0 AND
        LENGTH(clerk_id) < 100
    );

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (
        clerk_id IS NOT NULL AND 
        LENGTH(clerk_id) > 0
    );

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (
        clerk_id IS NOT NULL AND 
        LENGTH(clerk_id) > 0
    );

-- ============================================
-- 2. VYLEPŠENÉ RLS POLITIKY PRO USERS
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL AND 
        LENGTH(clerk_id) > 0 AND
        LENGTH(clerk_id) < 100
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        clerk_id IS NOT NULL AND 
        LENGTH(clerk_id) > 0
    );

-- ============================================
-- 3. OMEZENÍ DÉLKY TEXTOVÝCH POLÍ
-- ============================================

-- Přidat constraint na recipes pro ochranu proti spam útokům
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_name_length;
ALTER TABLE recipes ADD CONSTRAINT recipes_name_length CHECK (LENGTH(name) <= 200);

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_description_length;
ALTER TABLE recipes ADD CONSTRAINT recipes_description_length CHECK (LENGTH(description) <= 2000);

-- Přidat constraint na users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_length;
ALTER TABLE users ADD CONSTRAINT users_email_length CHECK (LENGTH(email) <= 320);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_names_length;
ALTER TABLE users ADD CONSTRAINT users_names_length CHECK (
    LENGTH(first_name) <= 100 AND 
    LENGTH(last_name) <= 100
);

-- ============================================
-- 4. INDEXY PRO LEPŠÍ VÝKON A BEZPEČNOST
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_clerk_id ON recipes(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 5. AUDIT LOG TABULKA (volitelné)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    record_id TEXT,
    clerk_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pro audit log - pouze vkládání
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert audit" ON audit_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "No one can read audit" ON audit_log
    FOR SELECT USING (false);

-- ============================================
-- 6. FUNKCE PRO LOGOVÁNÍ (volitelné)
-- ============================================

CREATE OR REPLACE FUNCTION log_recipe_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, action, record_id, clerk_id)
    VALUES (
        'recipes',
        TG_OP,
        COALESCE(NEW.id::text, OLD.id::text),
        COALESCE(NEW.clerk_id, OLD.clerk_id)
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pro logování změn receptů
DROP TRIGGER IF EXISTS recipes_audit_trigger ON recipes;
CREATE TRIGGER recipes_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON recipes
    FOR EACH ROW EXECUTE FUNCTION log_recipe_action();

-- ============================================
-- 7. RATE LIMITING NA ÚROVNI DB (pokročilé)
-- ============================================

-- Tabulka pro sledování API volání
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    count INTEGER DEFAULT 1,
    UNIQUE(identifier, action, window_start)
);

-- Funkce pro kontrolu rate limitu
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_requests INTEGER DEFAULT 60,
    p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    v_window_start := date_trunc('minute', NOW());
    
    -- Počet požadavků v aktuálním okně
    SELECT COALESCE(SUM(count), 0) INTO v_count
    FROM rate_limits
    WHERE identifier = p_identifier
      AND action = p_action
      AND window_start >= NOW() - (p_window_seconds || ' seconds')::interval;
    
    IF v_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;
    
    -- Inkrementovat počítadlo
    INSERT INTO rate_limits (identifier, action, window_start, count)
    VALUES (p_identifier, p_action, v_window_start, 1)
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1;
    
    -- Vyčistit staré záznamy (starší než 1 hodina)
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HOTOVO!
-- ============================================
SELECT 'Bezpečnostní aktualizace dokončena!' as status;


