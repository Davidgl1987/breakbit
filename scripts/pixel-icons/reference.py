"""Reference images and prompts for drawing the icon set with an image AI.

    python3 scripts/pixel-icons/reference.py

Writes docs/iconos/: one reference per sheet (the current icons in their cells, numbered,
so the AI knows what goes where), a style reference from the avatar, and
docs/prompts-iconos.md with the prompts. Everything comes from sheets.py.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from sheets import SHEET_SIZE, SHEETS, SPRITE, all_icons  # noqa: E402

OUT = ROOT / 'docs/iconos'
DOC = ROOT / 'docs/prompts-iconos.md'
BACKGROUND = (246, 241, 228)
GRID = (205, 196, 176)
NUMBER = (120, 112, 96)


ICONS = ROOT / 'public/icons'


def main() -> None:
    icons = {path.stem: path for path in ICONS.glob('*.png')}
    missing = [name for name in all_icons() if name not in icons]
    if missing:
        sys.exit(f'Iconos sin dibujo actual: {", ".join(missing)}')
    OUT.mkdir(parents=True, exist_ok=True)
    for file, _title, cols, rows, items in SHEETS:
        reference(icons, cols, rows, [name for name, _ in items]).save(OUT / file)
    style().save(OUT / 'estilo-avatar.png')
    DOC.write_text(prompts())
    print(f'{len(SHEETS)} hojas + estilo → {OUT.relative_to(ROOT)}, {DOC.relative_to(ROOT)}')


def reference(icons, cols: int, rows: int, names: list[str]) -> Image.Image:
    cell = SHEET_SIZE // cols
    sheet = Image.new('RGB', (SHEET_SIZE, SHEET_SIZE), BACKGROUND)
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=cell // 9)
    for index in range(cols * rows):
        x, y = (index % cols) * cell, (index // cols) * cell
        draw.rectangle([x, y, x + cell - 1, y + cell - 1], outline=GRID, width=2)
        if index >= len(names):
            continue
        # The drawing area of a 32x32 sprite with a 2-pixel margin.
        scale = cell // SPRITE
        inset = 2 * scale
        draw.rectangle(
            [x + inset, y + inset, x + cell - inset - 1, y + cell - inset - 1],
            outline=GRID,
            width=1,
        )
        art = Image.open(icons[names[index]]).convert('RGBA')
        art = art.resize((cell // 2, cell // 2), Image.Resampling.NEAREST)
        sheet.paste(art, (x + cell // 4, y + cell // 4), art)
        draw.text((x + inset + 6, y + inset + 4), str(index + 1), fill=NUMBER, font=font)
    return sheet


def style() -> Image.Image:
    """The avatar, so the icons look like they belong to the same game."""
    poses = ['4-thumbs_up', '5-idle', '5-celebrate']
    size = 384
    out = Image.new('RGB', (size * len(poses), size), BACKGROUND)
    for index, pose in enumerate(poses):
        art = Image.open(ROOT / f'public/avatar/{pose}.png').convert('RGBA')
        art = art.resize((size, size), Image.Resampling.NEAREST)
        out.paste(art, (index * size, 0), art)
    return out


MASTER = """Vas a crear el set de iconos de Breakbit, una app que te ayuda a hacer pausas cortas para moverte durante la jornada de trabajo. Son {count} iconos repartidos en {sheets} hojas. Te adjunto «estilo-avatar.png»: es el avatar de la app, y los iconos tienen que parecer del mismo juego.

ESTILO (obligatorio en todos los iconos):
- Pixel art de 16 bits, como el avatar (estilo consola SNES/GBA): sombreado en 3 o 4 tonos por material, luz desde arriba a la izquierda, colores vivos pero suaves.
- Cada icono es un sprite de 32×32 píxeles. En la hoja, cada píxel del sprite es un bloque cuadrado (de 8×8 px en las hojas de 4×4 celdas): todos iguales y alineados, sin antialiasing, sin degradados, sin difuminados y sin textura de ruido.
- Contorno exterior de 1 píxel en verde muy oscuro, casi negro (#1D2B26), igual en todos los iconos.
- Siluetas grandes y claras: tienen que entenderse a 24 px de tamaño. Pocos detalles pequeños.
- Vista frontal o 3/4 ligera, coherente en todo el set.
- Paleta de la marca: verde bosque #2F6F46, verde #38A872, verde suave #6FAF8F, teal #2FB5A5, azul #3B82D6, azul polvo #7B9CCB, naranja #F4A261, dorado #FFCB3D, rojo #E5484D, crema #FFF8EE y grises neutros. El coral #FF5A3C se reserva para resaltar la zona del cuerpo en los iconos de zonas.
- «La persona» que aparece en algunos iconos es el chico del avatar en miniatura: pelo castaño alborotado, piel clara cálida, sudadera verde, vaquero oscuro y zapatillas blancas.

FORMATO DE CADA HOJA (obligatorio):
- PNG cuadrado de 1024×1024 con FONDO TRANSPARENTE de verdad.
- Una cuadrícula invisible de celdas iguales (4×4 celdas de 256×256 px, salvo que te diga otra): un icono por celda, en el orden que te indique, de izquierda a derecha y de arriba abajo.
- Cada icono centrado en su celda y ocupando como mucho 28×28 de sus 32×32 píxeles (2 píxeles de margen alrededor), sin tocar las celdas vecinas.
- Sin texto, sin números y sin letras (salvo las que forman parte del propio icono, como la «i» o el «1»). Sin líneas de cuadrícula, sin marcos, sin sombras en el suelo y sin halos alrededor.
- Con cada hoja te adjuntaré una referencia con los iconos actuales en su celda: es solo para que sepas qué va en cada sitio. No copies su estilo (son de 8 bits): rediséñalos en el estilo de 16 bits del avatar. Los números, las líneas y el fondo crema de la referencia NO se dibujan.

Te iré pidiendo las hojas una a una con su nombre de archivo. Respeta exactamente ese nombre. Confírmame que lo has entendido antes de empezar."""


def sheet_prompt(file: str, title: str, cols: int, rows: int, items) -> str:
    cell = SHEET_SIZE // cols
    scale = cell // SPRITE
    lines = [
        f'{file} — {title}. Cuadrícula {cols}×{rows} (celdas de {cell}×{cell} px; cada píxel '
        f'del sprite es un bloque de {scale}×{scale} px). Te adjunto la referencia con los iconos '
        'actuales en su sitio. Dibuja, de izquierda a derecha y de arriba abajo:',
    ]
    for row in range(rows):
        cells = items[row * cols:(row + 1) * cols]
        if not cells:
            break
        lines.append(f'Fila {row + 1}:')
        for index, (_name, text) in enumerate(cells, start=row * cols + 1):
            lines.append(f'{index}. {text}')
    if len(items) < cols * rows:
        empty = ', '.join(str(n) for n in range(len(items) + 1, cols * rows + 1))
        lines.append(f'La celda {empty} queda vacía (transparente).')
    lines.append(
        'Recuerda: PNG 1024×1024 con fondo transparente, un sprite de 32×32 por celda, '
        'contorno #1D2B26, sin texto, sin números de celda y sin cuadrícula.'
    )
    return '\n'.join(lines)


def prompts() -> str:
    count = len(all_icons())
    files = [file for file, *_ in SHEETS]
    parts = [
        '# Prompts para generar los iconos de Breakbit',
        '',
        '<!-- Generado por scripts/pixel-icons/reference.py a partir de sheets.py. -->',
        '',
        f'{count} iconos en {len(SHEETS)} hojas, en el estilo de 16 bits del avatar. Son los que '
        'usa la app ahora mismo; los del pack original que no se usan no se piden.',
        '',
        '## Qué adjuntar',
        '',
        'Todo está en [docs/iconos/](iconos/):',
        '',
        '- `estilo-avatar.png`: el avatar, como referencia de estilo. Se adjunta con el prompt '
        'maestro.',
        '- Una referencia por hoja (`hoja-1-cuerpo.png`…): los iconos actuales en la celda que '
        'les toca, numerados. Se adjunta con el prompt de su hoja.',
        '',
        '## Formato que necesito',
        '',
        '- PNG de 1024×1024 con fondo transparente, una imagen por hoja, con el nombre exacto.',
        '- Cuadrícula de 4×4 celdas de 256 px (la hoja 6 es de 2×2 celdas de 512 px).',
        '- Cada icono es un sprite de 32×32 píxeles grandes y nítidos (bloques de 8×8 px; de '
        '16×16 en la hoja 6), centrado en su celda y con 2 píxeles de margen.',
        '- Da igual que la IA no clave la cuadrícula al píxel: al importarlos yo ajusto cada icono '
        'a su rejilla, quito restos de fondo, igualo la paleta y los centro.',
        '',
        '## Cómo usarlos',
        '',
        '1. Abre un chat nuevo en ChatGPT, adjunta `estilo-avatar.png` y pega el **prompt '
        'maestro**. Espera a que confirme.',
        '2. Para cada hoja, adjunta su referencia y pega su prompt. Descarga la imagen con el '
        'nombre que indica.',
        '3. Si un icono sale mal, pide repetir la hoja indicando el número de celda y qué '
        'corregir. Si solo falla uno, puedes pedir ese icono suelto en una imagen de 1024×1024 '
        'y decirme a qué icono corresponde.',
        '4. Al final, pega el **prompt del zip** (si no puede, descarga las hojas una a una).',
        '',
        '## Prompt maestro (con `estilo-avatar.png` adjunta)',
        '',
        '```text',
        MASTER.format(count=count, sheets=len(SHEETS)),
        '```',
        '',
        '## Las hojas (de una en una, cada una con su referencia)',
        '',
    ]
    for file, title, cols, rows, items in SHEETS:
        parts += [
            f'### {file}',
            '',
            f'![Referencia de {file}](iconos/{file})',
            '',
            '```text',
            sheet_prompt(file, title, cols, rows, items),
            '```',
            '',
        ]
    parts += [
        '## Prompt del zip (al terminar)',
        '',
        '```text',
        f'Mete las {len(SHEETS)} hojas en un zip llamado breakbit-iconos.zip, con estos nombres '
        f'exactos y en PNG con fondo transparente: {", ".join(files)}. Antes de crearlo, '
        'comprueba que están todas, que ninguna tiene fondo y que no hay números ni líneas de '
        'cuadrícula.',
        '```',
        '',
        '## Comprobación',
        '',
        '| Hoja | Iconos |',
        '|---|---|',
    ]
    for file, _title, _cols, _rows, items in SHEETS:
        parts.append(f'| `{file}` | {", ".join(name for name, _ in items)} |')
    parts += [
        '',
        'Cuando las tengas, déjalas en una carpeta (o el zip) y dime dónde están. Yo me encargo '
        'de recortar cada icono de su celda, ajustarlo a su rejilla de 32×32, limpiar el fondo, '
        'igualar paleta y encuadre y cambiarlos en la app.',
        '',
    ]
    return '\n'.join(parts)


if __name__ == '__main__':
    main()
