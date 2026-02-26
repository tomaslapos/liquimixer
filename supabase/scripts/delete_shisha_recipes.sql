-- ============================================
-- DELETE ALL SHISHA RECIPES
-- Date: 2026-02-26
-- ============================================
-- Smaže VŠECHNY shisha recepty:
--   1. Seed recepty (user_38Zd9OOCY8GioiwqHKbeblRpUzJ)
--   2. Uživatelské recepty (všechny clerk_id)
-- Důvod: Stávající shisha recepty používají nesprávnou logiku
--         (VG/PG báze místo tabákových směsí)
-- ============================================

-- Step 0: Count before delete
SELECT 'BEFORE DELETE' as status,
       COUNT(*) as total_shisha_recipes,
       COUNT(*) FILTER (WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ') as seed_recipes,
       COUNT(*) FILTER (WHERE clerk_id != 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ') as user_recipes
FROM recipes
WHERE form_type = 'shisha';

-- Step 1: Delete recipe_ratings for shisha recipes (no CASCADE)
DELETE FROM recipe_ratings
WHERE recipe_id IN (
    SELECT id FROM recipes WHERE form_type = 'shisha'
);

-- Step 2: Delete recipes (recipe_flavors has ON DELETE CASCADE → auto-deleted)
DELETE FROM recipes
WHERE form_type = 'shisha';

-- Step 3: Verify
SELECT 'AFTER DELETE' as status,
       COUNT(*) as remaining_shisha_recipes
FROM recipes
WHERE form_type = 'shisha';

-- Step 4: Show remaining recipe counts by type
SELECT form_type, COUNT(*) as count
FROM recipes
GROUP BY form_type
ORDER BY form_type;
