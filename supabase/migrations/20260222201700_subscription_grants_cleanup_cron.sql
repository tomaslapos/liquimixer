-- Cleanup expired and redeemed subscription_grants
-- Runs daily at 3:00 AM UTC via pg_cron

-- Delete grants where:
-- 1. valid_to has passed (expired, no longer useful) AND not redeemed
-- 2. redeemed more than 30 days ago (already applied, keep for audit briefly)

SELECT cron.schedule(
  'cleanup-subscription-grants',
  '0 3 * * *',
  $$
    DELETE FROM subscription_grants
    WHERE 
      (valid_to < now() AND redeemed_at IS NULL)
      OR
      (redeemed_at IS NOT NULL AND redeemed_at < now() - interval '30 days');
  $$
);

COMMENT ON TABLE subscription_grants IS 'Preserves subscription info when user deletes account via GDPR. Auto-cleaned daily: expired unredeemed grants removed, redeemed grants kept 30 days for audit.';
