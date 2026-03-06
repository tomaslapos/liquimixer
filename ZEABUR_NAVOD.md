# Zeabur — Nastavení pro 1 milion uživatelů

## Cílový trh (dle Business Plánu 2026)

**Globální trh: 200M+ uživatelů (vaping + hookah), TAM 28M → 43M (2030)**

Klíčové regiony:
- **Turecko** — 15M+ hookah uživatelů
- **Arabské země** — kulturní tradice, desítky milionů
- **Rusko** — hookah bary, velká vaping komunita
- **Německo, Francie, Polsko** — západní a střední Evropa
- **Indie** — rostoucí trend, obrovská populace
- **31 jazyků** — pokrytí 25+ trhů bez konkurence

## Aktuální stav

LiquiMixer je **statický web + PWA** hostovaná na Zeaburu (Caddy server).
Zeabur servíruje HTML/CSS/JS soubory + 4650 SEO stránek (150 příchutí × 31 jazyků).
Veškerá logika běží jinde:

| Služba | Co dělá | Kde běží |
|--------|---------|----------|
| **Zeabur** | Statický hosting (web + PWA + SEO stránky) | Caddy server |
| **Supabase** | Databáze + Edge funkce (platby, subscription, calc-log) | Supabase Cloud (AWS) |
| **Clerk** | Autentizace (login, registrace, Apple Sign In) | Clerk Cloud |
| **Firebase** | Push notifikace (FCM) | Google Cloud |
| **N8N** | Workflow automatizace (emaily, AI support v 31 jazycích) | N8N Cloud |

---

## ⚠️ DŮLEŽITÉ: Shared clustery končí 1. dubna 2026

Zeabur ruší shared clustery. Nové služby na shared clusterech nelze vytvářet.
**Existující služby poběží dál**, ale je doporučeno přejít na Dedicated Server.

---

## Kolik výkonu potřebujeme?

### Výpočet pro 1M uživatelů

**Předpoklady:**
- 1M registrovaných uživatelů
- ~5% DAU (denně aktivních) = 50 000 uživatelů/den
- Špička: 10 000 současně online
- Průměrná session: 3-5 stránek, 2-3 kalkulace

**Co Zeabur servíruje (statický hosting):**
- `index.html` (297 KB) — jen při prvním načtení
- `app.js` (889 KB) — jen při prvním načtení
- `styles.css` (187 KB) — jen při prvním načtení
- `database.js` (120 KB) — jen při prvním načtení
- Celkem: ~1.5 MB na prvního návštěvníka (před kompresí)
- Po Brotli kompresi: ~400 KB
- **Service Worker cachuje vše** → opakované návštěvy = 0 requestů na Zeabur

**Denní traffic (pesimistický odhad):**
- 50 000 DAU × 30% bez cache (nový SW) = 15 000 requestů na statické soubory
- 15 000 × 400 KB = 6 GB/den = 180 GB/měsíc egress

**Realistický odhad (SW cache):**
- 90%+ uživatelů má soubory v cache → pouze ~5 000 requestů/den
- ~2 GB/den = 60 GB/měsíc egress

### Závěr: Potřebný výkon

Pro statický hosting LiquiMixeru stačí **minimální server**:
- **1 vCPU** — Caddy je extrémně efektivní
- **1 GB RAM** — více než dost pro statické soubory
- **Region: Frankfurt** (nejblíže k CZ/SK uživatelům)

---

## Doporučené nastavení Zeabur

### ✅ DOPORUČENÍ: Hetzner Falkenstein — 2 vCPU / 4 GB / $6/měsíc

**Dostupné servery (Zeabur × Hetzner, Europe):**

| Lokace | CPU | RAM | Disk | Egress | Cena |
|--------|-----|-----|------|--------|------|
| **Falkenstein, DE** | **2 vCPU** | **4 GB** | **80 GB** | **20 TB** | **$6/měsíc** ✅ |
| Helsinki, FI | 2 vCPU | 4 GB | 80 GB | 20 TB | $6/měsíc |
| Nuremberg, DE | 2 vCPU | 4 GB | 80 GB | 20 TB | $6/měsíc |
| Falkenstein, DE | 4 vCPU | 8 GB | 160 GB | 20 TB | $10/měsíc |
| Nuremberg, DE | 4 vCPU | 8 GB | 160 GB | 20 TB | $10/měsíc |
| Falkenstein, DE | 8 vCPU | 16 GB | 320 GB | 20 TB | $19/měsíc |
| Falkenstein, DE | 12 vCPU | 24 GB | 480 GB | 20 TB | $28/měsíc |
| Falkenstein, DE | 16 vCPU | 32 GB | 640 GB | 20 TB | $38/měsíc |

**Proč Falkenstein 2 vCPU / 4 GB:**
- **Falkenstein je nejblíže Praze** (~250 km) — nejnižší latence pro CZ/SK uživatele
- **Caddy na 2 vCPU** obslouží 10 000+ současných spojení bez problému
- **4 GB RAM** — 10× více než potřebujeme pro statický web
- **20 TB egress** — i při worst case 1M × 1.5 MB = 1.5 TB máme 13× rezervu
- **$6/měsíc** — nejlevnější varianta, upgrade na 4 vCPU/$10 kdykoliv jedním klikem

**Proč NE větší server:**
- LiquiMixer je statický web + PWA → Caddy servíruje soubory z disku
- Žádná databáze, žádný backend, žádná serverová logika na Zeaburu
- 90%+ uživatelů má soubory v Service Worker cache → minimální zátěž serveru
- Větší server = zbytečné vyhozené peníze

### Jak nastavit (krok za krokem)

1. Přihlásit se na https://zeabur.com
2. Kliknout na **Servers** v levém menu
3. Kliknout na **Buy New Server** (nebo zeabur.com/new)
4. Vybrat **Hetzner** ($5+)
5. Region: **Europe**
6. Vybrat **Falkenstein, Germany — 2 vCPU, 4 GB RAM, 80 GB, $6/mo**
7. Potvrdit nákup (platba z Zeabur balance nebo kartou)
8. Počkat ~1-2 minuty na provisioning
9. Jít do **Projects** → otevřít projekt LiquiMixer
10. V nastavení projektu přepnout **Server** na nový Hetzner dedicated server
11. Zeabur automaticky přemigruje službu

### Kdyby nestačilo (upgrade cesta)

Pokud traffic výrazně vzroste:
- **Krok 1:** $6/měsíc → $10/měsíc (4 vCPU, 8 GB) — jedním klikem
- **Krok 2:** Přidat Cloudflare CDN zdarma (viz níže) — sníží zátěž o 80%+
- **Krok 3:** $10/měsíc → $19/měsíc (8 vCPU, 16 GB) — pouze pokud Cloudflare nestačí

---

## Optimalizace provedené v zeabur.json

Soubor `zeabur.json` je optimalizovaný pro minimální traffic:

| Typ souboru | Cache doba | Strategie |
|-------------|-----------|-----------|
| HTML | 1 hodina + stale-while-revalidate 1 den | Rychlá aktualizace, bez čekání |
| JS | 7 dní + stale-while-revalidate 1 den | SW aktualizace vynutí refresh |
| CSS | 30 dní + immutable | Bez ověřování, šetří requesty |
| Obrázky/ikony | 1 rok + immutable | Nikdy se nemění |
| SEO stránky | 30 dní + stale-while-revalidate 7 dní | Dlouhodobý cache pro crawlery |
| Service Worker | no-cache | Vždy čerstvý (řídí aktualizace) |
| manifest.json | 1 den | PWA manifest |

### stale-while-revalidate

Uživatel dostane **okamžitě** cached verzi. Na pozadí se stáhne aktualizace.
Při dalším načtení už má novou verzi. Žádné čekání = lepší UX.

### immutable

Prohlížeč nikdy neověřuje platnost cache. Soubor se stáhne jednou a pak se bere z cache.
Šetří tisíce zbytečných HTTP requestů denně.

---

## Kontrolní seznam — Je Zeabur připravený na 1M uživatelů?

- [x] **zeabur.json** — optimalizované cache headers
- [x] **Service Worker** — offline-first, cachuje vše lokálně
- [x] **Brotli/Gzip** — Caddy komprimuje automaticky
- [x] **HTTP/2** — Caddy podporuje automaticky
- [x] **Security headers** — HSTS, X-Frame-Options, CSP
- [ ] **Dedicated Server** — přejít ze shared clusteru na Hetzner Frankfurt
- [ ] **CDN** — Zeabur nemá vlastní CDN, zvážit Cloudflare před Zeabur

---

## Volitelné: Cloudflare CDN před Zeabur

Pro maximální výkon a globální pokrytí:

1. Přidat doménu `liquimixer.com` do Cloudflare (Free plan stačí)
2. Nastavit DNS záznamy → Zeabur server
3. Zapnout **Caching** + **Brotli** + **Auto Minify**
4. Nastavit **Page Rules** pro cache

**Výhody:**
- CDN s 300+ edge servery po celém světě
- DDoS ochrana zdarma
- Další vrstva cache → méně requestů na Zeabur
- **Cena: $0 (Free plan)**

---

## Shrnutí doporučení

| Priorita | Akce | Cena |
|----------|------|------|
| **Vysoká** | Přejít na Dedicated Server (Hetzner Frankfurt) | ~$5-7/měsíc |
| **Střední** | Přidat Cloudflare CDN | $0 |
| **Nízká** | Upgrade na větší server (pokud traffic roste) | $10-15/měsíc |

**Pro 1M uživatelů s PWA + Service Worker stačí minimální server.**
Bottleneck nebude Zeabur, ale Supabase (databáze) a Clerk (autentizace).
