-- ============================================
-- UPDATE: Aktualizace seed receptů - přidání flavorName, vgPercent, pgPercent a ingredients
-- Date: 2026-02-05
-- ============================================
-- DŮLEŽITÉ: Tento skript AKTUALIZUJE existující recepty, nevytváří nové!
-- ============================================

-- ============================================
-- KROK 1: SMAZÁNÍ DUPLICITNÍCH RECEPTŮ
-- ============================================
-- Nejprve zjistíme kolik duplicit máme
DO $$
DECLARE
    v_duplicates_count INT;
BEGIN
    SELECT COUNT(*) INTO v_duplicates_count
    FROM recipes r1
    WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' 
    AND is_public = true
    AND EXISTS (
        SELECT 1 FROM recipes r2 
        WHERE r2.name = r1.name 
        AND r2.clerk_id = r1.clerk_id 
        AND r2.is_public = r1.is_public 
        AND r2.created_at < r1.created_at
    );
    RAISE NOTICE 'Počet duplicitních receptů k smazání: %', v_duplicates_count;
END $$;

-- Smazat všechny duplicity (ponechat pouze nejstarší záznam pro každý název podle created_at)
DELETE FROM recipes 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
        FROM recipes
        WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
    ) duplicates
    WHERE rn > 1
);

-- Verifikace po smazání duplicit
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM recipes
    WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true;
    RAISE NOTICE 'Počet seed receptů po odstranění duplicit: %', v_count;
END $$;

-- ============================================
-- FUNKCE PRO VÝPOČET INGREDIENTS PRO LIQUID (1 příchuť)
-- ============================================

CREATE OR REPLACE FUNCTION update_liquid_recipe(
    p_name TEXT,
    p_flavor_name TEXT
) RETURNS VOID AS $$
DECLARE
    v_recipe RECORD;
    v_data JSONB;
    v_total_amount DECIMAL;
    v_vg_ratio DECIMAL;
    v_pg_ratio DECIMAL;
    v_nic_strength DECIMAL;
    v_nic_base DECIMAL;
    v_flavor_percent DECIMAL;
    v_flavor_type TEXT;
    
    v_flavor_volume DECIMAL;
    v_nic_volume DECIMAL;
    v_nic_percent DECIMAL;
    v_used_percent DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    
    v_ingredients JSONB;
    v_updated_data JSONB;
BEGIN
    -- Najít recept
    SELECT * INTO v_recipe FROM recipes 
    WHERE name = p_name 
    AND clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' 
    AND is_public = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Recipe not found: %', p_name;
        RETURN;
    END IF;
    
    v_data := v_recipe.recipe_data;
    
    -- Načíst hodnoty
    v_total_amount := COALESCE((v_data->>'totalAmount')::DECIMAL, 30);
    v_vg_ratio := COALESCE((v_data->>'vgRatio')::DECIMAL, 70);
    v_pg_ratio := 100 - v_vg_ratio;
    v_nic_strength := COALESCE((v_data->>'nicStrength')::DECIMAL, 0);
    v_nic_base := COALESCE((v_data->>'nicBase')::DECIMAL, 20);
    v_flavor_percent := COALESCE((v_data->>'flavorPercent')::DECIMAL, 10);
    v_flavor_type := COALESCE(v_data->>'flavorType', 'fruit');
    
    -- Inicializovat ingredients
    v_ingredients := '[]'::JSONB;
    
    -- 1. Příchuť
    IF v_flavor_percent > 0 THEN
        v_flavor_volume := v_total_amount * (v_flavor_percent / 100);
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'flavor',
                'flavorType', v_flavor_type,
                'flavorName', p_flavor_name,
                'volume', ROUND(v_flavor_volume::NUMERIC, 2),
                'percent', ROUND(v_flavor_percent::NUMERIC, 1),
                'params', jsonb_build_object('vgpg', '0/100')
            )
        );
    END IF;
    
    -- 2. Nikotin
    v_nic_percent := 0;
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
    
    -- 3. Zbývající prostor pro VG a PG
    v_used_percent := v_flavor_percent + v_nic_percent;
    v_remaining_percent := 100 - v_used_percent;
    
    -- VG
    v_vg_percent := (v_vg_ratio / 100) * v_remaining_percent;
    v_vg_volume := v_total_amount * (v_vg_percent / 100);
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
    v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
    v_pg_volume := v_total_amount * (v_pg_percent / 100);
    IF v_pg_volume > 0.01 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'pg',
                'volume', ROUND(v_pg_volume::NUMERIC, 2),
                'percent', ROUND(v_pg_percent::NUMERIC, 1)
            )
        );
    END IF;
    
    -- Aktualizovat recipe_data
    v_updated_data := v_data;
    v_updated_data := jsonb_set(v_updated_data, '{flavorName}', to_jsonb(p_flavor_name));
    v_updated_data := jsonb_set(v_updated_data, '{vgPercent}', to_jsonb(v_vg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{pgPercent}', to_jsonb(v_pg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{nicotine}', to_jsonb(v_nic_strength));
    v_updated_data := jsonb_set(v_updated_data, '{ingredients}', v_ingredients);
    
    -- UPDATE receptu
    UPDATE recipes SET recipe_data = v_updated_data WHERE id = v_recipe.id;
    
    RAISE NOTICE 'Updated: %', p_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKCE PRO VÝPOČET INGREDIENTS PRO LIQUID PRO (více příchutí)
-- ============================================

CREATE OR REPLACE FUNCTION update_liquidpro_recipe(
    p_name TEXT,
    p_flavor_names TEXT[]  -- Array názvů příchutí v pořadí
) RETURNS VOID AS $$
DECLARE
    v_recipe RECORD;
    v_data JSONB;
    v_total_amount DECIMAL;
    v_vg_ratio DECIMAL;
    v_pg_ratio DECIMAL;
    v_nic_strength DECIMAL;
    v_nic_base DECIMAL;
    v_flavors JSONB;
    v_flavor JSONB;
    v_flavor_idx INT;
    
    v_total_flavor_percent DECIMAL := 0;
    v_nic_volume DECIMAL;
    v_nic_percent DECIMAL := 0;
    v_used_percent DECIMAL;
    v_remaining_percent DECIMAL;
    v_vg_percent DECIMAL;
    v_pg_percent DECIMAL;
    v_vg_volume DECIMAL;
    v_pg_volume DECIMAL;
    
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
        RAISE NOTICE 'Recipe not found: %', p_name;
        RETURN;
    END IF;
    
    v_data := v_recipe.recipe_data;
    
    -- Načíst hodnoty
    v_total_amount := COALESCE((v_data->>'totalAmount')::DECIMAL, 30);
    v_vg_ratio := COALESCE((v_data->>'vgRatio')::DECIMAL, 70);
    v_pg_ratio := 100 - v_vg_ratio;
    v_nic_strength := COALESCE((v_data->>'nicStrength')::DECIMAL, 0);
    v_nic_base := COALESCE((v_data->>'nicBase')::DECIMAL, 20);
    v_flavors := COALESCE(v_data->'flavors', '[]'::JSONB);
    
    -- Inicializovat ingredients a updated flavors
    v_ingredients := '[]'::JSONB;
    v_updated_flavors := '[]'::JSONB;
    
    -- 1. Příchutě
    v_flavor_idx := 0;
    FOR v_flavor IN SELECT * FROM jsonb_array_elements(v_flavors)
    LOOP
        v_flavor_idx := v_flavor_idx + 1;
        DECLARE
            v_f_percent DECIMAL;
            v_f_volume DECIMAL;
            v_f_type TEXT;
            v_f_name TEXT;
        BEGIN
            v_f_percent := COALESCE((v_flavor->>'percent')::DECIMAL, 0);
            v_f_type := COALESCE(v_flavor->>'type', 'fruit');
            v_f_name := COALESCE(p_flavor_names[v_flavor_idx], v_flavor->>'name', v_f_type);
            
            v_total_flavor_percent := v_total_flavor_percent + v_f_percent;
            
            IF v_f_percent > 0 THEN
                v_f_volume := v_total_amount * (v_f_percent / 100);
                v_ingredients := v_ingredients || jsonb_build_array(
                    jsonb_build_object(
                        'ingredientKey', 'flavor',
                        'flavorType', v_f_type,
                        'flavorName', v_f_name,
                        'flavorNumber', v_flavor_idx,
                        'volume', ROUND(v_f_volume::NUMERIC, 2),
                        'percent', ROUND(v_f_percent::NUMERIC, 1),
                        'params', jsonb_build_object('vgpg', '0/100')
                    )
                );
            END IF;
            
            -- Aktualizovat flavor s name
            v_updated_flavors := v_updated_flavors || jsonb_build_array(
                jsonb_build_object(
                    'type', v_f_type,
                    'name', v_f_name,
                    'percent', v_f_percent
                )
            );
        END;
    END LOOP;
    
    -- 2. Nikotin
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
    
    -- 3. Zbývající prostor pro VG a PG
    v_used_percent := v_total_flavor_percent + v_nic_percent;
    v_remaining_percent := 100 - v_used_percent;
    
    -- VG
    v_vg_percent := (v_vg_ratio / 100) * v_remaining_percent;
    v_vg_volume := v_total_amount * (v_vg_percent / 100);
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
    v_pg_percent := (v_pg_ratio / 100) * v_remaining_percent;
    v_pg_volume := v_total_amount * (v_pg_percent / 100);
    IF v_pg_volume > 0.01 THEN
        v_ingredients := v_ingredients || jsonb_build_array(
            jsonb_build_object(
                'ingredientKey', 'pg',
                'volume', ROUND(v_pg_volume::NUMERIC, 2),
                'percent', ROUND(v_pg_percent::NUMERIC, 1)
            )
        );
    END IF;
    
    -- Aktualizovat recipe_data
    v_updated_data := v_data;
    v_updated_data := jsonb_set(v_updated_data, '{flavors}', v_updated_flavors);
    v_updated_data := jsonb_set(v_updated_data, '{vgPercent}', to_jsonb(v_vg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{pgPercent}', to_jsonb(v_pg_ratio));
    v_updated_data := jsonb_set(v_updated_data, '{nicotine}', to_jsonb(v_nic_strength));
    v_updated_data := jsonb_set(v_updated_data, '{ingredients}', v_ingredients);
    
    -- UPDATE receptu
    UPDATE recipes SET recipe_data = v_updated_data WHERE id = v_recipe.id;
    
    RAISE NOTICE 'Updated: %', p_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AKTUALIZACE LIQUID RECEPTŮ
-- ============================================

SELECT update_liquid_recipe('Strawberry Fresh', 'Jahoda');
SELECT update_liquid_recipe('Strawberry Fresh (0mg)', 'Jahoda');
SELECT update_liquid_recipe('Blueberry Burst', 'Borůvka');
SELECT update_liquid_recipe('Blueberry Burst (0mg)', 'Borůvka');
SELECT update_liquid_recipe('Watermelon Summer', 'Meloun');
SELECT update_liquid_recipe('Watermelon Summer (0mg)', 'Meloun');
SELECT update_liquid_recipe('Mango Paradise', 'Mango');
SELECT update_liquid_recipe('Mango Paradise (0mg)', 'Mango');
SELECT update_liquid_recipe('Apple Crisp', 'Jablko');
SELECT update_liquid_recipe('Apple Crisp (0mg)', 'Jablko');
SELECT update_liquid_recipe('Peach Dream', 'Broskev');
SELECT update_liquid_recipe('Peach Dream (0mg)', 'Broskev');
SELECT update_liquid_recipe('Grape Classic', 'Hroznové víno');
SELECT update_liquid_recipe('Grape Classic (0mg)', 'Hroznové víno');
SELECT update_liquid_recipe('Raspberry Delight', 'Malina');
SELECT update_liquid_recipe('Raspberry Delight (0mg)', 'Malina');
SELECT update_liquid_recipe('Pineapple Tropical', 'Ananas');
SELECT update_liquid_recipe('Pineapple Tropical (0mg)', 'Ananas');
SELECT update_liquid_recipe('Cherry Sweet', 'Višeň');
SELECT update_liquid_recipe('Cherry Sweet (0mg)', 'Višeň');
SELECT update_liquid_recipe('Lemon Fresh', 'Citrón');
SELECT update_liquid_recipe('Lemon Fresh (0mg)', 'Citrón');
SELECT update_liquid_recipe('Orange Citrus', 'Pomeranč');
SELECT update_liquid_recipe('Orange Citrus (0mg)', 'Pomeranč');
SELECT update_liquid_recipe('Lime Zest', 'Limetka');
SELECT update_liquid_recipe('Lime Zest (0mg)', 'Limetka');
SELECT update_liquid_recipe('Grapefruit Tangy', 'Grapefruit');
SELECT update_liquid_recipe('Grapefruit Tangy (0mg)', 'Grapefruit');
SELECT update_liquid_recipe('Cool Menthol', 'Mentol');
SELECT update_liquid_recipe('Cool Menthol (0mg)', 'Mentol');
SELECT update_liquid_recipe('Spearmint Fresh', 'Máta');
SELECT update_liquid_recipe('Spearmint Fresh (0mg)', 'Máta');
SELECT update_liquid_recipe('Vanilla Dream', 'Vanilka');
SELECT update_liquid_recipe('Vanilla Dream (0mg)', 'Vanilka');
SELECT update_liquid_recipe('Caramel Sweet', 'Karamel');
SELECT update_liquid_recipe('Caramel Sweet (0mg)', 'Karamel');
SELECT update_liquid_recipe('Honey Gold', 'Med');
SELECT update_liquid_recipe('Honey Gold (0mg)', 'Med');
SELECT update_liquid_recipe('Bubblegum Pop', 'Žvýkačka');
SELECT update_liquid_recipe('Bubblegum Pop (0mg)', 'Žvýkačka');
SELECT update_liquid_recipe('Classic Tobacco', 'Tabák Virginia');
SELECT update_liquid_recipe('Classic Tobacco (0mg)', 'Tabák Virginia');
SELECT update_liquid_recipe('Turkish Blend', 'Turecký tabák');
SELECT update_liquid_recipe('Turkish Blend (0mg)', 'Turecký tabák');
SELECT update_liquid_recipe('Coffee Morning', 'Káva');
SELECT update_liquid_recipe('Coffee Morning (0mg)', 'Káva');
SELECT update_liquid_recipe('Energy Rush', 'Energy drink');
SELECT update_liquid_recipe('Energy Rush (0mg)', 'Energy drink');
SELECT update_liquid_recipe('Cola Classic', 'Cola');
SELECT update_liquid_recipe('Cola Classic (0mg)', 'Cola');
SELECT update_liquid_recipe('Hazelnut Cream', 'Lískový oříšek');
SELECT update_liquid_recipe('Hazelnut Cream (0mg)', 'Lískový oříšek');
SELECT update_liquid_recipe('Almond Delight', 'Mandle');
SELECT update_liquid_recipe('Almond Delight (0mg)', 'Mandle');
SELECT update_liquid_recipe('Cinnamon Spice', 'Skořice');
SELECT update_liquid_recipe('Cinnamon Spice (0mg)', 'Skořice');
SELECT update_liquid_recipe('Cookie Butter', 'Máslová sušenka');
SELECT update_liquid_recipe('Cookie Butter (0mg)', 'Máslová sušenka');
SELECT update_liquid_recipe('Cream Puff', 'Větrník');
SELECT update_liquid_recipe('Cream Puff (0mg)', 'Větrník');

-- ============================================
-- AKTUALIZACE LIQUID PRO RECEPTŮ
-- ============================================

-- Intermediate (2 příchutě)
SELECT update_liquidpro_recipe('Strawberry Cream', ARRAY['Jahoda', 'Vanilkový krém']);
SELECT update_liquidpro_recipe('Strawberry Cream (0mg)', ARRAY['Jahoda', 'Vanilkový krém']);
SELECT update_liquidpro_recipe('Blueberry Lemonade', ARRAY['Borůvka', 'Citrón']);
SELECT update_liquidpro_recipe('Blueberry Lemonade (0mg)', ARRAY['Borůvka', 'Citrón']);
SELECT update_liquidpro_recipe('Peach Mango', ARRAY['Broskev', 'Mango']);
SELECT update_liquidpro_recipe('Peach Mango (0mg)', ARRAY['Broskev', 'Mango']);
SELECT update_liquidpro_recipe('Apple Cinnamon', ARRAY['Jablko', 'Skořice']);
SELECT update_liquidpro_recipe('Apple Cinnamon (0mg)', ARRAY['Jablko', 'Skořice']);
SELECT update_liquidpro_recipe('Menthol Watermelon', ARRAY['Meloun', 'Mentol']);
SELECT update_liquidpro_recipe('Menthol Watermelon (0mg)', ARRAY['Meloun', 'Mentol']);
SELECT update_liquidpro_recipe('Vanilla Custard', ARRAY['Vanilka', 'Custard']);
SELECT update_liquidpro_recipe('Vanilla Custard (0mg)', ARRAY['Vanilka', 'Custard']);
SELECT update_liquidpro_recipe('Tobacco Honey', ARRAY['Tabák Virginia', 'Med']);
SELECT update_liquidpro_recipe('Tobacco Honey (0mg)', ARRAY['Tabák Virginia', 'Med']);
SELECT update_liquidpro_recipe('Raspberry Cheesecake', ARRAY['Malina', 'Cheesecake']);
SELECT update_liquidpro_recipe('Raspberry Cheesecake (0mg)', ARRAY['Malina', 'Cheesecake']);
SELECT update_liquidpro_recipe('Grape Candy', ARRAY['Hroznové víno', 'Bonbón']);
SELECT update_liquidpro_recipe('Grape Candy (0mg)', ARRAY['Hroznové víno', 'Bonbón']);
SELECT update_liquidpro_recipe('Cherry Menthol', ARRAY['Višeň', 'Mentol']);
SELECT update_liquidpro_recipe('Cherry Menthol (0mg)', ARRAY['Višeň', 'Mentol']);
SELECT update_liquidpro_recipe('Cookie Caramel', ARRAY['Máslová sušenka', 'Karamel']);
SELECT update_liquidpro_recipe('Cookie Caramel (0mg)', ARRAY['Máslová sušenka', 'Karamel']);
SELECT update_liquidpro_recipe('Coffee Hazelnut', ARRAY['Káva', 'Lískový oříšek']);
SELECT update_liquidpro_recipe('Coffee Hazelnut (0mg)', ARRAY['Káva', 'Lískový oříšek']);
SELECT update_liquidpro_recipe('Coconut Pineapple', ARRAY['Kokos', 'Ananas']);
SELECT update_liquidpro_recipe('Coconut Pineapple (0mg)', ARRAY['Kokos', 'Ananas']);
SELECT update_liquidpro_recipe('Banana Cream', ARRAY['Banán', 'Vanilkový krém']);
SELECT update_liquidpro_recipe('Banana Cream (0mg)', ARRAY['Banán', 'Vanilkový krém']);
SELECT update_liquidpro_recipe('Kiwi Strawberry', ARRAY['Kiwi', 'Jahoda']);
SELECT update_liquidpro_recipe('Kiwi Strawberry (0mg)', ARRAY['Kiwi', 'Jahoda']);

-- Expert (3 příchutě)
SELECT update_liquidpro_recipe('Strawberry Kiwi Menthol', ARRAY['Jahoda', 'Kiwi', 'Mentol']);
SELECT update_liquidpro_recipe('Strawberry Kiwi Menthol (0mg)', ARRAY['Jahoda', 'Kiwi', 'Mentol']);
SELECT update_liquidpro_recipe('Tropical Paradise', ARRAY['Mango', 'Ananas', 'Kokos']);
SELECT update_liquidpro_recipe('Tropical Paradise (0mg)', ARRAY['Mango', 'Ananas', 'Kokos']);
SELECT update_liquidpro_recipe('Berry Fusion', ARRAY['Borůvka', 'Malina', 'Jahoda']);
SELECT update_liquidpro_recipe('Berry Fusion (0mg)', ARRAY['Borůvka', 'Malina', 'Jahoda']);
SELECT update_liquidpro_recipe('Vanilla Tobacco RY4', ARRAY['Tabák RY4', 'Vanilka', 'Karamel']);
SELECT update_liquidpro_recipe('Vanilla Tobacco RY4 (0mg)', ARRAY['Tabák RY4', 'Vanilka', 'Karamel']);
SELECT update_liquidpro_recipe('Blueberry Vanilla Cake', ARRAY['Borůvka', 'Vanilka', 'Dort']);
SELECT update_liquidpro_recipe('Blueberry Vanilla Cake (0mg)', ARRAY['Borůvka', 'Vanilka', 'Dort']);
SELECT update_liquidpro_recipe('Citrus Storm', ARRAY['Pomeranč', 'Citrón', 'Grapefruit']);
SELECT update_liquidpro_recipe('Citrus Storm (0mg)', ARRAY['Pomeranč', 'Citrón', 'Grapefruit']);
SELECT update_liquidpro_recipe('Strawberry Banana Smoothie', ARRAY['Jahoda', 'Banán', 'Smetana']);
SELECT update_liquidpro_recipe('Strawberry Banana Smoothie (0mg)', ARRAY['Jahoda', 'Banán', 'Smetana']);
SELECT update_liquidpro_recipe('Apple Pie Deluxe', ARRAY['Jablko', 'Skořice', 'Koláč']);
SELECT update_liquidpro_recipe('Apple Pie Deluxe (0mg)', ARRAY['Jablko', 'Skořice', 'Koláč']);
SELECT update_liquidpro_recipe('Mango Passionfruit Ice', ARRAY['Mango', 'Marakuja', 'Ledový mentol']);
SELECT update_liquidpro_recipe('Mango Passionfruit Ice (0mg)', ARRAY['Mango', 'Marakuja', 'Ledový mentol']);
SELECT update_liquidpro_recipe('Peach Apricot Cream', ARRAY['Broskev', 'Meruňka', 'Vanilkový krém']);
SELECT update_liquidpro_recipe('Peach Apricot Cream (0mg)', ARRAY['Broskev', 'Meruňka', 'Vanilkový krém']);

-- Virtuoso (4 příchutě)
SELECT update_liquidpro_recipe('Ultimate Fruit Mix', ARRAY['Jahoda', 'Malina', 'Borůvka', 'Citrón']);
SELECT update_liquidpro_recipe('Ultimate Fruit Mix (0mg)', ARRAY['Jahoda', 'Malina', 'Borůvka', 'Citrón']);
SELECT update_liquidpro_recipe('Dessert Heaven', ARRAY['Vanilka', 'Karamel', 'Máslová sušenka', 'Smetana']);
SELECT update_liquidpro_recipe('Dessert Heaven (0mg)', ARRAY['Vanilka', 'Karamel', 'Máslová sušenka', 'Smetana']);
SELECT update_liquidpro_recipe('Tropical Ice Storm', ARRAY['Mango', 'Ananas', 'Kokos', 'Ledový mentol']);
SELECT update_liquidpro_recipe('Tropical Ice Storm (0mg)', ARRAY['Mango', 'Ananas', 'Kokos', 'Ledový mentol']);
SELECT update_liquidpro_recipe('Berry Yogurt Dream', ARRAY['Borůvka', 'Malina', 'Jogurt', 'Granola']);
SELECT update_liquidpro_recipe('Berry Yogurt Dream (0mg)', ARRAY['Borůvka', 'Malina', 'Jogurt', 'Granola']);
SELECT update_liquidpro_recipe('Tropical Ice Cocktail', ARRAY['Mango', 'Ananas', 'Marakuja', 'Ledový mentol']);
SELECT update_liquidpro_recipe('Tropical Ice Cocktail (0mg)', ARRAY['Mango', 'Ananas', 'Marakuja', 'Ledový mentol']);

-- ============================================
-- VERIFIKACE
-- ============================================

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
  AND recipe_data ? 'ingredients'
LIMIT 10;

-- ============================================
-- ČIŠTĚNÍ
-- ============================================
DROP FUNCTION IF EXISTS update_liquid_recipe(TEXT, TEXT);
DROP FUNCTION IF EXISTS update_liquidpro_recipe(TEXT, TEXT[]);
