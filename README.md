# From Gutter to Glory v1.01 — The Night Shift Rebuild

Web-based bowling-center management game; two permanently distinct rivalry campaigns per location.

## Play and deployment
- `index.html` serves the GitHub Pages game with Firebase login. Upload the **contents** of the GitHub Pages ZIP to your repository's published directory.
- `From_Gutter_to_Glory_Playable_v1.01.html` is a standalone local demo, saves to this browser only, and intentionally has no Firebase authentication.
- `engine.js` contains the deterministic game simulation; `app.js` renders the interface; `style.css` handles visual presentation.
- `assets/asset-map.js` centralizes optional image replacements, and `cloud.js` retains Google/email Firebase login and Firestore saves.
- The existing `firestore.rules` must already be published to Firestore for cloud saves; updating GitHub doesn't publish rules.

## Test the dark branch quickly
Open the game, select Settings (gear icon), find **Development Testing**, and choose **Preview Developed Back Alley**. The test uses a separate local save and blocks cloud writes. Visit **Build → Construction → Night Defenses** to purchase cameras, door crew or preparedness. In the alley scene, tap the security post above the entrance. Visit **Goals → Story** to read six new chapters and see the new campaign objective. Advance days to encounter Vera's schemes, or visit the Casino Lounge.

Use **Exit Preview & Return to Real Game** to restore the original live session. An export backup is recommended before deploying new versions. Preview is for local QA, not a production cheat.

## Fiction and rating
Casino Lounge is a ticket-prize arcade theme, not a real-money casino. The game remains a fictional teen-oriented crime story, but an app store makes its own age-rating assessment.

## Current limitations
Some inherited systems (such as league tournaments, food inventory and worker management) intentionally still share code between both routes. iPhone browser logins and live Firebase sync have not been retested. Read `RELEASE_NOTES.md` and `RESEARCH_AND_QA.md` for details.
