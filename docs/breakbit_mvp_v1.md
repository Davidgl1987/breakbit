# Breakbit — Requisitos MVP

> Nota de handoff: los assets de avatar, poses y ejercicios pueden empezar como placeholders. La implementación no debe bloquearse por arte pendiente.

## 1. Objetivo del producto

Breakbit es una app para personas que pasan muchas horas trabajando frente al ordenador. Su objetivo no es rehabilitar ni entrenar, sino **crear el hábito de moverse, estirar y romper periodos largos de sedentarismo** mediante micropausas muy cortas, una actividad principal diaria y gamificación ligera.

El MVP debe validar una pregunta principal:

> ¿La app consigue que una persona haga más pausas de movimiento durante su jornada y las ignore cada vez menos?

---

## 2. Principios del MVP

- Las micropausas deben durar normalmente entre **30 y 60 segundos**.
- Algunas pueden durar hasta **90–120 segundos**, pero deben ser minoría.
- La app no debe sentirse pesada ni interrumpir en exceso.
- El usuario debe poder posponer una pausa sin sentirse penalizado.
- El objetivo es distribuir el movimiento durante el día, no permitir completar todas las pausas de golpe.
- El producto debe evitar lenguaje médico o promesas de curación.
- El contenido debe centrarse en movilidad suave, descarga, estiramiento leve y cambio de postura.
- La actividad principal sí puede durar más: entre **5 y 30 minutos**.

---

## 3. Público inicial

Usuarios que trabajan muchas horas frente a una pantalla:

- Developers
- Diseñadores
- Trabajadores remotos
- Profesionales de oficina
- Personas con jornadas sedentarias

El tono puede tener guiños tech, pero sin excluir a usuarios no técnicos.

---

## 4. Flujo principal diario

### 4.1. Inicio de jornada

La app conoce desde onboarding la hora habitual de inicio.

Al comenzar la jornada, envía una notificación para planificar el día.

La pantalla de inicio debe mostrar:

- Hora de inicio y fin de jornada.
- Descanso corto habitual, si existe.
- Pausa para comer, si existe.
- Propuesta de actividad principal diaria.
- Posibilidad de asignar la actividad principal a:
  - un descanso,
  - una reunión sin cámara,
  - una hora concreta,
  - otro hueco elegido manualmente.
- Resumen del día:
  - número de micropausas,
  - tiempo total estimado de interrupción,
  - actividad principal,
  - XP posible.

### 4.2. Micropausas durante el día

La app distribuye automáticamente las micropausas dentro de la jornada.

Reglas iniciales:

- Mínimo recomendado entre micropausas: **45 min**.
- Objetivo habitual: no superar aproximadamente **90 min** sin movimiento.
- No programar micropausas durante la comida.
- Evitar programar una micropausa inmediatamente después de la actividad principal.
- Si una pausa se pospone, recalcular las siguientes para evitar que queden amontonadas.

Acciones de una notificación:

- **Empezar ahora**
- **Estoy en flow** → posponer, inicialmente +30 min
- **Saltar**

Si se salta una pausa, se puede pedir opcionalmente un motivo:

- Estoy concentrado
- Estoy en una reunión
- No tengo tiempo
- No me apetece
- No me gusta este ejercicio

### 4.3. Ejercicio

Al abrir la notificación:

- Nombre del ejercicio.
- Zona principal.
- Ilustración o animación.
- Descripción de 1–3 líneas.
- Temporizador.
- XP otorgado.

Al terminar:

- Confirmación rápida.
- XP ganado.
- Valoración opcional de un toque:
  - Igual
  - Mejor
  - Mucho mejor

### 4.4. “Tengo un hueco”

Acción accesible durante la jornada.

El usuario puede indicar cuánto tiempo tiene:

- 30 s
- 1 min
- 3 min
- 10+ min

Regla importante:

- Si ha pasado poco tiempo desde la última micropausa, el ejercicio puede hacerse, pero **no debe contar como sustitución de la siguiente micropausa del plan**.
- El objetivo es evitar que el usuario complete todas las pausas a primera hora y pase el resto del día sentado.

### 4.5. Fin de jornada

Entre 5 y 10 minutos antes del final habitual:

Mostrar:

- Micropausas completadas / programadas.
- Actividad principal completada o no.
- Tiempo total de micropausas.
- Tiempo total de movimiento.
- Tiempo real de interrupción del trabajo.
- XP del día.
- Racha actual.

Mensaje clave:

> Todo lo que has hecho hoy te ha costado muy poco tiempo de tu jornada.

Dar la posibilidad de recuperar una micropausa pendiente si queda alguna.

Terminar con una valoración:

- Muy bien
- Bien
- Cargado
- Dolorido

Esta valoración sirve como tendencia personal, no como medición clínica.

### 4.6. Confirmación de la próxima jornada

Al cerrar el día, la app debe preguntar:

> **¿Mañana tienes el mismo horario?**

Opciones MVP:

- **Sí, repetir horario** → conservar la jornada actual y programar la notificación de inicio para el día siguiente.
- **No, cambiar horario** → permitir definir el horario de la próxima jornada antes de cerrar.
- **No trabajo mañana** → elegir el próximo día de trabajo y posponer hasta entonces la notificación de planificación.

Objetivos:

- soportar usuarios con horarios variables sin obligarlos a rehacer el onboarding;
- evitar notificaciones durante vacaciones, fines de semana o días libres;
- mantener el horario habitual como plantilla, no como calendario rígido;
- permitir que cada jornada tenga una configuración puntual distinta sin modificar necesariamente la plantilla habitual.

Si el usuario no responde, la app conserva la plantilla habitual y aplica los días laborables configurados. Una excepción confirmada para la próxima jornada tiene prioridad sobre esa plantilla.

---

## 5. Racha y gamificación

La racha no debe depender de completar el 100% de las pausas.

Propuesta inicial:

Para mantener la racha diaria:

- completar al menos **70% de las micropausas**, y
- completar **1 actividad principal**.

La actividad principal puede ser, por ejemplo:

- Paseo por la calle
- Paseo en cinta
- Trabajo de pie con escritorio elevable
- Mini rutina de movilidad
- Barra de dominadas
- Mancuernas
- Kettlebell
- Esterilla

Gamificación MVP:

- XP
- Racha
- Objetivo diario
- Gráfico semanal/mensual estilo GitHub
- Avatar/mascota con evolución simple

No incluir inicialmente:

- Ligas
- Amigos
- Ranking
- Marketplace
- Gemas
- Integraciones sociales

---

## 6. Evolución visual

El MVP puede usar una mascota o avatar con varios estados visuales.

La evolución debe depender de la tendencia de hábito, no de un solo día.

Propuesta:

- 4–5 estados.
- Evolución gradual con buenas semanas.
- Retroceso lento si se abandonan los hábitos.
- Evitar castigos excesivos.

La animación de ejercicios puede estar separada de la mascota principal si facilita la producción.

---

## 7. Progreso y estadísticas

### Dashboard mínimo

- % de micropausas completadas.
- Pausas saltadas.
- Tiempo total de micropausas.
- Tiempo total de movimiento.
- Actividades principales completadas.
- Racha.
- XP.

### Gráfico tipo GitHub

Cada día se representa con un cuadrado.

Intensidad basada en el cumplimiento diario, no en el número bruto de ejercicios.

Ejemplo:

- 0–19% → gris
- 20–39% → verde muy claro
- 40–59% → verde claro
- 60–79% → verde medio
- 80–100% → verde oscuro

---

## 8. Onboarding

### Pantalla 1 — Jornada

Datos:

- Hora de inicio.
- Hora de fin.
- Descanso corto opcional.
- Duración del descanso.
- Comida opcional.
- Duración de comida.

### Pantalla 2 — Molestias

Sliders de 0 a 5 para:

- Cuello
- Espalda
- Hombros
- Muñecas
- Vista
- Sedentarismo

Los valores se usan como pesos para priorizar ejercicios.

No usar una correspondencia rígida 1:1. Debe existir variedad y evitar repetir la misma zona continuamente.

### Pantalla 3 — Equipamiento

Equipamiento inicial:

- Ninguno
- Barra de dominadas
- Mancuernas
- Kettlebell
- Esterilla
- Escritorio elevable

Puede añadirse cinta de andar posteriormente o ya en MVP si el coste es bajo.

### Pantalla 4 — Intensidad

Opciones:

- Suave → 4 micropausas + 1 actividad principal
- Normal → 6 micropausas + 1 actividad principal
- Activo → 8 micropausas + 1 actividad principal

### Pantalla 5 — Notificaciones

Explicar el valor antes de pedir permiso.

---

## 9. Notificaciones y comportamiento web

La programación de notificaciones debe contemplar tanto una **plantilla semanal habitual** como excepciones de la próxima jornada confirmadas al finalizar el día. Un día marcado como libre no debe generar notificación de inicio ni recordatorios de ejercicio.

Para MVP web/PWA:

- Usar notificaciones push mediante Service Worker.
- La notificación puede abrir la app en la ruta del ejercicio.
- El flujo debe ser lo más corto posible.
- Tras completar, intentar cerrar la pestaña si fue abierta por la notificación cuando el navegador lo permita.
- Si no puede cerrarse, mostrar un estado final mínimo: “Listo. Vuelve a lo tuyo”.

Futuro opcional:

- Extensión de VS Code.
- Integración con calendario.
- Detección de reuniones.
- Integración con build/deploy.

---

## 10. Equipamiento MVP

| Equipamiento | ¿MVP? | Uso principal |
|---|---:|---|
| Ninguno | Sí | Movilidad y estiramientos básicos |
| Barra de dominadas | Sí | Colgado, activación escapular, progresión |
| Mancuernas | Sí | Movilidad activa y mini bloques simples |
| Kettlebell | Sí | Bisagra, sentadilla, carga simple |
| Esterilla | Sí | Movilidad en suelo y descarga |
| Escritorio elevable | Sí | Bloques de trabajo de pie |
| Paseo por la calle | Sí | Actividad principal sin material |
| Cinta de andar | Opcional MVP / fase 1.1 | Caminar mientras se trabaja o en reunión |
| Bandas elásticas | Fase posterior | Espalda alta, hombros, movilidad activa |
| Foam roller | Fase posterior | Descarga específica |

---

# 11. Catálogo inicial de ejercicios

> Nota: los ejercicios están pensados para hábito de movimiento y movilidad suave. No son ejercicios de rehabilitación ni planes de entrenamiento.

## 11.1. Sin equipamiento

| Ejercicio | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Retracción cervical suave | Cuello | Micropausa | 30–45 s | Sentado | Llevar suavemente la barbilla hacia atrás sin inclinar la cabeza. | 8 → 10 → 12 repeticiones | Sí |
| Rotación cervical suave | Cuello | Micropausa | 30–45 s | Sentado | Girar lentamente la cabeza a izquierda y derecha sin forzar. | 6 → 8 → 10 repeticiones | Sí |
| Inclinación lateral suave | Cuello | Micropausa | 30–45 s | Sentado | Inclinar suavemente la cabeza hacia un hombro, sin elevarlo. | 10 → 15 → 20 s por lado | Sí |
| Isométricos suaves con mano | Cuello | Micropausa | 45–60 s | Sentado | Empujar suavemente la cabeza contra la mano sin mover el cuello. | 5 → 8 → 10 s por dirección | Sí |
| Círculos de hombros | Hombros | Micropausa | 30–45 s | Sentado o de pie | Rotaciones lentas de hombros hacia atrás. | 10 → 15 → 20 repeticiones | Sí |
| Retracción escapular | Hombros / espalda alta | Micropausa | 30–45 s | Sentado | Juntar suavemente los omóplatos y soltar. | 8 → 10 → 12 repeticiones | Sí |
| Apertura de pecho | Pecho / hombros | Micropausa | 30–45 s | De pie | Abrir brazos y pecho suavemente o usar marco de puerta. | 15 → 20 → 30 s | Parcial |
| Extensión torácica sentado | Espalda alta | Micropausa | 30–45 s | Sentado | Abrir pecho y extender la zona torácica de forma controlada. | 6 → 8 → 10 repeticiones | Sí |
| Rotación torácica sentado | Espalda | Micropausa | 30–45 s/lado | Sentado | Girar tronco lentamente hacia cada lado. | 5 → 8 → 10 repeticiones | Sí |
| Gato-vaca sentado/de pie | Espalda | Micropausa | 45–60 s | Sentado o de pie | Alternar flexión y extensión suave de columna. | 6 → 8 → 10 ciclos | Parcial |
| Bisagra de cadera sin peso | Espalda / cadera | Micropausa | 45–60 s | De pie | Llevar cadera atrás manteniendo espalda neutra. | 8 → 10 → 12 repeticiones | No |
| Marcha en el sitio | General | Micropausa | 45–60 s | De pie | Caminar en el sitio de forma suave. | Más ritmo o rodillas algo más altas | Sí |
| Sentadillas al aire | Piernas / general | Micropausa | 30–60 s | De pie | Sentadillas cómodas y controladas. | 8 → 10 → 12 → 15 reps | No |
| Elevaciones de talón | Piernas | Micropausa | 30–45 s | De pie | Elevar talones y volver lentamente. | 15 → 20 → 25 reps | Sí |
| Caminar por casa/oficina | General | Micropausa | 1–2 min | Pausa real | Dar una vuelta corta para romper el sedentarismo. | 1 → 2 min | Sí |
| Mirada lejana | Vista | Micropausa | 20–30 s | Sentado | Apartar la vista de la pantalla y enfocar a distancia. | Repetición, sin aumentar carga | Sí |
| Parpadeo consciente + mirada lejana | Vista | Micropausa | 30–45 s | Sentado | Parpadear lentamente varias veces y mirar a distancia. | 10 parpadeos + 20–30 s lejos | Sí |
| Flexión/extensión de dedos | Manos | Micropausa | 30–45 s | Sentado | Abrir/cerrar manos y movilizar dedos. | 10 → 15 → 20 reps | Sí |
| Movilidad de muñeca | Muñecas | Micropausa | 30–45 s | Sentado | Flexión, extensión y círculos suaves de muñeca. | Aumentar repeticiones, no fuerza | Sí |
| Pronación/supinación antebrazo | Antebrazo | Micropausa | 30–45 s | Sentado | Girar palma arriba y abajo lentamente. | 8 → 10 → 12 reps | Sí |
| Paseo corto al aire libre | General | Actividad principal | 10–30 min | Descanso | Salir a caminar a ritmo cómodo. | 10 → 15 → 20 → 30 min | No |
| Mini rutina de movilidad | General | Actividad principal | 5 min | Descanso | Combinación de cuello, hombros, espalda y marcha suave. | Más variedad, no necesariamente más intensidad | No |

---

## 11.2. Barra de dominadas

| Ejercicio | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Colgado pasivo suave | Hombros / espalda | Actividad corta | 10–30 s | Pausa real | Colgarse con control y sin forzar. | 10 → 20 → 30 s; hasta 60 s acumulados | No |
| Colgado acumulado | Hombros / espalda | Actividad principal corta | 1–3 min total | Descanso | Varias tandas cortas de colgado. | Aumentar tiempo total acumulado | No |
| Retracción escapular en barra | Escápulas | Actividad corta | 20–40 s | Pausa real | Activar escápulas sin hacer una dominada completa. | 5 → 8 → 10 reps | No |
| Dominada asistida / negativa | Espalda | Actividad principal | 1–3 min | Descanso | Variante fácil de dominada con asistencia o bajada controlada. | Asistencia alta → baja → completa | No |
| Dominadas completas | Espalda | Actividad principal | 1–3 min | Descanso | Pocas repeticiones cómodas, sin buscar fatiga. | 1 → 3 → 5 reps o varias series cortas | No |

---

## 11.3. Mancuernas

| Ejercicio | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Farmer hold | Core / postura | Actividad corta | 30–60 s | Pausa real | Sostener mancuernas de pie con postura cómoda. | Más tiempo antes que más peso | No |
| Paseo del granjero corto | General / postura | Actividad principal corta | 1–3 min | Descanso | Caminar suavemente con mancuernas. | Aumentar tiempo o distancia | No |
| Remo con mancuerna ligero | Espalda alta | Actividad corta | 1–2 min | Descanso | Remo controlado, pocas repeticiones. | 8 → 10 → 12 reps | No |
| Elevación lateral muy ligera | Hombros | Actividad corta | 45–60 s | Pausa real | Elevación lateral con carga muy ligera. | Repeticiones antes que peso | No |
| Bisagra con mancuernas | Cadera / espalda | Actividad principal corta | 1–3 min | Descanso | Bisagra de cadera ligera y controlada. | Técnica → repeticiones → carga | No |

---

## 11.4. Kettlebell

| Ejercicio | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Kettlebell deadlift | Cadera / espalda | Actividad principal | 1–3 min | Descanso | Levantar desde el suelo con bisagra de cadera controlada. | Técnica → 8 → 10 → 12 reps | No |
| Goblet squat | Piernas / general | Actividad principal | 1–3 min | Descanso | Sentadilla cómoda sujetando la kettlebell al pecho. | 6 → 8 → 10 reps | No |
| Suitcase hold | Core / postura | Actividad corta | 30–60 s/lado | Pausa real | Sujetar la kettlebell a un lado manteniendo postura neutra. | 20 → 30 → 45 s por lado | No |
| Suitcase carry corto | Core / postura | Actividad principal corta | 1–3 min | Descanso | Caminar lentamente con la kettlebell en un lado. | Más tiempo/distancia antes que peso | No |
| Halo ligero | Hombros / movilidad | Actividad corta | 30–60 s | Pausa real | Mover la kettlebell alrededor de la cabeza de forma controlada y ligera. | 4 → 6 → 8 vueltas por sentido | No |

---

## 11.5. Esterilla

| Ejercicio | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Gato-vaca en cuadrupedia | Espalda | Actividad corta | 45–60 s | Descanso | Flexión y extensión suave de columna a cuatro apoyos. | 6 → 8 → 10 ciclos | No |
| Postura del niño suave | Espalda / hombros | Actividad corta | 30–60 s | Descanso | Sentarse hacia talones y alargar brazos sin forzar. | 30 → 45 → 60 s | No |
| Rotación torácica en cuadrupedia | Espalda alta | Actividad corta | 1–2 min | Descanso | Girar el tronco suavemente desde cuatro apoyos. | 5 → 8 reps/lado | No |
| Estiramiento de flexores de cadera | Cadera | Actividad corta | 30–45 s/lado | Descanso | Posición de zancada apoyada y suave. | 20 → 30 → 45 s/lado | No |
| Puente de glúteos | Cadera / lumbar | Actividad corta | 45–90 s | Descanso | Elevar cadera de forma controlada desde el suelo. | 8 → 10 → 12 reps | No |
| Movilidad general en suelo | General | Actividad principal | 5 min | Descanso | Secuencia suave de espalda, cadera y hombros. | Añadir variedad, no intensidad | No |

---

## 11.6. Escritorio elevable

| Ejercicio / hábito | Zona | Tipo | Duración | Contexto ideal | Descripción | Progresión | Reunión sin cámara |
|---|---|---|---:|---|---|---|---:|
| Bloque de trabajo de pie | General | Actividad principal | 10–30 min | Trabajo normal | Trabajar de pie durante un bloque planificado. | 10 → 15 → 20 → 30 min | Sí |
| Reunión de pie | General | Actividad principal | 10–30 min | Reunión | Hacer una reunión sin cámara de pie. | Aumentar duración progresivamente | Sí |
| Alternancia sentado/de pie | General | Hábito | Variable | Jornada | Cambiar postura varias veces durante el día. | Más constancia, no más tiempo continuo | Sí |
| Elevación de talones de pie | Piernas | Micropausa | 30–45 s | Trabajo de pie | Elevar talones aprovechando el escritorio elevado. | 15 → 20 → 25 reps | Sí |

---

## 11.7. Actividades principales sin material

| Actividad | Duración | Ideal para | ¿Cuenta para racha? | Notas |
|---|---:|---|---:|---|
| Paseo por la calle | 10–30 min | Descanso | Sí | Una de las actividades principales recomendadas |
| Paseo corto por oficina/casa | 5–10 min | Descanso | Sí | Alternativa si no se puede salir |
| Mini rutina de movilidad | 5 min | Descanso | Sí | Cuello + hombros + espalda + marcha |
| Trabajo de pie improvisado | 10–20 min | Si se puede elevar el portátil | Sí | Solo si la postura de trabajo es cómoda |
| Reunión caminando | 10–30 min | Reunión sin cámara | Sí | Muy alineado con la propuesta de valor |

---

## 12. Priorización de ejercicios para el MVP

### Micropausas prioritarias

1. Retracción cervical suave
2. Rotación cervical suave
3. Círculos de hombros
4. Retracción escapular
5. Apertura de pecho
6. Extensión torácica sentado
7. Rotación torácica sentado
8. Mirada lejana
9. Parpadeo + mirada lejana
10. Movilidad de muñeca
11. Marcha en el sitio
12. Elevación de talones
13. Sentadillas al aire
14. Caminar 1–2 min

### Actividades principales prioritarias

1. Paseo por la calle
2. Mini rutina de movilidad de 5 min
3. Trabajo de pie con escritorio elevable
4. Colgado acumulado en barra
5. Dominada asistida / completa según nivel
6. Farmer hold o paseo con mancuernas
7. Kettlebell deadlift / goblet squat ligero
8. Movilidad en esterilla

---

## 13. Lógica de selección de ejercicios

El generador diario debe considerar:

- Sliders de molestias.
- Equipamiento disponible.
- Intensidad elegida.
- Historial reciente.
- Última zona trabajada.
- Duración disponible.
- Si el usuario está en reunión o descanso.

Reglas:

- No repetir exactamente el mismo ejercicio dos veces seguidas.
- Evitar dos pausas consecutivas centradas en la misma zona salvo alta prioridad.
- Favorecer las zonas con slider más alto.
- Mantener una parte de variedad general.
- Repartir ejercicios visuales, cuello, espalda, manos y movimiento general.
- La actividad principal puede elegirse con mayor libertad según disponibilidad.

---

## 14. Fuera de alcance del MVP

- Diagnóstico médico.
- Rehabilitación personalizada.
- Rutinas de entrenamiento completas.
- Integración con wearables.
- Integración con calendario.
- Integración con Slack/Teams.
- Extensión de VS Code.
- Detección automática de builds.
- Cámara y análisis postural.
- IA generativa para personalizar ejercicios.
- Social, amigos y ligas.
- Marketplace o cosméticos complejos.

---

## 15. Métricas para validar el MVP

Métricas principales:

- % de micropausas completadas.
- % de micropausas completadas sin posponer.
- Número medio de pausas saltadas.
- Días consecutivos con actividad principal.
- Racha media.
- Retención a 7 días.
- Retención a 14 días.
- Uso de “Tengo un hueco”.
- Motivos de salto más frecuentes.
- Cambio de valoración de fin de jornada a lo largo del tiempo.

La métrica más importante al principio:

> ¿El usuario realiza más pausas y las ignora menos después de varios días de uso?
