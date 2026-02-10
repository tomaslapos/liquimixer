-- Přidat chybějící sloupec amount do tabulky invoices
-- Tento sloupec obsahuje celkovou částku faktury (s DPH)

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- Komentář
COMMENT ON COLUMN invoices.amount IS 'Celková částka faktury s DPH';
