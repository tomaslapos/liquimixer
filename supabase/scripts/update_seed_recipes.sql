-- ============================================
-- UPDATE: Přepočet seed receptů - přidání vgPercent, pgPercent, nicotine a ingredients
-- Date: 2026-02-05
-- Autor: AI Assistant
-- ============================================

-- Tento skript aktualizuje všechny seed recepty (clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ')
-- a přidává:
-- 1. vgPercent a pgPercent (z vgRatio)
-- 2. nicotine (z nicStrength)
-- 3. ingredients pole s vypočítanými objemy

-- ============================================
-- FUNKCE PRO VÝPOČET SLOŽEK
-- ============================================

CREATE OR REPLACE FUNCTION calculate_recipe_ingredients(recipe_data JSONB)
RETURNS JSONB AS $$
DECLARE
    total_amount DECIMAL;
    vg_ratio DECIMAL;
    pg_ratio DECIMAL;
    nic_strength DECIMAL;
    nic_base DECIMAL;
    nic_ratio DECIMAL;
    flavor_percent DECIMAL;
    form_type TEXT;
    
    -- Vypočítané hodnoty
    flavor_volume DECIMAL;
    nic_volume DECIMAL;
    nic_percent DECIMAL;
    used_percent DECIMAL;
    remaining_percent DECIMAL;
    vg_percent DECIMAL;
    pg_percent DECIMAL;
    vg_volume DECIMAL;
    pg_volume DECIMAL;
    
    -- Výsledné ingredience
    ingredients JSONB;
    updated_data JSONB;
BEGIN
    -- Načíst hodnoty z recipe_data
    total_amount := COALESCE((recipe_data->>'totalAmount')::DECIMAL, 30);
    vg_ratio := COALESCE((recipe_data->>'vgRatio')::DECIMAL, (recipe_data->>'vgPercent')::DECIMAL, 70);
    pg_ratio := 100 - vg_ratio;
    nic_strength := COALESCE((recipe_data->>'nicStrength')::DECIMAL, (recipe_data->>'nicotine')::DECIMAL, 0);
    nic_base := COALESCE((recipe_data->>'nicBase')::DECIMAL, (recipe_data->>'nicotineBaseStrength')::DECIMAL, 20);
    nic_ratio := COALESCE((recipe_data->>'nicRatio')::DECIMAL, 50);
    flavor_percent := COALESCE((recipe_data->>'flavorPercent')::DECIMAL, 10);
    form_type := COALESCE(recipe_data->>'formType', 'liquid');
    
    -- Inicializovat ingredience
    ingredients := '[]'::JSONB;
    
    -- 1. Příchuť (Flavor/Aroma)
    IF flavor_percent > 0 THEN
        flavor_volume := total_amount * (flavor_percent / 100);
        ingredients := ingredients || jsonb_build_array(
            jsonb_build_object(
                'name', 'Aroma',
                'volume', ROUND(flavor_volume::NUMERIC, 2),
                'percent', ROUND(flavor_percent::NUMERIC, 1),
                'type', 'flavor'
            )
        );
    END IF;
    
    -- 2. Nikotin
    IF nic_strength > 0 AND nic_base > 0 THEN
        nic_volume := (nic_strength * total_amount) / nic_base;
        nic_percent := (nic_volume / total_amount) * 100;
        ingredients := ingredients || jsonb_build_array(
            jsonb_build_object(
                'name', 'Nikotinová sůl',
                'volume', ROUND(nic_volume::NUMERIC, 2),
                'percent', ROUND(nic_percent::NUMERIC, 1),
                'type', 'nicotine_salt'
            )
        );
    ELSE
        nic_percent := 0;
    END IF;
    
    -- 3. Zbývající prostor pro VG a PG
    used_percent := flavor_percent + COALESCE(nic_percent, 0);
    remaining_percent := 100 - used_percent;
    
    -- VG
    vg_percent := (vg_ratio / 100) * remaining_percent;
    vg_volume := total_amount * (vg_percent / 100);
    IF vg_volume > 0.01 THEN
        ingredients := ingredients || jsonb_build_array(
            jsonb_build_object(
                'name', 'VG',
                'volume', ROUND(vg_volume::NUMERIC, 2),
                'percent', ROUND(vg_percent::NUMERIC, 1),
                'type', 'vg'
            )
        );
    END IF;
    
    -- PG
    pg_percent := (pg_ratio / 100) * remaining_percent;
    pg_volume := total_amount * (pg_percent / 100);
    IF pg_volume > 0.01 THEN
        ingredients := ingredients || jsonb_build_array(
            jsonb_build_object(
                'name', 'PG',
                'volume', ROUND(pg_volume::NUMERIC, 2),
                'percent', ROUND(pg_percent::NUMERIC, 1),
                'type', 'pg'
            )
        );
    END IF;
    
    -- Aktualizovat recipe_data
    updated_data := recipe_data;
    updated_data := jsonb_set(updated_data, '{vgPercent}', to_jsonb(vg_ratio));
    updated_data := jsonb_set(updated_data, '{pgPercent}', to_jsonb(pg_ratio));
    updated_data := jsonb_set(updated_data, '{nicotine}', to_jsonb(nic_strength));
    updated_data := jsonb_set(updated_data, '{ingredients}', ingredients);
    
    RETURN updated_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AKTUALIZACE SEED RECEPTŮ
-- ============================================

-- Aktualizovat všechny seed recepty (form_type: liquid, liquidPro, shisha, shortfill)
UPDATE recipes
SET recipe_data = calculate_recipe_ingredients(recipe_data)
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ'
  AND is_public = true
  AND (recipe_data->>'ingredients') IS NULL;

-- ============================================
-- VERIFIKACE
-- ============================================

-- Zkontrolovat počet aktualizovaných receptů
SELECT 
    form_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE recipe_data ? 'ingredients') as with_ingredients,
    COUNT(*) FILTER (WHERE recipe_data ? 'vgPercent') as with_vg_percent
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ'
  AND is_public = true
GROUP BY form_type
ORDER BY form_type;

-- Ukázka jednoho receptu
SELECT 
    name,
    form_type,
    recipe_data->>'vgPercent' as vg_percent,
    recipe_data->>'pgPercent' as pg_percent,
    recipe_data->>'nicotine' as nicotine,
    jsonb_array_length(recipe_data->'ingredients') as ingredient_count
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ'
  AND is_public = true
LIMIT 5;

-- ============================================
-- ČIŠTĚNÍ (volitelné - odkomentuj pokud chceš smazat funkci po použití)
-- ============================================
-- DROP FUNCTION IF EXISTS calculate_recipe_ingredients(JSONB);
