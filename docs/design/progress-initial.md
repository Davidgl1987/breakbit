# Primera visita a Progreso

Propuesta aprobada: `breakbit-progreso-inicial.html`. Rama: `codex/redesign-progress-empty`.

- Avatar y fase actual en una card compacta, sin racha ni estadísticas repetidas a cero.
- Una única barra de XP con el componente existente.
- Ver fases y recompensas reutiliza EvolutionSheet/BottomSheet. Cierre con X, Escape o backdrop y restauración del foco. La explicación de recompensas se añade como contenido opcional, sin duplicar la lista de fases.
- Ir a Hoy lleva al plan, sin iniciar la jornada automáticamente.
- Lista breve de lo que aparecerá cuando haya datos: constancia de cuatro semanas, favoritos y zonas trabajadas. Nota sobre el primer resumen semanal.
- El menú inferior y las pantallas con historial mantienen sus componentes y estilos.

La bienvenida se muestra únicamente antes de tener jornadas con plan o resumen, XP registrado, resultados semanales, evolución o recompensas. Los registros de ausencia o día libre por sí solos no son una jornada iniciada. Las importaciones con progreso conservan la pantalla estadística aunque falten registros diarios. Una jornada iniciada, aun sin pausas completadas ni valoraciones, ya usa las estadísticas existentes; no se sustituye por la bienvenida.

Las poses futuras de descanso por fase siguen documentadas en el ciclo de jornada. En esta pantalla se usa el avatar existente de la fase actual.
