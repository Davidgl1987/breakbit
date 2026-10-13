# Ejercicios y actividades

Rama: `codex/redesign-exercises`.

## Diseño aprobado

- Aviso: escena compacta, duración, zonas y material, pasos en el panel inferior existente. Vamos precede a aplazar y al enlace rojo de descarte.
- Reproductor: título alineado a la izquierda, guía con todo su espacio libre y franja del temporizador **debajo** de la imagen. Esta disposición se mantiene al preparar, pausar y seguir.
- Rutinas: nombre y posición del movimiento junto al título, progreso de la secuencia y siguiente ejercicio. Cada movimiento de pausa sigue esperando a que el usuario pulse Empezar.
- Actividad preparada: escena con su icono difuminado, tiempo, modalidad, zonas, material y hora; editor existente y confirmación de Ya la he hecho.
- Actividad en marcha: guía, tiempo fuera de la imagen y controles. Se conserva la sesión persistente al salir y su confirmación de finalización anticipada.
- Bloques: acumulado y bloque actual separados; parar un bloque conserva el acumulado. Las rutinas principales siguen avanzando automáticamente por tiempo y repitiendo sus vueltas.
- Completado: celebración y XP en una sola escena, desglose en filas, valoración opcional, resumen diario y nivel sin apilar fondos de cards.
- Se conservan fuentes, colores y esquinas pixeladas, el menú inferior, la X de línea y los cierres por fondo/Escape de los paneles.

## Recursos pendientes

`ActivityGuide` consulta `exerciseVisual(exercise.id)` para mostrar la futura guía de cada ejercicio. Hasta que se incorporen las imágenes o animaciones al registro, mantiene el avatar de demostración de fase 5. La guía se ajusta completa dentro del marco; ni el temporizador ni los controles se superponen. Las actividades sin una rutina guiada usan también esa pose provisional. Las celebraciones utilizan la fase del usuario.

## Comportamiento

Se reutilizan `useStepTimer`, las sesiones de actividad principal, `ExerciseDetails`, `PauseSheet`, `RatingCard`/`ChipGroup`, `MainActivitySheet` y `BottomSheet`. No cambian duraciones, vueltas, selección del catálogo, reglas de XP, límites de extras, bonus ni retorno desde notificaciones o recuperación al cerrar jornada.


## Verificación

- Compilación de producción, lint y revisión de diferencias correctos.
- Pruebas de pausas, rutinas, actividad continua/acumulada, Tengo un hueco y recuperación al cerrar jornada verificadas; la expectativa antigua de duración abreviada se adapta a la nueva presentación.
- El nuevo acceso a los pasos se prueba sin iniciar la pausa ni conceder XP, con cierre por Escape y retorno del foco al enlace.
- Revisión visual en 320 y 390 px, en claro y oscuro: guía y temporizador separados, sin desbordamiento horizontal ni imágenes rotas.
- Probados el editor de actividad, el avance de movimientos, la pausa/continuación y la valoración. Comprobada la finalización automática de la actividad principal al transcurrir su tiempo.
- Vista de revisión con datos de ejemplo en http://127.0.0.1:5202/. Los datos se mantienen separados de los orígenes usados por el usuario.
