-- Přidat chybějící sloupce do tabulky invoices
-- Tyto sloupce jsou potřebné pro správné generování faktur

-- Přidat vat_rate sloupec
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 21;

-- Přidat další potenciálně chybějící sloupce
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Komentáře
COMMENT ON COLUMN invoices.vat_rate IS 'Sazba DPH v procentech (např. 21)';
COMMENT ON COLUMN invoices.vat_amount IS 'Částka DPH';
COMMENT ON COLUMN invoices.subtotal IS 'Základ daně (bez DPH)';
