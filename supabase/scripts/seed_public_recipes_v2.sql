-- ============================================
-- SEED: Public Recipe Database for LiquiMixer
-- Date: 2026-02-05 (v2 - with flavor names)
-- Author ID: user_38Zd9OOCY8GioiwqHKbeblRpUzJ
-- Total recipes: 230 (60 Liquid + 60 Liquid PRO + 90 Shisha + 20 Shortfill)
-- ============================================
-- ZMĚNA: Všechny recepty nyní mají konkrétní názvy příchutí (flavorName/name)
-- ============================================

-- ============================================
-- PART 1: LIQUID RECIPES (30 recipes x 2 nicotine variants = 60)
-- form_type: liquid, difficulty_level: beginner
-- Struktura: flavorType + flavorName pro jednu příchuť
-- ============================================

-- 1. Strawberry Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Idealni pro celodenni vapovani.', true, 'liquid', 'beginner', 4.3, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Jahoda","flavorPercent":10,"steepingDays":7}', NOW());

-- 1b. Strawberry Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh (0mg)', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Jahoda","flavorPercent":10,"steepingDays":7}', NOW());

-- 2. Blueberry Burst (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Oblibena klasika mezi DIY mixery.', true, 'liquid', 'beginner', 4.5, 22, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Borůvka","flavorPercent":12,"steepingDays":7}', NOW());

-- 2b. Blueberry Burst (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst (0mg)', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Borůvka","flavorPercent":12,"steepingDays":7}', NOW());

-- 3. Watermelon Summer (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Lehky a svezi.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"watermelon","flavorName":"Meloun","flavorPercent":12,"steepingDays":7}', NOW());

-- 3b. Watermelon Summer (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer (0mg)', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"watermelon","flavorName":"Meloun","flavorPercent":12,"steepingDays":7}', NOW());

-- 4. Mango Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise', 'Exoticka mangova slast s kremovym podtonem. Jeden z nejoblibenejsich tropickych profilu.', true, 'liquid', 'beginner', 4.6, 28, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorPercent":15,"steepingDays":10}', NOW());

-- 4b. Mango Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise (0mg)', 'Exoticka mangova slast s kremovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.5, 21, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Mango","flavorPercent":15,"steepingDays":10}', NOW());

-- 5. Apple Crisp (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp', 'Krupave zelene jablko s lehkou kyselosti. Cisty a osvezujici profil pro kazdodenni use.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Jablko","flavorPercent":10,"steepingDays":7}', NOW());

-- 5b. Apple Crisp (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp (0mg)', 'Krupave zelene jablko s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Jablko","flavorPercent":10,"steepingDays":7}', NOW());

-- 6. Peach Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream', 'Stavnata broskev s jemnym kvetinovym nadechem. Hladky a prirozeny ovocny profil.', true, 'liquid', 'beginner', 4.4, 19, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"peach","flavorName":"Broskev","flavorPercent":12,"steepingDays":7}', NOW());

-- 6b. Peach Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream (0mg)', 'Stavnata broskev s jemnym kvetinovym nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"peach","flavorName":"Broskev","flavorPercent":12,"steepingDays":7}', NOW());

-- 7. Grape Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic', 'Sladke fialove hrozny s autentickou chuti. Nostalgicka chut detstvi.', true, 'liquid', 'beginner', 4.2, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"grape","flavorName":"Hroznové víno","flavorPercent":15,"steepingDays":7}', NOW());

-- 7b. Grape Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic (0mg)', 'Sladke fialove hrozny s autentickou chuti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"grape","flavorName":"Hroznové víno","flavorPercent":15,"steepingDays":7}', NOW());

-- 8. Raspberry Delight (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight', 'Stavnate maliny s lehkou kyselosti. Perfektni balance sladkeho a kyseleho.', true, 'liquid', 'beginner', 4.4, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorName":"Malina","flavorPercent":12,"steepingDays":7}', NOW());

-- 8b. Raspberry Delight (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight (0mg)', 'Stavnate maliny s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorName":"Malina","flavorPercent":12,"steepingDays":7}', NOW());

-- 9. Pineapple Tropical (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical', 'Tropicky ananas s jemnou sladkosti. Jako dovolena v lahvicce.', true, 'liquid', 'beginner', 4.3, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorName":"Ananas","flavorPercent":15,"steepingDays":10}', NOW());

-- 9b. Pineapple Tropical (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical (0mg)', 'Tropicky ananas s jemnou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorName":"Ananas","flavorPercent":15,"steepingDays":10}', NOW());

-- 10. Cherry Sweet (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet', 'Sladka visen s lehkym mandlovym podtonem. Klasika mezi ovocnymi profily.', true, 'liquid', 'beginner', 4.0, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorName":"Višeň","flavorPercent":10,"steepingDays":7}', NOW());

-- 10b. Cherry Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet (0mg)', 'Sladka visen s lehkym mandlovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorName":"Višeň","flavorPercent":10,"steepingDays":7}', NOW());

-- 11. Lemon Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh', 'Ostre svezi citron bez trpkosti. Perfektni pro ty, kdo miluji kysele.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Citrón","flavorPercent":8,"steepingDays":7}', NOW());

-- 11b. Lemon Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh (0mg)', 'Ostre svezi citron bez trpkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Citrón","flavorPercent":8,"steepingDays":7}', NOW());

-- 12. Orange Citrus (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus', 'Sladky pomeranc jako cerstvě vymackany dzus. Slunce v kazdem nadechu.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Pomeranč","flavorPercent":8,"steepingDays":7}', NOW());

-- 12b. Orange Citrus (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus (0mg)', 'Sladky pomeranc jako cerstvě vymackany dzus. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Pomeranč","flavorPercent":8,"steepingDays":7}', NOW());

-- 13. Lime Zest (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest', 'Svezi limeta s charakteristickou kyselosti. Idealni zaklad pro koktejlove profily.', true, 'liquid', 'beginner', 4.0, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Limetka","flavorPercent":8,"steepingDays":7}', NOW());

-- 13b. Lime Zest (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest (0mg)', 'Svezi limeta s charakteristickou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 9, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Limetka","flavorPercent":8,"steepingDays":7}', NOW());

-- 14. Grapefruit Tangy (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy', 'Lehce horky grapefruit pro odvaznejsi chutove poharky. Unikatni a osvezujici.', true, 'liquid', 'beginner', 3.9, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorName":"Grapefruit","flavorPercent":8,"steepingDays":7}', NOW());

-- 14b. Grapefruit Tangy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy (0mg)', 'Lehce horky grapefruit pro odvaznejsi chutove poharky. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.8, 8, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorName":"Grapefruit","flavorPercent":8,"steepingDays":7}', NOW());

-- 15. Cool Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cool Menthol', 'Cisty ledovy mentol pro osvezeni. Klasika pro milovniky chladu.', true, 'liquid', 'beginner', 4.3, 25, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorName":"Mentol","flavorPercent":8,"steepingDays":3}', NOW());

-- 15b. Cool Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cool Menthol (0mg)', 'Cisty ledovy mentol pro osvezeni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorName":"Mentol","flavorPercent":8,"steepingDays":3}', NOW());

-- 16. Spearmint Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Fresh', 'Jemnejsi mata s prirozenou sladkosti. Mene intenzivni nez mentol.', true, 'liquid', 'beginner', 4.1, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorName":"Máta","flavorPercent":7,"steepingDays":3}', NOW());

-- 16b. Spearmint Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Fresh (0mg)', 'Jemnejsi mata s prirozenou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorName":"Máta","flavorPercent":7,"steepingDays":3}', NOW());

-- 17. Vanilla Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream', 'Kremova vanilka s hladkym dozvukem. Zakladni dezertni profil.', true, 'liquid', 'beginner', 4.5, 30, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"biscuit","flavorName":"Vanilka","flavorPercent":10,"steepingDays":14}', NOW());

-- 17b. Vanilla Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream (0mg)', 'Kremova vanilka s hladkym dozvukem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 25, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"biscuit","flavorName":"Vanilka","flavorPercent":10,"steepingDays":14}', NOW());

-- 18. Caramel Sweet (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet', 'Sladky karamel jako cerstve pripraveny. Idealni pro milovniky sladkeho.', true, 'liquid', 'beginner', 4.3, 22, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"candy","flavorName":"Karamel","flavorPercent":10,"steepingDays":14}', NOW());

-- 18b. Caramel Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet (0mg)', 'Sladky karamel jako cerstve pripraveny. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"candy","flavorName":"Karamel","flavorPercent":10,"steepingDays":14}', NOW());

-- 19. Honey Gold (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Honey Gold', 'Prirodni med s jemnou zlatavou sladkosti. Unikatni a prirozeny.', true, 'liquid', 'beginner', 4.0, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"candy","flavorName":"Med","flavorPercent":8,"steepingDays":10}', NOW());

-- 19b. Honey Gold (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Honey Gold (0mg)', 'Prirodni med s jemnou zlatavou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"candy","flavorName":"Med","flavorPercent":8,"steepingDays":10}', NOW());

-- 20. Bubblegum Pop (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Bubblegum Pop', 'Nostalgicka zvykackova chut z detstvi. Sladka a hrava.', true, 'liquid', 'beginner', 4.1, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"candy","flavorName":"Žvýkačka","flavorPercent":12,"steepingDays":7}', NOW());

-- 20b. Bubblegum Pop (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Bubblegum Pop (0mg)', 'Nostalgicka zvykackova chut z detstvi. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"candy","flavorName":"Žvýkačka","flavorPercent":12,"steepingDays":7}', NOW());

-- 21. Classic Tobacco (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco', 'Autenticky tabakovy profil pro prechod z klasickych cigaret. Hladky a vyvazeny.', true, 'liquid', 'beginner', 4.2, 35, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorName":"Tabák Virginia","flavorPercent":10,"steepingDays":21}', NOW());

-- 21b. Classic Tobacco (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco (0mg)', 'Autenticky tabakovy profil. Verze bez nikotinu pro vapery bez zavislosti.', true, 'liquid', 'beginner', 4.0, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorName":"Tabák Virginia","flavorPercent":10,"steepingDays":21}', NOW());

-- 22. Turkish Blend (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Turkish Blend', 'Orientalni tabak s pikantnim nadechem. Pro znalce pravych tabaku.', true, 'liquid', 'beginner', 4.0, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorName":"Turecký tabák","flavorPercent":10,"steepingDays":21}', NOW());

-- 22b. Turkish Blend (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Turkish Blend (0mg)', 'Orientalni tabak s pikantnim nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorName":"Turecký tabák","flavorPercent":10,"steepingDays":21}', NOW());

-- 23. Coffee Morning (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Morning', 'Aromaticka kava jako z italske kavarny. Idealni pro ranni vapovani.', true, 'liquid', 'beginner', 4.3, 24, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"drink","flavorName":"Káva","flavorPercent":10,"steepingDays":10}', NOW());

-- 23b. Coffee Morning (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Morning (0mg)', 'Aromaticka kava jako z italske kavarny. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 19, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"drink","flavorName":"Káva","flavorPercent":10,"steepingDays":10}', NOW());

-- 24. Energy Rush (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Rush', 'Energeticky napoj pro aktivni vapery. Nabiti energie v kazdem nadechu.', true, 'liquid', 'beginner', 4.0, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"drink","flavorName":"Energy drink","flavorPercent":10,"steepingDays":7}', NOW());

-- 24b. Energy Rush (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Rush (0mg)', 'Energeticky napoj pro aktivni vapery. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"drink","flavorName":"Energy drink","flavorPercent":10,"steepingDays":7}', NOW());

-- 25. Cola Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic', 'Klasicka cola jako z automatu. Nostalgicka chut pro vsechny vekove kategorie.', true, 'liquid', 'beginner', 4.1, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"drink","flavorName":"Cola","flavorPercent":12,"steepingDays":7}', NOW());

-- 25b. Cola Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic (0mg)', 'Klasicka cola jako z automatu. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"drink","flavorName":"Cola","flavorPercent":12,"steepingDays":7}', NOW());

-- 26. Hazelnut Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Cream', 'Kremovy liskovy orisek s hladkym dozvukem. Pro milovniky orechovych chuti.', true, 'liquid', 'beginner', 4.2, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"nuts","flavorName":"Lískový oříšek","flavorPercent":10,"steepingDays":14}', NOW());

-- 26b. Hazelnut Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Cream (0mg)', 'Kremovy liskovy orisek s hladkym dozvukem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"nuts","flavorName":"Lískový oříšek","flavorPercent":10,"steepingDays":14}', NOW());

-- 27. Almond Delight (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Almond Delight', 'Jemne prazene mandle s prirozenou sladkosti. Elegantni orechovy profil.', true, 'liquid', 'beginner', 4.0, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"nuts","flavorName":"Mandle","flavorPercent":10,"steepingDays":14}', NOW());

-- 27b. Almond Delight (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Almond Delight (0mg)', 'Jemne prazene mandle s prirozenou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"nuts","flavorName":"Mandle","flavorPercent":10,"steepingDays":14}', NOW());

-- 28. Cinnamon Spice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cinnamon Spice', 'Tepla skorice s pikantnim nadechem. Pro milovniky korenene chuti.', true, 'liquid', 'beginner', 3.9, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"spice","flavorName":"Skořice","flavorPercent":5,"steepingDays":7}', NOW());

-- 28b. Cinnamon Spice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cinnamon Spice (0mg)', 'Tepla skorice s pikantnim nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.8, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"spice","flavorName":"Skořice","flavorPercent":5,"steepingDays":7}', NOW());

-- 29. Cookie Butter (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter', 'Maslova susenka jako od babicky. Hrejiva dezertni klasika.', true, 'liquid', 'beginner', 4.4, 26, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorName":"Máslová sušenka","flavorPercent":12,"steepingDays":14}', NOW());

-- 29b. Cookie Butter (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter (0mg)', 'Maslova susenka jako od babicky. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 21, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorName":"Máslová sušenka","flavorPercent":12,"steepingDays":14}', NOW());

-- 30. Cream Puff (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cream Puff', 'Lehky vetrnicky s kremovou naplni. Jemny dezertni zazitek.', true, 'liquid', 'beginner', 4.3, 23, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"dessert","flavorName":"Větrník","flavorPercent":12,"steepingDays":14}', NOW());

-- 30b. Cream Puff (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cream Puff (0mg)', 'Lehky vetrnicky s kremovou naplni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 19, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"dessert","flavorName":"Větrník","flavorPercent":12,"steepingDays":14}', NOW());

-- ============================================
-- END OF PART 1: LIQUID RECIPES (60 total)
-- ============================================

-- ============================================
-- PART 2: LIQUID PRO RECIPES (60 total)
-- form_type: liquidpro
-- Intermediate (2 flavors): 30 recipes
-- Expert (3 flavors): 20 recipes
-- Virtuoso (4 flavors): 10 recipes
-- Struktura: flavors array s type + name pro každou příchuť
-- ============================================

-- === INTERMEDIATE (2 příchutě) ===

-- 1. Strawberry Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream', 'Sladka jahoda s kremovou vanilkou. Harmonicka kombinace ovoce a dezertu.', true, 'liquidpro', 'intermediate', 4.6, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"biscuit","name":"Vanilkový krém","percent":5}],"steepingDays":14}', NOW());

-- 1b. Strawberry Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream (0mg)', 'Sladka jahoda s kremovou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.5, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"biscuit","name":"Vanilkový krém","percent":5}],"steepingDays":14}', NOW());

-- 2. Blueberry Lemonade (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade', 'Osvezujici boruvkova limonada. Letni svezest v kazdem nadechu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":10},{"type":"citrus","name":"Citrón","percent":4}],"steepingDays":10}', NOW());

-- 2b. Blueberry Lemonade (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade (0mg)', 'Osvezujici boruvkova limonada. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":10},{"type":"citrus","name":"Citrón","percent":4}],"steepingDays":10}', NOW());

-- 3. Peach Mango (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango', 'Tropicka kombinace broskve a manga. Slunecni vune exotickych ostrovu.', true, 'liquidpro', 'intermediate', 4.5, 25, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"peach","name":"Broskev","percent":8},{"type":"tropical","name":"Mango","percent":8}],"steepingDays":10}', NOW());

-- 3b. Peach Mango (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango (0mg)', 'Tropicka kombinace broskve a manga. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"peach","name":"Broskev","percent":8},{"type":"tropical","name":"Mango","percent":8}],"steepingDays":10}', NOW());

-- 4. Apple Cinnamon (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon', 'Pecene jablko se skorici. Podzimni pohoda u krbu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jablko","percent":10},{"type":"spice","name":"Skořice","percent":3}],"steepingDays":14}', NOW());

-- 4b. Apple Cinnamon (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon (0mg)', 'Pecene jablko se skorici. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 15, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jablko","percent":10},{"type":"spice","name":"Skořice","percent":3}],"steepingDays":14}', NOW());

-- 5. Menthol Watermelon (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon', 'Ledovy meloun s mentolovym dotekem. Dokonale letni osvezeni.', true, 'liquidpro', 'intermediate', 4.7, 32, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"watermelon","name":"Meloun","percent":10},{"type":"menthol","name":"Mentol","percent":3}],"steepingDays":7}', NOW());

-- 5b. Menthol Watermelon (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon (0mg)', 'Ledovy meloun s mentolovym dotekem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.6, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"watermelon","name":"Meloun","percent":10},{"type":"menthol","name":"Mentol","percent":3}],"steepingDays":7}', NOW());

-- 6. Vanilla Custard (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard', 'Kremovy custard s bohatou vanilkou. Ultimatni dezertni zazitek.', true, 'liquidpro', 'intermediate', 4.8, 45, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"biscuit","name":"Vanilka","percent":10},{"type":"dessert","name":"Custard","percent":8}],"steepingDays":28}', NOW());

-- 6b. Vanilla Custard (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard (0mg)', 'Kremovy custard s bohatou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.7, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"biscuit","name":"Vanilka","percent":10},{"type":"dessert","name":"Custard","percent":8}],"steepingDays":28}', NOW());

-- 7. Tobacco Honey (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey', 'Medovy tabak s prirozenou sladkosti. Sofistikovany profil pro kentery.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tobacco","name":"Tabák Virginia","percent":10},{"type":"candy","name":"Med","percent":4}],"steepingDays":21}', NOW());

-- 7b. Tobacco Honey (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey (0mg)', 'Medovy tabak s prirozenou sladkosti. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.1, 14, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tobacco","name":"Tabák Virginia","percent":10},{"type":"candy","name":"Med","percent":4}],"steepingDays":21}', NOW());

-- 8. Raspberry Cheesecake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake', 'Malinovy cheesecake s krustou. Luxusni dezert pro kazdy den.', true, 'liquidpro', 'intermediate', 4.6, 30, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","name":"Malina","percent":8},{"type":"dessert","name":"Cheesecake","percent":10}],"steepingDays":21}', NOW());

-- 8b. Raspberry Cheesecake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake (0mg)', 'Malinovy cheesecake s krustou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.5, 25, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","name":"Malina","percent":8},{"type":"dessert","name":"Cheesecake","percent":10}],"steepingDays":21}', NOW());

-- 9. Grape Candy (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy', 'Hroznove bonbony z detstvi. Sladka nostalgie v kazdem nadechu.', true, 'liquidpro', 'intermediate', 4.1, 16, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"grape","name":"Hroznové víno","percent":12},{"type":"candy","name":"Bonbón","percent":6}],"steepingDays":7}', NOW());

-- 9b. Grape Candy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy (0mg)', 'Hroznove bonbony z detstvi. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.0, 13, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"grape","name":"Hroznové víno","percent":12},{"type":"candy","name":"Bonbón","percent":6}],"steepingDays":7}', NOW());

-- 10. Cherry Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol', 'Ledova visen s chladivym zakoncenim. Svezi a intenzivni.', true, 'liquidpro', 'intermediate', 4.3, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Višeň","percent":10},{"type":"menthol","name":"Mentol","percent":4}],"steepingDays":7}', NOW());

-- 10b. Cherry Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol (0mg)', 'Ledova visen s chladivym zakoncenim. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Višeň","percent":10},{"type":"menthol","name":"Mentol","percent":4}],"steepingDays":7}', NOW());

-- 11. Cookie Caramel (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel', 'Karamelova susenka s maslovym zakladem. Teply a utulny profil.', true, 'liquidpro', 'intermediate', 4.4, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"bakery","name":"Máslová sušenka","percent":10},{"type":"candy","name":"Karamel","percent":6}],"steepingDays":14}', NOW());

-- 11b. Cookie Caramel (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel (0mg)', 'Karamelova susenka s maslovym zakladem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"bakery","name":"Máslová sušenka","percent":10},{"type":"candy","name":"Karamel","percent":6}],"steepingDays":14}', NOW());

-- 12. Coffee Hazelnut (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Hazelnut', 'Liskooriskove latte jako z kavarny. Perfektni pro ranni ritualy.', true, 'liquidpro', 'intermediate', 4.5, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"drink","name":"Káva","percent":8},{"type":"nuts","name":"Lískový oříšek","percent":6}],"steepingDays":14}', NOW());

-- 12b. Coffee Hazelnut (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Hazelnut (0mg)', 'Liskooriskove latte jako z kavarny. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"drink","name":"Káva","percent":8},{"type":"nuts","name":"Lískový oříšek","percent":6}],"steepingDays":14}', NOW());

-- 13. Coconut Pineapple (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Pineapple', 'Pina Colada bez alkoholu. Tropicky raj v lahvicce.', true, 'liquidpro', 'intermediate', 4.4, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Kokos","percent":8},{"type":"tropical","name":"Ananas","percent":8}],"steepingDays":10}', NOW());

-- 13b. Coconut Pineapple (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Pineapple (0mg)', 'Pina Colada bez alkoholu. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Kokos","percent":8},{"type":"tropical","name":"Ananas","percent":8}],"steepingDays":10}', NOW());

-- 14. Banana Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Cream', 'Zraly banan s kremovou vanilkou. Sladky a hladky profil.', true, 'liquidpro', 'intermediate', 4.2, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Banán","percent":10},{"type":"biscuit","name":"Vanilkový krém","percent":6}],"steepingDays":10}', NOW());

-- 14b. Banana Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Cream (0mg)', 'Zraly banan s kremovou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.1, 15, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Banán","percent":10},{"type":"biscuit","name":"Vanilkový krém","percent":6}],"steepingDays":10}', NOW());

-- 15. Kiwi Strawberry (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry', 'Svezi kiwi s jahodou. Klasicka ovocna kombinace.', true, 'liquidpro', 'intermediate', 4.3, 21, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Kiwi","percent":8},{"type":"fruit","name":"Jahoda","percent":8}],"steepingDays":7}', NOW());

-- 15b. Kiwi Strawberry (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry (0mg)', 'Svezi kiwi s jahodou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Kiwi","percent":8},{"type":"fruit","name":"Jahoda","percent":8}],"steepingDays":7}', NOW());

-- === EXPERT (3 příchutě) ===

-- 16. Strawberry Kiwi Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol', 'Ledovy mix jahody a kiwi s mentolovym dotekem. Osvezujici ovocna bomba.', true, 'liquidpro', 'expert', 4.6, 29, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"tropical","name":"Kiwi","percent":6},{"type":"menthol","name":"Mentol","percent":2}],"steepingDays":10}', NOW());

-- 16b. Strawberry Kiwi Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol (0mg)', 'Ledovy mix jahody a kiwi. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.5, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"tropical","name":"Kiwi","percent":6},{"type":"menthol","name":"Mentol","percent":2}],"steepingDays":10}', NOW());

-- 17. Tropical Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise', 'Mango, ananas a kokos. Exoticky raj v lahvicce.', true, 'liquidpro', 'expert', 4.7, 35, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":10},{"type":"tropical","name":"Ananas","percent":6},{"type":"tropical","name":"Kokos","percent":4}],"steepingDays":14}', NOW());

-- 17b. Tropical Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise (0mg)', 'Mango, ananas a kokos. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.6, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":10},{"type":"tropical","name":"Ananas","percent":6},{"type":"tropical","name":"Kokos","percent":4}],"steepingDays":14}', NOW());

-- 18. Berry Fusion (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion', 'Mix boruvek, malin a jahod. Lesni symfonie chuti.', true, 'liquidpro', 'expert', 4.5, 26, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":8},{"type":"berry","name":"Malina","percent":6},{"type":"fruit","name":"Jahoda","percent":5}],"steepingDays":10}', NOW());

-- 18b. Berry Fusion (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion (0mg)', 'Mix boruvek, malin a jahod. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 21, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":8},{"type":"berry","name":"Malina","percent":6},{"type":"fruit","name":"Jahoda","percent":5}],"steepingDays":10}', NOW());

-- 19. Vanilla Tobacco RY4 (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4', 'Legendarni RY4 s vanilkou a karamelem. Mistrovske dilo pro znalce.', true, 'liquidpro', 'expert', 4.8, 42, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tobacco","name":"Tabák RY4","percent":8},{"type":"biscuit","name":"Vanilka","percent":6},{"type":"candy","name":"Karamel","percent":4}],"steepingDays":28}', NOW());

-- 19b. Vanilla Tobacco RY4 (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4 (0mg)', 'Legendarni RY4 s vanilkou a karamelem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.7, 35, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tobacco","name":"Tabák RY4","percent":8},{"type":"biscuit","name":"Vanilka","percent":6},{"type":"candy","name":"Karamel","percent":4}],"steepingDays":28}', NOW());

-- 20. Blueberry Vanilla Cake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Vanilla Cake', 'Boruvkovy dort s vanilkovym kremem. Cukrarsky skvost.', true, 'liquidpro', 'expert', 4.5, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":8},{"type":"biscuit","name":"Vanilka","percent":8},{"type":"bakery","name":"Dort","percent":5}],"steepingDays":21}', NOW());

-- 20b. Blueberry Vanilla Cake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Vanilla Cake (0mg)', 'Boruvkovy dort s vanilkovym kremem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":8},{"type":"biscuit","name":"Vanilka","percent":8},{"type":"bakery","name":"Dort","percent":5}],"steepingDays":21}', NOW());

-- 21. Citrus Storm (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm', 'Pomeranc, citron a grapefruit. Citrusova exploze energie.', true, 'liquidpro', 'expert', 4.2, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"citrus","name":"Pomeranč","percent":6},{"type":"citrus","name":"Citrón","percent":5},{"type":"citrus","name":"Grapefruit","percent":4}],"steepingDays":7}', NOW());

-- 21b. Citrus Storm (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm (0mg)', 'Pomeranc, citron a grapefruit. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.1, 14, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"citrus","name":"Pomeranč","percent":6},{"type":"citrus","name":"Citrón","percent":5},{"type":"citrus","name":"Grapefruit","percent":4}],"steepingDays":7}', NOW());

-- 22. Strawberry Banana Smoothie (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Banana Smoothie', 'Jahodovo-bananove smoothie s kremem. Snidane v lahvicce.', true, 'liquidpro', 'expert', 4.4, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"tropical","name":"Banán","percent":6},{"type":"biscuit","name":"Smetana","percent":4}],"steepingDays":10}', NOW());

-- 22b. Strawberry Banana Smoothie (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Banana Smoothie (0mg)', 'Jahodovo-bananove smoothie s kremem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":8},{"type":"tropical","name":"Banán","percent":6},{"type":"biscuit","name":"Smetana","percent":4}],"steepingDays":10}', NOW());

-- 23. Apple Pie Deluxe (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Pie Deluxe', 'Jablkovy kolac se skorici a vanilkou. Babicin recept.', true, 'liquidpro', 'expert', 4.6, 31, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jablko","percent":10},{"type":"spice","name":"Skořice","percent":3},{"type":"bakery","name":"Koláč","percent":6}],"steepingDays":21}', NOW());

-- 23b. Apple Pie Deluxe (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Pie Deluxe (0mg)', 'Jablkovy kolac se skorici a vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.5, 26, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jablko","percent":10},{"type":"spice","name":"Skořice","percent":3},{"type":"bakery","name":"Koláč","percent":6}],"steepingDays":21}', NOW());

-- 24. Mango Passionfruit Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passionfruit Ice', 'Mango a marakuja s ledovym dotykem. Tropicka svezest.', true, 'liquidpro', 'expert', 4.5, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":8},{"type":"tropical","name":"Marakuja","percent":6},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":10}', NOW());

-- 24b. Mango Passionfruit Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passionfruit Ice (0mg)', 'Mango a marakuja s ledovym dotykem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":8},{"type":"tropical","name":"Marakuja","percent":6},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":10}', NOW());

-- 25. Peach Apricot Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Apricot Cream', 'Broskev a merunka s kremovou vanilkou. Letni pecky v plne parade.', true, 'liquidpro', 'expert', 4.3, 21, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"peach","name":"Broskev","percent":8},{"type":"peach","name":"Meruňka","percent":6},{"type":"biscuit","name":"Vanilkový krém","percent":4}],"steepingDays":14}', NOW());

-- 25b. Peach Apricot Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Apricot Cream (0mg)', 'Broskev a merunka s kremovou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"peach","name":"Broskev","percent":8},{"type":"peach","name":"Meruňka","percent":6},{"type":"biscuit","name":"Vanilkový krém","percent":4}],"steepingDays":14}', NOW());

-- === VIRTUOSO (4 příchutě) ===

-- 26. Ultimate Fruit Mix (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Mix', 'Jahoda, malina, boruvka a citron. Ultimatni ovocny koktejl.', true, 'liquidpro', 'virtuoso', 4.7, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":6},{"type":"berry","name":"Malina","percent":5},{"type":"berry","name":"Borůvka","percent":5},{"type":"citrus","name":"Citrón","percent":3}],"steepingDays":10}', NOW());

-- 26b. Ultimate Fruit Mix (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Mix (0mg)', 'Jahoda, malina, boruvka a citron. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.6, 32, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","name":"Jahoda","percent":6},{"type":"berry","name":"Malina","percent":5},{"type":"berry","name":"Borůvka","percent":5},{"type":"citrus","name":"Citrón","percent":3}],"steepingDays":10}', NOW());

-- 27. Dessert Heaven (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Heaven', 'Vanilka, karamel, susenka a smetana. Dezertni nebe.', true, 'liquidpro', 'virtuoso', 4.8, 45, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"biscuit","name":"Vanilka","percent":6},{"type":"candy","name":"Karamel","percent":5},{"type":"bakery","name":"Máslová sušenka","percent":5},{"type":"biscuit","name":"Smetana","percent":4}],"steepingDays":28}', NOW());

-- 27b. Dessert Heaven (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Heaven (0mg)', 'Vanilka, karamel, susenka a smetana. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.7, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"biscuit","name":"Vanilka","percent":6},{"type":"candy","name":"Karamel","percent":5},{"type":"bakery","name":"Máslová sušenka","percent":5},{"type":"biscuit","name":"Smetana","percent":4}],"steepingDays":28}', NOW());

-- 28. Tropical Ice Storm (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Storm', 'Mango, ananas, kokos a ledovy mentol. Tropicka ledova boure.', true, 'liquidpro', 'virtuoso', 4.6, 33, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Kokos","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":10}', NOW());

-- 28b. Tropical Ice Storm (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Storm (0mg)', 'Mango, ananas, kokos a ledovy mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.5, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":6},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Kokos","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":10}', NOW());

-- 29. Berry Yogurt Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream', 'Boruvky, maliny, jogurt a granola. Zdravy zazitek v kazdem nadechu.', true, 'liquidpro', 'virtuoso', 4.5, 29, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":6},{"type":"berry","name":"Malina","percent":5},{"type":"dessert","name":"Jogurt","percent":5},{"type":"bakery","name":"Granola","percent":4}],"steepingDays":21}', NOW());

-- 29b. Berry Yogurt Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream (0mg)', 'Boruvky, maliny, jogurt a granola. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.4, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","name":"Borůvka","percent":6},{"type":"berry","name":"Malina","percent":5},{"type":"dessert","name":"Jogurt","percent":5},{"type":"bakery","name":"Granola","percent":4}],"steepingDays":21}', NOW());

-- 30. Tropical Ice Cocktail (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail', 'Mango, ananas, marakuja a ledovy mentol. Exoticky koktejl u plaze.', true, 'liquidpro', 'virtuoso', 4.7, 36, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":7},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Marakuja","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":14}', NOW());

-- 30b. Tropical Ice Cocktail (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail (0mg)', 'Mango, ananas, marakuja a ledovy mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.6, 30, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","name":"Mango","percent":7},{"type":"tropical","name":"Ananas","percent":5},{"type":"tropical","name":"Marakuja","percent":4},{"type":"menthol","name":"Ledový mentol","percent":3}],"steepingDays":14}', NOW());

-- ============================================
-- END OF PART 2: LIQUID PRO RECIPES (60 total)
-- ============================================

-- ============================================
-- POKRAČOVÁNÍ - SHISHA a SHORTFILL recepty budou v dalším souboru
-- nebo mohu pokračovat zde
-- ============================================
