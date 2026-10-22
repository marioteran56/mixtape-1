/**
 * GET /carta
 * Ruta HTML protegida: si el visitante no tiene sesión válida, redirige a `/`.
 * Si tiene sesión válida, entrega el documento de la aplicación.
 */

import {
  getCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '../src/server/auth';
import type { EnvBindings } from '../src/shared/types';

export interface CartaContext {
  request: Request;
  env: EnvBindings;
  next: () => Promise<Response>;
}

export async function onRequestGet(context: CartaContext): Promise<Response> {
  const { request, env, next } = context;
  const cookieHeader = request.headers.get('Cookie');
  const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  const session = await verifySessionToken(token, env.SESSION_SECRET);

  if (!session) {
    const loginUrl = new URL('/', request.url);
    return new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl.toString(),
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      },
    });
  }

  // Reenviar al index.html de la aplicación
  const rootUrl = new URL('/', request.url);
  const assetRequest = new Request(rootUrl.toString(), request);
  const response = await next();
  if (response.status === 404) {
    return fetch(assetRequest);
  }
  return response;
}

export async function onRequest(context: CartaContext): Promise<Response> {
  return onRequestGet(context);
}
