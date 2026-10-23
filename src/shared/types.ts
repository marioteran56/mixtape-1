/**
 * Tipos compartidos entre el cliente y las funciones de servidor (Cloudflare Pages Functions).
 * Nota: Este archivo contiene únicamente definiciones de tipos TypeScript (cero datos privados).
 */

/**
 * Variantes de plantillas editoriales extraídas de Google Stitch ("Carta & Mixtape Scrapbook")
 * y sus alias semánticos para facilitar la edición manual.
 *
 * - `polaroid` / `dedication`: Tarjeta Polaroid clásica con washi tape superior y post-it diagonal inferior.
 * - `post-it`: Tarjeta Post-it cuarzo rosa en dos columnas con recorte cuadrado, etiqueta de lugar y cita.
 * - `cassette`: Tarjeta de papel kraft con carcasa de cassette C-60 animada y nota servilleta.
 * - `ticket` / `short-note`: Boleto de concierto ("ADMIT ONE: MIXTAPE PASS") con recuadro de nota breve.
 * - `double-polaroid` / `quote`: Tarjeta con doble cinta washi, arte + postal de frase destacada y nota de atmósfera.
 * - `minimal`: Tarjeta compacta horizontal estilo Bonus Track o estado de reserva para canciones sin dedicatoria.
 */
export type EditorialTemplateType =
  | 'polaroid'
  | 'post-it'
  | 'cassette'
  | 'ticket'
  | 'double-polaroid'
  | 'postcard'
  | 'vinyl-sleeve'
  | 'honorable-mention'
  | 'collector'
  | 'minimal'
  | 'dedication'
  | 'quote'
  | 'short-note';

/**
 * Plantilla visual normalizada que renderiza la interfaz de Stitch.
 */
export type ResolvedStitchTemplate =
  | 'polaroid'
  | 'post-it'
  | 'cassette'
  | 'ticket'
  | 'double-polaroid'
  | 'postcard'
  | 'vinyl-sleeve'
  | 'honorable-mention'
  | 'collector'
  | 'minimal';

/**
 * Categoría de filtro en la barra de navegación inferior de Stitch:
 * - `all` (Carta / Todo)
 * - `mixtape` (Mixtape / Pistas)
 * - `recuerdos` (Recuerdos / Polaroids y Postales)
 * - `notas` (Notas / Post-its, Citas y Dedicatorias)
 */
export type NavigationTab = 'carta' | 'mixtape' | 'recuerdos' | 'notas';

/**
 * Metadatos dinámicos de una pista obtenidos desde la API oficial de Spotify.
 */
export interface SpotifyTrackMetadata {
  /** ID estable de la pista en Spotify (ej. "4WefXOf8I4gMjdj2kBJgkl") */
  trackId: string;
  /** URI oficial de Spotify (ej. "spotify:track:4WefXOf8I4gMjdj2kBJgkl") */
  uri: string;
  /** Título de la canción */
  title: string;
  /** Nombres de los artistas concatenados */
  artists: string;
  /** Lista individual de artistas con sus URLs oficiales */
  artistList: Array<{ name: string; url?: string }>;
  /** Nombre del álbum */
  albumName: string;
  /** URL de la portada oficial cuadrada de Spotify (sin recortar) */
  albumArtUrl: string | null;
  /** Ancho de la portada reportado por Spotify */
  albumArtWidth?: number;
  /** Alto de la portada reportado por Spotify */
  albumArtHeight?: number;
  /** Duración en milisegundos */
  durationMs: number;
  /** Duración formateada (ej. "3:35") */
  durationFormatted: string;
  /** URL oficial para abrir la canción en Spotify */
  spotifyUrl: string;
  /** Posición original (basada en 1) dentro de la playlist */
  playlistOrder: number;
  /** Indica si la canción está disponible para reproducción o fue retirada */
  isAvailable: boolean;
}

/**
 * Configuración editorial privada escrita por el autor para una canción.
 * Se almacena exclusivamente en el servidor (`src/server/editorial-content.ts`).
 */
export interface EditorialEntry {
  /** Identificador estable: Track ID de Spotify o URI ("spotify:track:...") */
  trackId: string;
  /** Tipo de plantilla editorial a utilizar */
  template: EditorialTemplateType;
  /** Texto principal de la dedicatoria personal escrita por el autor */
  dedication?: string;
  /** Frase breve o cita seleccionada manualmente por el autor */
  quote?: string;
  /** Título o encabezado de la nota (ej. "VIBRA / DE ESAS ROLAS", "Un clásico", "Momento relax") */
  noteTitle?: string;
  /** Etiqueta de cinta washi o insignia superior (ej. "Track 01 ♡", "Bonus Track Alegre ★") */
  washiLabel?: string;
  /** Etiqueta secundaria o recuerdo (ej. "Nuestras charlas con música de fondo", "Vibes de fin de semana") */
  memoryTag?: string;
  /** Nota al pie de la tarjeta (ej. "Para cantarla a todo pulmón", "Nuestra favorita", "Acústico / Indie") */
  footerTag?: string;
  /** Insignia especial destacada (ej. para resaltar una pista clave de la lista) */
  featuredBadge?: string;
  /** Título de recuadro destacado / dato curioso dentro de la tarjeta */
  calloutTitle?: string;
  /** Texto de recuadro destacado / pregunta o fecha especial dentro de la tarjeta */
  calloutText?: string;
  /** Título de nota secundaria o texto alterno dentro de la tarjeta */
  secondaryNoteTitle?: string;
  /** Texto de nota secundaria o pensamiento alterno dentro de la tarjeta */
  secondaryNoteText?: string;
  /** Lado del cassette al que pertenece ("A" | "B") */
  side?: 'A' | 'B';
  /** Orden editorial opcional si se desea destacar o referenciar */
  editorialOrder?: number;
  /** Título de respaldo por si la canción es retirada de Spotify */
  fallbackTitle?: string;
  /** Artista de respaldo por si la canción es retirada de Spotify */
  fallbackArtists?: string;
  /** Indica si el contenido actual es texto de demostración pendiente de personalizar */
  isDemoContent?: boolean;
}

/**
 * Registro combinado de canción + configuración editorial listo para renderizar tras autenticar.
 */
export interface MergedTrackItem {
  /** Clave única de instancia en la lista (maneja canciones duplicadas en la playlist) */
  instanceKey: string;
  /** ID estable de la pista en Spotify */
  trackId: string;
  /** Número de pista en la secuencia mostrada (1..N) */
  displayNumber: number;
  /** Ocurrencia de esta pista si aparece duplicada en la playlist (1, 2, ...) */
  occurrence: number;
  /** Plantilla de Stitch resuelta */
  resolvedTemplate: ResolvedStitchTemplate;
  /** Tipo de plantilla original configurado */
  configuredTemplate: EditorialTemplateType;
  /** Estado del mapeo */
  status: 'configured' | 'unconfigured' | 'unavailable' | 'removed-from-playlist';
  /** Metadatos de Spotify (presentes si la pista vino de la playlist) */
  spotify: SpotifyTrackMetadata;
  /** Datos editoriales combinados */
  editorial: {
    dedication?: string;
    quote?: string;
    noteTitle?: string;
    washiLabel: string;
    memoryTag?: string;
    footerTag?: string;
    featuredBadge?: string;
    calloutTitle?: string;
    calloutText?: string;
    secondaryNoteTitle?: string;
    secondaryNoteText?: string;
    side: 'A' | 'B';
    isDemoContent: boolean;
  };
}

/**
 * Contenido privado de la carta introductoria y despedida.
 */
export interface PrivateLetterContent {
  badgeTop: string;
  title: string;
  subtitle: string;
  stampLabel: string;
  paragraphs: string[];
  signOffLabel: string;
  signature: string;
  sideATitle: string;
  sideBTitle: string;
  closingBadge: string;
  closingTitle: string;
  closingBody: string;
  closingParagraphs?: string[];
  closingHighlight: string;
  flightNoteBadge?: string;
  flightNoteText?: string;
  replyUrl?: string;
  replyLabel: string;
  footerStamp: string;
  isDemoContent: boolean;
}

/**
 * Estado del origen de datos de Spotify.
 */
export interface SpotifySourceStatus {
  source: 'spotify-live' | 'demo-fixture' | 'spotify-error';
  playlistId: string;
  playlistName: string;
  playlistUrl: string;
  ownerName?: string;
  totalTracks: number;
  configuredTracksCount: number;
  unconfiguredTracksCount: number;
  unavailableTracksCount: number;
  cachedAt: string;
  warningMessage?: string;
}

/**
 * Respuesta completa del endpoint privado `GET /api/mixtape`.
 */
export interface MixtapeResponse {
  visitorName?: string;
  letter: PrivateLetterContent;
  playlistStatus: SpotifySourceStatus;
  tracks: MergedTrackItem[];
  removedConfiguredTracks: MergedTrackItem[];
}

/**
 * Respuesta de `GET /api/auth/session` y `POST /api/auth/login`.
 */
export interface AuthSessionResponse {
  authenticated: boolean;
  visitorName?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Variables de entorno y secretos esperados en Cloudflare Pages Functions / servidor.
 */
export interface EnvBindings {
  SITE_PASSWORD?: string;
  SESSION_SECRET?: string;
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_PLAYLIST_ID?: string;
  SPOTIFY_MARKET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
  ALLOW_DEMO_FIXTURE?: string;
}
