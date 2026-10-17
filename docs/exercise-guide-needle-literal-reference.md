# Enhebrar la aguja · referencia literal

17 de octubre de 2026. Generado con **ImageGen integrado**. Sustituye las tres posturas anteriores; misma rama, sin commit.

La postura 02 copia la ilustración inferior del usuario sin invertirla: cabeza a la izquierda, cadera elevada sobre las rodillas, brazo de apoyo junto a la cara y brazo de trabajo cruzando por debajo hacia el primer plano. Se cambia el personaje al avatar optimizado sin auriculares. Preparación y apertura se orientan también hacia la izquierda. La imagen de apertura recibió una segunda edición para quitar el fondo y recuperar el lienzo cuadrado transparente.

Producción: `public/exercises/thread_the_needle/{01,02,03}.png`. Originales y variantes conservados en `work/exercise-guides-generation.local/`.

## Prompts usados

Verificado: transparencia RGBA y lienzos cuadrados; exactamente tres PNG sustituidos y los otros 128 recursos intactos. Registro de 130 posturas coincidente con los archivos presentes. Compilación con prefijo `/breakbit/` correcta. Revisión visual en claro y oscuro, con capturas `work/exercise-guides-generation.local/preview-needle-literal-{light,dark}.jpg`.

### thread_the_needle/02.png

Referencias: `codex-clipboard-ec31ca6b-6c2b-4084-b5a7-faca86c2bf5d.png`, `avatar-master.png`

```text
Style transfer of the LOWER POSE in Image1 into the pixel-art avatar character of Image2. Copy the LOWER drawing's pose directly and faithfully. DO NOT mirror, rotate, change camera, or reinterpret its anatomy. Ignore the upper pose entirely. One pose only.
Keep the lower illustration's exact left-facing silhouette and joint arrangement: HEAD LOW at LEFT, HIPS HIGH in center, KNEES on ground at RIGHT under hips, SHINS and feet extending further RIGHT. Torso slopes down-left. Same shoulder resting near side of head on ground. One bent SUPPORT arm has PALM FLAT immediately beside/under the face at LEFT. The other WORKING arm crosses UNDER the support arm/chest and extends diagonally toward foreground BOTTOM-CENTER with fingers pointing down-right, exactly where the lower reference has that long visible forearm and open hand. This UNDERPASS and the two different hand positions MUST remain exactly like lower source. Do not replace by two forward arms, a child pose, right-facing figure, a sideways bow, or an arm extending behind the head.
Change only character/design: approved optimized young male avatar, spiky RED-ORANGE hair, white headband with GREEN stripe, GREEN HOODIE with rolled sleeves, dark navy trousers, white/green sneakers, no headphones, no ponytail. Match Image2 crisp square-pixel game-art clusters, dark-brown stepped outlines, 3–4 tone shading. Show full figure and both hands, clear anatomy, exactly two arms and two legs, normal fingers. Enlarge only enough to fill roughly85% square canvas, preserve pose proportions and contacts from lower reference. Minimal flat teal mat under the same ground contacts, TRANSPARENT RGBA outside figure/mat. No other pose/person, white background, text, arrows, logos or scenery. Pose accuracy takes priority; pixel style/wardrobe follow avatar.
```

### thread_the_needle/01.png

Referencias: `exec-4c9f28e2-dce0-40ff-b37d-1bf664a15e38.png`

```text
Use case: precise-object-edit. Initial TABLETOP pose before this exact LEFT-FACING thread-the-needle. Keep same LEFT-facing camera, canvas, scale, avatar head SIZE/identity/hair/headband/green hoodie/dark trousers/shoes, exact teal mat, both planted KNEE positions and feet/shins at RIGHT unchanged. Raise torso and head naturally into NEUTRAL ALL FOURS: hips remain directly ABOVE knees at RIGHT, back horizontal toward shoulders on LEFT; hands palms DOWN directly under shoulders, both elbows straight, two hands on mat to LEFT of knees and both clearly visible with slight depth separation. Neck in line with spine, face looks DOWN-LEFT calmly, NOT viewer smile, no upright sitting. Head at LEFT above shoulders, same size as source, not giant. Undo crossing of arms: each hand directly below its own shoulder, no third hand left beneath face, no folded arm under head. All fingers/shoes/hair inside original square canvas. One neutral pose, crisp same pixelart real alpha, no headphones/text/arrows/ghosts.
```

### thread_the_needle/03.png

Referencias: `codex-clipboard-ec31ca6b-6c2b-4084-b5a7-faca86c2bf5d.png`, `exec-4c9f28e2-dce0-40ff-b37d-1bf664a15e38.png`

```text
Style transfer of UPPER pose of Image1, using EXACT same approved avatar/scale/LEFT-facing camera and teal mat of Image2. COPY UPPER illustration's joint arrangement directly: head at LEFT, hips and kneeling legs at RIGHT, both knees on ground under hips, shins/feet pointing RIGHT. One support hand planted below LEFT shoulder, support arm straight; other arm opens UP to ceiling, elbow straight and hand upward. Torso rotates away into open chest, head naturally turns along rotation as in upper source, no neck twist. Do NOT mirror source or make head face RIGHT. Need clear support arm and raised arm exactly like upper drawing. Same red spiky-haired male avatar, white/green headband, green hoodie/pale drawstrings, navy trousers, whitegreen trainers, no ponytail/noheadphones. Both knee/shin/shoe/mat positions from Image2 stay unchanged; same head size and limb scale, reserve top margin for raised fingertips. One OPENING pose only, ignore lower source illustration. Crisp chunky squarepixel art stepped darkoutline limited shades, genuine transparent square RGBA outside sprite/mat. No text/arrows/logos/background/second pose/person/ghosts. Pose precision follows upper reference; avatar design follows Image2.
```

### thread_the_needle/03.png

Referencias: `exec-1356a68a-0ca9-48eb-aac3-d0b9365e5287.png`

```text
Use case: background-extraction. Edit target Image1. Preserve this exact pixel-art avatar and opening pose, limbs, clothes, left-facing head and mat. Remove ALL black background and ALL colored haze/glow; replace with genuinely transparent alpha, including above and around figure. Output a SQUARE canvas, fit complete raised fingertips, head and entire shoes/mat inside with clear margins. Keep same pixel art, hard stepped edges, no blurry outlines, no lights, no new elements, no text, no shadows outside mat. Only background removal and square canvas framing; do not alter pose. Transparent square PNG sprite.
```


Selección posterior: [segunda referencia del usuario](exercise-guide-needle-second-reference.md). Sustituye la selección anterior de aguja; orientación derecha, cabeza sin apoyo sobre antebrazo.
