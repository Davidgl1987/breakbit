# Tanda 11 · banda elástica, tren superior

17 de octubre de 2026. **ImageGen integrado**. Cinco ejercicios, diez imágenes transparentes. Avatar optimizado de fase 5 sin auriculares. Banda coral para distinguirla de la sudadera; anclaje lateral o frontal mínimo en los movimientos que lo requieren. Dos posturas por ejercicio, misma cámara y apoyos. Sin commit ni publicación.

| ID | Posturas |
| --- | --- |
| band_pull_apart | Brazos al frente → apertura con brazos estirados. |
| band_external_rotation | Codos pegados al cuerpo → antebrazos hacia fuera. |
| band_row | Brazos extendidos hacia el anclaje → codos atrás y manos a las costillas. |
| band_face_pull | Brazos extendidos a altura de cara → manos junto a la cara. |
| band_pallof_press | Manos al pecho → brazos al frente sin girar el tronco. |

Producción: `public/exercises/<id>/{01,02}.png`, 256×256 RGBA. Originales, preparación y manifiesto en `work/exercise-guides-generation.local/`.

## Prompts utilizados

## Verificación de integración

Compilación con prefijo `/breakbit/` correcta y 11 pruebas de guía/reproducción y precaché superadas. Comprobados registro, transparencia, tamaño y archivos: diez PNG nuevos; las dos imágenes aprobadas de aguja sustituyen las anteriores y la tercera queda archivada. Otros 128 PNG anteriores intactos. Acumulado: 57 ejercicios / 139 posturas. Revisión visual a 210 px en claro y oscuro, con capturas `work/exercise-guides-generation.local/preview-batch-11-{dark,light}.jpg`. Aguja revisada con navegación manual en `preview-needle-approved.jpg`. Los recursos están integrados; la revisión visual de esta tanda por parte del usuario sigue pendiente. Sin commit.

### band_pull_apart/01.png

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite matching the approved optimized phase5 avatar in reference: young man with spiky red-orange hair, white headband with green stripe, green hoodie with pale drawstrings/rolled cuffs, navy trousers, white-green sneakers. NO headphones. Same crisp chunky square pixel-art clusters, stepped dark outline and limited discrete shading, not smooth illustration. Exactly two arms/two legs, normal hands grasping equipment. Genuine transparent square RGBA canvas, no room/scenery/text/arrows/glow. One full figure only, whole hair/fingertips/shoes and support inside margins. Reserve space for both poses, fixed camera and scale later. Use a simple CORAL-ORANGE flat elastic band to contrast with green hoodie, show it connected to both gripping hands; no floating ends. BAND PULL-APART START. FRONT view standing upright feet hip width, relaxed shoulders. Both arms straight FORWARD at shoulder height, slightly seen from above enough to see forearms projecting toward viewer. Closed hands hold coral flat band shoulder-width apart in front, short horizontal segment joining grips. Elbows remain straight, hands around x40% and60%,y43%. Reserve canvas width x12–88% for final arms opening to sides. No band anchor, just band held between hands, no handles or loop around body. Body centered, heady20%,shoesy91%. Full body, smallish head consistent approved avatar.
```

### band_external_rotation/01.png

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite matching the approved optimized phase5 avatar in reference: young man with spiky red-orange hair, white headband with green stripe, green hoodie with pale drawstrings/rolled cuffs, navy trousers, white-green sneakers. NO headphones. Same crisp chunky square pixel-art clusters, stepped dark outline and limited discrete shading, not smooth illustration. Exactly two arms/two legs, normal hands grasping equipment. Genuine transparent square RGBA canvas, no room/scenery/text/arrows/glow. One full figure only, whole hair/fingertips/shoes and support inside margins. Reserve space for both poses, fixed camera and scale later. Use a simple CORAL-ORANGE flat elastic band to contrast with green hoodie, show it connected to both gripping hands; no floating ends. BILATERAL BAND EXTERNAL ROTATION START. FRONT slight elevated three-quarter view so projecting forearms readable. Stand upright feet hip width. Both elbows BENT90degrees and tucked against LEFT/RIGHT SIDES of lower ribs at WAIST height. Upper arms hang vertically close to ribs. Forearms point FORWARD, fists a short distance apart just in front of waist, palms face UP/thumbs outward. Hands hold short coral band between them horizontally. Show both elbow and both wrist joints, elbows never shoulder height. Chest faces viewer, body centered, shoesy91%, heady20%. No anchor, no band around back/feet, no shoulder abduction.
```

### band_row/01.png

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite matching the approved optimized phase5 avatar in reference: young man with spiky red-orange hair, white headband with green stripe, green hoodie with pale drawstrings/rolled cuffs, navy trousers, white-green sneakers. NO headphones. Same crisp chunky square pixel-art clusters, stepped dark outline and limited discrete shading, not smooth illustration. Exactly two arms/two legs, normal hands grasping equipment. Genuine transparent square RGBA canvas, no room/scenery/text/arrows/glow. One full figure only, whole hair/fingertips/shoes and support inside margins. Reserve space for both poses, fixed camera and scale later. Use a simple CORAL-ORANGE flat elastic band to contrast with green hoodie, show it connected to both gripping hands; no floating ends. STANDING BAND ROW START. Avatar at RIGHT half, slight THREE-QUARTER SIDE view facing LEFT, feet hip width flat on floor, spine upright with soft knees. BOTH arms extend forward horizontally at lower chest height toward LEFT, hands grip BOTH ends of coral band. Simple narrow wooden vertical anchor post at far LEFTx8%, only minimal needed support, securely attached band at LOWER STERNUM height y49%. TWO coral strands connect anchor to two slightly depth-separated hands at x46%,y49%, no detached lines. Far hand/arm slightly higher due depth so both visible. Bodyheadx71% y24%, both shoesx64/80% y91%. Reserve forward arm space. No sitting/rowingboat, band not attached to feet, no leaning back.
```

### band_face_pull/01.png

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite matching the approved optimized phase5 avatar in reference: young man with spiky red-orange hair, white headband with green stripe, green hoodie with pale drawstrings/rolled cuffs, navy trousers, white-green sneakers. NO headphones. Same crisp chunky square pixel-art clusters, stepped dark outline and limited discrete shading, not smooth illustration. Exactly two arms/two legs, normal hands grasping equipment. Genuine transparent square RGBA canvas, no room/scenery/text/arrows/glow. One full figure only, whole hair/fingertips/shoes and support inside margins. Reserve space for both poses, fixed camera and scale later. Use a simple CORAL-ORANGE flat elastic band to contrast with green hoodie, show it connected to both gripping hands; no floating ends. STANDING BAND FACE PULL START. Avatar at RIGHT half, three-quarter SIDE view facing LEFT. Stand tall feet stable hip width. Both arms STRAIGHT forward at FACE/eye height, not waist height, two hands grip ends of coral band. Minimal narrow wooden vertical anchor at farLEFT x8%, band securely anchored at EYE/NOSE HEIGHT y33%. Two taut coral strands go from anchor to two depth-separated grips at x42/46%,y33/36%. Shoulders relaxed, head upright, eyes looking LEFT along arms, no band across face yet. Body centeredx71%,bothfeet visibley91%. Reserve room to draw both elbows backwards in next pose. No pull-down/row at chestheight, no room/scenery.
```

### band_pallof_press/01.png

Referencias: `avatar-master.png`

```text
Use case: scientific-educational. Exercise guide sprite matching the approved optimized phase5 avatar in reference: young man with spiky red-orange hair, white headband with green stripe, green hoodie with pale drawstrings/rolled cuffs, navy trousers, white-green sneakers. NO headphones. Same crisp chunky square pixel-art clusters, stepped dark outline and limited discrete shading, not smooth illustration. Exactly two arms/two legs, normal hands grasping equipment. Genuine transparent square RGBA canvas, no room/scenery/text/arrows/glow. One full figure only, whole hair/fingertips/shoes and support inside margins. Reserve space for both poses, fixed camera and scale later. Use a simple CORAL-ORANGE flat elastic band to contrast with green hoodie, show it connected to both gripping hands; no floating ends. PALLOF PRESS START. FRONTAL three-quarter view, avatar faces VIEWER, stands upright feet hip-width, knees soft, shoulders/pelvis level. A minimal narrow wooden anchor post at farLEFT x7% with coral elastic secured at MID-CHEST height y48%. Avatar centeredx62%, heady22%, shoesy91%. BOTH HANDS clasp together with closed grip immediately in front of STERNUM x62%,y48%; elbows bent and near ribs, hands hold band's free end. One doubled coral band runs horizontally from left anchor to hands at chest, never wrapped around torso. Anchor is to AVATAR'S SIDE, not directly in front: chest/front clearly facing viewer. Need enough forward/foreground space to extend hands away from chest next pose without rotating torso. Exactly two arms, no band in both separated hands, no arms opening sideways.
```

### band_pull_apart/02.png

Referencias: `exec-37cba3ab-b1af-4ec2-97b9-080cc3639fed.png`

```text
Use case: precise-object-edit. Keep original square canvas, fixed camera, exact avatar identity/wardrobe/noheadphones, fullfigure scale and true transparency. One new pose only, no text/arrows/ghosts/blur/glow. BAND PULL APART FINISH: open BOTH straight arms outward into a horizontal T at shoulder/chest height, hands widely separated at LEFTx10% andRIGHTx90%. ELBOWS stay straight, open from shoulders, both forearms inline upperarms. Stretch the SAME coral band between gripping fists across FRONT OF CHEST, horizontal thin taut strip, not behind back. Band touches/approaches upper chest below collarbones, no slack loop, no elbows tucked/bent. Do not change head size, torso, feet or shoes. Both hands inside canvas, no scale change.
```

### band_external_rotation/02.png

Referencias: `exec-71731915-39a6-4960-97b2-4de7421b6cb6.png`

```text
Use case: precise-object-edit. Keep original square canvas, fixed camera, exact avatar identity/wardrobe/noheadphones, fullfigure scale and true transparency. One new pose only, no text/arrows/ghosts/blur/glow. BILATERAL EXTERNAL ROTATION FINISH. KEEP EACH ELBOW IN EXACT SAME place touching SIDES OF WAIST/RIBS, upperarms unchanged hanging vertically. Both elbows remain bent90degrees. Rotate only FOREARMS outward at shoulders, hands move apart outward toward LEFTx27% andRIGHTx73% at original WAIST height, forearms now diagonally outward/forward, palms still UP. Stretch coral band horizontally between fists, taut. No straight T arms, no elbow lifting away from ribs, no raising band to chest/face, no shoulder shrug. Same torso head legs feet.
```

### band_row/02.png

Referencias: `exec-861d0b74-cdc4-4ad2-8a02-8ab8d867a025.png`

```text
Use case: precise-object-edit. Keep original square canvas, fixed camera, exact avatar identity/wardrobe/noheadphones, fullfigure scale and true transparency. One new pose only, no text/arrows/ghosts/blur/glow. BAND ROW FINISH. Keep source wooden anchor left and knot EXACT same pixels, same band origin height, feet and upright torso/head unchanged. Bend BOTH elbows, drive elbows BACK behind torso at lower rib height, draw both closed hands to LOWER RIBS/waist near avatar at RIGHT. Shoulders stay relaxed, chest remains upright, no leanback. Near bent elbow visible to RIGHT behind hip side, far elbow visible separate. Two coral strands stretch from fixed left anchor to each fist now close to own ribs at right, not to elbow. Hands at LOW CHEST/upperwaist, not face, upper arms close to body. Both arms distinct, hands gripband. Same avatar and no new props.
```

### band_face_pull/02.png

Referencias: `exec-a4242ca1-7167-4e01-8341-2615db661643.png`

```text
Use case: precise-object-edit. Keep original square canvas, fixed camera, exact avatar identity/wardrobe/noheadphones, fullfigure scale and true transparency. One new pose only, no text/arrows/ghosts/blur/glow. FACE PULL FINISH. Keep exact left post anchor/knot and eye-height band origin, head/feet/body/camera unchanged. Pull both hands BACK toward sides of FACE, gripping fists stop beside own temples/cheeks, elbows bent90degrees and driven BACK and OUT at shoulder/ear height, never down near waist. Near elbow projects to RIGHT behind near shoulder, far elbow slightly deeper. Show two separate forearms and grips with shoulders stable, head upright not ducking. Two coral strands from left eye-height anchor stretch toward two hands near FACE, no band through eyes/mouth, keep face readable. No overheadpress, no chestrow, no lowerbandanchor. Same fullbody scale.
```

### band_pallof_press/02.png

Referencias: `exec-4797d8e5-5aa0-4fe8-9bcc-f1bf857e6b99.png`

```text
Use case: precise-object-edit. Keep original square canvas, fixed camera, exact avatar identity/wardrobe/noheadphones, fullfigure scale and true transparency. One new pose only, no text/arrows/ghosts/blur/glow. PALLOF PRESS FINISH. Anchor at LEFT unchanged, full torso remains perfectly FRONT-FACING upright and still, same head/pelvis/knees/feet. Both hands JOINED together maintain grip of free end; move both hands FORWARD AWAY FROM STERNUM TOWARD VIEWER until elbows straighten. Not sideways to left anchor. Forearms visibly project into foreground from shoulders toward image center-lower chest; wrists joined in front of torso, slightly enlarged by depth, band endpoint now forward/foreground. Coral doubled band from fixed left anchor slopes slightly DOWN-RIGHT toward joined hands in foreground. Body not rotating or leaning, shoulders level. Show BOTH ARMS straight into foreground, no bent elbows remaining at ribs, not opening arms apart. Keep identity and canvas scale.
```
