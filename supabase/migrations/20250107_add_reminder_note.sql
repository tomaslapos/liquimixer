-- Přidat sloupec 'note' k tabulce recipe_reminders
-- Tento sloupec bude sloužit pro volitelnou poznámku uživatele k připomínce

ALTER TABLE recipe_reminders 
ADD COLUMN IF NOT EXISTS note TEXT;

-- Komentář pro sloupec
COMMENT ON COLUMN recipe_reminders.note IS 'Optional user note for the reminder';





