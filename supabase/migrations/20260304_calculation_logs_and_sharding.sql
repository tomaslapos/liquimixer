-- =============================================
-- CALCULATION LOGS + SHARDING PŘÍPRAVA
-- 04.03.2026
-- =============================================

-- 1. Tabulka pro logování výpočtů
CREATE TABLE IF NOT EXISTS calculation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Identifikace uživatele (nullable — i nepřihlášení uživatelé generují logy)
    clerk_id TEXT,
    -- Anonymní session fingerprint pro nepřihlášené (hash user-agent + locale + screen)
    session_hash TEXT,
    -- Typ kalkulátoru
    calc_type TEXT NOT NULL CHECK (calc_type IN (
        'liquid', 'shakevape', 'liquidpro', 'shortfill', 'dilution',
        'shisha_mix', 'shisha_diy', 'shisha_molasses', 'shisha_tweak'
    )),
    -- Kompletní parametry výpočtu (JSONB — vše co uživatel nastavil)
    params JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Výsledky výpočtu (JSONB — ingredience, objemy)
    results JSONB DEFAULT '{}'::jsonb,
    -- Metadata
    locale TEXT DEFAULT 'cs',
    device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    user_agent TEXT,
    referrer TEXT,
    -- Sharding klíč (příprava pro multi-instance)
    shard_key TEXT DEFAULT 'main',
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy pro efektivní dotazování
CREATE INDEX IF NOT EXISTS idx_calculation_logs_calc_type ON calculation_logs(calc_type);
CREATE INDEX IF NOT EXISTS idx_calculation_logs_created_at ON calculation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculation_logs_clerk_id ON calculation_logs(clerk_id) WHERE clerk_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calculation_logs_shard_key ON calculation_logs(shard_key);
-- JSONB index pro filtrování podle parametrů (GIN)
CREATE INDEX IF NOT EXISTS idx_calculation_logs_params ON calculation_logs USING GIN(params);

-- RLS: Insert-only pro anon i authenticated, select jen pro service_role
ALTER TABLE calculation_logs ENABLE ROW LEVEL SECURITY;

-- Anon + Authenticated mohou pouze INSERT (nikdy SELECT/UPDATE/DELETE)
CREATE POLICY "calculation_logs_insert_only"
    ON calculation_logs
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Service role (edge functions, dashboard) má plný přístup
CREATE POLICY "calculation_logs_service_full"
    ON calculation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Rate limiting funkce — max 60 logů za minutu per session_hash
-- Vrací true pokud je povoleno logovat, false pokud překročen limit
CREATE OR REPLACE FUNCTION check_calc_log_rate_limit(p_session_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM calculation_logs
    WHERE session_hash = p_session_hash
      AND created_at > now() - interval '1 minute';
    
    RETURN recent_count < 60;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Přidat shard_key do existujících tabulek (nullable, default 'main')
DO $$
BEGIN
    -- recipes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'shard_key') THEN
        ALTER TABLE recipes ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_recipes_shard_key ON recipes(shard_key);
    END IF;
    
    -- favorite_products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorite_products' AND column_name = 'shard_key') THEN
        ALTER TABLE favorite_products ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_favorite_products_shard_key ON favorite_products(shard_key);
    END IF;
    
    -- reminders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'shard_key') THEN
        ALTER TABLE reminders ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_reminders_shard_key ON reminders(shard_key);
    END IF;
    
    -- contact_messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'shard_key') THEN
        ALTER TABLE contact_messages ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_contact_messages_shard_key ON contact_messages(shard_key);
    END IF;
    
    -- flavors
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flavors' AND column_name = 'shard_key') THEN
        ALTER TABLE flavors ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_flavors_shard_key ON flavors(shard_key);
    END IF;
    
    -- users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'shard_key') THEN
        ALTER TABLE users ADD COLUMN shard_key TEXT DEFAULT 'main';
        CREATE INDEX IF NOT EXISTS idx_users_shard_key ON users(shard_key);
    END IF;
END $$;

-- 4. Automatické čištění starých logů (starší než 90 dní) — CRON denně o 4:00 UTC
-- Vyžaduje pg_cron rozšíření (Supabase ho má zapnuté)
SELECT cron.schedule(
    'cleanup-old-calculation-logs',
    '0 4 * * *',
    $$DELETE FROM calculation_logs WHERE created_at < now() - interval '90 days'$$
);
