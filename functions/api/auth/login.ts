/**
 * POST /api/auth/login
 * Verifica la contraseña compartida (`SITE_PASSWORD`), aplica mitigación contra fuerza bruta
 * y emite una cookie `HttpOnly` firmada con HMAC-SHA256 (`SESSION_SECRET`).
 */

import {
  buildSessionCookie,
  checkRateLimit,
  clearFailedAttempts,
  createSessionToken,
  getClientIdentifier,
  isRequestSecure,
  recordFailedAttempt,
  validateLoginInput,
  verifyPasswordConstantTime,
} from '../../../src/server/auth';
import type { AuthSessionResponse, EnvBindings } from '../../../src/shared/types';

export interface LoginContext {
  request: Request;
  env: EnvBindings;
}

function jsonResponse(body: AuthSessionResponse, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      ...extraHeaders,
    },
  });
}

export async function onRequestPost(context: LoginContext): Promise<Response> {
  const { request, env } = context;

  const sitePassword = env.SITE_PASSWORD?.trim();
  const sessionSecret = env.SESSION_SECRET?.trim();

  if (!sitePassword || !sessionSecret || sessionSecret.length < 16) {
    return jsonResponse(
      {
        authenticated: false,
        error:
          'El servidor no tiene configurados SITE_PASSWORD o SESSION_SECRET (mínimo 16 caracteres). Revisa las variables de entorno.',
      },
      500
    );
  }

  const clientKey = getClientIdentifier(request);
  const rateCheck = checkRateLimit(clientKey);
  if (!rateCheck.allowed) {
    return jsonResponse(
      {
        authenticated: false,
        error: `Demasiados intentos seguidos. Por favor espera ${rateCheck.retryAfterSeconds ?? 60} segundos antes de volver a intentar.`,
      },
      429,
      {
        'Retry-After': String(rateCheck.retryAfterSeconds ?? 60),
      }
    );
  }

  let rawBody: unknown;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return jsonResponse(
        { authenticated: false, error: 'Formato de solicitud no soportado.' },
        400
      );
    }
    rawBody = await request.json();
  } catch {
    return jsonResponse(
      { authenticated: false, error: 'No se pudo procesar la solicitud.' },
      400
    );
  }

  const validation = validateLoginInput(rawBody);
  if (!validation.valid || !validation.password) {
    return jsonResponse(
      {
        authenticated: false,
        error: validation.error || 'Debes ingresar la contraseña secreta para continuar.',
      },
      400
    );
  }

  const isPasswordMatch = await verifyPasswordConstantTime(
    validation.password,
    sitePassword,
    sessionSecret
  );

  if (!isPasswordMatch) {
    recordFailedAttempt(clientKey);
    return jsonResponse(
      {
        authenticated: false,
        error: 'La clave secreta no coincide. Pide una pista al remitente para abrir el sobre.',
      },
      401
    );
  }

  clearFailedAttempts(clientKey);

  const { token, payload } = await createSessionToken(sessionSecret, {
    visitorName: validation.visitorName,
  });

  const cookieHeader = buildSessionCookie(token, {
    isSecure: isRequestSecure(request),
  });

  return jsonResponse(
    {
      authenticated: true,
      visitorName: payload.visitorName,
      expiresAt: payload.exp * 1000,
    },
    200,
    {
      'Set-Cookie': cookieHeader,
    }
  );
}

export async function onRequest(context: LoginContext): Promise<Response> {
  if (context.request.method !== 'POST') {
    return jsonResponse(
      { authenticated: false, error: 'Método no permitido. Usa POST /api/auth/login.' },
      405,
      { Allow: 'POST' }
    );
  }
  return onRequestPost(context);
}
