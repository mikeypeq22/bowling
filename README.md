# From Gutter to Glory — v1.05

**Shared City & District Leagues.** Full change list in `RELEASE_NOTES.md`.

## Files
- `index.html`, `style.css`, `app.js`, `engine.js`: GitHub Pages game and interface.
- `cloud.js`, `firebase-config.js`, `firestore.rules`: existing Firebase Google/email sign-in and cloud-save wiring (rules must still be published through Firebase Console if changed).
- `assets/asset-map.js`: image-switchboard and optional overrides.
- `PLAYABLE_DEMO.html`: standalone *local save only* browser demo, separately offered for testing.
- `PROGRESSION_MASTER_v4.3.md` / `Progression_Master_v4.3.docx`: living design, version log, and status ledger.

## Deployment
1. Export your current saved game from Settings first.
2. Upload the **contents** of the GitHub Pages ZIP to the existing `bowling` repository root.
3. Verify v1.05 appears on the opening screen. Hard-refresh or retry a private window if the deployed build is cached.
4. Check live sign-in, saves, and iPhone behavior separately. Local tests cannot validate Firebase permissions or real devices.

## Test the new paths quickly
Open **Settings → Development Testing** and choose either developed story scenario. These use a separate, non-cloud preview save. Legacy district leagues are in **Compete**; Back Alley territory missions are under **Goals**. Choose `Exit Preview` afterward to return to your real game.

## Gameplay notes
District influence is not an ownership deed. Back Alley requires two successful encounters per district and a wing expansion for later territories. Legacy requires local league victories and district finals; your bowling center can remain on a six-lane property while competing citywide.
