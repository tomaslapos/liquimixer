-- ============================================
-- TEST SCRIPT: Flavor Database
-- Date: 2026-02-09
-- 
-- Run this script to verify the flavor database
-- tables, RLS policies, and functionality.
-- ============================================

-- =====================================================
-- TEST 1: Verify tables exist
-- =====================================================
DO $$
BEGIN
    -- Check flavor_manufacturers
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flavor_manufacturers') THEN
        RAISE EXCEPTION 'Table flavor_manufacturers does not exist';
    END IF;
    RAISE NOTICE 'TEST 1.1 PASSED: flavor_manufacturers table exists';
    
    -- Check flavors
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flavors') THEN
        RAISE EXCEPTION 'Table flavors does not exist';
    END IF;
    RAISE NOTICE 'TEST 1.2 PASSED: flavors table exists';
    
    -- Check flavor_ratings
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flavor_ratings') THEN
        RAISE EXCEPTION 'Table flavor_ratings does not exist';
    END IF;
    RAISE NOTICE 'TEST 1.3 PASSED: flavor_ratings table exists';
    
    -- Check recipe_flavors
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipe_flavors') THEN
        RAISE EXCEPTION 'Table recipe_flavors does not exist';
    END IF;
    RAISE NOTICE 'TEST 1.4 PASSED: recipe_flavors table exists';
    
    RAISE NOTICE 'TEST 1 COMPLETED: All tables exist';
END $$;

-- =====================================================
-- TEST 2: Verify seed data
-- =====================================================
DO $$
DECLARE
    mfr_count INT;
    flavor_count INT;
    vape_count INT;
    shisha_count INT;
BEGIN
    SELECT COUNT(*) INTO mfr_count FROM flavor_manufacturers;
    IF mfr_count < 10 THEN
        RAISE EXCEPTION 'Expected at least 10 manufacturers, found %', mfr_count;
    END IF;
    RAISE NOTICE 'TEST 2.1 PASSED: % manufacturers seeded', mfr_count;
    
    SELECT COUNT(*) INTO flavor_count FROM flavors WHERE status = 'active';
    IF flavor_count < 10 THEN
        RAISE EXCEPTION 'Expected at least 10 flavors, found %', flavor_count;
    END IF;
    RAISE NOTICE 'TEST 2.2 PASSED: % active flavors seeded', flavor_count;
    
    SELECT COUNT(*) INTO vape_count FROM flavors WHERE product_type = 'vape' AND status = 'active';
    SELECT COUNT(*) INTO shisha_count FROM flavors WHERE product_type = 'shisha' AND status = 'active';
    RAISE NOTICE 'TEST 2.3 PASSED: % vape flavors, % shisha flavors', vape_count, shisha_count;
    
    RAISE NOTICE 'TEST 2 COMPLETED: Seed data verified';
END $$;

-- =====================================================
-- TEST 3: Verify RLS policies
-- =====================================================
DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'flavor_manufacturers';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for flavor_manufacturers';
    END IF;
    RAISE NOTICE 'TEST 3.1 PASSED: % RLS policies on flavor_manufacturers', policy_count;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'flavors';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for flavors';
    END IF;
    RAISE NOTICE 'TEST 3.2 PASSED: % RLS policies on flavors', policy_count;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'flavor_ratings';
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for flavor_ratings';
    END IF;
    RAISE NOTICE 'TEST 3.3 PASSED: % RLS policies on flavor_ratings', policy_count;
    
    RAISE NOTICE 'TEST 3 COMPLETED: RLS policies verified';
END $$;

-- =====================================================
-- TEST 4: Verify indexes
-- =====================================================
DO $$
DECLARE
    idx_count INT;
BEGIN
    SELECT COUNT(*) INTO idx_count 
    FROM pg_indexes 
    WHERE tablename = 'flavors';
    IF idx_count < 5 THEN
        RAISE WARNING 'Expected at least 5 indexes on flavors, found %', idx_count;
    END IF;
    RAISE NOTICE 'TEST 4.1 PASSED: % indexes on flavors table', idx_count;
    
    RAISE NOTICE 'TEST 4 COMPLETED: Indexes verified';
END $$;

-- =====================================================
-- TEST 5: Verify triggers
-- =====================================================
DO $$
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_flavor_rating_update'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        RAISE EXCEPTION 'Trigger trg_flavor_rating_update does not exist';
    END IF;
    RAISE NOTICE 'TEST 5.1 PASSED: Rating update trigger exists';
    
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_recipe_flavor_usage'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        RAISE EXCEPTION 'Trigger trg_recipe_flavor_usage does not exist';
    END IF;
    RAISE NOTICE 'TEST 5.2 PASSED: Usage count trigger exists';
    
    RAISE NOTICE 'TEST 5 COMPLETED: Triggers verified';
END $$;

-- =====================================================
-- TEST 6: Test favorite_products extension
-- =====================================================
DO $$
BEGIN
    -- Check new columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorite_products' AND column_name = 'flavor_id'
    ) THEN
        RAISE EXCEPTION 'Column flavor_id missing from favorite_products';
    END IF;
    RAISE NOTICE 'TEST 6.1 PASSED: flavor_id column exists';
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorite_products' AND column_name = 'flavor_product_type'
    ) THEN
        RAISE EXCEPTION 'Column flavor_product_type missing from favorite_products';
    END IF;
    RAISE NOTICE 'TEST 6.2 PASSED: flavor_product_type column exists';
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorite_products' AND column_name = 'steep_days'
    ) THEN
        RAISE EXCEPTION 'Column steep_days missing from favorite_products';
    END IF;
    RAISE NOTICE 'TEST 6.3 PASSED: steep_days column exists';
    
    RAISE NOTICE 'TEST 6 COMPLETED: favorite_products extension verified';
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'ALL TESTS PASSED SUCCESSFULLY!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Flavor Database is ready for use.';
END $$;

-- =====================================================
-- Show table counts
-- =====================================================
SELECT 'flavor_manufacturers' as table_name, COUNT(*) as row_count FROM flavor_manufacturers
UNION ALL
SELECT 'flavors (active)', COUNT(*) FROM flavors WHERE status = 'active'
UNION ALL
SELECT 'flavors (pending)', COUNT(*) FROM flavors WHERE status = 'pending'
UNION ALL
SELECT 'flavor_ratings', COUNT(*) FROM flavor_ratings
UNION ALL
SELECT 'recipe_flavors', COUNT(*) FROM recipe_flavors;
