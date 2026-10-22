/**
 * Módulo de autenticación y sesiones firmadas del lado servidor.
 * Compatible con Cloudflare Pages Functions (Web Crypto API) y Node.js 20+.
 */

export const SESSION_COOKIE_NAME = 'mixtape_session';
export const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas
const MAX_PASSWORD_LENGTH = 256;
const MAX_VISITOR_NAME_LENGTH = 80;

export interface SessionPayload {
  sub: 'mixtape-reader';
  visitorName?: string;
  iat: number;
  exp: number;
   nonce: string;
}

interface RateLimitRecord {
  attempts: number;
  windowStartMs: number;
  blockedUntilMs: number;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const RATE_LIMIT_BLOCK_MS = 10 * 60 * 1000; // 10 minutos de bloqueo tras superar límite
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Limpia el almacén de rate limiting (útil para pruebas automatizadas).
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
}

/**
 * Verifica si una dirección IP está temporalmente limitada por intentos fallidos repetidos.
 */
export function checkRateLimit(clientKey: string, nowMs = Date.now()): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  if (rateLimitStore.size > 1000) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (nowMs - record.windowStartMs > RATE_LIMIT_WINDOW_MS && nowMs > record.blockedUntilMs) {
        rateLimitStore.delete(key);
      }
    }
  }

  const record = rateLimitStore.get(clientKey);
  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntilMs > nowMs) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.blockedUntilMs - nowMs) / 1000),
    };
  }

  if (nowMs - record.windowStartMs > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.delete(clientKey);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Registra un intento de login fallido para la IP dada.
 */
export function recordFailedAttempt(clientKey: string, nowMs = Date.now()): void {
  const existing = rateLimitStore.get(clientKey);
  if (!existing || nowMs - existing.windowStartMs > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientKey, {
      attempts: 1,
      windowStartMs: nowMs,
      blockedUntilMs: 0,
    });
    return;
  }

  existing.attempts += 1;
  if (existing.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    existing.blockedUntilMs = nowMs + RATE_LIMIT_BLOCK_MS;
  }
  rateLimitStore.set(clientKey, existing);
}

/**
 * Limpia los intentos fallidos tras un login exitoso.
 */
export function clearFailedAttempts(clientKey: string): void {
  rateLimitStore.delete(clientKey);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array | null {
  try {
    const padded = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await importHmacKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return new Uint8Array(signature);
}

/**
 * Comparación en tiempo constante de dos arreglos de bytes de igual longitud.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Verifica la contraseña ingresada contra `SITE_PASSWORD` usando comparación de digest HMAC
 * en tiempo constante para evitar ataques de temporización.
 */
export async function verifyPasswordConstantTime(
  inputPassword: string,
  expectedPassword: string,
  secret: string
): Promise<boolean> {
  if (!expectedPassword || !secret) {
    return false;
  }
  const [digestInput, digestExpected] = await Promise.all([
    hmacSha256(secret, `pwd:${inputPassword}`),
    hmacSha256(secret, `pwd:${expectedPassword}`),
  ]);
  return constantTimeEqual(digestInput, digestExpected);
}

/**
 * Valida y sanea el cuerpo de la petición de login.
 */
export function validateLoginInput(body: unknown): {
  valid: boolean;
  password?: string;
  visitorName?: string;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Solicitud inválida.' };
  }

  const record = body as Record<string, unknown>;
  const rawPassword = record.password;
  const rawVisitor = record.visitorName;

  if (typeof rawPassword !== 'string') {
    return { valid: false, error: 'Debes ingresar la contraseña secreta para continuar.' };
  }

  const trimmedPassword = rawPassword.trim();
  if (trimmedPassword.length === 0) {
    return { valid: false, error: 'Debes ingresar la contraseña secreta para continuar.' };
  }

  if (trimmedPassword.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, error: 'La contraseña ingresada excede la longitud permitida.' };
  }

  let visitorName: string | undefined;
  if (typeof rawVisitor === 'string' && rawVisitor.trim().length > 0) {
    const cleaned = rawVisitor.trim().slice(0, MAX_VISITOR_NAME_LENGTH).replace(/[<>]/g, '');
    if (cleaned.length > 0) {
      visitorName = cleaned;
    }
  }

  return {
    valid: true,
    password: trimmedPassword,
    visitorName,
  };
}

/**
 * Crea un token de sesión firmado con HMAC-SHA256 y tiempo de expiración explícito.
 */
export async function createSessionToken(
  secret: string,
  options?: {
    visitorName?: string;
    ttlSeconds?: number;
    nowSeconds?: number;
  }
): Promise<{ token: string; payload: SessionPayload }> {
  if (!secret || secret.trim().length < 16) {
    throw new Error('SESSION_SECRET no está configurado o es demasiado corto (mínimo 16 caracteres).');
  }

  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);

  const payload: SessionPayload = {
    sub: 'mixtape-reader',
    visitorName: options?.visitorName,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    nonce: bytesToBase64Url(randomBytes),
  };

  const encoder = new TextEncoder();
  const payloadBase64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signatureBytes = await hmacSha256(secret, payloadBase64);
  const signatureBase64 = bytesToBase64Url(signatureBytes);

  return {
    token: `${payloadBase64}.${signatureBase64}`,
    payload,
  };
}

/**
 * Verifica la firma criptográfica y la expiración de un token de sesión.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  secret: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1000)
): Promise<SessionPayload | null> {
  if (!token || !secret || secret.trim().length < 16) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signatureBase64] = parts;
  if (!payloadBase64 || !signatureBase64) {
    return null;
  }

  const providedSig = base64UrlToBytes(signatureBase64);
  if (!providedSig) {
    return null;
  }

  const expectedSig = await hmacSha256(secret, payloadBase64);
  if (!constantTimeEqual(providedSig, expectedSig)) {
    return null;
  }

  const payloadBytes = base64UrlToBytes(payloadBase64);
  if (!payloadBytes) {
    return null;
  }

  try {
    const decoder = new TextDecoder();
    const parsed = JSON.parse(decoder.decode(payloadBytes)) as Partial<SessionPayload>;
    if (
      parsed.sub !== 'mixtape-reader' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.iat !== 'number'
    ) {
      return null;
    }

    if (parsed.exp <= nowSeconds) {
      return null;
    }

    return {
      sub: 'mixtape-reader',
      visitorName: typeof parsed.visitorName === 'string' ? parsed.visitorName : undefined,
      iat: parsed.iat,
      exp: parsed.exp,
      nonce: typeof parsed.nonce === 'string' ? parsed.nonce : '',
    };
  } catch {
    return null;
  }
}

/**
 * Extrae el valor de una cookie específica desde el encabezado `Cookie`.
 */
export function getCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(';');
  for (const rawCookie of cookies) {
    const [key, ...rest] = rawCookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

/**
 * Serializa la cookie de sesión con atributos de seguridad estrictos:
 * HttpOnly, SameSite=Lax, Path=/, Max-Age explícito y Secure en HTTPS/producción.
 */
export function buildSessionCookie(
  token: string,
  options: {
    maxAgeSeconds?: number;
    isSecure: boolean;
  }
): string {
  const maxAge = options.maxAgeSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (options.isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Construye una cabecera `Set-Cookie` que invalida y borra inmediatamente la sesión.
 */
export function buildClearSessionCookie(isSecure: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Determina si una petición proviene de un entorno HTTPS (producción en Cloudflare Pages).
 */
export function isRequestSecure(request: Request): boolean {
  try {
    const url = new URL(request.url);
    if (url.protocol === 'https:') {
      return true;
    }
    const forwardedProto = request.headers.get('x-forwarded-proto');
    return forwardedProto === 'https';
  } catch {
    return false;
  }
}

/**
 * Obtiene el identificador de cliente (IP) desde encabezados de Cloudflare o fallback local.
 */
export function getClientIdentifier(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local-client'
  );
}
