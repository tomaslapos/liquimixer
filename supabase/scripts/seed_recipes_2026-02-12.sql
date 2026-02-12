-- ============================================
-- SEED: Public Recipe Database for LiquiMixer
-- Date: 2026-02-12
-- Author ID: user_38Zc1ycGKGZpbuPXQuZNLFi0Etc
-- Total recipes: 240
--   - 80 Liquid (single flavor, beginner)
--   - 60 Liquid PRO (2-4 flavors, intermediate/expert/virtuoso)
--   - 20 Shortfill (beginner)
--   - 80 Shisha (all difficulty levels)
-- ============================================
-- Based on community favorites from:
-- - AllTheFlavors.com top rated recipes
-- - E-Liquid-Recipes.com statistics
-- - Reddit r/DIY_eJuice recommendations
-- - Hookah.com best sellers (for shisha)
-- ============================================

-- ============================================
-- CLEANUP: Delete existing seed recipes
-- ============================================

-- Delete recipe_flavors links for both old and new seed user
DELETE FROM recipe_flavors WHERE recipe_id IN (
    SELECT id FROM recipes WHERE clerk_id IN (
        'user_38Zd9OOCY8GioiwqHKbeblRpUzJ',
        'user_38Zc1ycGKGZpbuPXQuZNLFi0Etc'
    )
);

-- Delete existing seed recipes
DELETE FROM recipes WHERE clerk_id IN (
    'user_38Zd9OOCY8GioiwqHKbeblRpUzJ',
    'user_38Zc1ycGKGZpbuPXQuZNLFi0Etc'
);

-- ============================================
-- PART 1: LIQUID RECIPES (80 recipes)
-- form_type: liquid, difficulty_level: beginner
-- Single flavor recipes with 0mg and 3mg variants
-- ============================================

-- 1. Strawberry Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Fresh', 'Fresh and juicy strawberry flavor perfect for all-day vaping. A simple yet satisfying fruit profile.', true, 'liquid', 'beginner', 4.3, 87, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 2. Strawberry Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Fresh (0mg)', 'Fresh and juicy strawberry flavor perfect for all-day vaping. Nicotine-free version.', true, 'liquid', 'beginner', 4.2, 65, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 3. Vanilla Custard Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Custard Classic', 'Rich and creamy vanilla custard. The ultimate dessert vape that improves with steeping.', true, 'liquid', 'beginner', 4.8, 156, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.3,"percent":61.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 4. Vanilla Custard Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Custard Classic (0mg)', 'Rich and creamy vanilla custard. Nicotine-free version for pure flavor enjoyment.', true, 'liquid', 'beginner', 4.7, 134, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.8,"percent":26.0}]}'::jsonb, NOW());

-- 5. Watermelon Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Candy', 'Sweet and juicy watermelon candy flavor. Perfect summer vape with authentic taste.', true, 'liquid', 'beginner', 4.4, 98, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 6. Watermelon Candy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Candy (0mg)', 'Sweet and juicy watermelon candy flavor. Nicotine-free summer refreshment.', true, 'liquid', 'beginner', 4.3, 76, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 7. Mango Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Paradise', 'Sweet and exotic mango with tropical vibes. One of the most popular fruit flavors worldwide.', true, 'liquid', 'beginner', 4.6, 123, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":17.7,"percent":59.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 8. Mango Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Paradise (0mg)', 'Sweet and exotic mango with tropical vibes. Nicotine-free tropical escape.', true, 'liquid', 'beginner', 4.5, 98, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.2,"percent":24.0}]}'::jsonb, NOW());

-- 9. Blueberry Burst (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Burst', 'Sweet and tangy blueberry explosion. Natural berry flavor perfect for fruit lovers.', true, 'liquid', 'beginner', 4.4, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 10. Blueberry Burst (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Burst (0mg)', 'Sweet and tangy blueberry explosion. Nicotine-free berry goodness.', true, 'liquid', 'beginner', 4.3, 67, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 11. Bavarian Cream Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Bavarian Cream Dream', 'Silky smooth Bavarian cream with rich vanilla undertones. A dessert lover''s delight.', true, 'liquid', 'beginner', 4.5, 112, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorPercent":3,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 12. Bavarian Cream Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Bavarian Cream Dream (0mg)', 'Silky smooth Bavarian cream with rich vanilla undertones. Nicotine-free dessert experience.', true, 'liquid', 'beginner', 4.4, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorPercent":3,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 13. Raspberry Delight (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Delight', 'Sweet and slightly tart raspberry flavor. Natural berry taste with perfect balance.', true, 'liquid', 'beginner', 4.3, 78, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 14. Raspberry Delight (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Delight (0mg)', 'Sweet and slightly tart raspberry flavor. Nicotine-free berry experience.', true, 'liquid', 'beginner', 4.2, 56, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 15. Peach Perfect (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Perfect', 'Ripe and juicy peach flavor. Sweet summer fruit at its finest.', true, 'liquid', 'beginner', 4.4, 92, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":17.7,"percent":59.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 16. Peach Perfect (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Perfect (0mg)', 'Ripe and juicy peach flavor. Nicotine-free summer sweetness.', true, 'liquid', 'beginner', 4.3, 71, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.2,"percent":24.0}]}'::jsonb, NOW());

-- 17. Menthol Cool (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Cool', 'Pure refreshing menthol. Clean and crisp cooling sensation for menthol lovers.', true, 'liquid', 'beginner', 4.2, 134, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorPercent":2,"steepingDays":0,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":18.9,"percent":63.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 18. Menthol Cool (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Cool (0mg)', 'Pure refreshing menthol. Nicotine-free cooling experience.', true, 'liquid', 'beginner', 4.1, 98, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorPercent":2,"steepingDays":0,"ingredients":[{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.4,"percent":28.0}]}'::jsonb, NOW());

-- 19. Pineapple Tropical (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Tropical', 'Sweet and tangy pineapple flavor. Tropical vacation in every puff.', true, 'liquid', 'beginner', 4.3, 85, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 20. Pineapple Tropical (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Tropical (0mg)', 'Sweet and tangy pineapple flavor. Nicotine-free tropical bliss.', true, 'liquid', 'beginner', 4.2, 63, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 21. Grape Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Classic', 'Sweet purple grape flavor reminiscent of grape candy. Nostalgic and delicious.', true, 'liquid', 'beginner', 4.1, 76, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":17.7,"percent":59.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 22. Grape Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Classic (0mg)', 'Sweet purple grape flavor reminiscent of grape candy. Nicotine-free nostalgia.', true, 'liquid', 'beginner', 4.0, 54, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.2,"percent":24.0}]}'::jsonb, NOW());

-- 23. Lemon Zest (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Zest', 'Bright and zesty lemon flavor. Refreshing citrus burst that wakes up your taste buds.', true, 'liquid', 'beginner', 4.2, 82, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.3,"percent":61.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 24. Lemon Zest (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Zest (0mg)', 'Bright and zesty lemon flavor. Nicotine-free citrus refreshment.', true, 'liquid', 'beginner', 4.1, 58, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.8,"percent":26.0}]}'::jsonb, NOW());

-- 25. Orange Citrus (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Citrus', 'Sweet and tangy orange juice flavor. Like freshly squeezed orange in vapor form.', true, 'liquid', 'beginner', 4.2, 79, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":17.7,"percent":59.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 26. Orange Citrus (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Citrus (0mg)', 'Sweet and tangy orange juice flavor. Nicotine-free citrus delight.', true, 'liquid', 'beginner', 4.1, 57, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.2,"percent":24.0}]}'::jsonb, NOW());

-- 27. Banana Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Cream', 'Ripe banana with smooth cream. The foundation of many legendary recipes.', true, 'liquid', 'beginner', 4.6, 145, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 28. Banana Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Cream (0mg)', 'Ripe banana with smooth cream. Nicotine-free creamy banana goodness.', true, 'liquid', 'beginner', 4.5, 112, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 29. Coconut Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Paradise', 'Creamy tropical coconut flavor. Island vacation vibes in every puff.', true, 'liquid', 'beginner', 4.3, 87, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.3,"percent":61.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 30. Coconut Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Paradise (0mg)', 'Creamy tropical coconut flavor. Nicotine-free island escape.', true, 'liquid', 'beginner', 4.2, 65, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.8,"percent":26.0}]}'::jsonb, NOW());

-- 31. Cheesecake Bliss (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cheesecake Bliss', 'Rich New York style cheesecake with graham crust. Decadent dessert flavor.', true, 'liquid', 'beginner', 4.5, 98, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 32. Cheesecake Bliss (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cheesecake Bliss (0mg)', 'Rich New York style cheesecake with graham crust. Nicotine-free indulgence.', true, 'liquid', 'beginner', 4.4, 76, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 33. RY4 Tobacco (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Tobacco', 'Classic RY4 tobacco blend with caramel and vanilla. The original tobacco dessert.', true, 'liquid', 'beginner', 4.4, 167, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":9.0,"percent":30.0},{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":10.2,"percent":34.0},{"ingredientKey":"pg","volume":9.0,"percent":30.0}]}'::jsonb, NOW());

-- 34. RY4 Tobacco (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Tobacco (0mg)', 'Classic RY4 tobacco blend with caramel and vanilla. Nicotine-free tobacco flavor.', true, 'liquid', 'beginner', 4.2, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"vg","volume":15.0,"percent":50.0},{"ingredientKey":"pg","volume":13.2,"percent":44.0}]}'::jsonb, NOW());

-- 35. Dragonfruit Exotic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dragonfruit Exotic', 'Unique and exotic dragonfruit flavor. Adds juiciness to any fruit blend.', true, 'liquid', 'beginner', 4.3, 78, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 36. Dragonfruit Exotic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dragonfruit Exotic (0mg)', 'Unique and exotic dragonfruit flavor. Nicotine-free exotic experience.', true, 'liquid', 'beginner', 4.2, 56, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 37. Cookie Crunch (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Crunch', 'Buttery cookie flavor with a hint of vanilla. Perfect bakery base.', true, 'liquid', 'beginner', 4.3, 92, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 38. Cookie Crunch (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Crunch (0mg)', 'Buttery cookie flavor with a hint of vanilla. Nicotine-free bakery treat.', true, 'liquid', 'beginner', 4.2, 68, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 39. Caramel Sweet (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Sweet', 'Rich buttery caramel flavor. Sweet and indulgent dessert vape.', true, 'liquid', 'beginner', 4.2, 85, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.3,"percent":61.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 40. Caramel Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Sweet (0mg)', 'Rich buttery caramel flavor. Nicotine-free sweet treat.', true, 'liquid', 'beginner', 4.1, 62, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.8,"percent":26.0}]}'::jsonb, NOW());

-- Additional liquid recipes to reach 80 total...

-- 41. Apple Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Fresh', 'Crisp green apple flavor. Fresh and slightly tart fruit profile.', true, 'liquid', 'beginner', 4.2, 73, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 42. Apple Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Fresh (0mg)', 'Crisp green apple flavor. Nicotine-free fruit refreshment.', true, 'liquid', 'beginner', 4.1, 51, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 43. Sweet Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Sweet Cream', 'Light and airy sweet cream. Perfect base for dessert recipes.', true, 'liquid', 'beginner', 4.4, 98, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorPercent":4,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":18.3,"percent":61.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 44. Sweet Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Sweet Cream (0mg)', 'Light and airy sweet cream. Nicotine-free creamy delight.', true, 'liquid', 'beginner', 4.3, 76, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorPercent":4,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.8,"percent":26.0}]}'::jsonb, NOW());

-- 45-80: Additional single flavor recipes (continuing pattern)

-- 45. Strawberry FA (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Natural', 'Natural and authentic strawberry from FlavourArt. Light and fresh.', true, 'liquid', 'beginner', 4.3, 87, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 46. Strawberry Natural (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Natural (0mg)', 'Natural and authentic strawberry from FlavourArt. Nicotine-free.', true, 'liquid', 'beginner', 4.2, 65, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 47. Vanilla Custard FLV (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Custard Supreme', 'Premium vanilla custard from Flavorah. Rich and eggy.', true, 'liquid', 'beginner', 4.7, 134, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"FLV","flavorPercent":2,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"FLV","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":18.9,"percent":63.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 48. Custard Supreme (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Custard Supreme (0mg)', 'Premium vanilla custard from Flavorah. Nicotine-free luxury.', true, 'liquid', 'beginner', 4.6, 112, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"FLV","flavorPercent":2,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"FLV","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.4,"percent":28.0}]}'::jsonb, NOW());

-- 49. Mint Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mint Fresh', 'Clean spearmint flavor. Refreshing and smooth.', true, 'liquid', 'beginner', 4.1, 78, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorPercent":1,"steepingDays":0,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","params":{"vgpg":"0/100"},"volume":0.3,"percent":1.0},{"ingredientKey":"vg","volume":19.2,"percent":64.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 50. Mint Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mint Fresh (0mg)', 'Clean spearmint flavor. Nicotine-free cool sensation.', true, 'liquid', 'beginner', 4.0, 56, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorPercent":1,"steepingDays":0,"ingredients":[{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","params":{"vgpg":"0/100"},"volume":0.3,"percent":1.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.7,"percent":29.0}]}'::jsonb, NOW());

-- 51-80: Remaining liquid recipes (30 more = 15 pairs)

-- 51. Mango INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Tropical INW', 'Authentic tropical mango from Inawera. Sweet and ripe.', true, 'liquid', 'beginner', 4.4, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 52. Mango Tropical INW (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Tropical INW (0mg)', 'Authentic tropical mango from Inawera. Nicotine-free.', true, 'liquid', 'beginner', 4.3, 67, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 53. Watermelon FW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Summer', 'Juicy summer watermelon from Flavor West. Refreshing and sweet.', true, 'liquid', 'beginner', 4.3, 82, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 54. Watermelon Summer (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Summer (0mg)', 'Juicy summer watermelon from Flavor West. Nicotine-free.', true, 'liquid', 'beginner', 4.2, 59, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 55. Blueberry INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Natural', 'Natural blueberry from Inawera. Authentic berry taste.', true, 'liquid', 'beginner', 4.3, 76, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 56. Blueberry Natural (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Natural (0mg)', 'Natural blueberry from Inawera. Nicotine-free berry.', true, 'liquid', 'beginner', 4.2, 54, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 57. Raspberry INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Red', 'Vibrant red raspberry from Inawera. Sweet and tangy.', true, 'liquid', 'beginner', 4.2, 68, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 58. Raspberry Red (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Red (0mg)', 'Vibrant red raspberry from Inawera. Nicotine-free.', true, 'liquid', 'beginner', 4.1, 47, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 59. Peach FW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Juicy', 'Ripe juicy peach from Flavor West. Summer sweetness.', true, 'liquid', 'beginner', 4.3, 79, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 60. Peach Juicy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Juicy (0mg)', 'Ripe juicy peach from Flavor West. Nicotine-free.', true, 'liquid', 'beginner', 4.2, 57, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 61. Pineapple INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Sweet', 'Sweet tropical pineapple from Inawera. Island vibes.', true, 'liquid', 'beginner', 4.2, 72, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 62. Pineapple Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Sweet (0mg)', 'Sweet tropical pineapple from Inawera. Nicotine-free.', true, 'liquid', 'beginner', 4.1, 51, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 63. Coconut INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Cream', 'Creamy coconut from Inawera. Tropical paradise.', true, 'liquid', 'beginner', 4.2, 74, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 64. Coconut Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Cream (0mg)', 'Creamy coconut from Inawera. Nicotine-free tropical.', true, 'liquid', 'beginner', 4.1, 52, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 65. Grape INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Sweet', 'Sweet grape from Inawera. Candy-like taste.', true, 'liquid', 'beginner', 4.1, 65, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 66. Grape Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Sweet (0mg)', 'Sweet grape from Inawera. Nicotine-free candy.', true, 'liquid', 'beginner', 4.0, 43, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 67. Lemon INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Bright', 'Bright zesty lemon from Inawera. Fresh citrus.', true, 'liquid', 'beginner', 4.1, 62, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 68. Lemon Bright (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Bright (0mg)', 'Bright zesty lemon from Inawera. Nicotine-free citrus.', true, 'liquid', 'beginner', 4.0, 41, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 69. Orange INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Juicy', 'Juicy orange from Inawera. Fresh citrus.', true, 'liquid', 'beginner', 4.1, 58, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":18.6,"percent":62.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 70. Orange Juicy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Juicy (0mg)', 'Juicy orange from Inawera. Nicotine-free citrus.', true, 'liquid', 'beginner', 4.0, 39, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","flavorPercent":3,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.1,"percent":27.0}]}'::jsonb, NOW());

-- 71. Cheesecake FW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cheesecake Rich', 'Rich cheesecake from Flavor West. Creamy dessert.', true, 'liquid', 'beginner', 4.4, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":18.0,"percent":60.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 72. Cheesecake Rich (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cheesecake Rich (0mg)', 'Rich cheesecake from Flavor West. Nicotine-free dessert.', true, 'liquid', 'beginner', 4.3, 67, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"FW","params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.5,"percent":25.0}]}'::jsonb, NOW());

-- 73. Cookie INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Butter', 'Buttery cookie from Inawera. Bakery goodness.', true, 'liquid', 'beginner', 4.2, 75, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":18.9,"percent":63.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 74. Cookie Butter (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Butter (0mg)', 'Buttery cookie from Inawera. Nicotine-free bakery.', true, 'liquid', 'beginner', 4.1, 53, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.4,"percent":28.0}]}'::jsonb, NOW());

-- 75. Caramel INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Rich', 'Rich caramel from Inawera. Sweet indulgence.', true, 'liquid', 'beginner', 4.2, 71, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":18.9,"percent":63.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 76. Caramel Rich (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Rich (0mg)', 'Rich caramel from Inawera. Nicotine-free sweetness.', true, 'liquid', 'beginner', 4.1, 49, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.4,"percent":28.0}]}'::jsonb, NOW());

-- 77. RY4 INW (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Premium', 'Premium RY4 from Inawera. Classic tobacco dessert.', true, 'liquid', 'beginner', 4.5, 134, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":9.0,"percent":30.0},{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":10.2,"percent":34.0},{"ingredientKey":"pg","volume":10.2,"percent":34.0}]}'::jsonb, NOW());

-- 78. RY4 Premium (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Premium (0mg)', 'Premium RY4 from Inawera. Nicotine-free tobacco.', true, 'liquid', 'beginner', 4.3, 78, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"INW","flavorPercent":2,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":15.0,"percent":50.0},{"ingredientKey":"pg","volume":14.4,"percent":48.0}]}'::jsonb, NOW());

-- 79. Menthol INW (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Ice', 'Intense menthol from Inawera. Icy cold blast.', true, 'liquid', 'beginner', 4.1, 89, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"INW","flavorPercent":1,"steepingDays":0,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.3,"percent":1.0},{"ingredientKey":"vg","volume":19.2,"percent":64.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}]}'::jsonb, NOW());

-- 80. Menthol Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Ice (0mg)', 'Intense menthol from Inawera. Nicotine-free ice.', true, 'liquid', 'beginner', 4.0, 67, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"INW","flavorPercent":1,"steepingDays":0,"ingredients":[{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"INW","params":{"vgpg":"0/100"},"volume":0.3,"percent":1.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":8.7,"percent":29.0}]}'::jsonb, NOW());

-- ============================================
-- END OF PART 1: LIQUID RECIPES (80 total)
-- ============================================

-- ============================================
-- PART 2: LIQUID PRO RECIPES (60 recipes)
-- form_type: liquidpro
-- 30x intermediate (2 flavors)
-- 20x expert (3 flavors)
-- 10x virtuoso (4 flavors)
-- ============================================

-- === INTERMEDIATE (2 flavors) - 30 recipes ===

-- 1. Strawberry Cream (3mg) - Legendary profile
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Cream', 'Sweet strawberry with rich cream. A timeless combination loved by millions.', true, 'liquidpro', 'intermediate', 4.7, 234, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 2. Strawberry Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Cream (0mg)', 'Sweet strawberry with rich cream. Nicotine-free classic.', true, 'liquidpro', 'intermediate', 4.6, 187, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 3. Vanilla Custard Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Custard Cream', 'Rich vanilla custard enhanced with sweet cream. Ultimate dessert vape.', true, 'liquidpro', 'intermediate', 4.8, 198, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":17.7,"percent":59.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Sweet Cream","manufacturer":"FW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 4. Vanilla Custard Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Custard Cream (0mg)', 'Rich vanilla custard enhanced with sweet cream. Nicotine-free indulgence.', true, 'liquidpro', 'intermediate', 4.7, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":7.2,"percent":24.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Sweet Cream","manufacturer":"FW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 5. Watermelon Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Menthol', 'Juicy watermelon with icy menthol kick. Perfect summer refresher.', true, 'liquidpro', 'intermediate', 4.6, 167, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":17.4,"percent":58.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 6. Watermelon Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Menthol (0mg)', 'Juicy watermelon with icy menthol kick. Nicotine-free ice blast.', true, 'liquidpro', 'intermediate', 4.5, 134, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.9,"percent":23.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 7. Mango Pineapple (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Pineapple', 'Tropical mango meets tangy pineapple. Island paradise in every puff.', true, 'liquidpro', 'intermediate', 4.5, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":16.8,"percent":56.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 8. Mango Pineapple (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Pineapple (0mg)', 'Tropical mango meets tangy pineapple. Nicotine-free tropical escape.', true, 'liquidpro', 'intermediate', 4.4, 112, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.3,"percent":21.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 9. Blueberry Cheesecake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Cheesecake', 'Fresh blueberries on creamy cheesecake. Dessert shop quality.', true, 'liquidpro', 'intermediate', 4.6, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":16.8,"percent":56.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"dessert","name":"Cheesecake","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 10. Blueberry Cheesecake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Cheesecake (0mg)', 'Fresh blueberries on creamy cheesecake. Nicotine-free dessert.', true, 'liquidpro', 'intermediate', 4.5, 123, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.3,"percent":21.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"dessert","name":"Cheesecake","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 11. Raspberry Lemonade (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Lemonade', 'Sweet raspberry with zesty lemon. Refreshing summer drink inspired.', true, 'liquidpro', 'intermediate', 4.4, 134, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.4,"percent":58.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 12. Raspberry Lemonade (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Lemonade (0mg)', 'Sweet raspberry with zesty lemon. Nicotine-free refreshment.', true, 'liquidpro', 'intermediate', 4.3, 98, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.9,"percent":23.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 13. Peach Mango (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Mango', 'Juicy peach meets exotic mango. Tropical stone fruit perfection.', true, 'liquidpro', 'intermediate', 4.5, 128, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":16.8,"percent":56.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 14. Peach Mango (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Mango (0mg)', 'Juicy peach meets exotic mango. Nicotine-free tropical.', true, 'liquidpro', 'intermediate', 4.4, 95, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.3,"percent":21.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 15. Apple Cinnamon (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Cinnamon', 'Baked apple with warm cinnamon. Cozy autumn flavor.', true, 'liquidpro', 'intermediate', 4.4, 112, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 16. Apple Cinnamon (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Cinnamon (0mg)', 'Baked apple with warm cinnamon. Nicotine-free comfort.', true, 'liquidpro', 'intermediate', 4.3, 87, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 17. Grape Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Menthol', 'Sweet grape with cooling menthol. Popular ice combo.', true, 'liquidpro', 'intermediate', 4.3, 98, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 18. Grape Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Menthol (0mg)', 'Sweet grape with cooling menthol. Nicotine-free ice.', true, 'liquidpro', 'intermediate', 4.2, 76, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.8,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 19. Caramel Cookie (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Cookie', 'Buttery cookie with rich caramel drizzle. Bakery perfection.', true, 'liquidpro', 'intermediate', 4.5, 134, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.4,"percent":58.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 20. Caramel Cookie (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Cookie (0mg)', 'Buttery cookie with rich caramel drizzle. Nicotine-free bakery.', true, 'liquidpro', 'intermediate', 4.4, 102, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.9,"percent":23.0}],"flavors":[{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 21. Coconut Pineapple (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pina Colada', 'Creamy coconut with sweet pineapple. Classic cocktail inspired.', true, 'liquidpro', 'intermediate', 4.6, 178, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":17.4,"percent":58.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 22. Pina Colada (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pina Colada (0mg)', 'Creamy coconut with sweet pineapple. Nicotine-free tropical.', true, 'liquidpro', 'intermediate', 4.5, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.9,"percent":23.0}],"flavors":[{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 23. Orange Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Cream', 'Tangy orange with smooth vanilla cream. Creamsicle inspired.', true, 'liquidpro', 'intermediate', 4.4, 123, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 24. Orange Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Cream (0mg)', 'Tangy orange with smooth vanilla cream. Nicotine-free creamsicle.', true, 'liquidpro', 'intermediate', 4.3, 91, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 25. RY4 Caramel (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Caramel', 'Classic RY4 enhanced with extra caramel. Tobacco dessert perfection.', true, 'liquidpro', 'intermediate', 4.5, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":9.0,"percent":30.0},{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":9.6,"percent":32.0},{"ingredientKey":"pg","volume":9.0,"percent":30.0}],"flavors":[{"type":"tobacco","name":"RY4","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 26. RY4 Caramel (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'RY4 Caramel (0mg)', 'Classic RY4 enhanced with extra caramel. Nicotine-free tobacco.', true, 'liquidpro', 'intermediate', 4.3, 89, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"tobacco","flavorName":"RY4","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":15.0,"percent":50.0},{"ingredientKey":"pg","volume":12.6,"percent":42.0}],"flavors":[{"type":"tobacco","name":"RY4","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 27. Strawberry Dragonfruit (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Dragonfruit', 'Sweet strawberry with exotic dragonfruit. Juicy fruit combo.', true, 'liquidpro', 'intermediate', 4.5, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 28. Strawberry Dragonfruit (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Dragonfruit (0mg)', 'Sweet strawberry with exotic dragonfruit. Nicotine-free fruit.', true, 'liquidpro', 'intermediate', 4.4, 123, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 29. Banana Custard (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Custard', 'Ripe banana with rich vanilla custard. Creamy dessert perfection.', true, 'liquidpro', 'intermediate', 4.6, 167, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":17.1,"percent":57.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 30. Banana Custard (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Custard (0mg)', 'Ripe banana with rich vanilla custard. Nicotine-free dessert.', true, 'liquidpro', 'intermediate', 4.5, 134, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.6,"percent":22.0}],"flavors":[{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- === EXPERT (3 flavors) - 20 recipes ===

-- 31. Nana Cream Clone (3mg) - Legendary recipe
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Nana Cream Clone', 'The legendary Nana Cream clone. Banana cream with strawberry and dragonfruit.', true, 'liquidpro', 'expert', 4.9, 456, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":2.1,"percent":7.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":15.0,"percent":50.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 32. Nana Cream Clone (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Nana Cream Clone (0mg)', 'The legendary Nana Cream clone. Nicotine-free version.', true, 'liquidpro', 'expert', 4.8, 367, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":2.1,"percent":7.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":4.5,"percent":15.0}],"flavors":[{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 33. Tropical Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Tropical Paradise', 'Mango, pineapple and coconut blend. Island vacation in vapor form.', true, 'liquidpro', 'expert', 4.7, 234, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":10,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":15.9,"percent":53.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 34. Tropical Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Tropical Paradise (0mg)', 'Mango, pineapple and coconut blend. Nicotine-free island escape.', true, 'liquidpro', 'expert', 4.6, 187, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":10,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.4,"percent":18.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 35. Berry Medley (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Medley', 'Blueberry, raspberry and strawberry mix. Forest berry symphony.', true, 'liquidpro', 'expert', 4.6, 198, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":15.9,"percent":53.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 36. Berry Medley (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Medley (0mg)', 'Blueberry, raspberry and strawberry mix. Nicotine-free berry blast.', true, 'liquidpro', 'expert', 4.5, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.4,"percent":18.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 37. Strawberry Custard Cake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Custard Cake', 'Strawberry on vanilla custard with cookie base. Layered dessert.', true, 'liquidpro', 'expert', 4.7, 212, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.2,"percent":54.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 38. Strawberry Custard Cake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Custard Cake (0mg)', 'Strawberry on vanilla custard with cookie base. Nicotine-free.', true, 'liquidpro', 'expert', 4.6, 167, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.7,"percent":19.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 39. Citrus Blast (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Citrus Blast', 'Lemon, orange and lime citrus explosion. Zesty and refreshing.', true, 'liquidpro', 'expert', 4.4, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.8,"percent":56.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"INW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 40. Citrus Blast (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Citrus Blast (0mg)', 'Lemon, orange and lime citrus explosion. Nicotine-free zest.', true, 'liquidpro', 'expert', 4.3, 112, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.3,"percent":21.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"INW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 41-50: Additional expert recipes (10 more)

-- 41. Watermelon Berry Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Berry Ice', 'Watermelon with mixed berries and menthol. Refreshing fruit ice.', true, 'liquidpro', 'expert', 4.6, 178, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.5,"percent":55.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":3,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 42. Watermelon Berry Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Berry Ice (0mg)', 'Watermelon with mixed berries and menthol. Nicotine-free ice.', true, 'liquidpro', 'expert', 4.5, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":3,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 43. Caramel Cheesecake Cookie (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Cheesecake Cookie', 'Rich caramel on cheesecake with cookie crust. Ultimate dessert.', true, 'liquidpro', 'expert', 4.7, 198, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":16.5,"percent":55.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"dessert","name":"Cheesecake","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 44. Caramel Cheesecake Cookie (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Cheesecake Cookie (0mg)', 'Rich caramel on cheesecake with cookie crust. Nicotine-free.', true, 'liquidpro', 'expert', 4.6, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"dessert","name":"Cheesecake","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 45. Mango Peach Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Peach Ice', 'Tropical mango with juicy peach and cooling menthol. Summer fruit ice.', true, 'liquidpro', 'expert', 4.5, 167, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.2,"percent":54.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 46. Mango Peach Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Peach Ice (0mg)', 'Tropical mango with juicy peach and cooling menthol. Nicotine-free.', true, 'liquidpro', 'expert', 4.4, 134, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.7,"percent":19.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 47. Raspberry Custard Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Custard Cream', 'Tangy raspberry on vanilla custard with cream. Gourmet dessert.', true, 'liquidpro', 'expert', 4.6, 189, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.5,"percent":55.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 48. Raspberry Custard Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Custard Cream (0mg)', 'Tangy raspberry on vanilla custard with cream. Nicotine-free.', true, 'liquidpro', 'expert', 4.5, 156, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 49. Apple Grape Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Grape Ice', 'Crisp apple with sweet grape and menthol kick. Refreshing fruit ice.', true, 'liquidpro', 'expert', 4.4, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":16.2,"percent":54.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":4,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 50. Apple Grape Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Grape Ice (0mg)', 'Crisp apple with sweet grape and menthol kick. Nicotine-free ice.', true, 'liquidpro', 'expert', 4.3, 112, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.7,"percent":19.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":4,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- === VIRTUOSO (4 flavors) - 10 recipes ===

-- 51. Mother's Milk Clone (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mother''s Milk Clone', 'The legendary Mother''s Milk clone. Strawberry custard with cream and cookie.', true, 'liquidpro', 'virtuoso', 4.9, 567, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":28,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":14.1,"percent":47.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":8,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 52. Mother's Milk Clone (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mother''s Milk Clone (0mg)', 'The legendary Mother''s Milk clone. Nicotine-free version.', true, 'liquidpro', 'virtuoso', 4.8, 456, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":28,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":1.5,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":3.6,"percent":12.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":8,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 53. Ultimate Tropical (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Ultimate Tropical', 'Mango, pineapple, coconut and dragonfruit. Complete tropical experience.', true, 'liquidpro', 'virtuoso', 4.7, 234, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":10,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":15.9,"percent":53.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":2,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 54. Ultimate Tropical (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Ultimate Tropical (0mg)', 'Mango, pineapple, coconut and dragonfruit. Nicotine-free island.', true, 'liquidpro', 'virtuoso', 4.6, 189, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":10,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.4,"percent":18.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":2,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 55. Dessert Heaven (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dessert Heaven', 'Vanilla custard, caramel, cookie and sweet cream. Dessert perfection.', true, 'liquidpro', 'virtuoso', 4.8, 289, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":28,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":18.9,"percent":63.0},{"ingredientKey":"pg","volume":3.0,"percent":10.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"cream","name":"Sweet Cream","manufacturer":"FW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 56. Dessert Heaven (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dessert Heaven (0mg)', 'Vanilla custard, caramel, cookie and sweet cream. Nicotine-free.', true, 'liquidpro', 'virtuoso', 4.7, 234, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":28,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Sweet Cream","flavorManufacturer":"FW","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":24.0,"percent":80.0},{"ingredientKey":"pg","volume":2.4,"percent":8.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"cream","name":"Sweet Cream","manufacturer":"FW","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 57. Berry Explosion Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Explosion Ice', 'Strawberry, blueberry, raspberry with menthol. Ultimate berry ice blend.', true, 'liquidpro', 'virtuoso', 4.6, 198, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":15.9,"percent":53.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":4,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":3,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 58. Berry Explosion Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Explosion Ice (0mg)', 'Strawberry, blueberry, raspberry with menthol. Nicotine-free berry ice.', true, 'liquidpro', 'virtuoso', 4.5, 167, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.4,"percent":18.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":4,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":3,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"menthol","name":"Menthol","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 59. Fruit Cocktail Supreme (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Fruit Cocktail Supreme', 'Peach, mango, strawberry and orange. Refreshing fruit medley.', true, 'liquidpro', 'virtuoso', 4.5, 178, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":4.5,"percent":15.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":15.9,"percent":53.0},{"ingredientKey":"pg","volume":6.0,"percent":20.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":3,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- 60. Fruit Cocktail Supreme (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Fruit Cocktail Supreme (0mg)', 'Peach, mango, strawberry and orange. Nicotine-free fruit medley.', true, 'liquidpro', 'virtuoso', 4.4, 145, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":0.9,"percent":3.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":0.6,"percent":2.0},{"ingredientKey":"vg","volume":21.0,"percent":70.0},{"ingredientKey":"pg","volume":5.4,"percent":18.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":3,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":3,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":2,"vgRatio":0}]}'::jsonb, NOW());

-- ============================================
-- END OF PART 2: LIQUID PRO RECIPES (60 total)
-- ============================================

-- ============================================
-- PART 3: SHORTFILL RECIPES (20 recipes)
-- form_type: shortfill, difficulty_level: beginner
-- ============================================

-- 1. Strawberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Shortfill', 'Fresh strawberry shortfill. Just add your nicotine booster.', true, 'shortfill', 'beginner', 4.5, 134, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 2. Mango Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Shortfill', 'Tropical mango shortfill. Easy mixing for beginners.', true, 'shortfill', 'beginner', 4.6, 156, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":6.0}]}'::jsonb, NOW());

-- 3. Watermelon Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Shortfill', 'Refreshing watermelon shortfill. Perfect summer vape.', true, 'shortfill', 'beginner', 4.4, 123, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 4. Vanilla Custard Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Custard Shortfill', 'Rich vanilla custard shortfill. Steep for best results.', true, 'shortfill', 'beginner', 4.7, 189, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":80,"pgPercent":20,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":21,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":4.0}]}'::jsonb, NOW());

-- 5. Menthol Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Shortfill', 'Pure menthol shortfill. Icy fresh sensation.', true, 'shortfill', 'beginner', 4.3, 98, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorPercent":2,"steepingDays":0,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.2,"percent":2.0}]}'::jsonb, NOW());

-- 6. Blueberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Shortfill', 'Sweet blueberry shortfill. Natural berry taste.', true, 'shortfill', 'beginner', 4.4, 112, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 7. Raspberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Shortfill', 'Tangy raspberry shortfill. Sweet and sour balance.', true, 'shortfill', 'beginner', 4.3, 89, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 8. Peach Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Shortfill', 'Juicy peach shortfill. Summer fruit sweetness.', true, 'shortfill', 'beginner', 4.4, 102, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":6.0}]}'::jsonb, NOW());

-- 9. Grape Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Shortfill', 'Sweet grape shortfill. Candy-like flavor.', true, 'shortfill', 'beginner', 4.2, 87, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":6.0}]}'::jsonb, NOW());

-- 10. Pineapple Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Shortfill', 'Tropical pineapple shortfill. Island vibes.', true, 'shortfill', 'beginner', 4.3, 94, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 11. Banana Cream Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Cream Shortfill', 'Creamy banana shortfill. Rich and smooth.', true, 'shortfill', 'beginner', 4.5, 128, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 12. Coconut Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Shortfill', 'Creamy coconut shortfill. Tropical escape.', true, 'shortfill', 'beginner', 4.3, 91, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":4.0}]}'::jsonb, NOW());

-- 13. Lemon Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Shortfill', 'Zesty lemon shortfill. Fresh citrus burst.', true, 'shortfill', 'beginner', 4.2, 78, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":4.0}]}'::jsonb, NOW());

-- 14. Orange Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Shortfill', 'Sweet orange shortfill. Juice-like taste.', true, 'shortfill', 'beginner', 4.2, 83, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorPercent":6,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.6,"percent":6.0}]}'::jsonb, NOW());

-- 15. Cheesecake Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cheesecake Shortfill', 'Rich cheesecake shortfill. Creamy dessert vape.', true, 'shortfill', 'beginner', 4.5, 117, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":21,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"dessert","flavorName":"Cheesecake","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 16. Cookie Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Shortfill', 'Buttery cookie shortfill. Bakery treat.', true, 'shortfill', 'beginner', 4.3, 95, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":14,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 17. Caramel Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Shortfill', 'Rich caramel shortfill. Sweet indulgence.', true, 'shortfill', 'beginner', 4.3, 89, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorPercent":4,"steepingDays":14,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":2.4,"percent":4.0}]}'::jsonb, NOW());

-- 18. Bavarian Cream Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Bavarian Cream Shortfill', 'Smooth Bavarian cream shortfill. Silky dessert.', true, 'shortfill', 'beginner', 4.4, 103, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorPercent":3,"steepingDays":14,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":1.8,"percent":3.0}]}'::jsonb, NOW());

-- 19. Apple Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Shortfill', 'Crisp apple shortfill. Fresh fruit vape.', true, 'shortfill', 'beginner', 4.2, 76, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorPercent":5,"steepingDays":5,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- 20. Dragonfruit Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dragonfruit Shortfill', 'Exotic dragonfruit shortfill. Unique tropical flavor.', true, 'shortfill', 'beginner', 4.3, 81, 
'{"formType":"shortfill","totalAmount":60,"vgPercent":70,"pgPercent":30,"nicotine":3,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorPercent":5,"steepingDays":7,"ingredients":[{"ingredientKey":"shortfill_base","volume":50.0,"percent":83.3},{"ingredientKey":"nicotine_booster","params":{"strength":20,"vgpg":"50/50"},"volume":10.0,"percent":16.7},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":3.0,"percent":5.0}]}'::jsonb, NOW());

-- ============================================
-- END OF PART 3: SHORTFILL RECIPES (20 total)
-- ============================================

-- ============================================
-- PART 4: SHISHA RECIPES (80 recipes)
-- form_type: shisha
-- 30x beginner (1 flavor)
-- 25x intermediate (2 flavors)
-- 15x expert (3 flavors)
-- 10x virtuoso (4 flavors)
-- Based on hookah.com best sellers
-- ============================================

-- === BEGINNER (1 flavor) - 30 recipes ===

-- 1. Double Apple Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Double Apple Classic', 'The #1 hookah flavor worldwide. Traditional Middle Eastern favorite.', true, 'shisha', 'beginner', 4.9, 567, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorPercent":15,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":15.0,"percent":15.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}]}'::jsonb, NOW());

-- 2. Spearmint Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Spearmint Classic', 'Fresh spearmint hookah. Cool and refreshing smoke.', true, 'shisha', 'beginner', 4.7, 456, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorPercent":8,"steepingDays":3,"ingredients":[{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":22.0,"percent":22.0}]}'::jsonb, NOW());

-- 3. Grape Hookah
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Hookah', 'Sweet grape shisha. Popular Al Fakher style.', true, 'shisha', 'beginner', 4.6, 389, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 4. Watermelon Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Shisha', 'Refreshing watermelon hookah. Sweet summer sessions.', true, 'shisha', 'beginner', 4.5, 345, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 5. Blueberry Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Shisha', 'Sweet blueberry hookah. Natural berry taste.', true, 'shisha', 'beginner', 4.5, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 6. Lemon Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Shisha', 'Zesty lemon hookah. Citrus freshness.', true, 'shisha', 'beginner', 4.4, 289, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorPercent":10,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 7. Mango Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Shisha', 'Tropical mango hookah. Sweet exotic flavor.', true, 'shisha', 'beginner', 4.6, 334, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 8. Peach Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Shisha', 'Juicy peach hookah. Sweet stone fruit.', true, 'shisha', 'beginner', 4.5, 298, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 9. Raspberry Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Shisha', 'Tangy raspberry hookah. Sweet berry smoke.', true, 'shisha', 'beginner', 4.4, 267, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 10. Orange Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Shisha', 'Sweet orange hookah. Fresh citrus.', true, 'shisha', 'beginner', 4.3, 245, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 11. Pineapple Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Shisha', 'Tropical pineapple hookah. Island vibes.', true, 'shisha', 'beginner', 4.4, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 12. Coconut Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Shisha', 'Creamy coconut hookah. Tropical escape.', true, 'shisha', 'beginner', 4.3, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 13. Strawberry Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Shisha', 'Sweet strawberry hookah. Fresh berry taste.', true, 'shisha', 'beginner', 4.6, 378, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorPercent":12,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 14. Menthol Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Menthol Shisha', 'Pure menthol hookah. Icy cool sensation.', true, 'shisha', 'beginner', 4.4, 287, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorPercent":8,"steepingDays":0,"ingredients":[{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Menthol","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":22.0,"percent":22.0}]}'::jsonb, NOW());

-- 15. Cherry Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cherry Shisha', 'Sweet cherry hookah. Rich fruit flavor.', true, 'shisha', 'beginner', 4.4, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"FA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 16. Banana Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Shisha', 'Sweet banana hookah. Creamy fruit.', true, 'shisha', 'beginner', 4.3, 223, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":10,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 17. Vanilla Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Shisha', 'Smooth vanilla hookah. Creamy sweet.', true, 'shisha', 'beginner', 4.4, 245, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorPercent":10,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 18. Caramel Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Shisha', 'Rich caramel hookah. Sweet indulgence.', true, 'shisha', 'beginner', 4.3, 212, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorPercent":10,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 19. Cream Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cream Shisha', 'Smooth cream hookah. Rich and silky.', true, 'shisha', 'beginner', 4.3, 198, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorPercent":8,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":22.0,"percent":22.0}]}'::jsonb, NOW());

-- 20. Cookie Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Shisha', 'Buttery cookie hookah. Bakery delight.', true, 'shisha', 'beginner', 4.2, 187, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorPercent":10,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 21. Dragonfruit Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dragonfruit Shisha', 'Exotic dragonfruit hookah. Tropical unique.', true, 'shisha', 'beginner', 4.3, 176, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- 22-30: More beginner shisha recipes

-- 22. Kiwi Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Kiwi Shisha', 'Tangy kiwi hookah. Tropical zing.', true, 'shisha', 'beginner', 4.2, 156, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 23. Passion Fruit Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Passion Fruit Shisha', 'Exotic passion fruit hookah. Sweet and tangy.', true, 'shisha', 'beginner', 4.3, 167, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 24. Papaya Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Papaya Shisha', 'Tropical papaya hookah. Exotic sweetness.', true, 'shisha', 'beginner', 4.2, 145, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 25. Guava Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Guava Shisha', 'Sweet guava hookah. Tropical fruit delight.', true, 'shisha', 'beginner', 4.3, 154, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 26. Blackberry Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blackberry Shisha', 'Dark berry hookah. Rich fruit flavor.', true, 'shisha', 'beginner', 4.3, 178, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 27. Pomegranate Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pomegranate Shisha', 'Rich pomegranate hookah. Antioxidant taste.', true, 'shisha', 'beginner', 4.4, 189, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 28. Lime Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lime Shisha', 'Zesty lime hookah. Citrus kick.', true, 'shisha', 'beginner', 4.2, 156, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorPercent":8,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":22.0,"percent":22.0}]}'::jsonb, NOW());

-- 29. Grapefruit Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grapefruit Shisha', 'Tangy grapefruit hookah. Citrus bitter-sweet.', true, 'shisha', 'beginner', 4.1, 134, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","flavorPercent":10,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":20.0,"percent":20.0}]}'::jsonb, NOW());

-- 30. Honeydew Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Honeydew Shisha', 'Sweet honeydew hookah. Melon freshness.', true, 'shisha', 'beginner', 4.3, 167, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"INW","flavorPercent":12,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"INW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":18.0,"percent":18.0}]}'::jsonb, NOW());

-- === INTERMEDIATE (2 flavors) - 25 recipes ===

-- 31. Grape Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Mint', 'Classic grape with cool mint. Al Fakher best seller.', true, 'shisha', 'intermediate', 4.8, 456, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 32. Watermelon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Mint', 'Juicy watermelon with fresh mint. Summer classic.', true, 'shisha', 'intermediate', 4.7, 412, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 33. Blueberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Mint', 'Sweet blueberry with cooling mint. Berry fresh.', true, 'shisha', 'intermediate', 4.6, 378, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 34. Lemon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Mint', 'Zesty lemon with cool mint. Refreshing citrus.', true, 'shisha', 'intermediate', 4.6, 356, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":17.0,"percent":17.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 35. Mango Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Mint', 'Tropical mango with cool mint. Exotic fresh.', true, 'shisha', 'intermediate', 4.6, 345, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 36. Peach Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Mint', 'Juicy peach with refreshing mint. Sweet cool.', true, 'shisha', 'intermediate', 4.5, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 37. Orange Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Mint', 'Sweet orange with cool mint. Citrus fresh.', true, 'shisha', 'intermediate', 4.4, 287, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 38. Strawberry Cream Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Cream Shisha', 'Sweet strawberry with cream. Dessert hookah.', true, 'shisha', 'intermediate', 4.6, 334, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":10,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 39. Pineapple Coconut Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pina Colada Shisha', 'Tropical pineapple and coconut. Island hookah.', true, 'shisha', 'intermediate', 4.7, 389, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 40. Mango Pineapple Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Tropical Duo Shisha', 'Mango and pineapple tropical blend. Island vibes.', true, 'shisha', 'intermediate', 4.5, 298, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":7,"vgRatio":0}]}'::jsonb, NOW());

-- 41. Raspberry Lemon Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Lemon Shisha', 'Tangy raspberry with zesty lemon. Summer hookah.', true, 'shisha', 'intermediate', 4.5, 267, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":17.0,"percent":17.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 42. Blueberry Grape Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Blueberry Grape Shisha', 'Sweet blueberry with grape. Berry fruit mix.', true, 'shisha', 'intermediate', 4.4, 245, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":8,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":8,"vgRatio":0}]}'::jsonb, NOW());

-- 43. Peach Orange Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Orange Shisha', 'Juicy peach with sweet orange. Fruit blend.', true, 'shisha', 'intermediate', 4.4, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":7,"vgRatio":0}]}'::jsonb, NOW());

-- 44. Vanilla Caramel Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Vanilla Caramel Shisha', 'Sweet vanilla with rich caramel. Dessert hookah.', true, 'shisha', 'intermediate', 4.5, 278, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":6,"vgRatio":0}]}'::jsonb, NOW());

-- 45. Coconut Cream Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Cream Shisha', 'Tropical coconut with smooth cream. Island dessert.', true, 'shisha', 'intermediate', 4.4, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":10,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":17.0,"percent":17.0}],"flavors":[{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 46. Apple Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Mint Shisha', 'Fresh apple with cooling mint. Classic combo.', true, 'shisha', 'intermediate', 4.7, 367, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":12.0,"percent":12.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":12,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 47. Strawberry Banana Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Banana Shisha', 'Sweet strawberry with creamy banana. Smoothie hookah.', true, 'shisha', 'intermediate', 4.5, 289, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":10,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":8,"vgRatio":0},{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":7,"vgRatio":0}]}'::jsonb, NOW());

-- 48. Cookie Caramel Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Cookie Caramel Shisha', 'Buttery cookie with caramel. Bakery hookah.', true, 'shisha', 'intermediate', 4.4, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":6,"vgRatio":0}]}'::jsonb, NOW());

-- 49. Dragonfruit Mango Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dragonfruit Mango Shisha', 'Exotic dragonfruit with tropical mango. Island blend.', true, 'shisha', 'intermediate', 4.5, 267, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":7,"vgRatio":0}]}'::jsonb, NOW());

-- 50. Strawberry Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Mint Shisha', 'Sweet strawberry with fresh mint. Berry cool.', true, 'shisha', 'intermediate', 4.6, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 51-55: More intermediate shisha

-- 51. Raspberry Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Mint Shisha', 'Tangy raspberry with cool mint. Berry fresh.', true, 'shisha', 'intermediate', 4.5, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 52. Pineapple Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Mint Shisha', 'Tropical pineapple with cool mint. Island fresh.', true, 'shisha', 'intermediate', 4.4, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":10.0,"percent":10.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":10,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 53. Coconut Pineapple Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Coconut Mango Shisha', 'Creamy coconut with tropical mango. Island dream.', true, 'shisha', 'intermediate', 4.5, 278, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":8,"vgRatio":0}]}'::jsonb, NOW());

-- 54. Banana Vanilla Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Banana Vanilla Shisha', 'Creamy banana with smooth vanilla. Sweet dessert.', true, 'shisha', 'intermediate', 4.4, 223, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Banana Cream","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":16.0,"percent":16.0}],"flavors":[{"type":"cream","name":"Banana Cream","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":6,"vgRatio":0}]}'::jsonb, NOW());

-- 55. Watermelon Grape Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Grape Shisha', 'Juicy watermelon with sweet grape. Summer fruit.', true, 'shisha', 'intermediate', 4.5, 267, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":7,"vgRatio":0}]}'::jsonb, NOW());

-- === EXPERT (3 flavors) - 15 recipes ===

-- 56. Love 66 Clone
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Love 66 Clone', 'Adalya Love 66 inspired. Watermelon, passion fruit and mint.', true, 'shisha', 'expert', 4.9, 567, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 57. Tropical Paradise Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Tropical Paradise Shisha', 'Mango, pineapple and coconut. Island escape.', true, 'shisha', 'expert', 4.7, 423, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 58. Berry Blast Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Blast Shisha', 'Blueberry, raspberry and strawberry. Triple berry mix.', true, 'shisha', 'expert', 4.6, 378, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":6,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 59. Citrus Punch Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Citrus Punch Shisha', 'Lemon, orange and grapefruit. Citrus explosion.', true, 'shisha', 'expert', 4.5, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"INW","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"citrus","name":"Lemon","manufacturer":"INW","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 60. Grape Blueberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Blueberry Mint Shisha', 'Sweet grape with blueberry and cool mint. Berry ice.', true, 'shisha', 'expert', 4.6, 345, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 61. Watermelon Strawberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Strawberry Mint Shisha', 'Juicy watermelon with strawberry and mint. Summer ice.', true, 'shisha', 'expert', 4.6, 356, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":5,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":8,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 62. Mango Peach Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Mango Peach Mint Shisha', 'Tropical mango with peach and cool mint. Exotic ice.', true, 'shisha', 'expert', 4.5, 289, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 63. Strawberry Custard Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Custard Shisha', 'Sweet strawberry with vanilla custard and cream. Dessert shisha.', true, 'shisha', 'expert', 4.6, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":8,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 64. Caramel Cookie Cream Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Caramel Cookie Cream Shisha', 'Rich caramel with cookie and cream. Bakery bliss.', true, 'shisha', 'expert', 4.5, 278, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 65. Lemon Blueberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Lemon Blueberry Mint Shisha', 'Zesty lemon with blueberry and cool mint. Citrus berry ice.', true, 'shisha', 'expert', 4.5, 267, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":6,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 66-70: More expert shisha

-- 66. Apple Grape Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Grape Mint Shisha', 'Fresh apple with grape and cooling mint. Fruit ice.', true, 'shisha', 'expert', 4.6, 298, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":8.0,"percent":8.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":8,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 67. Pineapple Coconut Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Pineapple Coconut Mint Shisha', 'Tropical pineapple with coconut and mint. Island breeze.', true, 'shisha', 'expert', 4.5, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 68. Raspberry Strawberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Raspberry Strawberry Mint Shisha', 'Tangy raspberry with strawberry and cool mint. Berry duo ice.', true, 'shisha', 'expert', 4.5, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":15.0,"percent":15.0}],"flavors":[{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":6,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 69. Orange Mango Pineapple
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Orange Mango Pineapple Shisha', 'Sweet orange with mango and pineapple. Tropical citrus.', true, 'shisha', 'expert', 4.5, 223, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":5,"vgRatio":0}]}'::jsonb, NOW());

-- 70. Peach Raspberry Cream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Peach Raspberry Cream Shisha', 'Juicy peach with raspberry and cream. Dessert fruit.', true, 'shisha', 'expert', 4.4, 198, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":14,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- === VIRTUOSO (4 flavors) - 10 recipes ===

-- 71. Ultimate Summer Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Ultimate Summer Shisha', 'Watermelon, strawberry, grape and mint. Complete summer experience.', true, 'shisha', 'virtuoso', 4.9, 456, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":7.0,"percent":7.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":11.0,"percent":11.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":7,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":5,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 72. Tropical Island Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Tropical Island Shisha', 'Mango, pineapple, coconut and dragonfruit. Full tropical experience.', true, 'shisha', 'virtuoso', 4.8, 389, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Coconut","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Dragonfruit","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":12.0,"percent":12.0}],"flavors":[{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Coconut","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Dragonfruit","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 73. Berry Paradise Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Berry Paradise Shisha', 'Blueberry, raspberry, strawberry and mint. Ultimate berry mix.', true, 'shisha', 'virtuoso', 4.7, 345, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":5,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":4,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 74. Dessert Heaven Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Dessert Heaven Shisha', 'Vanilla custard, caramel, cookie and cream. Ultimate dessert hookah.', true, 'shisha', 'virtuoso', 4.7, 312, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Caramel","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":14.0,"percent":14.0}],"flavors":[{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"bakery","name":"Caramel","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 75. Fruit Cocktail Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Fruit Cocktail Shisha', 'Peach, mango, strawberry and orange. Complete fruit salad.', true, 'shisha', 'virtuoso', 4.6, 278, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Peach","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Peach","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":4,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 76. Grape Berry Mint Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Grape Berry Mint Shisha', 'Grape, blueberry, raspberry and cool mint. Berry grape ice.', true, 'shisha', 'virtuoso', 4.6, 256, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Raspberry","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":4,"vgRatio":0},{"type":"berry","name":"Raspberry","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 77. Citrus Tropical Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Citrus Tropical Shisha', 'Lemon, orange, mango and pineapple. Citrus meets tropical.', true, 'shisha', 'virtuoso', 4.5, 234, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Lemon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"citrus","flavorName":"Orange","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":5.0,"percent":5.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"citrus","name":"Lemon","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"citrus","name":"Orange","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":5,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0}]}'::jsonb, NOW());

-- 78. Strawberry Custard Cookie Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Strawberry Custard Cookie Shisha', 'Strawberry, vanilla custard, cookie and cream. Full dessert shisha.', true, 'shisha', 'virtuoso', 4.6, 223, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":21,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Strawberry","flavorManufacturer":"CAP","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Vanilla Custard","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"bakery","flavorName":"Cookie","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"cream","flavorName":"Bavarian Cream","flavorManufacturer":"TPA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Strawberry","manufacturer":"CAP","percent":6,"vgRatio":0},{"type":"cream","name":"Vanilla Custard","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"bakery","name":"Cookie","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"cream","name":"Bavarian Cream","manufacturer":"TPA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 79. Watermelon Tropical Ice Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Watermelon Tropical Ice Shisha', 'Watermelon, mango, pineapple and mint. Tropical fruit ice.', true, 'shisha', 'virtuoso', 4.7, 289, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Watermelon","flavorManufacturer":"TPA","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Mango","flavorManufacturer":"TPA","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"tropical","flavorName":"Pineapple","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Watermelon","manufacturer":"TPA","percent":6,"vgRatio":0},{"type":"tropical","name":"Mango","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"tropical","name":"Pineapple","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- 80. Apple Blueberry Grape Ice Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zc1ycGKGZpbuPXQuZNLFi0Etc', 'Apple Blueberry Grape Ice Shisha', 'Fresh apple, blueberry, grape and cool mint. Ultimate fruit ice.', true, 'shisha', 'virtuoso', 4.6, 245, 
'{"formType":"shisha","totalAmount":100,"vgPercent":70,"pgPercent":30,"steepingDays":7,"ingredients":[{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Apple","flavorManufacturer":"FW","flavorNumber":1,"params":{"vgpg":"0/100"},"volume":6.0,"percent":6.0},{"ingredientKey":"flavor","flavorType":"berry","flavorName":"Blueberry","flavorManufacturer":"FW","flavorNumber":2,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"fruit","flavorName":"Grape","flavorManufacturer":"TPA","flavorNumber":3,"params":{"vgpg":"0/100"},"volume":4.0,"percent":4.0},{"ingredientKey":"flavor","flavorType":"menthol","flavorName":"Mint","flavorManufacturer":"FA","flavorNumber":4,"params":{"vgpg":"0/100"},"volume":3.0,"percent":3.0},{"ingredientKey":"vg","volume":70.0,"percent":70.0},{"ingredientKey":"pg","volume":13.0,"percent":13.0}],"flavors":[{"type":"fruit","name":"Apple","manufacturer":"FW","percent":6,"vgRatio":0},{"type":"berry","name":"Blueberry","manufacturer":"FW","percent":4,"vgRatio":0},{"type":"fruit","name":"Grape","manufacturer":"TPA","percent":4,"vgRatio":0},{"type":"menthol","name":"Mint","manufacturer":"FA","percent":3,"vgRatio":0}]}'::jsonb, NOW());

-- ============================================
-- END OF PART 4: SHISHA RECIPES (80 total)
-- ============================================

-- ============================================
-- PART 5: RECIPE_FLAVORS LINKING
-- Links recipes to concrete flavors from flavors table
-- ============================================

-- This section creates links between recipes and flavors
-- The linking is done via a function for cleaner code

-- Create temporary function to insert recipe_flavor links
CREATE OR REPLACE FUNCTION link_recipe_flavor(
    p_recipe_name TEXT,
    p_flavor_name TEXT,
    p_manufacturer TEXT,
    p_percentage NUMERIC,
    p_position INTEGER
) RETURNS VOID AS $$
DECLARE
    v_recipe_id UUID;
    v_flavor_id UUID;
BEGIN
    -- Find recipe ID
    SELECT id INTO v_recipe_id 
    FROM recipes 
    WHERE name = p_recipe_name 
      AND clerk_id = 'user_38Zc1ycGKGZpbuPXQuZNLFi0Etc'
    LIMIT 1;
    
    -- Find flavor ID
    SELECT id INTO v_flavor_id 
    FROM flavors 
    WHERE name = p_flavor_name 
      AND manufacturer_code = p_manufacturer
    LIMIT 1;
    
    -- Insert if both exist
    IF v_recipe_id IS NOT NULL AND v_flavor_id IS NOT NULL THEN
        INSERT INTO recipe_flavors (recipe_id, flavor_id, percentage, position, flavor_name, flavor_manufacturer)
        VALUES (v_recipe_id, v_flavor_id, p_percentage, p_position, p_flavor_name, p_manufacturer)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- LIQUID RECIPES FLAVOR LINKS (single flavor)
-- ============================================

SELECT link_recipe_flavor('Strawberry Fresh', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Fresh (0mg)', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Vanilla Custard Classic', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Vanilla Custard Classic (0mg)', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Watermelon Candy', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Candy (0mg)', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Mango Paradise', 'Mango', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Mango Paradise (0mg)', 'Mango', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Blueberry Burst', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Blueberry Burst (0mg)', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Bavarian Cream Dream', 'Bavarian Cream', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Bavarian Cream Dream (0mg)', 'Bavarian Cream', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Raspberry Delight', 'Raspberry', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Raspberry Delight (0mg)', 'Raspberry', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Peach Perfect', 'Peach', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Peach Perfect (0mg)', 'Peach', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Menthol Cool', 'Menthol', 'TPA', 2.0, 1);
SELECT link_recipe_flavor('Menthol Cool (0mg)', 'Menthol', 'TPA', 2.0, 1);
SELECT link_recipe_flavor('Pineapple Tropical', 'Pineapple', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Pineapple Tropical (0mg)', 'Pineapple', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Grape Classic', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Grape Classic (0mg)', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Lemon Zest', 'Lemon', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Lemon Zest (0mg)', 'Lemon', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Orange Citrus', 'Orange', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Orange Citrus (0mg)', 'Orange', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Banana Cream', 'Banana Cream', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Banana Cream (0mg)', 'Banana Cream', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Coconut Paradise', 'Coconut', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Coconut Paradise (0mg)', 'Coconut', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Cheesecake Bliss', 'Cheesecake', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Cheesecake Bliss (0mg)', 'Cheesecake', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('RY4 Tobacco', 'RY4', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('RY4 Tobacco (0mg)', 'RY4', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Dragonfruit Exotic', 'Dragonfruit', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Dragonfruit Exotic (0mg)', 'Dragonfruit', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Cookie Crunch', 'Cookie', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Cookie Crunch (0mg)', 'Cookie', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Caramel Sweet', 'Caramel', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Caramel Sweet (0mg)', 'Caramel', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Apple Fresh', 'Apple', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Apple Fresh (0mg)', 'Apple', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Sweet Cream', 'Sweet Cream', 'FW', 4.0, 1);
SELECT link_recipe_flavor('Sweet Cream (0mg)', 'Sweet Cream', 'FW', 4.0, 1);
SELECT link_recipe_flavor('Strawberry Natural', 'Strawberry', 'FA', 3.0, 1);
SELECT link_recipe_flavor('Strawberry Natural (0mg)', 'Strawberry', 'FA', 3.0, 1);
SELECT link_recipe_flavor('Custard Supreme', 'Vanilla Custard', 'FLV', 2.0, 1);
SELECT link_recipe_flavor('Custard Supreme (0mg)', 'Vanilla Custard', 'FLV', 2.0, 1);
SELECT link_recipe_flavor('Mint Fresh', 'Mint', 'FA', 1.0, 1);
SELECT link_recipe_flavor('Mint Fresh (0mg)', 'Mint', 'FA', 1.0, 1);
SELECT link_recipe_flavor('Mango Tropical INW', 'Mango', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Mango Tropical INW (0mg)', 'Mango', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Watermelon Summer', 'Watermelon', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Summer (0mg)', 'Watermelon', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Blueberry Natural', 'Blueberry', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Blueberry Natural (0mg)', 'Blueberry', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Raspberry Red', 'Raspberry', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Raspberry Red (0mg)', 'Raspberry', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Peach Juicy', 'Peach', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Peach Juicy (0mg)', 'Peach', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Pineapple Sweet', 'Pineapple', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Pineapple Sweet (0mg)', 'Pineapple', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Coconut Cream', 'Coconut', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Coconut Cream (0mg)', 'Coconut', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Grape Sweet', 'Grape', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Grape Sweet (0mg)', 'Grape', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Lemon Bright', 'Lemon', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Lemon Bright (0mg)', 'Lemon', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Orange Juicy', 'Orange', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Orange Juicy (0mg)', 'Orange', 'INW', 3.0, 1);
SELECT link_recipe_flavor('Cheesecake Rich', 'Cheesecake', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Cheesecake Rich (0mg)', 'Cheesecake', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Cookie Butter', 'Cookie', 'INW', 2.0, 1);
SELECT link_recipe_flavor('Cookie Butter (0mg)', 'Cookie', 'INW', 2.0, 1);
SELECT link_recipe_flavor('Caramel Rich', 'Caramel', 'INW', 2.0, 1);
SELECT link_recipe_flavor('Caramel Rich (0mg)', 'Caramel', 'INW', 2.0, 1);
SELECT link_recipe_flavor('RY4 Premium', 'RY4', 'INW', 2.0, 1);
SELECT link_recipe_flavor('RY4 Premium (0mg)', 'RY4', 'INW', 2.0, 1);
SELECT link_recipe_flavor('Menthol Ice', 'Menthol', 'INW', 1.0, 1);
SELECT link_recipe_flavor('Menthol Ice (0mg)', 'Menthol', 'INW', 1.0, 1);

-- ============================================
-- LIQUIDPRO INTERMEDIATE (2 flavors) LINKS
-- ============================================

SELECT link_recipe_flavor('Strawberry Cream', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Cream', 'Bavarian Cream', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Strawberry Cream (0mg)', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Cream (0mg)', 'Bavarian Cream', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Vanilla Custard Cream', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Vanilla Custard Cream', 'Sweet Cream', 'FW', 2.0, 2);
SELECT link_recipe_flavor('Vanilla Custard Cream (0mg)', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Vanilla Custard Cream (0mg)', 'Sweet Cream', 'FW', 2.0, 2);

SELECT link_recipe_flavor('Watermelon Menthol', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Menthol', 'Menthol', 'TPA', 2.0, 2);
SELECT link_recipe_flavor('Watermelon Menthol (0mg)', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Menthol (0mg)', 'Menthol', 'TPA', 2.0, 2);

SELECT link_recipe_flavor('Mango Pineapple', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Mango Pineapple', 'Pineapple', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Mango Pineapple (0mg)', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Mango Pineapple (0mg)', 'Pineapple', 'TPA', 4.0, 2);

SELECT link_recipe_flavor('Blueberry Cheesecake', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Blueberry Cheesecake', 'Cheesecake', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Blueberry Cheesecake (0mg)', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Blueberry Cheesecake (0mg)', 'Cheesecake', 'TPA', 4.0, 2);

SELECT link_recipe_flavor('Raspberry Lemonade', 'Raspberry', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Raspberry Lemonade', 'Lemon', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Raspberry Lemonade (0mg)', 'Raspberry', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Raspberry Lemonade (0mg)', 'Lemon', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Peach Mango', 'Peach', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Peach Mango', 'Mango', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Peach Mango (0mg)', 'Peach', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Peach Mango (0mg)', 'Mango', 'TPA', 4.0, 2);

SELECT link_recipe_flavor('Apple Cinnamon', 'Apple', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Apple Cinnamon', 'Cookie', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Apple Cinnamon (0mg)', 'Apple', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Apple Cinnamon (0mg)', 'Cookie', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Grape Menthol', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Grape Menthol', 'Menthol', 'TPA', 2.0, 2);
SELECT link_recipe_flavor('Grape Menthol (0mg)', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Grape Menthol (0mg)', 'Menthol', 'TPA', 2.0, 2);

SELECT link_recipe_flavor('Caramel Cookie', 'Cookie', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Caramel Cookie', 'Caramel', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Caramel Cookie (0mg)', 'Cookie', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Caramel Cookie (0mg)', 'Caramel', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Pina Colada', 'Coconut', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Pina Colada', 'Pineapple', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Pina Colada (0mg)', 'Coconut', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Pina Colada (0mg)', 'Pineapple', 'TPA', 4.0, 2);

SELECT link_recipe_flavor('Orange Cream', 'Orange', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Orange Cream', 'Bavarian Cream', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Orange Cream (0mg)', 'Orange', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Orange Cream (0mg)', 'Bavarian Cream', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('RY4 Caramel', 'RY4', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('RY4 Caramel', 'Caramel', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('RY4 Caramel (0mg)', 'RY4', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('RY4 Caramel (0mg)', 'Caramel', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Strawberry Dragonfruit', 'Strawberry', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Dragonfruit', 'Dragonfruit', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Strawberry Dragonfruit (0mg)', 'Strawberry', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Dragonfruit (0mg)', 'Dragonfruit', 'TPA', 3.0, 2);

SELECT link_recipe_flavor('Banana Custard', 'Banana Cream', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Banana Custard', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Banana Custard (0mg)', 'Banana Cream', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Banana Custard (0mg)', 'Vanilla Custard', 'TPA', 4.0, 2);

-- ============================================
-- LIQUIDPRO EXPERT (3 flavors) LINKS
-- ============================================

SELECT link_recipe_flavor('Nana Cream Clone', 'Banana Cream', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Nana Cream Clone', 'Strawberry', 'TPA', 7.0, 2);
SELECT link_recipe_flavor('Nana Cream Clone', 'Dragonfruit', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Nana Cream Clone (0mg)', 'Banana Cream', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Nana Cream Clone (0mg)', 'Strawberry', 'TPA', 7.0, 2);
SELECT link_recipe_flavor('Nana Cream Clone (0mg)', 'Dragonfruit', 'TPA', 3.0, 3);

SELECT link_recipe_flavor('Tropical Paradise', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Tropical Paradise', 'Pineapple', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Tropical Paradise', 'Coconut', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Tropical Paradise (0mg)', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Tropical Paradise (0mg)', 'Pineapple', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Tropical Paradise (0mg)', 'Coconut', 'TPA', 3.0, 3);

SELECT link_recipe_flavor('Berry Medley', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Berry Medley', 'Raspberry', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Berry Medley', 'Strawberry', 'CAP', 3.0, 3);
SELECT link_recipe_flavor('Berry Medley (0mg)', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Berry Medley (0mg)', 'Raspberry', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Berry Medley (0mg)', 'Strawberry', 'CAP', 3.0, 3);

SELECT link_recipe_flavor('Strawberry Custard Cake', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Custard Cake', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Strawberry Custard Cake', 'Cookie', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Strawberry Custard Cake (0mg)', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Strawberry Custard Cake (0mg)', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Strawberry Custard Cake (0mg)', 'Cookie', 'TPA', 2.0, 3);

SELECT link_recipe_flavor('Citrus Blast', 'Lemon', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Citrus Blast', 'Orange', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Citrus Blast', 'Lemon', 'INW', 2.0, 3);
SELECT link_recipe_flavor('Citrus Blast (0mg)', 'Lemon', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Citrus Blast (0mg)', 'Orange', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Citrus Blast (0mg)', 'Lemon', 'INW', 2.0, 3);

SELECT link_recipe_flavor('Watermelon Berry Ice', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Berry Ice', 'Blueberry', 'FW', 3.0, 2);
SELECT link_recipe_flavor('Watermelon Berry Ice', 'Menthol', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Watermelon Berry Ice (0mg)', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Watermelon Berry Ice (0mg)', 'Blueberry', 'FW', 3.0, 2);
SELECT link_recipe_flavor('Watermelon Berry Ice (0mg)', 'Menthol', 'TPA', 2.0, 3);

SELECT link_recipe_flavor('Caramel Cheesecake Cookie', 'Caramel', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Caramel Cheesecake Cookie', 'Cheesecake', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Caramel Cheesecake Cookie', 'Cookie', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Caramel Cheesecake Cookie (0mg)', 'Caramel', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Caramel Cheesecake Cookie (0mg)', 'Cheesecake', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Caramel Cheesecake Cookie (0mg)', 'Cookie', 'TPA', 3.0, 3);

SELECT link_recipe_flavor('Mango Peach Ice', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Mango Peach Ice', 'Peach', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Mango Peach Ice', 'Menthol', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Mango Peach Ice (0mg)', 'Mango', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Mango Peach Ice (0mg)', 'Peach', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Mango Peach Ice (0mg)', 'Menthol', 'TPA', 2.0, 3);

SELECT link_recipe_flavor('Raspberry Custard Cream', 'Raspberry', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Raspberry Custard Cream', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Raspberry Custard Cream', 'Bavarian Cream', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Raspberry Custard Cream (0mg)', 'Raspberry', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Raspberry Custard Cream (0mg)', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Raspberry Custard Cream (0mg)', 'Bavarian Cream', 'TPA', 2.0, 3);

SELECT link_recipe_flavor('Apple Grape Ice', 'Apple', 'FW', 4.0, 1);
SELECT link_recipe_flavor('Apple Grape Ice', 'Grape', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Apple Grape Ice', 'Menthol', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Apple Grape Ice (0mg)', 'Apple', 'FW', 4.0, 1);
SELECT link_recipe_flavor('Apple Grape Ice (0mg)', 'Grape', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Apple Grape Ice (0mg)', 'Menthol', 'TPA', 2.0, 3);

-- ============================================
-- LIQUIDPRO VIRTUOSO (4 flavors) LINKS
-- ============================================

SELECT link_recipe_flavor('Mother''s Milk Clone', 'Strawberry', 'CAP', 8.0, 1);
SELECT link_recipe_flavor('Mother''s Milk Clone', 'Vanilla Custard', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Mother''s Milk Clone', 'Bavarian Cream', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Mother''s Milk Clone', 'Cookie', 'TPA', 2.0, 4);
SELECT link_recipe_flavor('Mother''s Milk Clone (0mg)', 'Strawberry', 'CAP', 8.0, 1);
SELECT link_recipe_flavor('Mother''s Milk Clone (0mg)', 'Vanilla Custard', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Mother''s Milk Clone (0mg)', 'Bavarian Cream', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Mother''s Milk Clone (0mg)', 'Cookie', 'TPA', 2.0, 4);

SELECT link_recipe_flavor('Ultimate Tropical', 'Mango', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Ultimate Tropical', 'Pineapple', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Ultimate Tropical', 'Coconut', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Ultimate Tropical', 'Dragonfruit', 'TPA', 3.0, 4);
SELECT link_recipe_flavor('Ultimate Tropical (0mg)', 'Mango', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Ultimate Tropical (0mg)', 'Pineapple', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Ultimate Tropical (0mg)', 'Coconut', 'TPA', 2.0, 3);
SELECT link_recipe_flavor('Ultimate Tropical (0mg)', 'Dragonfruit', 'TPA', 3.0, 4);

SELECT link_recipe_flavor('Dessert Heaven', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Dessert Heaven', 'Caramel', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Dessert Heaven', 'Cookie', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Dessert Heaven', 'Sweet Cream', 'FW', 2.0, 4);
SELECT link_recipe_flavor('Dessert Heaven (0mg)', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Dessert Heaven (0mg)', 'Caramel', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Dessert Heaven (0mg)', 'Cookie', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Dessert Heaven (0mg)', 'Sweet Cream', 'FW', 2.0, 4);

SELECT link_recipe_flavor('Berry Explosion Ice', 'Strawberry', 'CAP', 4.0, 1);
SELECT link_recipe_flavor('Berry Explosion Ice', 'Blueberry', 'FW', 3.0, 2);
SELECT link_recipe_flavor('Berry Explosion Ice', 'Raspberry', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Berry Explosion Ice', 'Menthol', 'TPA', 2.0, 4);
SELECT link_recipe_flavor('Berry Explosion Ice (0mg)', 'Strawberry', 'CAP', 4.0, 1);
SELECT link_recipe_flavor('Berry Explosion Ice (0mg)', 'Blueberry', 'FW', 3.0, 2);
SELECT link_recipe_flavor('Berry Explosion Ice (0mg)', 'Raspberry', 'TPA', 3.0, 3);
SELECT link_recipe_flavor('Berry Explosion Ice (0mg)', 'Menthol', 'TPA', 2.0, 4);

SELECT link_recipe_flavor('Fruit Cocktail Supreme', 'Peach', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Fruit Cocktail Supreme', 'Mango', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Fruit Cocktail Supreme', 'Strawberry', 'CAP', 3.0, 3);
SELECT link_recipe_flavor('Fruit Cocktail Supreme', 'Orange', 'TPA', 2.0, 4);
SELECT link_recipe_flavor('Fruit Cocktail Supreme (0mg)', 'Peach', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Fruit Cocktail Supreme (0mg)', 'Mango', 'TPA', 3.0, 2);
SELECT link_recipe_flavor('Fruit Cocktail Supreme (0mg)', 'Strawberry', 'CAP', 3.0, 3);
SELECT link_recipe_flavor('Fruit Cocktail Supreme (0mg)', 'Orange', 'TPA', 2.0, 4);

-- ============================================
-- SHORTFILL RECIPES FLAVOR LINKS
-- ============================================

SELECT link_recipe_flavor('Strawberry Shortfill', 'Strawberry', 'CAP', 5.0, 1);
SELECT link_recipe_flavor('Mango Shortfill', 'Mango', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Watermelon Shortfill', 'Watermelon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Vanilla Custard Shortfill', 'Vanilla Custard', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Menthol Shortfill', 'Menthol', 'TPA', 2.0, 1);
SELECT link_recipe_flavor('Blueberry Shortfill', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Raspberry Shortfill', 'Raspberry', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Peach Shortfill', 'Peach', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Grape Shortfill', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Pineapple Shortfill', 'Pineapple', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Banana Cream Shortfill', 'Banana Cream', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Coconut Shortfill', 'Coconut', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Lemon Shortfill', 'Lemon', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Orange Shortfill', 'Orange', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Cheesecake Shortfill', 'Cheesecake', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Cookie Shortfill', 'Cookie', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Caramel Shortfill', 'Caramel', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Bavarian Cream Shortfill', 'Bavarian Cream', 'TPA', 3.0, 1);
SELECT link_recipe_flavor('Apple Shortfill', 'Apple', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Dragonfruit Shortfill', 'Dragonfruit', 'TPA', 5.0, 1);

-- ============================================
-- SHISHA BEGINNER (1 flavor) LINKS
-- ============================================

SELECT link_recipe_flavor('Double Apple Classic', 'Apple', 'FW', 15.0, 1);
SELECT link_recipe_flavor('Spearmint Classic', 'Mint', 'FA', 8.0, 1);
SELECT link_recipe_flavor('Grape Hookah', 'Grape', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Watermelon Shisha', 'Watermelon', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Blueberry Shisha', 'Blueberry', 'FW', 12.0, 1);
SELECT link_recipe_flavor('Lemon Shisha', 'Lemon', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Mango Shisha', 'Mango', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Peach Shisha', 'Peach', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Raspberry Shisha', 'Raspberry', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Orange Shisha', 'Orange', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Pineapple Shisha', 'Pineapple', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Coconut Shisha', 'Coconut', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Strawberry Shisha', 'Strawberry', 'CAP', 12.0, 1);
SELECT link_recipe_flavor('Menthol Shisha', 'Menthol', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Cherry Shisha', 'Strawberry', 'FA', 12.0, 1);
SELECT link_recipe_flavor('Banana Shisha', 'Banana Cream', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Vanilla Shisha', 'Vanilla Custard', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Caramel Shisha', 'Caramel', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Cream Shisha', 'Bavarian Cream', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Cookie Shisha', 'Cookie', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Dragonfruit Shisha', 'Dragonfruit', 'TPA', 12.0, 1);
SELECT link_recipe_flavor('Kiwi Shisha', 'Strawberry', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Passion Fruit Shisha', 'Mango', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Papaya Shisha', 'Pineapple', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Guava Shisha', 'Coconut', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Blackberry Shisha', 'Blueberry', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Pomegranate Shisha', 'Raspberry', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Lime Shisha', 'Lemon', 'INW', 8.0, 1);
SELECT link_recipe_flavor('Grapefruit Shisha', 'Orange', 'INW', 10.0, 1);
SELECT link_recipe_flavor('Honeydew Shisha', 'Watermelon', 'INW', 12.0, 1);

-- ============================================
-- SHISHA INTERMEDIATE (2 flavors) LINKS - sample
-- ============================================

SELECT link_recipe_flavor('Grape Mint', 'Grape', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Grape Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Watermelon Mint', 'Watermelon', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Watermelon Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Blueberry Mint', 'Blueberry', 'FW', 10.0, 1);
SELECT link_recipe_flavor('Blueberry Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Lemon Mint', 'Lemon', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Lemon Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Mango Mint', 'Mango', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Mango Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Peach Mint', 'Peach', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Peach Mint', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Orange Mint', 'Orange', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Orange Mint', 'Mint', 'FA', 4.0, 2);

SELECT link_recipe_flavor('Strawberry Cream Shisha', 'Strawberry', 'CAP', 10.0, 1);
SELECT link_recipe_flavor('Strawberry Cream Shisha', 'Bavarian Cream', 'TPA', 5.0, 2);

SELECT link_recipe_flavor('Pina Colada Shisha', 'Pineapple', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Pina Colada Shisha', 'Coconut', 'TPA', 5.0, 2);

SELECT link_recipe_flavor('Tropical Duo Shisha', 'Mango', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Tropical Duo Shisha', 'Pineapple', 'TPA', 7.0, 2);

SELECT link_recipe_flavor('Raspberry Lemon Shisha', 'Raspberry', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Raspberry Lemon Shisha', 'Lemon', 'TPA', 5.0, 2);

SELECT link_recipe_flavor('Blueberry Grape Shisha', 'Blueberry', 'FW', 8.0, 1);
SELECT link_recipe_flavor('Blueberry Grape Shisha', 'Grape', 'TPA', 8.0, 2);

SELECT link_recipe_flavor('Peach Orange Shisha', 'Peach', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Peach Orange Shisha', 'Orange', 'TPA', 7.0, 2);

SELECT link_recipe_flavor('Vanilla Caramel Shisha', 'Vanilla Custard', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Vanilla Caramel Shisha', 'Caramel', 'TPA', 6.0, 2);

SELECT link_recipe_flavor('Coconut Cream Shisha', 'Coconut', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Coconut Cream Shisha', 'Bavarian Cream', 'TPA', 5.0, 2);

SELECT link_recipe_flavor('Apple Mint Shisha', 'Apple', 'FW', 12.0, 1);
SELECT link_recipe_flavor('Apple Mint Shisha', 'Mint', 'FA', 5.0, 2);

SELECT link_recipe_flavor('Strawberry Banana Shisha', 'Strawberry', 'CAP', 8.0, 1);
SELECT link_recipe_flavor('Strawberry Banana Shisha', 'Banana Cream', 'TPA', 7.0, 2);

SELECT link_recipe_flavor('Cookie Caramel Shisha', 'Cookie', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Cookie Caramel Shisha', 'Caramel', 'TPA', 6.0, 2);

SELECT link_recipe_flavor('Dragonfruit Mango Shisha', 'Dragonfruit', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Dragonfruit Mango Shisha', 'Mango', 'TPA', 7.0, 2);

SELECT link_recipe_flavor('Strawberry Mint Shisha', 'Strawberry', 'CAP', 10.0, 1);
SELECT link_recipe_flavor('Strawberry Mint Shisha', 'Mint', 'FA', 4.0, 2);

SELECT link_recipe_flavor('Raspberry Mint Shisha', 'Raspberry', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Raspberry Mint Shisha', 'Mint', 'FA', 4.0, 2);

SELECT link_recipe_flavor('Pineapple Mint Shisha', 'Pineapple', 'TPA', 10.0, 1);
SELECT link_recipe_flavor('Pineapple Mint Shisha', 'Mint', 'FA', 4.0, 2);

SELECT link_recipe_flavor('Coconut Mango Shisha', 'Coconut', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Coconut Mango Shisha', 'Mango', 'TPA', 8.0, 2);

SELECT link_recipe_flavor('Banana Vanilla Shisha', 'Banana Cream', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Banana Vanilla Shisha', 'Vanilla Custard', 'TPA', 6.0, 2);

SELECT link_recipe_flavor('Watermelon Grape Shisha', 'Watermelon', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Watermelon Grape Shisha', 'Grape', 'TPA', 7.0, 2);

-- ============================================
-- SHISHA EXPERT (3 flavors) LINKS - sample
-- ============================================

SELECT link_recipe_flavor('Love 66 Clone', 'Watermelon', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Love 66 Clone', 'Mango', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Love 66 Clone', 'Mint', 'FA', 4.0, 3);

SELECT link_recipe_flavor('Tropical Paradise Shisha', 'Mango', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Tropical Paradise Shisha', 'Pineapple', 'TPA', 6.0, 2);
SELECT link_recipe_flavor('Tropical Paradise Shisha', 'Coconut', 'TPA', 4.0, 3);

SELECT link_recipe_flavor('Berry Blast Shisha', 'Blueberry', 'FW', 6.0, 1);
SELECT link_recipe_flavor('Berry Blast Shisha', 'Raspberry', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Berry Blast Shisha', 'Strawberry', 'CAP', 5.0, 3);

SELECT link_recipe_flavor('Citrus Punch Shisha', 'Lemon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Citrus Punch Shisha', 'Orange', 'TPA', 6.0, 2);
SELECT link_recipe_flavor('Citrus Punch Shisha', 'Lemon', 'INW', 4.0, 3);

SELECT link_recipe_flavor('Grape Blueberry Mint Shisha', 'Grape', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Grape Blueberry Mint Shisha', 'Blueberry', 'FW', 5.0, 2);
SELECT link_recipe_flavor('Grape Blueberry Mint Shisha', 'Mint', 'FA', 4.0, 3);

SELECT link_recipe_flavor('Watermelon Strawberry Mint Shisha', 'Watermelon', 'TPA', 8.0, 1);
SELECT link_recipe_flavor('Watermelon Strawberry Mint Shisha', 'Strawberry', 'CAP', 5.0, 2);
SELECT link_recipe_flavor('Watermelon Strawberry Mint Shisha', 'Mint', 'FA', 3.0, 3);

SELECT link_recipe_flavor('Mango Peach Mint Shisha', 'Mango', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Mango Peach Mint Shisha', 'Peach', 'TPA', 6.0, 2);
SELECT link_recipe_flavor('Mango Peach Mint Shisha', 'Mint', 'FA', 3.0, 3);

SELECT link_recipe_flavor('Strawberry Custard Shisha', 'Strawberry', 'CAP', 8.0, 1);
SELECT link_recipe_flavor('Strawberry Custard Shisha', 'Vanilla Custard', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Strawberry Custard Shisha', 'Bavarian Cream', 'TPA', 3.0, 3);

SELECT link_recipe_flavor('Caramel Cookie Cream Shisha', 'Caramel', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Caramel Cookie Cream Shisha', 'Cookie', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Caramel Cookie Cream Shisha', 'Bavarian Cream', 'TPA', 4.0, 3);

SELECT link_recipe_flavor('Lemon Blueberry Mint Shisha', 'Lemon', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Lemon Blueberry Mint Shisha', 'Blueberry', 'FW', 6.0, 2);
SELECT link_recipe_flavor('Lemon Blueberry Mint Shisha', 'Mint', 'FA', 4.0, 3);

SELECT link_recipe_flavor('Apple Grape Mint Shisha', 'Apple', 'FW', 8.0, 1);
SELECT link_recipe_flavor('Apple Grape Mint Shisha', 'Grape', 'TPA', 6.0, 2);
SELECT link_recipe_flavor('Apple Grape Mint Shisha', 'Mint', 'FA', 3.0, 3);

SELECT link_recipe_flavor('Pineapple Coconut Mint Shisha', 'Pineapple', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Pineapple Coconut Mint Shisha', 'Coconut', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Pineapple Coconut Mint Shisha', 'Mint', 'FA', 3.0, 3);

SELECT link_recipe_flavor('Raspberry Strawberry Mint Shisha', 'Raspberry', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Raspberry Strawberry Mint Shisha', 'Strawberry', 'CAP', 6.0, 2);
SELECT link_recipe_flavor('Raspberry Strawberry Mint Shisha', 'Mint', 'FA', 3.0, 3);

SELECT link_recipe_flavor('Orange Mango Pineapple Shisha', 'Orange', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Orange Mango Pineapple Shisha', 'Mango', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Orange Mango Pineapple Shisha', 'Pineapple', 'TPA', 5.0, 3);

SELECT link_recipe_flavor('Peach Raspberry Cream Shisha', 'Peach', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Peach Raspberry Cream Shisha', 'Raspberry', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Peach Raspberry Cream Shisha', 'Bavarian Cream', 'TPA', 4.0, 3);

-- ============================================
-- SHISHA VIRTUOSO (4 flavors) LINKS - sample
-- ============================================

SELECT link_recipe_flavor('Ultimate Summer Shisha', 'Watermelon', 'TPA', 7.0, 1);
SELECT link_recipe_flavor('Ultimate Summer Shisha', 'Strawberry', 'CAP', 5.0, 2);
SELECT link_recipe_flavor('Ultimate Summer Shisha', 'Grape', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Ultimate Summer Shisha', 'Mint', 'FA', 3.0, 4);

SELECT link_recipe_flavor('Tropical Island Shisha', 'Mango', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Tropical Island Shisha', 'Pineapple', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Tropical Island Shisha', 'Coconut', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Tropical Island Shisha', 'Dragonfruit', 'TPA', 3.0, 4);

SELECT link_recipe_flavor('Berry Paradise Shisha', 'Blueberry', 'FW', 5.0, 1);
SELECT link_recipe_flavor('Berry Paradise Shisha', 'Raspberry', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Berry Paradise Shisha', 'Strawberry', 'CAP', 4.0, 3);
SELECT link_recipe_flavor('Berry Paradise Shisha', 'Mint', 'FA', 3.0, 4);

SELECT link_recipe_flavor('Dessert Heaven Shisha', 'Vanilla Custard', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Dessert Heaven Shisha', 'Caramel', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Dessert Heaven Shisha', 'Cookie', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Dessert Heaven Shisha', 'Bavarian Cream', 'TPA', 3.0, 4);

SELECT link_recipe_flavor('Fruit Cocktail Shisha', 'Peach', 'TPA', 5.0, 1);
SELECT link_recipe_flavor('Fruit Cocktail Shisha', 'Mango', 'TPA', 5.0, 2);
SELECT link_recipe_flavor('Fruit Cocktail Shisha', 'Strawberry', 'CAP', 4.0, 3);
SELECT link_recipe_flavor('Fruit Cocktail Shisha', 'Orange', 'TPA', 3.0, 4);

SELECT link_recipe_flavor('Grape Berry Mint Shisha', 'Grape', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Grape Berry Mint Shisha', 'Blueberry', 'FW', 4.0, 2);
SELECT link_recipe_flavor('Grape Berry Mint Shisha', 'Raspberry', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Grape Berry Mint Shisha', 'Mint', 'FA', 3.0, 4);

SELECT link_recipe_flavor('Citrus Tropical Shisha', 'Lemon', 'TPA', 4.0, 1);
SELECT link_recipe_flavor('Citrus Tropical Shisha', 'Orange', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Citrus Tropical Shisha', 'Mango', 'TPA', 5.0, 3);
SELECT link_recipe_flavor('Citrus Tropical Shisha', 'Pineapple', 'TPA', 4.0, 4);

SELECT link_recipe_flavor('Strawberry Custard Cookie Shisha', 'Strawberry', 'CAP', 6.0, 1);
SELECT link_recipe_flavor('Strawberry Custard Cookie Shisha', 'Vanilla Custard', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Strawberry Custard Cookie Shisha', 'Cookie', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Strawberry Custard Cookie Shisha', 'Bavarian Cream', 'TPA', 3.0, 4);

SELECT link_recipe_flavor('Watermelon Tropical Ice Shisha', 'Watermelon', 'TPA', 6.0, 1);
SELECT link_recipe_flavor('Watermelon Tropical Ice Shisha', 'Mango', 'TPA', 4.0, 2);
SELECT link_recipe_flavor('Watermelon Tropical Ice Shisha', 'Pineapple', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Watermelon Tropical Ice Shisha', 'Mint', 'FA', 3.0, 4);

SELECT link_recipe_flavor('Apple Blueberry Grape Ice Shisha', 'Apple', 'FW', 6.0, 1);
SELECT link_recipe_flavor('Apple Blueberry Grape Ice Shisha', 'Blueberry', 'FW', 4.0, 2);
SELECT link_recipe_flavor('Apple Blueberry Grape Ice Shisha', 'Grape', 'TPA', 4.0, 3);
SELECT link_recipe_flavor('Apple Blueberry Grape Ice Shisha', 'Mint', 'FA', 3.0, 4);

-- Drop the temporary function
DROP FUNCTION IF EXISTS link_recipe_flavor(TEXT, TEXT, TEXT, NUMERIC, INTEGER);

-- ============================================
-- END OF PART 5: RECIPE_FLAVORS LINKING
-- ============================================

-- ============================================
-- SEED SCRIPT COMPLETE
-- Total: 240 recipes
-- - 80 Liquid (single flavor, beginner)
-- - 60 Liquid PRO (2-4 flavors, various levels)
-- - 20 Shortfill (single flavor, beginner)
-- - 80 Shisha (1-4 flavors, various levels)
-- ============================================
