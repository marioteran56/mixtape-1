# Sistema de Diseño: Paper Mixtape (`DESIGN.md`)

Este documento registra el sistema de diseño real extraído del proyecto de Google Stitch **Playlist Romántica Interactiva** (`projects/3351798792530970780`) y su activo de sistema de diseño **Paper Mixtape** (`assets/075bb1dae93f4189b0732341fd3de1a1`).

---

## 1. Inventario de Pantallas y Recursos Inspeccionados en Stitch

| Recurso / Pantalla en Stitch | ID de Recurso | Tipo / Dispositivo | Propósito en la Aplicación |
| :--- | :--- | :--- | :--- |
| **Portada Sobre Postal • Acceso Secreto Obligatorio** | `projects/3351798792530970780/screens/e99ea3cd712b4d8eaa405859f9192d0f` | `DESKTOP` (`2560x2048`, responsive) | Pantalla de acceso privado con sobre postal abierto, tarjeta interior extraída (`#letterCard`), formulario de validación de clave secreta, estados de error (`shake-anim`) y éxito (`#authFeedback`). |
| **Portada Sobre Postal • Acceso Secreto (Variante inicial cerrada)** | `projects/3351798792530970780/screens/feabc6eacf0443e2bf7453ce8b6bcc8e` | `DESKTOP` (`2560x2048`, responsive) | Estado inicial del sobre postal cerrado (`#frontDecorative`), sello de lacre interactivo pulsante (`#waxSeal`), matasellos `MIX•TAPE 2024 FOR YOU`, estampilla `POSTAL ♥`, destinatario y animación de apertura al hacer clic. |
| **Carta & Mixtape Scrapbook** | `projects/3351798792530970780/screens/5883e91f37bb4aabaf7a59ffae1247d7` | `MOBILE` (`780x7084`, contenedor `max-w-xl`) | Experiencia privada principal: barra superior con botón de salida/guardar sobre (`mail_lock`), carta de introducción con estampilla `PAR AVION`, separador de lado (`Lado A • Canciones de Amor`), 6 variantes de plantillas de canción estilo scrapbook, carta de despedida (`Fin del Lado B ♡`) y barra de navegación inferior de 4 pestañas (`Carta`, `Mixtape`, `Recuerdos`, `Notas`). |
| **Extracted text from Spotify Playlist** | `projects/3351798792530970780/screens/61c718b4c8ce465fbc3f896cd946f4a5` | Documento Markdown | Listado original extraído de `https://open.spotify.com/playlist/0EJqoSBZPUYuKNj36TKNxt` ("Pensando en ti…" por Mario Teran) con identificadores reales de pistas y artistas de Spotify. |
| **Paper Mixtape Design System** | `assets/075bb1dae93f4189b0732341fd3de1a1` | `DESIGN_SYSTEM_INSTANCE` | Especificación de tokens de color Material 3 adaptados a papelería vintage, escala tipográfica, elevaciones de papel, radios y componentes. |

---

## 2. Identidad Visual e Intención Emocional

- **Movimiento Estético:** *Tactile Skeuomorphic Collage meets Editorial Playfulness*. Las superficies imitan papel ecru fibroso, tarjetas postales de lino, sobres con borde *airmail* y tiras de *washi tape* translúcidas.
- **Intención Emocional:**
  - **Íntimo y Tierno:** Evoca la experiencia de entregar en mano un cassette grabado con notas dobladas dentro del estuche.
  - **Artesanal y Espontáneo:** Incorpora ligeras rotaciones orgánicas (`-1.5deg` a `+2deg`), sellos postales, clips sujetapapeles y capas físicas.
  - **Cálido y Luminoso:** Evita el negro puro (`#000000`) y el blanco clínico (`#FFFFFF`) como fondos base, empleando tonos crema, kraft y carbón sepia.

---

## 3. Tokens de Color

Extraídos de la configuración de tema de `Carta & Mixtape Scrapbook` (`5883e91f37bb4aabaf7a59ffae1247d7`) y `Portada Sobre Postal` (`e99ea3cd712b4d8eaa405859f9192d0f`):

### Superficies y Fondos (Papelería)
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `background` / `surface` / `surface-bright` | `#fff8f4` | Lienzo principal de papel crema cálido y base del patrón punteado `.kraft-bg`. |
| `surface-container-lowest` | `#ffffff` | Marcos de Polaroid, hojas de carta interior e interior de notas destacadas. |
| `surface-container-low` | `#fff1e6` | Cuerpo del sobre postal (`envelope.base`), tarjeta de carta introductoria y tarjeta tipo ticket. |
| `surface-container` | `#ffead7` | Notas adhesivas tipo Post-it cálidas y tarjeta de canción bonus. |
| `surface-container-high` | `#fbe4cf` | Tarjeta de cassette kraft, píldoras de encabezado y etiquetas de sección (`Lado A`). |
| `surface-container-highest` / `surface-variant` | `#f5dfc9` | Sello `PAR AVION`, barras de progreso y botones secundarios elevados. |
| `surface-dim` | `#edd6c1` | Bordes de sobre, líneas punteadas y puntos del fondo `.kraft-bg`. |
| `inverse-surface` | `#3b2e1f` | Carcasa oscura del cassette vintage (`C-60 HIGH FIDELITY`). |
| `inverse-on-surface` | `#ffeedf` | Texto claro sobre la carcasa del cassette. |

### Tintas y Acentos
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `primary` | `#9e3c26` | Terracota profundo para botones principales en el scrapbook, iconos activos y acentos editoriales. |
| `primary-container` | `#be543c` | Estado hover de botones primarios. |
| `envelope-accent` | `#e06d53` | Terracota cálido para el sobre de acceso, botón de desbloqueo, franjas *airmail* y focos de formulario. |
| `envelope-wax` | `#c84732` | Sello de lacre (`#waxSeal`) con borde `#a63321`. |
| `primary-fixed` | `#ffdad2` | Washi tape durazno pastel y etiquetas sobre fondo oscuro. |
| `primary-fixed-dim` | `#ffb4a3` | Variante suave de cinta adhesiva. |
| `secondary` | `#a43073` | Rosa bugambilia/frambuesa para firmas, etiquetas románticas, corazones y CTA de tarjeta Post-it rosa. |
| `secondary-container` | `#fc79bd` | Contenedor de acento secundario. |
| `secondary-fixed` | `#ffd8e7` | Washi tape rosa pastel y fondo translúcido de la plantilla Post-it Cuarzo Rosa (`bg-secondary-fixed/30`). |
| `secondary-fixed-dim` | `#ffafd3` | Cinta adhesiva pequeña en notas Post-it. |
| `tertiary` | `#3d6700` | Verde salvia/olivo para etiquetas de estado ("Momento relax", "Nuestra favorita"). |
| `tertiary-container` | `#528115` | Contenedor verde salvia. |
| `tertiary-fixed` | `#bbf37c` | Washi tape verde menta (`Track 01 ♡`, `Fin del Lado B ♡`) y badges de duración/atmósfera. |
| `on-tertiary-fixed` | `#0f2000` | Texto oscuro sobre washi tape verde menta. |

### Texto, Bordes y Estados
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `on-surface` / `on-background` | `#25190c` | Tinta carbón sepia principal para títulos y cuerpo de lectura. |
| `on-surface-variant` | `#57423d` | Subtítulos, nombres de artistas y metadatos secundarios. |
| `outline` | `#8a726c` | Texto auxiliar, marcas de tiempo, separadores y clips metálicos (`bg-outline/40`). |
| `outline-variant` | `#ddc0ba` | Líneas divisorias finas y bordes suaves. |
| `error` | `#ba1a1a` | Mensajes de error y alertas de validación. |
| `error-container` | `#ffdad6` | Fondo suave de bloques de error. |

---

## 4. Tipografía y Jerarquía

El sistema combina cuatro familias tipográficas cargadas desde Google Fonts:

1. **`Epilogue` (Display / Headlines):** Encabezados expresivos, títulos de canciones y cabeceras de carta.
2. **`Literata` (Body / Editorial Serif):** Voz íntima tipo imprenta de libro para la carta principal, citas, notas personales y dedicatorias.
3. **`Plus Jakarta Sans` (Labels / UI Controls):** Etiquetas redondeadas y legibles para sellos postales (`PAR AVION`), cintas washi (`Track 01 ♡`), contadores, botones y navegación.
4. **`Playfair Display` & `Caveat` (Pantalla de Sobre Postal):** `Playfair Display` para el encabezado editorial de bienvenida en el login y `Caveat` para detalles manuscritos en el sobre (`"Para ti ✨"`, `"De mi para ti ♡"`).

### Escala Tipográfica
| Token | Familia | Tamaño | Line Height | Peso | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `headline-xl` | Epilogue | `44px` | `52px` | `700` | `-0.02em` |
| `headline-xl-mobile` | Epilogue | `32px` | `38px` | `700` | `-0.01em` |
| `headline-lg` | Epilogue | `32px` | `40px` | `600` | `-0.01em` |
| `headline-lg-mobile` | Epilogue | `26px` | `32px` | `600` | `0` |
| `headline-md` | Epilogue | `22px` | `28px` | `600` | `0` |
| `headline-sm` | Epilogue | `18px` | `24px` | `600` | `0` |
| `body-lg` | Literata | `18px` | `28px` | `400` | `0` |
| `body-md` | Literata | `15px` | `24px` | `400` | `0` |
| `body-sm` | Literata | `13px` | `18px` | `400` | `0` |
| `caption` | Literata | `12px` | `16px` | `400` | `0` |
| `label-lg` | Plus Jakarta Sans | `14px` | `20px` | `600` | `0.02em` |
| `label-md` | Plus Jakarta Sans | `12px` | `16px` | `600` | `0.04em` |
| `label-sm` | Plus Jakarta Sans | `11px` | `14px` | `700` | `0.06em` |

---

## 5. Espaciado, Radios, Elevaciones y Reglas Responsive

### Espaciado
- `space-xs`: `0.25rem` (`4px`)
- `space-sm`: `0.5rem` (`8px`)
- `space-md`: `1rem` (`16px`)
- `space-lg`: `1.5rem` (`24px`)
- `space-xl`: `2.5rem` (`40px`)
- `gutter-mobile`: `0.75rem` (`12px`) / `gutter`: `1.25rem` (`20px`)
- `margin-mobile`: `1rem` (`16px`) / `margin`: `2rem` (`32px`)

### Radios de Borde (Recortes de Papel)
- `rounded-DEFAULT` (`2px` / `0.125rem`): Cintas washi, estampillas y fotos internas.
- `rounded-lg` (`4px` / `0.25rem` a `8px`): Notas adhesivas internas y marcos de papel.
- `rounded-xl` (`8px` / `0.5rem` a `12px`): Tarjetas principales de canción y bloques de carta.
- `rounded-full`: Botones de acción principales, píldoras de metadatos y controles de reproducción.

### Elevación y Sombras Cálidas (Tono Sepia)
- **Nivel 1 (Nota / Post-it):** `0 2px 6px -1px rgba(87, 72, 56, 0.08), 0 1px 3px 0 rgba(87, 72, 56, 0.05)`
- **Nivel 2 (Tarjeta Polaroid / Cassette / Ticket):** `0 8px 20px -3px rgba(87, 72, 56, 0.12), 0 3px 8px -2px rgba(87, 72, 56, 0.06)`
- **Nivel 3 (Washi Tape):** `0 1px 2px rgba(87, 66, 61, 0.15)` con `backdrop-blur` sutil.
- **Nivel 4 (Carta de Despedida / Sobre Postal):** `0 12px 28px -4px rgba(87, 72, 56, 0.15)`
- **Botón Primario 3D Tactile:** `0 3px 0 #822714` (se presiona `translate-y-0.5` al hacer clic).

### Reglas Responsive y Accesibilidad
- **Móvil (`< 640px`):** Columna vertical única tipo acordeón postal, márgenes seguros de `16px`, controles táctiles de al menos `44x44px`, sin desbordamiento horizontal (`overflow-x-hidden`).
- **Tablet y Escritorio (`>= 640px` / `1024px+`):** Contenedor central de lectura editorial (`max-w-2xl` / `max-w-4xl` en vista expandida) sobre escritorio kraft con notas decorativas flotantes en los márgenes.
- **Movimiento Reducido (`prefers-reduced-motion: reduce`):** Se desactivan giros continuos de carretes de cassette, flotación del sobre y transiciones de zoom bruscas, manteniendo cambios de estado instantáneos y legibles.

---

## 6. Componentes y Plantillas Editoriales de Canción

El diseño en Stitch define **6 plantillas editoriales distintas** para las canciones (nunca se unifican en una tarjeta genérica):

1. **`polaroid` (Polaroid Classic con Washi Tape)** — Respaldado por *Track 1 (Patadas de Ahogado)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Cinta washi menta superior centrada (`Track XX ♡`).
   - Marco interior crema (`bg-surface-container-low`) con portada oficial de Spotify **1:1 íntegra sin recortar ni superponer texto sobre la imagen**, etiqueta de ambiente debajo, título en `Epilogue`, artista en `Literata` cursiva y píldora de duración.
   - Nota Post-it amarilla/crema inclinada (`rotate-1`) con cinta adhesiva rosa, título de nota con icono `lightbulb` y dedicatoria personal entre comillas.
   - Barra inferior con indicador de tiempo, atribución y botón `"Escuchar en Spotify"`.

2. **`post-it` (Post-It Cuarzo Rosa con Doodle y Recorte)** — Respaldado por *Track 2 (Labios Rotos)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Fondo rosa translúcido (`bg-secondary-fixed/30`), cinta washi durazno en esquina superior derecha (`-rotate-6`).
   - Diseño en dos columnas en pantallas `sm+`: recorte cuadrado tipo Polaroid (`-rotate-2`) con la portada 1:1 de Spotify sin recortes y etiqueta verde menta de duración debajo; a la derecha, categoría con icono `local_florist`, título, artista, píldora de recuerdo (`location_on`) y dedicatoria personal.
   - Pie con corazón + etiqueta emocional y botón secundario frambuesa (`bg-secondary text-on-secondary`).

3. **`cassette` (Tarjeta Cassette Vintage de Papel Kraft)** — Respaldado por *Track 3 (Bajo El Agua)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Fondo kraft cálido (`bg-surface-container-high`) con simulación de clip metálico en el borde superior.
   - Módulo superior de carcasa de cassette oscura (`bg-inverse-surface`) con cabeceras `C-60 HIGH FIDELITY` / `SIDE A`, ventana central con dos carretes animados, miniatura 1:1 íntegra de la portada de Spotify, título y artista.
   - Nota tipo servilleta blanca (`bg-surface-container-lowest`) con etiqueta verde (`mode_comment`) y dedicatoria.
   - Pie con insignia `check_circle` y enlace oficial a Spotify.

4. **`ticket` (Ticket de Concierto / Carta Postal)** — Respaldado por *Track 4 (Vámonos a Marte)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Fondo `bg-surface-container-low` con washi menta en la esquina inferior derecha.
   - Cabecera de boleto: insignia `ADMIT ONE: MIXTAPE PASS` + `SEC: VIBES • ROW: XX` + icono musical.
   - Portada cuadrada 1:1 de Spotify sin recortar acompañada de título, artista y recuadro blanco interior con la dedicatoria o cita.
   - Pie con etiqueta verificada (`verified`) y botón `"Escuchar en Spotify"`.

5. **`double-polaroid` (Polaroid con Nota Pastel / Atmósfera)** — Respaldado por *Track 5 (Sparks)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Fondo `bg-surface-container-lowest` con doble cinta washi superior (rosa y menta superpuestas).
   - Cabecera con portada 1:1 íntegra de Spotify y tarjeta postal de cita/frase destacada al lado, título, artista y badge verde menta (`Atmósfera chill`).
   - Bloque de nota suave (`bg-surface-container-low`) con etiqueta e historia personal.

6. **`minimal` (Canción Bonus / Presentación Compacta y Reserva)** — Respaldado por *Track 6 (Amapolas)* en `5883e91f37bb4aabaf7a59ffae1247d7`:
   - Tarjeta compacta horizontal (`bg-surface-container`) con cinta washi superior derecha (`Bonus Track ★` o `En la playlist ♪`).
   - Portada 1:1 de Spotify sin recortar, insignia de corazón, título, artista, nota breve en una línea y botón directo `"Spotify"`.
   - También se utiliza con variante visual diferenciada para canciones de la playlist que aún no tienen dedicatoria configurada.

---

## 7. Cumplimiento de Políticas Visuales de Spotify

- **Integridad de Portadas:** Todas las portadas de álbum obtenidas de la API de Spotify se muestran en su proporción original cuadrada (`aspect-square` / `object-contain`), sin recortar bordes ni superponer texto o logotipos encima del arte. Cualquier etiqueta decorativa (como `Vibes de fin de semana` o la duración) se ubica fuera del lienzo de la imagen.
- **Atribución y Enlaces Oficiales:** Cada tarjeta muestra explícitamente la atribución a Spotify y enlaza directamente a la URL oficial de la canción (`external_urls.spotify`) y de la playlist en Spotify.
