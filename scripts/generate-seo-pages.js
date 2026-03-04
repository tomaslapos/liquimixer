/**
 * SEO Pages Generator — generuje statické HTML stránky pro 150 příchutí × 31 jazyků
 * Spustit: node scripts/generate-seo-pages.js
 */

const fs = require('fs');
const path = require('path');

// === KONFIGURACE ===
const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const SEO_DIR = path.join(__dirname, '..', 'seo');
const SEO_FLAVORS_PATH = path.join(SEO_DIR, 'seo-flavors.js');
const DOMAIN = 'https://liquimixer.com';

const SUPPORTED_LOCALES = ['cs', 'sk', 'en', 'de', 'pl', 'fr', 'it', 'es', 'pt', 'nl', 'ja', 'ko', 'tr', 'uk', 'ru', 'sv', 'da', 'no', 'fi', 'el', 'ar-SA', 'zh-CN', 'zh-TW', 'hu', 'et', 'lv', 'lt', 'ro', 'hr', 'bg', 'sr'];

// Mapování locale → OG locale kód
const OG_LOCALE_MAP = {
    'cs': 'cs_CZ', 'sk': 'sk_SK', 'en': 'en_US', 'de': 'de_DE', 'pl': 'pl_PL',
    'fr': 'fr_FR', 'it': 'it_IT', 'es': 'es_ES', 'pt': 'pt_PT', 'nl': 'nl_NL',
    'ja': 'ja_JP', 'ko': 'ko_KR', 'tr': 'tr_TR', 'uk': 'uk_UA', 'ru': 'ru_RU',
    'sv': 'sv_SE', 'da': 'da_DK', 'no': 'nb_NO', 'fi': 'fi_FI', 'el': 'el_GR',
    'ar-SA': 'ar_SA', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW', 'hu': 'hu_HU',
    'et': 'et_EE', 'lv': 'lv_LV', 'lt': 'lt_LT', 'ro': 'ro_RO', 'hr': 'hr_HR',
    'bg': 'bg_BG', 'sr': 'sr_RS'
};

// HTML lang kód (bez regionu pro jednoduché kódy)
function htmlLang(locale) {
    return locale; // ar-SA, zh-CN, zh-TW zůstávají
}

// === NAČTENÍ SEO FLAVORS ===
function loadSeoFlavors() {
    const content = fs.readFileSync(SEO_FLAVORS_PATH, 'utf8');
    // Extrahovat JS objekt — eval v izolovaném kontextu
    const match = content.match(/window\.SEO_FLAVORS\s*=\s*(\{[\s\S]*\});/);
    if (!match) throw new Error('Nelze parsovat seo-flavors.js');
    // Bezpečnější: použít Function constructor
    const fn = new Function('return ' + match[1]);
    return fn();
}

// === NAČTENÍ PŘEKLADŮ ===
function loadLocaleTranslations(locale) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function t(translations, key, fallbackEn, fallback) {
    const keys = key.split('.');
    let val = translations;
    for (const k of keys) {
        if (val && typeof val === 'object' && k in val) val = val[k];
        else { val = undefined; break; }
    }
    if (typeof val === 'string') return val;
    // Fallback EN
    if (fallbackEn) {
        val = fallbackEn;
        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) val = val[k];
            else { val = undefined; break; }
        }
        if (typeof val === 'string') return val;
    }
    return fallback || key;
}

// === SEO TEXTY DLE KATEGORIE (specifické pro SEO stránky) ===
// Tyto texty se liší dle jazyka a jsou uloženy v seo-translations.json
const SEO_TRANSLATIONS_PATH = path.join(__dirname, 'seo-translations.json');

function loadSeoTranslations() {
    if (fs.existsSync(SEO_TRANSLATIONS_PATH)) {
        return JSON.parse(fs.readFileSync(SEO_TRANSLATIONS_PATH, 'utf8'));
    }
    return null;
}

// Fallback SEO texty generované z šablony
function getSeoTexts(locale, tr, enTr, flavor, slug) {
    const seoTr = loadSeoTranslations();
    const lang = locale.split('-')[0];
    const s = seoTr?.[locale] || seoTr?.[lang] || seoTr?.['en'] || {};

    const mfg = flavor.manufacturer_code;
    const name = flavor.name;
    const mfgName = flavor.manufacturer_name;
    const cat = flavor.category || 'fruit';

    // Přeložený název kategorie
    const catKey = `form.flavor_${cat}`;
    const catName = t(tr, catKey, enTr, cat);

    // Title pattern: "{MFG} {Name} — {titleQ} | LiquiMixer"
    const titleQ = s.title_question || t(tr, 'seo.title_question', enTr, 'How many percent for e-liquid?');
    const title = `${mfg} ${name} — ${titleQ} | LiquiMixer`;

    // Meta description
    const descTpl = s.meta_description || t(tr, 'seo.meta_description', enTr,
        'Correct percentage of {mfg} {name} flavor for mixing e-liquid. Recommended dosage and calculator for precise mixing.');
    const description = descTpl.replace(/\{mfg\}/g, mfg).replace(/\{name\}/g, name);

    // Flavor description text
    const flavorDescTpl = s.flavor_description || t(tr, 'seo.flavor_description', enTr,
        'Flavor <strong>{name}</strong> from <strong>{mfgName}</strong> is an excellent choice for mixing your own e-liquid. We will show you the correct dosage percentage — and our calculator will help you build the entire recipe step by step.');
    const flavorDesc = flavorDescTpl.replace(/\{name\}/g, name).replace(/\{mfgName\}/g, `${mfg} (${mfgName})`);

    const flavorDesc2Tpl = s.flavor_description2 || t(tr, 'seo.flavor_description2', enTr,
        'Since this is a vaping product, please read the <strong>disclaimer below</strong>. If you agree, we will show you everything you need: correct dosage, steeping time, recommended combinations and a complete calculator with pre-filled flavor.');
    const flavorDesc2 = flavorDesc2Tpl;

    // FAQ
    const faq1q = (s.faq_steep_q || 'How long does liquid with this flavor need to steep?');
    const faq1a = (s.faq_steep_a || 'Recommended steeping time is 3–7 days. Fruit flavors generally need shorter steeping than tobacco or dessert flavors.');
    const faq2q = (s.faq_combine_q || `What to combine ${mfg} ${name} with?`).replace(/\{mfg\}/g, mfg).replace(/\{name\}/g, name);
    const faq2a = (s.faq_combine_a || `${mfg} ${name} combines great with cream flavors for a fuller profile.`).replace(/\{mfg\}/g, mfg).replace(/\{name\}/g, name);

    // CTA
    const ctaButton = t(tr, 'intro.start_button', enTr, 'START MIXING');
    const ctaNote = s.cta_note || t(tr, 'seo.cta_note', enTr, 'Free. No registration. Flavor is pre-filled automatically.');

    // Disclaimer
    const disclaimerTitle = t(tr, 'intro.disclaimer_title', enTr, 'Disclaimer');
    const disclaimerText = t(tr, 'intro.disclaimer_text', enTr, '');

    // Hero
    const heroHeadline = t(tr, 'intro.hero_headline', enTr, '');
    const heroSubheadline = t(tr, 'intro.hero_subheadline', enTr, '');

    // Badges
    const badgeFlavors = t(tr, 'intro.badge_flavors', enTr, '5,000+ flavors with auto-%');
    const badgeCalc = t(tr, 'intro.badge_calculators', enTr, '9 calculators');
    const badgeLang = t(tr, 'intro.badge_languages', enTr, '31 languages');
    const badgeOffline = t(tr, 'intro.badge_offline', enTr, 'Offline');

    // Features
    const featDoseTitle = t(tr, 'intro.hero_feat_dosing_title', enTr, 'Precise dosing');
    const featDoseDesc = t(tr, 'intro.hero_feat_dosing_desc', enTr, '');
    const featAutoTitle = t(tr, 'intro.hero_feat_auto_title', enTr, '');
    const featAutoDesc = t(tr, 'intro.hero_feat_auto_desc', enTr, '');
    const featRecTitle = t(tr, 'intro.hero_feat_recipes_title', enTr, '');
    const featRecDesc = t(tr, 'intro.hero_feat_recipes_desc', enTr, '');
    const featShishaTitle = t(tr, 'intro.hero_feat_shisha_title', enTr, '');
    const featShishaDesc = t(tr, 'intro.hero_feat_shisha_desc', enTr, '');
    const featStockTitle = t(tr, 'intro.hero_feat_stock_title', enTr, '');
    const featStockDesc = t(tr, 'intro.hero_feat_stock_desc', enTr, '');

    // Savings — nahradit {commercial} a {diy} konkrétními cenami dle měny
    const PRICES = {
        'cs': { commercial: '120–350 Kč', diy: '25 Kč' },
        'sk': { commercial: '5–14 €', diy: '1 €' },
        'en': { commercial: '$5–14', diy: '$1' },
        'de': { commercial: '5–14 €', diy: '1 €' },
        'pl': { commercial: '20–60 zł', diy: '4 zł' },
        'fr': { commercial: '5–14 €', diy: '1 €' },
        'it': { commercial: '5–14 €', diy: '1 €' },
        'es': { commercial: '5–14 €', diy: '1 €' },
        'pt': { commercial: '5–14 €', diy: '1 €' },
        'nl': { commercial: '5–14 €', diy: '1 €' },
        'ja': { commercial: '¥750–2,100', diy: '¥150' },
        'ko': { commercial: '₩7,000–20,000', diy: '₩1,400' },
        'tr': { commercial: '150–450 ₺', diy: '30 ₺' },
        'uk': { commercial: '150–450 ₴', diy: '30 ₴' },
        'ru': { commercial: '500–1 400 ₽', diy: '100 ₽' },
        'sv': { commercial: '55–150 kr', diy: '10 kr' },
        'da': { commercial: '35–100 kr', diy: '7 kr' },
        'no': { commercial: '55–150 kr', diy: '10 kr' },
        'fi': { commercial: '5–14 €', diy: '1 €' },
        'el': { commercial: '5–14 €', diy: '1 €' },
        'ar-SA': { commercial: '19–53 ر.س', diy: '4 ر.س' },
        'zh-CN': { commercial: '¥35–100', diy: '¥7' },
        'zh-TW': { commercial: 'NT$160–440', diy: 'NT$30' },
        'hu': { commercial: '1 900–5 300 Ft', diy: '380 Ft' },
        'et': { commercial: '5–14 €', diy: '1 €' },
        'lv': { commercial: '5–14 €', diy: '1 €' },
        'lt': { commercial: '5–14 €', diy: '1 €' },
        'ro': { commercial: '25–70 lei', diy: '5 lei' },
        'hr': { commercial: '5–14 €', diy: '1 €' },
        'bg': { commercial: '10–28 лв', diy: '2 лв' },
        'sr': { commercial: '590–1 650 дин', diy: '120 дін' }
    };
    const prices = PRICES[locale] || PRICES['en'];
    const heroSavings = t(tr, 'intro.hero_savings', enTr, '')
        .replace(/\{commercial\}/g, prices.commercial)
        .replace(/\{diy\}/g, prices.diy);

    // Subtitle
    const subtitle = t(tr, 'intro.subtitle', enTr, 'E-LIQUID & SHISHA CALCULATOR');

    // FAQ section title
    const faqTitle = s.faq_title || t(tr, 'seo.faq_title', enTr, 'Frequently Asked Questions');

    return {
        title, description, catName, flavorDesc, flavorDesc2,
        faq1q, faq1a, faq2q, faq2a, faqTitle,
        ctaButton, ctaNote,
        disclaimerTitle, disclaimerText,
        heroHeadline, heroSubheadline,
        badgeFlavors, badgeCalc, badgeLang, badgeOffline,
        featDoseTitle, featDoseDesc, featAutoTitle, featAutoDesc,
        featRecTitle, featRecDesc, featShishaTitle, featShishaDesc,
        featStockTitle, featStockDesc,
        heroSavings, subtitle
    };
}

// === GENEROVÁNÍ HREFLANG TAGŮ ===
function generateHreflangTags(slug) {
    let tags = '';
    for (const loc of SUPPORTED_LOCALES) {
        tags += `    <link rel="alternate" hreflang="${loc}" href="${DOMAIN}/seo/${loc}/${slug}.html">\n`;
    }
    tags += `    <link rel="alternate" hreflang="x-default" href="${DOMAIN}/seo/en/${slug}.html">\n`;
    return tags;
}

// === HTML ŠABLONA ===
function generateHTML(locale, slug, flavor, seo) {
    const ogLocale = OG_LOCALE_MAP[locale] || 'en_US';
    const lang = htmlLang(locale);
    const url = `${DOMAIN}/seo/${locale}/${slug}.html`;
    const hreflangTags = generateHreflangTags(slug);
    const mfg = flavor.manufacturer_code;
    const name = flavor.name;
    const mfgName = flavor.manufacturer_name;

    // Escapovat pro JSON-LD
    const esc = (s) => s.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${DOMAIN}/icons/icon-512x512.png">
    <meta property="og:site_name" content="LiquiMixer">
    <meta property="og:locale" content="${ogLocale}">
${hreflangTags}    <link rel="canonical" href="${url}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "${esc(seo.title)}",
        "description": "${esc(seo.description)}",
        "step": [
            { "@type": "HowToStep", "name": "${esc(seo.faq1q)}", "text": "${esc(seo.faq1a)}" },
            { "@type": "HowToStep", "name": "${esc(seo.faq2q)}", "text": "${esc(seo.faq2a)}" }
        ],
        "tool": { "@type": "HowToTool", "name": "LiquiMixer" },
        "supply": [
            { "@type": "HowToSupply", "name": "${esc(mfg + ' ' + name)}" },
            { "@type": "HowToSupply", "name": "PG" },
            { "@type": "HowToSupply", "name": "VG" }
        ]
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "${esc(seo.faq1q)}", "acceptedAnswer": { "@type": "Answer", "text": "${esc(seo.faq1a)}" } },
            { "@type": "Question", "name": "${esc(seo.faq2q)}", "acceptedAnswer": { "@type": "Answer", "text": "${esc(seo.faq2a)}" } }
        ]
    }
    </script>
    <link rel="stylesheet" href="/seo/seo-page.css">
</head>
<body>
<div class="neon-grid"></div>
<div class="neon-clouds">
    <div class="cloud cloud-left-1"></div><div class="cloud cloud-left-2"></div><div class="cloud cloud-left-3"></div>
    <div class="cloud cloud-left-4"></div><div class="cloud cloud-left-5"></div><div class="cloud cloud-left-6"></div>
    <div class="cloud cloud-right-1"></div><div class="cloud cloud-right-2"></div><div class="cloud cloud-right-3"></div>
    <div class="cloud cloud-right-4"></div><div class="cloud cloud-right-5"></div><div class="cloud cloud-right-6"></div>
</div>
<div class="seo-container">
    <div class="logo-container">
        <h1 class="neon-title">
            <span class="letter l1">L</span><span class="letter l2">I</span><span class="letter l3">Q</span><span class="letter l4">U</span><span class="letter l5">I</span><span class="letter l6">M</span><span class="letter l7">I</span><span class="letter l8">X</span><span class="letter l9">E</span><span class="letter l10">R</span>
        </h1>
        <div class="subtitle">${seo.subtitle}</div>
    </div>
    <div class="flavor-box">
        <div class="flavor-manufacturer">${mfg} / ${mfgName}</div>
        <h2 class="flavor-name">${name}</h2>
        <span class="flavor-category">${seo.catName}</span>
        <div class="flavor-description">
            <p>${seo.flavorDesc}</p>
            <p style="margin-top:14px">${seo.flavorDesc2}</p>
        </div>
    </div>
    <div class="faq-section">
        <div class="faq-title">${seo.faqTitle}</div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="accordion-question">${seo.faq1q}</span>
                <span class="accordion-icon">▼</span>
            </div>
            <div class="accordion-body"><div class="accordion-answer">${seo.faq1a}</div></div>
        </div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="accordion-question">${seo.faq2q}</span>
                <span class="accordion-icon">▼</span>
            </div>
            <div class="accordion-body"><div class="accordion-answer">${seo.faq2a}</div></div>
        </div>
    </div>
    <div class="app-description-box">
        <p class="hero-headline">${seo.heroHeadline}</p>
        <p class="hero-subheadline">${seo.heroSubheadline}</p>
        <div class="hero-badges">
            <span class="hero-badge"><span class="badge-icon">🧪</span> ${seo.badgeFlavors}</span>
            <span class="hero-badge"><span class="badge-icon">💨</span> ${seo.badgeCalc}</span>
            <span class="hero-badge"><span class="badge-icon">🌍</span> ${seo.badgeLang}</span>
            <span class="hero-badge"><span class="badge-icon">📴</span> ${seo.badgeOffline}</span>
        </div>
        <div class="hero-features">
            <div class="hero-feature-item"><strong>${seo.featDoseTitle}</strong> — ${seo.featDoseDesc}</div>
            <div class="hero-feature-item"><strong>${seo.featAutoTitle}</strong> — ${seo.featAutoDesc}</div>
            <div class="hero-feature-item"><strong>${seo.featRecTitle}</strong> — ${seo.featRecDesc}</div>
            <div class="hero-feature-item"><strong>${seo.featShishaTitle}</strong> — ${seo.featShishaDesc}</div>
            <div class="hero-feature-item"><strong>${seo.featStockTitle}</strong> — ${seo.featStockDesc}</div>
        </div>
        <p class="hero-savings">${seo.heroSavings}</p>
    </div>
    <div class="disclaimer-section">
        <h3 class="disclaimer-title">${seo.disclaimerTitle}</h3>
        <p class="disclaimer-text">${seo.disclaimerText}</p>
    </div>
    <div class="cta-container">
        <a href="/index.html?seo_flavor=${slug}" class="neon-button">
            <span>${seo.ctaButton}</span>
            <div class="button-glow"></div>
        </a>
        <p class="cta-note">${seo.ctaNote}</p>
    </div>
    <div class="seo-footer">
        <a href="/index.html">LiquiMixer — ${seo.subtitle}</a>
        <p>&copy; 2025–2026 LiquiMixer.</p>
    </div>
</div>
</body>
</html>
`;
}

// === MAIN ===
function main() {
    console.log('=== SEO Pages Generator ===\n');

    // Načíst flavors
    const flavors = loadSeoFlavors();
    const slugs = Object.keys(flavors);
    console.log(`Načteno ${slugs.length} příchutí z seo-flavors.js`);

    // Načíst EN překlady jako fallback
    const enTr = loadLocaleTranslations('en');
    if (!enTr) throw new Error('Chybí locales/en.json');

    let totalFiles = 0;
    let errors = 0;

    for (const locale of SUPPORTED_LOCALES) {
        const tr = loadLocaleTranslations(locale) || enTr;
        const localeDir = path.join(SEO_DIR, locale);

        // Vytvořit adresář
        if (!fs.existsSync(localeDir)) {
            fs.mkdirSync(localeDir, { recursive: true });
        }

        for (const slug of slugs) {
            const flavor = flavors[slug];
            try {
                const seo = getSeoTexts(locale, tr, enTr, flavor, slug);
                const html = generateHTML(locale, slug, flavor, seo);
                const filePath = path.join(localeDir, `${slug}.html`);
                fs.writeFileSync(filePath, html, 'utf8');
                totalFiles++;
            } catch (err) {
                console.error(`CHYBA: ${locale}/${slug}: ${err.message}`);
                errors++;
            }
        }
        console.log(`  ${locale}: ${slugs.length} stránek vygenerováno`);
    }

    console.log(`\n=== HOTOVO ===`);
    console.log(`Celkem: ${totalFiles} souborů (${SUPPORTED_LOCALES.length} jazyků × ${slugs.length} příchutí)`);
    if (errors > 0) console.log(`Chyby: ${errors}`);
}

main();
