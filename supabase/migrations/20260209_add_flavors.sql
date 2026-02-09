-- Migration: Add flavors table
-- Date: 2026-02-09
-- Purpose: Main flavor database for vape and shisha flavors

-- =====================================================
-- PART 1: Create flavors table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identification
    name VARCHAR(100) NOT NULL,
    manufacturer_code VARCHAR(10) NOT NULL REFERENCES flavor_manufacturers(code),
    
    -- Type (REQUIRED)
    product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('vape', 'shisha')),
    category VARCHAR(50) NOT NULL,
    
    -- Recommended mixing values (for vape)
    min_percent DECIMAL(4,2),
    max_percent DECIMAL(4,2),
    recommended_percent DECIMAL(4,2),
    
    -- Steep time
    steep_days INT DEFAULT 7,
    
    -- Status and moderation
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'verified', 'active', 'rejected')),
    submitted_by TEXT,  -- clerk_id of user who suggested this flavor
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Statistics
    avg_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    usage_count INT DEFAULT 0,  -- how many recipes use this flavor
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_percent_range CHECK (
        (min_percent IS NULL OR (min_percent >= 0 AND min_percent <= 100)) AND
        (max_percent IS NULL OR (max_percent >= 0 AND max_percent <= 100)) AND
        (recommended_percent IS NULL OR (recommended_percent >= 0 AND recommended_percent <= 100))
    ),
    CONSTRAINT chk_steep_days CHECK (steep_days IS NULL OR (steep_days >= 0 AND steep_days <= 90)),
    
    -- Unique constraint: name + manufacturer
    CONSTRAINT uq_flavor_name_manufacturer UNIQUE (name, manufacturer_code)
);

-- =====================================================
-- PART 2: Create indexes for performance
-- =====================================================

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_flavors_name_search 
ON flavors USING gin(to_tsvector('english', name));

-- Filter indexes
CREATE INDEX IF NOT EXISTS idx_flavors_manufacturer 
ON flavors(manufacturer_code);

CREATE INDEX IF NOT EXISTS idx_flavors_product_type 
ON flavors(product_type);

CREATE INDEX IF NOT EXISTS idx_flavors_category 
ON flavors(category);

CREATE INDEX IF NOT EXISTS idx_flavors_status 
ON flavors(status) WHERE status = 'active';

-- Sorting indexes
CREATE INDEX IF NOT EXISTS idx_flavors_rating 
ON flavors(avg_rating DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_flavors_usage 
ON flavors(usage_count DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_flavors_created 
ON flavors(created_at DESC);

-- Pending suggestions index
CREATE INDEX IF NOT EXISTS idx_flavors_pending 
ON flavors(submitted_by, created_at) WHERE status = 'pending';

COMMENT ON TABLE flavors IS 'Flavor database for vape and shisha. Contains manufacturer, mixing recommendations, and ratings.';
COMMENT ON COLUMN flavors.category IS 'Flavor category: fruit, cream, tobacco, menthol, dessert, bakery, candy, drink, nuts, spice, mix';
COMMENT ON COLUMN flavors.status IS 'pending = user suggestion waiting for review, verified = reviewed by AI, active = visible to all, rejected = not approved';

-- =====================================================
-- PART 3: Row Level Security
-- =====================================================

ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;

-- Anyone can read active flavors (including anonymous)
CREATE POLICY "Anyone can read active flavors" 
ON flavors
FOR SELECT 
USING (status = 'active');

-- Authenticated users can also see their own pending suggestions
CREATE POLICY "Users can see own pending suggestions" 
ON flavors
FOR SELECT 
TO authenticated
USING (submitted_by = auth.jwt()->>'sub' AND status = 'pending');

-- Authenticated users can insert new suggestions (with pending status)
CREATE POLICY "Users can submit flavor suggestions" 
ON flavors
FOR INSERT 
TO authenticated
WITH CHECK (status = 'pending' AND submitted_by = auth.jwt()->>'sub');

-- Service role can do everything
CREATE POLICY "Service role can manage flavors" 
ON flavors
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 4: Trigger for updated_at
-- =====================================================

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

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: flavors table created';
END $$;
