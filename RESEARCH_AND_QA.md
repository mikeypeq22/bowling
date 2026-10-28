# v0.98 — Research and QA Workstream

## Evidence classification

- **ACCOUNT TEST / High:** engine and automated browser tests run in this build.
- **INFERENCE / Medium:** chosen traffic weights, event probabilities, fictional booking prices and repair fees. Gameplay balance, not industry statistics.
- **DESIGN / Medium:** unlock sequence and specialty expansion chosen to keep early menus readable.
- **UNVERIFIED:** production Google Authentication / Firestore cloud save roundtrip; real-world player enjoyment and economy balance.

## Executed tests

- `node /mnt/data/test_v098_engine.js`: **PASS 185 targeted assertions** in the local code environment. Exercises schema migration from v0.97, six property stages, all six attractions, repair closures, parties, loyalty dialogue, time-based traffic, and 360 simulated game days.
- Across the 360-day simulation, **38 random events**, minimum interval **5 days**, verifying shared cooldown.
- Automated browser page assembly through Playwright's in-memory HTML loading (direct `file://` and temporary local URL navigation blocked by the testing environment): 320px, 390px and 1280px startup/story and Build screens, no observed JavaScript errors.
- Additional browser interaction tests using synthetic saves: 24 lanes and multi-row shop layout; repair modal and action; named-regular dialogue and action; Future Wings tab. Screenshots included in the full editable project.

## Open QA concerns

- There has been **no human playtest** of a full multi-wing business; economy and event cadence remain provisional.
- Live Google sign-in and cloud save behavior still need confirmation on the deployed GitHub Pages site. No live production data has been modified in testing.
- Very large centers are navigable by scrolling, but a zoomable or sectional map would improve phone usability.
- Recovery from extraordinary low-cash repair scenarios should be monitored in longer economic simulations and on-device play.
