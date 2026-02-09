-- Migration: Extend favorite_products for flavor database integration
-- Date: 2026-02-09
-- Purpose: Add columns to link favorite products to flavor database

-- =====================================================
-- PART 1: Add new columns to favorite_products
-- =====================================================

-- Link to flavor database (optional - null means user's custom flavor)
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_id UUID REFERENCES flavors(id) ON DELETE SET NULL;

-- Flavor-specific type (vape or shisha) - extends existing product_type
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_product_type VARCHAR(20) CHECK (flavor_product_type IN ('vape', 'shisha'));

-- Steep time in days
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS steep_days INT CHECK (steep_days IS NULL OR (steep_days >= 0 AND steep_days <= 90));

-- Manufacturer (for flavors not in database)
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(50);

-- Flavor category
ALTER TABLE favorite_products 
ADD COLUMN IF NOT EXISTS flavor_category VARCHAR(50);

-- =====================================================
-- PART 2: Create indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_favorite_products_flavor_id 
ON favorite_products(flavor_id) WHERE flavor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_favorite_products_flavor_type 
ON favorite_products(flavor_product_type) WHERE flavor_product_type IS NOT NULL;

COMMENT ON COLUMN favorite_products.flavor_id IS 'Reference to flavor in public database. NULL for user-created flavors.';
COMMENT ON COLUMN favorite_products.flavor_product_type IS 'vape or shisha - determines which recipe types this flavor is for';
COMMENT ON COLUMN favorite_products.steep_days IS 'Recommended steep time in days';
COMMENT ON COLUMN favorite_products.manufacturer IS 'Manufacturer name for user-created flavors not in database';
COMMENT ON COLUMN favorite_products.flavor_category IS 'Flavor category: fruit, cream, tobacco, etc.';

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: favorite_products extended with flavor columns';
END $$;
