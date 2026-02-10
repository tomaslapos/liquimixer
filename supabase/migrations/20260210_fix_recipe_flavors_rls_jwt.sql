-- Migration: Fix RLS policies for recipe_flavors to use proper JWT auth
-- Date: 2026-02-10
-- Purpose: Use auth.jwt()->>'sub' instead of custom header for proper Supabase RLS
-- Reason: The previous migration used request.headers which requires custom header setup.
--         This version uses standard Supabase JWT authentication which works with Clerk tokens.

-- =====================================================
-- PART 1: Drop existing policies
-- =====================================================

DROP POLICY IF EXISTS "Allow read recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Allow insert recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Allow update recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Allow delete recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can read recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can insert recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can update recipe flavors" ON recipe_flavors;
DROP POLICY IF EXISTS "Users can delete recipe flavors" ON recipe_flavors;

-- =====================================================
-- PART 2: Create new policies using auth.jwt()
-- =====================================================

-- Read policy: User can read flavors for own recipes OR public recipes
-- auth.jwt()->>'sub' returns the Clerk user ID from the JWT token
CREATE POLICY "recipe_flavors_select_policy" 
ON recipe_flavors
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND (
            r.is_public = true 
            OR r.clerk_id = auth.jwt()->>'sub'
        )
    )
);

-- Insert policy: User can insert for own recipes
CREATE POLICY "recipe_flavors_insert_policy" 
ON recipe_flavors
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = auth.jwt()->>'sub'
    )
);

-- Update policy: User can update for own recipes
CREATE POLICY "recipe_flavors_update_policy" 
ON recipe_flavors
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM recipes r 
        WHERE r.id = recipe_id 
        AND r.clerk_id = auth.jwt()->>'sub'
    )
);

-- Delete policy: User can delete for own recipes
CREATE POLICY "recipe_flavors_delete_policy" 
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
-- PART 3: Add comments
-- =====================================================

COMMENT ON POLICY "recipe_flavors_select_policy" ON recipe_flavors IS 
'Allow read if recipe is public or belongs to authenticated user (via JWT sub claim)';

COMMENT ON POLICY "recipe_flavors_insert_policy" ON recipe_flavors IS 
'Allow insert if recipe belongs to authenticated user (via JWT sub claim)';

COMMENT ON POLICY "recipe_flavors_update_policy" ON recipe_flavors IS 
'Allow update if recipe belongs to authenticated user (via JWT sub claim)';

COMMENT ON POLICY "recipe_flavors_delete_policy" ON recipe_flavors IS 
'Allow delete if recipe belongs to authenticated user (via JWT sub claim)';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration completed: recipe_flavors RLS policies updated to use auth.jwt()';
    RAISE NOTICE 'Policies now use auth.jwt()->>''sub'' which matches Clerk user ID';
END $$;
