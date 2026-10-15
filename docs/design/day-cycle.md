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

## Recursos gráficos integrados · 14 de octubre

Las cinco fases tienen recursos propios `sleep` y `rest`, aprobados visualmente e importados en `public/avatar/` a 128 × 128 px, con transparencia y la misma línea de base que las poses existentes. El importador admite `--poses sleep rest` para incorporar solo estas imágenes sin sustituir las demás y regenera el registro con todos los recursos disponibles.

Uso para **cada fase 1, 2, 3, 4 y 5**:

- `sleep`: avatar durmiendo antes de iniciar. Mismo personaje, paleta y pixel art; fondo transparente.
- `rest`: una escena de tiempo libre diferente para cada fase, usada en descanso y «Hoy no trabajo». El lugar, la postura y la actividad deben reflejar lo activo que es el avatar en esa evolución. Mismo personaje, paleta y pixel art; fondo transparente.

Los estados de Hoy y «Tengo un hueco» consumen estas poses a través del registro compartido. La escena omite la ventana del puesto de trabajo al dormir o descansar, de modo que las camas y los entornos exteriores no se representen como parte de una oficina.

La jornada cerrada usa las imágenes `celebrate` que ya existen. No se requieren nuevos recursos para preparar o ajustar.

## Plan guardado antes del inicio · 15 de octubre

Guardar desde «Empezar jornada» conserva un registro `active` aunque el horario empiece más tarde. Antes de esa hora, si todavía no se ha iniciado ni completado ninguna actividad, Hoy presenta «Jornada preparada» con el avatar durmiendo y acceso directo a «Ajustar horario». No presenta la siguiente pausa como si ya se estuviera trabajando ni ofrece cerrar la jornada en este estado. Al llegar a la hora guardada, muestra la pausa siguiente.

«Ajustar mi día», en la cabecera de la cronología, vuelve a dar acceso al editor compartido durante la jornada. Cambiar el inicio actualiza el mismo registro y recalcula las pausas sin cerrar el día ni borrar el historial o los XP. No requiere migrar ni borrar datos existentes.

Si un plan sin actividad tiene una apertura fechada en el futuro respecto al reloj actual, el editor recalcula la propuesta desde la hora real incluso al conservar el horario. Solo al guardar se actualiza el plan y se corrige la apertura futura; abrir o cancelar el editor no modifica los datos. Las actividades ya iniciadas o completadas se conservan.

## Descanso según la evolución

Cada fase tiene una imagen de descanso coherente con su ambientación y grado de actividad. Las escenas aprobadas son:

| Fase | Dormir | Descansar |
| --- | --- | --- |
| 1 · Encorvado | Nido de hojas y fibras | Roca y plátano |
| 2 · Erguido | Camastro de troncos y pieles | Tronco y flor silvestre |
| 3 · Sedentario | Cama individual con manta azul | Sofá y consola |
| 4 · Activo | Cama de madera con manta verde | Lectura en un banco de parque |
| 5 · Optimizado | Cama baja con manta verde petróleo | Trote tranquilo por un sendero |

La fase 2 conserva pelo largo alborotado, barba completa **y bigote** en ambas imágenes, siguiendo sus originales `2-cheer` y `2-thumbs_up`. Las fases 3–5 conservan el rostro humano sin barba. Los prompts y las correcciones están documentados en [prompts-avatar-rest.md](../prompts-avatar-rest.md).

Las cinco imágenes de `sleep`, para antes de iniciar la jornada, siguen siendo un conjunto separado de las escenas de tiempo libre de `rest`.
