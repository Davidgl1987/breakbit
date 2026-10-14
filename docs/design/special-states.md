# Estados especiales

Rama de revisión: `codex/redesign-special-states`. Las siete propuestas aprobadas se implementaron aquí; el progreso inicial tiene su propia revisión en `progress-initial.md`.

## Instalación y avisos

- La card de instalación sigue siendo la primera en Ajustes y desaparece al estar instalada.
- Con `beforeinstallprompt` se conserva el botón Instalar y el diálogo nativo. Si no existe, Cómo instalarla abre el panel compartido con pasos específicos de Safari/iOS o instrucciones generales. No se promete que todos los navegadores tengan esa opción.
- Activar notificaciones abre una explicación con una muestra del aviso usando el icono de la app. Solo Permitir avisos solicita el permiso. Si ya está concedido, se activa directamente. Ahora no, la X y el backdrop no solicitan permisos.
- Los permisos bloqueados muestran un texto breve y Cómo activarlas abre ayuda. No se vuelve a solicitar un permiso bloqueado. Se conservan el sonido y los avisos internos existentes.

## Datos

- La copia se valida y migra antes de abrir la confirmación. El panel muestra el nombre, fecha, registros de jornadas, fase, nivel y XP derivados de la copia validada, no del estado actual.
- Importar y sustituir expresa el cambio. Cancelar y cerrar no escriben datos. Guardar una copia antes está disponible en las dos confirmaciones y no confirma automáticamente.
- Borrar mis datos va centrado, en rojo. El panel explica que se reinician también los ajustes; apariencia e idioma se mantienen. Conservar mis datos cancela.
- Los fallos de formato y de versión posterior permanecen junto a Importar, con Elegir otro archivo y X. Una selección cancelada conserva el aviso; una copia válida lo elimina.
- Durante las operaciones se evita repetir acciones; los fallos operativos se muestran en el panel correspondiente. La descarga previa no cierra la confirmación.

## Pausa pasada y carga

- La pausa pasada usa el avatar de la fase actual y ofrece volver a Hoy. Solo ofrece Tengo un hueco cuando hoy tiene una jornada activa cuyo horario todavía no ha terminado; vuelve a Hoy al cerrar el selector.
- Las pausas futuras, completadas y descartadas mantienen sus flujos actuales.
- La carga muestra el logo, tres cuadrados pixel y Preparando tu espacio…, sin espera artificial, movimiento constante ni nueva pantalla de intro.
- Los avisos temporales internos usan el mismo icono de aplicación. Se conserva la distinción de tono mediante borde y mensaje, y la X existente.

## Componentes y revisión

- `AppIcon`: identidad única para instalación, permiso y toasts; respeta `BASE_URL` para GitHub Pages.
- `DataConfirmationSheet`: compartido por importar y borrar; reutiliza BottomSheet con cuerpo desplazable y acciones visibles.
- `BottomSheet` añade un título pixel opcional para estos paneles. El cierre, foco y comportamiento de los paneles anteriores se conservan.
- Copias traducidas en español e inglés; fuentes y menú inferior existentes.

El progreso sin historial se aprobó e implementó después en `codex/redesign-progress-empty`; véase `progress-initial.md`. Sigue pendiente la generación de poses específicas de descanso por fase, documentadas en el ciclo de jornada.
