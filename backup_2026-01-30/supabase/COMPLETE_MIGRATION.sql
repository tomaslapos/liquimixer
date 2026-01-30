-- ============================================
-- KOMPLETNÍ SQL MIGRACE PRO LIQUIMIXER PRO
-- Spusťte tento soubor v Supabase SQL Editoru
-- ============================================
-- Datum: 2024
-- Verze: 2.0 - PRO Upgrade
-- ============================================

-- ============================================
-- ČÁST 1: AUDIT LOGS
-- Sledování všech citlivých operací
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clerk_id ON audit_logs(clerk_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only for audit_logs" ON audit_logs;
CREATE POLICY "Service role only for audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE audit_logs IS 'Audit log všech citlivých operací - platby, předplatné, refundy';

-- ============================================
-- ČÁST 2: KONTAKTNÍ ZPRÁVY
-- S AI analýzou a N8N integrací
-- ============================================

-- Nejprve vytvořit tabulku s minimálními sloupci
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Přidat všechny sloupce (IF NOT EXISTS zajistí bezpečnost)
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_priority TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_category TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_suggested_response TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_is_refund_request BOOLEAN DEFAULT false;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2);
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS n8n_processed BOOLEAN DEFAULT false;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS n8n_processed_at TIMESTAMPTZ;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS n8n_workflow_id TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS locale TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS resolved_by TEXT;

-- Nyní vytvořit indexy (sloupce už existují)
CREATE INDEX IF NOT EXISTS idx_contact_messages_clerk_id ON contact_messages(clerk_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_refund ON contact_messages(ai_is_refund_request) WHERE ai_is_refund_request = true;

-- RLS politiky
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
CREATE POLICY "Users can view own messages" ON contact_messages
    FOR SELECT USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
CREATE POLICY "Anyone can insert messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update messages" ON contact_messages;
CREATE POLICY "Service role can update messages" ON contact_messages
    FOR UPDATE USING (auth.role() = 'service_role');

COMMENT ON TABLE contact_messages IS 'Kontaktní zprávy s AI analýzou a N8N integrací';
COMMENT ON COLUMN contact_messages.category IS 'Kategorie: technical, payment, recipe, account, suggestion, gdpr, other';

-- ============================================
-- ČÁST 3: REFUND POŽADAVKY
-- Polo-automatické vrácení plateb
-- ============================================

CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_message_id UUID REFERENCES contact_messages(id),
    subscription_id UUID,
    clerk_id TEXT NOT NULL,
    
    -- Platební údaje
    original_order_number TEXT NOT NULL,
    original_transaction_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CZK',
    
    -- Stav
    status TEXT DEFAULT 'pending_review',
    
    -- AI doporučení
    ai_recommendation TEXT,
    ai_confidence DECIMAL(3,2),
    ai_reason TEXT,
    
    -- Validace
    payment_age_days INTEGER,
    is_within_refund_period BOOLEAN,
    previous_refunds_count INTEGER DEFAULT 0,
    
    -- Schválení
    approval_token TEXT UNIQUE,
    approval_token_expires_at TIMESTAMPTZ,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- GP webpay refund
    refund_transaction_id TEXT,
    refund_response JSONB,
    refunded_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_clerk_id ON refund_requests(clerk_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_subscription ON refund_requests(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_token ON refund_requests(approval_token) WHERE approval_token IS NOT NULL;

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own refunds" ON refund_requests;
CREATE POLICY "Users can view own refunds" ON refund_requests
    FOR SELECT USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Service role can manage refunds" ON refund_requests;
CREATE POLICY "Service role can manage refunds" ON refund_requests
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE refund_requests IS 'Požadavky na vrácení plateb s AI analýzou';
COMMENT ON COLUMN refund_requests.status IS 'Stavy: pending_review, pending_approval, approved, processing, completed, rejected, cancelled';

-- ============================================
-- ČÁST 4: PAYMENTS (GP webpay)
-- Platby přístupné pouze přes Edge Functions
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    subscription_id UUID,
    
    -- GP webpay údaje
    order_number TEXT UNIQUE NOT NULL,
    merchant_order_number TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CZK',
    
    -- Stav platby
    status TEXT DEFAULT 'pending',
    
    -- GP webpay response
    prcode TEXT,
    srcode TEXT,
    result_text TEXT,
    card_number_masked TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Refund info
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    refund_id UUID REFERENCES refund_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_clerk_id ON payments(clerk_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_number ON payments(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to payments" ON payments;
CREATE POLICY "No direct access to payments" ON payments
    FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
CREATE POLICY "Service role can manage payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE payments IS 'Platby přes GP webpay - přístupné pouze přes Edge Functions';
COMMENT ON COLUMN payments.status IS 'Stavy: pending, processing, completed, failed, refunded';

-- ============================================
-- ČÁST 5: ROZŠÍŘENÍ TABULKY USERS
-- Přidání subscription sloupců
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';

-- RLS pro users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    WITH CHECK (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- ============================================
-- ČÁST 6: ROZŠÍŘENÍ TABULKY RECIPES
-- Multi-flavor podpora
-- ============================================

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS flavors_data JSONB;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_pro_recipe BOOLEAN DEFAULT false;

-- ============================================
-- ČÁST 7: ROZŠÍŘENÍ TABULKY SUBSCRIPTIONS
-- RLS a nové sloupce
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (
        clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Přidání reference na subscriptions (pokud neexistuje)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_refund_subscription' 
        AND table_name = 'refund_requests'
    ) THEN
        ALTER TABLE refund_requests 
            ADD CONSTRAINT fk_refund_subscription 
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
    END IF;
END $$;

-- ============================================
-- ČÁST 8: POMOCNÉ FUNKCE
-- ============================================

-- Generování approval tokenu pro refundy
CREATE OR REPLACE FUNCTION generate_approval_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..64 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_approval_token() IS 'Generuje bezpečný 64-znakový token pro schválení refundu';

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refund_requests_updated_at ON refund_requests;
CREATE TRIGGER refund_requests_updated_at
    BEFORE UPDATE ON refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ČÁST 9: OVĚŘENÍ INSTALACE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRACE DOKONČENA ÚSPĚŠNĚ!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Vytvořené tabulky:';
    RAISE NOTICE '  - audit_logs';
    RAISE NOTICE '  - contact_messages';
    RAISE NOTICE '  - refund_requests';
    RAISE NOTICE '  - payments';
    RAISE NOTICE '';
    RAISE NOTICE 'Rozšířené tabulky:';
    RAISE NOTICE '  - users (subscription_tier, subscription_id, ...)';
    RAISE NOTICE '  - recipes (flavors_data, is_pro_recipe)';
    RAISE NOTICE '  - subscriptions (RLS politiky)';
    RAISE NOTICE '';
    RAISE NOTICE 'Všechny RLS politiky byly aktivovány.';
    RAISE NOTICE '============================================';
END $$;













