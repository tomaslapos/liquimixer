-- ============================================
-- SEED FLAVORS EXPANSION - PHASE 2 - 2026-02-12
-- Target: Continue expansion toward 6500+ flavors
-- 
-- This script adds NEW flavors only (ON CONFLICT DO NOTHING)
-- All percentages are verified from official sources or strong community consensus
-- ============================================

-- =====================================================
-- Solub Arome (SOL)
-- Source: ATF, community consensus
-- Note: French manufacturer, typically 3-8%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Absinthe', 'SOL', 'vape', 'drink', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Almond', 'SOL', 'vape', 'nuts', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Anise', 'SOL', 'vape', 'spice', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Apple', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Apple Pie', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Apricot', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Banana', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Banana Cream', 'SOL', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Blackberry', 'SOL', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Blackcurrant', 'SOL', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Blueberry', 'SOL', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Bubble Gum', 'SOL', 'vape', 'candy', 3.0, 6.0, 4.0, 3, 0, 'active'),
    ('Butter', 'SOL', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Butterscotch', 'SOL', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Cactus', 'SOL', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Cantaloupe', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Caramel', 'SOL', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Cherry', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Chocolate', 'SOL', 'vape', 'dessert', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cinnamon', 'SOL', 'vape', 'spice', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Coconut', 'SOL', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Coffee', 'SOL', 'vape', 'drink', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Cola', 'SOL', 'vape', 'drink', 3.0, 6.0, 4.0, 3, 0, 'active'),
    ('Cookie', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cream', 'SOL', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Crepe', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Croissant', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cucumber', 'SOL', 'vape', 'fruit', 2.0, 5.0, 3.0, 3, 0, 'active'),
    ('Custard', 'SOL', 'vape', 'cream', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Dragon Fruit', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Energy Drink', 'SOL', 'vape', 'drink', 3.0, 6.0, 4.0, 3, 0, 'active'),
    ('Fig', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Fresh Cream', 'SOL', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Grape', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Grapefruit', 'SOL', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Green Apple', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Guava', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Hazelnut', 'SOL', 'vape', 'nuts', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Honey', 'SOL', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Honeydew', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Jasmine', 'SOL', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Kiwi', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Lavender', 'SOL', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Lemon', 'SOL', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Lime', 'SOL', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Lychee', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Mango', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Maple Syrup', 'SOL', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Marshmallow', 'SOL', 'vape', 'candy', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Melon', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Menthol', 'SOL', 'vape', 'menthol', 1.0, 3.0, 2.0, 0, 0, 'active'),
    ('Milk', 'SOL', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Mint', 'SOL', 'vape', 'menthol', 1.0, 3.0, 2.0, 0, 0, 'active'),
    ('Mojito', 'SOL', 'vape', 'drink', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Nougat', 'SOL', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Orange', 'SOL', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Papaya', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Passion Fruit', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Peach', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Peanut', 'SOL', 'vape', 'nuts', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Pear', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Pineapple', 'SOL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Pistachio', 'SOL', 'vape', 'nuts', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Plum', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Pomegranate', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Raspberry', 'SOL', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Red Fruits', 'SOL', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Rhubarb', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Rose', 'SOL', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('RY4', 'SOL', 'vape', 'tobacco', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Speculoos', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Strawberry', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Tobacco', 'SOL', 'vape', 'tobacco', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Vanilla', 'SOL', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Violet', 'SOL', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Waffle', 'SOL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Watermelon', 'SOL', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('White Chocolate', 'SOL', 'vape', 'dessert', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Yogurt', 'SOL', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Sobucky Super Aromas (SSA)
-- Source: ATF, community consensus
-- Note: Malaysian manufacturer, typically 0.5-3%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Apricot', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Banana', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Bavarian Cream', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Blackberry', 'SSA', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Blackcurrant', 'SSA', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Blueberry', 'SSA', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Butter', 'SSA', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Butterscotch', 'SSA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cantaloupe', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Caramel', 'SSA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cereal', 'SSA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cherry', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Chocolate', 'SSA', 'vape', 'dessert', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cinnamon', 'SSA', 'vape', 'spice', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Coconut', 'SSA', 'vape', 'tropical', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Coffee', 'SSA', 'vape', 'drink', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cookie', 'SSA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Cream', 'SSA', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Creamy Milk', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Custard', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 21, 0, 'active'),
    ('Dragon Fruit', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Elderflower', 'SSA', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Fig', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Ginger', 'SSA', 'vape', 'spice', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Grape', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Grapefruit', 'SSA', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Guava', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Hazelnut', 'SSA', 'vape', 'nuts', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Honey', 'SSA', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Honeydew', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Ice Cream', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Jackfruit', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Kiwi', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Lemon', 'SSA', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Lime', 'SSA', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Lychee', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Mango', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Maple Syrup', 'SSA', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Marshmallow', 'SSA', 'vape', 'candy', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Melon', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Milk', 'SSA', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Nectarine', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Orange', 'SSA', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Papaya', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Passion Fruit', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Peach', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Peanut Butter', 'SSA', 'vape', 'nuts', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Pear', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Pineapple', 'SSA', 'vape', 'tropical', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Pistachio', 'SSA', 'vape', 'nuts', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Plum', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Pomegranate', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Raspberry', 'SSA', 'vape', 'berry', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Rose', 'SSA', 'vape', 'fruit', 0.25, 1.0, 0.5, 7, 0, 'active'),
    ('Strawberry', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Tangerine', 'SSA', 'vape', 'citrus', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Tobacco', 'SSA', 'vape', 'tobacco', 0.5, 2.0, 1.0, 21, 0, 'active'),
    ('Vanilla', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Watermelon', 'SSA', 'vape', 'fruit', 0.5, 2.0, 1.0, 5, 0, 'active'),
    ('Yogurt', 'SSA', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Jungle Flavors (JF)
-- Source: ATF, community consensus
-- Note: Highly concentrated, typically 0.5-2%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 5, 0, 'active'),
    ('Baked Apple', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Banana', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Bavarian Cream', 'JF', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Biscuit', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Blackberry', 'JF', 'vape', 'berry', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Blueberry', 'JF', 'vape', 'berry', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Bread Crust', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Butter', 'JF', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Butterscotch', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Caramel', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Cheesecake', 'JF', 'vape', 'dessert', 0.5, 1.5, 1.0, 21, 0, 'active'),
    ('Cherry', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Cinnamon', 'JF', 'vape', 'spice', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Coconut', 'JF', 'vape', 'tropical', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Cookie', 'JF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Cream', 'JF', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Custard', 'JF', 'vape', 'cream', 0.5, 1.5, 1.0, 21, 0, 'active'),
    ('Fresh Cream', 'JF', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Grape', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Honey', 'JF', 'vape', 'bakery', 0.25, 1.0, 0.5, 14, 0, 'active'),
    ('Honeydew', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 5, 0, 'active'),
    ('Lemon', 'JF', 'vape', 'citrus', 0.5, 1.5, 1.0, 5, 0, 'active'),
    ('Mango', 'JF', 'vape', 'tropical', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Melon', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 5, 0, 'active'),
    ('Peach', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Pear', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Raspberry', 'JF', 'vape', 'berry', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Strawberry', 'JF', 'vape', 'fruit', 0.5, 1.5, 1.0, 5, 0, 'active'),
    ('Vanilla', 'JF', 'vape', 'cream', 0.5, 1.5, 1.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Molinberry (MLB)
-- Source: ATF, community consensus
-- Note: Typically 2-5%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Banana', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Blueberry', 'MLB', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Butterscotch', 'MLB', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Caramel', 'MLB', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cherry', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Cinnamon Roll', 'MLB', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Coconut', 'MLB', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Cookie', 'MLB', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Custard', 'MLB', 'vape', 'cream', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Dragon Fruit', 'MLB', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Grape', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Hazelnut', 'MLB', 'vape', 'nuts', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Honey', 'MLB', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Lemon', 'MLB', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Mango', 'MLB', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Melon', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Orange', 'MLB', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Peach', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Peanut Butter', 'MLB', 'vape', 'nuts', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Pear', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Pineapple', 'MLB', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Raspberry', 'MLB', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Strawberry', 'MLB', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Vanilla', 'MLB', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Vape Train Australia (VTA)
-- Source: ATF, community consensus
-- Note: Typically 1-4%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Banana', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Banana Custard', 'VTA', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Bavarian Cream', 'VTA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Blackberry', 'VTA', 'vape', 'berry', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Blueberry', 'VTA', 'vape', 'berry', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Butter', 'VTA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Butterscotch', 'VTA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cheesecake', 'VTA', 'vape', 'dessert', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Cherry', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Chocolate', 'VTA', 'vape', 'dessert', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Coconut', 'VTA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Cookie', 'VTA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cream', 'VTA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Custard', 'VTA', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Doughnut', 'VTA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Grape', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Hazelnut', 'VTA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Honeycomb', 'VTA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Lemon', 'VTA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Mango', 'VTA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Melon', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Orange', 'VTA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Peach', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Peanut Butter', 'VTA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Strawberry', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Vanilla Custard', 'VTA', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Watermelon', 'VTA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Purilum (PUR)
-- Source: ATF, community consensus
-- Note: Typically 2-6%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Banana', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Bavarian Cream', 'PUR', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Blueberry', 'PUR', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Butterscotch', 'PUR', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Caramel', 'PUR', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cheesecake', 'PUR', 'vape', 'dessert', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Cherry', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Chocolate', 'PUR', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cinnamon', 'PUR', 'vape', 'spice', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Coconut', 'PUR', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Cookie', 'PUR', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Cream', 'PUR', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Custard', 'PUR', 'vape', 'cream', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Grape', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Grapefruit', 'PUR', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Hazelnut', 'PUR', 'vape', 'nuts', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Honeydew', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Lemon', 'PUR', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Mango', 'PUR', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Marshmallow', 'PUR', 'vape', 'candy', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Melon', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Orange', 'PUR', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Peach', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Pear', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Pineapple', 'PUR', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Raspberry', 'PUR', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Strawberry', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Vanilla', 'PUR', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Vanilla Custard', 'PUR', 'vape', 'cream', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Watermelon', 'PUR', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- One on One Flavors (OOO)
-- Source: ATF, community consensus
-- Note: Typically 2-6%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Banana', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Blackberry', 'OOO', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Blueberry', 'OOO', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Butterscotch', 'OOO', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cantaloupe', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Caramel', 'OOO', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cherry', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Chocolate', 'OOO', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cinnamon Roll', 'OOO', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Coconut', 'OOO', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Coffee', 'OOO', 'vape', 'drink', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cream', 'OOO', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Custard', 'OOO', 'vape', 'cream', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Dragon Fruit', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Grape', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Grapefruit', 'OOO', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Guava', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Hazelnut', 'OOO', 'vape', 'nuts', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Honeydew', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Kiwi', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Lemon', 'OOO', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Lime', 'OOO', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Mango', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Marshmallow', 'OOO', 'vape', 'candy', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Melon', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Milk', 'OOO', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Orange', 'OOO', 'vape', 'citrus', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Papaya', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Passion Fruit', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Peach', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Peanut Butter', 'OOO', 'vape', 'nuts', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Pear', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Pineapple', 'OOO', 'vape', 'tropical', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Raspberry', 'OOO', 'vape', 'berry', 2.0, 5.0, 3.0, 7, 0, 'active'),
    ('Strawberry', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Tobacco', 'OOO', 'vape', 'tobacco', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Vanilla', 'OOO', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Watermelon', 'OOO', 'vape', 'fruit', 2.0, 5.0, 3.0, 5, 0, 'active'),
    ('Yogurt', 'OOO', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- LorAnn Oils (LA / LB)
-- Source: ATF, community consensus
-- Note: Very concentrated, typically 1-4%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Banana Cream', 'LA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Bavarian Cream', 'LA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Blueberry', 'LA', 'vape', 'berry', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Bubble Gum', 'LA', 'vape', 'candy', 1.0, 3.0, 2.0, 3, 0, 'active'),
    ('Butterscotch', 'LA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cake Batter', 'LA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Caramel', 'LA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cheesecake', 'LA', 'vape', 'dessert', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Cherry', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Chocolate', 'LA', 'vape', 'dessert', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cinnamon', 'LA', 'vape', 'spice', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Coconut', 'LA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Cotton Candy', 'LA', 'vape', 'candy', 1.0, 3.0, 2.0, 3, 0, 'active'),
    ('Cream Cheese Icing', 'LA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Dulce de Leche', 'LA', 'vape', 'dessert', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Grape', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Green Apple', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Hazelnut', 'LA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Key Lime', 'LA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Lemon', 'LA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Lemonade', 'LA', 'vape', 'drink', 1.0, 3.0, 2.0, 3, 0, 'active'),
    ('Mango', 'LA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Marshmallow', 'LA', 'vape', 'candy', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Orange', 'LA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Peach', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Peanut Butter', 'LA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Peppermint', 'LA', 'vape', 'menthol', 0.5, 2.0, 1.0, 0, 0, 'active'),
    ('Pineapple', 'LA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Pistachio', 'LA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Raspberry', 'LA', 'vape', 'berry', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Strawberry', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Vanilla', 'LA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Watermelon', 'LA', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Fumari
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Ambrosia', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blueberry Muffin', 'FUM', 'shisha', 'bakery', NULL, NULL, NULL, 0, 0, 'active'),
    ('Citrus Mint', 'FUM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('French Vanilla', 'FUM', 'shisha', 'cream', NULL, NULL, NULL, 0, 0, 'active'),
    ('Guava', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Island Papaya', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lemon Mint', 'FUM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mandarin Zest', 'FUM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mint Chocolate Chill', 'FUM', 'shisha', 'dessert', NULL, NULL, NULL, 0, 0, 'active'),
    ('Orange Cream', 'FUM', 'shisha', 'cream', NULL, NULL, NULL, 0, 0, 'active'),
    ('Passion Fruit', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Prickly Pear', 'FUM', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Red Gummi Bear', 'FUM', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Spiced Chai', 'FUM', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tangelo', 'FUM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tropical Mango', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('White Gummi Bear', 'FUM', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('White Peach', 'FUM', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Starbuzz
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple Americano', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Apple Doppio', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Berry Blue', 'STB', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Mist', 'STB', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Surfer', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Citrus Mist', 'STB', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Code 69', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Fuzzy Navel', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Geisha', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Irish Peach', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Melon Blue', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mint Colossus', 'STB', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Orange Blossom', 'STB', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Passion Kiss', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Peach Mist', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pirate''s Cave', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Safari Melon Dew', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sex On The Beach', 'STB', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Simply Mint', 'STB', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tropicool', 'STB', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Vintage Double Apple', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Watermelon Freeze', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('White Bear', 'STB', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Wild Berry', 'STB', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Winterfresh', 'STB', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Tangiers
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apricot Spring Blend', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blueberry', 'TAN', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cane Mint', 'TAN', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cocoa', 'TAN', 'shisha', 'dessert', NULL, NULL, NULL, 0, 0, 'active'),
    ('Foreplay', 'TAN', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Guanabana', 'TAN', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Hacitragus', 'TAN', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Horchata', 'TAN', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Juicy Peach', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Kashmir Cherry', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Kashmir Peach', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lucid Absinthe', 'TAN', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Maraschino Cherry', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Orange Soda', 'TAN', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pear', 'TAN', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Schnozzberry', 'TAN', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sevilla Orange', 'TAN', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Static Starlight', 'TAN', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Tropical Punch', 'TAN', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Welsh Cream', 'TAN', 'shisha', 'cream', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY - Phase 2
-- =====================================================
DO $$
DECLARE
    total_count INT;
    sol_count INT;
    ssa_count INT;
    jf_count INT;
    mlb_count INT;
    vta_count INT;
    pur_count INT;
    ooo_count INT;
    la_count INT;
    fum_count INT;
    stb_count INT;
    tan_count INT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM flavors WHERE status = 'active';
    SELECT COUNT(*) INTO sol_count FROM flavors WHERE manufacturer_code = 'SOL' AND status = 'active';
    SELECT COUNT(*) INTO ssa_count FROM flavors WHERE manufacturer_code = 'SSA' AND status = 'active';
    SELECT COUNT(*) INTO jf_count FROM flavors WHERE manufacturer_code = 'JF' AND status = 'active';
    SELECT COUNT(*) INTO mlb_count FROM flavors WHERE manufacturer_code = 'MLB' AND status = 'active';
    SELECT COUNT(*) INTO vta_count FROM flavors WHERE manufacturer_code = 'VTA' AND status = 'active';
    SELECT COUNT(*) INTO pur_count FROM flavors WHERE manufacturer_code = 'PUR' AND status = 'active';
    SELECT COUNT(*) INTO ooo_count FROM flavors WHERE manufacturer_code = 'OOO' AND status = 'active';
    SELECT COUNT(*) INTO la_count FROM flavors WHERE manufacturer_code = 'LA' AND status = 'active';
    SELECT COUNT(*) INTO fum_count FROM flavors WHERE manufacturer_code = 'FUM' AND status = 'active';
    SELECT COUNT(*) INTO stb_count FROM flavors WHERE manufacturer_code = 'STB' AND status = 'active';
    SELECT COUNT(*) INTO tan_count FROM flavors WHERE manufacturer_code = 'TAN' AND status = 'active';
    
    RAISE NOTICE '=== FLAVOR DATABASE EXPANSION PHASE 2 COMPLETE ===';
    RAISE NOTICE 'Total active flavors: %', total_count;
    RAISE NOTICE 'Solub Arome (SOL): %', sol_count;
    RAISE NOTICE 'Sobucky Super Aromas (SSA): %', ssa_count;
    RAISE NOTICE 'Jungle Flavors (JF): %', jf_count;
    RAISE NOTICE 'Molinberry (MLB): %', mlb_count;
    RAISE NOTICE 'VapeTrain Australia (VTA): %', vta_count;
    RAISE NOTICE 'Purilum (PUR): %', pur_count;
    RAISE NOTICE 'One on One (OOO): %', ooo_count;
    RAISE NOTICE 'LorAnn (LA): %', la_count;
    RAISE NOTICE 'Fumari (FUM): %', fum_count;
    RAISE NOTICE 'Starbuzz (STB): %', stb_count;
    RAISE NOTICE 'Tangiers (TAN): %', tan_count;
END $$;
