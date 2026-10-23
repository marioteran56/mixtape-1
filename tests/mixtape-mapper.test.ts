import { describe, expect, it } from 'vitest';
import { renderTrackCard } from '../src/client/render-mixtape';
import {
  EDITORIAL_TRACK_ENTRIES,
  SYNCED_PLAYLIST_CATALOG,
} from '../src/server/editorial-content';
import { mergeTracksWithEditorial, resolveStitchTemplate } from '../src/server/mixtape-service';
import type { EditorialEntry, SpotifyTrackMetadata } from '../src/shared/types';

function makeTrack(overrides: Partial<SpotifyTrackMetadata> & { trackId: string; title: string }): SpotifyTrackMetadata {
  return {
    uri: `spotify:track:${overrides.trackId}`,
    artists: 'Artista Prueba',
    artistList: [{ name: 'Artista Prueba', url: 'https://open.spotify.com/artist/test' }],
    albumName: 'Álbum Prueba',
    albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273test',
    durationMs: 210000,
    durationFormatted: '3:30',
    spotifyUrl: `https://open.spotify.com/track/${overrides.trackId}`,
    playlistOrder: 1,
    isAvailable: true,
    ...overrides,
  };
}

describe('Mapeo Editorial de Canciones y Plantillas de Stitch', () => {
  it('enlaza por trackId estable (o URI de Spotify), conserva el orden de la playlist e ignora diferencias de título', () => {
    const playlistTracks: SpotifyTrackMetadata[] = [
      makeTrack({ trackId: 'id-tercera', title: 'Tercera Canción en Playlist', playlistOrder: 1 }),
      makeTrack({ trackId: 'id-primera', title: 'Primera Canción (Remastered)', playlistOrder: 2 }),
      makeTrack({ trackId: 'id-sin-config', title: 'Canción Nueva en Spotify', playlistOrder: 3 }),
    ];

    const editorial: EditorialEntry[] = [
      {
        trackId: 'spotify:track:id-primera',
        template: 'post-it',
        dedication: 'Dedicatoria para la primera',
      },
      {
        trackId: 'id-tercera',
        template: 'polaroid',
        dedication: 'Dedicatoria para la tercera',
      },
    ];

    const result = mergeTracksWithEditorial(playlistTracks, editorial);

    // El orden debe respetar exactamente el orden devuelto por la playlist de Spotify
    expect(result.tracks.map((t) => t.trackId)).toEqual([
      'id-tercera',
      'id-primera',
      'id-sin-config',
    ]);
    expect(result.tracks[0].displayNumber).toBe(1);
    expect(result.tracks[0].resolvedTemplate).toBe('polaroid');
    expect(result.tracks[0].editorial.dedication).toBe('Dedicatoria para la tercera');

    expect(result.tracks[1].displayNumber).toBe(2);
    expect(result.tracks[1].resolvedTemplate).toBe('post-it');
    expect(result.tracks[1].editorial.dedication).toBe('Dedicatoria para la primera');

    // La canción sin configuración usa el template de reserva 'minimal' y estado 'unconfigured'
    expect(result.tracks[2].status).toBe('unconfigured');
    expect(result.tracks[2].resolvedTemplate).toBe('minimal');
    expect(result.configuredTracksCount).toBe(2);
    expect(result.unconfiguredTracksCount).toBe(1);
  });

  it('maneja canciones duplicadas en la playlist generando instanceKeys únicos y ocurrencias', () => {
    const playlistTracks: SpotifyTrackMetadata[] = [
      makeTrack({ trackId: 'dup-track', title: 'Canción Repetida', playlistOrder: 1 }),
      makeTrack({ trackId: 'dup-track', title: 'Canción Repetida', playlistOrder: 2 }),
    ];

    const editorial: EditorialEntry[] = [
      {
        trackId: 'dup-track',
        template: 'cassette',
        dedication: 'Nos gusta tanto que está dos veces',
      },
    ];

    const result = mergeTracksWithEditorial(playlistTracks, editorial);
    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[0].instanceKey).toBe('dup-track#1');
    expect(result.tracks[0].occurrence).toBe(1);
    expect(result.tracks[1].instanceKey).toBe('dup-track#2');
    expect(result.tracks[1].occurrence).toBe(2);
  });

  it('maneja pistas no disponibles en Spotify y pistas configuradas que fueron retiradas de la playlist', () => {
    const playlistTracks: SpotifyTrackMetadata[] = [
      makeTrack({
        trackId: 'track-bloqueada',
        title: 'Pista No Disponible',
        isAvailable: false,
        albumArtUrl: null,
      }),
    ];

    const editorial: EditorialEntry[] = [
      {
        trackId: 'track-bloqueada',
        template: 'ticket',
        dedication: 'Dedicatoria aunque no esté disponible en la región',
      },
      {
        trackId: 'track-retirada-de-playlist',
        fallbackTitle: 'Canción que antes estaba',
        fallbackArtists: 'Artista Original',
        template: 'double-polaroid',
        quote: 'Frase que conservamos en el archivo',
      },
    ];

    const result = mergeTracksWithEditorial(playlistTracks, editorial);
    expect(result.tracks[0].status).toBe('unavailable');
    expect(result.unavailableTracksCount).toBe(1);

    expect(result.removedConfiguredTracks).toHaveLength(1);
    expect(result.removedConfiguredTracks[0].trackId).toBe('track-retirada-de-playlist');
    expect(result.removedConfiguredTracks[0].status).toBe('removed-from-playlist');
    expect(result.removedConfiguredTracks[0].spotify.title).toBe('Canción que antes estaba');
  });

  it('renderiza todas las plantillas de Stitch y sus variantes sin recortar portadas y con atribución oficial a Spotify', () => {
    const templates = [
      'polaroid',
      'post-it',
      'cassette',
      'ticket',
      'double-polaroid',
      'postcard',
      'vinyl-sleeve',
      'honorable-mention',
      'collector',
      'minimal',
      'dedication',
      'quote',
      'short-note',
    ] as const;

    for (const tpl of templates) {
      const resolved = resolveStitchTemplate(tpl);
      const merged = mergeTracksWithEditorial(
        [makeTrack({ trackId: `track-${tpl}`, title: `Título ${tpl}` })],
        [{ trackId: `track-${tpl}`, template: tpl, dedication: `Texto ${tpl}`, quote: `Cita ${tpl}` }]
      );

      const html = renderTrackCard(merged.tracks[0]);
      expect(html).toContain(`data-template="${resolved}"`);
      expect(html).toContain('object-contain');
      expect(html).toContain('https://open.spotify.com/track/track-');
      expect(html).toContain('Spotify');
    }
  });

  it('sincroniza las 30 canciones del catálogo actual con las 30 entradas editoriales sin pistas faltantes ni sobrantes', () => {
    const result = mergeTracksWithEditorial(
      SYNCED_PLAYLIST_CATALOG.tracks,
      EDITORIAL_TRACK_ENTRIES
    );

    expect(result.tracks).toHaveLength(30);
    expect(result.configuredTracksCount).toBe(30);
    expect(result.unconfiguredTracksCount).toBe(0);
    expect(result.removedConfiguredTracks).toHaveLength(0);
  });
});
