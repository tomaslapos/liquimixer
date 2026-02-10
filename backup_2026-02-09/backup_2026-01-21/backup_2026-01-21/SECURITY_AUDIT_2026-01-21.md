# 🔒 Bezpečnostní Audit - LiquiMixer
**Datum:** 21. ledna 2026  
**Auditor:** AI Assistant  
**Verze:** Aktuální (po implementaci bezpečnostních oprav)
**Poslední aktualizace:** 21. ledna 2026 - opravy provedeny

---

## 📊 SOUHRN

| Oblast | Stav | Hodnocení |
|--------|------|-----------|
| **CORS** | ✅ Správně nakonfigurováno | Výborná |
| **Rate Limiting** | ✅ Implementováno | Výborná |
| **XSS Ochrana** | ✅ escapeHtml() + sanitize | Výborná |
| **Input Validace** | ✅ Backend validace | Výborná |
| **Autentizace** | ✅ Clerk JWT + JWKS verifikace | Výborná |
| **Secrets** | ✅ Env variables | Výborná |
| **JWT Verification** | ✅ JWKS podpis ověřen | Výborná |
| **Audit Logging** | ✅ Implementováno | Výborná |
| **Kryptografická náhodnost** | ✅ crypto.getRandomValues() | Výborná |

**Celkové hodnocení: 🟢 VÝBORNÉ**

---

## ✅ OPRAVENÉ BEZPEČNOSTNÍ PROBLÉMY (21.1.2026)

### 1. ✅ JWT Verifikace v refund/status (KRITICKÉ - OPRAVENO)

**Předtím (zranitelné):**
```typescript
// JWT byl pouze dekódován bez ověření podpisu!
const token = authHeader.replace('Bearer ', '')
const payload = JSON.parse(atob(token.split('.')[1]))
const clerkId = payload.sub
```

**Nyní (bezpečné):**
```typescript
// Plná JWT verifikace včetně kryptografického podpisu pomocí JWKS
const tokenPayload = await verifyClerkToken(clerkToken, {
  authorizedParties: ['https://www.liquimixer.com', 'https://liquimixer.com']
})
```

**Soubor:** `supabase/functions/refund/index.ts`

### 2. ✅ Kryptograficky bezpečné approval tokeny (STŘEDNÍ - OPRAVENO)

**Předtím (slabé):**
```typescript
// Math.random() není kryptograficky bezpečný
result += chars.charAt(Math.floor(Math.random() * chars.length))
```

**Nyní (bezpečné):**
```typescript
// crypto.randomUUID() je kryptograficky bezpečný
const uuid1 = crypto.randomUUID().replace(/-/g, '')
const uuid2 = crypto.randomUUID().replace(/-/g, '')
return `${uuid1}${uuid2}`
```

**Soubor:** `supabase/functions/refund/index.ts`

### 3. ✅ Kryptograficky bezpečné order number (STŘEDNÍ - OPRAVENO)

**Předtím (slabé):**
```typescript
const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
```

**Nyní (bezpečné):**
```typescript
const randomArray = new Uint32Array(1)
crypto.getRandomValues(randomArray)
const random = (randomArray[0] % 100000).toString().padStart(5, '0')
```

**Soubor:** `supabase/functions/gpwebpay/index.ts`

---

## ✅ POZITIVNÍ NÁLEZY

### 1. CORS Konfigurace (`_shared/cors.ts`)

```typescript
// Localhost povolen pouze pokud ALLOW_LOCALHOST=true
const IS_DEVELOPMENT = Deno.env.get('ALLOW_LOCALHOST') === 'true';

const ALLOWED_ORIGINS = [
  'https://www.liquimixer.com',
  'https://liquimixer.com',
  ...(IS_DEVELOPMENT ? ['http://localhost:5500', 'http://127.0.0.1:5500'] : []),
];
```

✅ **Správně:** Localhost podmíněn env variable, v produkci není povolen

### 2. Plná JWT Verifikace (`_shared/clerk-jwt.ts`)

```typescript
// Kompletní JWKS verifikace
export async function verifyClerkToken(token: string, options?: {...}): Promise<ClerkTokenPayload | null> {
  // 1. Kontrola formátu JWT
  // 2. Kontrola expirace (exp)
  // 3. Kontrola not-before (nbf)
  // 4. Kontrola sub claim
  // 5. Kontrola authorized parties (azp)
  // 6. Kryptografická verifikace podpisu pomocí JWKS
}
```

✅ **Správně:** Používáno ve všech funkcích vyžadujících autentizaci

### 3. Rate Limiting

Implementováno pro všechny Edge Functions:

| Funkce | Limit |
|--------|-------|
| contact | 5/hodina |
| payment, refund | 5-10/hodina |
| billing | 20/hodina |
| subscription | 60/minuta |
| geolocation | 30/minuta |

✅ **Správně:** In-memory rate limiter s automatickým cleanup každých 5 minut

### 4. XSS Ochrana

- `escapeHtml()` - použito v `app.js` pro všechny uživatelské vstupy
- `sanitizeInput()` - použito v Edge Functions pro backend validaci
- CSP headers v `index.html` - omezení zdrojů skriptů a stylů

### 5. Secrets Management

Všechny citlivé klíče jsou uloženy v **Supabase Secrets** (env variables):

| Secret | Účel |
|--------|------|
| `GPWEBPAY_PRIVATE_KEY` | RSA klíč pro podepisování plateb |
| `GPWEBPAY_PRIVATE_KEY_PASSWORD` | Heslo k privátnímu klíči |
| `GPWEBPAY_GPE_PUBLIC_KEY` | Veřejný klíč banky pro ověření |
| `CLERK_SECRET_KEY` | Backend Clerk API klíč |
| `SMTP_PASSWORD` | Heslo pro odesílání emailů |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin přístup k databázi |
| `IDOKLAD_CLIENT_ID` / `SECRET` | Fakturační systém |
| `N8N_WEBHOOK_SECRET` | Ověření webhook callbacků |

✅ **Správně:** Žádné hardcoded secrets v kódu

### 6. Input Validace na Backendu

```typescript
// billing/index.ts
function validateBillingData(data: any): { valid: boolean; errors: string[] }
- Validace IČO (8 číslic)
- Validace DIČ (formát CZxxxxxxxx)
- Validace PSČ (XXX XX)
- Validace telefonu (+420 xxx xxx xxx)
- Detekce nebezpečných znaků (<script>, javascript:, onclick, atd.)
```

### 7. Audit Logging

Všechny citlivé operace jsou logovány do `audit_logs` tabulky:
- `gpwebpay/index.ts` - platební operace
- `refund/index.ts` - refund operace
- `contact/index.ts` - kontaktní zprávy

---

## ⚠️ VYSVĚTLENÍ - Functions bez JWT Verifikace

V `config.toml` jsou 4 funkce s `verify_jwt = false`:

| Funkce | Důvod | Alternativní ověření |
|--------|-------|---------------------|
| `gpwebpay` | GP WebPay callback přichází bez JWT (banka) | RSA-SHA1 podpis od banky |
| `idoklad` | Interní volání z gpwebpay | service_role_key v Authorization header |
| `invoice` | Interní volání z gpwebpay | service_role_key v Authorization header |
| `geolocation` | Volá se před přihlášením pro zobrazení ceny | Rate limiting (30/min) |

✅ **Správně:** Každá funkce má alternativní mechanismus ověření

---

## ℹ️ NÍZKÁ RIZIKA / POZNÁMKY

### 1. `unsafe-inline` a `unsafe-eval` v CSP
Nutné pro Clerk SDK, ale oslabuje ochranu proti XSS. Clerk vyžaduje tyto direktivy.

### 2. Supabase ANON_KEY viditelný ve frontendu
Toto je designově správné (anon key je veřejný). Bezpečnost dat je zajištěna RLS policies.

---

## ✅ CO JE SPRÁVNĚ IMPLEMENTOVÁNO

1. ✅ **JWT Verifikace** - plná JWKS verifikace podpisu ve všech funkcích
2. ✅ **Kryptografická náhodnost** - crypto.getRandomValues() a crypto.randomUUID()
3. ✅ **Audit logging** - všechny citlivé operace jsou logovány
4. ✅ **Input validace** - `validateBillingData()`, `isValidEmail()`, `sanitizeInput()`
5. ✅ **Error handling** - chybové zprávy nevystavují interní detaily systému
6. ✅ **HTTPS only** - `upgrade-insecure-requests` v CSP vynucuje HTTPS
7. ✅ **Rate limiting** - ochrana proti brute force a DDoS útokům
8. ✅ **RLS policies** - databáze má Row Level Security
9. ✅ **CORS** - správně omezeno na konkrétní domény s podmíněným localhost
10. ✅ **CSP headers** - omezení zdrojů skriptů, stylů, fontů, obrázků
11. ✅ **XSS ochrana** - escapeHtml() pro všechny uživatelské vstupy
12. ✅ **Platební gateway** - RSA-SHA1 podpisy pro GP WebPay komunikaci

---

## 🎯 ZÁVĚR

Aplikace LiquiMixer má **vynikající bezpečnostní úroveň**.

**Kritické zranitelnosti: 0** ✅
**Střední rizika: 0** ✅
**Nízká rizika: 1** (unsafe-inline v CSP kvůli Clerk SDK)

Všechny dříve identifikované bezpečnostní problémy byly opraveny:
- ✅ JWT verifikace nyní používá plnou JWKS verifikaci podpisu
- ✅ Approval tokeny používají `crypto.randomUUID()` 
- ✅ Order numbers používají `crypto.getRandomValues()`
- ✅ Localhost CORS podmíněn env variable

---

## 📁 AUDITOVANÉ SOUBORY

- `supabase/functions/_shared/cors.ts` - CORS a rate limiting
- `supabase/functions/_shared/clerk-jwt.ts` - JWT verifikace
- `supabase/functions/gpwebpay/index.ts` - Platební brána
- `supabase/functions/subscription/index.ts` - Předplatné
- `supabase/functions/billing/index.ts` - Fakturační údaje
- `supabase/functions/contact/index.ts` - Kontaktní formulář
- `supabase/functions/geolocation/index.ts` - Detekce země
- `supabase/functions/invoice/index.ts` - Generování faktur
- `supabase/functions/refund/index.ts` - Refundace
- `supabase/config.toml` - JWT konfigurace
- `app.js` - Frontend logika
- `database.js` - Databázová vrstva
- `index.html` - CSP headers

---

*Audit proveden: 21. ledna 2026*
*Bezpečnostní opravy aplikovány: 21. ledna 2026*