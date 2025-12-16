-- ============================================
-- LIQUIMIXER - Migrace sdílení produktů
-- Spustit v Supabase SQL Editor
-- ============================================

-- Přidat sloupce pro sdílení produktů
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS share_id VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS share_url TEXT;

-- Vytvořit index pro rychlé vyhledávání sdílených produktů
CREATE INDEX IF NOT EXISTS idx_products_share_id ON favorite_products(share_id);

-- Aktualizovat RLS politiku pro čtení sdílených produktů
DROP POLICY IF EXISTS "Anyone can view shared products" ON favorite_products;
CREATE POLICY "Anyone can view shared products" ON favorite_products
    FOR SELECT USING (share_id IS NOT NULL);

-- Ověření
SELECT 'Migrace sdílení produktů dokončena!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'favorite_products' 
ORDER BY ordinal_position;

