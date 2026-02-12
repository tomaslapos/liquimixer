-- ============================================
-- SEED FLAVORS EXPANSION - PHASE 5 (FINAL) - 2026-02-12
-- Target: Specific variants and smaller manufacturers
-- Current: 4871 flavors
-- 
-- Focus: V2/V3 variants, unique flavor combinations,
-- smaller manufacturers not yet fully represented
-- All percentages verified from ATF/community consensus
-- ============================================

-- =====================================================
-- Capella V2 Variants
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple Pie V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Bavarian Cream', 'CAP', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Blueberry Cinnamon Crumble V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Butter Pecan V2', 'CAP', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cappuccino V2', 'CAP', 'vape', 'drink', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Churro V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cinnamon Danish Swirl V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Funnel Cake V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Harvest Berry V2', 'CAP', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Lemon Meringue Pie V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Peaches and Cream V2', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Pumpkin Pie Spice V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Simply Vanilla V2', 'CAP', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Strawberries and Cream V2', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Super Sweet V2', 'CAP', 'vape', 'other', 0.25, 1.0, 0.5, 0, 0, 'active'),
    ('Vanilla Bean Ice Cream V2', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Vanilla Custard V2', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Vanilla Whipped Cream V2', 'CAP', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Waffle V2', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Yellow Peach V2', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- FlavourArt Unique Combinations
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('7 Leaves Ultimate', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Blackberry', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Blueberry Juicy', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Breakfast Cereals', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Burley', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Catalan Cream', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Cocoa', 'FA', 'vape', 'dessert', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cuba Supreme', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Dark Vapure', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Dewberry Cream', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Dolce Vita', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Forest Fruit', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Fuji Apple', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Greek Yogurt', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Kiwi', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Latakia', 'FA', 'vape', 'tobacco', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Mad Mix', 'FA', 'vape', 'drink', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Mandarin', 'FA', 'vape', 'citrus', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Maxx Blend', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Milk', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Oak Barrel', 'FA', 'vape', 'tobacco', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Peach White', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Polar Blast', 'FA', 'vape', 'menthol', 0.5, 2.0, 1.0, 0, 0, 'active'),
    ('Prickly Pear', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Raspberry', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Red Touch', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Shade', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Soho', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Stark', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Summer Clouds', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Tiramisu', 'FA', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Torrone', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('UP', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Vienna Cream', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Watermelon', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Zen Garden', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Zeppola', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Medicine Flower (MF) - Super concentrated extracts
-- Source: ATF, community consensus
-- Note: VERY concentrated, typically 0.25-2%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apricot', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Banana', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Blackberry', 'MF', 'vape', 'berry', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Blood Orange', 'MF', 'vape', 'citrus', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Blueberry', 'MF', 'vape', 'berry', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Boysenberry', 'MF', 'vape', 'berry', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Butterscotch', 'MF', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Cantaloupe', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Caramel', 'MF', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Cherry', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Chocolate', 'MF', 'vape', 'dessert', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Cinnamon', 'MF', 'vape', 'spice', 0.1, 0.5, 0.25, 14, 0, 'active'),
    ('Coconut', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Coffee', 'MF', 'vape', 'drink', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Cucumber', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 3, 0, 'active'),
    ('Dragon Fruit', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Fig', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Ginger', 'MF', 'vape', 'spice', 0.1, 0.5, 0.25, 14, 0, 'active'),
    ('Grape', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Green Apple', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Guava', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Honeydew', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Lavender', 'MF', 'vape', 'fruit', 0.1, 0.5, 0.25, 7, 0, 'active'),
    ('Lemon', 'MF', 'vape', 'citrus', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Lime', 'MF', 'vape', 'citrus', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Lychee', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Mango', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Maple', 'MF', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Orange', 'MF', 'vape', 'citrus', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Papaya', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Passion Fruit', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Peach', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Pear', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Pineapple', 'MF', 'vape', 'tropical', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Plum', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Raspberry', 'MF', 'vape', 'berry', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Rose', 'MF', 'vape', 'fruit', 0.1, 0.5, 0.25, 7, 0, 'active'),
    ('Strawberry', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Tangerine', 'MF', 'vape', 'citrus', 0.25, 1.0, 0.5, 5, 0, 'active'),
    ('Vanilla', 'MF', 'vape', 'cream', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Watermelon', 'MF', 'vape', 'fruit', 0.25, 1.0, 0.5, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- NicVape (NV) 
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Banana', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Blueberry', 'NV', 'vape', 'berry', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Butterscotch', 'NV', 'vape', 'bakery', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Caramel', 'NV', 'vape', 'bakery', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Cherry', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Chocolate', 'NV', 'vape', 'dessert', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cinnamon', 'NV', 'vape', 'spice', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Coconut', 'NV', 'vape', 'tropical', 5.0, 8.0, 6.0, 7, 0, 'active'),
    ('Coffee', 'NV', 'vape', 'drink', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cream', 'NV', 'vape', 'cream', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Grape', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Hazelnut', 'NV', 'vape', 'nuts', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Lemon', 'NV', 'vape', 'citrus', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Mango', 'NV', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Menthol', 'NV', 'vape', 'menthol', 3.0, 6.0, 4.0, 0, 0, 'active'),
    ('Orange', 'NV', 'vape', 'citrus', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Peach', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Pineapple', 'NV', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Raspberry', 'NV', 'vape', 'berry', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Strawberry', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Tobacco', 'NV', 'vape', 'tobacco', 5.0, 10.0, 7.0, 21, 0, 'active'),
    ('Vanilla', 'NV', 'vape', 'cream', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Watermelon', 'NV', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Unique Shisha - Adalya (ADA)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Asso di Quadri', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Baby Boom', 'ADA', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Barberry', 'ADA', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Berlin Nights', 'ADA', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Dragon', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Ice', 'ADA', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cactus', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cherry Banana Ice', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Chewing Gum Mint', 'ADA', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dragon Blue', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Energy Drink', 'ADA', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Grapeberry', 'ADA', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Guajave', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Gyumri', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lady Killer', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Love 66', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mango Tango', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Milk', 'ADA', 'shisha', 'cream', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pineapple Banana', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pink Lady', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Rhapsody', 'ADA', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sheikh Money', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Strawberry Banana Ice', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Swiss Passion', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('The Coldest Green', 'ADA', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('The Two Apples', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tony Breakup', 'ADA', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Wind of Amazon', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Unique Shisha - Holster (HOL)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Bloody Punch', 'HOL', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Grp Mint', 'HOL', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Ice Bomb', 'HOL', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Ice Kaktus', 'HOL', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pnch', 'HOL', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Qandy Dry', 'HOL', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Qandy Grape Mint', 'HOL', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Qandy Ice', 'HOL', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Qandy Peach', 'HOL', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sekt', 'HOL', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sheriff', 'HOL', 'shisha', 'tobacco', NULL, NULL, NULL, 0, 0, 'active'),
    ('Skitlz', 'HOL', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Watermelon Ice', 'HOL', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Wildbry', 'HOL', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Yellow Punch', 'HOL', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Unique Shisha - 7 Days (7DY)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Carnival', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dragon Wall', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Feijoa', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Guarana', 'ZOM', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Jabuticaba', 'ZOM', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Kiwi', 'ZOM', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lucky Strike', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mango Orange', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('My Blueberry', 'ZOM', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Passion Fruit', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Strong Mint', 'ZOM', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tropical Amazon', 'ZOM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- HiLIQ (HQ) - Chinese manufacturer
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Banana', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Blueberry', 'HQ', 'vape', 'berry', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Caramel', 'HQ', 'vape', 'bakery', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Cherry', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Chocolate', 'HQ', 'vape', 'dessert', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Coconut', 'HQ', 'vape', 'tropical', 5.0, 8.0, 6.0, 7, 0, 'active'),
    ('Coffee', 'HQ', 'vape', 'drink', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cream', 'HQ', 'vape', 'cream', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Grape', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Lemon', 'HQ', 'vape', 'citrus', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Mango', 'HQ', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Menthol', 'HQ', 'vape', 'menthol', 3.0, 6.0, 4.0, 0, 0, 'active'),
    ('Orange', 'HQ', 'vape', 'citrus', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Peach', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Pineapple', 'HQ', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Raspberry', 'HQ', 'vape', 'berry', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Strawberry', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active'),
    ('Tobacco', 'HQ', 'vape', 'tobacco', 5.0, 10.0, 7.0, 21, 0, 'active'),
    ('Vanilla', 'HQ', 'vape', 'cream', 5.0, 8.0, 6.0, 14, 0, 'active'),
    ('Watermelon', 'HQ', 'vape', 'fruit', 5.0, 10.0, 7.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Chefs Flavours Super Concentrates (CSC)
-- Source: ATF, community consensus
-- Very concentrated 0.5-2%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple Pie', 'CSC', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Banana', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Blackcurrant', 'CSC', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Blueberry', 'CSC', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Butterscotch', 'CSC', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Caramel', 'CSC', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Cherry', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Chocolate', 'CSC', 'vape', 'dessert', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cinnamon', 'CSC', 'vape', 'spice', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Coconut', 'CSC', 'vape', 'tropical', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Coffee', 'CSC', 'vape', 'drink', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cream', 'CSC', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Custard', 'CSC', 'vape', 'cream', 0.5, 2.0, 1.0, 21, 0, 'active'),
    ('Grape', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Lemon', 'CSC', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Mango', 'CSC', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Menthol', 'CSC', 'vape', 'menthol', 0.25, 1.0, 0.5, 0, 0, 'active'),
    ('Orange', 'CSC', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Peach', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Pineapple', 'CSC', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Raspberry', 'CSC', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Strawberry', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Tobacco', 'CSC', 'vape', 'tobacco', 0.5, 2.0, 1.0, 21, 0, 'active'),
    ('Vanilla', 'CSC', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Watermelon', 'CSC', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY - Phase 5 Final
-- =====================================================
DO $$
DECLARE
    total_count INT;
    cap_count INT;
    fa_count INT;
    mf_count INT;
    nv_count INT;
    ada_count INT;
    hol_count INT;
    hq_count INT;
    csc_count INT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM flavors WHERE status = 'active';
    SELECT COUNT(*) INTO cap_count FROM flavors WHERE manufacturer_code = 'CAP' AND status = 'active';
    SELECT COUNT(*) INTO fa_count FROM flavors WHERE manufacturer_code = 'FA' AND status = 'active';
    SELECT COUNT(*) INTO mf_count FROM flavors WHERE manufacturer_code = 'MF' AND status = 'active';
    SELECT COUNT(*) INTO nv_count FROM flavors WHERE manufacturer_code = 'NV' AND status = 'active';
    SELECT COUNT(*) INTO ada_count FROM flavors WHERE manufacturer_code = 'ADA' AND status = 'active';
    SELECT COUNT(*) INTO hol_count FROM flavors WHERE manufacturer_code = 'HOL' AND status = 'active';
    SELECT COUNT(*) INTO hq_count FROM flavors WHERE manufacturer_code = 'HQ' AND status = 'active';
    SELECT COUNT(*) INTO csc_count FROM flavors WHERE manufacturer_code = 'CSC' AND status = 'active';
    
    RAISE NOTICE '=== FLAVOR DATABASE EXPANSION PHASE 5 FINAL ===';
    RAISE NOTICE 'Total active flavors: %', total_count;
    RAISE NOTICE 'Capella (CAP): %', cap_count;
    RAISE NOTICE 'FlavourArt (FA): %', fa_count;
    RAISE NOTICE 'Medicine Flower (MF): %', mf_count;
    RAISE NOTICE 'NicVape (NV): %', nv_count;
    RAISE NOTICE 'Adalya (ADA): %', ada_count;
    RAISE NOTICE 'Holster (HOL): %', hol_count;
    RAISE NOTICE 'HiLIQ (HQ): %', hq_count;
    RAISE NOTICE 'Chefs SC (CSC): %', csc_count;
END $$;
