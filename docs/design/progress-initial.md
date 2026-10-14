# Primera visita y datos parciales en Progreso

Propuesta inicial aprobada: `breakbit-progreso-inicial.html`. Los estados parciales siguen la propuesta `breakbit-progreso-por-apartados.html`, implementada en `codex/progress-partial-states`.

- Avatar y fase actual en una card compacta, sin racha ni estadísticas repetidas a cero.
- Una única barra de XP con el componente existente.
- Ver fases y recompensas reutiliza EvolutionSheet/BottomSheet. Cierre con X, Escape o backdrop y restauración del foco. La explicación de recompensas se añade como contenido opcional, sin duplicar la lista de fases.
- Ir a Hoy lleva al plan, sin iniciar la jornada automáticamente.
- El menú inferior conserva sus componentes y estilos.

## Cada apartado se completa de forma independiente

La card inicial y «El primer paso» se mantienen al iniciar una jornada mientras no haya movimiento completado ni progreso previo. Los registros de ausencia o día libre y un plan pendiente no activan por sí solos las estadísticas de evolución. El movimiento completado, los XP registrados, los resultados semanales, la evolución o las recompensas conservan la evolución real, también en importaciones sin planes diarios.

«Lo que verás aquí» reutiliza las filas del diseño inicial. Cada fila desaparece solamente cuando su apartado muestra datos reales:

- Constancia: actividad completada en el periodo actual de cuatro semanas.
- Favoritos: ejercicios que destacan entre los más o menos valorados, independientemente de cuándo se valoraron.
- Zonas: ejercicios registrados en las últimas cuatro semanas, usando los cálculos existentes.

Cuando las tres filas tienen datos, desaparece todo el bloque pendiente. Si no hay actividad reciente, los favoritos anteriores, los XP y el historial semanal siguen visibles.

La semana actual aparece cuando tiene actividad completada o XP. La comparación requiere una semana anterior con datos registrados, sin usar solamente ausencias como referencia. «Tu primera semana» permanece hasta existir resultados semanales; después se muestra el historial existente. «Sobre tu semana» se ofrece únicamente cuando hay información disponible.

Las poses futuras de descanso por fase siguen documentadas en el ciclo de jornada. En esta pantalla se usa el avatar existente de la fase actual.

## Verificación

78 pruebas de Progreso, cálculos y navegación correctas, compilación y lint correctos. Revisión visual con datos aislados: jornada iniciada sin pausas, actividad sin valoraciones y favoritos históricos con constancia y zonas pendientes. Se conservan los resúmenes importados sin planes diarios.
