-- ============================================
-- Migrace: Přidání sloupce idoklad_vat_code_id do tabulky vat_rates
-- Datum: 14.1.2026
-- Účel: Mapování zemí na kódy členění DPH pro iDoklad faktury
-- ============================================

-- Přidat sloupec pro iDoklad VatCodeId (členění DPH)
ALTER TABLE vat_rates 
ADD COLUMN IF NOT EXISTS idoklad_vat_code_id INTEGER;

-- Přidat sloupec pro iDoklad VatRateId (sazba DPH)
ALTER TABLE vat_rates 
ADD COLUMN IF NOT EXISTS idoklad_vat_rate_id INTEGER;

-- Přidat komentáře ke sloupcům
COMMENT ON COLUMN vat_rates.idoklad_vat_code_id IS 'ID členění DPH v iDoklad (01-02 pro CZ, 25 pro EU OSS, 20/21 pro export)';
COMMENT ON COLUMN vat_rates.idoklad_vat_rate_id IS 'ID sazby DPH v iDoklad (747 pro 21% CZ, 3 pro 0%)';

-- ============================================
-- Mapování kódů členění DPH pro iDoklad:
-- 
-- | Typ země    | Kód členění | Řádek DPH | idoklad_vat_code_id |
-- |-------------|-------------|-----------|---------------------|
-- | CZ          | 01-02       | 1, 2      | (zjistit z API)     |
-- | EU (OSS)    | 25          | 25        | (zjistit z API)     |
-- | Mimo EU     | 20/21       | 20, 21    | (zjistit z API)     |
--
-- Mapování sazeb DPH:
-- | Sazba | idoklad_vat_rate_id |
-- |-------|---------------------|
-- | 21%   | 747 (CZ)            |
-- | 0%    | 3 (Nulová sazba)    |
-- ============================================

-- Aktualizovat CZ (tuzemské plnění) - 21% DPH
-- VatCodeId bude nastaveno po zjištění z API (očekáváme ID pro kód "01" nebo "02")
UPDATE vat_rates 
SET idoklad_vat_rate_id = 747  -- Základní sazba 21% CZ
WHERE country_code = 'CZ';

-- Aktualizovat EU země (OSS režim) - 21% DPH s českým členěním
-- Všechny EU země mají stejnou sazbu jako CZ (OSS pod limit 10k EUR)
UPDATE vat_rates 
SET idoklad_vat_rate_id = 747  -- Základní sazba 21% CZ
WHERE country_code IN (
    'AT', 'BE', 'BG', 'HR', 'CY', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
);

-- Aktualizovat země mimo EU - 0% DPH (export)
-- Toto zahrnuje GB, US, CH, NO, a další
UPDATE vat_rates 
SET idoklad_vat_rate_id = 3  -- Nulová sazba 0%
WHERE country_code NOT IN (
    'CZ', 'AT', 'BE', 'BG', 'HR', 'CY', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
);

-- Poznámka: idoklad_vat_code_id bude nastaveno manuálně po zjištění správných ID z iDoklad API
-- Alternativně se VatCodeId může dynamicky hledat při vytváření faktury (současná implementace)
