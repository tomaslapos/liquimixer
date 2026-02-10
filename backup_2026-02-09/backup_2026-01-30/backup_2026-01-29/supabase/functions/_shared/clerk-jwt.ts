// ============================================
// CLERK JWT VERIFIKACE
// Plná verifikace podpisu pomocí JWKS nebo PEM klíče
// ============================================

// Cache pro JWKS klíče (aby se nenačítaly při každém požadavku)
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hodina

// Clerk JWKS URL - automaticky odvozeno z Clerk domény
function getJwksUrl(): string {
  // Pro produkci s custom doménou
  const clerkDomain = Deno.env.get('CLERK_DOMAIN') || 'clerk.liquimixer.com';
  return `https://${clerkDomain}/.well-known/jwks.json`;
}

// Načíst JWKS klíče z Clerk
async function fetchJwks(): Promise<any[]> {
  // Zkontrolovat cache
  if (jwksCache && (Date.now() - jwksCache.fetchedAt) < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  try {
    const jwksUrl = getJwksUrl();
    console.log('Fetching JWKS from:', jwksUrl);
    
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`JWKS fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    jwksCache = {
      keys: data.keys || [],
      fetchedAt: Date.now()
    };
    
    return jwksCache.keys;
  } catch (error) {
    console.error('JWKS fetch error:', error);
    // Fallback na PEM klíč pokud je nastaven
    return [];
  }
}

// Dekódovat Base64URL (JWT používá Base64URL, ne standardní Base64)
function base64UrlDecode(str: string): Uint8Array {
  // Převést Base64URL na Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Přidat padding
  while (base64.length % 4) {
    base64 += '=';
  }
  // Dekódovat
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Importovat RSA public key z JWK
async function importRsaPublicKey(jwk: any): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: jwk.alg || 'RS256',
      use: 'sig'
    },
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  );
}

// Najít správný klíč podle kid
async function findKeyByKid(kid: string): Promise<CryptoKey | null> {
  const keys = await fetchJwks();
  const jwk = keys.find(k => k.kid === kid);
  
  if (!jwk) {
    console.error('Key not found for kid:', kid);
    return null;
  }
  
  return await importRsaPublicKey(jwk);
}

// Ověřit podpis JWT
async function verifyJwtSignature(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Dekódovat header pro získání kid
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
    
    if (!header.kid) {
      console.error('JWT header missing kid');
      return false;
    }
    
    // Najít klíč
    const key = await findKeyByKid(header.kid);
    if (!key) return false;
    
    // Připravit data pro ověření (header.payload)
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);
    
    // Ověřit podpis
    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      signature,
      data
    );
    
    return isValid;
  } catch (error) {
    console.error('JWT signature verification error:', error);
    return false;
  }
}

// Hlavní funkce pro verifikaci Clerk tokenu
export interface ClerkTokenPayload {
  sub: string;           // Clerk User ID
  email?: string;        // Email uživatele
  azp?: string;          // Authorized party (origin)
  exp: number;           // Expirace
  iat: number;           // Vydáno
  nbf?: number;          // Platné od
}

export async function verifyClerkToken(
  token: string,
  options?: {
    authorizedParties?: string[];  // Povolené origins
    skipSignatureVerification?: boolean;  // Pro testování
  }
): Promise<ClerkTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // Dekódovat payload
    const payload: ClerkTokenPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(parts[1]))
    );
    
    // 1. Kontrola expirace
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('JWT expired');
      return null;
    }
    
    // 2. Kontrola nbf (not before)
    if (payload.nbf && payload.nbf > now) {
      console.error('JWT not yet valid');
      return null;
    }
    
    // 3. Kontrola sub (musí existovat)
    if (!payload.sub) {
      console.error('JWT missing sub claim');
      return null;
    }
    
    // 4. Kontrola authorized parties (pokud je specifikována)
    if (options?.authorizedParties && payload.azp) {
      if (!options.authorizedParties.includes(payload.azp)) {
        console.error('JWT azp not in authorized parties:', payload.azp);
        return null;
      }
    }
    
    // 5. Ověřit podpis (pokud není přeskočeno)
    if (!options?.skipSignatureVerification) {
      const isValidSignature = await verifyJwtSignature(token);
      if (!isValidSignature) {
        console.error('JWT signature verification failed');
        return null;
      }
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Pomocná funkce pro získání clerk_id z tokenu (s plnou verifikací)
export async function getVerifiedClerkId(
  req: Request,
  options?: {
    tokenHeader?: string;  // Default: 'x-clerk-token'
    authorizedParties?: string[];
  }
): Promise<{ clerkId: string; email?: string } | { error: string; status: number }> {
  const headerName = options?.tokenHeader || 'x-clerk-token';
  const token = req.headers.get(headerName);
  
  if (!token) {
    return { error: 'Chybí autorizační token', status: 401 };
  }
  
  const payload = await verifyClerkToken(token, {
    authorizedParties: options?.authorizedParties || [
      'https://www.liquimixer.com',
      'https://liquimixer.com',
    ]
  });
  
  if (!payload) {
    return { error: 'Neplatný nebo expirovaný token', status: 401 };
  }
  
  return { clerkId: payload.sub, email: payload.email };
}
