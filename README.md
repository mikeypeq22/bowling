# From Gutter to Glory — v1.02

A browser-based bowling alley management and story game. In *The Legacy*, run a community bowling center and compete for a national championship; in *The Back Alley*, protect an after-hours business against Vera, develop the Casino Lounge, maintain night security, and manage risk.

## Releases
- `From_Gutter_to_Glory_Playable_v1.02.html`: standalone demo, browser-local saves, NO Firebase access.
- `From_Gutter_to_Glory_GitHub_Pages_v1.02.zip`: upload its **contents** directly to the site's published directory on GitHub Pages. This includes the already-configured public Firebase settings; it does not upload private admin credentials.
- `From_Gutter_to_Glory_Project_v1.02.zip`: complete editable project, tests, release notes and development roadmap.

## Critical deployment note
The login and welcome screens both display **v1.02**. The HTML references `?v=1.02` for local scripts and CSS to reduce cached-version mixups. After deployment, make sure GitHub Pages has finished publishing and reload or open a private tab to verify the actual live version. Upload all required files together, not only `index.html`.

## Cloud save repair
Authenticated players see **Replace cloud save** either on the cloud-choice/failure screen or in Settings. This is destructive to their *game progress*, not their account:
1. When available, use **Download old cloud save** first. Valid backups are importable; invalid records are saved for inspection only.
2. Click Replace cloud save, approve the warning, and type `RESET CLOUD` exactly.
3. The game attempts an owner-authenticated Firestore transaction, reading the existing revision and replacing it with an entirely fresh game. Other devices must reload before saving again.
4. If the Firestore `permission-denied` error persists, this reset cannot override the database security rules. Verify the rules in Firebase Console as described in `FIREBASE_SETUP.md` and retry. No feature here circumvents authentication.
5. If a network error occurs during reset, refresh and compare before trying again; the transaction may have committed before connectivity failed.

## Development Preview
Settings → Development Testing → Preview Developed Back Alley. The preview opens the **Alley** tab immediately with six usable lanes, built businesses and $5,800. Tap Casino Lounge to make fictional $10–$100 wheel bets or hire a Pit Boss to handle visitor wagering or Build → Night Defenses for counterplanning. Test progress stays local and cannot sync to Firebase. Exit Preview to return to the original session.

## Content and wagering
The Back Alley is written for a more adult crime-drama audience and includes gambling **only with fictional gameplay dollars**. These dollars cannot be bought for real money or exchanged for real-world value, and wagers cannot be withdrawn. The Legacy remains lighter. Any future app-store age rating and policy review must be conducted separately before publication.

## Project architecture
`engine.js` stores the deterministic simulation and save state; `app.js` renders the UI; `style.css` controls layouts; `cloud.js` handles Firebase authentication and revision-checked Firestore writes; `assets/asset-map.js` allows art replacement. `firestore.rules` must be published manually in Firebase Console, never just uploaded to GitHub.

See `RELEASE_NOTES.md`, `RESEARCH_AND_QA.md`, `V103_MINIGAME_DESIGN.md`, and `V103_PARKING_LOT.md`.
