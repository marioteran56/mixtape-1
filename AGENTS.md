# Guía para Agentes (`AGENTS.md`)

Este archivo contiene las instrucciones duraderas de arquitectura, seguridad, diseño y flujo de trabajo para cualquier agente que trabaje en este repositorio.

---

## 1. Propósito del Proyecto

Aplicación web de carta digital privada y mixtape interactivo basada en el proyecto de Google Stitch **Playlist Romántica Interactiva** (`projects/3351798792530970780`, sistema de diseño **Paper Mixtape**).

El sistema protege la carta y las dedicatorias personales detrás de una sesión firmada del lado servidor y combina dinámicamente las canciones obtenidas desde la API oficial de Spotify con el mapa editorial configurado por el autor.

---

## 2. Arquitectura Real y Estructura de Carpetas

El proyecto utiliza **Vite + TypeScript + Tailwind CSS v4** para el frontend estático y **Cloudflare Pages Functions** (`functions/`) para la autenticación y la entrega protegida de datos.

```text
Playlist/
├── index.html                      # Shell público (contiene solo el Sobre Postal de login y #mixtapeView vacío)
├── vite.config.ts                  # Configuración de Vite + plugin local que monta las Pages Functions en dev
├── wrangler.jsonc                  # Configuración de despliegue en Cloudflare Pages (sin secretos)
├── DESIGN.md                       # Sistema de diseño Paper Mixtape extraído de Google Stitch
├── README.md                       # Guía completa de configuración, Spotify OAuth y despliegue
├── src/
│   ├── shared/
│   │   └── types.ts                # Interfaces TypeScript compartidas (cero datos privados)
│   ├── client/
│   │   ├── main.ts                 # Flujo de apertura del sobre, login/logout y carga de /api/mixtape
│   │   ├── render-mixtape.ts       # Renderizador de la carta y las 6 plantillas de canción de Stitch
│   │   └── styles.css              # Tokens de color/tipografía Paper Mixtape, animaciones y reduced-motion
│   └── server/
│       ├── auth.ts                 # HMAC-SHA256 (Web Crypto), cookies HttpOnly, rate limiter, comparación constante
│       ├── editorial-content.ts    # ARCHIVO DE CONTENIDO PRIVADO: carta + mapa de dedicatorias + fixture demo
│       ├── mixtape-service.ts      # Cruza pistas de Spotify con dedicatorias por trackId estable
│       └── spotify.ts              # Adaptador server-side para Spotify Web API (Client Credentials + Refresh Token)
├── functions/
│   ├── _middleware.ts              # Middleware de Cloudflare Pages: cabeceras seguras y bloqueo de rutas privadas
│   ├── carta.ts                    # Ruta HTML protegida (/carta redirige a / si no hay sesión)
│   └── api/
│       ├── auth/
│       │   ├── login.ts            # POST /api/auth/login
│       │   ├── logout.ts           # POST /api/auth/logout
│       │   └── session.ts          # GET /api/auth/session
│       └── mixtape.ts              # GET /api/mixtape (entrega carta + playlist combinada tras validar sesión)
└── tests/
    ├── auth.test.ts                # Pruebas de login, cookie HttpOnly, expiración, logout y rate limiting
    ├── mixtape-mapper.test.ts      # Pruebas de cruce por trackId, duplicados, no configuradas y templates Stitch
    ├── spotify.test.ts             # Pruebas del adaptador de Spotify, caché y errores 401/403/429
    └── security-bundle.test.ts     # Verifica que ni src/client/ ni dist/ contengan textos privados o secretos
```

---

## 3. Reglas Estrictas de Seguridad (Inquebrantables)

1. **Separación Cliente/Servidor:** `src/client/*` e `index.html` **jamás** deben importar `src/server/editorial-content.ts` ni incluir fragmentos de la carta o dedicatorias. El test `tests/security-bundle.test.ts` falla automáticamente si algún texto privado se filtra al bundle público.
2. **Sin Secretos en el Bundle ni en Git:** `SITE_PASSWORD`, `SESSION_SECRET`, `SPOTIFY_CLIENT_SECRET` y `SPOTIFY_REFRESH_TOKEN` solo se leen desde `context.env` en el servidor. Nunca uses variables con prefijo `VITE_` para credenciales o contraseñas.
3. **Cookies Seguras:** Las sesiones se firman con HMAC-SHA256 en `src/server/auth.ts` y se envían en la cookie `mixtape_session` con atributos `HttpOnly; SameSite=Lax; Path=/; Max-Age=43200` (y `Secure` en HTTPS).
4. **Source Maps Desactivados:** `build.sourcemap` debe permanecer en `false` en `vite.config.ts`.

---

## 4. Dónde Editar el Contenido Editorial

Todo el contenido personal vive exclusivamente en:
- `src/server/editorial-content.ts`
  - `PRIVATE_LETTER_CONTENT`: Texto de la carta de introducción y de la nota final de despedida.
  - `EDITORIAL_TRACK_ENTRIES`: Arreglo de objetos `EditorialEntry` enlazados mediante `trackId` (el ID de 22 caracteres de Spotify o URI `spotify:track:...`).

### Plantillas de Canción Soportadas (`template`)
Cada canción puede usar cualquiera de las 6 plantillas extraídas de Stitch (o sus alias semánticos):
- `'polaroid'` (alias `'dedication'`): Tarjeta Polaroid clásica con washi tape menta y nota Post-it amarilla inclinada.
- `'post-it'`: Tarjeta rosa translúcida en dos columnas con recorte cuadrado, etiqueta de ubicación y nota.
- `'cassette'`: Tarjeta kraft con carcasa de cassette C-60 animada y nota tipo servilleta blanca.
- `'ticket'` (alias `'short-note'`): Boleto de concierto `ADMIT ONE: MIXTAPE PASS` con nota breve.
- `'double-polaroid'` (alias `'quote'`): Doble cinta washi con portada 1:1 y tarjeta postal de cita destacada al lado.
- `'minimal'`: Tarjeta compacta horizontal estilo Bonus Track (también usada como plantilla de reserva cuando una canción de la playlist aún no tiene entrada en `EDITORIAL_TRACK_ENTRIES`).

---

## 5. Políticas de Diseño y Spotify

- Respeta siempre los tokens y la estética definidos en `DESIGN.md`.
- **No recortes ni superpongas elementos sobre las portadas de Spotify:** todas las portadas usan contenedores cuadrados `aspect-square` con `object-contain` y enlazan directamente a `spotify.spotifyUrl` con atribución explícita a Spotify.
- **No extraigas ni inventes letras automáticas:** las citas breves (`quote`) y dedicatorias (`dedication`) son textos curados manualmente por el autor en `src/server/editorial-content.ts`.

---

## 6. Comandos de Desarrollo, Pruebas y Despliegue

- **Instalar dependencias:** `npm install`
- **Servidor de desarrollo (con funciones API locales activas):** `npm run dev`
- **Verificación de tipos (TypeScript):** `npm run typecheck`
- **Ejecutar suite de pruebas (Vitest):** `npm test`
- **Compilar para producción (`dist/`):** `npm run build`
- **Probar con runtime local de Cloudflare Pages (Wrangler):** `npm run pages:dev`
- **Desplegar en Cloudflare Pages:** `npm run pages:deploy`
