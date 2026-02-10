-- ============================================
-- FIX: Complete replacement of public recipes with correct structure
-- Date: 2026-02-05
-- Author ID: user_38Zd9OOCY8GioiwqHKbeblRpUzJ
-- 
-- This script:
-- 1. Deletes ALL existing seed recipes
-- 2. Inserts new recipes with correct recipe_data structure including:
--    - vgPercent, pgPercent (not vgRatio)
--    - nicotine (not nicStrength)
--    - ingredients array with ingredientKey for translation
--    - English names and descriptions
-- ============================================

-- Step 1: Delete all existing seed recipes
DELETE FROM recipes WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;

-- ============================================
-- PART 1: LIQUID RECIPES (20 recipes)
-- form_type: liquid, difficulty_level: beginner
-- ============================================

-- 1. Strawberry Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh', 'Fresh strawberry taste like freshly picked berries on a summer morning. Perfect for all-day vaping.', true, 'liquid', 'beginner', 4.3, 15, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"fruit","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":10.0},{"ingredientKey":"vg","volume":18.75,"percent":62.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}]}'::jsonb, NOW());

-- 2. Strawberry Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh (0mg)', 'Fresh strawberry taste without nicotine. Pure fruit flavor experience.', true, 'liquid', 'beginner', 4.2, 12, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":0,"flavorType":"fruit","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":10.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 3. Blueberry Burst (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst', 'Intense blueberry explosion with a gentle sweet aftertaste. A beloved classic among DIY mixers.', true, 'liquid', 'beginner', 4.5, 22, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"berry","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":12.0},{"ingredientKey":"vg","volume":18.15,"percent":60.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}]}'::jsonb, NOW());

-- 4. Watermelon Summer (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer', 'Refreshing watermelon taste like a cold slice on a hot day. Light and fresh.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"watermelon","flavorPercent":12,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"watermelon","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":12.0},{"ingredientKey":"vg","volume":18.15,"percent":60.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}]}'::jsonb, NOW());

-- 5. Mango Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise', 'Exotic mango bliss with a creamy undertone. One of the most popular tropical profiles.', true, 'liquid', 'beginner', 4.6, 28, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"tropical","flavorPercent":15,"steepingDays":10,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":4.5,"percent":15.0},{"ingredientKey":"vg","volume":17.25,"percent":57.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}]}'::jsonb, NOW());

-- 6. Vanilla Custard (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard', 'Rich vanilla custard with smooth creamy notes. A dessert lovers dream.', true, 'liquid', 'beginner', 4.7, 35, 
'{"formType":"liquid","totalAmount":30,"vgPercent":80,"pgPercent":20,"nicotine":6,"nicBase":20,"nicRatio":"50/50","flavorType":"biscuit","flavorPercent":12,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":9.0,"percent":30.0},{"ingredientKey":"flavor","flavorType":"biscuit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":12.0},{"ingredientKey":"vg","volume":15.0,"percent":50.0},{"ingredientKey":"pg","volume":2.4,"percent":8.0}]}'::jsonb, NOW());

-- 7. Menthol Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Ice', 'Intense menthol cooling sensation. Perfect for ex-menthol cigarette smokers.', true, 'liquid', 'beginner', 4.4, 25, 
'{"formType":"liquid","totalAmount":30,"vgPercent":60,"pgPercent":40,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"menthol","flavorPercent":6,"steepingDays":3,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":15.45,"percent":51.5},{"ingredientKey":"pg","volume":8.25,"percent":27.5}]}'::jsonb, NOW());

-- 8. Tobacco Classic (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Classic', 'Authentic tobacco flavor for traditionalists. Smooth and satisfying.', true, 'liquid', 'beginner', 4.3, 42, 
'{"formType":"liquid","totalAmount":30,"vgPercent":50,"pgPercent":50,"nicotine":6,"nicBase":20,"nicRatio":"50/50","flavorType":"tobacco","flavorPercent":12,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":9.0,"percent":30.0},{"ingredientKey":"flavor","flavorType":"tobacco","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":12.0},{"ingredientKey":"vg","volume":6.0,"percent":20.0},{"ingredientKey":"pg","volume":11.4,"percent":38.0}]}'::jsonb, NOW());

-- 9. Grape Candy (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy', 'Sweet purple grapes with authentic candy taste. Nostalgic childhood flavor.', true, 'liquid', 'beginner', 4.2, 16, 
'{"formType":"liquid","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","flavorType":"grape","flavorPercent":15,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"grape","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":4.5,"percent":15.0},{"ingredientKey":"vg","volume":17.25,"percent":57.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}]}'::jsonb, NOW());

-- 10. Citrus Burst (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Burst (0mg)', 'Zesty lemon and lime combination. Refreshing citrus without nicotine.', true, 'liquid', 'beginner', 4.1, 11, 
'{"formType":"liquid","totalAmount":30,"vgPercent":60,"pgPercent":40,"nicotine":0,"flavorType":"citrus","flavorPercent":8,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":9.6,"percent":32.0}]}'::jsonb, NOW());

-- ============================================
-- PART 2: LIQUID PRO RECIPES (15 recipes)
-- form_type: liquidpro, difficulty: intermediate/expert/virtuoso
-- Multiple flavors with proper structure
-- ============================================

-- 11. Strawberry Banana Mix (2 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Banana Mix', 'Classic strawberry and banana combination. Smooth and fruity all-day vape.', true, 'liquidpro', 'intermediate', 4.6, 45, 
'{"formType":"liquidpro","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":17.55,"percent":58.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}],"flavors":[{"type":"fruit","percent":8,"vgRatio":0},{"type":"tropical","percent":6,"vgRatio":0}]}'::jsonb, NOW());

-- 12. Berry Medley (3 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Medley', 'Triple berry explosion: strawberry, blueberry and raspberry. Complex fruit profile.', true, 'liquidpro', 'expert', 4.8, 67, 
'{"formType":"liquidpro","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","steepingDays":10,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"flavor","flavorType":"berry","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":17.25,"percent":57.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}],"flavors":[{"type":"fruit","percent":6,"vgRatio":0},{"type":"berry","percent":5,"vgRatio":0},{"type":"berry","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 13. Tropical Storm (4 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Storm', 'Four tropical fruits: mango, pineapple, coconut and passion fruit. Island paradise.', true, 'liquidpro', 'virtuoso', 4.9, 89, 
'{"formType":"liquidpro","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.25,"percent":57.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}],"flavors":[{"type":"tropical","percent":5,"vgRatio":0},{"type":"tropical","percent":4,"vgRatio":0},{"type":"tropical","percent":3,"vgRatio":0},{"type":"tropical","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 14. Dessert Dream (2 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Dream', 'Vanilla custard with caramel notes. Rich and creamy dessert vape.', true, 'liquidpro', 'intermediate', 4.7, 52, 
'{"formType":"liquidpro","totalAmount":30,"vgPercent":80,"pgPercent":20,"nicotine":3,"nicBase":20,"nicRatio":"50/50","steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"biscuit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"candy","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":2.1,"percent":7.0}],"flavors":[{"type":"biscuit","percent":10,"vgRatio":0},{"type":"candy","percent":8,"vgRatio":0}]}'::jsonb, NOW());

-- 15. Menthol Fruits (2 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Fruits', 'Mixed berries with cooling menthol. Refreshing summer blend.', true, 'liquidpro', 'intermediate', 4.5, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgPercent":70,"pgPercent":30,"nicotine":3,"nicBase":20,"nicRatio":"50/50","steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.15,"percent":60.5},{"ingredientKey":"pg","volume":3.75,"percent":12.5}],"flavors":[{"type":"berry","percent":8,"vgRatio":0},{"type":"menthol","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- ============================================
-- PART 3: SHISHA RECIPES (30 recipes)
-- form_type: shisha
-- With proper ingredients structure
-- ============================================

-- 16. Double Apple Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Double Apple Classic', 'The legendary double apple shisha flavor. Most popular worldwide.', true, 'shisha', 'beginner', 4.8, 156, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"double_apple","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":30.0,"percent":15.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":10.0,"percent":5.0}],"flavors":[{"type":"double_apple","percent":15,"vgRatio":0}]}'::jsonb, NOW());

-- 17. Mint Sensation
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mint Sensation', 'Fresh mint for a cooling experience. Perfect for hot days.', true, 'shisha', 'beginner', 4.6, 98, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":1,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":24.0,"percent":12.0},{"ingredientKey":"sweetener","sweetenerType":"molasses","volume":24.0,"percent":12.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":12.0,"percent":6.0}],"flavors":[{"type":"menthol","percent":12,"vgRatio":0}]}'::jsonb, NOW());

-- 18. Grape Royale
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Royale', 'Sweet grapes with rich taste. A royal flavor for every evening.', true, 'shisha', 'beginner', 4.5, 87, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"grape","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":28.0,"percent":14.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":12.0,"percent":6.0}],"flavors":[{"type":"grape","percent":14,"vgRatio":0}]}'::jsonb, NOW());

-- 19. Watermelon Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Fresh', 'Juicy watermelon for summer evenings. Refreshing and sweet.', true, 'shisha', 'beginner', 4.7, 112, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":2,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"watermelon","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":30.0,"percent":15.0},{"ingredientKey":"sweetener","sweetenerType":"molasses","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":10.0,"percent":5.0}],"flavors":[{"type":"watermelon","percent":15,"vgRatio":0}]}'::jsonb, NOW());

-- 20. Blueberry Dream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Dream', 'Sweet blueberries from forest. Aromatic and delicious.', true, 'shisha', 'beginner', 4.4, 76, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"berry","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":26.0,"percent":13.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":24.0,"percent":12.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":10.0,"percent":5.0}],"flavors":[{"type":"berry","percent":13,"vgRatio":0}]}'::jsonb, NOW());

-- 21. Apple Mint (2 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Mint', 'Legendary combination of double apple and mint. The most popular mix.', true, 'shisha', 'intermediate', 4.9, 234, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"double_apple","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":24.0,"percent":12.0},{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":12.0,"percent":6.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":4.0,"percent":2.0}],"flavors":[{"type":"double_apple","percent":12,"vgRatio":0},{"type":"menthol","percent":6,"vgRatio":0}]}'::jsonb, NOW());

-- 22. Grape Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Mint', 'Sweet grapes with refreshing mint. Perfect summer combo.', true, 'shisha', 'intermediate', 4.7, 189, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"grape","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":20.0,"percent":10.0},{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"molasses","volume":24.0,"percent":12.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":3.0}],"flavors":[{"type":"grape","percent":10,"vgRatio":0},{"type":"menthol","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 23. Lemon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Mint', 'Zesty lemon with cool mint. Ultimate refreshment.', true, 'shisha', 'intermediate', 4.6, 156, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":2,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"lemon_mint","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":16.0,"percent":8.0},{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":28.0,"percent":14.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":3.0}],"flavors":[{"type":"lemon_mint","percent":8,"vgRatio":0},{"type":"menthol","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 24. Watermelon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Mint', 'Juicy watermelon meets cool mint. Summer refresher.', true, 'shisha', 'intermediate', 4.8, 178, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":2,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"watermelon","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":22.0,"percent":11.0},{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"sweetener","sweetenerType":"molasses","volume":22.0,"percent":11.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":8.0,"percent":4.0}],"flavors":[{"type":"watermelon","percent":11,"vgRatio":0},{"type":"menthol","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 25. Tropical Paradise (3 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise', 'Mango, pineapple and coconut. A taste of the islands.', true, 'shisha', 'expert', 4.8, 198, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"tropical","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":16.0,"percent":8.0},{"ingredientKey":"shisha_flavor","flavorType":"tropical","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":12.0,"percent":6.0},{"ingredientKey":"shisha_flavor","flavorType":"tropical","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":2.0,"percent":1.0}],"flavors":[{"type":"tropical","percent":8,"vgRatio":0},{"type":"tropical","percent":6,"vgRatio":0},{"type":"tropical","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 26. Berry Mix (3 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Mix', 'Strawberry, blueberry and raspberry. Forest fruits delight.', true, 'shisha', 'expert', 4.6, 145, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":14.0,"percent":7.0},{"ingredientKey":"shisha_flavor","flavorType":"berry","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":12.0,"percent":6.0},{"ingredientKey":"shisha_flavor","flavorType":"berry","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":22.0,"percent":11.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":2.0,"percent":1.0}],"flavors":[{"type":"fruit","percent":7,"vgRatio":0},{"type":"berry","percent":6,"vgRatio":0},{"type":"berry","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 27. Citrus Explosion (3 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Explosion', 'Lemon, orange and lime. Triple citrus power.', true, 'shisha', 'expert', 4.5, 134, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":2,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"citrus","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":6.0},{"ingredientKey":"shisha_flavor","flavorType":"citrus","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"shisha_flavor","flavorType":"citrus","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":26.0,"percent":13.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":2.0,"percent":1.0}],"flavors":[{"type":"citrus","percent":6,"vgRatio":0},{"type":"citrus","percent":5,"vgRatio":0},{"type":"citrus","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 28. Rose Garden (4 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Rose Garden', 'Rose, jasmine, honey and vanilla. Oriental nights.', true, 'shisha', 'virtuoso', 4.9, 167, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":5,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"rose","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"shisha_flavor","flavorType":"jasmine","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"shisha_flavor","flavorType":"candy","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"shisha_flavor","flavorType":"biscuit","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":24.0,"percent":12.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":4.0,"percent":2.0}],"flavors":[{"type":"rose","percent":4,"vgRatio":0},{"type":"jasmine","percent":4,"vgRatio":0},{"type":"candy","percent":4,"vgRatio":0},{"type":"biscuit","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 29. Master Blend (4 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Master Blend', 'Apple, grape, mint and rose. Master mixture for connoisseurs.', true, 'shisha', 'virtuoso', 4.8, 145, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":5,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"double_apple","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"shisha_flavor","flavorType":"grape","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"shisha_flavor","flavorType":"menthol","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"shisha_flavor","flavorType":"rose","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":8.0,"percent":4.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":20.0,"percent":10.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":4.0,"percent":2.0}],"flavors":[{"type":"double_apple","percent":5,"vgRatio":0},{"type":"grape","percent":5,"vgRatio":0},{"type":"menthol","percent":4,"vgRatio":0},{"type":"rose","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 30. Orange Blossom (2 flavors)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Blossom', 'Sweet orange with floral notes. Elegant and aromatic.', true, 'shisha', 'intermediate', 4.5, 98, 
'{"formType":"shisha","totalAmount":200,"vgPercent":70,"pgPercent":30,"nicotine":0,"baseType":"separate","steepingDays":3,"ingredients":[{"ingredientKey":"shisha_flavor","flavorType":"citrus","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":18.0,"percent":9.0},{"ingredientKey":"shisha_flavor","flavorType":"jasmine","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":10.0,"percent":5.0},{"ingredientKey":"sweetener","sweetenerType":"honey","volume":22.0,"percent":11.0},{"ingredientKey":"vg","volume":140.0,"percent":70.0},{"ingredientKey":"pg","volume":10.0,"percent":5.0}],"flavors":[{"type":"citrus","percent":9,"vgRatio":0},{"type":"jasmine","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- ============================================
-- PART 4: SHORTFILL RECIPES (10 recipes)
-- form_type: shortfill
-- ============================================

-- 31. Strawberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Shortfill', 'Strawberry shortfill for easy mixing. Just add nicotine booster.', true, 'shortfill', 'beginner', 4.5, 67, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorPercent":15,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":9.0,"percent":15.0}]}'::jsonb, NOW());

-- 32. Mango Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Shortfill', 'Tropical mango shortfill. Exotic flavor made easy.', true, 'shortfill', 'beginner', 4.6, 72, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorPercent":14,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"tropical","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.4,"percent":14.0}]}'::jsonb, NOW());

-- 33. Watermelon Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Shortfill', 'Watermelon shortfill for summer vaping. Refreshing and sweet.', true, 'shortfill', 'beginner', 4.4, 58, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"watermelon","flavorPercent":15,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"watermelon","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":9.0,"percent":15.0}]}'::jsonb, NOW());

-- 34. Vanilla Custard Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard Shortfill', 'Creamy vanilla custard. Dessert classic.', true, 'shortfill', 'beginner', 4.7, 89, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":80,"pgPercent":20,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"biscuit","flavorPercent":12,"steepingDays":21,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"biscuit","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.2,"percent":12.0}]}'::jsonb, NOW());

-- 35. Menthol Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Shortfill', 'Pure menthol shortfill. Icy refreshment.', true, 'shortfill', 'beginner', 4.3, 48, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"menthol","flavorPercent":8,"steepingDays":3,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"menthol","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":4.8,"percent":8.0}]}'::jsonb, NOW());

-- ============================================
-- SUMMARY
-- ============================================
-- Part 1: Liquid (beginner) - 10 recipes
-- Part 2: Liquid PRO - 5 recipes
-- Part 3: Shisha - 15 recipes
-- Part 4: Shortfill (beginner) - 5 recipes
-- ============================================
-- TOTAL: 35 recipes with correct structure
-- ============================================

-- Verification query
SELECT form_type, COUNT(*) as count,
       jsonb_array_length(recipe_data->'ingredients') as first_recipe_ingredients
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ'
  AND is_public = true
GROUP BY form_type, jsonb_array_length(recipe_data->'ingredients')
ORDER BY form_type;
