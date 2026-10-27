# Replace the artwork — v0.7

This is the art folder for the editable project. All artwork remains optional, and built-in CSS/emoji keep the game playable with no PNGs installed.

To replace an icon, drop an image here and use the suggested filename from `asset-map.js`. Alternatively, keep your own filename and change only the right side of the corresponding entry.

Example: `'nav.employees': 'assets/my-staff-icon.webp'` replaces the Staff navigation icon. `'employee.bar': 'assets/bartender-portrait.png'` replaces the bartender role portrait.

Other keys include scene backgrounds, lane art, customer sprites, room icons, drinks, snacks, arcade machines, decorative fixtures and cutscene backgrounds. See `asset-map.js` for the full list.

Formats: PNG, WebP, SVG, JPG, GIF. Suggested sizes: 256px square icons, 512px square portraits, 1280×720 backgrounds. Transparency is recommended for character art. **Use the full ZIP** for this workflow. The standalone HTML contains fallback graphics and does not reference an adjacent assets folder reliably.

## v0.93 extras
Snack asset keys added automatically: `snack.fries`, `snack.burger`, and `snack.cheeseburger`. Map these to `assets/snack-fries.png`, `assets/snack-burger.png`, and `assets/snack-cheeseburger.png` in `asset-map.js` to replace their emoji placeholders. Starter décor uses the existing wall-paint and fixture renderers.
