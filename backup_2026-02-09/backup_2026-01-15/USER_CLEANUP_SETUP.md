# User Cleanup CRON Job - Nastavení

## Přehled

Automatické mazání neaktivních uživatelských účtů s email upozorněními.

### Pravidla mazání

| Typ uživatele | Doba do smazání | Upozornění |
|---------------|-----------------|------------|
| **Bez historie předplatného** | 48 hodin od registrace | Žádné |
| **S historií předplatného** | 3 měsíce po vypršení | 1 měsíc, 1 týden, 1 den před |

---

## 1. Databázová migrace

Spusťte SQL migrace v Supabase SQL Editoru:

```sql
-- Přidat sloupce pro sledování mazání
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deletion_warning_sent TEXT[] DEFAULT '{}';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'cs';

-- Indexy pro rychlejší dotazy
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled 
ON users(deletion_scheduled_at) 
WHERE deletion_scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);
```

---

## 2. Supabase Secrets

### Povinné secrets

```bash
# Tajný klíč pro CRON job autorizaci
supabase secrets set CRON_SECRET="vašváš-tajný-klíč-zde"

# Clerk Secret Key (pro mazání uživatelů v Clerk)
supabase secrets set CLERK_SECRET_KEY="sk_live_xxx"
```

### Volitelné - Email přes Resend

Pro odesílání email upozornění doporučujeme [Resend](https://resend.com):

```bash
supabase secrets set RESEND_API_KEY="re_xxx"
```

Alternativně můžete použít SMTP konfiguraci (již nastaveno pro faktury).

---

## 3. Deploy Edge Function

```bash
cd C:\Users\TOMLAP~1\Liquimixer
supabase functions deploy user-cleanup
```

---

## 4. Nastavení CRON jobu

### Možnost A: pg_cron (doporučeno)

1. Jděte do **Supabase Dashboard** → **Database** → **Extensions**
2. Povolte **pg_cron**
3. Spusťte v SQL Editoru:

```sql
-- Vytvořit CRON job - spustit každý den ve 3:00 ráno
SELECT cron.schedule(
  'user-cleanup-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/user-cleanup',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{"action": "run"}'::jsonb
  ) AS request_id;
  $$
);
```

### Možnost B: Externí CRON služba

Použijte [cron-job.org](https://cron-job.org) nebo podobnou službu:

- **URL:** `https://your-project.supabase.co/functions/v1/user-cleanup`
- **Metoda:** POST
- **Header:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Body:** `{"action": "run"}`
- **Frekvence:** Denně ve 3:00

---

## 5. Testování

### Manuální spuštění

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/user-cleanup" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "run"}'
```

### Očekávaná odpověď

```json
{
  "success": true,
  "usersChecked": 150,
  "warningsSent": 3,
  "usersDeleted": 1,
  "errors": [],
  "timestamp": "2026-01-09T03:00:00.000Z"
}
```

---

## 6. Monitoring

Výsledky CRON jobu se ukládají do tabulky `audit_log`:

```sql
SELECT * FROM audit_log 
WHERE action LIKE 'user_cleanup%' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Email šablony

### Upozornění před smazáním (CS)

**Předmět:** `LiquiMixer: Váš účet bude smazán za X dní`

Obsahuje:
- Personalizované oslovení
- Počet dní do smazání
- Tlačítko pro obnovení předplatného
- Seznam dat, která budou ztracena

### Potvrzení smazání (CS)

**Předmět:** `LiquiMixer: Váš účet byl smazán`

Obsahuje:
- Informace o smazání
- Odkaz pro vytvoření nového účtu

---

## Bezpečnost

- Edge funkce vyžaduje autorizaci (CRON_SECRET nebo SERVICE_ROLE_KEY)
- Uživatelé jsou mazáni jak v Supabase, tak v Clerk
- Všechny akce jsou logovány do audit_log
- Email upozornění dávají uživatelům možnost obnovit předplatné
