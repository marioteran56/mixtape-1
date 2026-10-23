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
    '“No quería pasarte solo un link de Spotify y decir que ese era el detalle... Hice esto para poder dedicarte cada canción dentro de este mixtape que hice para ti, porque cada canción que ves listada hace que piense en ti de alguna u otra forma, o simplemente tiene alguna frase que me gustaría dedicarte. Escucha este mixtape en tu tiempo libre, o bien, cuando me extrañes como yo lo hago todos los días.”',
  ],
  signOffLabel: 'Con amor y dedicación',
  signature: 'Mario :)',
  sideATitle: 'Mis dedicatorias',
  sideBTitle: '',
  closingBadge: 'Un último mensaje',
  closingTitle: 'Ojalá te hayan gustado todas estas canciones',
  closingBody:
    '“Esta es solo una pequeña muestra de las miles de canciones que me hacen pensar en ti de distintas maneras. Créeme que escucho de todo, y puede que después me arrepienta de no haber puesto alguna otra o de no haber cambiado una por otra. Incluso puede que algunas canciones no te gusten, o ninguna, pero el único mensaje que quiero dejar, y que espero que entiendas, es que cuando las escucho la persona en la que pienso eres tú.”\n\n“Sé que todas estas palabras no tienen el mismo efecto cuando son a distancia, solo espero que llegue el día en que pueda decirlas frente a ti.”',
  closingHighlight: 'Solo espero el momento en que podamos escucharlas juntos.',
  flightNoteBadge: 'Ruta Chihuahua — Monterrey',
  flightNoteText:
    '“Curiosamente, este mixtape dura más de lo que toma un vuelo de Chihuahua a Monterrey o de regreso, así que ya tengo la música perfecta para acompañarme en el camino cuando vaya a visitarte.”',
  replyUrl:
    'https://wa.me/526141902258?text=Estuve%20escuchando%20tu%20mixtape%2C%20y%20me%20pareci%C3%B3...',
  replyLabel: 'Contactar al remitente',
  footerStamp: 'Hecho con amor y música • Mixtape #1',
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
    memoryTag: 'Una de mis canciones favoritas',
    noteTitle: 'ÁNGEL DE LA MADRUGADA',
    dedication:
      '“La primera canción de esta lista, porque todavía no puedo creer cómo encontré un ángel a una hora en la que no esperaba nada. Cruzaste mi camino y te quedaste para siempre tatuada en mi cabeza.”',
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
    noteTitle: 'LO DARÉ TODO POR TI',
    dedication:
      '“Habla de lo vulnerable que me puedo sentir contigo, esa persona especial con la que quiero intentarlo todo, aunque a veces parezcan patadas de ahogado, solo por estar a tu lado.”',
    footerTag: 'Apostarlo todo',
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
    quote: '“She’s so beautiful, and I tell her every day.”',
    dedication:
      '“Probablemente ya estás harta de que todos los días te digo una indirecta o te recalco lo hermosa que eres. Mientras no te canses de escucharlo, yo no me cansaré de decirlo.”',
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
    memoryTag: 'Detalles solo para ti',
    noteTitle: 'SIMPLE, PERO PARA TI',
    quote: '“My gift is my song, and this one’s for you.”',
    dedication:
      '“Es una canción muy simple, pero a la vez muy linda. Representa justo lo que son estos detalles, los hago para ti y solo para ti porque quiero que sepas lo importante que eres para mí.”',
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
    noteTitle: 'UNA INDIRECTA MUY DIRECTA',
    dedication:
      '“Creo que la indirecta es bastante obvia y no necesita mucha interpretación, con el título basta.”',
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
    noteTitle: 'A varios cientos de kilómetros',
    dedication:
      '“Me hace pensar en todas esas noches en las que, a pesar de estar tan lejos, leo tus mensajes llenos de cariño y siento un calor en el pecho, como si estuviera a tu lado. O por lo menos, como me gustaría estarlo.”',
    footerTag: 'Para las noches a distancia',
    isDemoContent: false,
  },

  // #07 — Quién Dice (Marcos Menchaca) — PISTA DESTACADA
  {
    trackId: '0vR9p1X1ZDbHPzVEgHfMm6',
    fallbackTitle: 'Quién Dice',
    fallbackArtists: 'Marcos Menchaca',
    template: 'double-polaroid',
    side: 'A',
    washiLabel: 'Pista Destacada • #07',
    featuredBadge: 'Coincidencia Especial • Pista #07',
    memoryTag: 'Día 26',
    calloutText: '¿Sabías que nos conocimos un día 26?',
    noteTitle: 'QUIÉN DICE QUE NO PODEMOS ESTAR JUNTOS',
    dedication:
      '“A pesar de que la situación no siempre esté a nuestro favor, yo me quiero aferrar a ti y a todo lo bonito que tenemos.”',
    footerTag: 'Indie Acústico',
    isDemoContent: false,
  },

  // #08 — Labios Rotos - En Vivo Desde México / 2010 (Zoé)
  {
    trackId: '1nULBrlzWatdcjA2ZctIMv',
    fallbackTitle: 'Labios Rotos - En Vivo Desde México / 2010',
    fallbackArtists: 'Zoé',
    template: 'post-it',
    side: 'A',
    noteTitle: 'ES RARO EL AMOR',
    dedication:
      '“Es raro el amor, que aparece cuando uno menos piensa. Con tan solo escuchar tu voz tan tierna me gustaría entregarte todo mi amor y cuidarte siempre.”',
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
    noteTitle: 'NUESTRO LUGAR ESPECIAL',
    dedication:
      '“Habla de encontrar ese rincón que sea solo nuestro. Me encantaría tener la oportunidad de platicar más contigo, compartir experiencias nuevas y empezar algo muy bonito juntos, un lugar al que siempre queramos volver.”',
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
    quote: '“Wise men say only fools rush in, but I can’t help falling in love with you...”',
    dedication:
      '“Dicen que los sabios no se apresuran y que no debería ir tan rápido con detalles así, pero es que contigo en verdad no puedo evitar enamorarme.”',
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
    memoryTag: 'Verte pronto',
    noteTitle: 'MÁS DE CERCA',
    dedication:
      '“Me hace pensar en las ganas que tengo de seguir conociéndote más de cerca, de ir a tu ciudad y poder darte este tipo de amor y detalles en persona, de una manera mucho más cercana.”',
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
    noteTitle: 'EN MI CABEZA',
    dedication:
      '“Te has metido tanto en mi vida últimamente que gran parte del día lo único que hago es pensar en ti y extrañarte cuando no estás presente.”',
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
    noteTitle: 'DIFÍCIL DE EXPLICAR',
    quote: '“You should feel how I feel when somebody says your name.”',
    dedication:
      '“A pesar de que ande diciendo cosas atrevidas, cursis o románticas detrás de estas canciones, la verdad es que me cuesta mucho explicar todo lo que siento por ti en estos momentos y lo emocionado que me pongo cada vez que alguien menciona tu nombre.”',
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
    noteTitle: 'SONREÍRLE A LA VIDA',
    quote: '“If there’s somebody calling me home, she’s the one...”',
    dedication:
      '“Desde que te conocí empecé a sonreírle a la vida de una manera que no tiene explicación. Sentí una conexión muy especial contigo donde puedo ser yo mismo, y me da tanto gusto poder serlo a tu lado.”',
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
    dedication:
      '“La incluí aquí porque una vez me mencionaste que el amor a la antigua es lo mejor, y he tratado de seguir las recomendaciones de esta canción para ganarme tu corazón.”',
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
    quote: '“And dirty little notes in Post-Its...”',
    dedication:
      '“La menciono porque recuerdo que la compartiste y de ahí saqué la idea de mandarte los Post-Its en el último detalle que te hice. Pero más allá de eso, esta canción tiene muchas notas sobre lo que buscas y valoras en alguien.”',
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

  // #19 — Aprovéchate (Café Tacvba)
  {
    trackId: '2GvI8j0DaIAGvubj5NinEF',
    fallbackTitle: 'Aprovéchate',
    fallbackArtists: 'Café Tacvba',
    template: 'polaroid',
    side: 'B',
    washiLabel: 'Pista 19 • Clásico Alternativo',
    memoryTag: 'Directa y sin rodeos',
    noteTitle: 'SIN GUARDAR NADA',
    dedication:
      '“Una joya de Café Tacvba con esa mezcla entre nostalgia y sinceridad total que hace que piense en ti apenas empieza a sonar.”',
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

  // #22 — Yo No Sé Mañana (Luis Enrique)
  {
    trackId: '54uBpRpdpMx96JAk1OyHez',
    fallbackTitle: 'Yo No Sé Mañana',
    fallbackArtists: 'Luis Enrique',
    template: 'cassette',
    side: 'B',
    washiLabel: 'CLÁSICO PARA CANTAR',
    noteTitle: 'Lo que importa es hoy',
    dedication:
      '“Porque más allá de lo que pase después, lo que de verdad vale la pena es disfrutar el presente y cada momento en que coincidimos.”',
    footerTag: 'Salsa Clásica',
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
      '“Sencilla, a guitarra y piano, pero dice la verdad más clara de todo el mixtape.”',
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

  // #27 — Te quiero (Hombres G)
  {
    trackId: '5ULNuAoAozLAc721tRcPbX',
    fallbackTitle: 'Te quiero',
    fallbackArtists: 'Hombres G',
    template: 'polaroid',
    side: 'B',
    washiLabel: 'Pista 27 • Clásico en Español',
    memoryTag: 'De principio a fin',
    noteTitle: 'SENCILLO Y DIRECTO',
    dedication:
      '“Un clásico de toda la vida que no necesita complicarse para decir las cosas tal cual se sienten.”',
    isDemoContent: false,
  },

  // #28 — Eres Tú (Matisse, Reik)
  {
    trackId: '3iVu49ZmRHsCdRA0RTGUkP',
    fallbackTitle: 'Eres Tú',
    fallbackArtists: 'Matisse, Reik',
    template: 'postcard',
    side: 'B',
    washiLabel: 'Nota Postal • Pista 28',
    memoryTag: 'En cualquier lugar',
    noteTitle: 'SIEMPRE TÚ',
    quote: '“En mis sueños, en mi boca, en mi piel siempre estás tú...”',
    dedication:
      '“De esas canciones que resumen en pocos minutos por qué alguien se vuelve tan especial en tu día a día.”',
    footerTag: 'Pop Acústico',
    isDemoContent: false,
  },

  // #29 — Aqui Estoy Yo (Luis Fonsi, Aleks Syntek, Noel Schajris, David Bisbal)
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
      '“En los días buenos y también cuando necesites quién te escuche o te saque una sonrisa, aquí estoy yo.”',
    footerTag: 'Cuarteto Clásico',
    isDemoContent: false,
  },

  // ==========================================================================
  // #30 — CIERRE ESPECIAL DEL MIXTAPE (Rascal Flatts — Bless The Broken Road)
  // ==========================================================================
  {
    trackId: '4YjjNHtEsTX6Af4mCTupT5',
    fallbackTitle: 'Bless The Broken Road',
    fallbackArtists: 'Rascal Flatts',
    template: 'collector',
    side: 'B',
    washiLabel: 'Pista Final #30 • Una de mis favoritas',
    memoryTag: 'El camino que me llevó a conocerte',
    noteTitle: 'POR QUÉ CIERRA ESTE MIXTAPE',
    quote: '“God blessed the broken road that led me straight to you...”',
    dedication:
      '“Quise dejar esta canción para el final porque es de mis favoritas y tiene un significado muy grande para mí. Habla justo de cómo, a pesar de las veces en que me he sentido perdido o sin rumbo claro, aun así Dios acomodó cada paso y me guió exactamente hasta el camino en el que te conocí.”',
    footerTag: 'Cierre especial • Todo el camino valió la pena',
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
