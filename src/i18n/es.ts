/**
 * Spanish copy — the source of truth for message keys.
 * `en.ts` must satisfy the same shape (enforced by the `Messages` type).
 * Plural entries use `{ one, other }`; placeholders use `{name}`.
 */
export const es = {
  app: {
    name: 'Breakbit',
    tagline: 'Pequeñas pausas, mejores hábitos.',
    loading: 'Cargando Breakbit…',
  },
  nav: {
    label: 'Navegación principal',
    today: 'Hoy',
    progress: 'Progreso',
    settings: 'Ajustes',
    gap: 'Tengo un hueco',
  },
  common: {
    back: 'Volver',
    close: 'Cerrar',
    seeMore: 'Ver más',
    comingSoon: 'Disponible en una próxima fase',
    stepOf: 'Paso {current} de {total}',
    minutes: { one: '{count} min', other: '{count} min' },
    seconds: { one: '{count} s', other: '{count} s' },
    pauses: { one: '{count} pausa', other: '{count} pausas' },
    pausesOf: '{done} de {total} pausas',
  },
  status: {
    pending: 'Pendiente',
    postponed: 'Aplazada',
    completed: 'Completada',
    missed: 'Perdida',
    firstTry: 'A la primera',
    extra: 'Pausa extra',
  },
  today: {
    greeting: '¡Hola!',
    subtitle: 'Muévete un poco, trabaja mejor.',
    placeholderTitle: 'Tu día aparecerá aquí',
    placeholderBody:
      'Plan del día, próxima pausa y actividad principal llegarán en las próximas fases.',
  },
  progress: {
    title: 'Progreso',
    subtitle: 'De hábitos pequeños a un gran cambio.',
    placeholderBody: 'Evolución, constancia y resumen semanal llegarán en una próxima fase.',
  },
  settings: {
    title: 'Ajustes',
    subtitle: 'Configura tu experiencia en Breakbit.',
    appearance: 'Apariencia',
    theme: {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
    language: 'Idioma',
    languages: {
      es: 'Español',
      en: 'English',
    },
    workday: 'Jornada habitual',
    discomfort: 'Molestias prioritarias',
    equipment: 'Equipamiento disponible',
    intensity: 'Intensidad',
    notifications: 'Notificaciones',
  },
  gap: {
    title: 'Tengo un hueco',
    subtitle: '¿Cuánto tiempo tienes?',
    options: {
      s30: { title: '30 segundos', body: 'Un ejercicio rápido' },
      m1: { title: '1 minuto', body: 'Ideal para activarte' },
      m3: { title: '3 minutos', body: 'Mini rutina completa' },
      m10: { title: '10+ minutos', body: 'Un reset más largo' },
    },
  },
  dayEnd: {
    title: 'Fin de jornada',
    subtitle: 'Resumen, valoración y próxima jornada.',
    placeholderBody:
      'El cierre de jornada llegará en una próxima fase. Esta pantalla no muestra la navegación inferior.',
  },
  intensity: {
    label: 'Intensidad',
    soft: 'Suave',
    normal: 'Normal',
    active: 'Activo',
  },
  schedule: {
    start: 'Inicio',
    end: 'Fin',
    break: 'Descanso',
    lunch: 'Comida',
  },
  areas: {
    neck: 'Cuello',
    back: 'Espalda',
    shoulders: 'Hombros',
    wrists: 'Muñecas',
    eyes: 'Vista',
    sedentary: 'Sedentarismo',
  },
  equipment: {
    mat: 'Esterilla',
    dumbbells: 'Mancuernas',
    kettlebell: 'Kettlebell',
    pullup_bar: 'Barra',
    standing_desk: 'Escritorio elevable',
  },
  kit: {
    title: 'Design system',
    subtitle: 'Componentes base de Breakbit',
    themeLabel: 'Tema',
    localeLabel: 'Idioma',
    sections: {
      colors: 'Colores',
      typography: 'Tipografía',
      buttons: 'Botones',
      pills: 'Botones pequeños (píldoras)',
      chips: 'Chips de selección',
      time: 'Selector de hora',
      toggles: 'Toggle y checkbox',
      sliders: 'Sliders de molestias (0-5)',
      cards: 'Tarjetas',
      progress: 'Progreso y estados',
      lists: 'Filas de lista',
      sheet: 'Hoja inferior',
      icons: 'Iconos (pixel art)',
      lineIcons: 'Iconos de línea',
    },
    states: {
      normal: 'Normal',
      active: 'Seleccionado / Activo',
      disabled: 'Deshabilitado',
    },
    variants: {
      primary: 'Primario',
      secondary: 'Secundario',
      ghost: 'Ghost',
      destructive: 'Destructivo',
    },
    sample: {
      startDay: 'Empezar jornada',
      changeActivity: 'Cambiar actividad',
      seeMore: 'Ver más',
      discardPause: 'Descartar pausa',
      pauseDuration: 'Duración de pausa',
      remindersOn: 'Recordatorios activos',
      remindersOff: 'Recordatorios desactivados',
      canMove: 'Puedo moverme',
      useForMain: 'Usar para actividad principal',
      goodJob: '¡Buen trabajo!',
      goodJobBody: 'Has completado 3 pausas a la primera hoy.',
      timeLeft: 'Te quedan',
      timeLeftValue: '4 h 20 min',
      timeLeftBody: 'para terminar la jornada.',
      pausesThisWeek: 'pausas esta semana',
      atFirstTry: 'a la primera',
      nextPause: 'Próxima pausa',
      nextPauseName: 'Ola corporal',
      level: 'Nivel {level}',
      xpOf: '{current} / {total} XP',
      dayProgress: 'Progreso del día',
      openSheet: 'Abrir hoja',
      sheetTitle: '¿Descartar esta pausa?',
      sheetBody: 'Descartar resta 50 XP. Aplazar no penaliza si luego la completas.',
      cancel: 'Cancelar',
      iconSize: 'Tamaño',
    },
  },
};

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** Shape every locale must implement. */
export type Messages = Widen<typeof es>;
