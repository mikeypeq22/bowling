# Artwork — v1.06

The game ships with its own art set in `assets/art/` (SVG, one shared style). `asset-map.js` maps every game key to a file there.

**To use your own picture:** drop a PNG, WebP, JPG or SVG into `assets/` and change only the right-hand side of the matching line in `asset-map.js`, e.g. `'employee.bar': 'assets/my-bartender.png'`. If a file is missing, the game shows the emoji fallback once and stops asking for it.

**To change the built-in style:** edit `tools/art.py` (palette and shapes live at the top) and run `python3 tools/art.py assets/art`, then rebuild the demo with `python3 tools/build_demo.py .`.

Suggested sizes for replacements: square icons ≥256 px, portraits 512 px square, level-up scenes 16:9 (1280×720). Transparent backgrounds work best for icons.

Optional keys with no built-in art (add them to `asset-map.js` if you make your own):

| Key | What it replaces |
|---|---|
| `scene.empty`, `scene.neighborhood`, `scene.league`, `scene.regional` | Backdrop of the venue map |
| `facility.snack.tier1` … `facility.proshop.tier2` | The drawn counter scene in each room panel (3:2) |
| `world.visitor`, `world.empty` | Guest sprite and empty floor squares |

`fonts/` holds Bowlby One and Barlow under the SIL Open Font License (see the OFL files).
