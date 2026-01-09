// Supabase Edge Function for sending maturity reminder notifications
// Uses Firebase Cloud Messaging V1 API with Service Account authentication

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  getCorsHeaders, 
  handleCorsPreflight, 
  checkRateLimit, 
  getRateLimitIdentifier,
  rateLimitResponse 
} from '../_shared/cors.ts'

// Get access token for FCM V1 API using Service Account
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // Token valid for 1 hour

  // Create JWT header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // Create JWT payload
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  // Base64URL encode
  const base64UrlEncode = (obj: any) => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

  // Import private key and sign
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${signatureEncoded}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Failed to get access token:", tokenData);
    throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

// Send notification using FCM V1 API
async function sendNotification(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message = {
    message: {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          requireInteraction: true,
        },
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("FCM send error:", responseData);
      return false;
    }

    console.log("Notification sent successfully:", responseData);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsPreflight(origin);
  }

  // Rate limiting (pro CRON job je vyšší limit)
  const identifier = getRateLimitIdentifier(req)
  const rateCheck = checkRateLimit(identifier, 'reminder-notify')
  
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetAt, origin)
  }

  try {
    // Get service account from environment
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDate = now.toISOString().split("T")[0];

    console.log(`Checking reminders for date: ${currentDate}, hour: ${currentHour}`);

    // Find reminders that should be sent today
    // We check for reminders where remind_at is today and status is pending
    const { data: reminders, error: remindersError } = await supabase
      .from("recipe_reminders")
      .select(`
        id,
        recipe_id,
        clerk_id,
        mixed_at,
        remind_at,
        remind_time,
        flavor_name,
        recipe_name,
        timezone,
        status
      `)
      .eq("status", "pending")
      .lte("remind_at", currentDate);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token for FCM
    const accessToken = await getAccessToken(serviceAccount);

    let sentCount = 0;
    let errorCount = 0;

    for (const reminder of reminders) {
      try {
        // Check if it's time to send (around 16:30 local time)
        // For simplicity, we send all pending reminders whose date has passed
        
        // Get FCM tokens for this user
        const { data: tokens, error: tokensError } = await supabase
          .from("fcm_tokens")
          .select("token")
          .eq("clerk_id", reminder.clerk_id);

        if (tokensError) {
          console.error(`Error fetching tokens for user ${reminder.clerk_id}:`, tokensError);
          errorCount++;
          continue;
        }

        if (!tokens || tokens.length === 0) {
          console.log(`No FCM tokens for user ${reminder.clerk_id}`);
          // Mark as sent anyway to avoid repeated attempts
          await supabase
            .from("recipe_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);
          continue;
        }

        // Format date for notification
        const mixedDate = new Date(reminder.mixed_at);
        const formattedDate = `${mixedDate.getDate().toString().padStart(2, "0")}.${(mixedDate.getMonth() + 1).toString().padStart(2, "0")}.${mixedDate.getFullYear()}`;

        // Create notification message
        const title = "🧪 Váš liquid je vyzrálý!";
        const body = `Váš liquid s příchutí ${reminder.flavor_name || "neznámá"} namíchaný dne ${formattedDate} je vyzrálý a připraven.`;

        // Send to all user's devices
        let anySent = false;
        for (const { token } of tokens) {
          const sent = await sendNotification(
            accessToken,
            serviceAccount.project_id,
            token,
            title,
            body,
            { recipeId: reminder.recipe_id || "", recipeName: reminder.recipe_name || "" }
          );

          if (sent) {
            anySent = true;
          }
        }

        if (anySent) {
          // Update reminder status
          await supabase
            .from("recipe_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);

          sentCount++;
          console.log(`Reminder ${reminder.id} sent successfully`);
        } else {
          errorCount++;
          console.error(`Failed to send reminder ${reminder.id}`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminders processed",
        total: reminders.length,
        sent: sentCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in reminder-notify function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});





