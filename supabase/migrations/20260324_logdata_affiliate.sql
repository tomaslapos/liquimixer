-- ============================================
-- LOGDATA: Affiliate tracking (24.03.2026)
-- 1. Přidat affiliate_shop_name do report_users
-- 2. Vytvořit tabulku report_affiliate_clicks
-- Spouštět na LOGDATA DB (ikgtygabrrvbqyffcqjd)
-- ============================================

-- 1. Přidat sloupec affiliate_shop_name do report_users
ALTER TABLE report_users ADD COLUMN IF NOT EXISTS affiliate_shop_name TEXT;
ALTER TABLE report_users ADD COLUMN IF NOT EXISTS affiliate_shop_slug TEXT;

-- 2. Tabulka pro logování kliků na eshop
CREATE TABLE IF NOT EXISTS report_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT,
    anonymous_id UUID,
    affiliate_shop_name TEXT NOT NULL,
    affiliate_shop_slug TEXT NOT NULL,
    click_source TEXT NOT NULL,
    locale TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexy pro efektivní dotazování
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_shop ON report_affiliate_clicks(affiliate_shop_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON report_affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clerk ON report_affiliate_clicks(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_users_affiliate ON report_users(affiliate_shop_slug) WHERE affiliate_shop_slug IS NOT NULL;

-- RLS
ALTER TABLE report_affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages report_affiliate_clicks" ON report_affiliate_clicks
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anon can insert affiliate clicks" ON report_affiliate_clicks
    FOR INSERT WITH CHECK (true);

-- Ověření
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== LOGDATA AFFILIATE TRACKING ===';
    RAISE NOTICE 'report_users: přidány sloupce affiliate_shop_name, affiliate_shop_slug';
    RAISE NOTICE 'report_affiliate_clicks: vytvořena tabulka pro logování kliků';
    RAISE NOTICE '';
END $$;
