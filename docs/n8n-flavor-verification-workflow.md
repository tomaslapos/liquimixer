# n8n Workflow: Flavor Suggestion Verification

## Overview

This n8n workflow automatically verifies user-submitted flavor suggestions and sends email notifications about the result.

## Workflow Structure

```
[Schedule Trigger] → [Get Pending Flavors] → [AI Verification] → [Update Status] → [Send Email]
```

## Nodes Configuration

### 1. Schedule Trigger
- **Type:** Schedule Trigger
- **Interval:** Every 1 hour
- **Purpose:** Periodically check for pending flavor suggestions

### 2. Get Pending Flavors (Supabase)
- **Type:** Supabase Node or HTTP Request
- **Operation:** Select rows
- **Query:**
```sql
SELECT 
    f.*,
    m.name as manufacturer_name,
    u.email as user_email,
    u.preferred_locale as user_locale
FROM flavors f
LEFT JOIN flavor_manufacturers m ON f.manufacturer_code = m.code
LEFT JOIN users u ON f.submitted_by = u.clerk_id
WHERE f.status = 'pending'
ORDER BY f.created_at ASC
LIMIT 10
```

### 3. AI Verification (OpenAI/Claude)
- **Type:** OpenAI or HTTP Request to Claude API
- **Purpose:** Validate the flavor data
- **Prompt:**
```
You are a flavor verification assistant for an e-liquid mixing application.

Analyze this flavor submission and determine if it should be approved:

Name: {{$json.name}}
Manufacturer: {{$json.manufacturer_name}} ({{$json.manufacturer_code}})
Type: {{$json.product_type}}
Category: {{$json.category}}
Min %: {{$json.min_percent}}
Max %: {{$json.max_percent}}
Steep days: {{$json.steep_days}}

Verification rules:
1. Check if the flavor name looks legitimate (not spam, profanity, or random text)
2. Verify the manufacturer code matches a known vape/shisha flavor manufacturer
3. Check if percentage values are within reasonable range (0.5-25% for vape, null for shisha)
4. Verify steep days are reasonable (0-60 days)
5. Check if category matches the expected flavor profile

Respond with JSON:
{
  "approved": true/false,
  "reason": "Reason for approval/rejection",
  "confidence": 0.0-1.0
}
```

### 4. Check Duplicates (Supabase)
- **Type:** Supabase Node
- **Purpose:** Check for existing similar flavors
- **Query:**
```sql
SELECT id, name, manufacturer_code 
FROM flavors 
WHERE status = 'active'
AND manufacturer_code = '{{$json.manufacturer_code}}'
AND LOWER(name) LIKE '%' || LOWER('{{$json.name}}') || '%'
LIMIT 1
```

### 5. Update Flavor Status (Supabase)
- **Type:** Supabase Node
- **Operation:** Update
- **If approved:**
```sql
UPDATE flavors 
SET 
    status = 'active',
    verified_at = NOW()
WHERE id = '{{$json.id}}'
```
- **If rejected:**
```sql
UPDATE flavors 
SET 
    status = 'rejected',
    rejection_reason = '{{$json.ai_reason}}',
    verified_at = NOW()
WHERE id = '{{$json.id}}'
```

### 6. Send Email Notification
- **Type:** SMTP Node
- **From:** noreply@liquimixer.com
- **To:** {{$json.user_email}}
- **Subject (approved):** 
  - Get from translations based on user_locale
  - Default: "LiquiMixer: Your flavor suggestion was approved"
- **Subject (rejected):**
  - Default: "LiquiMixer: Your flavor suggestion was rejected"
- **Body Template:**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { color: #00ffff; font-size: 24px; font-weight: bold; }
        .content { background: #16213e; padding: 30px; border-radius: 10px; }
        .status-approved { color: #00ff88; }
        .status-rejected { color: #ff6b6b; }
        .flavor-name { font-size: 1.2em; color: #00ffff; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LiquiMixer</div>
        </div>
        <div class="content">
            {{#if approved}}
            <h2 class="status-approved">✓ Flavor Approved!</h2>
            <p>Your flavor suggestion <span class="flavor-name">{{flavor_name}}</span> has been verified and added to the public flavor database.</p>
            <p>Other users can now discover and use your flavor in their recipes.</p>
            {{else}}
            <h2 class="status-rejected">✗ Flavor Not Approved</h2>
            <p>Unfortunately, your flavor suggestion <span class="flavor-name">{{flavor_name}}</span> was not approved.</p>
            <p><strong>Reason:</strong> {{rejection_reason}}</p>
            <p>You can still use this flavor in your personal favorites.</p>
            {{/if}}
        </div>
        <div class="footer">
            <p>This is an automated message from LiquiMixer.</p>
            <p>© 2026 LiquiMixer | <a href="https://liquimixer.com">liquimixer.com</a></p>
        </div>
    </div>
</body>
</html>
```

## SMTP Configuration

- **Host:** (from Supabase secrets or environment)
- **Port:** 587 (TLS) or 465 (SSL)
- **User:** noreply@liquimixer.com
- **Password:** (from secrets)

## Error Handling

1. **AI API Failure:** Set status to 'verified' (manual review needed) and alert admin
2. **Email Failure:** Log to database, retry later
3. **Database Error:** Retry with exponential backoff

## Monitoring

- Log all workflow runs to a `workflow_logs` table
- Alert on consecutive failures
- Track approval/rejection ratio

## Rate Limiting

The application already handles rate limiting (5 per week per user) in `database.js`.

## Webhook Alternative

Instead of scheduled polling, you can use a webhook trigger:

1. Create Supabase Edge Function that calls n8n webhook on INSERT
2. Trigger URL: `https://your-n8n.app/webhook/flavor-verification`

```typescript
// supabase/functions/flavor-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record } = await req.json()
  
  // Only trigger for new pending flavors
  if (record.status !== 'pending') {
    return new Response('Skipped', { status: 200 })
  }
  
  // Call n8n webhook
  const response = await fetch(Deno.env.get('N8N_WEBHOOK_URL')!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  })
  
  return new Response('OK', { status: 200 })
})
```

## Database Trigger for Webhook

```sql
CREATE OR REPLACE FUNCTION notify_flavor_submission()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        PERFORM net.http_post(
            url := 'https://your-n8n.app/webhook/flavor-verification',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flavor_webhook
AFTER INSERT ON flavors
FOR EACH ROW
EXECUTE FUNCTION notify_flavor_submission();
```

## Import into n8n

The workflow JSON can be generated and imported directly into n8n via the UI.
