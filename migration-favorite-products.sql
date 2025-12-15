-- ============================================
-- MIGRACE: Tabulka oblíbených produktů
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- Tabulka oblíbených produktů
CREATE TABLE IF NOT EXISTS favorite_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    name TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'flavor' CHECK (product_type IN ('vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt')),
    description TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    image_url TEXT DEFAULT '',
    product_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Přidat sloupec pokud tabulka již existuje
ALTER TABLE favorite_products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'flavor';

-- Index pro filtrování podle typu
CREATE INDEX IF NOT EXISTS idx_favorite_products_type ON favorite_products(product_type);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_favorite_products_clerk_id ON favorite_products(clerk_id);
CREATE INDEX IF NOT EXISTS idx_favorite_products_created_at ON favorite_products(created_at DESC);

-- RLS politiky
ALTER TABLE favorite_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can insert own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can update own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can delete own products" ON favorite_products;

CREATE POLICY "Users can view own products" ON favorite_products FOR SELECT USING (true);
CREATE POLICY "Users can insert own products" ON favorite_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own products" ON favorite_products FOR UPDATE USING (true);
CREATE POLICY "Users can delete own products" ON favorite_products FOR DELETE USING (true);

-- Trigger pro updated_at
DROP TRIGGER IF EXISTS update_favorite_products_updated_at ON favorite_products;
CREATE TRIGGER update_favorite_products_updated_at
    BEFORE UPDATE ON favorite_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ověření
SELECT 'Tabulka favorite_products vytvořena!' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'favorite_products';
