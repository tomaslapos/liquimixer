-- ============================================
-- FIX: FCM tokens RLS policies
-- Problem: 10 conflicting/duplicate policies, some checking wrong JWT claim
-- Solution: Drop all, create clean set using auth.jwt()->>'sub' (Clerk user ID)
-- Spusťte v Supabase Dashboard → SQL Editor
-- Datum: 04.03.2026
-- ============================================

-- 1. Drop ALL existing policies on fcm_tokens
DROP POLICY IF EXISTS "Users can delete own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can insert own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can manage own tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can update own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "Users can view own fcm_tokens" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_delete_own" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_insert_own" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_select_own" ON fcm_tokens;
DROP POLICY IF EXISTS "fcm_tokens_update_own" ON fcm_tokens;
DROP POLICY IF EXISTS "service_role_fcm_tokens_all" ON fcm_tokens;

-- 2. Ensure RLS is enabled
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Service role: full access (for edge functions like reminder-notify)
CREATE POLICY "service_role_full_access" ON fcm_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Anon/authenticated users: can manage their own tokens
-- Clerk JWT has user ID in 'sub' claim (accessed via request.jwt.claims->>'sub')
-- We use current_setting to extract the claim from Supabase's JWT processing

-- SELECT: user can see own tokens
CREATE POLICY "fcm_select_own" ON fcm_tokens
  FOR SELECT TO public
  USING (
    clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub')
  );

-- INSERT: user can insert tokens for themselves
CREATE POLICY "fcm_insert_own" ON fcm_tokens
  FOR INSERT TO public
  WITH CHECK (
    clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub')
  );

-- UPDATE: user can update own tokens
CREATE POLICY "fcm_update_own" ON fcm_tokens
  FOR UPDATE TO public
  USING (
    clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub')
  )
  WITH CHECK (
    clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub')
  );

-- DELETE: user can delete own tokens
CREATE POLICY "fcm_delete_own" ON fcm_tokens
  FOR DELETE TO public
  USING (
    clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub')
  );

-- 5. Verify
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies WHERE tablename = 'fcm_tokens';
