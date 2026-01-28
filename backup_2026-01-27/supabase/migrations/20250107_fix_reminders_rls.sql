-- Fix RLS policies for recipe_reminders table
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'recipe_reminders';

-- Enable RLS if not already enabled
ALTER TABLE recipe_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON recipe_reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON recipe_reminders;

-- Create new policies that work with anon key
-- Policy for SELECT
CREATE POLICY "Users can view own reminders" ON recipe_reminders
    FOR SELECT USING (true);

-- Policy for INSERT
CREATE POLICY "Users can insert own reminders" ON recipe_reminders
    FOR INSERT WITH CHECK (true);

-- Policy for UPDATE  
CREATE POLICY "Users can update own reminders" ON recipe_reminders
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy for DELETE
CREATE POLICY "Users can delete own reminders" ON recipe_reminders
    FOR DELETE USING (true);

-- Same for fcm_tokens
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can insert own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can update own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can delete own fcm_tokens" ON fcm_tokens;

CREATE POLICY "Users can view own fcm_tokens" ON fcm_tokens
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own fcm_tokens" ON fcm_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own fcm_tokens" ON fcm_tokens
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete own fcm_tokens" ON fcm_tokens
    FOR DELETE USING (true);

-- Verify policies were created
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('recipe_reminders', 'fcm_tokens');





