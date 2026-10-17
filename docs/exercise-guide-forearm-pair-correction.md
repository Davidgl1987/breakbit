# Antebrazos interno y externo · orientación de las manos

16 de octubre de 2026. **ImageGen integrado**. Cuatro PNG finales en `public/exercises/wrist_flexor_stretch/` y `public/exercises/wrist_extensor_stretch/`. Misma rama `codex/exercise-guides-pilot`, sin commit ni publicación. Esta revisión prevalece sobre las anteriores correcciones del antebrazo.

## Solicitud y secuencias

- **Interno:** primera postura con palma arriba y muñeca alineada; segunda con dedos abajo y el dorso de la mano visible, con nudillos y uñas para distinguirlo de la palma. Mano de ayuda sujetando los dedos.
- **Externo:** primera postura con palma abajo y muñeca alineada; segunda reutiliza el agarre y la cara interior visible de la postura anterior que gustó al usuario.
- Mismo avatar lateral sin auriculares, mismo encuadre y escala entre posturas. Se reserva margen a la derecha para los dedos extendidos de la primera imagen, sin recortarlos.
- PNG transparentes a 256×256, preparación del lienzo entero por vecino más próximo. Dos imágenes por ejercicio; cadencia de 2,5 segundos para preparación y 25 segundos para estiramiento.

Las versiones anteriores se conservan en `work/exercise-guides-generation.local/variants/before-forearm-internal-external/`. Solo cambian cuatro PNG; los otros 102 recursos siguen idénticos.

## Prompts y cadena de edición

### `wrist_extensor_stretch/02.png`

Referencia: `/Users/david/Developer/proyectos-personales/break-bit/work/exercise-guides-generation.local/originals/wrist_flexor_stretch/02.png`

```text
Use case: precise-object-edit. Exact supplied pixel-art avatar side profile with forearm stretch is the approved EXTERNAL forearm stretch pose. Keep pose and hands anatomy/visible PALMAR CREASES exactly as shown, including downward active fingers and helper hand wrapping them. Change ONLY framing to reserve rightward room for a later neutral horizontal hand: reduce entire character uniformly to about80% of current size, place head top at y8%, leftmost hair x5%, torso bottom y90%, active wrist around x74%,y48%, downward fingertips x77%,y66%, helper hand still grasping them. Leave large transparent right margin x82–98% for later extended fingertips. Whole torso/head/arms scale identically with NO warping or proportions change. Approved spiky red-haired male, white-green headband, green hoodie, NO headphones. Same crisp pixelart clusters, dark outlines, discrete skin shading, square transparent RGBA canvas. This remains EXTERNAL stretch frame2 with PALM visible. No arrows/text, no furniture, no duplicated hands, no new objects.
```

### `wrist_flexor_stretch/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-cbf5cd89-a5ea-4934-ab22-9ee559559888.png`

```text
Use case: precise-object-edit. Exact supplied transparent pixel-art side-profile avatar is edit target. This must be INTERNAL FOREARM STRETCH, so change ONLY active UPPER RIGHT forearm/hand orientation, showing the BACK OF THE HAND to viewer instead of palm. Same upper arm straight forward horizontally, wrist at x71%,y51%, four active fingers pointing DOWN. Turn active forearm into supination (palm was facing UP before wrist gently extends down): draw visible DORSAL BACK OF ACTIVE HAND facing camera, clean dorsal skin with subtle KNUCKLES and NAILS at ends of active downward fingers where visible. NO palmar creases or fleshy palm mound on this active hand. Active thumb must be on opposite SIDE from source, so this is genuine forearm/hand rotation and not simply drawing nails over a palm. Keep natural elbow/wrist alignment. Other lower LEFT assisting hand still wraps around active downward fingers naturally, adjusting thumb/finger contact to rotated hand, no bowl. Preserve EXACT head/profile/hair/headband, torso/hoodie, BOTH sleeve outlines, camera/canvas/scale, wrist location and downwards finger direction. Two hands total, five digits each with natural overlaps, no extra finger/thumb, no fused wrists. Pixel-art stepped outline, transparent alpha, no text/arrows/headphones. Most important visible surface of ACTIVE upper right hand is BACK with knuckle/nail cues, not PALM.
```

### `wrist_extensor_stretch/01.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-cbf5cd89-a5ea-4934-ab22-9ee559559888.png`

```text
Use case: precise-object-edit. Exact source pixel-art avatar is EXTERNAL forearm stretch frame2. Make initial frame1. Preserve EXACT entire head/sideprofile/hair/headband/torso/greenhoodie, upper active arm and elbow, canvas and scale. Change ACTIVE RIGHT HAND at end of UPPER horizontal arm: STRAIGHTEN wrist so hand/four fingers extend HORIZONTALLY RIGHT in line with forearm, PALM FACING DOWN towards ground, DORSUM upper surface subtly visible from side. Fingertips must extend into existing empty right margin up to x88%, not cropped. No downward bend yet, no wrist lift, fingers naturally together not fist. Lower LEFT helper forearm lowers a little, hand relaxed OPEN below and just left of active fingers, not touching yet. Keep two clear separate hands exactly five digits each, natural sideview overlap; no disconnected hand. Shoulder/upper arm/forearm location unchanged, only wrist straightening and helper preparing. Same square canvas, true transparent alpha, matching crisp pixelart. No text/arrows/headphones. Initial PALM DOWN orientation explicit and visibly flat hand horizontal.
```

### `wrist_flexor_stretch/01.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-470b9ba3-5cf3-4481-b775-09c409776ffd.png`

```text
Use case: precise-object-edit. Supplied transparent pixel-art avatar INTERNAL forearm stretch frame2. Create initial frame1 with PALM UP. Keep exact head/profile/hair/headband/torso/hoodie/sleeve outlines and straight upper arm location, same scale/canvas. Active RIGHT forearm must be SUPINATED, visibly palm facing ceiling, wrist STRAIGHT, hand and four long fingers extending HORIZONTALLY RIGHT at same height as forearm into empty right margin x74–91%. Show the active hand's UPWARD-FACING PALMAR SURFACE with subtle PALM CREASES and palm pad visible in slightly elevated sideview, thumb natural on near edge, five digits total. This is visibly PALM UP, not palm-down dorsal hand, not just sideways flat edge. Fingers relaxed together and straight horizontal, no downward wrist bend yet. Active upper elbow straight. Lower LEFT assisting hand relaxes OPEN BELOW active hand, slightly left of fingertips, NOT touching, ready to hold fingers in next frame. Lower hand may show its back but active upper hand MUST show UPWARD PALM. Preserve all other image pixels, character identity/no headphones, crisp stepped pixelart, genuine transparency and same square canvas. No text/arrows, no extra hands or digits.
```

### `wrist_flexor_stretch/02.png`

Referencia: `/Users/david/.codex/generated_images/01a10d28-4369-7643-868c-c4e4975ee4bd/exec-470b9ba3-5cf3-4481-b775-09c409776ffd.png`

```text
Use case: precise-object-edit. Small targeted anatomy clarification on exact supplied INTERNAL forearm stretch sprite. Edit ONLY the visible ACTIVE UPPER hand pointing DOWN at canvas x69–77%,y51–68%. This surface is the DORSUM, BACK OF HAND. Make it unmistakably dorsal: subtle bony knuckles at roots of four downward fingers and slim extensor-tendon lines on back of hand, plus two small LIGHT PEACH fingernail plates visible on ends of active fingers peeking BELOW the assisting grasp at x71–73%,y68–70%. The helper lower hand may hold a little higher around mid-fingers to leave tiny active fingertips visible. NO PALM CREASES, NO palmar life-line triangles, no fleshy thenar mound on the upper active hand. Keep EXACT arm/sleeve/forearm/wrist silhouette and right downward thumb position, head/profile/body/scale/canvas and all other pixels. Two hands only, normal anatomy, five digits each with natural overlaps, no extra joints. Same crisp pixel art and true transparent alpha. No arrows or text or headphones.
```

## Selección final

- `wrist_flexor_stretch/01.png` ← `exec-e5cbd685-5c3d-4024-9848-6975a8b5d190.png`.
- `wrist_flexor_stretch/02.png` ← `exec-5671f95f-7058-4602-a6c0-d2f932dfda2f.png`.
- `wrist_extensor_stretch/01.png` ← `exec-859361ab-f46c-448c-b74e-985525847fc2.png`.
- `wrist_extensor_stretch/02.png` ← `exec-cbf5cd89-a5ea-4934-ab22-9ee559559888.png`.

## Verificación

28 pruebas dirigidas y compilación de producción correctas. Revisión visual en el visor real de la app, en claro y oscuro; las dos secuencias conservan encuadre y espacio para las manos sin recortes. Capturas locales: `preview-forearm-internal-external-dark.jpg` y `preview-forearm-internal-external-light.jpg`. Pendiente de revisión del usuario.

## Sustituida por la referencia de los dibujos

El usuario aporta una nueva ilustración con interno a la izquierda y externo a la derecha. Véase [selección vigente](exercise-guide-forearm-diagram-correction.md): primer plano de manos y antebrazos en estilo pixel.
