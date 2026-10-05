"""A small pixel-art renderer for the avatar (64x64).

A scene is a stack of parts. Each part is a shape (ellipses, rectangles, polygons,
capsules for limbs) in one material; the renderer shades it (light from the top left,
shadow at the bottom right) and outlines it with the material's dark tone, the way
pixel artists do ("sel-out"): the outside edge of the figure and the edges of a part
in front of another one. Details (eyes, logos, stitching) go on top as plain pixels.
"""
from PIL import Image, ImageDraw

SIZE = 64

# outline, shadow, base, light
MATERIALS = {
    'skin': ('#7a3f24', '#d48a5f', '#f2bd93', '#ffdcbf'),
    'skin_far': ('#6a361f', '#c27b52', '#dda67d', '#eec29e'),
    'hair': ('#21130b', '#3f2818', '#5e3d28', '#87603f'),
    'fur': ('#3d1d0f', '#7d4024', '#ad6236', '#d08550'),
    'fur_far': ('#331809', '#6c371f', '#94532d', '#b56f42'),
    'beard': ('#21130b', '#4a2f1c', '#6e4a2f', '#946a45'),
    'hoodie': ('#0d3a26', '#1f6e48', '#33a06b', '#6fcf9c'),
    'hoodie_far': ('#0a2e1e', '#195b3b', '#28855a', '#55b585'),
    'tee': ('#122c58', '#22549e', '#3878cc', '#74aaea'),
    'tee_far': ('#0e2448', '#1c4683', '#2e65ad', '#5c92d4'),
    'pants': ('#151b30', '#2b3454', '#3f4b74', '#5c6a98'),
    'pants_far': ('#10152a', '#232b47', '#333d61', '#4a5682'),
    'shorts': ('#1b1f26', '#2f353f', '#454c58', '#626b79'),
    'hide': ('#47280f', '#8e5428', '#c0844c', '#e2b07a'),
    'stone': ('#353330', '#67625a', '#938d82', '#c4bdb0'),
    'stone_dark': ('#2b2926', '#524e48', '#77726a', '#9e988c'),
    'wood': ('#3a200f', '#8a512b', '#bf8350', '#e3b27c'),
    'wood_dark': ('#2e190b', '#6e3f20', '#9a6438', '#c08b58'),
    'metal': ('#22282d', '#5e6972', '#97a2ab', '#d6dde2'),
    'metal_dark': ('#1a1f23', '#3d454c', '#5a646d', '#7d8891'),
    'screen': ('#1c2b44', '#3a73c4', '#8fc4f3', '#e6f4ff'),
    'white': ('#4f5963', '#bcc5cd', '#eef1f4', '#ffffff'),
    'sole': ('#0d3a26', '#1f6e48', '#33a06b', '#6fcf9c'),
    'leaf': ('#0d3a26', '#1f6e48', '#36a56d', '#7fd8a8'),
    'pot': ('#4f230e', '#a64e25', '#d9733f', '#f3a274'),
    'chair': ('#141a26', '#2a3346', '#3d4a63', '#5b6b88'),
    'mug': ('#4f5963', '#c7ced5', '#f2f4f6', '#ffffff'),
    'coffee': ('#2a160a', '#4a2a14', '#6b3d1e', '#8a5530'),
    'bottle': ('#122c58', '#22549e', '#3878cc', '#9ccaf5'),
    'band': ('#4f5963', '#c7ced5', '#f2f4f6', '#ffffff'),
}


class Shape:
    """A union of primitives, rasterised on demand."""

    def __init__(self):
        self.ops = []

    def ellipse(self, cx, cy, rx, ry):
        self.ops.append(('ellipse', (cx - rx, cy - ry, cx + rx, cy + ry)))
        return self

    def rect(self, x0, y0, x1, y1):
        self.ops.append(('rect', (x0, y0, x1, y1)))
        return self

    def rrect(self, x0, y0, x1, y1, r):
        self.ops.append(('rrect', (x0, y0, x1, y1, r)))
        return self

    def poly(self, *points):
        self.ops.append(('poly', points))
        return self

    def capsule(self, p0, p1, width):
        """A limb: a thick segment with round ends."""
        self.ops.append(('capsule', (p0, p1, width)))
        return self

    def mask(self) -> set:
        image = Image.new('L', (SIZE, SIZE), 0)
        draw = ImageDraw.Draw(image)
        for kind, args in self.ops:
            if kind == 'ellipse':
                draw.ellipse(args, fill=255)
            elif kind == 'rect':
                draw.rectangle(args, fill=255)
            elif kind == 'rrect':
                x0, y0, x1, y1, r = args
                draw.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=255)
            elif kind == 'poly':
                draw.polygon(args, fill=255)
            elif kind == 'capsule':
                (x0, y0), (x1, y1), width = args
                draw.line((x0, y0, x1, y1), fill=255, width=width)
                r = (width - 1) / 2
                for x, y in ((x0, y0), (x1, y1)):
                    draw.ellipse((x - r, y - r, x + r, y + r), fill=255)
        pixels = image.load()
        return {(x, y) for y in range(SIZE) for x in range(SIZE) if pixels[x, y]}


class Scene:
    def __init__(self):
        self.parts = []  # (mask, material, shaded)
        self.details = []  # (x, y, colour)

    def add(self, shape: Shape, material: str, shaded: bool = True) -> 'Scene':
        self.parts.append((shape.mask(), material, shaded))
        return self

    def px(self, x: int, y: int, colour: str) -> 'Scene':
        self.details.append((x, y, colour))
        return self

    def pxs(self, colour: str, *points) -> 'Scene':
        for x, y in points:
            self.px(x, y, colour)
        return self

    def tone(self, material: str, index: int) -> str:
        return MATERIALS[material][index]

    def render(self) -> list[list[str | None]]:
        owner = [[-1] * SIZE for _ in range(SIZE)]
        for i, (mask, _material, _shaded) in enumerate(self.parts):
            for x, y in mask:
                owner[y][x] = i

        def at(x, y):
            return owner[y][x] if 0 <= x < SIZE and 0 <= y < SIZE else -1

        grid: list[list[str | None]] = [[None] * SIZE for _ in range(SIZE)]
        for y in range(SIZE):
            for x in range(SIZE):
                i = owner[y][x]
                if i < 0:
                    continue
                _mask, material, shaded = self.parts[i]
                outline, shadow, base, light = MATERIALS[material]
                neighbours = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)]
                # The edge of the figure, or of a part in front of one behind it.
                if any(n != i and n < i for n in neighbours):
                    grid[y][x] = outline
                    continue
                if not shaded:
                    grid[y][x] = base
                    continue
                if at(x + 1, y + 1) != i or at(x + 2, y + 1) != i or at(x + 1, y + 2) != i:
                    grid[y][x] = shadow
                elif at(x - 1, y - 1) != i or at(x - 2, y - 1) != i:
                    grid[y][x] = light
                else:
                    grid[y][x] = base
        for x, y, colour in self.details:
            if 0 <= x < SIZE and 0 <= y < SIZE:
                grid[y][x] = colour
        return grid


def svg(grid: list[list[str | None]]) -> str:
    h, w = len(grid), len(grid[0])
    by_colour: dict[str, list[str]] = {}
    for y, row in enumerate(grid):
        x = 0
        while x < w:
            colour, end = row[x], x
            while end < w and row[end] == colour:
                end += 1
            if colour:
                by_colour.setdefault(colour, []).append(f'M{x} {y}h{end - x}v1h{x - end}z')
            x = end
    paths = ''.join(f'<path fill="{c}" d="{"".join(d)}"/>' for c, d in by_colour.items())
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'shape-rendering="crispEdges">{paths}</svg>\n'
    )


def image(grid, scale: int = 1):
    out = Image.new('RGBA', (SIZE * scale, SIZE * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    for y, row in enumerate(grid):
        for x, colour in enumerate(row):
            if colour:
                draw.rectangle([x * scale, y * scale, x * scale + scale - 1, y * scale + scale - 1],
                               fill=colour)
    return out
