"""Contact sheet of icons (for review, not part of the build).

    python3 scripts/pixel-icons/preview.py OUT.png [category ...]
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from build import load_icons  # noqa: E402
from palette import PALETTE  # noqa: E402

# The previous set, for side-by-side review (optional: shown when present).
OLD = Path(__file__).resolve().parents[2] / 'public/icons/32'


def render(grid, scale):
    image = Image.new('RGBA', (16 * scale, 16 * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch in PALETTE:
                draw.rectangle([x * scale, y * scale, x * scale + scale - 1, y * scale + scale - 1],
                               fill=PALETTE[ch])
    return image


def main():
    out = sys.argv[1]
    categories = sys.argv[2:]
    icons = load_icons(categories or None)
    names = list(icons)
    cols = 5
    cw, ch = 250, 124
    rows = (len(names) + cols - 1) // cols
    sheets = []
    for bg, fg in (((246, 241, 228), (90, 100, 95)), ((13, 33, 30), (160, 180, 170))):
        sheet = Image.new('RGB', (cols * cw, rows * ch), bg)
        draw = ImageDraw.Draw(sheet)
        for i, name in enumerate(names):
            x, y = (i % cols) * cw + 6, (i // cols) * ch + 6
            old = OLD / f'{name}.png'
            if old.exists():
                image = Image.open(old).convert('RGBA').resize((48, 48), Image.NEAREST)
                sheet.paste(image, (x, y + 24), image)
            new = render(icons[name], 6)
            sheet.paste(new, (x + 56, y), new)
            small = render(icons[name], 2)
            sheet.paste(small, (x + 160, y + 32), small)
            draw.text((x, y + 102), name, fill=fg)
        sheets.append(sheet)
    full = Image.new('RGB', (sheets[0].width, sheets[0].height * 2 + 10), (128, 128, 128))
    full.paste(sheets[0], (0, 0))
    full.paste(sheets[1], (0, sheets[0].height + 10))
    full.save(out)
    print(out, full.size)


if __name__ == '__main__':
    main()
