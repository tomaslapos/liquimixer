import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  getCorsHeaders,
  handleCorsPreflight,
} from '../_shared/cors.ts'

// Analytics DB
const ANALYTICS_URL = Deno.env.get('ANALYTICS_SUPABASE_URL')!
const ANALYTICS_KEY = Deno.env.get('ANALYTICS_SUPABASE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

// Hlavní DB (pro ověření dashboard uživatele)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Kompletní manuál datové struktury pro AI — NIKDY se neposílá na frontend
const TABLE_SCHEMA = `
=== DATABASE SCHEMA: calculation_logs ===
This is the analytics table for LiquiMixer — a vape e-liquid and shisha mixing calculator app.
Every row = one calculation a user performed.

=== COLUMNS ===
id: UUID (PK)
clerk_id: TEXT (nullable) — Logged-in user ID (starts with "user_"). NULL = anonymous user.
anonymous_id: UUID — Device identifier from localStorage. Same device = same anonymous_id.
session_hash: TEXT — Browser fingerprint (hash of user-agent + locale + screen). Groups sessions.
calc_type: TEXT NOT NULL — Calculator type used. Values:
  'liquid'          — Basic e-liquid calculator (VG/PG/nic/flavor mixing)
  'shakevape'       — Shake & Vape (one-shot concentrate + base)
  'liquidpro'       — PRO multi-flavor calculator (multiple flavors + additives)
  'shortfill'       — Shortfill calculator (bottle + nicotine shots)
  'dilution'        — Nicotine dilution calculator
  'shisha_mix'      — Shisha tobacco mixing (blend tobaccos by %)
  'shisha_diy'      — Shisha DIY (make shisha liquid from scratch)
  'shisha_molasses'  — Shisha molasses maker
  'shisha_tweak'    — Shisha tweak/fix (adjust existing mix)
locale: TEXT — UI language: 'cs','en','sk','de','pl','hu','ro','uk','es','fr','it','pt','nl','da','sv','fi','no','el','bg','hr','sl','sr','lt','lv','et','tr','ja','ko','zh','ar'
country: TEXT (nullable) — ISO 3166-1 alpha-2 country code from Cloudflare geolocation (e.g. 'CZ','SK','DE','US','GB')
device_type: TEXT — 'desktop', 'mobile', or 'tablet'
screen_resolution: TEXT — e.g. '1920x1080', '375x812'
is_pwa: BOOLEAN — true if user runs app as installed PWA
user_agent: TEXT — Full browser user-agent string
referrer: TEXT (nullable) — HTTP referrer URL
created_at: TIMESTAMPTZ — When the calculation was performed

=== params JSONB STRUCTURE (verified from real data) ===

--- Common top-level fields (present in most calc_types via deep copy of recipe data) ---
params->>'formType': TEXT — calculator type identifier: 'liquid','shakevape','liquidpro','shortfill','dilute','shisha'. May be NULL for older records.
params->>'totalAmount': numeric — Target total mix volume in ml (e.g. 100, 60, 110)
params->>'vgPercent': numeric — Target VG percentage (0-100)
params->>'pgPercent': numeric — Target PG percentage (0-100)
params->>'nicotine': numeric — Target nicotine strength in mg/ml (e.g. 3, 6, 12)
params->>'baseType': TEXT — 'separate' (separate VG+PG bottles) or 'premixed' (premixed VG/PG base)
params->>'premixedRatio': TEXT — If premixed, the VG/PG ratio string e.g. '70/30', '50/50'
params->>'actualVg': numeric — Calculated actual VG% (also in results, duplicated from deep copy)
params->>'actualPg': numeric — Calculated actual PG% (also in results, duplicated from deep copy)
params->>'shishaMode': TEXT or null — For shisha: 'mix','diy','molasses','tweak'. NULL for non-shisha calcs.

--- Flavor fields on params (present in liquid, shakevape, and other e-liquid calc_types) ---
params->>'flavorType': TEXT — Flavor category: 'fruit','tobacco','menthol','dessert','drink','candy','none','custom'
params->>'flavorPercent': numeric — Single flavor percentage (e.g. 4, 10, 15)
IMPORTANT: specificFlavor is NOT a nested object — it is FLATTENED into separate top-level keys:
params->>'specificFlavorName': TEXT — Name of the selected DB flavor (e.g. 'Pineapple', 'Strawberry')
params->>'specificFlavorManufacturer': TEXT — Manufacturer name (e.g. 'The Flavor Apprentice', 'Capella', 'TPA')
params->>'specificFlavorId': UUID — Flavor database ID
params->>'specificFlavorSource': TEXT — Source: 'database', 'favorite', 'custom'
params->>'specificFavoriteProductId': UUID or null — Favorite product ID if from favorites
params->'flavors': JSONB array — Multiple flavors (when user uses multi-flavor): [{"type":"fruit","percent":5,"name":"Strawberry","manufacturer":"TPA","id":"uuid","source":"db","vgRatio":0}]
params->'additives': JSONB array — Additives: [{"type":"sweetener","percent":1,"name":"Sucralose"}]

--- _dom (raw DOM input values, present when calculator has specific DOM reads) ---
params->'_dom'->>'nicotineType': TEXT — 'freebase', 'salt', or 'none'
params->'_dom'->>'targetNicotine': numeric — Target nic strength from input
params->'_dom'->>'baseNicotine': numeric — Nicotine base concentration (e.g. 20, 36, 72)
params->'_dom'->>'nicotineRatio': TEXT — Nic base VG/PG ratio (e.g. '50/50', '100/0')
params->'_dom'->>'flavorRatio': TEXT — Flavor VG/PG composition (e.g. '0/100')
params->'_dom'->>'totalAmount': numeric — Total amount from DOM input
params->'_dom'->>'vgPgRatio': numeric — VG slider value (0-100), e.g. 64 means 64% VG
params->'_dom'->>'baseType': TEXT — 'separate' or 'premixed'
params->'_dom'->>'premixedRatio': TEXT — Premixed base ratio from DOM

--- PRO calculator (calc_type='liquidpro') additional fields ---
params->'_dom'->>'nicotineRatioSlider': numeric — PRO nic ratio slider (0-100)
params->'_proFlavors': JSONB array — [{"type":"fruit","percent":5,"vgRatio":0,"name":"Strawberry Ripe","manufacturer":"TPA","id":"uuid","source":"db","favoriteProductId":null,"customComposition":null}]
params->'_proAdditives': JSONB array — [{"type":"sweetener","percent":1,"name":"Super Sweet","customComposition":null}]

--- Shortfill (calc_type='shortfill') ---
params->'_dom'->>'bottleVolume': numeric — Bottle size in ml (e.g. 60)
params->'_dom'->>'liquidVolume': numeric — Pre-filled liquid volume (e.g. 50)
params->'_dom'->>'nicStrength': numeric — Desired final nic strength
params->'_dom'->>'nicShotVolume': numeric — Single nic shot volume (e.g. 10)
params->'_dom'->>'shotCount': numeric — Number of nic shots

--- Dilution (calc_type='dilution') ---
params->'_dom'->>'amountType': TEXT — 'final' or 'source'
params->'_dom'->>'baseStrength': numeric — Source nicotine strength
params->'_dom'->>'targetStrength': numeric — Target nicotine strength
params->'_dom'->>'sourceVg': numeric — Source VG%
params->'_dom'->>'targetVg': numeric — Target VG%
params->'_dom'->>'finalAmount': numeric
params->'_dom'->>'sourceAmount': numeric
params->'_dom'->>'nicotineType': TEXT — 'freebase' or 'salt'

--- Shisha Mix (calc_type='shisha_mix') ---
params->'_dom'->>'bowlSize': numeric — Bowl size in grams (e.g. 15, 20, 25)
params->'_tobaccoDetails': JSONB array — [{"position":1,"percent":50,"name":"Al Fakher Grape","manufacturer":"AF","id":"uuid","favoriteProductId":null,"source":"db"}]

--- Shisha DIY (calc_type='shisha_diy') ---
params->'_dom'->>'tobaccoAmount': numeric — Tobacco amount in grams
params->'_dom'->>'diyRatio': TEXT — VG/PG ratio string
params->'_dom'->>'nicotineType': TEXT
params->'_dom'->>'targetNicotine': numeric
params->'_dom'->>'baseNicotine': numeric
params->'_dom'->>'sweetenerType': TEXT — Type of sweetener
params->'_dom'->>'sweetenerPercent': numeric
params->'_dom'->>'glycerinPercent': numeric
params->'_dom'->>'waterPercent': numeric
params->'_dom'->>'purePgPercent': numeric
params->'_diyFlavors': JSONB array — [{"position":1,"type":"fruit","percent":5,"name":"...","manufacturer":"...","id":"uuid","favoriteProductId":null,"source":"db"}]

--- Shisha Molasses (calc_type='shisha_molasses') ---
params->'_dom'->>'totalAmount': numeric
params->'_dom'->>'sweetenerBase': TEXT — Sweetener base type
params->'_dom'->>'sweetenerPercent': numeric
params->'_dom'->>'glycerinPercent': numeric
params->'_dom'->>'nicotineType': TEXT
params->'_dom'->>'targetNicotine': numeric
params->'_dom'->>'baseNicotine': numeric
params->'_molFlavors': JSONB array — Same structure as _diyFlavors

--- Shisha Tweak (calc_type='shisha_tweak') ---
params->>'tobaccoAmount': numeric — Tobacco amount in grams
params->>'tobaccoName': TEXT — Selected tobacco name
params->'tweakState': JSONB — Complete form state with problem checkboxes, flavor data, nicotine, and mixology settings:
  tweakState->>'problemVg': BOOLEAN — "Tabák je suchý, málo dýmí" checkbox
  tweakState->>'problemTaste': BOOLEAN — "Tabák málo chutná" checkbox
  tweakState->>'problemFlavor': BOOLEAN — "Chci změnit/přidat příchuť" checkbox
  tweakState->>'problemNicotine': BOOLEAN — "Chci přidat nikotin" checkbox
  tweakState->>'problemMixology': BOOLEAN — "Mixology — pokročilé úpravy" checkbox
  tweakState->>'vgPercent': numeric — Glycerin (VG) percentage (0-30)
  tweakState->'flavors': JSONB array — [{type, strength, flavorRatio}] up to 4 flavors
  tweakState->'flavorData': JSONB array — Autocomplete data for each flavor [{name, manufacturer, id, source}]
  tweakState->'tobaccoData': JSONB — Selected tobacco autocomplete data {name, manufacturer, source, flavor_id}
  tweakState->>'nicotineType': TEXT — 'freebase' or 'salt'
  tweakState->>'nicotineBaseStrength': numeric — Nicotine base concentration mg/ml
  tweakState->>'nicotineTarget': numeric — Target nicotine mg/ml (0-10)
  --- Mixology advanced additives (present when problemMixology=true) ---
  tweakState->>'mixHoney': BOOLEAN — Med (honey) checkbox
  tweakState->>'mixHoneyPercent': numeric — Honey % of tobacco (0-20, default 5)
  tweakState->>'mixMolasses': BOOLEAN — Melasa checkbox
  tweakState->>'mixMolassesPercent': numeric — Molasses % of tobacco (0-30, default 10)
  tweakState->>'mixMenthol': BOOLEAN — Mentol/Cooling checkbox
  tweakState->>'mixMentholDrops': INT — Menthol drops per 20g (0-10, default 3)
  tweakState->>'mixCitric': BOOLEAN — Kyselina citronová checkbox
  tweakState->>'mixCitricGrams': numeric — Citric acid grams per 20g (0-5, default 0.5)
  tweakState->>'mixWater': BOOLEAN — Voda/ovocná šťáva checkbox
  tweakState->>'mixWaterPercent': numeric — Water % of tobacco (0-20, default 5)

=== results JSONB STRUCTURE (verified from real data) ===
results->>'actualVg': numeric — Final calculated VG percentage
results->>'actualPg': numeric — Final calculated PG percentage
results->'ingredients': JSONB array — All ingredients with volumes. Each element:
  {
    "key": TEXT — ingredient identifier (see key values below),
    "volume": numeric — volume in ml,
    "percent": numeric — percentage of total mix,
    "grams": numeric or null — weight in grams (if calculated),
    "vgRatio": numeric or null — VG ratio of this ingredient,
    "flavorName": TEXT or null — flavor name from DB (present ONLY for flavor ingredients),
    "flavorManufacturer": TEXT or null — manufacturer name,
    "flavorId": UUID or null — flavor DB ID,
    "flavorSource": TEXT or null — 'database','favorite','custom',
    "flavorType": TEXT or null — flavor category,
    "flavorNumber": numeric or null,
    "flavorIndex": numeric or null,
    "favoriteProductId": UUID or null,
    "additiveType": TEXT or null — additive type (for additive ingredients),
    "customComposition": JSONB or null — custom VG/PG composition,
    "displayAmount": TEXT or null,
    "params": JSONB or null — nested params like {"vgpg":"50/50","strength":20}
  }
  Ingredient key values:
    E-liquid: 'vgBase','pgBase','premixedBase','nicotine','nicotine_booster','water',
              'flavor' (single flavor), 'flavor1'..'flavor4' (multi-flavor),
              'additive1'..'additive3'
    Shake&Vape: 'shakevape_flavor','nicotine_booster','premixedBase','vgBase','pgBase'
    Shortfill: 'shortfill_liquid','nicShot1'..'nicShot5'
    Shisha: 'tobacco1'..'tobacco4','sweetener','glycerin','purePg','water'

=== WHERE TO FIND FLAVORS (CRITICAL — flavors exist across ALL calculator types!) ===
There are MULTIPLE places where flavors appear. Use these in priority order:

1. results->'ingredients' (BEST — works for ALL calc_types universally):
   Every ingredient with a non-null flavorName is a flavor.
   Query: SELECT i->>'flavorName' AS flavor, i->>'flavorManufacturer' AS brand, COUNT(*)
          FROM calculation_logs, jsonb_array_elements(results->'ingredients') AS i
          WHERE i->>'flavorName' IS NOT NULL GROUP BY flavor, brand ORDER BY count DESC

2. params flat keys (liquid, shakevape — single flavor selected from DB):
   IMPORTANT: These are FLAT top-level keys, NOT a nested object!
   Query: SELECT params->>'specificFlavorName' AS flavor, params->>'specificFlavorManufacturer' AS brand, COUNT(*)
          FROM calculation_logs WHERE params->>'specificFlavorName' IS NOT NULL
          GROUP BY flavor, brand ORDER BY count DESC

3. params->'flavors' (multi-flavor array, present when user adds multiple flavors):
   Query: SELECT f->>'name' AS flavor, f->>'manufacturer' AS brand, COUNT(*)
          FROM calculation_logs, jsonb_array_elements(params->'flavors') AS f
          WHERE f->>'name' IS NOT NULL GROUP BY flavor, brand ORDER BY count DESC

4. params->'_proFlavors' (liquidpro only)
5. params->'_tobaccoDetails' (shisha_mix — tobacco brands)
6. params->'_diyFlavors' (shisha_diy), params->'_molFlavors' (shisha_molasses)

RULE: When asked about "flavors" or "manufacturers" or "brands", ALWAYS query results->'ingredients' first (method 1) as it covers ALL calculator types. Also combine with params->>'specificFlavorName' (method 2) for maximum coverage.

=== HOW TO THINK ABOUT THIS DATA ===

The table has ONE row per calculation. The user opens a calculator form, fills in values, clicks calculate — that's one row.

WHAT EACH QUESTION MAPS TO:
- "how many calculations" → COUNT(*) on calculation_logs, optionally filtered by calc_type, country, date, etc.
- "how many users" → COUNT(DISTINCT anonymous_id) — one anonymous_id = one device/browser
- "logged in users" → WHERE clerk_id IS NOT NULL
- "which calculator is most popular" → GROUP BY calc_type
- "which country" → GROUP BY country (ISO 2-letter codes like CZ, SK, DE, US)
- "which language" → GROUP BY locale (cs, en, sk, de, ...)
- "mobile vs desktop" → GROUP BY device_type
- "PWA users" → WHERE is_pwa = true
- "over time / trend / daily / weekly / monthly" → date_trunc('day'|'week'|'month', created_at)
- "what time of day" → EXTRACT(HOUR FROM created_at)

WHAT FLAVOR/BRAND QUESTIONS MAP TO:
- "which flavors / which brands / manufacturers" → TWO sources, combine with UNION if needed:
    Source A: results->'ingredients' — use jsonb_array_elements(), filter WHERE i->>'flavorName' IS NOT NULL
    Source B: params->>'specificFlavorName' and params->>'specificFlavorManufacturer' — flat top-level keys, filter WHERE NOT NULL
    Source A covers all calc_types where ingredients were computed. Source B covers single-flavor selections from DB (liquid, shakevape).
    For shisha tobaccos: params->'_tobaccoDetails', params->'_diyFlavors', params->'_molFlavors'

WHAT RECIPE PARAMETER QUESTIONS MAP TO:
- "VG/PG ratio" → params->>'vgPercent' or params->'_dom'->>'vgPgRatio' (slider 0-100 = VG%)
- "nicotine strength" → params->>'nicotine' (target mg/ml) or params->'_dom'->>'targetNicotine'
- "nicotine type (salt vs freebase)" → params->'_dom'->>'nicotineType'
- "base type (separate vs premixed)" → params->>'baseType'
- "mix volume / amount" → params->>'totalAmount' (in ml)
- "flavor percentage" → params->>'flavorPercent'
- "flavor category (fruit, tobacco, menthol...)" → params->>'flavorType'

JSONB SYNTAX REMINDERS:
- ->> extracts as TEXT (use for comparisons, casting to numeric)
- -> extracts as JSONB (use for nested access or arrays)
- Cast text to number: (params->>'totalAmount')::numeric
- Array iteration: jsonb_array_elements(results->'ingredients') AS i, then i->>'flavorName'
- NULL check: params->>'fieldName' IS NOT NULL
- Never end SQL with semicolon (the query is wrapped in a subselect)

===========================================================================
=== PRODUCTION DATA TABLES (synced from main DB daily at 04:00 CZ)     ===
=== All tables below are in the SAME analytics database.               ===
=== They CAN be JOINed with calculation_logs and with each other.       ===
=== Common join key: clerk_id (user ID, starts with "user_")           ===
===========================================================================

=== BUSINESS CONTEXT ===
LiquiMixer is a PWA (Progressive Web App) for mixing e-liquids (vape) and shisha tobacco.
It offers 8 calculator types and a PRO subscription (yearly, ~60 CZK / ~2.40 EUR).
Users can save recipes, favorite products, set steeping reminders, and rate public recipes.
The app supports 31 languages, with primary markets in CZ, SK, DE, PL, and the rest of EU.
Payment gateway: GP WebPay (card payments + GPay/Apple Pay).
Authentication: Clerk (Google, Facebook, Apple, TikTok, email).
Data is synced from the main production database once daily — NOT real-time.

=== TABLE: report_users ===
Registered user accounts. One row = one registered user.
IMPORTANT: Not every calculator user registers — calculation_logs.clerk_id IS NULL = anonymous.
Only users who sign in via Clerk appear here.

COLUMNS:
clerk_id: TEXT (PK) — Clerk user ID (always starts with "user_")
email_domain: TEXT — Email provider domain (gmail.com, seznam.cz, outlook.com) — NO full email for GDPR
locale: TEXT — User's preferred app language: 'cs','sk','en','de','pl','hu','ro','uk','es','fr','it','pt','nl','da','sv','fi','no','el','bg','hr','sl','sr','lt','lv','et','tr','ja','ko','zh','ar'
country: TEXT — ISO 2-letter country from subscription/geolocation (CZ, SK, DE, US, GB, AT, PL...)
has_subscription: BOOLEAN — true = currently active PRO subscription
subscription_tier: TEXT — 'free' (default) or 'pro'
subscription_status: TEXT — 'none' (never subscribed), 'active', 'expired', 'cancelled'
recipe_count: INT — Total saved recipes (private + public)
product_count: INT — Total favorite/saved products
reminder_count: INT — Total steeping reminders created
first_name: TEXT — User's first name (from Clerk/social login)
last_name: TEXT — User's last name
created_at: TIMESTAMPTZ — Registration timestamp
last_active_at: TIMESTAMPTZ — Last login or activity timestamp

TYPICAL QUESTIONS → QUERIES:
- "kolik máme registrovaných uživatelů" → SELECT COUNT(*) FROM report_users
- "kolik PRO uživatelů" → SELECT COUNT(*) FROM report_users WHERE has_subscription = true
- "konverze free→pro" → SELECT COUNT(*) FILTER (WHERE has_subscription) * 100.0 / COUNT(*) AS conversion_pct FROM report_users
- "uživatelé podle zemí" → SELECT country, COUNT(*) FROM report_users WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC
- "uživatelé podle emailových providerů" → SELECT email_domain, COUNT(*) FROM report_users GROUP BY email_domain ORDER BY count DESC
- "měsíční registrace" → SELECT date_trunc('month', created_at) AS month, COUNT(*) FROM report_users GROUP BY month ORDER BY month
- "aktivní vs neaktivní" → SELECT CASE WHEN last_active_at > NOW() - INTERVAL '30 days' THEN 'active_30d' ELSE 'inactive' END, COUNT(*) FROM report_users GROUP BY 1
- "průměrný počet receptů na uživatele" → SELECT AVG(recipe_count) FROM report_users WHERE recipe_count > 0

=== TABLE: report_recipes ===
User-saved recipes. One row = one saved recipe (private or public).
Users save recipes after performing a calculation — it stores the full recipe data as JSONB.

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — Owner user ID (FK → report_users.clerk_id)
name: TEXT — Recipe name (user-given, e.g. "Strawberry Cream 70/30")
description: TEXT — Optional description
form_type: TEXT — Which calculator was used:
  'liquid' = basic e-liquid calculator
  'shakevape' = Shake & Vape (one-shot concentrate)
  'liquidpro' = PRO multi-flavor calculator (requires subscription)
  'shortfill' = Shortfill/nicotine shot calculator
  'shisha_mix' = Shisha tobacco blending
  'shisha_diy' = Shisha DIY liquid
is_public: BOOLEAN — true = shared to public recipe database for others to see
public_status: TEXT — Moderation state: NULL (private recipe), 'pending' (awaiting AI moderation), 'approved' (visible), 'rejected'
difficulty_level: TEXT — Auto-calculated: 'beginner', 'intermediate', 'advanced'
rating: INT — Owner's personal rating 0-5 (0 = not rated)
public_rating_avg: NUMERIC — Average community rating (from report_recipe_ratings)
public_rating_count: INT — Number of community ratings received
is_pro_recipe: BOOLEAN — true = uses PRO features (multi-flavor, advanced settings)
recipe_data: JSONB — FULL recipe parameters and results. Key fields inside:
  recipe_data->>'vgPercent': TEXT castable to NUMERIC — VG percentage (0-100, e.g. 70)
  recipe_data->>'pgPercent': TEXT castable to NUMERIC — PG percentage (0-100, e.g. 30)
  recipe_data->>'nicotine': TEXT castable to NUMERIC — Target nicotine strength mg/ml (0, 3, 6, 12, 18...)
  recipe_data->>'totalAmount': TEXT castable to NUMERIC — Total mix volume in ml (30, 50, 100, 200...)
  recipe_data->>'flavorType': TEXT — Flavor category: 'fruit','tobacco','menthol','dessert','drink','candy','none','custom'
  recipe_data->>'flavorPercent': TEXT castable to NUMERIC — Single flavor percentage
  recipe_data->>'specificFlavorName': TEXT — Exact flavor name from database (e.g. 'Strawberry Ripe')
  recipe_data->>'specificFlavorManufacturer': TEXT — Manufacturer code (e.g. 'TPA', 'CAP')
  recipe_data->>'baseType': TEXT — 'separate' or 'premixed'
  recipe_data->>'premixedRatio': TEXT — Premixed base ratio (e.g. '70/30', '50/50')
  recipe_data->>'nicotineType': TEXT — Nicotine type used: 'freebase', 'salt', 'booster', or 'none'. Determines nicotine base chemistry. 'none' = no nicotine added.
  recipe_data->>'nicotineBaseStrength': TEXT castable to NUMERIC — Concentration of the nicotine base in mg/ml (e.g. 20, 36, 72). Only present when nicotineType != 'none'.
  recipe_data->>'nicotineRatio': TEXT — VG/PG ratio of the nicotine base (e.g. '50/50', '100/0', '0/100'). For liquid and shakevape forms.
  recipe_data->>'nicotineRatioSlider': TEXT castable to NUMERIC — VG percentage (0-100) of the nicotine base for PRO calculator (e.g. 50 = 50%VG/50%PG).
  recipe_data->>'flavorRatio': TEXT — VG/PG composition of the flavor concentrate (e.g. '0/100' = pure PG, '20/80'). For liquid and shakevape forms.
  recipe_data->>'flavorVolume': TEXT castable to NUMERIC — Flavor/aroma volume in ml for Shake & Vape recipes (e.g. 12, 15, 20).
  recipe_data->>'formType': TEXT — Calculator type identifier
  recipe_data->'ingredients': JSONB array — Calculated ingredients with volumes
  recipe_data->'flavors': JSONB array — Multiple flavors for multi-flavor recipes
flavors_data: JSONB — Multi-flavor PRO data (array of flavors with %, names, manufacturers)
created_at: TIMESTAMPTZ — When recipe was saved
updated_at: TIMESTAMPTZ — Last edit

TYPICAL QUESTIONS → QUERIES:
- "kolik receptů celkem" → SELECT COUNT(*) FROM report_recipes
- "veřejné vs soukromé" → SELECT is_public, COUNT(*) FROM report_recipes GROUP BY is_public
- "recepty podle typu kalkulátoru" → SELECT form_type, COUNT(*) FROM report_recipes GROUP BY form_type ORDER BY count DESC
- "nejčastější VG/PG poměr v receptech" → SELECT recipe_data->>'vgPercent' AS vg, COUNT(*) FROM report_recipes WHERE recipe_data->>'vgPercent' IS NOT NULL GROUP BY vg ORDER BY count DESC LIMIT 20
- "průměrný nikotín v receptech" → SELECT AVG((recipe_data->>'nicotine')::numeric) FROM report_recipes WHERE recipe_data->>'nicotine' IS NOT NULL AND (recipe_data->>'nicotine')::numeric > 0
- "recepty s příchutí TPA Strawberry" → SELECT * FROM report_recipes WHERE recipe_data->>'specificFlavorName' ILIKE '%strawberry%' AND recipe_data->>'specificFlavorManufacturer' ILIKE '%TPA%' LIMIT 50
- "nejlépe hodnocené veřejné recepty" → SELECT name, public_rating_avg, public_rating_count FROM report_recipes WHERE is_public = true AND public_rating_count > 0 ORDER BY public_rating_avg DESC LIMIT 20
- "PRO recepty vs free" → SELECT is_pro_recipe, COUNT(*) FROM report_recipes GROUP BY is_pro_recipe
- "rozložení typů nikotinu v receptech" → SELECT recipe_data->>'nicotineType' AS nic_type, COUNT(*) FROM report_recipes WHERE recipe_data->>'nicotineType' IS NOT NULL GROUP BY nic_type ORDER BY count DESC
- "recepty s nikotinovými solemi" → SELECT COUNT(*) FROM report_recipes WHERE recipe_data->>'nicotineType' = 'salt'
- "průměrná síla nikotinové báze" → SELECT AVG((recipe_data->>'nicotineBaseStrength')::numeric) FROM report_recipes WHERE recipe_data->>'nicotineBaseStrength' IS NOT NULL AND (recipe_data->>'nicotineBaseStrength')::numeric > 0
- "nejčastější VG/PG poměr nikotinové báze" → SELECT recipe_data->>'nicotineRatio' AS nic_ratio, COUNT(*) FROM report_recipes WHERE recipe_data->>'nicotineRatio' IS NOT NULL GROUP BY nic_ratio ORDER BY count DESC
- "recepty bez nikotinu" → SELECT COUNT(*) FROM report_recipes WHERE recipe_data->>'nicotineType' = 'none' OR recipe_data->>'nicotineType' IS NULL

=== TABLE: report_products ===
User's favorite/saved products. Users save products they own (flavors, bases, nicotine boosters) for quick access.
One row = one saved product in a user's collection. Product_type 'flavor' is the most common.

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — Owner user ID
name: TEXT — Product name (e.g. 'Strawberry Ripe 10ml', 'VG Báze 1000ml')
product_type: TEXT — Product category:
  'flavor' = flavor concentrate/aroma (most common, ~80% of products)
  'vg' = vegetable glycerin base
  'pg' = propylene glycol base
  'nicotine_booster' = freebase nicotine booster/shot
  'nicotine_salt' = nicotine salt
description: TEXT — Optional notes
manufacturer: TEXT — Manufacturer name for flavors (e.g. 'TPA', 'Capella', 'FlavourArt', 'Inawera')
flavor_category: TEXT — Flavor type: 'fruit', 'cream', 'tobacco', 'menthol', 'dessert', 'drink', 'candy', etc.
flavor_product_type: TEXT — 'vape' or 'shisha'
flavor_id: UUID — Link to public flavor database (report_flavors.id), NULL for custom products
steep_days: INT — Recommended steeping time in days (0-365)
stock_quantity: NUMERIC — User's current stock amount (0 = out of stock, typically 0-1000)
rating: INT — User's personal rating 0-5
product_url: TEXT — URL link to e-shop where user buys this product
percent_min: NUMERIC — Minimum recommended mixing % (from flavor DB, e.g. 2.0)
percent_max: NUMERIC — Maximum recommended mixing % (from flavor DB, e.g. 8.0)
percent_optimal: NUMERIC — Optimal/recommended mixing % (from flavor DB, e.g. 5.0)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ

TYPICAL QUESTIONS → QUERIES:
- "nejoblíbenější příchutě" → SELECT manufacturer, name, COUNT(*) as users FROM report_products WHERE product_type = 'flavor' GROUP BY manufacturer, name ORDER BY users DESC LIMIT 30
- "nejoblíbenější výrobci" → SELECT manufacturer, COUNT(*) FROM report_products WHERE product_type = 'flavor' AND manufacturer IS NOT NULL GROUP BY manufacturer ORDER BY count DESC
- "distribuce typů produktů" → SELECT product_type, COUNT(*) FROM report_products GROUP BY product_type ORDER BY count DESC
- "průměrný sklad příchutí" → SELECT AVG(stock_quantity) FROM report_products WHERE product_type = 'flavor' AND stock_quantity > 0
- "kolik uživatelů má 0 na skladě" → SELECT COUNT(DISTINCT clerk_id) FROM report_products WHERE stock_quantity = 0
- "nejpoužívanější e-shopy" → SELECT product_url, COUNT(*) FROM report_products WHERE product_url IS NOT NULL AND product_url != '' GROUP BY product_url ORDER BY count DESC LIMIT 20
- "příchutě kategorie fruit" → SELECT name, manufacturer, COUNT(*) FROM report_products WHERE flavor_category = 'fruit' GROUP BY name, manufacturer ORDER BY count DESC LIMIT 20

=== TABLE: report_subscriptions ===
PRO subscription purchases. One row = one subscription record (pending, active, expired, or refunded).
Users pay via GP WebPay. Price varies by country (CZK/EUR/USD), includes VAT.
Subscription = 365 days access to PRO features (multi-flavor calculator, advanced settings).

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — User ID
plan_type: TEXT — Always 'yearly' (365 days)
status: TEXT — Lifecycle state:
  'pending' = created, waiting for payment
  'active' = paid, currently valid
  'expired' = valid_to date passed
  'cancelled' = user or admin cancelled
payment_status: TEXT — 'pending', 'paid', 'refunded'
amount: NUMERIC — Base price BEFORE VAT (e.g. 49.59 CZK, 1.98 EUR)
vat_rate: NUMERIC — VAT rate percentage (e.g. 21 for CZ, 20 for SK, 19 for DE, 0 for non-EU)
vat_amount: NUMERIC — Calculated VAT (amount * vat_rate / 100)
total_amount: NUMERIC — Final charged price (amount + vat_amount, e.g. 60 CZK, 2.40 EUR)
currency: TEXT — 'CZK', 'EUR', 'USD'
user_locale: TEXT — Language for invoice/communication
user_country: TEXT — Country for VAT calculation (ISO 2-letter: CZ, SK, DE, AT, PL, US...)
auto_renew: BOOLEAN — Always false currently (no auto-renewal yet)
valid_from: TIMESTAMPTZ — Subscription activation date
valid_to: TIMESTAMPTZ — Subscription expiry date (valid_from + 365 days)
paid_at: TIMESTAMPTZ — When payment was confirmed
created_at: TIMESTAMPTZ — When subscription record was created
updated_at: TIMESTAMPTZ

TYPICAL QUESTIONS → QUERIES:
- "celkový revenue" → SELECT currency, SUM(total_amount) as revenue FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY currency
- "revenue za měsíc" → SELECT date_trunc('month', paid_at) AS month, currency, SUM(total_amount) FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY month, currency ORDER BY month
- "konverze plateb" → SELECT status, COUNT(*) FROM report_subscriptions GROUP BY status
- "revenue podle zemí" → SELECT user_country, currency, SUM(total_amount) as revenue, COUNT(*) as count FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY user_country, currency ORDER BY revenue DESC
- "průměrná platba" → SELECT currency, AVG(total_amount), COUNT(*) FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY currency
- "kolik subscriptions vyprší tento měsíc" → SELECT COUNT(*) FROM report_subscriptions WHERE status = 'active' AND valid_to BETWEEN date_trunc('month', NOW()) AND date_trunc('month', NOW()) + INTERVAL '1 month'
- "churn rate" → SELECT COUNT(*) FILTER (WHERE status = 'expired') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status IN ('active','expired')), 0) AS churn_pct FROM report_subscriptions
- "refundy" → SELECT COUNT(*), SUM(total_amount) FROM report_subscriptions WHERE payment_status = 'refunded'

=== TABLE: report_reminders ===
Steeping reminders. Users create reminders when they mix a liquid to be notified when steeping is complete.
One row = one steeping reminder. Steeping = aging process where flavors develop over days/weeks.
IMPORTANT: A reminder means the user ACTUALLY MIXED a liquid (real production, not just calculation).

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — User ID
recipe_id: UUID — Reference to the recipe that was mixed (FK → report_recipes.id, nullable)
recipe_name: TEXT — Snapshot of recipe name at time of creation
flavor_name: TEXT — Main/primary flavor name
flavor_type: TEXT — Flavor category (fruit, tobacco, cream...)
status: TEXT — Steeping lifecycle:
  'pending' = liquid is steeping, not yet ready
  'matured' = steeping complete, ready to vape (remind_at date reached)
  Note: consumed_at IS NOT NULL means user marked it as consumed/finished
mixed_at: DATE — Date when user physically mixed the liquid
remind_at: DATE — Date when steeping should be complete (mixed_at + steep days)
steep_days: INT — Pre-calculated number of steeping days (remind_at - mixed_at). Typical: 7-21 days for most flavors, 0 for shake&vape.
stock_percent: INT — How much liquid remains (0-100%). 0 = fully consumed. Users update this as they vape.
consumed_at: TIMESTAMPTZ — Timestamp when user marked the liquid as fully consumed (NULL = not yet consumed or still has stock)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ

TYPICAL QUESTIONS → QUERIES:
- "kolik uživatelů reálně míchá" → SELECT COUNT(DISTINCT clerk_id) FROM report_reminders
- "průměrná doba zrání" → SELECT AVG(steep_days) FROM report_reminders WHERE steep_days > 0
- "doba zrání podle typu příchutě" → SELECT flavor_type, AVG(steep_days), COUNT(*) FROM report_reminders WHERE steep_days > 0 GROUP BY flavor_type ORDER BY avg DESC
- "kolik se zamíchalo za leden 2026" → SELECT COUNT(*) FROM report_reminders WHERE mixed_at BETWEEN '2026-01-01' AND '2026-01-31'
- "spotřeba za měsíc (consumed)" → SELECT date_trunc('month', consumed_at) AS month, COUNT(*) FROM report_reminders WHERE consumed_at IS NOT NULL GROUP BY month ORDER BY month
- "kolik % liquidu se skutečně spotřebuje" → SELECT COUNT(*) FILTER (WHERE consumed_at IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) AS consumption_rate FROM report_reminders WHERE status = 'matured'
- "aktivní zrání právě teď" → SELECT COUNT(*) FROM report_reminders WHERE status = 'pending' AND remind_at > CURRENT_DATE
- "míchání konkrétní příchutě v zemi za období" → Combine with report_users:
  SELECT COUNT(*) FROM report_reminders rr JOIN report_users ru ON rr.clerk_id = ru.clerk_id WHERE rr.flavor_name ILIKE '%strawberry%' AND ru.country = 'DE' AND rr.mixed_at BETWEEN '2026-01-01' AND '2026-01-31'

=== TABLE: report_recipe_ratings ===
Public recipe ratings from the community. Users rate public recipes 1-5 stars.
One user can rate each recipe once (UNIQUE on recipe_id + clerk_id).

COLUMNS:
id: UUID (PK)
recipe_id: UUID — Rated recipe (FK → report_recipes.id)
clerk_id: TEXT — Who rated
rating: INT — 1-5 stars
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
UNIQUE(recipe_id, clerk_id)

TYPICAL QUESTIONS → QUERIES:
- "distribuce hodnocení" → SELECT rating, COUNT(*) FROM report_recipe_ratings GROUP BY rating ORDER BY rating
- "nejlépe hodnocené recepty" → SELECT rr.recipe_id, rec.name, AVG(rr.rating), COUNT(*) FROM report_recipe_ratings rr JOIN report_recipes rec ON rr.recipe_id = rec.id GROUP BY rr.recipe_id, rec.name HAVING COUNT(*) >= 3 ORDER BY avg DESC LIMIT 20
- "kolik uživatelů hodnotí" → SELECT COUNT(DISTINCT clerk_id) FROM report_recipe_ratings

=== TABLE: report_flavors ===
Public flavor database. Contains all flavors from all manufacturers that users can select in calculators.
One row = one flavor. This is a REFERENCE table — snapshot of the flavor catalog.
Manufacturers use short codes: TPA, CAP, FA, FLV, INW, WF, MB, SSA, TW, GF, IMP, AV, LIQ (vape); ALF, ADA, STB, FUM, TAN, NAK, DRK, ELM, MST (shisha).

COLUMNS:
id: UUID (PK)
name: TEXT — Flavor name (e.g. 'Strawberry Ripe', 'Bavarian Cream', 'RY4 Double')
manufacturer_code: TEXT — Short code: TPA, CAP, FA, FLV, INW, WF, MB, SSA, TW, GF, IMP, AV, LIQ, ALF, ADA, STB, FUM, etc.
product_type: TEXT — 'vape' (e-liquid flavors) or 'shisha' (hookah tobacco)
category: TEXT — Flavor category: 'fruit', 'cream', 'tobacco', 'menthol', 'dessert', 'drink', 'candy', 'nut', 'spice', 'floral', 'cereal', 'other'
min_percent: NUMERIC — Minimum recommended mixing percentage (e.g. 1.0, 2.0)
max_percent: NUMERIC — Maximum recommended mixing percentage (e.g. 8.0, 15.0)
recommended_percent: NUMERIC — Optimal percentage for standalone use (e.g. 5.0)
steep_days: INT — Recommended steeping days (e.g. 3, 7, 14, 21)
status: TEXT — 'active' (verified, visible), 'pending' (awaiting review), 'verified', 'rejected'
avg_rating: NUMERIC — Average community rating (0-5)
rating_count: INT — Number of ratings
usage_count: INT — Number of times used in calculations (from calculation_logs)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ

TYPICAL QUESTIONS → QUERIES:
- "kolik příchutí v databázi" → SELECT COUNT(*) FROM report_flavors WHERE status = 'active'
- "příchutě podle výrobce" → SELECT manufacturer_code, COUNT(*) FROM report_flavors WHERE status = 'active' GROUP BY manufacturer_code ORDER BY count DESC
- "příchutě podle kategorie" → SELECT category, COUNT(*) FROM report_flavors GROUP BY category ORDER BY count DESC
- "nejpoužívanější příchutě" → SELECT name, manufacturer_code, usage_count FROM report_flavors WHERE usage_count > 0 ORDER BY usage_count DESC LIMIT 30
- "průměrná doba zrání podle kategorie" → SELECT category, AVG(steep_days) FROM report_flavors WHERE steep_days > 0 GROUP BY category ORDER BY avg DESC
- "vape vs shisha příchutě" → SELECT product_type, COUNT(*) FROM report_flavors GROUP BY product_type

=== TABLE: report_payments ===
GP WebPay payment records. Every payment attempt is logged — successful and failed.
One row = one payment attempt. Status 'completed' = successful payment.

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — User who initiated payment
subscription_id: UUID — Related subscription (FK → report_subscriptions.id)
order_number: TEXT — GP WebPay unique order number (numeric, max 15 chars)
amount: NUMERIC — Charged amount (same as subscription total_amount)
currency: TEXT — 'CZK', 'EUR', 'USD'
status: TEXT — Payment state:
  'pending' = redirected to GP WebPay, waiting for response
  'completed' = payment successful (PRCODE=0, SRCODE=0)
  'failed' = payment failed or declined
  'refunded' = money returned to user
prcode: TEXT — GP WebPay primary result code. '0' = success. Other values = error codes.
srcode: TEXT — GP WebPay secondary result code. '0' = no secondary error.
created_at: TIMESTAMPTZ — When payment was initiated
completed_at: TIMESTAMPTZ — When payment was confirmed by GP WebPay
refunded_at: TIMESTAMPTZ — When refund was processed
refund_amount: NUMERIC — Refunded amount (may differ from original amount)

TYPICAL QUESTIONS → QUERIES:
- "úspěšnost plateb" → SELECT status, COUNT(*) FROM report_payments GROUP BY status
- "failed payments" → SELECT COUNT(*) FROM report_payments WHERE status = 'failed'
- "platby za den" → SELECT date_trunc('day', created_at) AS day, COUNT(*), SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) FROM report_payments GROUP BY day ORDER BY day DESC LIMIT 30
- "refundy celkem" → SELECT COUNT(*), SUM(refund_amount) FROM report_payments WHERE status = 'refunded'

=== TABLE: report_contact_messages ===
User support/contact messages. Contains METADATA only (no message text) for privacy.
One row = one support message. Categories and AI analysis help understand user needs.

COLUMNS:
id: UUID (PK)
clerk_id: TEXT — User who sent the message (NULL = anonymous/not logged in)
category: TEXT — Topic: 'technical', 'payment', 'refund', 'recipe', 'account', 'gdpr', 'suggestion', 'bug', 'business', 'partnership', 'media', 'other'
status: TEXT — Workflow state: 'new', 'ai_processing', 'auto_resolved' (AI handled it), 'needs_human', 'admin_replied', 'sent', 'closed', 'spam', 'duplicate_resolved'
priority: TEXT — 'low', 'normal', 'high', 'urgent'
locale: TEXT — Language the message was written in
detected_language: TEXT — AI-detected language (may differ from locale)
ai_sentiment: TEXT — AI sentiment analysis: 'positive', 'neutral', 'negative', 'angry'
ai_category: TEXT — AI-assigned category (may differ from user-selected)
ai_auto_resolved: BOOLEAN — true = AI handled the message without human intervention
is_business_offer: BOOLEAN — true = B2B partnership/business inquiry
created_at: TIMESTAMPTZ — When message was sent
resolved_at: TIMESTAMPTZ — When message was resolved/closed

TYPICAL QUESTIONS → QUERIES:
- "kolik zpráv celkem" → SELECT COUNT(*) FROM report_contact_messages
- "zprávy podle kategorie" → SELECT category, COUNT(*) FROM report_contact_messages GROUP BY category ORDER BY count DESC
- "sentiment rozložení" → SELECT ai_sentiment, COUNT(*) FROM report_contact_messages WHERE ai_sentiment IS NOT NULL GROUP BY ai_sentiment
- "% automaticky vyřešených" → SELECT COUNT(*) FILTER (WHERE ai_auto_resolved) * 100.0 / COUNT(*) FROM report_contact_messages
- "obchodní nabídky" → SELECT COUNT(*) FROM report_contact_messages WHERE is_business_offer = true
- "průměrná doba řešení" → SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) AS avg_hours FROM report_contact_messages WHERE resolved_at IS NOT NULL

=== TABLE: sync_log ===
Data synchronization history. Tracks when and how data was copied from main DB to analytics.
id: UUID (PK)
sync_type: TEXT — 'cron' (automatic daily) or 'manual' (triggered by admin)
tables_synced: TEXT[] — Array of table names synced
rows_synced: JSONB — Object with {table_name: row_count} for each table
duration_ms: INT — How long the sync took in milliseconds
status: TEXT — 'success' (all OK), 'partial' (some tables failed), 'failed'
error_message: TEXT — Error details if any
created_at: TIMESTAMPTZ

===========================================================================
=== CROSS-TABLE QUERY PATTERNS AND BUSINESS INTELLIGENCE EXAMPLES       ===
===========================================================================

=== USER LIFECYCLE & ENGAGEMENT ===

Registration → First calculation:
  SELECT ru.clerk_id, ru.created_at AS registered, MIN(cl.created_at) AS first_calc,
    EXTRACT(EPOCH FROM (MIN(cl.created_at) - ru.created_at))/3600 AS hours_to_first_calc
  FROM report_users ru LEFT JOIN calculation_logs cl ON ru.clerk_id = cl.clerk_id
  GROUP BY ru.clerk_id, ru.created_at HAVING MIN(cl.created_at) IS NOT NULL LIMIT 100

Active users (calculated in last 30 days):
  SELECT COUNT(DISTINCT clerk_id) FROM calculation_logs WHERE clerk_id IS NOT NULL AND created_at > NOW() - INTERVAL '30 days'

User retention (registered and still active):
  SELECT COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '30 days') * 100.0 / COUNT(*) AS retention_30d FROM report_users

Power users (most calculations):
  SELECT cl.clerk_id, ru.first_name, COUNT(*) as calcs, ru.has_subscription
  FROM calculation_logs cl JOIN report_users ru ON cl.clerk_id = ru.clerk_id
  WHERE cl.clerk_id IS NOT NULL GROUP BY cl.clerk_id, ru.first_name, ru.has_subscription ORDER BY calcs DESC LIMIT 20

=== SUBSCRIPTION & REVENUE ===

Monthly Recurring Revenue (MRR):
  SELECT date_trunc('month', paid_at) AS month, currency, SUM(total_amount) AS revenue, COUNT(*) AS subscriptions
  FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY month, currency ORDER BY month

Churn: users whose subscription expired and didn't renew:
  SELECT COUNT(*) FROM report_subscriptions WHERE status = 'expired' AND clerk_id NOT IN (SELECT clerk_id FROM report_subscriptions WHERE status = 'active')

Revenue per country:
  SELECT user_country, currency, SUM(total_amount) AS revenue, COUNT(*) AS count
  FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY user_country, currency ORDER BY revenue DESC

Average revenue per user (ARPU):
  SELECT currency, SUM(total_amount) / NULLIF(COUNT(DISTINCT clerk_id), 0) AS arpu
  FROM report_subscriptions WHERE payment_status = 'paid' GROUP BY currency

Subscription funnel (pending → paid → active):
  SELECT status, payment_status, COUNT(*) FROM report_subscriptions GROUP BY status, payment_status ORDER BY count DESC

=== FLAVOR & PRODUCT INTELLIGENCE ===

Most popular flavors (from saved products):
  SELECT rp.manufacturer, rp.name, COUNT(DISTINCT rp.clerk_id) AS users
  FROM report_products rp WHERE rp.product_type = 'flavor' GROUP BY rp.manufacturer, rp.name ORDER BY users DESC LIMIT 30

Most used flavors in calculations (from calculation_logs ingredients):
  SELECT i->>'flavorName' AS flavor, i->>'flavorManufacturer' AS brand, COUNT(*)
  FROM calculation_logs, jsonb_array_elements(results->'ingredients') AS i
  WHERE i->>'flavorName' IS NOT NULL GROUP BY flavor, brand ORDER BY count DESC LIMIT 30

Flavor with specific manufacturer in specific country in specific period:
  SELECT COUNT(*) FROM report_reminders rr
  JOIN report_users ru ON rr.clerk_id = ru.clerk_id
  WHERE rr.flavor_name ILIKE '%strawberry%' AND ru.country = 'DE'
  AND rr.mixed_at BETWEEN '2026-01-01' AND '2026-01-31'

Stock levels (which products users run out of most):
  SELECT name, manufacturer, COUNT(*) FROM report_products WHERE product_type = 'flavor' AND stock_quantity = 0 GROUP BY name, manufacturer ORDER BY count DESC LIMIT 20

=== RECIPE INTELLIGENCE ===

VG/PG distribution in saved recipes:
  SELECT recipe_data->>'vgPercent' AS vg_pct, COUNT(*) FROM report_recipes WHERE recipe_data->>'vgPercent' IS NOT NULL GROUP BY vg_pct ORDER BY count DESC LIMIT 20

Nicotine strength trends:
  SELECT (recipe_data->>'nicotine')::numeric AS nic, COUNT(*) FROM report_recipes WHERE recipe_data->>'nicotine' IS NOT NULL AND (recipe_data->>'nicotine')::numeric > 0 GROUP BY nic ORDER BY count DESC

Most saved flavor types in recipes:
  SELECT recipe_data->>'flavorType' AS ftype, COUNT(*) FROM report_recipes WHERE recipe_data->>'flavorType' IS NOT NULL GROUP BY ftype ORDER BY count DESC

=== STEEPING INTELLIGENCE ===

Average steeping time by flavor type:
  SELECT flavor_type, AVG(steep_days) AS avg_days, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY steep_days) AS median_days, COUNT(*)
  FROM report_reminders WHERE steep_days > 0 GROUP BY flavor_type ORDER BY avg_days DESC

Consumption rate (what % of mixed liquids get fully consumed):
  SELECT COUNT(*) FILTER (WHERE consumed_at IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) AS consumed_pct
  FROM report_reminders WHERE status IN ('matured') OR consumed_at IS NOT NULL

Monthly mixing volume (how many liquids are mixed each month):
  SELECT date_trunc('month', mixed_at) AS month, COUNT(*) FROM report_reminders GROUP BY month ORDER BY month

=== SUPPORT INTELLIGENCE ===

Resolution time by category:
  SELECT category, AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) AS avg_hours, COUNT(*)
  FROM report_contact_messages WHERE resolved_at IS NOT NULL GROUP BY category ORDER BY avg_hours DESC

AI auto-resolution rate by category:
  SELECT category, COUNT(*) FILTER (WHERE ai_auto_resolved) * 100.0 / NULLIF(COUNT(*), 0) AS auto_pct, COUNT(*)
  FROM report_contact_messages GROUP BY category ORDER BY auto_pct DESC

=== GEOGRAPHIC INTELLIGENCE ===

Users + calculations by country:
  SELECT ru.country, COUNT(DISTINCT ru.clerk_id) AS users, COUNT(cl.id) AS calculations
  FROM report_users ru LEFT JOIN calculation_logs cl ON ru.clerk_id = cl.clerk_id
  WHERE ru.country IS NOT NULL GROUP BY ru.country ORDER BY users DESC

Country-specific flavor preferences:
  SELECT ru.country, i->>'flavorName' AS flavor, COUNT(*)
  FROM calculation_logs cl JOIN report_users ru ON cl.clerk_id = ru.clerk_id, jsonb_array_elements(cl.results->'ingredients') AS i
  WHERE i->>'flavorName' IS NOT NULL AND ru.country IS NOT NULL
  GROUP BY ru.country, flavor ORDER BY count DESC LIMIT 50
`

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(origin)
  }

  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  try {
    // Ověřit dashboard uživatele přes secret token v headeru
    const dashboardSecret = req.headers.get('x-dashboard-secret')
    if (!dashboardSecret || dashboardSecret !== Deno.env.get('DASHBOARD_BIGDATA_SECRET')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const body = await req.json()
    const { question } = body

    if (!question || typeof question !== 'string' || question.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid question' }), { status: 400, headers })
    }

    // Step 1: AI generuje SQL z otázky
    const sqlResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a PostgreSQL analytics expert for LiquiMixer (vape/shisha mixing app). Generate a single SELECT query to answer the user's question.

Available tables:
- calculation_logs — analytics of all calculations performed (one row = one calculation)
- report_users — registered user accounts
- report_recipes — user-saved recipes
- report_products — user's favorite/saved products (flavors, bases, nicotine)
- report_subscriptions — PRO subscription purchases
- report_reminders — steeping reminders (with steep_days pre-calculated)
- report_recipe_ratings — public recipe ratings (1-5 stars)
- report_flavors — public flavor database (names, manufacturers, recommended %, steep days)
- report_payments — GP WebPay payment records
- report_contact_messages — support message metadata
- sync_log — data sync history

All tables are in the SAME database and can be JOINed freely.
Common join keys: clerk_id (user ID), recipe_id, flavor_id, subscription_id.

${TABLE_SCHEMA}

Rules:
- Output ONLY the SQL query, nothing else. No markdown, no explanation.
- ONLY SELECT statements allowed. Never INSERT/UPDATE/DELETE/DROP.
- Always LIMIT results to max 500 rows.
- Use appropriate aggregations (COUNT, AVG, SUM, etc.) for analytics questions.
- For time-based queries, use created_at with date_trunc().
- For JSONB fields, use ->> for text extraction, -> for nested access.
- Return columns with clear aliases for chart rendering.
- If the question asks for a chart/graph, structure the result with x/y columns suitable for visualization.
- Choose the RIGHT table(s) for the question. E.g. "users" → report_users, "recipes" → report_recipes, "calculations" → calculation_logs, "subscriptions" → report_subscriptions, "payments" → report_payments, "flavors" → report_flavors.
- Use JOINs when the question spans multiple data domains (e.g. "calculations by German users" = calculation_logs JOIN report_users ON clerk_id).
- If unsure about the question, return a simple COUNT(*) query on the most relevant table.`
          },
          { role: 'user', content: question }
        ]
      })
    })

    if (!sqlResponse.ok) {
      console.error('OpenAI SQL error:', await sqlResponse.text())
      return new Response(JSON.stringify({ error: 'AI SQL generation failed' }), { status: 500, headers })
    }

    const sqlResult = await sqlResponse.json()
    let sql = sqlResult.choices?.[0]?.message?.content?.trim() || ''

    // Vyčistit markdown bloky a trailing středník
    sql = sql.replace(/^```(?:sql)?\n?/i, '').replace(/\n?```$/i, '').trim()
    sql = sql.replace(/;\s*$/, '').trim()

    // Step 2: Spustit SQL na analytics DB přes exec_readonly_sql
    const analytics = createClient(ANALYTICS_URL, ANALYTICS_KEY)
    const { data: queryData, error: queryError } = await analytics.rpc('exec_readonly_sql', { query: sql })

    let rows: unknown[] = []
    let executionError: string | null = null

    if (queryError) {
      executionError = queryError.message
      rows = []
    } else {
      rows = (queryData as unknown[]) || []
    }

    // Step 3: AI interpretuje výsledky
    const interpretResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are a data analyst for LiquiMixer (vape/shisha mixing app). Interpret query results and provide insights.

Rules:
- Answer in Czech language.
- Be concise and factual. Only state what the data shows.
- NEVER make up numbers or data. If the query returned an error or no data, say so.
- If results contain time series or categorical data suitable for charts, include a JSON block for chart rendering.
- Chart JSON format (wrap in \`\`\`chart ... \`\`\`):
  {"type":"bar"|"line"|"pie","title":"Chart title","data":[{"name":"label","value":123},...]}
  For line/bar with multiple series: {"type":"line","title":"...","xKey":"date","series":["count","avg"],"data":[{"date":"2026-03","count":50,"avg":3.2},...]}
- Include the chart JSON ONLY when it makes sense for the data.
- Format numbers nicely (e.g., 1 234 instead of 1234).`
          },
          {
            role: 'user',
            content: `Otázka uživatele: ${question}

SQL dotaz: ${sql}

${executionError ? `Chyba při vykonání: ${executionError}` : `Výsledky (${rows.length} řádků):\n${JSON.stringify(rows.slice(0, 100), null, 2)}`}`
          }
        ]
      })
    })

    if (!interpretResponse.ok) {
      return new Response(JSON.stringify({ error: 'AI interpretation failed' }), { status: 500, headers })
    }

    const interpretResult = await interpretResponse.json()
    const answer = interpretResult.choices?.[0]?.message?.content?.trim() || 'Bez odpovědi'

    return new Response(JSON.stringify({
      question,
      sql,
      answer,
      rowCount: rows.length,
      rows: rows.slice(0, 100),
      executionError,
    }), { status: 200, headers })

  } catch (err) {
    console.error('BigData error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers })
  }
})
