"""From Gutter to Glory v1.06 art generator.

One consistent "screen-print" style: flat fills from a small mid-century bowling palette,
a single ink outline weight, one ground shadow. Every icon is built from the same helpers so
the whole set reads as drawn by one hand.
Usage: python3 art.py OUT_DIR
"""
import os, sys, math

INK = '#1E2B2F'
CREAM = '#F6EEDC'; PAPER = '#FFF8EA'
RED = '#D8473B'; RED_D = '#A8322B'
MUSTARD = '#EDB23E'; MUSTARD_D = '#C98E22'
TEAL = '#2E8C8F'; TEAL_D = '#1F5A60'; TEAL_L = '#8CCFC6'
MAPLE = '#E6BE82'; MAPLE_D = '#C48F55'; MAPLE_L = '#F2D6A6'
PLUM = '#7B3F6E'; PLUM_L = '#B9739F'
MINT = '#9AD8BC'; SKY = '#A7D3E3'; BROWN = '#7A4A2A'; BROWN_L = '#A86B43'
GREY = '#9AA6A8'; GREY_D = '#5E6B6E'; GREY_L = '#CBD3D2'
PINK = '#F2A0B4'; ORANGE = '#EF8A3C'; GREEN = '#5FAE5A'; GREEN_D = '#3E7F44'
NAVY = '#2B3F63'; GLASS = '#CFE8EE'
SKIN = ['#F4CFA8', '#E0A878', '#B57A4E', '#7B4C2E']
HAIR = {'black': '#2A2522', 'brown': '#6B4128', 'auburn': '#A5482A', 'blond': '#E2B85A', 'grey': '#BFC3C0', 'white': '#ECE9E2', 'plum': '#5B2D55'}

SW = 3  # outline weight in a 64 box


def svg(body, w=64, h=64, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" {extra}>'
            f'<g stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')


def R(x, y, w, h, f, rx=0, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" {extra}/>'


def C(cx, cy, r, f, extra=''):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{f}" {extra}/>'


def E(cx, cy, rx, ry, f, extra=''):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{f}" {extra}/>'


def P(d, f='none', extra=''):
    return f'<path d="{d}" fill="{f}" {extra}/>'


def L(x1, y1, x2, y2, extra=''):
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" {extra}/>'


def HL(d, f=PAPER, op=.55):
    """Flat highlight: no outline."""
    return f'<path d="{d}" fill="{f}" stroke="none" opacity="{op}"/>'


def shadow(cx=32, cy=58, rx=20, ry=3.4):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{INK}" stroke="none" opacity=".18"/>'


def T(x, y, text, size, f=INK, anchor='middle', weight=900, extra=''):
    return (f'<text x="{x}" y="{y}" font-family="\'Bowlby One\',\'Arial Black\',Impact,sans-serif" font-size="{size}" '
            f'font-weight="{weight}" fill="{f}" stroke="none" text-anchor="{anchor}" {extra}>{text}</text>')


def pin(cx, top, h, stripe=RED, f=PAPER):
    """Bowling pin, side view. h is total height."""
    k = h / 42.0
    def p(x, y):
        return f'{cx + x * k:.1f} {top + y * k:.1f}'
    d = (f'M{p(0,0)}C{p(5,0)} {p(6,6)} {p(4,11)}C{p(3,13)} {p(3,14)} {p(4,16)}C{p(9.5,22)} {p(9.5,34)} {p(6,42)}'
         f'L{p(-6,42)}C{p(-9.5,34)} {p(-9.5,22)} {p(-4,16)}C{p(-3,14)} {p(-3,13)} {p(-4,11)}C{p(-6,6)} {p(-5,0)} {p(0,0)}Z')
    band = f'<path d="M{p(-3.6,10.6)}L{p(3.6,10.6)}M{p(-3.4,14.4)}L{p(3.4,14.4)}" stroke="{stripe}" stroke-width="{max(1.6, 2.2*k)}" fill="none"/>'
    hl = HL(f'M{p(-2,3)}C{p(-3.5,5)} {p(-3.5,8)} {p(-2.6,9)}L{p(-1.4,8.6)}C{p(-2,7)} {p(-1.8,5)} {p(-1,3.4)}Z', '#ffffff', .8)
    return P(d, f) + band + hl


def ball(cx, cy, r, f=NAVY, holes=True, rot=0):
    out = C(cx, cy, r, f)
    out += HL(f'M{cx - r*.62:.1f} {cy - r*.2:.1f}A{r*.7:.1f} {r*.7:.1f} 0 0 1 {cx - r*.1:.1f} {cy - r*.68:.1f}', '#ffffff', .0)
    out += f'<path d="M{cx - r*.6:.1f} {cy - r*.15:.1f}A{r*.66:.1f} {r*.66:.1f} 0 0 1 {cx - r*.12:.1f} {cy - r*.62:.1f}" stroke="#ffffff" stroke-opacity=".45" stroke-width="{max(1.5, r*.13):.1f}" fill="none"/>'
    if holes:
        a = math.radians(rot)
        for dx, dy in ((.18, -.32), (.42, -.12), (.26, .14)):
            x = dx * math.cos(a) - dy * math.sin(a); y = dx * math.sin(a) + dy * math.cos(a)
            out += C(f'{cx + x*r:.1f}', f'{cy + y*r:.1f}', f'{r*.1:.1f}', INK, 'stroke="none"')
    return out


# ---------------------------------------------------------------- portraits
def portrait(skin, hair, hair_color, shirt, bg, extras=(), collar=None):
    hc = HAIR.get(hair_color, hair_color)
    s = SKIN[skin] if isinstance(skin, int) else skin
    out = f'<defs><clipPath id="c"><circle cx="32" cy="32" r="30"/></clipPath></defs>'
    out += C(32, 32, 30, bg)
    g = ''
    # back hair layer
    if hair in ('long', 'wavy'):
        g += P('M18 30C16 44 18 54 22 60L42 60C46 54 48 44 46 30C44 16 20 16 18 30Z', hc)
    if hair == 'ponytail':
        g += P('M42 20C52 20 54 34 48 44C46 38 44 30 40 26Z', hc)
    if hair == 'bob':
        g += P('M19 32C18 18 46 18 45 32L46 42L38 42L38 30L26 30L26 42L18 42Z', hc)
    # shirt / shoulders
    g += P('M8 66C8 52 18 46 32 46C46 46 56 52 56 66Z', shirt)
    if collar:
        g += P('M25 46L32 54L39 46Z', collar)
    g += R(28, 38, 8, 9, s)
    # ears
    g += C(20.5, 30, 3, s) + C(43.5, 30, 3, s)
    g += E(32, 28, 11.5, 13, s)
    # face
    g += C(27.5, 29, 1.5, INK, 'stroke="none"') + C(36.5, 29, 1.5, INK, 'stroke="none"')
    g += '<path d="M28.5 35.5Q32 38.5 35.5 35.5" fill="none" stroke-width="2.2"/>'
    g += C(25, 33.5, 2, '#E9897A', 'stroke="none" opacity=".35"') + C(39, 33.5, 2, '#E9897A', 'stroke="none" opacity=".35"')
    # front hair
    if hair == 'short':
        g += P('M20.5 27C20 15 30 12.5 36 14C42 15 44.5 20 43.5 27C40 21 34 19.5 26 21C24 22 22 24 20.5 27Z', hc)
    elif hair == 'buzz':
        g += P('M21 25C22 16 42 16 43 25C38 20 26 20 21 25Z', hc)
    elif hair == 'side':  # balding with side hair
        g += P('M20.5 31C19 25 21 22 23 21L24 30Z', hc) + P('M43.5 31C45 25 43 22 41 21L40 30Z', hc)
    elif hair in ('long', 'bob', 'wavy', 'ponytail'):
        g += P('M20.5 29C19 15 30 12 36 13.5C43 15 45.5 21 43.5 29C41 24 37 20 30 19.5C26 22 23 25 20.5 29Z', hc)
    elif hair == 'curly':
        for cx, cy, r in ((22, 22, 5), (27, 16.5, 5.5), (33, 14.5, 5.5), (39, 16.5, 5.5), (43, 22, 5), (20.5, 28, 3.5), (43.5, 28, 3.5)):
            g += C(cx, cy, r, hc)
    elif hair == 'mohawk':
        g += P('M28 22C27 12 30 8 32 7C34 8 37 12 36 22Z', hc)
    for x in extras:
        g += EXTRAS[x]
    out += f'<g clip-path="url(#c)">{g}</g>'
    out += C(32, 32, 30, 'none')
    return svg(out)


EXTRAS = {
    'glasses': C(27.5, 29, 4, 'none', 'stroke-width="2"') + C(36.5, 29, 4, 'none', 'stroke-width="2"') + L(31.5, 29, 32.5, 29, 'stroke-width="2"'),
    'shades': P('M22 26H42V30C42 33 39 34 37 34C35 34 33 32 32 30C31 32 29 34 27 34C25 34 22 33 22 30Z', INK),
    'mustache': P('M26 33.5C28 31.5 31 32 32 33C33 32 36 31.5 38 33.5C36 35 33 34.5 32 34C31 34.5 28 35 26 33.5Z', HAIR['grey']),
    'cap': P('M20 25C20 14 44 14 44 25Z', RED) + P('M20 25H50C50 27 47 28 44 28H20Z', RED_D) + C(32, 15.5, 1.5, RED_D),
    'cap_teal': P('M20 25C20 14 44 14 44 25Z', TEAL) + P('M20 25H50C50 27 47 28 44 28H20Z', TEAL_D),
    'beanie': P('M20 26C19 12 45 12 44 26Z', MUSTARD) + R(19, 23, 26, 5, MUSTARD_D, 2),
    'paperhat': P('M21 24L24 14H40L43 24Z', PAPER) + L(24, 19, 40, 19, f'stroke="{RED}" stroke-width="2.4"'),
    'headphones': P('M18 31C17 15 47 15 46 31', 'none', 'stroke-width="3.5"') + R(15, 27, 6, 10, RED, 2.5) + R(43, 27, 6, 10, RED, 2.5),
    'earrings': C(20.5, 35, 1.8, MUSTARD) + C(43.5, 35, 1.8, MUSTARD),
    'bowtie': P('M26 48L32 51L38 48L38 54L32 51L26 54Z', RED),
    'scarf': P('M21 45C26 50 38 50 43 45L44 50C38 55 26 55 20 50Z', MUSTARD),
    'nametag': R(38, 54, 9, 5, PAPER, 1, 'stroke-width="2"'),
    'stripe': R(8, 55, 48, 4, PAPER, 0, 'stroke="none" opacity=".9"'),
    'pinlogo': pin(41, 51, 10, RED),
    'grey_beard': P('M22 34C24 44 40 44 42 34C38 38 26 38 22 34Z', HAIR['grey']),
    'pearls': ''.join(C(25 + i * 2.8, 48 + abs(i - 2.5) * -.6, 1.4, PAPER, 'stroke-width="1.2"') for i in range(6)),
    'hood': P('M14 66C12 52 18 44 24 44L32 52L40 44C46 44 52 52 50 66Z', 'none'),
    'apron': P('M24 50H40V66H24Z', PAPER) + L(24, 50, 28, 46, 'stroke-width="2"') + L(40, 50, 36, 46, 'stroke-width="2"'),
    'vest': P('M14 66C14 54 20 48 26 47L32 58L38 47C44 48 50 54 50 66Z', INK, 'opacity=".85"'),
}

PEOPLE = {
    # patrons
    'patron-lou': dict(skin=1, hair='side', hair_color='grey', shirt=TEAL, bg=MAPLE_L, extras=('mustache', 'stripe'), collar=CREAM),
    'patron-bea': dict(skin=3, hair='curly', hair_color='black', shirt=PINK, bg=TEAL_L, extras=('glasses', 'pearls')),
    'patron-dex': dict(skin=0, hair='short', hair_color='auburn', shirt=NAVY, bg=MUSTARD, extras=('headphones',)),
    'patron-rosa': dict(skin=2, hair='wavy', hair_color='brown', shirt=RED, bg=PINK, extras=('earrings',)),
    'patron-nell': dict(skin=0, hair='bob', hair_color='white', shirt=PLUM_L, bg=MINT, extras=('glasses', 'scarf')),
    'patron-milo': dict(skin=2, hair='mohawk', hair_color='black', shirt=MUSTARD, bg=SKY, extras=('shades',)),
    # staff roles
    'employee-mechanic': dict(skin=2, hair='buzz', hair_color='black', shirt=GREY_D, bg=MUSTARD, extras=('cap_teal', 'nametag'), collar=GREY),
    'employee-snack': dict(skin=1, hair='short', hair_color='brown', shirt=PAPER, bg=PINK, extras=('paperhat', 'nametag')),
    'employee-bar': dict(skin=3, hair='short', hair_color='black', shirt=PAPER, bg=TEAL_L, extras=('vest', 'bowtie')),
    'employee-proshop': dict(skin=0, hair='ponytail', hair_color='blond', shirt=TEAL, bg=MAPLE_L, extras=('nametag',), collar=PAPER),
    'employee-stocker': dict(skin=2, hair='short', hair_color='black', shirt=GREEN, bg=SKY, extras=('beanie',)),
    # bowlers
    'bowler-maya': dict(skin=2, hair='ponytail', hair_color='black', shirt=TEAL, bg=MUSTARD, extras=('pinlogo',), collar=PAPER),
    'bowler-leo': dict(skin=1, hair='short', hair_color='brown', shirt=RED, bg=TEAL_L, extras=('pinlogo',), collar=PAPER),
    'bowler-jules': dict(skin=3, hair='curly', hair_color='plum', shirt=MUSTARD, bg=PINK, extras=('pinlogo',), collar=PAPER),
    'bowler-sam': dict(skin=0, hair='buzz', hair_color='blond', shirt=NAVY, bg=MINT, extras=('pinlogo',), collar=PAPER),
    # story
    'owner': dict(skin=1, hair='short', hair_color='brown', shirt=TEAL_D, bg=MUSTARD, extras=('stripe', 'pinlogo'), collar=CREAM),
    'gus': dict(skin=0, hair='side', hair_color='white', shirt=MAPLE_D, bg=MAPLE_L, extras=('glasses', 'mustache', 'bowtie')),
    'vera': dict(skin=0, hair='bob', hair_color='black', shirt=PLUM, bg=GREY_L, extras=('shades', 'pearls')),
    'patron-default': dict(skin=1, hair='short', hair_color='brown', shirt=GREY, bg=GREY_L),
}


# ---------------------------------------------------------------- icons
def counter_base():
    return R(8, 44, 48, 12, MAPLE_D, 2) + L(8, 49, 56, 49, f'stroke="{MAPLE}" stroke-width="2"')


ICONS = {}

# NAV
ICONS['nav-alley'] = (shadow() + P('M10 30L32 12L54 30V56H10Z', CREAM) + P('M8 30L32 10L56 30', 'none')
    + R(14, 30, 36, 7, RED) + ''.join(R(14 + i * 9, 30, 4.5, 7, PAPER, 0, 'stroke="none"') for i in range(4)) + R(14, 30, 36, 7, 'none')
    + R(26, 40, 12, 16, TEAL) + C(35, 48, 1.2, INK) + R(14, 41, 8, 8, SKY) + R(42, 41, 8, 8, SKY) + pin(32, 13, 13, RED))
ICONS['nav-manage'] = (shadow() + P('M16 52L40 28', 'none', 'stroke-width="9"') + P('M16 52L40 28', 'none', f'stroke="{MAPLE}" stroke-width="4.5"')
    + P('M30 16L42 8L56 22L48 34Z', GREY_L) + P('M30 16L24 12C22 14 22 18 26 22L30 24', GREY_L) + HL('M40 12L52 23L49 27L36 15Z', '#fff', .6))
ICONS['nav-bowlers'] = (shadow(32, 56) + P('M8 44C8 34 12 26 16 24H28C30 30 36 34 46 36C52 37 56 40 56 46V50H8Z', CREAM)
    + P('M16 24H28C30 30 36 34 46 36L44 44C36 42 24 40 16 34Z', RED) + R(6, 48, 52, 6, INK, 3, 'stroke="none"')
    + L(26, 30, 30, 28, 'stroke-width="2"') + L(30, 34, 34, 32, 'stroke-width="2"') + L(34, 37, 38, 35, 'stroke-width="2"'))
ICONS['nav-tournaments'] = (shadow() + P('M18 12H46V22C46 34 40 40 32 40C24 40 18 34 18 22Z', MUSTARD)
    + P('M18 16H10C10 26 14 30 20 30', 'none') + P('M46 16H54C54 26 50 30 44 30', 'none') + R(28, 40, 8, 6, MUSTARD_D) + R(20, 46, 24, 8, TEAL_D, 2)
    + HL('M23 15H27V24C27 30 29 33 31 35C26 34 23 30 23 24Z', '#fff', .55) + R(26, 48.5, 12, 3, MUSTARD, 1, 'stroke="none"'))
ICONS['nav-you'] = (C(32, 32, 24, MUSTARD) + P('M14 50C16 42 24 39 32 39C40 39 48 42 50 50C46 54 40 56 32 56C24 56 18 54 14 50Z', TEAL)
    + C(32, 26, 9, SKIN[1]) + P('M23 24C23 15 41 15 41 24C37 20 27 20 23 24Z', HAIR['brown']) + P('M28 41L32 46L36 41', 'none', 'stroke-width="2"') + C(32, 32, 24, 'none'))
ICONS['nav-employees'] = (shadow() + P('M30 58C30 46 36 40 45 40C54 40 60 46 60 58Z', MUSTARD) + C(45, 28, 9, SKIN[2]) + P('M36 26C36 15 54 15 54 26Z', TEAL) + P('M36 26H58', 'none')
    + C(42, 29, 1.3, INK, 'stroke="none"') + C(48, 29, 1.3, INK, 'stroke="none"')
    + P('M4 58C4 46 10 40 19 40C28 40 34 46 34 58Z', TEAL) + C(19, 28, 9, SKIN[0]) + P('M10 26C10 15 28 15 28 26Z', RED) + P('M10 26H32', 'none')
    + C(16, 29, 1.3, INK, 'stroke="none"') + C(22, 29, 1.3, INK, 'stroke="none"'))

ICONS['nav-goals'] = (shadow() + R(10, 12, 44, 42, PAPER, 3) + L(10, 24, 54, 24) + L(32, 12, 32, 54) + L(10, 38, 54, 38)
    + L(36, 15, 50, 21, f'stroke="{RED}" stroke-width="3.4"') + L(50, 15, 36, 21, f'stroke="{RED}" stroke-width="3.4"')
    + P('M14 21L28 15V21Z', TEAL, 'stroke-width="2.4"') + T(21, 34, '9', 9) + T(43, 34, '20', 9) + T(21, 50, '7', 9))

# WORLD / FACILITIES
ICONS['front-desk'] = (shadow() + counter_base() + P('M14 42C14 30 22 24 32 24C42 24 50 30 50 42Z', MUSTARD) + R(10, 41, 44, 4, MUSTARD_D, 2)
    + C(32, 21, 3.5, MUSTARD_D) + HL('M20 38C20 32 24 28 29 27C25 30 23 34 23 38Z', '#fff', .6))
ICONS['snack-counter'] = (shadow() + ''.join(C(x, y, 5.5, PAPER) for x, y in ((22, 20), (30, 15), (38, 16), (44, 21), (27, 24), (36, 23)))
    + P('M16 24H48L44 56H20Z', PAPER) + P('M22 24L24 56M30 24L30 56M36 24L36 56M42 24L40 56', 'none', f'stroke="{RED}" stroke-width="4"') + P('M16 24H48L44 56H20Z', 'none')
    + R(14, 22, 36, 6, RED, 2))
ICONS['bar'] = (shadow() + P('M14 18H40V52C40 55 38 56 35 56H19C16 56 14 55 14 52Z', MUSTARD) + P('M12 18C12 10 20 9 22 12C24 7 34 7 36 12C40 9 44 13 42 18Z', PAPER)
    + P('M40 26H46C50 26 52 29 52 33V39C52 43 50 46 46 46H40', 'none', 'stroke-width="4"') + HL('M18 22H22V50H18Z', '#fff', .45) + R(14, 18, 26, 38, 'none', 3))
ICONS['arcade'] = (shadow() + P('M16 8H48L46 22V56H18V22Z', PLUM) + R(20, 14, 24, 18, TEAL_D, 2) + P('M24 26L28 20L32 26L36 18L40 26', 'none', f'stroke="{MINT}" stroke-width="2"')
    + P('M14 36H50L48 44H16Z', PLUM_L) + C(26, 38, 3, RED) + L(26, 38, 24, 33) + C(24, 32, 2.6, RED) + C(36, 40, 2.4, MUSTARD) + C(42, 40, 2.4, TEAL_L) + R(28, 48, 8, 4, INK, 1))
ICONS['pro-shop'] = (shadow() + P('M14 22H50L47 56H17Z', TEAL) + P('M24 28V18C24 10 40 10 40 18V28', 'none') + C(32, 40, 8.5, NAVY)
    + C(30, 37.5, 1.2, PAPER, 'stroke="none"') + C(33.6, 36.6, 1.2, PAPER, 'stroke="none"') + C(33.4, 40.4, 1.2, PAPER, 'stroke="none"'))
ICONS['benches'] = (shadow() + R(8, 24, 48, 10, MAPLE, 3) + R(8, 36, 48, 8, MAPLE_D, 3) + R(12, 44, 5, 12, BROWN) + R(47, 44, 5, 12, BROWN)
    + L(12, 29, 52, 29, f'stroke="{MAPLE_D}" stroke-width="2"'))
ICONS['advertising'] = (shadow() + P('M10 28H20L44 14V50L20 38H10Z', RED) + R(8, 26, 12, 14, MUSTARD, 2) + P('M22 38L26 54H32L30 42', MUSTARD)
    + P('M50 24C54 28 54 36 50 40M54 18C61 26 61 38 54 46', 'none', 'stroke-width="2.6"'))
ICONS['parts'] = (shadow() + P('M32 12L36 12L37.6 17.2L42.4 19.2L47.2 16.6L50 19.4L47.4 24.2L49.4 29L54.6 30.6V34.6L49.4 36.2L47.4 41L50 45.8L47.2 48.6L42.4 46L37.6 48L36 53.2H32L30.4 48L25.6 46L20.8 48.6L18 45.8L20.6 41L18.6 36.2L13.4 34.6V30.6L18.6 29L20.6 24.2L18 19.4L20.8 16.6L25.6 19.2L30.4 17.2Z', GREY_L)
    + C(34, 32.6, 7, MUSTARD) + C(34, 32.6, 2.5, INK, 'stroke="none"'))
ICONS['trophy'] = ICONS['nav-tournaments']
ICONS['brand'] = (R(4, 4, 56, 56, MUSTARD, 12) + ball(24, 38, 13, TEAL_D, rot=10) + pin(42, 9, 40, RED))

# LANE (tall, top view) -------------------------------------------------
def lane_svg():
    W, H = 100, 320
    b = R(0, 0, W, H, '#2a2f2f', 0, 'stroke="none"')
    b += R(12, 0, 76, H, MAPLE, 0, 'stroke="none"')
    for i in range(12):
        x = 12 + i * 6.33
        b += R(f'{x:.1f}', 0, 3.2, H, MAPLE_L if i % 2 else MAPLE_D, 0, 'stroke="none" opacity=".35"')
    b += R(2, 0, 10, H, '#3c4446', 0, 'stroke="none"') + R(88, 0, 10, H, '#3c4446', 0, 'stroke="none"')
    # pin deck
    b += R(12, 0, 76, 70, MAPLE_L, 0, 'stroke="none"')
    rows = [(1, 58), (2, 46), (3, 34), (4, 22)]
    for n, y in rows:
        for k in range(n):
            x = 50 + (k - (n - 1) / 2) * 15
            b += f'<circle cx="{x}" cy="{y}" r="5.4" fill="{PAPER}" stroke="{INK}" stroke-width="2"/><circle cx="{x}" cy="{y}" r="2.6" fill="none" stroke="{RED}" stroke-width="1.6"/>'
    b += L(12, 72, 88, 72, f'stroke="{INK}" stroke-width="2" opacity=".5"')
    # arrows
    for k in range(7):
        x = 22 + k * 9.3; y = 200 - abs(k - 3) * 9
        b += f'<path d="M{x:.1f} {y}l-3.4 8h6.8z" fill="{RED_D}" stroke="none"/>'
    for k in range(5):
        x = 31 + k * 9.5
        b += C(f'{x:.1f}', 262, 1.8, RED_D, 'stroke="none"')
    b += L(12, 300, 88, 300, f'stroke="{RED_D}" stroke-width="2.4"')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMin slice">{b}</svg>')

# SNACKS
ICONS['snack-soda'] = (shadow() + P('M18 22H46L42 56H22Z', RED) + R(16, 16, 32, 7, PAPER, 3) + L(34, 18, 40, 4, 'stroke-width="3.4"') + R(21, 32, 22, 10, PAPER, 0, 'stroke="none"')
    + P('M18 22H46L42 56H22Z', 'none') + C(32, 37, 3, RED, 'stroke="none"'))
ICONS['snack-popcorn'] = ICONS['snack-counter']
ICONS['snack-hotdog'] = (shadow() + P('M8 36C8 30 14 28 20 28H44C50 28 56 30 56 36C56 44 50 46 44 46H20C14 46 8 44 8 36Z', MAPLE)
    + P('M6 34C6 30 10 30 12 30H52C56 30 58 32 58 34C58 37 56 38 52 38H12C8 38 6 37 6 34Z', RED_D)
    + P('M12 32C16 28 20 36 24 32S32 36 36 32S44 36 48 32', 'none', f'stroke="{MUSTARD}" stroke-width="2.6"') + P('M8 38C14 42 50 42 56 38', 'none'))
ICONS['snack-pizza'] = (shadow() + P('M32 56L10 16C24 10 40 10 54 16Z', MUSTARD) + P('M10 16C24 10 40 10 54 16L52 21C40 16 24 16 12 21Z', MAPLE_D)
    + C(30, 26, 4, RED) + C(40, 30, 3.5, RED) + C(32, 40, 3.5, RED) + C(24, 32, 2, GREEN_D, 'stroke="none"') + C(37, 22, 2, GREEN_D, 'stroke="none"'))
ICONS['snack-nachos'] = (shadow() + P('M8 40H56L50 54H14Z', RED) + ''.join(P(d, MUSTARD) for d in ('M14 40L20 22L28 40Z', 'M24 40L34 18L42 40Z', 'M36 40L46 24L52 40Z'))
    + P('M18 34C22 30 26 36 30 32S38 34 42 30S48 32 50 34V40H16Z', MUSTARD_D, 'opacity=".9"') + C(30, 30, 2, GREEN, 'stroke-width="1.6"') + C(42, 33, 2, RED, 'stroke-width="1.6"'))
ICONS['snack-pretzel'] = (shadow() + P('M32 50C20 50 10 42 12 30C14 20 24 18 30 24C34 28 36 36 42 40C48 44 54 38 52 30C50 20 40 18 34 24C28 30 26 38 20 42', 'none', f'stroke="{INK}" stroke-width="11"')
    + P('M32 50C20 50 10 42 12 30C14 20 24 18 30 24C34 28 36 36 42 40C48 44 54 38 52 30C50 20 40 18 34 24C28 30 26 38 20 42', 'none', f'stroke="{BROWN_L}" stroke-width="6"')
    + ''.join(C(x, y, 1, PAPER, 'stroke="none"') for x, y in ((14, 32), (26, 22), (44, 41), (50, 27), (24, 47), (38, 21))))
ICONS['snack-icecream'] = (shadow(32, 59, 8) + P('M20 30L32 58L44 30Z', MAPLE) + P('M23 36L39 44M26 44L36 32M24 34L37 50', 'none', f'stroke="{MAPLE_D}" stroke-width="2"') + P('M20 30L32 58L44 30Z', 'none')
    + C(32, 22, 11, PINK) + P('M20 28C24 32 28 28 32 32C36 28 40 32 44 28', PINK) + C(36, 11, 2.6, RED))
ICONS['snack-fries'] = (shadow() + ''.join(R(x, y, 5, 26, MUSTARD, 1) for x, y in ((18, 12), (24, 8), (30, 11), (36, 7), (42, 12)))
    + P('M14 28H50L46 56H18Z', RED) + P('M14 28C22 34 42 34 50 28', 'none') + C(32, 44, 4, MUSTARD, 'stroke-width="2"'))
def burger(cheese):
    b = shadow() + P('M10 30C10 16 54 16 54 30Z', MAPLE_D) + ''.join(E(x, y, 1.6, 1, PAPER, 'stroke="none"') for x, y in ((22, 21), (32, 19), (42, 22), (27, 25), (37, 25)))
    b += P('M8 32C14 28 18 36 24 32S34 36 40 32S50 36 56 32V35H8Z', GREEN)
    if cheese:
        b += P('M10 35H54L50 41L44 37L36 43L28 37L20 42Z', MUSTARD)
    b += R(9, 37 if cheese else 35, 46, 7, BROWN, 3) + P('M10 46H54C54 52 50 54 46 54H18C14 54 10 52 10 46Z', MAPLE_D)
    return b
ICONS['snack-burger'] = burger(False)
ICONS['snack-cheeseburger'] = burger(True)

# DRINKS
ICONS['drink-beer'] = ICONS['bar']
ICONS['drink-wine'] = (shadow(32, 58, 12) + P('M20 10H44C44 26 40 34 32 34C24 34 20 26 20 10Z', PAPER) + P('M21 20H43C42 28 38 32 32 32C26 32 22 28 21 20Z', RED_D, 'stroke="none"')
    + P('M20 10H44C44 26 40 34 32 34C24 34 20 26 20 10Z', 'none') + L(32, 34, 32, 52) + P('M22 54C22 50 42 50 42 54Z', PAPER) + HL('M24 13H27V22H24Z', '#fff', .7))
ICONS['drink-cider'] = (shadow() + P('M16 14H40L37 56H19Z', GLASS) + P('M17.4 24H38.6L37 56H19Z', MUSTARD, 'stroke="none"') + P('M16 14H40L37 56H19Z', 'none')
    + C(46, 22, 9, RED) + P('M46 13C46 9 48 7 50 6', 'none', 'stroke-width="2.4"') + P('M47 12C50 9 54 10 55 12C52 14 49 14 47 12Z', GREEN, 'stroke-width="2"'))
ICONS['drink-margarita'] = (shadow(32, 58, 12) + P('M10 16H54L36 34H28Z', MINT) + P('M10 16H54', 'none', f'stroke="{PAPER}" stroke-width="5"') + P('M10 16H54L36 34H28Z', 'none')
    + L(32, 34, 32, 52) + P('M22 54C22 50 42 50 42 54Z', PAPER) + P('M44 6A10 10 0 0 1 56 18L44 16Z', GREEN) + L(46, 9, 50, 15, f'stroke="{PAPER}" stroke-width="1.6"'))
ICONS['drink-mocktail'] = (shadow() + P('M20 18H44L41 56H23Z', ORANGE) + P('M20 18H44L43.3 28H20.7Z', PINK, 'stroke="none"') + P('M20 18H44L41 56H23Z', 'none')
    + L(38, 30, 48, 4, 'stroke-width="2.4"') + P('M30 10C34 2 50 2 54 10Z', TEAL) + L(42, 6, 42, 10, 'stroke-width="2"') + C(26, 22, 3.5, RED))
ICONS['drink-oldfashioned'] = (shadow() + P('M14 24H50L47 54H17Z', GLASS) + P('M15 34H49L47 54H17Z', BROWN_L, 'stroke="none"') + P('M14 24H50L47 54H17Z', 'none')
    + R(24, 32, 12, 12, PAPER, 2, 'opacity=".85" stroke-width="2"') + P('M36 26C42 20 50 22 52 28', 'none', f'stroke="{ORANGE}" stroke-width="4"'))

# MACHINES
ICONS['machine-pinball'] = (shadow() + P('M14 20L46 12L52 44L20 54Z', TEAL_D) + P('M18 22L44 15.5L48.5 41L22 49Z', NAVY, 'stroke-width="2"')
    + C(30, 26, 3.6, MUSTARD) + C(38, 24, 3.6, RED) + C(34, 34, 3.6, MINT) + L(27, 44, 32, 42) + L(41, 40, 36, 42) + C(40, 31, 1.8, PAPER, 'stroke="none"')
    + L(20, 54, 20, 60) + L(50, 46, 50, 54))
ICONS['machine-crane'] = (shadow() + R(14, 6, 36, 50, RED, 3) + R(18, 12, 28, 26, GLASS, 1) + L(32, 12, 32, 22, 'stroke-width="2"') + P('M27 26L32 22L37 26M27 26L28 30M37 26L36 30', 'none', 'stroke-width="2"')
    + C(25, 35, 3.5, PINK, 'stroke-width="2"') + C(38, 35, 3.5, MUSTARD, 'stroke-width="2"') + R(18, 42, 16, 8, INK, 1) + C(41, 46, 3, MUSTARD))
ICONS['machine-invaders'] = (shadow() + P('M16 8H48L46 22V56H18V22Z', NAVY) + R(20, 13, 24, 20, '#111a1f', 2)
    + ''.join(R(22 + x * 2.5, 16 + y * 2.5, 2.5, 2.5, MINT, 0, 'stroke="none"') for y, row in enumerate(('0010000100', '0001111000', '0011011100', '0111111110', '0101111010', '0100000010')) for x, c in enumerate(row) if c == '1')
    + P('M14 36H50L48 44H16Z', TEAL) + C(26, 39, 2.6, RED) + C(36, 40, 2.2, MUSTARD) + C(42, 40, 2.2, MUSTARD))
ICONS['machine-hockey'] = (shadow() + P('M8 26L56 26L52 48H12Z', TEAL_L) + P('M32 26L32 48', 'none', f'stroke="{RED}" stroke-width="2"') + E(32, 37, 6, 4, 'none', f'stroke="{RED}" stroke-width="2"')
    + P('M8 26L56 26L52 48H12Z', 'none') + E(20, 36, 5, 3.5, RED) + C(20, 33, 2.5, RED) + E(44, 38, 5, 3.5, MUSTARD) + C(44, 35, 2.5, MUSTARD) + E(30, 40, 2.5, 1.6, INK) + L(14, 48, 14, 56) + L(50, 48, 50, 56))
ICONS['machine-racer'] = (shadow() + P('M14 8H46L48 56H12Z', RED) + R(18, 13, 24, 16, '#111a1f', 2) + P('M20 27L30 15H32L40 27Z', GREY_D, 'stroke="none"') + L(30, 27, 30.8, 17, f'stroke="{MUSTARD}" stroke-width="1.4"')
    + C(30, 40, 8, GREY_L) + C(30, 40, 3, INK) + L(30, 32, 30, 37) + L(22, 40, 27, 40) + L(38, 40, 33, 40) + R(42, 34, 3, 12, INK, 1.5))

# FIXTURES
ICONS['fixture-restrooms'] = (shadow() + R(10, 8, 44, 48, TEAL, 4) + L(32, 14, 32, 50, f'stroke="{PAPER}" stroke-width="2"')
    + C(21, 18, 3.5, PAPER, 'stroke="none"') + P('M16 24H26V36H24V46H18V36H16Z', PAPER, 'stroke="none"')
    + C(43, 18, 3.5, PAPER, 'stroke="none"') + P('M39 24H47L50 38H46V46H40V38H36Z', PAPER, 'stroke="none"'))
ICONS['fixture-lockers'] = (shadow() + ''.join(R(10 + i * 15, 8, 14, 48, c, 1) + L(13 + i * 15, 14, 21 + i * 15, 14, 'stroke-width="2"') + L(13 + i * 15, 18, 21 + i * 15, 18, 'stroke-width="2"') + C(20 + i * 15, 34, 1.6, INK, 'stroke="none"') for i, c in enumerate((TEAL, MUSTARD, RED))))
ICONS['fixture-ballracks'] = (shadow() + P('M8 30H56M8 48H56', 'none', 'stroke-width="3.6"') + L(10, 30, 10, 56) + L(54, 30, 54, 56)
    + ball(18, 23, 7, RED, rot=20) + ball(32, 23, 7, TEAL, rot=-10) + ball(46, 23, 7, PLUM, rot=40) + ball(25, 41, 7, MUSTARD, rot=0) + ball(39, 41, 7, NAVY, rot=30))
ICONS['fixture-tv'] = (shadow() + R(6, 12, 52, 34, INK, 3) + R(10, 16, 44, 26, TEAL, 1, 'stroke="none"') + pin(26, 19, 18, RED) + pin(34, 21, 16, RED) + ball(44, 33, 6, MUSTARD, holes=False)
    + R(26, 46, 12, 4, GREY_D) + R(20, 50, 24, 4, GREY_D, 2))
ICONS['fixture-wallart'] = (shadow() + R(8, 8, 48, 44, MAPLE_D, 2) + R(13, 13, 38, 34, MUSTARD, 0, 'stroke-width="2"')
    + C(36, 26, 7, RED, 'stroke="none"') + P('M13 47L24 30L33 40L40 33L51 47Z', TEAL_D, 'stroke-width="2"') + pin(22, 18, 14, RED))
ICONS['fixture-neon'] = ('<g fill="none">' + R(6, 10, 52, 44, '#2a1f33', 6)
    + f'<path d="M26 16C30 16 31 20 30 23C29 25 29 26 30 27C34 31 34 39 32 46H20C18 39 18 31 22 27C23 26 23 25 22 23C21 20 22 16 26 16Z" stroke="{PINK}" stroke-width="7" opacity=".3"/>'
    + f'<path d="M26 16C30 16 31 20 30 23C29 25 29 26 30 27C34 31 34 39 32 46H20C18 39 18 31 22 27C23 26 23 25 22 23C21 20 22 16 26 16Z" stroke="{PINK}" stroke-width="2.6"/>'
    + f'<circle cx="44" cy="38" r="8" stroke="{TEAL_L}" stroke-width="7" opacity=".3"/><circle cx="44" cy="38" r="8" stroke="{TEAL_L}" stroke-width="2.6"/>'
    + f'<path d="M44 14l2 4.5 5 .5-3.8 3.2 1.2 4.8-4.4-2.6-4.4 2.6 1.2-4.8L37 19l5-.5z" stroke="{MUSTARD}" stroke-width="2"/></g>')

# UPGRADES / ATTRACTIONS
ICONS['upgrade-roof'] = (shadow() + P('M6 32L32 12L58 32H50V56H14V32Z', CREAM) + P('M4 32L32 10L60 32', 'none', f'stroke="{RED}" stroke-width="6"') + P('M4 32L32 10L60 32', 'none')
    + R(26, 40, 12, 16, MAPLE_D) + R(40, 8, 7, 12, BROWN))
ICONS['upgrade-staff'] = (shadow() + P('M18 46L38 26', 'none', 'stroke-width="9"') + P('M18 46L38 26', 'none', f'stroke="{GREY_L}" stroke-width="5"')
    + P('M36 14C42 10 52 14 52 22L46 22L42 26L42 32C34 32 30 22 36 14Z', GREY_L) + C(16, 48, 6, MUSTARD))
ICONS['upgrade-coaching'] = (shadow() + R(14, 10, 36, 46, MAPLE_D, 3) + R(18, 16, 28, 36, PAPER, 1, 'stroke-width="2"') + R(24, 6, 16, 8, GREY_L, 2)
    + C(26, 26, 3, 'none', f'stroke="{RED}" stroke-width="2"') + P('M33 23L39 29M39 23L33 29', 'none', f'stroke="{TEAL}" stroke-width="2"') + P('M26 30C28 40 34 42 38 34', 'none', 'stroke-width="2" stroke-dasharray="2 3"') + P('M36 32L38 34L40 31', 'none', 'stroke-width="2"'))
ICONS['upgrade-lights'] = (L(32, 4, 32, 18) + P('M16 34C16 24 24 18 32 18C40 18 48 24 48 34Z', TEAL) + R(14, 33, 36, 4, TEAL_D, 2) + P('M24 37C24 44 40 44 40 37', MUSTARD)
    + P('M14 48L10 54M32 48V56M50 48L54 54', 'none', f'stroke="{MUSTARD_D}" stroke-width="2.6"'))
ICONS['upgrade-automation'] = (shadow() + R(10, 8, 44, 18, GREY_D, 3) + ''.join(L(16 + i * 8, 26, 16 + i * 8, 34, 'stroke-width="2"') for i in range(5))
    + ''.join(pin(16 + i * 8, 34, 18, RED) for i in range(5)) + C(20, 17, 3, MUSTARD) + C(44, 17, 3, MINT) + R(26, 14, 12, 6, INK, 1))
ICONS['upgrade-billiards'] = (shadow() + C(32, 32, 22, INK) + C(32, 30, 10, PAPER, 'stroke="none"') + T(32, 36, '8', 15)
    + f'<path d="M18 22A16 16 0 0 1 28 14" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>')
ICONS['upgrade-partyroom'] = (shadow() + R(12, 34, 40, 20, PINK, 3) + R(16, 22, 32, 13, PAPER, 3) + P('M12 42C18 46 22 38 28 42S38 46 44 40S50 44 52 42', 'none', f'stroke="{PAPER}" stroke-width="3"')
    + ''.join(R(x, 12, 3.5, 10, c, 1, 'stroke-width="2"') + P(f'M{x+1.75} 6C{x+4} 9 {x+3} 11 {x+1.75} 11C{x+.5} 11 {x-.5} 9 {x+1.75} 6Z', MUSTARD, 'stroke-width="1.6"') for x, c in ((21, TEAL), (30, RED), (39, MUSTARD))))
ICONS['upgrade-karaoke'] = (shadow() + C(40, 18, 11, GREY_L) + P('M32 12L46 26M34 9L49 24', 'none', 'stroke-width="1.6"') + P('M32 24L14 50C13 53 16 56 19 54L40 30Z', RED)
    + P('M50 40C54 42 56 46 54 50', 'none', 'stroke-width="2.4"') + P('M48 46C50 47 51 49 50 51', 'none', 'stroke-width="2.4"'))
ICONS['upgrade-minigolf'] = (shadow() + E(32, 48, 26, 8, GREEN) + E(40, 48, 5, 2, INK, 'stroke="none"') + L(40, 47, 40, 8) + P('M40 8L56 13L40 18Z', RED) + C(20, 46, 3.4, PAPER))
ICONS['upgrade-lasertag'] = (shadow() + P('M12 28C12 16 52 16 52 28V36C52 44 46 48 32 48C18 48 12 44 12 36Z', NAVY) + P('M14 28H50V36C42 40 22 40 14 36Z', MINT)
    + C(32, 20, 3, RED) + P('M18 32H30', 'none', f'stroke="{PAPER}" stroke-width="2.4"'))
ICONS['upgrade-banquet'] = (shadow() + P('M10 44H54V48H10Z', PAPER) + P('M14 44C14 30 22 24 32 24C42 24 50 30 50 44Z', GREY_L) + C(32, 21, 3.5, GREY_L)
    + HL('M20 40C20 34 24 30 28 29C25 32 23 36 23 40Z', '#fff', .7) + L(14, 48, 16, 56) + L(50, 48, 48, 56))
ICONS['upgrade-bocce'] = (shadow(32, 56, 22) + C(20, 40, 12, RED) + C(44, 38, 12, TEAL) + C(32, 22, 5, MUSTARD)
    + f'<path d="M12 36A9 9 0 0 1 18 30" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>')
ICONS['upgrade-stage'] = (shadow() + P('M40 12L48 4L54 10L46 18Z', BROWN) + L(42, 16, 24, 34, 'stroke-width="5"') + L(42, 16, 24, 34, f'stroke="{MAPLE}" stroke-width="2"')
    + P('M26 30C34 32 36 40 30 46C26 52 16 54 12 48C8 42 12 36 16 36C18 30 22 28 26 30Z', RED) + C(23, 41, 3, INK) + L(17, 45, 22, 50, 'stroke-width="2"'))
ICONS['upgrade-restaurant'] = (shadow() + C(32, 34, 18, PAPER) + C(32, 34, 11, 'none', f'stroke="{GREY_L}" stroke-width="3"') + C(32, 34, 18, 'none')
    + P('M8 14V26M5 14V22C5 26 11 26 11 22V14M8 26V54', 'none', 'stroke-width="2.6"') + P('M56 14C52 18 52 28 56 30V54', 'none', 'stroke-width="2.6"'))
for k, v in (('upgrade-snack', 'snack-counter'), ('upgrade-bar', 'bar'), ('upgrade-arcade', 'arcade'), ('upgrade-proshop', 'pro-shop')):
    ICONS[k] = ICONS[v]
for k in ('billiards', 'partyroom', 'karaoke', 'minigolf', 'lasertag', 'banquet', 'bocce', 'stage', 'restaurant'):
    ICONS['room-' + k] = ICONS['upgrade-' + k]

# PRO SHOP SHELF ITEMS
ICONS['shop-ball'] = shadow() + ball(32, 32, 20, RED, rot=15)
ICONS['shop-shoes'] = ICONS['nav-bowlers']
ICONS['shop-bag'] = (shadow() + P('M10 30C10 22 18 18 32 18C46 18 54 22 54 30V52H10Z', TEAL) + P('M22 18C22 8 42 8 42 18', 'none', 'stroke-width="4"') + L(10, 34, 54, 34) + R(26, 38, 12, 6, MUSTARD, 1))
ICONS['shop-towel'] = (shadow() + P('M12 16H52V50H12Z', MUSTARD) + P('M12 22H52M12 44H52', 'none', f'stroke="{RED}" stroke-width="3"') + P('M12 16H52V50H12Z', 'none'))
ICONS['shop-spray'] = (shadow() + R(22, 20, 20, 36, TEAL, 4) + R(26, 12, 12, 9, GREY_L, 2) + R(34, 8, 10, 6, RED, 1) + R(25, 30, 14, 14, PAPER, 1, 'stroke-width="2"') + pin(32, 32, 10, RED))
ICONS['shop-tape'] = (shadow() + C(32, 32, 20, PAPER) + C(32, 32, 20, 'none', f'stroke="{TEAL}" stroke-width="7"') + C(32, 32, 20, 'none') + C(32, 32, 8, MAPLE) + P('M50 36H58V44H48Z', PAPER))

# STORY / UI STAMPS
ICONS['story-letter'] = (shadow() + R(8, 16, 48, 34, PAPER, 2) + P('M8 18L32 36L56 18', 'none') + C(32, 36, 6, RED) + pin(32, 31, 9, MUSTARD, RED))
ICONS['story-offer'] = (shadow() + P('M14 8H44L50 14V56H14Z', PAPER) + P('M44 8V14H50', 'none') + ''.join(L(20, y, 44, y, 'stroke-width="2"') for y in (22, 28, 34, 40)) + C(40, 48, 6, PLUM) + L(20, 48, 32, 48, 'stroke-width="2"'))
ICONS['path-legacy'] = (C(32, 32, 26, MUSTARD) + P('M32 14L37 26L50 27L40 35L43 48L32 41L21 48L24 35L14 27L27 26Z', PAPER))
ICONS['path-backalley'] = (C(32, 32, 26, '#2a1f33') + P('M38 14C28 16 22 26 24 36C26 46 36 50 44 46C34 48 26 40 28 30C30 22 34 18 38 14Z', PINK) + C(44, 22, 1.6, PAPER, 'stroke="none"') + C(48, 34, 1.2, PAPER, 'stroke="none"'))
ICONS['vera'] = ''  # filled by portrait


# ---------------------------------------------------------------- scenes
def facade(level):
    """640x360 building illustration for the level-up cutscene."""
    W, H = 640, 360
    night = level >= 4
    sky = {0: '#E9D9B8', 1: '#EFD9AE', 2: '#F2C98F', 3: '#E8A27A', 4: '#3D5A73', 5: '#24314A'}[level]
    b = R(0, 0, W, H, sky, 0, 'stroke="none"')
    if night:
        for x, y in ((60, 40), (140, 80), (520, 50), (600, 110), (420, 30), (250, 36), (330, 70)):
            b += C(x, y, 2, PAPER, 'stroke="none" opacity=".8"')
        b += C(560, 70, 26, '#F6EDD0', 'stroke="none"') + C(572, 62, 24, sky, 'stroke="none"')
    else:
        b += C(540, 80, 34, '#FBE7B5', 'stroke="none" opacity=".9"')
    # distant town
    for i, (x, w, h) in enumerate(((0, 90, 120), (80, 70, 90), (470, 80, 110), (545, 95, 140))):
        b += R(x, 260 - h, w, h, '#000', 0, f'stroke="none" opacity="{.10 if not night else .25}"')
    b += R(0, 258, W, 102, '#5d6566' if not night else '#2b3133', 0, 'stroke="none"')
    b += R(0, 300, W, 60, '#6f7778' if not night else '#363d40', 0, 'stroke="none"')
    for x in range(20, W, 70):
        b += R(x, 326, 34, 5, PAPER, 0, 'stroke="none" opacity=".5"')
    g = ''
    wing = level >= 4
    bx, bw = 150, 340
    if wing:
        g += R(470, 150, 120, 110, TEAL_L if not night else TEAL, 0) + R(470, 140, 120, 12, TEAL_D, 0)
        for x in (488, 528, 562):
            g += R(x, 178, 22, 34, '#F7D98A' if night else SKY, 2)
    wall = {0: '#C9B79A', 1: '#D6C3A0', 2: CREAM, 3: CREAM, 4: CREAM, 5: CREAM}[level]
    g += R(bx, 120, bw, 140, wall, 0)
    g += R(bx - 8, 108, bw + 16, 16, MAPLE_D if level else '#9E8C70', 2)
    # awning stripes
    if level >= 2:
        stripes = ''.join(R(bx + 10 + i * 32, 140, 16, 26, PAPER, 0, 'stroke="none"') for i in range(10))
        g += R(bx + 10, 140, 320, 26, RED, 0, 'stroke="none"') + stripes + R(bx + 10, 140, 320, 26, 'none', 0)
        g += P(''.join(f'M{bx + 10 + i * 32} 166q8 10 16 0q8 10 16 0' for i in range(10)), RED)
    # windows / door
    lit = '#F7D98A' if night else SKY
    for x in (bx + 26, bx + 86, bx + 222, bx + 282):
        if level == 0:
            g += R(x, 186, 40, 44, '#8b7a62', 2) + L(x, 186, x + 40, 230, 'stroke-width="4"') + L(x + 40, 186, x, 230, 'stroke-width="4"')
        else:
            g += R(x, 186, 40, 44, lit, 2) + L(x + 20, 186, x + 20, 230, 'stroke-width="2"')
    g += R(bx + 146, 182, 48, 78, TEAL if level else '#6f6450', 2) + C(bx + 186, 222, 2.6, MUSTARD)
    # googie sign
    pole = 470 if not wing else 120
    signx = pole if not wing else 70
    g += R(pole - 5, 70, 10, 190, GREY_D)
    if level >= 1:
        sx, sy = (pole - 36, 40) if not wing else (signx - 10, 40)
        sx = pole - 36
        g += P(f'M{sx} {sy}H{sx + 72}L{sx + 64} {sy + 92}H{sx + 8}Z', MUSTARD if level >= 3 else MAPLE)
        letters = 'BOWL'
        for i, ch in enumerate(letters):
            col = (PINK if night else RED)
            glow = f'<text x="{sx + 36}" y="{sy + 26 + i * 20}" font-family="\'Bowlby One\',\'Arial Black\',Impact,sans-serif" font-size="20" fill="{col}" stroke="none" text-anchor="middle" opacity=".35" style="filter:blur(2px)">{ch}</text>' if night else ''
            g += glow + T(sx + 36, sy + 26 + i * 20, ch, 20, col)
        if level >= 3:
            cx, cy = pole, 22
            g += ''.join(L(cx, cy, cx + 18 * math.cos(a), cy + 18 * math.sin(a), f'stroke="{MUSTARD}" stroke-width="3"') for a in [i * math.pi / 4 for i in range(8)])
            g += C(cx, cy, 6, RED)
    else:
        g += R(pole - 30, 48, 60, 40, '#a19478', 2) + T(pole, 74, 'B_WL', 16, '#6b5f4c')
    # roof sign / pin
    if level >= 2:
        g += R(bx + 90, 62, 160, 46, TEAL_D, 4) + T(bx + 170, 94, 'LANES', 26, PINK if night else PAPER)
        g += pin(bx + 270, 52, 56, RED)
    elif level == 1:
        g += R(bx + 110, 80, 120, 28, MAPLE_D, 3) + T(bx + 170, 100, 'OPEN SOON', 15, PAPER)
    if level == 0:
        g += R(bx + 30, 236, 60, 10, BROWN, 1) + R(bx + 250, 240, 50, 8, BROWN, 1)
    # people / cars for busier levels
    def car(x, y, col):
        return P(f'M{x} {y}h70v-14c0-6-4-10-10-12l-8-12h-30l-10 12c-8 2-12 6-12 12z', col) + C(x + 14, y, 7, INK) + C(x + 56, y, 7, INK) + R(x + 24, y - 34, 14, 10, GLASS, 1, 'stroke-width="2"') + R(x + 40, y - 34, 12, 10, GLASS, 1, 'stroke-width="2"')
    if level >= 3:
        g += car(60, 300, TEAL) + car(520 if not wing else 380, 304, RED)
    if level >= 5:
        g += car(250, 312, MUSTARD)
        for x in (200, 440):
            b += f'<path d="M{x} 260L{x - 120} 0H{x - 60}Z" fill="{PAPER}" opacity=".08"/>'
    if night:
        g += R(bx, 120, bw, 140, '#000', 0, 'stroke="none" opacity=".18"')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">{b}<g stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">{g}</g></svg>'


def construction():
    W, H = 640, 360
    b = R(0, 0, W, H, '#EFD9AE', 0, 'stroke="none"') + R(0, 258, W, 102, '#8a7458', 0, 'stroke="none"')
    g = R(150, 120, 340, 140, '#D6C3A0') + R(142, 108, 356, 16, MAPLE_D, 2)
    for x in range(130, 520, 60):
        g += L(x, 90, x, 262, f'stroke="{GREY_D}" stroke-width="6"')
    for y in (130, 190, 250):
        g += L(120, y, 520, y, f'stroke="{GREY_D}" stroke-width="6"') + R(120, y - 10, 400, 8, MAPLE, 0, 'stroke-width="3"')
    g += P('M480 262V40H540', 'none', f'stroke="{MUSTARD}" stroke-width="10"') + L(540, 40, 540, 120, 'stroke-width="3"') + R(526, 120, 28, 20, RED, 2)
    g += P('M60 262L90 210L120 262Z', ORANGE) + L(72, 240, 108, 240, f'stroke="{PAPER}" stroke-width="5"')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">{b}<g stroke="{INK}" stroke-width="4" stroke-linejoin="round">{g}</g></svg>'



def lane_deck_svg():
    """Pin deck seen from above (top of each lane). Lane boards and gutters are drawn in CSS."""
    W, H = 100, 78
    b = R(0, 0, W, H, MAPLE_L, 0, 'stroke="none"') + R(0, 0, W, 6, '#3c4446', 0, 'stroke="none"')
    for n, y in ((1, 64), (2, 50), (3, 36), (4, 22)):
        for k in range(n):
            x = 50 + (k - (n - 1) / 2) * 19
            b += f'<circle cx="{x}" cy="{y}" r="6.6" fill="{PAPER}" stroke="{INK}" stroke-width="2.2"/><circle cx="{x}" cy="{y}" r="3.1" fill="none" stroke="{RED}" stroke-width="1.8"/>'
    b += L(0, 76, 100, 76, f'stroke="{INK}" stroke-width="2" opacity=".45"')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">{b}</svg>'


def lane_arrows_svg():
    b = ''
    for k in range(7):
        x = 8 + k * 14; y = 4 + abs(k - 3) * 6
        b += f'<path d="M{x} {y}l-4 10h8z" fill="{RED_D}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 34">{b}</svg>'


def main(out):
    os.makedirs(out, exist_ok=True)
    n = 0
    # identical drawings are shipped once; asset-map.js points the duplicate keys at these files
    skip = {'upgrade-arcade', 'drink-beer', 'upgrade-bar', 'shop-shoes', 'trophy', 'upgrade-proshop', 'snack-popcorn', 'upgrade-snack'} | {k for k in ICONS if k.startswith('room-')}
    for name, body in ICONS.items():
        if not body or name in skip:
            continue
        open(os.path.join(out, name + '.svg'), 'w').write(svg(body)); n += 1
    for name, spec in PEOPLE.items():
        open(os.path.join(out, name + '.svg'), 'w').write(portrait(**spec)); n += 1
    open(os.path.join(out, 'lane-deck.svg'), 'w').write(lane_deck_svg()); n += 1
    open(os.path.join(out, 'lane-arrows.svg'), 'w').write(lane_arrows_svg()); n += 1
    for lv in (0, 2, 3, 4, 5):
        open(os.path.join(out, f'cutscene-level{lv if lv else "-empty"}.svg'.replace('level-empty', 'empty')), 'w').write(facade(lv)); n += 1
    open(os.path.join(out, 'cutscene-dirt.svg'), 'w').write(construction()); n += 1
    print('wrote', n, 'files to', out)


if __name__ == '__main__':
    main(sys.argv[1])
