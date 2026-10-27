# Replace the artwork — v0.7

This is the art folder for the editable project. All artwork remains optional, and built-in CSS/emoji keep the game playable with no PNGs installed.

To replace an icon, drop an image here and use the suggested filename from `asset-map.js`. Alternatively, keep your own filename and change only the right side of the corresponding entry.

Example: `'nav.employees': 'assets/my-staff-icon.webp'` replaces the Staff navigation icon. `'employee.bar': 'assets/bartender-portrait.png'` replaces the bartender role portrait.

Other keys include scene backgrounds, lane art, customer sprites, room icons, drinks, snacks, arcade machines, decorative fixtures and cutscene backgrounds. See `asset-map.js` for the full list.

Formats: PNG, WebP, SVG, JPG, GIF. Suggested sizes: 256px square icons, 512px square portraits, 1280×720 backgrounds. Transparency is recommended for character art. **Use the full ZIP** for this workflow. The standalone HTML contains fallback graphics and does not reference an adjacent assets folder reliably.

## v0.93 extras
Snack asset keys added automatically: `snack.fries`, `snack.burger`, and `snack.cheeseburger`. Map these to `assets/snack-fries.png`, `assets/snack-burger.png`, and `assets/snack-cheeseburger.png` in `asset-map.js` to replace their emoji placeholders. Starter décor uses the existing wall-paint and fixture renderers.


## v0.95 facility illustrations

The snack, bar, arcade and pro-shop menus have colorful built-in illustrated fallbacks. Override any one of them by putting a PNG, WebP or JPG under the corresponding filename below; no code edits needed.

| Asset key | Example filename |
|---|---|
| `scene.empty` | `assets/venue-empty.png` |
| `cutscene.empty` | `assets/cutscene-empty.png` |
| `facility.snack.tier1` / `.tier2` | `assets/facility-snack-tier1.png`, `assets/facility-snack-tier2.png` |
| `facility.bar.tier1` / `.tier2` | `assets/facility-bar-tier1.png`, `assets/facility-bar-tier2.png` |
| `facility.arcade.tier1` / `.tier2` | `assets/facility-arcade-tier1.png`, `assets/facility-arcade-tier2.png` |
| `facility.proshop.tier1` / `.tier2` | `assets/facility-proshop-tier1.png`, `assets/facility-proshop-tier2.png` |

Suggested aspect ratio: 3:2 or 16:9; the image fills the preview and crops if necessary. If a file is missing, the default drawn scene remains visible. Future room-specific decorations can be drawn into these fallback scenes or supplied as additional layers.


**v0.95 note:** The three lane upgrade kits and scoring themes currently use native CSS/emoji indicators; the core lane image (`world.lane`) remains replaceable.
