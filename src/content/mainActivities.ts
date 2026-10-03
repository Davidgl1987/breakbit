import type { MainActivity } from '@/domain/types';
import { l } from './localized';

/**
 * Daily main activities ("misión principal"), 5–30 minutes. Sources:
 * breakbit_mvp_v1.md §11–12 and the backlog §12 examples. Equipment work is grouped
 * into short, easy blocks rather than training sessions.
 */
export const MAIN_ACTIVITIES: MainActivity[] = [
  {
    id: 'walk_outside',
    name: l('Paseo por la calle', 'Walk outside'),
    description: l('Sal a caminar a un ritmo cómodo.', 'Head out for a walk at an easy pace.'),
    steps: [
      l('Sal a la calle a un ritmo cómodo.', 'Head outside at a comfortable pace.'),
      l(
        'Deja el móvil en el bolsillo y mira a lo lejos de vez en cuando.',
        'Keep your phone in your pocket and look into the distance now and then.',
      ),
      l('Vuelve cuando se cumpla el tiempo.', 'Come back when the time is up.'),
    ],
    equipment: [],
    durationMin: { min: 10, max: 30 },
    completionMode: 'continuous',
    slots: ['break'],
    whileWorking: false,
  },
  {
    id: 'walk_indoors',
    name: l('Paseo por casa u oficina', 'Indoor walk'),
    description: l(
      'Una vuelta tranquila si no puedes salir.',
      "An easy walk around when you can't go outside.",
    ),
    steps: [
      l('Levántate y camina sin rumbo fijo.', 'Get up and walk around without a set route.'),
      l(
        'Aprovecha para subir y bajar escaleras si las tienes cerca.',
        'Take the stairs if there are some nearby.',
      ),
    ],
    equipment: [],
    durationMin: { min: 5, max: 10 },
    completionMode: 'continuous',
    slots: ['break', 'work'],
    whileWorking: false,
  },
  {
    id: 'walking_meeting',
    name: l('Reunión caminando', 'Walking meeting'),
    description: l(
      'Haz una reunión sin cámara mientras caminas.',
      'Take a camera-off meeting on foot.',
    ),
    steps: [
      l(
        'Elige una reunión en la que no necesites la cámara.',
        "Pick a meeting where you don't need your camera.",
      ),
      l('Conéctate con auriculares y sal a caminar.', 'Join with headphones and start walking.'),
    ],
    equipment: [],
    durationMin: { min: 10, max: 30 },
    completionMode: 'continuous',
    slots: ['meeting'],
    whileWorking: true,
  },
  {
    id: 'mobility_routine',
    name: l('Mini rutina de movilidad', 'Mini mobility routine'),
    description: l(
      'Cuello, hombros, espalda y marcha suave en 5 minutos.',
      'Neck, shoulders, back and gentle marching in 5 minutes.',
    ),
    steps: [
      l('Sigue los movimientos guiados uno a uno.', 'Follow the guided movements one by one.'),
      l('Muévete despacio y sin forzar.', 'Move slowly and without forcing anything.'),
    ],
    equipment: [],
    durationMin: { min: 5, max: 5 },
    completionMode: 'continuous',
    slots: ['break', 'work'],
    whileWorking: false,
    routineId: 'mobility_5',
  },
  {
    id: 'standing_work',
    name: l('Trabajo de pie', 'Standing work'),
    description: l(
      'Trabaja de pie durante un bloque planificado.',
      'Work standing up for a planned block.',
    ),
    steps: [
      l('Sube el escritorio a la altura de los codos.', 'Raise your desk to elbow height.'),
      l(
        'Trabaja de pie; puedes repartirlo en varios bloques.',
        'Work standing; you can split it into several blocks.',
      ),
      l(
        'Cambia el peso de pie de vez en cuando.',
        'Shift your weight from foot to foot now and then.',
      ),
    ],
    equipment: ['standing_desk'],
    durationMin: { min: 10, max: 30 },
    completionMode: 'accumulated',
    slots: ['work', 'meeting'],
    whileWorking: true,
  },
  {
    id: 'pullup_block',
    name: l('Bloque de barra', 'Pull-up bar block'),
    description: l(
      'Colgados y activación de escápulas en tandas cortas.',
      'Hangs and shoulder-blade work in short sets.',
    ),
    steps: [
      l(
        'Cuélgate de la barra 10–30 segundos, con los pies apoyados si lo necesitas.',
        'Hang from the bar for 10–30 seconds, feet down if you need to.',
      ),
      l(
        'Haz unas retracciones escapulares sin doblar los codos.',
        'Do a few scapular pulls without bending your elbows.',
      ),
      l(
        'Si te apetece, alguna dominada asistida o negativa, sin buscar fatiga.',
        'If you like, add a few assisted or negative pull-ups, without chasing fatigue.',
      ),
      l('Descansa entre tandas.', 'Rest between sets.'),
    ],
    equipment: ['pullup_bar'],
    durationMin: { min: 5, max: 10 },
    completionMode: 'accumulated',
    slots: ['break'],
    whileWorking: false,
  },
  {
    id: 'dumbbell_block',
    name: l('Mini bloque con mancuernas', 'Dumbbell mini block'),
    description: l(
      'Paseo del granjero, remo ligero y bisagra, sin prisa.',
      'Farmer walk, light rows and hinges, at an easy pace.',
    ),
    steps: [
      l(
        'Camina 1 minuto con una mancuerna en cada mano.',
        'Walk for 1 minute with a dumbbell in each hand.',
      ),
      l('Haz unos remos ligeros por lado.', 'Do a few light rows per side.'),
      l(
        'Haz unas bisagras de cadera con la espalda recta.',
        'Do a few hip hinges with a straight back.',
      ),
      l('Repite la vuelta si te queda tiempo.', 'Repeat the round if you have time.'),
    ],
    equipment: ['dumbbells'],
    durationMin: { min: 5, max: 10 },
    completionMode: 'continuous',
    slots: ['break'],
    whileWorking: false,
  },
  {
    id: 'kettlebell_block',
    name: l('Mini bloque con kettlebell', 'Kettlebell mini block'),
    description: l(
      'Peso muerto, sentadilla goblet y paseo con la kettlebell.',
      'Deadlifts, goblet squats and a suitcase carry.',
    ),
    steps: [
      l(
        'Levanta la kettlebell del suelo con una bisagra de cadera controlada.',
        'Lift the kettlebell from the floor with a controlled hip hinge.',
      ),
      l(
        'Haz unas sentadillas cómodas con la kettlebell al pecho.',
        'Do a few comfortable squats holding the kettlebell at your chest.',
      ),
      l(
        'Camina despacio con la kettlebell a un lado y cambia de mano.',
        'Walk slowly with the kettlebell at one side, then switch hands.',
      ),
    ],
    equipment: ['kettlebell'],
    durationMin: { min: 5, max: 10 },
    completionMode: 'continuous',
    slots: ['break'],
    whileWorking: false,
  },
  {
    id: 'mat_mobility',
    name: l('Movilidad en esterilla', 'Mat mobility'),
    description: l(
      'Secuencia suave de espalda, cadera y hombros en el suelo.',
      'A gentle floor sequence for back, hips and shoulders.',
    ),
    steps: [
      l('Empieza con gato-vaca a cuatro apoyos.', 'Start with cat-cow on all fours.'),
      l('Pasa a la postura del niño y respira.', "Move into child's pose and breathe."),
      l(
        'Sigue con el estiramiento de cadera en zancada y el puente de glúteos.',
        'Continue with the kneeling hip stretch and glute bridges.',
      ),
    ],
    equipment: ['mat'],
    durationMin: { min: 5, max: 10 },
    completionMode: 'continuous',
    slots: ['break'],
    whileWorking: false,
  },
];
