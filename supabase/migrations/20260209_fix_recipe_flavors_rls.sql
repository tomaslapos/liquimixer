-- Migration: Fix RLS policies for recipe_flavors
-- Date: 2026-02-09
-- Purpose: Allow users to insert recipe_flavors without requiring Clerk JWT auth
-- Reason: We use Clerk for auth but Supabase RLS expects auth.jwt() which doesn't work with Clerk

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can insert recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can update recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can delete recipe flavors" ON recipe_flavors;

-- =====================================================
-- NEW POLICIES: Based on recipes table clerk_id
-- =====================================================

-- Read policy: Anyone can read recipe flavors for public recipes, 
-- or for recipes owned by the requesting clerk_id (passed via header)
CREATE POLICY "Allow read recipe flavors" 
ON recipe_flavors
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND (
            r.is_public = true 
            OR r.clerk_id = current_setting('request.headers', true)::json->>'x-clerk-id'
        )
    )
);

-- Insert policy: Allow insert if recipe belongs to clerk_id from header
-- Since we validate ownership in application code, we allow insert for all
-- but require the recipe to exist
CREATE POLICY "Allow insert recipe flavors" 
ON recipe_flavors
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes r WHERE r.id = recipe_id
    )
);

-- Update policy: Allow update for own recipes
CREATE POLICY "Allow update recipe flavors" 
ON recipe_flavors
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = current_setting('request.headers', true)::json->>'x-clerk-id'
    )
);

-- Delete policy: Allow delete for own recipes (or if recipe is being deleted)
CREATE POLICY "Allow delete recipe flavors" 
ON recipe_flavors
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = current_setting('request.headers', true)::json->>'x-clerk-id'
    )
    OR NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id)
);

-- =====================================================
-- Simpler approach: Temporarily disable RLS for testing
-- Uncomment below if policies still cause issues
-- =====================================================
-- ALTER TABLE recipe_flavors DISABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "Allow insert recipe flavors" ON recipe_flavors IS 'Allow insert if recipe exists. Ownership checked in application.';

DO $$
BEGIN
    RAISE NOTICE 'Migration completed: recipe_flavors RLS policies updated for Clerk auth';
END $$;
