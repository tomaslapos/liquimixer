-- Migration: Add fulltext search function for flavors
-- Date: 2026-02-10
-- Purpose: Enable efficient search by manufacturer name, flavor name, and product code

-- =====================================================
-- PART 1: Create fulltext search function
-- =====================================================

CREATE OR REPLACE FUNCTION search_flavors_fulltext(
    p_search_term TEXT DEFAULT NULL,
    p_product_type TEXT DEFAULT 'vape',
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    manufacturer_code VARCHAR,
    manufacturer_name VARCHAR,
    product_code VARCHAR,
    product_type VARCHAR,
    category VARCHAR,
    min_percent DECIMAL,
    max_percent DECIMAL,
    recommended_percent DECIMAL,
    steep_days INT,
    avg_rating DECIMAL,
    usage_count INT,
    vg_ratio INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    search_terms TEXT[];
    term TEXT;
    search_pattern TEXT;
BEGIN
    -- Pokud není hledaný výraz, vrátit top příchutě podle usage_count
    IF p_search_term IS NULL OR TRIM(p_search_term) = '' THEN
        RETURN QUERY
        SELECT 
            f.id,
            f.name,
            f.manufacturer_code,
            m.name AS manufacturer_name,
            f.product_code,
            f.product_type,
            f.category,
            f.min_percent,
            f.max_percent,
            f.recommended_percent,
            f.steep_days,
            f.avg_rating,
            f.usage_count,
            f.vg_ratio
        FROM flavors f
        LEFT JOIN flavor_manufacturers m ON f.manufacturer_code = m.code
        WHERE f.status = 'active'
          AND f.product_type = p_product_type
        ORDER BY f.usage_count DESC
        LIMIT p_limit;
        RETURN;
    END IF;
    
    -- Rozdělit hledaný výraz na jednotlivá slova
    -- Např. "imperia strawberry" -> ['imperia', 'strawberry']
    search_terms := regexp_split_to_array(LOWER(TRIM(p_search_term)), '\s+');
    
    -- Hledat příchutě, které obsahují VŠECHNA zadaná slova
    -- v kombinaci polí: název příchutě, název výrobce, kód výrobce, product_code
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.manufacturer_code,
        m.name AS manufacturer_name,
        f.product_code,
        f.product_type,
        f.category,
        f.min_percent,
        f.max_percent,
        f.recommended_percent,
        f.steep_days,
        f.avg_rating,
        f.usage_count,
        f.vg_ratio
    FROM flavors f
    LEFT JOIN flavor_manufacturers m ON f.manufacturer_code = m.code
    WHERE f.status = 'active'
      AND f.product_type = p_product_type
      AND (
          -- Pro každé slovo v hledaném výrazu musí být shoda alespoň v jednom poli
          SELECT bool_and(
              LOWER(f.name) LIKE '%' || word || '%'
              OR LOWER(COALESCE(m.name, '')) LIKE '%' || word || '%'
              OR LOWER(COALESCE(f.manufacturer_code, '')) LIKE '%' || word || '%'
              OR LOWER(COALESCE(f.product_code, '')) LIKE '%' || word || '%'
          )
          FROM unnest(search_terms) AS word
      )
    ORDER BY 
        -- Priorita: přesná shoda v názvu > částečná shoda > podle popularity
        CASE 
            WHEN LOWER(f.name) = LOWER(TRIM(p_search_term)) THEN 0
            WHEN LOWER(f.name) LIKE LOWER(TRIM(p_search_term)) || '%' THEN 1
            ELSE 2
        END,
        f.usage_count DESC
    LIMIT p_limit;
END;
$$;

-- =====================================================
-- PART 2: Grant permissions
-- =====================================================

-- Povolit volání funkce pro všechny (včetně anonymních uživatelů)
GRANT EXECUTE ON FUNCTION search_flavors_fulltext(TEXT, TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION search_flavors_fulltext(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_flavors_fulltext(TEXT, TEXT, INT) TO service_role;

-- =====================================================
-- PART 3: Create index for better performance
-- =====================================================

-- Index pro rychlejší ILIKE hledání (pokud ještě neexistuje)
CREATE INDEX IF NOT EXISTS idx_flavors_name_lower 
ON flavors (LOWER(name) varchar_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_flavors_product_code_lower 
ON flavors (LOWER(product_code) varchar_pattern_ops) 
WHERE product_code IS NOT NULL;

-- =====================================================
-- PART 4: Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration completed: search_flavors_fulltext function created';
    RAISE NOTICE 'Function supports multi-word search (e.g., "imperia strawberry")';
    RAISE NOTICE 'Searches in: flavor name, manufacturer name, manufacturer code, product code';
END $$;
