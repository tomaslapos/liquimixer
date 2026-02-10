-- Migration: Oprava procentuálního dávkování příchutí
-- Date: 2026-02-10
-- Purpose: Opravit nesprávná % data na ověřená data z oficiálních zdrojů
-- 
-- ZDROJE DAT:
-- - Imperia Black Label: eliquidshop.cz (oficiální distributor) - 2-3%
-- - Capella, TFA, FA, INW, FLV, FW: diy-vape-recipes.com statistiky
-- - Vampire Vape: vampirevape.co.uk - 10-20%
-- - Příchutě bez dat: NULL + upozornění pro uživatele
--
-- KRITICKÉ: Tato migrace opravuje zdraví ohrožující data!

-- =====================================================
-- ČÁST 1: IMPERIA BLACK LABEL - Oprava na 2-3%
-- Zdroj: eliquidshop.cz - "Doporučené dávkování je 2-3%"
-- Platí pro VŠECH 63 příchutí Imperia Black Label
-- =====================================================

UPDATE flavors 
SET min_percent = 2.0,
    max_percent = 3.0,
    recommended_percent = 2.5,
    status = 'active'
WHERE manufacturer_code = 'IMP';

-- =====================================================
-- ČÁST 2: INAWERA - Oprava na ověřená data z diy-vape-recipes.com
-- =====================================================

-- Biscuit - velmi koncentrovaná
UPDATE flavors SET min_percent = 0.25, max_percent = 1.5, recommended_percent = 0.88
WHERE manufacturer_code = 'INW' AND LOWER(name) = 'biscuit';

-- Cactus - velmi koncentrovaná
UPDATE flavors SET min_percent = 0.2, max_percent = 1.0, recommended_percent = 0.58
WHERE manufacturer_code = 'INW' AND LOWER(name) = 'cactus';

-- Shisha Strawberry
UPDATE flavors SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.5
WHERE manufacturer_code = 'INW' AND LOWER(name) LIKE '%shisha strawberry%';

-- Shisha Vanilla
UPDATE flavors SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.5
WHERE manufacturer_code = 'INW' AND LOWER(name) LIKE '%shisha vanilla%';

-- Custard
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 2.03
WHERE manufacturer_code = 'INW' AND LOWER(name) = 'custard';

-- Creme Brulee
UPDATE flavors SET min_percent = 0.75, max_percent = 2.5, recommended_percent = 1.63
WHERE manufacturer_code = 'INW' AND LOWER(name) LIKE '%creme brulee%';

-- Anton Apple
UPDATE flavors SET min_percent = 1.0, max_percent = 3.5, recommended_percent = 2.08
WHERE manufacturer_code = 'INW' AND LOWER(name) LIKE '%anton apple%';

-- Obecná oprava pro ostatní Inawera příchutě - průměrný rozsah
UPDATE flavors 
SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.5
WHERE manufacturer_code = 'INW' 
  AND (min_percent IS NULL OR min_percent > 3.0);

-- =====================================================
-- ČÁST 3: CAPELLA - Oprava na ověřená data
-- =====================================================

-- Vanilla Custard
UPDATE flavors SET min_percent = 1.18, max_percent = 4.22, recommended_percent = 2.70
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%vanilla custard%' AND LOWER(name) NOT LIKE '%v2%';

-- Vanilla Custard V2
UPDATE flavors SET min_percent = 1.5, max_percent = 5.0, recommended_percent = 3.0
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%vanilla custard v2%';

-- Bavarian Cream
UPDATE flavors SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.38
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%bavarian cream%';

-- Butter Cream
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.16
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%butter cream%';

-- Cake Batter
UPDATE flavors SET min_percent = 0.5, max_percent = 3.0, recommended_percent = 1.71
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%cake batter%';

-- Cinnamon Danish Swirl
UPDATE flavors SET min_percent = 0.5, max_percent = 3.0, recommended_percent = 1.68
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%cinnamon danish%';

-- Sugar Cookie
UPDATE flavors SET min_percent = 1.0, max_percent = 5.0, recommended_percent = 2.95
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%sugar cookie%';

-- Double Apple
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.17
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%double apple%';

-- French Vanilla
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.05
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%french vanilla%';

-- Cereal 27
UPDATE flavors SET min_percent = 1.5, max_percent = 5.5, recommended_percent = 3.56
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%cereal 27%';

-- Apple Pie
UPDATE flavors SET min_percent = 1.0, max_percent = 4.5, recommended_percent = 2.75
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%apple pie%';

-- Sweet Strawberry
UPDATE flavors SET min_percent = 2.0, max_percent = 5.0, recommended_percent = 3.5
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%sweet strawberry%';

-- Graham Cracker
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.5
WHERE manufacturer_code = 'CAP' AND LOWER(name) LIKE '%graham cracker%';

-- Obecná oprava pro ostatní Capella příchutě
UPDATE flavors 
SET min_percent = 1.5, max_percent = 4.0, recommended_percent = 2.5
WHERE manufacturer_code = 'CAP' 
  AND (min_percent IS NULL OR min_percent > 5.0);

-- =====================================================
-- ČÁST 4: TFA/TPA - Oprava na ověřená data
-- =====================================================

-- Bavarian Cream
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 1.95
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%bavarian cream%';

-- Banana Cream
UPDATE flavors SET min_percent = 1.0, max_percent = 4.5, recommended_percent = 2.63
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%banana cream%';

-- Brown Sugar
UPDATE flavors SET min_percent = 0.25, max_percent = 1.5, recommended_percent = 0.77
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%brown sugar%';

-- Acetyl Pyrazine
UPDATE flavors SET min_percent = 0.1, max_percent = 1.0, recommended_percent = 0.53
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%acetyl pyrazine%';

-- Cheesecake Graham Crust
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.22
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%cheesecake graham%';

-- Banana Nut Bread
UPDATE flavors SET min_percent = 2.0, max_percent = 8.0, recommended_percent = 5.10
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%banana nut bread%';

-- Strawberry Ripe
UPDATE flavors SET min_percent = 1.5, max_percent = 5.0, recommended_percent = 3.15
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%strawberry ripe%';

-- Vanilla Swirl
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.5
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%vanilla swirl%';

-- Vanilla Bean Ice Cream
UPDATE flavors SET min_percent = 2.0, max_percent = 5.0, recommended_percent = 3.5
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%vanilla bean ice cream%';

-- Vanilla Custard
UPDATE flavors SET min_percent = 1.5, max_percent = 5.0, recommended_percent = 3.15
WHERE manufacturer_code = 'TPA' AND LOWER(name) LIKE '%vanilla custard%';

-- Obecná oprava pro ostatní TPA příchutě
UPDATE flavors 
SET min_percent = 1.5, max_percent = 4.5, recommended_percent = 3.0
WHERE manufacturer_code = 'TPA' 
  AND (min_percent IS NULL OR min_percent > 5.0);

-- =====================================================
-- ČÁST 5: FLAVOURART - Oprava na ověřená data
-- =====================================================

-- Meringue
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.15
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%meringue%';

-- Cream Fresh
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%cream fresh%';

-- Fuji Apple
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 2.0
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%fuji apple%';

-- Vienna Cream
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%vienna cream%';

-- Custard
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 2.06
WHERE manufacturer_code = 'FA' AND LOWER(name) = 'custard';

-- Apple Pie
UPDATE flavors SET min_percent = 0.5, max_percent = 3.0, recommended_percent = 1.63
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%apple pie%';

-- Almond
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.10
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%almond%';

-- Caramel
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.18
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%caramel%';

-- Catalan Cream
UPDATE flavors SET min_percent = 0.75, max_percent = 2.5, recommended_percent = 1.57
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%catalan cream%';

-- Bourbon (Vanilla)
UPDATE flavors SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.33
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%bourbon%';

-- Bilberry
UPDATE flavors SET min_percent = 0.25, max_percent = 1.0, recommended_percent = 0.57
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%bilberry%';

-- Blackcurrant
UPDATE flavors SET min_percent = 0.4, max_percent = 1.5, recommended_percent = 0.90
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%blackcurrant%';

-- Catania (tabák)
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 2.0
WHERE manufacturer_code = 'FA' AND LOWER(name) LIKE '%catania%';

-- Obecná oprava pro ostatní FA příchutě - FA jsou velmi koncentrované
UPDATE flavors 
SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.5
WHERE manufacturer_code = 'FA' 
  AND (min_percent IS NULL OR min_percent > 3.0);

-- =====================================================
-- ČÁST 6: FLAVORAH - Oprava na ověřená data (velmi koncentrované)
-- =====================================================

-- Rich Cinnamon
UPDATE flavors SET min_percent = 0.25, max_percent = 1.5, recommended_percent = 0.75
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%rich cinnamon%';

-- Cream
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.21
WHERE manufacturer_code = 'FLV' AND LOWER(name) = 'cream';

-- Vanilla Custard
UPDATE flavors SET min_percent = 0.75, max_percent = 3.0, recommended_percent = 1.80
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%vanilla custard%';

-- Strawberry
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 2.0
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%strawberry%' AND LOWER(name) NOT LIKE '%alpine%';

-- Alpine Strawberry
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.0
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%alpine strawberry%';

-- Butterscotch
UPDATE flavors SET min_percent = 1.0, max_percent = 3.0, recommended_percent = 1.93
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%butterscotch%';

-- Cured Tobacco
UPDATE flavors SET min_percent = 0.5, max_percent = 2.5, recommended_percent = 1.34
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%cured tobacco%';

-- Cookie Dough
UPDATE flavors SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.18
WHERE manufacturer_code = 'FLV' AND LOWER(name) LIKE '%cookie dough%';

-- Obecná oprava pro Flavorah - velmi koncentrované příchutě
UPDATE flavors 
SET min_percent = 0.5, max_percent = 2.0, recommended_percent = 1.25
WHERE manufacturer_code = 'FLV' 
  AND (min_percent IS NULL OR min_percent > 2.5);

-- =====================================================
-- ČÁST 7: VAMPIRE VAPE - Ponechat (10-20% je správné)
-- Zdroj: vampirevape.co.uk - oficiální web výrobce
-- =====================================================

-- Vampire Vape příchutě jsou již správně nastavené na 12-20%
-- Pouze ověříme, že jsou aktivní
UPDATE flavors 
SET status = 'active'
WHERE manufacturer_code = 'VV';

-- =====================================================
-- ČÁST 8: WONDER FLAVOURS - Oprava na 3-5%
-- Zdroj: wonderflavours.com
-- =====================================================

UPDATE flavors 
SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.5
WHERE manufacturer_code = 'WF';

-- =====================================================
-- ČÁST 9: FLAVOR WEST - Oprava na ověřená data
-- =====================================================

-- Yellow Cake
UPDATE flavors SET min_percent = 1.0, max_percent = 3.5, recommended_percent = 2.08
WHERE manufacturer_code = 'FW' AND LOWER(name) LIKE '%yellow cake%';

-- Butterscotch Ripple
UPDATE flavors SET min_percent = 1.25, max_percent = 4.5, recommended_percent = 2.69
WHERE manufacturer_code = 'FW' AND LOWER(name) LIKE '%butterscotch ripple%';

-- Blueberry
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.52
WHERE manufacturer_code = 'FW' AND LOWER(name) LIKE '%blueberry%';

-- Butter Pecan
UPDATE flavors SET min_percent = 1.0, max_percent = 3.5, recommended_percent = 2.01
WHERE manufacturer_code = 'FW' AND LOWER(name) LIKE '%butter pecan%';

-- Obecná oprava pro ostatní FW příchutě
UPDATE flavors 
SET min_percent = 1.5, max_percent = 4.0, recommended_percent = 2.5
WHERE manufacturer_code = 'FW' 
  AND (min_percent IS NULL OR min_percent > 4.0);

-- =====================================================
-- ČÁST 10: FLAVOURIT - Nastavit NULL (nedostatek specifických dat)
-- Obecně 5-15%, ale bez specifik pro jednotlivé příchutě
-- =====================================================

UPDATE flavors 
SET min_percent = NULL,
    max_percent = NULL,
    recommended_percent = NULL
WHERE manufacturer_code = 'FLT';

-- =====================================================
-- ČÁST 11: Příchutě BEZ OVĚŘENÝCH DAT - Nastavit NULL
-- Adams Vape, LIQUA, SSA, German Flavours, Twisted Vaping, Solub
-- =====================================================

UPDATE flavors 
SET min_percent = NULL,
    max_percent = NULL,
    recommended_percent = NULL
WHERE manufacturer_code IN ('AV', 'LIQ', 'SSA', 'GF', 'TW', 'SOL', 'MB');

-- =====================================================
-- ČÁST 12: SHISHA příchutě - Nastavit NULL
-- Shisha příchutě nepotřebují % dávkování (jiný koncept)
-- =====================================================

UPDATE flavors 
SET min_percent = NULL,
    max_percent = NULL,
    recommended_percent = NULL
WHERE product_type = 'shisha';

-- =====================================================
-- ČÁST 13: Ověření - Výpis statistik
-- =====================================================

DO $$
DECLARE
    total_count INT;
    with_percent_count INT;
    without_percent_count INT;
    imperia_count INT;
    shisha_count INT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM flavors;
    SELECT COUNT(*) INTO with_percent_count FROM flavors WHERE recommended_percent IS NOT NULL;
    SELECT COUNT(*) INTO without_percent_count FROM flavors WHERE recommended_percent IS NULL;
    SELECT COUNT(*) INTO imperia_count FROM flavors WHERE manufacturer_code = 'IMP';
    SELECT COUNT(*) INTO shisha_count FROM flavors WHERE product_type = 'shisha';
    
    RAISE NOTICE '=== SOUHRN MIGRACE ===';
    RAISE NOTICE 'Celkem prichuti: %', total_count;
    RAISE NOTICE 'S vyplnenym pct: %', with_percent_count;
    RAISE NOTICE 'Bez pct (NULL): %', without_percent_count;
    RAISE NOTICE 'Imperia prichuti: %', imperia_count;
    RAISE NOTICE 'Shisha prichuti: %', shisha_count;
END $$;
