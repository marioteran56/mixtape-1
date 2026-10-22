import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { onRequest as middlewareOnRequest } from './functions/_middleware';
import { onRequest as loginOnRequest } from './functions/api/auth/login';
import { onRequest as logoutOnRequest } from './functions/api/auth/logout';
import { onRequest as sessionOnRequest } from './functions/api/auth/session';
import { onRequest as mixtapeOnRequest } from './functions/api/mixtape';
import type { EnvBindings } from './src/shared/types';

function loadDevVarsFile(rootDir: string): Record<string, string> {
  const devVarsPath = path.join(rootDir, '.dev.vars');
  const result: Record<string, string> = {};
  if (!fs.existsSync(devVarsPath)) {
    return result;
  }
  const content = fs.readFileSync(devVarsPath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.slice(0, eqIndex).trim();
      const val = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      result[key] = val;
    }
  }
  return result;
}

/**
 * Plugin de desarrollo local que monta los mismos handlers de Cloudflare Pages Functions
 * (`functions/_middleware.ts` y `functions/api/**`) dentro de `vite dev` y `vite preview`.
 */
function cloudflarePagesFunctionsDevPlugin(mode: string): Plugin {
  let envBindings: EnvBindings = {};

  return {
    name: 'cloudflare-pages-functions-local',
    configResolved(config) {
      const viteEnv = loadEnv(mode, config.root, '');
      const devVars = loadDevVarsFile(config.root);

      envBindings = {
        SITE_PASSWORD:
          devVars.SITE_PASSWORD ||
          viteEnv.SITE_PASSWORD ||
          process.env.SITE_PASSWORD ||
          'mixtape28',
        SESSION_SECRET:
          devVars.SESSION_SECRET ||
          viteEnv.SESSION_SECRET ||
          process.env.SESSION_SECRET ||
          'dev-only-session-secret-key-with-32-plus-chars',
        SPOTIFY_CLIENT_ID:
          devVars.SPOTIFY_CLIENT_ID ||
          viteEnv.SPOTIFY_CLIENT_ID ||
          process.env.SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET:
          devVars.SPOTIFY_CLIENT_SECRET ||
          viteEnv.SPOTIFY_CLIENT_SECRET ||
          process.env.SPOTIFY_CLIENT_SECRET,
        SPOTIFY_PLAYLIST_ID:
          devVars.SPOTIFY_PLAYLIST_ID ||
          viteEnv.SPOTIFY_PLAYLIST_ID ||
          process.env.SPOTIFY_PLAYLIST_ID ||
          '0EJqoSBZPUYuKNj36TKNxt',
        SPOTIFY_MARKET:
          devVars.SPOTIFY_MARKET ||
          viteEnv.SPOTIFY_MARKET ||
          process.env.SPOTIFY_MARKET ||
          'MX',
        SPOTIFY_REFRESH_TOKEN:
          devVars.SPOTIFY_REFRESH_TOKEN ||
          viteEnv.SPOTIFY_REFRESH_TOKEN ||
          process.env.SPOTIFY_REFRESH_TOKEN,
        ALLOW_DEMO_FIXTURE:
          devVars.ALLOW_DEMO_FIXTURE ||
          viteEnv.ALLOW_DEMO_FIXTURE ||
          process.env.ALLOW_DEMO_FIXTURE ||
          'true',
      };
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '/';
        const pathname = rawUrl.split('?')[0];

        const isHandledRoute =
          pathname === '/api/auth/login' ||
          pathname === '/api/auth/logout' ||
          pathname === '/api/auth/session' ||
          pathname === '/api/mixtape' ||
          pathname === '/carta' ||
          pathname.startsWith('/api/private/');

        if (!isHandledRoute) {
          next();
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const bodyBuffer = Buffer.concat(chunks);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              headers.set(key, value.join(', '));
            } else if (typeof value === 'string') {
              headers.set(key, value);
            }
          }

          const fullUrl = `http://${req.headers.host || 'localhost:5173'}${rawUrl}`;
          const method = req.method || 'GET';
          const fetchRequest = new Request(fullUrl, {
            method,
            headers,
            body: method !== 'GET' && method !== 'HEAD' && bodyBuffer.length > 0 ? bodyBuffer : undefined,
          });

          const dispatchRoute = async (): Promise<Response> => {
            if (pathname === '/api/auth/login') {
              return loginOnRequest({ request: fetchRequest, env: envBindings });
            }
            if (pathname === '/api/auth/logout') {
              return logoutOnRequest({ request: fetchRequest, env: envBindings });
            }
            if (pathname === '/api/auth/session') {
              return sessionOnRequest({ request: fetchRequest, env: envBindings });
            }
            if (pathname === '/api/mixtape') {
              return mixtapeOnRequest({ request: fetchRequest, env: envBindings });
            }
            return new Response(null, { status: 204 });
          };

          const response = await middlewareOnRequest({
            request: fetchRequest,
            env: envBindings,
            next: dispatchRoute,
          });

          // Si fue /carta autenticado, dejamos que Vite sirva el index.html
          if (pathname === '/carta' && response.status === 204) {
            req.url = '/';
            next();
            return;
          }

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          const arrayBuffer = await response.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), cloudflarePagesFunctionsDevPlugin(mode)],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
}));
