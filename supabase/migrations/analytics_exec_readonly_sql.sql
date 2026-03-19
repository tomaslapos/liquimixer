-- =============================================
-- EXEC READONLY SQL — Analytics DB (ikgtygabrrvbqyffcqjd)
-- Spustit v SQL Editoru analytics projektu
-- Umožňuje edge funkci spouštět dynamické SELECT dotazy
-- 05.03.2026
-- =============================================

CREATE OR REPLACE FUNCTION exec_readonly_sql(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    normalized TEXT;
BEGIN
    -- Normalizovat dotaz (lowercase, bez komentářů)
    normalized := lower(trim(regexp_replace(query, '--.*$', '', 'gm')));
    normalized := trim(regexp_replace(normalized, '/\*.*?\*/', '', 'g'));

    -- POUZE SELECT / WITH (CTE) dotazy
    IF NOT (normalized LIKE 'select%' OR normalized LIKE 'with%') THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed (including WITH/CTE)';
    END IF;

    -- Zakázat nebezpečné příkazy (včetně pg_read_file, pg_write_file, lo_import, lo_export, copy)
    IF normalized ~ '\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|execute|copy|pg_read_file|pg_write_file|lo_import|lo_export)\b' THEN
        RAISE EXCEPTION 'Forbidden SQL command detected';
    END IF;

    -- SELECT INTO je zakázaný
    IF normalized ~ '\binto\b' THEN
        RAISE EXCEPTION 'SELECT INTO is not allowed';
    END IF;

    -- Spustit dotaz a vrátit výsledky jako JSONB
    EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Přístup: pouze service_role může volat tuto funkci
REVOKE ALL ON FUNCTION exec_readonly_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_readonly_sql(TEXT) FROM anon;
REVOKE ALL ON FUNCTION exec_readonly_sql(TEXT) FROM authenticated;
-- service_role má přístup automaticky přes SECURITY DEFINER
