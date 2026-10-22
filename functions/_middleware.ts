/**
 * Cloudflare Pages Middleware (`functions/_middleware.ts`)
 * Protege las rutas privadas de datos (`/api/mixtape`, `/api/private/*`) y documentos (`/carta`)
 * validando la sesión firmada antes de entregar cualquier respuesta.
 */

import {
  getCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '../src/server/auth';
import type { EnvBindings } from '../src/shared/types';

export interface PagesFunctionContext {
  request: Request;
  env: EnvBindings;
  next: () => Promise<Response>;
}

function withSecurityHeaders(response: Response, isPrivate = false): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  headers.set('X-Frame-Options', 'DENY');
  if (isPrivate) {
    headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  const isProtectedApi =
    pathname === '/api/mixtape' ||
    pathname.startsWith('/api/mixtape/') ||
    pathname.startsWith('/api/private/');

  const isProtectedPage = pathname === '/carta' || pathname.startsWith('/carta/');

  if (isProtectedApi || isProtectedPage) {
    const cookieHeader = request.headers.get('Cookie');
    const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
    const session = await verifySessionToken(token, env.SESSION_SECRET);

    if (!session) {
      if (isProtectedApi) {
        return withSecurityHeaders(
          new Response(
            JSON.stringify({
              authenticated: false,
              error: 'Acceso no autorizado. Ingresa la clave secreta para abrir el sobre.',
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
            }
          ),
          true
        );
      }

      // Redirigir páginas HTML protegidas a la portada de acceso
      const loginUrl = new URL('/', url.origin);
      return withSecurityHeaders(
        new Response(null, {
          status: 302,
          headers: {
            Location: loginUrl.toString(),
          },
        }),
        true
      );
    }
  }

  const response = await next();
  return withSecurityHeaders(response, isProtectedApi || isProtectedPage || pathname.startsWith('/api/'));
}
