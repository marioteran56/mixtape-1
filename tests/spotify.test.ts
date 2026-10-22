import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSpotifyCache,
  fetchSpotifyPlaylist,
  formatDurationMs,
  normalizeSpotifyId,
} from '../src/server/spotify';
import type { EnvBindings } from '../src/shared/types';

const BASE_ENV: EnvBindings = {
  SPOTIFY_CLIENT_ID: 'real_client_id_123',
  SPOTIFY_CLIENT_SECRET: 'real_client_secret_456',
  SPOTIFY_PLAYLIST_ID: '0EJqoSBZPUYuKNj36TKNxt',
  SPOTIFY_MARKET: 'MX',
};

describe('Adaptador de Spotify Web API', () => {
  beforeEach(() => {
    clearSpotifyCache();
  });

  it('formatea duraciones y normaliza IDs o URLs de Spotify correctamente', () => {
    expect(formatDurationMs(215000)).toBe('3:35');
    expect(formatDurationMs(65000)).toBe('1:05');
    expect(formatDurationMs(0)).toBe('0:00');

    expect(normalizeSpotifyId('spotify:track:4WefXOf8I4gMjdj2kBJgkl')).toBe(
      '4WefXOf8I4gMjdj2kBJgkl'
    );
    expect(
      normalizeSpotifyId('https://open.spotify.com/playlist/0EJqoSBZPUYuKNj36TKNxt?si=abc')
    ).toBe('0EJqoSBZPUYuKNj36TKNxt');
  });

  it('obtiene token y canciones de la playlist y almacena el resultado en caché', async () => {
    const mockFetch = vi.fn<typeof fetch>();

    // 1. Respuesta de token
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'mock_access_token_xyz',
          expires_in: 3600,
        }),
        { status: 200 }
      )
    );

    // 2. Respuesta de playlist
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: '0EJqoSBZPUYuKNj36TKNxt',
          name: 'Pensando en ti…',
          external_urls: { spotify: 'https://open.spotify.com/playlist/0EJqoSBZPUYuKNj36TKNxt' },
          owner: { display_name: 'Mario Teran' },
          tracks: {
            items: [
              {
                track: {
                  id: '4WefXOf8I4gMjdj2kBJgkl',
                  uri: 'spotify:track:4WefXOf8I4gMjdj2kBJgkl',
                  name: 'Patadas de Ahogado',
                  duration_ms: 215000,
                  is_playable: true,
                  external_urls: { spotify: 'https://open.spotify.com/track/4WefXOf8I4gMjdj2kBJgkl' },
                  artists: [{ name: 'LATIN MAFIA' }, { name: 'HUMBE' }],
                  album: {
                    name: 'Patadas de Ahogado',
                    images: [{ url: 'https://i.scdn.co/image/cover1', width: 640, height: 640 }],
                  },
                },
              },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const firstCall = await fetchSpotifyPlaylist(BASE_ENV, { fetchImpl: mockFetch });
    expect(firstCall.ok).toBe(true);
    expect(firstCall.tracks).toHaveLength(1);
    expect(firstCall.tracks[0].trackId).toBe('4WefXOf8I4gMjdj2kBJgkl');
    expect(firstCall.tracks[0].artists).toBe('LATIN MAFIA, HUMBE');
    expect(firstCall.tracks[0].albumArtUrl).toBe('https://i.scdn.co/image/cover1');
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Segunda llamada dentro del TTL debe usar la caché del servidor sin invocar fetch
    const secondCall = await fetchSpotifyPlaylist(BASE_ENV, { fetchImpl: mockFetch });
    expect(secondCall.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('maneja errores 401, 403 y 429 de Spotify con códigos y mensajes claros', async () => {
    // Caso 403 Forbidden (playlist privada sin refresh token)
    const mockFetch403 = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'tok_1', expires_in: 3600 }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));

    const res403 = await fetchSpotifyPlaylist(BASE_ENV, {
      fetchImpl: mockFetch403,
      bypassCache: true,
    });
    expect(res403.ok).toBe(false);
    expect(res403.errorCode).toBe('FORBIDDEN_403');

    clearSpotifyCache();

    // Caso 429 Rate Limit
    const mockFetch429 = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'tok_2', expires_in: 3600 }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '45' },
        })
      );

    const res429 = await fetchSpotifyPlaylist(BASE_ENV, {
      fetchImpl: mockFetch429,
      bypassCache: true,
    });
    expect(res429.ok).toBe(false);
    expect(res429.errorCode).toBe('RATE_LIMITED_429');
    expect(res429.retryAfterSeconds).toBe(45);

    clearSpotifyCache();

    // Caso 401 Unauthorized en token
    const mockFetch401 = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'invalid_client' }), { status: 401 })
    );
    const res401 = await fetchSpotifyPlaylist(BASE_ENV, {
      fetchImpl: mockFetch401,
      bypassCache: true,
    });
    expect(res401.ok).toBe(false);
    expect(res401.errorCode).toBe('UNAUTHORIZED_401');
  });
});
