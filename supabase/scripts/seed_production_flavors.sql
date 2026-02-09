-- ============================================
-- SEED PRODUCTION FLAVORS (3000+)
-- Date: 2026-02-09
-- 
-- This script seeds the production flavor database
-- with ~3000 flavors from various manufacturers.
--
-- Structure:
-- - ~40 manufacturers (vape + shisha)
-- - ~1800 vape flavors
-- - ~1200 shisha flavors
-- ============================================

-- =====================================================
-- PART 1: Additional Manufacturers
-- =====================================================

INSERT INTO flavor_manufacturers (code, name, country_code, type, website) VALUES
    -- Additional VAPE manufacturers
    ('VTA', 'VapeTrain Australia', 'AU', 'vape', 'https://vapetrainaustralia.com'),
    ('PUR', 'Purilum', 'US', 'vape', 'https://purilum.com'),
    ('JF', 'Jungle Flavors', 'US', 'vape', 'https://jungleflavors.com'),
    ('NF', 'Nature''s Flavors', 'US', 'vape', 'https://naturesflavors.com'),
    ('HS', 'Hangsen', 'CN', 'vape', 'https://hangsen.com'),
    ('DEL', 'Delosi Labs', 'US', 'vape', 'https://delosilabs.com'),
    ('OOO', 'One On One', 'US', 'vape', NULL),
    ('RF', 'Real Flavors', 'US', 'vape', NULL),
    ('SC', 'Super Concentrates', 'US', 'vape', NULL),
    ('LA', 'LorAnn', 'US', 'vape', 'https://lorannoils.com'),
    ('MF', 'Medicine Flower', 'US', 'vape', 'https://medicineflower.com'),
    ('VT', 'Vape Train', 'AU', 'vape', NULL),
    ('EUR', 'Euro Flavor', 'DE', 'vape', NULL),
    ('CHE', 'Chemnovatic', 'PL', 'vape', 'https://chemnovatic.com'),
    ('SLB', 'Solubarome', 'FR', 'vape', 'https://solubarome.com'),
    ('VZ', 'VZ GodZ', 'AU', 'vape', NULL),
    
    -- Additional SHISHA manufacturers
    ('77S', '77 Shisha', 'DE', 'shisha', NULL),
    ('HAZ', 'Haze', 'US', 'shisha', 'https://hazetobacco.com'),
    ('SOC', 'Social Smoke', 'US', 'shisha', 'https://socialsmoke.com'),
    ('OHR', 'O''s Tobacco (Holster)', 'DE', 'shisha', NULL),
    ('TAB', 'Taboo', 'RU', 'shisha', NULL),
    ('ZOM', 'Zomo', 'BR', 'shisha', NULL),
    ('NOR', 'Norwegian Tobacco', 'NO', 'shisha', NULL),
    ('7DY', '7 Days', 'DE', 'shisha', NULL),
    ('APP', 'Appolo', 'TR', 'shisha', NULL),
    ('AFZ', 'Afzal', 'IN', 'shisha', NULL),
    ('ARG', 'Argelini', 'TR', 'shisha', NULL)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PART 2: Vape Flavors (Sample - expand for full 1800)
-- =====================================================

-- TPA (The Flavor Apprentice) - Popular flavors
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Strawberry', 'TPA', 'vape', 'fruit', 3.0, 8.0, 5.0, 7, 'active'),
    ('Vanilla Swirl', 'TPA', 'vape', 'cream', 2.0, 5.0, 3.0, 14, 'active'),
    ('Banana Cream', 'TPA', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 'active'),
    ('Dragonfruit', 'TPA', 'vape', 'tropical', 3.0, 7.0, 5.0, 7, 'active'),
    ('Honeydew', 'TPA', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 'active'),
    ('Peach Juicy', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 'active'),
    ('Watermelon', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 5, 'active'),
    ('Grape Candy', 'TPA', 'vape', 'candy', 3.0, 6.0, 4.0, 3, 'active'),
    ('Cotton Candy', 'TPA', 'vape', 'candy', 3.0, 8.0, 5.0, 3, 'active'),
    ('Cheesecake Graham Crust', 'TPA', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 'active'),
    ('Vanilla Bean Ice Cream', 'TPA', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 'active'),
    ('Kentucky Bourbon', 'TPA', 'vape', 'drink', 2.0, 5.0, 3.0, 21, 'active'),
    ('RY4 Double', 'TPA', 'vape', 'tobacco', 3.0, 6.0, 4.0, 28, 'active'),
    ('Turkish', 'TPA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 28, 'active'),
    ('Koolada', 'TPA', 'vape', 'menthol', 0.5, 2.0, 1.0, 0, 'active'),
    ('Sweetener', 'TPA', 'vape', 'candy', 0.5, 2.0, 1.0, 0, 'active'),
    ('Marshmallow', 'TPA', 'vape', 'candy', 2.0, 5.0, 3.0, 7, 'active'),
    ('Blueberry Extra', 'TPA', 'vape', 'berry', 3.0, 7.0, 5.0, 7, 'active'),
    ('Raspberry Sweet', 'TPA', 'vape', 'berry', 3.0, 6.0, 4.0, 7, 'active'),
    ('Bavarian Cream', 'TPA', 'vape', 'cream', 2.0, 4.0, 3.0, 14, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- CAP (Capella) - Popular flavors
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Vanilla Custard V1', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.5, 21, 'active'),
    ('Vanilla Custard V2', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.5, 21, 'active'),
    ('Sweet Strawberry', 'CAP', 'vape', 'fruit', 3.0, 7.0, 5.0, 7, 'active'),
    ('Sugar Cookie', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 'active'),
    ('Graham Cracker V2', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 'active'),
    ('Butter Cream', 'CAP', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 'active'),
    ('NY Cheesecake', 'CAP', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 'active'),
    ('Glazed Donut', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 'active'),
    ('Golden Butter', 'CAP', 'vape', 'bakery', 0.5, 2.0, 1.0, 14, 'active'),
    ('Super Sweet', 'CAP', 'vape', 'candy', 0.25, 1.0, 0.5, 0, 'active'),
    ('27 Bears', 'CAP', 'vape', 'candy', 4.0, 8.0, 6.0, 5, 'active'),
    ('Lemon Sicily', 'CAP', 'vape', 'citrus', 2.0, 4.0, 3.0, 5, 'active'),
    ('Sweet Tangerine', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.0, 5, 'active'),
    ('Juicy Peach', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.0, 7, 'active'),
    ('Harvest Berry', 'CAP', 'vape', 'berry', 3.0, 6.0, 4.5, 7, 'active'),
    ('Blueberry Cinnamon Crumble', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.0, 14, 'active'),
    ('Apple Pie', 'CAP', 'vape', 'bakery', 3.0, 6.0, 4.0, 14, 'active'),
    ('Banana', 'CAP', 'vape', 'fruit', 3.0, 5.0, 4.0, 7, 'active'),
    ('Chocolate Fudge Brownie', 'CAP', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 'active'),
    ('Cinnamon Danish Swirl', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- FA (FlavourArt) - Popular flavors
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Fuji Apple', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Cream Fresh', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 'active'),
    ('Meringue', 'FA', 'vape', 'dessert', 1.0, 2.5, 1.5, 7, 'active'),
    ('Forest Fruit', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 'active'),
    ('Kiwi', 'FA', 'vape', 'tropical', 1.5, 3.0, 2.0, 5, 'active'),
    ('Mango', 'FA', 'vape', 'tropical', 2.0, 4.0, 3.0, 5, 'active'),
    ('Polar Blast', 'FA', 'vape', 'menthol', 0.5, 1.5, 1.0, 0, 'active'),
    ('Bilberry', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 'active'),
    ('Cookie', 'FA', 'vape', 'bakery', 1.5, 3.0, 2.0, 14, 'active'),
    ('Joy', 'FA', 'vape', 'dessert', 1.0, 2.5, 1.5, 14, 'active'),
    ('Vienna Cream', 'FA', 'vape', 'cream', 1.0, 2.0, 1.5, 14, 'active'),
    ('Custard Premium', 'FA', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 'active'),
    ('Jamaican Rum', 'FA', 'vape', 'drink', 1.0, 2.5, 1.5, 14, 'active'),
    ('Soho', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 28, 'active'),
    ('7 Leaves Ultimate', 'FA', 'vape', 'tobacco', 1.5, 3.0, 2.0, 28, 'active'),
    ('Strawberry', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Lemon Sicily', 'FA', 'vape', 'citrus', 1.0, 2.5, 1.5, 3, 'active'),
    ('Pear', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Juicy Strawberry', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Tiramisu', 'FA', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- FLV (Flavorah) - Popular flavors
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Cream', 'FLV', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 'active'),
    ('Vanilla Custard', 'FLV', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 'active'),
    ('Strawberry', 'FLV', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 'active'),
    ('Red Cinnamon', 'FLV', 'vape', 'spice', 0.5, 1.5, 1.0, 3, 'active'),
    ('Rich Cinnamon', 'FLV', 'vape', 'spice', 0.5, 1.5, 1.0, 7, 'active'),
    ('Watermelon', 'FLV', 'vape', 'fruit', 1.0, 2.5, 1.5, 3, 'active'),
    ('Mango', 'FLV', 'vape', 'tropical', 1.0, 2.5, 1.5, 5, 'active'),
    ('Pink Guava', 'FLV', 'vape', 'tropical', 0.5, 2.0, 1.0, 5, 'active'),
    ('Vanilla Pudding', 'FLV', 'vape', 'dessert', 1.0, 3.0, 2.0, 14, 'active'),
    ('Frosting', 'FLV', 'vape', 'bakery', 0.5, 1.5, 1.0, 7, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- INW (Inawera) - Popular flavors
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Yes We Cheesecake', 'INW', 'vape', 'dessert', 2.0, 5.0, 3.0, 21, 'active'),
    ('Biscuit', 'INW', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 'active'),
    ('Shisha Strawberry', 'INW', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Marzipan', 'INW', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 'active'),
    ('Cactus', 'INW', 'vape', 'tropical', 0.5, 2.0, 1.0, 3, 'active'),
    ('Raspberry', 'INW', 'vape', 'berry', 1.0, 3.0, 2.0, 5, 'active'),
    ('Eucalyptus Mint', 'INW', 'vape', 'menthol', 0.5, 1.5, 1.0, 0, 'active'),
    ('Dark for Pipe', 'INW', 'vape', 'tobacco', 2.0, 4.0, 3.0, 28, 'active'),
    ('AM4A', 'INW', 'vape', 'tobacco', 2.0, 5.0, 3.0, 28, 'active'),
    ('Custard', 'INW', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 3: Shisha Flavors (Sample - expand for full 1200)
-- =====================================================

-- Al Fakher (ALF)
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Two Apples', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Watermelon Mint', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Peach', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Lemon Mint', 'ALF', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Orange', 'ALF', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Grapefruit Mint', 'ALF', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Blueberry Mint', 'ALF', 'shisha', 'berry', NULL, NULL, NULL, 0, 'active'),
    ('Strawberry', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Mango', 'ALF', 'shisha', 'tropical', NULL, NULL, NULL, 0, 'active'),
    ('Gum', 'ALF', 'shisha', 'candy', NULL, NULL, NULL, 0, 'active'),
    ('Cola', 'ALF', 'shisha', 'drink', NULL, NULL, NULL, 0, 'active'),
    ('Coffee', 'ALF', 'shisha', 'drink', NULL, NULL, NULL, 0, 'active'),
    ('Vanilla', 'ALF', 'shisha', 'cream', NULL, NULL, NULL, 0, 'active'),
    ('Rose', 'ALF', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Kiwi', 'ALF', 'shisha', 'tropical', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- Adalya (ADA)
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Lady Killer', 'ADA', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Hawaii', 'ADA', 'shisha', 'tropical', NULL, NULL, NULL, 0, 'active'),
    ('Ice Bonbon', 'ADA', 'shisha', 'candy', NULL, NULL, NULL, 0, 'active'),
    ('Baku Nights', 'ADA', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Blueberry Mint', 'ADA', 'shisha', 'berry', NULL, NULL, NULL, 0, 'active'),
    ('Orange Mint', 'ADA', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Strawberry Banana Ice', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Melon', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Watermelon', 'ADA', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Peach Ice Tea', 'ADA', 'shisha', 'drink', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- Starbuzz (STB)
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Blue Mist', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Sex on the Beach', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Code 69', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Pirates Cave', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Margarita Freeze', 'STB', 'shisha', 'drink', NULL, NULL, NULL, 0, 'active'),
    ('Citrus Mint', 'STB', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Pink', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Safari Melon Dew', 'STB', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Lebanese Bomb Shell', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Blackberry', 'STB', 'shisha', 'berry', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- Fumari (FUM)
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('White Gummi Bear', 'FUM', 'shisha', 'candy', NULL, NULL, NULL, 0, 'active'),
    ('Ambrosia', 'FUM', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Blueberry Muffin', 'FUM', 'shisha', 'bakery', NULL, NULL, NULL, 0, 'active'),
    ('Lemon Mint', 'FUM', 'shisha', 'citrus', NULL, NULL, NULL, 0, 'active'),
    ('Spiced Chai', 'FUM', 'shisha', 'spice', NULL, NULL, NULL, 0, 'active'),
    ('Tropical Punch', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 'active'),
    ('Mint Chocolate Chill', 'FUM', 'shisha', 'dessert', NULL, NULL, NULL, 0, 'active'),
    ('Red Gummi Bear', 'FUM', 'shisha', 'candy', NULL, NULL, NULL, 0, 'active'),
    ('Island Papaya', 'FUM', 'shisha', 'tropical', NULL, NULL, NULL, 0, 'active'),
    ('French Vanilla', 'FUM', 'shisha', 'cream', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- Darkside (DRK)
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    ('Falling Star', 'DRK', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Cosmo Flower', 'DRK', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Bananapapa', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Dark Mint', 'DRK', 'shisha', 'menthol', NULL, NULL, NULL, 0, 'active'),
    ('Polar Cream', 'DRK', 'shisha', 'cream', NULL, NULL, NULL, 0, 'active'),
    ('Grape Core', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Supernova', 'DRK', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Kalee Grap', 'DRK', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Hola', 'DRK', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Needls', 'DRK', 'shisha', 'menthol', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    total_manufacturers INT;
    total_vape INT;
    total_shisha INT;
BEGIN
    SELECT COUNT(*) INTO total_manufacturers FROM flavor_manufacturers;
    SELECT COUNT(*) INTO total_vape FROM flavors WHERE product_type = 'vape' AND status = 'active';
    SELECT COUNT(*) INTO total_shisha FROM flavors WHERE product_type = 'shisha' AND status = 'active';
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SEED COMPLETED';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Total manufacturers: %', total_manufacturers;
    RAISE NOTICE 'Total vape flavors: %', total_vape;
    RAISE NOTICE 'Total shisha flavors: %', total_shisha;
    RAISE NOTICE 'TOTAL FLAVORS: %', total_vape + total_shisha;
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: This is a sample seed. For full 3000 flavors,';
    RAISE NOTICE 'extend this script or import from external sources.';
END $$;
