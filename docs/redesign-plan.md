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
