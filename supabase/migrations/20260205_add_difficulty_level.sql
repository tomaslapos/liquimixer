-- Migration: Add difficulty_level column to recipes
-- Date: 2026-02-05
-- Purpose: Enable automatic difficulty categorization for public recipes

-- =====================================================
-- PART 1: Add difficulty_level column
-- =====================================================

-- Add difficulty_level column with enum-like values
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';

-- Add check constraint for valid values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'recipes_difficulty_level_check'
    ) THEN
        ALTER TABLE recipes 
        ADD CONSTRAINT recipes_difficulty_level_check 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'expert', 'virtuoso'));
    END IF;
END $$;

-- =====================================================
-- PART 2: Create index for filtering
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_recipes_difficulty_level 
ON recipes(difficulty_level);

-- Compound index for public recipes with difficulty filtering
CREATE INDEX IF NOT EXISTS idx_recipes_public_difficulty 
ON recipes(is_public, difficulty_level) 
WHERE is_public = true;

-- =====================================================
-- PART 3: Add comments
-- =====================================================

COMMENT ON COLUMN recipes.difficulty_level IS 'Recipe difficulty level: beginner (1 flavor), intermediate (2 flavors or sweetener), expert (3 flavors or additive), virtuoso (4 flavors)';

-- =====================================================
-- PART 4: Update existing recipes with calculated difficulty
-- =====================================================

-- Update difficulty based on flavors_data for existing Liquid PRO recipes
UPDATE recipes
SET difficulty_level = 
    CASE 
        -- Check number of flavors in flavors_data array
        WHEN recipe_data->'flavors' IS NOT NULL THEN
            CASE 
                WHEN jsonb_array_length(recipe_data->'flavors') >= 4 THEN 'virtuoso'
                WHEN jsonb_array_length(recipe_data->'flavors') = 3 THEN 'expert'
                WHEN jsonb_array_length(recipe_data->'flavors') = 2 THEN 'intermediate'
                ELSE 'beginner'
            END
        -- Check for additive - minimum expert
        WHEN recipe_data->>'additive' IS NOT NULL AND recipe_data->>'additive' != '' THEN 'expert'
        -- Check for shisha with sweetener
        WHEN form_type = 'shisha' AND recipe_data->>'sweetener' IS NOT NULL THEN 'intermediate'
        -- Default to beginner
        ELSE 'beginner'
    END
WHERE difficulty_level IS NULL OR difficulty_level = 'beginner';

-- =====================================================
-- PART 5: Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration completed: difficulty_level added';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Valid values: beginner, intermediate, expert, virtuoso';
    RAISE NOTICE 'Index created: idx_recipes_difficulty_level';
    RAISE NOTICE 'Index created: idx_recipes_public_difficulty';
    RAISE NOTICE '============================================';
END $$;
