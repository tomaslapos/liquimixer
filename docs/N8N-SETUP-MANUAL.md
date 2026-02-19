# N8N Setup Manuál — Migrace, Deploy, API přepojení
# Datum: 19.02.2026

---

## KROK 1: Spustit DB migraci na Supabase

### Co se změní:
- 15 nových sloupců v tabulce `contact_messages` (překlady, AI poznámky, dashboard workflow)
- Nová tabulka `gdpr_deletion_requests` (GDPR smazání účtu s tokeny)
- Nová tabulka `suggestion_features` (agregované návrhy na vylepšení)

### Jak:
1. Otevřete **Supabase Dashboard**: https://supabase.com/dashboard/project/krwdfxnvhnxtkhtkbadi
2. Klikněte na **SQL Editor** (v levém menu)
3. Klikněte na **New query**
4. Zkopírujte CELÝ obsah souboru: `supabase/migrations/n8n_dashboard_schema.sql`
5. Klikněte **Run** (Ctrl+Enter)
6. Měli byste vidět: "N8N Dashboard Schema Migration Complete"

### Ověření:
- V **Table Editor** by měly být nové tabulky: `gdpr_deletion_requests`, `suggestion_features`
- V tabulce `contact_messages` by měly být nové sloupce: `detected_language`, `subject_cs`, `message_cs`, `ai_notes`, `admin_reply_cs`, atd.

---

## KROK 2: Deploy contact edge funkce

### Varianta A: Přes Supabase CLI (pokud je nainstalované)

```bash
# Instalace CLI (pokud nemáte)
npm install -g supabase

# Přihlášení
supabase login

# Propojení s projektem
supabase link --project-ref krwdfxnvhnxtkhtkbadi

# Deploy contact funkce
supabase functions deploy contact --project-ref krwdfxnvhnxtkhtkbadi
```

### Varianta B: Přes Supabase Dashboard (bez CLI)

1. Otevřete: https://supabase.com/dashboard/project/krwdfxnvhnxtkhtkbadi/functions
2. Klikněte na funkci **contact**
3. Pokud neexistuje, klikněte **Create a new function** → název: `contact`
4. Zkopírujte obsah souboru `supabase/functions/contact/index.ts`
5. Uložte a deploy

### Varianta C: Přes Supabase Management API (pro automatizaci z Cascade)

Pro automatický deploy z Cascade potřebuji **Supabase Access Token**:

1. Jděte na: https://supabase.com/dashboard/account/tokens
2. Klikněte **Generate new token**
3. Název: `cascade-deploy` (nebo cokoliv)
4. Zkopírujte token (zobrazí se POUZE jednou!)
5. Token mi sdělte a já ho uložím do Supabase secrets

S tímto tokenem pak mohu:
- Spouštět SQL migrace
- Deployovat edge funkce
- Nastavovat secrets
- Vše přímo z Cascade bez nutnosti CLI

---

## KROK 3: Nastavit N8N environment variables

V Supabase Dashboard → Settings → Edge Functions → Secrets:

```
N8N_CONTACT_WEBHOOK_URL = https://your-n8n-instance.com/webhook/contact
N8N_WEBHOOK_SECRET = vygenerujte-silny-nahodny-string-min-32-znaku
```

Nebo přes CLI:
```bash
supabase secrets set N8N_CONTACT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/contact
supabase secrets set N8N_WEBHOOK_SECRET=your-secret-here
```

---

## KROK 4: N8N instance setup

### Kde hostovat N8N:
- **n8n.cloud** (nejjednodušší, od 20€/měsíc) — https://n8n.io/cloud
- **Self-hosted na Railway** (~5€/měsíc) — https://railway.app
- **Self-hosted na Zeabur** (už tam hostujete LiquiMixer)
- **Self-hosted na VPS** (Hetzner, DigitalOcean)

### Po instalaci N8N:
1. Vytvořte webhook URL pro kontaktní formulář
2. Nastavte tento URL jako `N8N_CONTACT_WEBHOOK_URL` v Supabase secrets
3. Vytvořte 6 workflows dle specifikace v `.cursor_notes.md` (sekce 11)

---

## KROK 5: Supabase Management API — přepojení pro Cascade deploy

### Získání Access Tokenu:
1. https://supabase.com/dashboard/account/tokens
2. **Generate new token** → název: `cascade-deploy`
3. Token sdělte Cascade

### Co Cascade může s tokenem dělat:

**Spustit SQL migraci:**
```bash
curl -X POST "https://api.supabase.com/v1/projects/krwdfxnvhnxtkhtkbadi/database/query" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ai_notes TEXT;"}'
```

**Deploy edge funkce:**
```bash
# 1. Vytvořit funkci
curl -X POST "https://api.supabase.com/v1/projects/krwdfxnvhnxtkhtkbadi/functions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "contact", "name": "contact", "verify_jwt": false}'

# 2. Deploy kódu (vyžaduje bundled soubor)
# Toto je složitější — CLI je jednodušší pro deploy
```

**Nastavit secrets:**
```bash
curl -X POST "https://api.supabase.com/v1/projects/krwdfxnvhnxtkhtkbadi/secrets" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"name": "N8N_CONTACT_WEBHOOK_URL", "value": "https://..."}]'
```

**Listovat secrets:**
```bash
curl "https://api.supabase.com/v1/projects/krwdfxnvhnxtkhtkbadi/secrets" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Jak to bude fungovat v praxi:
1. Vy mi sdělíte Supabase Access Token
2. Já ho uložím do memory (nikdy ho nezobrazím ani neuložím do souboru)
3. Při dalších změnách mohu sám:
   - Spouštět SQL migrace
   - Nastavovat secrets
   - Ověřovat stav funkcí
4. Pro deploy edge funkcí je stále nejlepší CLI (Management API deploy je komplikovaný)

---

## KROK 6: Supabase CLI (FUNGUJE — npx supabase)

CLI je dostupné přes `npx supabase` (verze 2.76.10). Projekt je linkovaný.

Cascade deployuje přímo:
```bash
cmd /c "cd C:\Users\TOMLAP~1\Liquimixer && npx supabase functions deploy contact 2>&1"
cmd /c "cd C:\Users\TOMLAP~1\Liquimixer && npx supabase db push --linked 2>&1"
```

---

## KROK 7: N8N API PROPOJENÍ (pro přímé nahrávání z Cascade)

Aby Cascade mohl přímo komunikovat s N8N (vytvářet/upravovat workflows),
potřebuji N8N API přístup. V N8N to nastavíte takto:

### 7.1 Kde v N8N vytvořit API klíč:

1. Otevřete N8N Dashboard (web UI vaší N8N instance)
2. Klikněte na **ikonu uživatele** (vlevo dole) → **Settings**
3. V menu zvolte **API** (nebo **API Keys**)
4. Klikněte **Create an API key**
5. Název: `cascade-deploy` (nebo cokoliv)
6. Zkopírujte vygenerovaný API klíč

### 7.2 Co mi sdělíte:

```
N8N_BASE_URL = https://your-n8n-instance.com  (URL vaší N8N instance)
N8N_API_KEY  = n8n_api_xxxxxxxxxxxxxxxxx       (API klíč z kroku 7.1)
```

### 7.3 Co s tím Cascade může dělat:

S N8N API klíčem mohu přímo z Cascade:

**Vytvářet workflows:**
```bash
curl -X POST "$N8N_BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "WF1 - Contact Ingestion", "nodes": [...], "connections": {...}}'
```

**Aktivovat/deaktivovat workflows:**
```bash
curl -X PATCH "$N8N_BASE_URL/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

**Spouštět workflows manuálně:**
```bash
curl -X POST "$N8N_BASE_URL/api/v1/workflows/{id}/run" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data": {...}}'
```

**Listovat existující workflows:**
```bash
curl "$N8N_BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 7.4 Credentials v N8N (musíte vytvořit ručně v UI):

Tyto credentials nelze vytvořit přes API — musíte je nastavit v N8N UI:

| Credential | Typ | Kde v N8N | Hodnoty |
|---|---|---|---|
| **Supabase** | Supabase API | Credentials → New → Supabase | URL: `https://krwdfxnvhnxtkhtkbadi.supabase.co`, Service Role Key |
| **OpenAI** | OpenAI API | Credentials → New → OpenAI | Váš OpenAI API klíč (GPT-4o-mini) |
| **SMTP** | SMTP Email | Credentials → New → SMTP | Host: smtp.active24.com, Port: 465, SSL: true |
| **Clerk** | HTTP Header Auth | Credentials → New → Header Auth | Name: `Authorization`, Value: `Bearer sk_live_xxx` (Clerk Secret Key) |

**Postup v N8N UI:**
1. Levé menu → **Credentials**
2. **Add Credential** → vyberte typ
3. Vyplňte hodnoty
4. **Save**
5. Credential se pak vybírá v jednotlivých nodes

### 7.5 Webhook URL pro Supabase:

Po vytvoření WF1 v N8N se vygeneruje webhook URL. Ten pak nastavíte:
```bash
npx supabase secrets set N8N_CONTACT_WEBHOOK_URL=https://your-n8n.com/webhook/xxxxx
npx supabase secrets set N8N_WEBHOOK_SECRET=your-strong-secret-min-32-chars
```

---

## SOUHRN STAVU (19.02.2026):

1. ✅ **SQL migrace** — spuštěna přes `npx supabase db push` (20260219_n8n_dashboard_schema.sql)
2. ✅ **Deploy contact edge funkce** — spuštěn přes `npx supabase functions deploy contact`
3. ✅ **Supabase CLI** — funguje přes `npx supabase` (v2.76.10, projekt linkovaný)
4. ⚙️ **Zvolit N8N hosting** — n8n.cloud / Railway / Zeabur / VPS
5. ⚙️ **Vytvořit N8N API klíč** — Settings → API → Create (viz krok 7.1)
6. ⚙️ **Vytvořit credentials v N8N** — Supabase, OpenAI, SMTP, Clerk (viz krok 7.4)
7. ⚙️ **Nastavit webhook secrets** — po vytvoření WF1 v N8N (viz krok 7.5)

---

*Vytvořeno: 19.02.2026*
*Aktualizováno: 19.02.2026 — migrace + deploy hotové, N8N API guide přidán*
*Pravidla AI agentů: `docs/ai-rules.md`*
*Migrace: `supabase/migrations/20260219_n8n_dashboard_schema.sql`*
*Edge funkce: `supabase/functions/contact/index.ts`*
