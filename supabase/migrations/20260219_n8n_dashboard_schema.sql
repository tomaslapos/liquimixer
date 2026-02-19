-- ============================================
-- N8N DASHBOARD SCHEMA ROZŠÍŘENÍ
-- Datum: 19.02.2026
-- Popis: Nové sloupce pro contact_messages (dashboard, AI poznámky, překlady)
--        + nová tabulka gdpr_deletion_requests
--        + nová tabulka suggestion_features (sběr návrhů)
-- ============================================

-- ============================================
-- ČÁST 1: ROZŠÍŘENÍ contact_messages
-- ============================================

-- AI překlady pro dashboard (admin vidí CZ)
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS detected_language TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject_cs TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS message_cs TEXT;

-- AI analýza rozšíření
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_sentiment TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_notes TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_auto_resolved BOOLEAN DEFAULT false;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_response_sent TEXT;

-- Admin dashboard workflow
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_reply_cs TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_reply_formatted TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_reply_translated TEXT;

-- Email tracking
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS email_message_id TEXT;

-- Obchodní nabídky flag
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_business_offer BOOLEAN DEFAULT false;

-- Thread pro follow-up zprávy
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS thread_id UUID;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS parent_message_id UUID;

-- Nové indexy
CREATE INDEX IF NOT EXISTS idx_contact_messages_detected_language ON contact_messages(detected_language);
CREATE INDEX IF NOT EXISTS idx_contact_messages_ai_auto_resolved ON contact_messages(ai_auto_resolved);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_business ON contact_messages(is_business_offer) WHERE is_business_offer = true;
CREATE INDEX IF NOT EXISTS idx_contact_messages_thread ON contact_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Aktualizovat komentář kategorie
COMMENT ON COLUMN contact_messages.category IS 'Kategorie: technical, payment, refund, recipe, account, gdpr, suggestion, bug, business, partnership, media, other';
COMMENT ON COLUMN contact_messages.status IS 'Stavy: new, ai_processing, auto_resolved, needs_human, admin_replied, sent, closed, spam, duplicate_resolved';
COMMENT ON COLUMN contact_messages.ai_sentiment IS 'Sentiment: positive, neutral, negative, angry';
COMMENT ON COLUMN contact_messages.ai_notes IS 'AI poznámky: shrnutí dotazu, info o firmě, kontext';

-- ============================================
-- ČÁST 2: GDPR DELETION REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    deleted_data JSONB,
    contact_message_id UUID REFERENCES contact_messages(id),
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_gdpr_token ON gdpr_deletion_requests(token);
CREATE INDEX IF NOT EXISTS idx_gdpr_clerk_id ON gdpr_deletion_requests(clerk_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_status ON gdpr_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_expires ON gdpr_deletion_requests(expires_at);

ALTER TABLE gdpr_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages GDPR requests" ON gdpr_deletion_requests;
CREATE POLICY "Service role manages GDPR requests" ON gdpr_deletion_requests
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE gdpr_deletion_requests IS 'GDPR požadavky na smazání účtu s potvrzovacím tokenem (24h platnost)';
COMMENT ON COLUMN gdpr_deletion_requests.status IS 'Stavy: pending, confirmed (smazáno), cancelled, expired';
COMMENT ON COLUMN gdpr_deletion_requests.deleted_data IS 'JSON log smazaných dat pro audit (počty, typy, timestamp)';

-- ============================================
-- ČÁST 3: SUGGESTION FEATURES (sběr návrhů)
-- ============================================

CREATE TABLE IF NOT EXISTS suggestion_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name TEXT NOT NULL,
    feature_category TEXT DEFAULT 'other',
    description TEXT,
    request_count INTEGER DEFAULT 1,
    first_requested_at TIMESTAMPTZ DEFAULT NOW(),
    last_requested_at TIMESTAMPTZ DEFAULT NOW(),
    contact_message_ids UUID[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'collected'
);

CREATE INDEX IF NOT EXISTS idx_suggestion_feature_name ON suggestion_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_suggestion_request_count ON suggestion_features(request_count DESC);
CREATE INDEX IF NOT EXISTS idx_suggestion_category ON suggestion_features(feature_category);

ALTER TABLE suggestion_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages suggestions" ON suggestion_features;
CREATE POLICY "Service role manages suggestions" ON suggestion_features
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE suggestion_features IS 'Agregované návrhy na vylepšení od uživatelů (deduplikované, s počtem)';
COMMENT ON COLUMN suggestion_features.feature_category IS 'Kategorie: ux, calculator, recipes, flavors, products, subscription, other';
COMMENT ON COLUMN suggestion_features.status IS 'Stavy: collected, reviewed, planned, implemented, rejected';

-- ============================================
-- ČÁST 4: AKTUALIZACE COMPLETE_MIGRATION KOMENTÁŘE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'N8N Dashboard Schema Migration Complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Rozšířené tabulky:';
    RAISE NOTICE '  - contact_messages (15 nových sloupců)';
    RAISE NOTICE 'Nové tabulky:';
    RAISE NOTICE '  - gdpr_deletion_requests';
    RAISE NOTICE '  - suggestion_features';
    RAISE NOTICE '============================================';
END $$;
