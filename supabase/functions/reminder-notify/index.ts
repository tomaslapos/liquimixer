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
const NOTIFICATION_TEXTS: Record<string, { title: string; body: (flavor: string, date: string) => string; unknownFlavor: string }> = {
  cs: { title: '\u{1F9EA} Váš liquid je vyzrálý!', body: (f, d) => `Váš liquid s příchutí ${f} namíchaný dne ${d} je vyzrálý a připraven.`, unknownFlavor: 'neznámá' },
  sk: { title: '\u{1F9EA} Váš liquid je vyzretý!', body: (f, d) => `Váš liquid s príchuťou ${f} namiešaný dňa ${d} je vyzretý a pripravený.`, unknownFlavor: 'neznáma' },
  en: { title: '\u{1F9EA} Your liquid is steeped!', body: (f, d) => `Your liquid with ${f} flavor mixed on ${d} is steeped and ready.`, unknownFlavor: 'unknown' },
  de: { title: '\u{1F9EA} Ihr Liquid ist gereift!', body: (f, d) => `Ihr Liquid mit ${f} Aroma, gemischt am ${d}, ist gereift und bereit.`, unknownFlavor: 'unbekannt' },
  fr: { title: '\u{1F9EA} Votre liquide a mûri !', body: (f, d) => `Votre liquide avec l'arôme ${f} mélangé le ${d} a mûri et est prêt.`, unknownFlavor: 'inconnu' },
  es: { title: '\u{1F9EA} ¡Tu líquido ha madurado!', body: (f, d) => `Tu líquido con aroma ${f} mezclado el ${d} ha madurado y está listo.`, unknownFlavor: 'desconocido' },
  it: { title: '\u{1F9EA} Il tuo liquido è maturato!', body: (f, d) => `Il tuo liquido con aroma ${f} miscelato il ${d} è maturato e pronto.`, unknownFlavor: 'sconosciuto' },
  pl: { title: '\u{1F9EA} Twój liquid dojrzał!', body: (f, d) => `Twój liquid z aromatem ${f} zmieszany ${d} dojrzał i jest gotowy.`, unknownFlavor: 'nieznany' },
  pt: { title: '\u{1F9EA} O seu líquido maturou!', body: (f, d) => `O seu líquido com aroma ${f} misturado em ${d} maturou e está pronto.`, unknownFlavor: 'desconhecido' },
  nl: { title: '\u{1F9EA} Je liquid is gerijpt!', body: (f, d) => `Je liquid met ${f} aroma gemengd op ${d} is gerijpt en klaar.`, unknownFlavor: 'onbekend' },
  ru: { title: '\u{1F9EA} Ваш жидкость созрела!', body: (f, d) => `Ваша жидкость с ароматом ${f}, смешанная ${d}, созрела и готова.`, unknownFlavor: 'неизвестный' },
  uk: { title: '\u{1F9EA} Ваш рідина дозріла!', body: (f, d) => `Ваша рідина з ароматом ${f}, змішана ${d}, дозріла та готова.`, unknownFlavor: 'невідомий' },
  ja: { title: '\u{1F9EA} リキッドが熟成しました！', body: (f, d) => `${d}に混合した${f}フレーバーのリキッドが熟成し、準備完了です。`, unknownFlavor: '不明' },
  ko: { title: '\u{1F9EA} 리퀴드가 숙성되었습니다!', body: (f, d) => `${d}에 혼합한 ${f} 향의 리퀴드가 숙성되어 준비되었습니다.`, unknownFlavor: '알 수 없음' },
  'zh-CN': { title: '\u{1F9EA} 您的烟液已熟化！', body: (f, d) => `您在${d}混合的${f}口味烟液已熟化并准备就绪。`, unknownFlavor: '未知' },
  'zh-TW': { title: '\u{1F9EA} 您的煙液已熟化！', body: (f, d) => `您在${d}混合的${f}口味煙液已熟化並準備就緒。`, unknownFlavor: '未知' },
  'ar-SA': { title: '\u{1F9EA} السائل الخاص بك جاهز!', body: (f, d) => `السائل بنكهة ${f} المخلوط في ${d} قد نضج وجاهز.`, unknownFlavor: 'غير معروف' },
  sv: { title: '\u{1F9EA} Din vätska har mognat!', body: (f, d) => `Din vätska med ${f} arom blandad den ${d} har mognat och är klar.`, unknownFlavor: 'okänd' },
  da: { title: '\u{1F9EA} Din væske er modnet!', body: (f, d) => `Din væske med ${f} aroma blandet den ${d} er modnet og klar.`, unknownFlavor: 'ukendt' },
  fi: { title: '\u{1F9EA} Nesteesi on kypsynyt!', body: (f, d) => `${d} sekoitettu ${f}-aromi nesteesi on kypsynyt ja valmis.`, unknownFlavor: 'tuntematon' },
  no: { title: '\u{1F9EA} Væsken din er modnet!', body: (f, d) => `Væsken din med ${f} aroma blandet den ${d} er modnet og klar.`, unknownFlavor: 'ukjent' },
  hr: { title: '\u{1F9EA} Vaš liquid je sazrio!', body: (f, d) => `Vaš liquid s aromom ${f} miješan ${d} je sazrio i spreman.`, unknownFlavor: 'nepoznato' },
  sr: { title: '\u{1F9EA} Ваш liquid је сазрео!', body: (f, d) => `Ваш liquid са аромом ${f} мешан ${d} је сазрео и спреман.`, unknownFlavor: 'непознато' },
  bg: { title: '\u{1F9EA} Вашият течност узря!', body: (f, d) => `Вашият течност с аромат ${f}, смесен на ${d}, узря и е готов.`, unknownFlavor: 'неизвестен' },
  ro: { title: '\u{1F9EA} Lichidul tău s-a maturat!', body: (f, d) => `Lichidul tău cu aroma ${f} amestecat pe ${d} s-a maturat și este gata.`, unknownFlavor: 'necunoscut' },
  lt: { title: '\u{1F9EA} Jūsų skystis subrandino!', body: (f, d) => `Jūsų skystis su ${f} aromatu, sumaišytas ${d}, subrandino ir paruoštas.`, unknownFlavor: 'nežinomas' },
  lv: { title: '\u{1F9EA} Jūsu šķidrums ir nogatavināts!', body: (f, d) => `Jūsu šķidrums ar ${f} aromātu, sajaukts ${d}, ir nogatavināts un gatavs.`, unknownFlavor: 'nezināms' },
  et: { title: '\u{1F9EA} Teie vedelik on küpsenud!', body: (f, d) => `Teie ${d} segatud ${f} aroomiga vedelik on küpsenud ja valmis.`, unknownFlavor: 'tundmatu' },
  hu: { title: '\u{1F9EA} A liquidod megérett!', body: (f, d) => `A ${d}-n kevert ${f} aromájú liquidod megérett és kész.`, unknownFlavor: 'ismeretlen' },
  el: { title: '\u{1F9EA} Το υγρό σας ωρίμασε!', body: (f, d) => `Το υγρό σας με άρωμα ${f} που αναμίχθηκε στις ${d} ωρίμασε και είναι έτοιμο.`, unknownFlavor: 'άγνωστο' },
  tr: { title: '\u{1F9EA} Sıvınız olgunlaştı!', body: (f, d) => `${d} tarihinde karıştırılan ${f} aromalı sıvınız olgunlaştı ve hazır.`, unknownFlavor: 'bilinmeyen' },
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
    // Also exclude consumed reminders (consumed_at IS NULL)
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
      .eq("status", "pending")
      .lte("remind_at", currentDate)
      .is("consumed_at", null);

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

        // Create localized notification message
        const texts = getNotificationText(userLocale);
        const flavorName = reminder.flavor_name || texts.unknownFlavor;
        const title = texts.title;
        const body = texts.body(flavorName, formattedDate);

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





