-- ============================================
-- DOPLNĚNÍ SHISHA RECEPTŮ (zbývajících ~60)
-- Date: 2026-02-05
-- ============================================
-- Tento skript doplní zbývající SHISHA recepty
-- Spusť PO reset_and_seed_recipes.sql
-- ============================================

-- Beginner (1 příchuť) - Chybějících 12
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh Shisha', 'Kyselkave citronove osvezeni. Cistici podklad pro mix.', true, 'shisha', 'beginner', 4.2, 65, 
build_shisha_recipe(200, 30, 50, 'honey', 14, '[{"type":"lemon","name":"Citrón","percent":10}]'::jsonb, 'Čisté citrusové'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Sunset', 'Sladky pomeranc z egyptskych sadu. Tepla a prijemna chut.', true, 'shisha', 'beginner', 4.3, 71, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"orange","name":"Pomeranč","percent":13}]'::jsonb, 'Egyptský pomeranč'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Pure', 'Cista malinova chut. Kyselkava a osvezujici.', true, 'shisha', 'beginner', 4.2, 59, 
build_shisha_recipe(200, 30, 50, 'honey', 14, '[{"type":"raspberry","name":"Malina","percent":12}]'::jsonb, 'Čisté maliny'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Island', 'Kremovy kokos z tropickeho raje. Sladky a exoticky.', true, 'shisha', 'beginner', 4.1, 53, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"coconut","name":"Kokos","percent":13}]'::jsonb, 'Tropický kokos'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Cloud', 'Kremova vanilka pro jemny zazitek. Sladka a hebka.', true, 'shisha', 'beginner', 4.0, 48, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"vanilla","name":"Vanilka","percent":10}]'::jsonb, 'Jemná vanilka'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Rose Garden', 'Vonava ruze z damaskych zahrad. Elegantni arabska klasika.', true, 'shisha', 'beginner', 4.3, 67, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"rose","name":"Růže","percent":8}]'::jsonb, 'Damašská růže'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Fruit', 'Exoticka marakuja plna energie. Intenzivni a tropicka.', true, 'shisha', 'beginner', 4.4, 74, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"passionfruit","name":"Marakuja","percent":14}]'::jsonb, 'Tropická marakuja'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Green', 'Zelene kiwi z Noveho Zelandu. Svezi a kyselkave.', true, 'shisha', 'beginner', 4.2, 61, 
build_shisha_recipe(200, 30, 50, 'molasses', 13, '[{"type":"kiwi","name":"Kiwi","percent":12}]'::jsonb, 'Svěží kiwi'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Citrus Shisha', 'Horky grapefruit pro osvezeni. Lehce horka citrusova chut.', true, 'shisha', 'beginner', 4.0, 45, 
build_shisha_recipe(200, 30, 50, 'honey', 15, '[{"type":"grapefruit","name":"Grapefruit","percent":10}]'::jsonb, 'Hořký grapefruit'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Smooth', 'Kremovy banan jako smoothie. Sladky a sametovy.', true, 'shisha', 'beginner', 4.1, 52, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"banana","name":"Banán","percent":12}]'::jsonb, 'Krémový banán'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Exotic', 'Exoticka guava z Brazilie. Tropicky a sladky.', true, 'shisha', 'beginner', 4.3, 63, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"guava","name":"Guava","percent":14}]'::jsonb, 'Brazilská guava'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Jasmine Flower', 'Vonavy jasmin pro relaxaci. Elegantni kvetinova chut.', true, 'shisha', 'beginner', 4.1, 49, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"jasmine","name":"Jasmín","percent":8}]'::jsonb, 'Elegantní jasmín'), NOW());

-- Intermediate (2 příchutě) - Chybějících 29
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Lemon', 'Sladka broskev s citronem. Vyvazena ovocna kombinace.', true, 'shisha', 'intermediate', 4.5, 98, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"peach","name":"Broskev","percent":11},{"type":"lemon","name":"Citrón","percent":6}]'::jsonb, 'Ovocná harmonie'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Grape', 'Boruvky a hrozny. Intenzivni ovocny mix.', true, 'shisha', 'intermediate', 4.4, 87, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"blueberry","name":"Borůvka","percent":10},{"type":"grape","name":"Hroznové víno","percent":8}]'::jsonb, 'Intenzivní ovoce'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passion', 'Tropicke mango s marakujou. Exoticky raj.', true, 'shisha', 'intermediate', 4.6, 112, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"mango","name":"Mango","percent":10},{"type":"passionfruit","name":"Marakuja","percent":8}]'::jsonb, 'Tropický ráj'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Vanilla', 'Jahody s kremovou vanilkou. Dezertni sladkost.', true, 'shisha', 'intermediate', 4.5, 94, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"strawberry","name":"Jahoda","percent":10},{"type":"vanilla","name":"Vanilka","percent":6}]'::jsonb, 'Dezertní kombinace'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Cream Shisha', 'Pomerancovy krem jako nanuk. Nostalgicka chut.', true, 'shisha', 'intermediate', 4.4, 81, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"orange","name":"Pomeranč","percent":10},{"type":"vanilla","name":"Vanilka","percent":6}]'::jsonb, 'Nostalgický nanuk'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Mint', 'Ledova visen s matou. Intenzivni a svezi.', true, 'shisha', 'intermediate', 4.5, 89, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"cherry","name":"Višeň","percent":11},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Intenzivní svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Rose Mint', 'Elegantni ruze s matou. Arabska klasika.', true, 'shisha', 'intermediate', 4.3, 72, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"rose","name":"Růže","percent":8},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Arabská elegance'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Grape', 'Citron s hrozny. Vyvazena kyselost a sladkost.', true, 'shisha', 'intermediate', 4.4, 78, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"lemon","name":"Citrón","percent":7},{"type":"grape","name":"Hroznové víno","percent":10}]'::jsonb, 'Kyselosladká harmonie'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Lemon', 'Maliny s citronem. Osvezujici a kyselkave.', true, 'shisha', 'intermediate', 4.3, 68, 
build_shisha_recipe(200, 30, 50, 'honey', 13, '[{"type":"raspberry","name":"Malina","percent":10},{"type":"lemon","name":"Citrón","percent":6}]'::jsonb, 'Kyselkavá kombinace'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry Shisha', 'Kiwi s jahodami. Svezi letni ovoce.', true, 'shisha', 'intermediate', 4.5, 86, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"kiwi","name":"Kiwi","percent":9},{"type":"strawberry","name":"Jahoda","percent":9}]'::jsonb, 'Letní svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Strawberry Shisha', 'Banan s jahodami jako smoothie. Kremovy a sladky.', true, 'shisha', 'intermediate', 4.4, 79, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"banana","name":"Banán","percent":9},{"type":"strawberry","name":"Jahoda","percent":9}]'::jsonb, 'Ovocné smoothie'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Mango', 'Guava s mangem. Tropicka exploze chuti.', true, 'shisha', 'intermediate', 4.5, 91, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"guava","name":"Guava","percent":9},{"type":"mango","name":"Mango","percent":9}]'::jsonb, 'Tropická exploze'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Grape', 'Jablko s hrozny. Sladka kombinace ovoce.', true, 'shisha', 'intermediate', 4.3, 73, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"apple","name":"Jablko","percent":10},{"type":"grape","name":"Hroznové víno","percent":8}]'::jsonb, 'Sladké ovoce'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Mint', 'Tropicke mango s ledovou matou. Exoticky led.', true, 'shisha', 'intermediate', 4.7, 118, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"mango","name":"Mango","percent":12},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Exotický led'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Mint', 'Jahody s chladivou matou. Popularni letni mix.', true, 'shisha', 'intermediate', 4.6, 105, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"strawberry","name":"Jahoda","percent":11},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Letní klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Mango Shisha', 'Marakuja s mangem. Tropicky dvojboj.', true, 'shisha', 'intermediate', 4.5, 89, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"passionfruit","name":"Marakuja","percent":9},{"type":"mango","name":"Mango","percent":9}]'::jsonb, 'Tropický dvojboj'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Grape', 'Visen s hrozny. Intenzivni tmave ovoce.', true, 'shisha', 'intermediate', 4.3, 71, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"cherry","name":"Višeň","percent":10},{"type":"grape","name":"Hroznové víno","percent":8}]'::jsonb, 'Tmavé ovoce'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Jasmine Rose', 'Jasmin s ruzi. Kvetinova elegance.', true, 'shisha', 'intermediate', 4.2, 58, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"jasmine","name":"Jasmín","percent":7},{"type":"rose","name":"Růže","percent":7}]'::jsonb, 'Květinová elegance'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Mint Shisha', 'Citron s matou. Osvezujici citrusova chladivost.', true, 'shisha', 'intermediate', 4.6, 98, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"lemon","name":"Citrón","percent":8},{"type":"mint","name":"Máta","percent":6}]'::jsonb, 'Citrusová svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Mint', 'Pomeranc s matou. Svezi citrusovy led.', true, 'shisha', 'intermediate', 4.4, 84, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"orange","name":"Pomeranč","percent":10},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Citrusový led'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Rose', 'Jablko s ruzi. Elegantni arabska kombinace.', true, 'shisha', 'intermediate', 4.3, 69, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"apple","name":"Jablko","percent":11},{"type":"rose","name":"Růže","percent":5}]'::jsonb, 'Arabská klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Mint', 'Grapefruit s matou. Svezi a lehce horka.', true, 'shisha', 'intermediate', 4.2, 54, 
build_shisha_recipe(200, 30, 50, 'molasses', 13, '[{"type":"grapefruit","name":"Grapefruit","percent":9},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Hořká svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Vanilla', 'Kokos s vanilkou. Kremova tropicka sladkost.', true, 'shisha', 'intermediate', 4.3, 67, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"coconut","name":"Kokos","percent":9},{"type":"vanilla","name":"Vanilka","percent":6}]'::jsonb, 'Krémová tropika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Grape', 'Meloun s hrozny. Sladka letni kombinace.', true, 'shisha', 'intermediate', 4.5, 87, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"watermelon","name":"Meloun","percent":10},{"type":"grape","name":"Hroznové víno","percent":8}]'::jsonb, 'Letní sladkost'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Mint', 'Ananas s matou. Tropicke osvezeni.', true, 'shisha', 'intermediate', 4.4, 78, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"pineapple","name":"Ananas","percent":11},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Tropické osvěžení'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Mint', 'Vanilka s matou. Jemna a chladiva.', true, 'shisha', 'intermediate', 4.1, 52, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"vanilla","name":"Vanilka","percent":8},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Jemná chladivost'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon Shisha', 'Jablko se skorici. Podzimni pohoda.', true, 'shisha', 'intermediate', 4.3, 65, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"apple","name":"Jablko","percent":11},{"type":"cinnamon","name":"Skořice","percent":4}]'::jsonb, 'Podzimní útulnost'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Melon Honey', 'Cukrovy meloun s medem. Extra sladka kombinace.', true, 'shisha', 'intermediate', 4.4, 76, 
build_shisha_recipe(200, 30, 50, 'honey', 14, '[{"type":"melon","name":"Meloun","percent":12},{"type":"honey","name":"Med","percent":5}]'::jsonb, 'Extra sladká'), NOW());

-- Expert (3 příchutě) - Chybějících 17
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Triple Apple Mint', 'Tri druhy jablek s matou. Pokrocila verze klasiky.', true, 'shisha', 'expert', 4.8, 145, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"apple","name":"Červené jablko","percent":8},{"type":"greenapple","name":"Zelené jablko","percent":6},{"type":"mint","name":"Máta","percent":5}]'::jsonb, 'Pokročilá klasika'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Storm Shisha', 'Mango, ananas a marakuja. Tropicka boure.', true, 'shisha', 'expert', 4.7, 128, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"mango","name":"Mango","percent":6},{"type":"pineapple","name":"Ananas","percent":6},{"type":"passionfruit","name":"Marakuja","percent":5}]'::jsonb, 'Tropická bouře'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Forest Berries', 'Boruvka, malina a ostruzina. Lesni ovoce.', true, 'shisha', 'expert', 4.6, 115, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"blueberry","name":"Borůvka","percent":6},{"type":"raspberry","name":"Malina","percent":6},{"type":"blackberry","name":"Ostružina","percent":5}]'::jsonb, 'Lesní ovoce'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Trio', 'Pomeranc, citron a grapefruit. Citrusova trojka.', true, 'shisha', 'expert', 4.5, 95, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"orange","name":"Pomeranč","percent":6},{"type":"lemon","name":"Citrón","percent":5},{"type":"grapefruit","name":"Grapefruit","percent":5}]'::jsonb, 'Citrusová trojka'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Rose Mint Shisha', 'Hrozny s ruzi a matou. Arabska klasika.', true, 'shisha', 'expert', 4.7, 122, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"grape","name":"Hroznové víno","percent":8},{"type":"rose","name":"Růže","percent":5},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Arabská klasika deluxe'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Berry Mint', 'Meloun, boruvky a mata. Letni svezest.', true, 'shisha', 'expert', 4.6, 108, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"watermelon","name":"Meloun","percent":7},{"type":"blueberry","name":"Borůvka","percent":5},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Letní svěžest extra'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango Mint', 'Broskev, mango a mata. Tropicky led.', true, 'shisha', 'expert', 4.6, 102, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"peach","name":"Broskev","percent":6},{"type":"mango","name":"Mango","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Tropický led'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Banana Vanilla', 'Jahoda, banan a vanilka. Kremove smoothie.', true, 'shisha', 'expert', 4.5, 95, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"strawberry","name":"Jahoda","percent":6},{"type":"banana","name":"Banán","percent":5},{"type":"vanilla","name":"Vanilka","percent":4}]'::jsonb, 'Krémové smoothie'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Grape Mint', 'Visen, hrozny a mata. Intenzivni tmave ovoce.', true, 'shisha', 'expert', 4.5, 88, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"cherry","name":"Višeň","percent":6},{"type":"grape","name":"Hroznové víno","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Tmavé ovoce s ledem'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Pineapple Vanilla', 'Kokos, ananas a vanilka. Pina colada deluxe.', true, 'shisha', 'expert', 4.6, 99, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"coconut","name":"Kokos","percent":6},{"type":"pineapple","name":"Ananas","percent":6},{"type":"vanilla","name":"Vanilka","percent":4}]'::jsonb, 'Piña Colada deluxe'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Raspberry Mint', 'Citron, malina a mata. Kyselkava svezest.', true, 'shisha', 'expert', 4.4, 82, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"lemon","name":"Citrón","percent":5},{"type":"raspberry","name":"Malina","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Kyselkavá svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Passion Mango', 'Kiwi, marakuja a mango. Exoticka trojka.', true, 'shisha', 'expert', 4.6, 105, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"kiwi","name":"Kiwi","percent":5},{"type":"passionfruit","name":"Marakuja","percent":6},{"type":"mango","name":"Mango","percent":6}]'::jsonb, 'Exotická trojka'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Vanilla Cinnamon', 'Pomeranc, vanilka a skorice. Zimni pohoda.', true, 'shisha', 'expert', 4.4, 78, 
build_shisha_recipe(200, 30, 50, 'molasses', 12, '[{"type":"orange","name":"Pomeranč","percent":7},{"type":"vanilla","name":"Vanilka","percent":5},{"type":"cinnamon","name":"Skořice","percent":3}]'::jsonb, 'Zimní pohoda'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Honey Rose', 'Jablko, med a ruze. Arabska sladkost.', true, 'shisha', 'expert', 4.5, 85, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"apple","name":"Jablko","percent":7},{"type":"honey","name":"Med","percent":5},{"type":"rose","name":"Růže","percent":4}]'::jsonb, 'Arabská sladkost'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Strawberry Mint', 'Guava, jahoda a mata. Tropicka svezest.', true, 'shisha', 'expert', 4.5, 92, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"guava","name":"Guava","percent":6},{"type":"strawberry","name":"Jahoda","percent":6},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Tropická svěžest'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemon Mint', 'Boruvka, citron a mata. Lesni citrus.', true, 'shisha', 'expert', 4.4, 79, 
build_shisha_recipe(200, 30, 50, 'honey', 11, '[{"type":"blueberry","name":"Borůvka","percent":6},{"type":"lemon","name":"Citrón","percent":5},{"type":"mint","name":"Máta","percent":4}]'::jsonb, 'Lesní citrus'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Coconut Vanilla', 'Banan, kokos a vanilka. Tropicke smoothie.', true, 'shisha', 'expert', 4.4, 75, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"banana","name":"Banán","percent":6},{"type":"coconut","name":"Kokos","percent":5},{"type":"vanilla","name":"Vanilka","percent":4}]'::jsonb, 'Tropické smoothie'), NOW());

-- Virtuoso (4 příchutě) - Chybějících 5
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Arabian Nights', 'Dvojite jablko, hrozny, ruze a mata. Legendy orientu.', true, 'shisha', 'virtuoso', 4.9, 178, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"apple","name":"Dvojité jablko","percent":5},{"type":"grape","name":"Hroznové víno","percent":4},{"type":"rose","name":"Růže","percent":4},{"type":"mint","name":"Máta","percent":3}]'::jsonb, 'Legendy orientu'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caribbean Dream', 'Mango, ananas, kokos a rum. Karibsky sen.', true, 'shisha', 'virtuoso', 4.7, 138, 
build_shisha_recipe(200, 30, 50, 'molasses', 11, '[{"type":"mango","name":"Mango","percent":5},{"type":"pineapple","name":"Ananas","percent":4},{"type":"coconut","name":"Kokos","percent":4},{"type":"rum","name":"Rum","percent":2}]'::jsonb, 'Karibský sen'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Summer Festival', 'Meloun, jahoda, boruvka a mata. Letni festival.', true, 'shisha', 'virtuoso', 4.6, 125, 
build_shisha_recipe(200, 30, 50, 'honey', 10, '[{"type":"watermelon","name":"Meloun","percent":5},{"type":"strawberry","name":"Jahoda","percent":4},{"type":"blueberry","name":"Borůvka","percent":4},{"type":"mint","name":"Máta","percent":3}]'::jsonb, 'Letní festival'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Persian Garden', 'Ruze, jasmin, broskev a med. Perska zahrada.', true, 'shisha', 'virtuoso', 4.7, 132, 
build_shisha_recipe(200, 30, 50, 'honey', 12, '[{"type":"rose","name":"Růže","percent":4},{"type":"jasmine","name":"Jasmín","percent":4},{"type":"peach","name":"Broskev","percent":5},{"type":"honey","name":"Med","percent":4}]'::jsonb, 'Perská zahrada'), NOW());

INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Exotic Paradise', 'Guava, marakuja, mango a kokos. Exoticky raj.', true, 'shisha', 'virtuoso', 4.8, 145, 
build_shisha_recipe(200, 30, 50, 'molasses', 10, '[{"type":"guava","name":"Guava","percent":4},{"type":"passionfruit","name":"Marakuja","percent":4},{"type":"mango","name":"Mango","percent":4},{"type":"coconut","name":"Kokos","percent":4}]'::jsonb, 'Exotický ráj'), NOW());

-- ============================================
-- VERIFIKACE
-- ============================================

SELECT 
    form_type,
    difficulty_level,
    COUNT(*) as count
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true
GROUP BY form_type, difficulty_level
ORDER BY form_type, difficulty_level;

SELECT COUNT(*) as total_shisha
FROM recipes
WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ' AND is_public = true AND form_type = 'shisha';
