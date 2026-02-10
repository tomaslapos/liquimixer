-- ============================================
-- Migration: Add user cleanup tracking columns
-- Date: 2026-01-09
-- Description: Přidání sloupců pro sledování mazání neaktivních účtů
-- ============================================

-- Přidat sloupec pro sledování odeslaných upozornění
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deletion_warning_sent TEXT[] DEFAULT '{}';

-- Přidat sloupec pro naplánované datum smazání
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ DEFAULT NULL;

-- Přidat sloupec pro locale (pokud neexistuje)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'cs';

-- Index pro rychlejší dotazy na neaktivní uživatele
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled 
ON users(deletion_scheduled_at) 
WHERE deletion_scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);

-- Komentáře
COMMENT ON COLUMN users.deletion_warning_sent IS 'Pole odeslaných upozornění: 1month, 1week, 1day';
COMMENT ON COLUMN users.deletion_scheduled_at IS 'Datum plánovaného smazání účtu';
COMMENT ON COLUMN users.locale IS 'Preferovaný jazyk uživatele (cs, en)';
