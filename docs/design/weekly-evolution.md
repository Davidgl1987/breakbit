# Semana, evolución y revisión de prioridades

Rediseño e implementación aprobados el 13 de octubre de 2026. Se reutiliza la rama `codex/redesign-exercises`; integración en main autorizada por el usuario.

## Pantallas

- La card principal se ajusta al contenido. El avatar anterior aparece pequeño y el actual como protagonista. Al subir utiliza la imagen de celebración de la fase conseguida; al mantener o bajar utiliza su imagen trabajando.
- Una semana corta conserva el avatar y explica que no se evalúa la evolución. Las reglas de buenas semanas, rachas, XP y fases siguen en sus funciones actuales.
- Al obtener un objeto, la card destaca su imagen y el inventario muestra objetos desbloqueados con el nuevo identificado.
- «Ver fases» abre `EvolutionSheet`, usando el panel inferior existente y las cinco imágenes de fase. X, fondo o Escape cierran y devuelven el foco.
- «Seguir» marca el resultado como visto. La X del resultado permite volver a Hoy manteniendo el recordatorio disponible.

## Revisión semanal

La invitación se muestra en el resultado más reciente mientras está pendiente de ver, con independencia de si evoluciona. Las semanas históricas y las ya vistas no vuelven a pedir esta revisión. El usuario puede continuar sin editar.

`WeeklyPrioritySheet` reutiliza `DiscomfortFields` y `Slider05`, compartidos con onboarding y Ajustes. Los valores se precargan, se editan en un borrador y se guardan explícitamente. Cancelar, fondo, X y Escape descartan el borrador. Los tiradores conservan borde verde, centro opaco y esquinas suaves de 3 px; teclado y área táctil se mantienen.

Al guardar se actualizan las prioridades para las próximas jornadas. El plan de una jornada en curso queda intacto, incluyendo pausas completadas, sesión activa, horarios, número y duración de las pausas. Revisar prioridades no altera XP, rachas ni fase.

## Proponer reparto

La función pura `proposePriorityRebalance` usa los recuentos de `areaStats` entre el lunes y el domingo del resultado mostrado: ejercicios de pausas y pasos de rutinas completadas, incluidos los realizados en sus rondas. Las actividades pendientes y la actividad principal no aportan recuentos a esta estadística.

- Solo considera las zonas del catálogo cuya prioridad actual es mayor que 0.
- Propone subir un punto una zona menos trabajada y bajar uno una más trabajada, conservando la suma y el rango activo 1–5. Los valores en 0 quedan intactos.
- Se requieren al menos tres ejercicios registrados en una zona activa y una diferencia de dos ejercicios entre las zonas propuestas. Con poca actividad, empate, una sola zona activa o sin margen en la escala no se fuerza una propuesta.
- Cada fila reúne zona, número de ejercicios, motivo del reparto y valores anterior/nuevo, sin repetir el nombre en otra explicación.
- La propuesta aparece antes de aplicar. «Aplicar propuesta» cambia el borrador; solo «Guardar» modifica las preferencias.
- Un reparto confirmado se recuerda con `WeeklyResult.prioritiesRebalanced`. Recargar o reabrir no permite acumular nuevos repartos para ese resultado; la edición manual sigue disponible.
- Describe movimiento registrado y prioridades. No estima dolor, recuperación o mejoría; se pide al usuario revisar cómo se encuentra antes de guardar.

El estado pasa a versión 4 con una migración compatible: el indicador es opcional y los datos anteriores se conservan tal cual. La validación de copias acepta datos antiguos y verifica el nuevo booleano cuando está presente.

## Revisión y pruebas

Vista de prueba independiente: `http://127.0.0.1:5203/week/2026-W41`, con datos de ejemplo. El panel de desarrollo permite cargar los cinco resultados; estos escenarios reemplazan únicamente los datos del origen donde se utilizan. Sus jornadas contienen planes y ejercicios completados para poder probar el reparto real.

- Pruebas de redistribución: límites 0–5, suma conservada, datos escasos, empate y activación manual.
- Integración: avatares correctos, panel de fases, continuar sin revisar, semanas vistas, cancelar borrador, guardado, ceros, no acumulación y preservación del plan en marcha/XP/fase.
- Persistencia: indicador semanal validado y migración desde datos anteriores.
- Compilación de producción y lint correctos. Suite completa: 855 pruebas pasaron y una de Exercise Lab agotó su tiempo; esa prueba y las del resultado semanal pasaron al repetirlas por separado (13 pruebas). Las 856 pruebas quedan verificadas.
- Revisión visual en 320 y 390 px; paneles con desplazamiento vertical cuando el contenido lo necesita.

Commit, merge y push autorizados por el usuario tras la revisión.
