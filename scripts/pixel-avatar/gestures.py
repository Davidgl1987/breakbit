"""Front-facing avatar gestures, from the waist up: cheer, celebrate, thumbs up.
And the full-body demo pose of the last phase."""
from rig import Scene, Shape

EYE = '#1a120d'
WHITE = '#ffffff'
BLUSH = '#f0948a'
MOUTH = '#5a1f1a'
TONGUE = '#e86a6a'
BROW = '#2a180e'
SPARK = ('#ffcb3d', '#fff1a6', '#ff8a3d')
CONFETTI = ('#ffcb3d', '#3878cc', '#ff8a3d', '#33a06b', '#f0948a')

# Per phase: skin for hands, sleeve and forearm materials, torso material.
PHASES = {
    1: dict(hand='skin_far', sleeve='fur', forearm='fur', torso='fur'),
    2: dict(hand='skin', sleeve='skin', forearm='skin', torso='skin'),
    3: dict(hand='skin', sleeve='tee', forearm='skin', torso='tee'),
    4: dict(hand='skin', sleeve='hoodie', forearm='hoodie', torso='hoodie'),
    5: dict(hand='skin', sleeve='hoodie', forearm='hoodie', torso='hoodie'),
}


# ---- faces -------------------------------------------------------------------------

def eyes(s, cx, cy, expression):
    for ex in (cx - 5, cx + 4):
        if expression == 'joy' or (expression == 'wink' and ex > cx):
            s.pxs(EYE, (ex - 1, cy + 2), (ex, cy + 1), (ex + 1, cy + 1), (ex + 2, cy + 2))
        else:
            s.pxs(EYE, (ex, cy), (ex + 1, cy), (ex, cy + 1), (ex + 1, cy + 1), (ex, cy + 2),
                  (ex + 1, cy + 2))
            s.px(ex, cy, WHITE)


def mouth(s, cx, cy, expression, colour=MOUTH):
    if expression in ('open', 'joy'):
        for y in range(cy + 7, cy + 11):
            for x in range(cx - 3, cx + 3):
                s.px(x, y, colour)
        s.pxs(WHITE, *[(x, cy + 7) for x in range(cx - 2, cx + 2)])
        s.pxs(TONGUE, (cx - 1, cy + 10), (cx, cy + 10), (cx - 2, cy + 10), (cx + 1, cy + 10))
        s.pxs(colour, (cx - 4, cy + 7), (cx + 3, cy + 7))
    else:
        s.pxs(colour, (cx - 3, cy + 7), (cx + 2, cy + 7), *[(x, cy + 8) for x in range(cx - 2, cx + 2)])


def dev_head_front(s, cx, cy, expression, band=False):
    s.add(Shape().ellipse(cx - 12, cy + 2, 2, 3).ellipse(cx + 12, cy + 2, 2, 3), 'skin')
    s.add(Shape().ellipse(cx, cy, 12, 13), 'skin')
    hair = (Shape()
            .poly((cx - 13, cy + 3), (cx - 14, cy - 4), (cx - 11, cy - 11), (cx - 6, cy - 15),
                  (cx, cy - 16), (cx + 6, cy - 15), (cx + 11, cy - 11), (cx + 14, cy - 4),
                  (cx + 13, cy + 3), (cx + 11, cy - 2), (cx + 9, cy - 5), (cx + 7, cy - 3),
                  (cx + 4, cy - 6), (cx + 1, cy - 4), (cx - 2, cy - 7), (cx - 5, cy - 4),
                  (cx - 8, cy - 6), (cx - 10, cy - 2), (cx - 11, cy + 1))
            .poly((cx - 9, cy - 13), (cx - 13, cy - 19), (cx - 4, cy - 15))
            .poly((cx - 3, cy - 15), (cx - 1, cy - 21), (cx + 3, cy - 15))
            .poly((cx + 3, cy - 15), (cx + 8, cy - 20), (cx + 9, cy - 12))
            .poly((cx + 11, cy - 11), (cx + 16, cy - 14), (cx + 13, cy - 6))
            .poly((cx - 12, cy - 9), (cx - 17, cy - 10), (cx - 13, cy - 4)))
    s.add(hair, 'hair')
    if band:
        s.add(Shape().poly((cx - 14, cy - 9), (cx + 14, cy - 9), (cx + 14, cy - 6), (cx - 14, cy - 6)),
              'band')
        s.pxs('#33a06b', *[(x, cy - 7) for x in range(cx - 12, cx + 13)])
    s.pxs(BROW, (cx - 6, cy - 3), (cx - 5, cy - 3), (cx - 4, cy - 3),
          (cx + 3, cy - 3), (cx + 4, cy - 3), (cx + 5, cy - 3))
    eyes(s, cx, cy, expression)
    s.pxs('#d48a5f', (cx, cy + 4), (cx - 1, cy + 5))
    s.pxs(BLUSH, (cx - 9, cy + 5), (cx - 8, cy + 5), (cx + 7, cy + 5), (cx + 8, cy + 5))
    mouth(s, cx, cy, expression)


def caveman_head_front(s, cx, cy, expression):
    s.add(Shape().poly((cx - 15, cy + 12), (cx - 17, cy), (cx - 14, cy - 12), (cx, cy - 18),
                       (cx + 14, cy - 12), (cx + 17, cy), (cx + 15, cy + 12)), 'hair')
    s.add(Shape().ellipse(cx - 12, cy + 2, 2, 3).ellipse(cx + 12, cy + 2, 2, 3), 'skin')
    s.add(Shape().ellipse(cx, cy, 12, 13), 'skin')
    s.add(Shape()
          .poly((cx - 13, cy - 1), (cx - 12, cy - 10), (cx - 6, cy - 15), (cx + 6, cy - 15),
                (cx + 12, cy - 10), (cx + 13, cy - 1), (cx + 9, cy - 6), (cx + 5, cy - 4),
                (cx + 1, cy - 7), (cx - 3, cy - 4), (cx - 7, cy - 6), (cx - 10, cy - 3))
          .poly((cx - 8, cy - 14), (cx - 12, cy - 21), (cx - 2, cy - 15))
          .poly((cx + 2, cy - 15), (cx + 9, cy - 21), (cx + 8, cy - 13)), 'hair')
    s.add(Shape().poly((cx - 12, cy + 1), (cx - 8, cy + 4), (cx - 3, cy + 5), (cx + 3, cy + 5),
                       (cx + 8, cy + 4), (cx + 12, cy + 1), (cx + 11, cy + 9), (cx + 6, cy + 15),
                       (cx, cy + 17), (cx - 6, cy + 15), (cx - 11, cy + 9)), 'beard')
    # Two bushy brows (a single bar reads as sunglasses).
    s.pxs(BROW, (cx - 7, cy - 3), (cx - 6, cy - 4), (cx - 5, cy - 4), (cx - 4, cy - 4), (cx - 3, cy - 3),
          (cx + 2, cy - 3), (cx + 3, cy - 4), (cx + 4, cy - 4), (cx + 5, cy - 4), (cx + 6, cy - 3))
    eyes(s, cx, cy, expression)
    s.pxs('#c27b52', (cx, cy + 3), (cx - 1, cy + 4), (cx + 1, cy + 4))
    mouth(s, cx, cy, expression, colour='#3a160f')


def ape_head_front(s, cx, cy, expression):
    s.add(Shape().ellipse(cx - 13, cy + 2, 3, 4).ellipse(cx + 13, cy + 2, 3, 4), 'skin_far')
    s.add(Shape().ellipse(cx, cy, 13, 13)
          .poly((cx - 5, cy - 12), (cx - 2, cy - 17), (cx + 1, cy - 12))
          .poly((cx + 1, cy - 12), (cx + 5, cy - 16), (cx + 6, cy - 11)), 'fur')
    s.add(Shape().ellipse(cx - 4, cy + 1, 5, 5).ellipse(cx + 4, cy + 1, 5, 5)
          .ellipse(cx, cy + 7, 8, 5), 'skin_far')
    # The hairline dips between the eyes: a heart-shaped face under a heavy brow.
    s.add(Shape().poly((cx - 10, cy - 7), (cx + 10, cy - 7), (cx + 9, cy - 2), (cx + 5, cy - 3),
                       (cx, cy - 1), (cx - 5, cy - 3), (cx - 9, cy - 2)), 'fur')
    eyes(s, cx, cy, expression)
    s.pxs('#6a361f', (cx - 2, cy + 4), (cx + 1, cy + 4))
    mouth(s, cx, cy + 1, expression, colour='#3a160f')


HEADS = {1: ape_head_front, 2: caveman_head_front, 3: dev_head_front, 4: dev_head_front,
         5: dev_head_front}


# ---- body, arms, hands -------------------------------------------------------------

def torso(s, phase, cx, cy):
    look = PHASES[phase]
    s.add(Shape().rect(cx - 4, cy + 9, cx + 3, cy + 16), 'skin_far' if phase > 1 else 'fur_far')
    if phase in (4, 5):
        s.add(Shape().ellipse(cx, cy + 15, 10, 4), 'hoodie_far')
    s.add(Shape().rrect(cx - 16, cy + 14, cx + 16, 70, 11 if phase == 1 else 7), look['torso'])
    if phase == 1:
        s.add(Shape().ellipse(cx, cy + 27, 6, 7), 'skin_far')
        s.add(Shape().poly((cx - 16, cy + 20), (cx - 19, cy + 16), (cx - 13, cy + 16))
              .poly((cx + 16, cy + 20), (cx + 19, cy + 16), (cx + 13, cy + 16)), 'fur')
    if phase == 2:
        s.add(Shape().poly((cx - 13, cy + 16), (cx - 8, cy + 15), (cx + 14, cy + 33), (cx + 10, cy + 36)),
              'hide')
        s.pxs(WHITE, (cx - 3, cy + 19), (cx + 2, cy + 19))
        s.pxs('#c0844c', (cx - 2, cy + 18), (cx + 1, cy + 18), (cx, cy + 19), (cx - 1, cy + 19))
    if phase == 3:
        s.add(Shape().ellipse(cx, cy + 14, 5, 3), 'skin')
        s.pxs(WHITE, (cx + 6, cy + 24), (cx + 7, cy + 24), (cx + 6, cy + 25), (cx + 8, cy + 25))
    if phase in (4, 5):
        s.pxs(WHITE, (cx - 3, cy + 18), (cx - 3, cy + 19), (cx - 3, cy + 20), (cx - 3, cy + 21),
              (cx + 2, cy + 18), (cx + 2, cy + 19), (cx + 2, cy + 20), (cx + 2, cy + 21))
        s.pxs('#1f6e48', *[(x, cy + 34) for x in range(cx - 8, cx + 8)])
    if phase == 5:
        s.add(Shape().capsule((cx - 11, cy + 13), (cx - 8, cy + 18), 3)
              .capsule((cx + 11, cy + 13), (cx + 8, cy + 18), 3), 'metal_dark')
        s.add(Shape().rrect(cx - 13, cy + 15, cx - 7, cy + 21, 2).rrect(cx + 7, cy + 15, cx + 13, cy + 21, 2),
              'chair')


def arm(s, phase, shoulder, elbow, wrist):
    look = PHASES[phase]
    s.add(Shape().capsule(shoulder, elbow, 8), look['sleeve'])
    s.add(Shape().capsule(elbow, wrist, 7), look['forearm'])


def fist(s, phase, x, y):
    s.add(Shape().ellipse(x, y, 4, 4), PHASES[phase]['hand'])
    line = '#b8754e' if phase != 1 else '#6a361f'
    s.pxs(line, (x - 2, y), (x - 1, y), (x + 1, y), (x + 2, y), (x, y + 1))


def open_hand(s, phase, x, y):
    hand = PHASES[phase]['hand']
    s.add(Shape().ellipse(x, y + 1, 4, 4)
          .capsule((x - 3, y - 1), (x - 4, y - 5), 2).capsule((x - 1, y - 2), (x - 1, y - 7), 2)
          .capsule((x + 1, y - 2), (x + 2, y - 7), 2).capsule((x + 3, y - 1), (x + 4, y - 5), 2), hand)


def thumb_up(s, phase, x, y):
    hand = PHASES[phase]['hand']
    s.add(Shape().rrect(x - 4, y - 3, x + 4, y + 4, 2).capsule((x - 2, y - 3), (x - 2, y - 9), 3), hand)
    line = '#b8754e' if phase != 1 else '#6a361f'
    s.pxs(line, *[(x0, y) for x0 in range(x - 2, x + 4)], *[(x0, y + 2) for x0 in range(x - 2, x + 4)])


def sparkle(s, x, y, colour=SPARK[0]):
    s.pxs(colour, (x, y - 2), (x, y - 1), (x - 2, y), (x - 1, y), (x, y), (x + 1, y), (x + 2, y),
          (x, y + 1), (x, y + 2))
    s.px(x, y, SPARK[1])


# ---- poses -------------------------------------------------------------------------

def bust(phase: int, pose: str) -> Scene:
    s = Scene()
    cx, cy = 32, 24 if pose != 'celebrate' else 26
    torso(s, phase, cx, cy)
    expression = {'cheer': 'open', 'celebrate': 'joy', 'thumbs_up': 'wink'}[pose]
    HEADS[phase](s, cx, cy, expression, **({'band': True} if phase == 5 else {}))
    left, right = (cx - 14, cy + 19), (cx + 14, cy + 19)
    if pose == 'cheer':
        arm(s, phase, left, (cx - 20, cy + 9), (cx - 19, cy - 2))
        fist(s, phase, cx - 19, cy - 5)
        arm(s, phase, right, (cx + 19, cy + 30), (cx + 11, cy + 31))
        fist(s, phase, cx + 9, cy + 31)
        for x, y in ((cx - 27, cy - 9), (cx - 12, cy - 12)):
            sparkle(s, x, y)
        s.pxs(SPARK[2], (cx - 25, cy - 3), (cx - 26, cy - 2), (cx - 13, cy - 4), (cx - 12, cy - 5))
    elif pose == 'celebrate':
        arm(s, phase, left, (cx - 21, cy + 9), (cx - 24, cy - 3))
        open_hand(s, phase, cx - 24, cy - 6)
        arm(s, phase, right, (cx + 21, cy + 9), (cx + 24, cy - 3))
        open_hand(s, phase, cx + 24, cy - 6)
        for i, (x, y) in enumerate(((6, 6), (16, 2), (48, 3), (58, 9), (4, 30), (60, 28),
                                    (12, 18), (52, 16), (26, 1), (40, 2))):
            s.pxs(CONFETTI[i % len(CONFETTI)], (x, y), (x + 1, y), (x, y + 1))
        sparkle(s, 10, 12)
        sparkle(s, 55, 22)
    elif pose == 'thumbs_up':
        arm(s, phase, left, (cx - 18, cy + 30), (cx - 17, cy + 42))
        arm(s, phase, right, (cx + 20, cy + 28), (cx + 21, cy + 18))
        thumb_up(s, phase, cx + 21, cy + 15)
        sparkle(s, cx + 27, cy + 2)
        s.pxs(SPARK[2], (cx + 25, cy + 9), (cx + 26, cy + 8))
    return s


def demo() -> Scene:
    """The last phase standing, ready to show a move (exercise screens)."""
    s = Scene()
    cx, cy = 32, 16
    s.add(Shape().capsule((cx - 4, 44), (cx - 5, 56), 7), 'pants_far')
    s.add(Shape().capsule((cx + 4, 44), (cx + 5, 56), 7), 'pants')
    s.add(Shape().rrect(cx - 11, 55, cx - 2, 60, 2).rrect(cx + 2, 55, cx + 11, 60, 2), 'white')
    s.pxs('#33a06b', *[(x, 59) for x in range(cx - 10, cx - 2)], *[(x, 59) for x in range(cx + 3, cx + 11)])
    s.add(Shape().rect(cx - 3, cy + 9, cx + 2, cy + 14), 'skin_far')
    s.add(Shape().ellipse(cx, cy + 13, 8, 3), 'hoodie_far')
    s.add(Shape().rrect(cx - 12, cy + 12, cx + 12, 46, 5), 'hoodie')
    s.pxs(WHITE, (cx - 2, cy + 15), (cx - 2, cy + 16), (cx - 2, cy + 17), (cx + 1, cy + 15),
          (cx + 1, cy + 16), (cx + 1, cy + 17))
    s.pxs('#1f6e48', *[(x, 40) for x in range(cx - 6, cx + 6)])
    s.add(Shape().capsule((cx - 11, cy + 16), (cx - 16, cy + 24), 6).capsule((cx - 16, cy + 24), (cx - 17, cy + 31), 5)
          .capsule((cx + 11, cy + 16), (cx + 16, cy + 24), 6).capsule((cx + 16, cy + 24), (cx + 17, cy + 31), 5),
          'hoodie')
    s.add(Shape().ellipse(cx - 17, cy + 33, 3, 3).ellipse(cx + 17, cy + 33, 3, 3), 'skin')
    dev_head_front(s, cx, cy, 'smile', band=True)
    return s


SCENES = {f'{phase}-{pose}': (lambda phase=phase, pose=pose: bust(phase, pose))
          for phase in range(1, 6) for pose in ('cheer', 'celebrate', 'thumbs_up')}
SCENES['5-demo'] = demo
