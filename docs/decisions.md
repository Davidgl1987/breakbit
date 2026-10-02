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
- **Catálogo** (`src/content`, es/en): 45 ejercicios (mvp_v1 §11 + dinámicos del master §15), las 4
  mini-rutinas del master §16 + una rutina de movilidad de 5 min, y 10 actividades principales. El
  material para la actividad principal se agrupa en bloques suaves de 5–10 min. Un test impide
  lenguaje médico en el contenido. **Provisional** hasta la revisión de contenido y assets: priorizar
  variedad real y eliminar ejercicios redundantes.
- `posture: 'either'` implica la recomendación "Si puedes, hazlo mejor de pie" (sin campo aparte).
  El tipo de pausa (micro/reset/active) se deriva de la duración.
- **Selección ponderada**: peso de zona = 1 + 2 × slider. La zona anterior se evita salvo que pese al
  menos el doble que todas las demás juntas. El ejercicio anterior nunca se repite si hay alternativa;
  los recientes pesan 0,25. Trabajo de suelo solo en descansos; en reuniones solo movimientos
  discretos. RNG con semilla (fecha + reroll) para planes reproducibles.
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
  nombres visibles son naturales ("Tiempo sentado" en vez de "Sedentarismo"); los identificadores
  internos no cambian.
- **Design system**: componentes genéricos nuevos `MultiChipGroup` (días), `InlineMessage` (pista o
  error), `Tag` (etiqueta estática), `Avatar` (con placeholder por fase) y `EvolutionStrip`; `Wordmark`
  pasa a `ui/components`. Todos están en `/dev/kit`. No hay variantes visuales propias del onboarding.
- **Desarrollo en red local**: el servidor de Vite escucha en la red (`server.host`) para probar desde
  el móvil. Por `http` a una IP el navegador no da un contexto seguro: las notificaciones no estarán
  disponibles ahí (se verá el estado "no admite avisos"); por eso los ids de eventos usan
  `crypto.getRandomValues` y no `randomUUID`.
