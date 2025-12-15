# Nastavení Supabase Edge Functions

## 📋 Přehled

Aplikace LiquiMixer používá Supabase Edge Functions pro zabezpečení citlivých operací:

| Funkce | Účel |
|--------|------|
| `billing` | Správa fakturačních údajů |
| `subscription` | Správa předplatného |
| `payment` | Platby přes Comgate |

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
│   └── payment/
│       └── index.ts
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

```bash
# Comgate konfigurace
supabase secrets set COMGATE_MERCHANT_ID=your_merchant_id
supabase secrets set COMGATE_SECRET=your_secret_key
supabase secrets set COMGATE_TEST_MODE=true

# Firemní údaje pro faktury
supabase secrets set COMPANY_NAME="WOOs s.r.o."
supabase secrets set COMPANY_STREET="Vaše ulice 123"
supabase secrets set COMPANY_CITY="Praha"
supabase secrets set COMPANY_ZIP="11000"
supabase secrets set COMPANY_ICO="12345678"
supabase secrets set COMPANY_DIC="CZ12345678"
supabase secrets set COMPANY_BANK_ACCOUNT="1234567890/0100"
supabase secrets set COMPANY_BANK_NAME="Komerční banka"
```

### 4. Deployment funkcí

```bash
# Deploy všech funkcí
supabase functions deploy billing
supabase functions deploy subscription
supabase functions deploy payment

# nebo najednou
supabase functions deploy
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

Vytvořte soubor `.env.local` pro lokální vývoj:

```env
SUPABASE_URL=https://krwdfxnvhnxtkhtkbadi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
COMGATE_MERCHANT_ID=your_merchant_id
COMGATE_SECRET=your_secret
COMGATE_TEST_MODE=true
COMPANY_NAME=WOOs s.r.o.
COMPANY_STREET=
COMPANY_CITY=
COMPANY_ZIP=
COMPANY_ICO=
COMPANY_DIC=
COMPANY_BANK_ACCOUNT=
COMPANY_BANK_NAME=
```

---

## ⚠️ Důležité poznámky

1. **NIKDY** neukládejte tajné klíče do Git repozitáře
2. V produkci nastavte `COMGATE_TEST_MODE=false`
3. Pravidelně rotujte API klíče
4. Monitorujte logy funkcí v Supabase Dashboard
