# Guías visuales · catálogo completo

17 de octubre de 2026. Integración y publicación autorizadas por el usuario desde la rama `codex/exercise-guides-pilot`.

**82/82 ejercicios cubiertos, 0 pendientes de generar, 196 imágenes.** Dos o tres posturas por ejercicio. Avatar de fase5 sin auriculares. Tandas12–16 generadas con **ImageGen integrado** e integradas para revisión visual del usuario.

## Packs de esta entrega

| Pack / prompts | Ejercicios nuevos | Imágenes nuevas | Acumulado | Pendientes |
| --- | ---: | ---: | ---: | ---: |
| [12 · Banda elástica · piernas y press](exercise-guide-batch-12-prompts.md) | 5 | 11 | 62/82 | 20 |
| [13 · Mancuernas · primer pack](exercise-guide-batch-13-prompts.md) | 5 | 12 | 67/82 | 15 |
| [14 · Mancuernas · segundo pack](exercise-guide-batch-14-prompts.md) | 5 | 10 | 72/82 | 10 |
| [15 · Kettlebell · primer pack](exercise-guide-batch-15-prompts.md) | 5 | 11 | 77/82 | 5 |
| [16 · Kettlebell · segundo pack y cierre de catálogo](exercise-guide-batch-16-prompts.md) | 5 | 13 | 82/82 | 0 |

Esta entrega añade 25 ejercicios y 57 imágenes. Los 140 PNG anteriores (139 posturas y avatar maestro) se conservan sin cambios.

## Archivos y revisión

- Producción: `public/exercises/<id>/{01,02,03}.png` (solo dos archivos cuando corresponde), 256×256RGBA.
- Originales y prompts completos: `work/exercise-guides-generation.local/originals/` y `manifest-batch-{12..16}.json`.
- Comparativa local: http://127.0.0.1:5210/work/exercise-guides-review.local/index.html, selector de tandas12–16; reproducción automática y pausa.
- Capturas: `work/exercise-guides-generation.local/preview-batch-{12..16}-dark.jpg`; última tanda también en claro.

## Comprobaciones

- Todos los ID del catálogo tienen guía y todas las rutas registradas corresponden a archivos presentes.
- Cada guía dispone de 2–3 PNG consecutivos, cuadrados y con transparencia real.
- 57 PNG nuevos, sin alterar recursos anteriores.
- Compilación con base `/breakbit/`, lint y suite completa de 884 pruebas en 92 archivos correctas. Incluye cobertura del catálogo, integridad de PNG, reproducción y precaché.
- Las 196 posturas y el avatar maestro están presentes en la lista de precaché del resultado compilado.
- Comprobación visual en el visor de210px; la última tanda carga sus27imágenes visibles/precargadas sin fallos.
- Visor de ejercicio real comprobado: al pausar la guía en la postura 2/3, el cronómetro continúa de 0:55 a 0:42; el temporizador queda debajo de la ilustración.

La generación está completa. El visor compartido de pausas y rutinas utiliza las 82 guías; cada secuencia puede pausarse o recorrerse manualmente sin detener el temporizador del ejercicio. Los recursos se incluyen en la precarga para uso sin conexión y respetan el prefijo `/breakbit/` de GitHub Pages.
