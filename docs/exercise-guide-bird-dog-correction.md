# Bird dog · cambio real de pierna

16 de octubre de 2026. **ImageGen integrado**. El usuario detecta que la tanda anterior cambiaba de brazo pero mantenía la misma pierna. Se sustituyen las posturas 02 y 03, manteniendo la neutra y los controles.

- Postura 02: brazo derecho cercano extendido y pierna izquierda del fondo elevada detrás del muslo derecho de apoyo.
- Postura 03: brazo izquierdo del fondo extendido y pierna derecha cercana elevada delante de la rodilla izquierda de apoyo.
- La rodilla apoyada, el pie apoyado y la superposición de los muslos cambian entre diagonales. La perspectiva de la pierna elevada distingue fondo y primer plano; no se espeja toda la imagen.
- PNG finales: `public/exercises/bird_dog/02.png` y `03.png`, 256×256 RGBA. La postura 01 queda intacta. Originales anteriores en `work/exercise-guides-generation.local/variants/before-bird-opposite-leg/`.

## Prompts

### `bird_dog/02.png`

```text
Use case: precise-object-edit. Fix OPPOSITE LEG in bird-dog: supplied frame already has NEAR RIGHT ARM extended forward and FAR LEFT HAND planted; keep EVERY PIXEL OF UPPER BODY, arms/hands/head/hoodie and MAT unchanged. Only redraw the TWO LEGS from hips down. Current stretched leg is wrongly drawn as NEAR foreground leg. Need FAR LEFT LEG extended and NEAR RIGHT LEG kneeling.
Foreground RIGHT thigh must descend from near hip x42%,y55% to foreground KNEE planted x42%,y80%; bend shin back-left along mat to near RIGHT SHOE at x20%,y80%. Show continuous foreground thigh/pant contour IN FRONT OF (occluding root of) far lifted thigh. Foreground pant leg must NOT connect to raised shoe.
FAR LEFT LEG must emerge BEHIND the foreground bent thigh at far hip x44%,y52%, extend BACK and SLIGHTLY AWAY in depth diagonally to UPPER-LEFT, with straight knee and far LEFT SHOE centered x15%,y44%, distinctly ABOVE and RIGHT of old raised shoe. Far shoe naturally slightly smaller due depth. This far raised leg is a separate clear silhouette from near grounded bent leg, attaches to far side of pelvis, no crossing/dislocation. Remove old foreground horizontally raised leg and old near-edge raised shoe completely, replacing with correct far raised leg behind. Exactly TWO legs/TWO shoes; one KNEE on mat and opposite leg raised. Real contralateral NEAR RIGHT ARM + FAR LEFT LEG lifted. No camera flip or mirror, no extra limb, no changing green sleeves/face/mat. Same crisp pixelart and transparent square canvas, no headphones, text/arrows.
```

### `bird_dog/03.png`

```text
Use case: precise-object-edit. Bird-dog LEFT ARM + RIGHT LEG lifted. Preserve ALL upper body/head/arms and mat exactly. Redraw ONLY legs so the NEAR RIGHT LEG is unmistakably extended in FOREGROUND and FAR LEFT KNEE is supporting BEHIND. Current legs too similar to opposite frame; make depth clear.
NEAR RIGHT LEG: starts at foreground RIGHT HIP x40%,y56%, its broad upper thigh IN FRONT OF and overlapping root of far grounded thigh. Extend it straight BACK and TOWARD VIEWER in perspective, diagonally DOWN-LEFT on canvas: near RIGHT shoe at x9%,y65% (not upper-left y45–50%). Near foot slightly larger in foreground, sole points back, knee straight, comfortable hip-level reach in3D rather than very high leg. Show continuous near thigh from FRONT waistband to this foreground raised shoe.
FAR LEFT LEG: vertical thigh BEHIND near thigh, far LEFT KNEE rests on mat at x50%,y77%; far shin folds back to SMALLER FAR SHOE x34%,y77%. Far bent leg/foot MUST shift BACK/RIGHT in perspective vs foreground extended leg; do not keep same near kneeling knee silhouette at x42%,y81%. The overlapping extended near leg clearly IN FRONT of planted far leg, with far knee visible to its RIGHT.
Exactly 2legs2shoes, far shoe on mat, raised near shoe at y65% with visible transparent gap below. All arm pixels remain: NEAR RIGHT HAND planted at x64%,y86%, FAR LEFT ARM extended forward. Thus near leg+far arm lifted, opposite near arm+far leg. Same avatar clothing, crisp pixelart, genuine alpha, fixed camera/canvas/mat. No text/arrows/colors/ghosts/extra limbs.
```

## Selección final

- `bird_dog/02.png` ← `exec-7cf45335-99f7-4d9d-a0f4-804049876430.png`.
- `bird_dog/03.png` ← `exec-8c347b1d-0d19-416a-a5fc-9f96d65a37f8.png`.

## Revisión integrada

La vista de la tanda 10 muestra primero las tres posturas del bird dog para revisar el cambio de pierna. Ambas diagonales se han vuelto a preparar a 256×256; se conserva la imagen neutra y el orden centro → diagonal → centro → diagonal contraria. Sin commit ni publicación.
