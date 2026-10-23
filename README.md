# Mixtape #1

Aplicación web privada de mixtape interactivo y dedicatorias musicales basada en el sistema de diseño **Paper Mixtape** de Google Stitch (`projects/3351798792530970780`), protegida con sesión firmada del lado servidor y sincronizada con las canciones oficiales de Spotify (`0EJqoSBZPUYuKNj36TKNxt`).

---

## 1. Arquitectura y Características Principales

El proyecto utiliza **Vite + TypeScript + Tailwind CSS v4** para el frontend y **Cloudflare Workers / Functions** (`functions/` y `src/worker.ts`) para la autenticación y entrega protegida del mixtape.

- **Seguridad Real del Lado Servidor:**
  - `index.html` y el bundle público (`dist/`) solo contienen el sobre postal cerrado (`#loginView`) y un contenedor vacío para el mixtape (`#mixtapeView`).
  - La introducción, las 30 canciones del mixtape y sus dedicatorias viven exclusivamente en el servidor ([`src/server/editorial-content.ts`](./src/server/editorial-content.ts) y [`src/server/playlist-catalog.json`](./src/server/playlist-catalog.json)) y solo se entregan tras validar una cookie `HttpOnly` firmada con `HMAC-SHA256` ([`src/server/auth.ts`](./src/server/auth.ts)).
  - El test [`tests/security-bundle.test.ts`](./tests/security-bundle.test.ts) verifica en cada compilación que ningún fragmento privado ni mapa de código (`.map`) se filtre al navegador.
- **Supervisor en Vivo (Hot Reload de Servidor y Cliente):**
  - El plugin local en [`vite.config.ts`](./vite.config.ts) carga los módulos del servidor mediante `ssrLoadModule` y vigila en tiempo real `src/server/**`, `functions/**` y `.dev.vars`.
  - Cada vez que guardas un cambio en [`src/server/editorial-content.ts`](./src/server/editorial-content.ts) o sincronizas el catálogo, el navegador actualiza el mixtape en vivo **sin recargar la página ni perder la posición de scroll**, mostrando el indicador `Actualizado en vivo`.
- **Sincronización Manual de Spotify sin Llaves ni Variables de Entorno (`npm run sync:mixtape`):**
  - El comando `npm run sync:mixtape` (o `npm run sync:playlist`) ejecuta [`scripts/sync-playlist.ts`](./scripts/sync-playlist.ts), que consulta las pistas en Spotify y sus portadas oficiales `1:1` vía oEmbed.
  - Actualiza [`src/server/playlist-catalog.json`](./src/server/playlist-catalog.json) respetando estrictamente el orden de las 30 canciones **sin sobrescribir** las dedicatorias configuradas en [`src/server/editorial-content.ts`](./src/server/editorial-content.ts).
- **Sobre Postal Interactivo, Favicon y Navegación Fija:**
  - Portada personalizada (**Mixtape #1**, **Para: Camila**, **REMITENTE: MARIO**) con favicon propio ([`public/favicon.svg`](./public/favicon.svg)).
  - **Cabecera superior fija:** cinta *washi* con la leyenda **`Para ti`**, contador de pistas (`30 pistas`) y botón directo **`Mixtape`** hacia Spotify.
  - **Barra inferior flotante fija (4 columnas):** navegación suave por orden de lectura (**`Intro`** → **`Dedicatorias`** → **`Despedida`**) junto al botón **`Cerrar sobre`**.

---

## 2. Diseños, Plantillas de Canción y Momentos Destacados del Mixtape

Las 30 canciones del mixtape se presentan bajo el encabezado **`Mis dedicatorias`** respetando su orden exacto (`1` a `30`) y alternando entre **9 plantillas editoriales** con animaciones continuas en los discos de vinilo y carretes de casete:

1. **`polaroid` (alias `dedication`):** Marco Polaroid clásico con cinta *washi* menta, portada oficial `1:1` sin recortar, disco de vinilo giratorio y nota *Post-it* amarilla.
2. **`post-it`:** Tarjeta en cuarzo rosa con recorte cuadrado estilo revista, vinilo giratorio y nota manuscrita.
3. **`cassette`:** Carcasa de casete C-60 con ventana central de **carretes giratorios animados**, número de pista (`PISTA #XX`) y nota en servilleta.
4. **`ticket` (alias `short-note`):** Boleto de concierto / pase especial con línea punteada y recuadro de dedicatoria.
5. **`double-polaroid` (alias `quote`):** Collage con un **marco Polaroid a la izquierda** y una **Sticky Note amarilla inclinada a la derecha**.
   - **Pista #07 Destacada (*Quién Dice* — Marcos Menchaca):** Cuenta con diseño resaltado de relevancia especial, cinta superior con icono de calendario (`Pista Destacada • Día 26`), recuadro destacado con la pregunta **`¿Sabías que nos conocimos un día 26?`** y un bloque de nota alterna separado.
6. **`postcard`:** Tarjeta postal aérea con franja *airmail*, estampilla con la portada `1:1`, cita y mensaje postal (usada por ejemplo en la **Pista #03 — *Just the Way You Are* de Bruno Mars**).
7. **`vinyl-sleeve`:** Funda de vinilo de estudio con un disco de vinilo giratorio asomando por el costado y ficha de edición.
8. **`honorable-mention` (Apartado Especial — Pistas #15 y #16):** Las canciones **#15 (*Amarte A La Antigua* — Pedro Fernández)** y **#16 (*like my father* — Jax)** se agrupan en el contenedor especial **`Menciones Honoríficas`**, donde cada una explica en su propio recuadro **`¿Por qué es mención honorífica?`**.
9. **`collector` (Cierre Especial del Mixtape — Pista #30):** Diseño destacado de cierre para la canción final **#30 (*Bless The Broken Road* — Rascal Flatts)**, resaltándola como una de las favoritas personales y explicando cómo, incluso tras haberse sentido perdido en el camino, Dios guió cada paso hasta coincidir con ella.
10. **Nota Final y Tarjeta de Vuelo (Chihuahua ↔ Monterrey):** En la sección de cierre (`#section-cierre`) se integra el mensaje final en dos párrafos junto con una tarjeta independiente con iconos de avión (`flight_takeoff` y `CUU ✈ MTY`) destacando que el mixtape dura más que un vuelo entre Chihuahua y Monterrey.

---

## 3. Instalación y Uso en Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la clave secreta local (`.dev.vars`):**
   El archivo `.dev.vars` define la contraseña local de acceso:
   ```ini
   SITE_PASSWORD=tu_clave_secreta
   SESSION_SECRET=reemplaza-con-una-cadena-aleatoria-de-al-menos-32-caracteres-seguros
   ```

3. **Iniciar el servidor de desarrollo (con supervisor en vivo activo):**
   ```bash
   npm run dev
   ```

4. **Sincronizar manualmente las canciones del mixtape desde Spotify:**
   ```bash
   npm run sync:mixtape
   ```

---

## 4. Cómo Editar el Contenido del Mixtape

Todo el contenido personal se edita en un único archivo del servidor (y se refleja en vivo en el navegador al guardar):
- [`src/server/editorial-content.ts`](./src/server/editorial-content.ts)
  - **`PRIVATE_LETTER_CONTENT`:** Textos de la introducción (`title`, `subtitle`, `paragraphs`, `signOffLabel`, `signature`), del último mensaje de despedida (`closingTitle`, `closingParagraphs`, `closingHighlight`, `footerStamp`) y de la nota de vuelo (`flightNoteBadge`, `flightNoteText`).
  - **`EDITORIAL_TRACK_ENTRIES`:** Arreglo con las 30 canciones del mixtape enlazadas por su `trackId` de Spotify (`template`, `washiLabel`, `memoryTag`, `calloutTitle`, `calloutText`, `noteTitle`, `quote`, `dedication`, `secondaryNoteTitle`, `secondaryNoteText`, `footerTag`).

---

## 5. Comandos de Verificación y Pruebas

```bash
# Sincronizar catálogo de canciones desde Spotify (sin llaves API)
npm run sync:mixtape

# Verificar tipos TypeScript
npm run typecheck

# Ejecutar las 4 suites de pruebas (17 tests: Auth, Mapeo, Spotify, Seguridad del Bundle)
npm test

# Compilar para producción en dist/
npm run build
```

---

## 6. Despliegue en Cloudflare (`cartas.marioteran.dev/mixtape-1`)

El archivo [`wrangler.jsonc`](./wrangler.jsonc) y el Worker [`src/worker.ts`](./src/worker.ts) están configurados para publicar exclusivamente bajo la ruta **`cartas.marioteran.dev/mixtape-1*`** (con `workers_dev: false` y `preview_urls: false`).

Solo necesitas configurar tus 2 secretos de acceso en Cloudflare (**Settings → Variables and Secrets**):

| Variable | Tipo | Descripción |
| :--- | :--- | :--- |
| `SITE_PASSWORD` | **Secret** | La clave secreta para desbloquear el sobre postal. |
| `SESSION_SECRET` | **Secret** | Cadena aleatoria de al menos 32 caracteres (`openssl rand -hex 32`) para firmar la cookie `HttpOnly` con HMAC-SHA256. |

Para desplegar:
```bash
npm run pages:deploy
```
