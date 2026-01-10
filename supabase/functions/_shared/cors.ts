// ============================================
// SDÍLENÁ CORS A RATE LIMITING KONFIGURACE
// Pro všechny Supabase Edge funkce
// ============================================

// Povolené domény pro CORS
// PRODUKCE: Pouze liquimixer.com a N8N webhook
// DEV: Přidány localhost a 127.0.0.1 pro lokální vývoj
const ALLOWED_ORIGINS = [
  'https://www.liquimixer.com',
  'https://liquimixer.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

// N8N webhook domény (server-to-server, bez origin header)
// Tyto požadavky mají prázdný origin a jsou povoleny pokud obsahují správný secret
const ALLOWED_WEBHOOK_HOSTS = [
  'n8n.cloud',
  'app.n8n.cloud',
];

// Pro vývoj můžete dočasně přidat:
// - 'http://localhost:5500'
// - 'http://127.0.0.1:5500'
// - 'https://liquimixer.zeabur.app'
// POZOR: Před produkčním nasazením tyto odstraňte!

// Kontrola, zda je origin povolen
export function isAllowedOrigin(origin: string | null): boolean {
  // Prázdný origin = server-to-server požadavek (N8N webhook, CRON job)
  // Tyto jsou povoleny a ověřeny jinak (webhook secret, API key)
  if (!origin) return true;
  
  return ALLOWED_ORIGINS.includes(origin);
}

// Kontrola, zda je požadavek z N8N webhook
export function isN8NWebhook(req: Request): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const webhookSecret = req.headers.get('x-webhook-secret');
  
  // N8N požadavky mají specifický user-agent nebo webhook secret
  return userAgent.includes('n8n') || !!webhookSecret;
}

// Získat CORS headers pro daný origin
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin!,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit-key, x-clerk-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // Cache preflight na 24 hodin
    'Vary': 'Origin', // Důležité pro správné cachování
  };
}

// Vytvořit CORS preflight response
export function handleCorsPreflight(origin: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ============================================
// RATE LIMITING
// Jednoduchý in-memory rate limiter
// Pro produkci doporučeno použít Redis/KV store
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resetuje se při cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Konfigurace rate limitů podle typu funkce
export interface RateLimitConfig {
  maxRequests: number;  // Max požadavků za okno
  windowMs: number;     // Délka okna v ms
}

// Výchozí konfigurace
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Kontaktní formulář - přísný limit
  contact: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5/hodina
  
  // Platební operace - střední limit
  payment: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10/hodina
  billing: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20/hodina
  refund: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5/hodina
  
  // Běžné operace - vyšší limit
  subscription: { maxRequests: 60, windowMs: 60 * 1000 }, // 60/minuta
  geolocation: { maxRequests: 30, windowMs: 60 * 1000 }, // 30/minuta
  
  // Notifikace (CRON) - speciální
  'reminder-notify': { maxRequests: 100, windowMs: 60 * 1000 }, // 100/minuta
  
  // Výchozí
  default: { maxRequests: 30, windowMs: 60 * 1000 }, // 30/minuta
};

// Čištění starých záznamů
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Spustit cleanup každých 5 minut
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// Kontrola rate limitu
export function checkRateLimit(
  identifier: string, 
  functionName: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[functionName] || RATE_LIMITS.default;
  const key = `${functionName}:${identifier}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Nový záznam nebo expirovaný
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }
  
  // Kontrola limitu
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  // Inkrementovat počítadlo
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Získat identifikátor pro rate limiting (IP nebo user ID)
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  // Preferovat user ID pokud je k dispozici
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback na IP adresu
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

// Rate limit response
export function rateLimitResponse(resetAt: number, origin: string | null): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetAt),
      },
    }
  );
}

// Přidat rate limit headers do response
export function addRateLimitHeaders(
  headers: Record<string, string>,
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetAt),
  };
}
