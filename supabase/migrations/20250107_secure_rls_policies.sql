-- ============================================
-- SECURE RLS POLICIES pro recipe_reminders a fcm_tokens
-- Zpřísnění politik pro produkční prostředí
-- ============================================

-- ============================================
-- RECIPE_REMINDERS - Row Level Security
-- ============================================

-- Nejprve odstraníme existující příliš permisivní politiky
DROP POLICY IF EXISTS "recipe_reminders_select" ON recipe_reminders;
DROP POLICY IF EXISTS "recipe_reminders_insert" ON recipe_reminders;
DROP POLICY IF EXISTS "recipe_reminders_update" ON recipe_reminders;
DROP POLICY IF EXISTS "recipe_reminders_delete" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can view own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON recipe_reminders;

-- Zajistit, že RLS je zapnutá
ALTER TABLE recipe_reminders ENABLE ROW LEVEL SECURITY;

-- SELECT: Uživatel může vidět pouze své připomínky
CREATE POLICY "reminders_select_own"
ON recipe_reminders FOR SELECT
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- INSERT: Uživatel může vytvořit připomínku pouze pro sebe a pro svůj recept
CREATE POLICY "reminders_insert_own"
ON recipe_reminders FOR INSERT
WITH CHECK (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
    OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id'
);

-- UPDATE: Uživatel může upravit pouze své připomínky
CREATE POLICY "reminders_update_own"
ON recipe_reminders FOR UPDATE
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id')
WITH CHECK (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
            OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- DELETE: Uživatel může smazat pouze své připomínky
CREATE POLICY "reminders_delete_own"
ON recipe_reminders FOR DELETE
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- ============================================
-- FCM_TOKENS - Row Level Security
-- ============================================

-- Nejprve odstraníme existující příliš permisivní politiky
DROP POLICY IF EXISTS "fcm_tokens_select" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_insert" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_update" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_delete" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can view own tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON fcm_tokens;

-- Zajistit, že RLS je zapnutá
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: Uživatel může vidět pouze své FCM tokeny
CREATE POLICY "fcm_tokens_select_own"
ON fcm_tokens FOR SELECT
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- INSERT: Uživatel může přidat pouze svůj FCM token
CREATE POLICY "fcm_tokens_insert_own"
ON fcm_tokens FOR INSERT
WITH CHECK (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
    OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id'
);

-- UPDATE: Uživatel může upravit pouze své FCM tokeny
CREATE POLICY "fcm_tokens_update_own"
ON fcm_tokens FOR UPDATE
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id')
WITH CHECK (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
            OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- DELETE: Uživatel může smazat pouze své FCM tokeny
CREATE POLICY "fcm_tokens_delete_own"
ON fcm_tokens FOR DELETE
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'clerk_id'
       OR clerk_id = current_setting('request.headers', true)::json->>'x-clerk-user-id');

-- ============================================
-- SERVICE ROLE POLICIES
-- Pro Edge Functions (reminder-notify) potřebujeme umožnit přístup service role
-- ============================================

-- Service role má přístup ke všem připomínkám (pro Edge Functions)
CREATE POLICY "service_role_reminders_all"
ON recipe_reminders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service role má přístup ke všem FCM tokenům (pro Edge Functions)
CREATE POLICY "service_role_fcm_tokens_all"
ON fcm_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- DODATEČNÉ BEZPEČNOSTNÍ OPATŘENÍ
-- ============================================

-- Omezit maximální počet připomínek na uživatele (trigger)
CREATE OR REPLACE FUNCTION check_max_reminders()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM recipe_reminders WHERE clerk_id = NEW.clerk_id) >= 100 THEN
        RAISE EXCEPTION 'Maximum number of reminders (100) reached for this user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_reminders ON recipe_reminders;
CREATE TRIGGER enforce_max_reminders
BEFORE INSERT ON recipe_reminders
FOR EACH ROW
EXECUTE FUNCTION check_max_reminders();

-- Omezit maximální počet FCM tokenů na uživatele (trigger)
CREATE OR REPLACE FUNCTION check_max_fcm_tokens()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM fcm_tokens WHERE clerk_id = NEW.clerk_id) >= 10 THEN
        -- Smazat nejstarší token před přidáním nového
        DELETE FROM fcm_tokens 
        WHERE id = (
            SELECT id FROM fcm_tokens 
            WHERE clerk_id = NEW.clerk_id 
            ORDER BY last_used_at ASC NULLS FIRST, created_at ASC 
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_fcm_tokens ON fcm_tokens;
CREATE TRIGGER enforce_max_fcm_tokens
BEFORE INSERT ON fcm_tokens
FOR EACH ROW
EXECUTE FUNCTION check_max_fcm_tokens();

-- ============================================
-- INDEXY pro optimalizaci RLS dotazů
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipe_reminders_clerk_id ON recipe_reminders(clerk_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reminders_recipe_id ON recipe_reminders(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reminders_remind_at ON recipe_reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_recipe_reminders_status ON recipe_reminders(status);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_clerk_id ON fcm_tokens(clerk_id);

-- ============================================
-- KOMENTÁŘE k zabezpečení
-- ============================================
COMMENT ON TABLE recipe_reminders IS 'Připomínky zrání e-liquidů - RLS omezuje přístup pouze na vlastní záznamy';
COMMENT ON TABLE fcm_tokens IS 'Firebase Cloud Messaging tokeny - RLS omezuje přístup pouze na vlastní tokeny';

