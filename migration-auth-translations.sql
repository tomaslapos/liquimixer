-- ============================================
-- LIQUIMIXER - Překlady pro přihlašovací obrazovku
-- Spustit v Supabase SQL Editor
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Čeština
('cs', 'auth.login_title', 'Přihlášení', 'auth'),
('cs', 'auth.login_subtitle', 'Přihlaste se pro přístup k uloženým receptům a produktům', 'auth'),
('cs', 'auth.profile_title', 'Můj účet', 'auth'),

-- Angličtina
('en', 'auth.login_title', 'Sign In', 'auth'),
('en', 'auth.login_subtitle', 'Sign in to access your saved recipes and products', 'auth'),
('en', 'auth.profile_title', 'My Account', 'auth'),

-- Polština
('pl', 'auth.login_title', 'Logowanie', 'auth'),
('pl', 'auth.login_subtitle', 'Zaloguj się, aby uzyskać dostęp do zapisanych przepisów i produktów', 'auth'),
('pl', 'auth.profile_title', 'Moje konto', 'auth'),

-- Němčina
('de', 'auth.login_title', 'Anmelden', 'auth'),
('de', 'auth.login_subtitle', 'Melden Sie sich an, um auf Ihre gespeicherten Rezepte und Produkte zuzugreifen', 'auth'),
('de', 'auth.profile_title', 'Mein Konto', 'auth'),

-- Slovenština
('sk', 'auth.login_title', 'Prihlásenie', 'auth'),
('sk', 'auth.login_subtitle', 'Prihláste sa pre prístup k uloženým receptom a produktom', 'auth'),
('sk', 'auth.profile_title', 'Môj účet', 'auth')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Ověření
SELECT 'Překlady pro přihlášení přidány!' as status;
SELECT locale, key, value FROM translations WHERE key LIKE 'auth.login%' OR key = 'auth.profile_title' ORDER BY locale, key;

