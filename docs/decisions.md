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
