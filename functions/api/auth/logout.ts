/**
 * POST /api/auth/logout
 * Invalida y expira inmediatamente la cookie de sesión.
 */

import { buildClearSessionCookie, isRequestSecure } from '../../../src/server/auth';
import type { AuthSessionResponse, EnvBindings } from '../../../src/shared/types';

export interface LogoutContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestPost(context: LogoutContext): Promise<Response> {
  const clearCookie = buildClearSessionCookie(isRequestSecure(context.request));
  const body: AuthSessionResponse = {
    authenticated: false,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'Set-Cookie': clearCookie,
    },
  });
}

export async function onRequest(context: LogoutContext): Promise<Response> {
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Método no permitido. Usa POST /api/auth/logout.' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Allow: 'POST',
        },
      }
    );
  }
  return onRequestPost(context);
}
