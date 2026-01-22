# 🔒 Bezpečnostní audit - LiquiMixer
**Datum:** 8. ledna 2026  
**Auditor:** AI Assistant  
**Verze aplikace:** Aktuální (commit eff01bb)

---

## 📊 SOUHRN

| Oblast | Stav | Hodnocení |
|--------|------|-----------|
| XSS ochrana | ✅ Implementována | Dobrá |
| SQL Injection | ✅ Bezpečné (Supabase) | Výborná |
| CSRF | ✅ JWT tokeny | Dobrá |
| Autentizace | ✅ Clerk.js | Výborná |
| HTTP Headers | ✅ Nastaveny | Dobrá |
| CORS | ⚠️ Volné (*) | K přezkoumání |
| API klíče | ⚠️ Firebase veřejný | Očekávané |
| RLS (Row Level Security) | ✅ Implementováno | Výborná |

**Celkové hodnocení: 🟢 DOBRÉ** (s doporučeními)

---

## ✅ POZITIVNÍ NÁLEZY

### 1. XSS Ochrana (Cross-Site Scripting)

**Implementováno správně:**

```javascript
// app.js řádky 12-21
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
```

**Použití v kódu:**
- ✅ Uživatelská jména: `escapeHtml(user.fullName)`
- ✅ Emaily: `escapeHtml(user.emailAddresses)`
- ✅ Názvy receptů: `escapeHtml(recipe.name)`
- ✅ Popisy: `escapeHtml(recipe.description)`
- ✅ Produkty: `escapeHtml(product.id)`, `escapeHtml(product.name)`
- ✅ URL: `sanitizeUrl(product.product_url)`

**Nalezeno 29 použití `escapeHtml()` v app.js** - konzistentní použití.

### 2. URL Sanitizace

```javascript
// app.js řádky 24-32
function sanitizeUrl(url) {
    if (!url) return '';
    const safe = String(url).trim();
    // Povolit pouze http, https, mailto
    if (/^(https?:|mailto:)/i.test(safe)) {
        return encodeURI(safe);
    }
    return '';
}
```

**Chrání před:** `javascript:` URLs, `data:` URLs, a dalšími nebezpečnými protokoly.

### 3. UUID Validace

```javascript
// app.js řádky 35-38
function isValidUUID(str) {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
```

**Použito pro:** Validaci recipeId a productId před databázovými operacemi.

### 4. Content Security Policy (CSP)

```html
<!-- index.html řádky 225-235 -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.clerk.com https://clerk.liquimixer.com https://www.gstatic.com https://*.firebaseio.com blob:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com wss://*.supabase.co https://*.googleapis.com https://*.firebaseio.com https://fcm.googleapis.com;
    frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://*.tiktok.com https://www.tiktok.com;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
">
```

**Poznámka:** `'unsafe-inline'` a `'unsafe-eval'` jsou nutné pro Clerk.js a některé dynamické operace.

### 5. HTTP Security Headers

**_headers soubor:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(self)
```

**zeabur.json:**
```json
"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
"X-Content-Type-Options": "nosniff",
"X-Frame-Options": "DENY",
```

### 6. SQL Injection - BEZPEČNÉ

Aplikace používá **Supabase JavaScript klient** s parametrizovanými dotazy:

```javascript
// Příklad z database.js
const { data, error } = await supabaseClient
    .from('recipes')
    .select('*')
    .eq('clerk_id', clerkId)    // Parametrizovaný dotaz
    .order('created_at', { ascending: false });
```

**Žádné raw SQL dotazy** - vše prochází Supabase SDK.

### 7. Row Level Security (RLS)

**Implementováno pro všechny tabulky:**

```sql
-- Příklad z COMPLETE_MIGRATION.sql
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

**Tabulky s RLS:**
- ✅ `audit_logs` (service_role only)
- ✅ `contact_messages`
- ✅ `refund_requests`
- ✅ `payments`
- ✅ `users`
- ✅ `subscriptions`
- ✅ `recipe_reminders`
- ✅ `fcm_tokens`

### 8. Autentizace

**Clerk.js** - enterprise-grade autentizační služba:
- ✅ OAuth přihlášení (Google, Facebook, Apple, TikTok)
- ✅ JWT tokeny pro API volání
- ✅ Automatické obnovování session
- ✅ Multi-factor authentication podpora

### 9. Doménová kontrola

```javascript
// database.js řádky 9-27
const ALLOWED_DOMAINS = [
    'liquimixer.com',
    'www.liquimixer.com',
    'localhost',
    '127.0.0.1',
    'zeabur.app'
];

function isAllowedDomain() {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return ALLOWED_DOMAINS.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    }
    return true;
}
```

---

## ⚠️ OBLASTI K PŘEZKOUMÁNÍ

### 1. CORS - Volný Access-Control-Allow-Origin

**Nalezeno ve všech Supabase Edge funkcích:**

```typescript
// Příklad ze supabase/functions/*/index.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Riziko:** Střední  
**Doporučení:** V produkci omezit na konkrétní domény:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.liquimixer.com",
  // nebo dynamicky kontrolovat Origin header
};
```

**Poznámka:** Pro veřejné API (bez citlivých dat) je `*` akceptovatelné.

### 2. Firebase API klíč ve veřejném kódu

```javascript
// firebase-messaging-sw.js řádek 10
apiKey: "AIzaSyARRacfElsLSyVm2B3v1WohYgArLwerNEo",
```

**Riziko:** Nízké (očekávané chování)  
**Vysvětlení:** Firebase API klíče jsou navrženy jako veřejné. Bezpečnost zajišťují:
- Firebase Security Rules
- App Check (pokud povoleno)
- Doménová omezení v Firebase Console

**Doporučení:** Zkontrolovat v Firebase Console, že jsou nastavena doménová omezení pro API klíč.

### 3. Supabase Anon Key ve veřejném kódu

```javascript
// database.js řádek 31
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

**Riziko:** Nízké (očekávané chování)  
**Vysvětlení:** Anon key je navržen jako veřejný. Bezpečnost zajišťuje RLS.

**✅ Ověřeno:** RLS je povoleno na všech tabulkách.

### 4. innerHTML použití

**Nalezeno 37 použití `innerHTML`** v app.js.

**Riziko:** Střední (pokud by nebylo escapováno)  
**Aktuální stav:** ✅ Uživatelská data jsou důsledně escapována pomocí `escapeHtml()`.

**Příklad správného použití:**
```javascript
const safeName = escapeHtml(recipe.name);
container.innerHTML = `<h3>${safeName}</h3>`;
```

### 5. onclick v dynamicky generovaném HTML

```javascript
// Příklad
`<div onclick="viewRecipeDetail('${recipe.id}')">`
```

**Riziko:** Nízké  
**Důvod:** recipe.id je UUID validované pomocí `isValidUUID()` a pochází z databáze (důvěryhodný zdroj).

**Doporučení pro budoucnost:** Zvážit použití event delegation místo inline onclick.

---

## 🔴 POTENCIÁLNÍ ZRANITELNOSTI

### 1. Žádné Rate Limiting na klientovi

**Popis:** Aplikace nemá implementované rate limiting pro API volání.

**Riziko:** Střední  
**Doporučení:** 
- Implementovat rate limiting v Supabase Edge funkcích
- Přidat debouncing pro uživatelské akce (již částečně implementováno)

### 2. Session Storage pro citlivá data

```javascript
// app.js
sessionStorage.setItem('installDismissed', 'true');
sessionStorage.setItem('iosInstallDismissed', 'true');
```

**Riziko:** Velmi nízké  
**Stav:** ✅ Používá se pouze pro UI preference, žádná citlivá data.

---

## ✅ BEZPEČNOSTNÍ BEST PRACTICES - SPLNĚNO

1. ✅ **HTTPS vynuceno** - `upgrade-insecure-requests` v CSP
2. ✅ **HSTS** - max-age=31536000 s preload
3. ✅ **Clickjacking ochrana** - X-Frame-Options: DENY/SAMEORIGIN
4. ✅ **MIME sniffing ochrana** - X-Content-Type-Options: nosniff
5. ✅ **Referrer Policy** - strict-origin-when-cross-origin
6. ✅ **Permissions Policy** - omezení geolocation, microphone, camera
7. ✅ **Bezpečné cookies** - Clerk.js spravuje session cookies bezpečně
8. ✅ **Input validace** - UUID validace, číselná validace
9. ✅ **Output encoding** - escapeHtml pro všechny uživatelské vstupy
10. ✅ **Parametrizované dotazy** - Supabase SDK

---

## 📋 DOPORUČENÍ

### Vysoká priorita

1. **CORS omezení** - Změnit `Access-Control-Allow-Origin: *` na konkrétní domény v edge funkcích

### Střední priorita

2. **Rate limiting** - Implementovat v Supabase Edge funkcích
3. **Firebase doménová omezení** - Ověřit nastavení v Firebase Console
4. **CSP zpřísnění** - Zvážit odstranění `'unsafe-inline'` pomocí nonce/hash (vyžaduje refaktoring)

### Nízká priorita

5. **Event delegation** - Nahradit inline onclick event listenery
6. **Subresource Integrity** - Přidat SRI hash pro externí skripty

---

## 🏁 ZÁVĚR

Aplikace LiquiMixer má **dobrou úroveň zabezpečení** s implementovanými standardními bezpečnostními opatřeními:

- ✅ XSS ochrana je konzistentně implementována
- ✅ SQL injection je eliminována díky Supabase SDK
- ✅ Autentizace je zajištěna enterprise-grade službou Clerk.js
- ✅ RLS chrání data na databázové úrovni
- ✅ HTTP security headers jsou správně nastaveny

Hlavní oblastí ke zlepšení je **zpřísnění CORS** v Supabase Edge funkcích pro produkční prostředí.

---

*Tento audit byl proveden statickou analýzou kódu. Pro kompletní bezpečnostní posouzení se doporučuje penetrační testování.*
