-- ============================================
-- SUBSCRIPTION BYPASS FIX (24.03.2026)
-- Přidání server-side kontroly předplatného
-- do RLS policies pro INSERT na recipes a favorite_products
-- ============================================

-- 1. Helper funkce: má uživatel aktivní předplatné?
-- Volá se z RLS policies při INSERT operacích
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_clerk_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE clerk_id = p_clerk_id
      AND status = 'active'
      AND valid_to >= NOW()
  );
$$;

-- Povolit volání funkce pro authenticated i anon role
GRANT EXECUTE ON FUNCTION public.has_active_subscription(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(TEXT) TO anon;

-- ============================================
-- 2. RECIPES — zpřísnit INSERT policies
-- ============================================

-- Smazat staré permisivní INSERT policies
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Insert recipes with validation" ON recipes;

-- Nová INSERT policy: vyžaduje aktivní subscription + validace dat
CREATE POLICY "Insert recipes with subscription check" ON recipes
    FOR INSERT
    WITH CHECK (
        -- Clerk ID musí odpovídat přihlášenému uživateli
        clerk_id = (auth.jwt() ->> 'sub')
        -- Musí mít aktivní předplatné
        AND has_active_subscription(clerk_id)
        -- Základní validace dat (zachováno z původní policy)
        AND clerk_id IS NOT NULL
        AND length(clerk_id) >= 15
        AND name IS NOT NULL
        AND length(name) >= 1
        AND length(name) <= 200
        AND recipe_data IS NOT NULL
        AND rating >= 0
        AND rating <= 5
    );

-- ============================================
-- 3. FAVORITE_PRODUCTS — zpřísnit INSERT policies
-- ============================================

-- Smazat staré permisivní INSERT policies
DROP POLICY IF EXISTS "Users can insert own products" ON favorite_products;
DROP POLICY IF EXISTS "Insert products with validation" ON favorite_products;

-- Nová INSERT policy: vyžaduje aktivní subscription + validace dat
CREATE POLICY "Insert products with subscription check" ON favorite_products
    FOR INSERT
    WITH CHECK (
        -- Clerk ID musí odpovídat přihlášenému uživateli
        clerk_id = (auth.jwt() ->> 'sub')
        -- Musí mít aktivní předplatné
        AND has_active_subscription(clerk_id)
        -- Základní validace dat (zachováno z původní policy)
        AND clerk_id IS NOT NULL
        AND length(clerk_id) >= 15
        AND name IS NOT NULL
        AND length(name) >= 1
        AND length(name) <= 200
        AND product_type = ANY (ARRAY['vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt'])
        AND rating >= 0
        AND rating <= 5
    );

-- ============================================
-- 4. Ověření
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SUBSCRIPTION BYPASS FIX ===';
    RAISE NOTICE 'Vytvořena funkce: has_active_subscription(clerk_id)';
    RAISE NOTICE 'Aktualizovány INSERT policies:';
    RAISE NOTICE '  - recipes: vyžaduje aktivní subscription';
    RAISE NOTICE '  - favorite_products: vyžaduje aktivní subscription';
    RAISE NOTICE 'Service role zůstává bez omezení (ALL policy).';
    RAISE NOTICE '';
END $$;
