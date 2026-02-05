-- ============================================
-- SEED: Public Recipe Database for LiquiMixer
-- Date: 2026-02-05
-- Author ID: user_38Zd9OOCY8GioiwqHKbeblRpUzJ
-- Total recipes: 230 (60 Liquid + 60 Liquid PRO + 90 Shisha + 20 Shortfill)
-- ============================================

-- ============================================
-- PART 1: LIQUID RECIPES (30 recipes x 2 nicotine variants = 60)
-- form_type: liquid, difficulty_level: beginner
-- ============================================

-- 1. Strawberry Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Idealni pro celodenni vapovani.', true, 'liquid', 'beginner', 4.3, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 1b. Strawberry Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Fresh (0mg)', 'Svezi jahodova chut pripominajici cerstvě utrhane jahody za letniho rana. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 2. Blueberry Burst (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Oblibena klasika mezi DIY mixery.', true, 'liquid', 'beginner', 4.5, 22, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorPercent":12,"steepingDays":7}', NOW());

-- 2b. Blueberry Burst (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Burst (0mg)', 'Intenzivni boruvkova exploze s jemnym sladkym dozvukem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorPercent":12,"steepingDays":7}', NOW());

-- 3. Watermelon Summer (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Lehky a svezi.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"watermelon","flavorPercent":12,"steepingDays":7}', NOW());

-- 3b. Watermelon Summer (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Summer (0mg)', 'Osvezujici melounova chut jako studeny platek melounu v horkem dni. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"watermelon","flavorPercent":12,"steepingDays":7}', NOW());

-- 4. Mango Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise', 'Exoticka mangova slast s kremovym podtonem. Jeden z nejoblibenejsich tropickych profilu.', true, 'liquid', 'beginner', 4.6, 28, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorPercent":15,"steepingDays":10}', NOW());

-- 4b. Mango Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Paradise (0mg)', 'Exoticka mangova slast s kremovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.5, 21, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorPercent":15,"steepingDays":10}', NOW());

-- 5. Apple Crisp (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp', 'Krupave zelene jablko s lehkou kyselosti. Cisty a osvezujici profil pro kazdodenni use.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 5b. Apple Crisp (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Crisp (0mg)', 'Krupave zelene jablko s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 6. Peach Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream', 'Stavnata broskev s jemnym kvetinovym nadechem. Hladky a prirozeny ovocny profil.', true, 'liquid', 'beginner', 4.4, 19, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"peach","flavorPercent":12,"steepingDays":7}', NOW());

-- 6b. Peach Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Dream (0mg)', 'Stavnata broskev s jemnym kvetinovym nadechem. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"peach","flavorPercent":12,"steepingDays":7}', NOW());

-- 7. Grape Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic', 'Sladke fialove hrozny s autentickou chuti. Nostalgicka chut detstvi.', true, 'liquid', 'beginner', 4.2, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"grape","flavorPercent":15,"steepingDays":7}', NOW());

-- 7b. Grape Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Classic (0mg)', 'Sladke fialove hrozny s autentickou chuti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"grape","flavorPercent":15,"steepingDays":7}', NOW());

-- 8. Raspberry Delight (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight', 'Stavnate maliny s lehkou kyselosti. Perfektni balance sladkeho a kyseleho.', true, 'liquid', 'beginner', 4.4, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"berry","flavorPercent":12,"steepingDays":7}', NOW());

-- 8b. Raspberry Delight (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Delight (0mg)', 'Stavnate maliny s lehkou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"berry","flavorPercent":12,"steepingDays":7}', NOW());

-- 9. Pineapple Tropical (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical', 'Tropicky ananas s jemnou sladkosti. Jako dovolena v lahvicce.', true, 'liquid', 'beginner', 4.3, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"tropical","flavorPercent":15,"steepingDays":10}', NOW());

-- 9b. Pineapple Tropical (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Tropical (0mg)', 'Tropicky ananas s jemnou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tropical","flavorPercent":15,"steepingDays":10}', NOW());

-- 10. Cherry Sweet (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet', 'Sladka visen s lehkym mandlovym podtonem. Klasika mezi ovocnymi profily.', true, 'liquid', 'beginner', 4.0, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 10b. Cherry Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Sweet (0mg)', 'Sladka visen s lehkym mandlovym podtonem. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"fruit","flavorPercent":10,"steepingDays":7}', NOW());

-- 11. Lemon Fresh (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh', 'Ostre svezi citron bez trpkosti. Perfektni pro ty, kdo miluji kysele.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 11b. Lemon Fresh (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh (0mg)', 'Ostre svezi citron bez trpkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 12. Orange Citrus (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus', 'Sladky pomeranc jako cerstvě vymackany dzus. Slunce v kazdem nadechu.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 12b. Orange Citrus (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Citrus (0mg)', 'Sladky pomeranc jako cerstvě vymackany dzus. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 13. Lime Zest (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest', 'Svezi limeta s charakteristickou kyselosti. Idealni zaklad pro koktejlove profily.', true, 'liquid', 'beginner', 4.0, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 13b. Lime Zest (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lime Zest (0mg)', 'Svezi limeta s charakteristickou kyselosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 9, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 14. Grapefruit Tangy (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy', 'Lehce horky grapefruit pro odvaznejsi chutove poharky. Unikatni a osvezujici.', true, 'liquid', 'beginner', 3.9, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 14b. Grapefruit Tangy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Tangy (0mg)', 'Lehce horky grapefruit pro odvaznejsi chutove poharky. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.8, 8, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"citrus","flavorPercent":8,"steepingDays":7}', NOW());

-- 15. Pure Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pure Menthol', 'Cisty ledovy mentol bez primesi. Maximum chladu pro milovniky intenzivniho osvezeni.', true, 'liquid', 'beginner', 4.5, 25, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 15b. Pure Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pure Menthol (0mg)', 'Cisty ledovy mentol bez primesi. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 20, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 16. Spearmint Cool (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Cool', 'Jemna mata peprna s prirozenou sladkosti. Svezi dech po kazdem nadechu.', true, 'liquid', 'beginner', 4.3, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 16b. Spearmint Cool (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Spearmint Cool (0mg)', 'Jemna mata peprna s prirozenou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 17. Peppermint Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peppermint Ice', 'Intenzivni mata kaderava s ledovym zakoncenim. Pro opravdove mentolove nadsence.', true, 'liquid', 'beginner', 4.2, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 17b. Peppermint Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peppermint Ice (0mg)', 'Intenzivni mata kaderava s ledovym zakoncenim. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 18. Arctic Freeze (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Arctic Freeze', 'Extremni chlad arktickych ledovcu. Probouzi smysly a cisti hlavu.', true, 'liquid', 'beginner', 4.4, 21, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 18b. Arctic Freeze (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Arctic Freeze (0mg)', 'Extremni chlad arktickych ledovcu. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"menthol","flavorPercent":6,"steepingDays":3}', NOW());

-- 19. Vanilla Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream', 'Kremova vanilka jako ze zmrzlinoveho kornoutu. Hladka a sametova textura.', true, 'liquid', 'beginner', 4.6, 30, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"biscuit","flavorPercent":12,"steepingDays":10}', NOW());

-- 19b. Vanilla Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Dream (0mg)', 'Kremova vanilka jako ze zmrzlinoveho kornoutu. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.5, 25, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"biscuit","flavorPercent":12,"steepingDays":10}', NOW());

-- 20. Caramel Sweet (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet', 'Maslovy karamel s lehkou solnosti. Dekadentni sladkost pro narocne.', true, 'liquid', 'beginner', 4.3, 17, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"candy","flavorPercent":16,"steepingDays":10}', NOW());

-- 20b. Caramel Sweet (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Sweet (0mg)', 'Maslovy karamel s lehkou solnosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"candy","flavorPercent":16,"steepingDays":10}', NOW());

-- 21. Custard Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Custard Classic', 'Tradicni anglicky custard s bohatou kremovosti. Legenda mezi dezertnimi profily.', true, 'liquid', 'beginner', 4.7, 35, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"dessert","flavorPercent":18,"steepingDays":21}', NOW());

-- 21b. Custard Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Custard Classic (0mg)', 'Tradicni anglicky custard s bohatou kremovosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.6, 28, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"dessert","flavorPercent":18,"steepingDays":21}', NOW());

-- 22. Cookie Butter (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter', 'Maslove susenky jako od babicky. Teply a utulny profil pro chladne vecery.', true, 'liquid', 'beginner', 4.4, 22, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorPercent":20,"steepingDays":21}', NOW());

-- 22b. Cookie Butter (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Butter (0mg)', 'Maslove susenky jako od babicky. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.3, 18, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorPercent":20,"steepingDays":21}', NOW());

-- 23. Donut Glaze (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Donut Glaze', 'Cerstvě glazovany donut s lehkou vanilkou. Snidane sampionu.', true, 'liquid', 'beginner', 4.2, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"bakery","flavorPercent":20,"steepingDays":21}', NOW());

-- 23b. Donut Glaze (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Donut Glaze (0mg)', 'Cerstvě glazovany donut s lehkou vanilkou. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.1, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"bakery","flavorPercent":20,"steepingDays":21}', NOW());

-- 24. Pudding Smooth (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pudding Smooth', 'Hedvabny vanilkovy pudink. Nostalgicka chut detskych dezertu.', true, 'liquid', 'beginner', 4.3, 19, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"dessert","flavorPercent":18,"steepingDays":21}', NOW());

-- 24b. Pudding Smooth (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pudding Smooth (0mg)', 'Hedvabny vanilkovy pudink. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.2, 16, 
'{"formType":"liquid","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"dessert","flavorPercent":18,"steepingDays":21}', NOW());

-- 25. Classic Tobacco (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco', 'Autenticky tabakovy profil pro prechazejici kuraky. Cisty a nezkresleny.', true, 'liquid', 'beginner', 4.1, 15, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 25b. Classic Tobacco (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Classic Tobacco (0mg)', 'Autenticky tabakovy profil pro prechazejici kuraky. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.0, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 26. Virginia Blend (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Virginia Blend', 'Jemny Virginia tabak s lehkou sladkosti. Elegantni volba pro kentery.', true, 'liquid', 'beginner', 4.0, 13, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 26b. Virginia Blend (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Virginia Blend (0mg)', 'Jemny Virginia tabak s lehkou sladkosti. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 27. Cuban Cigar (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cuban Cigar', 'Robustni kubansky doutnik s drevitymi tony. Pro opravdove znalce.', true, 'liquid', 'beginner', 3.9, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 27b. Cuban Cigar (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cuban Cigar (0mg)', 'Robustni kubansky doutnik s drevitymi tony. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.8, 9, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobacco","flavorPercent":12,"steepingDays":14}', NOW());

-- 28. RY4 Original (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'RY4 Original', 'Legendarni RY4 s karamelem a vanilkou. Nejoblibenejsi tabakovy profil sveta.', true, 'liquid', 'beginner', 4.5, 32, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavorType":"tobaccosweet","flavorPercent":17,"steepingDays":28}', NOW());

-- 28b. RY4 Original (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'RY4 Original (0mg)', 'Legendarni RY4 s karamelem a vanilkou. Verze bez nikotinu.', true, 'liquid', 'beginner', 4.4, 26, 
'{"formType":"liquid","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"tobaccosweet","flavorPercent":17,"steepingDays":28}', NOW());

-- 29. Cola Classic (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic', 'Autenticka cola s charakteristickym stipanim. Nostalgie v lahvicce.', true, 'liquid', 'beginner', 4.0, 14, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"drink","flavorPercent":10,"steepingDays":7}', NOW());

-- 29b. Cola Classic (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Classic (0mg)', 'Autenticka cola s charakteristickym stipanim. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.9, 11, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"drink","flavorPercent":10,"steepingDays":7}', NOW());

-- 30. Energy Boost (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Boost', 'Energeticky napoj pro aktivni vapery. Sladke taurinove vzpominky.', true, 'liquid', 'beginner', 3.8, 12, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavorType":"drink","flavorPercent":10,"steepingDays":7}', NOW());

-- 30b. Energy Boost (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Boost (0mg)', 'Energeticky napoj pro aktivni vapery. Verze bez nikotinu.', true, 'liquid', 'beginner', 3.7, 10, 
'{"formType":"liquid","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavorType":"drink","flavorPercent":10,"steepingDays":7}', NOW());

-- ============================================
-- END OF PART 1: LIQUID RECIPES (60 total)
-- ============================================

-- ============================================
-- PART 2: LIQUID PRO RECIPES (60 total)
-- form_type: liquidpro
-- Multi-flavor recipes with difficulty levels
-- ============================================

-- === INTERMEDIATE (2 flavors) - 15 recipes x 2 nic variants = 30 ===

-- 1. Strawberry Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream', 'Sladka jahoda s kremovou vanilkou. Harmonicka kombinace ovoce a dezertu.', true, 'liquidpro', 'intermediate', 4.6, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"biscuit","percent":5}],"steepingDays":14}', NOW());

-- 1b. Strawberry Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Cream (0mg)', 'Sladka jahoda s kremovou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.5, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"biscuit","percent":5}],"steepingDays":14}', NOW());

-- 2. Blueberry Lemonade (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade', 'Osvezujici boruvkova limonada. Letni svezest v kazdem nadechu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","percent":10},{"type":"citrus","percent":4}],"steepingDays":10}', NOW());

-- 2b. Blueberry Lemonade (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Lemonade (0mg)', 'Osvezujici boruvkova limonada. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","percent":10},{"type":"citrus","percent":4}],"steepingDays":10}', NOW());

-- 3. Peach Mango (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango', 'Tropicka kombinace broskve a manga. Slunecni vune exotickych ostrovu.', true, 'liquidpro', 'intermediate', 4.5, 25, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"peach","percent":8},{"type":"tropical","percent":8}],"steepingDays":10}', NOW());

-- 3b. Peach Mango (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mango (0mg)', 'Tropicka kombinace broskve a manga. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"peach","percent":8},{"type":"tropical","percent":8}],"steepingDays":10}', NOW());

-- 4. Apple Cinnamon (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon', 'Pecene jablko se skorici. Podzimni pohoda u krbu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","percent":10},{"type":"spice","percent":3}],"steepingDays":14}', NOW());

-- 4b. Apple Cinnamon (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon (0mg)', 'Pecene jablko se skorici. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 15, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","percent":10},{"type":"spice","percent":3}],"steepingDays":14}', NOW());

-- 5. Menthol Watermelon (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon', 'Ledovy meloun s mentolovym dotekem. Dokonale letni osvezeni.', true, 'liquidpro', 'intermediate', 4.7, 32, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"watermelon","percent":10},{"type":"menthol","percent":3}],"steepingDays":7}', NOW());

-- 5b. Menthol Watermelon (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Watermelon (0mg)', 'Ledovy meloun s mentolovym dotekem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.6, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"watermelon","percent":10},{"type":"menthol","percent":3}],"steepingDays":7}', NOW());

-- 6. Vanilla Custard (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard', 'Kremovy custard s bohatou vanilkou. Ultimatni dezertni zazitek.', true, 'liquidpro', 'intermediate', 4.8, 45, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"biscuit","percent":10},{"type":"dessert","percent":8}],"steepingDays":28}', NOW());

-- 6b. Vanilla Custard (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard (0mg)', 'Kremovy custard s bohatou vanilkou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.7, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"biscuit","percent":10},{"type":"dessert","percent":8}],"steepingDays":28}', NOW());

-- 7. Tobacco Honey (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey', 'Medovy tabak s prirozenou sladkosti. Sofistikovany profil pro kentery.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tobacco","percent":10},{"type":"candy","percent":4}],"steepingDays":21}', NOW());

-- 7b. Tobacco Honey (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Honey (0mg)', 'Medovy tabak s prirozenou sladkosti. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.1, 14, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tobacco","percent":10},{"type":"candy","percent":4}],"steepingDays":21}', NOW());

-- 8. Raspberry Cheesecake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake', 'Malinovy cheesecake s krustou. Luxusni dezert pro kazdy den.', true, 'liquidpro', 'intermediate', 4.6, 30, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"dessert","percent":10}],"steepingDays":21}', NOW());

-- 8b. Raspberry Cheesecake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Cheesecake (0mg)', 'Malinovy cheesecake s krustou. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.5, 25, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"dessert","percent":10}],"steepingDays":21}', NOW());

-- 9. Grape Candy (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy', 'Hroznove bonbony z detstvi. Sladka nostalgie v kazdem nadechu.', true, 'liquidpro', 'intermediate', 4.1, 16, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"grape","percent":12},{"type":"candy","percent":6}],"steepingDays":7}', NOW());

-- 9b. Grape Candy (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Candy (0mg)', 'Hroznove bonbony z detstvi. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.0, 13, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"grape","percent":12},{"type":"candy","percent":6}],"steepingDays":7}', NOW());

-- 10. Cherry Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol', 'Ledova visen s chladivym zakoncenim. Svezi a intenzivni.', true, 'liquidpro', 'intermediate', 4.3, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","percent":10},{"type":"menthol","percent":4}],"steepingDays":7}', NOW());

-- 10b. Cherry Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Menthol (0mg)', 'Ledova visen s chladivym zakoncenim. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","percent":10},{"type":"menthol","percent":4}],"steepingDays":7}', NOW());

-- 11. Cookie Caramel (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel', 'Karamelova susicka s maslovym zakladem. Teply a utulny profil.', true, 'liquidpro', 'intermediate', 4.4, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"bakery","percent":12},{"type":"candy","percent":8}],"steepingDays":21}', NOW());

-- 11b. Cookie Caramel (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cookie Caramel (0mg)', 'Karamelova susicka s maslovym zakladem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"bakery","percent":12},{"type":"candy","percent":8}],"steepingDays":21}', NOW());

-- 12. Pineapple Coconut (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Coconut', 'Pina colada bez alkoholu. Plaz a palmy v kazdem nadechu.', true, 'liquidpro', 'intermediate', 4.5, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","percent":12},{"type":"nuts","percent":5}],"steepingDays":10}', NOW());

-- 12b. Pineapple Coconut (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Coconut (0mg)', 'Pina colada bez alkoholu. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","percent":12},{"type":"nuts","percent":5}],"steepingDays":10}', NOW());

-- 13. Lemon Tart (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Tart', 'Citronovy kolac s kremem. Kyselost vyvazena sladkosti.', true, 'liquidpro', 'intermediate', 4.3, 21, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"citrus","percent":6},{"type":"bakery","percent":10}],"steepingDays":14}', NOW());

-- 13b. Lemon Tart (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Tart (0mg)', 'Citronovy kolac s kremem. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.2, 17, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"citrus","percent":6},{"type":"bakery","percent":10}],"steepingDays":14}', NOW());

-- 14. Hazelnut Coffee (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Coffee', 'Liskooriskova kava pro ranni ritualy. Aromaticka a energizujici.', true, 'liquidpro', 'intermediate', 4.2, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"drink","percent":10},{"type":"nuts","percent":6}],"steepingDays":14}', NOW());

-- 14b. Hazelnut Coffee (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Hazelnut Coffee (0mg)', 'Liskooriskova kava pro ranni ritualy. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.1, 15, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"drink","percent":10},{"type":"nuts","percent":6}],"steepingDays":14}', NOW());

-- 15. Orange Cream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Cream', 'Pomerancovy kremy jako legendárni nanuk. Nostalgicka chut leta.', true, 'liquidpro', 'intermediate', 4.4, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"citrus","percent":8},{"type":"biscuit","percent":8}],"steepingDays":14}', NOW());

-- 15b. Orange Cream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Cream (0mg)', 'Pomerancovy kremy jako legendárni nanuk. Verze bez nikotinu.', true, 'liquidpro', 'intermediate', 4.3, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"citrus","percent":8},{"type":"biscuit","percent":8}],"steepingDays":14}', NOW());

-- === EXPERT (3 flavors) - 10 recipes x 2 nic variants = 20 ===

-- 16. Strawberry Kiwi Menthol (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol', 'Ledovy mix jahody a kiwi. Komplexni a vyvazeny profil pro narocne.', true, 'liquidpro', 'expert', 4.6, 29, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"tropical","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- 16b. Strawberry Kiwi Menthol (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Menthol (0mg)', 'Ledovy mix jahody a kiwi. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.5, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"tropical","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- 17. Tropical Paradise (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise', 'Mango, ananas a kokos. Exoticky raj v lahvicce.', true, 'liquidpro', 'expert', 4.7, 35, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","percent":10},{"type":"tropical","percent":6},{"type":"nuts","percent":4}],"steepingDays":14}', NOW());

-- 17b. Tropical Paradise (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise (0mg)', 'Mango, ananas a kokos. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.6, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","percent":10},{"type":"tropical","percent":6},{"type":"nuts","percent":4}],"steepingDays":14}', NOW());

-- 18. Berry Fusion (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion', 'Mix boruvek, malin a jahod. Lesni symfonie chuti.', true, 'liquidpro', 'expert', 4.5, 26, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"berry","percent":6},{"type":"fruit","percent":5}],"steepingDays":10}', NOW());

-- 18b. Berry Fusion (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Fusion (0mg)', 'Mix boruvek, malin a jahod. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 21, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"berry","percent":6},{"type":"fruit","percent":5}],"steepingDays":10}', NOW());

-- 19. Vanilla Tobacco RY4 (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4', 'Legendarni RY4 s vanilkou a karamelem. Mistrovske dilo pro znalce.', true, 'liquidpro', 'expert', 4.8, 42, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tobacco","percent":8},{"type":"biscuit","percent":6},{"type":"candy","percent":4}],"steepingDays":28}', NOW());

-- 19b. Vanilla Tobacco RY4 (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Tobacco RY4 (0mg)', 'Legendarni RY4 s vanilkou a karamelem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.7, 35, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tobacco","percent":8},{"type":"biscuit","percent":6},{"type":"candy","percent":4}],"steepingDays":28}', NOW());

-- 20. Blueberry Vanilla Cake (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Vanilla Cake', 'Boruvkovy dort s vanilkovym kremem. Cukrarsky skvost.', true, 'liquidpro', 'expert', 4.5, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"biscuit","percent":8},{"type":"bakery","percent":5}],"steepingDays":21}', NOW());

-- 20b. Blueberry Vanilla Cake (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Vanilla Cake (0mg)', 'Boruvkovy dort s vanilkovym kremem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 22, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","percent":8},{"type":"biscuit","percent":8},{"type":"bakery","percent":5}],"steepingDays":21}', NOW());

-- 21. Citrus Storm (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm', 'Pomeranc, citron a grapefruit. Citrusova exploze energie.', true, 'liquidpro', 'expert', 4.2, 18, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"citrus","percent":6},{"type":"citrus","percent":5},{"type":"citrus","percent":4}],"steepingDays":7}', NOW());

-- 21b. Citrus Storm (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Storm (0mg)', 'Pomeranc, citron a grapefruit. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.1, 15, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":60,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"citrus","percent":6},{"type":"citrus","percent":5},{"type":"citrus","percent":4}],"steepingDays":7}', NOW());

-- 22. Mint Chocolate Cookie (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mint Chocolate Cookie', 'Matova susenka s tmavou cokoladou. After Eight v lahvicce.', true, 'liquidpro', 'expert', 4.4, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"menthol","percent":4},{"type":"bakery","percent":10},{"type":"dessert","percent":6}],"steepingDays":21}', NOW());

-- 22b. Mint Chocolate Cookie (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mint Chocolate Cookie (0mg)', 'Matova susenka s tmavou cokoladou. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.3, 19, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"menthol","percent":4},{"type":"bakery","percent":10},{"type":"dessert","percent":6}],"steepingDays":21}', NOW());

-- 23. Peach Raspberry Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Raspberry Ice', 'Ledova broskev s malinami. Osvezujici letni koktejl.', true, 'liquidpro', 'expert', 4.6, 31, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"peach","percent":8},{"type":"berry","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- 23b. Peach Raspberry Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Raspberry Ice (0mg)', 'Ledova broskev s malinami. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.5, 26, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"peach","percent":8},{"type":"berry","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- 24. Caramel Apple Pie (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Apple Pie', 'Jablkovy kolac s karamelem. Babicina kuchyne v modernim podani.', true, 'liquidpro', 'expert', 4.5, 28, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"candy","percent":6},{"type":"bakery","percent":8}],"steepingDays":21}', NOW());

-- 24b. Caramel Apple Pie (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Apple Pie (0mg)', 'Jablkovy kolac s karamelem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.4, 23, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"fruit","percent":8},{"type":"candy","percent":6},{"type":"bakery","percent":8}],"steepingDays":21}', NOW());

-- 25. Mango Dragonfruit Ice (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Dragonfruit Ice', 'Exoticke mango s draci ovocem a ledem. Unikatni kombinace z Asie.', true, 'liquidpro', 'expert', 4.4, 25, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","percent":10},{"type":"tropical","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- 25b. Mango Dragonfruit Ice (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Dragonfruit Ice (0mg)', 'Exoticke mango s draci ovocem a ledem. Verze bez nikotinu.', true, 'liquidpro', 'expert', 4.3, 20, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","percent":10},{"type":"tropical","percent":6},{"type":"menthol","percent":2}],"steepingDays":10}', NOW());

-- === VIRTUOSO (4 flavors) - 5 recipes x 2 nic variants = 10 ===

-- 26. Ultimate Fruit Blast (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Blast', 'Mango, jahoda, broskev a mentol. Mistrovska kompozice pro znalce.', true, 'liquidpro', 'virtuoso', 4.8, 38, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","percent":6},{"type":"fruit","percent":5},{"type":"peach","percent":5},{"type":"menthol","percent":2}],"steepingDays":14}', NOW());

-- 26b. Ultimate Fruit Blast (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Fruit Blast (0mg)', 'Mango, jahoda, broskev a mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.7, 32, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","percent":6},{"type":"fruit","percent":5},{"type":"peach","percent":5},{"type":"menthol","percent":2}],"steepingDays":14}', NOW());

-- 27. Grandma Secret Custard (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grandma Secret Custard', 'Vanilka, custard, susicka a karamel. Rodinny recept na generace.', true, 'liquidpro', 'virtuoso', 4.9, 52, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"biscuit","percent":6},{"type":"dessert","percent":6},{"type":"bakery","percent":5},{"type":"candy","percent":4}],"steepingDays":35}', NOW());

-- 27b. Grandma Secret Custard (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grandma Secret Custard (0mg)', 'Vanilka, custard, susicka a karamel. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.8, 45, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":80,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"biscuit","percent":6},{"type":"dessert","percent":6},{"type":"bakery","percent":5},{"type":"candy","percent":4}],"steepingDays":35}', NOW());

-- 28. Tobacco Gentleman (6mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Gentleman', 'Tabak, dub, vanilka a med. Pro skutecne znalce tabaku.', true, 'liquidpro', 'virtuoso', 4.6, 33, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":6,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tobacco","percent":8},{"type":"tobaccosweet","percent":5},{"type":"biscuit","percent":4},{"type":"candy","percent":3}],"steepingDays":42}', NOW());

-- 28b. Tobacco Gentleman (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Gentleman (0mg)', 'Tabak, dub, vanilka a med. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.5, 27, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":50,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tobacco","percent":8},{"type":"tobaccosweet","percent":5},{"type":"biscuit","percent":4},{"type":"candy","percent":3}],"steepingDays":42}', NOW());

-- 29. Berry Yogurt Dream (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream', 'Boruvky, maliny, jogurt a granola. Zdrava snidane pro vapery.', true, 'liquidpro', 'virtuoso', 4.5, 29, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"berry","percent":6},{"type":"berry","percent":5},{"type":"dessert","percent":5},{"type":"bakery","percent":4}],"steepingDays":21}', NOW());

-- 29b. Berry Yogurt Dream (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Yogurt Dream (0mg)', 'Boruvky, maliny, jogurt a granola. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.4, 24, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"berry","percent":6},{"type":"berry","percent":5},{"type":"dessert","percent":5},{"type":"bakery","percent":4}],"steepingDays":21}', NOW());

-- 30. Tropical Ice Cocktail (3mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail', 'Mango, ananas, marakuja a ledovy mentol. Exoticky koktejl u plaze.', true, 'liquidpro', 'virtuoso', 4.7, 36, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":3,"nicBase":20,"nicRatio":50,"flavors":[{"type":"tropical","percent":7},{"type":"tropical","percent":5},{"type":"tropical","percent":4},{"type":"menthol","percent":3}],"steepingDays":14}', NOW());

-- 30b. Tropical Ice Cocktail (0mg)
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Ice Cocktail (0mg)', 'Mango, ananas, marakuja a ledovy mentol. Verze bez nikotinu.', true, 'liquidpro', 'virtuoso', 4.6, 30, 
'{"formType":"liquidpro","totalAmount":30,"vgRatio":70,"nicStrength":0,"nicBase":0,"nicRatio":50,"flavors":[{"type":"tropical","percent":7},{"type":"tropical","percent":5},{"type":"tropical","percent":4},{"type":"menthol","percent":3}],"steepingDays":14}', NOW());

-- ============================================
-- END OF PART 2: LIQUID PRO RECIPES (60 total)
-- ============================================

-- ============================================
-- PART 3: SHISHA RECIPES (90 total)
-- form_type: shisha
-- Various difficulty levels with different sweeteners
-- ============================================

-- === BEGINNER (1 flavor) - 22 recipes ===

-- 1. Double Apple Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Double Apple Classic', 'Klasicky dvojity jablkovy tabak. Nejpopularnejsi prichut na svete.', true, 'shisha', 'beginner', 4.8, 156, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"apple","percent":15}],"notes":"Tradiční arabská příchuť"}', NOW());

-- 2. Mint Sensation
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mint Sensation', 'Svezi mata pro osvezujici zazitek. Idealni pro horke dny.', true, 'shisha', 'beginner', 4.6, 98, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":12,"flavors":[{"type":"mint","percent":12}],"notes":"Čistý mentolový zážitek"}', NOW());

-- 3. Grape Royale
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Royale', 'Sladke hrozny s bohatou chuti. Kralovska prichut pro kazdy vecer.', true, 'shisha', 'beginner', 4.5, 87, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"grape","percent":14}],"notes":"Sladké a ovocné"}', NOW());

-- 4. Watermelon Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Fresh', 'Stavnaty meloun pro letni vecerita. Osvezujici a sladky.', true, 'shisha', 'beginner', 4.7, 112, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"watermelon","percent":15}],"notes":"Letní klasika"}', NOW());

-- 5. Blueberry Dream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Dream', 'Sladke boruvky z lesniho podrostu. Aromaticky a lahodny.', true, 'shisha', 'beginner', 4.4, 76, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"blueberry","percent":13}],"notes":"Sladké lesní ovoce"}', NOW());

-- 6. Peach Paradise
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Paradise', 'Zlata broskev z Persie. Tradiční prichut pro hookah.', true, 'shisha', 'beginner', 4.5, 82, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"peach","percent":14}],"notes":"Aromatická broskev"}', NOW());

-- 7. Lemon Fresh
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Fresh', 'Kyselkave citronove osvezeni. Cistici podkladu pro mix.', true, 'shisha', 'beginner', 4.2, 65, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":14,"flavors":[{"type":"lemon","percent":10}],"notes":"Čisté citrusové"}', NOW());

-- 8. Orange Sunset
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Sunset', 'Sladky pomeranc z egyptskych sadu. Tepla a prijemna chut.', true, 'shisha', 'beginner', 4.3, 71, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":12,"flavors":[{"type":"orange","percent":13}],"notes":"Egyptský pomeranč"}', NOW());

-- 9. Strawberry Sweet
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Sweet', 'Sladke jahody jako z plantaze. Univerzalni a oblibena.', true, 'shisha', 'beginner', 4.6, 94, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"strawberry","percent":14}],"notes":"Sladké jahody"}', NOW());

-- 10. Mango Tropical
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Tropical', 'Exoticke mango z tropickych ostrovu. Intenzivni a sladke.', true, 'shisha', 'beginner', 4.7, 108, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"mango","percent":15}],"notes":"Tropické mango"}', NOW());

-- 11. Cherry Classic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Classic', 'Klasicka visen s bohatou chuti. Tradicni turecka prichut.', true, 'shisha', 'beginner', 4.4, 79, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"cherry","percent":13}],"notes":"Turecká klasika"}', NOW());

-- 12. Pineapple Breeze
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Breeze', 'Stavnaty ananas z Karibiku. Exotika v kazdem nadechu.', true, 'shisha', 'beginner', 4.3, 68, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"pineapple","percent":14}],"notes":"Karibský ananas"}', NOW());

-- 13. Raspberry Pure
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Pure', 'Cista malinova chut. Kyselkava a osvezujici.', true, 'shisha', 'beginner', 4.2, 59, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":14,"flavors":[{"type":"raspberry","percent":12}],"notes":"Čisté maliny"}', NOW());

-- 14. Coconut Island
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Island', 'Kremovy kokos z tropickeho raje. Sladky a exoticky.', true, 'shisha', 'beginner', 4.1, 53, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"coconut","percent":13}],"notes":"Tropický kokos"}', NOW());

-- 15. Vanilla Cloud
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Cloud', 'Kremova vanilka pro jemny zazitek. Sladka a hebka.', true, 'shisha', 'beginner', 4.0, 48, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"vanilla","percent":10}],"notes":"Jemná vanilka"}', NOW());

-- 16. Rose Garden
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Rose Garden', 'Vonavá ruze z damaskych zahrad. Elegantni arabska klasika.', true, 'shisha', 'beginner', 4.3, 67, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"rose","percent":8}],"notes":"Damašská růže"}', NOW());

-- 17. Passion Fruit
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Fruit', 'Exoticka marakuja plna energie. Intenzivni a tropicka.', true, 'shisha', 'beginner', 4.4, 74, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"passionfruit","percent":14}],"notes":"Tropická marakuja"}', NOW());

-- 18. Kiwi Green
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Green', 'Zelene kiwi z Noveho Zelandu. Svezi a kyselkave.', true, 'shisha', 'beginner', 4.2, 61, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":13,"flavors":[{"type":"kiwi","percent":12}],"notes":"Svěží kiwi"}', NOW());

-- 19. Grapefruit Citrus
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Citrus', 'Horky grapefruit pro osvezeni. Lehce horka citrusova chut.', true, 'shisha', 'beginner', 4.0, 45, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":15,"flavors":[{"type":"grapefruit","percent":10}],"notes":"Hořký grapefruit"}', NOW());

-- 20. Banana Smooth
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Smooth', 'Kremovy banan jako smoothie. Sladky a sametovy.', true, 'shisha', 'beginner', 4.1, 52, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"banana","percent":12}],"notes":"Krémový banán"}', NOW());

-- 21. Guava Exotic
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Exotic', 'Exoticka guava z Brazilie. Tropicky a sladky.', true, 'shisha', 'beginner', 4.3, 63, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"guava","percent":14}],"notes":"Brazilská guava"}', NOW());

-- 22. Jasmine Flower
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Jasmine Flower', 'Vonavy jasmin pro relaxaci. Elegantni kvetinova chut.', true, 'shisha', 'beginner', 4.1, 49, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"jasmine","percent":8}],"notes":"Elegantní jasmín"}', NOW());

-- === INTERMEDIATE (2 flavors) - 34 recipes ===

-- 23. Double Apple Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Double Apple Mint', 'Legendarni kombinace dvou jablek s matou. Nejpopularnejsi mix.', true, 'shisha', 'intermediate', 4.9, 234, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"apple","percent":12},{"type":"mint","percent":6}],"notes":"Nejpopulárnější mix na světě"}', NOW());

-- 24. Grape Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Mint', 'Sladke hrozny s chladivou matou. Osvezujici klasika.', true, 'shisha', 'intermediate', 4.7, 145, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"grape","percent":12},{"type":"mint","percent":5}],"notes":"Sladké a osvěžující"}', NOW());

-- 25. Watermelon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Mint', 'Ledovy meloun s matou. Dokonale letni osvezeni.', true, 'shisha', 'intermediate', 4.8, 167, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"watermelon","percent":12},{"type":"mint","percent":5}],"notes":"Letní osvěžení"}', NOW());

-- 26. Peach Lemon
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Lemon', 'Sladka broskev s citronem. Vyvazena ovocna kombinace.', true, 'shisha', 'intermediate', 4.5, 98, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":12,"flavors":[{"type":"peach","percent":11},{"type":"lemon","percent":6}],"notes":"Ovocná harmonie"}', NOW());

-- 27. Blueberry Grape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Grape', 'Boruvky a hrozny. Intenzivni ovocny mix.', true, 'shisha', 'intermediate', 4.4, 87, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"blueberry","percent":10},{"type":"grape","percent":8}],"notes":"Intenzivní ovoce"}', NOW());

-- 28. Mango Passion
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Passion', 'Tropicke mango s marakujou. Exoticky raj.', true, 'shisha', 'intermediate', 4.6, 112, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"mango","percent":10},{"type":"passionfruit","percent":8}],"notes":"Tropický ráj"}', NOW());

-- 29. Strawberry Vanilla
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Vanilla', 'Jahody s kremovou vanilkou. Dezertni sladkost.', true, 'shisha', 'intermediate', 4.5, 94, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"strawberry","percent":10},{"type":"vanilla","percent":6}],"notes":"Dezertní kombinace"}', NOW());

-- 30. Orange Cream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Cream Shisha', 'Pomerancovy krem jako nanuk. Nostalgicka chut.', true, 'shisha', 'intermediate', 4.4, 81, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"orange","percent":10},{"type":"vanilla","percent":6}],"notes":"Nostalgický nanuk"}', NOW());

-- 31. Cherry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Mint', 'Ledova visen s matou. Intenzivni a svezi.', true, 'shisha', 'intermediate', 4.5, 89, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"cherry","percent":11},{"type":"mint","percent":5}],"notes":"Intenzivní svěžest"}', NOW());

-- 32. Pineapple Coconut
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pina Colada Shisha', 'Ananas s kokosem jako pina colada. Plazovy zazitek.', true, 'shisha', 'intermediate', 4.6, 103, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"pineapple","percent":10},{"type":"coconut","percent":8}],"notes":"Plážový koktejl"}', NOW());

-- 33. Rose Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Rose Mint', 'Elegantni ruze s matou. Arabska klasika.', true, 'shisha', 'intermediate', 4.3, 72, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"rose","percent":8},{"type":"mint","percent":5}],"notes":"Arabská elegance"}', NOW());

-- 34. Lemon Grape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Grape', 'Citron s hrozny. Vyvazena kyselost a sladkost.', true, 'shisha', 'intermediate', 4.4, 78, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":12,"flavors":[{"type":"lemon","percent":7},{"type":"grape","percent":10}],"notes":"Kyselosladká harmonie"}', NOW());

-- 35. Raspberry Lemon
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Lemon', 'Maliny s citronem. Osvezujici a kyselkave.', true, 'shisha', 'intermediate', 4.3, 68, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":13,"flavors":[{"type":"raspberry","percent":10},{"type":"lemon","percent":6}],"notes":"Kyselkavá kombinace"}', NOW());

-- 36. Kiwi Strawberry
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Strawberry', 'Kiwi s jahodami. Svezi letni ovoce.', true, 'shisha', 'intermediate', 4.5, 86, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"kiwi","percent":9},{"type":"strawberry","percent":9}],"notes":"Letní svěžest"}', NOW());

-- 37. Banana Strawberry
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Strawberry', 'Banan s jahodami jako smoothie. Kremovy a sladky.', true, 'shisha', 'intermediate', 4.4, 79, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"banana","percent":9},{"type":"strawberry","percent":9}],"notes":"Ovocné smoothie"}', NOW());

-- 38. Guava Mango
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Mango', 'Guava s mangem. Tropicka exploze chuti.', true, 'shisha', 'intermediate', 4.5, 91, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"guava","percent":9},{"type":"mango","percent":9}],"notes":"Tropická exploze"}', NOW());

-- 39. Apple Grape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Grape', 'Jablko s hrozny. Sladka kombinace ovoce.', true, 'shisha', 'intermediate', 4.3, 73, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"apple","percent":10},{"type":"grape","percent":8}],"notes":"Sladké ovoce"}', NOW());

-- 40. Peach Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Mint', 'Broskev s chladivou matou. Osvezujici a sladka.', true, 'shisha', 'intermediate', 4.6, 97, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"peach","percent":11},{"type":"mint","percent":5}],"notes":"Osvěžující broskev"}', NOW());

-- 41. Mango Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Mint', 'Tropicke mango s ledovou matou. Exoticky led.', true, 'shisha', 'intermediate', 4.7, 118, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"mango","percent":12},{"type":"mint","percent":5}],"notes":"Exotický led"}', NOW());

-- 42. Blueberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Mint', 'Boruvky s matou. Lesni svezest.', true, 'shisha', 'intermediate', 4.4, 82, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"blueberry","percent":11},{"type":"mint","percent":5}],"notes":"Lesní svěžest"}', NOW());

-- 43. Strawberry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Mint', 'Jahody s chladivou matou. Populární letní mix.', true, 'shisha', 'intermediate', 4.6, 105, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"strawberry","percent":11},{"type":"mint","percent":5}],"notes":"Letní klasika"}', NOW());

-- 44. Passion Mango
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Mango', 'Marakuja s mangem. Tropicky dvojboj.', true, 'shisha', 'intermediate', 4.5, 89, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"passionfruit","percent":9},{"type":"mango","percent":9}],"notes":"Tropický dvojboj"}', NOW());

-- 45. Cherry Grape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Grape', 'Visen s hrozny. Intenzivni tmave ovoce.', true, 'shisha', 'intermediate', 4.3, 71, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"cherry","percent":10},{"type":"grape","percent":8}],"notes":"Tmavé ovoce"}', NOW());

-- 46. Jasmine Rose
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Jasmine Rose', 'Jasmin s ruzi. Kvetinova elegance.', true, 'shisha', 'intermediate', 4.2, 58, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"jasmine","percent":7},{"type":"rose","percent":7}],"notes":"Květinová elegance"}', NOW());

-- 47. Lemon Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Mint', 'Citron s matou. Osvezujici citrusova chladivost.', true, 'shisha', 'intermediate', 4.6, 98, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"lemon","percent":8},{"type":"mint","percent":6}],"notes":"Citrusová svěžest"}', NOW());

-- 48. Orange Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Mint', 'Pomeranc s matou. Svezi citrusovy led.', true, 'shisha', 'intermediate', 4.4, 84, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"orange","percent":10},{"type":"mint","percent":5}],"notes":"Citrusový led"}', NOW());

-- 49. Apple Rose
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Rose', 'Jablko s ruzi. Elegantni arabska kombinace.', true, 'shisha', 'intermediate', 4.3, 69, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"apple","percent":11},{"type":"rose","percent":5}],"notes":"Arabská klasika"}', NOW());

-- 50. Grapefruit Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Mint', 'Grapefruit s matou. Svezi a lehce horka.', true, 'shisha', 'intermediate', 4.2, 54, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":13,"flavors":[{"type":"grapefruit","percent":9},{"type":"mint","percent":5}],"notes":"Hořká svěžest"}', NOW());

-- 51. Coconut Vanilla
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coconut Vanilla', 'Kokos s vanilkou. Kremova tropicka sladkost.', true, 'shisha', 'intermediate', 4.3, 67, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"coconut","percent":9},{"type":"vanilla","percent":6}],"notes":"Krémová tropika"}', NOW());

-- 52. Watermelon Grape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Grape', 'Meloun s hrozny. Sladka letni kombinace.', true, 'shisha', 'intermediate', 4.5, 87, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"watermelon","percent":10},{"type":"grape","percent":8}],"notes":"Letní sladkost"}', NOW());

-- 53. Pineapple Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Mint', 'Ananas s matou. Tropicke osvezeni.', true, 'shisha', 'intermediate', 4.4, 78, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"pineapple","percent":11},{"type":"mint","percent":5}],"notes":"Tropické osvěžení"}', NOW());

-- 54. Vanilla Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Mint', 'Vanilka s matou. Jemna a chladiva.', true, 'shisha', 'intermediate', 4.1, 52, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"vanilla","percent":8},{"type":"mint","percent":5}],"notes":"Jemná chladivost"}', NOW());

-- 55. Apple Cinnamon Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon Shisha', 'Jablko se skorici. Podzimni pohoda.', true, 'shisha', 'intermediate', 4.3, 65, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"apple","percent":11},{"type":"cinnamon","percent":4}],"notes":"Podzimní útulnost"}', NOW());

-- 56. Melon Honey
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Melon Honey', 'Cukrovy meloun s medem. Extra sladka kombinace.', true, 'shisha', 'intermediate', 4.4, 76, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":14,"flavors":[{"type":"melon","percent":12},{"type":"honey","percent":5}],"notes":"Extra sladká"}', NOW());

-- === EXPERT (3 flavors) - 22 recipes ===

-- 57. Triple Apple Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Triple Apple Mint', 'Tri druhy jablek s matou. Pokrocila verze klasiky.', true, 'shisha', 'expert', 4.8, 145, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"apple","percent":8},{"type":"greenapple","percent":6},{"type":"mint","percent":5}],"notes":"Pokročilá klasika"}', NOW());

-- 58. Tropical Fusion
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Fusion', 'Mango, ananas a kokos. Tropicky raj.', true, 'shisha', 'expert', 4.7, 128, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"mango","percent":8},{"type":"pineapple","percent":6},{"type":"coconut","percent":5}],"notes":"Tropický ráj"}', NOW());

-- 59. Berry Mix
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Mix', 'Boruvky, maliny a jahody. Lesni ovoce.', true, 'shisha', 'expert', 4.6, 112, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"blueberry","percent":7},{"type":"raspberry","percent":6},{"type":"strawberry","percent":6}],"notes":"Lesní směs"}', NOW());

-- 60. Citrus Ice
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Ice', 'Citron, pomeranc a mata. Ledova citrusova bombe.', true, 'shisha', 'expert', 4.5, 98, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":13,"flavors":[{"type":"lemon","percent":6},{"type":"orange","percent":6},{"type":"mint","percent":5}],"notes":"Citrusová bomba"}', NOW());

-- 61. Grape Rose Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Rose Mint', 'Hrozny s ruzi a matou. Elegantni arabsky mix.', true, 'shisha', 'expert', 4.6, 105, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"grape","percent":9},{"type":"rose","percent":5},{"type":"mint","percent":4}],"notes":"Arabská elegance"}', NOW());

-- 62. Watermelon Berry
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Berry', 'Meloun, jahody a boruvky. Letni ovocna smes.', true, 'shisha', 'expert', 4.5, 93, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"watermelon","percent":8},{"type":"strawberry","percent":5},{"type":"blueberry","percent":5}],"notes":"Letní směs"}', NOW());

-- 63. Passion Berry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Passion Berry Mint', 'Marakuja, maliny a mata. Exoticky led.', true, 'shisha', 'expert', 4.6, 101, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"passionfruit","percent":8},{"type":"raspberry","percent":6},{"type":"mint","percent":4}],"notes":"Exotický led"}', NOW());

-- 64. Mango Peach Cream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Peach Cream', 'Mango, broskev a vanilka. Kremovy tropical.', true, 'shisha', 'expert', 4.5, 89, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"mango","percent":8},{"type":"peach","percent":6},{"type":"vanilla","percent":4}],"notes":"Krémový tropical"}', NOW());

-- 65. Apple Grape Rose
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Grape Rose', 'Jablko, hrozny a ruze. Klasicky arabsky trio.', true, 'shisha', 'expert', 4.4, 82, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"apple","percent":8},{"type":"grape","percent":7},{"type":"rose","percent":4}],"notes":"Arabské trio"}', NOW());

-- 66. Cherry Vanilla Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Vanilla Mint', 'Visen, vanilka a mata. Dezertni osvezeni.', true, 'shisha', 'expert', 4.4, 78, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"cherry","percent":8},{"type":"vanilla","percent":5},{"type":"mint","percent":4}],"notes":"Dezertní svěžest"}', NOW());

-- 67. Pineapple Mango Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Mango Mint', 'Ananas, mango a mata. Tropicky led.', true, 'shisha', 'expert', 4.6, 108, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"pineapple","percent":8},{"type":"mango","percent":7},{"type":"mint","percent":4}],"notes":"Tropický led"}', NOW());

-- 68. Strawberry Kiwi Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Kiwi Mint', 'Jahody, kiwi a mata. Svezi letni mix.', true, 'shisha', 'expert', 4.5, 94, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"strawberry","percent":8},{"type":"kiwi","percent":6},{"type":"mint","percent":4}],"notes":"Letní svěžest"}', NOW());

-- 69. Banana Coconut Vanilla
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Banana Coconut Vanilla', 'Banan, kokos a vanilka. Kremovy tropicky dezert.', true, 'shisha', 'expert', 4.3, 72, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"banana","percent":7},{"type":"coconut","percent":6},{"type":"vanilla","percent":5}],"notes":"Krémový dezert"}', NOW());

-- 70. Guava Passion Mango
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Guava Passion Mango', 'Guava, marakuja a mango. Tropicka exploze.', true, 'shisha', 'expert', 4.6, 103, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"guava","percent":7},{"type":"passionfruit","percent":6},{"type":"mango","percent":6}],"notes":"Tropická exploze"}', NOW());

-- 71. Lemon Rose Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Rose Mint', 'Citron, ruze a mata. Elegantni osvezeni.', true, 'shisha', 'expert', 4.3, 68, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":12,"flavors":[{"type":"lemon","percent":6},{"type":"rose","percent":5},{"type":"mint","percent":5}],"notes":"Elegantní svěžest"}', NOW());

-- 72. Peach Berry Cream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Berry Cream', 'Broskev, boruvky a krem. Dezertni ovoce.', true, 'shisha', 'expert', 4.4, 79, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"peach","percent":7},{"type":"blueberry","percent":6},{"type":"vanilla","percent":5}],"notes":"Dezertní směs"}', NOW());

-- 73. Orange Grape Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Grape Mint', 'Pomeranc, hrozny a mata. Citrusova sladkost.', true, 'shisha', 'expert', 4.4, 81, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"orange","percent":7},{"type":"grape","percent":6},{"type":"mint","percent":4}],"notes":"Citrusová sladkost"}', NOW());

-- 74. Apple Cinnamon Vanilla
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Cinnamon Vanilla', 'Jablko, skorice a vanilka. Podzimni dezert.', true, 'shisha', 'expert', 4.5, 86, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"apple","percent":8},{"type":"cinnamon","percent":3},{"type":"vanilla","percent":5}],"notes":"Podzimní dezert"}', NOW());

-- 75. Melon Berry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Melon Berry Mint', 'Meloun, jahody a mata. Letni svezest.', true, 'shisha', 'expert', 4.5, 91, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"melon","percent":7},{"type":"strawberry","percent":6},{"type":"mint","percent":4}],"notes":"Letní svěžest"}', NOW());

-- 76. Jasmine Grape Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Jasmine Grape Mint', 'Jasmin, hrozny a mata. Aromaticka kombinace.', true, 'shisha', 'expert', 4.2, 59, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"jasmine","percent":5},{"type":"grape","percent":8},{"type":"mint","percent":4}],"notes":"Aromatická směs"}', NOW());

-- 77. Kiwi Mango Passion
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Kiwi Mango Passion', 'Kiwi, mango a marakuja. Exoticke trio.', true, 'shisha', 'expert', 4.5, 88, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"kiwi","percent":6},{"type":"mango","percent":7},{"type":"passionfruit","percent":6}],"notes":"Exotické trio"}', NOW());

-- 78. Grapefruit Berry Mint
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grapefruit Berry Mint', 'Grapefruit, maliny a mata. Horko-sladka svezest.', true, 'shisha', 'expert', 4.3, 71, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":13,"flavors":[{"type":"grapefruit","percent":6},{"type":"raspberry","percent":7},{"type":"mint","percent":4}],"notes":"Hořko-sladká"}', NOW());

-- === VIRTUOSO (4 flavors) - 12 recipes ===

-- 79. Ultimate Arabian
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Ultimate Arabian', 'Jablko, hrozny, ruze a mata. Ultimatni arabska smes.', true, 'shisha', 'virtuoso', 4.9, 178, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"apple","percent":6},{"type":"grape","percent":5},{"type":"rose","percent":4},{"type":"mint","percent":4}],"notes":"Ultimátní arabská směs"}', NOW());

-- 80. Tropical Paradise Shisha
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tropical Paradise Shisha', 'Mango, ananas, kokos a marakuja. Tropicky raj.', true, 'shisha', 'virtuoso', 4.8, 156, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"mango","percent":5},{"type":"pineapple","percent":5},{"type":"coconut","percent":4},{"type":"passionfruit","percent":4}],"notes":"Tropický ráj"}', NOW());

-- 81. Berry Supreme
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Berry Supreme', 'Jahody, boruvky, maliny a mata. Kralovsky lesni mix.', true, 'shisha', 'virtuoso', 4.7, 134, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"strawberry","percent":5},{"type":"blueberry","percent":5},{"type":"raspberry","percent":4},{"type":"mint","percent":4}],"notes":"Královský lesní mix"}', NOW());

-- 82. Citrus Garden
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Citrus Garden', 'Citron, pomeranc, grapefruit a mata. Citrusova zahrada.', true, 'shisha', 'virtuoso', 4.5, 98, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":14,"flavors":[{"type":"lemon","percent":5},{"type":"orange","percent":5},{"type":"grapefruit","percent":4},{"type":"mint","percent":4}],"notes":"Citrusová zahrada"}', NOW());

-- 83. Exotic Fusion
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Exotic Fusion', 'Guava, mango, marakuja a kiwi. Exoticka fuze.', true, 'shisha', 'virtuoso', 4.6, 112, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"guava","percent":5},{"type":"mango","percent":5},{"type":"passionfruit","percent":4},{"type":"kiwi","percent":4}],"notes":"Exotická fúze"}', NOW());

-- 84. Dessert Dream
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Dessert Dream', 'Vanilka, kokos, banan a karamel. Dezertni sen.', true, 'shisha', 'virtuoso', 4.4, 89, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":12,"flavors":[{"type":"vanilla","percent":5},{"type":"coconut","percent":4},{"type":"banana","percent":4},{"type":"caramel","percent":4}],"notes":"Dezertní sen"}', NOW());

-- 85. Summer Breeze
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Summer Breeze', 'Meloun, jahody, broskev a mata. Letni vanek.', true, 'shisha', 'virtuoso', 4.7, 128, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"watermelon","percent":5},{"type":"strawberry","percent":5},{"type":"peach","percent":4},{"type":"mint","percent":4}],"notes":"Letní vánek"}', NOW());

-- 86. Floral Elegance
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Floral Elegance', 'Ruze, jasmin, hrozny a mata. Kvetinova elegance.', true, 'shisha', 'virtuoso', 4.4, 78, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":11,"flavors":[{"type":"rose","percent":5},{"type":"jasmine","percent":4},{"type":"grape","percent":5},{"type":"mint","percent":4}],"notes":"Květinová elegance"}', NOW());

-- 87. Orchard Mix
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orchard Mix', 'Jablko, broskev, hruska a skorice. Sadovy mix.', true, 'shisha', 'virtuoso', 4.5, 94, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":11,"flavors":[{"type":"apple","percent":5},{"type":"peach","percent":5},{"type":"pear","percent":4},{"type":"cinnamon","percent":2}],"notes":"Sadový mix"}', NOW());

-- 88. Island Escape
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Island Escape', 'Kokos, ananas, mango a vanilka. Ostrovni unik.', true, 'shisha', 'virtuoso', 4.6, 106, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"coconut","percent":5},{"type":"pineapple","percent":5},{"type":"mango","percent":4},{"type":"vanilla","percent":3}],"notes":"Ostrovní únik"}', NOW());

-- 89. Persian Nights
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Persian Nights', 'Ruze, jablko, hrozny a kardamom. Perske noci.', true, 'shisha', 'virtuoso', 4.5, 86, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"molasses","sweetenerPercent":10,"flavors":[{"type":"rose","percent":5},{"type":"apple","percent":5},{"type":"grape","percent":4},{"type":"cardamom","percent":2}],"notes":"Perské noci"}', NOW());

-- 90. Master Blend
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Master Blend', 'Jablko, hrozny, mata a ruze. Mistrovska smes.', true, 'shisha', 'virtuoso', 4.8, 145, 
'{"formType":"shisha","totalAmount":200,"vgRatio":30,"glycerinRatio":50,"sweetener":"honey","sweetenerPercent":10,"flavors":[{"type":"apple","percent":5},{"type":"grape","percent":5},{"type":"mint","percent":4},{"type":"rose","percent":4}],"notes":"Mistrovská směs"}', NOW());

-- ============================================
-- END OF PART 3: SHISHA RECIPES (90 total)
-- ============================================

-- ============================================
-- PART 4: SHORTFILL RECIPES (20 total)
-- form_type: shortfill
-- Single flavor, difficulty: beginner
-- ============================================

-- 1. Strawberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Strawberry Shortfill', 'Jahodovy shortfill pro snadne michani. Staci pridat nikotinovy booster.', true, 'shortfill', 'beginner', 4.5, 67, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorPercent":15,"steepingDays":7}', NOW());

-- 2. Mango Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Mango Shortfill', 'Tropicke mango shortfill. Exoticka chut jednodusse.', true, 'shortfill', 'beginner', 4.6, 72, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorPercent":14,"steepingDays":7}', NOW());

-- 3. Watermelon Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Watermelon Shortfill', 'Melounovy shortfill pro letni vaping. Osvezujici a sladky.', true, 'shortfill', 'beginner', 4.4, 58, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"watermelon","flavorPercent":15,"steepingDays":5}', NOW());

-- 4. Vanilla Custard Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Vanilla Custard Shortfill', 'Kremovy vanilkovy custard. Dezertni klasika.', true, 'shortfill', 'beginner', 4.7, 89, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":80,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"biscuit","flavorPercent":12,"steepingDays":21}', NOW());

-- 5. Blueberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Blueberry Shortfill', 'Boruvkovy shortfill. Sladke lesni ovoce.', true, 'shortfill', 'beginner', 4.4, 54, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"berry","flavorPercent":14,"steepingDays":7}', NOW());

-- 6. Menthol Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Menthol Shortfill', 'Cisty mentolovy shortfill. Ledove osvezeni.', true, 'shortfill', 'beginner', 4.3, 48, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"menthol","flavorPercent":8,"steepingDays":3}', NOW());

-- 7. Grape Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Grape Shortfill', 'Hroznovy shortfill. Sladke hrozny.', true, 'shortfill', 'beginner', 4.2, 42, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"grape","flavorPercent":15,"steepingDays":7}', NOW());

-- 8. Peach Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Peach Shortfill', 'Broskvovy shortfill. Aromaticka broskev.', true, 'shortfill', 'beginner', 4.5, 61, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"peach","flavorPercent":14,"steepingDays":7}', NOW());

-- 9. Apple Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Apple Shortfill', 'Jablkovy shortfill. Svezi zelene jablko.', true, 'shortfill', 'beginner', 4.3, 49, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorPercent":13,"steepingDays":5}', NOW());

-- 10. Tobacco Classic Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Tobacco Classic Shortfill', 'Klasicky tabakovy shortfill. Pro milovniky tabaku.', true, 'shortfill', 'beginner', 4.1, 38, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":50,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":6,"flavorType":"tobacco","flavorPercent":10,"steepingDays":14}', NOW());

-- 11. Cherry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cherry Shortfill', 'Visnovy shortfill. Intenzivni visen.', true, 'shortfill', 'beginner', 4.3, 45, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"fruit","flavorPercent":14,"steepingDays":7}', NOW());

-- 12. Raspberry Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Raspberry Shortfill', 'Malinovy shortfill. Kyselkava malina.', true, 'shortfill', 'beginner', 4.2, 41, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"berry","flavorPercent":13,"steepingDays":7}', NOW());

-- 13. Pineapple Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Pineapple Shortfill', 'Ananasovy shortfill. Tropicky ananas.', true, 'shortfill', 'beginner', 4.4, 52, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"tropical","flavorPercent":14,"steepingDays":7}', NOW());

-- 14. Lemon Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Lemon Shortfill', 'Citronovy shortfill. Svezi citron.', true, 'shortfill', 'beginner', 4.1, 36, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"citrus","flavorPercent":10,"steepingDays":5}', NOW());

-- 15. Orange Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Orange Shortfill', 'Pomerancovy shortfill. Sladky pomeranc.', true, 'shortfill', 'beginner', 4.2, 43, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"citrus","flavorPercent":12,"steepingDays":7}', NOW());

-- 16. Cola Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Cola Shortfill', 'Kolovy shortfill. Klasicka cola.', true, 'shortfill', 'beginner', 4.0, 34, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":60,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"drink","flavorPercent":12,"steepingDays":7}', NOW());

-- 17. Coffee Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Coffee Shortfill', 'Kavovy shortfill. Pro milovniky kavy.', true, 'shortfill', 'beginner', 4.2, 47, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":60,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":6,"flavorType":"drink","flavorPercent":10,"steepingDays":14}', NOW());

-- 18. Bubblegum Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Bubblegum Shortfill', 'Zvykackovy shortfill. Nostalgicka zvykacka.', true, 'shortfill', 'beginner', 4.1, 39, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"candy","flavorPercent":12,"steepingDays":5}', NOW());

-- 19. Energy Drink Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Energy Drink Shortfill', 'Energeticky napoj shortfill. Pro aktivni vapery.', true, 'shortfill', 'beginner', 4.0, 35, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":60,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"drink","flavorPercent":11,"steepingDays":7}', NOW());

-- 20. Caramel Shortfill
INSERT INTO recipes (clerk_id, name, description, is_public, form_type, difficulty_level, public_rating_avg, public_rating_count, recipe_data, created_at)
VALUES ('user_38Zd9OOCY8GioiwqHKbeblRpUzJ', 'Caramel Shortfill', 'Karamelovy shortfill. Sladky karamel.', true, 'shortfill', 'beginner', 4.3, 51, 
'{"formType":"shortfill","totalAmount":60,"vgRatio":70,"shortfillVolume":50,"boosterVolume":10,"boosterStrength":20,"targetNic":3,"flavorType":"candy","flavorPercent":10,"steepingDays":14}', NOW());

-- ============================================
-- END OF PART 4: SHORTFILL RECIPES (20 total)
-- ============================================

-- ============================================
-- SUMMARY
-- ============================================
-- Part 1: Liquid (beginner) - 60 recipes
-- Part 2: Liquid PRO - 60 recipes
--   - Intermediate (2 flavors): 30 recipes
--   - Expert (3 flavors): 20 recipes
--   - Virtuoso (4 flavors): 10 recipes
-- Part 3: Shisha - 90 recipes
--   - Beginner (1 flavor): 22 recipes
--   - Intermediate (2 flavors): 34 recipes
--   - Expert (3 flavors): 22 recipes
--   - Virtuoso (4 flavors): 12 recipes
-- Part 4: Shortfill (beginner) - 20 recipes
-- ============================================
-- TOTAL: 230 recipes
-- ============================================

-- Verification query (uncomment to run after import)
-- SELECT form_type, difficulty_level, COUNT(*) as count
-- FROM recipes
-- WHERE clerk_id = 'user_38Zd9OOCY8GioiwqHKbeblRpUzJ'
-- GROUP BY form_type, difficulty_level
-- ORDER BY form_type, difficulty_level;
