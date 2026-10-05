# Formato del catálogo de Breakbit

Todo el contenido que usa la app va en **un único archivo JSON**: zonas (molestias), material,
ejercicios, rutinas y actividades principales. La base para editar es
[catalogo-actual.json](catalogo-actual.json), que es el contenido que tiene la app ahora
exportado a este formato.

Al integrarlo, la app comprueba el archivo al compilar. Si algo no cumple las reglas, el build
falla con un mensaje que dice qué y dónde.

## Estructura general

```json
{
  "version": 1,
  "areas": [],
  "equipment": [],
  "exercises": [],
  "routines": [],
  "mainActivities": []
}
```

- **Textos:** todos van en español y en inglés: `{ "es": "...", "en": "..." }`.
- **Ids:** en minúsculas y con guiones bajos (`chin_tuck`), únicos dentro de su sección.
- **Iconos:** el campo `icon` es opcional en todo. Si falta o no existe, la app usa uno
  genérico hasta que hagamos los iconos.

## `areas`: zonas o molestias

Son las zonas que el usuario puntúa de 0 a 5 en el onboarding y en Ajustes. Cuanto más alta la
puntuación, más ejercicios de esa zona le toca.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `neck`, `lower_back`… |
| `name` | texto es/en | sí | "Cuello" / "Neck" |
| `icon` | texto | no | Nombre del icono |
| `retired` | sí/no | no | Ver "Retirar cosas" |

```json
{ "id": "neck", "name": { "es": "Cuello", "en": "Neck" }, "icon": "neck" }
```

## `equipment`: material

El material opcional que el usuario marca si lo tiene a mano.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `mat`, `resistance_band`… |
| `name` | texto es/en | sí | "Esterilla" |
| `hint` | texto es/en | sí | Lo que aporta, en el onboarding: "Añade movilidad en el suelo" |
| `icon` | texto | no | Nombre del icono |
| `retired` | sí/no | no | Ver "Retirar cosas" |

```json
{
  "id": "mat",
  "name": { "es": "Esterilla", "en": "Mat" },
  "hint": { "es": "Añade movilidad en el suelo", "en": "Adds floor mobility" },
  "icon": "mat"
}
```

## `exercises`: ejercicios de las micropausas

Cada movimiento suelto. El planificador los elige solos o los combina para las pausas.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `chin_tuck` |
| `name` | texto es/en | sí | "Retracción cervical suave" |
| `description` | texto es/en | sí | Una frase que explica el movimiento |
| `steps` | lista de textos es/en | sí | Al menos 2 pasos: cómo hacerlo |
| `areas` | lista de ids de `areas` | sí | Al menos 1. Zonas que trabaja; la primera es la principal (la de su icono en la app) |
| `equipment` | lista de ids de `equipment` | sí | `[]` si no necesita nada |
| `durationSec` | número | sí | Entre 20 y 120 segundos |
| `posture` | `standing` · `either` · `floor` | sí | Ver abajo |
| `meetingFriendly` | `yes` · `partial` · `no` | sí | Ver abajo |
| `icon` | texto | no | Nombre del icono |
| `retired` | sí/no | no | Ver "Retirar cosas" |

**`posture`:**
- `standing`: hay que ponerse de pie.
- `either`: se puede hacer sentado, pero de pie es mejor. La app muestra "Si puedes, hazlo
  mejor de pie".
- `floor`: en el suelo; necesita esterilla o un descanso de verdad.

**`meetingFriendly`:**
- `yes`: discreto, se puede hacer en mitad de una reunión.
- `partial`: solo en una reunión en la que puedas moverte (cámara apagada, de pie).
- `no`: no apto para reuniones.

```json
{
  "id": "chin_tuck",
  "name": { "es": "Retracción cervical suave", "en": "Gentle chin tuck" },
  "description": {
    "es": "Lleva la barbilla hacia atrás sin inclinar la cabeza.",
    "en": "Draw your chin straight back without tilting your head."
  },
  "steps": [
    { "es": "Siéntate o ponte de pie con la espalda alta.", "en": "Sit or stand tall." },
    { "es": "Lleva la barbilla hacia atrás, sin bajar la cabeza.", "en": "Slide your chin back without nodding." },
    { "es": "Mantén 2 segundos y repite unas 8 veces.", "en": "Hold 2 seconds; repeat about 8 times." }
  ],
  "areas": ["neck"],
  "equipment": [],
  "durationSec": 40,
  "posture": "either",
  "meetingFriendly": "yes"
}
```

## `routines`: rutinas

Secuencias de ejercicios. Las de hasta 3 minutos pueden salir como pausas "activas"; una
actividad principal también puede usar una rutina más larga como guía.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `wake_up` |
| `name` | texto es/en | sí | "Despertar" |
| `steps` | lista de `{ "exercise": id, "seconds": número }` | sí | Ejercicios existentes, en orden |
| `icon` | texto | no | Nombre del icono |
| `retired` | sí/no | no | Ver "Retirar cosas" |

```json
{
  "id": "wake_up",
  "name": { "es": "Despertar", "en": "Wake up" },
  "steps": [
    { "exercise": "march", "seconds": 30 },
    { "exercise": "arm_swing", "seconds": 30 },
    { "exercise": "trunk_twist", "seconds": 30 },
    { "exercise": "wave", "seconds": 30 }
  ]
}
```

Tamaños de pausa, como referencia: **micro**, 30–60 s (un ejercicio); **reset**, 90–120 s (de 2
a 4 movimientos, que combina el planificador); **activa**, 2–3 minutos (una rutina).

## `mainActivities`: actividades principales

La "misión" del día, de 5 a 30 minutos.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `walk_outside` |
| `name` | texto es/en | sí | "Paseo por la calle" |
| `description` | texto es/en | sí | Una frase |
| `steps` | lista de textos es/en | sí | Cómo hacerla |
| `equipment` | lista de ids de `equipment` | sí | `[]` si no necesita nada |
| `durationMin` | `{ "min": n, "max": n }` | sí | Minutos, entre 5 y 30 |
| `shortVersionMin` | número | no | Versión corta que se ofrece al cerrar el día |
| `completionMode` | `continuous` · `accumulated` | sí | `continuous`: de una vez, con temporizador. `accumulated`: se suma en bloques a lo largo del día |
| `slots` | lista de `break` · `work` · `meeting` | sí | Dónde encaja: en un descanso, en horas de trabajo o en una reunión "puedo moverme" |
| `whileWorking` | sí/no | sí | Se hace mientras trabajas (standing desk, reunión caminando), así que no interrumpe el trabajo |
| `routine` | id de `routines` | no | Rutina que guía la actividad |
| `icon` | texto | no | Nombre del icono |
| `retired` | sí/no | no | Ver "Retirar cosas" |

```json
{
  "id": "walk_outside",
  "name": { "es": "Paseo por la calle", "en": "Walk outside" },
  "description": { "es": "Sal a caminar a un ritmo cómodo.", "en": "Head out for a walk at an easy pace." },
  "steps": [
    { "es": "Sal a la calle a un ritmo cómodo.", "en": "Head outside at a comfortable pace." },
    { "es": "Vuelve cuando se cumpla el tiempo.", "en": "Come back when the time is up." }
  ],
  "equipment": [],
  "durationMin": { "min": 10, "max": 30 },
  "shortVersionMin": 10,
  "completionMode": "continuous",
  "slots": ["break"],
  "whileWorking": false,
  "icon": "outside"
}
```

## Reglas que comprueba la app

**Generales**
- Ids únicos dentro de cada sección, y cada referencia (zonas, material, ejercicios, rutinas)
  apunta a algo que existe.
- Todos los textos en español y en inglés, sin dejar ninguno vacío.
- Sin lenguaje médico: ni curar, dolor, lesión, rehabilitación, terapia, tratamiento ni
  diagnóstico, en ninguno de los dos idiomas. Breakbit crea hábitos; no promete salud.

**Ejercicios**
- De 20 a 120 segundos, con al menos 2 pasos y al menos 1 zona.

**Cobertura** (para que siempre haya algo que proponer)
- Cada zona tiene al menos 2 ejercicios sin material.
- Cada zona tiene al menos un ejercicio sin material que no sea de suelo (`standing` o
  `either`), para poder proponerlo en horas de trabajo, y uno de esos apto para reuniones
  (`yes` o `partial`).
- Todo el material se usa en algún ejercicio o actividad. Si no, marcarlo no aportaría nada.

**Rutinas**
- Una rutina de hasta 180 segundos en total puede salir como pausa activa. Las más largas solo
  sirven para guiar una actividad principal (con su campo `routine`).

**Actividades principales**
- Entre 5 y 30 minutos, con `min` ≤ `max`.
- Si hay versión corta, está dentro del rango y por debajo del máximo.
- Al menos un `slot`.
- Siempre debe existir al menos un paseo sin material.

## Retirar cosas (no borrar)

**No cambies ni reutilices un id que ya exista.** El historial, el XP y los planes guardados
de los usuarios apuntan a ellos.

Para quitar algo, déjalo en el archivo con `"retired": true`. Desde ese momento:
- la app ya no lo propone ni lo muestra en el onboarding ni en Ajustes;
- el historial sigue sabiendo cómo se llamaba.

## Qué pasa con los usuarios que ya usan la app

- **Zonas nuevas:** empiezan en 0, así que no cambian nada hasta que el usuario las puntúe en
  Ajustes.
- **Zonas retiradas:** desaparecen del onboarding y de Ajustes, y su puntuación guardada se
  ignora.
- **Material nuevo:** nadie lo tiene marcado hasta que lo marque.
- **Material retirado:** se quita de los ajustes de cada usuario. La jornada en curso sigue
  igual y las siguientes ya no lo usan.
- **Ejercicios y actividades nuevos:** entran en los planes desde la siguiente jornada.
