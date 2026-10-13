# Onboarding: diseño aprobado

## Entrada e identidad

El primer acceso presenta el logotipo arriba y el lema «Pausa. Muévete. Sigue.», con «Muévete» en verde. La única frase de apoyo es «Tu jornada, un poco más activa». El símbolo aparece como una marca tenue de fondo, adaptada a la apariencia clara u oscura. La acción para continuar es explícita y no tiene una espera programada. Una vez terminada la configuración, la app abre Hoy directamente.

La bienvenida explica las pausas cortas, la actividad principal y la constancia. Muestra el avatar de fase 1; las otras fases se consultan en el panel inferior compartido `EvolutionSheet`. Configurar preferencias no concede una evolución.

## Cinco pasos de configuración

1. Jornada: días habituales y un grupo de horario, descanso y comida.
2. Molestias: siete zonas del catálogo, escala de prioridad de 0 a 5 y recordatorio de revisión semanal.
3. Material: selección opcional, sin limitar los movimientos sin equipo ni caminar.
4. Ritmo: opciones verticales con la estimación del planificador real y navegación por teclado.
5. Resumen: valores en líneas separadas, edición en un panel inferior y avisos opcionales.

La presentación de marca y la bienvenida no cuentan en el indicador de los cinco pasos.

## Edición compartida

`ProfileEditSheet` mantiene una copia local y valida el horario. Guardar devuelve únicamente el apartado editado. Cancelar, cerrar con la X, tocar el fondo o Escape descartan la copia y restauran el foco.

En onboarding, guardar actualiza el borrador; los ajustes de la app solo se guardan al terminar. En Ajustes, el mismo panel conserva las reglas existentes: la jornada activa mantiene sus horas y otros cambios pueden reorganizar pausas futuras.

`Slider05` conserva el pulgar con esquinas suaves, con disposición en línea o debajo de su etiqueta según el espacio. Los formularios de prioridades utilizan el mismo componente que la revisión semanal.

## Avisos y finalización

El permiso del navegador solo se pide tras activar el interruptor. Se puede continuar con permiso denegado, sin soporte o con avisos desactivados. Conceder permiso no impide desactivar los avisos en el propio resumen.

«Ir a Hoy» completa la configuración; no inicia una jornada ni altera la fase del avatar.

Textos disponibles en español e inglés. Colores, esquinas y tipografías reutilizan los tokens existentes. El menú inferior se conserva.
