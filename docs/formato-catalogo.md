# Formato del catálogo de Breakbit

Todo el contenido que usa la app va en **un único archivo JSON**:
[src/content/catalogo-breakbit.json](../src/content/catalogo-breakbit.json). Contiene las zonas
(molestias), el material, los ejercicios, las rutinas y las actividades principales, con sus
textos en español e inglés. Es la única fuente: el onboarding, Ajustes, el planificador y las
pantallas leen de ahí.

Para cambiar el contenido, edita ese archivo o sustitúyelo entero por otro con el mismo nombre.
La app lo comprueba al compilar (`pnpm build`) y al abrirla en desarrollo (`pnpm dev`). Si algo no
cumple las reglas, el build falla con un mensaje que dice qué elemento y qué problema, por ejemplo:

```text
El catálogo de contenido tiene 2 problemas:
  • exercises[0] "chin_tuck" → durationSec: 150 no vale: cada ejercicio dura 60 segundos
  • routines[0] "wake_up" → steps[0] → exercise: "trunk_twist" no existe en exercises
```

## Estructura general

```json
{
  "version": 2,
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
  genérico hasta que hagamos los iconos. El build lista los que faltan.
- **Campos:** solo los de este documento. Un campo desconocido (una errata, por ejemplo) es un
  error.

## `areas`: zonas o molestias

Son las zonas que el usuario puntúa de 0 a 5 en el onboarding y en Ajustes, en el orden del
archivo. Cuanto más alta la puntuación, más ejercicios de esa zona le tocan. Las puntuaciones solo
**priorizan**: con todo a 0 la jornada tiene el mismo movimiento, repartido entre todas las zonas.

Pasar muchas horas sentado no es una zona: romper esos ratos es la base de la app, y el
planificador te pone de pie a menudo sea cual sea la puntuación.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `neck`, `lower_back`… |
| `name` | texto es/en | sí | "Cuello" / "Neck" |
| `icon` | texto | no | Nombre del icono |

```json
{ "id": "neck", "name": { "es": "Cuello", "en": "Neck" }, "icon": "neck" }
```

## `equipment`: material

El material opcional que el usuario marca si lo tiene a mano, en el orden del archivo. Solo
añade variedad: la mayoría de las pausas siguen sin material.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `mat`, `resistance_band`… |
| `name` | texto es/en | sí | "Esterilla" |
| `hint` | texto es/en | sí | Lo que aporta, en el onboarding: "Añade movilidad en el suelo" |
| `icon` | texto | no | Nombre del icono |

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
| `areas` | lista de ids de `areas` | sí | Al menos 1. Zonas que trabaja, por importancia: la primera es la principal (cuenta más para esa zona y es la de su icono) |
| `equipment` | lista de ids de `equipment` | sí | `[]` si no necesita nada |
| `durationSec` | número | sí | Siempre `60`: 1 ejercicio = 1 minuto (ver abajo) |
| `posture` | `standing` · `either` · `floor` | sí | Ver abajo |
| `meetingFriendly` | `yes` · `partial` · `no` | sí | Ver abajo |
| `icon` | texto | no | Nombre del icono |

**`durationSec`:** siempre 60. Es la micropausa entera, no un minuto de esfuerzo seguido: los pasos
pueden incluir mantener, cambiar de lado, descansar unos segundos o seguir apartado de la pantalla.
Un ejercicio por lados reparte el minuto entre ambos (un estiramiento, unos 20–30 s por lado). No
hace falta añadir repeticiones solo para llenarlo.

**`posture`:**
- `standing`: hay que ponerse de pie. Son los que rompen el rato sentado: cada dos pausas de
  trabajo, una es de pie.
- `either`: se puede hacer sentado, pero de pie es mejor. La app muestra "Si puedes, hazlo
  mejor de pie".
- `floor`: en el suelo. Solo en descansos (con menos frecuencia) y en "Tengo un hueco"; nunca en
  horas de trabajo ni en reuniones.

**`meetingFriendly`:**
- `yes`: puede salir durante una reunión.
- `partial`: solo si puedes moverte o tienes la cámara apagada.
- `no`: nunca en una reunión.

En la app, las pausas en reunión solo se planifican en las reuniones marcadas "Puedo moverme"
(ahí entran `yes` y `partial`). En una reunión en la que no puedes moverte no hay pausas.

**Cómo elige el planificador**, por orden: la puntuación de las zonas; el material que tienes (sin
material primero: el material pesa poco en horas de trabajo y más en descansos o en "Tengo un
hueco"); la postura y el momento; si estás en una reunión; variedad respecto a los ejercicios
recientes; y levantarte con regularidad.

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
  "durationSec": 60,
  "posture": "either",
  "meetingFriendly": "yes"
}
```

## `routines`: rutinas

Secuencias de ejercicios del catálogo, por id: los ejercicios no se repiten dentro de la rutina, y
cada uno dura 1 minuto también aquí. Las de hasta 3 ejercicios (3 minutos) pueden salir como pausas
en un descanso o en "Tengo un hueco" de 3 minutos; las más largas guían una actividad principal (con
su campo `routine`) o un hueco de 5 o 10 minutos. Si la actividad o el hueco duran más que la
rutina, se repite entera; el último ejercicio nunca se alarga. El material y la postura de una
rutina salen de sus ejercicios.

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `id` | texto | sí | `wake_up` |
| `name` | texto es/en | sí | "Despertar" |
| `steps` | lista de `{ "exercise": id, "seconds": 60 }` | sí | Ejercicios existentes, en orden; 60 segundos cada uno |
| `icon` | texto | no | Nombre del icono |

```json
{
  "id": "wake_up",
  "name": { "es": "Despertar", "en": "Wake up" },
  "steps": [
    { "exercise": "march", "seconds": 60 },
    { "exercise": "arm_swing", "seconds": 60 },
    { "exercise": "wave", "seconds": 60 }
  ]
}
```

Tamaños de pausa, como referencia: **micro**, 1 minuto (un ejercicio); **reset**, 2 minutos (dos
ejercicios que combina el planificador, empezando por uno de pie); **activa**, 3 minutos (una rutina
de 3 ejercicios).

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
| `whileWorking` | sí/no | sí | Se hace mientras trabajas (escritorio elevable, reunión caminando): no cuenta como interrupción ni aparta las pausas de su alrededor |
| `routine` | id de `routines` | no | Rutina propia que guía la actividad: más de 3 ejercicios y que quepa entera en `durationMin.min` |
| `icon` | texto | no | Nombre del icono |

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
- Ids únicos dentro de cada sección, en minúsculas con números y guiones bajos, y cada referencia
  (zonas, material, ejercicios, rutinas) apunta a algo que existe.
- Todos los textos en español y en inglés, sin dejar ninguno vacío.
- Sin campos desconocidos.
- Sin lenguaje médico: ni curar, dolor, lesión, rehabilitación, terapia, tratamiento ni
  diagnóstico, en ninguno de los dos idiomas. Breakbit crea hábitos; no promete salud.

**Ejercicios**
- 60 segundos, con al menos 2 pasos y al menos 1 zona.
- `posture` y `meetingFriendly` con uno de sus valores.

**Rutinas**
- Al menos un paso, cada uno con un ejercicio existente y de 60 segundos.

**Actividades principales**
- Entre 5 y 30 minutos, con `min` ≤ `max`.
- Si hay versión corta, está dentro del rango y por debajo del máximo.
- Al menos un `slot`, sin repetir.
- Si tiene `routine`, es una rutina propia de más de 3 minutos (no una de pausa) que cabe entera en
  su duración mínima.

**Cobertura** (para que siempre haya algo que proponer)
- Cada zona tiene al menos 2 ejercicios sin material, para planificar una jornada aunque el usuario
  no tenga nada.
- Cada zona tiene al menos un ejercicio sin material que no sea de suelo (`standing` o `either`)
  y apto para reuniones (`yes` o `partial`).
- Todo el material se usa en algún ejercicio o actividad. Si no, marcarlo no aportaría nada.
- Hay al menos una actividad principal sin material que no sea solo para reuniones.

## Cambiar ids

Todavía no hay usuarios, así que se puede cambiar o quitar cualquier cosa. Los datos guardados que
apunten a un id que ya no existe se ignoran: no hace falta marcar nada como retirado.
