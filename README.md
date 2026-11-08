# From Gutter to Glory — v1.08

**Closing report, staff room and regulars rebuilt.** Full change list, newest first, in `RELEASE_NOTES.md`.

## Files
- `index.html`, `style.css`, `theme.css`, `app.js`, `engine.js`: GitHub Pages game and interface. `theme.css` is the v1.06 visual layer loaded after `style.css`.
- `assets/art/`: the built-in SVG art set. `assets/asset-map.js` maps every game key to it; change a line there to use your own image.
- `assets/fonts/`: Bowlby One and Barlow (SIL Open Font License; licenses included).
- `cloud.js`, `firebase-config.js`, `firestore.rules`: unchanged Firebase Google/email sign-in and cloud-save wiring.
- `PLAYABLE_DEMO.html`: standalone *local save only* demo with art and fonts embedded.
- `tools/art.py`: regenerates `assets/art/` (`python3 tools/art.py assets/art`). `tools/build_demo.py`: rebuilds the standalone demo (`python3 tools/build_demo.py .`).
- `PROGRESSION_MASTER_v4.5.md`: living design, version log and status ledger (the `.docx` is still the v4.3 edition).

## Deployment
1. Export your current saved game from Settings first.
2. Upload the **contents** of this ZIP to the existing `bowling` repository root, including `theme.css`, `assets/art/` and `assets/fonts/`.
3. Verify v1.08 appears on the opening screen. Hard-refresh or retry a private window if the deployed build is cached.
4. Check live sign-in, saves and iPhone behavior separately. Local tests cannot validate Firebase permissions or real devices.

## Test quickly
**Settings → Development Testing** loads a separate, non-cloud preview save for either story route. `Exit Preview` returns to your real game.
