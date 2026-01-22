-- Přidat sloupec 'gateway' do tabulky payments
-- Tento sloupec určuje která platební brána byla použita

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'gpwebpay';

-- Přidat sloupec 'test_mode' pro označení testovacích plateb
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS test_mode BOOLEAN DEFAULT false;

-- Aktualizovat existující záznamy
UPDATE payments 
SET gateway = 'gpwebpay' 
WHERE gateway IS NULL;

-- Přidat komentář
COMMENT ON COLUMN payments.gateway IS 'Platební brána použitá pro tuto platbu (gpwebpay, comgate, atd.)';
COMMENT ON COLUMN payments.test_mode IS 'Zda je platba v testovacím režimu';
