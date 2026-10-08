import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { PAUSE_SIZE } from '@/domain/config';
import {
  formatCatalogIssues,
  PAUSE_ROUTINE_MAX_SEC,
  validateCatalog,
  type CatalogIssue,
} from './validateCatalog';

const FILE = fileURLToPath(new URL('./catalogo-breakbit.json', import.meta.url));
type Section = 'areas' | 'equipment' | 'exercises' | 'routines' | 'mainActivities';
// Loose on purpose: the tests break the catalog in ways its types wouldn't allow.
type RawCatalog = Record<Section, any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
const raw = () => JSON.parse(readFileSync(FILE, 'utf8')) as RawCatalog;

/** A copy of the real catalog with one change, to check each rule fails on its own. */
function broken(change: (data: RawCatalog) => void): CatalogIssue[] {
  const data = raw();
  change(data);
  return validateCatalog(data);
}

const problems = (issues: CatalogIssue[]) =>
  issues.map((issue) => `${issue.where}: ${issue.problem}`);

describe('the bundled catalog', () => {
  it('passes every check', () => {
    const issues = validateCatalog(raw());
    expect(issues, formatCatalogIssues(issues)).toEqual([]);
  });

  it('is what the app uses, untouched', () => {
    expect(CATALOG).toEqual(raw());
  });
});

describe('validateCatalog', () => {
  it('names the item and field of each problem', () => {
    const issues = broken((data) => {
      data.exercises[0].durationSec = 130;
    });
    expect(problems(issues)).toEqual([
      'exercises[0] "chin_tuck" → durationSec: 130 no vale: cada ejercicio dura 60 segundos',
    ]);
  });

  it('rejects repeated ids within a section', () => {
    const issues = broken((data) => {
      data.exercises[1].id = data.exercises[0].id;
    });
    expect(problems(issues)).toContainEqual(
      'exercises[1] → id: "chin_tuck" está repetido en exercises',
    );
  });

  it('allows the same id in different sections', () => {
    const issues = broken((data) => {
      data.routines[0].id = data.exercises[0].id;
    });
    expect(issues).toEqual([]);
  });

  it('checks references to areas, equipment, exercises and routines', () => {
    const issues = broken((data) => {
      data.exercises[0].areas = ['sedentary'];
      data.exercises[1].equipment = ['treadmill'];
      data.routines[0].steps[0].exercise = 'trunk_twist';
      data.mainActivities[0].routine = 'nope';
    });
    expect(problems(issues)).toEqual(
      expect.arrayContaining([
        'exercises[0] "chin_tuck" → areas: "sedentary" no existe en areas',
        'exercises[1] "neck_rotation" → equipment: "treadmill" no existe en equipment',
        'routines[0] "wake_up" → steps[0] → exercise: "trunk_twist" no existe en exercises',
        'mainActivities[0] "walk_outside" → routine: "nope" no existe en routines',
      ]),
    );
  });

  it('needs every text in Spanish and English', () => {
    const issues = broken((data) => {
      data.areas[0].name = { es: 'Cuello', en: ' ' };
      data.exercises[0].steps[1] = { es: 'Paso' };
    });
    expect(problems(issues)).toEqual(
      expect.arrayContaining([
        'areas[0] "neck" → name: falta el texto en inglés (en)',
        'exercises[0] "chin_tuck" → steps[1]: falta el texto en inglés (en)',
      ]),
    );
  });

  it('gives a main activity a long routine of its own that fits it whole', () => {
    expect(PAUSE_ROUTINE_MAX_SEC).toBe(PAUSE_SIZE.activeMaxSec);
    const issues = broken((data) => {
      data.mainActivities.find((item) => item.id === 'band_block').routine = 'band_upper_reset';
      // One more minute than the 5-minute activity.
      data.routines
        .find((item) => item.id === 'mobility_5')
        .steps.push({ exercise: 'march', seconds: 60 });
    });
    expect(problems(issues)).toEqual([
      'mainActivities[3] "mobility_routine" → routine: "mobility_5" dura 6 min y no cabe entera en los 5 min de la actividad',
      'mainActivities[5] "band_block" → routine: "band_upper_reset" es una rutina de pausa (hasta 3 minutos): un bloque necesita una rutina propia más larga',
    ]);
  });

  it('times every step of a routine at one minute too', () => {
    const issues = broken((data) => {
      data.routines[0].steps[0].seconds = 45;
    });
    expect(problems(issues)).toEqual([
      'routines[0] "wake_up" → steps[0] → seconds: 45 no vale: cada ejercicio dura 60 segundos',
    ]);
  });

  it('keeps every exercise at one minute, with two steps, a valid posture and meeting fit', () => {
    const issues = broken((data) => {
      data.exercises[0].durationSec = 10;
      data.exercises[1].steps = data.exercises[1].steps.slice(0, 1);
      data.exercises[2].posture = 'seated';
      data.exercises[3].meetingFriendly = 'maybe';
    });
    expect(problems(issues)).toEqual(
      expect.arrayContaining([
        'exercises[0] "chin_tuck" → durationSec: 10 no vale: cada ejercicio dura 60 segundos',
        'exercises[1] "neck_rotation" → steps: debe ser una lista con al menos 2 pasos',
        'exercises[2] "neck_side_tilt" → posture: "seated" no es válido; usa standing, either, floor',
        'exercises[3] "neck_isometrics" → meetingFriendly: "maybe" no es válido; usa yes, partial, no',
      ]),
    );
  });

  it('keeps main activities between 5 and 30 minutes, with a short version inside the range', () => {
    const issues = broken((data) => {
      data.mainActivities[0].durationMin = { min: 10, max: 45 };
      data.mainActivities[1].durationMin = { min: 3, max: 10 };
      data.mainActivities[4].shortVersionMin = 30;
    });
    expect(problems(issues)).toEqual(
      expect.arrayContaining([
        'mainActivities[0] "walk_outside" → durationMin.max: 45 está fuera de 5–30 minutos',
        'mainActivities[1] "walk_indoors" → durationMin.min: 3 está fuera de 5–30 minutos',
        'mainActivities[4] "standing_work" → shortVersionMin: 30 debe estar entre min (10) y max (30), sin llegar a max',
      ]),
    );
  });

  it('flags unknown fields, such as a typo or a retired flag', () => {
    const issues = broken((data) => {
      data.exercises[0].retired = true;
      data.exercises[1].meetingFriendy = 'yes';
    });
    expect(problems(issues)).toEqual(
      expect.arrayContaining([
        'exercises[0] "chin_tuck" → retired: campo desconocido',
        'exercises[1] "neck_rotation" → meetingFriendy: campo desconocido',
      ]),
    );
  });

  it('avoids medical language', () => {
    const issues = broken((data) => {
      data.exercises[0].description.es = 'Alivia el dolor de cuello.';
    });
    expect(problems(issues)).toEqual([
      'exercises[0] "chin_tuck": usa lenguaje médico ("dolor"); Breakbit no promete salud',
    ]);
  });

  it('needs every equipment to be used somewhere', () => {
    const issues = broken((data) => {
      data.equipment.push({
        id: 'foam_roller',
        name: { es: 'Rodillo', en: 'Foam roller' },
        hint: { es: 'Añade masaje', en: 'Adds massage' },
      });
    });
    expect(problems(issues)).toEqual([
      'equipment "foam_roller": no se usa en ningún ejercicio ni actividad',
    ]);
  });

  it('needs enough gear-free exercises in every area to plan a day without equipment', () => {
    const issues = broken((data) => {
      data.areas.push({ id: 'feet', name: { es: 'Pies', en: 'Feet' } });
      data.exercises[0].areas = ['neck', 'feet'];
    });
    expect(problems(issues)).toEqual([
      'areas "feet": necesita al menos 2 ejercicios sin material y tiene 1',
    ]);
  });

  it('needs a gear-free move that suits the desk and meetings in every area', () => {
    const issues = broken((data) => {
      for (const exercise of data.exercises) {
        if (exercise.areas.includes('eyes')) exercise.meetingFriendly = 'no';
      }
    });
    expect(problems(issues)).toEqual([
      'areas "eyes": necesita un ejercicio sin material, que no sea de suelo y apto para reuniones',
    ]);
  });

  it('reads as a list for the build error', () => {
    expect(
      formatCatalogIssues([
        { where: 'exercises[0] "a"', problem: 'uno' },
        { where: 'areas', problem: 'dos' },
      ]),
    ).toBe(
      'El catálogo de contenido tiene 2 problemas:\n  • exercises[0] "a": uno\n  • areas: dos',
    );
  });
});
