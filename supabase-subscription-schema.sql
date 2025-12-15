-- ============================================
-- LIQUIMIXER SUBSCRIPTION & BILLING SCHEMA
-- Předplatné, fakturace a platby
-- ============================================

-- ============================================
-- ROZŠÍŘENÍ TABULKY USERS O FAKTURAČNÍ ÚDAJE
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'person' CHECK (billing_type IN ('person', 'company'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_company TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_street TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_zip TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'CZ';
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_ico TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_dic TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'cs';

-- ============================================
-- TABULKA PŘEDPLATNÉHO
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    
    -- Typ a stav předplatného
    plan_type TEXT NOT NULL DEFAULT 'yearly' CHECK (plan_type IN ('yearly', 'lifetime')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'refunded')),
    
    -- Platnost předplatného
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    
    -- Platební informace
    payment_id TEXT,                    -- ID platby z Comgate
    payment_method TEXT,                -- Způsob platby (card, bank_transfer, etc.)
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded', 'failed')),
    
    -- Částky
    amount DECIMAL(10,2) NOT NULL,      -- Částka bez DPH
    vat_rate DECIMAL(5,2) DEFAULT 21,   -- Sazba DPH (21%)
    vat_amount DECIMAL(10,2),           -- Částka DPH
    total_amount DECIMAL(10,2),         -- Celková částka s DPH
    currency TEXT DEFAULT 'CZK',
    
    -- Automatické obnovení
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- Časové značky
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- ============================================
-- TABULKA FAKTUR
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Číslo faktury (formát: RRRR-XXXX)
    invoice_number TEXT UNIQUE NOT NULL,
    
    -- Typ dokladu
    document_type TEXT DEFAULT 'invoice' CHECK (document_type IN ('invoice', 'proforma', 'credit_note')),
    
    -- Důležitá data
    issue_date DATE NOT NULL,                    -- Datum vystavení
    taxable_supply_date DATE NOT NULL,           -- Datum zdanitelného plnění
    due_date DATE NOT NULL,                      -- Datum splatnosti
    
    -- Dodavatel (WOOs)
    supplier_name TEXT NOT NULL DEFAULT 'WOOs s.r.o.',
    supplier_street TEXT,
    supplier_city TEXT,
    supplier_zip TEXT,
    supplier_country TEXT DEFAULT 'CZ',
    supplier_ico TEXT,
    supplier_dic TEXT,
    supplier_bank_account TEXT,
    supplier_bank_name TEXT,
    supplier_iban TEXT,
    supplier_swift TEXT,
    
    -- Odběratel (zákazník)
    customer_type TEXT DEFAULT 'person' CHECK (customer_type IN ('person', 'company')),
    customer_name TEXT NOT NULL,
    customer_company TEXT,
    customer_street TEXT,
    customer_city TEXT,
    customer_zip TEXT,
    customer_country TEXT DEFAULT 'CZ',
    customer_ico TEXT,
    customer_dic TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    
    -- Položky faktury (JSON array)
    items JSONB NOT NULL DEFAULT '[]',
    /*
    Struktura položky:
    {
        "description": "Roční předplatné LiquiMixer",
        "quantity": 1,
        "unit": "ks",
        "unit_price": 299.00,
        "vat_rate": 21,
        "vat_amount": 62.79,
        "total_without_vat": 299.00,
        "total_with_vat": 361.79
    }
    */
    
    -- Celkové částky
    subtotal DECIMAL(10,2) NOT NULL,            -- Celkem bez DPH
    vat_amount DECIMAL(10,2) NOT NULL,          -- Celkem DPH
    total DECIMAL(10,2) NOT NULL,               -- Celkem s DPH
    currency TEXT DEFAULT 'CZK',
    
    -- Stav faktury
    status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'sent', 'paid', 'cancelled', 'overdue')),
    paid_at TIMESTAMPTZ,
    
    -- Způsob platby
    payment_method TEXT,
    payment_reference TEXT,                      -- Variabilní symbol
    
    -- Poznámky
    notes TEXT,
    internal_notes TEXT,
    
    -- Lokalizace
    locale TEXT DEFAULT 'cs',
    
    -- PDF a soubory
    pdf_url TEXT,
    
    -- Časové značky
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- ============================================
-- TABULKA PLATEBNÍCH TRANSAKCÍ (COMGATE LOG)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Comgate data
    comgate_trans_id TEXT UNIQUE,               -- ID transakce z Comgate
    comgate_ref_id TEXT,                        -- Referenční ID
    
    -- Detaily transakce
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CZK',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'failed', 'authorized')),
    payment_method TEXT,                        -- CARD, BANK_ALL, GPAY, APPLEPAY, etc.
    
    -- Odpověď z Comgate
    response_code TEXT,
    response_message TEXT,
    
    -- IP a bezpečnost
    client_ip TEXT,
    user_agent TEXT,
    
    -- Časové značky
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- TABULKA PRO LOKALIZACI
-- ============================================

CREATE TABLE IF NOT EXISTS locales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,                  -- cs, en, sk, de, etc.
    name TEXT NOT NULL,                         -- Čeština, English, etc.
    native_name TEXT NOT NULL,                  -- Čeština, English, etc.
    currency TEXT DEFAULT 'CZK',
    currency_symbol TEXT DEFAULT 'Kč',
    date_format TEXT DEFAULT 'DD.MM.YYYY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vložit výchozí lokalizace
INSERT INTO locales (code, name, native_name, currency, currency_symbol, date_format) VALUES
    ('cs', 'Czech', 'Čeština', 'CZK', 'Kč', 'DD.MM.YYYY'),
    ('sk', 'Slovak', 'Slovenčina', 'EUR', '€', 'DD.MM.YYYY'),
    ('en', 'English', 'English', 'EUR', '€', 'YYYY-MM-DD'),
    ('de', 'German', 'Deutsch', 'EUR', '€', 'DD.MM.YYYY')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- TABULKA CENÍKU
-- ============================================

CREATE TABLE IF NOT EXISTS pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type TEXT NOT NULL,                    -- yearly, lifetime
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,               -- Cena bez DPH
    vat_rate DECIMAL(5,2) DEFAULT 21,
    currency TEXT DEFAULT 'CZK',
    duration_days INTEGER,                       -- Délka v dnech (365 pro roční)
    is_active BOOLEAN DEFAULT TRUE,
    locale TEXT DEFAULT 'cs',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vložit výchozí ceník
INSERT INTO pricing (plan_type, name, description, price, duration_days, locale) VALUES
    ('yearly', 'Roční předplatné', 'Přístup ke všem funkcím LiquiMixer na 1 rok', 299.00, 365, 'cs'),
    ('yearly', 'Annual subscription', 'Access to all LiquiMixer features for 1 year', 12.00, 365, 'en')
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXY
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_id ON subscriptions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_valid_to ON subscriptions(valid_to);
CREATE INDEX IF NOT EXISTS idx_invoices_clerk_id ON invoices(clerk_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_clerk_id ON payment_transactions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_comgate_id ON payment_transactions(comgate_trans_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Politiky pro subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (true);

-- Politiky pro invoices
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (true);

-- Politiky pro payment_transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions" ON payment_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update transactions" ON payment_transactions FOR UPDATE USING (true);

-- Politiky pro locales a pricing (veřejně čitelné)
CREATE POLICY "Anyone can view locales" ON locales FOR SELECT USING (true);
CREATE POLICY "Anyone can view pricing" ON pricing FOR SELECT USING (true);

-- ============================================
-- FUNKCE PRO GENEROVÁNÍ ČÍSLA FAKTURY
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
    invoice_num TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE current_year || '-%';
    
    invoice_num := current_year || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKCE PRO KONTROLU PLATNOSTI PŘEDPLATNÉHO
-- ============================================

CREATE OR REPLACE FUNCTION check_subscription_status(p_clerk_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM subscriptions
        WHERE clerk_id = p_clerk_id
        AND status = 'active'
        AND valid_from <= NOW()
        AND valid_to >= NOW()
    ) INTO is_valid;
    
    RETURN is_valid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER PRO AUTOMATICKOU EXPIRACI PŘEDPLATNÉHO
-- ============================================

CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE subscriptions
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND valid_to < NOW();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Poznámka: Pro automatickou expiraci použijte Supabase Edge Functions nebo cron job


