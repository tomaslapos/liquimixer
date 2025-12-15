-- ============================================
-- LIQUIMIXER DATABASE MIGRATION
-- Spusťte tento SQL pokud už máte původní tabulky
-- ============================================

-- Přidat nové sloupce do tabulky recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE;

-- Vygenerovat share_id pro existující záznamy
UPDATE recipes SET share_id = substr(md5(random()::text), 1, 12) WHERE share_id IS NULL;

-- Nastavit share_id jako NOT NULL
ALTER TABLE recipes ALTER COLUMN share_id SET NOT NULL;

-- Přidat index pro rychlejší vyhledávání podle share_id
CREATE INDEX IF NOT EXISTS idx_recipes_share_id ON recipes(share_id);


