# Ciclo de jornada

Implementación del segundo bloque del rediseño aprobado.

## Pantallas

- Hoy sin iniciar: escena principal, preparar jornada, dos métricas del plan, nivel compacto y «Hoy no trabajo» rojo como última acción.
- Hoy cerrada: escena con pose `celebrate`, movimiento y XP, próxima jornada editable, nivel y detalle desplegable al final (un dato por fila).
- Descanso / día libre: escena de descanso, próxima jornada editable y posibilidad de trabajar hoy.
- Inicio tardío: ajustar horas antes de iniciar; posibilidad de marcar el día libre.
- Fin del horario con jornada activa: escena para cerrar y cronología desplegable.
- Preparar / ajustar: campos actuales de horario, reuniones y material; sin avatar ni «Hoy no trabajo»; actividad con icono grande difuminado.
- Cerrar: resumen de movimiento, dos métricas, resto desplegable, estados de ánimo en 2 columnas, próxima jornada en lista y cierre verde.
- Cierre anticipado: continuar primero, cierre rojo centrado debajo.

Se conserva el menú inferior aprobado. Los editores usan `ScheduleFields`, compartidos con onboarding; `ScheduleSheet` sirve para las horas del cierre y la fecha/horas de la próxima jornada. El guardado crea excepciones de calendario y no modifica la rutina semanal. Retrasar la próxima jornada marca los días laborales intermedios como descanso.

## Recursos gráficos pendientes

No se han generado imágenes nuevas. `sleep` y `rest` utilizan la alternativa `idle` de la misma fase hasta incorporar los recursos.

Generar para **cada fase 1, 2, 3, 4 y 5**:

- `sleep`: avatar durmiendo antes de iniciar. Mismo personaje, paleta y pixel art; fondo transparente.
- `rest`: una escena de tiempo libre diferente para cada fase, usada en descanso y «Hoy no trabajo». El lugar, la postura y la actividad deben reflejar lo activo que es el avatar en esa evolución. Mismo personaje, paleta y pixel art; fondo transparente.

Mantener tamaño y encuadre compatibles con la escena principal. Ampliar primero el importador de avatares para reconocer `sleep` y `rest` (hoy solo acepta las poses existentes), y añadir después al registro de assets las entradas de cada fase y pose. Revisar entonces el fondo de habitación para las poses exteriores; hasta tener esos recursos no se cambia la escena.

La jornada cerrada usa las imágenes `celebrate` que ya existen. No se requieren nuevos recursos para preparar o ajustar.

## Descanso según la evolución · 12 de octubre

Cada una de las cinco fases tendrá su propia imagen de descanso. La evolución también se verá en cómo el avatar disfruta de su tiempo libre: desde descansar en el sofá hasta pasar tiempo en la naturaleza o salir a correr.

Ideas iniciales, **orientativas y pendientes de decidir antes de generar las imágenes**:

| Fase | Idea de escena distinta |
| --- | --- |
| 1 · Encorvado | Descansando en el sofá de casa. |
| 2 · Erguido | Sentado en un banco en la naturaleza. |
| 3 · Sedentario | Dando un paseo tranquilo por un parque. |
| 4 · Activo | Preparándose para salir a correr, atándose las zapatillas al aire libre. |
| 5 · Optimizado | Corriendo por un sendero en la naturaleza. |

Podremos proponer más escenas y cambiar estas ideas. El requisito aprobado es que cada fase tenga una escena diferente y coherente con su grado de actividad. Al preparar los recursos, diseñar también el entorno de la card para que acompañe cada escena.

Las cinco imágenes de `sleep`, para antes de iniciar la jornada, siguen siendo un conjunto separado de las escenas de tiempo libre de `rest`.
