-- Fix FCM tokens table - add unique constraint on token column
-- Run this in Supabase SQL Editor

-- First, check current table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'fcm_tokens';

-- Check existing constraints
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'fcm_tokens';

-- Remove duplicate tokens (keep the most recent one)
DELETE FROM fcm_tokens a
USING fcm_tokens b
WHERE a.id < b.id 
AND a.token = b.token;

-- Add unique constraint on token column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'fcm_tokens' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'fcm_tokens_token_key'
    ) THEN
        ALTER TABLE fcm_tokens ADD CONSTRAINT fcm_tokens_token_key UNIQUE (token);
    END IF;
END $$;

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'fcm_tokens';
