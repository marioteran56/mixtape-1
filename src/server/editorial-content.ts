/**
 * ARCHIVO EXCLUSIVO DEL SERVIDOR — CONTENIDO EDITORIAL PRIVADO
 * ============================================================================
 * Este módulo contiene la carta privada y el mapa de dedicatorias por canción.
 * NUNCA debe importarse desde `src/client/*` ni exponerse en archivos estáticos.
 * Solo se entrega a través de `GET /api/mixtape` tras verificar una sesión válida.
 *
 * CÓMO ACTUALIZAR LA LISTA DE CANCIONES DE LA PLAYLIST (PROCESO MANUAL SIN LLAVES):
 * Ejecuta en tu terminal:
 *   npm run sync:playlist
 * Esto actualiza `src/server/playlist-catalog.json` respetando el orden actual de la
 * playlist en Spotify y descargando las portadas nuevas, SIN sobrescribir ninguna de
 * tus dedicatorias en `EDITORIAL_TRACK_ENTRIES`.
 */

import type {
  EditorialEntry,
  PrivateLetterContent,
  SpotifyTrackMetadata,
} from '../shared/types';
import rawCatalog from './playlist-catalog.json';

/**
 * ID de la playlist en el proyecto Stitch ("Pensando en ti…" — Mario Teran).
 */
export const DEFAULT_STITCH_PLAYLIST_ID = '0EJqoSBZPUYuKNj36TKNxt';

/**
 * Contenido de la carta de introducción y despedida extraído literalmente
 * de la pantalla de Stitch `projects/3351798792530970780/screens/5883e91f37bb4aabaf7a59ffae1247d7`.
 */
export const PRIVATE_LETTER_CONTENT: PrivateLetterContent = {
  badgeTop: 'UN DETALLE PARA TI',
  title: 'Para ti, un pequeño mixtape 📼',
  subtitle: 'Un par de canciones que me hacen recordarte y me gustaría dedicarte',
  stampLabel: 'PAR AVION',
  paragraphs: [
    '“No quería pasarte solo un link de Spotify y decir que ese era el detalle, una playlist... Hice esto para poder dedicarte cada canción dentro de este mixtape que hice para ti, por que cada canción que ves listada hace que piense en tí de alguna u otra forma, o simplemente tienen alguna frase que me gustaría dedicarte. Escucha este mixtape en tu tiempo libre, o bien, cuando me extrañes como yo lo hago todos los días.”',
  ],
  signOffLabel: 'Con amor y dedicación',
  signature: 'Yo pues quien mas :)',
  sideATitle: 'Mis dedicatorias',
  sideBTitle: '',
  closingBadge: 'Un último mensaje',
  closingTitle: 'Ojalá te hayan gustado todas estas canciones 🫶🏻',
  closingBody:
    '“Esta es solo una pequeña muestra de las miles de canciones que me hacen pensar en tí en cientos de maneras diferentes. Espero que te hayan gustado tanto que las escuches cualquier lugar.”',
  closingHighlight: 'Solo espero el momento en que podamos escucharlas juntos 🥺',
  replyUrl:
    'https://wa.me/?text=Me%20encant%C3%B3%20much%C3%ADsimo%20el%20mixtape%20de%20canciones%20%E2%99%A1',
  replyLabel: 'Agradecer al remitente',
  footerStamp: 'Hecho con amor • Playlist #1',
  isDemoContent: false,
};

/**
 * Mapa editorial completo para las 30 canciones de la playlist final.
 * Se enlaza con `src/server/playlist-catalog.json` usando `trackId` y respeta
 * estrictamente el orden de la playlist (1 a 30).
 */
export const EDITORIAL_TRACK_ENTRIES: EditorialEntry[] = [
  // #01 — Ángel (Elefante)
  {
    trackId: '2rYjkYQWpn66nf5Ihk7SHJ',
    fallbackTitle: 'Ángel',
    fallbackArtists: 'Elefante',
    template: 'polaroid',
    side: 'A',
    washiLabel: 'Pista 01 • Apertura ♡',
    memoryTag: 'Para empezar el mixtape',
    noteTitle: 'DESDE EL PRIMER ACORDE',
    dedication:
      '“La primera canción de la lista porque desde el primer acorde me hace pensar en ti y en la suerte de coincidir contigo.”',
    isDemoContent: false,
  },

  // #02 — Patadas de Ahogado (LATIN MAFIA, HUMBE)
  {
    trackId: '4WefXOf8I4gMjdj2kBJgkl',
    fallbackTitle: 'Patadas de Ahogado',
    fallbackArtists: 'LATIN MAFIA, HUMBE',
    template: 'post-it',
    side: 'A',
    washiLabel: 'Track Destacado ♡',
    memoryTag: 'Vibes de fin de semana',
    noteTitle: 'VIBRA / DE ESAS ROLAS',
    dedication:
      '“De esas canciones que tienen una atmósfera única al instante y me acordaron de cuando platicamos el otro día. Imposible no pensar en ti cuando empieza.”',
    footerTag: 'Para escuchar de noche',
    isDemoContent: false,
  },

  // #03 — Just the Way You Are (Bruno Mars)
  {
    trackId: '7BqBn9nzAq8spo5e7cZ0dJ',
    fallbackTitle: 'Just the Way You Are',
    fallbackArtists: 'Bruno Mars',
    template: 'postcard',
    side: 'A',
    washiLabel: 'Correo Aéreo • Pista 03',
    memoryTag: 'Sin cambiar ni un detalle',
    noteTitle: 'TAL Y COMO ERES',
    quote: '“When I see your face, there’s not a thing that I would change...”',
    dedication:
      '“No hacía falta darle muchas vueltas: esta canción dice exactamente lo que pienso cada vez que sonríes.”',
    footerTag: 'Pop Clásico',
    isDemoContent: false,
  },

  // #04 — Your Song (Elton John)
  {
    trackId: '38zsOOcu31XbbYj9BIPUF1',
    fallbackTitle: 'Your Song',
    fallbackArtists: 'Elton John',
    template: 'double-polaroid',
    side: 'A',
    memoryTag: 'Clásico eterno',
    noteTitle: 'UNA FRASE PARA TI',
    quote: '“How wonderful life is while you’re in the world.”',
    dedication:
      '“Pocas canciones dicen algo tan sencillo y tan cierto al mismo tiempo. Si este mixtape fuera una sola frase, sería esa.”',
    footerTag: 'Clásico atemporal',
    isDemoContent: false,
  },

  // #05 — Girl Crush - Recorded at Metropolis Studios, London (Harry Styles)
  {
    trackId: '4YutJsNwBBInE8vemufpQ8',
    fallbackTitle: 'Girl Crush - Recorded at Metropolis Studios, London',
    fallbackArtists: 'Harry Styles',
    template: 'vinyl-sleeve',
    side: 'A',
    washiLabel: 'Sesión en Estudio • Londres',
    memoryTag: 'Acústico de medianoche',
    noteTitle: 'VERSIÓN FAVORITA',
    dedication:
      '“Esta versión en estudio tiene una calma muy especial. De esas canciones para ponerse audífonos y escuchar cada detalle.”',
    footerTag: 'Metropolis Studios Session',
    isDemoContent: false,
  },

  // #06 — Kilómetros (Sin Bandera)
  {
    trackId: '0AcFsf9FGjL1Al2RBQ1Crq',
    fallbackTitle: 'Kilómetros',
    fallbackArtists: 'Sin Bandera',
    template: 'cassette',
    side: 'A',
    washiLabel: 'C-60 HIGH FIDELITY',
    noteTitle: 'Ni a varios cientos de kilómetros',
    dedication:
      '“Un clásico que nunca falla cuando se trata de explicar todo lo que uno siente sin que alcancen las medidas normales.”',
    footerTag: 'Para cantar en el carro',
    isDemoContent: false,
  },

  // #07 — Quién Dice (Marcos Menchaca)
  {
    trackId: '0vR9p1X1ZDbHPzVEgHfMm6',
    fallbackTitle: 'Quién Dice',
    fallbackArtists: 'Marcos Menchaca',
    template: 'ticket',
    side: 'A',
    washiLabel: 'ADMIT ONE: MIXTAPE PASS',
    memoryTag: 'SEC: INDIE • ROW: 07',
    noteTitle: 'Rincón acústico',
    dedication:
      '“Tiene esa vibra ligera, cálida y sincera que hace que cualquier tarde normal se sienta diferente.”',
    footerTag: 'Indie / Acústico',
    isDemoContent: false,
  },

  // #08 — Labios Rotos - En Vivo Desde México / 2010 (Zoé)
  {
    trackId: '1nULBrlzWatdcjA2ZctIMv',
    fallbackTitle: 'Labios Rotos - En Vivo Desde México / 2010',
    fallbackArtists: 'Zoé',
    template: 'post-it',
    side: 'A',
    noteTitle: 'Un clásico en vivo',
    memoryTag: 'Nuestras charlas con música de fondo',
    dedication:
      '“Un clasicazo que me recordó nuestras pláticas sobre buena música. La versión MTV Unplugged tiene una magia única; imposible no cantarla.”',
    footerTag: 'Para cantarla a todo pulmón',
    isDemoContent: false,
  },

  // #09 — Somewhere Only We Know (Keane)
  {
    trackId: '0ll8uFnc0nANY35E0Lfxvg',
    fallbackTitle: 'Somewhere Only We Know',
    fallbackArtists: 'Keane',
    template: 'ticket',
    side: 'A',
    washiLabel: 'ADMIT ONE: MIXTAPE PASS',
    memoryTag: 'SEC: DEDICATORIA • ROW: 09',
    dedication:
      '“Para nuestro propio rincón tranquilo cuando el mundo va demasiado rápido. Siempre me da paz escuchar ese piano.”',
    footerTag: 'Piano Rock',
    isDemoContent: false,
  },

  // #10 — Can't Help Falling in Love (Elvis Presley)
  {
    trackId: '44AyOl4qVkzS48vBsbNXaC',
    fallbackTitle: "Can't Help Falling in Love",
    fallbackArtists: 'Elvis Presley',
    template: 'polaroid',
    side: 'A',
    washiLabel: 'Pista 10 • Inolvidable ♡',
    memoryTag: 'Romance clásico',
    noteTitle: 'INEVITABLE',
    quote: '“Take my hand, take my whole life too...”',
    dedication:
      '“Hay cosas que pasan sin planearlas pero que desde el principio se sienten como si tuvieran que pasar sí o sí.”',
    isDemoContent: false,
  },

  // #11 — Si No Estás (Íñigo Quintero)
  {
    trackId: '2HafqoJbgXdtjwCOvNEF14',
    fallbackTitle: 'Si No Estás',
    fallbackArtists: 'Íñigo Quintero',
    template: 'postcard',
    side: 'A',
    washiLabel: 'Nota Postal • Pista 11',
    memoryTag: 'Cuando te extraño',
    noteTitle: 'PARA LOS DÍAS LARGOS',
    dedication:
      '“La canción que mejor resume cómo cambia todo el ánimo del día cuando no estás cerca y las ganas de volver a coincidir.”',
    footerTag: 'Piano & Voz',
    isDemoContent: false,
  },

  // #12 — Vivir Sin Aire (Maná)
  {
    trackId: '3G9RQLOSjsXVUDyQSv2PQR',
    fallbackTitle: 'Vivir Sin Aire',
    fallbackArtists: 'Maná',
    template: 'cassette',
    side: 'A',
    washiLabel: 'CLÁSICO EN ESPAÑOL',
    noteTitle: 'De principio a fin',
    dedication:
      '“De esas canciones que todos nos sabemos de memoria pero que cobran otro sentido cuando tienen nombre y apellido al dedicarlas.”',
    footerTag: 'Rock en Español',
    isDemoContent: false,
  },

  // #13 — stupid song (Olivia Rodrigo)
  {
    trackId: '4LfCY65LvojKjWEnU7fNN4',
    fallbackTitle: 'stupid song',
    fallbackArtists: 'Olivia Rodrigo',
    template: 'double-polaroid',
    side: 'A',
    memoryTag: 'Confesión honesta',
    noteTitle: 'CURSI PERO CIERTO',
    quote: '“Tú haces que hasta la canción más cursi tenga todo el sentido del mundo.”',
    dedication:
      '“Me dio risa y ternura a la vez porque describe perfecto cómo uno termina haciendo un mixtape entero solo por alguien especial.”',
    footerTag: 'Indie Pop',
    isDemoContent: false,
  },

  // #14 — She's The One (Robbie Williams)
  {
    trackId: '4lO57zZGFcj7vSY4QhfVDq',
    fallbackTitle: "She's The One",
    fallbackArtists: 'Robbie Williams',
    template: 'vinyl-sleeve',
    side: 'A',
    washiLabel: 'Edición Especial • #14',
    memoryTag: 'Sin ninguna duda',
    noteTitle: 'ELLA ES',
    quote: '“I was her, she was me, we were one, we were free...”',
    dedication:
      '“El título lo dice todo sin necesidad de agregarle una sola palabra más.”',
    footerTag: 'Britpop Classic',
    isDemoContent: false,
  },

  // ==========================================================================
  // APARTADO DE MENCIONES HONORÍFICAS (CANCIONES #15 Y #16 SEGUIDAS)
  // ==========================================================================

  // #15 — Amarte A La Antigua (Pedro Fernández) — MENCIÓN HONORÍFICA 1
  {
    trackId: '7y4HLPy4f0TJpmX3rqDjHH',
    fallbackTitle: 'Amarte A La Antigua',
    fallbackArtists: 'Pedro Fernández',
    template: 'honorable-mention',
    side: 'A',
    washiLabel: 'Mención Honorífica #01 ★',
    memoryTag: 'Detalles que no pasan de moda',
    noteTitle: '¿Por qué es mención honorífica?',
    quote: '“Mandarte cartas de mi puño y letra, canciones a través de mi ventana...”',
    dedication:
      '“Merece su propia mención honorífica porque este mixtape y esta carta nacieron justo de esa idea: conservar los detalles bonitos, las cartas dedicadas y esa forma de querer a la antigua que nunca debería perderse.”',
    footerTag: 'Mención Honorífica • Pista #15',
    isDemoContent: false,
  },

  // #16 — like my father (Jax) — MENCIÓN HONORÍFICA 2
  {
    trackId: '5YVmHTAsdWnoanWXB7AwZX',
    fallbackTitle: 'like my father',
    fallbackArtists: 'Jax',
    template: 'honorable-mention',
    side: 'A',
    washiLabel: 'Mención Honorífica #02 ★',
    memoryTag: 'El estándar de cariño verdadero',
    noteTitle: '¿Por qué es mención honorífica?',
    quote: '“I need a man who loves me like my father loves my mom...”',
    dedication:
      '“Está en este apartado especial porque habla del tipo de amor que vale la pena: paciente, detallista, leal y que cuida todos los días con hechos y no solo con palabras.”',
    footerTag: 'Mención Honorífica • Pista #16',
    isDemoContent: false,
  },

  // ==========================================================================
  // SEGUNDA PARTE: RECUERDOS Y NOTAS (CANCIONES #17 A #29)
  // ==========================================================================

  // #17 — Vámonos a Marte (Kevin Kaarl)
  {
    trackId: '1qBdJHxR2qY0dFad0ZI8sj',
    fallbackTitle: 'Vámonos a Marte',
    fallbackArtists: 'Kevin Kaarl',
    template: 'ticket',
    side: 'B',
    washiLabel: 'ADMIT TWO: DESTINO MARTE',
    memoryTag: 'SEC: COSMOS • ROW: 17',
    dedication:
      '“La melodía perfecta para desconectar del ruido del mundo e irnos a platicar donde nadie nos vaya a encontrar.”',
    footerTag: 'Acústico / Folk',
    isDemoContent: false,
  },

  // #18 — Motivos (Luis Miguel)
  {
    trackId: '4yEJ1SNpgfK5GPx3Y0YhIU',
    fallbackTitle: 'Motivos',
    fallbackArtists: 'Luis Miguel',
    template: 'postcard',
    side: 'B',
    washiLabel: 'Serenata • Pista 18',
    memoryTag: 'Sobran las razones',
    noteTitle: 'UN MOTIVO MÁS',
    quote: '“Una rosa pintada de azul es un motivo...”',
    dedication:
      '“Porque contigo cualquier detalle pequeño del día se vuelve un motivo para sonreír y acordarme de ti.”',
    footerTag: 'Bolero / Romance',
    isDemoContent: false,
  },

  // #19 — Lover (Taylor Swift)
  {
    trackId: '1dGr1c8CrMLDpV6mPbImSI',
    fallbackTitle: 'Lover',
    fallbackArtists: 'Taylor Swift',
    template: 'polaroid',
    side: 'B',
    washiLabel: 'Pista 19 • Luces Cálidas ♡',
    memoryTag: 'Atmósfera de película',
    noteTitle: 'PARA BAILAR DESPACIO',
    dedication:
      '“Tiene esa calidez de casa, de luces bajitas y de querer guardar cada momento bueno que compartimos.”',
    isDemoContent: false,
  },

  // #20 — Sparks (Coldplay)
  {
    trackId: '7D0RhFcb3CrfPuTJ0obrod',
    fallbackTitle: 'Sparks',
    fallbackArtists: 'Coldplay',
    template: 'double-polaroid',
    side: 'B',
    memoryTag: 'Atmósfera chill',
    noteTitle: 'Para días tranquilos',
    quote: '“My heart is yours, it’s you that I hold on to...”',
    dedication:
      '“Para desconectar un rato o cuando estés haciendo cosas con calma. De las canciones más bonitas y sinceras de toda la lista.”',
    footerTag: 'Selección Acústica',
    isDemoContent: false,
  },

  // #21 — Andar Conmigo (Julieta Venegas)
  {
    trackId: '05iMQqncVBIm4AE26EvaTL',
    fallbackTitle: 'Andar Conmigo',
    fallbackArtists: 'Julieta Venegas',
    template: 'post-it',
    side: 'B',
    noteTitle: 'Pregunta directa',
    memoryTag: 'Conocernos paso a paso',
    dedication:
      '“‘Hay tanto que quiero contarte, hay tanto que quiero saber de ti...’ Alegre, directa y con toda la ilusión de compartir tiempo juntos.”',
    footerTag: 'Pop Alternativo',
    isDemoContent: false,
  },

  // #22 — I Don't Want To Miss A Thing (Aerosmith)
  {
    trackId: '5qlJg0Wbj3sslxfwiaRNpq',
    fallbackTitle: 'I Don\'t Want To Miss A Thing - From "Armageddon" Soundtrack',
    fallbackArtists: 'Aerosmith',
    template: 'cassette',
    side: 'B',
    washiLabel: 'SOUNDTRACK CLASSIC',
    noteTitle: 'Sin perder un segundo',
    dedication:
      '“Un himno gigante de los noventa para decir que cada rato platicando o compartiendo contigo vale oro.”',
    footerTag: 'Power Ballad',
    isDemoContent: false,
  },

  // #23 — No Hay Nadie Más (Sebastian Yatra)
  {
    trackId: '3IPJg1sdqLj12kFIndaonN',
    fallbackTitle: 'No Hay Nadie Más',
    fallbackArtists: 'Sebastian Yatra',
    template: 'postcard',
    side: 'B',
    washiLabel: 'Confesión • Pista 23',
    memoryTag: 'Única en el mundo',
    noteTitle: 'ASÍ DE CLARO',
    quote: '“Quiero que el tiempo pase junto a ti, porque no hay nadie más...”',
    dedication:
      '“Sencilla, a guitarra y piano, pero dice la verdad más clara de toda la playlist.”',
    footerTag: 'Balada Pop',
    isDemoContent: false,
  },

  // #24 — Volare (Danny Ocean)
  {
    trackId: '7nE9H4e4uPOis5sJY39fOc',
    fallbackTitle: 'Volare',
    fallbackArtists: 'Danny Ocean',
    template: 'ticket',
    side: 'B',
    washiLabel: 'BOARDING PASS • VUELO 24',
    memoryTag: 'SEC: NUBES • ROW: 24',
    dedication:
      '“Corta, fresca y con esa sensación exacta de andar en las nubes después de hablar contigo.”',
    footerTag: 'Vibra Ligera',
    isDemoContent: false,
  },

  // #25 — Aprender A Quererte (Morat)
  {
    trackId: '3zNcn4BaVfKORyx3uDfruW',
    fallbackTitle: 'Aprender A Quererte',
    fallbackArtists: 'Morat',
    template: 'vinyl-sleeve',
    side: 'B',
    washiLabel: 'Edición Vinilo • #25',
    memoryTag: 'Conocerte cada día más',
    noteTitle: 'MI MATERIA FAVORITA',
    dedication:
      '“Porque aprender qué te hace reír, qué música te gusta y cómo ves el mundo es de mis cosas favoritas.”',
    footerTag: 'Folk Pop',
    isDemoContent: false,
  },

  // #26 — Bajo El Agua (Manuel Medrano)
  {
    trackId: '5QSYWruQQ7kBCHScI4xJ9g',
    fallbackTitle: 'Bajo El Agua',
    fallbackArtists: 'Manuel Medrano',
    template: 'cassette',
    side: 'B',
    washiLabel: 'C-60 HIGH FIDELITY',
    noteTitle: 'Momento relax',
    dedication:
      '“Para escuchar tranqui en una tarde despejada. Me dio la vibra exacta de ti desde la primera vez que la puse en la lista.”',
    footerTag: 'Nuestra favorita',
    isDemoContent: false,
  },

  // #27 — Entra en Mi Vida (Sin Bandera)
  {
    trackId: '2h0iSG7htO0V4IvuwbTBf3',
    fallbackTitle: 'Entra en Mi Vida',
    fallbackArtists: 'Sin Bandera',
    template: 'polaroid',
    side: 'B',
    washiLabel: 'Pista 27 • Bienvenida ♡',
    memoryTag: 'Llegaste en el mejor momento',
    noteTitle: 'TE ABRO LA PUERTA',
    dedication:
      '“Por la forma tan natural y tan bonita en que llegaste a hacer los días mucho más brillantes.”',
    isDemoContent: false,
  },

  // #28 — Aqui Estoy Yo (Luis Fonsi, Aleks Syntek, Noel Schajris, David Bisbal)
  {
    trackId: '4go2M6us50x9TQ1NvsB4vt',
    fallbackTitle: 'Aqui Estoy Yo',
    fallbackArtists: 'Luis Fonsi, Aleks Syntek, Noel Schajris, David Bisbal',
    template: 'double-polaroid',
    side: 'B',
    memoryTag: 'Cuenta conmigo siempre',
    noteTitle: 'PROMESA EN PAPEL',
    quote: '“Aquí estoy yo para darte mi fuerza y mi aliento...”',
    dedication:
      '“En los días buenos y también cuando necesites quién te escuche o te saque una sonrisa: aquí estoy yo.”',
    footerTag: 'Cuarteto Clásico',
    isDemoContent: false,
  },

  // #29 — Bless The Broken Road (Rascal Flatts)
  {
    trackId: '4YjjNHtEsTX6Af4mCTupT5',
    fallbackTitle: 'Bless The Broken Road',
    fallbackArtists: 'Rascal Flatts',
    template: 'postcard',
    side: 'B',
    washiLabel: 'Ruta 29 • Destino Final',
    memoryTag: 'Todo el camino llevaba a ti',
    noteTitle: 'VALIÓ CADA PASO',
    quote: '“That led me straight to you...”',
    dedication:
      '“Cada vuelta del camino tiene sentido cuando al final te lleva a coincidir con la persona correcta.”',
    footerTag: 'Country Ballad',
    isDemoContent: false,
  },

  // ==========================================================================
  // #30 — CIERRE / EL CHISTE MALO DE LA PLAYLIST (Camila — Coleccionista de Canciones)
  // ==========================================================================
  {
    trackId: '28Ct4qwkQXY2W5yyNCLuVI',
    fallbackTitle: 'Coleccionista de Canciones',
    fallbackArtists: 'Camila',
    template: 'collector',
    side: 'B',
    washiLabel: 'Bonus Final • Chiste Malo Oficial 😂',
    memoryTag: 'Título desbloqueado: 30 de 30 canciones',
    noteTitle: 'POR QUÉ ESTÁ AL FINAL (SÍ, ES UN CHISTE MALO)',
    quote: '“Camila — Coleccionista de Canciones (literalmente tú después de esta playlist).”',
    dedication:
      '“Perdón por el chiste tan malo para cerrar, pero no podía dejar pasar la oportunidad: te llamas Camila y después de dedicarte las 29 canciones anteriores de esta playlist, oficialmente ya eres ‘Camila, Coleccionista de Canciones’. 😂🫶🏻”',
    footerTag: 'Trofeo desbloqueado: Coleccionista Oficial',
    isDemoContent: false,
  },
];

/**
 * Catálogo sincronizado manualmente mediante `npm run sync:playlist` (`src/server/playlist-catalog.json`).
 * Mantiene el orden exacto de las canciones en la playlist de Spotify y sus portadas oficiales,
 * sin necesidad de configurar llaves ni variables de entorno de Spotify.
 */
export const SYNCED_PLAYLIST_CATALOG: {
  playlistId: string;
  playlistName: string;
  playlistUrl: string;
  ownerName: string;
  syncedAt: string;
  tracks: SpotifyTrackMetadata[];
} = {
  playlistId: rawCatalog.playlistId || DEFAULT_STITCH_PLAYLIST_ID,
  playlistName: rawCatalog.playlistName || 'Pensando en ti…',
  playlistUrl:
    rawCatalog.playlistUrl || `https://open.spotify.com/playlist/${DEFAULT_STITCH_PLAYLIST_ID}`,
  ownerName: rawCatalog.ownerName || 'Mario Teran',
  syncedAt: rawCatalog.syncedAt || new Date().toISOString(),
  tracks: rawCatalog.tracks as SpotifyTrackMetadata[],
};

export const DEMO_SPOTIFY_PLAYLIST_FIXTURE = SYNCED_PLAYLIST_CATALOG;
