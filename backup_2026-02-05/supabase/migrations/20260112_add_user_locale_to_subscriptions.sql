-- ============================================
-- Migrace: Přidání sloupců user_locale a user_country do subscriptions
-- ============================================

-- Přidat sloupec pro jazyk uživatele (pro fakturaci)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS user_locale VARCHAR(10) DEFAULT 'cs';

-- Přidat sloupec pro zemi uživatele (pro DPH)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS user_country VARCHAR(2) DEFAULT 'CZ';

-- Komentáře
COMMENT ON COLUMN subscriptions.user_locale IS 'Jazyk uživatele pro fakturu (cs, en, sk, de, ...)';
COMMENT ON COLUMN subscriptions.user_country IS 'Země uživatele pro výpočet DPH (CZ, SK, DE, ...)';
