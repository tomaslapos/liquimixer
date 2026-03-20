-- =====================================================
-- INVENTORY MANAGEMENT: Skladové zásoby produktů a liquidů
-- Datum: 20.03.2026
-- 
-- Změny:
-- 1. favorite_products: přejmenovat stock_quantity → stock_volume_ml
-- 2. recipes: přidat cache sloupce liquid_stock_ml, liquid_matured_ml
-- 3. Funkce pro přepočet liquid stock cache
-- =====================================================

-- 1. Přejmenovat stock_quantity → stock_volume_ml na favorite_products
-- Existující data v ks nemají smysl pro ml, nastavíme na 0
ALTER TABLE favorite_products 
    RENAME COLUMN stock_quantity TO stock_volume_ml;

COMMENT ON COLUMN favorite_products.stock_volume_ml IS 
    'Skladová zásoba produktu v mililitrech (ml). Nahrazuje původní stock_quantity (ks).';

-- Reset existujících hodnot (byly v ks, ne v ml)
UPDATE favorite_products SET stock_volume_ml = 0 WHERE stock_volume_ml != 0;

-- 2. Přidat cache sloupce na recipes pro zobrazení v přehledu bez načítání připomínek
ALTER TABLE recipes 
    ADD COLUMN IF NOT EXISTS liquid_stock_ml NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS liquid_matured_ml NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_recipes_liquid_stock 
    ON recipes(clerk_id) WHERE liquid_stock_ml > 0;

COMMENT ON COLUMN recipes.liquid_stock_ml IS 
    'Cache: celkový objem liquidu ze všech aktivních připomínek (consumed_at IS NULL, stock_percent > 0). Přepočítáno při změně připomínky.';

COMMENT ON COLUMN recipes.liquid_matured_ml IS 
    'Cache: objem vyzrálého liquidu (remind_at <= now()). Přepočítáno při změně připomínky.';

-- 3. Funkce pro přepočet liquid stock cache pro konkrétní recept
CREATE OR REPLACE FUNCTION recalc_recipe_liquid_stock(p_recipe_id UUID)
RETURNS void AS $$
DECLARE
    v_total_ml NUMERIC := 0;
    v_matured_ml NUMERIC := 0;
    v_total_amount NUMERIC;
BEGIN
    -- Projít všechny aktivní připomínky pro tento recept
    SELECT 
        COALESCE(SUM(
            COALESCE((r2.recipe_data->>'totalAmount')::NUMERIC, 0) 
            * COALESCE(rm.stock_percent, 100) / 100.0
        ), 0),
        COALESCE(SUM(
            CASE WHEN rm.remind_at <= CURRENT_DATE THEN
                COALESCE((r2.recipe_data->>'totalAmount')::NUMERIC, 0) 
                * COALESCE(rm.stock_percent, 100) / 100.0
            ELSE 0 END
        ), 0)
    INTO v_total_ml, v_matured_ml
    FROM recipe_reminders rm
    JOIN recipes r2 ON r2.id = rm.recipe_id
    WHERE rm.recipe_id = p_recipe_id
      AND rm.consumed_at IS NULL
      AND COALESCE(rm.stock_percent, 100) > 0
      AND rm.status IN ('pending', 'matured');

    UPDATE recipes 
    SET liquid_stock_ml = v_total_ml,
        liquid_matured_ml = v_matured_ml
    WHERE id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger pro automatický přepočet při změně připomínky
CREATE OR REPLACE FUNCTION trigger_recalc_liquid_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Přepočítat pro starý recept (při UPDATE recipe_id nebo DELETE)
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.recipe_id IS DISTINCT FROM NEW.recipe_id) THEN
        PERFORM recalc_recipe_liquid_stock(OLD.recipe_id);
    END IF;
    
    -- Přepočítat pro nový/aktuální recept
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM recalc_recipe_liquid_stock(NEW.recipe_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalc_liquid_stock ON recipe_reminders;
CREATE TRIGGER trg_recalc_liquid_stock
    AFTER INSERT OR UPDATE OR DELETE ON recipe_reminders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_liquid_stock();

-- 5. Jednorázový přepočet existujících dat
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT DISTINCT recipe_id 
        FROM recipe_reminders 
        WHERE consumed_at IS NULL 
          AND COALESCE(stock_percent, 100) > 0
          AND status IN ('pending', 'matured')
    LOOP
        PERFORM recalc_recipe_liquid_stock(rec.recipe_id);
    END LOOP;
END;
$$;
