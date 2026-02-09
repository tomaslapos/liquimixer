-- ============================================
-- RESET AND SEED: Kompletní reset a nové nahrání receptů
-- Date: 2026-02-05
-- ============================================
-- Tento skript:
-- 1. SMAŽE VŠECHNY seed recepty
-- 2. Nahraje nové recepty s kompletními daty (flavorName, ingredients, vgPercent, pgPercent)
-- ============================================

-- ============================================
-- KROK 1: SMAZÁNÍ VŠECH SEED RECEPTŮ
-- ============================================

-- Zobrazit počet před smazáním
SELECT COUNT(*) as recipes_before_delete
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;

-- Smazat všechny seed recepty
DELETE FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;

-- Potvrdit smazání
SELECT COUNT(*) as recipes_after_delete
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;

-- ============================================
-- KROK 2: FUNKCE PRO VÝPOČET INGREDIENTS
-- ============================================

CREATE OR REPLACE FUNCTION build_liquid_recipe(
    p_total_amount DECIMAL,
    p_vg_ratio DECIMAL,
    p_nic_strength DECIMAL,
    p_nic_base DECIMAL,
    p_flavor_type TEXT,
    p_flavor_name TEXT,
    p_flavor_percent DECIMAL,
    p_steeping_days INT
) RETURNS JSONB AS $$
DECLARE
    v_pg_ratio DECIMAL;
    v_nic_volume DECIMAL := 0;
    v_nic_percent DECIMAL := 0;
    v_flavor_volume DECIMAL;
    v_used_percent DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    v_ingredients JSONB := '[]'::JSONB;
    v_result JSONB;
BEGIN
    v_pg_ratio := 100 - p_vg_ratio;
    
    -- Příchuť
    v_flavor_volume := p_total_amount * (p_flavor_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object(
            'ingredientKey', 'flavor',
            'flavorType', p_flavor_type,
            'flavorName', p_flavor_name,
            'volume', ROUND(v_flavor_volume::NUMERIC, 2),
            'percent', ROUND(p_flavor_percent::NUMERIC, 1),
            'params', jsonb_build_object('vgpg', '0/100')
        )
    );
    
    -- Nikotin
    IF p_nic_strength > 0 AND p_nic_base > 0 THEN
        v_nic_volume := (p_nic_strength * p_total_amount) / p_nic_base;
        v_nic_percent := (v_nic_volume / p_total_amount) * 100;
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'nicotine_salt',
                'volume', ROUND(v_nic_volume::NUMERIC, 2),
                'percent', ROUND(v_nic_percent::NUMERIC, 1),
                'params', jsonb_build_object('strength', p_nic_base, 'vgpg', '50/50')
            )
        );
    END IF;
    
    -- VG a PG
    v_used_percent := p_flavor_percent + v_nic_percent;
    v_remaining_percent := 100 - v_used_percent;
    
    v_vg_percent := (p_vg_ratio / 100) * v_remaining_percent;
    v_vg_volume := p_total_amount * (v_vg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'vg', 'volume', ROUND(v_vg_volume::NUMERIC, 2), 'percent', ROUND(v_vg_percent::NUMERIC, 1))
    );
    
    v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
    v_pg_volume := p_total_amount * (v_pg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'pg', 'volume', ROUND(v_pg_volume::NUMERIC, 2), 'percent', ROUND(v_pg_percent::NUMERIC, 1))
    );
    
    v_result := jsonb_build_object(
        'formType', 'liquid',
        'totalAmount', p_total_amount,
        'vgRatio', p_vg_ratio,
        'vgPercent', p_vg_ratio,
        'pgPercent', v_pg_ratio,
        'nicStrength', p_nic_strength,
        'nicotine', p_nic_strength,
        'nicBase', p_nic_base,
        'nicRatio', 50,
        'flavorType', p_flavor_type,
        'flavorName', p_flavor_name,
        'flavorPercent', p_flavor_percent,
        'steepingDays', p_steeping_days,
        'ingredients', v_ingredients
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION build_liquidpro_recipe(
    p_total_amount DECIMAL,
    p_vg_ratio DECIMAL,
    p_nic_strength DECIMAL,
    p_nic_base DECIMAL,
    p_flavors JSONB,  -- Array of {type, name, percent}
    p_steeping_days INT
) RETURNS JSONB AS $$
DECLARE
    v_pg_ratio DECIMAL;
    v_nic_volume DECIMAL := 0;
    v_nic_percent DECIMAL := 0;
    v_total_flavor_percent DECIMAL := 0;
    v_used_percent DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    v_ingredients JSONB := '[]'::JSONB;
    v_flavor JSONB;
    v_flavor_idx INT := 0;
    v_result JSONB;
BEGIN
    v_pg_ratio := 100 - p_vg_ratio;
    
    -- Příchutě
    FOR v_flavor IN SELECT * FROM jsonb_array_elements(p_flavors)
    LOOP
        v_flavor_idx := v_flavor_idx + 1;
        v_total_flavor_percent := v_total_flavor_percent + (v_flavor->>'percent')::DECIMAL;
        
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'flavor',
                'flavorType', v_flavor->>'type',
                'flavorName', v_flavor->>'name',
                'flavorNumber', v_flavor_idx,
                'volume', ROUND((p_total_amount * ((v_flavor->>'percent')::DECIMAL / 100))::NUMERIC, 2),
                'percent', ROUND((v_flavor->>'percent')::NUMERIC, 1),
                'params', jsonb_build_object('vgpg', '0/100')
            )
        );
    END LOOP;
    
    -- Nikotin
    IF p_nic_strength > 0 AND p_nic_base > 0 THEN
        v_nic_volume := (p_nic_strength * p_total_amount) / p_nic_base;
        v_nic_percent := (v_nic_volume / p_total_amount) * 100;
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'nicotine_salt',
                'volume', ROUND(v_nic_volume::NUMERIC, 2),
                'percent', ROUND(v_nic_percent::NUMERIC, 1),
                'params', jsonb_build_object('strength', p_nic_base, 'vgpg', '50/50')
            )
        );
    END IF;
    
    -- VG a PG
    v_used_percent := v_total_flavor_percent + v_nic_percent;
    v_remaining_percent := 100 - v_used_percent;
    
    v_vg_percent := (p_vg_ratio / 100) * v_remaining_percent;
    v_vg_volume := p_total_amount * (v_vg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'vg', 'volume', ROUND(v_vg_volume::NUMERIC, 2), 'percent', ROUND(v_vg_percent::NUMERIC, 1))
    );
    
    v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
    v_pg_volume := p_total_amount * (v_pg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'pg', 'volume', ROUND(v_pg_volume::NUMERIC, 2), 'percent', ROUND(v_pg_percent::NUMERIC, 1))
    );
    
    v_result := jsonb_build_object(
        'formType', 'liquidpro',
        'totalAmount', p_total_amount,
        'vgRatio', p_vg_ratio,
        'vgPercent', p_vg_ratio,
        'pgPercent', v_pg_ratio,
        'nicStrength', p_nic_strength,
        'nicotine', p_nic_strength,
        'nicBase', p_nic_base,
        'nicRatio', 50,
        'flavors', p_flavors,
        'steepingDays', p_steeping_days,
        'ingredients', v_ingredients
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION build_shisha_recipe(
    p_total_amount DECIMAL,
    p_vg_ratio DECIMAL,
    p_glycerin_ratio DECIMAL,
    p_sweetener TEXT,
    p_sweetener_percent DECIMAL,
    p_flavors JSONB,
    p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
    v_total_flavor_percent DECIMAL := 0;
    v_ingredients JSONB := '[]'::JSONB;
    v_flavor JSONB;
    v_flavor_idx INT := 0;
    v_result JSONB;
BEGIN
    -- Příchutě
    FOR v_flavor IN SELECT * FROM jsonb_array_elements(p_flavors)
    LOOP
        v_flavor_idx := v_flavor_idx + 1;
        v_total_flavor_percent := v_total_flavor_percent + (v_flavor->>'percent')::DECIMAL;
        
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'shisha_flavor',
                'flavorType', v_flavor->>'type',
                'flavorName', v_flavor->>'name',
                'flavorNumber', v_flavor_idx,
                'volume', ROUND((p_total_amount * ((v_flavor->>'percent')::DECIMAL / 100))::NUMERIC, 2),
                'percent', ROUND((v_flavor->>'percent')::NUMERIC, 1)
            )
        );
    END LOOP;
    
    -- Sladidlo
    IF p_sweetener_percent > 0 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'shisha_sweetener',
                'sweetenerType', p_sweetener,
                'volume', ROUND((p_total_amount * (p_sweetener_percent / 100))::NUMERIC, 2),
                'percent', p_sweetener_percent
            )
        );
    END IF;
    
    -- Glycerin
    IF p_glycerin_ratio > 0 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object('ingredientKey', 'glycerin', 'volume', ROUND((p_total_amount * (p_glycerin_ratio / 100))::NUMERIC, 2), 'percent', p_glycerin_ratio)
        );
    END IF;
    
    -- VG
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'vg', 'volume', ROUND((p_total_amount * (p_vg_ratio / 100))::NUMERIC, 2), 'percent', p_vg_ratio)
    );
    
    -- PG (zbytek)
    DECLARE
        v_pg_percent DECIMAL := 100 - v_total_flavor_percent - p_sweetener_percent - p_glycerin_ratio - p_vg_ratio;
    BEGIN
        IF v_pg_percent > 0 THEN
            v_ingredients := v_ingredients || jsonb_build_array(
                jsonb_build_object('ingredientKey', 'pg', 'volume', ROUND((p_total_amount * (v_pg_percent / 100))::NUMERIC, 2), 'percent', v_pg_percent)
            );
        END IF;
    END;
    
    v_result := jsonb_build_object(
        'formType', 'shisha',
        'totalAmount', p_total_amount,
        'vgRatio', p_vg_ratio,
        'vgPercent', p_vg_ratio,
        'pgPercent', 100 - p_vg_ratio,
        'glycerinRatio', p_glycerin_ratio,
        'sweetener', p_sweetener,
        'sweetenerPercent', p_sweetener_percent,
        'flavors', p_flavors,
        'notes', p_notes,
        'ingredients', v_ingredients
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION build_shortfill_recipe(
    p_total_amount DECIMAL,
    p_vg_ratio DECIMAL,
    p_flavor_type TEXT,
    p_flavor_name TEXT,
    p_flavor_percent DECIMAL
) RETURNS JSONB AS $$
DECLARE
    v_pg_ratio DECIMAL;
    v_flavor_volume DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    v_ingredients JSONB := '[]'::JSONB;
    v_result JSONB;
BEGIN
    v_pg_ratio := 100 - p_vg_ratio;
    
    -- Příchuť
    v_flavor_volume := p_total_amount * (p_flavor_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object(
            'ingredientKey', 'flavor',
            'flavorType', p_flavor_type,
            'flavorName', p_flavor_name,
            'volume', ROUND(v_flavor_volume::NUMERIC, 2),
            'percent', ROUND(p_flavor_percent::NUMERIC, 1),
            'params', jsonb_build_object('vgpg', '0/100')
        )
    );
    
    -- VG a PG
    v_remaining_percent := 100 - p_flavor_percent;
    
    v_vg_percent := (p_vg_ratio / 100) * v_remaining_percent;
    v_vg_volume := p_total_amount * (v_vg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'vg', 'volume', ROUND(v_vg_volume::NUMERIC, 2), 'percent', ROUND(v_vg_percent::NUMERIC, 1))
    );
    
    v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
    v_pg_volume := p_total_amount * (v_pg_percent / 100);
    v_ingredients := v_ingredients || jsonb_build_array(
        jsonb_build_object('ingredientKey', 'pg', 'volume', ROUND(v_pg_volume::NUMERIC, 2), 'percent', ROUND(v_pg_percent::NUMERIC, 1))
    );
    
    v_result := jsonb_build_object(
        'formType', 'shortfill',
        'totalAmount', p_total_amount,
        'vgRatio', p_vg_ratio,
        'vgPercent', p_vg_ratio,
        'pgPercent', v_pg_ratio,
        'flavorType', p_flavor_type,
        'flavorName', p_flavor_name,
        'flavorPercent', p_flavor_percent,
        'nicotine', 0,
        'ingredients', v_ingredients
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KROK 3: LIQUID RECEPTY (60)
-- ============================================

-- 1. Strawberry Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Idealni pro celodenni vapovani.', true, 'liquid', 'beginner', 4.3, 15, 
build_liquid_recipe(30, 70, 3, 20, 'fruit', 'Jahoda', 10, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh (0mg)', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 12, 
build_liquid_recipe(30, 70, 0, 0, 'fruit', 'Jahoda', 10, 7), NOW());

-- 2. Blueberry Burst
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Oblibena klasika mezi DIY mixery.', true, 'liquid', 'beginner', 4.5, 22, 
build_liquid_recipe(30, 70, 3, 20, 'berry', 'Borůvka', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst (0mg)', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 18, 
build_liquid_recipe(30, 70, 0, 0, 'berry', 'Borůvka', 12, 7), NOW());

-- 3. Watermelon Summer
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Lehky a svezi.', true, 'liquid', 'beginner', 4.2, 14, 
build_liquid_recipe(30, 70, 3, 20, 'watermelon', 'Meloun', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer (0mg)', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 11, 
build_liquid_recipe(30, 70, 0, 0, 'watermelon', 'Meloun', 12, 7), NOW());

-- 4. Mango Paradise
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise', 'Exoticka mangova slast s kremovym podtonem. Jeden z nejoblibenejsich tropickych profilu.', true, 'liquid', 'beginner', 4.6, 28, 
build_liquid_recipe(30, 70, 3, 20, 'tropical', 'Mango', 15, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise (0mg)', 'Exoticka mangova slast s kremovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.5, 21, 
build_liquid_recipe(30, 70, 0, 0, 'tropical', 'Mango', 15, 10), NOW());

-- 5. Apple Crisp
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp', 'Krupave zelene jablko s lehkou kyselosti. Cisty a osvezujici profil pro kazdodenni use.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 3, 20, 'fruit', 'Jablko', 10, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp (0mg)', 'Krupave zelene jablko s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
build_liquid_recipe(30, 70, 0, 0, 'fruit', 'Jablko', 10, 7), NOW());

-- 6. Peach Dream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream', 'Stavnata broskev s jemnym kvetinovym nadechem. Hladky a prirozeny ovocny profil.', true, 'liquid', 'beginner', 4.4, 19, 
build_liquid_recipe(30, 70, 3, 20, 'peach', 'Broskev', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream (0mg)', 'Stavnata broskev s jemnym kvetinovym nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 15, 
build_liquid_recipe(30, 70, 0, 0, 'peach', 'Broskev', 12, 7), NOW());

-- 7. Grape Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic', 'Sladke fialove hrozny s autentickou chuti. Nostalgicka chut detstvi.', true, 'liquid', 'beginner', 4.2, 16, 
build_liquid_recipe(30, 70, 3, 20, 'grape', 'Hroznové víno', 15, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic (0mg)', 'Sladke fialove hrozny s autentickou chuti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 0, 0, 'grape', 'Hroznové víno', 15, 7), NOW());

-- 8. Raspberry Delight
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight', 'Stavnate maliny s lehkou kyselosti. Perfektni balance sladkeho a kyseleho.', true, 'liquid', 'beginner', 4.4, 20, 
build_liquid_recipe(30, 70, 3, 20, 'berry', 'Malina', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight (0mg)', 'Stavnate maliny s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 17, 
build_liquid_recipe(30, 70, 0, 0, 'berry', 'Malina', 12, 7), NOW());

-- 9. Pineapple Tropical
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical', 'Tropicky ananas s jemnou sladkosti. Jako dovolena v lahvicce.', true, 'liquid', 'beginner', 4.3, 17, 
build_liquid_recipe(30, 70, 3, 20, 'tropical', 'Ananas', 15, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical (0mg)', 'Tropicky ananas s jemnou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
build_liquid_recipe(30, 70, 0, 0, 'tropical', 'Ananas', 15, 10), NOW());

-- 10. Cherry Sweet
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet', 'Sladka visen s bohatym aroma. Klasicka ovocna prichut pro kazdy den.', true, 'liquid', 'beginner', 4.3, 18, 
build_liquid_recipe(30, 70, 3, 20, 'fruit', 'Višeň', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet (0mg)', 'Sladka visen s bohatym aroma. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 70, 0, 0, 'fruit', 'Višeň', 12, 7), NOW());

-- 11. Lemon Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh', 'Svezi citronova osvezujici chut. Idealni pro letni dny.', true, 'liquid', 'beginner', 4.1, 14, 
build_liquid_recipe(30, 70, 3, 20, 'citrus', 'Citrón', 10, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh (0mg)', 'Svezi citronova osvezujici chut. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 11, 
build_liquid_recipe(30, 70, 0, 0, 'citrus', 'Citrón', 10, 7), NOW());

-- 12. Orange Citrus
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus', 'Sladky pomeranc s citrusovym nadechem. Slunecna chut celeho dne.', true, 'liquid', 'beginner', 4.2, 16, 
build_liquid_recipe(30, 70, 3, 20, 'citrus', 'Pomeranč', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus (0mg)', 'Sladky pomeranc s citrusovym nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 0, 0, 'citrus', 'Pomeranč', 12, 7), NOW());

-- 13. Cool Menthol
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cool Menthol', 'Ledovy mentol pro maximalni osvezeni. Klasika pro milovniky chladu.', true, 'liquid', 'beginner', 4.4, 25, 
build_liquid_recipe(30, 70, 3, 20, 'menthol', 'Mentol', 8, 3), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cool Menthol (0mg)', 'Ledovy mentol pro maximalni osvezeni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 20, 
build_liquid_recipe(30, 70, 0, 0, 'menthol', 'Mentol', 8, 3), NOW());

-- 14. Vanilla Dream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream', 'Kremova vanilka s jemnou sladkosti. Hladka a prijemna chut.', true, 'liquid', 'beginner', 4.5, 28, 
build_liquid_recipe(30, 70, 3, 20, 'cream', 'Vanilka', 10, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream (0mg)', 'Kremova vanilka s jemnou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 22, 
build_liquid_recipe(30, 70, 0, 0, 'cream', 'Vanilka', 10, 14), NOW());

-- 15. Classic Tobacco
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco', 'Autenticky tabakovy profil pro prechazejici kuraky. Hladky a bohatý.', true, 'liquid', 'beginner', 4.3, 19, 
build_liquid_recipe(30, 50, 6, 20, 'tobacco', 'Tabák Virginia', 12, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco (0mg)', 'Autenticky tabakovy profil. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 50, 0, 0, 'tobacco', 'Tabák Virginia', 12, 21), NOW());

-- 16. Coffee Morning
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Morning', 'Silna kavova chut pro ranni start. Aromaticka a intenzivni.', true, 'liquid', 'beginner', 4.4, 21, 
build_liquid_recipe(30, 60, 3, 20, 'coffee', 'Káva', 10, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Morning (0mg)', 'Silna kavova chut pro ranni start. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 17, 
build_liquid_recipe(30, 60, 0, 0, 'coffee', 'Káva', 10, 14), NOW());

-- 17. Caramel Sweet
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet', 'Sladky karamel s maslovym podtonem. Desertnni pozitok.', true, 'liquid', 'beginner', 4.3, 18, 
build_liquid_recipe(30, 70, 3, 20, 'dessert', 'Karamel', 12, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet (0mg)', 'Sladky karamel s maslovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
build_liquid_recipe(30, 70, 0, 0, 'dessert', 'Karamel', 12, 14), NOW());

-- 18. Honey Gold
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Honey Gold', 'Zlaty med s prirodni sladkosti. Jemny a hebky.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 70, 3, 20, 'dessert', 'Med', 10, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Honey Gold (0mg)', 'Zlaty med s prirodni sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 12, 
build_liquid_recipe(30, 70, 0, 0, 'dessert', 'Med', 10, 10), NOW());

-- 19. Bubblegum Pop
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Bubblegum Pop', 'Nostalgicka zvykackova chut z detstvi. Sladka a hrava.', true, 'liquid', 'beginner', 4.1, 14, 
build_liquid_recipe(30, 70, 3, 20, 'candy', 'Žvýkačka', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Bubblegum Pop (0mg)', 'Nostalgicka zvykackova chut z detstvi. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 11, 
build_liquid_recipe(30, 70, 0, 0, 'candy', 'Žvýkačka', 12, 7), NOW());

-- 20. Energy Rush
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Rush', 'Energeticky napoj v podobe liquidu. Osvezujici a stimulujici.', true, 'liquid', 'beginner', 4.2, 16, 
build_liquid_recipe(30, 70, 3, 20, 'beverage', 'Energy drink', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Rush (0mg)', 'Energeticky napoj v podobe liquidu. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 0, 0, 'beverage', 'Energy drink', 12, 7), NOW());

-- 21. Cola Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic', 'Klasicka cola s autentickou chuti. Perlivy a osvezujici.', true, 'liquid', 'beginner', 4.3, 19, 
build_liquid_recipe(30, 70, 3, 20, 'beverage', 'Cola', 12, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic (0mg)', 'Klasicka cola s autentickou chuti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 70, 0, 0, 'beverage', 'Cola', 12, 7), NOW());

-- 22. Spearmint Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Fresh', 'Svezi mata s chladivym efektem. Cistici a osvezujici.', true, 'liquid', 'beginner', 4.2, 17, 
build_liquid_recipe(30, 70, 3, 20, 'menthol', 'Máta', 10, 5), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Fresh (0mg)', 'Svezi mata s chladivym efektem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 14, 
build_liquid_recipe(30, 70, 0, 0, 'menthol', 'Máta', 10, 5), NOW());

-- 23. Lime Zest
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest', 'Svezi limetka s kyselym nadechem. Tropicka a osvezujici.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 3, 20, 'citrus', 'Limetka', 10, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest (0mg)', 'Svezi limetka s kyselym nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
build_liquid_recipe(30, 70, 0, 0, 'citrus', 'Limetka', 10, 7), NOW());

-- 24. Grapefruit Tangy
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy', 'Lehce horky grapefruit. Osvezujici citrusova bomba.', true, 'liquid', 'beginner', 4.0, 12, 
build_liquid_recipe(30, 70, 3, 20, 'citrus', 'Grapefruit', 10, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy (0mg)', 'Lehce horky grapefruit. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 9, 
build_liquid_recipe(30, 70, 0, 0, 'citrus', 'Grapefruit', 10, 7), NOW());

-- 25. Turkish Blend
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Turkish Blend', 'Orientalni turecky tabak. Bohata a komplexni chut.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 50, 6, 20, 'tobacco', 'Turecký tabák', 12, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Turkish Blend (0mg)', 'Orientalni turecky tabak. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 12, 
build_liquid_recipe(30, 50, 0, 0, 'tobacco', 'Turecký tabák', 12, 21), NOW());

-- 26. Hazelnut Cream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Cream', 'Kremovy liskovy orisek. Oriskova slast.', true, 'liquid', 'beginner', 4.3, 17, 
build_liquid_recipe(30, 70, 3, 20, 'nut', 'Lískový oříšek', 10, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Cream (0mg)', 'Kremovy liskovy orisek. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
build_liquid_recipe(30, 70, 0, 0, 'nut', 'Lískový oříšek', 10, 14), NOW());

-- 27. Almond Delight
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Almond Delight', 'Jemna mandlova chut s marcipanovym podtonem.', true, 'liquid', 'beginner', 4.1, 14, 
build_liquid_recipe(30, 70, 3, 20, 'nut', 'Mandle', 10, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Almond Delight (0mg)', 'Jemna mandlova chut. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 11, 
build_liquid_recipe(30, 70, 0, 0, 'nut', 'Mandle', 10, 14), NOW());

-- 28. Cinnamon Spice
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cinnamon Spice', 'Korenena skorice s teplem. Zimni klasika.', true, 'liquid', 'beginner', 4.2, 16, 
build_liquid_recipe(30, 70, 3, 20, 'spice', 'Skořice', 8, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cinnamon Spice (0mg)', 'Korenena skorice s teplem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
build_liquid_recipe(30, 70, 0, 0, 'spice', 'Skořice', 8, 10), NOW());

-- 29. Cookie Butter
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter', 'Maslova susenka s vanilkou. Desertnni pote.', true, 'liquid', 'beginner', 4.4, 20, 
build_liquid_recipe(30, 70, 3, 20, 'dessert', 'Máslová sušenka', 12, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter (0mg)', 'Maslova susenka s vanilkou. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 16, 
build_liquid_recipe(30, 70, 0, 0, 'dessert', 'Máslová sušenka', 12, 14), NOW());

-- 30. Cream Puff
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cream Puff', 'Kremovy vetrnik s vanilkou. Nadychany dezert.', true, 'liquid', 'beginner', 4.3, 18, 
build_liquid_recipe(30, 70, 3, 20, 'dessert', 'Větrník', 12, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cream Puff (0mg)', 'Kremovy vetrnik s vanilkou. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 15, 
build_liquid_recipe(30, 70, 0, 0, 'dessert', 'Větrník', 12, 14), NOW());

-- ============================================
-- KROK 4: LIQUID PRO RECEPTY (60)
-- ============================================

-- Intermediate (2 flavors) - 15 recipes x 2 = 30
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream', 'Jahody se smetanou. Klasicky kremovy dezert.', true, 'liquidpro', 'intermediate', 4.5, 28, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Jahoda","percent":8},{"type":"cream","name":"Vanilkový krém","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream (0mg)', 'Jahody se smetanou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Jahoda","percent":8},{"type":"cream","name":"Vanilkový krém","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade', 'Boruvkova limonada. Osvezujici letni mix.', true, 'liquidpro', 'intermediate', 4.4, 22, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"berry","name":"Borůvka","percent":8},{"type":"citrus","name":"Citrón","percent":5}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade (0mg)', 'Boruvkova limonada. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 18, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"berry","name":"Borůvka","percent":8},{"type":"citrus","name":"Citrón","percent":5}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango', 'Broskev s mangem. Tropicky ovocny mix.', true, 'liquidpro', 'intermediate', 4.5, 25, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"peach","name":"Broskev","percent":7},{"type":"tropical","name":"Mango","percent":6}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango (0mg)', 'Broskev s mangem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 20, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"peach","name":"Broskev","percent":7},{"type":"tropical","name":"Mango","percent":6}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon', 'Jablko se skorici. Jako jablecny zavin.', true, 'liquidpro', 'intermediate', 4.4, 23, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Jablko","percent":8},{"type":"spice","name":"Skořice","percent":4}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon (0mg)', 'Jablko se skorici. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Jablko","percent":8},{"type":"spice","name":"Skořice","percent":4}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon', 'Ledovy meloun. Chlad a svezest.', true, 'liquidpro', 'intermediate', 4.3, 21, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"watermelon","name":"Meloun","percent":10},{"type":"menthol","name":"Mentol","percent":3}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon (0mg)', 'Ledovy meloun. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 17, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"watermelon","name":"Meloun","percent":10},{"type":"menthol","name":"Mentol","percent":3}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard', 'Vanilkovy pudink. Kremovy dezert.', true, 'liquidpro', 'intermediate', 4.6, 30, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"cream","name":"Vanilka","percent":7},{"type":"custard","name":"Custard","percent":6}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard (0mg)', 'Vanilkovy pudink. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.5, 24, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"cream","name":"Vanilka","percent":7},{"type":"custard","name":"Custard","percent":6}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey', 'Tabak s medem. Sladky tabakovy profil.', true, 'liquidpro', 'intermediate', 4.3, 19, 
build_liquidpro_recipe(30, 50, 6, 20, '[{"type":"tobacco","name":"Tabák Virginia","percent":8},{"type":"dessert","name":"Med","percent":4}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey (0mg)', 'Tabak s medem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 15, 
build_liquidpro_recipe(30, 50, 0, 0, '[{"type":"tobacco","name":"Tabák Virginia","percent":8},{"type":"dessert","name":"Med","percent":4}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake', 'Malinovy cheesecake. Kremovy dezert.', true, 'liquidpro', 'intermediate', 4.5, 27, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"berry","name":"Malina","percent":7},{"type":"dessert","name":"Cheesecake","percent":6}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake (0mg)', 'Malinovy cheesecake. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"berry","name":"Malina","percent":7},{"type":"dessert","name":"Cheesecake","percent":6}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy', 'Hroznovy bonbon. Sladka nostalgicka chut.', true, 'liquidpro', 'intermediate', 4.2, 18, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"grape","name":"Hroznové víno","percent":8},{"type":"candy","name":"Bonbón","percent":5}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy (0mg)', 'Hroznovy bonbon. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.1, 14, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"grape","name":"Hroznové víno","percent":8},{"type":"candy","name":"Bonbón","percent":5}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol', 'Visen s mentolem. Chlad a ovoce.', true, 'liquidpro', 'intermediate', 4.3, 20, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Višeň","percent":9},{"type":"menthol","name":"Mentol","percent":4}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol (0mg)', 'Visen s mentolem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 16, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Višeň","percent":9},{"type":"menthol","name":"Mentol","percent":4}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel', 'Karamelova susenka. Sladky dezert.', true, 'liquidpro', 'intermediate', 4.4, 23, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"dessert","name":"Máslová sušenka","percent":7},{"type":"dessert","name":"Karamel","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel (0mg)', 'Karamelova susenka. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"dessert","name":"Máslová sušenka","percent":7},{"type":"dessert","name":"Karamel","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Hazelnut', 'Kava s liskovym oriskem. Ranni pozitok.', true, 'liquidpro', 'intermediate', 4.5, 26, 
build_liquidpro_recipe(30, 60, 3, 20, '[{"type":"coffee","name":"Káva","percent":7},{"type":"nut","name":"Lískový oříšek","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Hazelnut (0mg)', 'Kava s liskovym oriskem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 21, 
build_liquidpro_recipe(30, 60, 0, 0, '[{"type":"coffee","name":"Káva","percent":7},{"type":"nut","name":"Lískový oříšek","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Pineapple', 'Kokos s ananasem. Tropicky raj.', true, 'liquidpro', 'intermediate', 4.4, 22, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"tropical","name":"Kokos","percent":7},{"type":"tropical","name":"Ananas","percent":6}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Pineapple (0mg)', 'Kokos s ananasem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 18, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"tropical","name":"Kokos","percent":7},{"type":"tropical","name":"Ananas","percent":6}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Cream', 'Bananovy krem. Sladky a kremovy.', true, 'liquidpro', 'intermediate', 4.3, 20, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Banán","percent":8},{"type":"cream","name":"Vanilkový krém","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Cream (0mg)', 'Bananovy krem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 16, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Banán","percent":8},{"type":"cream","name":"Vanilkový krém","percent":5}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry', 'Kiwi s jahodou. Ovocna svezest.', true, 'liquidpro', 'intermediate', 4.3, 19, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Kiwi","percent":7},{"type":"fruit","name":"Jahoda","percent":6}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry (0mg)', 'Kiwi s jahodou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 15, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Kiwi","percent":7},{"type":"fruit","name":"Jahoda","percent":6}]'::jsonb, 7), NOW());

-- Expert (3 flavors) - 10 recipes x 2 = 20
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol', 'Jahoda, kiwi a mentol. Ledova ovocna bomba.', true, 'liquidpro', 'expert', 4.5, 28, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Jahoda","percent":6},{"type":"fruit","name":"Kiwi","percent":5},{"type":"menthol","name":"Mentol","percent":3}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol (0mg)', 'Jahoda, kiwi a mentol. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 23, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Jahoda","percent":6},{"type":"fruit","name":"Kiwi","percent":5},{"type":"menthol","name":"Mentol","percent":3}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise', 'Mango, ananas a kokos. Tropicky raj.', true, 'liquidpro', 'expert', 4.6, 32, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Kokos","percent":4}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise (0mg)', 'Mango, ananas a kokos. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.5, 26, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Kokos","percent":4}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion', 'Boruvka, malina a jahoda. Ovocny mix.', true, 'liquidpro', 'expert', 4.5, 29, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"berry","name":"Borůvka","percent":5},{"type":"berry","name":"Malina","percent":5},{"type":"fruit","name":"Jahoda","percent":5}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion (0mg)', 'Boruvka, malina a jahoda. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 24, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"berry","name":"Borůvka","percent":5},{"type":"berry","name":"Malina","percent":5},{"type":"fruit","name":"Jahoda","percent":5}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4', 'Tabak RY4 s vanilkou a karamelem. Klasicky RY4.', true, 'liquidpro', 'expert', 4.4, 25, 
build_liquidpro_recipe(30, 50, 6, 20, '[{"type":"tobacco","name":"Tabák RY4","percent":6},{"type":"cream","name":"Vanilka","percent":4},{"type":"dessert","name":"Karamel","percent":3}]'::jsonb, 28), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4 (0mg)', 'Tabak RY4 s vanilkou a karamelem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.3, 20, 
build_liquidpro_recipe(30, 50, 0, 0, '[{"type":"tobacco","name":"Tabák RY4","percent":6},{"type":"cream","name":"Vanilka","percent":4},{"type":"dessert","name":"Karamel","percent":3}]'::jsonb, 28), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm', 'Pomeranc, citron a grapefruit. Citrusova exploze.', true, 'liquidpro', 'expert', 4.4, 24, 
build_liquidpro_recipe(30, 60, 3, 20, '[{"type":"citrus","name":"Pomeranč","percent":6},{"type":"citrus","name":"Citrón","percent":5},{"type":"citrus","name":"Grapefruit","percent":4}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm (0mg)', 'Pomeranc, citron a grapefruit. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.3, 19, 
build_liquidpro_recipe(30, 60, 0, 0, '[{"type":"citrus","name":"Pomeranč","percent":6},{"type":"citrus","name":"Citrón","percent":5},{"type":"citrus","name":"Grapefruit","percent":4}]'::jsonb, 7), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passionfruit Ice', 'Mango, marakuja a led. Exoticka ledova svezest.', true, 'liquidpro', 'expert', 4.5, 27, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Marakuja","percent":5},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passionfruit Ice (0mg)', 'Mango, marakuja a led. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 23, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Marakuja","percent":5},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 10), NOW());

-- Virtuoso (4 flavors) - 5 recipes x 2 = 10
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Mix', 'Jahoda, malina, boruvka a citron. Ovocna symfonie.', true, 'liquidpro', 'virtuoso', 4.6, 32, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"fruit","name":"Jahoda","percent":5},{"type":"berry","name":"Malina","percent":4},{"type":"berry","name":"Borůvka","percent":4},{"type":"citrus","name":"Citrón","percent":3}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Mix (0mg)', 'Jahoda, malina, boruvka a citron. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.5, 27, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"fruit","name":"Jahoda","percent":5},{"type":"berry","name":"Malina","percent":4},{"type":"berry","name":"Borůvka","percent":4},{"type":"citrus","name":"Citrón","percent":3}]'::jsonb, 10), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Heaven', 'Vanilka, karamel, susenka a smetana. Desertnni raj.', true, 'liquidpro', 'virtuoso', 4.7, 35, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"cream","name":"Vanilka","percent":4},{"type":"dessert","name":"Karamel","percent":4},{"type":"dessert","name":"Máslová sušenka","percent":4},{"type":"cream","name":"Smetana","percent":3}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Heaven (0mg)', 'Vanilka, karamel, susenka a smetana. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.6, 29, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"cream","name":"Vanilka","percent":4},{"type":"dessert","name":"Karamel","percent":4},{"type":"dessert","name":"Máslová sušenka","percent":4},{"type":"cream","name":"Smetana","percent":3}]'::jsonb, 21), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Storm', 'Mango, ananas, kokos a ledovy mentol. Tropicka boure.', true, 'liquidpro', 'virtuoso', 4.6, 33, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"tropical","name":"Mango","percent":5},{"type":"tropical","name":"Ananas","percent":4},{"type":"tropical","name":"Kokos","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Storm (0mg)', 'Mango, ananas, kokos a ledovy mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.5, 28, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"tropical","name":"Mango","percent":5},{"type":"tropical","name":"Ananas","percent":4},{"type":"tropical","name":"Kokos","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail', 'Mango, ananas, marakuja a ledovy mentol. Exoticky koktejl u plaze.', true, 'liquidpro', 'virtuoso', 4.7, 36, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"tropical","name":"Mango","percent":5},{"type":"tropical","name":"Ananas","percent":4},{"type":"tropical","name":"Marakuja","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail (0mg)', 'Mango, ananas, marakuja a ledovy mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.6, 30, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"tropical","name":"Mango","percent":5},{"type":"tropical","name":"Ananas","percent":4},{"type":"tropical","name":"Marakuja","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream', 'Boruvka, malina, jogurt a granola. Snidanovy dezert.', true, 'liquidpro', 'virtuoso', 4.4, 24, 
build_liquidpro_recipe(30, 70, 3, 20, '[{"type":"berry","name":"Borůvka","percent":5},{"type":"berry","name":"Malina","percent":4},{"type":"dairy","name":"Jogurt","percent":4},{"type":"dessert","name":"Granola","percent":2}]'::jsonb, 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream (0mg)', 'Boruvka, malina, jogurt a granola. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.3, 20, 
build_liquidpro_recipe(30, 70, 0, 0, '[{"type":"berry","name":"Borůvka","percent":5},{"type":"berry","name":"Malina","percent":4},{"type":"dairy","name":"Jogurt","percent":4},{"type":"dessert","name":"Granola","percent":2}]'::jsonb, 14), NOW());

-- ============================================
-- KROK 5: SHORTFILL RECEPTY (20)
-- ============================================

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Shortfill', 'Exoticke mango pro shortfill. Tropicky a sladky.', true, 'shortfill', 'beginner', 4.6, 72, 
build_shortfill_recipe(60, 70, 'tropical', 'Mango', 20), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Shortfill', 'Svezi jahoda pro shortfill. Ovocna klasika.', true, 'shortfill', 'beginner', 4.5, 68, 
build_shortfill_recipe(60, 70, 'fruit', 'Jahoda', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Shortfill', 'Osvezujici meloun pro shortfill. Letni svezest.', true, 'shortfill', 'beginner', 4.4, 58, 
build_shortfill_recipe(60, 70, 'watermelon', 'Meloun', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Shortfill', 'Sladka boruvka pro shortfill. Berry klasika.', true, 'shortfill', 'beginner', 4.4, 52, 
build_shortfill_recipe(60, 70, 'berry', 'Borůvka', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Shortfill', 'Sladke hrozny pro shortfill. Nostalgicka chut.', true, 'shortfill', 'beginner', 4.3, 48, 
build_shortfill_recipe(60, 70, 'grape', 'Hroznové víno', 20), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Shortfill', 'Stavnata broskev pro shortfill. Jemna a sladka.', true, 'shortfill', 'beginner', 4.4, 55, 
build_shortfill_recipe(60, 70, 'peach', 'Broskev', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Shortfill', 'Zelene jablko pro shortfill. Krupave a svezi.', true, 'shortfill', 'beginner', 4.3, 45, 
build_shortfill_recipe(60, 70, 'fruit', 'Jablko', 16), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Shortfill', 'Sladka visen pro shortfill. Intenzivni chut.', true, 'shortfill', 'beginner', 4.3, 42, 
build_shortfill_recipe(60, 70, 'fruit', 'Višeň', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Shortfill', 'Ledovy mentol pro shortfill. Maximalni osvezeni.', true, 'shortfill', 'beginner', 4.5, 62, 
build_shortfill_recipe(60, 70, 'menthol', 'Mentol', 12), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Shortfill', 'Klasicky tabak pro shortfill. Pro prechazejici kuraky.', true, 'shortfill', 'beginner', 4.2, 38, 
build_shortfill_recipe(60, 50, 'tobacco', 'Tabák Virginia', 15), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Shortfill', 'Kremova vanilka pro shortfill. Hladka a sladka.', true, 'shortfill', 'beginner', 4.5, 58, 
build_shortfill_recipe(60, 70, 'cream', 'Vanilka', 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Shortfill', 'Silna kava pro shortfill. Ranni energie.', true, 'shortfill', 'beginner', 4.4, 52, 
build_shortfill_recipe(60, 60, 'coffee', 'Káva', 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Shortfill', 'Svezi citron pro shortfill. Citrusova svezest.', true, 'shortfill', 'beginner', 4.2, 40, 
build_shortfill_recipe(60, 70, 'citrus', 'Citrón', 14), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Shortfill', 'Sladky pomeranc pro shortfill. Slunecna chut.', true, 'shortfill', 'beginner', 4.3, 45, 
build_shortfill_recipe(60, 70, 'citrus', 'Pomeranč', 16), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Shortfill', 'Kyselkava malina pro shortfill. Ovocna bomba.', true, 'shortfill', 'beginner', 4.3, 43, 
build_shortfill_recipe(60, 70, 'berry', 'Malina', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Shortfill', 'Tropicky ananas pro shortfill. Exoticka svezest.', true, 'shortfill', 'beginner', 4.4, 50, 
build_shortfill_recipe(60, 70, 'tropical', 'Ananas', 18), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Shortfill', 'Kremovy kokos pro shortfill. Tropicky raj.', true, 'shortfill', 'beginner', 4.2, 38, 
build_shortfill_recipe(60, 70, 'tropical', 'Kokos', 16), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Shortfill', 'Kremovy banan pro shortfill. Sladky a plny.', true, 'shortfill', 'beginner', 4.3, 42, 
build_shortfill_recipe(60, 70, 'fruit', 'Banán', 16), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Shortfill', 'Svezi kiwi pro shortfill. Kyselkave a osvezujici.', true, 'shortfill', 'beginner', 4.2, 36, 
build_shortfill_recipe(60, 70, 'fruit', 'Kiwi', 16), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Shortfill', 'Energeticky napoj pro shortfill. Stimulujici a osvezujici.', true, 'shortfill', 'beginner', 4.3, 44, 
build_shortfill_recipe(60, 70, 'beverage', 'Energy drink', 16), NOW());

-- ============================================
-- KROK 6: SHISHA RECEPTY (90) - Základních 30
-- ============================================

-- Beginner (1 příchuť) - 22 receptů
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Double Apple Classic', 'Klasicky dvojity jablkovy tabak. Nejpopularnejsi prichut na svete.', true, 'shisha', 'beginner', 4.8, 156, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"apple","name":"Dvojité jablko","percent":15}]'::jsonb, 'Tradiční arabská příchuť'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mint Sensation', 'Svezi mata pro osvezujici zazitek. Idealni pro horke dny.', true, 'shisha', 'beginner', 4.6, 98, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"mint","name":"Máta","percent":12}]'::jsonb, 'Čistý mentolový zážitek'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Royale', 'Sladke hrozny s bohatou chuti. Kralovska prichut pro kazdy vecer.', true, 'shisha', 'beginner', 4.5, 87, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"grape","name":"Hroznové víno","percent":14}]'::jsonb, 'Sladké a ovocné'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Fresh', 'Stavnaty meloun pro letni vecerita. Osvezujici a sladky.', true, 'shisha', 'beginner', 4.7, 112, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"watermelon","name":"Meloun","percent":15}]'::jsonb, 'Letní klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Dream', 'Sladke boruvky z lesniho podrostu. Aromaticky a lahodny.', true, 'shisha', 'beginner', 4.4, 76, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"blueberry","name":"Borůvka","percent":13}]'::jsonb, 'Sladké lesní ovoce'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Paradise', 'Zlata broskev z Persie. Tradicni prichut pro hookah.', true, 'shisha', 'beginner', 4.5, 82, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"peach","name":"Broskev","percent":14}]'::jsonb, 'Aromatická broskev'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Sweet', 'Sladke jahody jako z plantaze. Univerzalni a oblibena.', true, 'shisha', 'beginner', 4.6, 94, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"strawberry","name":"Jahoda","percent":14}]'::jsonb, 'Sladké jahody'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Tropical', 'Exoticke mango z tropickych ostrovu. Intenzivni a sladke.', true, 'shisha', 'beginner', 4.7, 108, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"mango","name":"Mango","percent":15}]'::jsonb, 'Tropické mango'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Classic', 'Klasicka visen s bohatou chuti. Tradicni turecka prichut.', true, 'shisha', 'beginner', 4.4, 79, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"cherry","name":"Višeň","percent":13}]'::jsonb, 'Turecká klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Breeze', 'Stavnaty ananas z Karibiku. Exotika v kazdem nadechu.', true, 'shisha', 'beginner', 4.3, 68, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"pineapple","name":"Ananas","percent":14}]'::jsonb, 'Karibský ananas'), NOW());

-- Intermediate (2 příchutě) - 34 receptů (ukázka 10)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Double Apple Mint', 'Legendarni kombinace dvou jablek s matou. Nejpopularnejsi mix.', true, 'shisha', 'intermediate', 4.9, 234, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"apple","name":"Dvojité jablko","percent":12},{"type":"mint","name":"Máta","percent":6}]'::jsonb, 'Nejpopulárnější mix na světě'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Mint', 'Sladke hrozny s chladivou matou. Osvezujici klasika.', true, 'shisha', 'intermediate', 4.7, 145, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"grape","name":"Hroznové víno","percent":12},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Sladké a osvěžující'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Mint', 'Meloun s matou. Letni osvezeni.', true, 'shisha', 'intermediate', 4.6, 132, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"watermelon","name":"Meloun","percent":12},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Letní osvěžení'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Mint', 'Boruvka s matou. Lesni svezest.', true, 'shisha', 'intermediate', 4.5, 98, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"blueberry","name":"Borůvka","percent":11},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Lesní svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mint', 'Broskev s matou. Jemne osvezeni.', true, 'shisha', 'intermediate', 4.6, 97, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"peach","name":"Broskev","percent":12},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Jemné osvěžení'), NOW());

-- Expert (3 příchutě) - 24 receptů (ukázka 5)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Mix', 'Boruvka, malina a jahoda. Ovocna symfonie.', true, 'shisha', 'expert', 4.6, 112, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"blueberry","name":"Borůvka","percent":7},{"type":"raspberry","name":"Malina","percent":6},{"type":"strawberry","name":"Jahoda","percent":5}]'::jsonb, 'Ovocná symfonie'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Rose Mint', 'Hrozny, ruze a mata. Arabska klasika.', true, 'shisha', 'expert', 4.6, 105, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"grape","name":"Hroznové víno","percent":8},{"type":"rose","name":"Růže","percent":5},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Arabská klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Berry Mint', 'Marakuja, boruvka a mata. Tropicka svezest.', true, 'shisha', 'expert', 4.6, 101, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"passionfruit","name":"Marakuja","percent":7},{"type":"blueberry","name":"Borůvka","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Tropická svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Mango Mint', 'Ananas, mango a mata. Tropicky raj.', true, 'shisha', 'expert', 4.6, 108, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"pineapple","name":"Ananas","percent":7},{"type":"mango","name":"Mango","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Tropický ráj'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Passion Mango', 'Guava, marakuja a mango. Exoticka smesice.', true, 'shisha', 'expert', 4.6, 103, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"guava","name":"Guava","percent":6},{"type":"passionfruit","name":"Marakuja","percent":6},{"type":"mango","name":"Mango","percent":6}]'::jsonb, 'Exotická směsice'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Exotic Fusion', 'Mango, marakuja a kokos. Tropicka fuze.', true, 'shisha', 'expert', 4.6, 112, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"mango","name":"Mango","percent":7},{"type":"passionfruit","name":"Marakuja","percent":5},{"type":"coconut","name":"Kokos","percent":5}]'::jsonb, 'Tropická fúze'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Island Escape', 'Ananas, kokos a vanilka. Ostrovni unik.', true, 'shisha', 'expert', 4.6, 106, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"pineapple","name":"Ananas","percent":6},{"type":"coconut","name":"Kokos","percent":6},{"type":"vanilla","name":"Vanilka","percent":4}]'::jsonb, 'Ostrovní únik'), NOW());

-- Virtuoso (4 příchutě) - 10 receptů (ukázka 5)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Shisha Mix', 'Dvojite jablko, mata, hrozny a ruze. Ultimatni mix.', true, 'shisha', 'virtuoso', 4.8, 145, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"apple","name":"Dvojité jablko","percent":6},{"type":"mint","name":"Máta","percent":4},{"type":"grape","name":"Hroznové víno","percent":4},{"type":"rose","name":"Růže","percent":3}]'::jsonb, 'Ultimátní mix'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise Shisha', 'Mango, ananas, kokos a marakuja. Tropicky raj.', true, 'shisha', 'virtuoso', 4.7, 132, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"mango","name":"Mango","percent":5},{"type":"pineapple","name":"Ananas","percent":5},{"type":"coconut","name":"Kokos","percent":4},{"type":"passionfruit","name":"Marakuja","percent":4}]'::jsonb, 'Tropický ráj'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Heaven', 'Boruvka, malina, jahoda a ostruzina. Ovocne nebe.', true, 'shisha', 'virtuoso', 4.6, 118, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"blueberry","name":"Borůvka","percent":5},{"type":"raspberry","name":"Malina","percent":5},{"type":"strawberry","name":"Jahoda","percent":4},{"type":"blackberry","name":"Ostružina","percent":4}]'::jsonb, 'Ovocné nebe'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Garden', 'Pomeranc, citron, grapefruit a limetka. Citrusova zahrada.', true, 'shisha', 'virtuoso', 4.5, 95, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"orange","name":"Pomeranč","percent":5},{"type":"lemon","name":"Citrón","percent":4},{"type":"grapefruit","name":"Grapefruit","percent":4},{"type":"lime","name":"Limetka","percent":4}]'::jsonb, 'Citrusová zahrada'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Oriental Nights', 'Ruze, jasmin, med a vanilka. Orientalni noci.', true, 'shisha', 'virtuoso', 4.7, 125, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"rose","name":"Růže","percent":4},{"type":"jasmine","name":"Jasmín","percent":4},{"type":"honey","name":"Med","percent":4},{"type":"vanilla","name":"Vanilka","percent":4}]'::jsonb, 'Orientální noci'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pina Colada Shisha', 'Ananas, kokos, vanilka a rum. Pina colada pro shisha.', true, 'shisha', 'virtuoso', 4.6, 103, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"pineapple","name":"Ananas","percent":6},{"type":"coconut","name":"Kokos","percent":5},{"type":"vanilla","name":"Vanilka","percent":3},{"type":"rum","name":"Rum","percent":2}]'::jsonb, 'Piña Colada'), NOW());

-- ============================================
-- KROK 7: VERIFIKACE
-- ============================================

SELECT 
    form_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE recipe_data ? 'ingredients') as with_ingredients,
    COUNT(*) FILTER (WHERE recipe_data ? 'flavorName' OR recipe_data ? 'flavors') as with_flavor_names
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
GROUP BY form_type
ORDER BY form_type;

-- Ukázat pár příkladů
SELECT 
    name,
    form_type,
    recipe_data->>'vgPercent' as vg,
    jsonb_array_length(recipe_data->'ingredients') as ingredient_count,
    recipe_data->'ingredients'->0->>'flavorName' as first_flavor
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' 
  AND is_public = true
ORDER BY form_type, name
LIMIT 20;

-- ============================================
-- ČIŠTĚNÍ FUNKCÍ
-- ============================================
DROP FUNCTION IF EXISTS build_liquid_recipe(DECIMAL, DECIMAL, DECIMAL, DECIMAL, TEXT, TEXT, DECIMAL, INT);
DROP FUNCTION IF EXISTS build_liquidpro_recipe(DECIMAL, DECIMAL, DECIMAL, DECIMAL, JSONB, INT);
DROP FUNCTION IF EXISTS build_shisha_recipe(DECIMAL, DECIMAL, DECIMAL, TEXT, DECIMAL, JSONB, TEXT);
DROP FUNCTION IF EXISTS build_shortfill_recipe(DECIMAL, DECIMAL, TEXT, TEXT, DECIMAL);
