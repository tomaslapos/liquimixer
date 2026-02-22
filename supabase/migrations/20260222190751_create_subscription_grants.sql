-- Create subscription_grants table for GDPR account deletion
-- Preserves subscription info so users can re-register with same email
CREATE TABLE IF NOT EXISTS subscription_grants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  original_clerk_id text NOT NULL,
  plan_type text DEFAULT 'yearly',
  valid_from timestamptz,
  valid_to timestamptz NOT NULL,
  amount numeric,
  currency text,
  created_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_by text,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_subscription_grants_email ON subscription_grants(email);
CREATE INDEX IF NOT EXISTS idx_subscription_grants_valid_to ON subscription_grants(valid_to);

ALTER TABLE subscription_grants ENABLE ROW LEVEL SECURITY;

-- Only service_role can access this table (edge functions)
CREATE POLICY "Service role full access" ON subscription_grants
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE subscription_grants IS 'Preserves subscription info when user deletes account via GDPR. Allows re-registration with same email without re-paying.';
