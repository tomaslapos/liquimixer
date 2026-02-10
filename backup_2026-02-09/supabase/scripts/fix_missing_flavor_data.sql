-- =====================================================
-- Oprava chybějících dat v příchutích
-- Doplnění recommended_percent a steep_days
-- =====================================================

-- 1. Nastavit recommended_percent tam kde chybí
-- Výpočet: střed mezi min_percent a max_percent
UPDATE flavors
SET recommended_percent = ROUND((min_percent + max_percent) / 2, 1)
WHERE recommended_percent IS NULL 
   OR recommended_percent = 0;

-- 2. Nastavit steep_days podle kategorie kde chybí
-- Výchozí hodnoty podle typu příchutě
UPDATE flavors
SET steep_days = CASE 
    -- Vape příchutě
    WHEN product_type = 'vape' THEN
        CASE category
            WHEN 'tobacco' THEN 21
            WHEN 'tobaccosweet' THEN 28
            WHEN 'dessert' THEN 21
            WHEN 'bakery' THEN 14
            WHEN 'cream' THEN 14
            WHEN 'biscuit' THEN 10
            WHEN 'nuts' THEN 14
            WHEN 'spice' THEN 14
            WHEN 'candy' THEN 10
            WHEN 'tropical' THEN 10
            WHEN 'fruit' THEN 7
            WHEN 'citrus' THEN 7
            WHEN 'berry' THEN 7
            WHEN 'menthol' THEN 3
            WHEN 'mint' THEN 3
            WHEN 'drink' THEN 7
            WHEN 'mix' THEN 14
            ELSE 7
        END
    -- Shisha příchutě (kratší zrání)
    WHEN product_type = 'shisha' THEN
        CASE category
            WHEN 'tobacco' THEN 5
            WHEN 'dessert' THEN 4
            WHEN 'bakery' THEN 4
            WHEN 'cream' THEN 4
            WHEN 'spice' THEN 3
            WHEN 'candy' THEN 2
            WHEN 'tropical' THEN 2
            WHEN 'fruit' THEN 2
            WHEN 'citrus' THEN 2
            WHEN 'berry' THEN 2
            WHEN 'menthol' THEN 1
            WHEN 'mint' THEN 1
            WHEN 'drink' THEN 2
            WHEN 'mix' THEN 3
            ELSE 3
        END
    ELSE 7
END
WHERE steep_days IS NULL 
   OR steep_days = 0;

-- 3. Nastavit min_percent a max_percent podle kategorie kde chybí
UPDATE flavors
SET 
    min_percent = CASE 
        WHEN product_type = 'vape' THEN
            CASE category
                WHEN 'menthol' THEN 0.5
                WHEN 'mint' THEN 0.5
                WHEN 'spice' THEN 1.0
                WHEN 'cream' THEN 2.0
                WHEN 'tobacco' THEN 2.0
                WHEN 'citrus' THEN 2.0
                WHEN 'nuts' THEN 2.0
                WHEN 'fruit' THEN 3.0
                WHEN 'berry' THEN 3.0
                WHEN 'tropical' THEN 3.0
                WHEN 'drink' THEN 3.0
                WHEN 'candy' THEN 4.0
                WHEN 'biscuit' THEN 3.0
                WHEN 'bakery' THEN 4.0
                WHEN 'dessert' THEN 4.0
                WHEN 'mix' THEN 3.0
                ELSE 3.0
            END
        WHEN product_type = 'shisha' THEN
            CASE category
                WHEN 'menthol' THEN 8.0
                WHEN 'mint' THEN 8.0
                WHEN 'cream' THEN 12.0
                WHEN 'fruit' THEN 15.0
                WHEN 'berry' THEN 15.0
                WHEN 'citrus' THEN 12.0
                WHEN 'tropical' THEN 15.0
                WHEN 'candy' THEN 15.0
                WHEN 'dessert' THEN 18.0
                WHEN 'bakery' THEN 18.0
                WHEN 'drink' THEN 12.0
                WHEN 'mix' THEN 15.0
                ELSE 15.0
            END
        ELSE 5.0
    END,
    max_percent = CASE 
        WHEN product_type = 'vape' THEN
            CASE category
                WHEN 'menthol' THEN 3.0
                WHEN 'mint' THEN 3.0
                WHEN 'spice' THEN 4.0
                WHEN 'cream' THEN 6.0
                WHEN 'tobacco' THEN 6.0
                WHEN 'citrus' THEN 5.0
                WHEN 'nuts' THEN 6.0
                WHEN 'fruit' THEN 8.0
                WHEN 'berry' THEN 8.0
                WHEN 'tropical' THEN 8.0
                WHEN 'drink' THEN 7.0
                WHEN 'candy' THEN 10.0
                WHEN 'biscuit' THEN 7.0
                WHEN 'bakery' THEN 10.0
                WHEN 'dessert' THEN 10.0
                WHEN 'mix' THEN 10.0
                ELSE 8.0
            END
        WHEN product_type = 'shisha' THEN
            CASE category
                WHEN 'menthol' THEN 18.0
                WHEN 'mint' THEN 18.0
                WHEN 'cream' THEN 22.0
                WHEN 'fruit' THEN 28.0
                WHEN 'berry' THEN 28.0
                WHEN 'citrus' THEN 22.0
                WHEN 'tropical' THEN 28.0
                WHEN 'candy' THEN 28.0
                WHEN 'dessert' THEN 32.0
                WHEN 'bakery' THEN 32.0
                WHEN 'drink' THEN 22.0
                WHEN 'mix' THEN 28.0
                ELSE 25.0
            END
        ELSE 15.0
    END
WHERE min_percent IS NULL 
   OR min_percent = 0
   OR max_percent IS NULL
   OR max_percent = 0;

-- 4. Přepočítat recommended_percent pro nově opravené záznamy
UPDATE flavors
SET recommended_percent = ROUND((min_percent + max_percent) / 2, 1)
WHERE recommended_percent IS NULL 
   OR recommended_percent = 0;

-- 5. Nastavit vg_ratio kde chybí
UPDATE flavors 
SET vg_ratio = CASE 
    WHEN product_type = 'vape' THEN 0  -- 100% PG
    WHEN product_type = 'shisha' THEN 50  -- 50% VG
    ELSE 0
END
WHERE vg_ratio IS NULL;

-- Výpis opravených záznamů
SELECT 
    name,
    manufacturer_code,
    product_type,
    category,
    min_percent,
    max_percent,
    recommended_percent,
    steep_days,
    vg_ratio
FROM flavors
WHERE status = 'active'
ORDER BY product_type, manufacturer_code, name
LIMIT 20;

-- Kontrola - počet záznamů s chybějícími daty
SELECT 
    'Chybí recommended_percent' as issue,
    COUNT(*) as count
FROM flavors 
WHERE recommended_percent IS NULL OR recommended_percent = 0
UNION ALL
SELECT 
    'Chybí steep_days' as issue,
    COUNT(*) as count
FROM flavors 
WHERE steep_days IS NULL OR steep_days = 0
UNION ALL
SELECT 
    'Chybí min_percent' as issue,
    COUNT(*) as count
FROM flavors 
WHERE min_percent IS NULL OR min_percent = 0
UNION ALL
SELECT 
    'Chybí max_percent' as issue,
    COUNT(*) as count
FROM flavors 
WHERE max_percent IS NULL OR max_percent = 0;
