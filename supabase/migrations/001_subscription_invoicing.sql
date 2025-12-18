-- ============================================
-- MIGRACE: Předplatné, Fakturace, Lokalizace
-- LiquiMixer - WOOs, s. r. o.
-- ============================================

-- 1. Tabulka DPH sazeb pro EU země (OSS připravenost)
CREATE TABLE IF NOT EXISTS vat_rates (
    country_code TEXT PRIMARY KEY,
    country_name TEXT NOT NULL,
    country_name_en TEXT NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    region TEXT DEFAULT 'EU',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vložit DPH sazby EU zemí
INSERT INTO vat_rates (country_code, country_name, country_name_en, vat_rate, currency, region) VALUES
    ('CZ', 'Česko', 'Czech Republic', 21.00, 'CZK', 'EU'),
    ('SK', 'Slovensko', 'Slovakia', 20.00, 'EUR', 'EU'),
    ('DE', 'Německo', 'Germany', 19.00, 'EUR', 'EU'),
    ('AT', 'Rakousko', 'Austria', 20.00, 'EUR', 'EU'),
    ('PL', 'Polsko', 'Poland', 23.00, 'EUR', 'EU'),
    ('HU', 'Maďarsko', 'Hungary', 27.00, 'EUR', 'EU'),
    ('FR', 'Francie', 'France', 20.00, 'EUR', 'EU'),
    ('IT', 'Itálie', 'Italy', 22.00, 'EUR', 'EU'),
    ('ES', 'Španělsko', 'Spain', 21.00, 'EUR', 'EU'),
    ('NL', 'Nizozemsko', 'Netherlands', 21.00, 'EUR', 'EU'),
    ('BE', 'Belgie', 'Belgium', 21.00, 'EUR', 'EU'),
    ('PT', 'Portugalsko', 'Portugal', 23.00, 'EUR', 'EU'),
    ('GR', 'Řecko', 'Greece', 24.00, 'EUR', 'EU'),
    ('SE', 'Švédsko', 'Sweden', 25.00, 'EUR', 'EU'),
    ('DK', 'Dánsko', 'Denmark', 25.00, 'EUR', 'EU'),
    ('FI', 'Finsko', 'Finland', 24.00, 'EUR', 'EU'),
    ('IE', 'Irsko', 'Ireland', 23.00, 'EUR', 'EU'),
    ('RO', 'Rumunsko', 'Romania', 19.00, 'EUR', 'EU'),
    ('BG', 'Bulharsko', 'Bulgaria', 20.00, 'EUR', 'EU'),
    ('HR', 'Chorvatsko', 'Croatia', 25.00, 'EUR', 'EU'),
    ('SI', 'Slovinsko', 'Slovenia', 22.00, 'EUR', 'EU'),
    ('LT', 'Litva', 'Lithuania', 21.00, 'EUR', 'EU'),
    ('LV', 'Lotyšsko', 'Latvia', 21.00, 'EUR', 'EU'),
    ('EE', 'Estonsko', 'Estonia', 22.00, 'EUR', 'EU'),
    ('CY', 'Kypr', 'Cyprus', 19.00, 'EUR', 'EU'),
    ('MT', 'Malta', 'Malta', 18.00, 'EUR', 'EU'),
    ('LU', 'Lucembursko', 'Luxembourg', 17.00, 'EUR', 'EU')
ON CONFLICT (country_code) DO UPDATE SET
    vat_rate = EXCLUDED.vat_rate,
    updated_at = NOW();

-- 2. Tabulka lokací uživatelů (pro DPH účely a OSS)
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    country_code TEXT REFERENCES vat_rates(country_code),
    country_name TEXT,
    region TEXT, -- EU / non-EU
    ip_address TEXT,
    detection_method TEXT, -- geoip / browser / manual
    vat_rate DECIMAL(5,2),
    currency TEXT,
    subscription_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_user_locations_clerk_id ON user_locations(clerk_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_subscription ON user_locations(subscription_id);

-- 3. Tabulka souhlasu s obchodními podmínkami
CREATE TABLE IF NOT EXISTS terms_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    terms_version TEXT NOT NULL,
    accepted_at TIMESTAMP DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptance_clerk_id ON terms_acceptance(clerk_id);

-- 4. Sekvence pro číslování faktur
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- 5. Funkce pro generování čísla faktury (formát 3RRNNNNNNN)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    seq_num INTEGER;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');
    seq_num := NEXTVAL('invoice_number_seq');
    RETURN '3' || year_suffix || LPAD(seq_num::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. Aktualizace tabulky subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_country TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_region TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(10,2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS terms_version TEXT;

-- 7. Aktualizace tabulky users
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_subscription_check TIMESTAMP;

-- 8. Aktualizace tabulky invoices (přidání sloupců pro export do iDoklad)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS idoklad_exported BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS idoklad_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS idoklad_exported_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;

-- 9. RLS politiky pro nové tabulky

-- user_locations - pouze vlastní záznamy
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own locations" ON user_locations;
CREATE POLICY "Users can view own locations" ON user_locations
    FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Service can insert locations" ON user_locations;
CREATE POLICY "Service can insert locations" ON user_locations
    FOR INSERT WITH CHECK (true);

-- terms_acceptance - pouze vlastní záznamy
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own terms acceptance" ON terms_acceptance;
CREATE POLICY "Users can view own terms acceptance" ON terms_acceptance
    FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Service can insert terms acceptance" ON terms_acceptance;
CREATE POLICY "Service can insert terms acceptance" ON terms_acceptance
    FOR INSERT WITH CHECK (true);

-- vat_rates - veřejně čitelné
ALTER TABLE vat_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "VAT rates are publicly readable" ON vat_rates;
CREATE POLICY "VAT rates are publicly readable" ON vat_rates
    FOR SELECT USING (true);

-- 10. Komentáře k tabulkám
COMMENT ON TABLE vat_rates IS 'DPH sazby pro EU země - OSS připravenost';
COMMENT ON TABLE user_locations IS 'Lokalizace uživatelů pro DPH účely';
COMMENT ON TABLE terms_acceptance IS 'Audit log souhlasů s obchodními podmínkami';
COMMENT ON FUNCTION generate_invoice_number() IS 'Generuje číslo faktury ve formátu 3RRNNNNNNN';


