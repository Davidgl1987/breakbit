# Guías de ejercicio · Tanda 9 · Esterilla

16 de octubre de 2026. Generación con **ImageGen integrado**, sin CLI/API. El usuario pide continuar tras aprobar las correcciones de antebrazo. Completados los 42 ejercicios sin material, se inicia el bloque con material con cinco ejercicios de esterilla.

| Ejercicio | Imágenes | Secuencia y cadencia |
| --- | ---: | --- |
| Gato-vaca a cuatro apoyos | 3 | Neutro 1,5 s → redondear 3 s → neutro → abrir 3 s. |
| Postura del niño | 2 | Cuatro apoyos 2,5 s → reposo sobre talones y frente apoyada 40 s. |
| Puente de glúteos | 2 | Cadera baja 2,5 s → cadera elevada 2,5 s. |
| Bird dog | 3 | Centro 1,5 s → brazo derecho/pierna izquierda 3 s → centro → diagonal contraria 3 s. |
| Cobra suave | 2 | Pecho bajo 2,5 s → elevación suave 2,5 s, pelvis y piernas apoyadas. |
| **Tanda** | **12** | Cinco ejercicios. |

## Recursos e integración

- `public/exercises/<id>/01.png`, `02.png` y `03.png` según corresponda: PNG 256×256 RGBA con transparencia real, preparados sobre el lienzo entero por vecino más próximo, sin recortes/recentrados por postura.
- La imagen neutra de cuatro apoyos se reutiliza en gato-vaca, postura del niño y bird dog. Cada ejercicio tiene secuencia, instrucciones y cadencia propias.
- Avatar de fase 5 sin auriculares, con pelo/cinta/ropa aprobados. Esterilla teal como único apoyo; sin habitación ni fondo opaco.
- El visor y sus controles existentes se reutilizan en pausas, actividades y rutinas. El temporizador continúa debajo y es independiente de la alternancia de imágenes.
- Se corrigió una diagonal de bird dog que el generador había repetido. Las dos imágenes seleccionadas cambian el brazo y la pierna contraria, conservando el punto de vista.
- Originales y procedencia: `work/exercise-guides-generation.local/manifest-batch-9.json` y `originals/<id>/`.
- Revisión local: `/work/exercise-guides-review.local/index.html`, tanda 9 abierta por defecto, con todas las posturas y el visor real.

**Acumulado:** 47 ejercicios y 117 imágenes. Los 106 PNG anteriores (105 posturas y avatar maestro) permanecen idénticos. Quedan 35 ejercicios con equipamiento sin guía. Misma rama `codex/exercise-guides-pilot`, sin commit ni publicación; pendiente de revisión visual del usuario.

## Selección final

- `cat_cow_mat/01.png` ← `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`.
- `cat_cow_mat/02.png` ← `exec-4563f02e-7f01-4032-8f7b-31b9d633e3de.png`.
- `cat_cow_mat/03.png` ← `exec-22e5f15a-3d14-4658-9966-6cdceb9162c2.png`.
- `child_pose/02.png` ← `exec-c9f82629-654e-4541-b5d8-3d55d7550687.png`.
- `glute_bridge/01.png` ← `exec-2a53cf73-376e-41fa-b8ac-cdc3d9908f99.png`.
- `glute_bridge/02.png` ← `exec-66f6bb57-2433-49c0-b595-c88c47df687c.png`.
- `cobra_soft/01.png` ← `exec-38d7027b-988b-41c7-86dd-390070f07262.png`.
- `cobra_soft/02.png` ← `exec-93e19b19-78c5-4e2c-ad2c-2cfc8d9d1cda.png`.
- `bird_dog/02.png` ← `exec-47195508-6407-4eba-bc48-a66677826766.png`.
- `bird_dog/03.png` ← `exec-9a70124c-791c-48d6-929d-2807d23712f4.png`.
- `child_pose/01.png` ← `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`.
- `bird_dog/01.png` ← `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`.

## Prompts y correcciones

### `cat_cow_mat/01.png`

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise animation sprite. Reference image exact optimized PHASE5 avatar identity/style: young human red-orange asymmetric spiky hair, brown eyes, WHITE headband with GREEN stripe, GREEN hoodie pale drawstrings, dark navy pants, white/green trainers. NO headphones/beard. Same crisp pixel-art square clusters, stepped dark-brown outlines, limited 3-4 tone shading, no painting/smooth vector/3D. One character one pose, actual transparent alpha SQUARE canvas, no text/arrows/effects/shadows/scenery. Minimal thin muted TEAL rectangular exercise MAT, its whole four corners visible in slightly elevated THREE-QUARTER side perspective. All hair/hands/shoes/mat inside canvas safe5% margins. Full body, natural joints, 2 arms 2 legs, 5 digits per hand with natural overlaps. Camera/scale/mat/contacts fixed in subsequent poses. NEUTRAL ALL-FOURS TABLETOP, facing canvas RIGHT. Mat rectangle spans x6–94%, y74–88%; reserve LEFT x8–25% and RIGHT x72–94% at BODY height for later bird-dog extended limbs. Character body roughly x28–72%, head at x67%,y42%, hands at x67%,y74%, knees x38%,y74%, toes x24%,y76%. Hands flat directly BELOW SHOULDERS, straight vertical arms, elbows not locked; knees directly BELOW HIPS, shins/toes on mat, back horizontal NEUTRAL (not round/arched), head natural in line with spine looking down-right. Three-quarter side view from FRONT-RIGHT slightly above mat, distinguish both wrists/hands and BOTH knees (far limbs slightly offset). Do NOT kneel upright or sit on heels. Preserve same composition in later round/arch and contralateral limb reach. Recognizable same face and hairstyle, no giant head swallowing arms.
```

### `glute_bridge/01.png`

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise animation sprite. Reference image exact optimized PHASE5 avatar identity/style: young human red-orange asymmetric spiky hair, brown eyes, WHITE headband with GREEN stripe, GREEN hoodie pale drawstrings, dark navy pants, white/green trainers. NO headphones/beard. Same crisp pixel-art square clusters, stepped dark-brown outlines, limited 3-4 tone shading, no painting/smooth vector/3D. One character one pose, actual transparent alpha SQUARE canvas, no text/arrows/effects/shadows/scenery. Minimal thin muted TEAL rectangular exercise MAT, its whole four corners visible in slightly elevated THREE-QUARTER side perspective. All hair/hands/shoes/mat inside canvas safe5% margins. Full body, natural joints, 2 arms 2 legs, 5 digits per hand with natural overlaps. Camera/scale/mat/contacts fixed in subsequent poses. GLUTE BRIDGE start resting: character LYING SUPINE on mat, HEAD at LEFT x19%, feet RIGHT x77%, mat x7–93%,y72–86%. Side view slightly from near/front side above mat. Head/neck/shoulders/upper back AND HIPS rest on mat y74%; face looking UP naturally, hair unobstructed. BOTH KNEES bent about90degrees, knees above x60%,y48%, BOTH FEET soles FLAT on mat x77%,y76%, knees hip-width apart and both visible staggered minimally by depth, no floating foot. Arms relaxed straight alongside torso on mat, palms DOWN near hips x47%,y74%. Hips LOW on mat at x47%,y74%, ready to lift in next pose. Keep head/shoulder/feet contact points and mat precisely fixed later. Show neutral resting body not already bridge. No pillow or furniture.
```

### `cobra_soft/01.png`

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise animation sprite. Reference image exact optimized PHASE5 avatar identity/style: young human red-orange asymmetric spiky hair, brown eyes, WHITE headband with GREEN stripe, GREEN hoodie pale drawstrings, dark navy pants, white/green trainers. NO headphones/beard. Same crisp pixel-art square clusters, stepped dark-brown outlines, limited 3-4 tone shading, no painting/smooth vector/3D. One character one pose, actual transparent alpha SQUARE canvas, no text/arrows/effects/shadows/scenery. Minimal thin muted TEAL rectangular exercise MAT, its whole four corners visible in slightly elevated THREE-QUARTER side perspective. All hair/hands/shoes/mat inside canvas safe5% margins. Full body, natural joints, 2 arms 2 legs, 5 digits per hand with natural overlaps. Camera/scale/mat/contacts fixed in subsequent poses. GENTLE COBRA start prone: LYING FACE DOWN on mat, HEAD at RIGHT x78%, feet LEFT x18%, mat x7–93%,y73–86%. Three-quarter SIDE facing RIGHT, slight elevation to distinguish near/far arms. Whole BODY LONG on mat horizontal, pelvis/thighs/shins/tops of sneakers rest on mat, legs straight comfortably hip width, toes point back LEFT, not kneeling. Hands PALMS FLAT directly NEXT TO CHEST at x64%,y76%, elbows BENT and tucked near sides pointing back LEFT. Chest LOW near mat, head just naturally lifted enough to see face looking down-right, neck neutral, not forehead crushed on floor. Reserve upper space for modest later chest lift. Both hands truly contact mat, fingers point forward RIGHT, no hovering fists. No straight-arm push-up/plank. Mat, pelvis and legs stay exactly fixed later. Hoodie hood folded on upper back no headphones.
```

### `cat_cow_mat/02.png`

Referencias: `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Exact source NEUTRAL all-fours avatar is edit target. CAT pose: round upper and lower BACK UPWARD into gentle convex arch, draw belly inward, pelvis gently tucks, head follows neck and lowers so gaze looks toward belly button, chin tucked. Keep BOTH HANDS and BOTH KNEES exactly planted at original mat contacts, arms straight below shoulders and thighs vertical below hips; elbows do not bend, hips do not sit backward toward heels. Change spine/torso/head tilt only. Hoodie contour arches up, not flat/concave, shoulders relaxed. Preserve exact same avatar red spiky hair/white-green headband/green hoodie/darkpants/whitegreen shoes, NO headphones. Same crisp pixel art, transparent square canvas. Keep MAT every corner/location/size/pixels unchanged, no zoom/camera change or recentering. ONE pose only, no ghost poses/arrows/text. Two natural arms/hands and legs, no extra joints.
```

### `cat_cow_mat/03.png`

Referencias: `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Exact source NEUTRAL all-fours avatar is edit target. COW pose: gently lower BELLY to make mild CONCAVE back curve, open chest forward, pelvis tips slightly, head looks naturally forward RIGHT with neck comfortable, not throwing head backward. Keep BOTH HANDS/KNEES exactly planted at original mat contacts, arms straight vertical below shoulders, hips over knees, elbows not bent, not sit back. Moderate visible change opposite rounded cat, no extreme swayback. Preserve exact same avatar red spiky hair/white-green headband/green hoodie/darkpants/whitegreen shoes, NO headphones. Same crisp pixel art, transparent square canvas. Keep MAT every corner/location/size/pixels unchanged, no zoom/camera change or recentering. ONE pose only, no ghost poses/arrows/text. Two natural arms/hands and legs, no extra joints.
```

### `child_pose/02.png`

Referencias: `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Exact all-fours avatar source is starting pose. CHILD'S POSE final: move hips BACK and DOWN onto heels at canvas LEFT, fold torso forward down over thighs, lengthen BOTH ARMS FORWARD RIGHT with elbows extended and palms flat on mat; active hands stay at SAME original mat positions. FOREHEAD RESTS on mat between/near arms, face directed down, head naturally rotated only enough to avoid hair obscuring contact, no neck twist. Knees stay at original positions, shins/feet rest on mat unchanged, pelvis sits close to heels rather than raised above knees. Hands elongated reach from low shoulders, arms inside original canvas, no floating chest/head/forehead, no upright kneel or downward dog with hips high. Preserve exact same avatar red spiky hair/white-green headband/green hoodie/darkpants/whitegreen shoes, NO headphones. Same crisp pixel art, transparent square canvas. Keep MAT every corner/location/size/pixels unchanged, no zoom/camera change or recentering. ONE pose only, no ghost poses/arrows/text. Two natural arms/hands and legs, no extra joints.
```

### `glute_bridge/02.png`

Referencias: `exec-2a53cf73-376e-41fa-b8ac-cdc3d9908f99.png`

```text
Use case: precise-object-edit. Exact resting SUPINE glute bridge sprite target. Lift ONLY PELVIS and trunk into controlled BRIDGE so shoulder-hip-knee form one gentle straight diagonal line, HIPS rise to around knee height. Head/neck/SHOULDERS stay on mat exact original spots, BOTH FEET stay soles FLAT in original places, arms/palms stay resting beside torso. Knees bent, hip width, do not spread or fuse legs. No big arch in low back, no neck bridge, no floating shoulders/heels. Preserve exact mat pixels/camera/scale/canvas, head/hair/headband identity/hoodie/pants/shoes, no headphones. Only pelvis/torso and necessary upper leg angles move, full silhouette inside original square canvas. Same crisp pixel art limited colors and actual transparency. No text/arrows/effects.
```

### `cobra_soft/02.png`

Referencias: `exec-7908c84b-51ad-4609-898a-dd3a88c8d24f.png`

```text
Use case: precise-object-edit. Exact prone starting sprite target. GENTLE LOW COBRA: modestly lift CHEST forward and UP through gentle spine extension, hands still palms flat beside lower chest in EXACT same original mat positions. Elbows remain BENT/tucked along ribs, shoulders down, chest rises about one hand-height above original. Neck follows spine, gaze gently forward RIGHT, do not throw head backward. PELVIS, thighs, legs and tops of sneakers stay on mat at EXACT same pixels, no knee bending, no upward dog with pelvis floating, no straight-arm full pushup. Keep mat every corner, camera/scale/canvas fixed, preserve red hair/headband and face size/green hoodie/darkpants/shoes/noheadphones. Crisp pixel art, true alpha, no text/arrows/effects.
```

### `bird_dog/02.png`

Referencias: `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Exact all-fours neutral avatar target. BIRD DOG diagonal1, three-quarter side facing RIGHT: extend NEAR/RIGHT ARM straight FORWARD to canvas RIGHT at SHOULDER HEIGHT with fingers relaxed together. Extend OPPOSITE FAR/LEFT LEG straight BACK to canvas LEFT at HIP HEIGHT, knee straight but relaxed, shoe foot neutral. SUPPORT on FAR/LEFT HAND and NEAR/RIGHT KNEE, both stay EXACT original mat contact points, body neutral horizontal and hips level. Lifted arm and leg must be OPPOSITE SIDES, not same-side. Near right shoulder goes to extended arm; near right thigh remains vertical to planted knee. Far left shoulder to vertical planted left hand visible below; far left leg extends behind toward LEFT. EXACTLY2arms2legs; no extra limb/third hand/duplicated shoe. All raised fingertips/shoe INSIDE5%canvas margins, reserve reach space, do not change camera or zoom. Head same size, naturally looks down-right along neutral neck, abdomen steady, no swayback/rotation. Preserve mat every corner/pixels, avatar identity/headband/greenhoodie/darkpants/whitegreen shoes/noheadphones, same crisp pixelart true alpha. No text/arrows/ghosts.
```

### `bird_dog/03.png`

Referencias: `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Exact all-fours neutral avatar target. BIRD DOG diagonal2, three-quarter side facing RIGHT: extend FAR/LEFT ARM straight FORWARD to canvas RIGHT at SHOULDER HEIGHT, fingers relaxed together. Extend OPPOSITE NEAR/RIGHT LEG straight BACK to canvas LEFT at HIP HEIGHT, knee straight but relaxed, foot neutral. SUPPORT on NEAR/RIGHT HAND and FAR/LEFT KNEE, keeping exact original mat contacts. Near right green sleeve descends vertically to planted right hand. Near right pant leg extends back left clearly in foreground; far left thigh stays vertical to planted left knee. Far left arm reaches forward past near sleeve, visibly separate, not a second near arm. Torso neutral horizontal, hips level, head looks down-right neck aligned. Opposite arm/leg, not same-side; exactly2arms2legs with no spare hand/knee/shoe. All fingertips/shoes INSIDE original canvas5%margin. Preserve exact mat/camera/scale/headsize/redhair/headband/greenhoodie/darkpants/shoes and true alpha, noheadphones. Same crisp pixelart. No zoom/text/arrows/ghosts.
```

### `bird_dog/02.png`

Referencias: `exec-3104bcfa-4eeb-4a82-aade-e392fa95f539.png`, `exec-2abaa630-a100-461a-8c84-66a137a6d0cd.png`

```text
Use case: precise-object-edit. Input1 currently has NEAR HAND planted on mat and NEAR LEG extended back LEFT. It illustrates only one diagonal. Create OPPOSITE DIAGONAL with same right-facing three-quarter camera (do NOT mirror whole image). Input2 neutral reference clarifies both limb roots and two planted hands. Required visible changes:
1. NEAR ARM, the green sleeve closest viewer descending at canvas x60%, MUST LIFT off mat and reach horizontally FORWARD RIGHT across FRONT of chest, from near shoulder at x57%,y52% to near hand at x94%,y52%. Its forearm passes IN FRONT of chest below face, visibly foreground.
2. FAR ARM must now be STRAIGHT VERTICAL supporting body, far palm planted at x79%,y81% in original FAR/RIGHTMOST hand contact. No hand at original near/LEFTMOST palm x64%,y86%; that hand is raised.
3. NEAR LEG closest viewer must now be BENT KNEELING, thigh vertical from foreground hip x39%,y56% to planted knee x39%,y80%, shin backward-left to shoe x22%,y79%.
4. FAR LEG behind torso EXTENDS straight BACK LEFT at hip height to far shoe x6%,y52%, visible behind near kneeling thigh.
This is NEAR ARM+FAR LEG lifted and FAR HAND+NEAR KNEE supporting, opposite of input1. Exactly two hands and two feet, one planted hand and one knee on mat. Back horizontal neutral, no torso roll. Face/head/hair/headband/hoodie/pants/whitegreen trainers/noheadphones same identity, headsize/camera/canvas/mat identical. ALL fingertips inside94% right edge, no cropped hand; raised far shoe inside5%left edge. Crisp pixel art true alpha, no text/arrows/ghosts/extra limbs.
```


## Corrección de la postura inicial de cobra

Se baja pecho y cabeza hasta la esterilla para distinguir el reposo inicial de la elevación suave. Se mantiene la segunda postura, el lienzo y la escala.

```text
Use case: precise-object-edit. Source is gentle raised COBRA pose; create unmistakable PRONE REST initial pose before lifting. LOWER CHEST all the way ONTO mat, sternum/belly supported, torso nearly straight horizontal from pelvis to shoulder. LOWER HEAD with neck aligned to low spine so face points DOWN toward mat, forehead/nose close to mat, hair/head moves DOWN around15%canvas. Do not retain upright face looking forward: head must turn downward naturally WITH whole upper trunk lowering, not bend neck alone at90degrees. Both hands stay PALMS flat at exact source positions beside chest, elbows deeply bent tucked along ribs, body rests between hands. No propped-up shoulders/chest, no sphinx, no arm weightbearing yet. Keep pelvis/legs/shoes and their exact source pixels, mat allpixels, fixed camera/canvas/scale, original head SIZE/identity redhair/whitegreen headband/greenhoodie/darkpants and noheadphones. Need clear LOW resting start distinct from later lifted chest. Same crisp pixelart genuine transparent alpha, no extra limbs/text/arrows/ghosts.
```

## Verificación final

28 pruebas dirigidas, lint del registro y compilación con prefijo `/breakbit/` correctos. Transparencia/lienzos validados por el importador. Los 106 PNG anteriores siguen idénticos. Revisado en claro, oscuro y móvil a 390 px sin desbordamiento horizontal, con todas las imágenes cargadas. Capturas en `work/exercise-guides-generation.local/preview-batch-9-{dark,light,mobile}.jpg`.

## Corrección posterior de bird dog

La revisión del usuario detecta que las piernas no cambiaban de forma adecuada. Se sustituyen ambas diagonales según [esta corrección](exercise-guide-bird-dog-correction.md), que prevalece sobre las posturas seleccionadas inicialmente en la tanda 9.
