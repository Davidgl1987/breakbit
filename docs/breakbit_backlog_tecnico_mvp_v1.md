# Breakbit — Backlog técnico MVP por pantallas

## Objetivo
Construir un MVP web/PWA que ayude a personas que trabajan muchas horas frente al ordenador a crear el hábito de moverse mediante:

- micropausas breves distribuidas durante la jornada;
- una actividad principal diaria;
- planificación al inicio del día;
- notificaciones;
- gamificación ligera;
- resumen diario y progreso semanal;
- evolución visual de una mascota/avatar.

El MVP debe priorizar simplicidad, rapidez de uso y baja fricción.

---

# 0. Fundamentos técnicos

## 0.1 Aplicación base

> Durante el arranque del proyecto, avatar, poses, animaciones e ilustraciones de ejercicios pueden ser placeholders. No deben bloquear la arquitectura ni los flujos.

- React + Vite.
- TypeScript o JavaScript según preferencia final.
- PWA instalable.
- Persistencia local inicialmente.
- Service Worker para notificaciones/push cuando sea posible.
- Diseño responsive móvil-first.

### Criterios de aceptación
- La app funciona en móvil y escritorio.
- Puede instalarse como PWA.
- El usuario puede completar todo el flujo sin crear una cuenta.
- Los datos sobreviven a recargas/cierres del navegador.

## 0.2 Modelo de datos mínimo
Entidades iniciales:

### UserSettings
- workStart
- workEnd
- breaks[]
- lunchBreak
- intensity
- notificationsEnabled
- discomfortLevels
- equipment[]
- preferredLongActivityDuration
- workDays[]
- nextWorkdayOverride

### NextWorkdayOverride
- date
- isWorkingDay
- workStart
- workEnd
- breaks[]
- lunchBreak
- source: repeated | custom | day_off

### Exercise
- id
- name
- description
- category
- targetAreas[]
- equipment[]
- durationSeconds
- type: microbreak | main_activity
- difficulty
- canDoDuringMeeting
- animationAsset
- instructions[]
- progressionGroup
- progressionLevel

### DailyPlan
- date
- startTime
- endTime
- microbreaks[]
- mainActivity
- mainActivityScheduledAt
- completionTarget

### ScheduledActivity
- exerciseId
- scheduledAt
- status: pending | completed | skipped | postponed
- completedAt
- skipReason
- postponeCount

### DailySummary
- date
- microbreaksCompleted
- microbreaksScheduled
- mainActivityCompleted
- interruptionSeconds
- movementSeconds
- mood
- xpEarned
- dailyGoalCompleted

### Progress
- currentXp
- streak
- evolutionStage
- dailyCompletionHistory[]

---

# 1. Splash / bienvenida

## Historia
Como usuario nuevo quiero entender en pocos segundos qué hace la app.

## UI
- Logo/nombre.
- Mascota/avatar.
- Mensaje corto:
  - pequeñas pausas;
  - menos tiempo sentado;
  - crear hábito;
  - cuidar cuello, espalda y vista.
- CTA `Comenzar`.

## Tareas
- [ ] Crear layout.
- [ ] Añadir CTA de onboarding.
- [ ] Preparar espacio para mascota.
- [ ] Guardar flag `hasCompletedOnboarding`.

## Fuera del MVP
- Login.
- Cuenta.
- Sincronización cloud.

---

# 2. Onboarding — Jornada laboral

## Historia
Como usuario quiero indicar cuándo trabajo para que las pausas se distribuyan correctamente.

## Campos
- Inicio de jornada.
- Fin de jornada.
- Descanso(s) habitual(es).
- Pausa para comer:
  - hora de inicio;
  - duración.
- Días laborables.

## Reglas
- No programar micropausas durante comida.
- Los descansos pueden proponerse como huecos para la actividad principal.
- La planificación inicial se lanza al comienzo de la jornada.
- El resumen diario se programa 5–10 min antes del final.

## Tareas
- [ ] Selector de inicio/fin.
- [ ] Añadir descanso.
- [ ] Añadir comida.
- [ ] Validar solapamientos.
- [ ] Persistir horario.
- [ ] Generar bloques `work`, `break`, `lunch`.

## Criterios de aceptación
- No se pueden guardar rangos inválidos.
- La comida queda excluida automáticamente del algoritmo de pausas.

---

# 3. Onboarding — Molestias / prioridades

## Historia
Como usuario quiero indicar qué zonas noto más cargadas para recibir un plan más relevante.

## Sliders
Escala interna 0–5:

- Cuello.
- Espalda.
- Hombros.
- Muñecas/manos.
- Vista.
- Sedentarismo.

## Reglas
- Los sliders generan pesos para el selector de ejercicios.
- No implican diagnóstico médico.
- Evitar repetir la misma categoría en pausas consecutivas salvo necesidad.

## Tareas
- [ ] Componente slider reutilizable.
- [ ] Guardar valores 0–5.
- [ ] Función para convertir valores en pesos.
- [ ] Crear selección ponderada de categorías.

---

# 4. Onboarding — Equipamiento

## Equipamiento MVP
- Ninguno.
- Barra de dominadas.
- Mancuernas.
- Kettlebell.
- Esterilla.
- Escritorio elevable.

Además:
- Pasear por la calle siempre está disponible como actividad.
- La arquitectura permitirá añadir cinta de andar y bandas posteriormente.

## Tareas
- [ ] Selector multiselección.
- [ ] Guardar equipamiento.
- [ ] Filtrar ejercicios compatibles.
- [ ] Mostrar ejemplos de actividades desbloqueadas.

---

# 5. Onboarding — Intensidad y permisos

## Intensidades
### Suave
- 4 micropausas.
- 1 actividad principal.

### Normal
- 6 micropausas.
- 1 actividad principal.

### Activo
- 8 micropausas.
- 1 actividad principal.

## Pantalla
- Resumen de configuración.
- Estimación de minutos de interrupción.
- Explicación del sistema.
- Solicitud de permiso de notificaciones.

## Tareas
- [ ] Selector de intensidad.
- [ ] Calcular número inicial de pausas.
- [ ] Mostrar preview del día.
- [ ] Solicitar permisos solo tras explicar su utilidad.
- [ ] Manejar permiso denegado.

---

# 6. Inicio de jornada / planificación diaria

## Historia
Como usuario quiero planificar mi actividad principal al empezar el día para comprometerme con un hueco concreto.

## Notificación inicial
Se dispara a la hora configurada como inicio de jornada.

## Pantalla
- Saludo.
- Misión principal propuesta.
- Duración.
- Horas sugeridas.
- Descansos disponibles.
- CTA:
  - `Programar`.
  - `Otra hora`.
  - `Otra misión`.

## Datos visibles
- Número de micropausas del día.
- Tiempo aproximado total de interrupción.
- Actividad principal.
- Estado de racha.

## Reglas
- La actividad principal debe programarse.
- Puede coincidir con un descanso.
- Puede marcarse como compatible con reunión.
- Pasear por la calle durante descanso es válido.
- El usuario puede pedir otra actividad.

## Tareas
- [ ] Generador de misión principal.
- [ ] Selector de hora.
- [ ] Recomendación de huecos.
- [ ] Regenerar actividad.
- [ ] Confirmar plan diario.
- [ ] Programar recordatorios del día.

---

# 7. Generador del plan diario

## Objetivo
Distribuir micropausas sin resultar pesado.

## Reglas iniciales
- Distribuir pausas a lo largo de los bloques de trabajo.
- No colocar pausas durante comida.
- Evitar descansos ya definidos cuando no sea necesario.
- Separación mínima aproximada: 45 min.
- Evitar superar aproximadamente 90 min sin oportunidad de pausa.
- No colocar dos micropausas demasiado juntas.
- Tras posponer una, recalcular las siguientes si se amontonan.
- No repetir categoría consecutivamente salvo necesidad.
- Priorizar categorías según sliders.
- Rotar ejercicios concretos para introducir variedad.

## Algoritmo MVP
1. Construir ventanas disponibles.
2. Calcular número de micropausas.
3. Distribuir posiciones base.
4. Ajustar contra descansos/comida.
5. Seleccionar categoría ponderada.
6. Elegir ejercicio compatible y no repetido recientemente.
7. Guardar DailyPlan.

## Tareas
- [ ] `buildAvailableWindows()`.
- [ ] `distributeBreaks()`.
- [ ] `pickExerciseCategory()`.
- [ ] `pickExercise()`.
- [ ] Resolver colisiones.
- [ ] Tests unitarios del planificador.

---

# 8. Home / día actual

## Pantalla principal
Debe responder rápidamente:

- ¿Cómo voy hoy?
- ¿Cuándo es mi próxima pausa?
- ¿He hecho la actividad principal?
- ¿Cómo va mi mascota?

## Componentes
- Avatar/evolución actual.
- Barra XP.
- Racha.
- Próxima micropausa.
- Misión principal.
- `Tengo un hueco`.
- Resumen:
  - X/Y micropausas;
  - minutos de movimiento;
  - minutos reales de interrupción.

## Tareas
- [ ] Dashboard.
- [ ] Próxima actividad.
- [ ] Estado en tiempo real.
- [ ] CTA `Tengo un hueco`.
- [ ] CTA misión principal.

---

# 9. Notificación de micropausa

## Flujo
Notificación → click → abrir ruta directa al ejercicio.

Ejemplo:
`/exercise/:scheduledActivityId`

## Acciones
- `Empezar ahora`.
- `Estoy en flow (+30 min)`.
- `Saltar`.

## Reglas
### Estoy en flow
- No penaliza.
- Posponer 30 min por defecto.
- Recalcular plan si provoca solapamiento.

### Saltar
Solicitar motivo opcional:
- concentrado;
- reunión;
- sin tiempo;
- no apetece;
- ejercicio no gusta;
- otro.

## Tareas
- [ ] Programar notificación.
- [ ] Deep link a actividad.
- [ ] Posponer.
- [ ] Saltar.
- [ ] Modal de motivo.
- [ ] Recalcular futuras pausas.

---

# 10. Pantalla de ejercicio

## Objetivo
Entrar, entender el movimiento en segundos, hacerlo y salir.

## UI
- Nombre.
- Zona.
- Animación/ilustración.
- Descripción muy breve.
- Pasos simples.
- Temporizador.
- Pausa/reanudar.
- Finalizar.

## Al finalizar
- marcar actividad completada;
- XP;
- valoración opcional rápida;
- intentar cerrar la pestaña si fue abierta desde la notificación;
- si no se puede cerrar, mostrar `Vuelve al trabajo`.

## Reglas
- Micropausas MVP: principalmente 30–60 s.
- Algunas: 90 s.
- Máximo habitual: 2 min.
- Nada orientado a rehabilitación o entrenamiento intenso.

## Tareas
- [ ] Temporizador.
- [ ] Estados start/pause/complete.
- [ ] Render de asset animado.
- [ ] XP.
- [ ] Guardar completion.
- [ ] Navegación de salida.

---

# 11. Tengo un hueco

## Historia
Como usuario quiero aprovechar espontáneamente un tiempo muerto.

## Opciones
- 30 s.
- 1 min.
- 3 min.
- 10+ min.

## Regla anti-farming
Si ha pasado demasiado poco tiempo desde la última micropausa:
- permitir movimiento voluntario;
- no contar como micropausa programada;
- no adelantar la siguiente pausa;
- XP reducido o sin bonus de micropausa.

Si ha pasado suficiente tiempo:
- puede ejecutar anticipadamente la próxima micropausa.

## Tareas
- [ ] Calcular `timeSinceLastBreak`.
- [ ] Definir cooldown.
- [ ] Filtrar ejercicios por tiempo.
- [ ] Diferenciar ejercicio extra / micropausa válida.
- [ ] Registrar origen `spontaneous`.

---

# 12. Actividad principal

## Objetivo
Garantizar al menos una actividad algo más significativa al día.

## Ejemplos MVP
- Paseo por la calle.
- Trabajar de pie.
- Colgarse de barra / progresión sencilla.
- Rutina de movilidad en esterilla.
- Mini bloque con mancuernas.
- Mini bloque con kettlebell.

## Reglas
- Debe programarse al inicio del día.
- Puede posponerse.
- Puede completarse manualmente.
- Necesaria para cumplir objetivo diario/racha.

## Tareas
- [ ] Vista de actividad.
- [ ] Temporizador o confirmación según tipo.
- [ ] Programar/reprogramar.
- [ ] Completar.
- [ ] Registrar minutos activos.

---

# 13. Fin de jornada

## Trigger
5–10 min antes del fin configurado.

## Pantalla
Mostrar:
- micropausas completadas / planificadas;
- actividad principal;
- minutos de micropausas;
- minutos de actividad/movimiento;
- tiempo real de interrupción;
- XP ganado;
- estado de racha.

Mensaje principal:
`Hoy solo has necesitado X minutos de interrupción para moverte durante tu jornada.`

## Recuperación
Si falta una micropausa corta:
- ofrecer completarla.

Si falta actividad principal:
- ofrecer una alternativa breve compatible con el tiempo restante.

## Mood
Pregunta:
`¿Cómo terminas hoy?`

Valores:
- muy bien;
- bien;
- cargado;
- bastante mal.

## Confirmación de la próxima jornada

Antes de finalizar el flujo, preguntar:

`¿Mañana tienes el mismo horario?`

Acciones:

- `Sí, repetir horario`.
- `No, cambiar horario`.
- `No trabajo mañana`.

### Reglas
- Si repite horario, crear la próxima jornada usando la configuración actual.
- Si cambia horario, guardar una excepción únicamente para la siguiente jornada.
- Si no trabaja, permitir elegir el próximo día laboral.
- Un día libre no genera notificación de inicio, micropausas ni cierre.
- La plantilla semanal habitual se conserva salvo que el usuario edite expresamente sus ajustes.
- Debe funcionar para horarios variables, fines de semana, vacaciones y días libres.

## Tareas
- [ ] Calcular resumen.
- [ ] Recovery CTA.
- [ ] Mood selector.
- [ ] Confirmación de próxima jornada.
- [ ] Selector rápido de horario para el día siguiente.
- [ ] Acción `No trabajo mañana`.
- [ ] Selector del próximo día laboral.
- [ ] Persistir `nextWorkdayOverride`.
- [ ] Programar/reprogramar la próxima notificación de inicio.
- [ ] Cerrar jornada.
- [ ] Actualizar racha.
- [ ] Actualizar XP/evolución.

---

# 14. Objetivo diario, racha y calendario laboral

## Día bueno
Una jornada planificada cuenta como **día bueno** si:

- se completa >=70 % de las micropausas previstas;
- Y se completa la actividad principal.

Una pausa aplazada y completada dentro de su ventana cuenta como completada.
No se exige 100 %.

## Día no trabajado
Debe existir la acción `Hoy no trabajo`:

- en el inicio de jornada;
- y como acción secundaria accesible desde Home.

Al usarla:
- se cancelan las notificaciones restantes;
- el día se excluye del cálculo semanal;
- no suma ni rompe racha;
- puede elegirse el próximo día laboral.

Puede marcarse incluso si la jornada ya había empezado.

Si el usuario no abre Breakbit en una jornada planificada como laboral y no la marca como libre, esa jornada cuenta como no buena.

## Racha
La racha es de **jornadas laborales buenas consecutivas**.

- sábados, domingos y días no laborables no suman;
- tampoco rompen la racha;
- una jornada laboral planificada no buena sí la rompe.

Puede existir además una métrica secundaria de semanas buenas consecutivas.

## Tareas
- [ ] `isDailyGoalComplete()`.
- [ ] Acción `Hoy no trabajo`.
- [ ] Excluir día libre del cálculo semanal.
- [ ] Actualizar streak.
- [ ] Romper streak cuando corresponda.
- [ ] Tests.

---

# 15. XP y gamificación

## Principio
El XP proporciona feedback y recompensa, pero **NO determina la evolución semanal del avatar**.

## Valores iniciales
Centralizar en configuración:

- micropausa completada: **+100 XP**;
- actividad principal: **+300 XP**;
- completada al primer aviso: **+20 XP**;
- pausa extra válida desde `Tengo un hueco`: **+10 XP**;
- día bueno: **+200 XP**;
- día perfecto: **+100 XP extra**;
- descartar conscientemente una pausa: **-50 XP**.

Las pausas extra deben respetar las limitaciones temporales ya definidas y no deben convertirse en una vía relevante de farming.

## Bonus de regreso
Si el usuario falta al menos a una jornada laboral planificada y vuelve:

- aplicar **x1,5 XP base** durante la siguiente jornada;
- solo a micropausas planificadas y actividad principal;
- no multiplicar bonus, pausas extra ni otras recompensas;
- aplicar una sola vez por periodo de ausencia;
- no corregir retroactivamente el día perdido.

## No MVP
- ligas;
- leaderboard;
- tienda;
- moneda;
- amigos.

## Tareas
- [ ] Config XP centralizada.
- [ ] Award/deduct XP idempotente.
- [ ] Bonus `first_try`.
- [ ] Bonus de regreso x1,5.
- [ ] Evitar duplicados.
- [ ] Mostrar feedback breve.
- [ ] Tests de cálculo.

---

# 16. Evolución semanal del avatar

## Concepto
El avatar representa constancia y hábitos, no una mejora médica real.

## Fases MVP
5 fases visuales aproximadas:

1. fase inicial muy encorvada/primitiva;
2. fase intermedia más erguida;
3. developer sedentario;
4. developer activo;
5. developer optimizado.

Los assets pueden ser placeholders durante las primeras iteraciones de desarrollo.

## Evaluación semanal
Solo cuentan jornadas planificadas como laborales.

Para que la semana afecte a la evolución deben existir al menos **3 jornadas planificadas**.

- **Semana buena:** >=70 % de días buenos -> evoluciona una fase.
- **Semana regular:** 40–69 % -> mantiene fase.
- **Semana mala:** <40 % -> involuciona una fase.
- **Menos de 3 jornadas:** semana neutral.

Reglas:
- una semana mala en fase mínima no añade ningún castigo;
- no existe cooldown;
- si baja de fase y la siguiente semana es buena, puede recuperar inmediatamente la fase perdida.

## Fase máxima
Una vez alcanzada la fase 5, las buenas semanas continúan dando recompensa visual mediante la habitación/entorno, sin rediseñar el personaje.

Ejemplos:
- planta;
- cuadro;
- lámpara;
- estantería;
- balón;
- skate;
- patines;
- kettlebell;
- esterilla;
- auriculares;
- monitor;
- escritorio elevable;
- cinta de andar.

## Tareas
- [ ] Definir stages.
- [ ] `getWeeklyResult()`.
- [ ] Calcular días buenos / días laborales.
- [ ] Aplicar evolución, mantenimiento o involución.
- [ ] Permitir recuperación inmediata.
- [ ] Assets/placeholders por stage.
- [ ] Sistema simple de desbloqueos de habitación en fase máxima.
- [ ] Tests.

---

# 17. Progreso

## Vista principal
Orden acordado:

1. Tu evolución.
2. Heatmap de constancia.
3. Resumen semanal.
4. Molestias que más cuidas.
5. Insights de la semana actual.

## Heatmap
Cada día puede reflejar:
- sin actividad;
- bajo cumplimiento;
- medio;
- alto;
- día bueno.

## Estadísticas MVP
- días buenos;
- racha;
- micropausas completadas;
- pausas a la primera;
- micropausas perdidas/descartadas;
- actividad principal;
- minutos de micropausas;
- minutos de movimiento;
- tiempo de interrupción;
- XP.

## Estadísticas por molestia/zona
Mostrar actividad objetiva, no mejora médica.

Ejemplos:
- `Cuello · 8 ejercicios · 14 min`
- `Hombros · 5 ejercicios · 8 min`
- `Vista · 4 pausas · 6 min`
- `Espalda · 3 ejercicios · 5 min`

## Tareas
- [ ] Heatmap.
- [ ] Resumen semanal.
- [ ] Estadísticas por zona.
- [ ] Insights.
- [ ] Historial.
- [ ] Vista de evolución.

# 18. Ajustes

## MVP
- Jornada.
- Descansos.
- Comida.
- Molestias.
- Equipamiento.
- Intensidad.
- Notificaciones.
- Sonido/vibración si aplica.

## Tareas
- [ ] Editar onboarding.
- [ ] Persistir.
- [ ] Regenerar futuros planes tras cambios.

---

# 19. Notificaciones / PWA

## Objetivo MVP web
- Notification API.
- Service Worker.
- Abrir app en actividad concreta al pulsar.
- Intentar cerrar pestaña al finalizar si el contexto del navegador lo permite.

## Notificaciones
- inicio de jornada;
- micropausas;
- actividad principal;
- cierre de jornada.

La siguiente notificación de inicio debe calcularse a partir de:

1. una excepción explícita para la próxima jornada, si existe;
2. en su defecto, la plantilla semanal habitual;
3. los días marcados como libres, que se omiten por completo.

## Tareas
- [ ] Registrar Service Worker.
- [ ] Permisos.
- [ ] Scheduling strategy.
- [ ] Resolver `nextWorkday`.
- [ ] Cancelar notificaciones de días marcados como libres.
- [ ] Reprogramar notificaciones si cambia el horario de la próxima jornada.
- [ ] Click handler / deep links.
- [ ] Fallback si navegador no soporta comportamiento.
- [ ] PWA manifest.

---

# 20. Analítica interna de producto

Sin necesidad de analytics externo inicialmente, almacenar eventos localmente para inspección durante dogfooding.

## Eventos útiles
- notification_shown
- notification_opened
- exercise_started
- exercise_completed
- exercise_postponed
- exercise_skipped
- spontaneous_break
- main_activity_completed
- day_completed
- daily_mood

## Métricas clave de validación
1. % micropausas completadas.
2. % micropausas pospuestas.
3. % micropausas saltadas.
4. % días con misión principal.
5. % días que cumplen racha.
6. tiempo medio de interrupción.
7. uso de `Tengo un hueco`.
8. retención de uso personal tras 7/14 días.

---

# 21. Orden recomendado de implementación

## Fase A — Motor funcional
1. Datos de ejercicios.
2. Settings/onboarding.
3. Generador de plan diario.
4. Home.
5. Pantalla de ejercicio.
6. Completar/saltar/posponer.
7. Persistencia.

## Fase B — Jornada completa
8. Actividad principal.
9. Tengo un hueco.
10. Resumen de fin de día.
11. Confirmación/programación de la próxima jornada.
12. Racha.
13. XP.

## Fase C — Engagement
14. Heatmap.
15. Evolución de avatar.
16. Estadísticas semanales.

## Fase D — PWA real
17. Service Worker.
18. Notificaciones.
19. Deep links.
20. Instalación PWA.

## Fase E — Dogfooding
21. Usarla personalmente durante 1–2 semanas.
22. Registrar molestias UX.
23. Ajustar frecuencia/duración.
24. Eliminar features molestas antes de añadir nuevas.

---

# 22. Fuera del MVP

- Login.
- Backend.
- Multi-dispositivo.
- IA generativa.
- Análisis postural por cámara.
- Integración automática con calendario.
- Slack/Teams.
- Plugin VS Code.
- Detección de builds.
- Apple Watch / Wear OS.
- Amigos.
- Friend quests.
- Leaderboards.
- Tienda/cosméticos.
- Planes de rehabilitación.
- Diagnóstico.
- Rutinas de entrenamiento.
- Nutrición.
- Sueño.

---

# 23. Definition of Done del MVP

El MVP está listo para dogfooding cuando un usuario pueda:

1. Completar onboarding.
2. Configurar su jornada y equipamiento.
3. Recibir/generar un plan para el día.
4. Programar una actividad principal.
5. Realizar micropausas distribuidas.
6. Posponerlas con `Estoy en flow`.
7. Saltarlas indicando opcionalmente motivo.
8. Usar `Tengo un hueco`.
9. Completar la misión principal.
10. Ver resumen al acabar.
11. Obtener o perder el objetivo diario.
12. Mantener una racha.
13. Ganar XP.
14. Ver evolucionar el avatar.
15. Consultar un heatmap e indicadores semanales.
16. Confirmar al cerrar el día si la próxima jornada mantiene horario, cambia o es día libre.
17. Repetir el ciclo varios días sin necesidad de tocar manualmente el plan.
