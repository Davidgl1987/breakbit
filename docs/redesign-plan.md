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
