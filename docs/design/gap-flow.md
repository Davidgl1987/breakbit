# Tengo un hueco

Diseño implementado y aprobado en `codex/redesign-gap`.

- Con jornada activa, el selector de 1, 3, 5 y 10+ minutos abre el panel inferior compartido sobre la pestaña de origen. El fondo mantiene su posición; X, Escape y pulsar fuera cierran el panel.
- La propuesta ocupa una pantalla propia. Tiempo vuelve al selector y X regresa a la pestaña de origen. Una URL directa usa Hoy como destino de cierre.
- La escena compacta muestra el nombre y la duración real. Zonas y material proceden del catálogo, sin duplicar instrucciones ni selección de ejercicios.
- XP y efecto sobre el plan aparecen juntos antes de las instrucciones. Una pausa pendiente muestra la diferencia respecto al tiempo elegido; una extra sin XP explica el motivo.
- Se reutilizan `PauseContentView` y `ExerciseDetails`: un ejercicio muestra los pasos, una rutina despliega cada movimiento y conserva la duración de cada paso y las vueltas.
- Se mantienen la selección de propuestas, los límites de XP, el bono de regreso, los controles de equipo/reuniones y las acciones actuales de ejercicio y actividad.
- Sin jornada activa se distinguen preparación, jornada cerrada con resumen real y descanso/día libre. No se añaden pausas a esos días.
- Dormir y descanso usan las poses provisionales del registro. Las versiones distintas de cada fase siguen pendientes y están documentadas en [Ciclo de jornada](day-cycle.md).

El menú inferior aprobado no cambia. Los reproductores, completado y evolución quedan para el siguiente bloque de diseño.

## Verificación

833 pruebas de unidad e integración y 8 pruebas de navegador en móvil correctas. Incluyen jornada, persistencia, foco del teclado, animaciones y accesibilidad en claro y oscuro. Compilación y lint correctos; revisión visual en 320 y 390 px sin desbordamiento horizontal.
