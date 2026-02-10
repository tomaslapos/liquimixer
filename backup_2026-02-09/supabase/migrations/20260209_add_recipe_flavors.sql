-- Migration: Add recipe_flavors junction table
-- Date: 2026-02-09
-- Purpose: Link recipes to specific flavors from database or favorites

-- =====================================================
-- PART 1: Create recipe_flavors table
-- =====================================================

CREATE TABLE IF NOT EXISTS recipe_flavors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    
    -- Flavor source (one of these should be set)
    flavor_id UUID REFERENCES flavors(id) ON DELETE SET NULL,
    favorite_product_id UUID REFERENCES favorite_products(id) ON DELETE SET NULL,
    generic_flavor_type VARCHAR(50),  -- fallback: uses existing flavorDatabase keys
    
    -- Values in recipe
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    position INT DEFAULT 1 CHECK (position >= 1 AND position <= 10),
    
    -- Snapshot of flavor data at time of saving (for historical accuracy)
    flavor_name VARCHAR(100),
    flavor_manufacturer VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- At least one flavor source must be set
    CONSTRAINT chk_flavor_source CHECK (
        flavor_id IS NOT NULL OR 
        favorite_product_id IS NOT NULL OR 
        generic_flavor_type IS NOT NULL
    ),
    
    -- Unique: one flavor per position per recipe
    CONSTRAINT uq_recipe_flavor_position UNIQUE (recipe_id, position)
);

-- =====================================================
-- PART 2: Create indexes
-- =====================================================

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

-- =====================================================
-- PART 3: Row Level Security
-- =====================================================

ALTER TABLE recipe_flavors ENABLE ROW LEVEL SECURITY;

-- Read policy: same as recipes - user can read own or public recipe flavors
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

-- Insert policy: user can insert for own recipes
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

-- Update policy: user can update for own recipes
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

-- Delete policy: user can delete for own recipes
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

-- =====================================================
-- PART 4: Trigger to update flavor usage_count
-- =====================================================

CREATE OR REPLACE FUNCTION update_flavor_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count for the flavor
    IF TG_OP = 'INSERT' AND NEW.flavor_id IS NOT NULL THEN
        UPDATE flavors SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE id = NEW.flavor_id;
    ELSIF TG_OP = 'DELETE' AND OLD.flavor_id IS NOT NULL THEN
        UPDATE flavors SET usage_count = GREATEST(0, usage_count - 1), updated_at = NOW()
        WHERE id = OLD.flavor_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle flavor_id change
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

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: recipe_flavors junction table created';
END $$;
