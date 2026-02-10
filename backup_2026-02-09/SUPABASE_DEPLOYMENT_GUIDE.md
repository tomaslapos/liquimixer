# 🚀 Supabase Edge Functions - Deployment Guide

## Předpoklady

1. **Supabase CLI** nainstalováno
2. **Přístup k Supabase projektu** (admin práva)
3. **Secrets nakonfigurované** v Supabase Dashboard

---

## 📦 Instalace Supabase CLI

### Windows (PowerShell jako Admin)
```powershell
scoop install supabase
```

### Nebo pomocí npm:
```bash
npm install -g supabase
```

### Ověření instalace:
```bash
supabase --version
```

---

## 🔑 Přihlášení a propojení projektu

### 1. Přihlášení do Supabase
```bash
supabase login
```
Otevře se prohlížeč pro autorizaci.

### 2. Propojení s projektem
```bash
cd C:\Users\TomášLapos\Liquimixer
supabase link --project-ref krwdfxnvhnxtkhtkbadi
```

**Project Reference:** `krwdfxnvhnxtkhtkbadi` (z URL vašeho Supabase projektu)

---

## 🔐 Nastavení Secrets (Environment Variables)

Před deploymentem je nutné nastavit secrets v Supabase Dashboard:

### 1. Přejděte do Supabase Dashboard
```
https://supabase.com/dashboard/project/krwdfxnvhnxtkhtkbadi/settings/vault
```

### 2. Přidejte tyto secrets:

#### Firebase (pro reminder-notify)
| Secret | Popis |
|--------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON service account z Firebase Console |

#### N8N Webhooks
| Secret | Popis |
|--------|-------|
| `N8N_CONTACT_WEBHOOK_URL` | URL pro kontaktní formulář |
| `N8N_REFUND_WEBHOOK_URL` | URL pro refund požadavky |
| `N8N_WEBHOOK_SECRET` | Sdílený secret pro ověření |

#### GP webpay (platební brána)
| Secret | Popis |
|--------|-------|
| `GPWEBPAY_MERCHANT_NUMBER` | Číslo obchodníka |
| `GPWEBPAY_GATEWAY_URL` | URL platební brány |
| `GPWEBPAY_PRIVATE_KEY` | Base64 encoded PEM privátní klíč |
| `GPWEBPAY_PRIVATE_KEY_PASSWORD` | Heslo k privátnímu klíči |
| `GPWEBPAY_PUBLIC_KEY` | Base64 encoded PEM veřejný klíč |
| `GPWEBPAY_CALLBACK_URL` | Callback URL pro platbu |
| `GPWEBPAY_SUCCESS_URL` | URL po úspěšné platbě |
| `GPWEBPAY_FAIL_URL` | URL po neúspěšné platbě |

#### iDoklad (fakturace)
| Secret | Popis |
|--------|-------|
| `IDOKLAD_CLIENT_ID` | OAuth client ID |
| `IDOKLAD_CLIENT_SECRET` | OAuth client secret |

#### SMTP (emaily)
| Secret | Popis |
|--------|-------|
| `SMTP_HOST` | SMTP server |
| `SMTP_PORT` | Port (obvykle 465) |
| `SMTP_USER` | Uživatelské jméno |
| `SMTP_PASSWORD` | Heslo |
| `EMAIL_FROM` | Odesílatel emailů |

#### Firemní údaje
| Secret | Popis |
|--------|-------|
| `COMPANY_NAME` | Název firmy |
| `COMPANY_STREET` | Ulice |
| `COMPANY_CITY` | Město |
| `COMPANY_ZIP` | PSČ |
| `COMPANY_ICO` | IČO |
| `COMPANY_DIC` | DIČ |
| `COMPANY_BANK_ACCOUNT` | IBAN |
| `COMPANY_BANK_NAME` | Název banky |

#### Admin
| Secret | Popis |
|--------|-------|
| `ADMIN_EMAIL` | Email pro notifikace |

---

## 📤 Deployment Edge funkcí

### Deploy všech funkcí najednou
```bash
cd C:\Users\TomášLapos\Liquimixer

supabase functions deploy billing
supabase functions deploy contact
supabase functions deploy geolocation
supabase functions deploy gpwebpay
supabase functions deploy idoklad
supabase functions deploy invoice
supabase functions deploy refund
supabase functions deploy reminder-notify
supabase functions deploy subscription
```

### Nebo pomocí skriptu (vytvořte `deploy-functions.bat`):
```batch
@echo off
echo Deploying Supabase Edge Functions...

supabase functions deploy billing --no-verify-jwt
supabase functions deploy contact --no-verify-jwt
supabase functions deploy geolocation --no-verify-jwt
supabase functions deploy gpwebpay --no-verify-jwt
supabase functions deploy idoklad --no-verify-jwt
supabase functions deploy invoice --no-verify-jwt
supabase functions deploy refund --no-verify-jwt
supabase functions deploy reminder-notify --no-verify-jwt
supabase functions deploy subscription --no-verify-jwt

echo All functions deployed!
pause
```

**Poznámka:** `--no-verify-jwt` je nutné protože funkce ověřují JWT samy.

---

## ⏰ Nastavení CRON jobu pro reminder-notify

### 1. V Supabase Dashboard přejděte na:
```
https://supabase.com/dashboard/project/krwdfxnvhnxtkhtkbadi/functions
```

### 2. Najděte funkci `reminder-notify` a klikněte na ni

### 3. V záložce "Schedules" přidejte CRON:
- **Schedule:** `0 9 * * *` (každý den v 9:00 UTC = 10:00 CET)
- **Timezone:** UTC

---

## ✅ Ověření deploymentu

### Zkontrolovat běžící funkce:
```bash
supabase functions list
```

### Zobrazit logy funkce:
```bash
supabase functions logs reminder-notify --tail
```

### Test funkce (příklad pro subscription):
```bash
curl -X POST https://krwdfxnvhnxtkhtkbadi.supabase.co/functions/v1/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"action": "check"}'
```

---

## 🔄 Aktualizace funkcí

Při změně kódu stačí znovu deployovat:
```bash
supabase functions deploy název-funkce
```

---

## 🐛 Troubleshooting

### Chyba: "Function not found"
```bash
supabase functions list
```
Ověřte, že funkce je v seznamu.

### Chyba: "Missing required secret"
Zkontrolujte, že všechny secrets jsou nastaveny v Dashboard.

### Chyba CORS
Funkce nyní povolují pouze:
- `https://www.liquimixer.com`
- `https://liquimixer.com`
- Server-to-server požadavky (N8N webhooks)

Pro testování z localhost musíte dočasně přidat localhost do `_shared/cors.ts`.

### Logy
```bash
supabase functions logs název-funkce --tail
```

---

## 📋 Checklist před produkcí

- [ ] Všechny secrets jsou nastaveny
- [ ] Funkce jsou deploynuty
- [ ] CRON job pro reminder-notify je aktivní
- [ ] Test platební brány funguje
- [ ] CORS je omezen pouze na liquimixer.com
- [ ] Rate limiting je aktivní

---

## 🔗 Užitečné odkazy

- **Supabase Dashboard:** https://supabase.com/dashboard/project/krwdfxnvhnxtkhtkbadi
- **Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Secrets Management:** https://supabase.com/docs/guides/functions/secrets
