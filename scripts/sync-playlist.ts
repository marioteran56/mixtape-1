/**
 * Script de sincronización manual de la playlist (`npm run sync:playlist`).
 * ============================================================================
 * NO requiere variables de entorno, API Keys ni Client Secret de Spotify.
 *
 * Qué hace:
 * 1. Obtiene la lista actual de canciones y su orden real desde el embed público
 *    de Spotify (`https://open.spotify.com/embed/playlist/{id}`).
 * 2. Obtiene las portadas oficiales 1:1 de cada canción mediante el endpoint público
 *    oEmbed de Spotify (`https://open.spotify.com/oembed`) si alguna pista aún no tiene portada.
 * 3. Actualiza `src/server/playlist-catalog.json` respetando estrictamente el orden
 *    de las canciones en la playlist y sin sobrescribir jamás las dedicatorias
 *    configuradas por el autor en `src/server/editorial-content.ts`.
 *
 * Uso:
 *   npm run sync:playlist
 *   npm run sync:playlist -- https://open.spotify.com/playlist/0EJqoSBZPUYuKNj36TKNxt
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'src/server/playlist-catalog.json');

const DEFAULT_PLAYLIST_ID = '0EJqoSBZPUYuKNj36TKNxt';

export interface CatalogTrack {
  trackId: string;
  uri: string;
  title: string;
  artists: string;
  artistList: Array<{ name: string; url?: string }>;
  albumName: string;
  albumArtUrl: string | null;
  durationMs: number;
  durationFormatted: string;
  spotifyUrl: string;
  playlistOrder: number;
  isAvailable: boolean;
}

export interface PlaylistCatalogFile {
  playlistId: string;
  playlistName: string;
  playlistUrl: string;
  ownerName: string;
  syncedAt: string;
  tracks: CatalogTrack[];
}

function formatDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '3:30';
  }
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function extractPlaylistId(input?: string): string {
  if (!input) {
    return DEFAULT_PLAYLIST_ID;
  }
  const trimmed = input.trim();
  if (trimmed.includes('open.spotify.com/playlist/')) {
    const match = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match?.[1]) {
      return match[1];
    }
  }
  if (trimmed.startsWith('spotify:playlist:')) {
    return trimmed.split(':').pop() || DEFAULT_PLAYLIST_ID;
  }
  return trimmed.split('?')[0] || DEFAULT_PLAYLIST_ID;
}

async function fetchTrackCoverOembed(trackId: string): Promise<string | null> {
  try {
    const trackUrl = `https://open.spotify.com/track/${trackId}`;
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`;
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url || null;
  } catch {
    return null;
  }
}

interface EmbedTrackItem {
  uri?: string;
  uid?: string;
  title?: string;
  subtitle?: string;
  duration?: number;
  isPlayable?: boolean;
  imageUrl?: string;
}

async function fetchPlaylistFromPublicEmbed(playlistId: string): Promise<{
  playlistName?: string;
  ownerName?: string;
  tracks: Array<{
    trackId: string;
    title: string;
    artists: string;
    durationMs: number;
    isAvailable: boolean;
    albumArtUrl?: string | null;
  }>;
} | null> {
  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (!nextDataMatch?.[1]) {
      return null;
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const entity = nextData?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      return null;
    }

    const rawTrackList: EmbedTrackItem[] = entity.trackList || [];
    if (!Array.isArray(rawTrackList) || rawTrackList.length === 0) {
      return null;
    }

    const tracks = rawTrackList
      .map((item) => {
        const uri = item.uri || '';
        const trackId = uri.startsWith('spotify:track:') ? uri.replace('spotify:track:', '') : '';
        if (!trackId) {
          return null;
        }
        const cleanArtists = (item.subtitle || 'Artista').replace(/\u00a0/g, ' ').trim();
        const cleanTitle = (item.title || 'Canción').replace(/\u00a0/g, ' ').trim();
        return {
          trackId,
          title: cleanTitle,
          artists: cleanArtists,
          durationMs: typeof item.duration === 'number' ? item.duration : 210000,
          isAvailable: item.isPlayable !== false,
          albumArtUrl: item.imageUrl || null,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return {
      playlistName: entity.name || entity.title || 'Thinking About You',
      ownerName: entity.subtitle || 'Mario Teran',
      tracks,
    };
  } catch {
    return null;
  }
}

async function runSync(): Promise<void> {
  const argPlaylist = process.argv[2];
  const playlistId = extractPlaylistId(argPlaylist);

  console.log(`\n📼 Sincronizando playlist de Spotify (${playlistId}) sin llaves ni variables de entorno...`);

  let existingCatalog: PlaylistCatalogFile | null = null;
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as PlaylistCatalogFile;
    } catch {
      existingCatalog = null;
    }
  }

  const existingById = new Map<string, CatalogTrack>();
  for (const track of existingCatalog?.tracks ?? []) {
    existingById.set(track.trackId, track);
  }

  const embedData = await fetchPlaylistFromPublicEmbed(playlistId);
  if (!embedData || embedData.tracks.length === 0) {
    if (existingCatalog && existingCatalog.tracks.length > 0) {
      console.log(
        `ℹ No se pudo contactar a Spotify en este momento; se conserva intacto el catálogo actual con ${existingCatalog.tracks.length} canciones.`
      );
      return;
    }
    throw new Error('No fue posible obtener la playlist desde Spotify.');
  }

  console.log(
    `✓ Se leyeron ${embedData.tracks.length} canciones en su orden exacto desde la playlist "${embedData.playlistName}".`
  );

  const updatedTracks: CatalogTrack[] = [];
  let newTracksCount = 0;

  for (let i = 0; i < embedData.tracks.length; i++) {
    const item = embedData.tracks[i];
    const previous = existingById.get(item.trackId);
    if (!previous) {
      newTracksCount += 1;
    }

    let albumArtUrl = previous?.albumArtUrl || item.albumArtUrl || null;
    if (!albumArtUrl) {
      albumArtUrl = await fetchTrackCoverOembed(item.trackId);
    }

    const durationMs = item.durationMs || previous?.durationMs || 210000;
    const artists = item.artists || previous?.artists || 'Artista';

    updatedTracks.push({
      trackId: item.trackId,
      uri: `spotify:track:${item.trackId}`,
      title: item.title || previous?.title || 'Canción',
      artists,
      artistList: artists.split(',').map((a) => ({ name: a.trim() })),
      albumName: previous?.albumName || '',
      albumArtUrl,
      durationMs,
      durationFormatted: formatDurationMs(durationMs),
      spotifyUrl: `https://open.spotify.com/track/${item.trackId}`,
      playlistOrder: i + 1,
      isAvailable: item.isAvailable ?? true,
    });
  }

  const catalogOutput: PlaylistCatalogFile = {
    playlistId,
    playlistName: embedData.playlistName || existingCatalog?.playlistName || 'Pensando en ti…',
    playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
    ownerName: embedData.ownerName || existingCatalog?.ownerName || 'Mario Teran',
    syncedAt: new Date().toISOString(),
    tracks: updatedTracks,
  };

  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalogOutput, null, 2)}\n`, 'utf-8');
  console.log(
    `✅ Catálogo sincronizado en src/server/playlist-catalog.json:`
  );
  console.log(`   • Total en orden de playlist: ${updatedTracks.length} canciones`);
  console.log(`   • Canciones nuevas añadidas:  ${newTracksCount}`);
  console.log(`   • Tus dedicatorias en src/server/editorial-content.ts se mantuvieron intactas.\n`);
}

runSync();
