# Balanceo alterno de brazos · corrección del recorrido

16 de octubre de 2026. Generación con ImageGen integrado (`built-in`).

Petición: el brazo que avanza debe continuar hasta arriba, llegando ligeramente hacia atrás por encima de la cabeza. Las dos primeras posturas sustituyen el alcance a la altura del hombro por ese recorrido elevado. La tercera conserva el cruce delante del pecho descrito en el catálogo, con encuadre compatible con las otras dos.

Se mantienen tres imágenes, secuencia `[0, 1, 0, 1, 2]`, identidad del avatar de fase 5 sin auriculares y fondo transparente. Se reserva espacio superior para las manos. El visor sigue usando su lienzo de 210 px, sin superponer el temporizador.

PNG finales: `public/exercises/arm_swing/01.png`, `02.png`, `03.png`. Originales finales: `work/exercise-guides-generation.local/originals/arm_swing/`. Originales anteriores: `work/exercise-guides-generation.local/variants/arm-swing-before-overhead/`.

## Prompts usados

### 01.png

Use case: precise-object-edit. Asset: corrected frame 01 of the Breakbit alternating arm swing exercise, pixel-art instructional sprite. Image1 is the existing pose to correct. Keep EXACT character identity: young red spiky-haired human, brown eyes, white headband green stripe, green hoodie, dark trousers, white/green sneakers, NO headphones. Same three-quarter camera facing RIGHT, neutral upright back, relaxed knees, feet planted hip-width, no change of outfit or art style. CHANGE arm range: the FAR/LEFT arm that currently points forward toward canvas RIGHT must CONTINUE UP through the front to full OVERHEAD elevation, elbow almost straight, upper arm next to ear, hand a little BEHIND the head toward canvas LEFT, only 5-10 degrees past vertical. The arm travels in the sagittal forward/up/back arc, NOT sideways, not elbow folded with hand behind neck. Near/right arm hangs slightly BACK and down behind body to canvas LEFT, hand open relaxed, clearly connected at near shoulder. Exactly two arms, natural hands. No torso arch or leaning to fake shoulder range. Reframe the WHOLE figure uniformly smaller to leave real overhead space: shoe soles y92%, head top around y29%, raised fingertips around y7%, pelvis x50%. All hair, fingers and shoes fully inside square canvas, no cropping. Preserve crisp stepped dark-brown pixel outlines and discrete green shading, no blur, smooth painting, glow or halos. One single pose only. Genuine transparent alpha background, no text, arrows, scenery, floor or shadows.

### 02.png

Use case: precise-object-edit. Image1 is corrected overhead arm swing frame01. Create frame02 by changing ONLY the TWO arms/sleeves, preserving EXACT head, face, hair, headband, hoodie trunk, hips, legs, shoes, camera, canvas and pixel positions. SWAP which arm is up: currently the shoulder on canvas LEFT is raised. LOWER that LEFT-CANVAS shoulder's arm backward/down with relaxed open hand behind hip toward canvas LEFT. RAISE the OTHER arm attached at shoulder on canvas RIGHT (far side) through the front and ALL THE WAY OVERHEAD, elbow almost straight, upper arm beside ear, hand slightly behind shoulder toward canvas LEFT just 5-10 degrees past vertical. This is alternating FORWARD/UP/BACK arm swing viewed three-quarter RIGHT, not a side lateral raise or elbow bent behind neck. Show the raised arm connected naturally at RIGHT-CANVAS shoulder, forearm continues upward alongside RIGHT edge of head, hand above head. Exactly two arms, open relaxed hands, no duplicated arms, no torso arch/lean. Keep original hair asymmetry and body, do NOT mirror whole image. Same full body scale, soles baseline y92%, full hand safe inside top margin. Same optimized avatar without headphones, red spiky hair, white/green headband, green hoodie, dark pants, white/green shoes. Preserve pixel art hard stepped dark outlines, no blur/halo/glow. Genuine transparent alpha, no scenery, text, arrows or shadows.

Refinamiento:

Use case: precise-object-edit. Correct ONLY raised arm angle in this exact pixel-art exercise sprite. Current raised arm belongs to shoulder on canvas RIGHT and points a little FORWARD. Move its extended forearm and OPEN HAND a little BACKWARD toward canvas LEFT, so entire raised arm is near vertical and hand ends slightly BEHIND that shoulder's vertical line. Keep raised elbow nearly straight, not folded, no hand behind neck. Hand center around x60% canvas and y11%, above head, upper arm beside ear on RIGHT edge of head; current raised shoulder around x61%. Do not touch or redraw face, hair/headband, trunk, hanging arm, hips, legs, shoes, camera, canvas, scale or positions. Exactly two arms. No torso leaning or arching. Same green hoodie sleeve, skin, pixel art stepped dark outline. Genuine transparent alpha background, no text, effects, floor or shadow. Minimal edit of raised arm only; preserve original crisp sprite.

### 03.png

Use case: precise-object-edit. Input1 is the NEW overhead pose, authoritative for character size, fixed camera, position, hair/head, trunk/hips/legs/shoes. Input2 is the OLD broad crossing-arms pose, authoritative only for ARM GESTURE. Create corrected frame03: reproduce the loose broad CROSSING arms from input2 on the body/canvas/scale of input1. Both arms extend forward nearly straight in open space in front of chest, forearms cross near midline, hands open and extended beyond crossing in opposite directions, NOT self-hug, hands not touching shoulders. Keep EXACT size and pixel positions of face/hair/headband, trunk, hips, legs and soles from input1, no larger figure or recentering. Upper empty space remains intentionally empty to match overhead frames. Three-quarter RIGHT view, same red spiky-haired phase5 young human with white/green headband, green hoodie, dark pants, white/green sneakers, NO headphones. Crisp stepped pixel-art outlines, limited shading. Exactly two arms, hands relaxed, all fingers inside canvas. Genuine transparent alpha with clean dark silhouette, NO colored halo/noise, text, motion ghosts, floor, scenery or shadows.


## Comprobación

Importación de tres PNG RGBA con transparencia correcta, 61 recursos ajenos al balanceo intactos, diez tests de guía/precarga correctos y secuencia comprobada en la vista de revisión. Sin commit ni publicación.
