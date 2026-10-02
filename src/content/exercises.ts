import type { Exercise } from '@/domain/types';
import { l } from './localized';

/**
 * Microbreak exercises. Sources: breakbit_mvp_v1.md §11 (mobility catalogue) and
 * breakbit_mvp_master_v1.md §15 (dynamic exercises). Gentle movement only: no
 * rehabilitation, no training, no medical claims.
 */
export const EXERCISES: Exercise[] = [
  // ---------- Neck ----------
  {
    id: 'chin_tuck',
    name: l('Retracción cervical suave', 'Gentle chin tuck'),
    description: l(
      'Lleva la barbilla hacia atrás sin inclinar la cabeza.',
      'Draw your chin straight back without tilting your head.',
    ),
    steps: [
      l(
        'Siéntate o ponte de pie con la espalda alta y la mirada al frente.',
        'Sit or stand tall, looking straight ahead.',
      ),
      l(
        'Lleva la barbilla hacia atrás, como haciendo papada, sin bajar la cabeza.',
        'Slide your chin back, as if making a double chin, without nodding.',
      ),
      l(
        'Mantén 2 segundos, suelta y repite unas 8 veces.',
        'Hold for 2 seconds, release and repeat about 8 times.',
      ),
    ],
    areas: ['neck'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'neck_rotation',
    name: l('Rotación cervical suave', 'Gentle neck rotation'),
    description: l(
      'Gira la cabeza despacio a cada lado, sin forzar.',
      'Slowly turn your head to each side without forcing it.',
    ),
    steps: [
      l('Relaja los hombros y mira al frente.', 'Relax your shoulders and look ahead.'),
      l(
        'Gira la cabeza despacio hacia un lado y vuelve al centro.',
        'Slowly turn your head to one side and back to center.',
      ),
      l(
        'Repite hacia el otro lado. Unas 6 veces por lado.',
        'Repeat on the other side. About 6 per side.',
      ),
    ],
    areas: ['neck'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'neck_side_tilt',
    name: l('Inclinación lateral suave', 'Gentle side neck tilt'),
    description: l(
      'Acerca la oreja al hombro sin elevarlo.',
      'Bring your ear toward your shoulder without lifting it.',
    ),
    steps: [
      l(
        'Inclina suavemente la cabeza hacia un lado, con los hombros relajados.',
        'Gently tilt your head to one side, keeping your shoulders relaxed.',
      ),
      l('Mantén 15 segundos y cambia de lado.', 'Hold for 15 seconds and switch sides.'),
    ],
    areas: ['neck'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'neck_isometrics',
    name: l('Isométricos suaves con mano', 'Gentle hand isometrics'),
    description: l(
      'Empuja suavemente la cabeza contra la mano sin moverla.',
      'Press your head gently into your hand without moving it.',
    ),
    steps: [
      l('Apoya la mano en la frente.', 'Place your hand on your forehead.'),
      l(
        'Empuja suavemente con la cabeza unos 5 segundos, sin mover el cuello.',
        'Press gently with your head for about 5 seconds, keeping your neck still.',
      ),
      l(
        'Repite con la mano en cada lado de la cabeza y en la nuca.',
        'Repeat with your hand on each side of your head and at the back.',
      ),
    ],
    areas: ['neck'],
    equipment: [],
    durationSec: 50,
    posture: 'either',
    meetingFriendly: 'yes',
  },

  // ---------- Shoulders ----------
  {
    id: 'shoulder_circles',
    name: l('Círculos de hombros', 'Shoulder circles'),
    description: l('Rotaciones lentas de hombros hacia atrás.', 'Slow backward shoulder rolls.'),
    steps: [
      l('Deja los brazos sueltos a los lados.', 'Let your arms hang loose at your sides.'),
      l(
        'Sube los hombros hacia las orejas y llévalos hacia atrás y abajo.',
        'Lift your shoulders toward your ears, then roll them back and down.',
      ),
      l('Haz unos 10 círculos lentos.', 'Do about 10 slow circles.'),
    ],
    areas: ['shoulders'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'scapular_retraction',
    name: l('Retracción escapular', 'Shoulder blade squeeze'),
    description: l(
      'Junta suavemente los omóplatos y suelta.',
      'Gently squeeze your shoulder blades together and release.',
    ),
    steps: [
      l('Siéntate o ponte de pie con el pecho abierto.', 'Sit or stand with an open chest.'),
      l(
        'Junta los omóplatos como si sujetaras un lápiz entre ellos.',
        'Squeeze your shoulder blades as if holding a pencil between them.',
      ),
      l(
        'Mantén 2 segundos y suelta. Unas 10 veces.',
        'Hold for 2 seconds and release. About 10 times.',
      ),
    ],
    areas: ['shoulders', 'back'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'chest_opener',
    name: l('Apertura de pecho', 'Chest opener'),
    description: l('Abre hombros y pecho suavemente.', 'Gently open your shoulders and chest.'),
    steps: [
      l(
        'De pie, entrelaza las manos detrás de la espalda o abre los brazos en cruz.',
        'Standing, clasp your hands behind your back or open your arms wide.',
      ),
      l(
        'Lleva los hombros atrás y abre el pecho sin arquear la zona lumbar.',
        'Draw your shoulders back and open your chest without arching your lower back.',
      ),
      l(
        'Respira tranquilo y mantén unos 20 segundos.',
        'Breathe calmly and hold for about 20 seconds.',
      ),
    ],
    areas: ['shoulders', 'back'],
    equipment: [],
    durationSec: 40,
    posture: 'standing',
    meetingFriendly: 'partial',
  },
  {
    id: 'arm_swing',
    name: l('Balanceo de brazos', 'Arm swings'),
    description: l('Movimiento amplio y suelto de brazos.', 'Big, loose arm swings.'),
    steps: [
      l('De pie, con los pies a la anchura de la cadera.', 'Stand with your feet hip-width apart.'),
      l(
        'Balancea los brazos adelante y atrás, de forma amplia y relajada.',
        'Swing your arms forward and back, big and relaxed.',
      ),
      l(
        'Alterna con cruces por delante del pecho.',
        'Alternate with crossing them in front of your chest.',
      ),
    ],
    areas: ['shoulders', 'sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'partial',
  },
  {
    id: 'punch',
    name: l('Golpes al frente', 'Front punches'),
    description: l('Puñetazos suaves alternos.', 'Gentle alternating punches.'),
    steps: [
      l(
        'De pie, con las rodillas un poco flexionadas y los puños a la altura del pecho.',
        'Stand with soft knees and your fists at chest height.',
      ),
      l(
        'Lanza puñetazos suaves al frente, alternando brazos.',
        'Throw gentle punches forward, alternating arms.',
      ),
      l('Gira un poco el tronco con cada golpe.', 'Rotate your torso slightly with each punch.'),
    ],
    areas: ['shoulders', 'sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Back ----------
  {
    id: 'thoracic_extension',
    name: l('Extensión torácica sentado', 'Seated upper-back extension'),
    description: l(
      'Abre el pecho y extiende la espalda alta con control.',
      'Open your chest and extend your upper back with control.',
    ),
    steps: [
      l(
        'Siéntate al borde de la silla con las manos detrás de la cabeza.',
        'Sit at the edge of your chair with your hands behind your head.',
      ),
      l(
        'Lleva los codos hacia atrás y mira ligeramente hacia arriba.',
        'Draw your elbows back and look slightly up.',
      ),
      l('Vuelve despacio. Unas 8 veces.', 'Return slowly. About 8 times.'),
    ],
    areas: ['back'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'thoracic_rotation',
    name: l('Rotación torácica sentado', 'Seated thoracic rotation'),
    description: l(
      'Gira el tronco despacio hacia cada lado.',
      'Slowly rotate your torso to each side.',
    ),
    steps: [
      l(
        'Siéntate erguido con los brazos cruzados sobre el pecho.',
        'Sit tall with your arms crossed over your chest.',
      ),
      l(
        'Gira el tronco hacia un lado manteniendo la cadera quieta.',
        'Rotate your torso to one side, keeping your hips still.',
      ),
      l(
        'Vuelve al centro y cambia de lado. Unas 6 veces por lado.',
        'Return to center and switch sides. About 6 per side.',
      ),
    ],
    areas: ['back'],
    equipment: [],
    durationSec: 45,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'cat_cow_standing',
    name: l('Gato-vaca de pie', 'Standing cat-cow'),
    description: l(
      'Alterna flexión y extensión suave de la columna.',
      'Alternate gentle rounding and arching of your spine.',
    ),
    steps: [
      l(
        'De pie, con las rodillas flexionadas y las manos sobre los muslos.',
        'Stand with soft knees and your hands on your thighs.',
      ),
      l(
        'Redondea la espalda llevando la barbilla al pecho.',
        'Round your back, bringing your chin toward your chest.',
      ),
      l(
        'Después abre el pecho y mira al frente. Alterna unas 8 veces.',
        'Then open your chest and look ahead. Alternate about 8 times.',
      ),
    ],
    areas: ['back'],
    equipment: [],
    durationSec: 50,
    posture: 'either',
    meetingFriendly: 'partial',
  },
  {
    id: 'hip_hinge',
    name: l('Bisagra de cadera', 'Hip hinge'),
    description: l(
      'Lleva la cadera atrás con la espalda neutra.',
      'Push your hips back while keeping a neutral spine.',
    ),
    steps: [
      l(
        'De pie, pies a la anchura de la cadera y manos en la cadera.',
        'Stand with your feet hip-width apart and your hands on your hips.',
      ),
      l(
        'Lleva la cadera hacia atrás inclinando el tronco con la espalda recta.',
        'Push your hips back, tilting your torso with a straight back.',
      ),
      l(
        'Vuelve apretando los glúteos. Unas 10 veces.',
        'Come back up squeezing your glutes. About 10 times.',
      ),
    ],
    areas: ['back', 'sedentary'],
    equipment: [],
    durationSec: 50,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'high_twist',
    name: l('Giro de tronco relajado', 'Relaxed torso twist'),
    description: l(
      'Rota el tronco dejando que los brazos acompañen.',
      'Rotate your torso and let your arms follow.',
    ),
    steps: [
      l(
        'De pie, con los pies algo más abiertos que la cadera.',
        'Stand with your feet slightly wider than your hips.',
      ),
      l(
        'Gira el tronco a un lado y a otro dejando los brazos sueltos.',
        'Twist side to side, letting your arms swing loose.',
      ),
      l(
        'Deja que el talón contrario se despegue un poco del suelo.',
        'Let the opposite heel lift slightly off the floor.',
      ),
    ],
    areas: ['back', 'sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'partial',
  },
  {
    id: 'trunk_twist',
    name: l('Rotación de tronco', 'Trunk rotation'),
    description: l('Giro controlado del tronco.', 'A controlled torso rotation.'),
    steps: [
      l(
        'De pie, con los brazos cruzados sobre el pecho o abiertos en cruz.',
        'Stand with your arms crossed over your chest or out to the sides.',
      ),
      l(
        'Gira el tronco despacio a un lado manteniendo la cadera al frente.',
        'Slowly rotate to one side, keeping your hips facing forward.',
      ),
      l('Vuelve al centro y alterna.', 'Return to center and alternate.'),
    ],
    areas: ['back'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'partial',
  },
  {
    id: 'golf_swing',
    name: l('Giro tipo golf', 'Golf swing'),
    description: l('Rotación amplia simulando un swing.', 'A wide rotation, like a golf swing.'),
    steps: [
      l(
        'De pie, junta las manos como si sujetaras un palo.',
        'Stand and clasp your hands as if holding a club.',
      ),
      l(
        'Gira el tronco llevando las manos de un lado a otro en un arco amplio.',
        'Rotate your torso, sweeping your hands from side to side in a wide arc.',
      ),
      l('Acompaña con las rodillas y alterna lados.', 'Let your knees follow and alternate sides.'),
    ],
    areas: ['back', 'shoulders'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'wave',
    name: l('Ola corporal', 'Body wave'),
    description: l(
      'Movimiento amplio desde casi los tobillos hasta los brazos arriba.',
      'A big movement from near your ankles up to arms overhead.',
    ),
    steps: [
      l(
        'De pie, flexiona las rodillas y baja las manos hacia los tobillos.',
        'Standing, bend your knees and reach down toward your ankles.',
      ),
      l(
        'Sube despacio, vértebra a vértebra, hasta estirar los brazos arriba.',
        'Roll up slowly, one vertebra at a time, until your arms reach overhead.',
      ),
      l(
        'Baja con control y repite de forma fluida.',
        'Come down with control and repeat smoothly.',
      ),
    ],
    areas: ['sedentary', 'back'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Sitting time (legs and general movement) ----------
  {
    id: 'march',
    name: l('Marcha en el sitio', 'March in place'),
    description: l('Camina sin desplazarte.', 'Walk without moving forward.'),
    steps: [
      l('De pie, empieza a marchar en el sitio.', 'Standing, start marching in place.'),
      l(
        'Eleva las rodillas a una altura cómoda y mueve los brazos.',
        'Lift your knees to a comfortable height and swing your arms.',
      ),
      l('Mantén un ritmo suave y constante.', 'Keep a light, steady pace.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 45,
    posture: 'standing',
    meetingFriendly: 'yes',
  },
  {
    id: 'calf_raises',
    name: l('Elevaciones de talón', 'Calf raises'),
    description: l('Sube a puntillas y baja despacio.', 'Rise onto your toes and lower slowly.'),
    steps: [
      l(
        'De pie, apoya las manos en la mesa si lo necesitas.',
        'Stand, resting your hands on the desk if you need to.',
      ),
      l('Sube los talones todo lo que puedas.', 'Rise up onto your toes as high as you can.'),
      l('Baja despacio. Unas 15 veces.', 'Lower slowly. About 15 times.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 40,
    posture: 'standing',
    meetingFriendly: 'yes',
  },
  {
    id: 'air_squats',
    name: l('Sentadillas al aire', 'Air squats'),
    description: l('Sentadillas cómodas y controladas.', 'Comfortable, controlled squats.'),
    steps: [
      l(
        'Pies a la anchura de los hombros y brazos al frente.',
        'Feet shoulder-width apart, arms reaching forward.',
      ),
      l(
        'Baja la cadera como si fueras a sentarte, con el pecho alto.',
        'Lower your hips as if sitting down, keeping your chest up.',
      ),
      l('Sube despacio. Unas 10 veces.', 'Stand back up slowly. About 10 times.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 45,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'walk_around',
    name: l('Paseo corto', 'Short walk'),
    description: l(
      'Da una vuelta corta para romper el tiempo sentado.',
      'Take a short walk to break up your sitting time.',
    ),
    steps: [
      l('Levántate y aléjate de la pantalla.', 'Get up and step away from your screen.'),
      l(
        'Camina por casa u oficina: rellena el agua o sube unas escaleras.',
        'Walk around your home or office: refill your water or take some stairs.',
      ),
      l('Vuelve sin prisa.', 'Head back without rushing.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 90,
    posture: 'standing',
    meetingFriendly: 'yes',
  },
  {
    id: 'plie',
    name: l('Plié', 'Plié squat'),
    description: l('Flexión de piernas con base amplia.', 'Knee bends with a wide stance.'),
    steps: [
      l(
        'Abre los pies más que la cadera, con las puntas hacia fuera.',
        'Stand with your feet wide and your toes turned out.',
      ),
      l(
        'Flexiona las rodillas en la dirección de los pies, con el tronco recto.',
        'Bend your knees over your toes, keeping your torso upright.',
      ),
      l('Sube y repite a un ritmo suave.', 'Rise and repeat at an easy pace.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'push_side',
    name: l('Sentadilla lateral alterna', 'Alternating side lunge'),
    description: l(
      'Flexiona una pierna mientras la otra queda estirada.',
      'Bend one leg while the other stays straight.',
    ),
    steps: [
      l('Abre bien las piernas.', 'Take a wide stance.'),
      l(
        'Desplaza el peso a un lado flexionando esa rodilla; la otra pierna queda estirada.',
        'Shift your weight to one side, bending that knee; keep the other leg straight.',
      ),
      l('Pasa al otro lado de forma fluida.', 'Flow over to the other side.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'kick_step',
    name: l('Patada frontal controlada', 'Controlled front kick'),
    description: l(
      'Eleva la pierna estirada hasta una altura cómoda.',
      'Raise a straight leg to a comfortable height.',
    ),
    steps: [
      l('De pie, apóyate en la mesa si lo necesitas.', 'Stand, holding the desk if you need to.'),
      l(
        'Eleva una pierna estirada al frente sin forzar.',
        'Lift one straight leg forward without forcing it.',
      ),
      l('Bájala con control y alterna.', 'Lower it with control and alternate.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'hop_rotate',
    name: l('Saltitos con giro de cadera', 'Hip-twist hops'),
    description: l(
      'Pequeños saltos rotando suavemente la cadera.',
      'Small hops while gently twisting your hips.',
    ),
    steps: [
      l(
        'De pie, con los brazos relajados delante del pecho.',
        'Stand with your arms relaxed in front of your chest.',
      ),
      l(
        'Da saltitos girando la cadera a un lado y a otro.',
        'Hop lightly, twisting your hips side to side.',
      ),
      l('Mantén el tronco mirando al frente.', 'Keep your upper body facing forward.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'lunge',
    name: l('Zancada', 'Lunge'),
    description: l('Zancada alterna.', 'Alternating lunge.'),
    steps: [
      l('De pie, da un paso largo hacia delante.', 'Stand and take a long step forward.'),
      l(
        'Baja la rodilla de atrás hacia el suelo sin llegar a tocarlo.',
        'Lower your back knee toward the floor without touching it.',
      ),
      l('Vuelve y cambia de pierna.', 'Push back and switch legs.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'curtsy_cross',
    name: l('Zancada cruzada', 'Curtsy lunge'),
    description: l(
      'Paso cruzado hacia atrás, como una reverencia.',
      'A crossed step back, like a curtsy.',
    ),
    steps: [
      l(
        'De pie, cruza una pierna por detrás de la otra.',
        'Standing, cross one leg behind the other.',
      ),
      l(
        'Flexiona ambas rodillas con el tronco erguido.',
        'Bend both knees, keeping your torso upright.',
      ),
      l('Vuelve y alterna lados.', 'Return and alternate sides.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'hop',
    name: l('Saltitos', 'Light hops'),
    description: l('Saltos suaves.', 'Gentle hops.'),
    steps: [
      l('De pie, con las rodillas ligeramente flexionadas.', 'Stand with soft knees.'),
      l(
        'Da saltitos suaves sobre las puntas de los pies.',
        'Hop lightly on the balls of your feet.',
      ),
      l('Aterriza con suavidad y respira.', 'Land softly and keep breathing.'),
    ],
    areas: ['sedentary'],
    equipment: [],
    durationSec: 30,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Eyes ----------
  {
    id: 'far_gaze',
    name: l('Mirada lejana', 'Look into the distance'),
    description: l(
      'Aparta la vista de la pantalla y enfoca a lo lejos.',
      'Look away from your screen and focus on something far away.',
    ),
    steps: [
      l(
        'Busca un punto lejano, mejor si es a través de una ventana.',
        'Find a distant point, ideally through a window.',
      ),
      l(
        'Mantén la mirada ahí unos 20 segundos, relajando la cara.',
        'Keep your gaze there for about 20 seconds, relaxing your face.',
      ),
    ],
    areas: ['eyes'],
    equipment: [],
    durationSec: 25,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'blink_far_gaze',
    name: l('Parpadeo consciente', 'Mindful blinking'),
    description: l(
      'Parpadea despacio y después mira a lo lejos.',
      'Blink slowly, then look into the distance.',
    ),
    steps: [
      l(
        'Cierra los ojos despacio y ábrelos, unas 10 veces.',
        'Slowly close and open your eyes about 10 times.',
      ),
      l(
        'Después mira un punto lejano unos 20 segundos.',
        'Then look at a distant point for about 20 seconds.',
      ),
    ],
    areas: ['eyes'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },

  // ---------- Wrists and hands ----------
  {
    id: 'finger_flex',
    name: l('Flexión y extensión de dedos', 'Finger stretches'),
    description: l(
      'Abre y cierra las manos y moviliza los dedos.',
      'Open and close your hands and move your fingers.',
    ),
    steps: [
      l(
        'Abre las manos estirando bien los dedos.',
        'Open your hands, spreading your fingers wide.',
      ),
      l('Ciérralas en un puño suave.', 'Close them into a soft fist.'),
      l('Repite unas 15 veces.', 'Repeat about 15 times.'),
    ],
    areas: ['wrists'],
    equipment: [],
    durationSec: 35,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'wrist_mobility',
    name: l('Movilidad de muñeca', 'Wrist mobility'),
    description: l(
      'Flexión, extensión y círculos suaves de muñeca.',
      'Gentle wrist bends and circles.',
    ),
    steps: [
      l('Extiende los brazos al frente.', 'Reach your arms forward.'),
      l('Lleva las manos arriba y abajo despacio.', 'Slowly bend your hands up and down.'),
      l('Haz círculos suaves en cada sentido.', 'Make gentle circles in each direction.'),
    ],
    areas: ['wrists'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
  },
  {
    id: 'forearm_rotation',
    name: l('Giro de antebrazos', 'Forearm rotation'),
    description: l(
      'Gira las palmas arriba y abajo despacio.',
      'Slowly turn your palms up and down.',
    ),
    steps: [
      l(
        'Codos pegados al cuerpo y doblados a 90°.',
        'Keep your elbows by your sides, bent at 90°.',
      ),
      l(
        'Gira las palmas hacia arriba y hacia abajo despacio.',
        'Slowly turn your palms up and down.',
      ),
      l('Unas 10 veces.', 'About 10 times.'),
    ],
    areas: ['wrists'],
    equipment: [],
    durationSec: 35,
    posture: 'either',
    meetingFriendly: 'yes',
  },

  // ---------- Pull-up bar ----------
  {
    id: 'dead_hang',
    name: l('Colgado suave', 'Gentle dead hang'),
    description: l(
      'Cuélgate de la barra con control y sin forzar.',
      'Hang from the bar with control, without forcing it.',
    ),
    steps: [
      l(
        'Agarra la barra con las manos a la anchura de los hombros.',
        'Grip the bar with your hands shoulder-width apart.',
      ),
      l(
        'Deja que el cuerpo cuelgue, con los pies apoyados si lo necesitas.',
        'Let your body hang, keeping your feet on the floor if you need to.',
      ),
      l(
        'Aguanta 10–20 segundos y repite si te apetece.',
        'Hold for 10–20 seconds and repeat if you like.',
      ),
    ],
    areas: ['shoulders', 'back'],
    equipment: ['pullup_bar'],
    durationSec: 40,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'scapular_pulls',
    name: l('Retracción escapular en barra', 'Scapular pulls'),
    description: l(
      'Activa las escápulas sin hacer una dominada completa.',
      'Engage your shoulder blades without a full pull-up.',
    ),
    steps: [
      l('Cuélgate de la barra con los brazos estirados.', 'Hang from the bar with straight arms.'),
      l(
        'Baja los hombros alejándolos de las orejas, sin doblar los codos.',
        'Pull your shoulders down away from your ears, without bending your elbows.',
      ),
      l('Suelta despacio. Unas 6 veces.', 'Release slowly. About 6 times.'),
    ],
    areas: ['shoulders', 'back'],
    equipment: ['pullup_bar'],
    durationSec: 35,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Dumbbells ----------
  {
    id: 'farmer_hold',
    name: l('Sujeción del granjero', 'Farmer hold'),
    description: l(
      'Sostén las mancuernas de pie con una postura cómoda.',
      'Hold the dumbbells while standing tall.',
    ),
    steps: [
      l(
        'Coge una mancuerna en cada mano, a los lados.',
        'Hold a dumbbell in each hand at your sides.',
      ),
      l('Hombros abajo y atrás, mirada al frente.', 'Shoulders down and back, eyes forward.'),
      l(
        'Aguanta 30–45 segundos respirando con calma.',
        'Hold for 30–45 seconds, breathing calmly.',
      ),
    ],
    areas: ['back', 'sedentary'],
    equipment: ['dumbbells'],
    durationSec: 45,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'lateral_raise_light',
    name: l('Elevación lateral ligera', 'Light lateral raise'),
    description: l(
      'Elevación lateral con carga muy ligera.',
      'A lateral raise with a very light load.',
    ),
    steps: [
      l('De pie, con mancuernas ligeras a los lados.', 'Stand with light dumbbells at your sides.'),
      l(
        'Sube los brazos hacia los lados hasta la altura de los hombros.',
        'Raise your arms out to shoulder height.',
      ),
      l('Baja despacio. Unas 10 veces.', 'Lower slowly. About 10 times.'),
    ],
    areas: ['shoulders'],
    equipment: ['dumbbells'],
    durationSec: 50,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'dumbbell_row_light',
    name: l('Remo ligero con mancuerna', 'Light dumbbell row'),
    description: l('Remo controlado, pocas repeticiones.', 'A controlled row with few reps.'),
    steps: [
      l(
        'Apoya una mano en la mesa e inclina el tronco con la espalda recta.',
        'Rest one hand on the desk and lean forward with a straight back.',
      ),
      l(
        'Lleva la mancuerna hacia la cadera juntando el omóplato.',
        'Pull the dumbbell toward your hip, squeezing your shoulder blade.',
      ),
      l('Baja con control. Unas 8 por lado.', 'Lower with control. About 8 per side.'),
    ],
    areas: ['back', 'shoulders'],
    equipment: ['dumbbells'],
    durationSec: 60,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Kettlebell ----------
  {
    id: 'suitcase_hold',
    name: l('Sujeción tipo maleta', 'Suitcase hold'),
    description: l(
      'Sujeta la kettlebell a un lado manteniendo la postura neutra.',
      'Hold the kettlebell at one side while staying upright.',
    ),
    steps: [
      l(
        'Coge la kettlebell con una mano, a un lado del cuerpo.',
        'Hold the kettlebell in one hand at your side.',
      ),
      l(
        'Mantén el tronco recto, sin inclinarte hacia el peso.',
        'Keep your torso straight, without leaning toward the weight.',
      ),
      l('Aguanta 20–30 segundos y cambia de lado.', 'Hold for 20–30 seconds and switch sides.'),
    ],
    areas: ['back'],
    equipment: ['kettlebell'],
    durationSec: 60,
    posture: 'standing',
    meetingFriendly: 'no',
  },
  {
    id: 'kettlebell_halo',
    name: l('Halo con kettlebell', 'Kettlebell halo'),
    description: l(
      'Pasa la kettlebell alrededor de la cabeza, ligera y controlada.',
      'Circle a light kettlebell around your head with control.',
    ),
    steps: [
      l(
        'Sujeta la kettlebell por el asa, boca abajo, delante del pecho.',
        'Hold the kettlebell by the handle, upside down, at chest height.',
      ),
      l(
        'Rodea la cabeza despacio, cerca del cuerpo.',
        'Circle it slowly around your head, close to your body.',
      ),
      l('Haz 4–6 vueltas en cada sentido.', 'Do 4–6 circles each way.'),
    ],
    areas: ['shoulders'],
    equipment: ['kettlebell'],
    durationSec: 45,
    posture: 'standing',
    meetingFriendly: 'no',
  },

  // ---------- Mat ----------
  {
    id: 'cat_cow_mat',
    name: l('Gato-vaca a cuatro apoyos', 'Cat-cow on all fours'),
    description: l(
      'Flexión y extensión suave de la columna a cuatro apoyos.',
      'Gentle spine rounding and arching on all fours.',
    ),
    steps: [
      l(
        'Colócate a cuatro apoyos: manos bajo los hombros y rodillas bajo la cadera.',
        'Get on all fours: hands under your shoulders, knees under your hips.',
      ),
      l(
        'Redondea la espalda mirando al ombligo.',
        'Round your back, looking toward your belly button.',
      ),
      l(
        'Después hunde un poco la espalda mirando al frente. Alterna unas 8 veces.',
        'Then let your back dip slightly, looking ahead. Alternate about 8 times.',
      ),
    ],
    areas: ['back'],
    equipment: ['mat'],
    durationSec: 50,
    posture: 'floor',
    meetingFriendly: 'no',
  },
  {
    id: 'child_pose',
    name: l('Postura del niño', "Child's pose"),
    description: l(
      'Siéntate hacia los talones y alarga los brazos sin forzar.',
      'Sit back toward your heels and reach your arms forward.',
    ),
    steps: [
      l(
        'Desde cuatro apoyos, lleva la cadera hacia los talones.',
        'From all fours, sit your hips back toward your heels.',
      ),
      l(
        'Alarga los brazos al frente y apoya la frente en la esterilla.',
        'Reach your arms forward and rest your forehead on the mat.',
      ),
      l('Respira despacio unos 30–45 segundos.', 'Breathe slowly for 30–45 seconds.'),
    ],
    areas: ['back', 'shoulders'],
    equipment: ['mat'],
    durationSec: 45,
    posture: 'floor',
    meetingFriendly: 'no',
  },
  {
    id: 'quadruped_rotation',
    name: l('Rotación torácica a cuatro apoyos', 'Quadruped thoracic rotation'),
    description: l(
      'Gira el tronco suavemente desde cuatro apoyos.',
      'Gently rotate your upper back from all fours.',
    ),
    steps: [
      l(
        'A cuatro apoyos, lleva una mano detrás de la cabeza.',
        'On all fours, place one hand behind your head.',
      ),
      l(
        'Gira el codo hacia el techo abriendo el pecho.',
        'Rotate your elbow up toward the ceiling, opening your chest.',
      ),
      l('Vuelve despacio. Unas 6 veces por lado.', 'Return slowly. About 6 per side.'),
    ],
    areas: ['back'],
    equipment: ['mat'],
    durationSec: 60,
    posture: 'floor',
    meetingFriendly: 'no',
  },
  {
    id: 'hip_flexor_stretch',
    name: l('Estiramiento de cadera en zancada', 'Kneeling hip stretch'),
    description: l('Posición de zancada apoyada y suave.', 'A gentle kneeling lunge.'),
    steps: [
      l(
        'Apoya una rodilla en la esterilla y adelanta la otra pierna.',
        'Kneel on one knee with the other foot forward.',
      ),
      l(
        'Lleva la cadera suavemente hacia delante con el tronco recto.',
        'Gently shift your hips forward with an upright torso.',
      ),
      l('Mantén 20–30 segundos y cambia de lado.', 'Hold for 20–30 seconds and switch sides.'),
    ],
    areas: ['sedentary', 'back'],
    equipment: ['mat'],
    durationSec: 60,
    posture: 'floor',
    meetingFriendly: 'no',
  },
  {
    id: 'glute_bridge',
    name: l('Puente de glúteos', 'Glute bridge'),
    description: l(
      'Eleva la cadera desde el suelo de forma controlada.',
      'Lift your hips from the floor with control.',
    ),
    steps: [
      l(
        'Túmbate boca arriba con las rodillas dobladas y los pies apoyados.',
        'Lie on your back with your knees bent and feet flat.',
      ),
      l('Sube la cadera apretando los glúteos.', 'Lift your hips, squeezing your glutes.'),
      l('Baja despacio. Unas 10 veces.', 'Lower slowly. About 10 times.'),
    ],
    areas: ['back', 'sedentary'],
    equipment: ['mat'],
    durationSec: 60,
    posture: 'floor',
    meetingFriendly: 'no',
  },
];
