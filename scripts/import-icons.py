#!/usr/bin/env python3
"""One-off import of the pixel-art icon library into public/icons.

Cleans sprite-sheet bleed from the 32px masters (stray fragments of neighbouring
icons on the right edge and beige separator lines on the top edge) and
regenerates the 16/24/48 sizes from the cleaned master with nearest-neighbour,
the same way the original library was produced.

Usage: python3 scripts/import-icons.py [path/to/assets/icons]
Requires Pillow.
"""
import colorsys
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

DEFAULT_SRC = Path.home() / "Downloads/breakbit_claude_starter_pack/assets/icons"
DEST = Path(__file__).resolve().parent.parent / "public/icons"
SIZES = (16, 24, 32, 48)
# Icons with sprite-sheet bleed, reviewed visually against an enlarged sheet.
# Right: fragments of the neighbouring icon. Top: beige separator lines.
RIGHT_BLEED = set(
    "add back bell calendar chart clock close coin completed edit extra first_try forward gem "
    "goal heart help info level level_up missed more multiplier pause pending perfect_day play "
    "plant postponed progress rest reward settings stop streak success warning xp".split()
)
TOP_BLEED = set("calendar call clock completed lamp meeting pending picture plant_decor rug work".split())
# Product colour decisions applied to the art (degrees of hue rotation).
HUE_SHIFT = {"extra": -40}  # "Pausa extra" is blue, the source art is violet
RIGHT_MIN_X = 23  # a right-bleed component lies entirely at or after this column
TOP_MAX_Y = 6  # a top-bleed component lies entirely at or above this row


def components(image):
    """8-connected components of opaque pixels, as lists of (x, y)."""
    alpha = image.getchannel("A")
    width, height = image.size
    seen, result = set(), []
    for y in range(height):
        for x in range(width):
            if (x, y) in seen or alpha.getpixel((x, y)) == 0:
                continue
            stack, pixels = [(x, y)], []
            seen.add((x, y))
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if (
                            0 <= nx < width
                            and 0 <= ny < height
                            and (nx, ny) not in seen
                            and alpha.getpixel((nx, ny)) > 0
                        ):
                            seen.add((nx, ny))
                            stack.append((nx, ny))
            result.append(pixels)
    return result


def clean(name, image):
    removed = 0
    for pixels in components(image):
        xs = [x for x, _ in pixels]
        ys = [y for _, y in pixels]
        is_top = name in TOP_BLEED and max(ys) <= TOP_MAX_Y
        is_right = name in RIGHT_BLEED and min(xs) >= RIGHT_MIN_X
        if is_top or is_right:
            for pixel in pixels:
                image.putpixel(pixel, (0, 0, 0, 0))
            removed += len(pixels)
    return removed


def shift_hue(image, degrees):
    """Rotates the hue of every opaque pixel, keeping saturation, value and alpha."""
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = image.getpixel((x, y))
            if a == 0:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            nr, ng, nb = colorsys.hsv_to_rgb((h + degrees / 360) % 1, s, v)
            image.putpixel((x, y), (round(nr * 255), round(ng * 255), round(nb * 255), a))


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    manifest = json.loads((src / "manifest.json").read_text())
    if DEST.exists():
        shutil.rmtree(DEST)
    for size in SIZES:
        (DEST / str(size)).mkdir(parents=True)

    ids = []
    for icon in manifest["icons"]:
        name = icon["id"]
        ids.append(name)
        master = Image.open(src / "32" / f"{name}.png").convert("RGBA")
        removed = clean(name, master)
        if removed:
            print(f"cleaned {name}: {removed} px")
        if name in HUE_SHIFT:
            shift_hue(master, HUE_SHIFT[name])
            print(f"recoloured {name}: {HUE_SHIFT[name]}°")
        for size in SIZES:
            out = master if size == 32 else master.resize((size, size), Image.NEAREST)
            out.save(DEST / str(size) / f"{name}.png", optimize=True)

    print(f"imported {len(ids)} icons into {DEST}")


if __name__ == "__main__":
    main()
