# Prompts para generar el avatar de Breakbit

21 imágenes: 5 fases × 4 poses, más la pose de demostración de la fase 5. Estilo: el del mock
de PosturaMon (chibi en pixel art detallado).

## Cómo usarlos

1. Abre un chat nuevo en ChatGPT (o Gemini) y adjunta las dos imágenes de referencia: la de la
   evolución y la del mock de PosturaMon.
2. Pega el **prompt maestro**. Pide que confirme que lo ha entendido antes de empezar.
3. Pega los prompts **de uno en uno**, en orden, y descarga cada imagen. Si una sale mal, pide
   que la repita mencionando el nombre del archivo y qué corregir.
4. Al final pega el **prompt del zip**. Si no puede crear el zip, descarga las imágenes una a
   una con esos nombres: yo las renombro y las limpio igualmente.

## Prompt maestro (pegar primero, con las dos referencias adjuntas)

```text
Vas a crear el arte del avatar de una app llamada Breakbit: 21 imágenes en total. Es un personaje que evoluciona en 5 fases, desde un antepasado tipo mono hasta un desarrollador sano y optimizado, como la clásica imagen de la evolución humana, pero trabajando con un ordenador en cada etapa.

ESTILO (obligatorio en todas las imágenes):
- Pixel art detallado, del mismo estilo que el mock de PosturaMon adjunto: personaje chibi simpático, cabeza grande, cara muy expresiva, ojos grandes y brillantes.
- Píxeles grandes y nítidos, todos del mismo tamaño, sin antialiasing ni bordes borrosos, como un sprite de 128×128 ampliado a 1024×1024.
- Contorno marrón oscuro (no negro puro), sombreado suave en 3 o 4 tonos por material, luz desde arriba a la izquierda.
- Paleta cálida y limitada. Colores de la marca: verde bosque #2F6F46, verde suave #6FAF8F, teal #7CC4C4, azul polvo #7B9CCB, naranja suave #F4A261, crema #FFF8EE.

FORMATO (obligatorio):
- PNG cuadrado de 1024×1024 con FONDO TRANSPARENTE de verdad: sin paisaje, sin cielo, sin suelo dibujado, sin marco, sin sombras de fondo.
- Sin texto, sin letras, sin etiquetas, sin marcas de agua.
- Un solo personaje por imagen, centrado.

LOS 5 PERSONAJES (mismo diseño en todas sus imágenes):
- Fase 1, el antepasado: un simio simpático, encorvado, de pelo marrón rojizo, cara beige clara con cejas marcadas, mirada curiosa y amable.
- Fase 2, el cavernícola: más erguido pero aún algo encorvado, pelo largo y barba castaños y alborotados, túnica de piel marrón clara con una tira cruzada al hombro, descalzo.
- Fase 3, el desarrollador sedentario: chico joven de pelo castaño oscuro alborotado y de punta, piel clara cálida, sin barba, camiseta azul, vaqueros oscuros y zapatillas blancas. Algo cansado y encorvado.
- Fase 4, el desarrollador activo: el MISMO chico de la fase 3, ahora con sudadera verde con capucha (cordones blancos), vaqueros oscuros y zapatillas blancas con suela verde. Espalda recta, con energía.
- Fase 5, el desarrollador optimizado: el MISMO chico, con la misma sudadera verde, una cinta deportiva blanca con una raya verde en la frente, auriculares negros al cuello y zapatillas blancas. Postura impecable, se le ve sano y en forma.
Las fases 3, 4 y 5 son la misma persona: misma cara, mismo pelo y mismas proporciones. Las fases 1 y 2 son sus antepasados, con tonos de pelo parecidos.

LAS 4 POSES DE CADA FASE:
- "idle" (trabajando): cuerpo entero en su puesto de trabajo, visto de perfil o en tres cuartos y mirando a la derecha, para que se vea su postura. Incluye solo los muebles y objetos de su puesto, sin fondo. Los pies, o la base del mueble, apoyados en la misma línea, a un 92 % de la altura de la imagen.
- "cheer" (¡vamos!): de frente, plano medio (de la cintura para arriba), un puño levantado junto a la cabeza y el otro puño a la altura del pecho, boca abierta animando, unos destellos amarillos pequeños junto al puño.
- "celebrate" (celebración): de frente, plano medio, los dos brazos arriba con las manos abiertas, ojos cerrados de felicidad (^ ^), gran sonrisa con la boca abierta y confeti de colores pequeño alrededor.
- "thumbs_up" (¡buen trabajo!): de frente, plano medio, pulgar arriba con una mano, guiñando un ojo y sonriendo, un destello pequeño junto al pulgar.
En las poses de plano medio, el mismo encuadre en las 5 fases: la parte de arriba de la cabeza a un 8 % del borde superior y el cuerpo cortado a la altura de la cintura en el borde inferior.

Te iré pidiendo las imágenes una a una con su nombre de archivo. Respeta exactamente ese nombre. Confírmame que lo has entendido antes de empezar.
```

## Los 21 prompts (de uno en uno, en este orden)

### Fase 1, el antepasado

```text
1-idle.png — Fase 1 trabajando: el simio encorvado, agachado junto a una roca grande y plana que usa de escritorio. Encima hay un "portátil" tallado en piedra gris, con la pantalla brillando en azul claro, y teclea con un dedo concentrado. Vista de perfil mirando a la derecha. Fondo transparente.
```

```text
1-cheer.png — Fase 1, pose cheer: el simio de frente, plano medio, puño levantado y boca abierta animando, destellos amarillos. Fondo transparente.
```

```text
1-celebrate.png — Fase 1, pose celebrate: el simio de frente, plano medio, los dos brazos arriba, ojos cerrados de felicidad, gran sonrisa y confeti. Fondo transparente.
```

```text
1-thumbs_up.png — Fase 1, pose thumbs_up: el simio de frente, plano medio, pulgar arriba, guiño y sonrisa, un destello. Fondo transparente.
```

### Fase 2, el cavernícola

```text
2-idle.png — Fase 2 trabajando: el cavernícola sentado en un tronco, algo encorvado, ante una mesa de piedra. Encima hay un "monitor" hecho de piedra con la pantalla brillando en azul claro y un teclado de piedra en el que teclea. Vista de perfil mirando a la derecha. Fondo transparente.
```

```text
2-cheer.png — Fase 2, pose cheer: el cavernícola de frente, plano medio, puño levantado y boca abierta animando entre la barba, destellos amarillos. Fondo transparente.
```

```text
2-celebrate.png — Fase 2, pose celebrate: el cavernícola de frente, plano medio, los dos brazos arriba, ojos cerrados de felicidad, gran sonrisa y confeti. Fondo transparente.
```

```text
2-thumbs_up.png — Fase 2, pose thumbs_up: el cavernícola de frente, plano medio, pulgar arriba, guiño y sonrisa, un destello. Fondo transparente.
```

### Fase 3, el desarrollador sedentario

```text
3-idle.png — Fase 3 trabajando: el chico de camiseta azul hundido en una silla de oficina azul oscuro, encorvado hacia un portátil gris sobre un escritorio de madera, con la cabeza adelantada y ojos de cansancio. En la mesa, una taza de café humeante. Vista de perfil mirando a la derecha. Fondo transparente.
```

```text
3-cheer.png — Fase 3, pose cheer: el chico de camiseta azul de frente, plano medio, puño levantado y boca abierta animando, destellos amarillos. Fondo transparente.
```

```text
3-celebrate.png — Fase 3, pose celebrate: el chico de camiseta azul de frente, plano medio, los dos brazos arriba, ojos cerrados de felicidad, gran sonrisa y confeti. Fondo transparente.
```

```text
3-thumbs_up.png — Fase 3, pose thumbs_up: el chico de camiseta azul de frente, plano medio, pulgar arriba, guiño y sonrisa, un destello. Fondo transparente.
```

### Fase 4, el desarrollador activo

```text
4-idle.png — Fase 4 trabajando: el mismo chico, ahora con sudadera verde, sentado con la espalda recta en la misma silla de oficina, tecleando en el portátil sobre el escritorio de madera. En la mesa, una botella de agua azul. Se le ve con energía. Vista de perfil mirando a la derecha. Fondo transparente.
```

```text
4-cheer.png — Fase 4, pose cheer: el chico de sudadera verde de frente, plano medio, puño levantado y boca abierta animando, destellos amarillos. Fondo transparente.
```

```text
4-celebrate.png — Fase 4, pose celebrate: el chico de sudadera verde de frente, plano medio, los dos brazos arriba, ojos cerrados de felicidad, gran sonrisa y confeti. Fondo transparente.
```

```text
4-thumbs_up.png — Fase 4, pose thumbs_up: el chico de sudadera verde de frente, plano medio, pulgar arriba, guiño y sonrisa, un destello. Fondo transparente.
```

### Fase 5, el desarrollador optimizado

```text
5-idle.png — Fase 5 trabajando: el chico de sudadera verde, con cinta en la frente y auriculares al cuello, de pie y muy erguido ante un standing desk (tablero de madera, patas metálicas grises). Sobre la mesa, un monitor con código de colores en la pantalla y una planta en una maceta naranja. Lleva zapatillas blancas. Vista de perfil mirando a la derecha. Fondo transparente.
```

```text
5-cheer.png — Fase 5, pose cheer: el chico optimizado (sudadera verde, cinta, auriculares al cuello) de frente, plano medio, puño levantado y boca abierta animando, destellos amarillos. Fondo transparente.
```

```text
5-celebrate.png — Fase 5, pose celebrate: el chico optimizado de frente, plano medio, los dos brazos arriba, ojos cerrados de felicidad, gran sonrisa y confeti. Fondo transparente.
```

```text
5-thumbs_up.png — Fase 5, pose thumbs_up: el chico optimizado de frente, plano medio, pulgar arriba, guiño y sonrisa, un destello. Fondo transparente.
```

```text
5-demo.png — Fase 5, pose de demostración: el chico optimizado de cuerpo entero y de frente, de pie en posición neutra y preparada (pies a la anchura de los hombros, brazos relajados un poco separados del cuerpo), con sonrisa amable. Se usará de base para enseñar ejercicios, así que el cuerpo entero debe verse bien, de la cabeza a las zapatillas, sin objetos. Pies a un 92 % de la altura de la imagen. Fondo transparente.
```

## Prompt del zip (al terminar)

```text
Mete las 21 imágenes en un zip llamado breakbit-avatar.zip, con estos nombres exactos y en PNG con fondo transparente:
1-idle.png, 1-cheer.png, 1-celebrate.png, 1-thumbs_up.png,
2-idle.png, 2-cheer.png, 2-celebrate.png, 2-thumbs_up.png,
3-idle.png, 3-cheer.png, 3-celebrate.png, 3-thumbs_up.png,
4-idle.png, 4-cheer.png, 4-celebrate.png, 4-thumbs_up.png,
5-idle.png, 5-cheer.png, 5-celebrate.png, 5-thumbs_up.png, 5-demo.png.
Antes de crearlo, comprueba que están las 21 y que ninguna tiene fondo.
```

## Comprobación final

| Fase | idle | cheer | celebrate | thumbs_up | demo |
|---|---|---|---|---|---|
| 1, antepasado | 1-idle | 1-cheer | 1-celebrate | 1-thumbs_up | — |
| 2, cavernícola | 2-idle | 2-cheer | 2-celebrate | 2-thumbs_up | — |
| 3, sedentario | 3-idle | 3-cheer | 3-celebrate | 3-thumbs_up | — |
| 4, activo | 4-idle | 4-cheer | 4-celebrate | 4-thumbs_up | — |
| 5, optimizado | 5-idle | 5-cheer | 5-celebrate | 5-thumbs_up | 5-demo |

Cuando las tengas, déjalas en una carpeta (o el zip) y dime dónde están. Yo me encargo del resto:
- comprobar que no falta ninguna;
- quitar restos de fondo;
- ajustarlas a una rejilla de píxel nítida;
- igualar tamaños y encuadres;
- conectarlas en la app.
