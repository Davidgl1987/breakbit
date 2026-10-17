# Enhebrar la aguja · segunda referencia

17 de octubre de 2026. **ImageGen integrado**, misma rama, sin commit. Sustituye la selección anterior de la postura 02.

La nueva referencia del usuario es `codex-clipboard-446cc0f4-6c4e-4fff-9782-b73cbbbc2f9f.png`. Se utiliza su ilustración inferior. Se elimina el antebrazo que hacía de almohada: la cabeza contacta directamente con la esterilla, y el brazo de trabajo cruza bajo el pecho hacia el lado opuesto. Vista posterior, con cabeza a la derecha. Se recuperan las posturas 01/03 anteriores hacia la derecha para conservar el sentido del movimiento. Selección pendiente de revisión del usuario.

Producción: `public/exercises/thread_the_needle/{01,02,03}.png`. Originales y variantes conservados en `work/exercise-guides-generation.local/`.

## Prompts e iteraciones

Verificado: lienzos 1254×1254 RGBA con transparencia real; importación uniforme a 256×256. Tres PNG de esta guía sustituidos; otros 128 PNG intactos. Compilación con prefijo `/breakbit/` y comprobación de diferencias correctas. Captura de revisión: `work/exercise-guides-generation.local/preview-needle-second-reference.jpg`.

### Iteración 1 · descartada/intermedia

Referencias: `codex-clipboard-446cc0f4-6c4e-4fff-9782-b73cbbbc2f9f.png`, `avatar-master.png`

```text
Use case: style-transfer. Replace ONLY the person in the LOWER drawing of Image1 with the exact male pixel-art avatar in Image2. This lower pose is the sole geometry authority. Copy its silhouette and ALL joint positions faithfully; do not mirror, rotate, change viewpoint or improvise. Single LOWER pose only; omit upper figure, arrows and all lettering. Head on RIGHT near ground, knees at LEFT under high pelvis, shins/feet pointing LEFT. Torso slopes down to right. Working shoulder and SIDE OF HEAD rest on mat; that arm is straight and threads UNDER chest ACROSS BODY to the far side, as in lower drawing. Supporting arm folds beside head with palm flat on floor. IMPORTANT head rests directly on mat beside shoulder, NOT on bent forearm, not on hand, not on pillow; no forearm running under face/chin. Preserve exact limb crossings of lower source and grounded hands. Male avatar red-orange spiky hair, white headband with green stripe, green hoodie rolled sleeves, navy pants, white-green sneakers. No headphones. Crisp square pixel clusters, stepped dark outline, no blur. Transparent square RGBA canvas, entire full body within canvas with margins, small flat teal mat under contact points. ONE clear isolated figure only. Pixel character design from Image2, bodily pose exactly from lower Image1. No text, labels, arrows, glow or background.
```

### Iteración 2 · descartada/intermedia

Referencias: `exec-1be70cd3-6a59-45d5-87b6-a5f357ee7ccd.png`, `codex-clipboard-446cc0f4-6c4e-4fff-9782-b73cbbbc2f9f.png`

```text
Use case: precise-object-edit. CORRECT the arms of Image1, preserving avatar legs, hips, torso, hair, clothes, mat, square canvas and transparency. Compare ONLY LOWER pose in Image2. Image1 WRONG: horizontal bare forearm runs immediately underneath entire cheek like a pillow. REMOVE this forearm under cheek COMPLETELY. The right side of face/temple MUST touch teal mat DIRECTLY, no skin/arm/hand between face and mat. Smaller head if needed for correct pose. WORKING ARM: from lowered shoulder pass STRAIGHT UNDER CHEST across body AWAY FROM HEAD toward BACK of mat, extended elbow, visible green upper sleeve then skin and palm-up hand emerging on FAR SIDE at center of mat, behind supporting arm, well to LEFT of face. Not curled toward head. SUPPPORT ARM: one other arm bends naturally with PALM flat in foreground near chest, clearly separate from face. Exactly two arms/two hands. No arm lies beneath head. The key change is bare horizontal pillow-forearm beneath cheek replaced by empty transparent gap/teal mat, and that arm extended straight underneath chest toward opposite side with hand away from head. Reproduce lower Image2 wrist/elbow crossing, not sleeping posture. Keep other image elements and pixel style unchanged, no other pose, no arrows/text/glow. Full figure on transparent SQUARE PNG.
```

### Iteración 3 · descartada/intermedia

Referencias: `codex-clipboard-446cc0f4-6c4e-4fff-9782-b73cbbbc2f9f.png`

```text
Use case: style-transfer. Reproduce the LOWER person drawing ONLY, exactly the same pose, camera angle, body proportions and limb placement. Merely change this person to a red spiky-haired young man wearing a white/green headband, green hoodie, navy trousers and white/green sneakers, no headphones. Crisp pixel-art sprite. Do not change the anatomical drawing. Maintain BACK/REAR THREE-QUARTER view from the source: back of hoodie visible and head small, NOT huge smiling front-facing head. Preserve the exact support hand location beside the head and the other arm extended across underneath the chest toward the opposite side. Head touches floor directly, NOT an arm used as pillow. No hand near feet/hips. Same high hips, knees and feet to LEFT, head to RIGHT. Copy the LOWER person's pose literally. Output just this one person on a minimal teal mat, full figure on square transparent PNG with margins. Remove all arrows, text, upper figure and decorative elements. Pose/camera fidelity more important than recognisable face.
```

### Iteración 4 · seleccionada

Referencias: `exec-008bf231-6d7f-494e-a61e-ffecf8948b37.png`

```text
Precise-object-edit. Preserve this figure, camera, full square canvas, size, grounded head DIRECTLY touching mat, bent supporting arm foreground, knees hips shoes mat and outfit unchanged. Clarify the ONE currently hidden WORKING ARM in thread-the-needle: it passes from lowered far shoulder beneath chest across to far side, elbow STRAIGHT. Show its straight forearm emerging in BACKGROUND to the RIGHT of upper torso, with palm-UP hand extending beyond head toward upper-right of mat. Extend mat slightly on right only if required to fit fingertips. Arm is behind/above the head in image depth, never underneath cheek or between head and mat. Head remains directly on mat, no pillow. Exactly two arms: current foreground bent support arm unchanged, second straight threaded arm newly visible on far side. No extra limbs, no hand behind hips, no changed pose, no text/arrows/background/glow. Keep pixel art and genuine transparency.
```


Selección vigente de enhebrar la aguja: [dos imágenes aprobadas](exercise-guide-needle-approved.md). Sustituye todas las versiones anteriores. La tanda 10 queda con 12 posturas.
