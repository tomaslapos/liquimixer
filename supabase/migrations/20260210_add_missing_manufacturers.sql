-- Migration: Add missing flavor manufacturers from eliquidshop.cz
-- Date: 2026-02-10
-- Purpose: Complete the manufacturer database with all popular EU brands

-- =====================================================
-- PART 1: Add missing VAPE manufacturers
-- =====================================================

INSERT INTO flavor_manufacturers (code, name, country_code, type, website) VALUES
    -- Czech Republic (CZ)
    ('ARA', 'Aramax', 'CZ', 'vape', NULL),
    ('DRF', 'Dream Flavor', 'CZ', 'vape', NULL),
    ('MON', 'Monkey Liquid', 'CZ', 'vape', NULL),
    ('SPV', 'Sparkling Vibes', 'CZ', 'vape', NULL),
    ('PRM', 'Prime', 'CZ', 'vape', NULL),
    ('RIT', 'Ritchy', 'CZ', 'vape', NULL),
    ('VNC', 'VINC', 'CZ', 'vape', NULL),
    ('FLT', 'Flavourit', 'CZ', 'vape', 'https://flavourit.cz'),
    
    -- United Kingdom (GB)
    ('BSL', 'Bar Salts', 'GB', 'vape', NULL),
    ('DDL', 'Dinner Lady', 'GB', 'vape', 'https://dinnerlady.com'),
    ('CDL', 'Core by Dinner Lady', 'GB', 'vape', NULL),
    ('DRV', 'Dr. Vapes', 'GB', 'vape', NULL),
    ('JJC', 'Just Juice', 'GB', 'vape', 'https://justjuice.com'),
    ('TJC', 'T-Juice', 'GB', 'vape', 'https://t-juice.com'),
    ('TIJ', 'TI Juice', 'GB', 'vape', NULL),
    ('VV', 'Vampire Vape', 'GB', 'vape', 'https://vampirevape.co.uk'),
    
    -- Germany (DE)
    ('BOZ', 'Bozz', 'DE', 'vape', NULL),
    
    -- USA (US)
    ('ALC', 'Al Carlo', 'CA', 'vape', NULL),
    ('ALO', 'Alpha Origins', 'US', 'vape', NULL),
    ('CCD', 'Charlies Chalk Dust', 'US', 'vape', 'https://charlieschalkdust.com'),
    ('WFC', 'Waffle Collection', 'US', 'vape', NULL),
    ('FW', 'Flavor West', 'US', 'vape', 'https://flavorwest.com'),
    
    -- Croatia (HR)
    ('INF', 'Infamous', 'HR', 'vape', NULL),
    ('KZY', 'KOZY Factory', 'HR', 'vape', NULL),
    ('KTS', 'KTS', 'HR', 'vape', NULL),
    
    -- Austria (AT)
    ('PJE', 'PJ Empire', 'AT', 'vape', NULL),
    ('RKE', 'Rocket Empire', 'AT', 'vape', NULL),
    
    -- Malaysia (MY)
    ('NTJ', 'Nasty Juice', 'MY', 'vape', 'https://nastyjuice.com'),
    ('UAH', 'UAHU', 'MY', 'vape', NULL),
    
    -- Ukraine (UA)
    ('PRV', 'Pro Vape', 'UA', 'vape', NULL),
    
    -- France (FR)
    ('SOL', 'Solub Arome', 'FR', 'vape', 'https://solubarome.fr'),
    
    -- Other EU brands
    ('PDF', 'Paradise Fruits', 'EU', 'vape', NULL),
    ('DVP', 'Decadent Vapours', 'GB', 'vape', 'https://decadentvapours.com')
    
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    country_code = EXCLUDED.country_code,
    website = EXCLUDED.website;

-- =====================================================
-- PART 2: Verification
-- =====================================================

DO $$
DECLARE
    total_count INT;
    vape_count INT;
    shisha_count INT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM flavor_manufacturers;
    SELECT COUNT(*) INTO vape_count FROM flavor_manufacturers WHERE type = 'vape';
    SELECT COUNT(*) INTO shisha_count FROM flavor_manufacturers WHERE type = 'shisha';
    
    RAISE NOTICE '=== SOUHRN VÝROBCŮ ===';
    RAISE NOTICE 'Celkem výrobců: %', total_count;
    RAISE NOTICE 'Vape výrobců: %', vape_count;
    RAISE NOTICE 'Shisha výrobců: %', shisha_count;
END $$;
