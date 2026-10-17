# Guías de ejercicio · Tanda 10 · Completar esterilla

16 de octubre de 2026. **ImageGen integrado**, sin CLI/API. El usuario pide corregir el cambio de pierna del bird dog y continuar. Esta tanda integra cinco ejercicios y catorce imágenes, además de sustituir las dos diagonales del bird dog.

## Storyboards

| Ejercicio | Imágenes | Secuencia y duración visual |
| --- | ---: | --- |
| Enhebrar la aguja | 3 | Cuatro apoyos 1,5 s → alcance bajo brazo 3 s → apertura al techo 3 s. El texto indica repetir y cambiar de lado. |
| Dead bug | 3 | Centro 1,5 s → brazo derecho/pierna izquierda 3 s → centro → diagonal contraria 3 s. |
| Rotación lumbar tumbado | 3 | Centro 1,5 s → rodillas juntas a un lado 3 s → centro → otro lado 3 s. |
| Figura 4 | 3 | Cruce de tobillo 2,5 s → acercar muslo 25 s → cambiar cruce y muslo 25 s. |
| Superman | 2 | Reposo con brazos al frente 2,5 s → elevación suave 1,5 s. |
| **Tanda** | **14** | Cinco ejercicios. |

- Mismo avatar optimizado sin auriculares, misma ropa y estilo pixel, esterilla teal. Planos estables entre las posturas de cada ejercicio; sin fondo opaco ni flechas/texto en los PNG.
- Preparación de recursos a 256×256 RGBA del lienzo entero, sin recortes/recentrados individuales. Cuatro apoyos se reutiliza desde gato-vaca en el primer frame de enhebrar la aguja.
- Los pasos siguen el catálogo. El visor compartido conserva pausa y avance manual; temporizador independiente debajo.
- Se revisan y corrigen variantes que repetían un brazo, no diferenciaban el giro lumbar o no conservaban el apoyo del brazo en el alcance.
- [Corrección de las piernas de bird dog](exercise-guide-bird-dog-correction.md) prevalece sobre la tanda 9.

**Acumulado: 52/82 ejercicios y 131 imágenes.** Los 42 sin material y los 10 de esterilla tienen guía; quedan 30 ejercicios con otro material. Misma rama `codex/exercise-guides-pilot`, sin commit ni publicación, pendiente de revisión del usuario.

## Recursos finales

- `public/exercises/thread_the_needle/02.png` ← `exec-f9598574-df00-48e7-b534-d5b7e548714d.png`.
- `public/exercises/thread_the_needle/03.png` ← `exec-57b1ff51-76a3-47cf-b516-3ecd663b3644.png`.
- `public/exercises/dead_bug/01.png` ← `exec-2e1fbbba-8616-485a-aa52-bbf880c20397.png`.
- `public/exercises/dead_bug/02.png` ← `exec-e57acde1-15c9-4ce3-bcfa-d0b3924ad595.png`.
- `public/exercises/dead_bug/03.png` ← `exec-1f3408e6-68de-41d7-9979-0d66c974ded7.png`.
- `public/exercises/supine_lumbar_rotation/01.png` ← `exec-131ccb75-f9aa-4c33-bcac-0e729e74bfcc.png`.
- `public/exercises/supine_lumbar_rotation/02.png` ← `exec-fd0e13db-0913-43b1-b299-7e0ef2751e29.png`.
- `public/exercises/supine_lumbar_rotation/03.png` ← `exec-f88cbdd3-dacc-48e5-9c32-1bf574d3c87c.png`.
- `public/exercises/figure_four_stretch/01.png` ← `exec-1877a894-0788-452f-9b54-8c5c8ee6843a.png`.
- `public/exercises/figure_four_stretch/02.png` ← `exec-c94be412-cf4d-4877-b460-a7f76169b2d1.png`.
- `public/exercises/figure_four_stretch/03.png` ← `exec-e33b383f-20d1-4962-8140-dc77f1ecf28a.png`.
- `public/exercises/superman/01.png` ← `exec-9cedfc57-ab53-44ab-91f8-46f1546e4377.png`.
- `public/exercises/superman/02.png` ← `exec-4b55cc43-1e14-4cc7-ab07-a0a0caacfeaa.png`.
- `public/exercises/thread_the_needle/01.png` ← `01.png`.

## Prompts y cadena de edición

### `dead_bug/01.png`

Referencias: `avatar-master.png`, `01.png`

```text
Use case: scientific-educational. Exercise guide sprite in same approved optimized phase5 avatar pixel art: young human asymmetric spiky red-orange hair, brown eyes, white headband with GREEN stripe, GREEN hoodie with pale drawstrings, dark navy pants and white/green sneakers. No headphones/beard. One pose, two arms/two legs, normal five digits per hand with natural occlusion. Chunky crisp square pixel clusters, dark-brown stepped outline, limited discrete shading; no smooth vector/painting/3D. Minimal TEAL flat exercise mat, square genuine TRANSPARENT RGBA background. All hair/fingertips/shoes/mat inside5%canvas margins. No text/arrows/scenery/props/shadows. Camera/canvas/scale and mat must remain fixed in later poses. DEAD BUG initial neutral tabletop SUPINE: lie on BACK on mat, HEAD at canvas LEFT x22%, pelvis center x50%, legs toward RIGHT. Camera THREE-QUARTER HIGH SIDE (look down around45degrees) to distinguish left/right limbs. Back/head/shoulders/pelvis resting flat on mat. Both arms straight pointing UP toward ceiling above shoulders, hands separated naturally. BOTH HIPS and KNEES BENT90degrees, thighs vertical above hips, shins horizontal parallel mat toward RIGHT, BOTH FEET hovering off mat hip-width apart. Show two distinct thighs, shins, sneakers in depth, no fused legs. Knees NOT touching chest, feet NOT on mat. Leave room LEFT of head for arm lowering toward head later and RIGHT of feet for one leg to extend later. Body spread x20–75%, mat x6–94%,y62–85%; whole pose occupies middlecanvas not cropped. First input identity/style; second support/mat palette only, DO NOT copy its planted feet/bent-knee pose.
```

### `supine_lumbar_rotation/01.png`

Referencias: `avatar-master.png`, `01.png`

```text
Use case: scientific-educational. Exercise guide sprite in same approved optimized phase5 avatar pixel art: young human asymmetric spiky red-orange hair, brown eyes, white headband with GREEN stripe, GREEN hoodie with pale drawstrings, dark navy pants and white/green sneakers. No headphones/beard. One pose, two arms/two legs, normal five digits per hand with natural occlusion. Chunky crisp square pixel clusters, dark-brown stepped outline, limited discrete shading; no smooth vector/painting/3D. Minimal TEAL flat exercise mat, square genuine TRANSPARENT RGBA background. All hair/fingertips/shoes/mat inside5%canvas margins. No text/arrows/scenery/props/shadows. Camera/canvas/scale and mat must remain fixed in later poses. SUPINE LUMBAR ROTATION neutral: body lying BACK on mat, HEAD toward canvas UPPER LEFT x23%, hips x51%, bent knees toward LOWER RIGHT x67%. Camera elevated THREE-QUARTER near-OVERHEAD view (about55degrees down) to show BOTH shoulders, both knees and room to move joined knees toward foreground/background without camera change. Arms spread sideways into comfortable T on MAT, palms up, arms not above ceiling. BOTH KNEES bent around90degrees and held TOGETHER upright, BOTH FEET together planted on mat to RIGHT x77%. Shoulders/head/back/pelvis rest on mat, face upward. Distinct two knees and shoes side by side, legs connected naturally, no spread stance. Mat flat teal rectangle x7–93%, y40–90%, same perspective as body, large enough for T arms and later lateral knee movement. Need SPACE BOTH SIDES of knees, no body cutoffs. Firstinput exact avatar identity/style, second matcolor/wardrobe only.
```

### `figure_four_stretch/01.png`

Referencias: `avatar-master.png`, `01.png`

```text
Use case: scientific-educational. Exercise guide sprite in same approved optimized phase5 avatar pixel art: young human asymmetric spiky red-orange hair, brown eyes, white headband with GREEN stripe, GREEN hoodie with pale drawstrings, dark navy pants and white/green sneakers. No headphones/beard. One pose, two arms/two legs, normal five digits per hand with natural occlusion. Chunky crisp square pixel clusters, dark-brown stepped outline, limited discrete shading; no smooth vector/painting/3D. Minimal TEAL flat exercise mat, square genuine TRANSPARENT RGBA background. All hair/fingertips/shoes/mat inside5%canvas margins. No text/arrows/scenery/props/shadows. Camera/canvas/scale and mat must remain fixed in later poses. FIGURE FOUR GLUTE STRETCH preparation, lying BACK on mat. HEAD at LEFT x23%, hips x50%, feet toward RIGHT. Camera elevated THREE-QUARTER SIDE slightly from feet (about45degrees down) to clearly SEE figure4 crossing and which ankle sits on which thigh. RIGHT supporting leg bent, RIGHT FOOT sole FLAT on mat x78%,y75%, RIGHT KNEE up x65%,y52%. LEFT ANKLE rests across RIGHT LOWER THIGH immediately above right knee, not foot sole balanced on kneecap. LEFT KNEE opens OUT to side toward foreground so left leg makes recognizable figure4 shape. Left sneaker clearly sits just ABOVE right knee, left knee bent outward away from center, no crossed straight legs/pretzel. Two SHOES total: left ankle atop right thigh and right sole planted. Hands relaxed beside torso ready to reach behind right thigh later. Head/back/shoulders/pelvis supported on mat. Firstinput avataridentity/style, second matcolor/wardrobe only. All crossed knees/shoes/hands readable, no fused limbs.
```

### `superman/01.png`

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite in same approved optimized phase5 avatar pixel art: young human asymmetric spiky red-orange hair, brown eyes, white headband with GREEN stripe, GREEN hoodie with pale drawstrings, dark navy pants and white/green sneakers. No headphones/beard. One pose, two arms/two legs, normal five digits per hand with natural occlusion. Chunky crisp square pixel clusters, dark-brown stepped outline, limited discrete shading; no smooth vector/painting/3D. Minimal TEAL flat exercise mat, square genuine TRANSPARENT RGBA background. All hair/fingertips/shoes/mat inside5%canvas margins. No text/arrows/scenery/props/shadows. Camera/canvas/scale and mat must remain fixed in later poses. SUPERMAN starting PRONE REST: full avatar lying FACE DOWN long on teal mat, FEET at LEFT x13%, pelvis x39%, shoulders x57%, HEAD x65%, BOTH ARMS EXTENDED FORWARD RIGHT with elbows straight, relaxed open palms/fingertips on mat at x89%. Slight three-quarter SIDE view facing RIGHT, camera above mat just enough to distinguish both arms/hands and legs. Arms forward beyond head, NOT bent next to chest. Legs straight hip-width, both shoes/tops resting on mat behind. Chest/pelvis/thighs/head low resting on mat, neck neutral looking DOWN not head up. Mat rectangle x5–95%,y70–85%; entire body/hair and fingertips INSIDE margins. Reserve upper space to lift arms/chest/legs a few centimeters next frame with SAME scale. No floating limbs yet, no upward dog, no high arch, no bent knees. Reference exact identity/style only; match optimized avatar.
```

### `dead_bug/02.png`

Referencias: `exec-2e1fbbba-8616-485a-aa52-bbf880c20397.png`

```text
Use case: precise-object-edit. DEAD BUG diagonal1. Keep head/shoulders/back/pelvis fully resting on mat at original positions. LOWER NEAR RIGHT ARM (the leftmost upright arm in source x35%) backward toward HEAD at canvas LEFT until hovering just above mat, fingers reach x7%,y62%. FAR LEFT ARM remains upright at x48% exactly source. Extend OPPOSITE FAR LEFT LEG slowly toward RIGHT away from body, knee straight and heel hovering above mat in BACKGROUND, far shoe at x91%,y68%. NEAR RIGHT LEG must remain TABLETOP knee bent90degrees, thigh vertical and shin horizontal, near shoe at x83%,y58%, in FRONT of root of far straight thigh. Only near arm and far opposite leg extend. Far straight thigh originates behind near bent thigh; do not stretch foreground near leg. Exactly 2arms2legs; back flat, no head/hip lift. All fingers/shoes inside canvas5%margins. Keep head identity/hair/white-green headband/green hoodie/navy pants/white-green shoes, no headphones. Same fixed camera, scale, square canvas and exact teal mat. Crisp pixelart with real transparency, no text/arrows/extra limbs/ghosts.
```

### `dead_bug/03.png`

Referencias: `exec-2e1fbbba-8616-485a-aa52-bbf880c20397.png`

```text
Use case: precise-object-edit. DEAD BUG opposite diagonal2. Keep head/shoulders/back/pelvis fully resting on mat source positions. LOWER FAR LEFT ARM (rightmost upright arm in source x48%) backward toward HEAD at LEFT, reaching x9%,y55% in background above head. NEAR RIGHT ARM stays upright at x35%, source pose; foreground palm high. Extend OPPOSITE NEAR RIGHT LEG toward RIGHT, knee straight, heel hovering just above mat in FOREGROUND at x93%,y79%. Clearly foreground extended thigh from NEAR hip overlaps root of FAR LEFT bent thigh; FAR LEFT LEG remains TABLETOP with hip/knee90degrees, far shoe x79%,y49%. Do not retain same bent foreground leg as diagonal1. Need near straight leg+far bent leg vs near bent leg+far straight leg, visibly different depth and shoe positions. Exactly 2arms2legs, no extra foot/hand. Back flat, no head/hiplift. All digits/shoes inside5%margins. Keep head identity/hair/white-green headband/green hoodie/navy pants/white-green shoes, no headphones. Same fixed camera, scale, square canvas and exact teal mat. Crisp pixelart with real transparency, no text/arrows/extra limbs/ghosts.
```

### `thread_the_needle/02.png`

Referencias: `01.png`

```text
Use case: precise-object-edit. THREAD THE NEEDLE from exact all-fours pose, near RIGHT arm threads under far LEFT support. LEFT hand remains planted at far/rightmost original contact x79%,y81%, left elbow bends slightly to lower torso. RIGHT shoulder lowers to mat, RIGHT ARM slides UNDER chest/LEFT ARM toward FAR side at canvas upper-right, palm facing UP, clear single forearm extending diagonally from low near right shoulder to fingertips x89%,y73% beyond left supporting hand. RIGHT temple/side head rests near mat next to right upper arm, face angled side not twisted neck. Both KNEES remain planted under hips and exact shins/shoes contacts fixed; HIPS stay ABOVE KNEES, NOT sitting on heels like child pose. Chest rotates gently into reach. Exactly two hands visible: one support palm down, one threaded palm up, clear underpass not detached arm or body lying flat. Keep head identity/hair/white-green headband/green hoodie/navy pants/white-green shoes, no headphones. Same fixed camera, scale, square canvas and exact teal mat. Crisp pixelart with real transparency, no text/arrows/extra limbs/ghosts.
```

### `thread_the_needle/03.png`

Referencias: `01.png`

```text
Use case: precise-object-edit. THREAD THE NEEDLE opening phase. Both knees stay planted at exact source contacts under hips. FAR LEFT HAND stays planted original far/rightmost palm x79%,y81%, left arm straight support below shoulder. Rotate chest toward viewer/up and lift NEAR RIGHT ARM toward CEILING, elbow straight but relaxed, fingers upward with hand around x58%,y18%, attached naturally to near shoulder. Shoulder/arm form comfortable open thoracic rotation, hips level and above knees, no sitting back, no pelvis twisting. Head follows turn gently with eyes looking up toward raised hand, neck not tilted unnaturally. Remaining two legs/shoes fixed original pixels. Exactly 2arms2hands, one mat support/one raised; no leftover near hand on mat. Do not mirror camera. Keep head identity/hair/white-green headband/green hoodie/navy pants/white-green shoes, no headphones. Same fixed camera, scale, square canvas and exact teal mat. Crisp pixelart with real transparency, no text/arrows/extra limbs/ghosts.
```

### `supine_lumbar_rotation/02.png`

Referencias: `exec-131ccb75-f9aa-4c33-bcac-0e729e74bfcc.png`

```text
Use case: precise-object-edit. SUPINE knee rolls toward NEAR/RIGHT side. Keep head, BOTH SHOULDERS and BOTH ARMS/palms resting exactly on mat in same T. Roll ONLY pelvis and BOTH bent KNEES TOGETHER toward foreground/LOWER LEFT relative to body: knees move from upright center to x57%,y77% close to mat, near side of hips. Both knees still bent together, lower legs pivot from feet with soles rolling onto edges, feet stay close together at original lower-right location. One joined pair of knees rotates AS UNIT across hip line, NOT separate legs or ankle crossing. Pelvis turns a little, upper back stays supported, shoulders must not lift or torso become side-lying. Gentle comfortable twist, no forcing knees through mat. Visible clear foreground leg roll versus neutral. Keep exact same head/hair/headband/greenhoodie/darkpants/shoes identity, NOheadphones. Camera/canvas/scale and MAT pixels unchanged, genuine transparent alpha, same crisp stepped pixelart. No text/arrows/extra limbs/ghosts.
```

### `supine_lumbar_rotation/03.png`

Referencias: `exec-131ccb75-f9aa-4c33-bcac-0e729e74bfcc.png`

```text
Use case: precise-object-edit. SUPINE knee rolls toward FAR/LEFT side, OPPOSITE foreground side. Head/shoulders/BOTH ARMS and palms remain EXACT mat contacts in T. Roll ONLY pelvis and BOTH BENT KNEES TOGETHER toward BACKGROUND/UPPER RIGHT relative to body: joined knees near x82%,y46% on far mat side, distinctly FAR ABOVE their neutral screen position. Both knees remain together not crossed, feet stay together near original lower-right contact x77%,y75% pivoting onto edges. Pelvis rotates gently, upper back/shoulders/head remain resting and face up, no whole-body side lying. Need clearly different upper-right knee position from foreground lower-left roll, not same pose or camera mirror. Exactly2knees2feet, natural connected legs no pretzel. Keep exact same head/hair/headband/greenhoodie/darkpants/shoes identity, NOheadphones. Camera/canvas/scale and MAT pixels unchanged, genuine transparent alpha, same crisp stepped pixelart. No text/arrows/extra limbs/ghosts.
```

### `figure_four_stretch/02.png`

Referencias: `exec-1877a894-0788-452f-9b54-8c5c8ee6843a.png`

```text
Use case: precise-object-edit. FIGURE4 LEFT ankle on RIGHT thigh: from same source keep LEFT ANKLE resting over RIGHT thigh just above right knee and LEFT KNEE open sideways, same correct4shape. Lift supporting RIGHT FOOT OFF MAT as RIGHT HIP bends to bring RIGHT THIGH gently toward chest. BOTH HANDS reach behind RIGHT THIGH (one through triangle between legs, one around outside), fingers gently clasp back of thigh, DO NOT grab/cross ankles or push left kneecap. Both feet are now in AIR, RIGHT knee closer chest, right lowerleg remains bent90degrees, no foot planted. LEFT ankle maintains clear contact atop right thigh, left knee openaway, not both knees hugged together. Head/shoulders/back/pelvis stay resting exact mat contacts, no neck crunch. Show understandable crossing and handhold, exactly two legs/two shoes/two hands. Keep exact same head/hair/headband/greenhoodie/darkpants/shoes identity, NOheadphones. Camera/canvas/scale and MAT pixels unchanged, genuine transparent alpha, same crisp stepped pixelart. No text/arrows/extra limbs/ghosts.
```

### `figure_four_stretch/03.png`

Referencias: `exec-1877a894-0788-452f-9b54-8c5c8ee6843a.png`

```text
Use case: precise-object-edit. FIGURE4 OPPOSITE SIDE: RIGHT ANKLE now rests over LEFT thigh immediately above left knee, RIGHT KNEE opens toward FOREGROUND to viewer. LEFT HIP bends bringing LEFT THIGH gently toward chest, BOTH HANDS clasp BEHIND LEFT THIGH. Both feet OFF MAT, LEFT lower leg bent90degrees, RIGHT sneaker visibly crosses over left knee from foreground right ankle. This must SWITCH crossing of source: source far left ankle crossed on near right knee; now NEAR RIGHT ankle crosses on FAR LEFT knee. In image show near right thigh opening toward foreground/lower-left, near right shin crossing to far left knee above, near right sneaker in foreground center about x60%,y60%; FAR LEFT shin/foot behind, lifted to upper-right x74%,y43%. Do not reproduce source left-ankle crossing with same leg silhouettes. Both hands under supporting LEFT thigh, not holding ankles or pressing knee. Head/shoulders/back/pelvis stay exact resting contacts, no neck crunch. Exactly2legs2shoes2hands, readable figure4 with two opposite sides. Keep exact same head/hair/headband/greenhoodie/darkpants/shoes identity, NOheadphones. Camera/canvas/scale and MAT pixels unchanged, genuine transparent alpha, same crisp stepped pixelart. No text/arrows/extra limbs/ghosts.
```

### `superman/02.png`

Referencias: `exec-9cedfc57-ab53-44ab-91f8-46f1546e4377.png`

```text
Use case: precise-object-edit. SUPERMAN gentle lift from prone rest. Raise BOTH STRAIGHT ARMS/fingertips, CHEST and BOTH STRAIGHT LEGS/shoes a few centimeters ABOVE mat at same time. Only abdomen/pelvis remains supported. Arms remain extended forward RIGHT beyond head, fingers relaxed, not bent beside chest. Legs stay straight parallel/hipwidth toward LEFT, feet no longer touching. Small comfortable lift not dramatic high banana arch; knees NOT bent, no neck strain, HEAD follows spine looking DOWN-forward with chin lightly tucked, not craning up. Clear transparent gaps beneath BOTH hands and BOTH shoes and chest vs original resting pose. Keep exact mat everypixel/camera/canvas/scale/abdomen anchor, same avatar face size/hair/clothes. Keep exact same head/hair/headband/greenhoodie/darkpants/shoes identity, NOheadphones. Camera/canvas/scale and MAT pixels unchanged, genuine transparent alpha, same crisp stepped pixelart. No text/arrows/extra limbs/ghosts.
```

### `dead_bug/03.png`

Referencias: `exec-4911179c-16af-4d3b-a37e-a4a2540a38a4.png`, `exec-2e1fbbba-8616-485a-aa52-bbf880c20397.png`

```text
Use case: precise-object-edit. Frame3 dead bug. Keep exact HEAD/BODY/MAT and BOTH LEGS of input1: foreground RIGHT leg straight hovering, background LEFT leg bent tabletop. Fix ONLY ARMS so opposite LEFT ARM reaches back while RIGHT ARM remains up. Input2 neutral shows two uprights: NEAR RIGHT arm at canvas x35%, FAR LEFT arm at x48%. In input1 upright wrongly stays at x48%. Move upright arm to exact NEAR RIGHT shoulder x35%, hand at x35%,y35%, natural straight forearm and rolled sleeve. This upright arm clearly foreground, rooted at near shoulder lower on torso. Lowered LEFT arm must emerge from FAR LEFT shoulder x48%,y70%, stretch toward canvas LEFT OVER/BEHIND head, hand at x8%,y53%. Behind head and behind upright right arm, no near sleeve across chest. Two arms ONLY, source upright at x48% removed and replaced with near upright x35%, far sleeve now lowered behindhead. Keep all other pixels, avataridentity/noheadphones, truealpha/pixelstyle. No thirdarm, no hand touching face. This shows far LEFT arm + near RIGHT leg extended, distinct from other diagonal.
```

### `thread_the_needle/02.png`

Referencias: `exec-57b1ff51-76a3-47cf-b516-3ecd663b3644.png`

```text
Use case: precise-object-edit. Exact source is opening right arm phase. Generate preceding THREAD UNDER pose with SAME working RIGHT ARM and SAME supporting LEFT HAND. Keep far LEFT SUPPORT HAND and its MAT contact EXACTLY at source RIGHTMOST palm x82%,y86%, keep this far sleeve supporting trunk, do NOT move support to leftmost x64%. Keep both knees/shins/shoes and mat EXACT unchanged. Bring currently RAISED NEAR RIGHT ARM down and THREAD it UNDER LEFT supporting arm toward far side, forearm passes diagonally beneath chest, RIGHT PALM UP visible past support at canvas x94%,y79%. RIGHT SHOULDER lowers onto mat at x66%,y79%, side of head rests nearby, face turned gently toward viewer as chest rotates into reach. Hips stay UP over knees, not heels. The right arm must remain rooted in source near shoulder that had the raised arm; far left hand remains planted on RIGHT side of image. Exactly two arms: LEFT planted rightmost, RIGHT threaded palmuptowardupperright. Do NOT place near/right palm on mat at oldleftmost contact; no spare hand. Same fixed camera/scale/avatarface/hair/headband/greenhoodie/navypants/shoes/noheadphones, crisp pixelart/truealpha. No text/arrows/ghosts.
```

### `supine_lumbar_rotation/03.png`

Referencias: `exec-fd0e13db-0913-43b1-b299-7e0ef2751e29.png`

```text
Use case: precise-object-edit. This source is knee roll TOWARD viewer, lower-left knees. Create OPPOSITE roll AWAY viewer, UPPER-RIGHT knees. Keep every pixel of HEAD/SHOULDERS/TWO ARMS/hands and MAT unchanged. Redraw lower torso/pelvis and BOTH legs only. BOTH joined KNEES must MOVE ACROSS centerline of body from current foreground lower-left position around x52%,y74% to FAR BACKGROUND position centered x79%,y51%. They lie gently near far mat side above/right of pelvis, NOT remain upright neutral and NOT current folded foreground pose. Pelvis rolls AWAY from viewer so far hip lowers, near hip rises slightly; upper torso/shoulders remain on back facing up. Thighs project diagonally up-RIGHT from pelvis x54%,y66% to knees x79%,y51%; shins remain BENT roughly90degrees and angle back down to TWO FEET together near x80%,y74%, pivot on edges. Keep feet close to source lower-right location, do NOT carry whole pair to head side. Both knees remain together one above other in depth, both shoes visible, natural joined hip/knee/ankle. This must read far LEFT-side trunk rotation opposite the supplied near RIGHT-side rotation: knees at far upper-right, not near lower-left. No camera mirror, no head/arms/mat movement, no extra joints or crossed legs. Same approved avatar, pixelart/actualalpha, no text/arrows/headphones.
```

### `supine_lumbar_rotation/03.png`

Referencias: `exec-131ccb75-f9aa-4c33-bcac-0e729e74bfcc.png`

```text
Pixel-art exercise edit: keep head, shoulders, arms and mat EXACTLY unchanged. LOWER BOTH KNEES TO THE FAR SIDE of the mat, AWAY from viewer. The current upright knees at x65%,y55% must shift a LARGE visible distance to canvas RIGHT: place joined knees at x86%,y56% and let them REST SIDEWAYS on mat, not sticking upright toward ceiling. Both thighs lie diagonally from pelvis center x54%,y65% toward FAR RIGHT knees x86%,y56%, making a much LONGER HORIZONTAL SIDEWAYS silhouette than the current upright knees. Both lower legs remain folded roughly90degrees with feet together near x80%,y77% pivoting on their edges. Pelvis rolls away, upper torso remains face up and shoulders flat. Draw outer far hip/waist rotation and the overlapping pair of sideways knees; never leave the old upright bent-knee silhouette. This is a gentle supine knee roll away, not sitting/crunching/crossed legs. Preserve avatar identity/green hoodie/navy pants/trainers, same crisp pixelart transparent square canvas, no text/arrows/extra legs. Only pelvis and legs move.
```


## Verificación final

28 pruebas dirigidas, lint del registro y compilación con prefijo `/breakbit/` correctos. El importador valida lienzos RGBA cuadrados y transparencia real. Los 131 frames del registro corresponden exactamente a los 131 PNG presentes. Comparación de huellas: solo cambian las posturas 02/03 de bird dog; los otros 116 recursos anteriores siguen intactos. Revisado en el visor real en claro y oscuro. Capturas: `work/exercise-guides-generation.local/preview-batch-10-{dark,light}.jpg`, con bird dog al principio para comparar sus diagonales.

## Revisión posterior del usuario

[Correcciones vigentes](exercise-guide-mat-review-corrections.md): nueva postura 2 de aguja basada en la referencia aportada, brazos de dead bug 03 regenerados y retirada la tercera imagen lumbar. El total vigente es 52 ejercicios y 130 posturas; la tanda queda con 13 imágenes. Estas decisiones prevalecen sobre la selección inicial documentada arriba.


## Corrección posterior · 17 de octubre

Las tres posturas de enhebrar la aguja se sustituyen por una secuencia orientada a la izquierda que copia sin espejo la referencia del usuario. Prompts y selección vigentes: [referencia literal](exercise-guide-needle-literal-reference.md). Se mantienen 52 ejercicios y 130 posturas; dead bug y las dos imágenes de rotación lumbar no cambian.


Selección posterior: [segunda referencia del usuario](exercise-guide-needle-second-reference.md). Sustituye la selección anterior de aguja; orientación derecha, cabeza sin apoyo sobre antebrazo.


Selección vigente de enhebrar la aguja: [dos imágenes aprobadas](exercise-guide-needle-approved.md). Sustituye todas las versiones anteriores. La tanda 10 queda con 12 posturas.
