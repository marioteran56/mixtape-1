/**
 * GET /api/auth/session
 * Verifica si existe una sesión activa y firmada válida en las cookies de la petición.
 */

import {
  getCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '../../../src/server/auth';
import type { AuthSessionResponse, EnvBindings } from '../../../src/shared/types';

export interface SessionContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: SessionContext): Promise<Response> {
  const { request, env } = context;
  const cookieHeader = request.headers.get('Cookie');
  const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  const session = await verifySessionToken(token, env.SESSION_SECRET);

  const body: AuthSessionResponse = session
    ? {
        authenticated: true,
        visitorName: session.visitorName,
        expiresAt: session.exp * 1000,
      }
    : {
        authenticated: false,
      };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    },
  });
}

export async function onRequest(context: SessionContext): Promise<Response> {
  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Método no permitido. Usa GET /api/auth/session.' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Allow: 'GET',
        },
      }
    );
  }
  return onRequestGet(context);
}
