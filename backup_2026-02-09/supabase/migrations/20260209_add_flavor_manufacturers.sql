-- Migration: Add flavor manufacturers table
-- Date: 2026-02-09
-- Purpose: Store flavor manufacturers with country codes and types

-- =====================================================
-- PART 1: Create flavor_manufacturers table
-- =====================================================

CREATE TABLE IF NOT EXISTS flavor_manufacturers (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('vape', 'shisha', 'both')),
    website VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manufacturers_type 
ON flavor_manufacturers(type);

CREATE INDEX IF NOT EXISTS idx_manufacturers_country 
ON flavor_manufacturers(country_code);

CREATE INDEX IF NOT EXISTS idx_manufacturers_active 
ON flavor_manufacturers(is_active) WHERE is_active = true;

COMMENT ON TABLE flavor_manufacturers IS 'Flavor manufacturers with country codes. Used for flavor database.';
COMMENT ON COLUMN flavor_manufacturers.code IS 'Short code like CAP, TPA, FA, ALF';
COMMENT ON COLUMN flavor_manufacturers.type IS 'vape = e-liquid flavors, shisha = hookah tobacco, both = produces both';

-- =====================================================
-- PART 2: Row Level Security
-- =====================================================

ALTER TABLE flavor_manufacturers ENABLE ROW LEVEL SECURITY;

-- Anyone can read manufacturers (including anonymous users)
CREATE POLICY "Anyone can read manufacturers" 
ON flavor_manufacturers
FOR SELECT 
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage manufacturers" 
ON flavor_manufacturers
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 3: Seed initial manufacturers
-- =====================================================

INSERT INTO flavor_manufacturers (code, name, country_code, type, website) VALUES
    -- VAPE manufacturers
    ('CAP', 'Capella Flavors', 'US', 'vape', 'https://capellaflavors.com'),
    ('TPA', 'The Flavor Apprentice', 'US', 'vape', 'https://shop.perfumersapprentice.com'),
    ('FA', 'FlavourArt', 'IT', 'vape', 'https://flavourart.com'),
    ('FLV', 'Flavorah', 'US', 'vape', 'https://flavorah.com'),
    ('INW', 'Inawera', 'PL', 'vape', 'https://inawera.com'),
    ('WF', 'Wonder Flavours', 'CA', 'vape', 'https://wonderflavours.com'),
    ('MB', 'Molinberry', 'PL', 'vape', NULL),
    ('SSA', 'Sobucky Super Aromas', 'PL', 'vape', NULL),
    ('TW', 'Twisted Vaping', 'DE', 'vape', 'https://twisted-vaping.de'),
    ('GF', 'GermanFlavours', 'DE', 'vape', 'https://germanflavours.de'),
    ('IMP', 'Imperia', 'CZ', 'vape', NULL),
    ('AV', 'Adams Vape', 'CZ', 'vape', NULL),
    ('LIQ', 'LIQUA', 'CZ', 'vape', 'https://liqua.com'),
    
    -- SHISHA manufacturers
    ('ALF', 'Al Fakher', 'AE', 'shisha', 'https://alfakher.com'),
    ('ADA', 'Adalya', 'TR', 'shisha', 'https://adalya.us'),
    ('STB', 'Starbuzz', 'US', 'shisha', 'https://starbuzz.com'),
    ('FUM', 'Fumari', 'US', 'shisha', 'https://fumari.com'),
    ('TAN', 'Tangiers', 'US', 'shisha', NULL),
    ('NAK', 'Nakhla', 'EG', 'shisha', NULL),
    ('DRK', 'Darkside', 'RU', 'shisha', NULL),
    ('ELM', 'Element', 'RU', 'shisha', NULL),
    ('MST', 'Musthave', 'RU', 'shisha', NULL),
    ('AWH', 'Al-Waha', 'JO', 'shisha', NULL),
    ('MAZ', 'Mazaya', 'JO', 'shisha', NULL),
    ('HKN', 'Hookain', 'DE', 'shisha', NULL),
    ('MRD', 'Maridan', 'DE', 'shisha', NULL)
ON CONFLICT (code) DO NOTHING;

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: flavor_manufacturers table created with % manufacturers', 
        (SELECT COUNT(*) FROM flavor_manufacturers);
END $$;
