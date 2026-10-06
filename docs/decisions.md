# Breakbit — Decisiones de producto y arquitectura

Registro vivo de decisiones tomadas al arrancar el MVP. Prioridad de fuentes:
`breakbit_mvp_master_v1.md` > `breakbit_backlog_tecnico_mvp_v1.md` > `breakbit_mvp_v1.md` >
`breakbit_handoff_claude.md` > `references/` > `assets/icons`.

Los valores numéricos viven en `src/domain/config.ts`.

## Plataforma y stack

- React 19 + Vite + TypeScript strict (TS 6.0: typescript-eslint aún no soporta TS 7).
- React Router **solo en Declarative Mode** (`BrowserRouter`, `Routes`, `Route`, `Outlet`, `Link`,
  `Navigate`, `useNavigate`, `useParams`, `useLocation`). Sin loaders, actions, fetchers, Data/Framework
  Mode ni SSR. El router solo resuelve URL → layout/pantalla.
- Estado con Zustand + `persist` sobre IndexedDB (`idb-keyval`). `localStorage` solo para pistas
  síncronas (tema resuelto antes del primer pintado).
- CSS Modules + variables CSS. Tema con `data-theme` en `<html>`; "Sistema" se resuelve en runtime.
- i18n propio, español e inglés completos desde el inicio. `es.ts` es la fuente; `en.ts` está obligado
  por tipos a tener la misma forma.
- `src/domain/` es TypeScript puro: ESLint prohíbe importar React, Zustand, `state/`, `services/`, `ui/`,
  `features/` o `app/`.
- Notificaciones: MVP sin backend, puerto `NotificationScheduler` desacoplado. Web Push queda para el
  futuro sin cambiar dominio ni UI. En móvil, sin push no hay avisos con la app cerrada.
- `.npmrc` del proyecto apunta a `registry.npmjs.org` (el registro global de la máquina es corporativo).

## Conflictos entre documentos (resueltos por prioridad)

| Tema | Decisión |
|---|---|
| Nombre | Breakbit. Los mocks y el manifest de iconos aún dicen "PosturaMon". Copy orientado a movimiento, no a postura. |
| Aplazar | +5/+10/+15 min (no "+30 min"). |
| Saltar | "Descartar pausa" con aviso de −50 XP. Chips de motivo opcionales en la misma hoja. |
| Estados | `pending`, `notification_sent`, `postponed`, `completed`, `skipped`, `missed`. "Ignorada" es métrica. |
| Intensidad | `round(horas efectivas × 0,5 / 0,75 / 1)`. |
| Separación | Ideal 45–90 min; mínimo tras recalcular 35 min. |
| Mood | Muy bien / Bien / Cargado / Bastante mal. |
| Fin de jornada | Pantalla completa sin navegación inferior. |
| Navegación | `Hoy · Progreso · Ajustes` + pastilla flotante `Tengo un hueco` (según `bottom_nav_reference`). |
| Ajustes | Paleta arena/verde de `components_reference`; el mock azul solo marca estructura. |
| Nivel vs. fase | Nivel = XP. Fase del avatar = resultado semanal. Nunca se mezclan. |
| Valoración post-ejercicio | Fuera del MVP (roza lenguaje de mejora médica). |
| Próxima jornada | Mapa `dayOverrides` por fecha en vez de un único `nextWorkdayOverride`. |
| Progresiones de ejercicios | Fuera del MVP. |

## Reglas acordadas

- **Ventana de micropausa**: 30 min desde `scheduledAt`, sin gracia. Solo se ofrecen los aplazamientos
  que caben. Ignorar consume la misma ventana. Superada sin empezar → `missed`. Un `Vamos` pulsado antes
  de expirar permite terminar después.
- **XP**: +100 micropausa, +300 actividad principal, +20 a la primera, +10 pausa extra, +200 día bueno,
  +100 día perfecto, −50 descartar. Regreso ×1,5 solo sobre XP base de micropausas planificadas y
  actividad principal. Ledger idempotente con claves deterministas. XP total ≥ 0.
- **Niveles**: curva abierta, centralizada en `config.ts` (inicialmente 1000 XP por nivel). No se
  protege el umbral: una penalización puede bajar el progreso dentro del nivel.
- **Descansos**: el planificador puede colocar una micropausa normal cerca o dentro de un descanso, o
  usarlo para la actividad principal. Sin tipo especial "Me he levantado".
- **Tengo un hueco**: la regla temporal es la protección principal anti-farming. El tope diario de
  extras con XP es opcional (`GAP.extraXpDailyCap`, `null` lo desactiva).
- **Recuperación al cierre**: máximo 1 micropausa por jornada; cuenta para el ≥70 %; puede convertir el
  día en bueno si la actividad principal está hecha; da XP base sin bonus "a la primera"; conserva
  `origin: 'recovery'`. La actividad principal no se recupera así.
- **Día perfecto** (propuesta): 100 % de micropausas planificadas + actividad principal.
- **"A la primera"** (propuesta): completada sin aplazar y empezada antes del primer recordatorio.
- **Interrupción real** (propuesta): duración de pausas hechas en tiempo de trabajo. La actividad
  principal en descanso o en reunión "puedo moverme" no interrumpe.
- **Semana**: lunes–domingo, evaluada al abrir la app tras cerrarse. Solo días desde el onboarding.
- **Fase inicial del avatar** (propuesta): 1.

## UI

- Pixel art solo en iconos, avatar y gamificación. Componentes interactivos modernos.
- Títulos en *Pixelify Sans*, texto en *Nunito* (autoalojadas con `@fontsource`).
- `Tengo un hueco`: 20 px de separación con el tab inferior para evitar toques accidentales. La barra
  inferior usa un crema propio (`--color-nav`) y su contorno es una ola continua de lado a lado que
  sube por encima de todo el botón (`app/navigation/wave.ts`, calculada con el tamaño real del botón).
- Rojo de acciones destructivas: ladrillo apagado (`#b9574c`), más acorde con la paleta arena. En oscuro,
  salmón con texto oscuro (el blanco no llegaba a AA).
- "Pausa extra" es **azul** (`--color-extra`). El icono `extra` (violeta en el arte original) se recolorea
  en `scripts/import-icons.py`.
- Controles segmentados con pista propia (`--color-control-track`) para diferenciarse del fondo.
- Escritorio: columna centrada de 520 px máx. sobre fondo arena con patrón suave.

## Iconos

- `scripts/import-icons.py` limpia restos del sprite (fragmentos en el borde derecho y líneas en el
  superior) en 44 de los 90 iconos, revisados visualmente, y regenera 16/24/48 desde el master de 32.
- Pendiente de arte: `lamp`, `clock`, `pending`, `work` y `meeting` ocupan menos lienzo que el resto;
  no hay icono de idioma/globo (se usa `reading`).
- Assets aún inexistentes (avatar, poses, evoluciones, ejercicios, habitación) serán placeholders
  detrás de un registry estable.

## Dominio base (Fase 2)

- **Fechas sin librería**: `DateKey` ('YYYY-MM-DD') con aritmética en UTC sobre días de calendario
  (los cambios de hora nunca mueven un día) y `atTime(date, 'HH:mm')` para pasar a instante local.
  No ha hecho falta date-fns. Los tests fijan `TZ=Europe/Madrid` e incluyen los cambios de hora.
- **Semanas** de lunes a domingo; id ISO-8601 (`2026-W40`).
- `UserSettings.schedule` es un `DaySchedule` (inicio, fin, descansos, comida), el mismo tipo que usan
  los overrides puntuales.
- **Calendario**: `resolveDaySchedule` aplica override de la fecha → plantilla. Acciones puras:
  `markDayOff` ("Hoy no trabajo"), `setCustomSchedule` ("Cambiar horario"), `repeatSchedule`
  ("Sí, repetir", sin override si coincide con la plantilla) y `skipUntil` ("No trabajo mañana" +
  próximo día laboral; marca libres solo los días que serían laborables).
- "¿Mañana tienes el mismo horario?" se aplica a la **próxima jornada laboral**, no al día natural
  siguiente. La UI nombra el día real: "¿El lunes tienes el mismo horario?".
- **Validación de horario**: hora válida, fin > inicio, comida y descansos dentro de la jornada,
  duraciones > 0 y sin solapes (tocarse está permitido). Los turnos que cruzan medianoche quedan
  **fuera del MVP**.
- **Catálogo**: desde la revisión de contenido vive en un único JSON,
  `src/content/catalogo-breakbit.json` (ver "Catálogo en JSON" al final y `docs/formato-catalogo.md`).
- `posture: 'either'` implica la recomendación "Si puedes, hazlo mejor de pie" (sin campo aparte).
  El tipo de pausa (micro/reset/active) se deriva de la duración.
- **Selección ponderada**: peso de zona = 1 + 2 × slider. La zona anterior se evita salvo que pese al
  menos el doble que todas las demás juntas. El ejercicio anterior nunca se repite si hay alternativa;
  los recientes pesan 0,25. Trabajo de suelo solo en descansos; en reuniones solo movimientos
  discretos. RNG con semilla (fecha + reroll) para planes reproducibles. Ampliada en "Catálogo en
  JSON".
- **Actividad principal**: filtra por material y contexto (en reunión solo las compatibles; en tiempo
  de trabajo, las que no requieren un descanso real). Favorece las que cubren la duración preferida;
  "Otra misión" excluye la actual. Pasear por la calle siempre está disponible.

## Planificador (Fase 3)

Todo en `src/domain/planner/`, puro y determinista (semilla `fecha#reroll`).

- **Número de pausas**: `round(horas efectivas × 0,5 / 0,75 / 1)`, mínimo 1; sin pausas si quedan
  menos de 30 min. Si la app se abre tarde, se planifica solo lo que queda de jornada (con el número
  proporcional a ese tiempo).
- **Actividad principal**: se propone en el descanso más largo; si no hay, en una reunión marcada
  "puedo moverme"; si no, en el centro del tramo libre de trabajo más largo. Cada actividad declara en
  qué contextos encaja (`slots`: descanso, trabajo, reunión); p. ej. "Reunión caminando" solo en
  reuniones. La duración se ajusta al hueco. La elección del usuario ("Cambiar actividad", "Otra
  hora") se respeta tal cual.
- **Reparto**: las pausas se reparten en los tramos libres (sin comida, reuniones ocupadas ni la zona
  de la actividad principal: 20 min antes y 35 min después) en proporción a su duración, centradas
  con medio hueco en los bordes y en marcas de 5 min. Los **descansos libres son posiciones
  preferentes**: se fijan como pausa y el resto se reparte alrededor, siempre que la separación siga
  siendo ≥ 35 min.
- **Contenido por contexto**: en reunión, un ejercicio discreto; en descanso, una rutina dinámica
  (2–3 min) no usada hoy y sin repetir ejercicios de la pausa anterior; en trabajo, un ejercicio
  (≤ 60 s) y cada tercera pausa un **reset combinado de 2–4 movimientos (90–120 s)**. Nunca se repite
  un ejercicio de la pausa anterior si hay alternativa.
- **Reajuste (`rebalance`)**: solo mueve micropausas planificadas, pendientes y futuras; se calcula
  desde las horas originales más el estado actual, así que es **idempotente**. Empuja hacia delante
  (separación ≥ 35 min respecto al último movimiento, fuera de comida, reuniones y actividad
  principal; la comida reinicia la separación); tras una pausa perdida, la siguiente puede adelantarse
  hasta 10 min; tras una completada antes de tiempo, la siguiente se acerca para no superar 90 min; si
  ya no cabe antes de `fin − 10 min`, queda `missed` (`no_room`), sin deuda.
- **Interrupción estimada**: solo cuentan las pausas en tiempo de trabajo; las de descansos o
  reuniones y las actividades principales hechas mientras trabajas (escritorio elevable, reunión
  caminando) no interrumpen.
- **Cambio de contexto en un reajuste**: si una pausa cae en otro contexto (descanso ↔ trabajo,
  fuera de su reunión), se actualiza su `slot` real y se revalida su contenido; solo si deja de ser
  válido (suelo fuera de un descanso, rutina o movimiento no discreto en una reunión, material que no
  tienes) se elige contenido nuevo para ese contexto, con la misma variedad y de forma reproducible.
  Si el contexto no cambia, el contenido no se toca. La interrupción se calcula con el `slot` real.
- Al colocar pausas (al planificar y al reajustar) se reservan siempre 3 min, la pausa más larga, para
  que cualquier contenido de reemplazo quepa sin mover la pausa.

## Estado y persistencia (Fase 4)

- **Un único store** Zustand persistido en IndexedDB (`breakbit:state`) con: preferencias, fecha de
  onboarding (`onboardedAt`), ajustes, excepciones de calendario por fecha, registros diarios (con su
  plan y el resumen congelado al cerrar), progreso (fase del avatar, semanas evaluadas, habitación),
  libro de XP y metadatos. Lo derivado (racha, nivel, estadísticas) nunca se guarda.
- **Acciones finas** por áreas (`state/slices`): preferencias, ajustes/onboarding (rechazan horarios
  inválidos), calendario (envoltorios de `domain/calendar`) y datos (borrar / reemplazar). Las del día,
  pausas, XP y semanas llegan con sus fases.
- **Migraciones versionadas** (`STATE_VERSION = 2`): la v1 de la Fase 1 (solo preferencias) se migra
  conservando tema e idioma. Datos de una versión más nueva se rechazan.
- **XP total**: el libro se aplica en orden temporal con suelo en 0 (una penalización no deja el total
  negativo y lo siguiente suma desde ahí).
- **Log de eventos** en un almacén IndexedDB aparte, una clave por evento (añadir no reescribe el
  historial). Tipos del master §25 más `day_off_marked`.
- **Reloj único** (`services/clock`): `clock.now()` para la lógica y `useNow(resolución)` para la UI
  (valor en caché por tic, estable dentro de un render). En desarrollo admite desplazamiento (viaje en
  el tiempo), que se conserva al recargar; en producción siempre es la hora real.
- **Copias**: exportar/importar JSON (estado + eventos). Al importar se migra a la versión actual y se
  valida **la estructura completa**: tipos, valores permitidos, fechas y horas válidas, horarios
  coherentes, planes y actividades, XP, progreso y eventos; se rechazan claves que podrían alterar
  prototipos (`__proto__`…) y archivos desmesurados. Si algo no es válido no se toca nada.
- **"Borrar datos"** elimina ajustes, onboarding, calendario, días, progreso, XP y el log de eventos;
  solo se conservan tema e idioma.
- **DevPanel** (solo desarrollo, pestaña en el borde izquierdo): reloj simulado (+5 min, +15 min, +1 h,
  +1 día, ir a fecha/hora, volver a la hora real), recuento de datos, exportar copia y borrar datos con
  doble confirmación.
- Pendiente para cuando haga falta: avisos efímeros (toasts) y estado del permiso de notificaciones
  (fases 7–8), `storage.persist()` (fase 15) y datos semilla en el DevPanel (cuando exista el cierre de
  día).

## Onboarding (Fase 5)

- **Rutas** `/onboarding/:step` (bienvenida, jornada, molestias, material, ritmo, resumen) a pantalla
  completa, con dos guardas declarativas: sin onboarding, todas las rutas de la app llevan a la
  bienvenida; con onboarding hecho, `/onboarding/*` lleva a Hoy. `/dev/kit` queda fuera de las guardas.
- **Borrador**: lo elegido vive en `sessionStorage` (sobrevive a una recarga a mitad) y solo se guarda
  en el store al pulsar `Empezar`, que también borra el borrador y pide `storage.persist()`.
- **CTA fija**: `Siguiente` / `Empezar` se queda abajo (sticky, con safe area) en pasos largos; al
  final de la página queda debajo del contenido, así que nunca tapa campos. Un campo enfocado cerca del
  borde se desplaza por encima del botón.
- **Jornada**: plantilla habitual, no horario rígido (sin interruptor de "horario variable"). Jornada,
  descanso habitual y comida se editan igual, como Inicio / Fin. El dominio sigue guardando
  `{ start, durationMin }`; la conversión está en el formulario (`timeRange.ts`) y un fin anterior al
  inicio se informa por bloque ("El descanso debe terminar después de empezar"). Se mantienen las
  validaciones de dominio (dentro de la jornada, sin solapes, sin turnos que cruzan medianoche) y al
  menos un día laborable. Mientras haya errores, `Siguiente` está desactivado.
- **Material**: sin opción "Ninguno". No marcar nada es `equipment: []`; los movimientos sin material y
  caminar son la base y siempre están disponibles. Cada material describe lo que añade, sin lenguaje
  de desbloqueo.
- **Ritmo**: la descripción de Suave/Normal/Activo es secundaria; lo destacado es el cálculo con el
  planificador real para la jornada elegida (pausas al día e interrupción aproximada, más la actividad
  del día).
- **Resumen**: jerarquía en vez de tarjetas iguales: jornada en tarjeta normal, molestias y material
  como etiquetas sin tarjeta, ritmo destacado (`tinted`) y avisos como bloque informativo (`muted`).
  Cada sección tiene `Editar`. El avatar solo aparece en la bienvenida (evolución completa) y, pequeño,
  en el resumen.
- **Avisos**: el permiso del navegador solo se pide al pulsar `Activar notificaciones`, nunca al entrar
  en la pantalla. Si está bloqueado no se muestra ese botón (el navegador no volvería a preguntar): se
  explica cómo activarlo en los ajustes del navegador y se puede empezar igualmente. Al volver a la
  pestaña se relee el estado (sin preguntar). `notifications.enabled` se guarda según el permiso final.
- **Copy**: cercano, corto y práctico; sin lenguaje médico ni de videojuego en la configuración. Los
  nombres visibles son naturales; los de zonas y material vienen del catálogo.
- **Design system**: componentes genéricos nuevos `MultiChipGroup` (días), `InlineMessage` (pista o
  error), `Tag` (etiqueta estática), `Avatar` (con placeholder por fase) y `EvolutionStrip`; `Wordmark`
  pasa a `ui/components`. Todos están en `/dev/kit`. No hay variantes visuales propias del onboarding.
- **Desarrollo en red local**: el servidor de Vite escucha en la red (`server.host`) para probar desde
  el móvil. Por `http` a una IP el navegador no da un contexto seguro: las notificaciones no estarán
  disponibles ahí (se verá el estado "no admite avisos"); por eso los ids de eventos usan
  `crypto.getRandomValues` y no `randomUUID`.

## Inicio de jornada y Hoy (Fase 6)

- **El día se crea al empezarlo**: un día laborable no tiene plan hasta pulsar `Empezar jornada`
  en "Tu día" (`/day/start`). Antes solo se muestra una previsión calculada al vuelo (horario,
  pausas previstas, interrupción estimada) que no se guarda; el plan con sus ids, horas y
  actividades definitivas se persiste al confirmar. El aviso de inicio de jornada (Fase 7) llevará
  a esa misma pantalla.
- **"Tu día"** sirve para empezar y para ajustar un día ya empezado (`Ajusta tu día`, desde
  "Te quedan X de jornada"). Muestra racha, pausas e interrupción calculadas con el planificador
  real; horario de hoy (mismo formulario que el onboarding), actividad principal, reuniones,
  material del día y `Hoy no trabajo`. Nada se guarda hasta `Empezar jornada` / `Guardar cambios`.
- **El horario de hoy** cambia solo ese día: se guarda como excepción de calendario únicamente si
  difiere de la plantilla (y desaparece si se vuelve a la habitual). Empezar un día no laborable lo
  convierte en laborable.
- **Replanificar no reescribe el pasado** (`domain/day/planDay`): lo hecho, en curso o ya vencido se
  conserva; el resto del día se planifica desde ahora y las pausas nuevas guardan la distancia con
  las ya hechas. Antes de empezar, la propuesta se rehace entera con cada cambio.
- **Cambiar la actividad** con el día en marcha mueve solo la actividad y las pausas que chocan con
  ella (las demás no cambian de hora ni de contenido). Una actividad ya empezada o hecha no se
  cambia. Se elige de una lista filtrada estrictamente por el material del usuario (con
  `equipment: []` solo aparecen las que no necesitan nada) y con hora libre dentro de la jornada; si coincide con la comida o con una reunión se avisa sin bloquear. En la comida cuenta
  como tiempo fuera del trabajo (no suma interrupción).
- **Reuniones**: inicio, fin y "Puedo moverme durante esta reunión". Deben solaparse con la jornada
  y terminar después de empezar.
- **`Hoy no trabajo`** (con confirmación) en Hoy y en "Tu día", también con el día empezado: el
  registro pasa a día libre y se puede deshacer conservando el plan.
- **Catálogo**: se elimina "Trabajo de pie improvisado"; "Trabajo de pie" solo se propone con
  escritorio elevable (lo garantizan el filtro y un test de propiedades del planificador).
- **"Ver ejercicio"** en Hoy es solo una vista previa en una hoja: no cambia el estado de la pausa,
  no marca `startedAt`, no da XP ni cuenta como empezarla. El ejercicio de verdad, tras `Vamos`,
  tendrá su pantalla en la fase del ciclo de la pausa.
- **"A mano hoy"** solo aparece si el plan necesita material, y solo con ese material. Sin material,
  Hoy no la muestra y "Tu día" lo dice en una línea discreta. Criterio general: no se pintan cards
  que no aporten información o una acción.
- **Estimaciones con texto explícito**: "5 pausas previstas", "~4 min de interrupción", para que no
  parezcan datos ya realizados (también en el ritmo del onboarding).
- **Hoy** según el estado del día: sin empezar, en marcha, horario terminado, descanso, día libre.
  En marcha: tiempo restante, próxima pausa (con "Ver ejercicio", paso a paso), actividad del día,
  "A mano hoy" (si hace falta material), progreso (pausas, interrupción real, actividad)
  y la línea de tiempo completa con lo pasado atenuado y la próxima pausa destacada.
- **Avatar en Hoy** con protagonismo, en su fase real, con racha, XP de hoy y nivel con su barra.
- **Racha** (`domain/progress/streak`): jornadas buenas consecutivas desde el onboarding; los días
  libres y no laborables no cuentan ni rompen; un laborable sin abrir o no bueno la rompe; hoy suma
  solo cuando ya es bueno. **Día bueno** (`domain/day/progress`): ≥70 % de las pausas planificadas
  (recuperadas incluidas, extras no) y la actividad principal; un día sin nada planificado no es
  bueno. Ambas reglas están listas para el cierre de jornada (Fase 11).
- **Próxima pausa**: la primera sin hacer cuya ventana de 30 min sigue abierta. Los estados reales
  (avisada, aplazada, perdida…) llegan con el ciclo de vida de la Fase 7.
- **Design system**: `OptionList` (selección única con icono y descripción; servirá también para
  "Tengo un hueco"), `FlowLayout` (pantallas de flujo con la acción fija abajo, usado por el
  onboarding y "Tu día") y `AvatarCard`.
- Las horas se muestran en formato 24 h en los dos idiomas, igual que el usuario las escribe.

## Ciclo de la pausa y avisos (Fase 7)

- **Motor** (`domain/pause/advance`, ejecutado por `app/engine`): hace avanzar los días en curso
  hasta "ahora" al abrir la app, cada 15 s, tras cada acción, al volver a la pestaña y al viajar en
  el tiempo en desarrollo. Depende solo de la hora, no de que el aviso llegara, y es idempotente:
  - a su hora (o a su nueva hora tras aplazarla) la pausa pasa a `notification_sent`;
  - cada 10 min sin respuesta cuenta un recordatorio (evento `exercise_ignored`). Solo
    responden `Vamos`, aplazar o descartar: abrir la pantalla (o el aviso) no es una respuesta,
    así que si el usuario no actúa siguen llegando recordatorios mientras quede ventana;
  - 30 min después de su hora original sin `Vamos` pasa a `missed`, aunque se aplazara. La
    siguiente puede adelantarse hasta 10 min y, si era un solo movimiento en horario de trabajo,
    pasa a reset (2–4 movimientos). La perdida sigue contando como perdida;
  - una pausa empezada con `Vamos` nunca caduca durante el día.
  Los días anteriores aún abiertos se ponen al día igual (sus pausas quedan perdidas); su cierre
  con resumen llega en la Fase 11.
- **Pantalla de decisión** (`/pause/:id`): un bloque reservado para el avatar animando (con el
  placeholder de su fase hasta que exista el arte), el ejercicio y, justo debajo y juntas, las
  acciones en orden de preferencia: `Vamos` (lo que queremos que haga), `Ahora no puedo` con
  +5/+10/+15 (solo las opciones que vuelven antes de que cierre la ventana) y `Descartar pausa ·
  −50 XP` en tono de aviso suave (hoja con motivo opcional). Al no caber ninguna opción de aplazar,
  se dice y quedan `Vamos` y `Descartar`. Si la pausa no está esperando respuesta (próxima, hecha,
  descartada o perdida), la pantalla lo explica.
- **Aplazar no la aparta**: una pausa aplazada sigue esperando respuesta hasta que vuelva. En Hoy
  conserva `Vamos` y su pantalla también, con "Te la volvemos a proponer a las 09:55"; se puede
  hacer antes si te queda un hueco.
- **Aplazado frente a ignorado**: `postponeMinutes` suma solo aplazamientos explícitos; el tiempo
  sin responder (`ignoredMinutes` = consumido − aplazado) se mide aparte. Ambos son de cada pausa,
  no del día. En pantalla solo se llaman "aplazados" los explícitos ("Ya la has aplazado
  10 min"); cuando ya no caben todas las opciones se indica el margen que queda ("Quedan 14 min
  para hacerla"). `notificationOpenedAt` solo se apunta al abrir desde un aviso, para métricas.
- **"A la primera"**: se decide al pulsar `Vamos`: sin aplazamientos y antes del primer
  recordatorio. El XP de completar llega con el reproductor (Fase 8); el de descartar (−50) se
  apunta ya, con clave única para no repetirse.
- **Aplazar** mueve la pausa desde ahora y reajusta las siguientes si quedan a menos de 35 min.
- **Avisos**: una función pura (`domain/notifications/schedule`) da la agenda del día con ids
  deterministas: inicio de jornada (mientras no se haya empezado), cada pausa a su hora y
  recordatorios cada 10 min sin respuesta, con la misma etiqueta para que se reemplacen y no se
  apilen. Se respetan las preferencias (`enabled`, `dayStart`, `microbreaks`) y los días libres.
- **Canal local** (`services/notifications/scheduler`, puerto `NotificationScheduler`): muestra
  cada aviso una vez (recuerda los ids entre recargas), descarta los muy atrasados (más de 5 min,
  p. ej. tras suspender el equipo) y no muestra nada mientras la app está delante, porque lo cubre
  el banner. Un canal Web Push podrá sustituirlo sin tocar el dominio.
- **Service worker** mínimo (`public/sw.js`): al pulsar un aviso enfoca la app y navega, o la abre
  en `/pause/:id?src=notif`. Sin caché offline todavía (Fase 15). Requiere contexto seguro (https o
  localhost); por http a una IP no hay avisos del sistema.
- **Dentro de la app**: con una pausa pendiente de respuesta, la tarjeta "Próxima pausa" de Hoy se
  destaca con `Vamos` (y `Continuar` si está en curso), las demás pestañas muestran un banner, y el
  título de la pestaña cambia a "Pausa ahora · Breakbit". Es también el único aviso cuando las
  notificaciones están desactivadas o bloqueadas.
- **"Próxima pausa"** muestra, por este orden: la que espera respuesta, la que está a medias
  (empezada y sin terminar) y la siguiente por llegar. Una pausa abandonada a medias nunca tapa
  una nueva pendiente.
- **Pausas combinadas** se nombran "3 movimientos seguidos"; cada movimiento se detalla dentro.
- **Pantalla del ejercicio** (`/pause/:id/play`) con la estructura definitiva: bloque para el
  avatar en su fase más evolucionada haciendo el movimiento, anillo de progreso grande y centrado
  con el tiempo, y descripción y pasos debajo. "Si puedes, hazlo mejor de pie" solo cuando el
  movimiento lo admite y nunca en una reunión. El anillo avanza y la pausa se completa (con su XP)
  en la Fase 8.
- **Design system**: `AvatarStage` (espacio para el arte del avatar) y `ProgressRing`
  (temporizador circular), ambos en `/dev/kit`.
- **Material**: el paso del onboarding deja claro que es opcional y que sin material todo funciona
  igual; el resumen lo dice como "Nada extra: tus pausas serán movimientos suaves sin material", y
  "Tu día" usa "Hoy no hace falta material" (en Hoy no se muestra nada).
- DevPanel: atajo "Próxima pausa" para saltar a la hora del siguiente aviso.

## Reproductor, pausa hecha y XP (Fase 8)

- **Reproductor** (`/pause/:id/play`): tras `Vamos` el temporizador arranca solo. Avatar en su
  fase más evolucionada mostrando el movimiento, anillo con el tiempo restante, zona trabajada
  (categoría), descripción y pasos. Controles fijos abajo: `Pausar`/`Seguir` y `Siguiente`/`Hecho`.
  Las rutinas y los resets combinados van movimiento a movimiento ("Movimiento 2 de 4", con
  "Después: …"); cada uno pasa solo al acabar su tiempo. Al terminar el último (o con `Hecho`) la
  pausa queda completada.
- **Rutinas, un movimiento por toque**: `Siguiente` avanza exactamente un movimiento y `Hecho`
  solo aparece en el último, así que terminar antes un movimiento nunca cierra la rutina. Los
  toques en los 800 ms siguientes a un cambio de movimiento se ignoran: un doble toque, o un toque
  justo cuando se acaba el tiempo, pertenecen al movimiento que termina y no saltan el siguiente
  (ni completan la rutina cuando `Siguiente` se convierte en `Hecho` bajo el dedo).
- **El tiempo se mide con marcas de tiempo**, no con contadores, así que no se desvía con la
  pestaña en segundo plano. `elapsedSec` guarda lo que de verdad se movió (sin las pausas del
  temporizador) y alimenta el tiempo real de interrupción y de movimiento.
- **`Hecho` antes de tiempo cuenta** como completada en un ejercicio suelto o en el último
  movimiento: la app confía en el usuario (busca el hábito, no vigilar). Cerrar el reproductor deja la pausa en curso; `Continuar` la empieza de nuevo.
- **XP de una pausa** (`domain/progress/awards`), con claves únicas para no contar dos veces:
  +100 por pausa planificada (×1,5 solo sobre esa base el día de regreso tras una ausencia), +20 si
  fue a la primera (nunca multiplicado); una pausa recuperada da +100 sin bonus. Los XP de
  actividad principal, día bueno/perfecto y pausas extra llegan en sus fases.
- **Pausa hecha** (`/pause/:id/done`): celebración pequeña sobre el avatar (sin animación si el
  sistema pide reducir movimiento), el nombre de la pausa (sin la duración real, que se guarda para
  las estadísticas), el XP ganado con su desglose en una línea ("+100 pausa · +20 a la primera"),
  progreso del día y del nivel, y `Volver a lo mío`. Si la pausa llegó desde un aviso, intenta
  cerrar la pestaña; si el navegador no lo permite, vuelve a Hoy con "Listo. Vuelve a lo tuyo.".
- **Toasts**: confirmaciones breves en la parte superior, de una en una y durante 4 s (aplazada con
  su nueva hora, descartada con −50 XP, vuelta al trabajo). No se guardan.
- Línea de tiempo: las pausas hechas a la primera muestran esa insignia.
- Design system: `Toast` y `Celebration`, en `/dev/kit`.

## Actividad principal (Fase 9)

- **Pantalla única** (`/main/:id`): antes de empezar muestra qué es, su modalidad y duración
  ("Continua · 20 min" o "En bloques · 30 min"), cuándo y dónde cae ("13:00 · en tu descanso"), el
  material y los pasos. Acciones: `Empezar` (o `Empezar un bloque`), `Cambiar actividad u hora` y `Ya la he
  hecho` (secundaria). Una vez empezada, la misma pantalla pasa a ser la sesión, con una nota
  discreta: "Puedes salir de aquí: el tiempo sigue contando".
- **La sesión se guarda en la actividad** (`accumulatedSec` y `runningSince`), no en la pantalla:
  se puede salir, bloquear el móvil o cerrar la app y el tiempo sigue contando. Es lo que pide un
  paseo de 20 min o un bloque de trabajo de pie.
- **Continua y acumulable comparten mecánica** (empezar, parar, seguir, terminar) y cambian el
  enfoque: la continua es una cuenta atrás con `Pausar`/`Seguir`; la acumulable suma bloques
  ("10:00 de 30 min", "Bloque en marcha · 3:12") con `Parar bloque`/`Otro bloque`.
- **Se completa sola** cuando el tiempo suma, en pantalla o, si la app estaba en otra cosa, en el
  siguiente tick del motor (que la da por hecha en el momento en que el tiempo sumó). `Terminar`
  antes de tiempo pide confirmación ("Llevas 5 min de 20 min. Contará como hecha."), porque no se
  puede deshacer; confirmada, cuenta como hecha con el tiempo real: la app confía en el usuario.
- **"Ya la he hecho"**, con una confirmación breve, la apunta como hecha con su duración prevista
  (el backlog pide poder completarla manualmente). Cuenta igual para el día bueno.
- **Nunca caduca durante la jornada**: no tiene ventana de 30 min ni recordatorios; el cierre de
  día (Fase 11) decidirá qué pasa si queda pendiente.
- **Encaje con las pausas**: al empezarla por primera vez se mueve a la hora real
  (`currentScheduledAt`) y las pausas que chocarían con ella se recolocan; al terminarla, las que
  quedan a menos de 35 min después se mueven más tarde.
- Una actividad con rutina guiada (movilidad) muestra el movimiento que toca según el tiempo
  hecho ("Movimiento 2 de 7", con "Después: …"); al pausar se queda en ese movimiento.
- **XP**: +300 por día (clave `main:{fecha}`), ×1,5 el día de regreso. Pantalla de completado
  compartida con las pausas: "+300 actividad principal", el día con la actividad principal y las
  pausas en filas separadas, y el nivel aparte. Lo recién hecho va primero: tras la actividad,
  "Actividad principal completada" y después "Pausas de hoy · 0 de 1"; tras una pausa, al revés.
  Así "0 de 1 pausas" no parece el resumen de la actividad.
- **En Hoy**, la tarjeta "Actividad de hoy" tiene una única acción: `Ver actividad` antes de su
  hora, `Vamos` cuando llega (destacada), y `Continuar` con el tiempo hecho ("5 de 20 min") si
  está en curso o en pausa. `Cambiar` pasa a la pantalla de la actividad, donde caben la actividad,
  la hora y "Ya la he hecho" sin apretar la tarjeta. El inicio de jornada mantiene su `Cambiar`.
- **Avisos**: uno a su hora mientras no se haya empezado (un cambio de hora es un aviso nuevo) y
  otro, "¡Actividad hecha!", si una sesión se completa sola con la app en segundo plano. Siguen la
  preferencia de avisos de pausas; no hay recordatorios repetidos.
- Componentes compartidos por pausas y actividad: `ActivityHero` (avatar, título y qué es),
  `TimerRing` (anillo con el tiempo) y `CompletionView` (pantalla de completado).

## Tengo un hueco (Fase 10)

- **Dos pantallas** (desde la Fase 15, un modal a pantalla completa que nace del botón; ver
  "Movimiento"): `/gap` pregunta cuánto
  tiempo hay (30 s, 1 min, 3 min, 10+ min) con el avatar y su bocadillo; `/gap/:opción` muestra
  la propuesta ("Propuesta de 1 minuto"), cómo se hace, qué gana y qué cambia, con `Empezar
  ahora` y `Otra propuesta`. Sin jornada en marcha se explica (y, si no ha empezado, se ofrece
  empezarla).
- **Qué se propone**, por orden:
  1. Si una pausa está esperando respuesta (o aplazada), esa misma: "Es tu pausa de las 10:00".
  2. Con 10+ min y la actividad principal pendiente (o en pausa), la actividad: "+300 XP · Tu
     actividad de hoy", solo si se puede hacer ahí y en ese momento: con su material y según el
     contexto (en una reunión "puedo moverme", solo lo que encaja en una reunión, como la reunión
     caminando o trabajar de pie; fuera de ella, lo que no la necesita). Si no, se propone una
     rutina como al resto. La opción lo anuncia en la lista ("Buen momento para tu actividad")
     con la misma regla.
  3. Si la próxima pausa cae en ≤45 min y han pasado ≥35 min desde el último movimiento (o
     desde el inicio de la jornada), se **adelanta**: se hace ahora con contenido para el tiempo
     elegido, cuenta como esa pausa planificada (+100 XP, sin "a la primera": aún no había
     existido un primer aviso) y las siguientes se reajustan a su distancia. La propuesta lo dice
     claro: "Cuenta como tu próxima pausa · La de las 10:00: ya no te avisará".
  4. Si no, es una **pausa extra**: no mueve ni sustituye ninguna pausa del plan ("Tus pausas
     siguen igual") y no cuenta para el 70 %. Da +10 XP solo si han pasado ≥20 min desde el último
     movimiento y no se ha llegado al tope diario opcional (3, `GAP.extraXpDailyCap`). Si no da
     XP se presenta en positivo, antes y después: "Pausa extra · sin XP esta vez", con el motivo
     debajo ("Te has movido hace poco. Muévete igualmente: tus pausas siguen igual.") y, al
     terminar, "Suma igualmente a tu movimiento de hoy", sin mostrar un "+0 XP".
- **Último movimiento** (para las reglas de 35 y 20 min): el final de cualquier movimiento real
  completado, sea pausa planificada, pausa extra o actividad principal.
- **Contenido según el tiempo**: 30 s, un movimiento de hasta 30 s; 1 min, uno de hasta un
  minuto; 3 min, una rutina corta (movimientos discretos en una reunión); 10+ min sin actividad
  pendiente, la rutina más larga que encaje (movilidad de 5 min). Evita los movimientos de la
  última pausa y respeta material y molestias. La semilla es fija por día, opción y número de
  extras, así que la propuesta no cambia al volver y `Otra propuesta` es reproducible.
- Las pausas extra se reproducen y celebran como las demás ("+10 pausa extra"), aparecen en la línea de tiempo con la insignia "Pausa
  extra" y se cuentan aparte en el progreso de Hoy y en la pantalla final ("+1 pausa extra").
- Evento `spontaneous_break` con la opción elegida y el resultado (`due`, `advance`, `extra`).
- Dev: el servidor de desarrollo ignora `coverage/`, que recargaba la app en cada informe.

## Cierre de jornada (Fase 11)

- **Entrada**: desde 10 min antes del fin de jornada, Hoy muestra "Tu jornada termina a las
  17:00 · Cerrar jornada" (y "Jornada terminada" después), y llega un aviso a esa hora si los
  avisos de fin de jornada están activos. `/day/end` es pantalla completa, sin navegación
  inferior (resolución del conflicto con la referencia, que la muestra).
- **Pantalla** (sigue `day_end_reference`): avatar celebrando si el día es bueno, XP del día con
  el de día bueno/perfecto ya incluido ("+200 día bueno · +100 día perfecto"), veredicto
  ("¡Día perfecto!", "¡Día bueno!") y, si el día no fue bueno, un texto neutro, sin dramatizar
  ("Así ha ido tu día · Hoy te has movido menos de lo previsto") y los datos; objetivo diario con
  la racha o con lo que falta ("Te faltan 2 pausas · Te falta la actividad principal"), y fichas: pausas y perdidas, a la primera, aplazadas ("No pasa nada"), actividad
  principal, interrupción real y movimiento, más la frase "Hoy has conseguido X de movimiento
  con solo Y de interrupción real". En un día flojo no se muestran un "+0 XP" ni fichas a cero.
- **Recuperación**: si hay alguna pausa planificada perdida, "Recupera una pausa" ofrece la más
  reciente, una sola por día; si con ella el día pasaría a bueno, lo dice. Se reproduce como
  cualquier pausa, queda como `origin: 'recovery'` conservando `missReason`, cuenta para el 70 %
  y da +100 sin "a la primera" ni multiplicador. Al terminar se vuelve al cierre, que lo recalcula
  todo a partir del plan: día bueno/perfecto, XP de cierre, fichas, resumen y racha.
- **Actividad principal pendiente**: "Hacerla ahora" (o "Continuar") y, solo si la actividad
  declara una versión corta en el catálogo (`shortVersionMin`: el paseo por la calle y el trabajo
  de pie, 10 min), "Versión corta · 10 min" antes de empezar (la alternativa breve del backlog).
  Nunca se acorta una actividad que no la declare. No se "recupera" como las pausas.
- **Cerrar antes del fin de jornada** pide confirmación con lo que queda ("¿Cerrar ya la
  jornada? Quedan 1 h 10 min de jornada. Aún tienes 1 pausa por hacer. Tu actividad principal
  sigue pendiente. Lo que quede pendiente no contará para hoy."); después se puede cerrar.
- **Valoración** ("¿Cómo terminas hoy?": Muy bien, Bien, Cargado, Bastante mal), opcional, solo
  para la tendencia personal.
- **Próxima jornada**: "¿Mañana tienes el mismo horario?" (o "¿El lunes…?" si la siguiente no es
  mañana). `Sí` repite el horario de hoy en esa fecha; `Cambiar` abre el editor de horario solo
  para esa jornada; `No trabajo` pregunta "¿Cuándo vuelves?" (7 días, por defecto el siguiente
  laboral) y marca libres los días intermedios. La plantilla semanal nunca cambia. Todo se aplica
  al pulsar `Cerrar jornada`; sin respuesta, el calendario se queda como está.
- **Al cerrar**: lo que seguía abierto (pausas, actividad o una sesión a medias) queda perdido
  con `day_closed`, se apunta +200 si el día es bueno y +100 más si es perfecto (nunca
  multiplicados) y se guarda el resumen (`summary`) con el XP total del día. Hoy muestra "Día
  cerrado · Día perfecto · 3/3 pausas · +300 XP"; si no fue bueno, solo los datos ("1/3 pausas ·
  +100 XP").
- **Cierre perezoso**: al abrir la app, los días anteriores que quedaron en marcha se cierran
  igual (con su XP de día bueno/perfecto) y las jornadas laborables que nadie empezó quedan
  `absent` (no buenas). El día del onboarding nunca cuenta como ausente ni rompe la racha.
- **Bonus de regreso**: al empezar una jornada, si mirando hacia atrás aparece una laborable
  sin trabajar antes que una trabajada, ese día lleva ×1,5 en el XP base. Solo una vez por
  ausencia: al día siguiente ya hay una trabajada en medio.
- Accesibilidad: un grupo de opciones sin elegir sigue siendo alcanzable con el tabulador (el
  primero recibe el foco).
- DevPanel: atajo "Fin de jornada" (10 min antes del final).

## Evaluación semanal (Fase 12)

- **Nivel y fase no se mezclan**: el **nivel** depende solo del XP (curva de `config.ts`) y la
  semana nunca lo toca; la **fase** (evolución del avatar) depende solo del resultado semanal.
- **Cuándo**: cada semana (lunes a domingo, id ISO `2026-W41`) se evalúa una sola vez, la
  primera vez que se abre la app después de que termine, justo después del cierre perezoso de
  los días (así los días de esa semana ya están cerrados o ausentes). La semana del onboarding es
  la primera.
- **Varias semanas pendientes** (vuelta tras días sin abrir la app): se evalúan en orden
  cronológico; cada una parte de la fase que dejó la anterior y los desbloqueos de habitación se
  aplican en ese mismo orden.
- **Qué cuenta**: las jornadas laborables planificadas desde el onboarding. Los días libres y
  los anteriores al onboarding no cuentan; una laborable no empezada cuenta como planificada y no
  buena, salvo el propio día del onboarding.
- **Resultado** (`config.ts`): menos de 3 jornadas planificadas, semana neutral (no mueve la
  fase); ≥70 % de días buenos, buena (sube una fase); 40–69 %, "Semana estable" (se mantiene);
  <40 %, con menos movimiento (baja una fase). Siempre entre la fase 1 y la 5. Sin cooldown: una
  semana buena posterior recupera la fase de inmediato. En la fase 1 una semana floja no castiga
  más.
- **Habitación**: con el avatar ya en la fase 5, cada semana buena desbloquea el siguiente objeto.
  El orden vive en `content/roomItems.ts` (la lista de master §30.8, con lo más grande al final);
  la lógica semanal solo recibe esa lista. Pasar de la 4 a la 5 es evolución, no objeto: el
  primero llega con la siguiente semana buena estando ya en la 5. Los objetos nunca se pierden,
  aunque el avatar involucione. Los iconos pixel existentes son el placeholder del arte de la habitación
  (`RoomScene`, en `/dev/kit`).
- **Racha de semanas**: semanas buenas seguidas; las neutrales ni suman ni la rompen.
- **Se muestra una vez**: Hoy enseña la tarjeta "Tu semana · ¡Semana buena! · 4 de 5 días
  buenos · Ver mi semana" hasta que se ve. `/week/:semana` (pantalla completa) cuenta el
  resultado con el avatar en su nueva fase (celebrando si sube), la tira de evolución, la racha
  de semanas si son 2 o más y, si toca, "Tu habitación estrena: Planta". `Seguir` la marca como
  vista (`lastSeenWeek`).
- **Copy sin castigo**: "¡Semana buena! · Tu avatar evoluciona a Erguido", "Semana estable · Tu
  avatar se mantiene", "Semana con menos movimiento · Tu avatar vuelve a Erguido. Con una semana
  buena, lo recupera" (o "Tu avatar sigue en Encorvado" en la fase 1) y "Semana corta · Menos de
  3 jornadas: no cuenta para la evolución".
- El resultado guarda también su lunes, la fase anterior y el objeto desbloqueado, para que el
  historial (Fase 13) no tenga que recalcularlo.
- La pantalla celebra cuando sube la fase o llega un objeto nuevo; tiene la `X` de las pantallas
  completas (cerrar no la marca como vista). En la habitación, el objeto recién llegado lleva una
  etiqueta pequeña "Nuevo" además del marco.
- Tira de evolución: 12 px entre fases y cada nombre puede usar la mitad del hueco a cada lado,
  así caben en una línea sin pegarse en un móvil de 375 px (en español y en inglés).
- DevPanel: salto "+1 semana" y "Escenarios de prueba" (solo en desarrollo): semana buena que
  evoluciona (Sedentario → Activo, segunda semana buena seguida), semana estable (3 de 5) y semana
  buena ya en la fase 5 que trae la lámpara. Sustituyen los datos por una semana de ejemplo y la
  evalúa el flujo real.

## Progreso (Fase 13)

- **Orden** (backlog §17, `progress_reference`): Tu evolución, Tu constancia, Resumen semanal,
  Molestias que más cuidas, Esta semana y, al final, Tus semanas (historial).
- **Tu evolución**: tira de fases con la actual marcada, racha (días) y XP total arriba. En vez
  de la barra "320 / 500 XP · A 180 XP de tu próxima evolución" de la referencia (mezcla nivel y
  fase), muestra el progreso de la semana hacia la siguiente fase: "Esta semana: 2 de 5 días
  buenos" con su barra y "Te faltan 2 días buenos para que tu avatar evolucione" (en la fase 5,
  "para un objeto nuevo en tu habitación"). Cuenta las jornadas que quedan por venir según el
  calendario. Si ya no llega: "Esta semana ya no llega para evolucionar; cada día bueno sigue
  sumando a tu racha". Ese mensaje sale directamente en cuanto los días buenos que faltan superan
  las jornadas planificadas que quedan esa semana (hoy cuenta mientras pueda volverse bueno; los
  días libres no). Semana corta y semana ya buena tienen su texto. Debajo, la racha de
  semanas y, en la fase 5 o con objetos, la habitación.
- **Tu constancia**: heatmap tipo GitHub de 20 semanas (unos cinco meses, legible en móvil), una
  columna por semana con el lunes arriba, y flechas para periodos anteriores (hasta el
  onboarding). El tono depende de cuánto del día se hizo, no del número bruto de ejercicios: sin
  actividad, algo (<40 %), media (40–69 %), alta (≥70 % sin ser día bueno) y día bueno. Los días
  libres y los fines de semana no laborables se ven distintos (borde discontinuo) porque ni
  suman ni rompen nada; los días antes del onboarding o por venir quedan como cuadrícula tenue.
  Un token propio, `--color-heat-empty`, separa en ambos temas "sin actividad" de la cuadrícula
  tenue (en oscuro el tono de las pistas quedaba casi igual que la tarjeta).
  Una jornada no empezada cuenta como "sin actividad". Para lectores de pantalla, la cuadrícula
  se resume ("18 días buenos de 30 jornadas, de … a …") y cada día tiene su texto al pasar el
  ratón.
- **Resumen semanal** (lunes a domingo): pausas completadas, % a la primera (sobre las hechas),
  movimiento e interrupción real, y debajo días buenos, actividad principal, aplazadas,
  ignoradas, descartadas, perdidas, pausas extra, minutos en micropausas y XP de la semana (las
  métricas del master §23 y §25). Sin jornadas, "Aún no hay jornadas esta semana".
- **Molestias que más cuidas** ("Lo que has movido por zona · últimas 4 semanas"): solo datos de
  actividad por zona (ejercicios y minutos), nunca mejoría física ni menos dolor: cada ejercicio de una pausa hecha cuenta para cada zona que trabaja, con su parte del
  tiempo real de la pausa ("Espalda · 38 ejercicios · 23 min"). Las cuatro zonas más trabajadas.
- **Esta semana**: hasta tres cosas que contar. Los cambios frente a la semana anterior salen en
  los dos sentidos, con texto neutro y sin juicio ("Aplazaste 3 avisos más que la semana
  pasada", "7 min menos de movimiento que la semana pasada", "Dejaste pasar 2 avisos menos…"),
  pero solo si son relevantes (al menos 2 en un recuento o 5 min de movimiento); si no aportan,
  no se fuerzan. Se compara con la semana pasada **hasta el mismo día** ("Comparado hasta el
  miércoles"), para no medir una semana a medias contra una entera. Después, datos llanos
  ("Actividad principal: 3 de 3 días", "Has hecho el 73 % de tus pausas"), solo cuando hay algo
  hecho: un "0 %" no se muestra.
- **Tus semanas**: las 8 últimas, la más reciente arriba, con su resultado, fechas, días buenos
  y cambio de fase; cada una abre su pantalla de resultado.
- Todo se calcula al vuelo desde los días guardados (resúmenes de los cerrados, el plan de hoy)
  y los resultados semanales; no se guarda nada nuevo.
- Componentes: `Heatmap` (en `/dev/kit`); `IconButton` admite `disabled`.
- En un móvil estrecho, las cabeceras de tarjeta dejan el título en su línea y pasan cifras o
  flechas debajo; los valores del resumen no se parten ("3 de 3").
- DevPanel: escenario "Historial de 8 semanas" (planes reales del planificador, más pausas hechas
  según avanzan las semanas, un día libre y uno sin empezar, hoy en marcha), para revisar
  Progreso con datos.

## Ajustes (Fase 14)

- **Pantalla** (estructura de `settings_reference`, paleta arena/verde): jornada habitual (inicio,
  fin, descanso, comida y días), molestias prioritarias (las tres más altas), equipamiento,
  intensidad ("Normal · 6 pausas al día", con el planificador real), notificaciones,
  apariencia, idioma, tus datos y "Acerca de". El avatar no aparece (master §31).
- **Mismos formularios que el onboarding**: los campos de días laborables, molestias, material e
  intensidad viven en `features/profile/` y los usan los dos (el horario ya era compartido,
  `ScheduleFields`). Cada parte se edita en `/settings/:sección` con borrador: nada cambia hasta
  `Guardar`; `Cancelar` lo descarta. Un horario no válido no se puede guardar.
- **Rehacer el plan al cambiar**: molestias, material o intensidad replanifican lo que queda de
  hoy si la jornada está en marcha (`replanDay`): lo hecho o en curso se queda, el horario y las
  reuniones también, y la actividad principal se mantiene salvo que ya no tengas su material.
  Solo cambia lo pendiente y por venir: lo completado, lo que está en curso, lo que ya tocaba
  (avisado o aplazado) y la actividad principal empezada quedan intactos. Si la actividad
  principal pendiente deja de ser compatible al quitar material, se sustituye por otra válida
  (no se deja el día sin ella). El aviso lo dice ("Tus pausas de hoy se han ajustado").
- **Horario habitual**: nunca toca una jornada ya iniciada (se confirmó al empezar). Con la
  jornada empezada, la pantalla y el aviso dicen "Se aplica desde tu próxima jornada"; si hoy aún
  no se ha empezado, "Se aplicará a tus próximas jornadas, empezando por la siguiente que
  inicies". Los días futuros se planifican con los ajustes vigentes al empezarlos.
- **Notificaciones**: tres interruptores (inicio de jornada, pausas y actividad principal, fin de
  jornada) cuando el navegador lo permite. Si aún no hay permiso, se explica y solo se pide al
  pulsar "Activar notificaciones"; si está bloqueado, un texto práctico y válido para cualquier
  navegador ("Permítelas en la configuración de este sitio y vuelve aquí. Mientras, verás tus
  pausas al abrir Breakbit"); si no hay soporte, que verás las pausas al abrir Breakbit. El estado se relee al volver a la app.
  Sonido y vibración son los del sistema (no hay ajuste propio en web).
- **Tus datos** ("Todo se guarda en este dispositivo: no hay cuentas ni servidor"):
  exportar copia (JSON con estado y eventos), importar copia (se valida entera antes de
  preguntar "¿Importar esta copia? Sustituirá todos los datos… por los de la copia del …"; un
  archivo no válido o de una versión más nueva se rechaza sin tocar nada) y borrar todos los datos
  (con confirmación; se conservan tema e idioma y se vuelve a la bienvenida).
- Importar una copia la deja exactamente como estaba (ajustes, días con planes y resúmenes,
  libro de XP, progreso, habitación y eventos), sustituyendo —no mezclando— lo que hubiera.
- Apariencia e idioma: en móvil, título arriba y selector a todo el ancho; en pantalla ancha, en
  una línea.
- **Acerca de**: versión, qué es Breakbit, que no es una herramienta médica ni sustituye a un
  profesional, y que los datos no salen del dispositivo.
- La descarga del JSON es un servicio compartido con el DevPanel (`services/download`).

## PWA, accesibilidad y repaso visual (Fase 15)

- **Manifest e iconos**: `manifest.webmanifest` con nombre Breakbit, `display: standalone`,
  `start_url`/`scope`/`id` en `/`, colores de los tokens (crema `#f6f1e4`) e iconos 192, 512 y
  512 maskable. Metaetiquetas para iOS (`apple-touch-icon`, título y barra de estado).
- **Iconos pixel propios** (sustituyen a los del starter pack): 100 iconos dibujados en una
  cuadrícula de 16×16 en `scripts/pixel-icons/icons/` (por categorías: cuerpo, material,
  movimiento, estados, interfaz, jornada, habitación y nuevos), con una paleta común
  (`palette.py`) y las mismas reglas: contorno oscuro de 1 px, luz desde arriba a la izquierda,
  2–3 tonos por material, el mismo margen, coral solo para la zona que se trabaja y verde de
  marca para la persona. `pnpm icons` (`build.py`) comprueba cada cuadrícula y genera un SVG
  por icono (rectángulos con bordes nítidos: se ven bien a 16, 24, 32 y 48 px en cualquier
  pantalla; ~100 KB en total frente a 1,4 MB de PNG), los PNG de las notificaciones y
  `iconNames.ts`. `preview.py` saca una hoja de revisión.
  - Las zonas del cuerpo son una familia: la misma figura con camiseta verde y la zona en coral
    (cuello, hombros, columna de espaldas, muñeca), más el ojo y una persona sentada.
  - Se acaban los duplicados (casa/"en este dispositivo", taza/descanso, reloj/pendiente,
    portátil/trabajo, los dos rayos) y los iconos que no se entendían.
  - Nuevos: caras para el ánimo del día, papelera, exportar, importar, amanecer, atardecer y
    escudo; ya se usan en "Tus datos", en el horario de Ajustes y en los avisos.
- **Avatar** (sustituye a los placeholders; 21 sprites de 128×128 en `public/avatar/`, ~175 KB):
  - Cinco fases, como la imagen de la evolución: un mono encorvado tecleando un portátil de piedra
    sobre una roca; un cavernícola con barba y piel sentado en un tronco ante una "pantalla" de
    piedra; el developer sedentario (camiseta azul, encorvado, con café); el developer activo
    (sudadera verde, erguido, con agua) y el optimizado, de pie en un standing desk, con cinta,
    cascos al cuello y una planta.
  - Poses: trabajando (de perfil, en su puesto: Hoy, tiras de evolución, inicio y cierre normal),
    ánimo ("¡vamos!", puño arriba: "Es hora de moverte" y "Tengo un hueco"), celebración (brazos
    arriba y confeti: pausa o actividad hecha, día y semana buenos) y pulgar arriba (onboarding);
    las tres de frente y de cintura para arriba, con la cara grande. La fase 5 tiene además la
    pose de demostración de los ejercicios.
  - Onboarding: la bienvenida muestra la tira entera y cada paso siguiente una fase con el
    pulgar arriba, de la 1 (paso 2) a la 5 ("Todo listo").
  - El arte se generó con IA a partir de `docs/prompts-avatar.md` (1024×1024, "píxeles" de ~8 px).
    `pnpm avatar <zip o carpeta>` (`scripts/pixel-avatar/import.py`) lo convierte: transparencia
    dura (el original tenía rellenos al 95–99 % y halos), rejilla de 8 px con el desfase que más
    bordes alinea y el color dominante de cada celda, 64 colores por imagen (máxima cobertura,
    para que el confeti conserve sus colores) y encuadre: las poses de cuerpo entero sobre la
    misma línea de suelo y centradas; las de medio cuerpo, cortadas en el borde inferior. Los
    originales no se suben al repo (12 MB).
  - Se muestran a 64, 96 y 160 px con píxeles nítidos; en pantallas 1x los tamaños que reducen
    el sprite (64 y 96) se escalan suave. En los escenarios el arte se apoya en la línea de suelo.
  - El avatar dibujado por código (64×64) se descartó por demasiado simple.
- **Marca** (logo pack v2, originales en `docs/brand/`; `scripts/gen-brand-assets.py` genera
  todo lo publicado):
  - El wordmark sustituye al brote pixel + texto: verde oscuro en el tema claro y menta en el
    oscuro; los dos están en la página y el CSS muestra el del tema de la app (no el del
    sistema). 132 px de alto y 256 colores (~10 KB, igual a la vista).
  - Iconos de instalación y de pantalla de inicio: la "B" sobre crema (algunas plataformas
    rellenan la transparencia de negro), al 62,5 % del ancho como en el pack; la maskable, dentro
    de la zona segura.
  - Favicon: la "B" verde oscuro para navegadores claros y menta para oscuros (según el sistema,
    que es lo que decide el color de la pestaña), más `favicon.ico`.
  - Todo entra en la carcasa sin conexión.
- **Sin conexión**: el service worker propio (`public/sw.js`) guarda la "carcasa" de la versión:
  página, JS y CSS construidos, fuentes, manifest, iconos de la app y los iconos pixel
  (SVG, ~100 KB; se ven desde la primera pantalla, antes de que el worker exista). La lista y la
  versión las rellena el plugin `build/swPrecache.ts` al terminar el build (hash del contenido:
  cualquier cambio crea una versión nueva y borra la anterior). Navegación: red primero y, sin
  red, la página guardada; el resto, caché primero. Se ignora `Vary` al buscar en caché (los
  scripts de módulo llevan `Origin` y el servidor responde con `Vary`). En desarrollo no se
  guarda nada.
- **Instalación**: Ajustes muestra "Instalar Breakbit" mientras no esté instalada: botón con el
  diálogo del navegador cuando lo ofrece (`beforeinstallprompt`), instrucciones para iOS
  (Compartir → Añadir a pantalla de inicio) o para el menú del navegador en otro caso. Al
  instalar se vuelve a pedir `storage.persist()`.
- **`storage.persist()`**: se pide al terminar el onboarding y al instalar. "Tus datos" dice si
  el almacenamiento está protegido y, si no, ofrece "Proteger tus datos".
- **Build**: dependencias en un chunk `vendor` aparte (sin el aviso de tamaño).
- **E2E (Playwright, `pnpm e2e`)**: contra el build de producción (`vite preview`), con el reloj
  de la página controlado (`page.clock`), en móvil táctil a 375 px y en escritorio. Cubren: una
  jornada entera (onboarding, empezar, pausa con +120 XP, hueco, cierre), que los datos
  sobreviven a una recarga, abrir sin conexión (iconos incluidos), manifest instalable y el tipo
  de cada transición (y que no hay ninguna con "reducir movimiento").
- **Accesibilidad**:
  - axe (WCAG 2.2 A y AA) en ~20 pantallas de una jornada, en claro y oscuro, sin violaciones.
    El mismo recorrido exige objetivos táctiles ≥44 px y ningún scroll horizontal. Excepción: los
    siete días de la semana comparten fila y a 375 px miden ~41 px de ancho (44 de alto; el
    mínimo AA de 24 px se cumple de sobra).
  - Contraste: `tokens.test.ts` comprueba todos los pares de color que usan los componentes en
    los dos temas (4,5:1 texto, 3:1 foco y contornos). Para cumplirlo: el verde primario claro
    pasa de `#2a8a59` a `#268254` (blanco encima: 4,3 → 4,8:1), hay tokens de texto verde y ámbar
    (`--color-primary-text`, `--color-warning-text`; la etiqueta "aplazada" no llegaba a 3:1), el
    gris de pendiente y el gris sutil se oscurecen un poco, y el degradado de "Tengo un hueco"
    baja de tono para que el blanco se lea (en oscuro estaba en 2,75:1).
  - Objetivos táctiles: chips, segmentos y botones pequeños miden 44 px (antes 40, 36 y 38).
  - Foco: anillo sólido del color primario (antes verde al 40 %). Tras navegar, el foco pasa al
    título de la pantalla nueva (`ScreenStart`), así el teclado y el lector de pantalla empiezan
    ahí y no en el enlace que se pulsó. Un test recorre Hoy y Ajustes con Tab y exige anillo
    visible en cada control.
- **Repaso visual** (capturas a 375 px en claro y oscuro de todas las pantallas frente a
  `references/`): los chips en columnas iguales nunca son más estrechos que su texto ("Bastante
  mal" se salía y daba 2 px de scroll horizontal en el cierre) y, si no caben, pasan a otra
  línea. La fecha de la cabecera empieza en mayúscula también en "Buenos días".
- **Misma cabecera en las pantallas de actividad** (revisión): "Es hora de moverte", el
  ejercicio, "¡Pausa hecha!", la actividad principal (y su final) y "Tengo un hueco" empiezan
  igual: botón de cerrar arriba, la imagen del avatar y el título debajo (`ActivityHero`). En
  "¡Pausa hecha!" la X hace lo mismo que "Volver a lo mío"; en una rutina, el progreso de los
  movimientos va junto a la X; la propuesta del hueco lleva ← (vuelve a las opciones) y su
  etiqueta entre la imagen y el título.
- **"Tengo un hueco" como modal**: sale de las pestañas a pantalla completa (sin barra), crece
  desde el botón y, al cerrar con la X, se encoge de vuelta en él y regresa a la pantalla desde
  la que se abrió (o a Hoy si se entró directamente).
- **Movimiento** (View Transitions API del navegador, sin librerías):
  - El router sigue en modo declarativo: `<Routes location>` muestra la pantalla anterior hasta
    que el navegador tiene su imagen y luego cambia (`useScreenLocation`). `BrowserRouter`
    actualiza de forma síncrona (`useTransitions={false}`) para que el cambio quepa en la
    transición.
  - Cada cambio tiene su tipo (`transitionKind`): las pestañas y los pasos del onboarding se
    deslizan de lado en el orden de la barra; ir más adentro (una pausa, el inicio de jornada,
    una sección) hace subir la pantalla nueva y volver la deja caer; "Tengo un hueco" crece y se
    encoge desde su botón; lo demás funde. La barra inferior se queda quieta entre pestañas y
    baja o sube al entrar o salir de un flujo a pantalla completa.
  - Las acciones que guardan y navegan a la vez (Vamos, Hecho, aplazar, descartar, empezar o
    cerrar la jornada, empezar el hueco, guardar ajustes…) arrancan la transición antes de
    guardar (`runScreenTransition`), para que la imagen de salida sea lo que se estaba viendo.
  - Las hojas inferiores suben desde abajo y bajan al cerrarse, se cierren como se cierren; los
    avisos caen y se van hacia arriba (una copia inerte hace la salida: `useLeaveAnimation`).
    Filas y chips se hunden un poco al pulsarlos.
  - Con "reducir movimiento" no hay transiciones. Sin soporte del navegador, los cambios son
    instantáneos como antes.
  - El botón de cerrar de los avisos pasa a un objetivo de 44 px.
- **Limitaciones conocidas**: las horas usan el selector nativo del navegador, que las muestra
  en el formato del idioma del navegador (un Chrome en inglés enseña 9:00 AM aunque la app esté
  en español). En móvil los avisos solo llegan con la app abierta (sin backend; Web Push es
  trabajo futuro).

## Catálogo en JSON

- **Una sola fuente**: `src/content/catalogo-breakbit.json` contiene zonas, material, ejercicios,
  rutinas y actividades principales con sus textos es/en. La app lo importa tal cual (`CATALOG`); no
  hay listas de zonas o material en tipos, componentes ni traducciones. `BodyArea` y `EquipmentId`
  son `string`, y `discomfort` es un mapa parcial (una zona sin valor cuenta como 0).
- **Validación al compilar** (`build/catalogCheck.ts` + `src/content/validateCatalog.ts`): ids únicos
  por sección, referencias existentes, textos es/en, rangos (ejercicios 20–120 s y ≥ 2 pasos,
  actividades 5–30 min), valores de `posture`, `meetingFriendly`, `completionMode` y `slots`, campos
  desconocidos, lenguaje médico y cobertura (todo el material se usa; cada zona tiene ≥ 2 ejercicios
  sin material, uno de ellos de escritorio y apto para reuniones; hay una actividad sin material).
  `pnpm build` falla y el servidor de desarrollo muestra el error, con el elemento y el problema. El
  build avisa de los iconos que el catálogo nombra y aún no existen (se usa uno genérico).
- **Sin compatibilidad hacia atrás**: no había usuarios, así que el catálogo anterior se sustituyó
  entero (sin `retired` ni migraciones). Ids desconocidos en datos guardados se ignoran.
- **"Tiempo sentado" deja de ser una zona**: romper los ratos sentado es la base de la app, no una
  molestia. Cada 2.ª pausa de trabajo o reunión (empezando por la primera) exige un ejercicio
  `standing`, y los resets combinados empiezan siempre por uno, sea cual sea la puntuación de las
  zonas (`MOVEMENT.standingEvery`). Las puntuaciones solo priorizan zonas.
- **Pesos** (`SELECTION`): un ejercicio cuenta 1 para su zona principal, 0,6 para la segunda y 0,4
  para las demás. El material pesa 0,15 en el escritorio, 0,6 en un descanso y 0,8 en "Tengo un
  hueco"; el suelo, 0,4 en un descanso y 1 en "Tengo un hueco" (en trabajo y reuniones no entra).
  Resultado en 200 jornadas de prueba: con todo el material marcado, ~1 de cada 7 pausas lo usa; con
  un solo material, ~1 de cada 20. Unas 3 de cada 4 pausas de escritorio te ponen de pie.
- **"Tengo un hueco"** es tiempo elegido: admite trabajo de suelo fuera de reuniones.
- **Rutinas**: hasta 180 s pueden ser pausas; las más largas guían una actividad o un hueco de 10+ min.
  Su peso sigue a las zonas de sus movimientos (media de los pesos de sus zonas principales).
- **Resets**: un movimiento largo (el paseo corto, 90 s) puede ser un reset por sí solo.
- **Reuniones**: en una reunión "puedo moverme" entran `yes` y `partial`; nunca `no` ni suelo. En una
  reunión en la que no puedes moverte no se planifican pausas.
- **Actividades `whileWorking`** (trabajo de pie, reunión caminando): no llevan los márgenes de
  20/35 min sin pausas alrededor, porque no interrumpen el trabajo.
- Iconos para el catálogo: `band` → `resistance_band` y `sedentary` → `seated` (marcador de la fase 1
  y métrica de interrupción). Zonas nuevas dibujadas con el mismo código que cuello y hombros (figura
  en verde, la zona en coral): `upper_back` (de espaldas, omóplatos), `lower_back` (de espaldas, zona
  lumbar sobre la cintura) y `hips` (cuerpo entero, cadera y muslos). `back_pain` se elimina.

## Publicación en GitHub Pages

- **URL**: https://davidgl1987.github.io/breakbit/ (repo `Davidgl1987/breakbit`). Cada push a `main`
  ejecuta `.github/workflows/deploy.yml`: lint, tests, build con `BASE_PATH=/breakbit/` y despliegue
  con `actions/deploy-pages`. En el repo, Settings → Pages → Source debe ser "GitHub Actions".
- **Sub-ruta**: la app funciona en `/` (desarrollo, preview, E2E) y bajo `/breakbit/`. Vite toma la
  base de `BASE_PATH`; el router usa `BASE_URL` como `basename` (con la barra final, Hoy queda en
  `/breakbit/`, dentro del alcance del service worker); el manifest usa rutas relativas; el service
  worker resuelve la carcasa y los enlaces de las notificaciones contra su `scope`, y la lista de
  precarga lleva la base.
- **Enlaces directos**: GitHub Pages no tiene fallback de SPA; el workflow copia `index.html` como
  `404.html`, así que `/breakbit/progress` o el enlace de una notificación abren la pantalla correcta
  (con estado 404, que el navegador muestra igual).
- El plugin de precarga no actúa si el build ha fallado, para que se vea el error real.

## Ajustes de interfaz tras el avatar

- **Hoy**: el avatar es el protagonista de la tarjeta principal (256 px, de borde a borde, sobre su
  escenario); racha y XP van en una fila compacta debajo.
- **"Hoy no trabajo"** solo se ofrece antes de empezar la jornada; una vez iniciada desaparece de Hoy.
- **"Tengo un hueco"**: el bocadillo "¡Cualquier momento es bueno para moverte!" va debajo del
  escenario, apuntando al avatar, para no taparlo.
- **Ajustes › Molestias prioritarias** muestra las zonas como el resumen del onboarding: icono,
  nombre y nivel, de más a menos (componente compartido `PriorityTags`).

## Ajustes tras el primer día de uso real

- **Ajustes reutiliza el resumen del onboarding**: jornada, molestias, material y ritmo se muestran
  con los mismos componentes (`features/profile/ProfileSummary`), cada uno con su "Editar".
  Notificaciones, apariencia, idioma y datos siguen siendo propios de Ajustes.
- **Ritmo con velocímetros** (`pace_soft`, `pace_normal`, `pace_active`) en el selector de intensidad
  y en el resumen. `ChipGroup` admite icono por opción y entonces pinta baldosas (icono sobre el
  texto); también lo usa la valoración del día (las cuatro caras).
- **Tiempo de jornada junto al saludo**: "Te quedan 7 h 45 min" (o "Empieza a las 09:00") va a la
  derecha de "¡Hola!", encima del avatar.
- **"Reuniones"** (la fila que antes decía "Te quedan…") muestra las de hoy y abre "Reuniones de hoy":
  añadir, tocar para cambiar o quitar; las pausas se replanifican. Cerrar la jornada no está aquí: lo
  ofrece la tarjeta del final del día. El horario se cambia en Ajustes y la actividad principal en su
  tarjeta.
- **Reunión de media hora por defecto**: al cambiar la hora de inicio, la de fin pasa a ser 30 min
  después; luego se puede alargar cambiando el fin.
- **Ejercicio con inicio manual**: cada movimiento espera a "Empezar" (leerlo no consume su tiempo)
  y el siguiente también espera. Se puede saltar o dar por hecho sin cronómetro. "Empezar" ignora
  los toques justo después de cambiar de movimiento, como "Siguiente".
- **"¿Qué te ha parecido?"** al terminar una pausa: Me gusta / Normal / No me gusta, opcional y
  editable mientras se está en la pantalla. Se guarda en la pausa (`rating`) y en el registro de
  eventos (`exercise_rated`). Progreso muestra "Tus ejercicios": los que más y menos gustan (una
  pausa valorada cuenta para todos sus ejercicios). De momento no cambia el planificador.
- **Iconos nuevos con IA**: los 83 iconos que usa la app, en 6 hojas temáticas
  (`scripts/pixel-icons/sheets.py`), como sprites de 32×32 al estilo de 16 bits del avatar.
  `scripts/pixel-icons/reference.py` genera las referencias (`docs/iconos/`) y los prompts
  (`docs/prompts-iconos.md`). Los 22 iconos del pack original que no se usan no se piden.

## Iconos de 16 bits

- Los 83 iconos que usa la app se generaron con IA (`docs/prompts-iconos.md`, 6 hojas) y se importan
  con `pnpm icons <zip o carpeta>` (`scripts/pixel-icons/import.py`) como sprites PNG de 32×32 en
  `public/icons/` (~74 KB en total). Sustituyen a los de 16×16 dibujados por código, que se eliminan
  junto a los 22 del pack original que ya no se usaban.
- La IA no respeta la cuadrícula al píxel (sus "píxeles" miden 8–10 px y en una hoja los dibujos
  bajaban unos 10 px): cada icono es la pieza más grande de su celda más las pequeñas más cercanas
  (una sombra cortada vuelve a su icono) y las motas sueltas se descartan. Después se recorta, se
  centra en un cuadrado y se remuestrea a 28×28 con el color dominante de cada bloque, con 2 píxeles
  de margen y un máximo de 32 colores. Así todos tienen el mismo tamaño óptico.
- Los avisos usan los mismos iconos a 192 px (`public/icons/notify`).
- "Reuniones de hoy" se cierra como cualquier hoja (fuera o deslizando), sin botón "Listo".

## Exercise Lab

- **`/dev/exercises`** (solo en desarrollo, como `/dev/kit`; fuera de las guardas de onboarding y a
  pantalla completa, no en la columna de la app): revisar el catálogo de ejercicios probándolos de
  verdad. Enlazado desde el DevPanel. Con `pnpm dev` también se abre desde el móvil en la red local.
- **Lee el catálogo real** (`CATALOG.exercises`): no hay un segundo catálogo. Las decisiones no
  cambian ni borran nada; solo se recogen y se exportan.
- **Vista del usuario**: la pantalla de ejercicio se extrajo de `PlayScreen` a
  `features/pause/MovePlayer` (avatar, temporizador, zonas, pasos y botones), que usan la app y el
  Lab. En pantallas anchas va en un marco del tamaño de un móvil; en el móvil es la propia pantalla.
  "Probar ejercicio" usa el temporizador real (`useStepTimer`) con la duración del catálogo;
  al terminar se marca como probado y se pasa a la valoración. Sin XP, rachas ni eventos.
- **Revisión**: valoración (😍 Muy bueno 4 · 👍 Está bien 3 · 😐 Sin más 2 · 👎 Malo 1), calidad del
  ejercicio y calidad como micropausa (1–5), decisión (`pending` · `keep` · `rework` · `delete`),
  "lo he probado" y notas. Un ejercicio cuenta como revisado cuando tiene decisión. "Siguiente
  pendiente" busca después del actual dentro de los filtros y, si no queda ninguno, en todo el
  catálogo.
- **Guardado** en IndexedDB (`idb-keyval`), en su propia base `breakbit-lab` con una clave por
  ejercicio, como el registro de eventos. Está aparte de los datos de la app: "Borrar datos", los
  escenarios del DevPanel y las copias no la tocan.
- **Exportar revisión** descarga `breakbit-revision-ejercicios-<fecha>.json`: resumen, escalas y los
  ejercicios con revisión, en el orden del catálogo y con su nombre en español.
- **Visual del ejercicio**: `exerciseVisual(id)` en `assets/registry.ts` (vacío de momento). Si
  existe se muestra en la ficha; si no, "Sin visual todavía".
- **Simular jornada**: `generateDayPlan` con los ajustes del usuario, hoy y una semilla nueva en
  cada "Otra jornada". Lista hora y contenido, y resume zonas principales, material y ejercicios
  repetidos. Tocar un ejercicio lo abre en el Lab.
