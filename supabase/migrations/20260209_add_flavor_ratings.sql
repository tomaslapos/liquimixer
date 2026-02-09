-- Migration: Add flavor ratings table
-- Date: 2026-02-09
-- Purpose: Star ratings (1-5) for flavors, same pattern as recipe_ratings

-- =====================================================
-- PART 1: Create flavor_ratings table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavor_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE NOT NULL,
    clerk_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flavor_id, clerk_id)  -- One user = one rating per flavor
);

-- Create indexes for lookups
CREATE INDEX IF NOT EXISTS idx_flavor_ratings_flavor 
ON flavor_ratings(flavor_id);

CREATE INDEX IF NOT EXISTS idx_flavor_ratings_clerk 
ON flavor_ratings(clerk_id);

COMMENT ON TABLE flavor_ratings IS 'Star ratings (1-5) for flavors. One rating per user per flavor.';

-- =====================================================
-- PART 2: Row Level Security
-- =====================================================

ALTER TABLE flavor_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings
CREATE POLICY "Anyone can read flavor ratings" 
ON flavor_ratings
FOR SELECT 
USING (true);

-- Authenticated users can insert ratings
CREATE POLICY "Allow insert flavor ratings" 
ON flavor_ratings
FOR INSERT 
WITH CHECK (true);

-- Authenticated users can update ratings
CREATE POLICY "Allow update flavor ratings" 
ON flavor_ratings
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Authenticated users can delete ratings
CREATE POLICY "Allow delete flavor ratings" 
ON flavor_ratings
FOR DELETE 
USING (true);

-- =====================================================
-- PART 3: Trigger to update avg_rating in flavors
-- =====================================================

CREATE OR REPLACE FUNCTION update_flavor_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_flavor_id UUID;
BEGIN
    -- Determine which flavor to update
    IF TG_OP = 'DELETE' THEN
        target_flavor_id := OLD.flavor_id;
    ELSE
        target_flavor_id := NEW.flavor_id;
    END IF;
    
    -- Update the flavor's rating stats
    UPDATE flavors SET
        avg_rating = COALESCE(
            (SELECT AVG(rating)::DECIMAL(3,2) FROM flavor_ratings WHERE flavor_id = target_flavor_id),
            0
        ),
        rating_count = (SELECT COUNT(*) FROM flavor_ratings WHERE flavor_id = target_flavor_id),
        updated_at = NOW()
    WHERE id = target_flavor_id;
    
    -- Return appropriate row
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

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: flavor_ratings table created with trigger';
END $$;
