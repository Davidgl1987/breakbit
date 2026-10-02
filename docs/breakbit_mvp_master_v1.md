# Breakbit — Especificación maestra del MVP

## 0. Identidad del producto

**Nombre de trabajo definitivo para el MVP: Breakbit.**

El nombre sustituye a `PosturaMon` en documentación y producto. La dirección visual acordada se mantiene:
- PWA de bienestar/movimiento para personas que trabajan frente al ordenador;
- estética pixel art aplicada a avatar, iconografía y gamificación;
- componentes funcionales modernos, limpios y consistentes;
- modo claro con base arena/crema y verde principal;
- modo oscuro equivalente;
- `Tengo un hueco` como acción central flotante integrada por encima de la navegación inferior.

Los assets del avatar o de ejercicios que aún no existan pueden implementarse inicialmente con placeholders sin bloquear el desarrollo.

## 1. Objetivo

App web/PWA para personas que trabajan muchas horas frente al ordenador. No busca rehabilitar ni entrenar, sino crear el hábito de levantarse, moverse y descargar tensión durante la jornada.

Principios:
- Movimiento > entrenamiento.
- Micropausas muy cortas.
- Distribución durante todo el día.
- Flexibilidad ante reuniones, flow, horarios variables y días libres.
- Gamificación basada en constancia, no en volumen.

## 2. Plataforma MVP

- React + Vite.
- PWA instalable.
- Persistencia local.
- Service Worker.
- Notificaciones y deep links.
- Responsive móvil + desktop.
- Sin backend ni login en MVP.

## 3. Onboarding

### 3.1 Jornada
Campos:
- Días habituales de trabajo.
- Inicio.
- Fin.
- Descansos.
- Comida: hora y duración.

Reglas:
- No proponer ejercicios durante comida.
- Los descansos pueden alojar micropausas o actividad principal.
- El horario habitual es una plantilla, no un calendario rígido.

### 3.2 Molestias
Sliders 0–5:
- Cuello.
- Espalda.
- Hombros.
- Muñecas/manos.
- Vista.
- Sedentarismo.

Los sliders cambian la proporción de ejercicios por zona, no el número de pausas.

### 3.3 Equipamiento
MVP:
- Ninguno.
- Barra de dominadas.
- Mancuernas.
- Kettlebell.
- Esterilla.
- Escritorio elevable.

Siempre disponible:
- Pasear por la calle.

### 3.4 Intensidad
En función de horas efectivas de trabajo:

- Suave: ~0,5 pausas/hora.
- Normal: ~0,75 pausas/hora.
- Activo: ~1 pausa/hora.

Ejemplo 8 h:
- Suave: ~4.
- Normal: ~6.
- Activo: ~8.

## 4. Inicio de jornada

Notificación a la hora configurada.

La pantalla muestra:
- estado del avatar;
- racha;
- número de pausas;
- minutos estimados de interrupción;
- misión principal;
- reuniones del día.

### Reuniones
El usuario puede añadir:
- hora inicio;
- hora fin;
- check `Puedo moverme durante esta reunión`.

La app puede proponer:
- caminar;
- estar de pie;
- ejercicios discretos;
- actividad principal.

## 5. Plan diario

Las pausas se distribuyen inicialmente de forma uniforme.

Separación objetivo:
- ideal: 45–90 min;
- tras recalcular: mínimo puntual ~30–40 min.

Reglas:
- no durante comida;
- evitar repetir ejercicio consecutivamente;
- evitar repetir categoría consecutivamente si hay otras molestias relevantes;
- si una pausa se pierde, la siguiente puede adelantarse ligeramente para recuperar cadencia;
- una pausa perdida sigue contando como perdida.

Ejemplo:
10:00 perdida
11:10 siguiente
→ se puede adelantar a 11:00.

## 6. Pantalla de notificación / decisión

Todo debe estar en la misma pantalla.

### Acción principal
`Vamos`

Abre el ejercicio.

### Estoy en flow
Botones rápidos:
- +5 min
- +10 min
- +15 min

Aplazar NO penaliza si finalmente se completa.

Cada pausa guarda:
- scheduledAt;
- currentScheduledAt;
- postponeMinutes;
- postponeCount.

Límite inicial sugerido:
- 30 min acumulados.

Al alcanzar el límite:
- desaparece la opción de aplazar;
- quedan `Vamos` y `Descartar`.

### Descartar
Botón menos prominente:
`Descartar pausa`

Debe avisar de que hay penalización de XP.

## 7. Notificación ignorada

Ignorar consume la misma ventana temporal que aplazar.

Ejemplo:
10:00 notificación.
10:10 sin interacción → 10 min consumidos.
10:20 → 20 min consumidos.

Para métricas:
- postponed = interacción explícita;
- ignored = sin interacción.

Ambos consumen tiempo, pero se analizan por separado.

## 8. Ventana de validez

Cada micropausa tiene una ventana limitada.

Sugerencia inicial:
- ~30 min desde la hora original.

Superada:
- estado `missed`;
- no persigue al usuario el resto del día.

## 9. Reajuste dinámico

Si una pausa se aplaza poco y sigue habiendo separación suficiente, no mover el resto.

Si quedan demasiado juntas:
- desplazar posteriores.

Si no cabe todo:
- alguna pausa se pierde.

No acumular “deuda” de ejercicios.

## 10. Tipos de pausa

### Micro
- 30–60 s.
- 1 ejercicio.

### Reset
- 90–120 s.
- 2–4 movimientos.

### Active break
- 2–3 min.
- rutina dinámica breve.

Una pausa posterior puede ser algo más completa si una anterior se perdió o se aplazó mucho, pero la anterior sigue contando como perdida.

## 11. Actividad principal

Puede ser:

### Continua
Ejemplo:
- paseo de 20 min.

### Acumulable
Ejemplos:
- 30 min de pie;
- 3 bloques de 5 min.

Campo interno:
`completionMode: continuous | accumulated`

Debe completarse una actividad principal para mantener la racha.

## 12. Descansos

Un descanso cuenta como micropausa si el usuario:
- se levanta;
- camina;
- hace un mini-ejercicio;
- hace la actividad principal.

Si sigue sentado en el ordenador, no cuenta.

## 13. Tengo un hueco

Opciones:
- 30 s;
- 1 min;
- 3 min;
- 10+ min.

Si ha pasado suficiente tiempo:
- puede adelantar la próxima pausa.

Si acaba de hacer una:
- puede moverse igualmente;
- no consume la siguiente pausa.

## 14. Pantalla de ejercicio

Debe mostrar:
- nombre localizado al idioma de la app;
- categoría;
- duración;
- animación;
- descripción corta;
- pasos;
- temporizador;
- pausa/reanudar.

Todos los nombres visibles deben estar traducidos.

Ejemplo:
- id interno: `chest_opener`
- español: `Apertura de pecho`
- inglés: `Chest opener`

## 15. Ejercicios dinámicos añadidos

| ID interno | Español | Descripción |
|---|---|---|
| wave | Ola corporal | Movimiento amplio desde casi tobillos hasta brazos arriba |
| high_twist | Giro de tronco relajado | Rotar el tronco dejando acompañar los brazos |
| push_side | Sentadilla lateral alterna | Flexionar una pierna mientras la otra queda estirada |
| kick_step | Patada frontal controlada | Elevar pierna estirada hasta una altura cómoda |
| hop_rotate | Saltitos con giro de cadera | Pequeños saltos rotando suavemente la cadera |
| march | Marcha en el sitio | Caminar sin desplazarse |
| trunk_twist | Rotación de tronco | Giro controlado de tronco |
| golf_swing | Giro tipo golf | Rotación amplia simulando swing |
| plie | Plié | Flexión de piernas con base amplia |
| chest_opener | Apertura de pecho | Abrir hombros y pecho |
| punch | Golpes al frente | Puñetazos suaves alternos |
| lunge | Zancada | Zancada alterna |
| arm_swing | Balanceo de brazos | Movimiento amplio de brazos |
| curtsy_cross | Zancada cruzada | Paso cruzado tipo reverencia |
| hop | Saltitos | Saltos suaves |

## 16. Mini-rutinas

### Despertar — 2 min
- Marcha en el sitio — 30 s.
- Balanceo de brazos — 30 s.
- Rotación de tronco — 30 s.
- Ola corporal — 30 s.

### Reset de escritorio — 2 min
- Apertura de pecho — 30 s.
- Giro de tronco relajado — 30 s.
- Giro tipo golf — 30 s.
- Ola corporal — 30 s.

### Piernas activas — 2 min
- Marcha en el sitio — 30 s.
- Plié — 30 s.
- Sentadilla lateral alterna — 30 s.
- Patada frontal controlada — 30 s.

### Reset activo — 3 min
- Marcha en el sitio — 30 s.
- Golpes al frente — 30 s.
- Zancada — 30 s.
- Giro de tronco relajado — 30 s.
- Sentadilla lateral alterna — 30 s.
- Saltitos con giro de cadera — 30 s.

## 17. Fin de jornada

Mostrar:
- pausas completadas;
- pausas perdidas;
- pausas al primer aviso;
- actividad principal;
- minutos de micropausas;
- movimiento total;
- tiempo real de interrupción;
- XP;
- racha.

Mensaje:
`Hoy has conseguido X minutos de movimiento con solo Y minutos de interrupción real.`

### Recuperación
Si falta una pausa:
- puede hacerse una última.

Si faltan varias:
- solo puede recuperar una.

No se puede salvar toda la jornada haciendo varias seguidas.

## 18. Valoración final

Pregunta:
`¿Cómo terminas hoy?`

Opciones:
- Muy bien.
- Bien.
- Cargado.
- Bastante mal.

Sirve para tendencia personal, no diagnóstico.

## 19. Próxima jornada

Al terminar:

`¿Mañana tienes el mismo horario?`

Opciones:
- Sí, repetir.
- No, cambiar horario.
- No trabajo mañana.

Si no trabaja:
- elegir próximo día laboral.

Objetivo:
- horarios variables;
- fines de semana;
- vacaciones;
- días libres.

## 20. Racha

Un día cuenta si:
- completa >=70 % de micropausas;
- completa 1 actividad principal.

Aplazar no penaliza si se completa.

## 21. XP y gamificación

Principios:
- completar da XP;
- descartar puede restar XP;
- ignorar y dejar caducar cuenta como oportunidad perdida;
- aplazar + completar no pierde XP;
- completar al primer aviso puede dar bonus.

Métrica clave:
`Pausas hechas al primer aviso`.

## 22. Evolución visual

Representa hábitos y constancia, no mejora médica.

Puede usar:
- XP;
- racha;
- porcentaje de días completados;
- pausas al primer aviso.

Dirección artística pendiente:
- mono → humano;
- robot → androide;
- híbrido.

## 23. Progreso

Heatmap estilo GitHub.

Métricas:
- % días completados;
- racha;
- pausas completadas;
- pausas al primer aviso;
- aplazadas;
- ignoradas;
- descartadas;
- minutos de micropausas;
- movimiento total;
- tiempo real de interrupción;
- comparación semanal.

## 24. Estados internos

ScheduledActivity:
- pending
- notification_sent
- postponed
- completed
- skipped
- missed

Campos:
- scheduledAt
- currentScheduledAt
- notificationSentAt
- notificationOpenedAt
- postponeMinutes
- postponeCount
- completedAt
- status
- skipReason
- origin

## 25. Métricas de dogfooding

Eventos:
- notification_sent
- notification_opened
- exercise_started
- exercise_completed
- exercise_completed_first_prompt
- exercise_postponed
- exercise_ignored
- exercise_skipped
- exercise_missed
- spontaneous_break
- main_activity_completed
- day_completed
- mood_recorded

Métricas principales:
1. % pausas completadas.
2. % al primer aviso.
3. % aplazadas.
4. % ignoradas.
5. % descartadas.
6. % días con actividad principal.
7. % días válidos para racha.
8. minutos de interrupción.
9. movimiento total.
10. uso tras 7/14 días.

## 26. Pantallas a mockear antes de implementar

### Onboarding
1. Bienvenida.
2. Jornada.
3. Molestias.
4. Equipamiento.
5. Intensidad.
6. Resumen/notificaciones.

### Uso diario
7. Inicio del día.
8. Planificación de misión principal.
9. Reuniones.
10. Timeline del día.
11. Notificación / Vamos / Flow / Descartar.
12. Ejercicio.
13. Pausa combinada.
14. Tengo un hueco.

### Cierre
15. Resumen del día.
16. Valoración.
17. Próxima jornada.

### Gamificación
18. Progreso.
19. Heatmap.
20. Evolución/avatar.
21. Logros básicos.

## 27. Estrategia de validación

Para cada pantalla:
1. Crear mock.
2. Revisar claridad, acciones, jerarquía y fricción.
3. Corregir.
4. Aprobar.
5. Solo entonces implementar.

## 28. Orden recomendado

1. Cerrar estilo visual.
2. Mockear onboarding.
3. Mockear flujo diario.
4. Mockear notificación y ejercicio.
5. Mockear cierre y progreso.
6. Congelar MVP visual.
7. Implementar motor y datos.
8. Implementar pantallas.
9. Implementar PWA/notificaciones.
10. Dogfooding 1–2 semanas.

## 29. Regla visual para implementación

La dirección visual del MVP será:

- Ilustraciones, avatar, evoluciones, iconografía principal y detalles decorativos en **pixel art**.
- Los componentes interactivos de UI usarán un **sistema moderno, limpio y coherente**, no un estilo pixel-art duro.

Esto aplica a:
- botones;
- toggles;
- selects;
- sliders;
- pills;
- inputs;
- cards;
- controles de formulario.

Reglas:

1. Todos los componentes interactivos deben pertenecer al mismo sistema visual.
2. Evitar mezclar un botón muy pixelado con toggles o selects completamente nativos/estándar sin adaptación visual.
3. El pixel art se utilizará como capa de identidad visual, no como sustituto de la usabilidad.
4. Claro y oscuro deben compartir exactamente la misma estructura y lenguaje de componentes.
5. Los títulos pueden mantener un toque pixel/display, mientras que el texto funcional debe priorizar legibilidad.
6. Los iconos pueden ser pixel art siempre que mantengan tamaño, grosor y color coherentes.
7. Heatmap, timeline, XP y elementos gamificados pueden tener detalles pixelados sin comprometer la lectura.

Objetivo:
mantener la personalidad de videojuego/pixel art de Breakbit sin que la interfaz se sienta inconsistente o menos usable.

## 30. Sistema de gamificación definitivo del MVP

### 30.1. Regla de día bueno

Una jornada planificada cuenta como **día bueno** si:

- se completa al menos el 70 % de las micropausas previstas;
- se completa la actividad principal.

Aplazar una pausa y completarla después cuenta igual que hacerla a la primera para determinar si el día es bueno.

Las pausas:
- ignoradas;
- perdidas;
- descartadas;

no cuentan como completadas.

### 30.2. Día no trabajado

Si el usuario no abre la app en una jornada que estaba planificada como laboral, el día se considera no bueno.

Debe existir una acción `Hoy no trabajo` en el flujo de inicio de jornada y una alternativa accesible desde la Home.

Al marcarla:
- se cancelan las notificaciones restantes del día;
- el día se excluye del cálculo semanal;
- no rompe la racha;
- se puede elegir el próximo día laboral.

Se permite marcar el día como no laborable aunque la jornada ya haya comenzado. La app no intentará impedir que el usuario modifique retrospectivamente su propio calendario.

### 30.3. Regla semanal

Solo cuentan jornadas planificadas como laborales.

Para que una semana afecte a la evolución del avatar deben existir al menos **3 jornadas planificadas**.

Resultados:

- **Semana buena:** >=70 % de días buenos → el avatar evoluciona una fase.
- **Semana regular:** 40–69 % de días buenos → el avatar se mantiene.
- **Semana mala:** <40 % de días buenos → el avatar involuciona una fase.
- **Semana con menos de 3 jornadas planificadas:** semana neutral → no evoluciona ni involuciona.

No existe cooldown para recuperar una fase.

Ejemplo:
- semana mala → fase 4 a fase 3;
- semana siguiente buena → fase 3 a fase 4.

Una semana mala estando ya en la fase mínima no produce ningún castigo extra.

### 30.4. Fases de evolución

Propuesta MVP:
1. fase inicial muy encorvada / primitiva;
2. fase intermedia más erguida;
3. developer sedentario;
4. developer activo;
5. developer optimizado.

La evolución representa constancia y hábitos, no una mejora médica real.

### 30.5. XP

El XP es una capa de recompensa inmediata y NO determina si una semana es buena o mala.

Valores iniciales propuestos:

- micropausa completada: **+100 XP**
- actividad principal completada: **+300 XP**
- completada al primer aviso: **+20 XP**
- pausa extra válida desde `Tengo un hueco`: **+10 XP**
- día bueno: **+200 XP**
- día perfecto: **+100 XP extra**
- descartar conscientemente una pausa: **-50 XP**

Las pausas extra están limitadas por las reglas de separación temporal y no pueden utilizarse para farmear XP de forma significativa.

### 30.6. Bonus de regreso

Si el usuario falta al menos a una jornada laboral planificada y vuelve a abrir la app en una jornada posterior:

- recibe **x1,5 XP base** durante esa jornada de regreso;
- el multiplicador solo afecta al XP base de micropausas planificadas y actividad principal;
- no multiplica bonus, pausas extra ni otras recompensas;
- la jornada perdida sigue contando como no buena;
- el bonus se aplica una sola vez por periodo de ausencia.

Objetivo:
motivar la vuelta sin borrar ni compensar artificialmente jornadas perdidas.

### 30.7. Racha

La racha se mide en **jornadas laborales buenas consecutivas**.

- sábados, domingos y días marcados como no laborables no suman;
- tampoco rompen la racha;
- una jornada laboral planificada no completada rompe la racha.

Puede mostrarse además una racha secundaria:
`X semanas buenas consecutivas`.

### 30.8. Recompensas después de la evolución máxima

Al alcanzar la fase máxima, las buenas semanas siguen teniendo recompensa visual.

En vez de rediseñar el personaje, evolucionará su entorno de trabajo.

Ejemplos de desbloqueables:
- planta;
- cuadro;
- lámpara;
- alfombra;
- estantería;
- balón de fútbol;
- patines;
- skate;
- kettlebell;
- esterilla;
- barra de dominadas;
- auriculares;
- altavoz;
- taza;
- segundo monitor;
- escritorio elevable;
- cinta de andar;
- decoración de pared.

Regla inicial:
- cada buena semana en fase máxima puede desbloquear o mejorar un elemento de habitación;
- varias semanas buenas consecutivas pueden desbloquear elementos más especiales.

El avatar permanece visualmente igual en la fase máxima; el progreso adicional se refleja en la habitación.

## 31. Ajustes de UX acordados tras los mocks

### Avatar
- No debe aparecer en todas las pantallas por obligación.
- Debe usarse cuando aporte narrativa, motivación, recompensa o evolución.
- En pantallas de configuración como Ajustes puede omitirse.
- En Home se muestra la fase real del usuario.
- En la ayuda visual de ejercicios se utilizará la versión más evolucionada del avatar para evitar crear assets del mismo ejercicio para todas las fases.

### Onboarding
- Primera pantalla: mostrar la evolución completa.
- Cada paso puede mostrar una etapa progresiva del avatar.
- Última pantalla: avatar en su fase más evolucionada, idealmente en pose de pulgar arriba.
- Los elementos interactivos deben mantener un sistema UI moderno y coherente; el pixel art se reserva para avatar, ilustraciones, iconos y gamificación.

### Inicio de jornada
- Debe permitir editar directamente hora de inicio y fin.
- Incluir descanso y comida.
- Permitir añadir reuniones y marcar si se puede hacer actividad durante ellas.
- La actividad principal debe permitir cambiar actividad y hora.
- Mostrar únicamente el equipamiento que se utilizará ese día.
- Incluir acción `Hoy no trabajo`.

### Home
- Avatar con bastante protagonismo.
- XP y racha junto al avatar.
- Barra de progreso y nivel en la parte inferior de la card.
- Mostrar horas de trabajo restantes.
- `Próxima pausa` y `Actividad de hoy` pueden ir lado a lado.
- `A mano hoy` debe ser fina, full-width, con iconos del equipamiento a la derecha.
- Timeline/progreso pueden usar scroll; no es obligatorio que todo quepa en una sola pantalla.
- El botón `Tengo un hueco` se integra elevado en la navegación inferior y debe estar suficientemente separado para evitar pulsaciones accidentales.

### Navegación principal
Pestañas:
- Hoy
- Tengo un hueco
- Progreso
- Ajustes

`Tengo un hueco` es una acción central elevada, no una pestaña convencional.

### Notificación / decisión rápida
- Avatar en pose de ánimo, no demostrando el ejercicio.
- CTA `Vamos`.
- Bloque `Ahora no puedo` con:
  - +5 min
  - +10 min
  - +15 min
- Mostrar dentro de ese bloque el acumulado:
  `Llevas X min aplazados`
- Al alcanzar el máximo de aplazamiento, ocultar las opciones de aplazar.
- `Descartar pausa` debe mostrar la penalización de XP.

### Pantalla de ejercicio
- El avatar más evolucionado demuestra el movimiento.
- Nombre, duración, pasos y temporizador.
- Si el ejercicio puede hacerse de pie, mostrar recomendación tipo:
  `Si puedes, hazlo mejor de pie`.
- La app busca que el usuario salga de la silla siempre que sea razonable.

### Ejercicio completado
- Celebración visual.
- XP obtenido.
- Indicador `A la primera` cuando corresponda.
- Progreso del día y de nivel.
- Puede cerrarse automáticamente tras unos segundos o permitir volver manualmente.

### Tengo un hueco
- Elegir tiempo:
  - 30 s
  - 1 min
  - 3 min
  - 10+ min
- Mostrar una propuesta adaptada.
- La descripción del ejercicio debe ir por pasos.
- Si no consume una pausa planificada, marcar:
  `+10 XP · Pausa extra`.

### Fin de jornada
- Se considera una vista/modal full-screen especial.
- No necesita navegación inferior.
- Incluye resumen, estado de racha, valoración personal y configuración de la siguiente jornada.
- Permite recuperar como máximo una micropausa pendiente.

### Progreso
Orden conceptual:
1. Tu evolución.
2. Heatmap de constancia.
3. Resumen semanal.
4. Molestias que más cuidas con estadísticas por zona.
5. Insights de la semana actual.

Ejemplos por zona:
- Cuello · 8 ejercicios · 14 min.
- Hombros · 5 ejercicios · 8 min.
- Vista · 4 pausas · 6 min.
- Espalda · 3 ejercicios · 5 min.

Evitar afirmar mejoras médicas; mostrar únicamente hábitos y actividad registrada.


