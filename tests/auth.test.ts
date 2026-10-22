import { beforeEach, describe, expect, it } from 'vitest';
import { onRequest as middlewareOnRequest } from '../functions/_middleware';
import { onRequest as loginOnRequest } from '../functions/api/auth/login';
import { onRequest as logoutOnRequest } from '../functions/api/auth/logout';
import { onRequest as sessionOnRequest } from '../functions/api/auth/session';
import { onRequest as mixtapeOnRequest } from '../functions/api/mixtape';
import {
  createSessionToken,
  getCookieValue,
  resetRateLimiter,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '../src/server/auth';
import type { EnvBindings } from '../src/shared/types';

const TEST_ENV: EnvBindings = {
  SITE_PASSWORD: 'clave-super-secreta-2026',
  SESSION_SECRET: '0123456789abcdef0123456789abcdef-secret-key',
  ALLOW_DEMO_FIXTURE: 'true',
};

describe('Autenticación, Sesiones Firmadas y Protección de Rutas', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('permite login con contraseña correcta y emite cookie HttpOnly firmada', async () => {
    const req = new Request('https://mixtape.example.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'clave-super-secreta-2026',
        visitorName: 'Mi Persona Especial',
      }),
    });

    const res = await loginOnRequest({ request: req, env: TEST_ENV });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.authenticated).toBe(true);
    expect(data.visitorName).toBe('Mi Persona Especial');

    const setCookie = res.headers.get('Set-Cookie');
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Secure');

    const token = getCookieValue(setCookie!.split(';')[0], SESSION_COOKIE_NAME);
    const verified = await verifySessionToken(token, TEST_ENV.SESSION_SECRET);
    expect(verified).not.toBeNull();
    expect(verified?.visitorName).toBe('Mi Persona Especial');
  });

  it('rechaza contraseña incorrecta con estado 401 y sin emitir cookie', async () => {
    const req = new Request('https://mixtape.example.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'clave-equivocada' }),
    });

    const res = await loginOnRequest({ request: req, env: TEST_ENV });
    expect(res.status).toBe(401);
    expect(res.headers.get('Set-Cookie')).toBeNull();

    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.error).toBeTruthy();
  });

  it('bloquea peticiones a /api/mixtape sin sesión activa (401)', async () => {
    const req = new Request('https://mixtape.example.com/api/mixtape', {
      method: 'GET',
    });

    const res = await middlewareOnRequest({
      request: req,
      env: TEST_ENV,
      next: () => mixtapeOnRequest({ request: req, env: TEST_ENV }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  it('redirige peticiones HTML a /carta sin sesión hacia la portada de login (302)', async () => {
    const req = new Request('https://mixtape.example.com/carta', {
      method: 'GET',
    });

    const res = await middlewareOnRequest({
      request: req,
      env: TEST_ENV,
      next: async () => new Response('Contenido privado HTML', { status: 200 }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('https://mixtape.example.com/');
  });

  it('rechaza sesiones expiradas y tokens manipulados', async () => {
    const pastSeconds = Math.floor(Date.now() / 1000) - 7200;
    const { token: expiredToken } = await createSessionToken(TEST_ENV.SESSION_SECRET!, {
      nowSeconds: pastSeconds,
      ttlSeconds: 3600, // Expiró hace 1 hora
    });

    const verifiedExpired = await verifySessionToken(expiredToken, TEST_ENV.SESSION_SECRET);
    expect(verifiedExpired).toBeNull();

    const { token: validToken } = await createSessionToken(TEST_ENV.SESSION_SECRET!);
    const tamperedToken = `${validToken.slice(0, -4)}AAAA`;
    const verifiedTampered = await verifySessionToken(tamperedToken, TEST_ENV.SESSION_SECRET);
    expect(verifiedTampered).toBeNull();

    const req = new Request('https://mixtape.example.com/api/mixtape', {
      method: 'GET',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${expiredToken}`,
      },
    });
    const res = await mixtapeOnRequest({ request: req, env: TEST_ENV });
    expect(res.status).toBe(401);
  });

  it('invalida la sesión en POST /api/auth/logout e impide acceso posterior', async () => {
    const logoutReq = new Request('https://mixtape.example.com/api/auth/logout', {
      method: 'POST',
    });
    const logoutRes = await logoutOnRequest({ request: logoutReq, env: TEST_ENV });
    expect(logoutRes.status).toBe(200);

    const setCookie = logoutRes.headers.get('Set-Cookie') || '';
    expect(setCookie).toContain('Max-Age=0');

    const clearedCookiePair = setCookie.split(';')[0];
    const sessionReq = new Request('https://mixtape.example.com/api/auth/session', {
      method: 'GET',
      headers: { Cookie: clearedCookiePair },
    });
    const sessionRes = await sessionOnRequest({ request: sessionReq, env: TEST_ENV });
    const sessionBody = await sessionRes.json();
    expect(sessionBody.authenticated).toBe(false);
  });

  it('aplica rate limiting tras intentos fallidos repetidos (429)', async () => {
    for (let i = 0; i < 8; i++) {
      const req = new Request('https://mixtape.example.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-connecting-ip': '203.0.113.42',
        },
        body: JSON.stringify({ password: `intento-fallido-${i}` }),
      });
      const res = await loginOnRequest({ request: req, env: TEST_ENV });
      expect(res.status).toBe(401);
    }

    const blockedReq = new Request('https://mixtape.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.42',
      },
      body: JSON.stringify({ password: 'clave-super-secreta-2026' }),
    });
    const blockedRes = await loginOnRequest({ request: blockedReq, env: TEST_ENV });
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('Retry-After')).toBeTruthy();
  });
});
