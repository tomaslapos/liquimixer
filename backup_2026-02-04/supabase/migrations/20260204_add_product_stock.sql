-- Přidání sloupce stock_quantity do tabulky favorite_products
-- Umožňuje uživatelům sledovat počet kusů produktu na skladě
-- Typ DECIMAL umožňuje ukládat i poloviční kusy (1.5, 2.5 atd.)

ALTER TABLE favorite_products
ADD COLUMN IF NOT EXISTS stock_quantity DECIMAL(10,1) DEFAULT 0;

-- Komentář pro dokumentaci
COMMENT ON COLUMN favorite_products.stock_quantity IS 'Počet kusů produktu na skladě (zadává uživatel, podporuje 0.5 kroky)';
