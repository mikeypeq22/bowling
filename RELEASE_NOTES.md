# v0.96 Release Notes — Lanes, Guests and the Night Shift

## Player-facing fixes
- Front Desk and Waiting Area moved above the Entrance; Advertising grouped along the left service strip.
- Lanes and room squares made wider. Removed the old "OPEN FOR FUN" corner label and repositioned Customize above Shops & Activities.
- Rebalanced bowling demand: less opening-night chaos, more mature demand from reputation, additional lanes, owner skills, advertising, and better facilities.
- Round-robin allocation uses Lane 4/5/6 instead of leaving them idle behind Lane 1/2/3.
- Parties stay 1–3 game hours (or fewer if the center is about to close). Extra hours earn another lane-rental charge; shoes remain a one-time charge.
- Expanded overheard dialogue and unhappy-waiting comments.
- Lane Technician now *actually* buys spare parts and services lanes automatically at nightly close. It costs $16 daily plus actual repair/supply expenses. Staff displays its operational status.
- Front Desk explains the new session pricing; closing report shows paid lane-hours and technician activity if applicable.

## Compatibility
- State schema version 11, migrating existing version-10 v0.95 saves and earlier supported formats.
- Player login and Firestore document path unchanged. Firebase settings and security rules preserved.
- The separate standalone HTML intentionally disables cloud services.

## QA
- Existing v0.95 regression suite: 1,540 checks passed.
- v0.96 focused simulation suite: 20,572 assertions passed across 80 opening and 80 mature-center runs, including no double-booked lanes, all six lanes used, 1/2/3-hour sessions, technician costs, and migration.
- Scripted first-nine-day mean: 2.20 group arrivals per day (includes construction days). Scripted developed-center sample: 318 arrivals over 14 days and all six lanes occupied at various times. These are simulation examples with artificially established reputation and skill, not playtest targets.
- Chromium in-memory browser checks: 320px, 390px, and 1280px scenes; visual positioning, opening wizard, six lanes, and zero captured page JS errors in those sequences.
- Local file URL browser navigation was blocked by this test environment. In-memory rendering passed; actual GitHub Pages deployment, Firebase login/cloud saves, and iOS Safari remain unverified for v0.96.
