-- Migration: Add public recipe database with ratings
-- Date: 2026-01-31
-- Purpose: Enable public recipe sharing with star ratings (1-5)

-- =====================================================
-- PART 1: Add columns to recipes table
-- =====================================================

-- Add is_public flag
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add rating aggregation columns
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS public_rating_avg DECIMAL(2,1) DEFAULT 0;

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS public_rating_count INTEGER DEFAULT 0;

-- Add form_type for filtering (liquid, shakevape, shortfill, liquidpro)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS form_type TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_is_public 
ON recipes(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_recipes_form_type 
ON recipes(form_type);

CREATE INDEX IF NOT EXISTS idx_recipes_rating 
ON recipes(public_rating_avg DESC);

COMMENT ON COLUMN recipes.is_public IS 'Whether the recipe is visible in public database.';
COMMENT ON COLUMN recipes.public_rating_avg IS 'Average star rating (1.0-5.0), updated after each rating.';
COMMENT ON COLUMN recipes.public_rating_count IS 'Number of ratings received.';
COMMENT ON COLUMN recipes.form_type IS 'Recipe type: liquid, shakevape, shortfill, liquidpro.';

-- =====================================================
-- PART 2: Create recipe_ratings table (stars only, no comments)
-- =====================================================

CREATE TABLE IF NOT EXISTS recipe_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    clerk_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(recipe_id, clerk_id) -- One user = one rating per recipe
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_ratings_recipe 
ON recipe_ratings(recipe_id);

CREATE INDEX IF NOT EXISTS idx_ratings_clerk 
ON recipe_ratings(clerk_id);

COMMENT ON TABLE recipe_ratings IS 'Star ratings (1-5) for public recipes. One rating per user per recipe.';

-- =====================================================
-- PART 3: Row Level Security for recipe_ratings
-- =====================================================

ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read ratings
CREATE POLICY "Authenticated users can read ratings" 
ON recipe_ratings
FOR SELECT 
TO authenticated 
USING (true);

-- Users can only insert their own ratings
CREATE POLICY "Users can insert own ratings" 
ON recipe_ratings
FOR INSERT 
TO authenticated 
WITH CHECK (clerk_id = auth.jwt()->>'sub');

-- Users can only update their own ratings
CREATE POLICY "Users can update own ratings" 
ON recipe_ratings
FOR UPDATE 
TO authenticated 
USING (clerk_id = auth.jwt()->>'sub');

-- Users can only delete their own ratings
CREATE POLICY "Users can delete own ratings" 
ON recipe_ratings
FOR DELETE 
TO authenticated 
USING (clerk_id = auth.jwt()->>'sub');

-- =====================================================
-- PART 4: RLS for public recipes in recipes table
-- =====================================================

-- Allow reading public recipes without being the owner
-- (This extends existing RLS - users can read their own OR public recipes)
DROP POLICY IF EXISTS "Users can read own recipes or public recipes" ON recipes;

CREATE POLICY "Users can read own recipes or public recipes" 
ON recipes
FOR SELECT 
TO authenticated 
USING (clerk_id = auth.jwt()->>'sub' OR is_public = true);
