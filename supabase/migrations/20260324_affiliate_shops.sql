-- ============================================
-- ESHOP AFFILIATE SYSTEM (24.03.2026)
-- Tabulky pro správu affiliate eshopů a propojení s uživateli
-- ============================================

-- 1. Tabulka affiliate eshopů (spravuje admin v dashboardu)
CREATE TABLE IF NOT EXISTS affiliate_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    partnership_start DATE NOT NULL DEFAULT CURRENT_DATE,
    partnership_end DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    embed_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pro slug lookup (rychlé vyhledání při návštěvě z eshopu)
CREATE INDEX IF NOT EXISTS idx_affiliate_shops_slug ON affiliate_shops(slug) WHERE is_active = true;

-- 2. Tabulka propojení uživatel ↔ eshop
CREATE TABLE IF NOT EXISTS user_affiliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    affiliate_shop_id UUID NOT NULL REFERENCES affiliate_shops(id) ON DELETE CASCADE,
    first_visit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clerk_id, affiliate_shop_id)
);

-- Index pro rychlé vyhledání afiliace uživatele
CREATE INDEX IF NOT EXISTS idx_user_affiliations_clerk_id ON user_affiliations(clerk_id);
CREATE INDEX IF NOT EXISTS idx_user_affiliations_shop_id ON user_affiliations(affiliate_shop_id);

-- 3. RLS policies
ALTER TABLE affiliate_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_affiliations ENABLE ROW LEVEL SECURITY;

-- affiliate_shops: service_role má plný přístup (dashboard), anon/authenticated čte jen aktivní
CREATE POLICY "Service role manages affiliate_shops" ON affiliate_shops
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read active affiliate_shops" ON affiliate_shops
    FOR SELECT USING (is_active = true AND (partnership_end IS NULL OR partnership_end >= CURRENT_DATE));

-- user_affiliations: service_role plný přístup, uživatel čte jen své
CREATE POLICY "Service role manages user_affiliations" ON user_affiliations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can read own affiliations" ON user_affiliations
    FOR SELECT USING (clerk_id = (auth.jwt() ->> 'sub'));

-- INSERT: uživatel může vytvořit vlastní afiliaci (při první návštěvě z eshopu)
CREATE POLICY "Users can insert own affiliations" ON user_affiliations
    FOR INSERT WITH CHECK (clerk_id = (auth.jwt() ->> 'sub'));

-- 4. Trigger pro updated_at
CREATE OR REPLACE FUNCTION update_affiliate_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliate_shops_updated_at ON affiliate_shops;
CREATE TRIGGER trigger_affiliate_shops_updated_at
    BEFORE UPDATE ON affiliate_shops
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_shops_updated_at();

-- 5. Ověření
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ESHOP AFFILIATE SYSTEM ===';
    RAISE NOTICE 'Vytvořeny tabulky:';
    RAISE NOTICE '  - affiliate_shops (správa eshopů)';
    RAISE NOTICE '  - user_affiliations (propojení uživatel-eshop)';
    RAISE NOTICE 'RLS policies nastaveny.';
    RAISE NOTICE '';
END $$;
