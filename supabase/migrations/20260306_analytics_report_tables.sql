-- =============================================
-- REPORT TABULKY — Analytics DB (ikgtygabrrvbqyffcqjd)
-- Spustit v SQL Editoru ANALYTICS projektu
-- Kopie produkčních dat pro Big Data reporting
-- 06.03.2026
-- =============================================

-- =============================================
-- 1. report_users — agregovaní uživatelé
-- =============================================
CREATE TABLE IF NOT EXISTS report_users (
    clerk_id TEXT PRIMARY KEY,
    email_domain TEXT,
    locale TEXT,
    country TEXT,
    has_subscription BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'none',
    recipe_count INT DEFAULT 0,
    product_count INT DEFAULT 0,
    reminder_count INT DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_users_locale ON report_users(locale);
CREATE INDEX IF NOT EXISTS idx_report_users_country ON report_users(country);
CREATE INDEX IF NOT EXISTS idx_report_users_subscription ON report_users(has_subscription) WHERE has_subscription = true;
CREATE INDEX IF NOT EXISTS idx_report_users_created ON report_users(created_at);

-- =============================================
-- 2. report_recipes — uložené recepty
-- =============================================
CREATE TABLE IF NOT EXISTS report_recipes (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    name TEXT,
    description TEXT,
    form_type TEXT,
    is_public BOOLEAN DEFAULT false,
    public_status TEXT,
    difficulty_level TEXT,
    rating INT DEFAULT 0,
    public_rating_avg NUMERIC DEFAULT 0,
    public_rating_count INT DEFAULT 0,
    is_pro_recipe BOOLEAN DEFAULT false,
    recipe_data JSONB,
    flavors_data JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_recipes_clerk ON report_recipes(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_recipes_form_type ON report_recipes(form_type);
CREATE INDEX IF NOT EXISTS idx_report_recipes_public ON report_recipes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_report_recipes_public_status ON report_recipes(public_status);
CREATE INDEX IF NOT EXISTS idx_report_recipes_created ON report_recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_report_recipes_difficulty ON report_recipes(difficulty_level);

-- =============================================
-- 3. report_products — oblíbené produkty uživatelů
-- =============================================
CREATE TABLE IF NOT EXISTS report_products (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    name TEXT,
    product_type TEXT,
    description TEXT,
    manufacturer TEXT,
    flavor_category TEXT,
    flavor_product_type TEXT,
    flavor_id UUID,
    steep_days INT,
    stock_quantity NUMERIC DEFAULT 0,
    rating INT DEFAULT 0,
    product_url TEXT,
    percent_min NUMERIC,
    percent_max NUMERIC,
    percent_optimal NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_products_clerk ON report_products(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_products_type ON report_products(product_type);
CREATE INDEX IF NOT EXISTS idx_report_products_manufacturer ON report_products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_report_products_flavor_id ON report_products(flavor_id) WHERE flavor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_report_products_created ON report_products(created_at);

-- =============================================
-- 4. report_subscriptions — předplatné
-- =============================================
CREATE TABLE IF NOT EXISTS report_subscriptions (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    plan_type TEXT,
    status TEXT,
    payment_status TEXT,
    amount NUMERIC,
    vat_rate NUMERIC,
    vat_amount NUMERIC,
    total_amount NUMERIC,
    currency TEXT,
    user_locale TEXT,
    user_country TEXT,
    auto_renew BOOLEAN DEFAULT false,
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_subs_clerk ON report_subscriptions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_subs_status ON report_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_report_subs_currency ON report_subscriptions(currency);
CREATE INDEX IF NOT EXISTS idx_report_subs_country ON report_subscriptions(user_country);
CREATE INDEX IF NOT EXISTS idx_report_subs_valid_to ON report_subscriptions(valid_to);
CREATE INDEX IF NOT EXISTS idx_report_subs_created ON report_subscriptions(created_at);

-- =============================================
-- 5. report_reminders — připomínky zrání
-- =============================================
CREATE TABLE IF NOT EXISTS report_reminders (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    recipe_id UUID,
    recipe_name TEXT,
    flavor_name TEXT,
    flavor_type TEXT,
    status TEXT,
    mixed_at DATE,
    remind_at DATE,
    steep_days INT,
    stock_percent INT DEFAULT 100,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_reminders_clerk ON report_reminders(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_reminders_status ON report_reminders(status);
CREATE INDEX IF NOT EXISTS idx_report_reminders_recipe ON report_reminders(recipe_id);
CREATE INDEX IF NOT EXISTS idx_report_reminders_created ON report_reminders(created_at);
CREATE INDEX IF NOT EXISTS idx_report_reminders_steep ON report_reminders(steep_days);

-- =============================================
-- 6. report_recipe_ratings — hodnocení receptů
-- =============================================
CREATE TABLE IF NOT EXISTS report_recipe_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID,
    clerk_id TEXT,
    rating INT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_id, clerk_id)
);

CREATE INDEX IF NOT EXISTS idx_report_ratings_recipe ON report_recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_report_ratings_clerk ON report_recipe_ratings(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_ratings_rating ON report_recipe_ratings(rating);

-- =============================================
-- 7. report_flavors — databáze příchutí (snapshot)
-- =============================================
CREATE TABLE IF NOT EXISTS report_flavors (
    id UUID PRIMARY KEY,
    name TEXT,
    manufacturer_code TEXT,
    product_type TEXT,
    category TEXT,
    min_percent NUMERIC,
    max_percent NUMERIC,
    recommended_percent NUMERIC,
    steep_days INT,
    status TEXT,
    avg_rating NUMERIC DEFAULT 0,
    rating_count INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_flavors_manufacturer ON report_flavors(manufacturer_code);
CREATE INDEX IF NOT EXISTS idx_report_flavors_type ON report_flavors(product_type);
CREATE INDEX IF NOT EXISTS idx_report_flavors_category ON report_flavors(category);
CREATE INDEX IF NOT EXISTS idx_report_flavors_status ON report_flavors(status);

-- =============================================
-- 8. report_payments — platby
-- =============================================
CREATE TABLE IF NOT EXISTS report_payments (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    subscription_id UUID,
    order_number TEXT,
    amount NUMERIC,
    currency TEXT,
    status TEXT,
    prcode TEXT,
    srcode TEXT,
    created_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount NUMERIC,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_payments_clerk ON report_payments(clerk_id);
CREATE INDEX IF NOT EXISTS idx_report_payments_status ON report_payments(status);
CREATE INDEX IF NOT EXISTS idx_report_payments_currency ON report_payments(currency);
CREATE INDEX IF NOT EXISTS idx_report_payments_created ON report_payments(created_at);

-- =============================================
-- 9. report_contact_messages — kontaktní zprávy
-- =============================================
CREATE TABLE IF NOT EXISTS report_contact_messages (
    id UUID PRIMARY KEY,
    clerk_id TEXT,
    category TEXT,
    status TEXT,
    priority TEXT,
    locale TEXT,
    detected_language TEXT,
    ai_sentiment TEXT,
    ai_category TEXT,
    ai_auto_resolved BOOLEAN DEFAULT false,
    is_business_offer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_contacts_category ON report_contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_report_contacts_status ON report_contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_report_contacts_sentiment ON report_contact_messages(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_report_contacts_created ON report_contact_messages(created_at);

-- =============================================
-- 10. sync_log — log synchronizací
-- =============================================
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL,
    tables_synced TEXT[],
    rows_synced JSONB,
    duration_ms INT,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_created ON sync_log(created_at);

-- =============================================
-- RLS — pouze service_role
-- =============================================
ALTER TABLE report_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Policies pro service_role
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'report_users', 'report_recipes', 'report_products', 
        'report_subscriptions', 'report_reminders', 'report_recipe_ratings',
        'report_flavors', 'report_payments', 'report_contact_messages', 'sync_log'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON %I', tbl);
        EXECUTE format('CREATE POLICY "Service role full access" ON %I FOR ALL USING (auth.role() = ''service_role'')', tbl);
    END LOOP;
END $$;

-- =============================================
-- OVĚŘENÍ
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Analytics Report Tables Migration Complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Vytvořené tabulky:';
    RAISE NOTICE '  - report_users';
    RAISE NOTICE '  - report_recipes';
    RAISE NOTICE '  - report_products';
    RAISE NOTICE '  - report_subscriptions';
    RAISE NOTICE '  - report_reminders';
    RAISE NOTICE '  - report_recipe_ratings';
    RAISE NOTICE '  - report_flavors';
    RAISE NOTICE '  - report_payments';
    RAISE NOTICE '  - report_contact_messages';
    RAISE NOTICE '  - sync_log';
    RAISE NOTICE '============================================';
END $$;
