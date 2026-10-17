# Antebrazos · referencia de los dos dibujos

16 de octubre de 2026. **ImageGen integrado**. Se sustituyen las cuatro posturas de interno y externo según la nueva referencia del usuario: dibujo izquierdo para el interno y derecho para el externo. Se omite completamente el detalle dentro del círculo. Pendiente de revisión, sin commit ni publicación.

## Decisiones finales

- Primer plano de manos y antebrazos, sin cuerpo ni cabeza, para conservar la geometría de los dibujos aportados.
- Estilo pixel del avatar, tonos de piel y manga verde. Antebrazo desde la derecha hacia la izquierda, como en la referencia.
- Interno: palma arriba en la preparación; postura de agarre basada en el dibujo izquierdo.
- Externo: palma abajo en la preparación; postura de agarre basada en el dibujo derecho, diferenciando su contorno del izquierdo.
- Se excluyen círculo, ejemplo incorrecto, flechas y texto. La referencia se utiliza como entrada de generación y no se incorpora como recurso de la aplicación.
- Dos archivos por ejercicio, transparencia real y lienzo común. Preparación a 256×256 del lienzo entero, sin recortar las posturas por separado. Duraciones y controles intactos.

Solo se sustituyen cuatro PNG; los otros 102 permanecen idénticos. Las versiones anteriores quedan en `work/exercise-guides-generation.local/variants/before-forearm-diagram/`.

## Recursos finales

- `public/exercises/wrist_flexor_stretch/01.png` ← `exec-293533af-d2e1-4399-abdf-232de6baa505.png`.
- `public/exercises/wrist_flexor_stretch/02.png` ← `exec-8702e333-ed81-4b46-8d25-7440d50b78ff.png`.
- `public/exercises/wrist_extensor_stretch/01.png` ← `exec-ab7b998f-fbd8-4d78-bfe2-a98fc90dd2b5.png`.
- `public/exercises/wrist_extensor_stretch/02.png` ← `exec-15b97136-8859-4ff2-9641-116e30e93a71.png`.

## Prompts de generación y edición

### `wrist_flexor_stretch/02.png`

```text
Use case: scientific-educational style transfer. Reference1 is user-supplied two-panel wrist stretch diagram, EXACT HAND/ARM POSE source. Reference2 is ONLY PIXELART SKIN/GREEN SLEEVE style source, NOT its body/head/pose. Draw ONLY TWO HANDS and FOREARMS in closeup, NO HEAD/CHARACTER/TORSO. Forearm enters from RIGHT edge and extends LEFT as in diagram; wrist near left third, active fingers hang vertically DOWN, helper hand wraps around active fingers. Match selected source panel precisely, its palm/dorsum and thumb orientation, wrist curvature, overlap and grip; do NOT mirror or reinterpret camera or attach to avatar body. Add rolled green hoodie sleeve at cropped RIGHT forearm edge only, same avatar warm skin palette, crisp large discrete pixels, stepped dark brown outline, 3–4 skin shades, no smooth vector or painting. Transparent RGBA square canvas, artwork centered with margins around all fingers and palm. OMIT the entire circled error example, circle, red X, all arrows, all text/footer/logos, white background. Single pose, single pair of hands, no insets. Normal five digits per hand, natural occlusion; no extra hand or finger. SELECT ONLY LEFT MAIN DRAWING of reference1 (the diagram above and LEFT of circle). This is INTERNAL forearm stretch: reproduce that exact LEFT diagram, wrist bent with BACK OF ACTIVE HAND facing viewer and fingers downward, helper hand wrapping across them as shown. Ignore RIGHT main diagram completely. Short active thumb lies diagonally to the RIGHT of visible knuckles/grasp like LEFT drawing. Forearm broad upper horizontal, wrist bends down at LEFT, helper fingertips wrap from left across lower active digits with its thumb on opposite side. Match outlines/relative placement directly.
```

### `wrist_extensor_stretch/02.png`

```text
Use case: scientific-educational style transfer. Reference1 is user-supplied two-panel wrist stretch diagram, EXACT HAND/ARM POSE source. Reference2 is ONLY PIXELART SKIN/GREEN SLEEVE style source, NOT its body/head/pose. Draw ONLY TWO HANDS and FOREARMS in closeup, NO HEAD/CHARACTER/TORSO. Forearm enters from RIGHT edge and extends LEFT as in diagram; wrist near left third, active fingers hang vertically DOWN, helper hand wraps around active fingers. Match selected source panel precisely, its palm/dorsum and thumb orientation, wrist curvature, overlap and grip; do NOT mirror or reinterpret camera or attach to avatar body. Add rolled green hoodie sleeve at cropped RIGHT forearm edge only, same avatar warm skin palette, crisp large discrete pixels, stepped dark brown outline, 3–4 skin shades, no smooth vector or painting. Transparent RGBA square canvas, artwork centered with margins around all fingers and palm. OMIT the entire circled error example, circle, red X, all arrows, all text/footer/logos, white background. Single pose, single pair of hands, no insets. Normal five digits per hand, natural occlusion; no extra hand or finger. SELECT ONLY RIGHT MAIN DRAWING of reference1 (right half). This is EXTERNAL forearm stretch: reproduce exact RIGHT diagram, active wrist bent downward with PALM side visible, active thumb points UP along LEFT side at wrist, fingers downward. Assisting hand wraps across active lower palm/fingers as in RIGHT drawing. Ignore LEFT main diagram completely. Preserve upright thumb and rounded palm contours from RIGHT diagram; do not replace with left panel's dorsal hand. Same silhouette, overlap and camera as source RIGHT panel.
```

### `wrist_extensor_stretch/02.png`

```text
Use case: precise-object-edit. Reference1 POSE AUTHORITY: copy only its RIGHT-HAND MAIN DRAWING, the right diagram at x360–550. Reference2 pixel art STYLE target, but its active hand currently incorrectly resembles the LEFT diagram. Correct it to RIGHT diagram. Keep green sleeve and right-to-left horizontal forearm in pixel style. In RIGHT source, wrist joins a compact vertical PALM angled slightly back, a short thumb sticks UP along its LEFT EDGE, helper hand cups across palm/fingers with four short curved horizontal fingers wrapping from left toward right. Four active fingers hang DOWN below grip. Do not retain large sloping diagonal thumb coming from active forearm across front of grip to lower RIGHT (that belongs to left source); remove that long diagonal shape and replace by source RIGHT compact palm outline. The only projecting thumb silhouette is UPRIGHT near top LEFT edge, exactly like RIGHT source. Match right diagram's exact anatomy, overlap and relative finger lengths, not a hybrid of left and right. Hands only, no head/torso/body. Green rolled hoodie sleeve on right forearm at canvas right edge, same warm pixelart skin dark stepped outline and discrete shading. Transparent square canvas, no arrows, circle, inset, X, text, logos, floor or background.
```

### `wrist_flexor_stretch/01.png`

```text
Use case: precise-object-edit. Create initial pose for INNER forearm stretch using exact supplied pixel-art hands closeup. Keep RIGHT entering horizontal FOREARM, green sleeve, camera/canvas/scale and wrist position. Active wrist becomes STRAIGHT, hand/fingers extend HORIZONTALLY LEFT in line with forearm, PALM FACING UP to ceiling. Show its UPWARD PALMAR surface with subtle palm creases, natural single thumb and four long fingers together, no nails on visible palm. All fingertips inside left margin5%, may shorten forearm slightly if needed only to fit them. REMOVE assisting hand entirely for preparation, leaving exactly ONE forearm and ONE hand. Transparent space below active hand, no detached/helper fragments or duplicate wrist. Preserve forearm/skin/green rolled sleeve pixel-art style, crisp stepped outline and three skin shades, square genuine alpha canvas. No arrows/circle/X/text/labels/face/body. Clear palm-UP initial pose, not edge-on palm-down.
```

### `wrist_extensor_stretch/01.png`

```text
Use case: precise-object-edit. Create initial pose for OUTER forearm stretch using exact supplied pixel-art hands closeup. Keep RIGHT entering horizontal FOREARM, green sleeve, camera/canvas/scale and wrist position. Active wrist becomes STRAIGHT, hand/four fingers extend HORIZONTALLY LEFT aligned with forearm, PALM FACING DOWN towards ground. Show its upper DORSAL surface with subtle knuckles and small nails at fingertips; no palm creases. Normal one thumb and four long fingers. All fingertips inside left margin5%, may shorten forearm slightly if needed only to fit them. REMOVE assisting hand and its upright thumb entirely, leaving exactly ONE forearm and ONE active hand. Transparent space below active hand, no detached/helper fragments or duplicate wrist. Preserve forearm/skin/green rolled sleeve pixel-art style, crisp stepped outline and three skin shades, square genuine alpha canvas. No arrows/circle/X/text/labels/face/body. Clear palm-DOWN initial pose, not palm-up.
```


## Verificación

Importación validada: cuatro PNG cuadrados RGBA con transparencia real y dimensiones iguales dentro de cada secuencia. Huellas comparadas: cuatro cambios esperados y 102 recursos intactos. Revisión visual en la app a tamaño real con ambas posturas visibles; captura en `work/exercise-guides-generation.local/preview-forearm-diagram-light.jpg`. Solo se han sustituido imágenes y documentación; no cambia la lógica ni los textos del ejercicio.
