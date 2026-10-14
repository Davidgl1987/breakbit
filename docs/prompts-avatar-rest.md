# Breakbit · Prompts de dormir y descanso por fase

Propuesta para revisar antes de generar. Son diez imágenes: cinco `sleep` y cinco `rest`. Se conservan los avatares actuales; las ilustraciones nuevas representan otras poses y escenas de esos mismos personajes.

## Las diez escenas

| Fase | Dormir (`sleep`) | Tiempo libre (`rest`) |
| --- | --- | --- |
| 1 · Encorvado | Acurrucado en un nido de hojas, junto a una roca pequeña. | Recostado en una roca, disfrutando de una fruta. |
| 2 · Erguido | Camastro bajo de troncos con pieles y almohada de tela rústica. | Sentado en un tronco, contemplando una flor silvestre. |
| 3 · Sedentario | Cama individual sencilla, manta azul algo arrugada. | Hundido cómodamente en un sofá, jugando a la consola. |
| 4 · Activo | Cama de madera natural, ropa de cama clara y manta verde. | Leyendo un libro en un banco de parque. |
| 5 · Optimizado | Cama baja de madera clara, lino crema y manta verde petróleo. | Corriendo a un ritmo suave por un sendero. |

La diferencia entre fases se cuenta mediante el personaje, la postura y su forma de pasar el tiempo. Las camas no representan una escala de riqueza. Todas las escenas de dormir son cómodas y tranquilas; el descanso de la fase 5 es ocio activo, sin aspecto de competición.

## Cómo formar cada solicitud

Para cada imagen, usar **el bloque común completo + el prompt específico**. Adjuntar el archivo `public/avatar/<fase>-idle.png` como referencia de identidad y estilo. Las referencias son imágenes del personaje, no escenas que haya que conservar: sustituir el puesto de trabajo por el escenario solicitado.

Los nombres indican cómo guardaremos los recursos; no deben aparecer dibujados. Generar cada archivo en una solicitud independiente, con transparencia activada. Las descripciones antiguas no tienen prioridad sobre los sprites actuales.

## Bloque común · incluir en las diez solicitudes

```text
Uso: ilustración de personaje / sprite para la app Breakbit.
Solicitud: generar una única ilustración nueva del mismo avatar de la imagen de referencia, en la escena descrita a continuación.

REFERENCIA E IDENTIDAD
La imagen adjunta es la referencia principal de identidad, proporciones, técnica y paleta. Conserva su cara, hocico cuando corresponda, tono de piel o pelaje, forma y color exactos del pelo, tamaño de cabeza, proporciones chibi y diseño del personaje. No inventes un avatar alternativo ni lo hagas más adulto, delgado, musculoso o infantil. Las fases humanas 3, 4 y 5 representan al mismo chico. Conserva las diferencias de cada fase que estén visibles en su referencia; no añadas barba si no la tiene. Cambia únicamente la pose, los muebles y la ropa cuando el prompt específico lo indique. El ordenador y el puesto de trabajo de la referencia deben desaparecer.

TÉCNICA
Pixel art de videojuego, tan nítido y detallado como el sprite adjunto. Diseña pensando en una rejilla lógica de 128 × 128 píxeles, ampliada por bloques enteros para la salida. Píxeles cuadrados uniformes, contornos escalonados de tono marrón oscuro, grupos de color limpios y sombreado con pocos tonos por material. Sin bordes suavizados, desenfoque, degradados continuos, apariencia vectorial, pintura digital o volumen 3D. Mantén los tonos cálidos del personaje y la paleta de los recursos actuales; los objetos verdes, azules, crema y de madera acompañan al personaje sin dominarlo. Luz suave desde arriba a la izquierda.

COMPOSICIÓN Y LEGIBILIDAD
Una sola escena compacta: un personaje y los objetos mínimos necesarios para entender la acción. Vista lateral en tres cuartos, orientada hacia la derecha, coherente con los avatares trabajando. El rostro debe seguir siendo visible y reconocible. Personaje y mueble forman una única silueta centrada dentro de un lienzo cuadrado, con un margen transparente aproximado del 6–8 % alrededor. Mantén todo dentro del encuadre: cabeza, manos visibles, patas de muebles y pies cuando no estén cubiertos por la ropa de cama. La base más baja del conjunto queda aproximadamente al 92 % de la altura. La cabeza conserva un tamaño comparable entre estas diez imágenes y los avatares de referencia; no la reduzcas para meter más decorado. Los muebles horizontales pueden ser más anchos, pero no deben empequeñecer al avatar.

AMBIENTACIÓN
Cuenta el entorno mediante materiales y pocos objetos aislados que pertenezcan a la escena. No dibujes una habitación completa ni un paisaje. Sin cielo, paredes, horizonte, ventana, suelo continuo o fondo rectangular. Se permiten hojas del nido, una roca, una pequeña planta o una mata de hierba si forman parte del conjunto descrito. Las sombras se limitan a los propios objetos; no añadir sombra proyectada ni halo alrededor del sprite.

SALIDA
Una sola imagen cuadrada, preferiblemente PNG de 1024 × 1024, con fondo realmente transparente y canal alfa. Todo lo que no sea el personaje o los objetos descritos debe ser transparente. No representar la transparencia mediante un tablero de ajedrez. Sin texto, letras, cifras, Z de sueño, bocadillos, logotipos, marcas de agua, interfaz, marcos, confeti ni otros personajes. No generar una cuadrícula de variantes ni varias poses en el mismo archivo.
```

## Fase 1 · Encorvado

### `1-sleep.png`

Referencia: `public/avatar/1-idle.png`.

```text
ESCENA: el mismo simio de pelaje marrón rojizo/anaranjado y cara beige de la referencia está profundamente dormido, acurrucado de lado en un nido bajo de hojas anchas y fibras vegetales. El nido hace de cama y forma un cuenco poco profundo; no es un árbol ni un paisaje. Una roca pequeña junto a la cabecera sitúa la escena en su entorno ancestral.

POSE: cuerpo recogido, una mano cerca de la mejilla, ojos cerrados con expresión serena y boca relajada. La cara está dirigida hacia la derecha y queda completamente visible. El pelaje y las extremidades reconocibles se distinguen del nido. Sin almohadas modernas, ropa, manta fabricada, muebles contemporáneos ni dispositivos. La escena debe leerse primero como «el avatar está durmiendo» y después como «duerme en un nido».
```

### `1-rest.png`

Referencia: `public/avatar/1-idle.png`.

```text
ESCENA: el mismo simio descansa recostado sobre una roca baja, ancha y suavemente inclinada, parecida en material a la roca de su puesto de trabajo. Una mano sostiene un plátano pequeño a la altura del abdomen. Puede haber una única mata de hierba pequeña al pie de la roca; el resto es transparente.

POSE: tronco relajado, piernas dobladas sin rigidez y el otro brazo apoyado sobre la roca. Ojos abiertos, mirada tranquila hacia la fruta y sonrisa pequeña. Debe parecer despierto y disfrutando de su tiempo libre, claramente distinto de la pose dormida. La fruta es secundaria y no tapa la cara. Sin sofá, teléfono, portátil, taza, ropa ni objetos modernos. Tono simpático, sin convertir al personaje en una caricatura burlesca.
```

## Fase 2 · Erguido

### `2-sleep.png`

Referencia: `public/avatar/2-idle.png`.

```text
ESCENA: el mismo antepasado humano de la referencia duerme en un camastro bajo construido con dos troncos de soporte y unas pocas traviesas de madera irregular. Encima hay una piel color arena que sirve de colchón y una manta de piel marrón claro. Una almohada pequeña de tela rústica sostiene su cabeza. La cama cuenta por sí sola su ambientación ancestral; no dibujar paredes de cueva, fuego ni herramientas.

POSE: tumbado de lado, cabeza hacia la derecha, ojos cerrados y expresión apacible. Conserva el pelo largo alborotado, la barba completa y el bigote ancho castaños anaranjados del avatar original; deben aparecer juntos en ambas escenas. Las referencias faciales principales son `public/avatar/2-cheer.png` y `public/avatar/2-thumbs_up.png`. Una mano descansa sobre la manta, que cubre las piernas sin esconder toda la silueta. La túnica original puede asomar por el hombro. Sin pijama moderno, zapatos, cama metálica ni tecnología.
```

### `2-rest.png`

Referencia: `public/avatar/2-idle.png`.

```text
ESCENA: el mismo antepasado humano pasa un momento tranquilo en la naturaleza, sentado sobre un tronco caído corto y robusto. Sostiene suavemente una flor silvestre pequeña con una mano y la contempla. Una mata de hierba al lado del tronco sugiere el entorno; no añadir árbol, paisaje, horizonte ni suelo continuo.

POSE: tres cuartos hacia la derecha, hombros relajados, pies descalzos apoyados y la otra mano descansando sobre el tronco. Ojos abiertos y expresión curiosa y serena. Mantén la túnica de piel de la referencia, su peinado y sus proporciones. Conserva la misma barba completa y el mismo bigote ancho que en la versión dormida y en los originales `2-cheer` y `2-thumbs_up`. La flor es un detalle sencillo, no un ramo ni un objeto protagonista. La acción debe distinguirse del simio recostado de la fase 1 y del chico leyendo de la fase 4. Sin banco moderno, consola, móvil, libro ni ordenador.
```

## Fase 3 · Sedentario

### `3-sleep.png`

Referencia: `public/avatar/3-idle.png`.

```text
ESCENA: el mismo chico de camiseta azul de la referencia duerme en una cama individual sencilla, con estructura discreta de madera oscura, cabecero bajo y un colchón convencional. Una almohada crema y una manta azul polvo, con dos o tres pliegues grandes y una esquina algo descolocada, dan una sensación cotidiana y acogedora. Sin habitación completa, mesilla, pantallas, vasos ni desorden alrededor.

POSE: tumbado de lado con la cabeza hacia la derecha, mejilla sobre la almohada, ojos cerrados y expresión cómoda. Una mano asoma junto al rostro. Lleva una camiseta de dormir azul del mismo tono que su camiseta habitual; el resto queda cubierto por la manta. Conserva la cara, el pelo anaranjado/castaño exacto y las proporciones de la referencia. Sin zapatillas en la cama. La manta arrugada añade personalidad sin sugerir suciedad, abandono o mal descanso.
```

### `3-rest.png`

Referencia: `public/avatar/3-idle.png`.

```text
ESCENA: el mismo chico disfruta jugando a la consola, sentado cómodamente y un poco hundido en un sofá compacto de dos plazas azul oscuro. Sostiene con ambas manos un mando de videojuegos gris oscuro, claramente reconocible por su forma y sus botones de colores, sin marcas. Mira hacia una pantalla situada fuera del encuadre, a la derecha; no dibujar televisor ni consola aparte.

POSE: espalda relajada contra el sofá, codos cerca del cuerpo, rodillas dobladas y pies visibles. Ojos abiertos, expresión entretenida y una sonrisa ligera. Mantén su camiseta azul, vaqueros oscuros, zapatillas blancas, pelo y cara de la referencia. Mando y manos deben distinguirse incluso al reducir la imagen. Sin comida basura, basura, barriga exagerada, ojeras nuevas ni postura grotesca. Se representa un momento de ocio normal y agradable.
```

## Fase 4 · Activo

### `4-sleep.png`

Referencia: `public/avatar/4-idle.png`.

```text
ESCENA: el mismo chico de la fase activa duerme en una cama de madera natural, con cabecero sencillo de listones, almohada crema y ropa de cama clara. Una manta verde suave cubre el cuerpo y tiene pocos pliegues amplios. La escena es ordenada y acogedora, sin lujos ni elementos de dormitorio alrededor.

POSE: tumbado de lado, cabeza hacia la derecha, ojos cerrados y expresión tranquila. Una mano descansa sobre la manta. Viste una camiseta de dormir verde que conserva su identidad cromática, sin capucha puesta ni calzado. Mantén la cara, el tono de piel y el pelo de la referencia; no cambiar la edad o la forma del cuerpo. La madera clara y la manta verde deben diferenciar esta cama de la cama azul de la fase 3. Sin plantas decorativas adicionales, pantallas, reloj ni texto.
```

### `4-rest.png`

Referencia: `public/avatar/4-idle.png`.

```text
ESCENA: el mismo chico activo disfruta leyendo un libro en un banco de parque compacto, de madera con soportes oscuros. El libro está abierto a una altura cómoda, con la cubierta crema o azul polvo y páginas sin letras legibles. Una pequeña mata de hierba junto a un soporte del banco basta para sugerir el parque; el resto del entorno es transparente.

POSE: sentado de tres cuartos hacia la derecha, espalda relajada pero erguida, hombros sueltos y ambos pies apoyados. Sostiene el libro con las dos manos sin tapar el rostro. Mantén su sudadera verde con cordones claros, vaqueros oscuros, zapatillas blancas con detalles verdes, cara y pelo de la referencia. Expresión interesada y serena, ojos abiertos. No convertir la postura en ejercicio ni añadir material deportivo, teléfono, mochila o un árbol grande.
```

## Fase 5 · Optimizado

### `5-sleep.png`

Referencia: `public/avatar/5-idle.png`.

```text
ESCENA: el mismo chico de la fase optimizada duerme en una cama baja de plataforma, de madera clara y líneas simples, inspirada en un dormitorio japonés contemporáneo. El colchón es visible sobre la plataforma; ropa de cama color lino crema, almohada sencilla y manta verde petróleo. El conjunto es sobrio y acogedor, sin aspecto de suite de hotel ni cama de lujo. No dibujar tatami extendido, habitación, lámparas ni paisaje.

POSE: tumbado de lado con la cabeza hacia la derecha, ojos cerrados y rostro tranquilo completamente visible. Una mano asoma por encima de la manta. Lleva una camiseta de dormir verde sencilla. Para dormir, no lleva la cinta deportiva ni los auriculares; conserva fielmente el mismo rostro y pelo de la referencia, que garantizan su identidad. Sin deportivas en la cama ni accesorios deportivos sobre la almohada. La plataforma baja y los tejidos crema/verde petróleo distinguen esta escena de la cama con cabecero de la fase 4. No representar un descanso más «perfecto» mediante halos, estrellas o una sonrisa exagerada.
```

### `5-rest.png`

Referencia: `public/avatar/5-idle.png`.

```text
ESCENA: el mismo chico optimizado pasa su tiempo libre dando una carrera suave al aire libre. Mantén su sudadera verde, cinta blanca con raya verde, auriculares negros al cuello, pantalones oscuros y zapatillas blancas de la referencia. Una pequeña mata de hierba y dos piedras bajas cerca de los pies sugieren un sendero natural; no dibujar paisaje, carretera, suelo continuo ni otros corredores.

POSE: cuerpo entero de tres cuartos avanzando hacia la derecha, capturado en una zancada corta de trote. Un brazo adelantado y el otro atrás, codos flexionados de forma natural; una pierna avanza con rodilla ligeramente elevada y la otra queda atrás. Manos relajadas, ojos abiertos y sonrisa suave. Cara y pelo perfectamente reconocibles. La silueta de brazos y piernas debe separarse con claridad y entrar completa en el encuadre. La acción debe leerse como carrera tranquila, no sprint, competición, salto o ejercicio de rodillas altas. Sin sudor exagerado, músculos añadidos, medallas, cronómetro, estelas, desenfoque o líneas de velocidad.
```

## Revisión antes de dar cada imagen por terminada

- El personaje coincide con su referencia, especialmente cara, pelo, pelaje y proporciones.
- `sleep` se reconoce por ojos cerrados y postura dormida; `rest` por ojos abiertos y una acción de ocio.
- Se entiende la acción a 128 × 128 y al tamaño real de la card; cara y objetos esenciales siguen siendo legibles.
- Las cinco camas y las cinco acciones son distinguibles, sin depender de texto.
- El grupo cabe completo, conserva una escala comparable y no requiere decorado de fondo.
- Transparencia real, sin tablero dibujado, halo, marco o rectángulo opaco.
- Revisión sobre el fondo claro y el fondo oscuro de Breakbit.

Conviene generar primero `3-rest.png` y `1-sleep.png` para comprobar continuidad con los sprites y el encuadre de muebles. Después, usar esas imágenes aprobadas como referencia adicional de la serie, conservando siempre el sprite original de la fase como referencia principal de identidad.

Al integrarlas, el escenario de la card deberá acompañar cada ambientación: las escenas exteriores no deberían seguir mostrando la ventana de oficina. El importador actual requiere incorporar `sleep` y `rest` sin eliminar los recursos existentes; esto pertenece a la implementación posterior, no a la generación de los diez dibujos.
