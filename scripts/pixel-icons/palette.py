"""The colours every Breakbit pixel icon is drawn with (one character per colour).

Rules for the set: a 1 px outline in K, light from the top left, two or three tones per
material, coral (R/r) only for the area a move works, brand green (G/g/l) for the user.
"""

PALETTE = {
    # outline: the app's text colour
    'K': '#1d2b26',
    # skin: base, shade, light
    'S': '#f4c39c', 's': '#d8946a', 'L': '#ffe2c8',
    # hair
    'H': '#4a3122', 'h': '#6e4a33',
    # brand green: base, shade, light
    'G': '#38a872', 'g': '#23784f', 'l': '#8fdcb2',
    # coral: the area a move works, and its glow
    'R': '#ff5a3c', 'r': '#ffa184',
    # neutrals: white, light, mid, dark, darker
    'W': '#ffffff', 'w': '#e3e8ec', 'N': '#a8b2ba', 'n': '#6b7680', 'd': '#434c54',
    # blue: base, shade, light
    'B': '#3b82d6', 'b': '#2459a8', 'U': '#a9d2f7',
    # trousers / denim
    'P': '#4f5d8a', 'p': '#38446b',
    # wood: base, shade, light
    'C': '#c98a52', 'c': '#94592f', 'k': '#e6b884',
    # gold / yellow: base, shade, light
    'Y': '#ffcb3d', 'y': '#e0951c', 'Z': '#fff1a6',
    # orange
    'O': '#ff8a3d', 'o': '#d65f1d',
    # red
    'E': '#e5484d', 'e': '#a9313a',
    # purple
    'V': '#9171e0', 'v': '#5f44a8',
    # teal
    'T': '#2fb5a5', 't': '#1d7e72',
    # pink
    'F': '#ff9cb8', 'f': '#e0668a',
    # dark brown
    'M': '#7a4a2a', 'm': '#4f2e18',
}

TRANSPARENT = '.'
SIZE = 16
