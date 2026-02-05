-- Fix RLS policies for recipe_ratings table
-- The app uses Clerk for auth and Supabase anon key, so we need permissive RLS
-- Date: 2026-02-05

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read ratings" ON recipe_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON recipe_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON recipe_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON recipe_ratings;

-- Create new permissive policies that work with anon key
-- (Clerk authentication is verified in the application layer)

-- Policy for SELECT - anyone can read ratings
CREATE POLICY "Anyone can read ratings" ON recipe_ratings
    FOR SELECT USING (true);

-- Policy for INSERT - allow insert (clerk_id verified in app)
CREATE POLICY "Allow insert ratings" ON recipe_ratings
    FOR INSERT WITH CHECK (true);

-- Policy for UPDATE - allow update (clerk_id verified in app)
CREATE POLICY "Allow update ratings" ON recipe_ratings
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy for DELETE - allow delete (clerk_id verified in app)
CREATE POLICY "Allow delete ratings" ON recipe_ratings
    FOR DELETE USING (true);

-- Verify policies were created
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename = 'recipe_ratings';
