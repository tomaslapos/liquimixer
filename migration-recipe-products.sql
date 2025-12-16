-- ============================================
-- LIQUIMIXER - Migrace propojení produktů s recepty
-- Spustit v Supabase SQL Editor
-- ============================================

-- Vytvořit junction tabulku pro propojení receptů a produktů
CREATE TABLE IF NOT EXISTS recipe_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES favorite_products(id) ON DELETE CASCADE,
    clerk_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, product_id)
);

-- Indexy pro rychlé dotazy
CREATE INDEX IF NOT EXISTS idx_recipe_products_recipe ON recipe_products(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_product ON recipe_products(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_clerk ON recipe_products(clerk_id);

-- RLS politiky
ALTER TABLE recipe_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recipe_products" ON recipe_products;
DROP POLICY IF EXISTS "Users can insert own recipe_products" ON recipe_products;
DROP POLICY IF EXISTS "Users can delete own recipe_products" ON recipe_products;

CREATE POLICY "Users can view own recipe_products" ON recipe_products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own recipe_products" ON recipe_products
    FOR INSERT WITH CHECK (
        clerk_id IS NOT NULL 
        AND LENGTH(clerk_id) > 10
    );

CREATE POLICY "Users can delete own recipe_products" ON recipe_products
    FOR DELETE USING (true);

-- Ověření
SELECT 'Migrace propojení receptů s produkty dokončena!' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'recipe_products';

