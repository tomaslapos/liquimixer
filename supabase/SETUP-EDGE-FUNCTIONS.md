# Nastavení Supabase Edge Functions

## 📋 Přehled

Aplikace LiquiMixer používá Supabase Edge Functions pro zabezpečení citlivých operací:

| Funkce | Účel |
|--------|------|
| `billing` | Správa fakturačních údajů |
| `subscription` | Správa předplatného |
| `payment` | Platby přes Comgate |
| `invoice` | Generování faktur (PDF) a odesílání emailem |
| `idoklad` | Export faktur do iDoklad API |
| `geolocation` | Detekce země uživatele pro DPH |

---

## 🔧 Instalace Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# nebo pomocí npm
npm install -g supabase

# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

---

## 📁 Struktura projektu

```
supabase/
├── functions/
│   ├── billing/
│   │   └── index.ts
│   ├── subscription/
│   │   └── index.ts
│   ├── payment/
│   │   └── index.ts
│   ├── invoice/
│   │   └── index.ts
│   ├── idoklad/
│   │   └── index.ts
│   └── geolocation/
│       └── index.ts
├── migrations/
│   └── 001_subscription_invoicing.sql
└── config.toml
```

---

## 🚀 Deployment

### 1. Přihlášení do Supabase

```bash
supabase login
```

### 2. Propojení s projektem

```bash
supabase link --project-ref krwdfxnvhnxtkhtkbadi
```

### 3. Nastavení secrets (tajných klíčů)

⚠️ **DŮLEŽITÉ**: Všechny citlivé údaje MUSÍ být uloženy pouze v Supabase Secrets. NIKDY je neukládejte do frontendu!

```bash
# ==========================================
# COMGATE - Platební brána
# ==========================================
supabase secrets set COMGATE_MERCHANT_ID=your_merchant_id
supabase secrets set COMGATE_SECRET=your_secret_key
supabase secrets set COMGATE_TEST_MODE=true

# ==========================================
# iDOKLAD - API pro účetní systém
# ==========================================
supabase secrets set IDOKLAD_CLIENT_ID=0bc05b76-0ace-436e-9e20-78d52e9e355e
supabase secrets set IDOKLAD_CLIENT_SECRET=f68bd561-cc1b-4f86-9b7e-2e6755df8967

# ==========================================
# SMTP - Active24 pro odesílání faktur
# ==========================================
supabase secrets set SMTP_HOST=smtp.active24.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_SECURE=true
supabase secrets set SMTP_USER=vas_email@domena.cz
supabase secrets set SMTP_PASSWORD=vase_heslo
supabase secrets set EMAIL_FROM=faktury@liquimixer.com

# ==========================================
# FIREMNÍ ÚDAJE - WOOs, s. r. o.
# ==========================================
supabase secrets set COMPANY_NAME="WOOs, s. r. o."
supabase secrets set COMPANY_STREET="Brloh 12"
supabase secrets set COMPANY_CITY="Drhovle"
supabase secrets set COMPANY_ZIP="397 01"
supabase secrets set COMPANY_ICO="05117810"
supabase secrets set COMPANY_DIC="CZ05117810"
supabase secrets set COMPANY_BANK_ACCOUNT="CZ9520100000002601012639"
supabase secrets set COMPANY_BANK_NAME="Fio banka"
```

### 4. Ověření nastavených secrets

```bash
supabase secrets list
```

### 5. Spuštění SQL migrace

```bash
# Spustit migraci pro nové tabulky
supabase db push
```

Nebo manuálně v Supabase Dashboard > SQL Editor spusťte obsah souboru:
`supabase/migrations/001_subscription_invoicing.sql`

### 6. Deployment funkcí

```bash
# Deploy všech funkcí najednou
supabase functions deploy

# Nebo jednotlivě:
supabase functions deploy billing
supabase functions deploy subscription
supabase functions deploy payment
supabase functions deploy invoice
supabase functions deploy idoklad
supabase functions deploy geolocation
```

---

## 🔐 Bezpečnostní nastavení

### Povolené domény (CORS)

V každé funkci je nastaveno:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // V produkci změňte na 'https://www.liquimixer.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

Pro produkci změňte na:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.liquimixer.com',
  ...
}
```

---

## 📊 Testování

### Lokální testování

```bash
# Spustit lokálně
supabase functions serve billing --env-file .env.local

# Test volání
curl -X POST http://localhost:54321/functions/v1/billing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"action": "get"}'
```

### Testování v produkci

```bash
curl -X POST https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/billing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"action": "get"}'
```

---

## 🔄 Comgate Webhook

Pro callback z Comgate je potřeba nastavit webhook URL:

**URL:** `https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/payment`

**Metoda:** POST

**Tělo požadavku:**
```json
{
  "action": "callback",
  "data": {
    "transId": "xxx",
    "status": "PAID",
    "refId": "subscription_id"
  }
}
```

---

## 📝 Environment Variables

Vytvořte soubor `.env.local` pro lokální vývoj (NIKDY nepřidávejte do Gitu!):

```env
# Supabase
SUPABASE_URL=https://krwdfxnvhnxtkhtkbadi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Comgate
COMGATE_MERCHANT_ID=your_merchant_id
COMGATE_SECRET=your_secret
COMGATE_TEST_MODE=true

# iDoklad
IDOKLAD_CLIENT_ID=0bc05b76-0ace-436e-9e20-78d52e9e355e
IDOKLAD_CLIENT_SECRET=f68bd561-cc1b-4f86-9b7e-2e6755df8967

# SMTP - Active24
SMTP_HOST=smtp.active24.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=vas_email@domena.cz
SMTP_PASSWORD=vase_heslo
EMAIL_FROM=faktury@liquimixer.com

# Firemní údaje
COMPANY_NAME=WOOs, s. r. o.
COMPANY_STREET=Brloh 12
COMPANY_CITY=Drhovle
COMPANY_ZIP=397 01
COMPANY_ICO=05117810
COMPANY_DIC=CZ05117810
COMPANY_BANK_ACCOUNT=CZ9520100000002601012639
COMPANY_BANK_NAME=Fio banka
```

Přidejte `.env.local` do `.gitignore`:
```
.env.local
.env*.local
```

---

## 🔐 Bezpečnostní checklist

- [ ] Všechny API klíče jsou pouze v Supabase Secrets (ne ve frontendu!)
- [ ] `.env.local` je v `.gitignore`
- [ ] V produkci `COMGATE_TEST_MODE=false`
- [ ] CORS nastaveny pouze na `https://www.liquimixer.com`
- [ ] RLS politiky aktivní na všech tabulkách
- [ ] Pravidelná rotace API klíčů

## ⚠️ Důležité poznámky

1. **NIKDY** neukládejte tajné klíče do Git repozitáře
2. V produkci nastavte `COMGATE_TEST_MODE=false`
3. Pravidelně rotujte API klíče
4. Monitorujte logy funkcí v Supabase Dashboard
5. iDoklad credentials jsou citlivé - chraňte je jako hesla

## 🧪 Testování platebního flow

1. Ujistěte se, že `COMGATE_TEST_MODE=true`
2. Vytvořte testovací účet a zkuste platbu
3. Ověřte, že faktura se vygenerovala a odeslala
4. Zkontrolujte export do iDoklad
5. Po úspěšném testu změňte na produkční režim































