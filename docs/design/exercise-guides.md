# Breakbit · Plan de guías visuales de ejercicios

Fecha: 17 de octubre de 2026. 16 tandas integradas en `codex/exercise-guides-pilot`: **82/82 ejercicios y 196 imágenes**. Faltan 0 ejercicios. Enhebrar la aguja utiliza las dos posturas aprobadas. El usuario autoriza integrar el catálogo completo en la app y publicarlo en `main` y GitHub Pages. Los estados de revisión de cada tanda que figuran más abajo son el registro histórico de su preparación.

## Alcance confirmado

- Avatar optimizado de fase 5 para todos los ejercicios, con su identidad y vestuario actuales, **sin auriculares en el cuello**. Se mantienen pelo, rostro, cinta blanca con franja verde, sudadera verde, pantalón oscuro y zapatillas.
- Primera colección: los 42 ejercicios cuyo campo `equipment` está vacío en `src/content/catalogo-breakbit.json`. Incluye silla, escritorio, pared y marco de puerta. Incluye el ejercicio de suelo sin material que ya figura en este grupo.
- Dos imágenes por ejercicio sencillo; tres cuando hacen falta posiciones intermedias, ambos lados o varios gestos. Máximo de tres archivos finales por ejercicio.
- Imágenes alternándose automáticamente, con control para pausar la guía.
- Tras completar la primera colección, el usuario solicita continuar. Se inicia la colección con equipamiento: los 40 ejercicios integrados en las tandas 9–16; no queda ninguno. Las rutinas reutilizan las guías de sus ejercicios.

## Volumen de la primera colección (sin material)

| Grupo | Ejercicios | Imágenes |
| --- | ---: | ---: |
| Cuello | 6 | 17 |
| Hombros, pecho y tronco | 14 | 35 |
| Cadera, piernas, equilibrio y paseo | 13 | 33 |
| Manos y antebrazos | 5 | 11 |
| Vista | 4 | 9 |
| **Total** | **42** | **105** |

Son 21 ejercicios con dos imágenes y 21 con tres. El paseo utiliza tres posturas para distinguir el paso intermedio; el plan inicial de 104 imágenes pasa a 105. A esto se añade una referencia maestra de identidad; las iteraciones descartadas se conservan aparte y no cuentan como recursos finales.

## 1. Fijar el personaje maestro

Crear primero una referencia limpia a partir de `public/avatar/5-demo.png`, eliminando exclusivamente los auriculares. Conservar cara, pelo, cinta, ropa, colores, proporciones y estilo pixel art. Validar esa identidad antes de crear ejercicios.

La referencia maestra aprobada acompañará todas las solicitudes. Para las imágenes siguientes de un ejercicio se añadirá su primera postura aprobada como referencia de encuadre, cámara, escala y apoyos. No utilizar personajes de otras fases como referencia de estilo.

## 2. Validar una tanda piloto

| Ejercicio | Imágenes | Qué valida |
| --- | ---: | --- |
| Retracción cervical suave | 2 | Desplazamiento pequeño visto de perfil y estabilidad del rostro. |
| Sentadilla normal | 2 | Cuerpo entero, manos, pies y lectura de la postura. |
| Deslizamientos en pared | 2 | Apoyo cotidiano, brazos en W y elevación sin cambiar la cámara. |
| Abrir y cerrar manos | 2 | Primer plano y legibilidad de los dedos. |
| Descanso con ojos cerrados | 2 | Primer plano de la cara y diferencia entre ojos abiertos/cerrados. |
| **Total piloto** | **10** | Más la referencia maestra. |

Mostrar las cinco secuencias en el marco real de la app, aproximadamente 210 px de alto, en claro y oscuro. Revisar identidad, posturas, detalle y alternancia. La aprobación del piloto fija la receta para producir las 94 imágenes restantes de los otros 37 ejercicios.

## 3. Reglas visuales y técnicas

- Una postura por archivo, salvo un pequeño detalle explicativo cuando sea necesario para entender el gesto. Fondo transparente real; sin habitación, paisaje o decoración.
- Pixel art coherente con los avatares existentes. Conservar originales del generador y preparar una versión final de 256 × 256 px por imagen; validar esta resolución en el piloto, especialmente para dedos y ojos.
- Mantener cámara, escala, iluminación, ubicación del avatar y de los apoyos en toda la secuencia de un ejercicio. Reservar espacio desde el principio para su postura más amplia.
- Elegir la cámara por legibilidad: perfil para retracción cervical y bisagra; frontal para movimientos laterales; tres cuartos para movimientos de cuerpo entero; encuadre cercano para manos y ojos.
- Los planos cercanos pertenecen al mismo avatar. No empequeñecer todo el cuerpo para mostrar un movimiento de dedos. Evitar cambios de plano durante una secuencia.
- Muebles y apoyos mínimos y estables. Pared o puerta representadas solo por el fragmento necesario para entender el contacto.
- Textos, numeración, flechas y puntos de enfoque se añaden en la interfaz, separados de la imagen, para mantener legibilidad, traducción y consistencia. Las flechas indican recorrido, giro o presión según el caso.
- Los pasos del catálogo son la fuente del movimiento. No añadir variantes, amplitudes o gestos ajenos a ellos. En isométricos, mostrar la presión sin inventar desplazamiento de cabeza o articulaciones.
- Una solicitud de generación por imagen. Revisar la primera postura antes de pedir las siguientes. Corregir solo el recurso que falle.

## 4. Inventario y storyboard de las 105 imágenes

Las descripciones son decisiones de representación de los pasos existentes. El número de imágenes no obliga a mostrar todas las posturas consecutivamente sin volver a la inicial.

### Cuello · 6 ejercicios, 17 imágenes

| ID | Ejercicio | Nº | Posturas y encuadre |
| --- | --- | ---: | --- |
| `chin_tuck` | Retracción cervical suave | 2 | Perfil cercano: posición inicial y cabeza desplazada hacia atrás, mirada al frente. |
| `neck_rotation` | Rotación cervical suave | 3 | Centro, giro a un lado y giro al otro; cámara frontal fija. |
| `neck_side_tilt` | Inclinación lateral de cuello | 3 | Centro e inclinación a cada lado, manteniendo visibles los hombros. |
| `neck_isometrics` | Isométricos suaves con mano | 3 | Mano en frente, lateral y parte posterior. La indicación de cambiar de lateral queda en los pasos; flechas de presión, cabeza estable. |
| `neck_flex_extension` | Mirar abajo y arriba | 3 | Perfil: centro, mirada abajo y ligera mirada arriba. |
| `neck_shoulder_stretch` | Estiramiento cuello-hombro | 3 | Centro, giro de unos 45° y mirada hacia la axila con apoyo suave de la mano. Indicar cambio de lado en los pasos. |

### Hombros, pecho y tronco · 14 ejercicios, 35 imágenes

| ID | Ejercicio | Nº | Posturas y encuadre |
| --- | --- | ---: | --- |
| `shoulder_circles` | Círculos de hombros | 3 | Hombros relajados, elevados y atrás/abajo; flecha circular para completar el recorrido. |
| `scapular_retraction` | Juntar los omóplatos | 2 | Hombros relajados y retracción; tres cuartos posterior, conservando la lectura de cuello y hombros. |
| `chest_opener` | Apertura de pecho | 2 | Manos entrelazadas detrás y apertura de pecho con manos desplazadas hacia atrás. |
| `arm_swing` | Balanceo alterno de brazos | 3 | Balanceo con cada brazo adelantado y cruce frontal. Flechas e instrucciones explican el regreso a la apertura. |
| `thoracic_extension` | Extensión de espalda alta | 2 | Sentado al borde de la silla, manos tras la cabeza: inicio y apertura de codos/pecho. |
| `cat_cow_standing` | Gato-vaca de pie | 3 | Manos en muslos: posición inicial, espalda redondeada y pecho abierto. |
| `high_twist` | Giro de tronco relajado | 3 | Centro y giro a cada lado, mostrando los talones. |
| `wave` | Ola corporal | 3 | Rodillas flexionadas/manos bajas, ascenso intermedio y brazos arriba. |
| `wall_slides` | Deslizamientos en pared | 2 | Frontal: espalda apoyada, brazos en W y brazos elevados. |
| `doorway_chest_stretch` | Apertura de pecho en puerta | 2 | Antebrazos en el marco y pequeño paso hacia delante; mantener el marco fijo. |
| `desk_thoracic_extension` | Extensión sobre escritorio | 2 | Manos apoyadas y cuerpo formando una L con cadera atrás; perfil. |
| `desk_thread_needle` | Rotación apoyada en escritorio | 3 | Apoyo inicial, brazo pasando por debajo y apertura hacia el techo. |
| `side_reach` | Alcance lateral | 3 | Posición centrada con brazo arriba y alcance a cada lado con el brazo correspondiente. |
| `shoulder_back_reach` | Movilidad de hombros tras la espalda | 2 | Dos posiciones alternando qué brazo llega por arriba; tres cuartos posterior. |

### Cadera, piernas, equilibrio y paseo · 13 ejercicios, 33 imágenes

| ID | Ejercicio | Nº | Posturas y encuadre |
| --- | --- | ---: | --- |
| `hip_hinge` | Bisagra de cadera | 2 | Perfil: erguido y cadera atrás con tronco inclinado. |
| `air_squats` | Sentadilla normal | 2 | De pie y sentadilla, con brazos al frente y pies completos. |
| `walk_around` | Paseo corto | 3 | Contacto de un pie → paso intermedio → contacto del otro pie; misma cámara y lugar en el lienzo. |
| `push_side` | Sentadilla lateral alterna | 3 | Centro y desplazamiento a cada lado. |
| `lunge` | Zancada | 3 | Posición inicial y zancada con cada pierna; cámara frontal fija para distinguir ambas piernas. |
| `march` | Marcha con palmada en rodilla | 3 | Brazos abiertos y palmada a ambos lados de cada rodilla elevada. |
| `standing_hip_abduction` | Apertura lateral de pierna | 2 | Apoyo ligero en escritorio: inicio y pierna elevada lateralmente; indicar cambio de lado. |
| `chair_hamstring_stretch` | Estiramiento de isquios en silla | 2 | Talón en silla, tronco erguido e inclinación hacia la pierna. |
| `kneeling_hip_rotation_stretch` | Estiramiento de cadera con rotación | 3 | Rodilla apoyada y pierna adelantada, pelvis hacia delante y rotación del tronco con manos tras la cabeza. |
| `cross_knee_press` | Presión cruzada mano-rodilla | 2 | Dos posturas de presión cruzada, una por lado; rótulo indica 5 segundos sin movimiento. |
| `t_balance` | Equilibrio en T | 2 | Equilibrio sobre una pierna y posición de T con brazo contrario extendido. |
| `standing_knee_hug` | Rodilla al pecho de pie | 3 | De pie y abrazo de cada rodilla al pecho. |
| `squat_knee_raise` | Sentadilla con rodilla arriba | 3 | Sentadilla y elevación de cada rodilla. Reproducir sentadilla → rodilla derecha → sentadilla → rodilla izquierda. |

### Manos y antebrazos · 5 ejercicios, 11 imágenes

| ID | Ejercicio | Nº | Posturas y encuadre |
| --- | --- | ---: | --- |
| `finger_flex` | Abrir y cerrar manos | 2 | Encuadre cercano estable: dedos abiertos y puño suave. |
| `wrist_mobility` | Movilidad de muñeca | 3 | Neutro, flexión y extensión. Flechas circulares y pasos explican también los círculos en ambos sentidos. |
| `wrist_flexor_stretch` | Estiramiento interno de antebrazo | 2 | Brazo extendido con palma arriba y apoyo de la otra mano para el estiramiento. |
| `wrist_extensor_stretch` | Estiramiento exterior de antebrazo | 2 | Brazo extendido con palma abajo y flexión acompañada con la otra mano. |
| `finger_by_finger_stretch` | Movilidad dedo a dedo | 2 | Primer plano solo de manos: contacto de apoyo y movilización suave de un dedo representativo. Los pasos indican continuar con los demás y cambiar de mano. |

### Vista · 4 ejercicios, 9 imágenes

| ID | Ejercicio | Nº | Posturas y encuadre |
| --- | --- | ---: | --- |
| `far_gaze` | Mirada lejana | 2 | Mirada próxima y orientación hacia un objetivo lejano. Encuadre fijo y punto de enfoque exterior añadido en la interfaz. |
| `eyes_closed_break` | Descanso con ojos cerrados | 2 | Primer plano: ojos abiertos y ojos suavemente cerrados. |
| `eye_mobility` | Movilidad ocular | 3 | Cabeza fija: mirada al frente, ejemplo del recorrido horizontal y ejemplo del vertical. Flechas bidireccionales y texto cubren ambos extremos de cada eje. |
| `near_far_focus` | Enfoque cerca-lejos | 2 | Mismo encuadre con dedo levantado: atención al dedo y atención a un objetivo lejano. Etiquetas y puntos de enfoque añadidos fuera de la ilustración. |

## 5. Orden de producción tras el piloto

1. Completar cuello y hombros; después tronco y ejercicios con apoyos. Reutilizar las referencias aprobadas de perfil, silla, escritorio, pared y puerta.
2. Completar piernas y equilibrio; terminar con las secuencias de tres posiciones como ola, zancada y sentadilla con rodilla.
3. Completar manos y vista con la receta de primer plano aprobada. Mantener estos encuadres separados del cuerpo entero.
4. Revisar cada tanda pequeña antes de continuar, con comparativas de todas sus posturas y una reproducción al tamaño real.

En los ejercicios con muchos gestos, las tres imágenes muestran etapas o acciones representativas; el texto existente y las flechas completan las instrucciones. No dibujar posiciones adicionales dentro del mismo archivo para eludir el límite. Revisar especialmente isométricos, muñecas y movilidad ocular antes de aprobar sus storyboards finales.

## 6. Integración posterior

- Ampliar el registro de `exerciseVisual` para guardar 2–3 frames y un orden de reproducción por ejercicio. El registro actual devuelve una sola imagen: no basta con añadir archivos.
- Mantener los PNG separados. Así se puede detener la guía en una postura, avanzar manualmente y corregir un solo recurso.
- Crear un visor compartido para `ActivityGuide`, utilizado por ejercicios, rutinas, «Tengo un hueco» y Exercise Lab.
- Control explícito «Pausar guía / Reanudar guía» y acceso manual a cada postura. Este control afecta solo a las imágenes; el temporizador del ejercicio conserva sus controles propios.
- Reproducción inicial suave y legible, con cadencias revisadas por tipo de gesto. La guía es una demostración: las duraciones y repeticiones siguen los pasos existentes. Un estiramiento mantenido no se presentará como un rebote rápido.
- Cada ejercicio define su secuencia. Dos imágenes pueden alternar 1 → 2 → 1; tres pueden necesitar 1 → 2 → 1 → 3 o 1 → 2 → 3 → 2, según el movimiento.
- Con movimiento reducido, ofrecer la primera postura y controles manuales. Detener la alternancia al salir de la pantalla; precargar sus frames para evitar flashes.
- Temporizador y controles debajo de la guía, como está aprobado. Texto alternativo por postura, rótulos traducibles y sin anuncios continuos al lector de pantalla.

## Entregables y aprobación

1. Referencia maestra sin auriculares.
2. Piloto de cinco ejercicios / diez imágenes, con comparativa y alternancia de prueba.
3. Catálogo de 42 storyboards, prompts y registro de revisión por imagen: pendiente, generada, corregir, aprobada, integrada.
4. Colección final de 105 imágenes, originales conservados y archivos de producción optimizados.
5. Integración en una rama `codex/…`, revisión del usuario antes de commit/merge/push y verificación completa de lint, tests, build y despliegue cuando se publique.

Rutas: `public/exercises/<exercise-id>/01.png`, `02.png` y, cuando proceda, `03.png`. El avatar compartido está en `public/exercises/avatar.png`. Los diez frames del piloto están preparados a 256 × 256 px, con alfa original y un escalado idéntico por secuencia; el importador no recorta ni recentra las posturas individualmente.

Los prompts exactos del piloto se conservan en [exercise-guide-pilot-prompts.md](../exercise-guide-pilot-prompts.md). La vista de revisión local está en `/work/exercise-guides-review.local/index.html`; muestra cada pareja y el visor real, y permite probar cada ejercicio con su temporizador. Los originales de alta resolución y el registro de procedencia se conservan en `work/exercise-guides-generation.local/`.

## Verificación del piloto

- 880 tests en 91 archivos, lint y comprobación de tipos correctos.
- Build de producción correcto con prefijo `/breakbit/` y PNG incluidos en la precarga sin conexión.
- Revisado en claro y oscuro; controles comprobados a 390 y 320 px sin desbordamiento horizontal.
- Verificado en navegador que pausar la guía mantiene el temporizador del ejercicio en marcha.
- Piloto aprobado por el usuario al solicitar continuar con otra tanda.

## Tanda 2 · cuello, hombros y cadera

| Ejercicio | Frames | Secuencia | Cadencia |
| --- | ---: | --- | --- |
| Rotación cervical suave | 3 | Centro → derecha → centro → izquierda | Centro 1,2 s; giro 3 s. |
| Inclinación lateral de cuello | 3 | Centro → derecha → centro → izquierda | Centro 2 s; estiramiento 25 s. |
| Juntar los omóplatos | 2 | Relajar → contraer | Relajación 2 s; contracción 5 s. |
| Apertura de pecho | 2 | Inicio → apertura | Inicio 3 s; apertura 25 s. |
| Bisagra de cadera | 2 | Erguido → cadera atrás | 2,2 s por postura. |

La cadencia visual sigue los pasos del catálogo; pausar las imágenes conserva el control independiente del tiempo de ejercicio. La postura neutral de cuello es el mismo archivo en ambas guías. Se corrigió una inclinación generada con un encuadre distinto y se verificaron ambos lados. No se han añadido flechas ni texto dentro de los PNG.

Prompts: [exercise-guide-batch-2-prompts.md](../exercise-guide-batch-2-prompts.md). Archivos de producción: `public/exercises/<id>/`. Originales y procedencia: `work/exercise-guides-generation.local/manifest-batch-2.json`. Generación con ImageGen integrado (`built-in`).

Revisión en claro, oscuro y móvil de 390 px; las imágenes se muestran a 210 px de alto en el visor. Diez pruebas de guía/precarga y build con `/breakbit/` correctos. Misma rama, sin commit ni publicación.

**Estado tras la tanda 2:** 10/42 ejercicios, 22/104 imágenes.

## Tanda 3 · cuello, hombros y apoyos cotidianos

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Mirar abajo y arriba | 3 | Centro → abajo → centro → arriba | Centro 2 s, cada inclinación 3 s. |
| Círculos de hombros | 3 | Relajados → elevados → atrás/abajo | 2 s por postura. |
| Extensión de espalda alta | 2 | Sentado con manos tras cabeza → apertura | Inicio 3 s; apertura 4 s. |
| Apertura de pecho en puerta | 2 | Antebrazos apoyados → paso corto | Inicio 3 s; estiramiento 25 s. |
| Extensión sobre escritorio | 2 | Apoyo inicial → cadera atrás y forma de L | Inicio 3 s; extensión 4 s. |

La postura neutra de cuello reutiliza el perfil de `chin_tuck/01.png`. Se corrigió la postura final de escritorio para bajar pecho y hombros y evitar una inclinación diagonal demasiado erguida. Las guías utilizan el mismo visor y mantienen controles separados del temporizador.

Prompts: [exercise-guide-batch-3-prompts.md](../exercise-guide-batch-3-prompts.md). Originales/procedencia: `work/exercise-guides-generation.local/manifest-batch-3.json`. PNG finales a 256 × 256 con alfa en `public/exercises/<id>/`. Generación con ImageGen integrado (`built-in`); una postura por archivo. Los 23 recursos anteriores se comprobaron por hash y permanecen sin cambios.

Verificado en claro, oscuro y móvil a 390 px sin desbordamiento; tercera postura de hombros accesible manualmente. Diez tests de guía/precarga, lint del registro y build con `/breakbit/` correctos. Sin commit ni publicación.

**Estado tras la tanda 3:** 15/42 ejercicios, 34/104 imágenes.

## Tanda 4 · completar cuello y movilidad de tronco

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Isométricos suaves con mano | 3 | Frente → lateral → detrás | 5 s frente; 10 s lateral, indicando 5 s por lado; 5 s detrás. |
| Estiramiento cuello-hombro | 3 | Centro → giro 45° → mirada hacia axila con apoyo suave | 2 s centro; 2 s giro; 25 s estiramiento. |
| Gato-vaca de pie | 3 | Inicio apoyado → redondear → abrir pecho | Inicio 1,5 s; 3 s por gesto. |
| Rotación apoyada en escritorio | 3 | Apoyo → brazo debajo → apoyo → abrir brazo | Apoyo 2 s; cada giro 3 s. |
| Alcance lateral | 3 | Centro → alcance a un lado → centro → alcance al otro | Centro 2 s; cada alcance 3 s. |

Los dos primeros frames del estiramiento cuello-hombro reutilizan las posturas aprobadas de `neck_rotation`. El lateral de los isométricos y el estiramiento cuello-hombro representan un lado: rótulos y pasos indican repetir al contrario, manteniendo el máximo de tres imágenes. En isométricos se mantiene la cabeza erguida; el texto describe la presión suave sin representar un desplazamiento. La pose contraria de alcance lateral recibió una corrección del peinado.

### Puerta · corrección solicitada por el usuario

Se sustituye `doorway_chest_stretch/02.png` por una postura con **ambos pies adelantados y paralelos**, conservando el apoyo de los dos antebrazos. El pie adelantado único de la versión anterior queda descartado. Se actualiza el rótulo español/inglés para que coincida con la imagen; no se hacen afirmaciones comparativas sobre efectos clínicos de las variantes. El original anterior queda en `work/exercise-guides-generation.local/variants/`.

Prompts y corrección: [exercise-guide-batch-4-prompts.md](../exercise-guide-batch-4-prompts.md). Procedencia: `work/exercise-guides-generation.local/manifest-batch-4.json`. ImageGen integrado (`built-in`). PNG finales en `public/exercises/<id>/`, 256 × 256 RGBA con alfa original.

Verificación: quince PNG nuevos importados; los 34 recursos anteriores ajenos a la corrección conservan su hash. Diez tests de guía/precarga, lint del registro y build con `/breakbit/` correctos. Comparativa en claro/oscuro y puerta comprobada a 390 px sin desbordamiento. Sin commit, merge ni publicación.

**Estado tras la tanda 4:** 20/42 ejercicios, 49/104 imágenes según el plan inicial.


## Tanda 5 · completar hombros y tronco, e iniciar paseo

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Balanceo alterno de brazos | 3 | Un brazo delante → contrario → repetir → cruzar delante del pecho | 2 s por balanceo; 2,5 s al cruzar. |
| Giro de tronco relajado | 3 | Centro → giro a un lado → centro → giro al otro | Centro 1,5 s; cada giro 2,2 s. |
| Ola corporal | 3 | Flexión suave → subir → estirarse → volver por la postura intermedia | 1,8 s por postura. |
| Movilidad de hombros tras la espalda | 2 | Un brazo arriba y otro abajo → intercambiar | 3,5 s por postura. |
| Paseo corto | 3 | Contacto de un pie → paso intermedio → contacto del otro → paso intermedio | 0,9 s por postura. |

El balanceo usa una cámara de tres cuartos que distingue los brazos hacia delante y atrás; la tercera postura muestra las manos abiertas cruzando por delante, sin abrazarse. Se corrigió un halo de color en su transparencia. El giro de tronco conserva el pequeño levantamiento de talón descrito en el catálogo. La ola mantiene el mismo encuadre en todo el recorrido, reservando altura para los brazos elevados. La movilidad tras la espalda usa un plano posterior cercano con separación visible entre las manos.

El paseo añade una postura de paso intermedio: las dos posturas de contacto solas resultaban demasiado parecidas en silueta. Respeta el máximo de tres imágenes por ejercicio y aumenta el plan total de 104 a 105 imágenes. Las posturas ya aprobadas de cuello y puerta se conservan.

Prompts: [exercise-guide-batch-5-prompts.md](../exercise-guide-batch-5-prompts.md). Procedencia: `work/exercise-guides-generation.local/manifest-batch-5.json`. ImageGen integrado (`built-in`). Originales conservados y PNG finales en `public/exercises/<id>/`, 256 × 256 RGBA, sin recortar cada postura por separado.

Verificación: catorce PNG nuevos importados con transparencia válida y lienzos uniformes; los 50 recursos anteriores conservan su hash. Diez tests de guía/precarga, lint del registro y build con `/breakbit/` correctos. Comparativa en claro/oscuro y visor con temporizador comprobado a 390 px sin desbordamiento; imagen de 210 px de alto y pausa independiente del temporizador. Vista de revisión con las cinco tandas; tamaño de ventana restablecido. Sin commit, merge ni publicación.

**Estado tras la tanda 5:** 25/42 ejercicios, 63/105 imágenes. Cuello y hombros/pecho/tronco completos. Quedan 17 ejercicios / 42 imágenes: diez de piernas, cuatro de manos y tres de vista.


### Balanceo de brazos · corrección del recorrido solicitada

Las dos primeras posturas de `arm_swing` ahora elevan el brazo delantero por encima de la cabeza y ligeramente hacia atrás, alternando ambos brazos. Se reserva espacio superior en toda la secuencia; el cruce del catálogo continúa como tercera postura. Los rótulos español/inglés coinciden con el nuevo recorrido. Prompts y procedencia: [corrección del balanceo](../exercise-guide-arm-swing-correction.md) y `work/exercise-guides-generation.local/arm-swing-overhead-correction.json`. Se conservan las tres imágenes y los totales de producción. Sin commit ni publicación.


## Tanda 6 · piernas y equilibrio

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Sentadilla lateral alterna | 3 | Centro amplio → peso a un lado → centro → peso al otro | Centro 1,5 s; cada lado 2,5 s. |
| Zancada | 3 | De pie → zancada → de pie → otra pierna | De pie 1,5 s; cada zancada 2,5 s. |
| Marcha con palmada en rodilla | 3 | Brazos abiertos → palmada sobre rodilla → abrir → otra rodilla | Abiertos 1,2 s; cada palmada 1,5 s. |
| Apertura lateral de pierna | 2 | Apoyo ligero en escritorio → elevar pierna lateralmente | Inicio 1,8 s; elevación 2,2 s. |
| Rodilla al pecho de pie | 3 | De pie → abrazo de rodilla → de pie → otra rodilla | De pie 1,5 s; cada abrazo 2,5 s. |

La zancada usa una cámara frontal en toda la secuencia: las variantes iniciales de perfil no distinguían bien la pierna adelantada a 210 px. Se conservan esas variantes fuera de producción. Los neutros de zancada y rodilla al pecho reutilizan el maestro aprobado. La sentadilla lateral recibió un ajuste de la postura neutra para mantener mejor la separación de pies y una corrección del peinado de la postura contraria. En la apertura lateral de pierna, el escritorio mantiene su posición y la guía representa un lado; los pasos y el rótulo indican 8–10 repeticiones y cambiar de lado. La marcha representa una palmada en los laterales de la rodilla, corregida a petición del usuario; el abrazo sujeta suavemente la espinilla.

Prompts: [exercise-guide-batch-6-prompts.md](../exercise-guide-batch-6-prompts.md). Procedencia: `work/exercise-guides-generation.local/manifest-batch-6.json`. Modo ImageGen integrado (`built-in`), originales conservados y PNG RGBA finales en `public/exercises/<id>/`, 256 × 256 con lienzo compartido sin recorte individual.

Verificación: catorce PNG importados con alfa válido; los 64 recursos anteriores conservan su hash. Diez tests de guía/precarga, lint del registro y build con `/breakbit/` correctos. Carga completa de imágenes y revisión en claro y oscuro; apertura lateral comprobada en el visor con temporizador a 390 px, sin desbordamiento y con imagen de 210 px de alto. Navegación manual pausa la guía. Ventana restablecida. Sin commit, merge ni publicación.

**Estado tras la tanda 6:** 30/42 ejercicios, 77/105 imágenes. Quedan 12 ejercicios / 28 imágenes: cinco de piernas, cuatro de manos y tres de vista.


### Marcha · palmada lateral solicitada por el usuario

Se sustituyen únicamente `march/02.png` y `03.png`: una mano toca cada lateral de la rodilla elevada, con la parte superior despejada. La postura de brazos abiertos se conserva. Se actualizan los rótulos y el paso del catálogo en español e inglés. Prompts: [corrección de la marcha](../exercise-guide-march-correction.md). Originales anteriores conservados y procedencia en `work/exercise-guides-generation.local/march-side-tap-correction.json`.

## Tanda 7 · completar piernas

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Estiramiento de isquios en silla | 2 | Talón apoyado → inclinación suave del pecho | Inicio 2,5 s; estiramiento 25 s. |
| Estiramiento de cadera con rotación | 3 | Rodilla al suelo → pelvis delante/manos detrás de cabeza → giro | Inicio 2 s; preparación 3 s; giro 30 s. |
| Presión cruzada mano-rodilla | 2 | Mano izquierda/rodilla derecha → mano derecha/rodilla izquierda | 5 s por lado, sin movimiento durante la presión. |
| Equilibrio en T | 2 | Apoyo sobre una pierna → tronco delante, pierna atrás y brazo contrario delante | Inicio 1,5 s; postura T 3,5 s. |
| Sentadilla con rodilla arriba | 3 | Sentadilla → rodilla derecha → sentadilla → rodilla izquierda | 2 s por postura. |

El apoyo en silla conserva el talón, los pies y el mueble durante la inclinación. La cadera con rotación separa la preparación y el giro, manteniendo la rodilla trasera apoyada; sus pasos/rótulos indican volver y cambiar de lado. La presión cruzada muestra ambos lados, con una sola mano contraria presionando cada rodilla; se corrigió una primera versión que usaba la mano del mismo lado. El equilibrio en T mantiene una cámara de perfil y reserva anchura para el brazo contrario y la pierna atrás; los pasos indican alternar de lado. La sentadilla vuelve a aparecer entre ambas elevaciones de rodilla.

Prompts: [exercise-guide-batch-7-prompts.md](../exercise-guide-batch-7-prompts.md). Procedencia: `work/exercise-guides-generation.local/manifest-batch-7.json`. Generación con ImageGen integrado (`built-in`), originales conservados y doce PNG finales RGBA en `public/exercises/<id>/`, 256 × 256 sobre lienzo compartido sin recortar cada postura por separado.

Verificación: doce PNG nuevos y dos sustituciones de marcha, alfa y lienzos validados. Los otros 76 recursos anteriores mantienen su hash. 27 tests de guía/precarga/catálogo, lint del registro y build con `/breakbit/` correctos. Revisión en claro/oscuro con todas las imágenes cargadas; equilibrio en T y marcha comprobados en el visor real a 390 px. Visor de 210 px sin desbordamiento horizontal; navegación manual pausa la guía. Ventana restablecida. Sin commit, merge ni publicación.

**Estado tras la tanda 7:** 35/42 ejercicios, 89/105 imágenes. Piernas completas. Quedan 7 ejercicios / 16 imágenes: cuatro de manos y tres de vista.


### Silla · mayor inclinación solicitada por el usuario

Se sustituye únicamente `chair_hamstring_stretch/02.png`: el pecho se acerca más a la pierna/silla mediante una inclinación mayor desde la cadera, conservando la espalda recta y la posición de talón, pies y silla. Postura inicial y cadencia intactas. [Prompt y procedencia de la corrección](../exercise-guide-chair-correction.md). Original anterior conservado en `work/exercise-guides-generation.local/variants/chair-before-deeper-hinge/`.

## Tanda 8 · completar manos y vista

| Ejercicio | Frames | Secuencia | Cadencia visual |
| --- | ---: | --- | --- |
| Movilidad de muñeca | 3 | Neutro → arriba → neutro → abajo | Neutro 3 s; arriba/abajo 2 s. Texto e indicador completan los círculos en ambos sentidos. |
| Estiramiento interno de antebrazo | 2 | Palma arriba → acompañar dedos hacia abajo | Inicio 2,5 s; estiramiento 25 s. |
| Estiramiento exterior de antebrazo | 2 | Palma abajo → flexionar muñeca con apoyo | Inicio 2,5 s; estiramiento 25 s. |
| Movilidad dedo a dedo | 2 | Contacto de apoyo → movilizar un dedo | Inicio 2 s; gesto 5 s. Pasos indican pasar al siguiente y cambiar de mano. |
| Mirada lejana | 2 | Pantalla → apartar la mirada | Inicio 1,8 s; mirada apartada 60 s, para no sugerir volver a la pantalla durante la pausa. |
| Movilidad ocular | 3 | Centro → ejemplo horizontal → centro → ejemplo vertical | Centro 1,5 s; cada eje 4 s. Texto y flechas cubren ambos sentidos. |
| Enfoque cerca-lejos | 2 | Atención al dedo → atención lejana | 2,5 s por foco. |

Se utiliza el avatar de fase 5 sin auriculares y la receta de primer plano aprobada. El neutro de movilidad ocular reutiliza el retrato aprobado de ojos abiertos; los otros dos frames mantienen la cabeza y cambian los ojos. El ejercicio dedo a dedo recibió una revisión de encuadre: solo manos y mangas verdes, para ver el contacto con un dedo y evitar que el gesto parezca señalarlo. Los estiramientos muestran el inicio de palma arriba/abajo y la postura acompañada; los pasos indican cambiar de brazo. El dedo del enfoque cerca-lejos permanece en su posición.

`ExerciseGuideFrame.cue` permite añadir dirección horizontal, vertical, círculos o foco cercano/lejano. Los indicadores son SVG decorativos fuera de la imagen, junto al rótulo traducido; no se anuncian al lector de pantalla ni se superponen al avatar o al temporizador. No sustituyen los pasos. Las ilustraciones de ejercicios con varios gestos representan acciones clave dentro del límite de tres imágenes.

Prompts: [exercise-guide-batch-8-prompts.md](../exercise-guide-batch-8-prompts.md). Procedencia: `work/exercise-guides-generation.local/manifest-batch-8.json`. ImageGen integrado (`built-in`), originales conservados y dieciséis PNG RGBA nuevos en `public/exercises/<id>/`, 256 × 256 sin recortar o recentrar cada postura por separado.

Verificación: dieciséis PNG nuevos y una sustitución de silla, alfa y lienzos validados por el importador. Los otros 89 recursos anteriores conservan su hash. Cobertura exacta de los 42 IDs del catálogo sin equipamiento, todos con dos o tres imágenes y registro de guía. 27 tests de guía/precarga/catálogo, lint del registro y visor, y build con `/breakbit/` correctos. Todas las imágenes cargadas; revisión en claro/oscuro y guía ocular con indicador a 390 px, sin desbordamiento horizontal, imagen de 210 px y pausa independiente. Silla corregida comprobada en la comparativa. Ventana restablecida. Sin commit, merge ni publicación.

**Estado de producción:** 42/42 ejercicios sin equipamiento, 105/105 imágenes, más referencia maestra. Primera colección integrada y pendiente de aprobación visual final. Los 40 ejercicios con equipamiento específico quedan fuera de esta colección.

## Correcciones de manos y vista · 16 de octubre de 2026

Se sustituyen siete posturas según la revisión del usuario: agarre de antebrazo por debajo de los dedos; mano de cinco dedos con palma arriba y extensión individual hacia abajo; mirada lejana de pie en ventana; cerca-lejos de pie con flechas desde el ojo. En esta última guía las flechas usan coordenadas sobre el mismo lienzo que las imágenes, cambian con la postura y desaparecen al activar la imagen de reserva. Se mantiene el temporizador independiente debajo.

[Prompts, recursos y validación](../exercise-guide-hands-eyes-corrections.md). La ventana es una excepción expresamente solicitada a la regla de no añadir paisaje: aparece únicamente en su hueco y todo el exterior sigue transparente.

### Antebrazo revisado con fotografías del usuario

La revisión posterior sustituye las dos posturas de estiramiento interno de antebrazo: mismo plano lateral con brazo extendido, preparación del agarre y mano de ayuda sujetando los dedos hacia abajo como en las fotos. Véase [prompts y recursos finales](../exercise-guide-forearm-photo-correction.md). Prevalece sobre el agarre anterior.

### Diferenciación final de ambos antebrazos

El interno vuelve a empezar con palma arriba; después muestra el dorso de la mano. El externo empieza con palma abajo y reutiliza el agarre de la revisión fotográfica anterior. Cuatro posturas sustituidas con margen suficiente para la mano extendida. [Prompts y selección final](../exercise-guide-forearm-pair-correction.md).

### Referencia final: dibujos de manos y antebrazos

La nueva referencia del usuario sustituye la vista del avatar: plano cercano que adapta el dibujo izquierdo al interno y el derecho al externo, con mangas verdes y estilo pixel. Se elimina el detalle circular. Se conservan dos posturas por ejercicio con preparación de palma arriba/abajo. [Recursos y prompts vigentes](../exercise-guide-forearm-diagram-correction.md). Esta revisión prevalece sobre las anteriores del antebrazo.

## Tanda 9 · comenzar ejercicios con esterilla

Cinco ejercicios: gato-vaca (3), postura del niño (2), puente de glúteos (2), bird dog (3) y cobra suave (2). Total de la tanda: 12 imágenes; acumulado: **47/82 ejercicios, 117 posturas**. Los 42 ejercicios sin equipamiento están completos; 5/40 con equipamiento integrados. La postura neutra a cuatro apoyos se reutiliza en tres guías. Bird dog vuelve al centro entre diagonales; postura del niño mantiene 40 s. El temporizador sigue debajo y es independiente.

[Storyboards, prompts y selección de recursos](../exercise-guide-batch-9-prompts.md). Pendiente de revisión; misma rama, sin commit ni publicación.

## Tanda 10 · completar esterilla y corregir bird dog

Enhebrar la aguja (3), dead bug (3), rotación lumbar tumbado (3), figura 4 (3) y superman (2): catorce posturas nuevas. Acumulado: **52 ejercicios y 131 posturas**; 42/42 sin material y 10/10 de esterilla. Quedan 30 con otro material. Se corrigen las dos piernas de bird dog para alternar también la rodilla/pie de apoyo y el muslo elevado, distinguiendo fondo y primer plano.

[Prompts de la tanda](../exercise-guide-batch-10-prompts.md) · [Corrección de bird dog](../exercise-guide-bird-dog-correction.md). Mismo visor y temporizador independiente. Sin commit ni publicación.

## Revisión de la tanda 10

Se rehace la postura de alcance de enhebrar la aguja siguiendo el ejemplo aportado y se regeneran los brazos de dead bug 03. Rotación lumbar conserva solo las imágenes 01 y 02, con indicación textual de repetir hacia el otro lado. Total vigente: **52 ejercicios y 130 posturas**. [Prompts y recursos vigentes](../exercise-guide-mat-review-corrections.md). Sin commit ni publicación.


## Corrección posterior · 17 de octubre

Las tres posturas de enhebrar la aguja se sustituyen por una secuencia orientada a la izquierda que copia sin espejo la referencia del usuario. Prompts y selección vigentes: [referencia literal](../exercise-guide-needle-literal-reference.md). Se mantienen 52 ejercicios y 130 posturas; dead bug y las dos imágenes de rotación lumbar no cambian.


Selección posterior: [segunda referencia del usuario](../exercise-guide-needle-second-reference.md). Sustituye la selección anterior de aguja; orientación derecha, cabeza sin apoyo sobre antebrazo.


## Selección vigente · 17 de octubre

Enhebrar la aguja: [dos posturas aprobadas](../exercise-guide-needle-approved.md). Tanda 11: [cinco ejercicios de banda](../exercise-guide-batch-11-prompts.md). Acumulado: 57 ejercicios y 139 imágenes. Los prompts anteriores se conservan como historial; estas selecciones los sustituyen.

## Tanda 12 · Banda elástica · piernas y press

[Prompts e inventario](../exercise-guide-batch-12-prompts.md). 62 ejercicios completos, 20 pendientes, 150 imágenes.

## Tanda 13 · Mancuernas · primer pack

[Prompts e inventario](../exercise-guide-batch-13-prompts.md). 67 ejercicios completos, 15 pendientes, 162 imágenes.

## Tanda 14 · Mancuernas · segundo pack

[Prompts e inventario](../exercise-guide-batch-14-prompts.md). 72 ejercicios completos, 10 pendientes, 172 imágenes.

## Tanda 15 · Kettlebell · primer pack

[Prompts e inventario](../exercise-guide-batch-15-prompts.md). 77 ejercicios completos, 5 pendientes, 183 imágenes.

## Tanda 16 · Kettlebell · segundo pack y cierre de catálogo

[Prompts e inventario](../exercise-guide-batch-16-prompts.md). 82 ejercicios completos, 0 pendientes, 196 imágenes.


## Catálogo completo

[Resumen final, packs, recuentos y verificaciones](../exercise-guide-catalog-complete.md). 82/82 ejercicios, 0 pendientes, 196 posturas.
