# Correcciones de manos y vista · 16 de octubre de 2026

Generadas con **ImageGen integrado**, sin CLI/API. Pendientes de revisión del usuario en `codex/exercise-guides-pilot`; sin commit ni publicación.

## Recursos finales

Siete PNG reemplazados en `public/exercises/`, sin cambiar el total de 42 ejercicios y 105 posturas. Originales y variantes conservados en la carpeta local de generación. Todos los archivos finales conservan transparencia real y lienzo común de 256×256; preparación por vecino más próximo, sin recortes individuales.

- `wrist_flexor_stretch/02.png`: la mano de ayuda recoge por debajo los dedos que apuntan hacia abajo.
- `finger_by_finger_stretch/01.png` y `02.png`: palma arriba, cinco dedos sin uñas en la palma, mano de ayuda sujetando un dedo junto al pulgar; segunda postura lo lleva hacia abajo aproximadamente 30–40°.
- `far_gaze/01.png` y `02.png`: avatar de pie junto a una ventana con paisaje lejano, con giro de atención hacia el exterior.
- `near_far_focus/01.png` y `02.png`: avatar de pie y dedo delante. Flechas de ojo a dedo y ojo a la derecha añadidas por la interfaz mediante SVG, con coordenadas por postura y contraste en ambos temas. El dedo permanece en el mismo sitio.

## Validación

28 pruebas dirigidas, compilación con ruta de GitHub Pages y lint correctos. Comparación de huellas: exactamente siete PNG modificados y 99 intactos, incluida la referencia maestra. Revisión visual en claro, oscuro y móvil. La prueba de la guía comprueba cambio de destino de la flecha y retirada al fallar una imagen.

## Prompts utilizados

Se conserva la cadena de edición porque la primera mano necesitó corrección anatómica. Una iteración de la segunda postura fue rechazada por el generador por una clasificación errónea de seguridad; no produjo recurso. Se descartaron también las posturas con un dedo extra o con movimiento del dedo equivocado. Los recursos seleccionados figuran al final.

### Solicitud 1 · `wrist_flexor_stretch/02.png`

Referencia: `/Users/david/Developer/proyectos-personales/break-bit/work/exercise-guides-generation.local/originals/wrist_flexor_stretch/02.png`

```text
Use case: precise-object-edit. Image1 exact INNER FOREARM STRETCH target. Keep ACTIVE RIGHT ARM/HAND (lower near forearm, visible PALM at canvas RIGHT with fingers pointing DOWN) EXACTLY unchanged at original pixels. Fix ONLY helper LEFT ARM/HAND: remove helper hand currently hovering on TOP/side. Move helper hand BELOW active hanging FINGERS. Helper palm faces UP and CUPS the active FOUR FINGERTIPS FROM UNDERNEATH, its fingers CURL AROUND bottoms/pads of active fingers with clear physical contact, gently cradling/supporting the downward pull. It must be a real UNDERHAND GRIP of fingers, not touching wrist/side, not hovering beside them or pushing from above. Helper forearm approaches from below-left, wrist bends naturally to palm-up cradle directly below active fingers. Two distinct wrists/hands, normal five digits each (natural overlaps allowed); no extra arm, no disconnected hand. Preserve exact active palm/fingers direction DOWN, active sleeve/forearm, head/face/hair/headband, torso/green hoodie, camera, canvas and scale. No headphones. Crisp same pixel art, dark outline, genuine transparency, no text/arrows/scenery/shadows/halo.
```

### Solicitud 2 · `finger_by_finger_stretch/01.png`

Referencia: `/Users/david/Developer/proyectos-personales/break-bit/work/exercise-guides-generation.local/originals/finger_flex/01.png`

```text
Use case: scientific-educational. Asset: correct FIVE-FINGER hand anatomy for individual finger stretch, first pose NEUTRAL. Reference image STYLE/SKIN/GREEN SLEEVES only; draw HANDS/FOREARMS closeup, NO face/head/body. Active RIGHT forearm enters from LEFT and hand reaches RIGHT with PALM FACING UP to ceiling, slight three-quarter SIDE camera from above showing clean PALM SKIN/creases. EXACTLY FIVE DIGITS: ONE SHORT THUMB projects toward viewer/lower edge at base of palm, plus FOUR LONG FINGERS (INDEX, middle, ring, little) pointing RIGHT in small fan. INDEX is LOWEST/NEAREST of four long fingers, directly NEXT TO THUMB; middle, ring, little are behind/above it. No extra protrusion between thumb/index or above palm. NO NAILS visible on palmar surfaces or fingertip pads, no mirrored dorsal nail on front. Helper LEFT hand comes from LOWER RIGHT, thumb/index lightly HOLD TIP of active INDEX from UNDERNEATH, with relaxed natural grasp. Other helper digits loosely curled and partly occluded, no extra digits. At START active index is straight HORIZONTAL aligned with hand, NOT bent. Leave empty BELOW index for next30–40degree DOWNWARD extension, helper will follow down. Active wrist stays straight; do not flex whole wrist or grab all fingers. Two green rolled sleeves match avatar. All fingers completely inside canvas5%margins, only forearm sleeve ends may crop. One pose, real transparent alpha, crisp stepped pixel-art dark outline, limited skin shading, no text/arrows/insets/scenery/shadows/halo.
```

### Solicitud 3 · `far_gaze/01.png`

Referencia: `/Users/david/Developer/proyectos-personales/break-bit/work/exercise-guides-generation.local/originals/hip_hinge/01.png`

```text
Use case: scientific-educational. Asset: STANDING avatar AT WINDOW, initial look-away pause. Same approved optimized phase5 avatar identity, red-orange asymmetric spiky hair, white headband with green stripe, brown eyes, green hoodie pale drawstrings, dark trousers, white/green sneakers, NO HEADPHONES. Crisp pixel-art clusters and stepped dark-brown outline, limited discrete shading, no smoothing/3D/painting/glow. Square canvas, actual transparent alpha background, no text, watermark or motion ghosts. FULL BODY visible from hair to both planted shoes. Avatar stands upright on canvas LEFT around x35%, feet hip-width baseline y92%, hands relaxed down or one lightly near windowsill, no seated pose/laptop/desk/phone. A simple open WINDOW on canvas RIGHT x60–95%, window sill around waist/chest height and top around hair level, minimal wood/green frame. THROUGH WINDOW show a small distant green hill/tree line and pale blue sky, simple matching pixel art to read FAR DISTANCE, confined INSIDE window opening. Outside figure/window everything TRANSPARENT, no room wall/floor/background rectangle. Initial head is three-quarter toward viewer/RIGHT with gaze toward window, calm neutral posture as approaching pause. Camera fixed front-right view, all body/window inside safe margins, same window/body positions for next frame when head turns to look outside. Normal avatar proportions, original hairstyle/headband, no cropped shoes. One person one pose.
```

### Solicitud 4 · `near_far_focus/01.png`

Referencia: `/Users/david/Developer/proyectos-personales/break-bit/work/exercise-guides-generation.local/originals/hip_hinge/01.png`

```text
Use case: scientific-educational. Asset: FULL-BODY STANDING near/far focus guide first pose. Same approved optimized phase5 avatar identity, red-orange asymmetric spiky hair, white headband with green stripe, brown eyes, green hoodie pale drawstrings, dark trousers, white/green sneakers, NO HEADPHONES. Crisp pixel-art clusters and stepped dark-brown outline, limited discrete shading, no smoothing/3D/painting/glow. Square canvas, actual transparent alpha background, no text, watermark or motion ghosts. Full-body upright STANDING three-quarter SIDE facing RIGHT, both feet flat hip-width baseline y92%, body center x35%, hair top y7%, normal approved avatar proportions. ONE hand raised in FRONT of face with INDEX pointing UP at eye level, fingertip about25–30cm from face, around x67%,y25%; other fingers naturally curled, anatomically five digits total, other arm down. Head upright, pupils calmly looking AT raised fingertip, no crossed eyes. Keep empty transparent RIGHT area x75–97% at EYE HEIGHT for later graphic arrow to distance. No chair/window/scenery/laptop/props. All hair/hands/shoes inside margins. Crucial: NO ARROWS in bitmap, software will draw clean eye-to-finger arrow and eye-to-right-edge arrow afterward. Need clear eyes/profile and fingertip, face on left and finger right. Same fixed head/body/hand size, pose, camera, canvas in next frame; only gaze will look beyond finger. No headphones.
```

### Solicitud 5 · `finger_by_finger_stretch/01.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-07fafee1-ffff-4910-8fdf-fca3774a3ceb.png`

```text
Use case: precise-object-edit. Edit exact supplied transparent pixel-art two-hands image. ONE SURGICAL ANATOMY FIX ONLY: REMOVE THE EXTRA UPPER THUMB, the entire digit sticking diagonally UP-RIGHT from the TOP edge of the large left palm (at x45–56%, y16–32%). Replace it with clean rounded continuous palm contour descending smoothly to the three upper long fingers. Keep the SHORT LOWER THUMB pointing DOWN at palm base x45%,y65% UNCHANGED. Keep FOUR long fingers pointing RIGHT: three free upper long fingers and the lowest held INDEX finger next to the lower thumb. This yields EXACTLY FIVE digits on the large active hand, one LOWER thumb plus four long fingers, no upper thumb or extra nub. Keep helper hand gripping lowest long INDEX from underneath, all other pixels and skin shading/green sleeves/hand placement/canvas unchanged. Active palm UP, no fingernails on palm. Preserve actual transparent alpha and matching crisp pixel style. No other alterations, no text.
```

### Solicitud 6 · `far_gaze/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-dc5d5815-9750-4019-9f3d-1a7b8e9dd1cc.png`

```text
Use case: precise-object-edit. Exact supplied transparent pixel-art standing avatar by open window is edit target. Second frame of distant gaze. Change ONLY head attention: turn head slightly further toward RIGHT into side profile, clearly gazing through open window at distant hills. Eyes open relaxed, looking far outside at horizon height. Keep hair identity/headband, head SIZE and head position, ALL body/sleeves/arms/hands/legs/shoes EXACTLY unchanged, same standing posture. Window frame, sill, glass and landscape EXACT same pixels. No arrows/text, actual transparent background outside scene, same square canvas and crisp pixelart. No headphones.
```

### Solicitud 7 · `near_far_focus/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-0683024b-141b-4f93-9f2c-a48275702f50.png`

```text
Use case: precise-object-edit. Exact supplied transparent pixel-art standing optimized avatar with raised index is edit target. Second near/far focus frame. Change ONLY EYE attention: pupil gently looks past raised fingertip into far distance at RIGHT edge at eye level rather than focusing near finger; neutral relaxed open eye. Keep precise head/face/hair/headband position, size and shape, body, hoodie, BOTH hands and extended INDEX fingertip, arms, trousers, shoes EXACT SAME PIXELS. Camera and entire canvas identical. No baked arrows, text, scenery, headphones, ghosts. Preserve actual alpha transparency/crisp pixel-art. Software overlays separate eye-to-right-edge arrow.
```

### Solicitud 8 · `finger_by_finger_stretch/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-5d66e97b-1aa4-4ed1-b072-5aa05cca4e9d.png`

```text
Use case: precise-object-edit. Frame2 of finger extension exercise. Exact supplied image edit target. Keep active large palm/wrist/green sleeve, THREE FREE upper long fingers, and SHORT LOWER THUMB exactly unchanged. Move ONLY the LOWEST long INDEX finger that is currently held horizontally at y57%: rotate entire index gently DOWNWARD from its knuckle at x58%,y56%, by35DEGREES from horizontal, fingertip moving DOWN-RIGHT to about x78%,y72%. Finger should slope diagonally down-right, remain mostly straight with gentle natural joints, NOT UP, not bent90degrees, no kink. Other LEFT assisting hand follows LOWER, gently holding that same index fingertip with thumb/index from underneath; grasp remains physically connected. The other three free long fingers remain stretched horizontally RIGHT and distinct; lower short thumb stays at x46%,y64% separate from index. EXACTLY FIVE active digits, NO extra UPPER thumb, no new digits; palmar surfaces with creases and NO visible nails. Same canvas/scale/transparent alpha and crisp stepped pixel art. Only 35degree DOWNWARD index motion and accompanying helper-hand move; preserve all else. No text/arrows.
```

### Solicitud 9 · `finger_by_finger_stretch/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-5bd0993e-ea23-4a12-8735-91257172407c.png`

```text
Use case: precise-object-edit. Correct only the free fingers of supplied transparent pixel-art hands. Keep lower short THUMB at x45%,y65%, assisted bent finger and helper grip EXACTLY unchanged. Currently active palm has only TWO free upper fingers (y31% and41%) plus a stray tiny stump at bottom-right palm (x50–58%,y56%). REMOVE that stray tiny lower stump and redraw it as the THIRD free straight horizontal finger directly BELOW the two existing straight fingers, parallel to them at y49%, extending from palm x61% to about x87%,y49%. Thus the active hand has EXACTLY: THREE FREE straight long fingers at upper-right, ONE assisted long index finger angled DOWN35degrees next to lower thumb, and ONE lower short thumb. FIVE digits total. Bent assisted index starts at lower-right palm at x58%,y56% and angles down-right to helper, below all three free fingers. No extra palm stubs, no upper thumb, no fingernails on palmar surfaces. Preserve all other artwork, sleeve, scale, canvas, true transparent alpha. No text.
```

### Solicitud 10 · `finger_by_finger_stretch/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-5d66e97b-1aa4-4ed1-b072-5aa05cca4e9d.png`

```text
Educational hand mobility illustration, second animation pose. Edit supplied pixel art hand exercise. Large right hand palm faces viewer/up, wrist entering from left. Keep its short thumb pointing down and all THREE upper extended fingers in their existing places. Keep exactly five digits total. The fourth long finger, the LOWEST horizontal finger currently being held by the other hand at bottom right, is the index beside the thumb. Gently angle this held index DOWN by about30degrees from the point where it joins the palm at x54%,y56%. Its tip should be at x72%,y69%, pointing diagonally down-right. Other hand lightly holds/supports this same fingertip and follows it downwards. Show comfortable gentle position, no discomfort or extreme bending. Crucial: THREE free extended fingers above, ONE gently angled assisted index below, ONE short thumb nearest bottom. No nails on visible palm. Same wrist, palm, camera, sleeves, pixel style, square composition and transparent background. One frame only, no text or arrows.
```

## Selección final

| Recurso | Archivo generado |
| --- | --- |
| `wrist_flexor_stretch/02.png` | `exec-a6761fb1-dd57-4d45-b697-376564bab889.png` |
| `finger_by_finger_stretch/01.png` | `exec-5d66e97b-1aa4-4ed1-b072-5aa05cca4e9d.png` |
| `finger_by_finger_stretch/02.png` | `exec-3dd8969e-6230-4067-a917-1d5adcbffb3e.png` |
| `far_gaze/01.png` | `exec-dc5d5815-9750-4019-9f3d-1a7b8e9dd1cc.png` |
| `far_gaze/02.png` | `exec-fadfb060-2d3a-41c3-8c49-0e240f428c40.png` |
| `near_far_focus/01.png` | `exec-0683024b-141b-4f93-9f2c-a48275702f50.png` |
| `near_far_focus/02.png` | `exec-c71c8b9f-a925-47a9-a518-07c51a998ad6.png` |

## Revisión posterior del antebrazo

Las dos imágenes del antebrazo se han vuelto a generar a partir de las fotografías aportadas por el usuario. La selección y los prompts de [esta corrección](exercise-guide-forearm-photo-correction.md) prevalecen sobre la postura del antebrazo descrita aquí.

## Orientación final de interno y externo

La revisión posterior del usuario distingue palma arriba/dorso visible para el interno y palma abajo/agarre anterior para el externo. Véase [selección y prompts finales](exercise-guide-forearm-pair-correction.md), que prevalecen sobre los recursos de antebrazo anteriores.
