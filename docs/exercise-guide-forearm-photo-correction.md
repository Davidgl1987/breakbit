# Antebrazo · corrección con referencias fotográficas

16 de octubre de 2026. Generación con **ImageGen integrado**. El usuario aporta dos fotografías como referencia de la postura. Se sustituyen ambas imágenes de `public/exercises/wrist_flexor_stretch/` para mantener el encuadre lateral y el brazo extendido entre ellas. Misma rama, sin commit ni publicación.

## Secuencia final

1. Brazo extendido al frente, dedos hacia abajo; la mano de ayuda se aproxima sin tocar.
2. La mano de ayuda rodea y sujeta los dedos, como en las fotografías. No se representa una mano en forma de cuenco bajo las puntas.

El avatar conserva la última fase, cinta blanca/verde y sudadera, sin auriculares. Fondo transparente real, preparación a 256×256 sobre el lienzo entero, sin recortar cada postura. La segunda postura mantiene su duración de 25 segundos; la primera dura 2,5 segundos.

Se archivan las versiones sustituidas en `work/exercise-guides-generation.local/variants/before-forearm-photo-reference/`. Las fotografías del usuario se utilizan como referencia de generación; no se incorporan como recursos de la app. Esta corrección prevalece sobre la primera corrección de manos y vista.

## Prompts finales

### Postura de estiramiento

```text
Use case: scientific-educational. Create a SINGLE correct wrist/inner forearm stretch sprite in pixel art. Reference1 PHOTO WOMAN exact pose geometry; reference2 PHOTO MAN clarifies grasp and palm; reference3 AVATAR identity/style only. Reproduce photo1's SIDE VIEW facing RIGHT, from head to hips, arms FULLY OUTSTRETCHED STRAIGHT FORWARD at shoulder height with straight elbows; NOT bent near body. Upper active right arm horizontal, its wrist bends so fingertips point vertically DOWN. Orient active palm outward/front as visible in photo2, straight fingers together, naturally five digits. Lower assisting LEFT arm reaches forward below active arm. Its LEFT HAND WRAPS AROUND the ACTIVE FOUR DOWNWARD FINGERS, thumb on opposite face to curled assisting fingers, like the photographs. Real firm gentle CONTACT along fingers. Two hands total: ONE vertical active palm/four fingers down and ONE helper grasping across their lower half, no stacked third palm, no cupped bowl under fingertips, no detached/sprouting fingers, no intertwined duplicate hands. The helper's curled fingers wrap visibly across the front of active downward fingers and its thumb lies behind, leaving active palm above grasp visible. Match photo1 clear side silhouette, arms extending a long distance right of chest, helper arm slightly lower, relaxed shoulders, torso vertical. Avatar is the approved young optimized phase5 male: spiky red hair, white headband green stripe, brown eye, green hoodie with sleeves rolled to midforearm, dark trousers at bottom, NO headphones. Head in true SIDE PROFILE looking RIGHT. One coherent pixel-art character, chunky discrete pixels, stepped dark brown outlines, limited shading, no photographic skin/no smooth vector. Square transparent RGBA canvas, upper body fills left-to-right with safe margins around hair and ALL fingers, waist can end at bottom. Do not copy people/room/background from photos. No arrows, no labels, no text, no floor, no shadow, no opaque background. Educational pose precision overrides stylistic flourish.
```

### Preparación del agarre

```text
Use case: precise-object-edit. This exact pixel art forearm stretch is frame2, create frame1 immediately BEFORE the assisting hand grasps. KEEP ALL upper active RIGHT ARM and downward RIGHT HAND/fingers exactly unchanged: shoulder to elbow to horizontal forearm to wrist and fingers pointing DOWN. Keep avatar HEAD/profile/hair/headband/greenhoodie/TORSO and entire upper active arm exact same size/location/canvas. Change ONLY LOWER assisting LEFT forearm/hand: gently lower helper forearm/hand about one hand height (roughly10%canvas) so its relaxed OPEN hand approaches below and slightly left of active fingertips, NOT YET touching. Helper fingers naturally relaxed/slightly curled, palm oriented toward active downward fingers ready to close around them, NOT palm-up bowl. There must be a clearly visible transparent GAP between assisting hand and active right fingertips. Reveal the active four downward fingers where the grasp used to cover them, anatomically correct one thumb to side, five totaldigits, no third hand. This is same stretch position with straight active elbow, helper hand ready before grasp. Lower helper elbow may bend slightly while preparing. Keep canvas, scaling, head, torso, upper arm, wrist, background alpha, pixel art absolutely unchanged. Exactly TWO arms and TWO hands. All fingers inside canvas, no extra digits, no text, no arrows, no headphones.
```

## Recursos seleccionados

- `public/exercises/wrist_flexor_stretch/01.png` ← `exec-2d257561-0f7c-4afc-bef3-7cc2b9a306de.png`.
- `public/exercises/wrist_flexor_stretch/02.png` ← `exec-97ad4682-033c-4961-b735-755f45119e5b.png`.

## Verificación

28 pruebas dirigidas y compilación de producción correctas. Comprobación de huellas: solo cambian las dos posturas del antebrazo; los otros 104 PNG permanecen idénticos. Revisión visual en el visor real de 210 px; captura en `work/exercise-guides-generation.local/preview-forearm-photo-reference.jpg`.

## Orientación final de interno y externo

La revisión posterior del usuario distingue palma arriba/dorso visible para el interno y palma abajo/agarre anterior para el externo. Véase [selección y prompts finales](exercise-guide-forearm-pair-correction.md), que prevalecen sobre los recursos de antebrazo anteriores.
