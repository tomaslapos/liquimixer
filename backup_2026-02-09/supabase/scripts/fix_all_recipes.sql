-- ============================================
-- FIX ALL RECIPES: Kompletní oprava seed receptů
-- Date: 2026-02-05
-- ============================================
-- Tento skript:
-- 1. Smaže VŠECHNY duplicitní recepty
-- 2. Aktualizuje VŠECHNY recepty s ingredients a flavorName
-- ============================================

-- ============================================
-- KROK 1: SMAZÁNÍ VŠECH DUPLICIT
-- ============================================

-- Zobrazit duplicity před smazáním
SELECT name, COUNT(*) as count
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- Smazat duplicity - ponechat pouze nejstarší
WITH duplicates AS (
    SELECT id, name, created_at,
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
    FROM recipes
    WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
)
DELETE FROM recipes
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Ověřit počet po smazání
SELECT COUNT(*) as total_recipes,
       COUNT(*) FILTER (WHERE form_type = 'liquid') as liquid_count,
       COUNT(*) FILTER (WHERE form_type = 'liquidpro') as liquidpro_count,
       COUNT(*) FILTER (WHERE form_type = 'shisha') as shisha_count,
       COUNT(*) FILTER (WHERE form_type = 'shortfill') as shortfill_count
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;

-- ============================================
-- KROK 2: UNIVERZÁLNÍ FUNKCE PRO UPDATE
-- ============================================

CREATE OR REPLACE FUNCTION fix_recipe_with_flavors(
    p_name TEXT,
    p_flavor_names TEXT[]
) RETURNS TEXT AS $$
DECLARE
    v_recipe RECORD;
    v_data JSONB;
    v_form_type TEXT;
    v_total_amount DECIMAL;
    v_vg_ratio DECIMAL;
    v_pg_ratio DECIMAL;
    v_nic_strength DECIMAL;
    v_nic_base DECIMAL;
    v_glycerin_ratio DECIMAL;
    v_sweetener TEXT;
    v_sweetener_percent DECIMAL;
    
    v_flavors JSONB;
    v_flavor JSONB;
    v_flavor_idx INT;
    v_flavor_type TEXT;
    v_flavor_name TEXT;
    v_flavor_percent DECIMAL;
    v_flavor_volume DECIMAL;
    v_single_flavor_percent DECIMAL;
    v_single_flavor_type TEXT;
    
    v_total_flavor_percent DECIMAL := 0;
    v_nic_volume DECIMAL := 0;
    v_nic_percent DECIMAL := 0;
    v_used_percent DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    v_glycerin_volume DECIMAL;
    v_sweetener_volume DECIMAL;
    
    v_ingredients JSONB;
    v_updated_flavors JSONB;
    v_updated_data JSONB;
BEGIN
    -- Najít recept
    SELECT * INTO v_recipe FROM recipes 
    WHERE name = p_name 
    AND clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' 
    AND is_public = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 'NOT FOUND: ' || p_name;
    END IF;
    
    v_data := v_recipe.recipe_data;
    v_form_type := COALESCE(v_data->>'formType', v_recipe.form_type);
    
    -- Načíst základní hodnoty
    v_total_amount := COALESCE((v_data->>'totalAmount')::DECIMAL, 30);
    v_vg_ratio := COALESCE((v_data->>'vgRatio')::DECIMAL, 70);
    v_pg_ratio := 100 - v_vg_ratio;
    v_nic_strength := COALESCE((v_data->>'nicStrength')::DECIMAL, 0);
    v_nic_base := COALESCE((v_data->>'nicBase')::DECIMAL, 20);
    
    -- SHISHA specifické
    v_glycerin_ratio := COALESCE((v_data->>'glycerinRatio')::DECIMAL, 0);
    v_sweetener := v_data->>'sweetener';
    v_sweetener_percent := COALESCE((v_data->>'sweetenerPercent')::DECIMAL, 0);
    
    -- Inicializovat
    v_ingredients := '[]'::JSONB;
    v_updated_flavors := '[]'::JSONB;
    
    -- Načíst příchutě
    v_flavors := v_data->'flavors';
    v_single_flavor_percent := (v_data->>'flavorPercent')::DECIMAL;
    v_single_flavor_type := v_data->>'flavorType';
    
    -- Zpracovat příchutě
    IF v_flavors IS NOT NULL AND jsonb_array_length(v_flavors) > 0 THEN
        -- Více příchutí (LIQUID PRO, SHISHA advanced, atd.)
        v_flavor_idx := 0;
        FOR v_flavor IN SELECT * FROM jsonb_array_elements(v_flavors)
        LOOP
            v_flavor_idx := v_flavor_idx + 1;
            v_flavor_percent := COALESCE((v_flavor->>'percent')::DECIMAL, 0);
            v_flavor_type := COALESCE(v_flavor->>'type', 'fruit');
            
            -- Použít název z parametru nebo existující
            IF p_flavor_names IS NOT NULL AND array_length(p_flavor_names, 1) >= v_flavor_idx THEN
                v_flavor_name := p_flavor_names[v_flavor_idx];
            ELSE
                v_flavor_name := COALESCE(v_flavor->>'name', v_flavor_type);
            END IF;
            
            v_total_flavor_percent := v_total_flavor_percent + v_flavor_percent;
            
            IF v_flavor_percent > 0 THEN
                v_flavor_volume := v_total_amount * (v_flavor_percent / 100);
                v_ingredients := v_ingredients || jsonb_build_array(
                    jsonb_build_object(
                        'ingredientKey', 'flavor',
                        'flavorType', v_flavor_type,
                        'flavorName', v_flavor_name,
                        'flavorNumber', v_flavor_idx,
                        'volume', ROUND(v_flavor_volume::NUMERIC, 2),
                        'percent', ROUND(v_flavor_percent::NUMERIC, 1),
                        'params', jsonb_build_object('vgpg', '0/100')
                    )
                );
            END IF;
            
            -- Aktualizovat flavor s name
            v_updated_flavors := v_updated_flavors || jsonb_build_array(
                jsonb_build_object(
                    'type', v_flavor_type,
                    'name', v_flavor_name,
                    'percent', v_flavor_percent
                )
            );
        END LOOP;
    ELSIF v_single_flavor_percent IS NOT NULL AND v_single_flavor_percent > 0 THEN
        -- Jedna příchuť (LIQUID, SHORTFILL)
        v_flavor_name := COALESCE(p_flavor_names[1], v_data->>'flavorName', v_single_flavor_type);
        v_total_flavor_percent := v_single_flavor_percent;
        v_flavor_volume := v_total_amount * (v_single_flavor_percent / 100);
        
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'flavor',
                'flavorType', COALESCE(v_single_flavor_type, 'fruit'),
                'flavorName', v_flavor_name,
                'volume', ROUND(v_flavor_volume::NUMERIC, 2),
                'percent', ROUND(v_single_flavor_percent::NUMERIC, 1),
                'params', jsonb_build_object('vgpg', '0/100')
            )
        );
    END IF;
    
    -- SHISHA: Přidat sladidlo
    IF v_sweetener IS NOT NULL AND v_sweetener_percent > 0 THEN
        v_sweetener_volume := v_total_amount * (v_sweetener_percent / 100);
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'sweetener',
                'sweetenerType', v_sweetener,
                'volume', ROUND(v_sweetener_volume::NUMERIC, 2),
                'percent', ROUND(v_sweetener_percent::NUMERIC, 1)
            )
        );
    END IF;
    
    -- Nikotin (pro liquid, liquidpro, shortfill)
    IF v_nic_strength > 0 AND v_nic_base > 0 THEN
        v_nic_volume := (v_nic_strength * v_total_amount) / v_nic_base;
        v_nic_percent := (v_nic_volume / v_total_amount) * 100;
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'nicotine_salt',
                'volume', ROUND(v_nic_volume::NUMERIC, 2),
                'percent', ROUND(v_nic_percent::NUMERIC, 1),
                'params', jsonb_build_object('strength', v_nic_base, 'vgpg', '50/50')
            )
        );
    END IF;
    
    -- Zbývající prostor
    v_used_percent := v_total_flavor_percent + v_nic_percent + COALESCE(v_sweetener_percent, 0);
    v_remaining_percent := 100 - v_used_percent;
    
    -- SHISHA: Glycerin
    IF v_glycerin_ratio > 0 THEN
        v_glycerin_volume := v_total_amount * (v_glycerin_ratio / 100);
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'glycerin',
                'volume', ROUND(v_glycerin_volume::NUMERIC, 2),
                'percent', ROUND(v_glycerin_ratio::NUMERIC, 1)
            )
        );
        v_remaining_percent := v_remaining_percent - v_glycerin_ratio;
    END IF;
    
    -- VG
    IF v_form_type = 'shisha' THEN
        v_vg_percent := v_vg_ratio;
        v_vg_volume := v_total_amount * (v_vg_percent / 100);
    ELSE
        v_vg_percent := (v_vg_ratio / 100) * v_remaining_percent;
        v_vg_volume := v_total_amount * (v_vg_percent / 100);
    END IF;
    
    IF v_vg_volume > 0.01 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'vg',
                'volume', ROUND(v_vg_volume::NUMERIC, 2),
                'percent', ROUND(v_vg_percent::NUMERIC, 1)
            )
        );
    END IF;
    
    -- PG
    IF v_form_type = 'shisha' THEN
        -- Pro shisha, PG je zbytek po všech ostatních
        v_pg_percent := 100 - v_total_flavor_percent - v_sweetener_percent - v_glycerin_ratio - v_vg_ratio;
        v_pg_volume := v_total_amount * (v_pg_percent / 100);
    ELSE
        v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
        v_pg_volume := v_total_amount * (v_pg_percent / 100);
    END IF;
    
    IF v_pg_volume > 0.01 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'pg',
                'volume', ROUND(v_pg_volume::NUMERIC, 2),
                'percent', ROUND(v_pg_percent::NUMERIC, 1)
            )
        );
    END IF;
    
    -- Sestavit aktualizovaná data
    v_updated_data := v_data;
    
    -- Přidat flavors s names pokud existují
    IF jsonb_array_length(v_updated_flavors) > 0 THEN
        v_updated_data := jsonb_set(v_updated_data, '{flavors}', v_updated_flavors);
    END IF;
    
    -- Přidat flavorName pro single-flavor recepty
    IF v_single_flavor_percent IS NOT NULL AND p_flavor_names IS NOT NULL AND array_length(p_flavor_names, 1) >= 1 THEN
        v_updated_data := jsonb_set(v_updated_data, '{flavorName}', to_jsonb(p_flavor_names[1]));
    END IF;
    
    v_updated_data := jsonb_set(v_updated_data, '{vgPercent}', to_jsonb(v_vg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{pgPercent}', to_jsonb(v_pg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{nicotine}', to_jsonb(COALESCE(v_nic_strength, 0)));
    v_updated_data := jsonb_set(v_updated_data, '{ingredients}', v_ingredients);
    
    -- UPDATE
    UPDATE recipes SET recipe_data = v_updated_data WHERE id = v_recipe.id;
    
    RETURN 'OK: ' || p_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KROK 3: AKTUALIZOVAT LIQUID RECEPTY
-- ============================================

SELECT fix_recipe_with_flavors('Strawberry Fresh', ARRAY['Jahoda']);
SELECT fix_recipe_with_flavors('Strawberry Fresh (0mg)', ARRAY['Jahoda']);
SELECT fix_recipe_with_flavors('Blueberry Burst', ARRAY['Borůvka']);
SELECT fix_recipe_with_flavors('Blueberry Burst (0mg)', ARRAY['Borůvka']);
SELECT fix_recipe_with_flavors('Watermelon Summer', ARRAY['Meloun']);
SELECT fix_recipe_with_flavors('Watermelon Summer (0mg)', ARRAY['Meloun']);
SELECT fix_recipe_with_flavors('Mango Paradise', ARRAY['Mango']);
SELECT fix_recipe_with_flavors('Mango Paradise (0mg)', ARRAY['Mango']);
SELECT fix_recipe_with_flavors('Apple Crisp', ARRAY['Jablko']);
SELECT fix_recipe_with_flavors('Apple Crisp (0mg)', ARRAY['Jablko']);
SELECT fix_recipe_with_flavors('Peach Dream', ARRAY['Broskev']);
SELECT fix_recipe_with_flavors('Peach Dream (0mg)', ARRAY['Broskev']);
SELECT fix_recipe_with_flavors('Grape Classic', ARRAY['Hroznové víno']);
SELECT fix_recipe_with_flavors('Grape Classic (0mg)', ARRAY['Hroznové víno']);
SELECT fix_recipe_with_flavors('Raspberry Delight', ARRAY['Malina']);
SELECT fix_recipe_with_flavors('Raspberry Delight (0mg)', ARRAY['Malina']);
SELECT fix_recipe_with_flavors('Pineapple Tropical', ARRAY['Ananas']);
SELECT fix_recipe_with_flavors('Pineapple Tropical (0mg)', ARRAY['Ananas']);
SELECT fix_recipe_with_flavors('Cherry Sweet', ARRAY['Višeň']);
SELECT fix_recipe_with_flavors('Cherry Sweet (0mg)', ARRAY['Višeň']);
SELECT fix_recipe_with_flavors('Lemon Fresh', ARRAY['Citrón']);
SELECT fix_recipe_with_flavors('Lemon Fresh (0mg)', ARRAY['Citrón']);
SELECT fix_recipe_with_flavors('Orange Citrus', ARRAY['Pomeranč']);
SELECT fix_recipe_with_flavors('Orange Citrus (0mg)', ARRAY['Pomeranč']);
SELECT fix_recipe_with_flavors('Lime Zest', ARRAY['Limetka']);
SELECT fix_recipe_with_flavors('Lime Zest (0mg)', ARRAY['Limetka']);
SELECT fix_recipe_with_flavors('Grapefruit Tangy', ARRAY['Grapefruit']);
SELECT fix_recipe_with_flavors('Grapefruit Tangy (0mg)', ARRAY['Grapefruit']);
SELECT fix_recipe_with_flavors('Cool Menthol', ARRAY['Mentol']);
SELECT fix_recipe_with_flavors('Cool Menthol (0mg)', ARRAY['Mentol']);
SELECT fix_recipe_with_flavors('Spearmint Fresh', ARRAY['Máta']);
SELECT fix_recipe_with_flavors('Spearmint Fresh (0mg)', ARRAY['Máta']);
SELECT fix_recipe_with_flavors('Vanilla Dream', ARRAY['Vanilka']);
SELECT fix_recipe_with_flavors('Vanilla Dream (0mg)', ARRAY['Vanilka']);
SELECT fix_recipe_with_flavors('Caramel Sweet', ARRAY['Karamel']);
SELECT fix_recipe_with_flavors('Caramel Sweet (0mg)', ARRAY['Karamel']);
SELECT fix_recipe_with_flavors('Honey Gold', ARRAY['Med']);
SELECT fix_recipe_with_flavors('Honey Gold (0mg)', ARRAY['Med']);
SELECT fix_recipe_with_flavors('Bubblegum Pop', ARRAY['Žvýkačka']);
SELECT fix_recipe_with_flavors('Bubblegum Pop (0mg)', ARRAY['Žvýkačka']);
SELECT fix_recipe_with_flavors('Classic Tobacco', ARRAY['Tabák Virginia']);
SELECT fix_recipe_with_flavors('Classic Tobacco (0mg)', ARRAY['Tabák Virginia']);
SELECT fix_recipe_with_flavors('Turkish Blend', ARRAY['Turecký tabák']);
SELECT fix_recipe_with_flavors('Turkish Blend (0mg)', ARRAY['Turecký tabák']);
SELECT fix_recipe_with_flavors('Coffee Morning', ARRAY['Káva']);
SELECT fix_recipe_with_flavors('Coffee Morning (0mg)', ARRAY['Káva']);
SELECT fix_recipe_with_flavors('Energy Rush', ARRAY['Energy drink']);
SELECT fix_recipe_with_flavors('Energy Rush (0mg)', ARRAY['Energy drink']);
SELECT fix_recipe_with_flavors('Cola Classic', ARRAY['Cola']);
SELECT fix_recipe_with_flavors('Cola Classic (0mg)', ARRAY['Cola']);
SELECT fix_recipe_with_flavors('Hazelnut Cream', ARRAY['Lískový oříšek']);
SELECT fix_recipe_with_flavors('Hazelnut Cream (0mg)', ARRAY['Lískový oříšek']);
SELECT fix_recipe_with_flavors('Almond Delight', ARRAY['Mandle']);
SELECT fix_recipe_with_flavors('Almond Delight (0mg)', ARRAY['Mandle']);
SELECT fix_recipe_with_flavors('Cinnamon Spice', ARRAY['Skořice']);
SELECT fix_recipe_with_flavors('Cinnamon Spice (0mg)', ARRAY['Skořice']);
SELECT fix_recipe_with_flavors('Cookie Butter', ARRAY['Máslová sušenka']);
SELECT fix_recipe_with_flavors('Cookie Butter (0mg)', ARRAY['Máslová sušenka']);
SELECT fix_recipe_with_flavors('Cream Puff', ARRAY['Větrník']);
SELECT fix_recipe_with_flavors('Cream Puff (0mg)', ARRAY['Větrník']);

-- ============================================
-- KROK 4: AKTUALIZOVAT LIQUID PRO RECEPTY
-- ============================================

-- Intermediate (2 příchutě)
SELECT fix_recipe_with_flavors('Strawberry Cream', ARRAY['Jahoda', 'Vanilkový krém']);
SELECT fix_recipe_with_flavors('Strawberry Cream (0mg)', ARRAY['Jahoda', 'Vanilkový krém']);
SELECT fix_recipe_with_flavors('Blueberry Lemonade', ARRAY['Borůvka', 'Citrón']);
SELECT fix_recipe_with_flavors('Blueberry Lemonade (0mg)', ARRAY['Borůvka', 'Citrón']);
SELECT fix_recipe_with_flavors('Peach Mango', ARRAY['Broskev', 'Mango']);
SELECT fix_recipe_with_flavors('Peach Mango (0mg)', ARRAY['Broskev', 'Mango']);
SELECT fix_recipe_with_flavors('Apple Cinnamon', ARRAY['Jablko', 'Skořice']);
SELECT fix_recipe_with_flavors('Apple Cinnamon (0mg)', ARRAY['Jablko', 'Skořice']);
SELECT fix_recipe_with_flavors('Menthol Watermelon', ARRAY['Meloun', 'Mentol']);
SELECT fix_recipe_with_flavors('Menthol Watermelon (0mg)', ARRAY['Meloun', 'Mentol']);
SELECT fix_recipe_with_flavors('Vanilla Custard', ARRAY['Vanilka', 'Custard']);
SELECT fix_recipe_with_flavors('Vanilla Custard (0mg)', ARRAY['Vanilka', 'Custard']);
SELECT fix_recipe_with_flavors('Tobacco Honey', ARRAY['Tabák Virginia', 'Med']);
SELECT fix_recipe_with_flavors('Tobacco Honey (0mg)', ARRAY['Tabák Virginia', 'Med']);
SELECT fix_recipe_with_flavors('Raspberry Cheesecake', ARRAY['Malina', 'Cheesecake']);
SELECT fix_recipe_with_flavors('Raspberry Cheesecake (0mg)', ARRAY['Malina', 'Cheesecake']);
SELECT fix_recipe_with_flavors('Grape Candy', ARRAY['Hroznové víno', 'Bonbón']);
SELECT fix_recipe_with_flavors('Grape Candy (0mg)', ARRAY['Hroznové víno', 'Bonbón']);
SELECT fix_recipe_with_flavors('Cherry Menthol', ARRAY['Višeň', 'Mentol']);
SELECT fix_recipe_with_flavors('Cherry Menthol (0mg)', ARRAY['Višeň', 'Mentol']);
SELECT fix_recipe_with_flavors('Cookie Caramel', ARRAY['Máslová sušenka', 'Karamel']);
SELECT fix_recipe_with_flavors('Cookie Caramel (0mg)', ARRAY['Máslová sušenka', 'Karamel']);
SELECT fix_recipe_with_flavors('Coffee Hazelnut', ARRAY['Káva', 'Lískový oříšek']);
SELECT fix_recipe_with_flavors('Coffee Hazelnut (0mg)', ARRAY['Káva', 'Lískový oříšek']);
SELECT fix_recipe_with_flavors('Coconut Pineapple', ARRAY['Kokos', 'Ananas']);
SELECT fix_recipe_with_flavors('Coconut Pineapple (0mg)', ARRAY['Kokos', 'Ananas']);
SELECT fix_recipe_with_flavors('Banana Cream', ARRAY['Banán', 'Vanilkový krém']);
SELECT fix_recipe_with_flavors('Banana Cream (0mg)', ARRAY['Banán', 'Vanilkový krém']);
SELECT fix_recipe_with_flavors('Kiwi Strawberry', ARRAY['Kiwi', 'Jahoda']);
SELECT fix_recipe_with_flavors('Kiwi Strawberry (0mg)', ARRAY['Kiwi', 'Jahoda']);

-- Expert (3 příchutě)
SELECT fix_recipe_with_flavors('Strawberry Kiwi Menthol', ARRAY['Jahoda', 'Kiwi', 'Mentol']);
SELECT fix_recipe_with_flavors('Strawberry Kiwi Menthol (0mg)', ARRAY['Jahoda', 'Kiwi', 'Mentol']);
SELECT fix_recipe_with_flavors('Tropical Paradise', ARRAY['Mango', 'Ananas', 'Kokos']);
SELECT fix_recipe_with_flavors('Tropical Paradise (0mg)', ARRAY['Mango', 'Ananas', 'Kokos']);
SELECT fix_recipe_with_flavors('Berry Fusion', ARRAY['Borůvka', 'Malina', 'Jahoda']);
SELECT fix_recipe_with_flavors('Berry Fusion (0mg)', ARRAY['Borůvka', 'Malina', 'Jahoda']);
SELECT fix_recipe_with_flavors('Vanilla Tobacco RY4', ARRAY['Tabák RY4', 'Vanilka', 'Karamel']);
SELECT fix_recipe_with_flavors('Vanilla Tobacco RY4 (0mg)', ARRAY['Tabák RY4', 'Vanilka', 'Karamel']);
SELECT fix_recipe_with_flavors('Blueberry Vanilla Cake', ARRAY['Borůvka', 'Vanilka', 'Dort']);
SELECT fix_recipe_with_flavors('Blueberry Vanilla Cake (0mg)', ARRAY['Borůvka', 'Vanilka', 'Dort']);
SELECT fix_recipe_with_flavors('Citrus Storm', ARRAY['Pomeranč', 'Citrón', 'Grapefruit']);
SELECT fix_recipe_with_flavors('Citrus Storm (0mg)', ARRAY['Pomeranč', 'Citrón', 'Grapefruit']);
SELECT fix_recipe_with_flavors('Strawberry Banana Smoothie', ARRAY['Jahoda', 'Banán', 'Smetana']);
SELECT fix_recipe_with_flavors('Strawberry Banana Smoothie (0mg)', ARRAY['Jahoda', 'Banán', 'Smetana']);
SELECT fix_recipe_with_flavors('Apple Pie Deluxe', ARRAY['Jablko', 'Skořice', 'Koláč']);
SELECT fix_recipe_with_flavors('Apple Pie Deluxe (0mg)', ARRAY['Jablko', 'Skořice', 'Koláč']);
SELECT fix_recipe_with_flavors('Mango Passionfruit Ice', ARRAY['Mango', 'Marakuja', 'Ledový mentol']);
SELECT fix_recipe_with_flavors('Mango Passionfruit Ice (0mg)', ARRAY['Mango', 'Marakuja', 'Ledový mentol']);
SELECT fix_recipe_with_flavors('Peach Apricot Cream', ARRAY['Broskev', 'Meruňka', 'Vanilkový krém']);
SELECT fix_recipe_with_flavors('Peach Apricot Cream (0mg)', ARRAY['Broskev', 'Meruňka', 'Vanilkový krém']);

-- Virtuoso (4 příchutě)
SELECT fix_recipe_with_flavors('Ultimate Fruit Mix', ARRAY['Jahoda', 'Malina', 'Borůvka', 'Citrón']);
SELECT fix_recipe_with_flavors('Ultimate Fruit Mix (0mg)', ARRAY['Jahoda', 'Malina', 'Borůvka', 'Citrón']);
SELECT fix_recipe_with_flavors('Dessert Heaven', ARRAY['Vanilka', 'Karamel', 'Máslová sušenka', 'Smetana']);
SELECT fix_recipe_with_flavors('Dessert Heaven (0mg)', ARRAY['Vanilka', 'Karamel', 'Máslová sušenka', 'Smetana']);
SELECT fix_recipe_with_flavors('Tropical Ice Storm', ARRAY['Mango', 'Ananas', 'Kokos', 'Ledový mentol']);
SELECT fix_recipe_with_flavors('Tropical Ice Storm (0mg)', ARRAY['Mango', 'Ananas', 'Kokos', 'Ledový mentol']);
SELECT fix_recipe_with_flavors('Berry Yogurt Dream', ARRAY['Borůvka', 'Malina', 'Jogurt', 'Granola']);
SELECT fix_recipe_with_flavors('Berry Yogurt Dream (0mg)', ARRAY['Borůvka', 'Malina', 'Jogurt', 'Granola']);
SELECT fix_recipe_with_flavors('Tropical Ice Cocktail', ARRAY['Mango', 'Ananas', 'Marakuja', 'Ledový mentol']);
SELECT fix_recipe_with_flavors('Tropical Ice Cocktail (0mg)', ARRAY['Mango', 'Ananas', 'Marakuja', 'Ledový mentol']);

-- ============================================
-- KROK 5: AKTUALIZOVAT SHISHA RECEPTY
-- ============================================

-- Beginner (1 příchuť)
SELECT fix_recipe_with_flavors('Double Apple Classic', ARRAY['Dvojité jablko']);
SELECT fix_recipe_with_flavors('Mint Sensation', ARRAY['Máta']);
SELECT fix_recipe_with_flavors('Grape Royale', ARRAY['Hroznové víno']);
SELECT fix_recipe_with_flavors('Watermelon Fresh', ARRAY['Meloun']);
SELECT fix_recipe_with_flavors('Blueberry Dream', ARRAY['Borůvka']);
SELECT fix_recipe_with_flavors('Peach Paradise', ARRAY['Broskev']);
SELECT fix_recipe_with_flavors('Lemon Fresh', ARRAY['Citrón']);
SELECT fix_recipe_with_flavors('Orange Sunset', ARRAY['Pomeranč']);
SELECT fix_recipe_with_flavors('Strawberry Sweet', ARRAY['Jahoda']);
SELECT fix_recipe_with_flavors('Mango Tropical', ARRAY['Mango']);
SELECT fix_recipe_with_flavors('Cherry Classic', ARRAY['Višeň']);
SELECT fix_recipe_with_flavors('Pineapple Breeze', ARRAY['Ananas']);
SELECT fix_recipe_with_flavors('Raspberry Pure', ARRAY['Malina']);
SELECT fix_recipe_with_flavors('Coconut Island', ARRAY['Kokos']);
SELECT fix_recipe_with_flavors('Vanilla Cloud', ARRAY['Vanilka']);
SELECT fix_recipe_with_flavors('Rose Garden', ARRAY['Růže']);
SELECT fix_recipe_with_flavors('Passion Fruit', ARRAY['Marakuja']);
SELECT fix_recipe_with_flavors('Kiwi Green', ARRAY['Kiwi']);
SELECT fix_recipe_with_flavors('Grapefruit Citrus', ARRAY['Grapefruit']);
SELECT fix_recipe_with_flavors('Banana Smooth', ARRAY['Banán']);
SELECT fix_recipe_with_flavors('Guava Exotic', ARRAY['Guava']);
SELECT fix_recipe_with_flavors('Jasmine Flower', ARRAY['Jasmín']);

-- Intermediate (2 příchutě)
SELECT fix_recipe_with_flavors('Double Apple Mint', ARRAY['Dvojité jablko', 'Máta']);
SELECT fix_recipe_with_flavors('Grape Mint', ARRAY['Hroznové víno', 'Máta']);
SELECT fix_recipe_with_flavors('Watermelon Mint', ARRAY['Meloun', 'Máta']);
SELECT fix_recipe_with_flavors('Blueberry Mint', ARRAY['Borůvka', 'Máta']);
SELECT fix_recipe_with_flavors('Peach Mint', ARRAY['Broskev', 'Máta']);
SELECT fix_recipe_with_flavors('Lemon Mint', ARRAY['Citrón', 'Máta']);
SELECT fix_recipe_with_flavors('Orange Mint', ARRAY['Pomeranč', 'Máta']);
SELECT fix_recipe_with_flavors('Strawberry Mint', ARRAY['Jahoda', 'Máta']);
SELECT fix_recipe_with_flavors('Mango Mint', ARRAY['Mango', 'Máta']);
SELECT fix_recipe_with_flavors('Cherry Mint', ARRAY['Višeň', 'Máta']);
SELECT fix_recipe_with_flavors('Pineapple Mint', ARRAY['Ananas', 'Máta']);
SELECT fix_recipe_with_flavors('Raspberry Mint', ARRAY['Malina', 'Máta']);
SELECT fix_recipe_with_flavors('Coconut Mint', ARRAY['Kokos', 'Máta']);
SELECT fix_recipe_with_flavors('Vanilla Mint', ARRAY['Vanilka', 'Máta']);
SELECT fix_recipe_with_flavors('Rose Mint', ARRAY['Růže', 'Máta']);
SELECT fix_recipe_with_flavors('Passion Mint', ARRAY['Marakuja', 'Máta']);
SELECT fix_recipe_with_flavors('Kiwi Mint', ARRAY['Kiwi', 'Máta']);
SELECT fix_recipe_with_flavors('Grapefruit Mint', ARRAY['Grapefruit', 'Máta']);
SELECT fix_recipe_with_flavors('Banana Mint', ARRAY['Banán', 'Máta']);
SELECT fix_recipe_with_flavors('Guava Mint', ARRAY['Guava', 'Máta']);
SELECT fix_recipe_with_flavors('Jasmine Mint', ARRAY['Jasmín', 'Máta']);
SELECT fix_recipe_with_flavors('Apple Grape', ARRAY['Jablko', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Watermelon Grape', ARRAY['Meloun', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Blueberry Grape', ARRAY['Borůvka', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Peach Grape', ARRAY['Broskev', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Lemon Grape', ARRAY['Citrón', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Orange Grape', ARRAY['Pomeranč', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Strawberry Grape', ARRAY['Jahoda', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Mango Grape', ARRAY['Mango', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Cherry Grape', ARRAY['Višeň', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Pineapple Grape', ARRAY['Ananas', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Raspberry Grape', ARRAY['Malina', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Coconut Grape', ARRAY['Kokos', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Passion Grape', ARRAY['Marakuja', 'Hroznové víno']);

-- Expert (3 příchutě)
SELECT fix_recipe_with_flavors('Apple Mint Grape', ARRAY['Jablko', 'Máta', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Watermelon Mint Grape', ARRAY['Meloun', 'Máta', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Blueberry Mint Grape', ARRAY['Borůvka', 'Máta', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Peach Mint Grape', ARRAY['Broskev', 'Máta', 'Hroznové víno']);
SELECT fix_recipe_with_flavors('Berry Mix', ARRAY['Borůvka', 'Malina', 'Jahoda']);
SELECT fix_recipe_with_flavors('Grape Rose Mint', ARRAY['Hroznové víno', 'Růže', 'Máta']);
SELECT fix_recipe_with_flavors('Passion Berry Mint', ARRAY['Marakuja', 'Borůvka', 'Máta']);
SELECT fix_recipe_with_flavors('Pineapple Mango Mint', ARRAY['Ananas', 'Mango', 'Máta']);
SELECT fix_recipe_with_flavors('Guava Passion Mango', ARRAY['Guava', 'Marakuja', 'Mango']);
SELECT fix_recipe_with_flavors('Exotic Fusion', ARRAY['Mango', 'Marakuja', 'Kokos']);
SELECT fix_recipe_with_flavors('Island Escape', ARRAY['Ananas', 'Kokos', 'Vanilka']);
SELECT fix_recipe_with_flavors('Citrus Trio', ARRAY['Pomeranč', 'Citrón', 'Grapefruit']);
SELECT fix_recipe_with_flavors('Forest Berries', ARRAY['Borůvka', 'Malina', 'Ostružina']);
SELECT fix_recipe_with_flavors('Tropical Storm', ARRAY['Mango', 'Ananas', 'Banán']);

-- Virtuoso (4 příchutě)
SELECT fix_recipe_with_flavors('Ultimate Shisha Mix', ARRAY['Dvojité jablko', 'Máta', 'Hroznové víno', 'Růže']);
SELECT fix_recipe_with_flavors('Tropical Paradise Shisha', ARRAY['Mango', 'Ananas', 'Kokos', 'Marakuja']);
SELECT fix_recipe_with_flavors('Berry Heaven', ARRAY['Borůvka', 'Malina', 'Jahoda', 'Ostružina']);
SELECT fix_recipe_with_flavors('Citrus Garden', ARRAY['Pomeranč', 'Citrón', 'Grapefruit', 'Limetka']);
SELECT fix_recipe_with_flavors('Oriental Nights', ARRAY['Růže', 'Jasmín', 'Med', 'Vanilka']);

-- ============================================
-- KROK 6: AKTUALIZOVAT SHORTFILL RECEPTY
-- ============================================

SELECT fix_recipe_with_flavors('Mango Shortfill', ARRAY['Mango']);
SELECT fix_recipe_with_flavors('Strawberry Shortfill', ARRAY['Jahoda']);
SELECT fix_recipe_with_flavors('Watermelon Shortfill', ARRAY['Meloun']);
SELECT fix_recipe_with_flavors('Blueberry Shortfill', ARRAY['Borůvka']);
SELECT fix_recipe_with_flavors('Grape Shortfill', ARRAY['Hroznové víno']);
SELECT fix_recipe_with_flavors('Peach Shortfill', ARRAY['Broskev']);
SELECT fix_recipe_with_flavors('Apple Shortfill', ARRAY['Jablko']);
SELECT fix_recipe_with_flavors('Cherry Shortfill', ARRAY['Višeň']);
SELECT fix_recipe_with_flavors('Menthol Shortfill', ARRAY['Mentol']);
SELECT fix_recipe_with_flavors('Tobacco Shortfill', ARRAY['Tabák Virginia']);
SELECT fix_recipe_with_flavors('Vanilla Shortfill', ARRAY['Vanilka']);
SELECT fix_recipe_with_flavors('Coffee Shortfill', ARRAY['Káva']);
SELECT fix_recipe_with_flavors('Lemon Shortfill', ARRAY['Citrón']);
SELECT fix_recipe_with_flavors('Orange Shortfill', ARRAY['Pomeranč']);
SELECT fix_recipe_with_flavors('Raspberry Shortfill', ARRAY['Malina']);
SELECT fix_recipe_with_flavors('Pineapple Shortfill', ARRAY['Ananas']);
SELECT fix_recipe_with_flavors('Coconut Shortfill', ARRAY['Kokos']);
SELECT fix_recipe_with_flavors('Banana Shortfill', ARRAY['Banán']);
SELECT fix_recipe_with_flavors('Kiwi Shortfill', ARRAY['Kiwi']);
SELECT fix_recipe_with_flavors('Energy Shortfill', ARRAY['Energy drink']);

-- ============================================
-- KROK 7: VERIFIKACE
-- ============================================

-- Zobrazit počet receptů s ingredients
SELECT 
    form_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE recipe_data ? 'ingredients') as with_ingredients
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
GROUP BY form_type;

-- Ukázat pár příkladů
SELECT 
    name,
    form_type,
    recipe_data->>'vgPercent' as vg,
    recipe_data->>'pgPercent' as pg,
    jsonb_array_length(recipe_data->'ingredients') as ingredient_count,
    recipe_data->'ingredients'->0->>'flavorName' as first_flavor
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' 
  AND is_public = true
  AND recipe_data ? 'ingredients'
LIMIT 15;

-- ============================================
-- ČIŠTĚNÍ
-- ============================================
DROP FUNCTION IF EXISTS fix_recipe_with_flavors(TEXT, TEXT[]);
