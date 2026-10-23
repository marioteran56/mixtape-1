/**
 * Punto de entrada para Cloudflare Workers con Static Assets (`npx wrangler deploy`).
 * Soporta tanto acceso en raíz (`/`) en desarrollo como bajo la ruta exclusiva
 * `/mixtape-1` (`https://cartas.marioteran.dev/mixtape-1`).
 */

import { onRequest as middlewareOnRequest } from '../functions/_middleware';
import { onRequest as loginOnRequest } from '../functions/api/auth/login';
import { onRequest as logoutOnRequest } from '../functions/api/auth/logout';
import { onRequest as sessionOnRequest } from '../functions/api/auth/session';
import { onRequest as mixtapeOnRequest } from '../functions/api/mixtape';
import type { EnvBindings } from './shared/types';

export interface WorkerEnv extends EnvBindings {
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

const SUBPATH_PREFIX = '/mixtape-1';

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const originalUrl = new URL(request.url);

    // Si accede a /mixtape-1 sin barra final, redirigir a /mixtape-1/ para que
    // los assets relativos (./assets/...) resuelvan dentro de /mixtape-1/
    if (originalUrl.pathname === SUBPATH_PREFIX) {
      const redirectUrl = new URL(`${SUBPATH_PREFIX}/${originalUrl.search}`, originalUrl.origin);
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Normalizar la ruta interna quitando el prefijo /mixtape-1 cuando esté presente
    const hasSubpath =
      originalUrl.pathname === SUBPATH_PREFIX ||
      originalUrl.pathname.startsWith(`${SUBPATH_PREFIX}/`);

    const internalPathname = hasSubpath
      ? originalUrl.pathname.slice(SUBPATH_PREFIX.length) || '/'
      : originalUrl.pathname;

    const internalUrl = new URL(internalPathname + originalUrl.search, originalUrl.origin);
    const internalRequest = new Request(internalUrl.toString(), request);

    const dispatchRoute = async (): Promise<Response> => {
      if (internalPathname === '/api/auth/login') {
        return loginOnRequest({ request: internalRequest, env });
      }
      if (internalPathname === '/api/auth/logout') {
        return logoutOnRequest({ request: internalRequest, env });
      }
      if (internalPathname === '/api/auth/session') {
        return sessionOnRequest({ request: internalRequest, env });
      }
      if (internalPathname === '/api/mixtape') {
        return mixtapeOnRequest({ request: internalRequest, env });
      }
      if (internalPathname === '/carta' || internalPathname.startsWith('/carta/')) {
        const rootUrl = new URL('/', originalUrl.origin);
        if (env.ASSETS) {
          return env.ASSETS.fetch(new Request(rootUrl.toString(), internalRequest));
        }
      }
      if (env.ASSETS) {
        return env.ASSETS.fetch(internalRequest);
      }
      return new Response('Not Found', { status: 404 });
    };

    return middlewareOnRequest({
      request: internalRequest,
      env,
      next: dispatchRoute,
    });
  },
};
