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

## KROK 6: Instalace Supabase CLI (doporučeno)

Pro plný deploy edge funkcí je CLI nejspolehlivější:

```bash
# Windows (PowerShell jako admin)
npm install -g supabase

# Ověření
supabase --version

# Přihlášení (otevře prohlížeč)
supabase login

# Propojení s projektem
supabase link --project-ref krwdfxnvhnxtkhtkbadi

# Deploy VŠECH edge funkcí
supabase functions deploy

# Deploy jedné funkce
supabase functions deploy contact
```

Po instalaci CLI mohu z Cascade deployovat přímo:
```bash
cmd /c "cd C:\Users\TOMLAP~1\Liquimixer && supabase functions deploy contact"
```

---

## SOUHRN — CO JE POTŘEBA OD VÁS:

1. ✅ **Spustit SQL migraci** — zkopírovat `n8n_dashboard_schema.sql` do Supabase SQL Editor
2. ✅ **Deploy contact edge funkce** — přes CLI nebo Dashboard
3. ⚙️ **Nainstalovat Supabase CLI** — `npm install -g supabase` (volitelné, ale doporučené)
4. ⚙️ **Vygenerovat Supabase Access Token** — pro automatizaci z Cascade (volitelné)
5. ⚙️ **Zvolit N8N hosting** — n8n.cloud / Railway / Zeabur / VPS
6. ⚙️ **Nastavit N8N secrets** — webhook URL + secret v Supabase

---

*Vytvořeno: 19.02.2026*
*Soubory k migraci: `supabase/migrations/n8n_dashboard_schema.sql`*
*Edge funkce: `supabase/functions/contact/index.ts`*
