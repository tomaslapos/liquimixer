-- Migrace: Přidání sloupce pro uložení souhlasu s obchodními podmínkami
-- Datum: 2026-01-27
-- Účel: Právní požadavek - uložit kdy uživatel souhlasil s OP

-- Přidat sloupec terms_accepted_at do tabulky users
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Vytvořit index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_users_terms_accepted ON users(terms_accepted_at);

-- Komentář pro dokumentaci
COMMENT ON COLUMN users.terms_accepted_at IS 'Timestamp kdy uživatel souhlasil s obchodními podmínkami';
