# Playlist Romántica Interactiva • Carta Digital Privada (`Paper Mixtape`)

Aplicación web privada que transforma el diseño **Playlist Romántica Interactiva** de Google Stitch (`projects/3351798792530970780`) en una carta digital interactiva protegida por contraseña y conectada dinámicamente a la API oficial de Spotify.

---

## 1. Decisión de Arquitectura y Stack

Se eligió **Vite + TypeScript + Tailwind CSS v4** junto con **Cloudflare Pages Functions** (`functions/`) por tres razones clave:

1. **Seguridad Real sin Sobreingeniería:** Las Pages Functions se ejecutan en el borde de Cloudflare dentro del mismo proyecto sin necesidad de mantener un servidor Node adicional, bases de datos ni CMS. La carta privada y el mapa de dedicatorias residen exclusivamente en `src/server/editorial-content.ts` y solo se entregan tras validar una cookie de sesión `HttpOnly` firmada con HMAC-SHA256.
2. **Fidelidad Exacta a Google Stitch:** El diseño original en Stitch está construido sobre tokens de color y tipografía *Paper Mixtape* (`Epilogue`, `Literata`, `Plus Jakarta Sans`, `Playfair Display`, `Caveat`). Usar Tailwind CSS con los tokens exactos permite reproducir tanto el sobre postal interactivo de acceso como las 6 plantillas distintas de tarjetas de canción estilo scrapbook.
3. **Cero Exposición de Secretos:** El bundle estático (`dist/`) contiene únicamente el cascarón visual del sobre de acceso y las funciones de renderizado vacías. Una prueba automatizada (`tests/security-bundle.test.ts`) verifica en cada build que ningún texto privado ni credencial se filtre al cliente.

---

## 2. Requisitos Previos

- **Node.js** `>= 20.x` y `npm` `>= 10.x`.
- Una cuenta en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) para obtener `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`.
- Una cuenta de **Cloudflare** (plan gratuito o superior) para desplegar en Cloudflare Pages.

---

## 3. Instalación y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno locales:**
   Copia el archivo de ejemplo a `.dev.vars` (o `.env`):
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Edita `.dev.vars` con tu contraseña deseada y tus credenciales de Spotify.

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   > `vite.config.ts` incluye un middleware local que monta automáticamente todos los endpoints de `functions/` (`/api/auth/login`, `/api/auth/logout`, `/api/auth/session`, `/api/mixtape` y `/carta`). Si aún no has configurado tus credenciales de Spotify y tienes `ALLOW_DEMO_FIXTURE=true`, el servidor te mostrará las canciones del fixture de demostración extraído de Stitch indicando claramente que está en modo demo.

4. **Probar con el runtime local de Cloudflare Pages (opcional):**
   ```bash
   npm run pages:dev
   ```

---

## 4. Variables de Entorno

| Variable | Obligatoria | Dónde se usa | Descripción |
| :--- | :--- | :--- | :--- |
| `SITE_PASSWORD` | **Sí** | Solo Servidor | Contraseña compartida única para desbloquear el sobre postal. |
| `SESSION_SECRET` | **Sí** | Solo Servidor | Cadena aleatoria de al menos 32 caracteres para firmar las sesiones HMAC-SHA256. |
| `SPOTIFY_CLIENT_ID` | **Sí** | Solo Servidor | Client ID de tu app en Spotify Developer Dashboard. |
| `SPOTIFY_CLIENT_SECRET` | **Sí** | Solo Servidor | Client Secret de tu app en Spotify (nunca se expone al navegador). |
| `SPOTIFY_PLAYLIST_ID` | **Sí** | Solo Servidor | ID de la playlist de Spotify (ej. `0EJqoSBZPUYuKNj36TKNxt`) o su URL. |
| `SPOTIFY_MARKET` | No | Solo Servidor | Código ISO de país de 2 letras (por defecto `MX`). |
| `SPOTIFY_REFRESH_TOKEN` | Condicional | Solo Servidor | Necesario si la playlist es privada, colaborativa o restringida al propietario. |
| `ALLOW_DEMO_FIXTURE` | No | Solo Servidor | `true` en desarrollo para permitir el fixture de demostración si faltan credenciales; `false` en producción. |

Para generar un `SESSION_SECRET` seguro desde tu terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Configuración de Spotify y Obtención de `SPOTIFY_REFRESH_TOKEN`

### Caso A: Playlist Pública Accesible con Client Credentials
1. Entra a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) y crea una aplicación.
2. Copia el **Client ID** y **Client Secret** en `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`.
3. Coloca el ID de tu playlist en `SPOTIFY_PLAYLIST_ID`.

### Caso B: Playlist Privada o que Requiere Permisos del Propietario (OAuth Refresh Token)
Si tu playlist es privada o la API de Spotify devuelve `403` / `404` con Client Credentials:
1. En la configuración de tu app en Spotify Developer Dashboard, agrega `http://127.0.0.1:8888/callback` en **Redirect URIs** y guarda.
2. Abre en tu navegador la siguiente URL (reemplazando `TU_CLIENT_ID`):
   ```text
   https://accounts.spotify.com/authorize?client_id=TU_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=playlist-read-private%20playlist-read-collaborative
   ```
3. Tras autorizar, Spotify te redirigirá a `http://127.0.0.1:8888/callback?code=CODIGO_AQUI`. Copia el valor de `code`.
4. Canjea el código por un `refresh_token` desde tu terminal:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -u "TU_CLIENT_ID:TU_CLIENT_SECRET" \
     -d "grant_type=authorization_code&code=CODIGO_AQUI&redirect_uri=http://127.0.0.1:8888/callback"
   ```
5. Guarda el campo `"refresh_token"` de la respuesta en la variable secreta `SPOTIFY_REFRESH_TOKEN`. El servidor renovará automáticamente los tokens de acceso cuando expiren.

---

## 6. Cómo Editar la Carta y el Mapa de Dedicatorias

Abre el archivo [`src/server/editorial-content.ts`](./src/server/editorial-content.ts):

1. **Editar la Carta Principal y Despedida:**
   Modifica el objeto `PRIVATE_LETTER_CONTENT` (`title`, `subtitle`, `paragraphs`, `signature`, `closingTitle`, `closingBody`, `closingHighlight`, `replyUrl`).

2. **Asignar o Editar Dedicatorias por Canción:**
   En `EDITORIAL_TRACK_ENTRIES`, cada entrada se enlaza mediante el `trackId` estable de Spotify:
   ```ts
   {
     trackId: '4WefXOf8I4gMjdj2kBJgkl', // ID de 22 caracteres o URI spotify:track:...
     template: 'polaroid',              // 'polaroid' | 'post-it' | 'cassette' | 'ticket' | 'double-polaroid' | 'minimal'
     washiLabel: 'Track 01 ♡',
     memoryTag: 'Vibes de fin de semana',
     noteTitle: 'VIBRA / DE ESAS ROLAS',
     dedication: '“Tu dedicatoria personal aquí...”',
     quote: '“Frase breve opcional elegida por ti...”',
     footerTag: 'Nuestra favorita',
     side: 'A',                         // 'A' o 'B'
     isDemoContent: false,
   }
   ```
   > **Tip:** Si agregas canciones nuevas a tu playlist de Spotify y aún no las configuras en `EDITORIAL_TRACK_ENTRIES`, aparecerán automáticamente con la plantilla compacta `minimal` mostrando su `trackId` en una etiqueta discreta para que puedas copiarlo fácilmente.

---

## 7. Pruebas, Verificación de Tipos y Build

```bash
# Verificar tipos TypeScript
npm run typecheck

# Ejecutar todas las pruebas automatizadas (Autenticación, Mapeo, Spotify, Seguridad del Bundle)
npm test

# Compilar para producción en dist/
npm run build
```

---

## 8. Despliegue Paso a Paso en Cloudflare Pages

### Opción 1: Despliegue Conectado a Git (Recomendado)
1. Sube este repositorio a tu cuenta de GitHub o GitLab.
2. En el panel de Cloudflare, ve a **Workers & Pages > Create application > Pages > Connect to Git**.
3. Configura los ajustes de compilación:
   - **Framework preset:** `None` (o `Vite`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Antes o después del primer despliegue, ve a **Settings > Environment variables** y configura para **Production** y **Preview**:
   - **Secrets (Encrypted):**
     - `SITE_PASSWORD`
     - `SESSION_SECRET`
     - `SPOTIFY_CLIENT_SECRET`
     - `SPOTIFY_REFRESH_TOKEN` *(si aplica)*
   - **Variables:**
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_PLAYLIST_ID` (ej. `0EJqoSBZPUYuKNj36TKNxt`)
     - `SPOTIFY_MARKET` (`MX`)
     - `ALLOW_DEMO_FIXTURE` (`false` en Production)

### Opción 2: Despliegue Directo con Wrangler CLI
```bash
# 1. Compilar y desplegar archivos estáticos + Pages Functions (carpeta functions/)
npm run pages:deploy

# 2. Configurar los secretos en Cloudflare Pages
npx wrangler pages secret put SITE_PASSWORD --project-name playlist-romantica-interactiva
npx wrangler pages secret put SESSION_SECRET --project-name playlist-romantica-interactiva
npx wrangler pages secret put SPOTIFY_CLIENT_SECRET --project-name playlist-romantica-interactiva
npx wrangler pages secret put SPOTIFY_CLIENT_ID --project-name playlist-romantica-interactiva
npx wrangler pages secret put SPOTIFY_PLAYLIST_ID --project-name playlist-romantica-interactiva
```

### Verificación Post-Despliegue
1. Abre la URL de tu proyecto en Cloudflare Pages: verás el **Sobre Postal Cerrado**.
2. Comprueba que visitar `/api/mixtape` directamente en una ventana de incógnito devuelve `401 Unauthorized` y que visitar `/carta` redirige a `/`.
3. Haz clic en el sobre para romper el sello de lacre, ingresa tu `SITE_PASSWORD` y verifica que se despliega la carta junto con las canciones de Spotify y sus plantillas de Stitch.
4. Haz clic en **Cerrar sobre** en la esquina superior derecha y confirma que la sesión se cierra inmediatamente.
