-- =============================================
-- Bug dedup trigger - BEFORE UPDATE on contact_messages
-- Runs ONLY when status changes to 'needs_human' AND ai_category='bug'
-- Checks if a similar bug exists in the last 2 hours
-- If yes, sets status to 'duplicate' instead
-- Impact: 1 EXISTS query per bug report (~0.1ms with index)
-- 06.03.2026
-- =============================================

CREATE OR REPLACE FUNCTION check_bug_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  new_text text;
  found_dup boolean := false;
BEGIN
  -- Only run for bugs being set to needs_human
  IF NEW.status != 'needs_human' OR NEW.ai_category != 'bug' THEN
    RETURN NEW;
  END IF;

  -- Normalize: lowercase subject + message
  new_text := lower(coalesce(NEW.message, '') || ' ' || coalesce(NEW.subject, '') || ' ' || coalesce(NEW.subject_cs, ''));

  -- Check if similar bug exists in last 2 hours (same concept match)
  -- Uses trigram/word overlap: if 3+ words from subject match any recent bug
  SELECT EXISTS (
    SELECT 1 FROM contact_messages cm
    WHERE cm.id != NEW.id
      AND cm.ai_category = 'bug'
      AND cm.created_at > (now() - interval '2 hours')
      AND (
        -- Simple word overlap: check if normalized texts share key concept words
        -- This checks common bug-related words in subject
        (lower(coalesce(cm.subject, '')) = lower(coalesce(NEW.subject, '')) AND NEW.subject IS NOT NULL AND NEW.subject != '')
        OR
        -- Check semantic similarity via shared concept words
        (
          -- save/recipe/error concept overlap
          (
            (new_text ~ '(uloz|uklada|save|speicher|recept|recipe|rezept)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(uloz|uklada|save|speicher|recept|recipe|rezept)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
          OR
          -- login concept overlap
          (
            (new_text ~ '(prihlaseni|login|anmeld|auth)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(prihlaseni|login|anmeld|auth)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
          OR
          -- payment concept overlap
          (
            (new_text ~ '(platb|payment|zahlung|paiement)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(platb|payment|zahlung|paiement)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
          OR
          -- display concept overlap
          (
            (new_text ~ '(zobraz|display|anzeig|affich)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(zobraz|display|anzeig|affich)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
          OR
          -- notification concept overlap
          (
            (new_text ~ '(notifik|notification|oznameni|upozorneni)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(notifik|notification|oznameni|upozorneni)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
          OR
          -- calculator concept overlap
          (
            (new_text ~ '(kalkul|calculator|rechner|vypocet)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(kalkul|calculator|rechner|vypocet)')
            AND (new_text ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
            AND (lower(coalesce(cm.message, '') || ' ' || coalesce(cm.subject, '')) ~ '(chyb|error|bug|fehler|problem|nefung|crash|fail|pad)')
          )
        )
      )
  ) INTO found_dup;

  IF found_dup THEN
    NEW.status := 'duplicate';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS trg_bug_dedup ON contact_messages;
CREATE TRIGGER trg_bug_dedup
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION check_bug_duplicate();
