"""Review sheet for the 64x64 avatar: python3 scripts/pixel-avatar/preview.py OUT.png [name ...]"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from characters import SCENES as IDLE  # noqa: E402
from gestures import SCENES as GESTURES  # noqa: E402

SCENES = {**IDLE, **GESTURES}
from rig import image  # noqa: E402


def main():
    out = sys.argv[1]
    names = sys.argv[2:] or list(SCENES)
    big, small = 6, 2
    cw = 64 * big + 64 * small + 24
    sheet = Image.new('RGB', (cw * len(names), (64 * big + 24) * 2 + 8), (128, 128, 128))
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(names):
        grid = SCENES[name]().render()
        for j, bg in enumerate(((220, 239, 223), (28, 74, 58))):
            x, y = i * cw, j * (64 * big + 24 + 8)
            draw.rectangle([x, y, x + cw - 6, y + 64 * big + 20], fill=bg)
            a, b = image(grid, big), image(grid, small)
            sheet.paste(a, (x + 4, y + 4), a)
            sheet.paste(b, (x + 64 * big + 12, y + 4), b)
            draw.text((x + 6, y + 64 * big + 6), name, fill=(60, 60, 60) if j == 0 else (210, 210, 210))
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
