-- =====================================================
-- Přidat sloupec VG poměru k příchutím
-- Většina vape aromat je 100% PG (tedy vg_ratio = 0)
-- Shisha příchutě mají různý poměr
-- =====================================================

-- Přidat sloupec vg_ratio (procento VG v koncentrátu)
-- 0 = 100% PG (většina vape aromat)
-- 100 = 100% VG
ALTER TABLE flavors 
ADD COLUMN IF NOT EXISTS vg_ratio INT DEFAULT 0 CHECK (vg_ratio >= 0 AND vg_ratio <= 100);

-- Komentář k sloupci
COMMENT ON COLUMN flavors.vg_ratio IS 'VG percentage in flavor concentrate. 0 = 100% PG (most vape flavors), 100 = 100% VG';

-- Nastavit výchozí hodnoty pro existující příchutě
-- Vape příchutě: většina je 100% PG (vg_ratio = 0)
UPDATE flavors SET vg_ratio = 0 WHERE product_type = 'vape' AND vg_ratio IS NULL;

-- Shisha příchutě: typicky mají vyšší VG obsah (cca 50-70%)
UPDATE flavors SET vg_ratio = 50 WHERE product_type = 'shisha' AND vg_ratio IS NULL;

-- Výpis počtu aktualizovaných
SELECT product_type, vg_ratio, COUNT(*) as count 
FROM flavors 
GROUP BY product_type, vg_ratio 
ORDER BY product_type, vg_ratio;
