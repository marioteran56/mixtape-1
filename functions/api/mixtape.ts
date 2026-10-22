/**
 * GET /api/mixtape
 * Endpoint privado protegido por sesión.
 * Valida la cookie firmada del lado servidor, obtiene las pistas de Spotify y las combina
 * con la carta y las dedicatorias privadas (`src/server/editorial-content.ts`).
 */

import {
  getCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '../../src/server/auth';
import { buildMixtapeResponse } from '../../src/server/mixtape-service';
import type { EnvBindings } from '../../src/shared/types';

export interface MixtapeContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: MixtapeContext): Promise<Response> {
  const { request, env } = context;

  // Defensa en profundidad: validar sesión aquí además del middleware
  const cookieHeader = request.headers.get('Cookie');
  const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  const session = await verifySessionToken(token, env.SESSION_SECRET);

  if (!session) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: 'Sesión no válida o expirada. Ingresa la clave secreta para abrir la carta.',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  const mixtapePayload = await buildMixtapeResponse(env, {
    visitorName: session.visitorName,
  });

  return new Response(JSON.stringify(mixtapePayload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    },
  });
}

export async function onRequest(context: MixtapeContext): Promise<Response> {
  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Usa GET /api/mixtape.' }),
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
