# GP WebPay - Nastavení platební brány

## Přehled

GP WebPay je platební brána pro zpracování karetních plateb. Tato dokumentace popisuje nastavení testovacího a produkčního prostředí.

## Testovací prostředí

### Testovací údaje (z dokumentace GP WebPay)

| Parametr | Hodnota |
|----------|---------|
| Merchant Number | `123456` |
| Gateway URL | `https://test.3dsecure.gpwebpay.com/pgw/order.do` |
| Heslo k privátnímu klíči | `111111` |

### Testovací karty

| Číslo karty | Výsledek |
|-------------|----------|
| `4056070000000008` | Úspěšná platba |
| `4056070000000016` | Zamítnutá platba |
| `5200000000000007` | Úspěšná platba (MasterCard) |

Použijte libovolné budoucí datum expirace a CVV.

## Nastavení Supabase Secrets

### Pro testovací prostředí

Nastavte tyto secrets v Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Secret | Hodnota | Popis |
|--------|---------|-------|
| `GPWEBPAY_TEST_MODE` | `true` | Zapnout testovací režim |
| `GPWEBPAY_PRIVATE_KEY` | Base64 encoded PEM | Privátní klíč obchodníka |
| `GPWEBPAY_PRIVATE_KEY_PASSWORD` | `111111` | Heslo k privátnímu klíči |
| `GPWEBPAY_GPE_PUBLIC_KEY` | Base64 encoded PEM | Veřejný klíč GPE |
| `APP_BASE_URL` | `https://www.liquimixer.com` | URL aplikace |

### Jak zakódovat klíče do Base64

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("test_key.pem"))
```

**Linux/Mac:**
```bash
base64 -w 0 test_key.pem
```

## Produkční prostředí

### Co potřebujete od banky

1. **Merchant Number** - Číslo obchodníka přidělené bankou
2. **Privátní klíč** - Vygenerujete a veřejnou část pošlete bance
3. **Veřejný klíč GPE** - Produkční klíč pro ověření odpovědí

### Nastavení secrets pro produkci

| Secret | Hodnota |
|--------|---------|
| `GPWEBPAY_TEST_MODE` | `false` |
| `GPWEBPAY_MERCHANT_NUMBER` | Váš merchant number od banky |
| `GPWEBPAY_GATEWAY_URL` | `https://3dsecure.gpwebpay.com/pgw/order.do` |
| `GPWEBPAY_PRIVATE_KEY` | Base64 encoded produkční klíč |
| `GPWEBPAY_PRIVATE_KEY_PASSWORD` | Vaše heslo |
| `GPWEBPAY_GPE_PUBLIC_KEY` | Base64 encoded produkční GPE klíč |

## API Endpoints

### Vytvořit platbu

```javascript
POST /functions/v1/gpwebpay
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json

{
  "action": "create",
  "data": {
    "subscriptionId": "<subscription_uuid>"
  }
}

// Odpověď:
{
  "success": true,
  "paymentId": "<payment_uuid>",
  "orderNumber": "1234567890ABCD",
  "redirectUrl": "https://test.3dsecure.gpwebpay.com/pgw/order.do?...",
  "testMode": true
}
```

### Ověřit stav platby

```javascript
POST /functions/v1/gpwebpay
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json

{
  "action": "verify",
  "data": {
    "subscriptionId": "<subscription_uuid>"
  }
}
```

### Status konfigurace

```javascript
POST /functions/v1/gpwebpay
Authorization: Bearer <anon_key>
Content-Type: application/json

{
  "action": "status"
}
```

## Testovací flow

1. Uživatel klikne na "Zakoupit předplatné"
2. Aplikace vytvoří subscription s `status: pending`
3. Aplikace volá `gpwebpay` funkci s `action: create`
4. Uživatel je přesměrován na GP WebPay bránu
5. Uživatel zadá testovací kartu
6. GP WebPay zavolá callback URL
7. Naše funkce ověří podpis a aktivuje subscription
8. Automaticky: generování faktury → odeslání emailem → export do iDoklad
9. Uživatel je přesměrován zpět na aplikaci

## Troubleshooting

### Chyba "Private key not configured"
- Zkontrolujte, že `GPWEBPAY_PRIVATE_KEY` je nastaveno v Supabase secrets
- Klíč musí být zakódovaný v Base64

### Chyba "Failed to decrypt private key"
- Zkontrolujte `GPWEBPAY_PRIVATE_KEY_PASSWORD`
- Pro testovací klíč je heslo `111111`

### PRCODE != 0
Viz dokumentace GP WebPay pro seznam chybových kódů.

Časté kódy:
- `0` - Úspěch
- `14` - Technická chyba
- `28` - Neautorizovaná transakce
- `30` - Chyba formátu
