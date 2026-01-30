-- Migrace: Přidání product_code pro deduplikaci produktů při sdílení receptů
-- Datum: 2026-01-16
-- Popis: Každý produkt dostane unikátní kód, který se zachovává při sdílení.
--        Při ukládání sdíleného receptu se kontroluje, zda uživatel již nemá
--        produkt se stejným kódem - pokud ano, použije se existující.

-- Přidat sloupec product_code
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS product_code VARCHAR(12);

-- Vygenerovat product_code pro existující produkty, které ho nemají
-- Použít prvních 12 znaků z UUID, převedených na base36
UPDATE favorite_products 
SET product_code = UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 12))
WHERE product_code IS NULL;

-- Vytvořit index pro rychlé vyhledávání podle product_code a clerk_id
CREATE INDEX IF NOT EXISTS idx_favorite_products_product_code 
ON favorite_products(clerk_id, product_code);

-- Komentář k sloupci
COMMENT ON COLUMN favorite_products.product_code IS 'Unikátní kód produktu pro deduplikaci při sdílení. Generuje se při vytvoření a zůstává stejný při kopírování.';
