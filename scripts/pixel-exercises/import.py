"""Prepare separate guide frames at 256px, preserving their shared canvas and alpha.

    python3 scripts/pixel-exercises/import.py work/exercise-guides-generation.local/originals

Source: avatar-master.png plus <catalog-exercise-id>/01.png, 02.png (optionally 03.png).
Only the supplied exercises are written; previous guides are preserved. Needs Pillow.
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SIZE = (256, 256)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    source = args.source.expanduser()
    catalog = json.loads((ROOT / 'src/content/catalogo-breakbit.json').read_text())
    known = {exercise['id'] for exercise in catalog['exercises']}
    output = ROOT / 'public/exercises'
    jobs = []
    master = source / 'avatar-master.png'
    if master.is_file():
        jobs.append((master, output / 'avatar.png'))
    for folder in sorted(source.iterdir()):
        if not folder.is_dir():
            continue
        if folder.name not in known:
            parser.error(f'Unknown exercise: {folder.name}')
        frames = sorted(folder.glob('*.png'))
        expected = [f'{number:02}.png' for number in range(1, len(frames) + 1)]
        if len(frames) not in (2, 3) or [frame.name for frame in frames] != expected:
            parser.error(f'{folder.name}: expected 01.png, 02.png and optionally 03.png')
        sizes = set()
        for frame in frames:
            with Image.open(frame) as image:
                sizes.add(image.size)
        if len(sizes) != 1:
            parser.error(f'{folder.name}: frame canvases must have the same dimensions')
        jobs.extend((frame, output / folder.name / frame.name) for frame in frames)

    # Validate every source before touching any existing production resource.
    for original, _ in jobs:
        with Image.open(original) as image:
            if image.width != image.height or image.mode != 'RGBA':
                parser.error(f'{original}: expected a square RGBA image')
            if image.getchannel('A').getextrema() != (0, 255):
                parser.error(f'{original}: expected a genuinely transparent background')
    for original, target in jobs:
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(original) as image:
            # The same transform for every frame; never crop or recenter individual poses.
            image.resize(SIZE, Image.Resampling.NEAREST).save(target, optimize=True)
        print(f'{target.relative_to(ROOT)} · 256×256 · {target.stat().st_size} bytes')


if __name__ == '__main__':
    main()
