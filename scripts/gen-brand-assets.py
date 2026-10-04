"""Generates the app's brand assets from the logo pack originals in docs/brand.

- public/brand/wordmark-{light,dark}.png: the wordmark for light and dark themes, 132 px
  tall (3x the largest place it's shown) and reduced to 256 colours, which looks the same.
- public/app-icons/: install and home-screen icons. The mark sits on the cream background
  (home screens fill transparency with black on some platforms) at the size the pack uses
  (62.5 % of the width, the art's own resolution at 512 px); the maskable one keeps it
  inside the 80 % safe zone.
- Favicons, light and dark, and favicon.ico, as the pack draws them at that size.

    python3 scripts/gen-brand-assets.py
"""
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "docs/brand"
PUBLIC = ROOT / "public"
CREAM = (246, 241, 228, 255)  # --color-bg (light)
WORDMARK_HEIGHT = 132

# name, canvas size, width of the mark as a share of it
ICONS = [
    ("icon-192.png", 192, 0.625),
    ("icon-512.png", 512, 0.625),
    ("maskable-512.png", 512, 0.58),
    ("apple-touch-icon.png", 180, 0.625),
]

COPIES = [
    ("favicon-32-light.png", "app-icons/favicon-32.png"),
    ("favicon-32-dark.png", "app-icons/favicon-dark-32.png"),
    ("favicon.ico", "favicon.ico"),
]


def art(name: str) -> Image.Image:
    """An original cropped to its visible pixels, so it's sized and centred by what you see."""
    image = Image.open(BRAND / name).convert("RGBA")
    box = image.getbbox()
    return image.crop(box) if box else image


def resized(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.LANCZOS)


def main() -> None:
    (PUBLIC / "brand").mkdir(parents=True, exist_ok=True)
    (PUBLIC / "app-icons").mkdir(parents=True, exist_ok=True)

    for theme in ("light", "dark"):
        wordmark = art(f"wordmark-{theme}.png")
        width = round(wordmark.width * WORDMARK_HEIGHT / wordmark.height)
        small = resized(wordmark, width)
        out = PUBLIC / f"brand/wordmark-{theme}.png"
        small.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(out, optimize=True)
        print(f"{out.relative_to(ROOT)}: {small.width}x{small.height}")

    mark = art("icon-light.png")
    for name, size, share in ICONS:
        scaled = resized(mark, round(size * share))
        canvas = Image.new("RGBA", (size, size), CREAM)
        canvas.alpha_composite(scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2))
        out = PUBLIC / "app-icons" / name
        canvas.convert("RGB").save(out, optimize=True)
        print(f"{out.relative_to(ROOT)}: {size}px, mark {scaled.width}x{scaled.height}")

    for source, target in COPIES:
        shutil.copyfile(BRAND / source, PUBLIC / target)
        print(f"public/{target}: copied")


if __name__ == "__main__":
    main()
