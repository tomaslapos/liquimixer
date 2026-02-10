-- Migration: Add stock tracking to recipe_reminders
-- Date: 2026-01-31
-- Purpose: Track liquid consumption with stock percentage and consumed timestamp

-- Add stock_percent column (0-100, default 100)
ALTER TABLE recipe_reminders 
ADD COLUMN IF NOT EXISTS stock_percent INTEGER DEFAULT 100 
CHECK (stock_percent >= 0 AND stock_percent <= 100);

-- Add consumed_at timestamp (null = not consumed)
ALTER TABLE recipe_reminders 
ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ;

-- Create index for filtering active (non-consumed) reminders
CREATE INDEX IF NOT EXISTS idx_reminders_active 
ON recipe_reminders(recipe_id) 
WHERE consumed_at IS NULL;

-- Update existing reminders to have stock_percent = 100
UPDATE recipe_reminders 
SET stock_percent = 100 
WHERE stock_percent IS NULL;

COMMENT ON COLUMN recipe_reminders.stock_percent IS 'Remaining stock percentage (0-100). 0 means consumed.';
COMMENT ON COLUMN recipe_reminders.consumed_at IS 'Timestamp when the liquid was fully consumed (stock reached 0%).';
