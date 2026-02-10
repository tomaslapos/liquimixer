-- Migration: Add product_code to flavors table
-- Date: 2026-02-10
-- Purpose: Allow searching flavors by product code and storing code in favorites

-- =====================================================
-- PART 1: Add product_code column to flavors table
-- =====================================================

ALTER TABLE flavors 
ADD COLUMN IF NOT EXISTS product_code VARCHAR(50);

-- Create index for fast lookup by product_code
CREATE INDEX IF NOT EXISTS idx_flavors_product_code 
ON flavors(product_code) WHERE product_code IS NOT NULL;

-- =====================================================
-- PART 2: Add product_code to favorite_products for flavors
-- =====================================================

-- Column already exists in favorite_products from earlier migration
-- Just ensure it can be used for flavor codes too

COMMENT ON COLUMN flavors.product_code IS 'Manufacturer product code for the flavor (e.g. TFA-001, CAP-VAN-01)';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration completed: product_code column added to flavors table';
END $$;
