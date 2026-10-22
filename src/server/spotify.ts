/**
 * Adaptador del lado servidor para la API oficial de Spotify.
 * Soporta tanto Client Credentials Flow como Refresh Token Flow (para playlists privadas/colaborativas),
 * caché en memoria con TTL moderado y manejo robusto de errores 401, 403, 429 y timeouts.
 */

import type { EnvBindings, SpotifyTrackMetadata } from '../shared/types';
import { DEFAULT_STITCH_PLAYLIST_ID } from './editorial-content';

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const PLAYLIST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const REQUEST_TIMEOUT_MS = 8000; // 8 segundos

export interface SpotifyPlaylistResult {
  ok: boolean;
  playlistId: string;
  playlistName: string;
  playlistUrl: string;
  ownerName?: string;
  tracks: SpotifyTrackMetadata[];
  cachedAt: string;
  errorCode?: 'MISSING_CREDENTIALS' | 'UNAUTHORIZED_401' | 'FORBIDDEN_403' | 'RATE_LIMITED_429' | 'NOT_FOUND_404' | 'NETWORK_ERROR';
  errorMessage?: string;
  retryAfterSeconds?: number;
}

interface TokenCacheEntry {
  accessToken: string;
  expiresAtMs: number;
  cacheKey: string;
}

interface PlaylistCacheEntry {
  result: SpotifyPlaylistResult;
  expiresAtMs: number;
}

let tokenCache: TokenCacheEntry | null = null;
const playlistCache = new Map<string, PlaylistCacheEntry>();

/**
 * Limpia las cachés de tokens y playlists (útil en pruebas unitarias).
 */
export function clearSpotifyCache(): void {
  tokenCache = null;
  playlistCache.clear();
}

/**
 * Formatea una duración en milisegundos al formato `m:ss`.
 */
export function formatDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '0:00';
  }
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Normaliza un ID de playlist o URL de Spotify para extraer únicamente el ID alfanumérico.
 */
export function normalizeSpotifyId(rawIdOrUri: string | undefined, fallback = DEFAULT_STITCH_PLAYLIST_ID): string {
  if (!rawIdOrUri || typeof rawIdOrUri !== 'string') {
    return fallback;
  }
  const trimmed = rawIdOrUri.trim();
  if (!trimmed) {
    return fallback;
  }
  if (trimmed.startsWith('spotify:')) {
    const parts = trimmed.split(':');
    return parts[parts.length - 1] || fallback;
  }
  if (trimmed.includes('open.spotify.com/')) {
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] || fallback;
    } catch {
      return trimmed;
    }
  }
  return trimmed.split('?')[0] || fallback;
}

function encodeBasicAuth(clientId: string, clientSecret: string): string {
  const raw = `${clientId}:${clientSecret}`;
  const bytes = new TextEncoder().encode(raw);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Obtiene un Access Token de Spotify usando Refresh Token (si está configurado)
 * o Client Credentials Flow.
 */
async function getSpotifyAccessToken(
  env: EnvBindings,
  fetchImpl: typeof fetch = fetch,
  forceRefresh = false,
  nowMs = Date.now()
): Promise<{ ok: true; token: string } | { ok: false; errorCode: SpotifyPlaylistResult['errorCode']; errorMessage: string; retryAfterSeconds?: number }> {
  const clientId = env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = env.SPOTIFY_REFRESH_TOKEN?.trim();

  if (
    !clientId ||
    !clientSecret ||
    clientId === 'tu_spotify_client_id_aqui' ||
    clientSecret === 'tu_spotify_client_secret_aqui'
  ) {
    return {
      ok: false,
      errorCode: 'MISSING_CREDENTIALS',
      errorMessage:
        'Las credenciales de Spotify (SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET) aún no están configuradas en el servidor.',
    };
  }

  const cacheKey = `${clientId}:${refreshToken ? 'refresh' : 'client'}`;
  if (!forceRefresh && tokenCache && tokenCache.cacheKey === cacheKey && tokenCache.expiresAtMs > nowMs + 60_000) {
    return { ok: true, token: tokenCache.accessToken };
  }

  const params = new URLSearchParams();
  if (refreshToken) {
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', refreshToken);
  } else {
    params.set('grant_type', 'client_credentials');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetchImpl(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodeBasicAuth(clientId, clientSecret)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '30', 10);
      return {
        ok: false,
        errorCode: 'RATE_LIMITED_429',
        errorMessage: `Spotify aplicó límite de peticiones temporal (429). Reintenta en ${retryAfter} segundos.`,
        retryAfterSeconds: retryAfter,
      };
    }

    if (response.status === 400 || response.status === 401) {
      return {
        ok: false,
        errorCode: 'UNAUTHORIZED_401',
        errorMessage:
          'No se pudo autenticar con Spotify (401/400). Verifica SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET y SPOTIFY_REFRESH_TOKEN.',
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: `Spotify devolvió un estado inesperado al solicitar token (${response.status}).`,
      };
    }

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!data.access_token) {
      return {
        ok: false,
        errorCode: 'UNAUTHORIZED_401',
        errorMessage: 'La respuesta de autenticación de Spotify no incluyó access_token.',
      };
    }

    const expiresInMs = (data.expires_in ?? 3600) * 1000;
    tokenCache = {
      accessToken: data.access_token,
      expiresAtMs: nowMs + expiresInMs,
      cacheKey,
    };

    return { ok: true, token: data.access_token };
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Tiempo de espera agotado o error de red al conectar con el servidor de autenticación de Spotify.',
    };
  }
}

interface RawSpotifyTrackObject {
  id?: string | null;
  uri?: string;
  name?: string;
  duration_ms?: number;
  is_playable?: boolean;
  is_local?: boolean;
  external_urls?: { spotify?: string };
  artists?: Array<{ name?: string; external_urls?: { spotify?: string } }>;
  album?: {
    name?: string;
    images?: Array<{ url?: string; width?: number; height?: number }>;
  };
}

interface RawSpotifyPlaylistItem {
  is_local?: boolean;
  track?: RawSpotifyTrackObject | null;
  item?: RawSpotifyTrackObject | null;
}

interface RawSpotifyPlaylistResponse {
  id?: string;
  name?: string;
  external_urls?: { spotify?: string };
  owner?: { display_name?: string };
  tracks?: {
    items?: RawSpotifyPlaylistItem[];
    next?: string | null;
  };
}

/**
 * Transforma un elemento crudo de la playlist de Spotify en `SpotifyTrackMetadata`.
 */
export function parseSpotifyPlaylistItem(
  rawItem: RawSpotifyPlaylistItem,
  playlistOrder: number
): SpotifyTrackMetadata | null {
  const trackObj = rawItem.track ?? rawItem.item;
  if (!trackObj) {
    return null;
  }

  const rawId = trackObj.id || (trackObj.uri ? normalizeSpotifyId(trackObj.uri, '') : '');
  const title = trackObj.name?.trim() || 'Canción no disponible';

  // Si un track fue eliminado de Spotify y no tiene ID ni nombre válido
  if (!rawId && title === 'Canción no disponible') {
    return null;
  }

  const trackId = rawId || `local-or-unavailable-${playlistOrder}`;
  const artistList = (trackObj.artists ?? [])
    .filter((a) => Boolean(a?.name))
    .map((a) => ({
      name: a.name!.trim(),
      url: a.external_urls?.spotify,
    }));

  const artists = artistList.length > 0 ? artistList.map((a) => a.name).join(', ') : 'Artista desconocido';
  const images = trackObj.album?.images ?? [];
  const primaryImage = images[0];
  const durationMs = typeof trackObj.duration_ms === 'number' ? trackObj.duration_ms : 0;
  const isAvailable =
    Boolean(rawId) &&
    trackObj.is_local !== true &&
    rawItem.is_local !== true &&
    trackObj.is_playable !== false;

  return {
    trackId,
    uri: trackObj.uri || `spotify:track:${trackId}`,
    title,
    artists,
    artistList,
    albumName: trackObj.album?.name?.trim() || '',
    albumArtUrl: primaryImage?.url || null,
    albumArtWidth: primaryImage?.width,
    albumArtHeight: primaryImage?.height,
    durationMs,
    durationFormatted: formatDurationMs(durationMs),
    spotifyUrl:
      trackObj.external_urls?.spotify ||
      (rawId ? `https://open.spotify.com/track/${rawId}` : 'https://open.spotify.com'),
    playlistOrder,
    isAvailable,
  };
}

/**
 * Consulta dinámicamente la playlist y todas sus canciones desde la API oficial de Spotify.
 */
export async function fetchSpotifyPlaylist(
  env: EnvBindings,
  options?: {
    fetchImpl?: typeof fetch;
    bypassCache?: boolean;
    nowMs?: number;
  }
): Promise<SpotifyPlaylistResult> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const nowMs = options?.nowMs ?? Date.now();
  const playlistId = normalizeSpotifyId(env.SPOTIFY_PLAYLIST_ID, DEFAULT_STITCH_PLAYLIST_ID);
  const market = env.SPOTIFY_MARKET?.trim() || 'MX';
  const cacheKey = `${playlistId}:${market}`;

  if (!options?.bypassCache) {
    const cached = playlistCache.get(cacheKey);
    if (cached && cached.expiresAtMs > nowMs) {
      return cached.result;
    }
  }

  const tokenResult = await getSpotifyAccessToken(env, fetchImpl, false, nowMs);
  if (!tokenResult.ok) {
    return {
      ok: false,
      playlistId,
      playlistName: 'Pensando en ti…',
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      tracks: [],
      cachedAt: new Date(nowMs).toISOString(),
      errorCode: tokenResult.errorCode,
      errorMessage: tokenResult.errorMessage,
      retryAfterSeconds: tokenResult.retryAfterSeconds,
    };
  }

  const executePlaylistFetch = async (accessToken: string): Promise<Response> => {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${encodeURIComponent(playlistId)}`);
    if (market) {
      url.searchParams.set('market', market);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetchImpl(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    let response = await executePlaylistFetch(tokenResult.token);

    // Si el token expiró prematuramente (401), refrescar una vez
    if (response.status === 401) {
      const refreshed = await getSpotifyAccessToken(env, fetchImpl, true, nowMs);
      if (!refreshed.ok) {
        return {
          ok: false,
          playlistId,
          playlistName: 'Pensando en ti…',
          playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
          tracks: [],
          cachedAt: new Date(nowMs).toISOString(),
          errorCode: 'UNAUTHORIZED_401',
          errorMessage: refreshed.errorMessage,
        };
      }
      response = await executePlaylistFetch(refreshed.token);
    }

    if (response.status === 401) {
      return {
        ok: false,
        playlistId,
        playlistName: 'Pensando en ti…',
        playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
        tracks: [],
        cachedAt: new Date(nowMs).toISOString(),
        errorCode: 'UNAUTHORIZED_401',
        errorMessage: 'Token de Spotify rechazado (401). Verifica tus credenciales.',
      };
    }

    if (response.status === 403) {
      return {
        ok: false,
        playlistId,
        playlistName: 'Pensando en ti…',
        playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
        tracks: [],
        cachedAt: new Date(nowMs).toISOString(),
        errorCode: 'FORBIDDEN_403',
        errorMessage:
          'Spotify denegó el acceso a la playlist (403). Si la playlist es privada o restringida al propietario, configura SPOTIFY_REFRESH_TOKEN siguiendo el flujo OAuth del README.',
      };
    }

    if (response.status === 404) {
      return {
        ok: false,
        playlistId,
        playlistName: 'Pensando en ti…',
        playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
        tracks: [],
        cachedAt: new Date(nowMs).toISOString(),
        errorCode: 'NOT_FOUND_404',
        errorMessage:
          'No se encontró la playlist en Spotify (404) o requiere autorización de propietario (SPOTIFY_REFRESH_TOKEN).',
      };
    }

    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '30', 10);
      return {
        ok: false,
        playlistId,
        playlistName: 'Pensando en ti…',
        playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
        tracks: [],
        cachedAt: new Date(nowMs).toISOString(),
        errorCode: 'RATE_LIMITED_429',
        errorMessage: `Límite de peticiones de Spotify alcanzado (429). Intenta de nuevo en ${retryAfter}s.`,
        retryAfterSeconds: retryAfter,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        playlistId,
        playlistName: 'Pensando en ti…',
        playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
        tracks: [],
        cachedAt: new Date(nowMs).toISOString(),
        errorCode: 'NETWORK_ERROR',
        errorMessage: `Error al consultar la playlist en Spotify (HTTP ${response.status}).`,
      };
    }

    const payload = (await response.json()) as RawSpotifyPlaylistResponse;
    const rawItems = payload.tracks?.items ?? [];
    const parsedTracks: SpotifyTrackMetadata[] = [];

    rawItems.forEach((item, index) => {
      const parsed = parseSpotifyPlaylistItem(item, index + 1);
      if (parsed) {
        parsedTracks.push(parsed);
      }
    });

    const result: SpotifyPlaylistResult = {
      ok: true,
      playlistId: payload.id || playlistId,
      playlistName: payload.name || 'Pensando en ti…',
      playlistUrl: payload.external_urls?.spotify || `https://open.spotify.com/playlist/${playlistId}`,
      ownerName: payload.owner?.display_name,
      tracks: parsedTracks,
      cachedAt: new Date(nowMs).toISOString(),
    };

    playlistCache.set(cacheKey, {
      result,
      expiresAtMs: nowMs + PLAYLIST_CACHE_TTL_MS,
    });

    return result;
  } catch {
    return {
      ok: false,
      playlistId,
      playlistName: 'Pensando en ti…',
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      tracks: [],
      cachedAt: new Date(nowMs).toISOString(),
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'No fue posible comunicarse con Spotify en este momento.',
    };
  }
}
