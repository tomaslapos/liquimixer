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
        const { data, error } = await window.supabase
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

// Načíst překlady pro daný jazyk
async function loadTranslations(locale) {
    try {
        const { data, error } = await window.supabase
            .from('translations')
            .select('key, value')
            .eq('locale', locale);
        
        if (error) throw error;
        
        // Převést na objekt
        translations = {};
        (data || []).forEach(item => {
            translations[item.key] = item.value;
        });
        
        // Pokud není dostatek překladů, načíst anglické jako fallback
        if (Object.keys(translations).length < 10 && locale !== 'en') {
            const { data: enData } = await window.supabase
                .from('translations')
                .select('key, value')
                .eq('locale', 'en');
            
            (enData || []).forEach(item => {
                if (!translations[item.key]) {
                    translations[item.key] = item.value;
                }
            });
        }
        
        console.log(`Loaded ${Object.keys(translations).length} translations for ${locale}`);
    } catch (err) {
        console.error('Error loading translations:', err);
        translations = {};
    }
}

// Získat překlad
function t(key, fallback = null) {
    return translations[key] || fallback || key;
}

// Změnit jazyk
async function setLocale(locale) {
    currentLocale = locale;
    localStorage.setItem('liquimixer_locale', locale);
    
    await loadTranslations(locale);
    applyTranslations();
    
    // Aktualizovat měnu v ceníku
    const localeData = localesData.find(l => l.code === locale);
    if (localeData) {
        window.currentCurrency = localeData.currency;
    }
    
    // Event pro ostatní komponenty
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
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
    applyTranslations: applyTranslations
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


