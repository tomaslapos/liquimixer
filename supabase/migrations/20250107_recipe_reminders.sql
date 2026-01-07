-- ============================================
-- RECIPE REMINDERS - Připomínky zrání liquidů
-- Migrace pro LiquiMixer
-- Datum: 2025-01-07
-- ============================================

-- ============================================
-- TABULKA: recipe_reminders
-- Připomínky zrání vázané na uživatele a recepty
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    clerk_id TEXT NOT NULL,
    
    -- Informace o míchání
    mixed_at DATE NOT NULL,
    remind_at DATE NOT NULL,
    remind_time TIME DEFAULT '16:30',
    
    -- Informace pro notifikaci (cache, aby se nemuselo načítat z recipes)
    flavor_type TEXT,
    flavor_name TEXT,
    recipe_name TEXT,
    
    -- Stav připomínky
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    
    -- Firebase Cloud Messaging
    fcm_token TEXT,
    
    -- Časová zóna uživatele
    timezone TEXT DEFAULT 'Europe/Prague',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Komentáře
COMMENT ON TABLE recipe_reminders IS 'Připomínky zrání liquidů - vázané na uživatele a recepty';
COMMENT ON COLUMN recipe_reminders.clerk_id IS 'Vlastník připomínky (ne nutně vlastník receptu)';
COMMENT ON COLUMN recipe_reminders.mixed_at IS 'Datum, kdy byl liquid namíchán';
COMMENT ON COLUMN recipe_reminders.remind_at IS 'Datum, kdy má být odeslána připomínka';
COMMENT ON COLUMN recipe_reminders.remind_time IS 'Čas odeslání připomínky (lokální čas uživatele)';
COMMENT ON COLUMN recipe_reminders.flavor_type IS 'Typ příchuti pro výpočet doby zrání';
COMMENT ON COLUMN recipe_reminders.fcm_token IS 'Firebase Cloud Messaging token pro push notifikace';

-- ============================================
-- INDEXY
-- ============================================

-- Index pro rychlé vyhledávání připomínek uživatele
CREATE INDEX IF NOT EXISTS idx_reminders_clerk ON recipe_reminders(clerk_id);

-- Index pro připomínky k receptu
CREATE INDEX IF NOT EXISTS idx_reminders_recipe ON recipe_reminders(recipe_id);

-- Index pro cron job - pending reminders pro daný den
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON recipe_reminders(remind_at, status) 
    WHERE status = 'pending';

-- Index pro kombinaci uživatel + recept
CREATE INDEX IF NOT EXISTS idx_reminders_clerk_recipe ON recipe_reminders(clerk_id, recipe_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE recipe_reminders ENABLE ROW LEVEL SECURITY;

-- Uživatelé mohou vidět pouze své připomínky
DROP POLICY IF EXISTS "Users can view own reminders" ON recipe_reminders;
CREATE POLICY "Users can view own reminders" ON recipe_reminders
    FOR SELECT USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

-- Uživatelé mohou vytvářet připomínky
DROP POLICY IF EXISTS "Users can create reminders" ON recipe_reminders;
CREATE POLICY "Users can create reminders" ON recipe_reminders
    FOR INSERT WITH CHECK (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- Uživatelé mohou upravovat pouze své připomínky
DROP POLICY IF EXISTS "Users can update own reminders" ON recipe_reminders;
CREATE POLICY "Users can update own reminders" ON recipe_reminders
    FOR UPDATE USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

-- Uživatelé mohou mazat pouze své připomínky
DROP POLICY IF EXISTS "Users can delete own reminders" ON recipe_reminders;
CREATE POLICY "Users can delete own reminders" ON recipe_reminders
    FOR DELETE USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

-- ============================================
-- TABULKA: fcm_tokens
-- FCM tokeny uživatelů pro push notifikace
-- ============================================

CREATE TABLE IF NOT EXISTS fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    token TEXT NOT NULL,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    -- Unikátní kombinace uživatel + token
    UNIQUE(clerk_id, token)
);

COMMENT ON TABLE fcm_tokens IS 'Firebase Cloud Messaging tokeny pro push notifikace';

-- Indexy
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_clerk ON fcm_tokens(clerk_id);

-- RLS
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tokens" ON fcm_tokens;
CREATE POLICY "Users can manage own tokens" ON fcm_tokens
    FOR ALL USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- ============================================
-- TRIGGER: Aktualizace updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_reminder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reminders_updated_at ON recipe_reminders;
CREATE TRIGGER trigger_reminders_updated_at
    BEFORE UPDATE ON recipe_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_reminder_updated_at();

-- ============================================
-- POZNÁMKY K IMPLEMENTACI
-- ============================================
-- 
-- 1. Edge Function `reminder-notify` bude:
--    - Spouštěna každou hodinu pomocí pg_cron nebo externího cronu
--    - Kontrolovat připomínky kde remind_at = CURRENT_DATE a remind_time <= NOW()
--    - Odesílat push notifikace přes Firebase Cloud Messaging
--    - Aktualizovat status na 'sent' a nastavit sent_at
--
-- 2. Pro aktivaci pg_cron v Supabase:
--    - Jít do Dashboard > Database > Extensions
--    - Povolit pg_cron extension
--    - Vytvořit cron job:
--    
--    SELECT cron.schedule(
--        'send-maturity-reminders',
--        '0 * * * *',  -- Každou hodinu
--        $$SELECT net.http_post(
--            url := 'https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/reminder-notify',
--            headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
--        )$$
--    );

