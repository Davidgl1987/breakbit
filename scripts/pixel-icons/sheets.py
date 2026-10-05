"""The icon set as sheets to be drawn by an image AI (docs/prompts-iconos.md).

Each sheet is one 1024x1024 PNG with a grid of cells; every cell holds one icon, a 32x32
pixel sprite. The same list drives the reference images, the prompts and, once the art
arrives, its import (which reads each icon from its cell). Names are the app's icon names.
"""

# (file, title, columns, rows, [(icon name, what to draw)]) — icons row by row.
SHEETS = [
    (
        'hoja-1-cuerpo.png',
        'Cuerpo, movimiento y ánimo',
        4,
        4,
        [
            ('neck', 'Cuello: busto de frente de la persona, con el cuello resaltado en coral y dos marquitas de brillo coral a los lados.'),
            ('shoulders', 'Hombros: el mismo busto de frente, con los dos hombros resaltados en coral.'),
            ('upper_back', 'Espalda alta: el busto DE ESPALDAS (se ve el pelo, no la cara), con los omóplatos resaltados en coral a ambos lados de la columna.'),
            ('lower_back', 'Zona lumbar: la persona de espaldas, de cintura para arriba y con el inicio del pantalón; resaltada en coral la parte baja de la espalda, justo encima de la cintura.'),
            ('wrist', 'Muñecas y antebrazos: una mano abierta con la muñeca y el antebrazo; la muñeca resaltada en coral.'),
            ('hips', 'Cadera y piernas: la persona de cuerpo entero, de frente, con la cadera y los muslos resaltados en coral.'),
            ('eyes', 'Vista: un ojo abierto grande, con el iris azul y un brillo.'),
            ('seated', 'Sentado: la persona de perfil, encorvada en una silla de oficina.'),
            ('stretch', 'Estiramiento: la persona de pie, de frente, estirando los dos brazos hacia arriba.'),
            ('walk', 'Caminar: la persona caminando de perfil, a buen paso.'),
            ('exercise', 'Ejercicio: la persona saltando con brazos y piernas abiertos (salto de estrella).'),
            ('shoes', 'Zapatilla deportiva: una zapatilla blanca de perfil con detalles verdes.'),
            ('mood_great', 'Muy bien: carita amarilla redonda, muy feliz, ojos cerrados de alegría y boca abierta.'),
            ('mood_good', 'Bien: carita amarilla redonda sonriendo.'),
            ('mood_loaded', 'Cargado: carita naranja redonda, cansada, con la boca recta.'),
            ('mood_bad', 'Bastante mal: carita azul clara redonda, triste.'),
        ],
    ),
    (
        'hoja-2-material.png',
        'Material, puesto de trabajo y ritmo',
        4,
        4,
        [
            ('resistance_band', 'Banda elástica: una banda de resistencia en bucle, color teal, algo estirada.'),
            ('mat', 'Esterilla: una esterilla de yoga verde, medio enrollada.'),
            ('pullup_bar', 'Barra de dominadas: una barra horizontal metálica con sus dos soportes, vista de frente.'),
            ('dumbbell', 'Mancuerna: una mancuerna gris oscuro, de lado.'),
            ('kettlebell', 'Kettlebell: una pesa rusa gris oscuro con su asa.'),
            ('desk', 'Escritorio elevable: un standing desk de madera con patas metálicas, un portátil encima y una planta pequeña.'),
            ('laptop', 'Portátil: un portátil abierto con la pantalla azul clara.'),
            ('monitor', 'Monitor: un monitor de ordenador con pantalla azul clara y su pie.'),
            ('chair', 'Silla de oficina: azul, con ruedas.'),
            ('headphones', 'Auriculares: unos auriculares de diadema, morados.'),
            ('treadmill', 'Cinta de correr: una cinta de andar de perfil.'),
            ('outside', 'Paseo por la calle: un árbol verde con un caminito delante.'),
            ('call', 'Llamada: un auricular de teléfono verde con ondas de sonido (reunión caminando).'),
            ('pace_soft', 'Ritmo suave: un velocímetro semicircular, arco verde, amarillo y naranja de izquierda a derecha, con la aguja apuntando a la zona verde.'),
            ('pace_normal', 'Ritmo normal: el mismo velocímetro con la aguja en el centro, hacia arriba.'),
            ('pace_active', 'Ritmo activo: el mismo velocímetro con la aguja apuntando a la zona naranja.'),
        ],
    ),
    (
        'hoja-3-estados.png',
        'Estados de las pausas y recompensas',
        4,
        4,
        [
            ('pending', 'Pendiente: un reloj de arena con arena dorada.'),
            ('postponed', 'Aplazada: un despertador naranja.'),
            ('completed', 'Hecha: un círculo verde con un check blanco.'),
            ('missed', 'Perdida: un círculo rojo con una X blanca.'),
            ('extra', 'Pausa extra: un círculo azul con un "+" blanco.'),
            ('first_try', 'A la primera: una medalla de oro con un "1" y su cinta.'),
            ('good_day', 'Día bueno: una hoja de calendario con un check verde grande.'),
            ('streak', 'Racha: una llama de fuego naranja y amarilla.'),
            ('xp', 'XP: una estrella dorada.'),
            ('level_up', 'Subir de nivel: una flecha verde gruesa hacia arriba.'),
            ('reward', 'Premio: una caja de regalo naranja con lazo rojo.'),
            ('goal', 'Objetivo: una diana roja y blanca con una flecha clavada en el centro.'),
            ('success', 'Éxito: destellos dorados (una estrella de cuatro puntas grande y dos pequeñas).'),
            ('warning', 'Aviso: un triángulo amarillo con un signo de exclamación.'),
            ('info', 'Información: un círculo azul con una "i" blanca.'),
            ('close', 'Descartada: una X roja gruesa, sin círculo.'),
        ],
    ),
    (
        'hoja-4-jornada.png',
        'Navegación y jornada',
        4,
        4,
        [
            ('home', 'Hoy (inicio): una casita con tejado verde y puerta.'),
            ('progress', 'Progreso: tres barras verdes crecientes, como un gráfico.'),
            ('settings', 'Ajustes: un engranaje gris.'),
            ('gap', 'Tengo un hueco: un rayo amarillo.'),
            ('clock', 'Reloj: un reloj de pared redondo, borde azul, esfera blanca.'),
            ('calendar', 'Calendario: una hoja de calendario con anillas rojas arriba y la cuadrícula de días.'),
            ('meeting', 'Reunión: tres personas de busto, juntas (la del centro en verde).'),
            ('add', 'Añadir: un círculo verde con un "+" blanco.'),
            ('forward', 'Adelantar: una flecha gris gruesa hacia la derecha.'),
            ('sun', 'Sol: un sol amarillo con rayos.'),
            ('moon', 'Luna: una luna creciente morada con una estrellita.'),
            ('sunrise', 'Inicio de jornada: medio sol saliendo por el horizonte con una flecha verde hacia arriba.'),
            ('sunset', 'Fin de jornada: medio sol naranja poniéndose sobre un horizonte morado, con una flecha hacia abajo.'),
            ('rest', 'Descanso: una luna creciente morada con unas "z" de sueño.'),
            ('food', 'Comida: un tenedor y un cuchillo, en vertical.'),
            ('mug', 'Taza: una taza verde de café.'),
        ],
    ),
    (
        'hoja-5-ajustes-habitacion.png',
        'Ajustes, datos y la habitación del avatar',
        4,
        4,
        [
            ('bell', 'Avisos: una campana dorada.'),
            ('heart', 'Corazón rojo (acerca de la app).'),
            ('home_place', 'Instalar la app: un móvil con una casita en la pantalla.'),
            ('export', 'Exportar: una flecha verde hacia abajo entrando en una bandeja.'),
            ('import', 'Importar: una flecha verde hacia arriba saliendo de una bandeja.'),
            ('trash', 'Borrar: una papelera gris con rayas verticales.'),
            ('shield', 'Proteger datos: un escudo verde con un check blanco.'),
            ('reading', 'Idioma: un libro abierto.'),
            ('sofa', 'Día libre: un sofá rojo.'),
            ('plant', 'Planta: una planta en una maceta naranja.'),
            ('plant_decor', 'Planta colgante: una planta en una maceta colgada del techo, con hojas cayendo.'),
            ('picture', 'Cuadro: un cuadro con un paisaje (cielo azul, montañas verdes) y marco de madera.'),
            ('lamp', 'Lámpara: una lámpara de pie con pantalla amarilla.'),
            ('rug', 'Alfombra: una alfombra rectangular roja con un dibujo amarillo.'),
            ('bookshelf', 'Estantería: una estantería de madera con libros de colores.'),
            ('speaker', 'Altavoz: un altavoz gris oscuro con dos conos.'),
        ],
    ),
    (
        'hoja-6-ocio.png',
        'Ocio de la habitación',
        2,
        2,
        [
            ('ball', 'Balón: un balón de fútbol blanco y negro.'),
            ('skates', 'Patines: un patín de ruedas azul y blanco, de perfil.'),
            ('skate', 'Monopatín: un monopatín naranja visto en diagonal, con sus ruedas.'),
        ],
    ),
]

SHEET_SIZE = 1024
SPRITE = 32


def all_icons() -> list[str]:
    return [name for *_, icons in SHEETS for name, _ in icons]
