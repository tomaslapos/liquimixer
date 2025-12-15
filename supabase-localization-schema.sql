-- ============================================
-- LIQUIMIXER LOCALIZATION & TRANSLATIONS
-- Lokalizace a překlady pro všechny země
-- ============================================

-- ============================================
-- VYTVOŘENÍ TABULEK (pokud neexistují)
-- ============================================

-- Tabulka lokalizací
CREATE TABLE IF NOT EXISTS locales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    currency TEXT DEFAULT 'EUR',
    currency_symbol TEXT DEFAULT '€',
    date_format TEXT DEFAULT 'DD.MM.YYYY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabulka překladů
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    locale TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(locale, key)
);

-- Tabulka ceníku
CREATE TABLE IF NOT EXISTS pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 21,
    currency TEXT DEFAULT 'CZK',
    duration_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    locale TEXT DEFAULT 'cs',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON translations(category);

-- RLS politiky
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Vytvořit politiky pouze pokud neexistují
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locales' AND policyname = 'Anyone can view locales') THEN
        CREATE POLICY "Anyone can view locales" ON locales FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Anyone can view translations') THEN
        CREATE POLICY "Anyone can view translations" ON translations FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing' AND policyname = 'Anyone can view pricing') THEN
        CREATE POLICY "Anyone can view pricing" ON pricing FOR SELECT USING (true);
    END IF;
END $$;

-- Smazat existující data
DELETE FROM locales WHERE true;
DELETE FROM translations WHERE true;
DELETE FROM pricing WHERE true;

-- ============================================
-- TABULKA LOKALIZACÍ (ZEMĚ)
-- ============================================

INSERT INTO locales (code, name, native_name, currency, currency_symbol, date_format, is_active) VALUES
-- STŘEDNÍ EVROPA
('cs', 'Czech', 'Čeština', 'CZK', 'Kč', 'DD.MM.YYYY', true),
('sk', 'Slovak', 'Slovenčina', 'EUR', '€', 'DD.MM.YYYY', true),
('pl', 'Polish', 'Polski', 'EUR', '€', 'DD.MM.YYYY', true),
('de', 'German', 'Deutsch', 'EUR', '€', 'DD.MM.YYYY', true),
('de-AT', 'German (Austria)', 'Deutsch (Österreich)', 'EUR', '€', 'DD.MM.YYYY', true),

-- ZÁPADNÍ EVROPA
('fr', 'French', 'Français', 'EUR', '€', 'DD/MM/YYYY', true),
('fr-BE', 'French (Belgium)', 'Français (Belgique)', 'EUR', '€', 'DD/MM/YYYY', true),
('nl', 'Dutch', 'Nederlands', 'EUR', '€', 'DD-MM-YYYY', true),
('nl-BE', 'Dutch (Belgium)', 'Nederlands (België)', 'EUR', '€', 'DD-MM-YYYY', true),

-- JIŽNÍ EVROPA
('it', 'Italian', 'Italiano', 'EUR', '€', 'DD/MM/YYYY', true),
('es', 'Spanish', 'Español', 'EUR', '€', 'DD/MM/YYYY', true),
('pt', 'Portuguese', 'Português', 'EUR', '€', 'DD/MM/YYYY', true),
('sl', 'Slovenian', 'Slovenščina', 'EUR', '€', 'DD.MM.YYYY', true),
('hr', 'Croatian', 'Hrvatski', 'EUR', '€', 'DD.MM.YYYY', true),
('el', 'Greek', 'Ελληνικά', 'EUR', '€', 'DD/MM/YYYY', true),
('sq', 'Albanian', 'Shqip', 'EUR', '€', 'DD.MM.YYYY', true),

-- SEVERNÍ EVROPA (SKANDINÁVIE)
('da', 'Danish', 'Dansk', 'EUR', '€', 'DD-MM-YYYY', true),
('no', 'Norwegian', 'Norsk', 'EUR', '€', 'DD.MM.YYYY', true),
('sv', 'Swedish', 'Svenska', 'EUR', '€', 'YYYY-MM-DD', true),
('fi', 'Finnish', 'Suomi', 'EUR', '€', 'DD.MM.YYYY', true),

-- POBALTÍ
('et', 'Estonian', 'Eesti', 'EUR', '€', 'DD.MM.YYYY', true),
('lv', 'Latvian', 'Latviešu', 'EUR', '€', 'DD.MM.YYYY', true),
('lt', 'Lithuanian', 'Lietuvių', 'EUR', '€', 'YYYY-MM-DD', true),

-- VÝCHODNÍ EVROPA
('uk', 'Ukrainian', 'Українська', 'EUR', '€', 'DD.MM.YYYY', true),
('ro', 'Romanian', 'Română', 'EUR', '€', 'DD.MM.YYYY', true),
('bg', 'Bulgarian', 'Български', 'EUR', '€', 'DD.MM.YYYY', true),
('sr', 'Serbian', 'Српски', 'EUR', '€', 'DD.MM.YYYY', true),

-- BLÍZKÝ VÝCHOD
('tr', 'Turkish', 'Türkçe', 'EUR', '€', 'DD.MM.YYYY', true),
('ar-SA', 'Arabic (Saudi Arabia)', 'العربية (السعودية)', 'USD', '$', 'DD/MM/YYYY', true),
('ar-AE', 'Arabic (UAE)', 'العربية (الإمارات)', 'USD', '$', 'DD/MM/YYYY', true),
('ar-KW', 'Arabic (Kuwait)', 'العربية (الكويت)', 'USD', '$', 'DD/MM/YYYY', true),

-- ASIE
('ja', 'Japanese', '日本語', 'USD', '$', 'YYYY/MM/DD', true),
('ko', 'Korean', '한국어', 'USD', '$', 'YYYY.MM.DD', true),
('fil', 'Filipino', 'Filipino', 'USD', '$', 'MM/DD/YYYY', true),

-- ANGLIČTINA (výchozí)
('en', 'English', 'English', 'EUR', '€', 'YYYY-MM-DD', true);

-- ============================================
-- ČESKÉ PŘEKLADY (VÝCHOZÍ)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigace
('cs', 'nav.menu', 'Menu', 'navigation'),
('cs', 'nav.login', 'Přihlášení', 'navigation'),
('cs', 'nav.logout', 'Odhlásit se', 'navigation'),
('cs', 'nav.my_recipes', 'Mé recepty', 'navigation'),
('cs', 'nav.home', 'Domů', 'navigation'),
('cs', 'nav.back', 'Zpět', 'navigation'),

-- Hlavní stránka
('cs', 'home.title', 'LIQUIMIXER', 'home'),
('cs', 'home.subtitle', 'E-LIQUID KALKULÁTOR', 'home'),
('cs', 'home.warning_title', 'Při míchání se soustřeďte na dodržování bezpečnostních zásad', 'home'),
('cs', 'home.warning_text', 'Při míchání e-liquidu vždy noste ochranné rukavice a pracujte v dobře větraném prostoru, zejména pokud používáte nikotinové boostery.', 'home'),
('cs', 'home.prepare_title', 'Před mícháním si připravte:', 'home'),
('cs', 'home.start_button', 'ZAČÍT MÍCHAT', 'home'),
('cs', 'home.dilute_button', 'ŘEDIT LIQUID', 'home'),

-- Přípravky
('cs', 'prep.pg', 'Propylenglykol (PG)', 'preparation'),
('cs', 'prep.vg', 'Rostlinný glycerin (VG)', 'preparation'),
('cs', 'prep.flavors', 'Volitelně příchutě', 'preparation'),
('cs', 'prep.nicotine', 'Nikotin booster nebo sůl', 'preparation'),
('cs', 'prep.gloves', 'Zdravotnické rukavice', 'preparation'),
('cs', 'prep.bottle', 'Prázdná skleněná lahvička', 'preparation'),
('cs', 'prep.dropper', 'Kapátko, pipeta nebo stříkačka', 'preparation'),
('cs', 'prep.measuring', 'Měřící pomůcky', 'preparation'),

-- Formulář
('cs', 'form.title', 'Konfigurace směsi', 'form'),
('cs', 'form.tab_liquid', 'Liquid', 'form'),
('cs', 'form.tab_shakevape', 'Shake & Vape', 'form'),
('cs', 'form.tab_liquidpro', 'Liquid PRO', 'form'),
('cs', 'form.total_amount', 'Kolik liquidu chci namíchat?', 'form'),
('cs', 'form.total_amount_sv', 'Celkový objem nádoby Shake & Vape?', 'form'),
('cs', 'form.nicotine_base', 'Jak silnou mám nikotinovou bázi?', 'form'),
('cs', 'form.nicotine_base_hint', 'Tyto údaje opiš z obalu nikotinu', 'form'),
('cs', 'form.nicotine_type_none', 'Bez nikotinu', 'form'),
('cs', 'form.nicotine_type_freebase', 'Nikotin booster', 'form'),
('cs', 'form.nicotine_type_salt', 'Nikotinová sůl', 'form'),
('cs', 'form.target_nicotine', 'Jak silnou chci finální nikotinovou bázi na vapování?', 'form'),
('cs', 'form.flavor', 'Příchuť', 'form'),
('cs', 'form.flavor_type', 'Typ příchutě', 'form'),
('cs', 'form.flavor_none', 'Bez příchutě', 'form'),
('cs', 'form.flavor_volume', 'Objem příchutě', 'form'),
('cs', 'form.flavor_ratio', 'Poměr VG/PG v příchuti', 'form'),
('cs', 'form.vgpg_ratio', 'Poměr VG/PG ve výsledném liquidu', 'form'),
('cs', 'form.vg_label', 'Dým (VG)', 'form'),
('cs', 'form.pg_label', 'Chuť (PG)', 'form'),
('cs', 'form.mix_button', 'MIXUJ', 'form'),

-- Typy příchutí
('cs', 'flavor.fruit', 'Ovoce', 'flavors'),
('cs', 'flavor.tobacco', 'Tabák', 'flavors'),
('cs', 'flavor.menthol', 'Mentol / Mints', 'flavors'),
('cs', 'flavor.dessert', 'Dezerty / Sladké', 'flavors'),
('cs', 'flavor.drinks', 'Nápoje', 'flavors'),
('cs', 'flavor.candy', 'Bonbóny / Kyselé', 'flavors'),
('cs', 'flavor.bakery', 'Pečivo / Ořechy', 'flavors'),
('cs', 'flavor.spice', 'Kořeněné', 'flavors'),

-- Výsledky
('cs', 'results.title', 'Tvůj recept', 'results'),
('cs', 'results.total_volume', 'Celkový objem:', 'results'),
('cs', 'results.ratio', 'Poměr VG/PG:', 'results'),
('cs', 'results.nicotine_strength', 'Síla nikotinu:', 'results'),
('cs', 'results.ingredient', 'Složka', 'results'),
('cs', 'results.volume', 'Objem (ml)', 'results'),
('cs', 'results.drops', 'Kapky', 'results'),
('cs', 'results.percent', 'Procento', 'results'),
('cs', 'results.notes_title', 'Poznámky k míchání:', 'results'),
('cs', 'results.note1', 'Nejprve přidejte nikotin (pokud používáte)', 'results'),
('cs', 'results.note2', 'Poté přidejte příchutě', 'results'),
('cs', 'results.note3', 'Nakonec doplňte PG a VG', 'results'),
('cs', 'results.note4', 'Důkladně protřepejte a nechte zrát 1-2 týdny', 'results'),
('cs', 'results.edit_button', 'UPRAVIT', 'results'),
('cs', 'results.save_button', 'ULOŽIT', 'results'),

-- Recepty
('cs', 'recipes.my_recipes', 'Mé recepty', 'recipes'),
('cs', 'recipes.no_recipes', 'Zatím nemáte žádné uložené recepty.', 'recipes'),
('cs', 'recipes.save_title', 'Uložit recept', 'recipes'),
('cs', 'recipes.name', 'Název receptu', 'recipes'),
('cs', 'recipes.description', 'Popis', 'recipes'),
('cs', 'recipes.rating', 'Hodnocení', 'recipes'),
('cs', 'recipes.save', 'Uložit recept', 'recipes'),
('cs', 'recipes.edit', 'UPRAVIT', 'recipes'),
('cs', 'recipes.share', 'SDÍLET', 'recipes'),
('cs', 'recipes.delete', 'SMAZAT', 'recipes'),
('cs', 'recipes.created', 'Vytvořeno:', 'recipes'),

-- Přihlášení
('cs', 'auth.login', 'Přihlášení', 'auth'),
('cs', 'auth.email', 'E-mail', 'auth'),
('cs', 'auth.password', 'Heslo', 'auth'),
('cs', 'auth.login_button', 'Přihlásit se', 'auth'),
('cs', 'auth.register_link', 'Nemáte účet? Registrace', 'auth'),
('cs', 'auth.my_account', 'Můj účet', 'auth'),
('cs', 'auth.login_required', 'Pro zobrazení receptu se přihlaste', 'auth'),
('cs', 'auth.login_required_text', 'Tento recept je dostupný pouze pro přihlášené uživatele.', 'auth'),

-- Menu
('cs', 'menu.title', 'Menu', 'menu'),
('cs', 'menu.cookies_title', 'Cookies', 'menu'),
('cs', 'menu.cookies_text', 'Firma WOOs neshromažďuje žádné cookies. Tato aplikace nepoužívá sledovací cookies, analytické cookies ani cookies třetích stran.', 'menu'),
('cs', 'menu.gdpr_title', 'GDPR a ochrana osobních údajů', 'menu'),
('cs', 'menu.gdpr_text', 'Osobní údaje jsou ukládány výhradně pro interní použití firmy WOOs za účelem přihlášení uživatele do aplikace.', 'menu'),
('cs', 'menu.contact_title', 'Kontaktní formulář', 'menu'),
('cs', 'menu.contact_email', 'Váš e-mail', 'menu'),
('cs', 'menu.contact_subject', 'Předmět', 'menu'),
('cs', 'menu.contact_message', 'Zpráva', 'menu'),
('cs', 'menu.contact_send', 'Odeslat zprávu', 'menu'),

-- Předplatné
('cs', 'subscription.title', 'Předplatné', 'subscription'),
('cs', 'subscription.active', 'Aktivní', 'subscription'),
('cs', 'subscription.inactive', 'Neaktivní', 'subscription'),
('cs', 'subscription.expires', 'Platné do:', 'subscription'),
('cs', 'subscription.buy', 'Koupit předplatné', 'subscription'),
('cs', 'subscription.yearly', 'Roční předplatné', 'subscription'),
('cs', 'subscription.price', 'Cena:', 'subscription'),

-- Obecné
('cs', 'general.loading', 'Načítám...', 'general'),
('cs', 'general.error', 'Chyba', 'general'),
('cs', 'general.success', 'Úspěch', 'general'),
('cs', 'general.cancel', 'Zrušit', 'general'),
('cs', 'general.confirm', 'Potvrdit', 'general'),
('cs', 'general.close', 'Zavřít', 'general'),
('cs', 'general.yes', 'Ano', 'general'),
('cs', 'general.no', 'Ne', 'general'),
('cs', 'general.ml', 'ml', 'general'),
('cs', 'general.mg_ml', 'mg/ml', 'general')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ANGLICKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigation
('en', 'nav.menu', 'Menu', 'navigation'),
('en', 'nav.login', 'Login', 'navigation'),
('en', 'nav.logout', 'Logout', 'navigation'),
('en', 'nav.my_recipes', 'My Recipes', 'navigation'),
('en', 'nav.home', 'Home', 'navigation'),
('en', 'nav.back', 'Back', 'navigation'),

-- Home
('en', 'home.title', 'LIQUIMIXER', 'home'),
('en', 'home.subtitle', 'E-LIQUID CALCULATOR', 'home'),
('en', 'home.warning_title', 'Follow safety guidelines when mixing', 'home'),
('en', 'home.warning_text', 'Always wear protective gloves and work in a well-ventilated area when mixing e-liquid, especially when using nicotine boosters.', 'home'),
('en', 'home.prepare_title', 'Prepare before mixing:', 'home'),
('en', 'home.start_button', 'START MIXING', 'home'),
('en', 'home.dilute_button', 'DILUTE LIQUID', 'home'),

-- Preparation
('en', 'prep.pg', 'Propylene Glycol (PG)', 'preparation'),
('en', 'prep.vg', 'Vegetable Glycerin (VG)', 'preparation'),
('en', 'prep.flavors', 'Flavors (optional)', 'preparation'),
('en', 'prep.nicotine', 'Nicotine booster or salt', 'preparation'),
('en', 'prep.gloves', 'Medical gloves', 'preparation'),
('en', 'prep.bottle', 'Empty glass bottle', 'preparation'),
('en', 'prep.dropper', 'Dropper, pipette or syringe', 'preparation'),
('en', 'prep.measuring', 'Measuring tools', 'preparation'),

-- Form
('en', 'form.title', 'Mix Configuration', 'form'),
('en', 'form.tab_liquid', 'Liquid', 'form'),
('en', 'form.tab_shakevape', 'Shake & Vape', 'form'),
('en', 'form.tab_liquidpro', 'Liquid PRO', 'form'),
('en', 'form.total_amount', 'How much liquid do I want to mix?', 'form'),
('en', 'form.total_amount_sv', 'Total Shake & Vape container volume?', 'form'),
('en', 'form.nicotine_base', 'What strength is my nicotine base?', 'form'),
('en', 'form.nicotine_base_hint', 'Copy these details from the nicotine package', 'form'),
('en', 'form.nicotine_type_none', 'No nicotine', 'form'),
('en', 'form.nicotine_type_freebase', 'Nicotine booster', 'form'),
('en', 'form.nicotine_type_salt', 'Nicotine salt', 'form'),
('en', 'form.target_nicotine', 'What nicotine strength do I want for vaping?', 'form'),
('en', 'form.flavor', 'Flavor', 'form'),
('en', 'form.flavor_type', 'Flavor type', 'form'),
('en', 'form.flavor_none', 'No flavor', 'form'),
('en', 'form.flavor_volume', 'Flavor volume', 'form'),
('en', 'form.flavor_ratio', 'VG/PG ratio in flavor', 'form'),
('en', 'form.vgpg_ratio', 'VG/PG ratio in final liquid', 'form'),
('en', 'form.vg_label', 'Vapor (VG)', 'form'),
('en', 'form.pg_label', 'Flavor (PG)', 'form'),
('en', 'form.mix_button', 'MIX', 'form'),

-- Flavor types
('en', 'flavor.fruit', 'Fruit', 'flavors'),
('en', 'flavor.tobacco', 'Tobacco', 'flavors'),
('en', 'flavor.menthol', 'Menthol / Mints', 'flavors'),
('en', 'flavor.dessert', 'Desserts / Sweet', 'flavors'),
('en', 'flavor.drinks', 'Drinks', 'flavors'),
('en', 'flavor.candy', 'Candy / Sour', 'flavors'),
('en', 'flavor.bakery', 'Bakery / Nuts', 'flavors'),
('en', 'flavor.spice', 'Spicy', 'flavors'),

-- Results
('en', 'results.title', 'Your Recipe', 'results'),
('en', 'results.total_volume', 'Total volume:', 'results'),
('en', 'results.ratio', 'VG/PG ratio:', 'results'),
('en', 'results.nicotine_strength', 'Nicotine strength:', 'results'),
('en', 'results.ingredient', 'Ingredient', 'results'),
('en', 'results.volume', 'Volume (ml)', 'results'),
('en', 'results.drops', 'Drops', 'results'),
('en', 'results.percent', 'Percentage', 'results'),
('en', 'results.notes_title', 'Mixing notes:', 'results'),
('en', 'results.note1', 'First add nicotine (if using)', 'results'),
('en', 'results.note2', 'Then add flavors', 'results'),
('en', 'results.note3', 'Finally add PG and VG', 'results'),
('en', 'results.note4', 'Shake thoroughly and steep for 1-2 weeks', 'results'),
('en', 'results.edit_button', 'EDIT', 'results'),
('en', 'results.save_button', 'SAVE', 'results'),

-- Recipes
('en', 'recipes.my_recipes', 'My Recipes', 'recipes'),
('en', 'recipes.no_recipes', 'You have no saved recipes yet.', 'recipes'),
('en', 'recipes.save_title', 'Save Recipe', 'recipes'),
('en', 'recipes.name', 'Recipe name', 'recipes'),
('en', 'recipes.description', 'Description', 'recipes'),
('en', 'recipes.rating', 'Rating', 'recipes'),
('en', 'recipes.save', 'Save recipe', 'recipes'),
('en', 'recipes.edit', 'EDIT', 'recipes'),
('en', 'recipes.share', 'SHARE', 'recipes'),
('en', 'recipes.delete', 'DELETE', 'recipes'),
('en', 'recipes.created', 'Created:', 'recipes'),

-- Auth
('en', 'auth.login', 'Login', 'auth'),
('en', 'auth.email', 'E-mail', 'auth'),
('en', 'auth.password', 'Password', 'auth'),
('en', 'auth.login_button', 'Sign in', 'auth'),
('en', 'auth.register_link', 'No account? Register', 'auth'),
('en', 'auth.my_account', 'My Account', 'auth'),
('en', 'auth.login_required', 'Please log in to view this recipe', 'auth'),
('en', 'auth.login_required_text', 'This recipe is only available to logged in users.', 'auth'),

-- Menu
('en', 'menu.title', 'Menu', 'menu'),
('en', 'menu.cookies_title', 'Cookies', 'menu'),
('en', 'menu.cookies_text', 'WOOs does not collect any cookies. This application does not use tracking cookies, analytics cookies or third-party cookies.', 'menu'),
('en', 'menu.gdpr_title', 'GDPR and Privacy', 'menu'),
('en', 'menu.gdpr_text', 'Personal data is stored exclusively for internal use by WOOs for user login purposes.', 'menu'),
('en', 'menu.contact_title', 'Contact Form', 'menu'),
('en', 'menu.contact_email', 'Your e-mail', 'menu'),
('en', 'menu.contact_subject', 'Subject', 'menu'),
('en', 'menu.contact_message', 'Message', 'menu'),
('en', 'menu.contact_send', 'Send message', 'menu'),

-- Subscription
('en', 'subscription.title', 'Subscription', 'subscription'),
('en', 'subscription.active', 'Active', 'subscription'),
('en', 'subscription.inactive', 'Inactive', 'subscription'),
('en', 'subscription.expires', 'Valid until:', 'subscription'),
('en', 'subscription.buy', 'Buy subscription', 'subscription'),
('en', 'subscription.yearly', 'Annual subscription', 'subscription'),
('en', 'subscription.price', 'Price:', 'subscription'),

-- General
('en', 'general.loading', 'Loading...', 'general'),
('en', 'general.error', 'Error', 'general'),
('en', 'general.success', 'Success', 'general'),
('en', 'general.cancel', 'Cancel', 'general'),
('en', 'general.confirm', 'Confirm', 'general'),
('en', 'general.close', 'Close', 'general'),
('en', 'general.yes', 'Yes', 'general'),
('en', 'general.no', 'No', 'general'),
('en', 'general.ml', 'ml', 'general'),
('en', 'general.mg_ml', 'mg/ml', 'general')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- POLSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigace
('pl', 'nav.menu', 'Menu', 'navigation'),
('pl', 'nav.login', 'Logowanie', 'navigation'),
('pl', 'nav.logout', 'Wyloguj się', 'navigation'),
('pl', 'nav.my_recipes', 'Moje przepisy', 'navigation'),
('pl', 'nav.home', 'Strona główna', 'navigation'),
('pl', 'nav.back', 'Wstecz', 'navigation'),

-- Strona główna
('pl', 'home.title', 'LIQUIMIXER', 'home'),
('pl', 'home.subtitle', 'KALKULATOR E-LIQUID', 'home'),
('pl', 'home.warning_title', 'Podczas mieszania przestrzegaj zasad bezpieczeństwa', 'home'),
('pl', 'home.warning_text', 'Podczas mieszania e-liquidu zawsze noś rękawice ochronne i pracuj w dobrze wentylowanym pomieszczeniu, szczególnie podczas używania boosterów nikotynowych.', 'home'),
('pl', 'home.prepare_title', 'Przygotuj przed mieszaniem:', 'home'),
('pl', 'home.start_button', 'ZACZNIJ MIESZAĆ', 'home'),
('pl', 'home.dilute_button', 'ROZCIEŃCZ LIQUID', 'home'),

-- Przygotowanie
('pl', 'prep.pg', 'Glikol propylenowy (PG)', 'preparation'),
('pl', 'prep.vg', 'Gliceryna roślinna (VG)', 'preparation'),
('pl', 'prep.flavors', 'Aromaty (opcjonalnie)', 'preparation'),
('pl', 'prep.nicotine', 'Booster nikotynowy lub sól', 'preparation'),
('pl', 'prep.gloves', 'Rękawice medyczne', 'preparation'),
('pl', 'prep.bottle', 'Pusta szklana butelka', 'preparation'),
('pl', 'prep.dropper', 'Zakraplacz, pipeta lub strzykawka', 'preparation'),
('pl', 'prep.measuring', 'Narzędzia pomiarowe', 'preparation'),

-- Formularz
('pl', 'form.title', 'Konfiguracja mieszanki', 'form'),
('pl', 'form.tab_liquid', 'Liquid', 'form'),
('pl', 'form.tab_shakevape', 'Shake & Vape', 'form'),
('pl', 'form.tab_liquidpro', 'Liquid PRO', 'form'),
('pl', 'form.total_amount', 'Ile liquidu chcę wymieszać?', 'form'),
('pl', 'form.total_amount_sv', 'Całkowita objętość pojemnika Shake & Vape?', 'form'),
('pl', 'form.nicotine_base', 'Jaka jest moc mojej bazy nikotynowej?', 'form'),
('pl', 'form.nicotine_base_hint', 'Przepisz te dane z opakowania nikotyny', 'form'),
('pl', 'form.nicotine_type_none', 'Bez nikotyny', 'form'),
('pl', 'form.nicotine_type_freebase', 'Booster nikotynowy', 'form'),
('pl', 'form.nicotine_type_salt', 'Sól nikotynowa', 'form'),
('pl', 'form.target_nicotine', 'Jaką moc nikotyny chcę do wapowania?', 'form'),
('pl', 'form.flavor', 'Aromat', 'form'),
('pl', 'form.flavor_type', 'Typ aromatu', 'form'),
('pl', 'form.flavor_none', 'Bez aromatu', 'form'),
('pl', 'form.flavor_volume', 'Objętość aromatu', 'form'),
('pl', 'form.flavor_ratio', 'Stosunek VG/PG w aromacie', 'form'),
('pl', 'form.vgpg_ratio', 'Stosunek VG/PG w gotowym liquidzie', 'form'),
('pl', 'form.vg_label', 'Para (VG)', 'form'),
('pl', 'form.pg_label', 'Smak (PG)', 'form'),
('pl', 'form.mix_button', 'MIESZAJ', 'form'),

-- Typy aromatów
('pl', 'flavor.fruit', 'Owocowe', 'flavors'),
('pl', 'flavor.tobacco', 'Tytoniowe', 'flavors'),
('pl', 'flavor.menthol', 'Mentol / Mięta', 'flavors'),
('pl', 'flavor.dessert', 'Desery / Słodkie', 'flavors'),
('pl', 'flavor.drinks', 'Napoje', 'flavors'),
('pl', 'flavor.candy', 'Cukierki / Kwaśne', 'flavors'),
('pl', 'flavor.bakery', 'Pieczywo / Orzechy', 'flavors'),
('pl', 'flavor.spice', 'Przyprawowe', 'flavors'),

-- Wyniki
('pl', 'results.title', 'Twój przepis', 'results'),
('pl', 'results.total_volume', 'Całkowita objętość:', 'results'),
('pl', 'results.ratio', 'Stosunek VG/PG:', 'results'),
('pl', 'results.nicotine_strength', 'Moc nikotyny:', 'results'),
('pl', 'results.ingredient', 'Składnik', 'results'),
('pl', 'results.volume', 'Objętość (ml)', 'results'),
('pl', 'results.drops', 'Krople', 'results'),
('pl', 'results.percent', 'Procent', 'results'),
('pl', 'results.notes_title', 'Wskazówki do mieszania:', 'results'),
('pl', 'results.note1', 'Najpierw dodaj nikotynę (jeśli używasz)', 'results'),
('pl', 'results.note2', 'Następnie dodaj aromaty', 'results'),
('pl', 'results.note3', 'Na końcu uzupełnij PG i VG', 'results'),
('pl', 'results.note4', 'Dokładnie wstrząśnij i odstaw na 1-2 tygodnie', 'results'),
('pl', 'results.edit_button', 'EDYTUJ', 'results'),
('pl', 'results.save_button', 'ZAPISZ', 'results'),

-- Przepisy
('pl', 'recipes.my_recipes', 'Moje przepisy', 'recipes'),
('pl', 'recipes.no_recipes', 'Nie masz jeszcze zapisanych przepisów.', 'recipes'),
('pl', 'recipes.save_title', 'Zapisz przepis', 'recipes'),
('pl', 'recipes.name', 'Nazwa przepisu', 'recipes'),
('pl', 'recipes.description', 'Opis', 'recipes'),
('pl', 'recipes.rating', 'Ocena', 'recipes'),
('pl', 'recipes.save', 'Zapisz przepis', 'recipes'),
('pl', 'recipes.edit', 'EDYTUJ', 'recipes'),
('pl', 'recipes.share', 'UDOSTĘPNIJ', 'recipes'),
('pl', 'recipes.delete', 'USUŃ', 'recipes'),
('pl', 'recipes.created', 'Utworzono:', 'recipes'),

-- Autoryzacja
('pl', 'auth.login', 'Logowanie', 'auth'),
('pl', 'auth.email', 'E-mail', 'auth'),
('pl', 'auth.password', 'Hasło', 'auth'),
('pl', 'auth.login_button', 'Zaloguj się', 'auth'),
('pl', 'auth.register_link', 'Nie masz konta? Zarejestruj się', 'auth'),
('pl', 'auth.my_account', 'Moje konto', 'auth'),
('pl', 'auth.login_required', 'Zaloguj się, aby zobaczyć przepis', 'auth'),
('pl', 'auth.login_required_text', 'Ten przepis jest dostępny tylko dla zalogowanych użytkowników.', 'auth'),

-- Menu
('pl', 'menu.title', 'Menu', 'menu'),
('pl', 'menu.cookies_title', 'Cookies', 'menu'),
('pl', 'menu.cookies_text', 'WOOs nie zbiera żadnych cookies. Ta aplikacja nie używa cookies śledzących, analitycznych ani cookies stron trzecich.', 'menu'),
('pl', 'menu.gdpr_title', 'RODO i prywatność', 'menu'),
('pl', 'menu.gdpr_text', 'Dane osobowe są przechowywane wyłącznie do użytku wewnętrznego WOOs w celu logowania użytkownika.', 'menu'),
('pl', 'menu.contact_title', 'Formularz kontaktowy', 'menu'),
('pl', 'menu.contact_email', 'Twój e-mail', 'menu'),
('pl', 'menu.contact_subject', 'Temat', 'menu'),
('pl', 'menu.contact_message', 'Wiadomość', 'menu'),
('pl', 'menu.contact_send', 'Wyślij wiadomość', 'menu'),

-- Subskrypcja
('pl', 'subscription.title', 'Subskrypcja', 'subscription'),
('pl', 'subscription.active', 'Aktywna', 'subscription'),
('pl', 'subscription.inactive', 'Nieaktywna', 'subscription'),
('pl', 'subscription.expires', 'Ważna do:', 'subscription'),
('pl', 'subscription.buy', 'Kup subskrypcję', 'subscription'),
('pl', 'subscription.yearly', 'Subskrypcja roczna', 'subscription'),
('pl', 'subscription.price', 'Cena:', 'subscription'),

-- Ogólne
('pl', 'general.loading', 'Ładowanie...', 'general'),
('pl', 'general.error', 'Błąd', 'general'),
('pl', 'general.success', 'Sukces', 'general'),
('pl', 'general.cancel', 'Anuluj', 'general'),
('pl', 'general.confirm', 'Potwierdź', 'general'),
('pl', 'general.close', 'Zamknij', 'general'),
('pl', 'general.yes', 'Tak', 'general'),
('pl', 'general.no', 'Nie', 'general'),
('pl', 'general.ml', 'ml', 'general'),
('pl', 'general.mg_ml', 'mg/ml', 'general')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NĚMECKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('de', 'nav.menu', 'Menü', 'navigation'),
('de', 'nav.login', 'Anmelden', 'navigation'),
('de', 'nav.logout', 'Abmelden', 'navigation'),
('de', 'nav.my_recipes', 'Meine Rezepte', 'navigation'),
('de', 'nav.home', 'Startseite', 'navigation'),
('de', 'nav.back', 'Zurück', 'navigation'),
('de', 'home.title', 'LIQUIMIXER', 'home'),
('de', 'home.subtitle', 'E-LIQUID RECHNER', 'home'),
('de', 'home.warning_title', 'Sicherheitsrichtlinien beim Mischen beachten', 'home'),
('de', 'home.start_button', 'MISCHEN STARTEN', 'home'),
('de', 'form.title', 'Mischkonfiguration', 'form'),
('de', 'form.total_amount', 'Wie viel Liquid möchte ich mischen?', 'form'),
('de', 'form.nicotine_base', 'Wie stark ist meine Nikotinbasis?', 'form'),
('de', 'form.mix_button', 'MISCHEN', 'form'),
('de', 'results.title', 'Dein Rezept', 'results'),
('de', 'results.edit_button', 'BEARBEITEN', 'results'),
('de', 'results.save_button', 'SPEICHERN', 'results'),
('de', 'auth.login', 'Anmelden', 'auth'),
('de', 'general.loading', 'Laden...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- SLOVENSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('sk', 'nav.menu', 'Menu', 'navigation'),
('sk', 'nav.login', 'Prihlásenie', 'navigation'),
('sk', 'nav.logout', 'Odhlásiť sa', 'navigation'),
('sk', 'nav.my_recipes', 'Moje recepty', 'navigation'),
('sk', 'nav.home', 'Domov', 'navigation'),
('sk', 'nav.back', 'Späť', 'navigation'),
('sk', 'home.title', 'LIQUIMIXER', 'home'),
('sk', 'home.subtitle', 'E-LIQUID KALKULÁTOR', 'home'),
('sk', 'home.warning_title', 'Pri miešaní dodržiavajte bezpečnostné zásady', 'home'),
('sk', 'home.start_button', 'ZAČAŤ MIEŠAŤ', 'home'),
('sk', 'form.title', 'Konfigurácia zmesi', 'form'),
('sk', 'form.total_amount', 'Koľko liquidu chcem namiešať?', 'form'),
('sk', 'form.mix_button', 'MIXUJ', 'form'),
('sk', 'results.title', 'Tvoj recept', 'results'),
('sk', 'results.edit_button', 'UPRAVIŤ', 'results'),
('sk', 'results.save_button', 'ULOŽIŤ', 'results'),
('sk', 'auth.login', 'Prihlásenie', 'auth'),
('sk', 'general.loading', 'Načítavam...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- FRANCOUZSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('fr', 'nav.menu', 'Menu', 'navigation'),
('fr', 'nav.login', 'Connexion', 'navigation'),
('fr', 'nav.logout', 'Déconnexion', 'navigation'),
('fr', 'nav.my_recipes', 'Mes recettes', 'navigation'),
('fr', 'nav.home', 'Accueil', 'navigation'),
('fr', 'nav.back', 'Retour', 'navigation'),
('fr', 'home.title', 'LIQUIMIXER', 'home'),
('fr', 'home.subtitle', 'CALCULATEUR E-LIQUIDE', 'home'),
('fr', 'home.start_button', 'COMMENCER LE MÉLANGE', 'home'),
('fr', 'form.title', 'Configuration du mélange', 'form'),
('fr', 'form.total_amount', 'Combien de liquide voulez-vous mélanger?', 'form'),
('fr', 'form.mix_button', 'MÉLANGER', 'form'),
('fr', 'results.title', 'Votre recette', 'results'),
('fr', 'results.edit_button', 'MODIFIER', 'results'),
('fr', 'results.save_button', 'ENREGISTRER', 'results'),
('fr', 'auth.login', 'Connexion', 'auth'),
('fr', 'general.loading', 'Chargement...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ITALSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('it', 'nav.menu', 'Menu', 'navigation'),
('it', 'nav.login', 'Accedi', 'navigation'),
('it', 'nav.logout', 'Esci', 'navigation'),
('it', 'nav.my_recipes', 'Le mie ricette', 'navigation'),
('it', 'nav.home', 'Home', 'navigation'),
('it', 'nav.back', 'Indietro', 'navigation'),
('it', 'home.title', 'LIQUIMIXER', 'home'),
('it', 'home.subtitle', 'CALCOLATORE E-LIQUID', 'home'),
('it', 'home.start_button', 'INIZIA A MISCELARE', 'home'),
('it', 'form.title', 'Configurazione miscela', 'form'),
('it', 'form.mix_button', 'MISCELA', 'form'),
('it', 'results.title', 'La tua ricetta', 'results'),
('it', 'results.edit_button', 'MODIFICA', 'results'),
('it', 'results.save_button', 'SALVA', 'results'),
('it', 'auth.login', 'Accedi', 'auth'),
('it', 'general.loading', 'Caricamento...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ŠPANĚLSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('es', 'nav.menu', 'Menú', 'navigation'),
('es', 'nav.login', 'Iniciar sesión', 'navigation'),
('es', 'nav.logout', 'Cerrar sesión', 'navigation'),
('es', 'nav.my_recipes', 'Mis recetas', 'navigation'),
('es', 'nav.home', 'Inicio', 'navigation'),
('es', 'nav.back', 'Volver', 'navigation'),
('es', 'home.title', 'LIQUIMIXER', 'home'),
('es', 'home.subtitle', 'CALCULADORA E-LIQUID', 'home'),
('es', 'home.start_button', 'EMPEZAR A MEZCLAR', 'home'),
('es', 'form.title', 'Configuración de mezcla', 'form'),
('es', 'form.mix_button', 'MEZCLAR', 'form'),
('es', 'results.title', 'Tu receta', 'results'),
('es', 'results.edit_button', 'EDITAR', 'results'),
('es', 'results.save_button', 'GUARDAR', 'results'),
('es', 'auth.login', 'Iniciar sesión', 'auth'),
('es', 'general.loading', 'Cargando...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- PORTUGALSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('pt', 'nav.menu', 'Menu', 'navigation'),
('pt', 'nav.login', 'Entrar', 'navigation'),
('pt', 'nav.logout', 'Sair', 'navigation'),
('pt', 'nav.my_recipes', 'Minhas receitas', 'navigation'),
('pt', 'home.title', 'LIQUIMIXER', 'home'),
('pt', 'home.subtitle', 'CALCULADORA E-LIQUID', 'home'),
('pt', 'home.start_button', 'COMEÇAR A MISTURAR', 'home'),
('pt', 'form.mix_button', 'MISTURAR', 'form'),
('pt', 'results.title', 'Sua receita', 'results'),
('pt', 'auth.login', 'Entrar', 'auth'),
('pt', 'general.loading', 'Carregando...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NIZOZEMSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('nl', 'nav.menu', 'Menu', 'navigation'),
('nl', 'nav.login', 'Inloggen', 'navigation'),
('nl', 'nav.logout', 'Uitloggen', 'navigation'),
('nl', 'nav.my_recipes', 'Mijn recepten', 'navigation'),
('nl', 'home.title', 'LIQUIMIXER', 'home'),
('nl', 'home.subtitle', 'E-LIQUID CALCULATOR', 'home'),
('nl', 'home.start_button', 'BEGIN MET MENGEN', 'home'),
('nl', 'form.mix_button', 'MIXEN', 'form'),
('nl', 'results.title', 'Jouw recept', 'results'),
('nl', 'auth.login', 'Inloggen', 'auth'),
('nl', 'general.loading', 'Laden...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- JAPONSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ja', 'nav.menu', 'メニュー', 'navigation'),
('ja', 'nav.login', 'ログイン', 'navigation'),
('ja', 'nav.logout', 'ログアウト', 'navigation'),
('ja', 'nav.my_recipes', 'マイレシピ', 'navigation'),
('ja', 'home.title', 'LIQUIMIXER', 'home'),
('ja', 'home.subtitle', 'Eリキッド計算機', 'home'),
('ja', 'home.start_button', 'ミキシング開始', 'home'),
('ja', 'form.mix_button', 'ミックス', 'form'),
('ja', 'results.title', 'あなたのレシピ', 'results'),
('ja', 'auth.login', 'ログイン', 'auth'),
('ja', 'general.loading', '読み込み中...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- KOREJSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ko', 'nav.menu', '메뉴', 'navigation'),
('ko', 'nav.login', '로그인', 'navigation'),
('ko', 'nav.logout', '로그아웃', 'navigation'),
('ko', 'nav.my_recipes', '내 레시피', 'navigation'),
('ko', 'home.title', 'LIQUIMIXER', 'home'),
('ko', 'home.subtitle', '전자담배 액상 계산기', 'home'),
('ko', 'home.start_button', '믹싱 시작', 'home'),
('ko', 'form.mix_button', '믹스', 'form'),
('ko', 'results.title', '당신의 레시피', 'results'),
('ko', 'auth.login', '로그인', 'auth'),
('ko', 'general.loading', '로딩 중...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ARABSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ar-SA', 'nav.menu', 'القائمة', 'navigation'),
('ar-SA', 'nav.login', 'تسجيل الدخول', 'navigation'),
('ar-SA', 'nav.logout', 'تسجيل الخروج', 'navigation'),
('ar-SA', 'nav.my_recipes', 'وصفاتي', 'navigation'),
('ar-SA', 'home.title', 'LIQUIMIXER', 'home'),
('ar-SA', 'home.subtitle', 'حاسبة السائل الإلكتروني', 'home'),
('ar-SA', 'home.start_button', 'ابدأ الخلط', 'home'),
('ar-SA', 'form.mix_button', 'امزج', 'form'),
('ar-SA', 'results.title', 'وصفتك', 'results'),
('ar-SA', 'auth.login', 'تسجيل الدخول', 'auth'),
('ar-SA', 'general.loading', 'جار التحميل...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- TURECKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('tr', 'nav.menu', 'Menü', 'navigation'),
('tr', 'nav.login', 'Giriş', 'navigation'),
('tr', 'nav.logout', 'Çıkış', 'navigation'),
('tr', 'nav.my_recipes', 'Tariflerim', 'navigation'),
('tr', 'home.title', 'LIQUIMIXER', 'home'),
('tr', 'home.subtitle', 'E-LİKİT HESAPLAYICI', 'home'),
('tr', 'home.start_button', 'KARIŞIMA BAŞLA', 'home'),
('tr', 'form.mix_button', 'KARIŞTIR', 'form'),
('tr', 'results.title', 'Tarifiniz', 'results'),
('tr', 'auth.login', 'Giriş', 'auth'),
('tr', 'general.loading', 'Yükleniyor...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- UKRAJINSKÉ PŘEKLADY
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('uk', 'nav.menu', 'Меню', 'navigation'),
('uk', 'nav.login', 'Увійти', 'navigation'),
('uk', 'nav.logout', 'Вийти', 'navigation'),
('uk', 'nav.my_recipes', 'Мої рецепти', 'navigation'),
('uk', 'home.title', 'LIQUIMIXER', 'home'),
('uk', 'home.subtitle', 'КАЛЬКУЛЯТОР E-РІДИНИ', 'home'),
('uk', 'home.start_button', 'ПОЧАТИ ЗМІШУВАННЯ', 'home'),
('uk', 'form.mix_button', 'ЗМІШАТИ', 'form'),
('uk', 'results.title', 'Ваш рецепт', 'results'),
('uk', 'auth.login', 'Увійти', 'auth'),
('uk', 'general.loading', 'Завантаження...', 'general')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- AKTUALIZACE CENÍKU PRO RŮZNÉ MĚNY
-- ============================================

DELETE FROM pricing WHERE true;

INSERT INTO pricing (plan_type, name, description, price, vat_rate, currency, duration_days, locale, is_active) VALUES
-- CZK
('yearly', 'Roční předplatné', 'Přístup ke všem funkcím LiquiMixer na 1 rok', 299.00, 21, 'CZK', 365, 'cs', true),
('yearly', 'Ročné predplatné', 'Prístup ku všetkým funkciám LiquiMixer na 1 rok', 299.00, 20, 'CZK', 365, 'sk', true),

-- EUR
('yearly', 'Annual subscription', 'Access to all LiquiMixer features for 1 year', 11.99, 21, 'EUR', 365, 'en', true),
('yearly', 'Jahresabonnement', 'Zugang zu allen LiquiMixer-Funktionen für 1 Jahr', 11.99, 19, 'EUR', 365, 'de', true),
('yearly', 'Subskrypcja roczna', 'Dostęp do wszystkich funkcji LiquiMixer na 1 rok', 49.99, 23, 'EUR', 365, 'pl', true),
('yearly', 'Abonnement annuel', 'Accès à toutes les fonctionnalités LiquiMixer pendant 1 an', 11.99, 20, 'EUR', 365, 'fr', true),
('yearly', 'Abbonamento annuale', 'Accesso a tutte le funzionalità LiquiMixer per 1 anno', 11.99, 22, 'EUR', 365, 'it', true),
('yearly', 'Suscripción anual', 'Acceso a todas las funciones de LiquiMixer durante 1 año', 11.99, 21, 'EUR', 365, 'es', true),
('yearly', 'Assinatura anual', 'Acesso a todas as funcionalidades LiquiMixer por 1 ano', 11.99, 23, 'EUR', 365, 'pt', true),
('yearly', 'Jaarabonnement', 'Toegang tot alle LiquiMixer-functies voor 1 jaar', 11.99, 21, 'EUR', 365, 'nl', true),

-- USD
('yearly', 'Annual subscription', 'Access to all LiquiMixer features for 1 year', 12.99, 0, 'USD', 365, 'ja', true),
('yearly', '연간 구독', '1년간 모든 LiquiMixer 기능 이용', 12.99, 0, 'USD', 365, 'ko', true),
('yearly', 'الاشتراك السنوي', 'الوصول إلى جميع ميزات LiquiMixer لمدة عام واحد', 12.99, 0, 'USD', 365, 'ar-SA', true),
('yearly', 'Yıllık abonelik', 'Tüm LiquiMixer özelliklerine 1 yıl erişim', 12.99, 0, 'USD', 365, 'tr', true);


