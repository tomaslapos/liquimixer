-- Migration: Seed EU manufacturer flavors
-- Date: 2026-02-10
-- Purpose: Add popular flavors from EU manufacturers
-- Note: Most of these are Shake & Vape or ready-to-vape, so percentages are NULL

-- =====================================================
-- PART 1: Imperia Black Label (CZ) - Kompletní řada
-- Zdroj: eliquidshop.cz - doporučené dávkování 2-3%
-- =====================================================

-- Příchutě již existují, jen aktualizujeme na správné hodnoty
UPDATE flavors SET 
    min_percent = 2.0, 
    max_percent = 3.0, 
    recommended_percent = 2.5
WHERE manufacturer_code = 'IMP';

-- =====================================================
-- PART 2: Vampire Vape (UK) - Populární příchutě
-- Zdroj: vampirevape.co.uk - 10-20%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Heisenberg', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Pinkman', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Black Ice', 'VV', 'vape', 'menthol', 10.0, 20.0, 15.0, 3, 0, 'active'),
    ('Blood Sukka', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Bat Juice', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Strawberry Milkshake', 'VV', 'vape', 'cream', 10.0, 20.0, 15.0, 14, 0, 'active'),
    ('Vanilla Tobacco', 'VV', 'vape', 'tobacco', 10.0, 20.0, 15.0, 21, 0, 'active'),
    ('Sherbet Lemon', 'VV', 'vape', 'candy', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Catapult', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Dawn', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Dusk', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Berry Menthol', 'VV', 'vape', 'menthol', 10.0, 20.0, 15.0, 3, 0, 'active'),
    ('Strawberry & Kiwi', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Koncept XIX Smooth Weston', 'VV', 'vape', 'tobacco', 10.0, 20.0, 15.0, 21, 0, 'active'),
    ('Applelicious', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Cool Red Lips', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Parma Violets', 'VV', 'vape', 'candy', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Bubblegum', 'VV', 'vape', 'candy', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Banana', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active'),
    ('Grape', 'VV', 'vape', 'fruit', 10.0, 20.0, 15.0, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO UPDATE SET
    min_percent = EXCLUDED.min_percent,
    max_percent = EXCLUDED.max_percent,
    recommended_percent = EXCLUDED.recommended_percent;

-- =====================================================
-- PART 3: Dinner Lady (UK) - Shake & Vape (NULL %)
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Lemon Tart', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Strawberry Macaroon', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Blackberry Crumble', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Orange Tart', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Berry Tart', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Apple Pie', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Mango Tart', 'DDL', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Watermelon Slices', 'DDL', 'vape', 'candy', NULL, NULL, NULL, 7, 0, 'active'),
    ('Strawberry Bikini', 'DDL', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Lemon Sherbets', 'DDL', 'vape', 'candy', NULL, NULL, NULL, 7, 0, 'active'),
    ('Pink Berry', 'DDL', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Blue Menthol', 'DDL', 'vape', 'menthol', NULL, NULL, NULL, 3, 0, 'active'),
    ('Tropical Fruits', 'DDL', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Mint Tobacco', 'DDL', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active'),
    ('Smooth Tobacco', 'DDL', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 4: Nasty Juice (MY) - Shake & Vape (NULL %)
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Cush Man', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Slow Blow', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Bad Blood', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Wicked Haze', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Green Ape', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Devil Teeth', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Fat Boy', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Trap Queen', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Yummy Fruity', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Asap Grape', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Bloody Berry', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Hippie Trail', 'NTJ', 'vape', 'menthol', NULL, NULL, NULL, 3, 0, 'active'),
    ('Mango Banana', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Strawberry Kiwi', 'NTJ', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 5: T-Juice (UK) - Koncentráty
-- Zdroj: t-juice.com - doporučeno 10-15%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Red Astaire', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('Green Steam', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('Colonel Custard', 'TJC', 'vape', 'cream', 10.0, 15.0, 12.0, 14, 0, 'active'),
    ('Strawberri', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('Forest Affair', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('Tobacco Bastards No.21', 'TJC', 'vape', 'tobacco', 10.0, 15.0, 12.0, 21, 0, 'active'),
    ('Tobacco Bastards No.37', 'TJC', 'vape', 'tobacco', 10.0, 15.0, 12.0, 21, 0, 'active'),
    ('Fruits Rouges', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('High Voltage', 'TJC', 'vape', 'fruit', 10.0, 15.0, 12.0, 7, 0, 'active'),
    ('Mint Glacier', 'TJC', 'vape', 'menthol', 10.0, 15.0, 12.0, 3, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 6: Infamous (HR) - Shake & Vape (NULL %)
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Ninja Warrior', 'INF', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Slavs', 'INF', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Gold MZ', 'INF', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active'),
    ('NOID Mixology', 'INF', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Liqonic', 'INF', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Drops', 'INF', 'vape', 'candy', NULL, NULL, NULL, 7, 0, 'active'),
    ('Elixir', 'INF', 'vape', 'mix', NULL, NULL, NULL, 7, 0, 'active'),
    ('Originals', 'INF', 'vape', 'mix', NULL, NULL, NULL, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 7: Monkey Liquid (CZ) - Shake & Vape (NULL %)
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Monkey Fruit', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Strawberry Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Tropical Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Banana Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Apple Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Grape Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Mango Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Kiwi Monkey', 'MON', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Menthol Monkey', 'MON', 'vape', 'menthol', NULL, NULL, NULL, 3, 0, 'active'),
    ('Tobacco Monkey', 'MON', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 8: PJ Empire (AT) - Shake & Vape (NULL %)
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Slushy Queen Blueberry', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Slushy Queen Strawberry', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Slushy Queen Watermelon', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('No Limits Mango', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Cream Queen Blueberry', 'PJE', 'vape', 'cream', NULL, NULL, NULL, 14, 0, 'active'),
    ('Cream Queen Strawberry', 'PJE', 'vape', 'cream', NULL, NULL, NULL, 14, 0, 'active'),
    ('Signature Line Apple', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Flip Flop Lychee', 'PJE', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 9: Just Juice (UK) - Koncentráty 15-20%
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Exotic Fruits Cherimoya Grapefruit', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active'),
    ('Exotic Fruits Lulo & Citrus', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active'),
    ('Exotic Fruits Mango & Passionfruit', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active'),
    ('Ice Exotic Fruits', 'JJC', 'vape', 'menthol', 15.0, 20.0, 17.0, 3, 0, 'active'),
    ('Wild Berries Aniseed', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active'),
    ('Fusion Berry Burst', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active'),
    ('Tobacco Vanilla', 'JJC', 'vape', 'tobacco', 15.0, 20.0, 17.0, 21, 0, 'active'),
    ('Strawberry Curuba', 'JJC', 'vape', 'fruit', 15.0, 20.0, 17.0, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 10: Charlies Chalk Dust (US) - Shake & Vape
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Head Bangin Boogie', 'CCD', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Jam Rock', 'CCD', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Black & White Ice Cream', 'CCD', 'vape', 'cream', NULL, NULL, NULL, 14, 0, 'active'),
    ('Campfire', 'CCD', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active'),
    ('Pacha Mama Fuji', 'CCD', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Pacha Mama Strawberry', 'CCD', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Pacha Mama Mango Pitaya', 'CCD', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Big Belly Jelly', 'CCD', 'vape', 'candy', NULL, NULL, NULL, 7, 0, 'active'),
    ('Mr. Meringue', 'CCD', 'vape', 'dessert', NULL, NULL, NULL, 14, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- PART 11: Aramax (CZ/Ritchy) - Koncentráty
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    ('Sahara Tobacco', 'ARA', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active'),
    ('Classic Tobacco', 'ARA', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active'),
    ('Virginia Tobacco', 'ARA', 'vape', 'tobacco', NULL, NULL, NULL, 21, 0, 'active'),
    ('Strawberry', 'ARA', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Blueberry', 'ARA', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Menthol', 'ARA', 'vape', 'menthol', NULL, NULL, NULL, 3, 0, 'active'),
    ('Apple', 'ARA', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active'),
    ('Coffee', 'ARA', 'vape', 'drink', NULL, NULL, NULL, 7, 0, 'active'),
    ('Vanilla', 'ARA', 'vape', 'cream', NULL, NULL, NULL, 14, 0, 'active'),
    ('Max Watermelon', 'ARA', 'vape', 'fruit', NULL, NULL, NULL, 7, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    total_flavors INT;
    null_percent_count INT;
    active_count INT;
BEGIN
    SELECT COUNT(*) INTO total_flavors FROM flavors;
    SELECT COUNT(*) INTO null_percent_count FROM flavors WHERE recommended_percent IS NULL;
    SELECT COUNT(*) INTO active_count FROM flavors WHERE status = 'active';
    
    RAISE NOTICE '=== SOUHRN PRICHUTI ===';
    RAISE NOTICE 'Celkem prichuti: %', total_flavors;
    RAISE NOTICE 'Prichuti bez pct (NULL): %', null_percent_count;
    RAISE NOTICE 'Aktivnich prichuti: %', active_count;
END $$;
