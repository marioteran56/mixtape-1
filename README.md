# Playlist #1 • Carta Digital Privada (`Paper Mixtape`)

Aplicación web privada de carta digital y mixtape interactivo basada en el sistema de diseño **Paper Mixtape** de Google Stitch (`projects/3351798792530970780`), protegida con sesión firmada del lado servidor y sincronizada con la playlist oficial de Spotify (`0EJqoSBZPUYuKNj36TKNxt`).

---

## 1. Arquitectura y Características Principales

El proyecto utiliza **Vite + TypeScript + Tailwind CSS v4** para el frontend y **Cloudflare Pages Functions** (`functions/`) para la autenticación y entrega protegida del contenido.

- **Seguridad Real del Lado Servidor:**
  - `index.html` y el bundle público (`dist/`) solo contienen el sobre postal cerrado (`#loginView`) y un contenedor vacío (`#mixtapeView`).
  - La carta privada, las 30 canciones y sus dedicatorias viven exclusivamente en el servidor ([`src/server/editorial-content.ts`](./src/server/editorial-content.ts) y [`src/server/playlist-catalog.json`](./src/server/playlist-catalog.json)) y solo se entregan a través de `GET /api/mixtape` tras validar una cookie `HttpOnly` firmada con `HMAC-SHA256` ([`src/server/auth.ts`](./src/server/auth.ts)).
  - El test [`tests/security-bundle.test.ts`](./tests/security-bundle.test.ts) verifica en cada compilación que ningún fragmento privado ni mapa de código (`.map`) se filtre al navegador.
- **Sincronización Manual de Spotify sin Llaves ni Variables de Entorno (`npm run sync:playlist`):**
  - El comando `npm run sync:playlist` ejecuta [`scripts/sync-playlist.ts`](./scripts/sync-playlist.ts), que consulta la playlist pública de Spotify y sus portadas oficiales `1:1` vía oEmbed.
  - Actualiza [`src/server/playlist-catalog.json`](./src/server/playlist-catalog.json) respetando estrictamente el orden de las canciones en la playlist (`1` a `30`) **sin sobrescribir** las dedicatorias configuradas en [`src/server/editorial-content.ts`](./src/server/editorial-content.ts).
- **Sobre Postal Interactivo y Animaciones:**
  - Portada personalizada (**Para: Camila**, **Remitente: Mario**) con notas decorativas en el fondo (*"♪ I got a girl crush"*, *"No hay nada como ella..."*).
  - **Transición de apertura del sobre:** al tocar el sobre o el sello de lacre, el sello se rompe con animación y emerge suavemente la tarjeta interior para ingresar la **Clave Secreta**.
  - **Transición de desbloqueo con zoom:** al validar la clave secreta, el sobre realiza un acercamiento hacia el lector mientras la carta y las dedicatorias se despliegan en pantalla.
- **Navegación Superior e Inferior Reacomodada:**
  - **Cabecera superior fija:** cinta *washi* con la leyenda **`Para ti`**, contador de pistas (`30 pistas`) y botón directo a la playlist en Spotify.
  - **Barra inferior flotante (4 columnas):** navegación suave por orden de lectura (**`Intro`** → **`Dedicadas`** → **`Último mensaje`**) junto al botón **`Cerrar sobre`** perfectamente integrado.

---

## 2. Diseños y Plantillas de Canción (`src/client/render-mixtape.ts`)

Las 30 canciones se presentan bajo el encabezado **`Mis dedicatorias`** respetando su orden exacto en la playlist y alternando entre **9 plantillas editoriales** con animaciones continuas en los discos de vinilo y carretes de casete:

1. **`polaroid` (alias `dedication`):** Marco Polaroid clásico con cinta *washi* menta, portada oficial `1:1` sin recortar, disco de vinilo giratorio y nota *Post-it* amarilla.
2. **`post-it`:** Tarjeta en cuarzo rosa con recorte cuadrado estilo revista, vinilo giratorio y nota manuscrita.
3. **`cassette`:** Carcasa de casete C-60 con ventana central de **carretes giratorios animados**, número de pista (`PISTA #XX`) y nota en servilleta.
4. **`ticket` (alias `short-note`):** Boleto de concierto / pase especial con línea punteada y recuadro de dedicatoria.
5. **`double-polaroid` (alias `quote`):** Collage de dos piezas con un **marco Polaroid a la izquierda** y una **Sticky Note amarilla inclinada a la derecha** que agrupa título, frase destacada y dedicatoria (ej. *"Your Song"* de Elton John o *"Sparks"* de Coldplay).
6. **`postcard`:** Tarjeta postal aérea con franja *airmail*, estampilla con la portada `1:1`, cita y mensaje postal.
7. **`vinyl-sleeve`:** Funda de vinilo de estudio con un disco de vinilo giratorio asomando por el costado y ficha de edición.
8. **`honorable-mention` (Apartado Especial — Pistas #15 y #16):** Las canciones **#15 (*Amarte A La Antigua* — Pedro Fernández)** y **#16 (*like my father* — Jax)** se agrupan en el contenedor especial **`Menciones Honoríficas`**, donde cada una cuenta con su tarjeta dorada y su recuadro individual **`¿Por qué es mención honorífica?`**.
9. **`collector` (Cierre de la Playlist — Pista #30):** Diseño especial tipo trofeo/certificado para la canción **#30 (*Coleccionista de Canciones* — Camila)** como referencia humorística a que ella (**Camila**) ya es toda una *Coleccionista de Canciones* tras las 30 pistas de la lista.

*(Además, existe la plantilla compacta `minimal` como reserva automática en caso de agregar canciones nuevas a la playlist antes de asignarles dedicatoria).*

---

## 3. Instalación y Uso en Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la clave secreta local (`.dev.vars`):**
   El archivo `.dev.vars` define la contraseña local de acceso (por defecto `mixtape28`):
   ```ini
   SITE_PASSWORD=mixtape28
   SESSION_SECRET=reemplaza-con-una-cadena-aleatoria-de-al-menos-32-caracteres-seguros
   ```
   > El plugin local en [`vite.config.ts`](./vite.config.ts) lee `.dev.vars` en tiempo real en cada petición, por lo que cualquier cambio de contraseña se aplica al instante.

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Sincronizar manualmente la playlist de Spotify (cuando agregues o reordenes canciones):**
   ```bash
   npm run sync:playlist
   ```

---

## 4. Cómo Editar la Carta y las Dedicatorias

Todo el contenido personal se edita en un único archivo del servidor:
- [`src/server/editorial-content.ts`](./src/server/editorial-content.ts)
  - **`PRIVATE_LETTER_CONTENT`:** Textos de la carta de introducción (`title`, `subtitle`, `paragraphs`, `signOffLabel`, `signature`) y del último mensaje de despedida (`closingTitle`, `closingBody`, `closingHighlight`, `footerStamp`).
  - **`EDITORIAL_TRACK_ENTRIES`:** Arreglo con las 30 canciones enlazadas por su `trackId` de Spotify (`template`, `washiLabel`, `memoryTag`, `noteTitle`, `quote`, `dedication`, `footerTag`).

---

## 5. Comandos de Verificación y Pruebas

```bash
# Sincronizar catálogo de canciones desde Spotify (sin llaves API)
npm run sync:playlist

# Verificar tipos TypeScript
npm run typecheck

# Ejecutar las 4 suites de pruebas (Auth, Mapeo y Plantillas, Spotify, Seguridad del Bundle)
npm test

# Compilar para producción en dist/
npm run build
```

---

## 6. Despliegue en Cloudflare Pages (`playlist-1`)

No necesitas configurar llaves de Spotify en producción ya que el catálogo sincronizado viaja del lado servidor junto con las Pages Functions. Solo necesitas configurar tus 2 secretos de acceso:

### variables requeridas en Cloudflare Pages (**Settings → Environment variables**)

| Variable | Tipo | Descripción |
| :--- | :--- | :--- |
| `SITE_PASSWORD` | **Secret** | La clave secreta para desbloquear el sobre postal. |
| `SESSION_SECRET` | **Secret** | Cadena aleatoria de al menos 32 caracteres para firmar la cookie `HttpOnly` con HMAC-SHA256. |

Para desplegar desde la terminal con Wrangler:
```bash
npm run pages:deploy
npx wrangler pages secret put SITE_PASSWORD --project-name playlist-1
npx wrangler pages secret put SESSION_SECRET --project-name playlist-1
```
