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

// Localized notification messages for all 31 supported languages
const NOTIFICATION_TEXTS: Record<string, { title: string; body: (name: string, date: string) => string; unknownRecipe: string }> = {
  cs: { title: '\u{1F9EA} Váš liquid je vyzrálý!', body: (n, d) => `Váš liquid ${n} namíchaný dne ${d} je vyzrálý a připraven.`, unknownRecipe: 'liquid' },
  sk: { title: '\u{1F9EA} Váš liquid je vyzretý!', body: (n, d) => `Váš liquid ${n} namiešaný dňa ${d} je vyzretý a pripravený.`, unknownRecipe: 'liquid' },
  en: { title: '\u{1F9EA} Your liquid is steeped!', body: (n, d) => `Your liquid ${n} mixed on ${d} is steeped and ready.`, unknownRecipe: 'liquid' },
  de: { title: '\u{1F9EA} Ihr Liquid ist gereift!', body: (n, d) => `Ihr Liquid ${n}, gemischt am ${d}, ist gereift und bereit.`, unknownRecipe: 'Liquid' },
  fr: { title: '\u{1F9EA} Votre liquide a mûri !', body: (n, d) => `Votre liquide ${n} mélangé le ${d} a mûri et est prêt.`, unknownRecipe: 'liquide' },
  es: { title: '\u{1F9EA} ¡Tu líquido ha madurado!', body: (n, d) => `Tu líquido ${n} mezclado el ${d} ha madurado y está listo.`, unknownRecipe: 'líquido' },
  it: { title: '\u{1F9EA} Il tuo liquido è maturato!', body: (n, d) => `Il tuo liquido ${n} miscelato il ${d} è maturato e pronto.`, unknownRecipe: 'liquido' },
  pl: { title: '\u{1F9EA} Twój liquid dojrzał!', body: (n, d) => `Twój liquid ${n} zmieszany ${d} dojrzał i jest gotowy.`, unknownRecipe: 'liquid' },
  pt: { title: '\u{1F9EA} O seu líquido maturou!', body: (n, d) => `O seu líquido ${n} misturado em ${d} maturou e está pronto.`, unknownRecipe: 'líquido' },
  nl: { title: '\u{1F9EA} Je liquid is gerijpt!', body: (n, d) => `Je liquid ${n} gemengd op ${d} is gerijpt en klaar.`, unknownRecipe: 'liquid' },
  ru: { title: '\u{1F9EA} Ваш жидкость созрела!', body: (n, d) => `Ваша жидкость ${n}, смешанная ${d}, созрела и готова.`, unknownRecipe: 'жидкость' },
  uk: { title: '\u{1F9EA} Ваш рідина дозріла!', body: (n, d) => `Ваша рідина ${n}, змішана ${d}, дозріла та готова.`, unknownRecipe: 'рідина' },
  ja: { title: '\u{1F9EA} リキッドが熟成しました！', body: (n, d) => `${d}に混合したリキッド「${n}」が熟成し、準備完了です。`, unknownRecipe: 'リキッド' },
  ko: { title: '\u{1F9EA} 리퀴드가 숙성되었습니다!', body: (n, d) => `${d}에 혼합한 리퀴드 「${n}」이(가) 숙성되어 준비되었습니다.`, unknownRecipe: '리퀴드' },
  'zh-CN': { title: '\u{1F9EA} 您的烟液已熟化！', body: (n, d) => `您在${d}混合的烟液「${n}」已熟化并准备就绪。`, unknownRecipe: '烟液' },
  'zh-TW': { title: '\u{1F9EA} 您的煙液已熟化！', body: (n, d) => `您在${d}混合的煙液「${n}」已熟化並準備就緒。`, unknownRecipe: '煙液' },
  'ar-SA': { title: '\u{1F9EA} السائل الخاص بك جاهز!', body: (n, d) => `السائل ${n} المخلوط في ${d} قد نضج وجاهز.`, unknownRecipe: 'السائل' },
  sv: { title: '\u{1F9EA} Din vätska har mognat!', body: (n, d) => `Din vätska ${n} blandad den ${d} har mognat och är klar.`, unknownRecipe: 'vätska' },
  da: { title: '\u{1F9EA} Din væske er modnet!', body: (n, d) => `Din væske ${n} blandet den ${d} er modnet og klar.`, unknownRecipe: 'væske' },
  fi: { title: '\u{1F9EA} Nesteesi on kypsynyt!', body: (n, d) => `${d} sekoitettu neste ${n} on kypsynyt ja valmis.`, unknownRecipe: 'neste' },
  no: { title: '\u{1F9EA} Væsken din er modnet!', body: (n, d) => `Væsken din ${n} blandet den ${d} er modnet og klar.`, unknownRecipe: 'væske' },
  hr: { title: '\u{1F9EA} Vaš liquid je sazrio!', body: (n, d) => `Vaš liquid ${n} miješan ${d} je sazrio i spreman.`, unknownRecipe: 'liquid' },
  sr: { title: '\u{1F9EA} Ваш liquid је сазрео!', body: (n, d) => `Ваш liquid ${n} мешан ${d} је сазрео и спреман.`, unknownRecipe: 'liquid' },
  bg: { title: '\u{1F9EA} Вашият течност узря!', body: (n, d) => `Вашият течност ${n}, смесен на ${d}, узря и е готов.`, unknownRecipe: 'течност' },
  ro: { title: '\u{1F9EA} Lichidul tău s-a maturat!', body: (n, d) => `Lichidul tău ${n} amestecat pe ${d} s-a maturat și este gata.`, unknownRecipe: 'lichid' },
  lt: { title: '\u{1F9EA} Jūsų skystis subrandino!', body: (n, d) => `Jūsų skystis ${n}, sumaišytas ${d}, subrandino ir paruoštas.`, unknownRecipe: 'skystis' },
  lv: { title: '\u{1F9EA} Jūsu šķidrums ir nogatavināts!', body: (n, d) => `Jūsu šķidrums ${n}, sajaukts ${d}, ir nogatavināts un gatavs.`, unknownRecipe: 'šķidrums' },
  et: { title: '\u{1F9EA} Teie vedelik on küpsenud!', body: (n, d) => `Teie ${d} segatud vedelik ${n} on küpsenud ja valmis.`, unknownRecipe: 'vedelik' },
  hu: { title: '\u{1F9EA} A liquidod megérett!', body: (n, d) => `A ${d}-n kevert liquidod (${n}) megérett és kész.`, unknownRecipe: 'liquid' },
  el: { title: '\u{1F9EA} Το υγρό σας ωρίμασε!', body: (n, d) => `Το υγρό σας ${n} που αναμίχθηκε στις ${d} ωρίμασε και είναι έτοιμο.`, unknownRecipe: 'υγρό' },
  tr: { title: '\u{1F9EA} Sıvınız olgunlaştı!', body: (n, d) => `${d} tarihinde karıştırılan sıvınız ${n} olgunlaştı ve hazır.`, unknownRecipe: 'sıvı' },
};

// Get notification text for a given locale
function getNotificationText(locale: string | null): typeof NOTIFICATION_TEXTS['en'] {
  if (locale && NOTIFICATION_TEXTS[locale]) return NOTIFICATION_TEXTS[locale];
  // Try base language (e.g. 'ar' from 'ar-SA')
  if (locale) {
    const base = locale.split('-')[0];
    if (NOTIFICATION_TEXTS[base]) return NOTIFICATION_TEXTS[base];
  }
  return NOTIFICATION_TEXTS['en'];
}

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
  // Handle both actual newlines and escaped \n sequences in the PEM key
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\\n/g, "")  // Remove escaped \n (literal backslash-n)
    .replace(/\n/g, "")   // Remove actual newlines
    .replace(/\r/g, "")   // Remove carriage returns
    .replace(/\s/g, "");  // Remove any remaining whitespace

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
// Returns: 'sent' | 'not_found' | 'error'
async function sendNotification(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<'sent' | 'not_found' | 'error'> {
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
          icon: "https://www.liquimixer.com/icons/icon-192.png",
          data: data || {},
        },
        fcm_options: {
          link: "https://www.liquimixer.com/",
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
      // Check if token is invalid/expired (NOT_FOUND or UNREGISTERED)
      const errorStatus = responseData?.error?.status || '';
      const errorMessage = responseData?.error?.message || '';
      if (response.status === 404 || errorStatus === 'NOT_FOUND' || 
          errorMessage.includes('not found') || errorMessage.includes('UNREGISTERED')) {
        console.warn(`FCM token invalid (${errorStatus}): ${fcmToken.substring(0, 20)}...`);
        return 'not_found';
      }
      console.error("FCM send error:", responseData);
      return 'error';
    }

    console.log("Notification sent successfully:", responseData?.name);
    return 'sent';
  } catch (error) {
    console.error("Error sending notification:", error);
    return 'error';
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

    // Find reminders that should be notified today
    // 1. status=pending, remind_at <= today, sent_at IS NULL → new reminders ready to fire
    // 2. status=matured, sent_at IS NULL → push failed previously (no FCM tokens), retry
    // Exclude consumed reminders (consumed_at IS NULL)
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
        status,
        consumed_at,
        stock_percent
      `)
      .in("status", ["pending", "matured"])
      .lte("remind_at", currentDate)
      .is("consumed_at", null)
      .is("sent_at", null);

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
        // Skip reminders with 0% stock (consumed)
        const stockPercent = reminder.stock_percent ?? 100;
        if (stockPercent <= 0) {
          console.log(`Reminder ${reminder.id} has 0% stock, skipping`);
          continue;
        }
        
        // Get user locale for localized notifications
        const { data: userData } = await supabase
          .from("users")
          .select("locale")
          .eq("clerk_id", reminder.clerk_id)
          .single();
        
        const userLocale = userData?.locale || null;
        
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
          console.log(`No FCM tokens for user ${reminder.clerk_id}, marking matured but keeping sent_at NULL for retry`);
          // Mark as matured (liquid IS ready) but do NOT set sent_at
          // Next CRON run will find this reminder (sent_at IS NULL) and retry push notification
          await supabase
            .from("recipe_reminders")
            .update({ status: "matured" })
            .eq("id", reminder.id);
          continue;
        }

        // Format date for notification
        const mixedDate = new Date(reminder.mixed_at);
        const formattedDate = `${mixedDate.getDate().toString().padStart(2, "0")}.${(mixedDate.getMonth() + 1).toString().padStart(2, "0")}.${mixedDate.getFullYear()}`;

        // Create localized notification message
        const texts = getNotificationText(userLocale);
        const recipeName = reminder.recipe_name || reminder.flavor_name || texts.unknownRecipe;
        const title = texts.title;
        const body = texts.body(recipeName, formattedDate);

        // Send to all user's devices
        let anySent = false;
        const invalidTokens: string[] = [];
        for (const { token } of tokens) {
          const result = await sendNotification(
            accessToken,
            serviceAccount.project_id,
            token,
            title,
            body,
            { recipeId: reminder.recipe_id || "", recipeName: reminder.recipe_name || "" }
          );

          if (result === 'sent') {
            anySent = true;
          } else if (result === 'not_found') {
            invalidTokens.push(token);
          }
        }

        // Auto-cleanup invalid/expired FCM tokens
        if (invalidTokens.length > 0) {
          console.log(`Cleaning up ${invalidTokens.length} invalid FCM tokens for user ${reminder.clerk_id}`);
          for (const badToken of invalidTokens) {
            await supabase
              .from("fcm_tokens")
              .delete()
              .eq("token", badToken);
          }
        }

        if (anySent) {
          // Update reminder status — liquid is matured and ready to use
          await supabase
            .from("recipe_reminders")
            .update({ status: "matured", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);

          sentCount++;
          console.log(`Reminder ${reminder.id} sent successfully`);
        } else if (invalidTokens.length === tokens.length) {
          // All tokens were invalid — mark reminder as failed, don't retry forever
          console.warn(`All FCM tokens invalid for reminder ${reminder.id}, marking as no_tokens`);
          await supabase
            .from("recipe_reminders")
            .update({ status: "no_tokens", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);
          errorCount++;
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





