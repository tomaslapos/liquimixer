-- =============================================
-- ANALYTICS DB: Přidat deleted_at do report_recipes a report_products
-- Spustit v SQL Editoru ANALYTICS projektu
-- 11.03.2026
-- =============================================

ALTER TABLE report_recipes 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_report_recipes_deleted 
    ON report_recipes(deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE report_products 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_report_products_deleted 
    ON report_products(deleted_at) WHERE deleted_at IS NOT NULL;
