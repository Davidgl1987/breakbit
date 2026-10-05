"""Shared shapes, so icons of one family (round badges) match exactly."""

CIRCLE = [
    '................',
    '.....KKKKKK.....',
    '...KKXXXXXXKK...',
    '..KXXXXXXXXXXK..',
    '.KXXXXXXXXXXXXK.',
    '.KXXXXXXXXXXXXK.',
    'KXXXXXXXXXXXXXXK',
    'KXXXXXXXXXXXXXXK',
    'KXXXXXXXXXXXXXXK',
    'KXXXXXXXXXXXXXxK',
    '.KXXXXXXXXXXXxK.',
    '.KXXXXXXXXXXXxK.',
    '..KXXXXXXXXXxK..',
    '...KKxxxxxxKK...',
    '.....KKKKKK.....',
    '................',
]

# A highlight at the top left of every round badge.
SHINE = {(3, 3), (4, 3), (3, 4)}


def badge(fill: str, shade: str, light: str, glyph: str, ink: str = 'W') -> str:
    """A round badge in `fill` with `glyph` ('#' marks) drawn in `ink`."""
    marks = [row.strip() for row in glyph.strip().splitlines()]
    rows = []
    for y, row in enumerate(CIRCLE):
        out = []
        for x, ch in enumerate(row):
            mark = marks[y][x] if y < len(marks) and x < len(marks[y]) else '.'
            if ch in 'Xx' and mark == '#':
                out.append(ink)
            elif ch == 'X':
                out.append(light if (x, y) in SHINE else fill)
            elif ch == 'x':
                out.append(shade)
            else:
                out.append(ch)
        rows.append(''.join(out))
    return '\n'.join(rows)
