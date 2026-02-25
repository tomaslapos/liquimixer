-- ============================================
-- FIX: Přidání 'matured' do recipe_reminders status check
-- Datum: 25.02.2026
-- Popis: Edge funkce reminder-notify zapisovala status 'sent',
--        což rozbíjelo filtry a badge v aplikaci.
--        Oprava: status 'sent' → 'matured' (liquid je vyzrálý).
-- ============================================

-- 1. Drop starý check constraint
ALTER TABLE recipe_reminders DROP CONSTRAINT IF EXISTS recipe_reminders_status_check;

-- 2. Vytvořit nový s 'matured' místo 'sent'
ALTER TABLE recipe_reminders ADD CONSTRAINT recipe_reminders_status_check 
  CHECK (status IN ('pending', 'matured', 'cancelled', 'no_tokens'));

-- 3. Migrovat existující data: sent → matured
UPDATE recipe_reminders SET status = 'matured' WHERE status = 'sent';
