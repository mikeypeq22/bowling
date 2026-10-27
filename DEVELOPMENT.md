# Design and Development agent — v0.93

## Architecture
- `engine.js` is the deterministic browser-independent model, save version 8.
- `app.js` manages the player UI, event routing, starter wizard, property and specialty panels, and summary construction rush.
- `style.css` adds mobile-friendly starter choices and property panels while preserving the v0.92 alley scene.
- `cloud.js` and Firebase config retain their previous authentication and cloud-save behavior.
- `assets/asset-map.js` remains the single place to change filenames for custom visuals; new snack art keys are added automatically by the game.

## Further development tasks
1. Cloud real-device regression and backup compatibility after deployment.
2. Customer personas by visit intent and incremental happiness scoring.
3. Dedicated specialty tech trees and visual differences; improve the 10-lane scene.
4. Multi-property save schema and overview dashboard (not yet implemented).
5. Pro shop catalogue and services, rental equipment, schedules and employee specializations.

## Save migration
`migrate` accepts v0.92's version-7 state and yields version 8, preserving the existing data. New fields default to loan balance 0, no specialty, happiness 65, landOwned false, startupPending false. Initial cash and completed buildings do not change.

## Deployment
GitHub Pages ZIP has files at repository root with `.nojekyll`. Avoid overwriting `firebase-config.js` with a mock config or a standalone local demo. Always export a backup before major updates.
