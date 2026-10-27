# From Gutter to Glory — v0.93

Playable bowling center management prototype, designed as a readable idle/building game with authentic operations.

## Launch
- `index.html` is the GitHub Pages entry point. Upload the top-level files and the `assets` folder to the root of your `mikeypeq22/bowling` repository.
- `.nojekyll` is included.
- `firebase-config.js` uses your existing Firebase web app. **Never commit admin keys or service-account credentials.**
- Authentication and cloud saving are implemented in `cloud.js`; Google and email/password must be enabled in Firebase and `firestore.rules` must be published via Firebase Console.
- The downloadable single-file demo has Firebase disabled intentionally; it stores progress locally.

## New game
1. Sign in (or use the local demo). New games play the opening cutscene.
2. Choose a loan: $1,000 with $85/week or $1,800 with $150/week. You also contribute $600 of fictional personal savings. The loans have no in-game interest.
3. Choose an initial decor package: free rustic, family, lounge, or bowler-focused.
4. Open your first center. It initially has one lane, and the property holds up to six lanes.
5. You can start construction on snacks, bar, pro shop, arcade, or additional lanes in the order you want. A roof is useful but is **not** a prerequisite for opening a counter.
6. At Level 3, choose one of four business specialties. At six lanes, the Thursday weekly league becomes available.
7. Once six lane positions are filled, buy the neighboring lot to expand capacity to ten. Construction takes four closings.

## Returning players
Older v0.92 and v0.91 saves are migrated to the v0.93 game state **without forcing a new loan or new starter setup**. Existing Firebase authentication settings, UID-based player documents and Firestore security rules are unchanged. Back up your save before updating your live site.

## v0.93 changes
- Startup loans and opening decorating choices.
- Open build order (snacks/bar/arcade/pro shop no longer require the roof).
- Levels are based on objective counts and *any* income-generating rooms.
- Established-alley specialties (Family Funhouse, Serious Strikes, Social Lounge, Neighborhood Classic).
- Buy adjacent property (six slots -> ten total lanes).
- Add fries, hamburgers, and cheeseburgers with stock, prices, next-day deliveries and unlock milestones.
- Customer happiness 0–100, with daily trend and breakdown in closing reports.
- Optional paid overnight construction rush at the closing report.

## Known limitations
- This remains a local-front-end simulation; no real-world financial advice or real-world bowling facility data is used for the fictional prices and loans.
- Opening more than one bowling center has **not yet been implemented**.
- Specialties currently supply fixed gameplay bonuses rather than their own separate technology trees or locations.
- Google/email sign-in and Firebase save operations require **live** testing against your Firebase project, including mobile Safari.
- Browser testing of the interactive demo was performed by injecting the standalone document into Chromium; local file/HTTP navigation was blocked by the environment.

## Development files
- `engine.js`: independent game simulation, save version 8 (migrates version 7).
- `app.js`: rendered UI and input logic.
- `style.css`: responsive layout.
- `cloud.js`: Firebase auth and cloud saves (unchanged from v0.92).
- `assets/asset-map.js`: drop-in image filename mapping.
- `qa_v093.cjs`: local logic tests (`node qa_v093.cjs`).
- `RESEARCH_MASTER_v1.md`: prior bowling industry research, preserved for future design discussions.
