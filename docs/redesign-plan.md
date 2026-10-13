# Rediseño de Breakbit

Rama: `codex/redesign-breakbit`. El menú inferior existente se conserva.

- [x] Hoy: cabecera y tiempo restante, card principal, material y zonas, progreso diario y actividad compacta editable.
- [x] Panel de ejercicio: pasos existentes, cierre con X, fondo o Escape.
- [x] Progreso: evolución sin barra segmentada, XP, resumen y comparación semanal, constancia de cuatro semanas con flechas, favoritos y detalles en filas.
- [x] Ajustes: preferencias y avisos primero, rutina en listado y edición con los campos compartidos del onboarding, datos al final.
- [x] Notificaciones: icono de la aplicación para todos los tipos.
- [x] Verificar funciones, accesibilidad y presentación en móvil en ambas apariencias.

Se reutilizan los planificadores, validaciones y componentes existentes. Los cambios de reuniones conservan las pausas completadas; el horario habitual editado durante una jornada se aplica a la siguiente.

## Verificación

- Compilación de producción y revisión de código correctas.
- 818 pruebas de unidad e integración correctas; las 26 pruebas de Progreso y Ajustes se repitieron después de compactar las filas y plegar el historial.
- Flujos de jornada, navegación, animaciones, persistencia y uso sin conexión comprobados en móvil y escritorio.
- Accesibilidad WCAG y contraste comprobados en claro y oscuro, incluyendo los paneles de actividad y jornada.
- Revisado visualmente en pantallas estrechas; constancia con 28 celdas y 7 columnas, sin desbordamiento horizontal.
- Sin cambios en `src/app/navigation`; el checkout original permanece limpio en `main`.

Vista previa de desarrollo: http://127.0.0.1:5201/ (datos de ejemplo en un origen independiente).

## Correcciones de revisión · 9 de octubre

- Press Start 2P para los títulos, Chakra Petch para texto y controles; fuentes locales con licencia OFL y precarga sin conexión. El menú mantiene Nunito y su estructura original.
- Cards de Hoy y evolución con un único radio exterior, sin esquinas superpuestas. X de los paneles restaurada a su icono de línea.
- Hoy: título y fecha compactos, tiempo restante a la derecha, icono de actividad difuminado, zonas del catálogo, enlace a la actividad, reuniones en filas y cierre de jornada como enlace rojo. El material se consulta en el panel de actividad.
- Progreso: comparación discreta, iniciales en constancia, barras de zonas corregidas y favoritos/comentarios en filas. El escenario de revisión incluye valoraciones.
- Ajustes: apariencia, idioma y notificaciones sin fondo; datos en card con Exportar/Importar y borrado centrado. Los editores de rutina siguen compartiendo los campos del onboarding.
- Revisión visual en 320 y 390 píxeles y escritorio, sin desbordamiento horizontal; los botones de datos usan textos cortos y conservan nombres accesibles completos.
- 818 pruebas completas correctas, 63 comprobaciones de contraste/caché correctas y 19 pruebas de Ajustes repetidas tras compactar los botones. 20 pruebas de navegador correctas, incluyendo accesibilidad en ambos temas, jornada, teclado y uso sin conexión.

## Esquinas y ajustes compactos · 9 de octubre

- Menú con Press Start 2P en las pestañas y en la acción central (12 px en Tengo un hueco, comprobado en 320 px). Conserva la disposición de tres pestañas y el botón elevado; su contorno sigue ahora pequeños escalones.
- Esquinas con recortes cuadrados de 3–6 px en cards, botones, campos, selectores y paneles; indicadores finos con recortes de 1 px. Los navegadores sin `corner-shape` usan esquinas casi rectas de 2 px.
- Instalar Breakbit es la primera card de Ajustes y sigue ocultándose cuando está instalada.
- Tus datos comparte el fondo de Instalar Breakbit, reduce espaciado y reúne la protección junto al título. Acerca de Breakbit queda fuera, y Probar sonido usa un enlace visual con área de pulsación de 44 px.
- Revisión visual en 320 y 390 px, en claro y oscuro, sin desbordamiento; paneles y menú comprobados. Compilación y lint correctos, 28 pruebas de Ajustes/navegación y 20 pruebas de navegador correctas.


## Ciclo de jornada · 12 de octubre

- [x] Hoy sin iniciar, descanso, día libre, inicio tardío, horario terminado y jornada cerrada.
- [x] Preparar/Ajustar con los campos actuales y la nueva card de actividad, sin avatar ni acción de día libre.
- [x] Cerrar jornada con resumen, detalles desplegables, ánimo en dos columnas y próxima jornada en lista.
- [x] Cierre normal verde y confirmación anticipada con enlace rojo centrado.
- [x] Próxima jornada editable en fecha y horas, mediante los campos compartidos del onboarding y excepciones de calendario.
- [x] Menú inferior aprobado conservado.
- [ ] Generar cinco poses de dormir y cinco escenas de tiempo libre, distintas según la actividad de cada fase; ideas documentadas en [Ciclo de jornada](design/day-cycle.md).

Verificación del ciclo: compilación y lint correctos, 825 pruebas de unidad/integración y 5 pruebas de navegador correctas. Las pruebas de navegador incluyen el ciclo de jornada, persistencia, teclado y accesibilidad en claro y oscuro, con el editor de próxima jornada y los estados de descanso, día libre e inicio tardío. Revisión visual en 320 y 390 px sin desbordamiento horizontal.


## Ejercicios y actividades · 12 de octubre

Rama: `codex/redesign-exercises`, en el espacio de trabajo de diseño.

- [x] Aviso de pausa con escena compacta, zonas y material, pasos en el panel existente, aplazar y descarte como enlace rojo.
- [x] Reproductor preparado, en marcha y en pausa con guía libre y temporizador debajo; título, progreso de rutina y siguiente movimiento.
- [x] Actividad preparada con icono difuminado, metadatos y editor existente.
- [x] Actividad en marcha y por bloques con temporizador separado y confirmación anticipada existente.
- [x] Completado de pausa/actividad con recompensa integrada, desglose en filas, valoración y progreso sin apilar cards.
- [x] Guías conectadas al registro `exerciseVisual`, con la pose de demostración de fase 5 hasta disponer de los recursos específicos.
- [ ] Generar las imágenes o animaciones de guía de cada ejercicio y actividad.

Detalles en [Ejercicios y actividades](design/exercise-flow.md).

## Semana y evolución · 13 de octubre

Rama compartida con ejercicios: `codex/redesign-exercises`.

- [x] Resultado semanal con cabecera y periodo compactos, avatar anterior/actual y protagonista conseguido, al subir, mantenerse o bajar.
- [x] Semana corta conservando fase y recompensa de habitación con el objeto nuevo destacado y objetos obtenidos.
- [x] Días buenos y racha en filas, una sola separación antes de la revisión opcional.
- [x] «Ver fases» en el panel inferior compartido.
- [x] Revisión con campos del onboarding/Ajustes y sliders compartidos con esquinas suaves.
- [x] Reparto basado en ejercicios completados de la semana, vista previa por zona, aplicación al borrador y guardado explícito; zonas en 0 intactas y un reparto confirmado por semana.
- [x] Guardado para próximas jornadas, conservando el plan en marcha, XP y reglas de evolución.
- [x] Escenarios de prueba para evolución, estabilidad, descenso, semana corta y habitación.

Detalles y reglas en [Semana y evolución](design/weekly-evolution.md).
