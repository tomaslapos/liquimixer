-- =====================================================
-- OPRAVA příchutí Imperia (IMP) — nesprávné min/max/recommended_percent
-- Datum: 15.03.2026
-- 
-- PROBLÉM: Všech 68 příchutí Imperia mělo identické min=2, max=3, rec=2.5
-- SKUTEČNOST: Výrobce (imperia.cz) uvádí doporučené dávkování 5-7%
--             Uživatelé potvrzují 5-7%
--             Komunitní konsenzus shodný
-- ZDROJ: Oficiální blanket statement výrobce + uživatelská zkušenost
-- =====================================================

-- Fruit příchutě — 3-8%, doporučeno 5%
UPDATE flavors SET min_percent = 3.0, max_percent = 8.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'fruit';

-- Tobacco příchutě — 3-7%, doporučeno 5%
UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'tobacco';

-- Cream příchutě — 3-7%, doporučeno 5%
UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'cream';

-- Dessert příchutě — 4-8%, doporučeno 6%
UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 6.0
WHERE manufacturer_code = 'IMP' AND category = 'dessert';

-- Bakery příchutě — 4-8%, doporučeno 6%
UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 6.0
WHERE manufacturer_code = 'IMP' AND category = 'bakery';

-- Candy příchutě — 4-8%, doporučeno 5%
UPDATE flavors SET min_percent = 4.0, max_percent = 8.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'candy';

-- Drink příchutě — 3-7%, doporučeno 5%
UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'drink';

-- Nuts příchutě — 3-7%, doporučeno 5%
UPDATE flavors SET min_percent = 3.0, max_percent = 7.0, recommended_percent = 5.0
WHERE manufacturer_code = 'IMP' AND category = 'nuts';

-- Spice příchutě — 2-5%, doporučeno 3% (koření je silnější)
UPDATE flavors SET min_percent = 2.0, max_percent = 5.0, recommended_percent = 3.0
WHERE manufacturer_code = 'IMP' AND category = 'spice';

-- Menthol příchutě — 1-4%, doporučeno 2% (menthol je výrazně silnější)
UPDATE flavors SET min_percent = 1.0, max_percent = 4.0, recommended_percent = 2.0
WHERE manufacturer_code = 'IMP' AND category = 'menthol';

-- Kontrola — výpis opravených příchutí
SELECT name, category, min_percent, max_percent, recommended_percent
FROM flavors
WHERE manufacturer_code = 'IMP'
ORDER BY category, name;
