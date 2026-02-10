-- ============================================
-- DELETE ALL PUBLIC RECIPES
-- Date: 2026-02-09
-- 
-- This script deletes all public (shared) recipes
-- from the database to prepare for new seeding logic.
-- ============================================

-- Step 1: Delete all ratings for public recipes first (foreign key constraint)
DELETE FROM recipe_ratings 
WHERE recipe_id IN (
    SELECT id FROM recipes WHERE is_public = true
);

-- Step 2: Delete all reminders for public recipes (if any)
DELETE FROM recipe_reminders 
WHERE recipe_id IN (
    SELECT id FROM recipes WHERE is_public = true
);

-- Step 3: Delete all public recipes
DELETE FROM recipes WHERE is_public = true;

-- Verification: Check how many recipes remain
SELECT 
    is_public,
    COUNT(*) as count
FROM recipes
GROUP BY is_public;

-- Show total count
SELECT COUNT(*) as total_recipes FROM recipes;
