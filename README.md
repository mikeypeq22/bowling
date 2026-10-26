# From Gutter to Glory — v0.91

Playable bowling alley simulator with a **Firebase Google sign-in and per-player cloud save architecture**.

## Launch options

- `index.html` — main game, when served over HTTPS or `http://localhost`.
- `From_Gutter_to_Glory_Playable_v0.91.html` — standalone preview with **local-demo save only**.
- `firebase-config.js` — public Firebase Web configuration. Empty by default.
- `FIREBASE_SETUP.md` — complete no-cost Spark setup, Google sign-in and security rule installation.
- `firestore.rules` — required per-user Firestore access controls.

> IMPORTANT: Google login and cloud saving **will not work until the Firebase account owner creates the project and fills in the config file**, enables Google Authentication, adds their site domain, creates Firestore and publishes the security rules.

## New in v0.91

- Google account login gate (when Firebase is configured)
- Profile with editable nickname
- Choice between cloud and local saves; migration from v0.9
- Cloud save at each game-day closing; manual save also available
- Conflict detection using a Firestore transaction and `revision`
- UID-scoped local backups; save import/export still available
- No Firebase required for free local-only prototype testing
- GitHub Pages compatible; retains v0.9 simulation, UI, and image mappings

Read `RELEASE_NOTES.md` for limits and testing notes.
