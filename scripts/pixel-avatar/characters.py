"""The avatar, phase by phase, on the 64x64 rig."""
from rig import Scene, Shape

EYE = '#1a120d'
WHITE = '#ffffff'
BLUSH = '#f0948a'


def dev_head_side(s: Scene, cx: int, cy: int, band: bool = False, tired: bool = False):
    """The developer's head in profile, facing right, centred at (cx, cy)."""
    s.add(Shape().rect(cx - 3, cy + 8, cx + 1, cy + 12), 'skin_far')  # neck
    s.add(Shape().ellipse(cx, cy, 9, 10).poly((cx + 8, cy + 1), (cx + 10, cy + 3), (cx + 8, cy + 4)),
          'skin')
    hair = (Shape()
            .poly((cx - 10, cy + 6), (cx - 12, cy + 1), (cx - 12, cy - 5), (cx - 9, cy - 10),
                  (cx - 4, cy - 12), (cx + 2, cy - 12), (cx + 6, cy - 10), (cx + 9, cy - 6),
                  (cx + 9, cy - 3), (cx + 7, cy - 4), (cx + 5, cy - 3), (cx + 3, cy - 5),
                  (cx + 1, cy - 4), (cx - 1, cy - 2), (cx - 2, cy + 2), (cx - 4, cy + 6),
                  (cx - 7, cy + 8))
            .poly((cx - 9, cy - 9), (cx - 13, cy - 13), (cx - 5, cy - 11))
            .poly((cx - 4, cy - 11), (cx - 5, cy - 16), (cx + 1, cy - 12))
            .poly((cx + 1, cy - 11), (cx + 4, cy - 16), (cx + 6, cy - 10))
            .poly((cx + 6, cy - 9), (cx + 11, cy - 11), (cx + 9, cy - 5))
            .poly((cx - 11, cy - 4), (cx - 15, cy - 5), (cx - 12, cy + 1)))
    s.add(hair, 'hair')
    s.add(Shape().ellipse(cx - 3, cy + 2, 2, 3), 'skin')  # ear
    if band:
        s.add(Shape().poly((cx - 12, cy - 7), (cx + 8, cy - 9), (cx + 9, cy - 6), (cx - 12, cy - 3)),
              'band')
    # Face: brow, eye with a highlight (or tired), cheek, mouth.
    s.pxs(MATERIALS_HAIR, (cx + 4, cy - 3), (cx + 5, cy - 3), (cx + 6, cy - 3))
    if tired:
        s.pxs(EYE, (cx + 5, cy), (cx + 6, cy))
        s.pxs('#b98a7a', (cx + 5, cy + 1), (cx + 6, cy + 1))
        s.pxs('#a8644a', (cx + 6, cy + 6), (cx + 7, cy + 6))
    else:
        s.pxs(EYE, (cx + 5, cy - 1), (cx + 5, cy), (cx + 5, cy + 1), (cx + 6, cy), (cx + 6, cy + 1))
        s.px(cx + 6, cy - 1, WHITE)
        s.pxs(BLUSH, (cx + 3, cy + 4), (cx + 4, cy + 4))
        s.pxs('#a8644a', (cx + 6, cy + 6), (cx + 7, cy + 6), (cx + 5, cy + 5))


MATERIALS_HAIR = '#2a180e'


def p5_idle() -> Scene:
    s = Scene()
    # Standing desk with monitor, keyboard and a plant.
    s.add(Shape().rrect(39, 14, 56, 30, 1), 'metal_dark')
    s.add(Shape().rect(41, 16, 54, 28), 'screen')
    s.add(Shape().rect(46, 30, 49, 34), 'metal')
    s.add(Shape().rrect(43, 33, 52, 35, 1), 'metal')
    s.add(Shape().ellipse(57, 26, 2, 4).ellipse(61, 25, 2, 4).ellipse(59, 21, 2, 4), 'leaf')
    s.add(Shape().rrect(56, 29, 62, 35, 1), 'pot')
    s.add(Shape().rect(40, 38, 42, 59).rect(57, 38, 59, 59), 'metal')
    s.add(Shape().rect(42, 49, 57, 50), 'metal_dark')
    s.add(Shape().rect(37, 58, 44, 60).rect(55, 58, 62, 60), 'metal_dark')
    s.add(Shape().rrect(35, 35, 63, 38, 1), 'wood')
    s.add(Shape().rect(35, 33, 43, 34), 'metal_dark', shaded=False)
    # Code on the screen.
    for y, (x0, x1, c) in zip(range(18, 28, 2), [(43, 49, '#2f7a4f'), (45, 53, WHITE),
                                                (45, 51, '#ffcb3d'), (43, 48, '#2f7a4f'),
                                                (45, 52, WHITE)]):
        s.pxs(c, *[(x, y) for x in range(x0, x1)])
    # The far leg and shoe, then the near ones.
    s.add(Shape().capsule((19, 43), (19, 51), 6).capsule((19, 51), (18, 57), 5), 'pants_far')
    s.add(Shape().rrect(14, 56, 23, 60, 2), 'white')
    s.add(Shape().capsule((23, 43), (24, 51), 7).capsule((24, 51), (24, 56), 6), 'pants')
    s.add(Shape().rrect(20, 55, 31, 60, 2), 'white')
    s.pxs('#33a06b', *[(x, 59) for x in range(21, 31)])
    s.pxs('#33a06b', (26, 56), (27, 57), (28, 56))
    # Hoodie with the hood on the back and drawstrings.
    s.add(Shape().rrect(14, 25, 30, 44, 5), 'hoodie')
    s.add(Shape().ellipse(16, 27, 3, 2), 'hoodie_far')
    s.pxs(WHITE, (27, 29), (27, 30), (27, 31), (28, 32))
    dev_head_side(s, 23, 15, band=True)
    # The near arm, typing.
    s.add(Shape().capsule((22, 30), (25, 38), 6).capsule((25, 38), (34, 37), 5), 'hoodie')
    s.add(Shape().ellipse(36, 36, 3, 2), 'skin')
    return s


def caveman_head_side(s: Scene, cx: int, cy: int):
    """A bearded caveman's head in profile, facing right."""
    s.add(Shape().rect(cx - 3, cy + 7, cx + 1, cy + 11), 'skin_far')
    s.add(Shape().ellipse(cx, cy, 9, 10).poly((cx + 8, cy), (cx + 11, cy + 3), (cx + 8, cy + 5)),
          'skin')
    s.add(Shape()
          .poly((cx - 10, cy + 9), (cx - 13, cy + 2), (cx - 13, cy - 5), (cx - 10, cy - 11),
                (cx - 4, cy - 13), (cx + 3, cy - 13), (cx + 8, cy - 10), (cx + 10, cy - 6),
                (cx + 7, cy - 5), (cx + 3, cy - 6), (cx, cy - 4), (cx - 2, cy + 1),
                (cx - 5, cy + 7))
          .poly((cx - 8, cy - 11), (cx - 12, cy - 15), (cx - 3, cy - 12))
          .poly((cx + 1, cy - 12), (cx + 5, cy - 16), (cx + 7, cy - 10))
          .poly((cx - 12, cy - 2), (cx - 16, cy + 1), (cx - 12, cy + 5)), 'hair')
    s.add(Shape()
          .poly((cx - 1, cy + 2), (cx + 3, cy + 4), (cx + 8, cy + 5), (cx + 10, cy + 8),
                (cx + 8, cy + 13), (cx + 3, cy + 15), (cx - 2, cy + 12), (cx - 3, cy + 6)), 'beard')
    s.add(Shape().ellipse(cx - 3, cy + 1, 2, 3), 'skin')
    s.pxs('#2a180e', (cx + 2, cy - 3), (cx + 3, cy - 3), (cx + 4, cy - 3), (cx + 5, cy - 3),
          (cx + 6, cy - 2), (cx + 3, cy - 2))
    s.pxs(EYE, (cx + 5, cy - 1), (cx + 5, cy), (cx + 6, cy))
    s.px(cx + 6, cy - 1, WHITE)
    s.pxs('#c27b52', (cx + 9, cy + 3))


def ape_head_side(s: Scene, cx: int, cy: int):
    """The first ancestor: fur, a heavy brow, a muzzle."""
    s.add(Shape().ellipse(cx - 1, cy - 1, 10, 9).poly((cx - 9, cy + 4), (cx - 4, cy + 9), (cx - 8, cy + 8)),
          'fur')
    s.add(Shape().ellipse(cx + 4, cy + 3, 6, 6).ellipse(cx + 2, cy - 1, 5, 4), 'skin_far')
    s.add(Shape().ellipse(cx - 5, cy + 1, 2, 3), 'skin_far')
    s.add(Shape().poly((cx - 1, cy - 4), (cx + 9, cy - 5), (cx + 9, cy - 3), (cx - 1, cy - 2)),
          'fur')
    s.pxs(EYE, (cx + 5, cy - 1), (cx + 6, cy - 1), (cx + 6, cy))
    s.px(cx + 5, cy, WHITE)
    s.pxs('#6a361f', (cx + 9, cy + 2), (cx + 7, cy + 6), (cx + 8, cy + 6), (cx + 9, cy + 6),
          (cx + 6, cy + 5))


def office_chair(s: Scene):
    s.add(Shape().rect(15, 47, 18, 55), 'metal')
    s.add(Shape().rect(8, 54, 26, 56), 'metal_dark')
    s.add(Shape().ellipse(9, 58, 2, 2).ellipse(17, 58, 2, 2).ellipse(25, 58, 2, 2), 'metal_dark')
    s.add(Shape().rrect(5, 25, 11, 46, 3), 'chair')
    s.add(Shape().rrect(7, 43, 27, 48, 2), 'chair')


def desk(s: Scene):
    s.add(Shape().rect(56, 41, 59, 59), 'wood_dark')
    s.add(Shape().rect(52, 58, 62, 60), 'wood_dark')
    s.add(Shape().rrect(30, 38, 63, 41, 1), 'wood')


def laptop(s: Scene, x: int, y: int):
    s.add(Shape().rrect(x, y, x + 15, y + 11, 1), 'metal_dark')
    s.add(Shape().rect(x + 2, y + 2, x + 13, y + 9), 'screen')
    s.add(Shape().rrect(x - 2, y + 11, x + 17, y + 13, 1), 'metal')
    for row, (a, b, c) in enumerate([(3, 9, '#2f7a4f'), (5, 12, WHITE), (3, 8, '#ffcb3d')]):
        s.pxs(c, *[(x + i, y + 3 + row * 2) for i in range(a, b)])


def seated_legs(s: Scene, material: str, far: str, skin_feet: bool = False):
    s.add(Shape().capsule((15, 45), (27, 46), 7).capsule((28, 46), (29, 55), 6), far)
    s.add(Shape().capsule((17, 44), (30, 44), 7).capsule((31, 45), (32, 55), 6), material)
    if skin_feet:
        s.add(Shape().rrect(29, 54, 38, 58, 2), 'skin')
    else:
        s.add(Shape().rrect(28, 54, 39, 59, 2), 'white')
        s.pxs('#33a06b', *[(x, 58) for x in range(29, 39)])


def p4_idle() -> Scene:
    s = Scene()
    desk(s)
    laptop(s, 36, 24)
    s.add(Shape().rect(57, 25, 59, 26), 'metal_dark')
    s.add(Shape().rrect(55, 27, 61, 38, 2), 'bottle')
    s.pxs(WHITE, (57, 30), (57, 31), (57, 32))
    office_chair(s)
    seated_legs(s, 'pants', 'pants_far')
    s.add(Shape().rrect(11, 26, 27, 46, 5), 'hoodie')
    s.add(Shape().ellipse(13, 28, 3, 2), 'hoodie_far')
    s.pxs(WHITE, (24, 30), (24, 31), (24, 32), (25, 33))
    dev_head_side(s, 20, 15)
    s.add(Shape().capsule((19, 31), (22, 39), 6).capsule((22, 39), (32, 37), 5), 'hoodie')
    s.add(Shape().ellipse(34, 36, 3, 2), 'skin')
    return s


def p3_idle() -> Scene:
    s = Scene()
    desk(s)
    laptop(s, 36, 24)
    s.add(Shape().ellipse(60, 33, 2, 2), 'mug')
    s.add(Shape().rrect(53, 30, 59, 38, 1), 'mug')
    s.pxs('#6b3d1e', *[(x, 31) for x in range(54, 59)])
    s.pxs('#c7ced5', (55, 27), (56, 26), (56, 28), (57, 27))
    office_chair(s)
    seated_legs(s, 'pants', 'pants_far')
    s.add(Shape().poly((11, 46), (9, 40), (10, 33), (15, 28), (23, 29), (28, 34), (28, 41), (26, 47)),
          'tee')
    dev_head_side(s, 26, 21, tired=True)
    s.add(Shape().capsule((23, 33), (25, 40), 6).capsule((25, 40), (33, 38), 5), 'tee')
    s.add(Shape().ellipse(35, 37, 3, 2), 'skin')
    return s


def p2_idle() -> Scene:
    s = Scene()
    # Stone desk, a stone "screen" and stone keys.
    s.add(Shape().poly((36, 60), (35, 50), (39, 44), (55, 44), (60, 50), (60, 60)), 'stone_dark')
    s.add(Shape().rrect(40, 21, 59, 38, 3), 'stone')
    s.add(Shape().rect(43, 24, 56, 34), 'screen')
    s.add(Shape().rrect(45, 37, 54, 41, 1), 'stone')
    s.add(Shape().rrect(30, 40, 62, 45, 2), 'stone')
    s.add(Shape().rrect(31, 38, 41, 40, 1), 'stone_dark', shaded=False)
    s.pxs('#c4bdb0', (33, 39), (35, 39), (37, 39), (39, 39))
    s.pxs('#e6f4ff', (45, 26), (46, 26), (47, 26), (45, 27))
    # A log to sit on.
    s.add(Shape().rrect(3, 47, 24, 56, 4), 'wood_dark')
    s.add(Shape().ellipse(5, 51, 2, 4), 'wood')
    seated_legs(s, 'skin', 'skin_far', skin_feet=True)
    s.add(Shape().poly((10, 48), (8, 40), (10, 33), (15, 28), (22, 28), (27, 33), (27, 42), (24, 49)),
          'skin')
    s.add(Shape().poly((9, 49), (9, 41), (13, 38), (26, 36), (27, 44), (24, 50)), 'hide')
    s.add(Shape().poly((15, 29), (19, 28), (26, 37), (22, 38)), 'hide')
    caveman_head_side(s, 26, 19)
    s.add(Shape().capsule((22, 32), (25, 40), 6).capsule((25, 40), (33, 39), 5), 'skin')
    s.add(Shape().ellipse(35, 38, 3, 2), 'skin')
    return s


def p1_idle() -> Scene:
    s = Scene()
    # A boulder for a desk and a laptop made of stone.
    s.add(Shape().poly((33, 60), (32, 53), (36, 48), (45, 46), (57, 46), (62, 51), (63, 60)), 'stone')
    s.add(Shape().rrect(41, 32, 53, 44, 2), 'stone_dark')
    s.add(Shape().rect(43, 34, 51, 41), 'screen')
    s.add(Shape().rrect(38, 43, 56, 47, 1), 'stone_dark')
    s.pxs('#e6f4ff', (44, 35), (45, 35), (44, 36))
    # Back leg, hunched body, front leg, long arm, head low and forward.
    s.add(Shape().capsule((10, 50), (10, 57), 7), 'fur_far')
    s.add(Shape().rrect(5, 55, 15, 60, 2), 'skin_far')
    s.add(Shape().poly((5, 53), (4, 45), (7, 37), (13, 32), (22, 32), (28, 37), (29, 45), (26, 53)),
          'fur')
    s.add(Shape().capsule((18, 49), (21, 56), 7), 'fur')
    s.add(Shape().rrect(16, 55, 26, 60, 2), 'skin_far')
    ape_head_side(s, 28, 27)
    s.add(Shape().capsule((23, 37), (28, 45), 7).capsule((28, 45), (36, 46), 6), 'fur')
    s.add(Shape().ellipse(38, 46, 3, 2), 'skin_far')
    return s


SCENES = {
    '1-idle': p1_idle,
    '2-idle': p2_idle,
    '3-idle': p3_idle,
    '4-idle': p4_idle,
    '5-idle': p5_idle,
}
