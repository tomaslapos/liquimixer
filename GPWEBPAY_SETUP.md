# GP WebPay - Nastavení platební brány

## 📋 Přehled

GP WebPay je platební brána pro zpracování karetních plateb. Tato dokumentace popisuje nastavení testovacího a produkčního prostředí.

## 🔧 Testovací prostředí

### Testovací údaje (z dokumentace GP WebPay)

| Parametr | Hodnota |
|----------|---------|
| Merchant Number | `123456` |
| Gateway URL | `https://test.3dsecure.gpwebpay.com/pgw/order.do` |
| Heslo k privátnímu klíči | `111111` |

### Testovací klíče

Testovací klíče jsou ve složce `GPWebpay/Dokumentace/test_keystore_and_certificate/`:

- `test_key.pem` - Privátní klíč obchodníka (šifrovaný)
- `test_cert.pem` - Certifikát obchodníka
- `test.pfx` - PKCS#12 keystore

### Veřejný klíč GPE (pro ověření odpovědí)

Ve složce `GPWebpay/`:
- `gpe.signing_test.pem` - Testovací veřejný klíč GPE

---

## 🔐 Nastavení Supabase Secrets

### Pro testovací prostředí

Nastavte tyto secrets v Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Testovací režim (true/false)
GPWEBPAY_TEST_MODE=true

# Privátní klíč obchodníka (Base64 encoded PEM)
# Použijte příkaz: base64 -w 0 test_key.pem
GPWEBPAY_PRIVATE_KEY=<base64_encoded_private_key>

# Heslo k privátnímu klíči
GPWEBPAY_PRIVATE_KEY_PASSWORD=111111

# Veřejný klíč GPE pro ověření odpovědí (Base64 encoded PEM)
# Použijte příkaz: base64 -w 0 gpe.signing_test.pem
GPWEBPAY_GPE_PUBLIC_KEY=<base64_encoded_gpe_public_key>

# Base URL aplikace (pro přesměrování po platbě)
APP_BASE_URL=https://www.liquimixer.com
```

### Jak zakódovat klíče do Base64

**Windows (PowerShell):**
```powershell
# POZOR: Nepoužívat pro editaci souborů! Pouze pro generování Base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("test_key.pem"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("gpe.signing_test.pem"))
```

**Linux/Mac:**
```bash
base64 -w 0 test_key.pem
base64 -w 0 gpe.signing_test.pem
```

**Online nástroj:**
Můžete použít https://www.base64encode.org/ (pouze pro testovací klíče!)

---

## 🏭 Produkční prostředí

### Co potřebujete od banky

1. **Merchant Number** - Číslo obchodníka přidělené bankou
2. **Privátní klíč** - Vygenerujete a veřejnou část pošlete bance
3. **Veřejný klíč GPE** - Produkční klíč pro ověření odpovědí

### Nastavení secrets pro produkci

```bash
# Vypnout testovací režim
GPWEBPAY_TEST_MODE=false

# Produkční merchant number od banky
GPWEBPAY_MERCHANT_NUMBER=<vas_merchant_number>

# Produkční gateway URL (volitelné, default je produkční)
GPWEBPAY_GATEWAY_URL=https://3dsecure.gpwebpay.com/pgw/order.do

# Produkční privátní klíč (Base64 encoded)
GPWEBPAY_PRIVATE_KEY=<base64_encoded_production_key>

# Heslo k produkčnímu klíči
GPWEBPAY_PRIVATE_KEY_PASSWORD=<vase_heslo>

# Produkční veřejný klíč GPE (Base64 encoded)
GPWEBPAY_GPE_PUBLIC_KEY=<base64_encoded_gpe_production_key>
```

---

## 📡 API Endpoints

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

// Odpověď:
{
  "status": "completed",
  "isPaid": true,
  "prcode": "0",
  "srcode": "0"
}
```

### Callback od GP WebPay

GP WebPay automaticky zavolá callback URL po dokončení platby:
```
GET /functions/v1/gpwebpay?OPERATION=CREATE_ORDER&ORDERNUMBER=...&PRCODE=0&SRCODE=0&DIGEST=...
```

---

## 🧪 Testování

### Testovací karty

| Číslo karty | Výsledek |
|-------------|----------|
| 4056070000000008 | Úspěšná platba |
| 4056070000000016 | Zamítnutá platba |
| 5200000000000007 | Úspěšná platba (MasterCard) |

Použijte libovolné budoucí datum expirace a CVV.

### Testovací flow

1. Uživatel klikne na "Zakoupit předplatné"
2. Aplikace vytvoří subscription s `status: pending`
3. Aplikace volá `gpwebpay` funkci s `action: create`
4. Uživatel je přesměrován na GP WebPay bránu
5. Uživatel zadá testovací kartu
6. GP WebPay zavolá callback URL
7. Naše funkce ověří podpis a aktivuje subscription
8. Uživatel je přesměrován zpět na aplikaci

---

## 🔍 Troubleshooting

### Chyba "Private key not configured"
- Zkontrolujte, že `GPWEBPAY_PRIVATE_KEY` je nastaveno v Supabase secrets
- Klíč musí být zakódovaný v Base64

### Chyba "Failed to decrypt private key"
- Zkontrolujte `GPWEBPAY_PRIVATE_KEY_PASSWORD`
- Pro testovací klíč je heslo `111111`

### Chyba "Invalid signature" v callbacku
- Zkontrolujte `GPWEBPAY_GPE_PUBLIC_KEY`
- Ujistěte se, že používáte správný klíč (test vs. produkce)

### PRCODE != 0
Viz `GP_webpay_Seznam_navratovych_kodu_CZ.pdf` pro seznam chybových kódů.

Časté kódy:
- `0` - Úspěch
- `14` - Technická chyba
- `28` - Neautorizovaná transakce
- `30` - Chyba formátu

---

## 📁 Struktura souborů

```
GPWebpay/
├── gpe.signing_test.pem         # Testovací veřejný klíč GPE
├── gpe.signing_test.cer         # Testovací certifikát GPE
└── Dokumentace/
    ├── test_keystore_and_certificate/
    │   ├── test_key.pem         # Testovací privátní klíč
    │   ├── test_cert.pem        # Testovací certifikát obchodníka
    │   └── test.pfx             # PKCS#12 keystore
    ├── demoshop_code/           # PHP ukázky
    └── *.pdf                    # Dokumentace
```
