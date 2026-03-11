-- =====================================================
-- SOFT DELETE: favorite_products + recipes
-- Místo fyzického mazání se nastaví deleted_at.
-- CRON job po 30 dnech fyzicky smaže (data už budou v logdata).
-- =====================================================

-- 1. Přidat deleted_at sloupec do favorite_products
ALTER TABLE favorite_products 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_favorite_products_deleted 
    ON favorite_products(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON COLUMN favorite_products.deleted_at IS 
    'Soft delete timestamp. NULL = active, NOT NULL = deleted. Physically removed after 30 days by CRON.';

-- 2. Přidat deleted_at sloupec do recipes
ALTER TABLE recipes 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_deleted 
    ON recipes(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON COLUMN recipes.deleted_at IS 
    'Soft delete timestamp. NULL = active, NOT NULL = deleted. Physically removed after 30 days by CRON.';

-- 3. Aktualizovat RLS policies pro favorite_products — zobrazit pouze aktivní
-- (admin/service role vidí vše, uživatel jen své aktivní)
-- Dropovat obě možné varianty názvu (read/view)

DROP POLICY IF EXISTS "Users can view own products" ON favorite_products;
DROP POLICY IF EXISTS "Users can read own products" ON favorite_products;
CREATE POLICY "Users can read own products" ON favorite_products
    FOR SELECT USING (
        clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub')
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Users can view shared products" ON favorite_products;
DROP POLICY IF EXISTS "Users can read shared products" ON favorite_products;
CREATE POLICY "Users can read shared products" ON favorite_products
    FOR SELECT USING (
        share_id IS NOT NULL 
        AND deleted_at IS NULL
    );

-- 4. Aktualizovat RLS policies pro recipes — zobrazit pouze aktivní
-- Dropovat obě možné varianty názvu (read/view)
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can read own recipes" ON recipes;
CREATE POLICY "Users can read own recipes" ON recipes
    FOR SELECT USING (
        clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub')
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Anyone can view public recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can read public recipes" ON recipes;
CREATE POLICY "Anyone can read public recipes" ON recipes
    FOR SELECT USING (
        is_public = true 
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Users can view shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users can read shared recipes" ON recipes;
CREATE POLICY "Users can read shared recipes" ON recipes
    FOR SELECT USING (
        share_id IS NOT NULL 
        AND deleted_at IS NULL
    );

-- 5. CRON job: fyzické smazání po 30 dnech
-- Vyžaduje pg_cron rozšíření (již aktivní v Supabase)
SELECT cron.unschedule('cleanup_soft_deleted_records')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_soft_deleted_records');

SELECT cron.schedule(
    'cleanup_soft_deleted_records',
    '0 4 * * *',  -- Každý den ve 4:00 UTC
    $$
    -- Fyzicky smazat favorite_products starší než 30 dní
    -- POZOR: ON DELETE SET NULL na recipe_flavors se spustí automaticky
    -- Proto nejdřív nastavíme generic_flavor_type fallback
    UPDATE recipe_flavors rf
    SET generic_flavor_type = 'custom'
    FROM favorite_products fp
    WHERE rf.favorite_product_id = fp.id
      AND fp.deleted_at < NOW() - INTERVAL '30 days'
      AND rf.flavor_id IS NULL
      AND rf.generic_flavor_type IS NULL;
    
    DELETE FROM favorite_products 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '30 days';
    
    -- Fyzicky smazat recipes starší než 30 dní
    DELETE FROM recipes 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '30 days';
    $$
);
