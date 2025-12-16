// ============================================
// INTERNATIONALIZATION (i18n) MODULE
// Vícejazyčná podpora pro LiquiMixer
// ============================================

// Aktuální jazyk
let currentLocale = 'cs';
let translations = {};
let localesData = [];

// Detekce jazyka prohlížeče
function detectBrowserLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Mapování jazyků na podporované lokalizace
    const localeMap = {
        'cs': 'cs',
        'sk': 'sk',
        'pl': 'pl',
        'de': 'de',
        'en': 'en',
        'fr': 'fr',
        'it': 'it',
        'es': 'es',
        'pt': 'pt',
        'nl': 'nl',
        'da': 'da',
        'no': 'no',
        'sv': 'sv',
        'fi': 'fi',
        'et': 'et',
        'lv': 'lv',
        'lt': 'lt',
        'uk': 'uk',
        'ro': 'ro',
        'bg': 'bg',
        'sr': 'sr',
        'hr': 'hr',
        'sl': 'sl',
        'el': 'el',
        'sq': 'sq',
        'tr': 'tr',
        'ar': 'ar-SA',
        'ja': 'ja',
        'ko': 'ko',
        'fil': 'fil'
    };
    
    return localeMap[langCode] || 'en';
}

// Inicializace i18n
async function initI18n() {
    // Zkusit načíst uložený jazyk
    const savedLocale = localStorage.getItem('liquimixer_locale');
    
    if (savedLocale) {
        currentLocale = savedLocale;
    } else {
        currentLocale = detectBrowserLocale();
    }
    
    // Načíst dostupné lokalizace
    await loadLocales();
    
    // Načíst překlady pro aktuální jazyk
    await loadTranslations(currentLocale);
    
    // Aplikovat překlady na stránku
    applyTranslations();
    
    console.log('i18n initialized with locale:', currentLocale);
}

// Načíst seznam lokalizací
async function loadLocales() {
    try {
        // Použít supabaseClient z database.js
        const client = window.supabaseClient;
        if (!client) {
            console.warn('Supabase client not initialized yet');
            return;
        }
        
        const { data, error } = await client
            .from('locales')
            .select('*')
            .eq('is_active', true)
            .order('name');
        
        if (error) throw error;
        localesData = data || [];
    } catch (err) {
        console.error('Error loading locales:', err);
        localesData = [];
    }
}

// Validace a sanitizace překladů pro bezpečnost
function validateAndSanitizeTranslations(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        console.error('Invalid translations format: expected object');
        return {};
    }
    
    const sanitized = {};
    const validKeyPattern = /^[a-z][a-z0-9_.]*$/i;
    
    for (const [key, value] of Object.entries(data)) {
        // Validace klíče - pouze povolené znaky
        if (!validKeyPattern.test(key)) {
            console.warn(`Invalid translation key skipped: ${key}`);
            continue;
        }
        
        // Validace hodnoty - pouze string
        if (typeof value !== 'string') {
            console.warn(`Invalid translation value for key ${key}: expected string`);
            continue;
        }
        
        // Sanitizace - odstranění potenciálně nebezpečných znaků
        // (textContent už escapuje, ale extra vrstva ochrany)
        const sanitizedValue = value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
        
        // Omezení délky hodnoty
        if (sanitizedValue.length > 1000) {
            console.warn(`Translation value too long for key ${key}`);
            sanitized[key] = sanitizedValue.substring(0, 1000);
        } else {
            sanitized[key] = sanitizedValue;
        }
    }
    
    return sanitized;
}

// Načíst překlady pro daný jazyk z lokálních JSON souborů
async function loadTranslations(locale) {
    try {
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
        const fileLocale = localeFileMap[locale] || locale;
        
        if (!safeLocalePattern.test(fileLocale)) {
            console.error(`Invalid locale format: ${locale}`);
            translations = {};
            return;
        }
        
        // Načíst z lokálního JSON souboru
        const response = await fetch(`./locales/${fileLocale}.json`);
        
        if (response.ok) {
            const rawData = await response.json();
            translations = validateAndSanitizeTranslations(rawData);
            console.log(`Loaded ${Object.keys(translations).length} translations for ${locale} from local file`);
        } else {
            // Fallback na angličtinu
            console.warn(`Locale file not found for ${locale}, falling back to English`);
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const rawData = await enResponse.json();
                translations = validateAndSanitizeTranslations(rawData);
            } else {
                translations = {};
            }
        }
        
        // Pokud není dostatek překladů, doplnit z angličtiny
        if (Object.keys(translations).length < 10 && locale !== 'en') {
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const rawData = await enResponse.json();
                const enTranslations = validateAndSanitizeTranslations(rawData);
                Object.keys(enTranslations).forEach(key => {
                    if (!translations[key]) {
                        translations[key] = enTranslations[key];
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
                const rawData = await enResponse.json();
                translations = validateAndSanitizeTranslations(rawData);
            } else {
                translations = {};
            }
        } catch {
            translations = {};
        }
    }
}

// Získat překlad
function t(key, fallback = null) {
    return translations[key] || fallback || key;
}

// Změnit jazyk
async function setLocale(locale, saveToDb = true) {
    currentLocale = locale;
    localStorage.setItem('liquimixer_locale', locale);
    
    await loadTranslations(locale);
    applyTranslations();
    
    // Aktualizovat měnu v ceníku
    const localeData = localesData.find(l => l.code === locale);
    if (localeData) {
        window.currentCurrency = localeData.currency;
    }
    
    // Uložit do databáze pokud je uživatel přihlášen a není zakázáno
    if (saveToDb && window.Clerk?.user?.id && window.LiquiMixerDB?.saveUserLocale) {
        try {
            await window.LiquiMixerDB.saveUserLocale(window.Clerk.user.id, locale);
        } catch (err) {
            console.error('Error saving locale to database:', err);
        }
    }
    
    // Event pro ostatní komponenty
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
}

// Načíst jazyk uživatele z databáze
async function loadUserLocale(clerkId) {
    if (!clerkId || !window.LiquiMixerDB?.getUserLocale) return null;
    
    try {
        const locale = await window.LiquiMixerDB.getUserLocale(clerkId);
        if (locale) {
            console.log('Loaded user locale from database:', locale);
            // Nastavit jazyk bez opětovného ukládání do DB
            await setLocale(locale, false);
            return locale;
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
            el.textContent = translation;
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
    if (!container || localesData.length === 0) return;
    
    let html = '<select id="languageSelect" class="neon-select language-select" onchange="setLocale(this.value)">';
    
    localesData.forEach(locale => {
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

// Automatická inicializace po načtení Supabase
window.addEventListener('load', async () => {
    // Počkat na inicializaci Supabase
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    await initI18n();
});



