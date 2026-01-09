# Supabase Secrets - Co přidat

Přejděte na: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

## 1. SMTP (Email pro faktury)

| Secret Name | Value |
|-------------|-------|
| `SMTP_HOST` | `smtp.websupport.cz` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `invoice@liquimixer.com` |
| `SMTP_PASSWORD` | `%)[$6+Fo!]~Q,?lfN-1I` |
| `EMAIL_FROM` | `invoice@liquimixer.com` |

## 2. GP WebPay

| Secret Name | Value |
|-------------|-------|
| `GPWEBPAY_TEST_MODE` | `true` |
| `GPWEBPAY_PRIVATE_KEY_PASSWORD` | `111111` |
| `APP_BASE_URL` | `https://www.liquimixer.com` |

### Klíče (Base64) - zkopírovat obsah souborů:

#### GPWEBPAY_PRIVATE_KEY
Zkopírujte obsah souboru `GPWebpay/test_key_base64.txt` **BEZ** řádků:
- `-----BEGIN CERTIFICATE-----`
- `-----END CERTIFICATE-----`

Tedy pouze Base64 text mezi nimi.

#### GPWEBPAY_GPE_PUBLIC_KEY
Zkopírujte obsah souboru `GPWebpay/gpe_public_key_base64.txt` **BEZ** řádků:
- `-----BEGIN CERTIFICATE-----`
- `-----END CERTIFICATE-----`

## 3. iDoklad (pokud ještě nemáte)

| Secret Name | Value |
|-------------|-------|
| `IDOKLAD_CLIENT_ID` | `<váš client ID z iDoklad>` |
| `IDOKLAD_CLIENT_SECRET` | `<váš client secret z iDoklad>` |

## 4. Firemní údaje (pokud ještě nemáte)

| Secret Name | Value |
|-------------|-------|
| `COMPANY_NAME` | `WOOs, s. r. o.` |
| `COMPANY_STREET` | `<adresa>` |
| `COMPANY_CITY` | `<město>` |
| `COMPANY_ZIP` | `<PSČ>` |
| `COMPANY_ICO` | `<IČO>` |
| `COMPANY_DIC` | `<DIČ>` |
| `COMPANY_BANK_ACCOUNT` | `<IBAN>` |
| `COMPANY_BANK_NAME` | `<název banky>` |

---

## Po přidání secrets - Deploy funkcí

```cmd
cd C:\Users\TomášLapos\Liquimixer
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy gpwebpay
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy invoice
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy idoklad
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy billing
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy subscription
```

Nebo deploy všech najednou:
```cmd
"C:\Program Files\Supabase CLI\supabase.exe" functions deploy
```
