-- ============================================
-- MIGRACE: Přidání country_code do pricing tabulky
-- Datum: 2026-01-26
-- Účel: Správné mapování cen podle země (ne jazyka)
-- OSS režim: Do 10.000 EUR používáme české DPH 21% pro všechny EU země
-- ============================================

-- 1. Přidat sloupec country_code pokud neexistuje
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- 2. Vytvořit index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_pricing_country_code ON pricing(country_code);

-- 3. Smazat existující záznamy (budeme je nahrazovat novými s country_code)
-- POZOR: Toto smaže všechny existující záznamy!
DELETE FROM pricing WHERE plan_type = 'yearly';

-- ============================================
-- 4. VLOŽIT VŠECHNY ZEMĚ SVĚTA
-- ============================================

-- 4.1 ČESKÁ REPUBLIKA - 59 CZK včetně 21% DPH
-- price = 48.76 (bez DPH), total = 48.76 * 1.21 = 59 CZK
INSERT INTO pricing (country_code, locale, plan_type, price, vat_rate, currency, is_active, name, description, duration_days)
VALUES ('CZ', 'cs', 'yearly', 48.76, 21, 'CZK', true, 'Roční předplatné LiquiMixer PRO', 'Přístup ke všem funkcím na 365 dní', 365);

-- 4.2 EU ZEMĚ (26 zemí kromě CZ) - 2.40 EUR včetně 21% DPH (OSS režim)
-- price = 1.98 (bez DPH), total = 1.98 * 1.21 = 2.40 EUR
INSERT INTO pricing (country_code, locale, plan_type, price, vat_rate, currency, is_active, name, description, duration_days) VALUES
('AT', 'de', 'yearly', 1.98, 21, 'EUR', true, 'Jahresabonnement LiquiMixer PRO', 'Zugang zu allen Funktionen für 365 Tage', 365),
('BE', 'nl', 'yearly', 1.98, 21, 'EUR', true, 'Jaarabonnement LiquiMixer PRO', 'Toegang tot alle functies voor 365 dagen', 365),
('BG', 'bg', 'yearly', 1.98, 21, 'EUR', true, 'Годишен абонамент LiquiMixer PRO', 'Достъп до всички функции за 365 дни', 365),
('CY', 'el', 'yearly', 1.98, 21, 'EUR', true, 'Ετήσια συνδρομή LiquiMixer PRO', 'Πρόσβαση σε όλες τις λειτουργίες για 365 ημέρες', 365),
('DE', 'de', 'yearly', 1.98, 21, 'EUR', true, 'Jahresabonnement LiquiMixer PRO', 'Zugang zu allen Funktionen für 365 Tage', 365),
('DK', 'da', 'yearly', 1.98, 21, 'EUR', true, 'Årsabonnement LiquiMixer PRO', 'Adgang til alle funktioner i 365 dage', 365),
('EE', 'et', 'yearly', 1.98, 21, 'EUR', true, 'Aastane tellimus LiquiMixer PRO', 'Juurdepääs kõigile funktsioonidele 365 päevaks', 365),
('ES', 'es', 'yearly', 1.98, 21, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('FI', 'fi', 'yearly', 1.98, 21, 'EUR', true, 'Vuositilaus LiquiMixer PRO', 'Pääsy kaikkiin toimintoihin 365 päiväksi', 365),
('FR', 'fr', 'yearly', 1.98, 21, 'EUR', true, 'Abonnement annuel LiquiMixer PRO', 'Accès à toutes les fonctionnalités pendant 365 jours', 365),
('GR', 'el', 'yearly', 1.98, 21, 'EUR', true, 'Ετήσια συνδρομή LiquiMixer PRO', 'Πρόσβαση σε όλες τις λειτουργίες για 365 ημέρες', 365),
('HR', 'hr', 'yearly', 1.98, 21, 'EUR', true, 'Godišnja pretplata LiquiMixer PRO', 'Pristup svim funkcijama 365 dana', 365),
('HU', 'hu', 'yearly', 1.98, 21, 'EUR', true, 'Éves előfizetés LiquiMixer PRO', 'Hozzáférés az összes funkcióhoz 365 napig', 365),
('IE', 'en', 'yearly', 1.98, 21, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('IT', 'it', 'yearly', 1.98, 21, 'EUR', true, 'Abbonamento annuale LiquiMixer PRO', 'Accesso a tutte le funzionalità per 365 giorni', 365),
('LT', 'lt', 'yearly', 1.98, 21, 'EUR', true, 'Metinė prenumerata LiquiMixer PRO', 'Prieiga prie visų funkcijų 365 dienas', 365),
('LU', 'de', 'yearly', 1.98, 21, 'EUR', true, 'Jahresabonnement LiquiMixer PRO', 'Zugang zu allen Funktionen für 365 Tage', 365),
('LV', 'lv', 'yearly', 1.98, 21, 'EUR', true, 'Gada abonements LiquiMixer PRO', 'Piekļuve visām funkcijām 365 dienas', 365),
('MT', 'en', 'yearly', 1.98, 21, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('NL', 'nl', 'yearly', 1.98, 21, 'EUR', true, 'Jaarabonnement LiquiMixer PRO', 'Toegang tot alle functies voor 365 dagen', 365),
('PL', 'pl', 'yearly', 1.98, 21, 'EUR', true, 'Roczna subskrypcja LiquiMixer PRO', 'Dostęp do wszystkich funkcji przez 365 dni', 365),
('PT', 'pt', 'yearly', 1.98, 21, 'EUR', true, 'Assinatura anual LiquiMixer PRO', 'Acesso a todas as funcionalidades durante 365 dias', 365),
('RO', 'ro', 'yearly', 1.98, 21, 'EUR', true, 'Abonament anual LiquiMixer PRO', 'Acces la toate funcțiile timp de 365 de zile', 365),
('SE', 'sv', 'yearly', 1.98, 21, 'EUR', true, 'Årsprenumeration LiquiMixer PRO', 'Tillgång till alla funktioner i 365 dagar', 365),
('SI', 'en', 'yearly', 1.98, 21, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('SK', 'sk', 'yearly', 1.98, 21, 'EUR', true, 'Ročné predplatné LiquiMixer PRO', 'Prístup ku všetkým funkciám na 365 dní', 365);

-- 4.3 USD ZEMĚ - 2.90 USD, 0% DPH (mimo EU)
-- price = 2.90 (bez DPH = s DPH, protože 0%)
INSERT INTO pricing (country_code, locale, plan_type, price, vat_rate, currency, is_active, name, description, duration_days) VALUES
-- Severní Amerika
('US', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('CA', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('MX', 'es', 'yearly', 2.90, 0, 'USD', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
-- Asie a Pacifik
('JP', 'ja', 'yearly', 2.90, 0, 'USD', true, '年間サブスクリプション LiquiMixer PRO', '365日間すべての機能にアクセス', 365),
('KR', 'ko', 'yearly', 2.90, 0, 'USD', true, '연간 구독 LiquiMixer PRO', '365일 동안 모든 기능 이용', 365),
('CN', 'zh-CN', 'yearly', 2.90, 0, 'USD', true, '年度订阅 LiquiMixer PRO', '365天访问所有功能', 365),
('TW', 'zh-TW', 'yearly', 2.90, 0, 'USD', true, '年度訂閱 LiquiMixer PRO', '365天存取所有功能', 365),
('HK', 'zh-TW', 'yearly', 2.90, 0, 'USD', true, '年度訂閱 LiquiMixer PRO', '365天存取所有功能', 365),
('SG', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('AU', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('NZ', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('IN', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('PH', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('TH', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('VN', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('MY', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('ID', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
-- Blízký východ
('SA', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('AE', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('KW', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('QA', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('BH', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('OM', 'ar-SA', 'yearly', 2.90, 0, 'USD', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('IL', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
-- USA teritoria
('PR', 'es', 'yearly', 2.90, 0, 'USD', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('VI', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('GU', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('AS', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('MP', 'en', 'yearly', 2.90, 0, 'USD', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365);

-- 4.4 OSTATNÍ ZEMĚ - 2.40 EUR, 0% DPH (mimo EU)
-- price = 2.40 (bez DPH = s DPH, protože 0%)
INSERT INTO pricing (country_code, locale, plan_type, price, vat_rate, currency, is_active, name, description, duration_days) VALUES
-- Evropa (mimo EU)
('GB', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('CH', 'de', 'yearly', 2.40, 0, 'EUR', true, 'Jahresabonnement LiquiMixer PRO', 'Zugang zu allen Funktionen für 365 Tage', 365),
('NO', 'no', 'yearly', 2.40, 0, 'EUR', true, 'Årsabonnement LiquiMixer PRO', 'Tilgang til alle funksjoner i 365 dager', 365),
('IS', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('UA', 'uk', 'yearly', 2.40, 0, 'EUR', true, 'Річна підписка LiquiMixer PRO', 'Доступ до всіх функцій на 365 днів', 365),
('BY', 'ru', 'yearly', 2.40, 0, 'EUR', true, 'Годовая подписка LiquiMixer PRO', 'Доступ ко всем функциям на 365 дней', 365),
('MD', 'ro', 'yearly', 2.40, 0, 'EUR', true, 'Abonament anual LiquiMixer PRO', 'Acces la toate funcțiile timp de 365 de zile', 365),
('RS', 'sr', 'yearly', 2.40, 0, 'EUR', true, 'Годишња претплата LiquiMixer PRO', 'Приступ свим функцијама 365 дана', 365),
('BA', 'hr', 'yearly', 2.40, 0, 'EUR', true, 'Godišnja pretplata LiquiMixer PRO', 'Pristup svim funkcijama 365 dana', 365),
('ME', 'sr', 'yearly', 2.40, 0, 'EUR', true, 'Годишња претплата LiquiMixer PRO', 'Приступ свим функцијама 365 дана', 365),
('MK', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('AL', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('XK', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('TR', 'tr', 'yearly', 2.40, 0, 'EUR', true, 'Yıllık abonelik LiquiMixer PRO', '365 gün tüm özelliklere erişim', 365),
('RU', 'ru', 'yearly', 2.40, 0, 'EUR', true, 'Годовая подписка LiquiMixer PRO', 'Доступ ко всем функциям на 365 дней', 365),
-- Afrika
('ZA', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('EG', 'ar-SA', 'yearly', 2.40, 0, 'EUR', true, 'اشتراك سنوي LiquiMixer PRO', 'الوصول إلى جميع الميزات لمدة 365 يومًا', 365),
('MA', 'fr', 'yearly', 2.40, 0, 'EUR', true, 'Abonnement annuel LiquiMixer PRO', 'Accès à toutes les fonctionnalités pendant 365 jours', 365),
('TN', 'fr', 'yearly', 2.40, 0, 'EUR', true, 'Abonnement annuel LiquiMixer PRO', 'Accès à toutes les fonctionnalités pendant 365 jours', 365),
('DZ', 'fr', 'yearly', 2.40, 0, 'EUR', true, 'Abonnement annuel LiquiMixer PRO', 'Accès à toutes les fonctionnalités pendant 365 jours', 365),
('NG', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('KE', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('GH', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
-- Jižní Amerika
('BR', 'pt', 'yearly', 2.40, 0, 'EUR', true, 'Assinatura anual LiquiMixer PRO', 'Acesso a todas as funcionalidades durante 365 dias', 365),
('AR', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('CL', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('CO', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('PE', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('VE', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('EC', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('UY', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('PY', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('BO', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
-- Střední Amerika a Karibik
('PA', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('CR', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('GT', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('HN', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('SV', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('NI', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('CU', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('DO', 'es', 'yearly', 2.40, 0, 'EUR', true, 'Suscripción anual LiquiMixer PRO', 'Acceso a todas las funciones durante 365 días', 365),
('JM', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
-- Asie (ostatní)
('PK', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('BD', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('LK', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('NP', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('MM', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('KH', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('LA', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('MN', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('KZ', 'ru', 'yearly', 2.40, 0, 'EUR', true, 'Годовая подписка LiquiMixer PRO', 'Доступ ко всем функциям на 365 дней', 365),
('UZ', 'ru', 'yearly', 2.40, 0, 'EUR', true, 'Годовая подписка LiquiMixer PRO', 'Доступ ко всем функциям на 365 дней', 365),
('GE', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('AM', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('AZ', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
-- Oceánie (ostatní)
('FJ', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365),
('PG', 'en', 'yearly', 2.40, 0, 'EUR', true, 'Annual subscription LiquiMixer PRO', 'Access to all features for 365 days', 365);

-- 5. Vytvořit unikátní constraint pro country_code + plan_type
-- (Každá země může mít pouze jeden záznam pro daný plan_type)
-- ALTER TABLE pricing ADD CONSTRAINT unique_country_plan UNIQUE (country_code, plan_type);

-- ============================================
-- POZNÁMKA: Pro neznámé země použít fallback v kódu:
-- EUR, 2.40, 0% DPH
-- ============================================
