-- =================================================================
-- COMBINED FLAVOR DATABASE MIGRATIONS
-- Run this script in Supabase SQL Editor to set up flavor database
-- Date: 2026-02-09
-- =================================================================

-- =====================================================
-- MIGRATION 1: flavor_manufacturers table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavor_manufacturers (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('vape', 'shisha', 'both')),
    website VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manufacturers_type 
ON flavor_manufacturers(type);

CREATE INDEX IF NOT EXISTS idx_manufacturers_country 
ON flavor_manufacturers(country_code);

CREATE INDEX IF NOT EXISTS idx_manufacturers_active 
ON flavor_manufacturers(is_active) WHERE is_active = true;

COMMENT ON TABLE flavor_manufacturers IS 'Flavor manufacturers with country codes. Used for flavor database.';
COMMENT ON COLUMN flavor_manufacturers.code IS 'Short code like CAP, TPA, FA, ALF';
COMMENT ON COLUMN flavor_manufacturers.type IS 'vape = e-liquid flavors, shisha = hookah tobacco, both = produces both';

ALTER TABLE flavor_manufacturers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read manufacturers" ON flavor_manufacturers;
CREATE POLICY "Anyone can read manufacturers" 
ON flavor_manufacturers
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Service role can manage manufacturers" ON flavor_manufacturers;
CREATE POLICY "Service role can manage manufacturers" 
ON flavor_manufacturers
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO flavor_manufacturers (code, name, country_code, type, website) VALUES
    ('CAP', 'Capella Flavors', 'US', 'vape', 'https://capellaflavors.com'),
    ('TPA', 'The Flavor Apprentice', 'US', 'vape', 'https://shop.perfumersapprentice.com'),
    ('FA', 'FlavourArt', 'IT', 'vape', 'https://flavourart.com'),
    ('FLV', 'Flavorah', 'US', 'vape', 'https://flavorah.com'),
    ('INW', 'Inawera', 'PL', 'vape', 'https://inawera.com'),
    ('WF', 'Wonder Flavours', 'CA', 'vape', 'https://wonderflavours.com'),
    ('MB', 'Molinberry', 'PL', 'vape', NULL),
    ('SSA', 'Sobucky Super Aromas', 'PL', 'vape', NULL),
    ('TW', 'Twisted Vaping', 'DE', 'vape', 'https://twisted-vaping.de'),
    ('GF', 'GermanFlavours', 'DE', 'vape', 'https://germanflavours.de'),
    ('IMP', 'Imperia', 'CZ', 'vape', NULL),
    ('AV', 'Adams Vape', 'CZ', 'vape', NULL),
    ('LIQ', 'LIQUA', 'CZ', 'vape', 'https://liqua.com'),
    ('ALF', 'Al Fakher', 'AE', 'shisha', 'https://alfakher.com'),
    ('ADA', 'Adalya', 'TR', 'shisha', 'https://adalya.us'),
    ('STB', 'Starbuzz', 'US', 'shisha', 'https://starbuzz.com'),
    ('FUM', 'Fumari', 'US', 'shisha', 'https://fumari.com'),
    ('TAN', 'Tangiers', 'US', 'shisha', NULL),
    ('NAK', 'Nakhla', 'EG', 'shisha', NULL),
    ('DRK', 'Darkside', 'RU', 'shisha', NULL),
    ('ELM', 'Element', 'RU', 'shisha', NULL),
    ('MST', 'Musthave', 'RU', 'shisha', NULL),
    ('AWH', 'Al-Waha', 'JO', 'shisha', NULL),
    ('MAZ', 'Mazaya', 'JO', 'shisha', NULL),
    ('HKN', 'Hookain', 'DE', 'shisha', NULL),
    ('MRD', 'Maridan', 'DE', 'shisha', NULL)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- MIGRATION 2: flavors table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer_code VARCHAR(10) NOT NULL REFERENCES flavor_manufacturers(code),
    product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('vape', 'shisha')),
    category VARCHAR(50) NOT NULL,
    min_percent DECIMAL(4,2),
    max_percent DECIMAL(4,2),
    recommended_percent DECIMAL(4,2),
    steep_days INT DEFAULT 7,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'verified', 'active', 'rejected')),
    submitted_by TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_percent_range CHECK (
        (min_percent IS NULL OR (min_percent >= 0 AND min_percent <= 100)) AND
        (max_percent IS NULL OR (max_percent >= 0 AND max_percent <= 100)) AND
        (recommended_percent IS NULL OR (recommended_percent >= 0 AND recommended_percent <= 100))
    ),
    CONSTRAINT chk_steep_days CHECK (steep_days IS NULL OR (steep_days >= 0 AND steep_days <= 90)),
    CONSTRAINT uq_flavor_name_manufacturer UNIQUE (name, manufacturer_code)
);

CREATE INDEX IF NOT EXISTS idx_flavors_name_search 
ON flavors USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_flavors_manufacturer 
ON flavors(manufacturer_code);

CREATE INDEX IF NOT EXISTS idx_flavors_product_type 
ON flavors(product_type);

CREATE INDEX IF NOT EXISTS idx_flavors_category 
ON flavors(category);

CREATE INDEX IF NOT EXISTS idx_flavors_status 
ON flavors(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_flavors_rating 
ON flavors(avg_rating DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_flavors_usage 
ON flavors(usage_count DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_flavors_created 
ON flavors(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flavors_pending 
ON flavors(submitted_by, created_at) WHERE status = 'pending';

COMMENT ON TABLE flavors IS 'Flavor database for vape and shisha. Contains manufacturer, mixing recommendations, and ratings.';
COMMENT ON COLUMN flavors.category IS 'Flavor category: fruit, cream, tobacco, menthol, dessert, bakery, candy, drink, nuts, spice, mix';
COMMENT ON COLUMN flavors.status IS 'pending = user suggestion waiting for review, verified = reviewed by AI, active = visible to all, rejected = not approved';

ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active flavors" ON flavors;
CREATE POLICY "Anyone can read active flavors" 
ON flavors
FOR SELECT 
USING (status = 'active');

DROP POLICY IF EXISTS "Users can see own pending suggestions" ON flavors;
CREATE POLICY "Users can see own pending suggestions" 
ON flavors
FOR SELECT 
TO authenticated
USING (submitted_by = auth.jwt()->>'sub' AND status = 'pending');

DROP POLICY IF EXISTS "Users can submit flavor suggestions" ON flavors;
CREATE POLICY "Users can submit flavor suggestions" 
ON flavors
FOR INSERT 
TO authenticated
WITH CHECK (status = 'pending' AND submitted_by = auth.jwt()->>'sub');

DROP POLICY IF EXISTS "Service role can manage flavors" ON flavors;
CREATE POLICY "Service role can manage flavors" 
ON flavors
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_flavors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS flavors_updated_at ON flavors;
CREATE TRIGGER flavors_updated_at
    BEFORE UPDATE ON flavors
    FOR EACH ROW
    EXECUTE FUNCTION update_flavors_updated_at();

-- =====================================================
-- MIGRATION 3: flavor_ratings table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavor_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE NOT NULL,
    clerk_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flavor_id, clerk_id)
);

CREATE INDEX IF NOT EXISTS idx_flavor_ratings_flavor 
ON flavor_ratings(flavor_id);

CREATE INDEX IF NOT EXISTS idx_flavor_ratings_clerk 
ON flavor_ratings(clerk_id);

COMMENT ON TABLE flavor_ratings IS 'Star ratings (1-5) for flavors. One rating per user per flavor.';

ALTER TABLE flavor_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read flavor ratings" ON flavor_ratings;
CREATE POLICY "Anyone can read flavor ratings" 
ON flavor_ratings
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert flavor ratings" ON flavor_ratings;
CREATE POLICY "Allow insert flavor ratings" 
ON flavor_ratings
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update flavor ratings" ON flavor_ratings;
CREATE POLICY "Allow update flavor ratings" 
ON flavor_ratings
FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete flavor ratings" ON flavor_ratings;
CREATE POLICY "Allow delete flavor ratings" 
ON flavor_ratings
FOR DELETE 
USING (true);

CREATE OR REPLACE FUNCTION update_flavor_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_flavor_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_flavor_id := OLD.flavor_id;
    ELSE
        target_flavor_id := NEW.flavor_id;
    END IF;
    
    UPDATE flavors SET
        avg_rating = COALESCE(
            (SELECT AVG(rating)::DECIMAL(3,2) FROM flavor_ratings WHERE flavor_id = target_flavor_id),
            0
        ),
        rating_count = (SELECT COUNT(*) FROM flavor_ratings WHERE flavor_id = target_flavor_id),
        updated_at = NOW()
    WHERE id = target_flavor_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flavor_rating_update ON flavor_ratings;
CREATE TRIGGER trg_flavor_rating_update
    AFTER INSERT OR UPDATE OR DELETE ON flavor_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_flavor_avg_rating();

-- =====================================================
-- MIGRATION 4: Extend favorite_products
-- =====================================================

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_id UUID REFERENCES flavors(id) ON DELETE SET NULL;

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_product_type VARCHAR(20) CHECK (flavor_product_type IN ('vape', 'shisha'));

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS steep_days INT CHECK (steep_days IS NULL OR (steep_days >= 0 AND steep_days <= 90));

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(50);

ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_category VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_favorite_products_flavor_id 
ON favorite_products(flavor_id) WHERE flavor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_favorite_products_flavor_type 
ON favorite_products(flavor_product_type) WHERE flavor_product_type IS NOT NULL;

COMMENT ON COLUMN favorite_products.flavor_id IS 'Reference to flavor in public database. NULL for user-created flavors.';
COMMENT ON COLUMN favorite_products.flavor_product_type IS 'vape or shisha - determines which recipe types this flavor is for';
COMMENT ON COLUMN favorite_products.steep_days IS 'Recommended steep time in days';
COMMENT ON COLUMN favorite_products.manufacturer IS 'Manufacturer name for user-created flavors not in database';
COMMENT ON COLUMN favorite_products.flavor_category IS 'Flavor category: fruit, cream, tobacco, etc.';

-- =====================================================
-- MIGRATION 5: recipe_flavors junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS recipe_flavors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    flavor_id UUID REFERENCES flavors(id) ON DELETE SET NULL,
    favorite_product_id UUID REFERENCES favorite_products(id) ON DELETE SET NULL,
    generic_flavor_type VARCHAR(50),
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    position INT DEFAULT 1 CHECK (position >= 1 AND position <= 10),
    flavor_name VARCHAR(100),
    flavor_manufacturer VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_flavor_source CHECK (
        flavor_id IS NOT NULL OR 
        favorite_product_id IS NOT NULL OR 
        generic_flavor_type IS NOT NULL
    ),
    CONSTRAINT uq_recipe_flavor_position UNIQUE (recipe_id, position)
);

CREATE INDEX IF NOT EXISTS idx_recipe_flavors_recipe 
ON recipe_flavors(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_flavors_flavor 
ON recipe_flavors(flavor_id) WHERE flavor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recipe_flavors_favorite 
ON recipe_flavors(favorite_product_id) WHERE favorite_product_id IS NOT NULL;

COMMENT ON TABLE recipe_flavors IS 'Links recipes to specific flavors. Stores percentage and position for each flavor in recipe.';
COMMENT ON COLUMN recipe_flavors.generic_flavor_type IS 'Key from flavorDatabase (fruit, cream, etc.) when user does not specify exact flavor';
COMMENT ON COLUMN recipe_flavors.flavor_name IS 'Snapshot of flavor name at save time';
COMMENT ON COLUMN recipe_flavors.flavor_manufacturer IS 'Snapshot of manufacturer at save time';

ALTER TABLE recipe_flavors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read recipe flavors" ON recipe_flavors;
CREATE POLICY "Users can read recipe flavors" 
ON recipe_flavors
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND (r.clerk_id = auth.jwt()->>'sub' OR r.is_public = true)
    )
);

DROP POLICY IF EXISTS "Users can insert recipe flavors" ON recipe_flavors;
CREATE POLICY "Users can insert recipe flavors" 
ON recipe_flavors
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = auth.jwt()->>'sub'
    )
);

DROP POLICY IF EXISTS "Users can update recipe flavors" ON recipe_flavors;
CREATE POLICY "Users can update recipe flavors" 
ON recipe_flavors
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = auth.jwt()->>'sub'
    )
);

DROP POLICY IF EXISTS "Users can delete recipe flavors" ON recipe_flavors;
CREATE POLICY "Users can delete recipe flavors" 
ON recipe_flavors
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = auth.jwt()->>'sub'
    )
);

CREATE OR REPLACE FUNCTION update_flavor_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.flavor_id IS NOT NULL THEN
        UPDATE flavors SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE id = NEW.flavor_id;
    ELSIF TG_OP = 'DELETE' AND OLD.flavor_id IS NOT NULL THEN
        UPDATE flavors SET usage_count = GREATEST(0, usage_count - 1), updated_at = NOW()
        WHERE id = OLD.flavor_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.flavor_id IS NOT NULL AND OLD.flavor_id != NEW.flavor_id THEN
            UPDATE flavors SET usage_count = GREATEST(0, usage_count - 1), updated_at = NOW()
            WHERE id = OLD.flavor_id;
        END IF;
        IF NEW.flavor_id IS NOT NULL AND (OLD.flavor_id IS NULL OR OLD.flavor_id != NEW.flavor_id) THEN
            UPDATE flavors SET usage_count = usage_count + 1, updated_at = NOW()
            WHERE id = NEW.flavor_id;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recipe_flavor_usage ON recipe_flavors;
CREATE TRIGGER trg_recipe_flavor_usage
    AFTER INSERT OR UPDATE OR DELETE ON recipe_flavors
    FOR EACH ROW
    EXECUTE FUNCTION update_flavor_usage_count();

-- =====================================================
-- MIGRATION 6: Seed test flavors
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Strawberry Ripe', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 'active'),
    ('Bavarian Cream', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.5, 14, 'active'),
    ('Catania', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 'active'),
    ('Vanilla Custard', 'CAP', 'vape', 'dessert', 4.0, 8.0, 6.0, 14, 'active'),
    ('Cool Mint', 'TPA', 'vape', 'menthol', 2.0, 5.0, 3.0, 3, 'active'),
    ('Double Apple', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Mint', 'ALF', 'shisha', 'menthol', NULL, NULL, NULL, 0, 'active'),
    ('Love 66', 'ADA', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Grape Mint', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Blue Mist', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
    manufacturers_count INT;
    flavors_count INT;
    vape_count INT;
    shisha_count INT;
BEGIN
    SELECT COUNT(*) INTO manufacturers_count FROM flavor_manufacturers;
    SELECT COUNT(*) INTO flavors_count FROM flavors WHERE status = 'active';
    SELECT COUNT(*) INTO vape_count FROM flavors WHERE product_type = 'vape' AND status = 'active';
    SELECT COUNT(*) INTO shisha_count FROM flavors WHERE product_type = 'shisha' AND status = 'active';
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'FLAVOR DATABASE MIGRATION COMPLETED';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Manufacturers: %', manufacturers_count;
    RAISE NOTICE 'Total flavors: %', flavors_count;
    RAISE NOTICE '  - Vape: %', vape_count;
    RAISE NOTICE '  - Shisha: %', shisha_count;
    RAISE NOTICE '===========================================';
END $$;
