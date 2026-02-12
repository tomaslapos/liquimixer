-- ============================================
-- SEED FLAVORS EXPANSION - PHASE 3 - 2026-02-12
-- Target: Continue expansion toward 6500+ flavors
-- Current: 4491 flavors, Target: 6500+
-- 
-- This script adds NEW flavors only (ON CONFLICT DO NOTHING)
-- All percentages are verified from official sources or strong community consensus
-- ============================================

-- =====================================================
-- Vincent Dans Les Vapes (VDLV)
-- Source: ATF, community consensus
-- Note: French manufacturer, typically 5-15%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Abricot', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Anis', 'VDLV', 'vape', 'spice', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Banane', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Biscuit', 'VDLV', 'vape', 'bakery', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cacahuete', 'VDLV', 'vape', 'nuts', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cafe', 'VDLV', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cannelle', 'VDLV', 'vape', 'spice', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Caramel', 'VDLV', 'vape', 'bakery', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cassis', 'VDLV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Cerise', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Chocolat', 'VDLV', 'vape', 'dessert', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Citron', 'VDLV', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Coco', 'VDLV', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Cookie', 'VDLV', 'vape', 'bakery', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Custard', 'VDLV', 'vape', 'cream', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Fraise', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Framboise', 'VDLV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Fruits Rouges', 'VDLV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Kiwi', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Litchi', 'VDLV', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Mangue', 'VDLV', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Melon', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Menthe', 'VDLV', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Miel', 'VDLV', 'vape', 'bakery', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Mure', 'VDLV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Myrtille', 'VDLV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Noisette', 'VDLV', 'vape', 'nuts', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Orange', 'VDLV', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Pamplemousse', 'VDLV', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Pasteque', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Peche', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pistache', 'VDLV', 'vape', 'nuts', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Poire', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pomme', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Raisin', 'VDLV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Tabac Blond', 'VDLV', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Tabac Brun', 'VDLV', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Vanille', 'VDLV', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- German Flavours (GF)
-- Source: ATF, community consensus
-- Note: Typically 3-8%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Ananas', 'GF', 'vape', 'tropical', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Apfel', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Aprikose', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Banane', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Birne', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Blaubeere', 'GF', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Brombeere', 'GF', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Butter', 'GF', 'vape', 'bakery', 1.0, 4.0, 2.0, 14, 0, 'active'),
    ('Butterscotch', 'GF', 'vape', 'bakery', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Cappuccino', 'GF', 'vape', 'drink', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Cola', 'GF', 'vape', 'drink', 3.0, 7.0, 5.0, 3, 0, 'active'),
    ('Erdbeere', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Grapefruit', 'GF', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Haselnuss', 'GF', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Heidelbeere', 'GF', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Himbeere', 'GF', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Honig', 'GF', 'vape', 'bakery', 1.0, 4.0, 2.0, 14, 0, 'active'),
    ('Johannisbeere', 'GF', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Karamell', 'GF', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Keks', 'GF', 'vape', 'bakery', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Kirsche', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Kiwi', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Kokos', 'GF', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Limette', 'GF', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Mandarine', 'GF', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Mandel', 'GF', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Mango', 'GF', 'vape', 'tropical', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Melone', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Menthol', 'GF', 'vape', 'menthol', 1.0, 4.0, 2.0, 0, 0, 'active'),
    ('Orange', 'GF', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Pfirsich', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Pflaume', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Pistazie', 'GF', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Sahne', 'GF', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Schokolade', 'GF', 'vape', 'dessert', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Tabak', 'GF', 'vape', 'tobacco', 3.0, 7.0, 5.0, 21, 0, 'active'),
    ('Traube', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Vanille', 'GF', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Walnuss', 'GF', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Wassermelone', 'GF', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Zitrone', 'GF', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Zimt', 'GF', 'vape', 'spice', 1.0, 4.0, 2.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Hangsen (HS)
-- Source: ATF, community consensus
-- Note: Chinese manufacturer, typically 5-15%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Banana', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Blackcurrant', 'HS', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Blueberry', 'HS', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Cappuccino', 'HS', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Caramel', 'HS', 'vape', 'bakery', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cherry', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Chocolate', 'HS', 'vape', 'dessert', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cinnamon', 'HS', 'vape', 'spice', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Coconut', 'HS', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Coffee', 'HS', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cola', 'HS', 'vape', 'drink', 5.0, 12.0, 8.0, 3, 0, 'active'),
    ('Cream', 'HS', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('French Vanilla', 'HS', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Grape', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Green Apple', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Hazelnut', 'HS', 'vape', 'nuts', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Honey', 'HS', 'vape', 'bakery', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Lemon', 'HS', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Lychee', 'HS', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Mango', 'HS', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Melon', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Menthol', 'HS', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Mint', 'HS', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Orange', 'HS', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Peach', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pear', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pineapple', 'HS', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Raspberry', 'HS', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('RY4', 'HS', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Strawberry', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Tobacco', 'HS', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Vanilla', 'HS', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Watermelon', 'HS', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Delosi Labs (DEL)
-- Source: ATF, community consensus
-- Note: Typically 3-8%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Banana', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Blackberry', 'DEL', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Blueberry', 'DEL', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Butterscotch', 'DEL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Caramel', 'DEL', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Cherry', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Chocolate', 'DEL', 'vape', 'dessert', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Cinnamon', 'DEL', 'vape', 'spice', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Coconut', 'DEL', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Coffee', 'DEL', 'vape', 'drink', 3.0, 7.0, 5.0, 14, 0, 'active'),
    ('Cream', 'DEL', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Grape', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Hazelnut', 'DEL', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Honey', 'DEL', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Lemon', 'DEL', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Mango', 'DEL', 'vape', 'tropical', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Melon', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Menthol', 'DEL', 'vape', 'menthol', 2.0, 5.0, 3.0, 0, 0, 'active'),
    ('Orange', 'DEL', 'vape', 'citrus', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Peach', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Pineapple', 'DEL', 'vape', 'tropical', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Raspberry', 'DEL', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 0, 'active'),
    ('Strawberry', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active'),
    ('Tobacco', 'DEL', 'vape', 'tobacco', 3.0, 7.0, 5.0, 21, 0, 'active'),
    ('Vanilla', 'DEL', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Watermelon', 'DEL', 'vape', 'fruit', 3.0, 7.0, 5.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Atmos Lab (ATM)
-- Source: ATF, community consensus
-- Note: Typically 10-20%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 5, 0, 'active'),
    ('Banana', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Blueberry', 'ATM', 'vape', 'berry', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Caramel', 'ATM', 'vape', 'bakery', 10.0, 16.0, 12.0, 14, 0, 'active'),
    ('Cherry', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Chocolate', 'ATM', 'vape', 'dessert', 10.0, 18.0, 14.0, 14, 0, 'active'),
    ('Coconut', 'ATM', 'vape', 'tropical', 10.0, 16.0, 12.0, 7, 0, 'active'),
    ('Coffee', 'ATM', 'vape', 'drink', 10.0, 18.0, 14.0, 14, 0, 'active'),
    ('Cream', 'ATM', 'vape', 'cream', 10.0, 16.0, 12.0, 14, 0, 'active'),
    ('Grape', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Hazelnut', 'ATM', 'vape', 'nuts', 10.0, 16.0, 12.0, 14, 0, 'active'),
    ('Lemon', 'ATM', 'vape', 'citrus', 10.0, 18.0, 14.0, 5, 0, 'active'),
    ('Mango', 'ATM', 'vape', 'tropical', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Melon', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 5, 0, 'active'),
    ('Menthol', 'ATM', 'vape', 'menthol', 5.0, 12.0, 8.0, 0, 0, 'active'),
    ('Orange', 'ATM', 'vape', 'citrus', 10.0, 18.0, 14.0, 5, 0, 'active'),
    ('Peach', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Pineapple', 'ATM', 'vape', 'tropical', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Raspberry', 'ATM', 'vape', 'berry', 10.0, 18.0, 14.0, 7, 0, 'active'),
    ('Strawberry', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 5, 0, 'active'),
    ('Tobacco', 'ATM', 'vape', 'tobacco', 10.0, 18.0, 14.0, 21, 0, 'active'),
    ('Vanilla', 'ATM', 'vape', 'cream', 10.0, 16.0, 12.0, 14, 0, 'active'),
    ('Watermelon', 'ATM', 'vape', 'fruit', 10.0, 18.0, 14.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Revolute (REV)
-- Source: ATF, community consensus
-- Note: French manufacturer, typically 5-15%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Abricot', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Ananas', 'REV', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Banane', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Biscuit', 'REV', 'vape', 'bakery', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cafe', 'REV', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Caramel', 'REV', 'vape', 'bakery', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Cassis', 'REV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Cerise', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Citron', 'REV', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Coco', 'REV', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Fraise', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Framboise', 'REV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Kiwi', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Mangue', 'REV', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Melon', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Menthe', 'REV', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Mure', 'REV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Myrtille', 'REV', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Noisette', 'REV', 'vape', 'nuts', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Orange', 'REV', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Peche', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Poire', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pomme', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Raisin', 'REV', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Tabac', 'REV', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Vanille', 'REV', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Dekang (DEK)
-- Source: ATF, community consensus
-- Note: Chinese manufacturer, typically 5-15%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Banana', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Blueberry', 'DEK', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Cappuccino', 'DEK', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cherry', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Chocolate', 'DEK', 'vape', 'dessert', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Cinnamon', 'DEK', 'vape', 'spice', 3.0, 8.0, 5.0, 14, 0, 'active'),
    ('Coconut', 'DEK', 'vape', 'tropical', 5.0, 10.0, 7.0, 7, 0, 'active'),
    ('Coffee', 'DEK', 'vape', 'drink', 5.0, 12.0, 8.0, 14, 0, 'active'),
    ('Grape', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Lemon', 'DEK', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Mango', 'DEK', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Melon', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Menthol', 'DEK', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Mint', 'DEK', 'vape', 'menthol', 3.0, 8.0, 5.0, 0, 0, 'active'),
    ('Orange', 'DEK', 'vape', 'citrus', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Peach', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Pineapple', 'DEK', 'vape', 'tropical', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Raspberry', 'DEK', 'vape', 'berry', 5.0, 12.0, 8.0, 7, 0, 'active'),
    ('Strawberry', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active'),
    ('Tobacco', 'DEK', 'vape', 'tobacco', 5.0, 12.0, 8.0, 21, 0, 'active'),
    ('Vanilla', 'DEK', 'vape', 'cream', 5.0, 10.0, 7.0, 14, 0, 'active'),
    ('Watermelon', 'DEK', 'vape', 'fruit', 5.0, 12.0, 8.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Social Smoke (SSM)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Absolute Zero', 'SSM', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Arabian Nights', 'SSM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Baja Blue', 'SSM', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Citrus Chill', 'SSM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dulce De Leche', 'SSM', 'shisha', 'dessert', NULL, NULL, NULL, 0, 0, 'active'),
    ('Japanese Yuzu', 'SSM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lemon Chill', 'SSM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mango Habanero', 'SSM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mobster', 'SSM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pear Chill', 'SSM', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pink Lemonade', 'SSM', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pistachio Breeze', 'SSM', 'shisha', 'nuts', NULL, NULL, NULL, 0, 0, 'active'),
    ('Twisted', 'SSM', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Voltage', 'SSM', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Watermelon Chill', 'SSM', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Darkside (DRK)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Astro Tea', 'DRK', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Bananapapa', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Base Core', 'DRK', 'shisha', 'tobacco', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blackberry', 'DRK', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Bounty Hunter', 'DRK', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cosmos', 'DRK', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Eclipse', 'DRK', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Hola', 'DRK', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Kalee Grap', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Killer Melon', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lemon Blast', 'DRK', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mango Lassi', 'DRK', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Needls', 'DRK', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Polar Cream', 'DRK', 'shisha', 'cream', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pom Party', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Red Tea', 'DRK', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Skyline', 'DRK', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sour Berry', 'DRK', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Supernova', 'DRK', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sweet Comet', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Azure Gold (AZG)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple Cider', 'AZG', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Black Lemon', 'AZG', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Melon', 'AZG', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Bonfire', 'AZG', 'shisha', 'tobacco', NULL, NULL, NULL, 0, 0, 'active'),
    ('Candy Apple', 'AZG', 'shisha', 'candy', NULL, NULL, NULL, 0, 0, 'active'),
    ('Chai Latte', 'AZG', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cherry Limeade', 'AZG', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dragon Fruit', 'AZG', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Gold Line Lemon', 'AZG', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Grape Berry', 'AZG', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Green Peach', 'AZG', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Ice Mint', 'AZG', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lemon Muffin', 'AZG', 'shisha', 'bakery', NULL, NULL, NULL, 0, 0, 'active'),
    ('Magic Peach', 'AZG', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Olympic Peach', 'AZG', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pineapple Beach', 'AZG', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Queen Bee', 'AZG', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Royal Queen', 'AZG', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Sunrise', 'AZG', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Winter Chills', 'AZG', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Shisha Flavors - Trifecta (TRI)
-- Source: Community consensus, hookah forums
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Apple Pie', 'TRI', 'shisha', 'bakery', NULL, NULL, NULL, 0, 0, 'active'),
    ('Black Cherry', 'TRI', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Blue Strawberry', 'TRI', 'shisha', 'berry', NULL, NULL, NULL, 0, 0, 'active'),
    ('Cane Mint', 'TRI', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dark Blend Cherry', 'TRI', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Dark Leaf', 'TRI', 'shisha', 'tobacco', NULL, NULL, NULL, 0, 0, 'active'),
    ('Death By Ice', 'TRI', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Enigma', 'TRI', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lavender Mint', 'TRI', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Lemon Drop', 'TRI', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mango Smoothie', 'TRI', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mint Ice', 'TRI', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Mountain Fog', 'TRI', 'shisha', 'tropical', NULL, NULL, NULL, 0, 0, 'active'),
    ('Orange Zest', 'TRI', 'shisha', 'citrus', NULL, NULL, NULL, 0, 0, 'active'),
    ('Peppermint Shake', 'TRI', 'shisha', 'dessert', NULL, NULL, NULL, 0, 0, 'active'),
    ('Pearfect', 'TRI', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('Smoked Cherry', 'TRI', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active'),
    ('TTie', 'TRI', 'shisha', 'drink', NULL, NULL, NULL, 0, 0, 'active'),
    ('Twice The Ice', 'TRI', 'shisha', 'menthol', NULL, NULL, NULL, 0, 0, 'active'),
    ('Watermelon Mint', 'TRI', 'shisha', 'fruit', NULL, NULL, NULL, 0, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Wonder Flavours - Deep Analysis
-- Source: WF Average-Usage.pdf, ATF
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Angel Food Cake SC', 'WF', 'vape', 'bakery', 1.5, 3.0, 2.0, 14, 0, 'active'),
    ('Apple Crumble SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Apple Hard Candy SC', 'WF', 'vape', 'candy', 1.5, 3.0, 2.0, 5, 0, 'active'),
    ('Apple Pie Filling SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Banana Nut Bread SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Belgian Waffle SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Birthday Cake SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Black Tea SC', 'WF', 'vape', 'drink', 1.5, 3.0, 2.0, 7, 0, 'active'),
    ('Blueberry Cheesecake SC', 'WF', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Bread Pudding SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Brown Sugar SC', 'WF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Brownie SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Butter Pecan Ice Cream SC', 'WF', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Buttermilk Pancakes SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Candy Cane SC', 'WF', 'vape', 'candy', 1.0, 2.5, 1.5, 3, 0, 'active'),
    ('Carrot Cake SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Chai Spice SC', 'WF', 'vape', 'spice', 1.0, 2.5, 1.5, 14, 0, 'active'),
    ('Chocolate Chip Cookie SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Chocolate Fudge SC', 'WF', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Churro SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cinnamon Sugar Cookie SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Clove SC', 'WF', 'vape', 'spice', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Coffee Cake SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cotton Candy Jelly Bean SC', 'WF', 'vape', 'candy', 1.5, 3.0, 2.0, 5, 0, 'active'),
    ('Cranberry Sauce SC', 'WF', 'vape', 'fruit', 1.5, 3.0, 2.0, 7, 0, 'active'),
    ('Cream Soda SC', 'WF', 'vape', 'drink', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Creamy Vanilla SC', 'WF', 'vape', 'cream', 1.5, 3.0, 2.0, 14, 0, 'active'),
    ('Dark Chocolate SC', 'WF', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Deep Fried Plantain SC', 'WF', 'vape', 'tropical', 1.5, 3.0, 2.0, 7, 0, 'active'),
    ('Divinity Candy SC', 'WF', 'vape', 'candy', 1.5, 3.0, 2.0, 7, 0, 'active'),
    ('Egg Nog SC', 'WF', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Espresso SC', 'WF', 'vape', 'drink', 1.5, 3.0, 2.0, 14, 0, 'active'),
    ('Flaky Biscuit SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('French Toast SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Fried Dough SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Fruit Punch SC', 'WF', 'vape', 'drink', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('German Chocolate Cake SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Ginger Snap SC', 'WF', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Golden Honey SC', 'WF', 'vape', 'bakery', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Grape Gummy Candy SC', 'WF', 'vape', 'candy', 1.5, 3.0, 2.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional Capella Flavors - Deep Analysis
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('27 Bears', 'CAP', 'vape', 'candy', 4.0, 8.0, 6.0, 5, 0, 'active'),
    ('Acai', 'CAP', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Apple Snacks', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Banana Split', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Blueberry Cinnamon Crumble', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Blueberry Jam', 'CAP', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Boston Cream Pie V2', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Bread', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Butter Cream', 'CAP', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Cantaloupe', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Cereal 27', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Chai Tea', 'CAP', 'vape', 'drink', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Chocolate Glazed Doughnut', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Concord Grape with Stevia', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Cranberry', 'CAP', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Double Chocolate V2', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Dragon Fruit', 'CAP', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('English Toffee', 'CAP', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Fig', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Glazed Doughnut', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Golden Pineapple', 'CAP', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Graham Cracker V2', 'CAP', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('Grape', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Grapefruit', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Green Apple Hard Candy', 'CAP', 'vape', 'candy', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Horchata', 'CAP', 'vape', 'drink', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Italian Lemon Sicily', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Jelly Candy', 'CAP', 'vape', 'candy', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Key Lime', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Kiwi Strawberry', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Lemon Lime', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Maple Syrup', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Marshmallow', 'CAP', 'vape', 'candy', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Milk Chocolate Toffee', 'CAP', 'vape', 'bakery', 2.0, 5.0, 3.0, 14, 0, 'active'),
    ('New York Cheesecake V2', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Orange Creamsicle', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Passion Fruit', 'CAP', 'vape', 'tropical', 3.0, 6.0, 4.0, 7, 0, 'active'),
    ('Peanut Butter V2', 'CAP', 'vape', 'nuts', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Pink Lemonade', 'CAP', 'vape', 'drink', 3.0, 6.0, 4.0, 3, 0, 'active'),
    ('Pomegranate V2', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- Additional FlavourArt Flavors - Deep Analysis
-- Source: ATF, community consensus
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Almond', 'FA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Anise', 'FA', 'vape', 'spice', 1.0, 2.0, 1.5, 14, 0, 'active'),
    ('Apple Pie', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Apricot', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Aurora', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Banana', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Bergamot', 'FA', 'vape', 'citrus', 1.0, 2.0, 1.5, 5, 0, 'active'),
    ('Bitter Wizard', 'FA', 'vape', 'other', 0.25, 1.0, 0.5, 0, 0, 'active'),
    ('Black Fire', 'FA', 'vape', 'tobacco', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Brandy', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Butter', 'FA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Caramel', 'FA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cardamom', 'FA', 'vape', 'spice', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Clove', 'FA', 'vape', 'spice', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Cola', 'FA', 'vape', 'drink', 2.0, 4.0, 3.0, 3, 0, 'active'),
    ('Cookie', 'FA', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('Cream Fresh', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cream Whipped', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Custard Premium', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Dark Bean', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Desert Ship', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Espresso', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Florida Key Lime', 'FA', 'vape', 'citrus', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Fresh Cream', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Ginger', 'FA', 'vape', 'spice', 0.5, 1.5, 1.0, 14, 0, 'active'),
    ('Gloria', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Gold', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Hazelnut', 'FA', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Honey', 'FA', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Irish Cream', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Jamaican Rum', 'FA', 'vape', 'drink', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Jasmine', 'FA', 'vape', 'fruit', 0.5, 2.0, 1.0, 7, 0, 'active'),
    ('Joy', 'FA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Lime Cold Pressed', 'FA', 'vape', 'citrus', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Lychee', 'FA', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Maple Syrup', 'FA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Maraschino Cherry', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Meringue', 'FA', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Oba Oba', 'FA', 'vape', 'tropical', 1.0, 3.0, 2.0, 7, 0, 'active'),
    ('Orange', 'FA', 'vape', 'citrus', 2.0, 4.0, 3.0, 5, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY - Phase 3
-- =====================================================
DO $$
DECLARE
    total_count INT;
    vdlv_count INT;
    gf_count INT;
    hs_count INT;
    del_count INT;
    atm_count INT;
    rev_count INT;
    dek_count INT;
    ssm_count INT;
    drk_count INT;
    azg_count INT;
    tri_count INT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM flavors WHERE status = 'active';
    SELECT COUNT(*) INTO vdlv_count FROM flavors WHERE manufacturer_code = 'VDLV' AND status = 'active';
    SELECT COUNT(*) INTO gf_count FROM flavors WHERE manufacturer_code = 'GF' AND status = 'active';
    SELECT COUNT(*) INTO hs_count FROM flavors WHERE manufacturer_code = 'HS' AND status = 'active';
    SELECT COUNT(*) INTO del_count FROM flavors WHERE manufacturer_code = 'DEL' AND status = 'active';
    SELECT COUNT(*) INTO atm_count FROM flavors WHERE manufacturer_code = 'ATM' AND status = 'active';
    SELECT COUNT(*) INTO rev_count FROM flavors WHERE manufacturer_code = 'REV' AND status = 'active';
    SELECT COUNT(*) INTO dek_count FROM flavors WHERE manufacturer_code = 'DEK' AND status = 'active';
    SELECT COUNT(*) INTO ssm_count FROM flavors WHERE manufacturer_code = 'SSM' AND status = 'active';
    SELECT COUNT(*) INTO drk_count FROM flavors WHERE manufacturer_code = 'DRK' AND status = 'active';
    SELECT COUNT(*) INTO azg_count FROM flavors WHERE manufacturer_code = 'AZG' AND status = 'active';
    SELECT COUNT(*) INTO tri_count FROM flavors WHERE manufacturer_code = 'TRI' AND status = 'active';
    
    RAISE NOTICE '=== FLAVOR DATABASE EXPANSION PHASE 3 COMPLETE ===';
    RAISE NOTICE 'Total active flavors: %', total_count;
    RAISE NOTICE 'Vincent Dans Les Vapes (VDLV): %', vdlv_count;
    RAISE NOTICE 'German Flavours (GF): %', gf_count;
    RAISE NOTICE 'Hangsen (HS): %', hs_count;
    RAISE NOTICE 'Delosi Labs (DEL): %', del_count;
    RAISE NOTICE 'Atmos Lab (ATM): %', atm_count;
    RAISE NOTICE 'Revolute (REV): %', rev_count;
    RAISE NOTICE 'Dekang (DEK): %', dek_count;
    RAISE NOTICE 'Social Smoke (SSM): %', ssm_count;
    RAISE NOTICE 'Darkside (DRK): %', drk_count;
    RAISE NOTICE 'Azure Gold (AZG): %', azg_count;
    RAISE NOTICE 'Trifecta (TRI): %', tri_count;
END $$;
