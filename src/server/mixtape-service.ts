/**
 * Servicio del lado servidor que combina las pistas sincronizadas de la playlist
 * (`src/server/playlist-catalog.json`, o bien vía API si se configuran llaves)
 * con las dedicatorias editoriales privadas (`src/server/editorial-content.ts`).
 */

import type {
  EditorialEntry,
  EditorialTemplateType,
  EnvBindings,
  MergedTrackItem,
  MixtapeResponse,
  PrivateLetterContent,
  ResolvedStitchTemplate,
  SpotifyTrackMetadata,
} from '../shared/types';
import {
  DEFAULT_STITCH_PLAYLIST_ID,
  EDITORIAL_TRACK_ENTRIES,
  PRIVATE_LETTER_CONTENT,
  SYNCED_PLAYLIST_CATALOG,
} from './editorial-content';
import { fetchSpotifyPlaylist, normalizeSpotifyId } from './spotify';

/**
 * Resuelve cualquier variante o alias de plantilla (`dedication`, `quote`, `short-note`)
 * a una de las 6 plantillas visuales reales del proyecto de Google Stitch.
 */
export function resolveStitchTemplate(template: EditorialTemplateType): ResolvedStitchTemplate {
  switch (template) {
    case 'polaroid':
    case 'dedication':
      return 'polaroid';
    case 'post-it':
      return 'post-it';
    case 'cassette':
      return 'cassette';
    case 'ticket':
    case 'short-note':
      return 'ticket';
    case 'double-polaroid':
    case 'quote':
      return 'double-polaroid';
    case 'postcard':
      return 'postcard';
    case 'vinyl-sleeve':
      return 'vinyl-sleeve';
    case 'honorable-mention':
      return 'honorable-mention';
    case 'collector':
      return 'collector';
    case 'minimal':
    default:
      return 'minimal';
  }
}

/**
 * Combina la lista de pistas con el mapa de entradas editoriales
 * usando exclusivamente el identificador estable `trackId` (o URI de Spotify)
 * y respetando estrictamente el orden de la playlist.
 */
export function mergeTracksWithEditorial(
  spotifyTracks: SpotifyTrackMetadata[],
  editorialEntries: EditorialEntry[] = EDITORIAL_TRACK_ENTRIES
): {
  tracks: MergedTrackItem[];
  removedConfiguredTracks: MergedTrackItem[];
  configuredTracksCount: number;
  unconfiguredTracksCount: number;
  unavailableTracksCount: number;
} {
  const editorialByTrackId = new Map<string, EditorialEntry>();
  for (const entry of editorialEntries) {
    const cleanId = normalizeSpotifyId(entry.trackId, '');
    if (cleanId) {
      editorialByTrackId.set(cleanId, entry);
    }
  }

  const seenTrackCounts = new Map<string, number>();
  const matchedEditorialIds = new Set<string>();
  const mergedTracks: MergedTrackItem[] = [];

  let configuredTracksCount = 0;
  let unconfiguredTracksCount = 0;
  let unavailableTracksCount = 0;

  spotifyTracks.forEach((track, index) => {
    const cleanId = normalizeSpotifyId(track.trackId || track.uri, `unknown-${index + 1}`);
    const occurrence = (seenTrackCounts.get(cleanId) ?? 0) + 1;
    seenTrackCounts.set(cleanId, occurrence);

    const displayNumber = index + 1;
    const paddedNum = displayNumber.toString().padStart(2, '0');
    const editorialEntry = editorialByTrackId.get(cleanId);

    if (editorialEntry) {
      matchedEditorialIds.add(cleanId);
    }

    const defaultSide: 'A' | 'B' =
      displayNumber <= Math.ceil(Math.max(spotifyTracks.length, 2) / 2) ? 'A' : 'B';

    if (!track.isAvailable) {
      unavailableTracksCount += 1;
    }

    if (editorialEntry) {
      configuredTracksCount += 1;
      const resolvedTemplate = resolveStitchTemplate(editorialEntry.template);
      mergedTracks.push({
        instanceKey: `${cleanId}#${occurrence}`,
        trackId: cleanId,
        displayNumber,
        occurrence,
        resolvedTemplate,
        configuredTemplate: editorialEntry.template,
        status: track.isAvailable ? 'configured' : 'unavailable',
        spotify: {
          ...track,
          trackId: cleanId,
          playlistOrder: displayNumber,
        },
        editorial: {
          dedication: editorialEntry.dedication,
          quote: editorialEntry.quote,
          noteTitle: editorialEntry.noteTitle,
          washiLabel: editorialEntry.washiLabel || `Track ${paddedNum} ♡`,
          memoryTag: editorialEntry.memoryTag,
          footerTag: editorialEntry.footerTag,
          featuredBadge: editorialEntry.featuredBadge,
          calloutTitle: editorialEntry.calloutTitle,
          calloutText: editorialEntry.calloutText,
          secondaryNoteTitle: editorialEntry.secondaryNoteTitle,
          secondaryNoteText: editorialEntry.secondaryNoteText,
          side: editorialEntry.side ?? defaultSide,
          isDemoContent: Boolean(editorialEntry.isDemoContent),
        },
      });
    } else {
      unconfiguredTracksCount += 1;
      mergedTracks.push({
        instanceKey: `${cleanId}#${occurrence}`,
        trackId: cleanId,
        displayNumber,
        occurrence,
        resolvedTemplate: 'minimal',
        configuredTemplate: 'minimal',
        status: track.isAvailable ? 'unconfigured' : 'unavailable',
        spotify: {
          ...track,
          trackId: cleanId,
          playlistOrder: displayNumber,
        },
        editorial: {
          washiLabel: `Pista ${paddedNum} • Mixtape`,
          footerTag: `Track #${paddedNum}`,
          side: defaultSide,
          isDemoContent: false,
        },
      });
    }
  });

  // Identificar canciones que tienen dedicatoria configurada pero ya no aparecen en la playlist
  const removedConfiguredTracks: MergedTrackItem[] = [];
  editorialEntries.forEach((entry, idx) => {
    const cleanId = normalizeSpotifyId(entry.trackId, '');
    if (cleanId && !matchedEditorialIds.has(cleanId)) {
      const resolvedTemplate = resolveStitchTemplate(entry.template);
      removedConfiguredTracks.push({
        instanceKey: `${cleanId}#removed-${idx + 1}`,
        trackId: cleanId,
        displayNumber: spotifyTracks.length + removedConfiguredTracks.length + 1,
        occurrence: 1,
        resolvedTemplate,
        configuredTemplate: entry.template,
        status: 'removed-from-playlist',
        spotify: {
          trackId: cleanId,
          uri: `spotify:track:${cleanId}`,
          title: entry.fallbackTitle || 'Canción retirada de la playlist',
          artists: entry.fallbackArtists || 'Artista en archivo de recuerdos',
          artistList: entry.fallbackArtists ? [{ name: entry.fallbackArtists }] : [],
          albumName: '',
          albumArtUrl: null,
          durationMs: 0,
          durationFormatted: '--:--',
          spotifyUrl: `https://open.spotify.com/track/${cleanId}`,
          playlistOrder: 0,
          isAvailable: false,
        },
        editorial: {
          dedication: entry.dedication,
          quote: entry.quote,
          noteTitle: entry.noteTitle || 'Recuerdo archivado',
          washiLabel: entry.washiLabel || 'Recuerdo guardado ♡',
          memoryTag: entry.memoryTag || 'Canción retirada de la playlist activa',
          footerTag: entry.footerTag,
          side: entry.side ?? 'B',
          isDemoContent: Boolean(entry.isDemoContent),
        },
      });
    }
  });

  return {
    tracks: mergedTracks,
    removedConfiguredTracks,
    configuredTracksCount,
    unconfiguredTracksCount,
    unavailableTracksCount,
  };
}

/**
 * Construye la respuesta completa del mixtape privado combinando el catálogo
 * sincronizado (`npm run sync:playlist`) con el contenido editorial del autor.
 */
export async function buildMixtapeResponse(
  env: EnvBindings,
  options?: {
    visitorName?: string;
    fetchImpl?: typeof fetch;
    letterOverride?: PrivateLetterContent;
    editorialOverride?: EditorialEntry[];
  }
): Promise<MixtapeResponse> {
  const letter = options?.letterOverride ?? PRIVATE_LETTER_CONTENT;
  const editorialEntries = options?.editorialOverride ?? EDITORIAL_TRACK_ENTRIES;

  const hasSpotifyApiCredentials =
    Boolean(env.SPOTIFY_CLIENT_ID?.trim()) &&
    Boolean(env.SPOTIFY_CLIENT_SECRET?.trim()) &&
    env.SPOTIFY_CLIENT_ID !== 'tu_spotify_client_id_aqui' &&
    env.SPOTIFY_CLIENT_SECRET !== 'tu_spotify_client_secret_aqui';

  // Flujo principal sin llaves de Spotify: usa el catálogo local sincronizado con `npm run sync:playlist`
  if (!hasSpotifyApiCredentials) {
    const merged = mergeTracksWithEditorial(
      SYNCED_PLAYLIST_CATALOG.tracks,
      editorialEntries
    );
    return {
      visitorName: options?.visitorName,
      letter,
      playlistStatus: {
        source: 'spotify-live',
        playlistId: SYNCED_PLAYLIST_CATALOG.playlistId,
        playlistName: SYNCED_PLAYLIST_CATALOG.playlistName,
        playlistUrl: SYNCED_PLAYLIST_CATALOG.playlistUrl,
        ownerName: SYNCED_PLAYLIST_CATALOG.ownerName,
        totalTracks: SYNCED_PLAYLIST_CATALOG.tracks.length,
        configuredTracksCount: merged.configuredTracksCount,
        unconfiguredTracksCount: merged.unconfiguredTracksCount,
        unavailableTracksCount: merged.unavailableTracksCount,
        cachedAt: SYNCED_PLAYLIST_CATALOG.syncedAt,
      },
      tracks: merged.tracks,
      removedConfiguredTracks: merged.removedConfiguredTracks,
    };
  }

  // Si opcionalmente se configuraron llaves de Spotify API, consulta la API y usa el catálogo sincronizado como respaldo
  const spotifyResult = await fetchSpotifyPlaylist(env, {
    fetchImpl: options?.fetchImpl,
  });

  if (spotifyResult.ok) {
    const merged = mergeTracksWithEditorial(spotifyResult.tracks, editorialEntries);
    return {
      visitorName: options?.visitorName,
      letter,
      playlistStatus: {
        source: 'spotify-live',
        playlistId: spotifyResult.playlistId,
        playlistName: spotifyResult.playlistName,
        playlistUrl: spotifyResult.playlistUrl,
        ownerName: spotifyResult.ownerName,
        totalTracks: spotifyResult.tracks.length,
        configuredTracksCount: merged.configuredTracksCount,
        unconfiguredTracksCount: merged.unconfiguredTracksCount,
        unavailableTracksCount: merged.unavailableTracksCount,
        cachedAt: spotifyResult.cachedAt,
      },
      tracks: merged.tracks,
      removedConfiguredTracks: merged.removedConfiguredTracks,
    };
  }

  const playlistId = normalizeSpotifyId(env.SPOTIFY_PLAYLIST_ID, DEFAULT_STITCH_PLAYLIST_ID);
  const fallbackMerged = mergeTracksWithEditorial(
    SYNCED_PLAYLIST_CATALOG.tracks,
    editorialEntries
  );

  return {
    visitorName: options?.visitorName,
    letter,
    playlistStatus: {
      source: 'spotify-live',
      playlistId,
      playlistName: SYNCED_PLAYLIST_CATALOG.playlistName,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      ownerName: SYNCED_PLAYLIST_CATALOG.ownerName,
      totalTracks: SYNCED_PLAYLIST_CATALOG.tracks.length,
      configuredTracksCount: fallbackMerged.configuredTracksCount,
      unconfiguredTracksCount: fallbackMerged.unconfiguredTracksCount,
      unavailableTracksCount: fallbackMerged.unavailableTracksCount,
      cachedAt: SYNCED_PLAYLIST_CATALOG.syncedAt,
    },
    tracks: fallbackMerged.tracks,
    removedConfiguredTracks: fallbackMerged.removedConfiguredTracks,
  };
}
