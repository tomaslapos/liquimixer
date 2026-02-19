-- ============================================
-- UPDATE contact_messages_status_check constraint
-- Datum: 19.02.2026
-- Popis: Přidání nových statusů pro N8N workflow
-- ============================================

-- Drop starý check constraint
ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;

-- Vytvořit nový s kompletním seznamem statusů
ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check 
  CHECK (status IN (
    'new',
    'ai_processing',
    'auto_resolved',
    'needs_human',
    'admin_replied',
    'sent',
    'closed',
    'spam',
    'silent_discard',
    'duplicate_resolved',
    'gdpr_pending',
    'gdpr_confirmed',
    'gdpr_cancelled'
  ));
