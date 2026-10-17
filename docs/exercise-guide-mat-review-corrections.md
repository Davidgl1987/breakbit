# Revisión de esterilla · aguja, dead bug y rotación lumbar

16 de octubre de 2026. **ImageGen integrado** para las dos imágenes sustituidas. El usuario solicita corregir la postura 2 de enhebrar la aguja con una referencia, regenerar los brazos de dead bug 03 y conservar solo las dos primeras posturas de rotación lumbar. Misma rama `codex/exercise-guides-pilot`, sin commit ni publicación.

## Cambios vigentes

- `thread_the_needle/02.png`: se utiliza la ilustración inferior de la referencia del usuario como autoridad de pose, adaptada al sentido del avatar. Brazo de trabajo cruzando por debajo hacia el primer plano, palma arriba, brazo de apoyo doblado con mano junto a la cara; cadera sobre rodillas. Manga/piel/ropa del avatar y esterilla existentes. Se omiten la segunda persona, texto y fondo de la referencia.
- `dead_bug/03.png`: regenerada desde la postura neutra 01, conservando el brazo derecho vertical y su raíz en el hombro. El brazo izquierdo alcanza hacia atrás; la pierna derecha se extiende y la izquierda queda en posición de mesa.
- `supine_lumbar_rotation/03.png`: retirada de la producción, de los originales activos y del importador para evitar reintroducirla. Se archiva en `work/exercise-guides-generation.local/variants/before-mat-review-corrections/`. La guía usa únicamente 01/02 y la secuencia `[0,1]`. El texto indica regresar al centro y repetir hacia el otro lado, con hombros apoyados.

## Integración

Imágenes finales de 256×256 RGBA con transparencia real, preparación del lienzo completo por vecino más próximo. Las versiones anteriores de las imágenes corregidas se conservan en la carpeta de variantes indicada. No se modifica el catálogo ni la duración de los ejercicios; el temporizador sigue siendo independiente.

Acumulado vigente: **52 ejercicios / 130 posturas**. La tanda 10 queda con 13 imágenes. Exactamente dos PNG sustituidos, uno retirado y 129 recursos anteriores intactos, incluido el avatar maestro. El registro corresponde exactamente a los archivos presentes.

## Selección final y prompts

### `thread_the_needle/02.png`

Archivo generado: `exec-23dbd085-ef2b-4aa7-9f8a-b4f9b97767b8.png`. Referencias: `codex-clipboard-ec31ca6b-6c2b-4084-b5a7-faca86c2bf5d.png`, `03.png`

```text
Use case: scientific-educational. Reference1 LOWER illustration is exact POSE AUTHORITY for THREAD THE NEEDLE; ignore upper illustration. Reference2 is approved pixel-art avatar IDENTITY, scale, mat and wardrobe reference. Reproduce LOWER illustration using this avatar, MIRRORED horizontally so head toward RIGHT and hips/knees toward LEFT, matching reference2 camera direction.
Key geometry from lower illustration: knees on mat under high hips, thighs vertical, shins behind; torso slopes down to one shoulder and side of head resting on mat. WORKING ARM passes UNDER supporting arm/chest ACROSS BODY toward VIEWER/FOREGROUND (canvas DOWN-LEFT), with its palm facing UP and whole forearm visible across mat in front. SUPPORT ARM is bent at elbow, palm down next to face in canvas lower-RIGHT, supporting upper torso. Distinct TWO hands: supporting palm down near RIGHT side of face around x79%,y82%, and threaded palm UP REACHING TOWARD VIEWER at x57%,y90% with forearm diagonal below chest. Do NOT send threaded hand beyond head to far/right edge or behind head: it reaches across front foreground, exactly like lower source illustration mirrored. Connected right shoulder/upper arm threads beneath left supporting arm, visible crossing, no floating hand/extra elbow. Face rests sideways looking gently down toward mat, not extreme twisted neck, hips remain above knees not child-pose sitback.
Same optimized avatar spiky redhair/whitegreen headband/green hoodie/navy trousers/whitegreen sneakers, NO headphones, same chunky crisp square pixel art dark stepped outlines and discrete palette. Same teal mat, square transparent alpha background, all hands/head/feet inside margins. No other person/second pose, no arrows/text/labels/scenery. Only one clear threaded pose; do not reproduce reference source people/clothes/background.
```

### `dead_bug/03.png`

Archivo generado: `exec-1e48b90b-6562-425b-a37b-ba27a14a192c.png`. Referencias: `01.png`

```text
Use case: precise-object-edit. Rebuild dead bug opposite diagonal FROM NEUTRAL SOURCE, not previous failed pose. Preserve NEAR RIGHT ARM COMPLETELY UNCHANGED at canvas x35% (leftmost raised arm), including its exact shoulder/sleeve/elbow/wrist/palm and all existing pixels; arm stays pointing straight UP. Head, neck, face, shoulders, back and pelvis stay EXACT resting source positions.
Change only FAR LEFT ARM (source rightmost upright x48%): rotate whole straight arm backward toward LEFT over head, keeping anatomical SHOULDER ROOT at original far-left shoulder x48%,y70%. Upper arm extends leftward BEHIND near upright arm and behind head, elbow around x23%,y58%, forearm ends with hand at x8%,y58%, hovering above mat behind head. Continuous naturally connected shoulder-upperarm-elbow-forearm, no arm emerging from neck, no disconnected hand, no extra bend, no sleeve crossing face or growing from chin. Far lowered arm may be occluded by head but green upperarm must join proper original far shoulder. Exactly TWO arms/two hands, one near vertical unchanged and far arm reaching back.
Extend NEAR RIGHT LEG straight toward RIGHT hovering above mat, near shoe at x94%,y77%. FAR LEFT LEG remains bent tabletop90degrees (source uppermost far shoe), far shoe x80%,y50%. Near extended thigh in front of far bent thigh. No change to mat, camera, scale, canvas, avatar identity/hair/headband/clothes/noheadphones. Crisp pixelart genuine alpha, no text/arrows/ghosts. Strong priority: preserve original near upright arm whole pixels and shoulder position, naturally connected lowered far arm rooted at shoulder not neck.
```


## Verificación final

28 pruebas dirigidas, compilación con prefijo `/breakbit/`, lint y comprobación de archivos correctos. Revisado en claro y oscuro en el visor real; la guía lumbar muestra 1/2 y 2/2 y no solicita la imagen retirada. Capturas en `work/exercise-guides-generation.local/preview-mat-review-corrections-{dark,light}.jpg`.


## Corrección posterior · 17 de octubre

Las tres posturas de enhebrar la aguja se sustituyen por una secuencia orientada a la izquierda que copia sin espejo la referencia del usuario. Prompts y selección vigentes: [referencia literal](exercise-guide-needle-literal-reference.md). Se mantienen 52 ejercicios y 130 posturas; dead bug y las dos imágenes de rotación lumbar no cambian.
