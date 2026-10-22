/**
 * Punto de entrada para Cloudflare Workers con Static Assets (`npx wrangler deploy`).
 * Enruta `/api/auth/*`, `/api/mixtape` y `/carta` a través de los mismos handlers
 * y middleware de `functions/`, y delega los archivos estáticos (`dist/`) a `env.ASSETS`.
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

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const dispatchRoute = async (): Promise<Response> => {
      if (pathname === '/api/auth/login') {
        return loginOnRequest({ request, env });
      }
      if (pathname === '/api/auth/logout') {
        return logoutOnRequest({ request, env });
      }
      if (pathname === '/api/auth/session') {
        return sessionOnRequest({ request, env });
      }
      if (pathname === '/api/mixtape') {
        return mixtapeOnRequest({ request, env });
      }
      if (pathname === '/carta' || pathname.startsWith('/carta/')) {
        const rootUrl = new URL('/', request.url);
        if (env.ASSETS) {
          return env.ASSETS.fetch(new Request(rootUrl.toString(), request));
        }
      }
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Not Found', { status: 404 });
    };

    return middlewareOnRequest({
      request,
      env,
      next: dispatchRoute,
    });
  },
};
