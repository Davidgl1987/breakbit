/**
 * Checks the content catalog (catalogo-breakbit.json) before the app uses it. It runs at
 * build time (build/catalogCheck.ts) and in the tests, so a broken catalog never ships:
 * every problem names the item and what is wrong, in Spanish, for whoever edits the file.
 *
 * No imports here: the build plugin loads this file outside the app.
 */

export interface CatalogIssue {
  /** Where: `exercises[12] "lunge" → durationSec`. */
  where: string;
  problem: string;
}

/** 1 exercise = 1 minute: alone as a microbreak or as a step of a routine. */
export const EXERCISE_SECONDS = 60;
/** The longest routine that is a pause (PAUSE_SIZE.activeMaxSec): 3 exercises. */
export const PAUSE_ROUTINE_MAX_SEC = 180;
/** Main activity length, in minutes. */
export const MAIN_MINUTES = { min: 5, max: 30 } as const;
/** Equipment-free exercises every area needs, so a day can be planned without equipment. */
export const MIN_GEAR_FREE_PER_AREA = 2;

const POSTURES = ['standing', 'either', 'floor'];
const MEETING_FRIENDLY = ['yes', 'partial', 'no'];
const COMPLETION_MODES = ['continuous', 'accumulated'];
const SLOTS = ['break', 'work', 'meeting'];
const ID_PATTERN = /^[a-z0-9]+(_[a-z0-9]+)*$/;

/** Breakbit builds habits; it never promises health outcomes. */
const MEDICAL_TERMS = [
  /\bcur(a|ar|e)\b/i,
  /\bdolor/i,
  /\bpain\b/i,
  /lesi[oó]n|injur/i,
  /rehab/i,
  /terap|therap/i,
  /tratamiento|treatment/i,
  /diagn/i,
];

const FIELDS = {
  root: ['version', 'areas', 'equipment', 'exercises', 'routines', 'mainActivities'],
  areas: ['id', 'name', 'icon'],
  equipment: ['id', 'name', 'hint', 'icon'],
  exercises: [
    'id',
    'name',
    'description',
    'steps',
    'areas',
    'equipment',
    'durationSec',
    'posture',
    'meetingFriendly',
    'icon',
  ],
  routines: ['id', 'name', 'steps', 'icon'],
  routineSteps: ['exercise', 'seconds'],
  mainActivities: [
    'id',
    'name',
    'description',
    'steps',
    'equipment',
    'durationMin',
    'shortVersionMin',
    'completionMode',
    'slots',
    'whileWorking',
    'routine',
    'icon',
  ],
} as const;

type Item = Record<string, unknown>;

/** The parts of a valid catalog the coverage rules read. */
interface CoverageView {
  areas: { id: string }[];
  equipment: { id: string }[];
  exercises: { areas: string[]; equipment: string[]; posture: string; meetingFriendly: string }[];
  mainActivities: { equipment: string[]; slots: string[] }[];
}

export function validateCatalog(data: unknown): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const fail = (where: string, problem: string) => issues.push({ where, problem });

  if (!isObject(data)) {
    fail(
      'catálogo',
      'debe ser un objeto JSON con areas, equipment, exercises, routines y mainActivities',
    );
    return issues;
  }
  unknownFields(data, FIELDS.root, 'catálogo', fail);
  if (typeof data.version !== 'number') fail('version', 'falta o no es un número');

  const sections = {
    areas: list(data.areas, 'areas', fail),
    equipment: list(data.equipment, 'equipment', fail),
    exercises: list(data.exercises, 'exercises', fail),
    routines: list(data.routines, 'routines', fail),
    mainActivities: list(data.mainActivities, 'mainActivities', fail),
  };
  const ids = Object.fromEntries(
    Object.entries(sections).map(([section, items]) => [section, checkIds(items, section, fail)]),
  ) as Record<keyof typeof sections, Set<string>>;

  sections.areas.forEach((area, index) => {
    const at = label('areas', index, area);
    unknownFields(area, FIELDS.areas, at, fail);
    text(area.name, `${at} → name`, fail);
    optionalIcon(area.icon, at, fail);
  });

  sections.equipment.forEach((item, index) => {
    const at = label('equipment', index, item);
    unknownFields(item, FIELDS.equipment, at, fail);
    text(item.name, `${at} → name`, fail);
    text(item.hint, `${at} → hint`, fail);
    optionalIcon(item.icon, at, fail);
  });

  sections.exercises.forEach((exercise, index) => {
    const at = label('exercises', index, exercise);
    unknownFields(exercise, FIELDS.exercises, at, fail);
    text(exercise.name, `${at} → name`, fail);
    text(exercise.description, `${at} → description`, fail);
    textList(exercise.steps, `${at} → steps`, 2, fail);
    references(exercise.areas, ids.areas, 'areas', `${at} → areas`, 1, fail);
    references(exercise.equipment, ids.equipment, 'equipment', `${at} → equipment`, 0, fail);
    oneMinute(exercise.durationSec, `${at} → durationSec`, fail);
    oneOf(exercise.posture, POSTURES, `${at} → posture`, fail);
    oneOf(exercise.meetingFriendly, MEETING_FRIENDLY, `${at} → meetingFriendly`, fail);
    optionalIcon(exercise.icon, at, fail);
  });

  sections.routines.forEach((routine, index) => {
    const at = label('routines', index, routine);
    unknownFields(routine, FIELDS.routines, at, fail);
    text(routine.name, `${at} → name`, fail);
    if (!Array.isArray(routine.steps) || routine.steps.length === 0) {
      fail(`${at} → steps`, 'debe ser una lista con al menos un ejercicio');
    } else {
      routine.steps.forEach((step: unknown, stepIndex) => {
        const stepAt = `${at} → steps[${stepIndex}]`;
        if (!isObject(step)) {
          fail(stepAt, 'debe ser { "exercise": id, "seconds": número }');
          return;
        }
        unknownFields(step, FIELDS.routineSteps, stepAt, fail);
        if (typeof step.exercise !== 'string' || !ids.exercises.has(step.exercise)) {
          fail(`${stepAt} → exercise`, `"${String(step.exercise)}" no existe en exercises`);
        }
        oneMinute(step.seconds, `${stepAt} → seconds`, fail);
      });
    }
    optionalIcon(routine.icon, at, fail);
  });

  sections.mainActivities.forEach((activity, index) => {
    const at = label('mainActivities', index, activity);
    unknownFields(activity, FIELDS.mainActivities, at, fail);
    text(activity.name, `${at} → name`, fail);
    text(activity.description, `${at} → description`, fail);
    textList(activity.steps, `${at} → steps`, 1, fail);
    references(activity.equipment, ids.equipment, 'equipment', `${at} → equipment`, 0, fail);
    mainDuration(activity, at, fail);
    oneOf(activity.completionMode, COMPLETION_MODES, `${at} → completionMode`, fail);
    if (!Array.isArray(activity.slots) || activity.slots.length === 0) {
      fail(`${at} → slots`, `debe ser una lista con al menos uno de: ${SLOTS.join(', ')}`);
    } else {
      activity.slots.forEach((slot: unknown, slotIndex) =>
        oneOf(slot, SLOTS, `${at} → slots[${slotIndex}]`, fail),
      );
      if (new Set(activity.slots).size !== activity.slots.length)
        fail(`${at} → slots`, 'tiene valores repetidos');
    }
    if (typeof activity.whileWorking !== 'boolean')
      fail(`${at} → whileWorking`, 'debe ser true o false');
    if (activity.routine !== undefined) {
      const routine = sections.routines.find((item) => item.id === activity.routine);
      if (routine) guidedRoutine(routine, activity, `${at} → routine`, fail);
      else fail(`${at} → routine`, `"${String(activity.routine)}" no existe en routines`);
    }
    optionalIcon(activity.icon, at, fail);
  });

  medicalLanguage(sections, fail);
  if (issues.length === 0) coverage(data as unknown as CoverageView, fail);
  return issues;
}

/** One line per problem, ready for a terminal or the build error overlay. */
export function formatCatalogIssues(issues: readonly CatalogIssue[]): string {
  const lines = issues.map((issue) => `  • ${issue.where}: ${issue.problem}`);
  const count = issues.length === 1 ? '1 problema' : `${issues.length} problemas`;
  return `El catálogo de contenido tiene ${count}:\n${lines.join('\n')}`;
}

// ---------- Coverage: there is always something to propose ----------

function coverage(catalog: CoverageView, fail: (where: string, problem: string) => void): void {
  const gearFree = catalog.exercises.filter((exercise) => exercise.equipment.length === 0);
  const atDesk = gearFree.filter((exercise) => exercise.posture !== 'floor');
  for (const area of catalog.areas) {
    const at = `areas "${area.id}"`;
    const works = (exercise: CoverageView['exercises'][number]) => exercise.areas.includes(area.id);
    const count = gearFree.filter(works).length;
    if (count < MIN_GEAR_FREE_PER_AREA) {
      fail(
        at,
        `necesita al menos ${MIN_GEAR_FREE_PER_AREA} ejercicios sin material y tiene ${count}`,
      );
    }
    if (!atDesk.some(works)) {
      fail(at, 'necesita un ejercicio sin material que no sea de suelo (standing o either)');
    } else if (!atDesk.some((exercise) => works(exercise) && exercise.meetingFriendly !== 'no')) {
      fail(at, 'necesita un ejercicio sin material, que no sea de suelo y apto para reuniones');
    }
  }
  for (const item of catalog.equipment) {
    const used =
      catalog.exercises.some((exercise) => exercise.equipment.includes(item.id)) ||
      catalog.mainActivities.some((activity) => activity.equipment.includes(item.id));
    if (!used) fail(`equipment "${item.id}"`, 'no se usa en ningún ejercicio ni actividad');
  }
  const gearFreeMain = catalog.mainActivities.some(
    (activity) =>
      activity.equipment.length === 0 && activity.slots.some((slot) => slot !== 'meeting'),
  );
  if (!gearFreeMain) {
    fail('mainActivities', 'necesita al menos una actividad sin material fuera de reuniones');
  }
}

function medicalLanguage(
  sections: Record<string, Item[]>,
  fail: (where: string, problem: string) => void,
): void {
  for (const [section, items] of Object.entries(sections)) {
    items.forEach((item, index) => {
      const texts = [item.name, item.description, item.hint, ...(asArray(item.steps) ?? [])];
      for (const value of texts) {
        if (!isObject(value)) continue;
        for (const locale of ['es', 'en']) {
          const content = value[locale];
          if (typeof content !== 'string') continue;
          const term = MEDICAL_TERMS.find((pattern) => pattern.test(content));
          if (term) {
            fail(
              label(section, index, item),
              `usa lenguaje médico ("${content.match(term)?.[0]}"); Breakbit no promete salud`,
            );
          }
        }
      }
    });
  }
}

// ---------- Field checks ----------

function list(
  value: unknown,
  section: string,
  fail: (where: string, problem: string) => void,
): Item[] {
  if (!Array.isArray(value)) {
    fail(section, 'falta o no es una lista');
    return [];
  }
  return value.filter((item, index) => {
    if (isObject(item)) return true;
    fail(`${section}[${index}]`, 'debe ser un objeto');
    return false;
  });
}

function checkIds(
  items: Item[],
  section: string,
  fail: (where: string, problem: string) => void,
): Set<string> {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    const at = `${section}[${index}]`;
    if (typeof item.id !== 'string' || item.id === '') {
      fail(`${at} → id`, 'falta el id');
    } else if (!ID_PATTERN.test(item.id)) {
      fail(`${at} → id`, `"${item.id}" debe ir en minúsculas, con números y guiones bajos`);
    } else if (seen.has(item.id)) {
      fail(`${at} → id`, `"${item.id}" está repetido en ${section}`);
    } else {
      seen.add(item.id);
    }
  });
  return seen;
}

function unknownFields(
  item: Item,
  allowed: readonly string[],
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  for (const key of Object.keys(item)) {
    if (!allowed.includes(key)) fail(`${at} → ${key}`, 'campo desconocido');
  }
}

function text(value: unknown, at: string, fail: (where: string, problem: string) => void): void {
  if (!isObject(value)) {
    fail(at, 'debe ser un texto { "es": "…", "en": "…" }');
    return;
  }
  for (const locale of ['es', 'en']) {
    const content = value[locale];
    if (typeof content !== 'string' || content.trim() === '') {
      fail(at, `falta el texto en ${locale === 'es' ? 'español (es)' : 'inglés (en)'}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (key !== 'es' && key !== 'en') fail(`${at} → ${key}`, 'idioma desconocido (solo es y en)');
  }
}

function textList(
  value: unknown,
  at: string,
  min: number,
  fail: (where: string, problem: string) => void,
): void {
  if (!Array.isArray(value) || value.length < min) {
    fail(at, `debe ser una lista con al menos ${min === 1 ? 'un paso' : `${min} pasos`}`);
    return;
  }
  value.forEach((step: unknown, index) => text(step, `${at}[${index}]`, fail));
}

function references(
  value: unknown,
  known: Set<string>,
  section: string,
  at: string,
  min: number,
  fail: (where: string, problem: string) => void,
): void {
  if (!Array.isArray(value)) {
    fail(at, `debe ser una lista de ids de ${section}${min === 0 ? ' ([] si no hace falta)' : ''}`);
    return;
  }
  if (value.length < min) fail(at, `necesita al menos ${min} id de ${section}`);
  value.forEach((id: unknown) => {
    if (typeof id !== 'string' || !known.has(id))
      fail(at, `"${String(id)}" no existe en ${section}`);
  });
  if (new Set(value).size !== value.length) fail(at, 'tiene ids repetidos');
}

function integerIn(
  value: unknown,
  range: { min: number; max: number },
  unit: string,
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    fail(at, `debe ser un número entero de ${unit}`);
  } else if (value < range.min || value > range.max) {
    fail(at, `${value} está fuera de ${range.min}–${range.max} ${unit}`);
  }
}

/**
 * A main activity's routine is a long sequence of its own, never a pause routine, and the
 * whole of it fits the activity at least once: a longer block repeats it from the start.
 */
function guidedRoutine(
  routine: Item,
  activity: Item,
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  const seconds = (asArray(routine.steps) ?? []).reduce<number>(
    (total, step) =>
      total + (isObject(step) && typeof step.seconds === 'number' ? step.seconds : 0),
    0,
  );
  if (seconds <= PAUSE_ROUTINE_MAX_SEC) {
    fail(
      at,
      `"${String(routine.id)}" es una rutina de pausa (hasta 3 minutos): un bloque necesita una rutina propia más larga`,
    );
  }
  const minMinutes = isObject(activity.durationMin) ? activity.durationMin.min : undefined;
  if (typeof minMinutes === 'number' && seconds > minMinutes * 60) {
    fail(
      at,
      `"${String(routine.id)}" dura ${seconds / 60} min y no cabe entera en los ${minMinutes} min de la actividad`,
    );
  }
}

function oneMinute(
  value: unknown,
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  if (value !== EXERCISE_SECONDS) {
    fail(at, `${String(value)} no vale: cada ejercicio dura ${EXERCISE_SECONDS} segundos`);
  }
}

function oneOf(
  value: unknown,
  options: readonly string[],
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  if (typeof value !== 'string' || !options.includes(value)) {
    fail(at, `"${String(value)}" no es válido; usa ${options.join(', ')}`);
  }
}

function mainDuration(
  activity: Item,
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  const duration = activity.durationMin;
  if (!isObject(duration)) {
    fail(`${at} → durationMin`, 'debe ser { "min": minutos, "max": minutos }');
    return;
  }
  integerIn(duration.min, MAIN_MINUTES, 'minutos', `${at} → durationMin.min`, fail);
  integerIn(duration.max, MAIN_MINUTES, 'minutos', `${at} → durationMin.max`, fail);
  const { min, max } = duration;
  if (typeof min === 'number' && typeof max === 'number' && min > max) {
    fail(`${at} → durationMin`, `min (${min}) es mayor que max (${max})`);
  }
  const short = activity.shortVersionMin;
  if (short === undefined) return;
  if (typeof short !== 'number' || !Number.isInteger(short)) {
    fail(`${at} → shortVersionMin`, 'debe ser un número entero de minutos');
  } else if (typeof min === 'number' && typeof max === 'number' && (short < min || short >= max)) {
    fail(
      `${at} → shortVersionMin`,
      `${short} debe estar entre min (${min}) y max (${max}), sin llegar a max`,
    );
  }
}

function optionalIcon(
  value: unknown,
  at: string,
  fail: (where: string, problem: string) => void,
): void {
  if (value !== undefined && (typeof value !== 'string' || value === '')) {
    fail(`${at} → icon`, 'debe ser el nombre de un icono');
  }
}

// ---------- Helpers ----------

function label(section: string, index: number, item: Item): string {
  return typeof item.id === 'string' && item.id !== ''
    ? `${section}[${index}] "${item.id}"`
    : `${section}[${index}]`;
}

function isObject(value: unknown): value is Item {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}
