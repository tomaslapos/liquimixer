-- Migration: Standardizace recipe_data klíčů
-- Datum: 2026-02-12
-- Popis: Převod vgRatio -> vgPercent a nicStrength -> nicotine
--        pro zajištění konzistence napříč všemi typy receptů

-- Krok 1: Aktualizace receptů které mají vgRatio (převod na vgPercent)
UPDATE recipes
SET recipe_data = (recipe_data - 'vgRatio') || jsonb_build_object('vgPercent', recipe_data->'vgRatio')
WHERE recipe_data ? 'vgRatio';

-- Krok 2: Aktualizace receptů které mají nicStrength (převod na nicotine)
UPDATE recipes
SET recipe_data = (recipe_data - 'nicStrength') || jsonb_build_object('nicotine', recipe_data->'nicStrength')
WHERE recipe_data ? 'nicStrength';

-- Krok 3: Zajistit že všechny shisha recepty mají nicotine klíč (defaultně 0)
UPDATE recipes
SET recipe_data = recipe_data || jsonb_build_object('nicotine', 0)
WHERE form_type = 'shisha' 
  AND NOT (recipe_data ? 'nicotine');

-- Verifikace - počet receptů s novými klíči
DO $$
DECLARE
    vg_count INTEGER;
    nic_count INTEGER;
    old_vg_count INTEGER;
    old_nic_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO vg_count FROM recipes WHERE recipe_data ? 'vgPercent';
    SELECT COUNT(*) INTO nic_count FROM recipes WHERE recipe_data ? 'nicotine';
    SELECT COUNT(*) INTO old_vg_count FROM recipes WHERE recipe_data ? 'vgRatio';
    SELECT COUNT(*) INTO old_nic_count FROM recipes WHERE recipe_data ? 'nicStrength';
    
    RAISE NOTICE 'Migrace dokončena:';
    RAISE NOTICE '  - Recepty s vgPercent: %', vg_count;
    RAISE NOTICE '  - Recepty s nicotine: %', nic_count;
    RAISE NOTICE '  - Recepty se starým vgRatio (mělo by být 0): %', old_vg_count;
    RAISE NOTICE '  - Recepty se starým nicStrength (mělo by být 0): %', old_nic_count;
END $$;
