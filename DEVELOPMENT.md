# Development — v0.91

- UI in `app.js` and `style.css`, game simulation in `engine.js`.
- New `cloud.js` is isolated; `window.GTGApp` provides a small bridge to game state.
- `firebase-config.js` is editable without touching gameplay. No secrets should be added.
- `firestore.rules` restrict owner paths.
- Firebase SDK uses pinned Web ESM CDN imports; loaded only when config is present.
- Saves queued serially and stored using Firestore transactions with optimistic revision checks.
- Future work: secure account deletion, more account providers, server-side score verification, multi-slot saves, automated Firebase emulator tests.
