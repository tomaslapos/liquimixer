-- ============================================
-- MIGRACE: Moderace veřejných receptů
-- 05.03.2026
-- ============================================
-- Přidání sloupce public_status pro moderační workflow
-- Stavy: NULL (soukromý), 'pending' (čeká na schválení), 'approved' (schváleno), 'rejected' (zamítnuto)

-- 1. Přidat sloupec public_status
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS public_status TEXT DEFAULT NULL;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS moderation_note TEXT DEFAULT NULL;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Existující veřejné recepty (seed data) nastavit jako schválené
UPDATE recipes SET public_status = 'approved' WHERE is_public = true AND public_status IS NULL;

-- 3. Index pro pending recepty (N8N CRON)
CREATE INDEX IF NOT EXISTS idx_recipes_pending_moderation 
ON recipes(created_at DESC) WHERE public_status = 'pending';

-- 4. Aktualizovat RLS — veřejné recepty musí mít public_status = 'approved'
-- Nejprve smazat starou politiku
DROP POLICY IF EXISTS "Anyone can read public recipes" ON recipes;

-- Nová politika: veřejné recepty viditelné pouze po schválení
CREATE POLICY "Anyone can read public recipes" 
ON recipes
FOR SELECT 
USING (
    is_public = true AND public_status = 'approved'
);

-- Uživatel vidí vlastní recepty (všechny stavy)
DROP POLICY IF EXISTS "Users can read own recipes" ON recipes;
CREATE POLICY "Users can read own recipes" 
ON recipes
FOR SELECT 
TO authenticated
USING (clerk_id = auth.jwt()->>'sub');

-- Service role má plný přístup
DROP POLICY IF EXISTS "Service role manages recipes" ON recipes;
CREATE POLICY "Service role manages recipes" 
ON recipes
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON COLUMN recipes.public_status IS 'Moderační stav: NULL=soukromý, pending=čeká, approved=schváleno, rejected=zamítnuto';
COMMENT ON COLUMN recipes.moderation_note IS 'Poznámka z AI moderace (důvod zamítnutí apod.)';
COMMENT ON COLUMN recipes.moderated_at IS 'Timestamp poslední moderace';
