-- Migration: Seed 10 test flavors
-- Date: 2026-02-09
-- Purpose: Add 10 test flavors (5 vape + 5 shisha) for testing

-- =====================================================
-- Seed 10 test flavors
-- =====================================================

INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    -- VAPE flavors (5)
    ('Strawberry Ripe', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 'active'),
    ('Bavarian Cream', 'CAP', 'vape', 'cream', 3.0, 6.0, 4.5, 14, 'active'),
    ('Catania', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 'active'),
    ('Vanilla Custard', 'CAP', 'vape', 'dessert', 4.0, 8.0, 6.0, 14, 'active'),
    ('Cool Mint', 'TPA', 'vape', 'menthol', 2.0, 5.0, 3.0, 3, 'active'),
    
    -- SHISHA flavors (5)
    ('Double Apple', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Mint', 'ALF', 'shisha', 'menthol', NULL, NULL, NULL, 0, 'active'),
    ('Love 66', 'ADA', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active'),
    ('Grape Mint', 'ALF', 'shisha', 'fruit', NULL, NULL, NULL, 0, 'active'),
    ('Blue Mist', 'STB', 'shisha', 'mix', NULL, NULL, NULL, 0, 'active')
ON CONFLICT (name, manufacturer_code) DO NOTHING;

-- Verification
DO $$
DECLARE
    vape_count INT;
    shisha_count INT;
BEGIN
    SELECT COUNT(*) INTO vape_count FROM flavors WHERE product_type = 'vape' AND status = 'active';
    SELECT COUNT(*) INTO shisha_count FROM flavors WHERE product_type = 'shisha' AND status = 'active';
    RAISE NOTICE 'Migration completed: % vape flavors, % shisha flavors seeded', vape_count, shisha_count;
END $$;
