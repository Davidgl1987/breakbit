import type { Localized } from '@/domain/types';

export interface ExerciseGuideFrame {
  src: string;
  description: Localized;
  durationMs: number;
  cue?: 'horizontal' | 'vertical' | 'circles' | 'near' | 'far';
  gazeLine?: { from: readonly [number, number]; to: readonly [number, number] };
}

export interface ExerciseGuide {
  frames: readonly ExerciseGuideFrame[];
  sequence: readonly number[];
}

/** The phase-5 demonstration avatar, without headphones, for guides awaiting art. */
export const EXERCISE_AVATAR = `${import.meta.env.BASE_URL}exercises/avatar.png`;

const frame = (
  exercise: string,
  number: number,
  description: Localized,
  durationMs = 2200,
  cue?: ExerciseGuideFrame['cue'],
  gazeLine?: ExerciseGuideFrame['gazeLine'],
): ExerciseGuideFrame => ({
  src: `${import.meta.env.BASE_URL}exercises/${exercise}/${String(number).padStart(2, '0')}.png`,
  description,
  durationMs,
  ...(cue ? { cue } : {}),
  ...(gazeLine ? { gazeLine } : {}),
});

/** Separate frames keep the guide pausable and allow later three-pose sequences. */
export const EXERCISE_GUIDES: Partial<Record<string, ExerciseGuide>> = {
  kettlebell_goblet_march: {
    frames: [
      frame(
        'kettlebell_goblet_march',
        1,
        {
          es: 'Sujeta la kettlebell al pecho, ponte erguido y activa suavemente el abdomen.',
          en: 'Hold the kettlebell at your chest, stand tall and gently brace your core.',
        },
        1800,
      ),
      frame(
        'kettlebell_goblet_march',
        2,
        {
          es: 'Eleva una rodilla manteniendo el cuerpo estable.',
          en: 'Lift one knee while keeping your body stable.',
        },
        2300,
      ),
      frame(
        'kettlebell_goblet_march',
        3,
        {
          es: 'Baja esa pierna y eleva la otra, sin balancearte.',
          en: 'Lower that leg and lift the other, without swaying.',
        },
        2300,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  kettlebell_shoulder_press: {
    frames: [
      frame(
        'kettlebell_shoulder_press',
        1,
        {
          es: 'Sujeta la kettlebell a la altura de un hombro.',
          en: 'Hold the kettlebell at one shoulder.',
        },
        2500,
      ),
      frame(
        'kettlebell_shoulder_press',
        2,
        {
          es: 'Empújala hacia arriba sin arquear la espalda. Baja despacio y cambia de brazo.',
          en: 'Press it overhead without arching your back. Lower slowly and switch arms.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  kettlebell_swing: {
    frames: [
      frame(
        'kettlebell_swing',
        1,
        {
          es: 'Lleva la cadera atrás y deja que la kettlebell pase entre las piernas.',
          en: 'Push your hips back and let the kettlebell travel between your legs.',
        },
        2200,
      ),
      frame(
        'kettlebell_swing',
        2,
        {
          es: 'Empuja la cadera hacia delante para hacerla subir. Deja que vuelva y repite con control.',
          en: 'Drive your hips forward to send it upward. Let it return and repeat with control.',
        },
        2200,
      ),
    ],
    sequence: [0, 1],
  },
  kettlebell_rotational_swing: {
    frames: [
      frame(
        'kettlebell_rotational_swing',
        1,
        {
          es: 'Sujeta la kettlebell con ambas manos delante del cuerpo.',
          en: 'Hold the kettlebell with both hands in front of your body.',
        },
        1600,
      ),
      frame(
        'kettlebell_rotational_swing',
        2,
        {
          es: 'Llévala hacia un lado acompañando con cadera, tronco y pies.',
          en: 'Move it toward one side, allowing your hips, torso and feet to follow.',
        },
        2300,
      ),
      frame(
        'kettlebell_rotational_swing',
        3,
        {
          es: 'Impulsa el movimiento hacia el otro lado y alterna de forma fluida.',
          en: 'Drive the movement to the other side and alternate smoothly.',
        },
        2300,
      ),
    ],
    sequence: [1, 0, 2, 0],
  },
  kettlebell_lateral_lunge: {
    frames: [
      frame(
        'kettlebell_lateral_lunge',
        1,
        {
          es: 'Sujeta la kettlebell al pecho con ambas manos.',
          en: 'Hold the kettlebell at your chest with both hands.',
        },
        1800,
      ),
      frame(
        'kettlebell_lateral_lunge',
        2,
        {
          es: 'Da un paso amplio a un lado, flexiona esa rodilla y lleva la cadera atrás.',
          en: 'Take a wide step to one side, bend that knee and push your hips back.',
        },
        2500,
      ),
      frame(
        'kettlebell_lateral_lunge',
        3,
        {
          es: 'Vuelve al centro y repite hacia el otro lado.',
          en: 'Return to center and repeat to the other side.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },

  kettlebell_halo: {
    frames: [
      frame(
        'kettlebell_halo',
        1,
        {
          es: 'Sujeta la kettlebell por el asa, boca abajo, delante del pecho.',
          en: 'Hold the kettlebell by the handle, upside down, at chest height.',
        },
        2200,
      ),
      frame(
        'kettlebell_halo',
        2,
        {
          es: 'Llévala hacia un lado de la cabeza, despacio y cerca del cuerpo.',
          en: 'Move it toward one side of your head, slowly and close to your body.',
        },
        2500,
      ),
      frame(
        'kettlebell_halo',
        3,
        {
          es: 'Continúa por detrás y completa el círculo. Haz 4–6 vueltas en cada sentido.',
          en: 'Continue behind your head and complete the circle. Do 4–6 circles each way.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 2, 1],
  },
  kettlebell_deadlift: {
    frames: [
      frame(
        'kettlebell_deadlift',
        1,
        {
          es: 'Con la kettlebell entre los pies, lleva la cadera atrás y agarra el asa.',
          en: 'With the kettlebell between your feet, push your hips back and grip the handle.',
        },
        2500,
      ),
      frame(
        'kettlebell_deadlift',
        2,
        {
          es: 'Ponte de pie empujando el suelo y extendiendo la cadera. Baja con control y repite unas 8 veces.',
          en: 'Stand by pushing through the floor and extending your hips. Lower with control and repeat about 8 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  goblet_squat_light: {
    frames: [
      frame(
        'goblet_squat_light',
        1,
        {
          es: 'Sujeta la kettlebell delante del pecho con ambas manos.',
          en: 'Hold the kettlebell in front of your chest with both hands.',
        },
        2500,
      ),
      frame(
        'goblet_squat_light',
        2,
        {
          es: 'Baja la cadera como si fueras a sentarte. Vuelve arriba con control y repite unas 8 veces.',
          en: 'Lower your hips as if sitting down. Stand back up with control and repeat about 8 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  kettlebell_row: {
    frames: [
      frame(
        'kettlebell_row',
        1,
        {
          es: 'Apoya una mano e inclina el tronco con la espalda recta.',
          en: 'Rest one hand on a support and lean forward with a straight back.',
        },
        2500,
      ),
      frame(
        'kettlebell_row',
        2,
        {
          es: 'Lleva la kettlebell hacia la cadera juntando el omóplato. Baja despacio y cambia de lado.',
          en: 'Pull the kettlebell toward your hip while squeezing your shoulder blade. Lower slowly and switch sides.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  kettlebell_around_body: {
    frames: [
      frame(
        'kettlebell_around_body',
        1,
        {
          es: 'Sujeta la kettlebell con una mano delante del cuerpo.',
          en: 'Hold the kettlebell with one hand in front of your body.',
        },
        2500,
      ),
      frame(
        'kettlebell_around_body',
        2,
        {
          es: 'Pásala por detrás y recógela con la otra mano. Completa varias vueltas y cambia de sentido.',
          en: 'Pass it behind your back and take it with the other hand. Complete several circles, then switch direction.',
        },
        2800,
      ),
    ],
    sequence: [0, 1],
  },

  dumbbell_romanian_deadlift: {
    frames: [
      frame(
        'dumbbell_romanian_deadlift',
        1,
        {
          es: 'Ponte de pie con una mancuerna en cada mano.',
          en: 'Stand with a dumbbell in each hand.',
        },
        2500,
      ),
      frame(
        'dumbbell_romanian_deadlift',
        2,
        {
          es: 'Lleva la cadera atrás con la espalda recta y baja las mancuernas cerca de las piernas. Vuelve arriba.',
          en: 'Push your hips back with a straight back and lower the dumbbells close to your legs. Stand back up.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  dumbbell_reverse_fly: {
    frames: [
      frame(
        'dumbbell_reverse_fly',
        1,
        {
          es: 'Inclina el tronco con la espalda recta y las rodillas ligeramente flexionadas.',
          en: 'Lean forward with a straight back and slightly bent knees.',
        },
        2500,
      ),
      frame(
        'dumbbell_reverse_fly',
        2,
        {
          es: 'Abre los brazos hacia los lados, junta los omóplatos y baja lentamente.',
          en: 'Open your arms out to the sides, squeeze your shoulder blades and lower slowly.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  dumbbell_y_raise: {
    frames: [
      frame(
        'dumbbell_y_raise',
        1,
        {
          es: 'Inclina ligeramente el tronco y deja las mancuernas delante de ti.',
          en: 'Lean slightly forward and hold the dumbbells in front of you.',
        },
        2500,
      ),
      frame(
        'dumbbell_y_raise',
        2,
        {
          es: 'Eleva los brazos en diagonal formando una Y. Baja sin encoger los hombros.',
          en: 'Raise your arms diagonally to form a Y. Lower without shrugging your shoulders.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  dumbbell_shrug: {
    frames: [
      frame(
        'dumbbell_shrug',
        1,
        {
          es: 'De pie, deja los brazos relajados con una mancuerna en cada mano.',
          en: 'Stand with your arms relaxed and a dumbbell in each hand.',
        },
        2200,
      ),
      frame(
        'dumbbell_shrug',
        2,
        {
          es: 'Sube ambos hombros hacia las orejas, aguanta un segundo y baja despacio.',
          en: 'Lift both shoulders toward your ears, hold for one second and lower slowly.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  dumbbell_high_row: {
    frames: [
      frame(
        'dumbbell_high_row',
        1,
        {
          es: 'Inclina un poco el tronco hacia delante con la espalda recta.',
          en: 'Lean slightly forward with a straight back.',
        },
        2500,
      ),
      frame(
        'dumbbell_high_row',
        2,
        {
          es: 'Lleva los codos atrás y hacia fuera, subiendo las mancuernas hacia la parte alta del pecho. Baja despacio.',
          en: 'Drive your elbows back and outward, bringing the dumbbells toward your upper chest. Lower slowly.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },

  dumbbell_row_light: {
    frames: [
      frame(
        'dumbbell_row_light',
        1,
        {
          es: 'Apoya una mano e inclina el tronco con la espalda recta.',
          en: 'Rest one hand on a support and lean forward with a straight back.',
        },
        2500,
      ),
      frame(
        'dumbbell_row_light',
        2,
        {
          es: 'Lleva la mancuerna hacia la cadera. Baja con control y cambia de lado.',
          en: 'Pull the dumbbell toward your hip. Lower with control and switch sides.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  farmer_walk: {
    frames: [
      frame(
        'farmer_walk',
        1,
        {
          es: 'Ponte erguido con una mancuerna en cada mano y los hombros relajados.',
          en: 'Stand tall with a dumbbell in each hand and relaxed shoulders.',
        },
        1500,
      ),
      frame(
        'farmer_walk',
        2,
        { es: 'Camina despacio con un paso cómodo.', en: 'Walk slowly with a comfortable step.' },
        1800,
      ),
      frame(
        'farmer_walk',
        3,
        {
          es: 'Alterna el paso manteniendo el cuerpo erguido y vuelve al punto de inicio.',
          en: 'Alternate your steps, staying upright, and return to your starting point.',
        },
        1800,
      ),
    ],
    sequence: [1, 0, 2, 0],
  },
  dumbbell_lateral_raise: {
    frames: [
      frame(
        'dumbbell_lateral_raise',
        1,
        {
          es: 'De pie, sujeta una mancuerna ligera en cada mano.',
          en: 'Stand with a light dumbbell in each hand.',
        },
        2500,
      ),
      frame(
        'dumbbell_lateral_raise',
        2,
        {
          es: 'Eleva los brazos hacia los lados hasta la altura de los hombros. Baja lentamente.',
          en: 'Raise your arms out to the sides to shoulder height. Lower slowly.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  dumbbell_hammer_curl: {
    frames: [
      frame(
        'dumbbell_hammer_curl',
        1,
        {
          es: 'Sujeta las mancuernas con las palmas mirando hacia dentro.',
          en: 'Hold the dumbbells with your palms facing inward.',
        },
        1800,
      ),
      frame(
        'dumbbell_hammer_curl',
        2,
        {
          es: 'Sube una mancuerna hacia el hombro sin adelantar el codo.',
          en: 'Curl one dumbbell toward your shoulder without letting the elbow drift forward.',
        },
        2500,
      ),
      frame(
        'dumbbell_hammer_curl',
        3,
        {
          es: 'Baja despacio y alterna con el otro brazo.',
          en: 'Lower slowly and alternate with the other arm.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  dumbbell_shoulder_press: {
    frames: [
      frame(
        'dumbbell_shoulder_press',
        1,
        {
          es: 'Sostén las mancuernas a la altura de los hombros.',
          en: 'Hold the dumbbells at shoulder height.',
        },
        2500,
      ),
      frame(
        'dumbbell_shoulder_press',
        2,
        {
          es: 'Empuja ambas hacia arriba sin arquear la espalda. Baja con control.',
          en: 'Press both overhead without arching your back. Lower with control.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },

  band_lateral_walk: {
    frames: [
      frame(
        'band_lateral_walk',
        1,
        {
          es: 'Flexiona ligeramente las rodillas, con la banda por encima de ellas.',
          en: 'Slightly bend your knees, with the band above them.',
        },
        1800,
      ),
      frame(
        'band_lateral_walk',
        2,
        {
          es: 'Da un paso lateral manteniendo tensión en la banda.',
          en: 'Take a lateral step while keeping tension in the band.',
        },
        2200,
      ),
      frame(
        'band_lateral_walk',
        3,
        {
          es: 'Vuelve hacia el otro lado sin juntar del todo los pies.',
          en: 'Return in the other direction without bringing your feet fully together.',
        },
        2200,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  band_hip_abduction: {
    frames: [
      frame(
        'band_hip_abduction',
        1,
        {
          es: 'De pie, coloca la banda alrededor de los muslos y apóyate suavemente.',
          en: 'Stand with the band around your thighs and use light support.',
        },
        2200,
      ),
      frame(
        'band_hip_abduction',
        2,
        {
          es: 'Lleva una pierna hacia un lado. Vuelve despacio y cambia de pierna.',
          en: 'Move one leg out to the side. Return slowly and switch legs.',
        },
        2600,
      ),
    ],
    sequence: [0, 1],
  },
  band_glute_kickback: {
    frames: [
      frame(
        'band_glute_kickback',
        1,
        {
          es: 'Coloca la banda alrededor de los tobillos y mantén el tronco recto.',
          en: 'Place the band around your ankles and keep your torso upright.',
        },
        2200,
      ),
      frame(
        'band_glute_kickback',
        2,
        {
          es: 'Lleva una pierna hacia atrás. Aprieta el glúteo, vuelve despacio y cambia de pierna.',
          en: 'Move one leg backward. Squeeze the glute, return slowly and switch legs.',
        },
        2600,
      ),
    ],
    sequence: [0, 1],
  },
  band_overhead_press: {
    frames: [
      frame(
        'band_overhead_press',
        1,
        {
          es: 'Pisa el centro de la banda y sujeta los extremos a la altura de los hombros.',
          en: 'Stand on the middle of the band and hold the ends at shoulder height.',
        },
        2500,
      ),
      frame(
        'band_overhead_press',
        2,
        {
          es: 'Empuja las manos hacia arriba hasta estirar los brazos. Baja despacio.',
          en: 'Press your hands overhead until your arms are extended. Lower slowly.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  band_pulldown: {
    frames: [
      frame(
        'band_pulldown',
        1,
        {
          es: 'Con la banda anclada en un punto alto, sujeta los extremos con los brazos arriba.',
          en: 'With the band anchored at a high point, hold the ends with your arms overhead.',
        },
        2500,
      ),
      frame(
        'band_pulldown',
        2,
        {
          es: 'Tira hacia abajo llevando los codos a los costados. Vuelve lentamente y repite.',
          en: 'Pull down, driving your elbows toward your sides. Return slowly and repeat.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },

  band_pull_apart: {
    frames: [
      frame(
        'band_pull_apart',
        1,
        {
          es: 'Sujeta la banda al frente con los brazos estirados.',
          en: 'Hold the band in front of you with straight arms.',
        },
        2500,
      ),
      frame(
        'band_pull_apart',
        2,
        {
          es: 'Abre los brazos hasta acercar la banda al pecho. Vuelve despacio y repite 10–15 veces.',
          en: 'Open your arms until the band approaches your chest. Return slowly and repeat 10–15 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  band_external_rotation: {
    frames: [
      frame(
        'band_external_rotation',
        1,
        {
          es: 'Sujeta la banda con los codos doblados y pegados al cuerpo.',
          en: 'Hold the band with your elbows bent and close to your body.',
        },
        2500,
      ),
      frame(
        'band_external_rotation',
        2,
        {
          es: 'Separa las manos sin despegar los codos. Vuelve despacio y repite 10–15 veces.',
          en: 'Move your hands apart without moving your elbows. Return slowly and repeat 10–15 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  band_row: {
    frames: [
      frame(
        'band_row',
        1,
        {
          es: 'Con la banda anclada delante, extiende los brazos.',
          en: 'With the band anchored in front of you, extend your arms.',
        },
        2500,
      ),
      frame(
        'band_row',
        2,
        {
          es: 'Tira hacia el cuerpo llevando los codos atrás. Vuelve con control y repite 10–15 veces.',
          en: 'Pull toward your body, driving your elbows back. Return with control and repeat 10–15 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  band_face_pull: {
    frames: [
      frame(
        'band_face_pull',
        1,
        {
          es: 'Ancla la banda delante de ti a la altura de la cara y extiende los brazos.',
          en: 'Anchor the band in front of you at face height and extend your arms.',
        },
        2500,
      ),
      frame(
        'band_face_pull',
        2,
        {
          es: 'Tira hacia la cara llevando los codos atrás. Vuelve despacio y repite 10–12 veces.',
          en: 'Pull toward your face, driving your elbows back. Return slowly and repeat 10–12 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  band_pallof_press: {
    frames: [
      frame(
        'band_pallof_press',
        1,
        {
          es: 'Con la banda anclada a un lado, sujétala frente al pecho.',
          en: 'With the band anchored beside you, hold it at your chest.',
        },
        2500,
      ),
      frame(
        'band_pallof_press',
        2,
        {
          es: 'Aleja las manos del pecho sin girar el tronco. Vuelve y repite 8 veces antes de cambiar de lado.',
          en: 'Press your hands away without rotating your torso. Return and repeat 8 times before switching sides.',
        },
        3000,
      ),
    ],
    sequence: [0, 1],
  },
  thread_the_needle: {
    frames: [
      frame(
        'thread_the_needle',
        1,
        {
          es: 'Desde cuatro apoyos, abre un brazo hacia el techo y acompaña con la mirada.',
          en: 'From all fours, open one arm toward the ceiling and follow it with your gaze.',
        },
        3000,
      ),
      frame(
        'thread_the_needle',
        2,
        {
          es: 'Pasa ese brazo por debajo del otro y baja suavemente el hombro. Repite 5 veces y cambia de lado.',
          en: 'Reach that arm underneath the other and gently lower your shoulder. Repeat 5 times, then switch sides.',
        },
        3000,
      ),
    ],
    sequence: [0, 1],
  },
  dead_bug: {
    frames: [
      frame(
        'dead_bug',
        1,
        {
          es: 'Túmbate boca arriba, levanta los brazos y dobla las rodillas a 90°.',
          en: 'Lie on your back, raise your arms and bend your knees to 90°.',
        },
        1500,
      ),
      frame(
        'dead_bug',
        2,
        {
          es: 'Aleja el brazo derecho y la pierna izquierda manteniendo el tronco estable.',
          en: 'Reach your right arm and left leg away while keeping your torso steady.',
        },
        3000,
      ),
      frame(
        'dead_bug',
        3,
        {
          es: 'Vuelve al centro y aleja el brazo izquierdo y la pierna derecha. Haz unas 6 repeticiones por lado.',
          en: 'Return to center and reach your left arm and right leg away. Do about 6 repetitions per side.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  supine_lumbar_rotation: {
    frames: [
      frame(
        'supine_lumbar_rotation',
        1,
        {
          es: 'Túmbate boca arriba con las rodillas flexionadas y los hombros apoyados.',
          en: 'Lie on your back with your knees bent and shoulders resting on the mat.',
        },
        1500,
      ),
      frame(
        'supine_lumbar_rotation',
        2,
        {
          es: 'Deja caer suavemente las dos rodillas juntas hacia un lado. Vuelve al centro y repite al otro lado, con los hombros apoyados.',
          en: 'Gently let both knees fall together to one side. Return to center and repeat on the other side, keeping your shoulders on the mat.',
        },
        3000,
      ),
    ],
    sequence: [0, 1],
  },
  figure_four_stretch: {
    frames: [
      frame(
        'figure_four_stretch',
        1,
        {
          es: 'Boca arriba, apoya el tobillo izquierdo sobre la rodilla derecha.',
          en: 'Lie on your back and place your left ankle over your right knee.',
        },
        2500,
      ),
      frame(
        'figure_four_stretch',
        2,
        {
          es: 'Sujeta la pierna derecha y acércala suavemente al pecho. Mantén 20–30 segundos.',
          en: 'Hold your right leg and gently bring it toward your chest. Hold for 20–30 seconds.',
        },
        25000,
      ),
      frame(
        'figure_four_stretch',
        3,
        {
          es: 'Cambia de lado: tobillo derecho sobre rodilla izquierda y sujeta la pierna izquierda. Mantén 20–30 segundos.',
          en: 'Switch sides: right ankle over left knee, holding your left leg. Hold for 20–30 seconds.',
        },
        25000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  superman: {
    frames: [
      frame(
        'superman',
        1,
        {
          es: 'Túmbate boca abajo y extiende brazos y piernas sin forzar el cuello.',
          en: 'Lie face down and extend your arms and legs without straining your neck.',
        },
        2500,
      ),
      frame(
        'superman',
        2,
        {
          es: 'Eleva suavemente brazos, pecho y piernas unos centímetros. Mantén 1–2 segundos y baja con control.',
          en: 'Gently lift your arms, chest and legs a few centimeters. Hold for 1–2 seconds, then lower with control.',
        },
        1500,
      ),
    ],
    sequence: [0, 1],
  },
  cat_cow_mat: {
    frames: [
      frame(
        'cat_cow_mat',
        1,
        {
          es: 'Coloca las manos bajo los hombros y las rodillas bajo la cadera.',
          en: 'Place your hands under your shoulders and your knees under your hips.',
        },
        1500,
      ),
      frame(
        'cat_cow_mat',
        2,
        {
          es: 'Redondea la espalda mirando hacia el ombligo.',
          en: 'Round your back while looking toward your belly button.',
        },
        3000,
      ),
      frame(
        'cat_cow_mat',
        3,
        {
          es: 'Deja bajar un poco la espalda y mira al frente. Alterna unas 8 veces.',
          en: 'Let your back dip gently and look ahead. Alternate about 8 times.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  child_pose: {
    frames: [
      frame(
        'child_pose',
        1,
        {
          es: 'Empieza a cuatro apoyos sobre la esterilla.',
          en: 'Start on all fours on your mat.',
        },
        2500,
      ),
      frame(
        'child_pose',
        2,
        {
          es: 'Lleva la cadera hacia los talones, alarga los brazos y apoya la frente. Respira despacio durante 30–45 segundos.',
          en: 'Sit back toward your heels, reach your arms forward and rest your forehead. Breathe slowly for 30–45 seconds.',
        },
        40000,
      ),
    ],
    sequence: [0, 1],
  },
  glute_bridge: {
    frames: [
      frame(
        'glute_bridge',
        1,
        {
          es: 'Túmbate boca arriba, dobla las rodillas y apoya los pies y los brazos.',
          en: 'Lie on your back, bend your knees and rest your feet and arms on the mat.',
        },
        2500,
      ),
      frame(
        'glute_bridge',
        2,
        {
          es: 'Eleva la cadera apretando los glúteos y baja con control. Repite unas 10 veces.',
          en: 'Lift your hips while squeezing your glutes, then lower with control. Repeat about 10 times.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  bird_dog: {
    frames: [
      frame(
        'bird_dog',
        1,
        {
          es: 'Empieza a cuatro apoyos, con el tronco estable.',
          en: 'Start on all fours with your torso steady.',
        },
        1500,
      ),
      frame(
        'bird_dog',
        2,
        {
          es: 'Extiende el brazo derecho y la pierna izquierda sin girar el tronco.',
          en: 'Extend your right arm and left leg without rotating your torso.',
        },
        3000,
      ),
      frame(
        'bird_dog',
        3,
        {
          es: 'Vuelve al centro y extiende el brazo izquierdo y la pierna derecha. Haz unas 6 repeticiones por lado.',
          en: 'Return to center and extend your left arm and right leg. Do about 6 repetitions per side.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  cobra_soft: {
    frames: [
      frame(
        'cobra_soft',
        1,
        {
          es: 'Túmbate boca abajo y apoya las manos junto al pecho.',
          en: 'Lie face down and place your hands beside your chest.',
        },
        2500,
      ),
      frame(
        'cobra_soft',
        2,
        {
          es: 'Eleva suavemente el pecho manteniendo la pelvis apoyada. Baja despacio y repite sin forzar.',
          en: 'Gently lift your chest while keeping your pelvis on the mat. Lower slowly and repeat without forcing.',
        },
        2500,
      ),
    ],
    sequence: [0, 1],
  },
  wrist_mobility: {
    frames: [
      frame(
        'wrist_mobility',
        1,
        {
          es: 'Extiende los brazos. Añade también círculos suaves de muñeca en ambos sentidos.',
          en: 'Extend your arms. Also make gentle wrist circles in both directions.',
        },
        3000,
        'circles',
      ),
      frame(
        'wrist_mobility',
        2,
        {
          es: 'Lleva las manos hacia arriba despacio, sin mover los antebrazos.',
          en: 'Slowly bend your hands upward, keeping your forearms still.',
        },
        2000,
        'vertical',
      ),
      frame(
        'wrist_mobility',
        3,
        { es: 'Lleva las manos hacia abajo despacio.', en: 'Slowly bend your hands downward.' },
        2000,
        'vertical',
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  wrist_flexor_stretch: {
    frames: [
      frame(
        'wrist_flexor_stretch',
        1,
        {
          es: 'Extiende un brazo al frente con la palma hacia arriba.',
          en: 'Extend one arm forward with your palm facing up.',
        },
        2500,
      ),
      frame(
        'wrist_flexor_stretch',
        2,
        {
          es: 'Sujeta los dedos con la otra mano y llévalos suavemente hacia abajo. Mantén 20–30 segundos y cambia de brazo.',
          en: 'Grasp the fingers with your other hand and gently guide them downward. Hold for 20–30 seconds, then switch arms.',
        },
        25000,
      ),
    ],
    sequence: [0, 1],
  },
  wrist_extensor_stretch: {
    frames: [
      frame(
        'wrist_extensor_stretch',
        1,
        {
          es: 'Extiende un brazo al frente con la palma hacia abajo.',
          en: 'Extend one arm forward with your palm facing down.',
        },
        2500,
      ),
      frame(
        'wrist_extensor_stretch',
        2,
        {
          es: 'Flexiona la muñeca y acompaña suavemente con la otra mano. Mantén 20–30 segundos y cambia de brazo.',
          en: 'Bend your wrist and gently assist with your other hand. Hold for 20–30 seconds, then switch arms.',
        },
        25000,
      ),
    ],
    sequence: [0, 1],
  },
  finger_by_finger_stretch: {
    frames: [
      frame(
        'finger_by_finger_stretch',
        1,
        {
          es: 'Extiende una mano con la palma hacia arriba y sujeta un dedo con la otra.',
          en: 'Extend one hand palm up and hold one finger with your other hand.',
        },
        2000,
      ),
      frame(
        'finger_by_finger_stretch',
        2,
        {
          es: 'Lleva el dedo suavemente hacia abajo unos 30–40° durante unos 5 segundos, sin forzar. Sigue con los demás y cambia de mano.',
          en: 'Gently guide the finger downward about 30–40° for around 5 seconds, without forcing. Continue with the other fingers, then switch hands.',
        },
        5000,
      ),
    ],
    sequence: [0, 1],
  },
  far_gaze: {
    frames: [
      frame(
        'far_gaze',
        1,
        {
          es: 'Ponte de pie junto a una ventana y busca un punto lejano.',
          en: 'Stand by a window and find a distant point.',
        },
        1800,
      ),
      frame(
        'far_gaze',
        2,
        {
          es: 'Mira lejos durante 20–30 segundos y sigue apartado de la pantalla el resto del minuto, sin mirar el móvil.',
          en: 'Look into the distance for 20–30 seconds, then stay away from the screen for the rest of the minute, without checking your phone.',
        },
        60000,
      ),
    ],
    sequence: [0, 1],
  },
  eye_mobility: {
    frames: [
      frame(
        'eye_mobility',
        1,
        {
          es: 'Mantén la cabeza quieta y mira al frente.',
          en: 'Keep your head still and look straight ahead.',
        },
        1500,
      ),
      frame(
        'eye_mobility',
        2,
        {
          es: 'Mira lentamente a la izquierda y después a la derecha, sin mover la cabeza.',
          en: 'Slowly look left and then right without moving your head.',
        },
        4000,
        'horizontal',
      ),
      frame(
        'eye_mobility',
        3,
        {
          es: 'Después mira arriba y abajo. Repite sin forzar.',
          en: 'Then look up and down. Repeat without forcing.',
        },
        4000,
        'vertical',
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  near_far_focus: {
    frames: [
      frame(
        'near_far_focus',
        1,
        {
          es: 'De pie, mira el dedo situado a unos 25–30 cm de la cara durante 2–3 segundos.',
          en: 'Stand and look at the finger held about 25–30 cm from your face for 2–3 seconds.',
        },
        2500,
        undefined,
        { from: [45, 25], to: [58, 25] },
      ),
      frame(
        'near_far_focus',
        2,
        {
          es: 'Sin mover el dedo, mira un objeto lejano durante 2–3 segundos y sigue alternando.',
          en: 'Without moving your finger, look at a distant object for 2–3 seconds and keep alternating.',
        },
        2500,
        undefined,
        { from: [45, 25], to: [94, 22] },
      ),
    ],
    sequence: [0, 1],
  },
  chair_hamstring_stretch: {
    frames: [
      frame(
        'chair_hamstring_stretch',
        1,
        {
          es: 'Apoya el talón en la silla, con la pierna casi estirada y la espalda recta.',
          en: 'Place your heel on the chair with your leg almost straight and your back straight.',
        },
        2500,
      ),
      frame(
        'chair_hamstring_stretch',
        2,
        {
          es: 'Acerca el pecho a la pierna con la espalda recta. Mantén 20–30 segundos y cambia de lado.',
          en: 'Bring your chest toward the leg with your back straight. Hold for 20–30 seconds, then switch sides.',
        },
        25000,
      ),
    ],
    sequence: [0, 1],
  },
  kneeling_hip_rotation_stretch: {
    frames: [
      frame(
        'kneeling_hip_rotation_stretch',
        1,
        {
          es: 'Apoya una rodilla en el suelo y adelanta la otra pierna.',
          en: 'Place one knee on the floor and step the other leg forward.',
        },
        2000,
      ),
      frame(
        'kneeling_hip_rotation_stretch',
        2,
        {
          es: 'Lleva suavemente la pelvis hacia delante y las manos detrás de la cabeza, con el tronco alto.',
          en: 'Gently shift your pelvis forward and place your hands behind your head, keeping your torso tall.',
        },
        3000,
      ),
      frame(
        'kneeling_hip_rotation_stretch',
        3,
        {
          es: 'Gira hacia el lado de la rodilla adelantada. Mantén unos 30 segundos, vuelve y cambia de lado.',
          en: 'Rotate toward the front knee. Hold for about 30 seconds, return and switch sides.',
        },
        30000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  cross_knee_press: {
    frames: [
      frame(
        'cross_knee_press',
        1,
        {
          es: 'Presiona mano izquierda y rodilla derecha una contra otra durante 5 segundos, sin moverlas.',
          en: 'Press your left hand and right knee against each other for 5 seconds without moving them.',
        },
        5000,
      ),
      frame(
        'cross_knee_press',
        2,
        {
          es: 'Suelta y repite con la mano derecha y la rodilla izquierda durante 5 segundos.',
          en: 'Release and repeat with your right hand and left knee for 5 seconds.',
        },
        5000,
      ),
    ],
    sequence: [0, 1],
  },
  t_balance: {
    frames: [
      frame(
        't_balance',
        1,
        {
          es: 'Empieza de pie sobre una pierna.',
          en: 'Start standing on one leg.',
        },
        1500,
      ),
      frame(
        't_balance',
        2,
        {
          es: 'Inclina el tronco, lleva la pierna atrás y el brazo contrario delante. Vuelve y cambia de lado.',
          en: 'Lean forward, extend the leg back and the opposite arm forward. Return and switch sides.',
        },
        3500,
      ),
    ],
    sequence: [0, 1],
  },
  squat_knee_raise: {
    frames: [
      frame(
        'squat_knee_raise',
        1,
        {
          es: 'Haz una sentadilla normal con control.',
          en: 'Do a controlled bodyweight squat.',
        },
        2000,
      ),
      frame(
        'squat_knee_raise',
        2,
        {
          es: 'Al subir, eleva la rodilla derecha.',
          en: 'As you stand, lift your right knee.',
        },
        2000,
      ),
      frame(
        'squat_knee_raise',
        3,
        {
          es: 'Haz otra sentadilla y, al subir, eleva la rodilla izquierda.',
          en: 'Do another squat and lift your left knee as you stand.',
        },
        2000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  push_side: {
    frames: [
      frame(
        'push_side',
        1,
        {
          es: 'Abre bien las piernas y reparte el peso entre ambos pies.',
          en: 'Take a wide stance and distribute your weight between both feet.',
        },
        1500,
      ),
      frame(
        'push_side',
        2,
        {
          es: 'Lleva el peso a un lado, flexionando esa rodilla y estirando la otra pierna.',
          en: 'Shift your weight to one side, bending that knee and straightening the other leg.',
        },
        2500,
      ),
      frame(
        'push_side',
        3,
        {
          es: 'Pasa por el centro y lleva el peso al otro lado de forma fluida.',
          en: 'Return through the center and shift smoothly to the other side.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  lunge: {
    frames: [
      frame(
        'lunge',
        1,
        {
          es: 'Empieza de pie y prepara un paso largo hacia delante.',
          en: 'Start standing and prepare to take a long step forward.',
        },
        1500,
      ),
      frame(
        'lunge',
        2,
        {
          es: 'Da el paso y baja la rodilla de atrás hacia el suelo, sin tocarlo.',
          en: 'Step forward and lower your back knee toward the floor without touching it.',
        },
        2500,
      ),
      frame(
        'lunge',
        3,
        {
          es: 'Vuelve a la posición inicial y repite con la otra pierna.',
          en: 'Return to the starting position and repeat with the other leg.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  march: {
    frames: [
      frame(
        'march',
        1,
        {
          es: 'Ponte de pie y abre los brazos.',
          en: 'Stand and open your arms.',
        },
        1200,
      ),
      frame(
        'march',
        2,
        {
          es: 'Eleva una rodilla y da una palmada suave a sus lados, con una mano a cada lado.',
          en: 'Lift one knee and gently tap its sides, with one hand on each side.',
        },
        1500,
      ),
      frame(
        'march',
        3,
        {
          es: 'Vuelve a abrir los brazos y alterna con la otra rodilla.',
          en: 'Open your arms again and alternate with the other knee.',
        },
        1500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  standing_hip_abduction: {
    frames: [
      frame(
        'standing_hip_abduction',
        1,
        {
          es: 'Apóyate ligeramente en el escritorio y mantén el tronco erguido.',
          en: 'Lightly hold the desk and keep your torso upright.',
        },
        1800,
      ),
      frame(
        'standing_hip_abduction',
        2,
        {
          es: 'Eleva una pierna hacia un lado sin inclinarte. Haz 8–10 repeticiones y cambia de lado.',
          en: 'Lift one leg sideways without leaning. Do 8–10 repetitions, then switch sides.',
        },
        2200,
      ),
    ],
    sequence: [0, 1],
  },
  standing_knee_hug: {
    frames: [
      frame(
        'standing_knee_hug',
        1,
        {
          es: 'Empieza de pie, con ambos pies apoyados.',
          en: 'Start standing with both feet on the floor.',
        },
        1500,
      ),
      frame(
        'standing_knee_hug',
        2,
        {
          es: 'Eleva una rodilla hacia el pecho y abrázala suavemente durante 2–3 segundos.',
          en: 'Lift one knee toward your chest and gently hug it for 2–3 seconds.',
        },
        2500,
      ),
      frame(
        'standing_knee_hug',
        3,
        {
          es: 'Suelta, apoya el pie y repite el abrazo con la otra rodilla.',
          en: 'Release, place your foot down and repeat the hug with the other knee.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  arm_swing: {
    frames: [
      frame(
        'arm_swing',
        1,
        {
          es: 'Lleva un brazo por delante hasta arriba, ligeramente hacia atrás, mientras el otro baja.',
          en: 'Swing one arm forward all the way overhead and slightly back while the other lowers.',
        },
        2000,
      ),
      frame(
        'arm_swing',
        2,
        {
          es: 'Alterna los brazos, completando el recorrido por encima de la cabeza sin arquear la espalda.',
          en: 'Alternate your arms through the full overhead swing without arching your back.',
        },
        2000,
      ),
      frame(
        'arm_swing',
        3,
        {
          es: 'Alterna también cruces delante del pecho con aperturas de brazos.',
          en: 'Also alternate crossing your arms in front of your chest with opening them wide.',
        },
        2500,
      ),
    ],
    sequence: [0, 1, 0, 1, 2],
  },
  high_twist: {
    frames: [
      frame(
        'high_twist',
        1,
        {
          es: 'Separa los pies un poco más que la cadera y deja los brazos sueltos.',
          en: 'Stand with feet slightly wider than your hips and let your arms hang loose.',
        },
        1500,
      ),
      frame('high_twist', 2, {
        es: 'Gira a un lado dejando que los brazos acompañen y el talón contrario se eleve un poco.',
        en: 'Turn to one side, let your arms follow and allow the opposite heel to lift slightly.',
      }),
      frame('high_twist', 3, {
        es: 'Vuelve al centro y gira hacia el otro lado sin tensar los brazos.',
        en: 'Return to center and turn to the other side without tensing your arms.',
      }),
    ],
    sequence: [0, 1, 0, 2],
  },
  wave: {
    frames: [
      frame(
        'wave',
        1,
        {
          es: 'Flexiona las rodillas y baja las manos hacia los tobillos.',
          en: 'Bend your knees and lower your hands toward your ankles.',
        },
        1800,
      ),
      frame(
        'wave',
        2,
        {
          es: 'Sube con fluidez, extendiendo progresivamente piernas, tronco y brazos.',
          en: 'Rise fluidly, progressively extending your legs, torso and arms.',
        },
        1800,
      ),
      frame(
        'wave',
        3,
        {
          es: 'Termina con los brazos arriba y vuelve a bajar con ritmo cómodo.',
          en: 'Finish with your arms overhead and lower back down at a comfortable pace.',
        },
        1800,
      ),
    ],
    sequence: [0, 1, 2, 1],
  },
  shoulder_back_reach: {
    frames: [
      frame(
        'shoulder_back_reach',
        1,
        {
          es: 'Acerca las manos por detrás, una por arriba y otra por abajo. No hace falta que se toquen.',
          en: 'Reach your hands toward each other behind your back, one from above and one from below. They do not need to touch.',
        },
        3500,
      ),
      frame(
        'shoulder_back_reach',
        2,
        {
          es: 'Suelta y alterna la posición de los brazos, sin forzar.',
          en: 'Release and switch the position of your arms without forcing.',
        },
        3500,
      ),
    ],
    sequence: [0, 1],
  },
  walk_around: {
    frames: [
      frame(
        'walk_around',
        1,
        {
          es: 'Aléjate de la pantalla y empieza a caminar con calma.',
          en: 'Step away from your screen and start walking calmly.',
        },
        900,
      ),
      frame(
        'walk_around',
        2,
        {
          es: 'Deja que los brazos acompañen tus pasos de forma natural.',
          en: 'Let your arms follow your steps naturally.',
        },
        900,
      ),
      frame(
        'walk_around',
        3,
        {
          es: 'Alterna el paso y vuelve sin prisa.',
          en: 'Alternate your steps and head back without rushing.',
        },
        900,
      ),
    ],
    sequence: [0, 1, 2, 1],
  },
  neck_isometrics: {
    frames: [
      frame(
        'neck_isometrics',
        1,
        {
          es: 'Presiona suavemente contra la mano en la frente durante 5 s, sin mover la cabeza.',
          en: 'Press gently into the hand on your forehead for 5 s without moving your head.',
        },
        5000,
      ),
      frame(
        'neck_isometrics',
        2,
        {
          es: 'Apoya la mano en un lateral: 5 s sin mover la cabeza. Repite al otro lado.',
          en: 'Rest your hand on one side: 5 s without moving your head. Repeat on the other side.',
        },
        10000,
      ),
      frame(
        'neck_isometrics',
        3,
        {
          es: 'Manos detrás de la cabeza: presiona suavemente hacia atrás durante 5 s, sin moverla.',
          en: 'Hands behind your head: press gently backward for 5 s without moving it.',
        },
        5000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  neck_shoulder_stretch: {
    frames: [
      frame(
        'neck_shoulder_stretch',
        1,
        {
          es: 'Mira al frente y baja los hombros.',
          en: 'Look straight ahead and relax your shoulders down.',
        },
        2000,
      ),
      frame(
        'neck_shoulder_stretch',
        2,
        {
          es: 'Gira la cabeza unos 45° hacia un lado.',
          en: 'Turn your head about 45° to one side.',
        },
        2000,
      ),
      frame(
        'neck_shoulder_stretch',
        3,
        {
          es: 'Mira hacia esa axila y apoya la mano sin tirar. Mantén 20–30 s y cambia de lado.',
          en: 'Look toward that armpit and rest your hand without pulling. Hold 20–30 s and switch sides.',
        },
        25000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  cat_cow_standing: {
    frames: [
      frame(
        'cat_cow_standing',
        1,
        {
          es: 'Flexiona las rodillas y apoya las manos en los muslos.',
          en: 'Soften your knees and rest your hands on your thighs.',
        },
        1500,
      ),
      frame(
        'cat_cow_standing',
        2,
        {
          es: 'Redondea la espalda y acerca la barbilla al pecho.',
          en: 'Round your back and bring your chin toward your chest.',
        },
        3000,
      ),
      frame(
        'cat_cow_standing',
        3,
        {
          es: 'Abre el pecho y mira al frente. Alterna con suavidad.',
          en: 'Open your chest and look ahead. Alternate gently.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  desk_thread_needle: {
    frames: [
      frame(
        'desk_thread_needle',
        1,
        {
          es: 'Apoya una mano en el escritorio e inclina un poco el tronco.',
          en: 'Rest one hand on the desk and lean forward slightly.',
        },
        2000,
      ),
      frame(
        'desk_thread_needle',
        2,
        {
          es: 'Pasa el brazo libre por debajo del cuerpo.',
          en: 'Reach your free arm underneath your body.',
        },
        3000,
      ),
      frame(
        'desk_thread_needle',
        3,
        {
          es: 'Abre ese brazo hacia el techo. Haz 5 repeticiones y cambia de lado.',
          en: 'Open that arm toward the ceiling. Do 5 repetitions and switch sides.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  side_reach: {
    frames: [
      frame(
        'side_reach',
        1,
        {
          es: 'Una mano en la cintura y el otro brazo recto hacia arriba.',
          en: 'Place one hand on your waist and reach the other arm straight overhead.',
        },
        2000,
      ),
      frame(
        'side_reach',
        2,
        {
          es: 'Inclínate hacia el lado de la mano que está en la cintura.',
          en: 'Lean toward the side of the hand resting on your waist.',
        },
        3000,
      ),
      frame(
        'side_reach',
        3,
        {
          es: 'Vuelve al centro, cambia de brazo y alcanza hacia el otro lado.',
          en: 'Return to center, switch arms and reach to the other side.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  neck_flex_extension: {
    frames: [
      frame(
        'neck_flex_extension',
        1,
        {
          es: 'Empieza mirando al frente, con los hombros relajados.',
          en: 'Start looking straight ahead with relaxed shoulders.',
        },
        2000,
      ),
      frame(
        'neck_flex_extension',
        2,
        {
          es: 'Acerca despacio la barbilla al pecho.',
          en: 'Slowly bring your chin toward your chest.',
        },
        3000,
      ),
      frame(
        'neck_flex_extension',
        3,
        {
          es: 'Vuelve al centro y mira ligeramente arriba, sin forzar.',
          en: 'Return to center and look slightly up without forcing.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  shoulder_circles: {
    frames: [
      frame(
        'shoulder_circles',
        1,
        {
          es: 'Deja los brazos sueltos y los hombros relajados.',
          en: 'Let your arms hang loose and relax your shoulders.',
        },
        2000,
      ),
      frame(
        'shoulder_circles',
        2,
        {
          es: 'Sube los hombros suavemente hacia las orejas.',
          en: 'Gently lift your shoulders toward your ears.',
        },
        2000,
      ),
      frame(
        'shoulder_circles',
        3,
        {
          es: 'Llévalos hacia atrás y abajo, completando un círculo lento.',
          en: 'Roll them back and down to complete a slow circle.',
        },
        2000,
      ),
    ],
    sequence: [0, 1, 2],
  },
  thoracic_extension: {
    frames: [
      frame(
        'thoracic_extension',
        1,
        {
          es: 'Siéntate al borde de la silla, con las manos detrás de la cabeza.',
          en: 'Sit at the edge of the chair with your hands behind your head.',
        },
        3000,
      ),
      frame(
        'thoracic_extension',
        2,
        {
          es: 'Abre los codos y el pecho, mira ligeramente arriba y vuelve despacio.',
          en: 'Open your elbows and chest, look slightly up, then return slowly.',
        },
        4000,
      ),
    ],
    sequence: [0, 1],
  },
  doorway_chest_stretch: {
    frames: [
      frame(
        'doorway_chest_stretch',
        1,
        {
          es: 'Apoya los antebrazos en el marco, con los codos a la altura de los hombros.',
          en: 'Rest your forearms on the frame with elbows at shoulder height.',
        },
        3000,
      ),
      frame(
        'doorway_chest_stretch',
        2,
        {
          es: 'Con ambos pies adelantados y paralelos, mantén el pecho abierto 20–30 s, sin forzar.',
          en: 'With both feet forward and parallel, keep your chest open for 20–30 s without forcing.',
        },
        25000,
      ),
    ],
    sequence: [0, 1],
  },
  desk_thoracic_extension: {
    frames: [
      frame(
        'desk_thoracic_extension',
        1,
        {
          es: 'Apoya las dos manos en el escritorio.',
          en: 'Place both hands on the desk.',
        },
        3000,
      ),
      frame(
        'desk_thoracic_extension',
        2,
        {
          es: 'Camina atrás, lleva la cadera atrás y baja el pecho entre los brazos. Vuelve con control.',
          en: 'Walk back, push your hips back and lower your chest between your arms. Return with control.',
        },
        4000,
      ),
    ],
    sequence: [0, 1],
  },
  neck_rotation: {
    frames: [
      frame(
        'neck_rotation',
        1,
        {
          es: 'Mira al frente con los hombros relajados.',
          en: 'Look straight ahead with relaxed shoulders.',
        },
        1200,
      ),
      frame(
        'neck_rotation',
        2,
        {
          es: 'Gira suavemente hacia tu derecha y mantén 2–3 segundos.',
          en: 'Turn gently to your right and hold for 2–3 seconds.',
        },
        3000,
      ),
      frame(
        'neck_rotation',
        3,
        {
          es: 'Vuelve al centro y gira suavemente hacia tu izquierda.',
          en: 'Return to center and turn gently to your left.',
        },
        3000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  neck_side_tilt: {
    frames: [
      frame(
        'neck_side_tilt',
        1,
        {
          es: 'Mira al frente y deja los hombros relajados.',
          en: 'Look straight ahead and relax your shoulders.',
        },
        2000,
      ),
      frame(
        'neck_side_tilt',
        2,
        {
          es: 'Acerca la oreja derecha a su hombro, sin subirlo. Mantén 20–30 s.',
          en: 'Bring your right ear toward its shoulder without lifting it. Hold 20–30 s.',
        },
        25000,
      ),
      frame(
        'neck_side_tilt',
        3,
        {
          es: 'Cambia de lado sin subir el hombro. Mantén 20–30 s.',
          en: 'Switch sides without lifting your shoulder. Hold 20–30 s.',
        },
        25000,
      ),
    ],
    sequence: [0, 1, 0, 2],
  },
  scapular_retraction: {
    frames: [
      frame(
        'scapular_retraction',
        1,
        {
          es: 'Mantén el tronco erguido y los hombros relajados.',
          en: 'Keep your torso upright and your shoulders relaxed.',
        },
        2000,
      ),
      frame(
        'scapular_retraction',
        2,
        {
          es: 'Lleva los hombros atrás y junta los omóplatos. Mantén 5 s.',
          en: 'Draw your shoulders back and squeeze your shoulder blades. Hold 5 s.',
        },
        5000,
      ),
    ],
    sequence: [0, 1],
  },
  chest_opener: {
    frames: [
      frame(
        'chest_opener',
        1,
        {
          es: 'Entrelaza las manos por abajo, detrás de la espalda.',
          en: 'Clasp your hands low behind your back.',
        },
        3000,
      ),
      frame(
        'chest_opener',
        2,
        {
          es: 'Lleva las manos atrás sin arquear la zona lumbar. Mantén 20–30 s.',
          en: 'Move your hands back without arching your lower back. Hold 20–30 s.',
        },
        25000,
      ),
    ],
    sequence: [0, 1],
  },
  hip_hinge: {
    frames: [
      frame('hip_hinge', 1, {
        es: 'Pies a la anchura de la cadera y manos sobre ella.',
        en: 'Stand with feet hip-width apart and hands on your hips.',
      }),
      frame('hip_hinge', 2, {
        es: 'Lleva la cadera atrás con la espalda neutra y vuelve a subir.',
        en: 'Push your hips back with a neutral spine, then stand back up.',
      }),
    ],
    sequence: [0, 1],
  },
  chin_tuck: {
    frames: [
      frame('chin_tuck', 1, {
        es: 'Mira al frente con los hombros relajados.',
        en: 'Look straight ahead with relaxed shoulders.',
      }),
      frame(
        'chin_tuck',
        2,
        {
          es: 'Lleva la barbilla hacia atrás sin bajar la mirada.',
          en: 'Draw your chin back without looking down.',
        },
        4000,
      ),
    ],
    sequence: [0, 1],
  },
  air_squats: {
    frames: [
      frame('air_squats', 1, {
        es: 'Separa los pies y lleva los brazos al frente.',
        en: 'Place your feet apart and reach your arms forward.',
      }),
      frame('air_squats', 2, {
        es: 'Baja la cadera con control y vuelve a subir.',
        en: 'Lower your hips with control, then stand back up.',
      }),
    ],
    sequence: [0, 1],
  },
  wall_slides: {
    frames: [
      frame('wall_slides', 1, {
        es: 'Apoya la espalda y coloca los brazos en W.',
        en: 'Rest your back against the wall with your arms in a W.',
      }),
      frame('wall_slides', 2, {
        es: 'Desliza los brazos hacia arriba sin forzar.',
        en: 'Slide your arms upward without forcing the movement.',
      }),
    ],
    sequence: [0, 1],
  },
  finger_flex: {
    frames: [
      frame(
        'finger_flex',
        1,
        {
          es: 'Abre las manos y separa bien los dedos.',
          en: 'Open your hands and spread your fingers.',
        },
        1600,
      ),
      frame(
        'finger_flex',
        2,
        {
          es: 'Cierra las manos formando un puño suave.',
          en: 'Close your hands into gentle fists.',
        },
        1600,
      ),
    ],
    sequence: [0, 1],
  },
  eyes_closed_break: {
    frames: [
      frame(
        'eyes_closed_break',
        1,
        {
          es: 'Aparta la vista de la pantalla y relaja la cara.',
          en: 'Look away from the screen and relax your face.',
        },
        3000,
      ),
      frame(
        'eyes_closed_break',
        2,
        {
          es: 'Cierra los ojos suavemente, sin apretar.',
          en: 'Close your eyes gently, without squeezing.',
        },
        17000,
      ),
    ],
    sequence: [0, 1],
  },
};
