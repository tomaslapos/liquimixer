-- ============================================
-- MIGRATION: User Locale Preference
-- Přidání sloupce pro uložení preferovaného jazyka uživatele
-- ============================================

-- Přidat sloupec preferred_locale do tabulky users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT NULL;

-- Komentář k sloupci
COMMENT ON COLUMN users.preferred_locale IS 'Preferovaný jazyk uživatele (např. cs, en, de, sk)';

-- Index pro rychlejší vyhledávání (volitelné)
CREATE INDEX IF NOT EXISTS idx_users_preferred_locale ON users(preferred_locale);

-- ============================================
-- PŘIDÁNÍ PŘEKLADŮ PRO UI
-- ============================================

-- Překlad pro nastavení jazyka (pokud tabulka translations existuje)
INSERT INTO translations (locale, key, value, is_verified) 
VALUES 
    ('cs', 'settings.language', 'Jazyk', true),
    ('en', 'settings.language', 'Language', true),
    ('de', 'settings.language', 'Sprache', true),
    ('sk', 'settings.language', 'Jazyk', true),
    ('pl', 'settings.language', 'Język', true),
    ('fr', 'settings.language', 'Langue', true),
    ('it', 'settings.language', 'Lingua', true),
    ('es', 'settings.language', 'Idioma', true),
    ('pt', 'settings.language', 'Idioma', true),
    ('nl', 'settings.language', 'Taal', true),
    ('uk', 'settings.language', 'Мова', true),
    ('ja', 'settings.language', '言語', true),
    ('ko', 'settings.language', '언어', true),
    ('tr', 'settings.language', 'Dil', true),
    ('ar-SA', 'settings.language', 'اللغة', true)
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
