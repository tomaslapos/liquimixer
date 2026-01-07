// ============================================
// INTERNATIONALIZATION (i18n) MODULE
// Vícejazyčná podpora pro LiquiMixer
// ============================================

// Aktuální jazyk
let currentLocale = 'en';
let translations = {};
let localesData = [];

// Podporované jazyky (pro které máme překlady)
const SUPPORTED_LOCALES = ['cs', 'sk', 'en', 'de', 'pl', 'fr', 'it', 'es', 'pt', 'nl', 'ja', 'ko', 'tr', 'uk', 'ru', 'sv', 'da', 'no', 'fi', 'el', 'ar-SA', 'zh-CN', 'zh-TW', 'hu', 'et', 'lv', 'lt', 'ro', 'hr', 'bg', 'sr'];

// Detekce jazyka prohlížeče
function detectBrowserLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Vrátit jazyk pouze pokud je podporovaný, jinak angličtinu
    if (SUPPORTED_LOCALES.includes(langCode)) {
        return langCode;
    }
    
    return 'en'; // Fallback na angličtinu
}

// Inicializace i18n
async function initI18n() {
    // Priorita při inicializaci (před přihlášením):
    // 1. Jazyk prohlížeče (pokud podporovaný)
    // 2. Angličtina jako fallback
    // Po přihlášení se načte uložený jazyk uživatele z databáze
    
    currentLocale = detectBrowserLocale();
    
    // Načíst dostupné lokalizace
    await loadLocales();
    
    // Načíst překlady pro aktuální jazyk
    await loadTranslations(currentLocale);
    
    // Aplikovat překlady na stránku
    applyTranslations();
    
    // Vytvořit výběr jazyka v profilu uživatele
    createLanguageSelector('profileLanguageSelector');
    
    console.log('i18n initialized with locale:', currentLocale);
}

// Načíst seznam lokalizací
async function loadLocales() {
    try {
        // Statický seznam podporovaných lokalizací
        localesData = [
            { code: 'cs', name: 'Czech', native_name: 'Čeština', currency: 'CZK', currency_symbol: 'Kč', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'sk', name: 'Slovak', native_name: 'Slovenčina', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'en', name: 'English', native_name: 'English', currency: 'USD', currency_symbol: '$', date_format: 'MM/DD/YYYY', is_active: true },
            { code: 'de', name: 'German', native_name: 'Deutsch', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'pl', name: 'Polish', native_name: 'Polski', currency: 'PLN', currency_symbol: 'zł', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'fr', name: 'French', native_name: 'Français', currency: 'EUR', currency_symbol: '€', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'it', name: 'Italian', native_name: 'Italiano', currency: 'EUR', currency_symbol: '€', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'es', name: 'Spanish', native_name: 'Español', currency: 'EUR', currency_symbol: '€', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'pt', name: 'Portuguese', native_name: 'Português', currency: 'EUR', currency_symbol: '€', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'nl', name: 'Dutch', native_name: 'Nederlands', currency: 'EUR', currency_symbol: '€', date_format: 'DD-MM-YYYY', is_active: true },
            { code: 'ja', name: 'Japanese', native_name: '日本語', currency: 'JPY', currency_symbol: '¥', date_format: 'YYYY/MM/DD', is_active: true },
            { code: 'ko', name: 'Korean', native_name: '한국어', currency: 'KRW', currency_symbol: '₩', date_format: 'YYYY.MM.DD', is_active: true },
            { code: 'tr', name: 'Turkish', native_name: 'Türkçe', currency: 'TRY', currency_symbol: '₺', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'uk', name: 'Ukrainian', native_name: 'Українська', currency: 'UAH', currency_symbol: '₴', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'ru', name: 'Russian', native_name: 'Русский', currency: 'RUB', currency_symbol: '₽', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'sv', name: 'Swedish', native_name: 'Svenska', currency: 'SEK', currency_symbol: 'kr', date_format: 'YYYY-MM-DD', is_active: true },
            { code: 'da', name: 'Danish', native_name: 'Dansk', currency: 'DKK', currency_symbol: 'kr', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'no', name: 'Norwegian', native_name: 'Norsk', currency: 'NOK', currency_symbol: 'kr', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'fi', name: 'Finnish', native_name: 'Suomi', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'el', name: 'Greek', native_name: 'Ελληνικά', currency: 'EUR', currency_symbol: '€', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'ar-SA', name: 'Arabic', native_name: 'العربية', currency: 'SAR', currency_symbol: 'ر.س', date_format: 'DD/MM/YYYY', is_active: true },
            { code: 'zh-CN', name: 'Chinese (Simplified)', native_name: '简体中文', currency: 'CNY', currency_symbol: '¥', date_format: 'YYYY-MM-DD', is_active: true },
            { code: 'zh-TW', name: 'Chinese (Traditional)', native_name: '繁體中文', currency: 'TWD', currency_symbol: 'NT$', date_format: 'YYYY/MM/DD', is_active: true },
            { code: 'hu', name: 'Hungarian', native_name: 'Magyar', currency: 'HUF', currency_symbol: 'Ft', date_format: 'YYYY.MM.DD', is_active: true },
            { code: 'et', name: 'Estonian', native_name: 'Eesti', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'lv', name: 'Latvian', native_name: 'Latviešu', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'lt', name: 'Lithuanian', native_name: 'Lietuvių', currency: 'EUR', currency_symbol: '€', date_format: 'YYYY-MM-DD', is_active: true },
            { code: 'ro', name: 'Romanian', native_name: 'Română', currency: 'RON', currency_symbol: 'lei', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'hr', name: 'Croatian', native_name: 'Hrvatski', currency: 'EUR', currency_symbol: '€', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'bg', name: 'Bulgarian', native_name: 'Български', currency: 'BGN', currency_symbol: 'лв', date_format: 'DD.MM.YYYY', is_active: true },
            { code: 'sr', name: 'Serbian', native_name: 'Српски', currency: 'RSD', currency_symbol: 'дин', date_format: 'DD.MM.YYYY', is_active: true }
        ];
    } catch (err) {
        console.error('Error loading locales:', err);
        localesData = [];
    }
}

// Mapování locale na soubor (pro regionální varianty)
const localeFileMap = {
    'ar-SA': 'ar-SA',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en-GB': 'en',
    'en-AU': 'en',
    'en-CA': 'en',
    'en-NZ': 'en',
    'de-AT': 'de',
    'fr-BE': 'fr',
    'nl-BE': 'nl',
    'fr-CA': 'fr',
    'es-MX': 'es',
    'es-AR': 'es',
    'pt-BR': 'pt'
};

// Validace locale - pouze povolené znaky (ochrana proti path traversal)
const safeLocalePattern = /^[a-z]{2}(-[A-Z]{2})?$/;

// Načíst překlady pro daný jazyk z lokálních JSON souborů
async function loadTranslations(locale) {
    try {
        // Mapování locale na soubor
        const fileLocale = localeFileMap[locale] || locale;
        
        // Validace locale formátu
        if (!safeLocalePattern.test(fileLocale)) {
            console.error(`Invalid locale format: ${locale}`);
            translations = {};
            return;
        }
        
        // Načíst z lokálního JSON souboru
        const response = await fetch(`./locales/${fileLocale}.json`);
        
        if (response.ok) {
            const data = await response.json();
            translations = data || {};
            console.log(`Loaded ${Object.keys(translations).length} translations for ${locale} from local file`);
        } else {
            // Fallback na angličtinu
            console.warn(`Locale file not found for ${locale}, falling back to English`);
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const enData = await enResponse.json();
                translations = enData || {};
            } else {
                translations = {};
            }
        }
        
        // Pokud není dostatek překladů, doplnit z angličtiny
        if (Object.keys(translations).length < 10 && locale !== 'en') {
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const enData = await enResponse.json();
                Object.keys(enData).forEach(key => {
                    if (!translations[key]) {
                        translations[key] = enData[key];
                    }
                });
            }
        }
    } catch (err) {
        console.error('Error loading translations:', err);
        // Fallback - zkusit načíst angličtinu
        try {
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const enData = await enResponse.json();
                translations = enData || {};
            } else {
                translations = {};
            }
        } catch {
            translations = {};
        }
    }
}

// Získat překlad - používá vnořenou strukturu s tečkovou notací (např. "intro.subtitle")
// Všechny lokalizační soubory musí mít vnořenou strukturu (ne flat)
function t(key, fallback = null) {
    if (!key) return fallback || '';
    
    // Podpora tečkové notace pro vnořené klíče
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return fallback || key;
        }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
}

// Změnit jazyk
async function setLocale(locale, saveToDb = true) {
    // Validovat, že jazyk je podporovaný
    if (!SUPPORTED_LOCALES.includes(locale)) {
        console.warn(`Locale ${locale} not supported, falling back to English`);
        locale = 'en';
    }
    
    currentLocale = locale;
    
    await loadTranslations(locale);
    applyTranslations();
    
    // Aktualizovat výběr jazyka v profilu
    updateLanguageSelectorValue(locale);
    
    // Aktualizovat měnu v ceníku
    const localeData = localesData.find(l => l.code === locale);
    if (localeData) {
        window.currentCurrency = localeData.currency;
    }
    
    // Uložit do databáze pokud je uživatel přihlášen a není zakázáno
    if (saveToDb && window.Clerk?.user?.id && window.LiquiMixerDB?.saveUserLocale) {
        try {
            await window.LiquiMixerDB.saveUserLocale(window.Clerk.user.id, locale);
            console.log('User locale saved to database:', locale);
        } catch (err) {
            console.error('Error saving locale to database:', err);
        }
    }
    
    // Event pro ostatní komponenty
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
}

// Aktualizovat hodnotu v selectu jazyka
function updateLanguageSelectorValue(locale) {
    const selector = document.getElementById('languageSelect');
    if (selector) {
        selector.value = locale;
    }
}

// Načíst jazyk uživatele z databáze (volá se po přihlášení)
async function loadUserLocale(clerkId) {
    if (!clerkId || !window.LiquiMixerDB?.getUserLocale) return null;
    
    try {
        const userLocale = await window.LiquiMixerDB.getUserLocale(clerkId);
        if (userLocale && SUPPORTED_LOCALES.includes(userLocale)) {
            console.log('Loaded user locale from database:', userLocale);
            // Nastavit jazyk bez opětovného ukládání do DB
            await setLocale(userLocale, false);
            return userLocale;
        }
    } catch (err) {
        console.error('Error loading user locale:', err);
    }
    return null;
}

// Získat aktuální jazyk
function getLocale() {
    return currentLocale;
}

// Získat všechny dostupné lokalizace
function getAvailableLocales() {
    return localesData;
}

// Získat data aktuální lokalizace
function getCurrentLocaleData() {
    return localesData.find(l => l.code === currentLocale) || {
        code: 'cs',
        currency: 'CZK',
        currency_symbol: 'Kč',
        date_format: 'DD.MM.YYYY'
    };
}

// Aplikovat překlady na stránku
function applyTranslations() {
    // Přeložit všechny elementy s atributem data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            // Podporovat HTML v překladu
            if (translation.includes('<') && translation.includes('>')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    
    // Přeložit atributy (např. title, aria-label)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // Přeložit aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', t(key));
    });
    
    // Aktualizovat lang atribut na <html> elementu
    document.documentElement.lang = currentLocale.split('-')[0];
    
    // Přeanimovat texty tlačítek mode-select (po změně jazyka)
    if (typeof window.animateModeButtons === 'function') {
        setTimeout(window.animateModeButtons, 100);
    }
}

// Formátovat datum podle lokalizace
function formatDate(date, locale = currentLocale) {
    const d = new Date(date);
    const localeData = localesData.find(l => l.code === locale);
    
    if (!localeData) {
        return d.toLocaleDateString('cs-CZ');
    }
    
    // Mapování locale kódů na JS locale
    const jsLocaleMap = {
        'cs': 'cs-CZ',
        'sk': 'sk-SK',
        'pl': 'pl-PL',
        'de': 'de-DE',
        'en': 'en-GB',
        'fr': 'fr-FR',
        'it': 'it-IT',
        'es': 'es-ES',
        'pt': 'pt-PT',
        'nl': 'nl-NL',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'ar-SA': 'ar-SA',
        'tr': 'tr-TR',
        'uk': 'uk-UA'
    };
    
    return d.toLocaleDateString(jsLocaleMap[locale] || 'en-GB');
}

// Formátovat měnu
function formatCurrency(amount, currency = null) {
    const curr = currency || getCurrentLocaleData().currency;
    
    const localeMap = {
        'CZK': 'cs-CZ',
        'EUR': 'de-DE',
        'USD': 'en-US'
    };
    
    return new Intl.NumberFormat(localeMap[curr] || 'en-US', {
        style: 'currency',
        currency: curr
    }).format(amount);
}

// Vytvořit výběr jazyků
function createLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Všechny podporované jazyky seřazené abecedně podle native_name
    const availableLanguages = [
        { code: 'ar-SA', native_name: 'العربية' },
        { code: 'bg', native_name: 'Български' },
        { code: 'cs', native_name: 'Čeština' },
        { code: 'da', native_name: 'Dansk' },
        { code: 'de', native_name: 'Deutsch' },
        { code: 'el', native_name: 'Ελληνικά' },
        { code: 'en', native_name: 'English' },
        { code: 'es', native_name: 'Español' },
        { code: 'et', native_name: 'Eesti' },
        { code: 'fi', native_name: 'Suomi' },
        { code: 'fr', native_name: 'Français' },
        { code: 'hr', native_name: 'Hrvatski' },
        { code: 'hu', native_name: 'Magyar' },
        { code: 'it', native_name: 'Italiano' },
        { code: 'ja', native_name: '日本語' },
        { code: 'ko', native_name: '한국어' },
        { code: 'lt', native_name: 'Lietuvių' },
        { code: 'lv', native_name: 'Latviešu' },
        { code: 'nl', native_name: 'Nederlands' },
        { code: 'no', native_name: 'Norsk' },
        { code: 'pl', native_name: 'Polski' },
        { code: 'pt', native_name: 'Português' },
        { code: 'ro', native_name: 'Română' },
        { code: 'ru', native_name: 'Русский' },
        { code: 'sk', native_name: 'Slovenčina' },
        { code: 'sr', native_name: 'Српски' },
        { code: 'sv', native_name: 'Svenska' },
        { code: 'tr', native_name: 'Türkçe' },
        { code: 'uk', native_name: 'Українська' },
        { code: 'zh-CN', native_name: '简体中文' },
        { code: 'zh-TW', native_name: '繁體中文' }
    ];
    
    let html = '<select id="languageSelect" class="neon-select language-select" onchange="window.i18n.setLocale(this.value)">';
    
    availableLanguages.forEach(locale => {
        const selected = locale.code === currentLocale ? 'selected' : '';
        html += `<option value="${locale.code}" ${selected}>${locale.native_name}</option>`;
    });
    
    html += '</select>';
    container.innerHTML = html;
}

// ============================================
// EXPORT
// ============================================

window.i18n = {
    init: initI18n,
    t: t,
    setLocale: setLocale,
    getLocale: getLocale,
    getAvailableLocales: getAvailableLocales,
    getCurrentLocaleData: getCurrentLocaleData,
    formatDate: formatDate,
    formatCurrency: formatCurrency,
    createLanguageSelector: createLanguageSelector,
    applyTranslations: applyTranslations,
    loadUserLocale: loadUserLocale
};

// Automatická inicializace po načtení stránky
window.addEventListener('load', async () => {
    await initI18n();
});



