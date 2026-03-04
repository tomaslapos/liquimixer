/**
 * SEO Sitemap Generator — generuje sitemap-seo.xml pro 150 příchutí × 31 jazyků
 * Spustit: node scripts/generate-seo-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const SEO_DIR = path.join(__dirname, '..', 'seo');
const SEO_FLAVORS_PATH = path.join(SEO_DIR, 'seo-flavors.js');
const OUTPUT_PATH = path.join(__dirname, '..', 'sitemap-seo.xml');
const DOMAIN = 'https://www.liquimixer.com';

const SUPPORTED_LOCALES = ['cs', 'sk', 'en', 'de', 'pl', 'fr', 'it', 'es', 'pt', 'nl', 'ja', 'ko', 'tr', 'uk', 'ru', 'sv', 'da', 'no', 'fi', 'el', 'ar-SA', 'zh-CN', 'zh-TW', 'hu', 'et', 'lv', 'lt', 'ro', 'hr', 'bg', 'sr'];

function loadSeoFlavors() {
    const content = fs.readFileSync(SEO_FLAVORS_PATH, 'utf8');
    const match = content.match(/window\.SEO_FLAVORS\s*=\s*(\{[\s\S]*\});/);
    if (!match) throw new Error('Nelze parsovat seo-flavors.js');
    const fn = new Function('return ' + match[1]);
    return fn();
}

function main() {
    console.log('=== SEO Sitemap Generator ===\n');

    const flavors = loadSeoFlavors();
    const slugs = Object.keys(flavors);
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

    let urlCount = 0;

    for (const slug of slugs) {
        for (const locale of SUPPORTED_LOCALES) {
            const url = `${DOMAIN}/seo/${locale}/${slug}.html`;

            xml += `    <url>\n`;
            xml += `        <loc>${url}</loc>\n`;
            xml += `        <lastmod>${today}</lastmod>\n`;
            xml += `        <changefreq>monthly</changefreq>\n`;
            xml += `        <priority>0.7</priority>\n`;

            // Hreflang pro všechny jazykové verze této příchutě
            for (const altLocale of SUPPORTED_LOCALES) {
                xml += `        <xhtml:link rel="alternate" hreflang="${altLocale}" href="${DOMAIN}/seo/${altLocale}/${slug}.html"/>\n`;
            }
            xml += `        <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/seo/en/${slug}.html"/>\n`;

            xml += `    </url>\n`;
            urlCount++;
        }
    }

    xml += `\n</urlset>\n`;

    fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

    const sizeMB = (Buffer.byteLength(xml, 'utf8') / 1024 / 1024).toFixed(2);
    console.log(`Vygenerováno: ${OUTPUT_PATH}`);
    console.log(`URL: ${urlCount} (${slugs.length} příchutí × ${SUPPORTED_LOCALES.length} jazyků)`);
    console.log(`Velikost: ${sizeMB} MB`);
}

main();
