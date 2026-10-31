# Development notes — v1.02

Major technical changes:
- `engine.js` save schema `17`; migration from 16 includes new persistent casino, security and insurance state; migrate both active location and stored other-town snapshots.
- `cloud.js` owner-only transactional reset with `RESET CLOUD` confirmation; raw/valid export depending on cloud document integrity. Published Firestore rules intentionally disallow deletion, so reset writes a valid new game over the existing one.
- `app.js` developer test path now lands in the alley instead of the Goals panel. First-click tutorial prompts suppressed while testing.
- `index.html` displays v1.02 on both login and welcome and cache-busts CSS/JS.
- Demo build generated using inline stylesheet and JS with Firebase scripts removed. Keep cloud-enabled GitHub ZIP separate from standalone local demo.
- Future mini-games need central mini-game engine, frame-based input safe on touchscreens, deterministic state and guardrails against replay/save abuse.

Do not publish screenshots as game asset sources. Keep optional art filenames in `assets/asset-map.js`.
