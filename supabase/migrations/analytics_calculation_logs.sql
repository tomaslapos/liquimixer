-- =============================================
-- CALCULATION LOGS — Analytics DB (ikgtygabrrvbqyffcqjd)
-- Spustit v SQL Editoru nového analytics projektu
-- 05.03.2026
-- =============================================

CREATE TABLE IF NOT EXISTS calculation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Identifikace uživatele
    clerk_id TEXT,
    -- Anonymní UUID z localStorage (identifikuje zařízení)
    anonymous_id UUID,
    -- Session fingerprint (hash user-agent + locale + screen)
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
    locale TEXT DEFAULT 'en',
    country TEXT,
    device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    screen_resolution TEXT,
    is_pwa BOOLEAN DEFAULT false,
    user_agent TEXT,
    referrer TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_calc_logs_calc_type ON calculation_logs(calc_type);
CREATE INDEX IF NOT EXISTS idx_calc_logs_created_at ON calculation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calc_logs_clerk_id ON calculation_logs(clerk_id) WHERE clerk_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calc_logs_anonymous_id ON calculation_logs(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calc_logs_country ON calculation_logs(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calc_logs_params ON calculation_logs USING GIN(params);

-- RLS: POUZE INSERT pro anon + authenticated (žádné čtení z klienta)
ALTER TABLE calculation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calc_logs_insert_only"
    ON calculation_logs
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "calc_logs_service_full"
    ON calculation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Čištění starých logů: spustit ručně nebo přes dashboard
-- DELETE FROM calculation_logs WHERE created_at < now() - interval '180 days';
