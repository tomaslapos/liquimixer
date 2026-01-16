# 🔍 Návod pro registraci LiquiMixer do vyhledávačů

Tento dokument obsahuje kompletní návod pro registraci webu www.liquimixer.com do hlavních vyhledávačů a AI systémů pro maximální organický dosah.

---

## 📋 Checklist před registrací

- [x] robots.txt vytvořen a povoluje všechny crawlery
- [x] sitemap.xml vytvořen se všemi jazykovými verzemi  
- [x] llms.txt vytvořen pro AI systémy
- [x] Schema.org JSON-LD strukturovaná data
- [x] Open Graph meta tagy
- [x] Twitter Card meta tagy
- [ ] **OG obrázek exportován do PNG** (viz sekce níže)
- [ ] Web nasazen a dostupný na https://www.liquimixer.com

---

## 🖼️ Export OG obrázku do PNG

SVG obrázek `icons/og-image.svg` je potřeba exportovat do PNG formátu 1200×630px:

### Možnost 1: Online konvertor
1. Otevřete https://cloudconvert.com/svg-to-png
2. Nahrajte `icons/og-image.svg`
3. Nastavte rozměry: 1200×630px
4. Stáhněte a uložte jako `icons/og-image.png`

### Možnost 2: Inkscape (zdarma)
```bash
inkscape icons/og-image.svg --export-png=icons/og-image.png --export-width=1200 --export-height=630
```

### Možnost 3: ImageMagick
```bash
convert -background none -density 150 icons/og-image.svg -resize 1200x630 icons/og-image.png
```

---

## 🔷 Google Search Console

### Registrace
1. Přejděte na https://search.google.com/search-console
2. Přihlaste se Google účtem
3. Klikněte "Přidat vlastnictví"
4. Vyberte "Doména" a zadejte: `liquimixer.com`
5. Ověřte vlastnictví pomocí DNS záznamu (doporučeno) nebo HTML souboru

### Po ověření
1. Přejděte do **Indexování → Soubory Sitemap**
2. Přidejte: `https://www.liquimixer.com/sitemap.xml`
3. Klikněte "Odeslat"

### Požádat o indexování
1. Přejděte na **Kontrola adresy URL**
2. Zadejte `https://www.liquimixer.com/`
3. Klikněte "Požádat o indexování"

### Důležité sekce ke sledování
- **Výkon**: Sledujte klíčová slova a CTR
- **Pokrytí**: Kontrolujte chyby indexování
- **Vylepšení**: Rich snippets, Core Web Vitals, mobilní použitelnost

---

## 🔶 Bing Webmaster Tools

### Registrace
1. Přejděte na https://www.bing.com/webmasters
2. Přihlaste se Microsoft účtem
3. Klikněte "Přidat web"
4. Zadejte: `https://www.liquimixer.com`

### Import z Google (nejrychlejší)
1. Vyberte "Import z Google Search Console"
2. Autorizujte přístup
3. Vyberte `liquimixer.com`
4. Hotovo!

### Manuální registrace
1. Ověřte vlastnictví (DNS/HTML/meta tag)
2. Po ověření přidejte sitemap: `https://www.liquimixer.com/sitemap.xml`

### Microsoft Copilot / Bing AI
- Bing Webmaster Tools automaticky zpřístupní váš web pro Copilot
- robots.txt již povoluje `Copilot` user-agent

---

## 🦆 DuckDuckGo

DuckDuckGo nemá vlastní webmaster nástroje. Indexace probíhá automaticky přes:
- Bing (primární zdroj)
- Apple (Applebot)

**Akce**: Registrace v Bing Webmaster Tools zajistí indexaci v DuckDuckGo.

---

## 🟡 Yandex Webmaster (Rusko, východní Evropa)

### Registrace
1. Přejděte na https://webmaster.yandex.com
2. Přihlaste se Yandex účtem (nutné vytvořit)
3. Přidejte web: `https://www.liquimixer.com`
4. Ověřte vlastnictví
5. Přidejte sitemap v sekci "Indexování → Soubory Sitemap"

---

## 🔴 Baidu (Čína)

Pro čínský trh (zh-CN, zh-TW verze):

### Registrace
1. Přejděte na https://ziyuan.baidu.com
2. Vytvořte Baidu účet (vyžaduje čínské telefonní číslo nebo ICP licenci)
3. Přidejte web a ověřte

**Poznámka**: Baidu vyžaduje hosting v Číně nebo ICP licenci pro plnou indexaci. Pro základní indexaci stačí správně nastavený robots.txt.

---

## 🤖 AI Systémy - Speciální registrace

### OpenAI / ChatGPT
- **Automaticky**: GPTBot je povolen v robots.txt
- **Volitelně**: Přihlaste se do OpenAI Plugin Store (pokud chcete vytvořit plugin)
- Web: https://platform.openai.com

### Anthropic / Claude  
- **Automaticky**: Claude-Web je povolen v robots.txt
- Žádná speciální registrace není potřeba
- llms.txt poskytuje kontext pro citace

### Perplexity AI
- **Automaticky**: PerplexityBot je povolen v robots.txt
- Pro rychlejší indexaci: https://www.perplexity.ai/submit (pokud dostupné)

### Google Gemini / Bard
- **Automaticky**: Google-Extended je povolen v robots.txt
- Registrace v Google Search Console zajišťuje indexaci

---

## 📱 Další platformy

### Apple App Store Connect (PWA)
Pro lepší viditelnost v Safari a Siri:
1. https://developer.apple.com
2. Zaregistrujte web jako "Web App"
3. Applebot je povolen v robots.txt

### Microsoft Store (PWA)
1. https://partner.microsoft.com/dashboard
2. Publikujte PWA jako aplikaci pro Windows
3. Zvýší viditelnost v Microsoft ekosystému

---

## 📊 Monitoring a Analytics

### Doporučené nástroje (privacy-friendly)

1. **Plausible Analytics** (placené, GDPR compliant)
   - https://plausible.io
   - Jednoduchý skript, žádné cookies

2. **Umami** (open-source, self-hosted)
   - https://umami.is
   - Zdarma, můžete hostovat sami

3. **Google Analytics 4** (zdarma, ale cookies)
   - https://analytics.google.com
   - Vyžaduje cookie consent

### SEO monitoring

1. **Google Search Console** - zdarma, základní
2. **Ahrefs** - placené, kompletní SEO
3. **SEMrush** - placené, kompetitivní analýza
4. **Ubersuggest** - freemium, keyword research

---

## 🎯 Klíčová slova pro sledování

### Primární (CZ)
- e-liquid kalkulátor
- kalkulátor e-liquidů
- míchání e-liquidů
- DIY vape kalkulátor
- nikotin kalkulátor

### Sekundární (CZ)
- jak míchat e-liquid
- PG VG poměr
- výpočet nikotinu
- vape recept
- levné vapování

### Long-tail (CZ)
- jak zředit 72mg nikotin na 3mg
- kolik procent příchutě do e-liquidu
- nejlepší poměr PG VG pro chuť
- kalkulátor nikotinu zdarma online

### Anglické (globální)
- e-liquid calculator
- DIY vape calculator
- nicotine calculator
- PG VG calculator
- vape recipe maker

---

## 📅 Časová osa indexace

| Vyhledávač | Očekávaná doba indexace |
|------------|------------------------|
| Google | 1-7 dní po odeslání sitemap |
| Bing | 1-14 dní |
| DuckDuckGo | 7-21 dní (přes Bing) |
| Yandex | 7-14 dní |
| AI systémy | 1-4 týdny |

---

## ✅ Po registraci - Pravidelná údržba

### Týdně
- [ ] Kontrola Google Search Console chyb
- [ ] Sledování pozic klíčových slov

### Měsíčně  
- [ ] Aktualizace sitemap.xml (lastmod)
- [ ] Kontrola Core Web Vitals
- [ ] Analýza nových klíčových slov

### Čtvrtletně
- [ ] Aktualizace llms.txt s novými funkcemi
- [ ] Rozšíření FAQ v Schema.org
- [ ] Revize meta description pro lepší CTR

---

## 🔗 Užitečné odkazy

- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Yandex Webmaster: https://webmaster.yandex.com
- Rich Results Test: https://search.google.com/test/rich-results
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev

---

*Dokument vytvořen: 5. ledna 2026*
*Pro: LiquiMixer (www.liquimixer.com)*

