/**
 * Renderizador del lado cliente para la vista privada "Carta & Mixtape Scrapbook"
 * basada en la pantalla de Google Stitch `projects/3351798792530970780/screens/5883e91f37bb4aabaf7a59ffae1247d7`.
 *
 * IMPORTANTE: Este módulo NO contiene ningún texto privado ni dedicatorias quemadas;
 * recibe los datos dinámicamente desde `GET /api/mixtape` una vez validada la sesión.
 */

import type {
  MergedTrackItem,
  MixtapeResponse,
  NavigationTab,
} from '../shared/types';

export function escapeHtml(value: string | undefined | null): string {
  if (!value) {
    return '';
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Icono oficial de Spotify en SVG para atribución clara junto a enlaces y metadatos.
 */
function spotifyLogoSvg(sizeClass = 'w-4 h-4'): string {
  return `<svg class="${sizeClass} shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>`;
}

/**
 * Carrete dentado de casete en SVG con animación de rotación continua (`.cassette-reel-spin`).
 */
function renderCassetteReelSvg(sizeClass = 'w-9 h-9'): string {
  return `
    <div class="${sizeClass} rounded-full bg-[#1f1610] p-0.5 flex items-center justify-center shrink-0 shadow-inner border border-[#8a726c]/40">
      <svg class="w-full h-full cassette-reel-spin text-[#ffeedf]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="2.2" stroke-dasharray="6 4" />
        <circle cx="20" cy="20" r="9" stroke="currentColor" stroke-width="2" />
        <line x1="20" y1="4" x2="20" y2="11" stroke="#e06d53" stroke-width="2.5" stroke-linecap="round" />
        <line x1="6.1" y1="28" x2="12.2" y2="24.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <line x1="33.9" y1="28" x2="27.8" y2="24.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="20" cy="20" r="3" fill="#e06d53" />
      </svg>
    </div>
  `;
}

/**
 * Disco de vinilo giratorio acotado (`overflow-hidden`) con reflejo cónico y etiqueta central
 * asimétrica para que la rotación (`.vinyl-disc-spin`) se aprecie con nitidez y nunca desborde.
 */
function renderSpinningVinylDisc(sizeClass = 'w-11 h-11', labelColor = '#e06d53'): string {
  return `
    <div class="${sizeClass} rounded-full vinyl-surface vinyl-disc-spin shrink-0 overflow-hidden flex items-center justify-center shadow-sm border border-[#25190c]/80 relative" aria-hidden="true">
      <div class="w-[42%] h-[42%] rounded-full flex items-center justify-center relative" style="background-color: ${labelColor};">
        <span class="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#fff8f4]/90"></span>
        <span class="w-2 h-2 rounded-full bg-[#25190c] border border-[#fff8f4]"></span>
      </div>
    </div>
  `;
}

/**
 * Renderiza la portada de Spotify respetando estrictamente las políticas de diseño:
 * - Proporción cuadrada 1:1 original sin recortar (`aspect-square object-contain`).
 * - Sin superponer texto, sombras ni logotipos sobre la imagen.
 * - Enlazada directamente al contenido correspondiente en Spotify.
 */
function renderUncroppedAlbumArt(
  item: MergedTrackItem,
  wrapperClass = 'w-full'
): string {
  const { spotify } = item;
  const altText = `Portada del álbum ${spotify.albumName || spotify.title} de ${spotify.artists} en Spotify`;

  if (spotify.albumArtUrl) {
    return `
      <a
        href="${escapeHtml(spotify.spotifyUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir ${escapeHtml(spotify.title)} de ${escapeHtml(spotify.artists)} en Spotify"
        class="block ${wrapperClass} aspect-square bg-[#fffDF9] rounded-[3px] overflow-hidden border border-[#edd6c1]/80 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#9e3c26]"
      >
        <img
          src="${escapeHtml(spotify.albumArtUrl)}"
          alt="${escapeHtml(altText)}"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-contain block"
        />
      </a>
    `;
  }

  return `
    <a
      href="${escapeHtml(spotify.spotifyUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir ${escapeHtml(spotify.title)} de ${escapeHtml(spotify.artists)} en Spotify"
      class="flex items-center justify-center ${wrapperClass} aspect-square bg-gradient-to-br from-[#fbe4cf] via-[#ffead7] to-[#ffd8e7] rounded-[3px] border border-[#ddc0ba] p-2 overflow-hidden group"
    >
      ${renderSpinningVinylDisc('w-4/5 h-4/5', '#e06d53')}
    </a>
  `;
}

function renderStatusBadges(item: MergedTrackItem): string {
  const badges: string[] = [];

  if (item.occurrence > 1) {
    badges.push(
      `<span class="bg-[#ffd8e7] text-[#3d0026] font-[Plus_Jakarta_Sans] text-[10px] font-bold px-2 py-0.5 rounded-full">Repetición #${item.occurrence}</span>`
    );
  }

  if (item.status === 'unavailable') {
    badges.push(
      `<span class="bg-[#ffdad6] text-[#93000a] font-[Plus_Jakarta_Sans] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <span class="material-symbols-outlined text-[12px]">warning</span> No disponible en tu región
      </span>`
    );
  }

  if (item.status === 'removed-from-playlist') {
    badges.push(
      `<span class="bg-[#ffdad6] text-[#93000a] font-[Plus_Jakarta_Sans] text-[10px] font-bold px-2 py-0.5 rounded-full">Retirada de la playlist activa</span>`
    );
  }

  if (item.editorial.isDemoContent) {
    badges.push(
      `<span class="bg-[#fbe4cf] text-[#822714] border border-[#ddc0ba] font-[Plus_Jakarta_Sans] text-[10px] font-bold px-2 py-0.5 rounded-full" title="Texto de demostración editable en la configuración del servidor">Demo editable</span>`
    );
  }

  return badges.length > 0
    ? `<div class="flex flex-wrap items-center gap-1.5 mt-1">${badges.join('')}</div>`
    : '';
}

/**
 * PLANTILLA 1 DE STITCH: `polaroid` ("Polaroid Classic con Washi Tape")
 * Respaldada por Track 1 en `5883e91f37bb4aabaf7a59ffae1247d7`
 */
function renderPolaroidCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const noteText =
    editorial.dedication ||
    editorial.quote ||
    'Una canción especial seleccionada para este mixtape.';

  return `
    <article
      data-template="polaroid"
      data-category="recuerdos notas"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 bg-surface-container-lowest pt-6 px-4 pb-4 sm:px-5 sm:pb-5 rounded-xl shadow-[0_8px_20px_-3px_rgba(87,72,56,0.12)] -rotate-0.5 hover:rotate-0 transition-transform duration-300 border border-[#edd6c1]/80"
    >
      <!-- Top Mint Washi Tape -->
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 h-6 bg-tertiary-fixed/95 backdrop-blur-xs rotate-1 rounded-[2px] shadow-[0_1px_2px_rgba(87,66,61,0.14)] z-20 flex items-center justify-center pointer-events-none">
        <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold uppercase tracking-wider text-on-tertiary-fixed whitespace-nowrap">
          ${escapeHtml(editorial.washiLabel)}
        </span>
      </div>

      <!-- Polaroid Photo Frame Area (Portada 1:1 sin recortes ni superposiciones) -->
      <div class="bg-surface-container-low p-3 rounded-lg shadow-inner flex flex-col gap-3">
        <div class="w-full max-w-[260px] mx-auto">
          ${renderUncroppedAlbumArt(item)}
        </div>

        ${
          editorial.memoryTag
            ? `<div class="flex flex-wrap items-center justify-between gap-2 px-1">
                <span class="inline-flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-2xs border border-[#edd6c1]">
                  <span class="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
                  <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold text-on-surface uppercase tracking-wide">${escapeHtml(editorial.memoryTag)}</span>
                </span>
                <span class="font-[Plus_Jakarta_Sans] text-[10px] text-outline inline-flex items-center gap-1">
                  ${spotifyLogoSvg('w-3.5 h-3.5 text-[#1DB954]')} Spotify
                </span>
              </div>`
            : ''
        }

        <!-- Handwritten Title Under Photo -->
        <div class="px-1 pt-0.5 flex items-baseline justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-[Epilogue] text-[18px] font-semibold text-on-surface leading-snug">
              <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">
                ${escapeHtml(spotify.title)}
              </a>
            </h3>
            <p class="font-[Literata] text-[12px] text-on-surface-variant italic mt-0.5">
              ${escapeHtml(spotify.artists)}${spotify.albumName ? ` • ${escapeHtml(spotify.albumName)}` : ''}
            </p>
            ${renderStatusBadges(item)}
          </div>
          <span class="bg-secondary-fixed text-on-secondary-fixed text-[11px] font-[Plus_Jakarta_Sans] font-bold px-2.5 py-0.5 rounded-full shrink-0">
            ${escapeHtml(spotify.durationFormatted)}
          </span>
        </div>
      </div>

      <!-- Post-it Adhesivo Amarillo pegado diagonalmente -->
      <div class="mt-4 bg-surface-container pt-4 px-3.5 pb-3 rounded-lg shadow-xs rotate-0.5 relative lined-note-bg border border-[#edd6c1]/80">
        <div class="absolute -top-2 left-6 w-12 h-3.5 bg-secondary-fixed-dim/80 backdrop-blur-xs -rotate-2 rounded-[2px] pointer-events-none"></div>
        <p class="font-[Plus_Jakarta_Sans] text-[11px] font-bold text-primary uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px]">lightbulb</span>
          <span>${escapeHtml(editorial.noteTitle || 'DEDICATORIA / NOTA PERSONAL')}</span>
        </p>
        <p class="font-[Literata] text-[13px] text-on-surface italic leading-relaxed">
          ${escapeHtml(noteText)}
        </p>
      </div>

      <!-- Micro Player & Disco de Vinilo Giratorio + Spotify Attribution Bar -->
      <div class="mt-4 pt-1 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          ${renderSpinningVinylDisc('w-9 h-9', '#e06d53')}
          <div class="flex flex-col">
            <div class="w-24 sm:w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="w-2/5 h-full bg-primary rounded-full"></div>
            </div>
            <span class="font-[Literata] text-[10px] text-outline mt-0.5">
              Pista #${item.displayNumber.toString().padStart(2, '0')} • ${escapeHtml(spotify.durationFormatted)}
            </span>
          </div>
        </div>

        <a
          class="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3.5 py-1.5 rounded-full font-[Plus_Jakarta_Sans] text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          href="${escapeHtml(spotify.spotifyUrl)}"
          rel="noopener noreferrer"
          target="_blank"
        >
          ${spotifyLogoSvg('w-3.5 h-3.5 text-[#1DB954]')}
          <span>Escuchar en Spotify</span>
          <span class="material-symbols-outlined text-[14px]">north_east</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * PLANTILLA 2 DE STITCH: `post-it` ("Post-It Cuarzo Rosa con Doodle y Recorte")
 * Respaldada por Track 2 en `5883e91f37bb4aabaf7a59ffae1247d7`
 */
function renderPostItCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const noteText =
    editorial.dedication ||
    editorial.quote ||
    'Una canción especial seleccionada para ti.';

  return `
    <article
      data-template="post-it"
      data-category="notas recuerdos"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 bg-secondary-fixed/35 backdrop-blur-xs pt-6 px-4 pb-4 sm:px-5 sm:pb-5 rounded-xl shadow-[0_8px_20px_-3px_rgba(87,72,56,0.12)] rotate-0.5 hover:rotate-0 transition-transform duration-300 border border-[#ffafd3]/60"
    >
      <!-- Washi Peach Angle -->
      <div class="absolute -top-2.5 right-6 w-16 h-4 bg-primary-fixed/90 -rotate-3 rounded-[2px] shadow-[0_1px_2px_rgba(87,66,61,0.12)] z-10 pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <!-- Magazine Cutout Album Art -->
        <div class="w-36 shrink-0 bg-surface-container-lowest p-2 rounded-[4px] shadow-md -rotate-1 flex flex-col items-center gap-2">
          ${renderUncroppedAlbumArt(item)}
          <div class="w-full flex items-center justify-between px-1">
            <span class="bg-tertiary-fixed text-on-tertiary-fixed font-[Plus_Jakarta_Sans] font-bold text-[9px] px-2 py-0.5 rounded-[2px]">
              ${escapeHtml(spotify.durationFormatted)} min
            </span>
            ${renderSpinningVinylDisc('w-5 h-5', '#a43073')}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 w-full">
          <div class="flex items-center gap-1.5 text-secondary">
            <span class="material-symbols-outlined text-[16px]">local_florist</span>
            <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold uppercase tracking-wider">
              ${escapeHtml(editorial.noteTitle || 'Un clásico')}
            </span>
          </div>

          <h3 class="font-[Epilogue] text-[18px] font-semibold text-on-surface mt-0.5 leading-snug">
            <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">
              ${escapeHtml(spotify.title)}
            </a>
          </h3>
          <p class="font-[Literata] text-[12px] text-on-surface-variant italic">
            ${escapeHtml(spotify.artists)}${spotify.albumName ? ` — ${escapeHtml(spotify.albumName)}` : ''}
          </p>
          ${renderStatusBadges(item)}

          ${
            editorial.memoryTag
              ? `<div class="inline-flex items-center gap-1.5 bg-surface-container-lowest/90 text-on-surface px-2.5 py-1 rounded-full font-[Plus_Jakarta_Sans] font-semibold text-[10px] my-2 shadow-2xs border border-[#edd6c1]">
                  <span class="material-symbols-outlined text-primary text-[13px]">location_on</span>
                  <span>${escapeHtml(editorial.memoryTag)}</span>
                </div>`
              : ''
          }

          <p class="font-[Literata] text-[13px] text-on-surface italic mt-1 leading-relaxed">
            ${escapeHtml(noteText)}
          </p>
        </div>
      </div>

      <!-- Action footer -->
      <div class="mt-3.5 pt-2.5 border-t border-[#ddc0ba]/50 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 text-secondary">
          <span class="material-symbols-outlined text-[17px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
          <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold">
            ${escapeHtml(editorial.footerTag || 'Para cantarla a todo pulmón')}
          </span>
        </div>

        <a
          class="bg-secondary hover:opacity-95 text-on-secondary px-3.5 py-1.5 rounded-full font-[Plus_Jakarta_Sans] text-[11px] font-bold inline-flex items-center gap-1.5 shadow-[0_2px_0_#76014e] active:translate-y-0.5 active:shadow-none transition-all"
          href="${escapeHtml(spotify.spotifyUrl)}"
          rel="noopener noreferrer"
          target="_blank"
        >
          ${spotifyLogoSvg('w-3.5 h-3.5')}
          <span>Escuchar en Spotify</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * PLANTILLA 3 DE STITCH: `cassette` ("Tarjeta Cassette Vintage de Papel Kraft")
 * Respaldada por Track 3 en `5883e91f37bb4aabaf7a59ffae1247d7`
 */
function renderCassetteCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const noteText =
    editorial.dedication ||
    editorial.quote ||
    'Grabada en alta fidelidad para nuestro mixtape.';

  return `
    <article
      data-template="cassette"
      data-category="mixtape recuerdos"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 bg-surface-container-high pt-6 px-4 pb-4 sm:px-5 sm:pb-5 rounded-xl shadow-[0_8px_20px_-3px_rgba(87,72,56,0.12)] -rotate-0.5 hover:rotate-0 transition-transform duration-300 border border-[#ddc0ba]"
    >
      <!-- Cinta Washi superior centrada -->
      <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 h-5 bg-primary-fixed/90 backdrop-blur-xs -rotate-1 rounded-[2px] shadow-2xs z-10 flex items-center justify-center pointer-events-none">
        <span class="font-[Plus_Jakarta_Sans] text-[9px] font-bold uppercase tracking-wider text-on-primary-fixed">
          Cassette Tape • #${item.displayNumber.toString().padStart(2, '0')}
        </span>
      </div>

      <!-- Carcasa de Casete C-60 -->
      <div class="bg-inverse-surface text-inverse-on-surface p-3.5 rounded-xl shadow-md mb-3.5">
        <div class="flex items-center justify-between px-1 mb-2.5">
          <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold text-tertiary-fixed tracking-widest uppercase">
            ${escapeHtml(editorial.washiLabel || 'C-60 HIGH FIDELITY')}
          </span>
          <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold text-primary-fixed uppercase tracking-widest">
            SIDE ${escapeHtml(editorial.side)} • ${escapeHtml(spotify.durationFormatted)}
          </span>
        </div>

        <!-- Etiqueta Blanca del Casete: Portada 1:1 + Metadatos -->
        <div class="bg-surface-container-lowest text-on-surface p-2.5 rounded-lg flex items-center gap-3">
          <div class="w-16 h-16 shrink-0">
            ${renderUncroppedAlbumArt(item)}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-[Epilogue] text-[16px] sm:text-[17px] font-bold leading-snug text-on-surface truncate">
              <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">
                ${escapeHtml(spotify.title)}
              </a>
            </h3>
            <p class="font-[Literata] text-[12px] text-on-surface-variant italic truncate">
              ${escapeHtml(spotify.artists)}
            </p>
            ${renderStatusBadges(item)}
          </div>
        </div>

        <!-- Ventana Central de Carretes Giratorios del Casete -->
        <div class="mt-2.5 bg-[#25190c] rounded-full px-5 py-2 max-w-[270px] mx-auto flex items-center justify-between border border-[#8a726c]/40 shadow-inner">
          ${renderCassetteReelSvg('w-9 h-9')}
          <div class="flex-1 mx-3 flex flex-col items-center">
            <div class="w-full h-1.5 bg-[#57423d] rounded-full overflow-hidden">
              <div class="w-3/5 h-full bg-[#bbf37c] rounded-full"></div>
            </div>
            <span class="font-mono text-[9px] text-[#ffeedf]/80 tracking-widest mt-1">TAPE RUNNING</span>
          </div>
          ${renderCassetteReelSvg('w-9 h-9')}
        </div>
      </div>

      <!-- Napkin Note Attachment -->
      <div class="bg-surface-container-lowest p-3 rounded-lg shadow-2xs border border-[#edd6c1]">
        <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold uppercase text-tertiary tracking-wider flex items-center gap-1.5 mb-1">
          <span class="material-symbols-outlined text-[14px]">mode_comment</span>
          <span>${escapeHtml(editorial.noteTitle || 'Momento relax')}</span>
        </span>
        <p class="font-[Literata] text-[13px] text-on-surface italic leading-relaxed">
          ${escapeHtml(noteText)}
        </p>
      </div>

      <!-- Controls -->
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span class="font-[Literata] text-[12px] text-on-surface-variant inline-flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
          <span>${escapeHtml(editorial.footerTag || 'Nuestra favorita')}</span>
        </span>
        <a
          class="bg-primary hover:bg-primary-container text-on-primary font-[Plus_Jakarta_Sans] text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          href="${escapeHtml(spotify.spotifyUrl)}"
          rel="noopener noreferrer"
          target="_blank"
        >
          ${spotifyLogoSvg('w-3.5 h-3.5')}
          <span>Escuchar en Spotify</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * PLANTILLA 4 DE STITCH: `ticket` ("Ticket de Concierto / Carta Postal con Sello de Corazón")
 * Respaldada por Track 4 en `5883e91f37bb4aabaf7a59ffae1247d7`
 */
function renderTicketCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const noteText =
    editorial.dedication ||
    editorial.quote ||
    'Pase directo para escuchar esta canción.';

  return `
    <article
      data-template="ticket"
      data-category="recuerdos notas"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 bg-surface-container-low pt-6 px-4 pb-4 sm:px-5 sm:pb-5 rounded-xl shadow-[0_8px_20px_-3px_rgba(87,72,56,0.12)] rotate-0.5 hover:rotate-0 transition-transform duration-300 border border-[#edd6c1]"
    >
      <!-- Mint Washi centrada en el borde superior -->
      <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-tertiary-fixed/90 rotate-1 rounded-[2px] shadow-2xs z-10 pointer-events-none"></div>

      <!-- Header bar styled as concert stub -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-dashed border-[#ddc0ba]">
        <div class="flex flex-wrap items-center gap-2">
          <span class="bg-primary text-on-primary font-[Plus_Jakarta_Sans] font-bold text-[9px] px-2 py-0.5 rounded-[2px] uppercase tracking-widest">
            ${escapeHtml(editorial.washiLabel || 'ADMIT ONE: MIXTAPE PASS')}
          </span>
          <span class="font-[Plus_Jakarta_Sans] font-bold text-[10px] text-outline">
            ${escapeHtml(editorial.memoryTag || `SEC: VIBES • ROW: ${item.displayNumber.toString().padStart(2, '0')}`)}
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-secondary">
          <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3.5 items-center sm:items-start">
        <!-- Album Art (1:1 sin recortar) -->
        <div class="w-28 sm:w-32 shrink-0">
          ${renderUncroppedAlbumArt(item)}
        </div>

        <div class="flex-1 min-w-0 w-full">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="font-[Epilogue] text-[18px] font-semibold text-on-surface leading-snug">
              <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">
                ${escapeHtml(spotify.title)}
              </a>
            </h3>
            <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold text-outline shrink-0">
              ${escapeHtml(spotify.durationFormatted)}
            </span>
          </div>
          <p class="font-[Literata] text-[12px] text-on-surface-variant italic">
            ${escapeHtml(spotify.artists)}${spotify.albumName ? ` • ${escapeHtml(spotify.albumName)}` : ''}
          </p>
          ${renderStatusBadges(item)}

          <div class="bg-surface-container-lowest/90 p-3 rounded-lg shadow-2xs mt-2.5 border border-[#edd6c1]/80">
            <p class="font-[Literata] text-[13px] text-on-surface italic leading-relaxed">
              ${escapeHtml(noteText)}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-[#ddc0ba]/60">
        <span class="font-[Plus_Jakarta_Sans] font-bold text-[11px] text-on-surface-variant inline-flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-[15px]">verified</span>
          <span>${escapeHtml(editorial.footerTag || 'Selección Especial')}</span>
        </span>

        <a
          class="bg-surface-container-highest hover:bg-surface-container text-on-surface px-3.5 py-1.5 rounded-full font-[Plus_Jakarta_Sans] text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          href="${escapeHtml(spotify.spotifyUrl)}"
          rel="noopener noreferrer"
          target="_blank"
        >
          ${spotifyLogoSvg('w-3.5 h-3.5 text-[#1DB954]')}
          <span>Escuchar en Spotify</span>
          <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * PLANTILLA 5 DE STITCH REDISEÑADA: `double-polaroid` / `quote`
 * ("Collage de Foto Polaroid + Sticky Note Amarilla/Crema con Frase y Dedicatoria" — ej. Your Song / Sparks)
 */
function renderDoublePolaroidCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const quoteText = editorial.quote;
  const dedicationText =
    editorial.dedication ||
    'Para escuchar con calma cuando quieras desconectar un momento.';

  return `
    <article
      data-template="double-polaroid"
      data-category="recuerdos notas"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 bg-surface-container-low/80 pt-6 px-4 pb-4 sm:px-5 sm:pb-5 rounded-xl shadow-[0_8px_20px_-3px_rgba(87,72,56,0.12)] hover:rotate-0 transition-transform duration-300 border border-[#edd6c1]"
    >
      <!-- Cintas Washi Superiores Separadas -->
      <div class="absolute -top-2.5 left-8 w-16 h-4 bg-tertiary-fixed/90 -rotate-2 rounded-[2px] shadow-2xs z-20 pointer-events-none"></div>
      <div class="absolute -top-2.5 right-8 w-16 h-4 bg-secondary-fixed/90 rotate-2 rounded-[2px] shadow-2xs z-20 pointer-events-none"></div>

      <!-- Composición Collage: Polaroid a la izquierda + Sticky Note inclinada a la derecha -->
      <div class="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
        <!-- Marco Polaroid con Portada 1:1 y pie de foto con disco giratorio -->
        <div class="w-44 sm:w-44 shrink-0 bg-surface-container-lowest p-2.5 pb-3 rounded-[4px] shadow-md -rotate-1.5 flex flex-col justify-between border border-[#edd6c1]/90">
          ${renderUncroppedAlbumArt(item)}
          <div class="mt-2.5 pt-1.5 border-t border-dashed border-[#edd6c1] flex items-center justify-between px-0.5">
            <div class="flex items-center gap-1.5">
              ${renderSpinningVinylDisc('w-5 h-5', '#9e3c26')}
              <span class="font-[Caveat] text-[15px] font-bold text-[#57423d]">
                Pista #${item.displayNumber.toString().padStart(2, '0')}
              </span>
            </div>
            <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold text-outline">
              ${escapeHtml(spotify.durationFormatted)}
            </span>
          </div>
        </div>

        <!-- Sticky Note Adhesiva con Título, Cita Destacada y Dedicatoria -->
        <div class="flex-1 w-full bg-[#fef9dc] p-4 rounded-lg shadow-[0_6px_14px_rgba(87,72,56,0.10)] rotate-0.5 relative lined-note-bg border border-[#e6d79c] flex flex-col justify-between">
          <!-- Pequeño tape rosa pegando la Sticky Note -->
          <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-secondary-fixed-dim/80 -rotate-1 rounded-[2px] pointer-events-none"></div>

          <div>
            <!-- Encabezado de la Canción y Etiqueta -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <h3 class="font-[Epilogue] text-[18px] font-semibold text-on-surface leading-snug">
                  <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">
                    ${escapeHtml(spotify.title)}
                  </a>
                </h3>
                <p class="font-[Literata] text-[12px] text-on-surface-variant italic">
                  ${escapeHtml(spotify.artists)}
                </p>
                ${renderStatusBadges(item)}
              </div>

              <span class="bg-tertiary-fixed text-on-tertiary-fixed font-[Plus_Jakarta_Sans] font-bold text-[10px] px-2.5 py-0.5 rounded-full shrink-0">
                ${escapeHtml(editorial.memoryTag || 'Cita especial')}
              </span>
            </div>

            ${
              quoteText
                ? `<!-- Frase / Cita en recuadro tipo marcapáginas -->
                  <blockquote class="my-2.5 pl-3 py-1.5 pr-2.5 bg-surface-container-lowest/85 border-l-3 border-secondary rounded-r-md shadow-2xs">
                    <p class="font-[Literata] text-[13px] text-secondary font-medium italic leading-snug">
                      ${escapeHtml(quoteText)}
                    </p>
                  </blockquote>`
                : ''
            }

            <!-- Dedicatoria personal en la misma Sticky Note -->
            <div class="mt-2">
              <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold uppercase text-primary tracking-wider inline-flex items-center gap-1 mb-0.5">
                <span class="material-symbols-outlined text-[13px]">edit_note</span>
                <span>${escapeHtml(editorial.noteTitle || 'Nota para ti')}</span>
              </span>
              <p class="font-[Literata] text-[13px] text-on-surface italic leading-relaxed">
                ${escapeHtml(dedicationText)}
              </p>
            </div>
          </div>

          <!-- Pie de la Sticky Note con enlace a Spotify -->
          <div class="mt-3 pt-2 border-t border-[#e6d79c]/70 flex flex-wrap items-center justify-between gap-2">
            <span class="font-[Literata] text-[11px] text-on-surface-variant italic">
              ${escapeHtml(editorial.footerTag || 'Selección especial')}
            </span>
            <a
              class="bg-primary hover:bg-primary-container text-on-primary font-[Plus_Jakarta_Sans] text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              href="${escapeHtml(spotify.spotifyUrl)}"
              rel="noopener noreferrer"
              target="_blank"
            >
              ${spotifyLogoSvg('w-3.5 h-3.5')}
              <span>Escuchar en Spotify</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * PLANTILLA 6 DE STITCH: `minimal` ("La Canción Bonus Secreta" y Canciones de la Playlist)
 * Respaldada por Track 6 en `5883e91f37bb4aabaf7a59ffae1247d7`
 */
function renderMinimalCard(item: MergedTrackItem): string {
  const { spotify, editorial } = item;
  const isUnconfigured = item.status === 'unconfigured';
  const noteLine =
    editorial.dedication ||
    editorial.quote ||
    (isUnconfigured
      ? 'Parte de nuestra playlist en Spotify.'
      : '“Bonus track con pura buena energía para el día.”');

  return `
    <article
      data-template="minimal"
      data-category="mixtape"
      data-track-id="${escapeHtml(item.trackId)}"
      class="relative mt-2 ${
        isUnconfigured ? 'bg-surface-container-low/95' : 'bg-surface-container'
      } pt-5 px-4 pb-4 rounded-xl shadow-[0_6px_16px_-3px_rgba(87,72,56,0.10)] hover:rotate-0 transition-transform duration-300 border border-[#ddc0ba]"
    >
      <div class="absolute -top-2.5 right-5 px-3 h-5 ${
        isUnconfigured
          ? 'bg-surface-container-highest text-on-surface-variant'
          : 'bg-secondary-fixed/95 text-on-secondary-fixed'
      } rotate-1 rounded-[2px] shadow-2xs z-10 flex items-center justify-center pointer-events-none">
        <span class="font-[Plus_Jakarta_Sans] text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
          ${escapeHtml(
            editorial.washiLabel ||
              (isUnconfigured
                ? `Pista #${item.displayNumber.toString().padStart(2, '0')} • Mixtape`
                : 'Bonus Track Alegre ★')
          )}
        </span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Portada 1:1 de Spotify + Disco de Vinilo Giratorio acotado sin solapamiento -->
          <div class="flex items-center shrink-0">
            <div class="w-16 h-16 shrink-0 z-10">
              ${renderUncroppedAlbumArt(item)}
            </div>
            <div class="-ml-3 z-0">
              ${renderSpinningVinylDisc('w-12 h-12', isUnconfigured ? '#e06d53' : '#a43073')}
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[11px]" style="font-size: 11px; font-variation-settings: 'FILL' 1;">favorite</span>
              <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold text-outline uppercase">
                #${item.displayNumber.toString().padStart(2, '0')} • ${escapeHtml(spotify.durationFormatted)}
              </span>
            </div>
            <h3 class="font-[Epilogue] text-[16px] sm:text-[17px] font-semibold text-on-surface leading-snug truncate">
              <a href="${escapeHtml(spotify.spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">
                ${escapeHtml(spotify.title)}
              </a>
            </h3>
            <p class="font-[Literata] text-[12px] text-on-surface-variant italic truncate">
              ${escapeHtml(spotify.artists)}
            </p>
            <p class="font-[Literata] text-[12px] text-secondary mt-0.5 leading-snug">
              ${escapeHtml(noteLine)}
            </p>
            ${renderStatusBadges(item)}
          </div>
        </div>

        <a
          class="bg-surface-container-lowest hover:bg-surface-container-highest text-on-surface px-3.5 py-2 rounded-full font-[Plus_Jakarta_Sans] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 border border-[#edd6c1]"
          href="${escapeHtml(spotify.spotifyUrl)}"
          rel="noopener noreferrer"
          target="_blank"
        >
          ${spotifyLogoSvg('w-3.5 h-3.5 text-[#1DB954]')}
          <span>Spotify</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * Despacha la tarjeta adecuada según el `resolvedTemplate` de Stitch.
 */
export function renderTrackCard(item: MergedTrackItem): string {
  switch (item.resolvedTemplate) {
    case 'polaroid':
      return renderPolaroidCard(item);
    case 'post-it':
      return renderPostItCard(item);
    case 'cassette':
      return renderCassetteCard(item);
    case 'ticket':
      return renderTicketCard(item);
    case 'double-polaroid':
      return renderDoublePolaroidCard(item);
    case 'minimal':
    default:
      return renderMinimalCard(item);
  }
}

/**
 * Estado de carga tipo esqueleto editorial mientras se consulta `/api/mixtape`.
 */
export function renderLoadingMixtapeState(): string {
  return `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center" role="status" aria-live="polite">
      <div class="max-w-md w-full bg-surface-container-low p-6 rounded-2xl shadow-md border border-[#edd6c1] space-y-4">
        <div class="mx-auto flex items-center justify-center">
          ${renderSpinningVinylDisc('w-14 h-14', '#e06d53')}
        </div>
        <h2 class="font-[Epilogue] text-[20px] font-semibold text-on-surface">
          Desdoblando tu carta y preparando el mixtape…
        </h2>
        <p class="font-[Literata] text-[13px] text-on-surface-variant italic">
          Acomodando las canciones y tus notas personales.
        </p>
      </div>
    </div>
  `;
}

/**
 * Renderiza la experiencia completa de "Carta & Mixtape Scrapbook" (`5883e91f37bb4aabaf7a59ffae1247d7`).
 */
export function renderMixtapeScrapbook(
  data: MixtapeResponse,
  activeTab: NavigationTab = 'carta'
): string {
  const { letter, playlistStatus, tracks, removedConfiguredTracks } = data;

  const sideATracks = tracks.filter((t) => t.editorial.side === 'A');
  const sideBTracks = tracks.filter((t) => t.editorial.side === 'B');

  const emptyPlaylistHtml =
    tracks.length === 0
      ? `
        <section class="bg-surface-container-lowest p-6 rounded-xl border border-dashed border-[#ddc0ba] text-center space-y-3 my-2">
          <span class="material-symbols-outlined text-primary text-[32px]">queue_music</span>
          <h3 class="font-[Epilogue] text-[18px] font-semibold text-on-surface">
            La playlist está vacía por ahora
          </h3>
          <p class="font-[Literata] text-[13px] text-on-surface-variant italic max-w-md mx-auto">
            Puedes abrir la playlist directamente en Spotify con el botón superior o revisar las dedicatorias guardadas más abajo.
          </p>
        </section>
      `
      : '';

  return `
    <!-- TOP FIXED HEADER REACOMODADO (Limpio, íntimo y balanceado) -->
    <header class="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_2px_10px_rgba(87,66,61,0.06)] border-b border-[#edd6c1]/70">
      <div class="max-w-xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between relative">
        <!-- Identificador de la carta a la izquierda (Estilo cinta Washi) -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="bg-secondary-fixed/85 px-2.5 py-0.5 -rotate-1 rounded-[2px] shadow-[0_1px_2px_rgba(87,66,61,0.14)] inline-flex items-center gap-1.5 shrink-0">
            <span class="material-symbols-outlined text-secondary text-[13px]" style="font-size: 13px; font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold uppercase text-on-secondary-fixed tracking-widest">
              Para ti · mixtape
            </span>
          </div>
        </div>

        <!-- Contador + Acceso rápido a la playlist de Spotify a la derecha -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-[Plus_Jakarta_Sans] text-[11px] font-semibold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full border border-[#edd6c1]">
            ${playlistStatus.totalTracks} pistas
          </span>
          <a
            href="${escapeHtml(playlistStatus.playlistUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high px-3 py-1 rounded-full font-[Plus_Jakarta_Sans] text-[11px] font-bold text-on-surface border border-[#ddc0ba] shadow-2xs transition-colors"
            title="Abrir playlist completa en Spotify"
          >
            ${spotifyLogoSvg('w-3.5 h-3.5 text-[#1DB954]')}
            <span>Playlist</span>
          </a>
        </div>
      </div>
    </header>

    <!-- MAIN SCRAPBOOK CANVAS -->
    <main class="flex flex-col relative w-full pt-18 pb-28 bg-surface kraft-bg min-h-screen">
      <div class="flex flex-col w-full max-w-xl mx-auto px-4 sm:px-6 py-3 gap-6 relative">

        <!-- 1. ENCABEZADO Y SOBRE / CARTA DE INTRODUCCIÓN -->
        <section
          id="section-carta"
          class="scroll-mt-18 relative mt-2 bg-surface-container-low rounded-xl pt-6 px-4 pb-5 sm:px-6 sm:pb-6 shadow-[0_4px_16px_rgba(87,66,61,0.08)] transition-transform duration-300 border border-[#edd6c1]"
        >
          <!-- Washi Tape Superior Izquierda y Central -->
          <div class="absolute -top-2.5 left-8 w-20 h-4 bg-secondary-fixed/90 backdrop-blur-xs -rotate-2 rounded-[2px] shadow-[0_1px_2px_rgba(87,66,61,0.15)] z-10 pointer-events-none"></div>
          <div class="absolute -top-2.5 right-24 w-16 h-4 bg-tertiary-fixed/90 backdrop-blur-xs rotate-2 rounded-[2px] shadow-[0_1px_2px_rgba(87,66,61,0.15)] z-10 pointer-events-none"></div>

          <!-- Letter Header with postage stamp & seal -->
          <div class="flex items-start justify-between gap-3 mb-3.5">
            <div class="flex flex-col min-w-0">
              <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold text-primary uppercase tracking-wider inline-flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">mail</span>
                <span>${escapeHtml(letter.badgeTop)}</span>
              </span>
              <h1 class="font-[Epilogue] text-[24px] sm:text-[30px] font-semibold text-on-surface tracking-tight mt-1 leading-tight">
                ${escapeHtml(letter.title)}
              </h1>
              <p class="font-[Literata] text-[12px] sm:text-[13px] text-on-surface-variant italic mt-1">
                ${escapeHtml(letter.subtitle)}
              </p>
            </div>

            <!-- Air Mail Stamp -->
            <div class="shrink-0 bg-surface-container-highest p-1.5 rounded-[3px] shadow-2xs rotate-2 flex flex-col items-center justify-center border border-[#ddc0ba]">
              <div class="w-10 h-12 bg-primary/10 rounded-[2px] flex flex-col items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
                <span class="font-[Plus_Jakarta_Sans] text-[8px] uppercase font-bold tracking-tighter mt-0.5">
                  ${escapeHtml(letter.stampLabel)}
                </span>
              </div>
            </div>
          </div>

          <!-- Handwritten heartfelt letter body -->
          <div class="bg-surface-container-lowest/95 rounded-lg p-4 sm:p-5 shadow-2xs relative overflow-hidden mb-4 border border-[#edd6c1]/80">
            <div class="space-y-3 relative z-10">
              ${letter.paragraphs
                .map(
                  (p) =>
                    `<p class="font-[Literata] text-[15px] text-on-surface leading-relaxed">${escapeHtml(p)}</p>`
                )
                .join('')}
            </div>

            <div class="mt-4 pt-2.5 border-t border-dashed border-[#edd6c1] flex items-center justify-between text-on-surface-variant">
              <span class="font-[Literata] text-[12px] italic text-outline">
                ${escapeHtml(letter.signOffLabel)}
              </span>
              <span class="font-[Plus_Jakarta_Sans] text-[12px] text-secondary font-semibold">
                ${escapeHtml(letter.signature)}
              </span>
            </div>
          </div>

          <!-- Counter pill & Spotify CTA button -->
          <div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div class="bg-surface-container-high px-3.5 py-2 rounded-full inline-flex items-center justify-center gap-2 shadow-2xs">
              ${renderSpinningVinylDisc('w-5 h-5', '#e06d53')}
              <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold text-on-surface">
                ${playlistStatus.totalTracks} canciones en orden • ${playlistStatus.configuredTracksCount} dedicatorias
              </span>
            </div>

            <a
              class="bg-primary hover:bg-primary-container text-on-primary font-[Plus_Jakarta_Sans] text-[12px] font-bold px-4 py-2.5 rounded-full inline-flex items-center justify-center gap-2 shadow-[0_3px_0_#822714] active:translate-y-0.5 active:shadow-none transition-all"
              href="${escapeHtml(playlistStatus.playlistUrl)}"
              rel="noopener noreferrer"
              target="_blank"
            >
              ${spotifyLogoSvg('w-4 h-4')}
              <span>Escuchar Playlist en Spotify</span>
            </a>
          </div>
        </section>

        ${emptyPlaylistHtml}

        <!-- 2. SECCIÓN DE PISTAS: LADO A -->
        ${
          sideATracks.length > 0
            ? `
              <div id="section-mixtape" class="scroll-mt-18 flex items-center justify-center gap-3 my-1">
                <div class="h-[1px] w-12 bg-outline-variant"></div>
                <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-3.5 py-1 rounded-[3px] shadow-2xs">
                  ${escapeHtml(letter.sideATitle)}
                </span>
                <div class="h-[1px] w-12 bg-outline-variant"></div>
              </div>
              <div class="flex flex-col gap-6">
                ${sideATracks.map((track) => renderTrackCard(track)).join('')}
              </div>
            `
            : ''
        }

        <!-- 3. SECCIÓN DE PISTAS: LADO B -->
        ${
          sideBTracks.length > 0
            ? `
              <div class="flex items-center justify-center gap-3 my-2">
                <div class="h-[1px] w-12 bg-outline-variant"></div>
                <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-3.5 py-1 rounded-[3px] shadow-2xs">
                  ${escapeHtml(letter.sideBTitle)}
                </span>
                <div class="h-[1px] w-12 bg-outline-variant"></div>
              </div>
              <div class="flex flex-col gap-6">
                ${sideBTracks.map((track) => renderTrackCard(track)).join('')}
              </div>
            `
            : ''
        }

        <!-- ARCHIVO DE DEDICATORIAS DE CANCIONES RETIRADAS DE LA PLAYLIST -->
        ${
          removedConfiguredTracks.length > 0
            ? `
              <div class="flex items-center justify-center gap-2 my-2">
                <div class="h-[1px] w-10 bg-outline-variant"></div>
                <span class="font-[Plus_Jakarta_Sans] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-3 py-1 rounded-[2px] shadow-2xs">
                  Archivo de Recuerdos
                </span>
                <div class="h-[1px] w-10 bg-outline-variant"></div>
              </div>
              <div class="flex flex-col gap-6">
                ${removedConfiguredTracks.map((track) => renderTrackCard(track)).join('')}
              </div>
            `
            : ''
        }

        <!-- 4. CARTA / NOTA FINAL DE DESPEDIDA -->
        <section
          id="section-cierre"
          class="scroll-mt-18 relative mt-3 bg-surface-container-lowest pt-7 px-5 pb-5 sm:px-6 sm:pb-6 rounded-xl shadow-[0_12px_28px_-4px_rgba(87,72,56,0.15)] mb-4 border border-[#edd6c1]"
        >
          <!-- Top Washi Mint Center -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-tertiary-fixed/95 rotate-1 rounded-[2px] shadow-2xs z-10 flex items-center justify-center pointer-events-none">
            <span class="font-[Plus_Jakarta_Sans] text-[9px] font-bold uppercase tracking-wider text-on-tertiary-fixed">
              Fin del Lado B ♡
            </span>
          </div>

          <div class="text-center mb-4">
            <span class="font-[Plus_Jakarta_Sans] text-[11px] font-bold uppercase tracking-widest text-primary">
              ${escapeHtml(letter.closingBadge)}
            </span>
            <h2 class="font-[Epilogue] text-[22px] font-semibold text-on-surface mt-1">
              ${escapeHtml(letter.closingTitle)}
            </h2>
          </div>

          <div class="bg-surface-container-low p-4 rounded-lg shadow-inner mb-4 border border-[#edd6c1]/70">
            <p class="font-[Literata] text-[15px] text-on-surface leading-relaxed text-center sm:text-left italic">
              ${escapeHtml(letter.closingBody)}
            </p>
            <div class="mt-3 flex flex-col items-center sm:items-end justify-center">
              <span class="font-[Epilogue] text-[16px] text-secondary font-bold mt-0.5 text-center sm:text-right">
                ${escapeHtml(letter.closingHighlight)}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-2.5 items-stretch justify-center">
            ${
              letter.replyUrl
                ? `<a
                    class="bg-primary hover:bg-primary-container text-on-primary font-[Plus_Jakarta_Sans] text-[12px] font-bold px-4 py-3 rounded-full inline-flex items-center justify-center gap-2 shadow-[0_3px_0_#822714] active:translate-y-0.5 active:shadow-none transition-all"
                    href="${escapeHtml(letter.replyUrl)}"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span class="material-symbols-outlined text-[18px]">chat</span>
                    <span>${escapeHtml(letter.replyLabel)}</span>
                  </a>`
                : ''
            }
            <a
              class="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-[Plus_Jakarta_Sans] text-[12px] font-bold px-4 py-3 rounded-full inline-flex items-center justify-center gap-2 shadow-2xs transition-colors"
              href="${escapeHtml(playlistStatus.playlistUrl)}"
              rel="noopener noreferrer"
              target="_blank"
            >
              ${spotifyLogoSvg('w-4 h-4 text-[#1DB954]')}
              <span>Guardar en mi Spotify</span>
            </a>
          </div>

          <!-- Decorative Stamp Footer -->
          <div class="mt-5 pt-2 flex flex-wrap items-center justify-center gap-2 text-outline text-[12px] font-[Literata]">
            <span>${escapeHtml(letter.footerStamp)}</span>
            <span>•</span>
            <span>Datos y portadas provistos por Spotify</span>
          </div>
        </section>
      </div>
    </main>

    <!-- BARRA INFERIOR FLOTANTE ESTILO PAPELERÍA (Reacomodada en orden de lectura: Intro → Dedicadas → Último mensaje → Cerrar sobre) -->
    <nav
      aria-label="Navegación de la carta y mixtape"
      class="fixed bottom-3 inset-x-0 z-50 px-3 sm:px-4 pointer-events-none"
    >
      <div class="max-w-md sm:max-w-lg mx-auto bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_28px_rgba(87,66,61,0.18)] border border-[#ddc0ba] p-1.5 grid grid-cols-4 gap-1 items-stretch overflow-hidden pointer-events-auto">
        <button
          type="button"
          data-nav-tab="carta"
          aria-current="${activeTab === 'carta' ? 'page' : 'false'}"
          class="min-w-0 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-xl font-[Plus_Jakarta_Sans] text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'carta'
              ? 'bg-surface-container-high text-primary shadow-2xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
          }"
        >
          <span class="material-symbols-outlined text-[17px]">mark_email_read</span>
          <span class="truncate">Intro</span>
        </button>

        <button
          type="button"
          data-nav-tab="notas"
          aria-current="${activeTab === 'notas' ? 'page' : 'false'}"
          class="min-w-0 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-xl font-[Plus_Jakarta_Sans] text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'notas'
              ? 'bg-surface-container-high text-primary shadow-2xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
          }"
        >
          <span class="material-symbols-outlined text-[17px]">sticky_note_2</span>
          <span class="truncate">Dedicadas</span>
        </button>

        <button
          type="button"
          data-nav-tab="mixtape"
          aria-current="${activeTab === 'mixtape' ? 'page' : 'false'}"
          class="min-w-0 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-1.5 sm:px-2.5 rounded-xl font-[Plus_Jakarta_Sans] text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'mixtape'
              ? 'bg-surface-container-high text-primary shadow-2xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
          }"
        >
          <span class="material-symbols-outlined text-[17px]">favorite</span>
          <span class="truncate">Último mensaje</span>
        </button>

        <button
          type="button"
          id="btnLogout"
          aria-label="Cerrar sobre y salir"
          title="Guardar carta en el sobre y cerrar sesión"
          class="min-w-0 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 bg-[#fff1e6] hover:bg-[#ffdad2] text-[#9e3c26] border border-[#e06d53]/35 py-1.5 px-1.5 sm:px-2.5 rounded-xl font-[Plus_Jakarta_Sans] text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[17px]">mail_lock</span>
          <span class="truncate">Cerrar sobre</span>
        </button>
      </div>
    </nav>
  `;
}
