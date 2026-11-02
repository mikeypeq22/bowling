# v1.06 Local QA report

## Verified
- `node --check` on `engine.js`, `app.js`, `cloud.js`.
- **Gameplay unchanged:** v1.05 and v1.06 engines run 60 days from both development scenarios with identical cash, reputation and day.
- **Long run:** 200 simulated days (new game, Legacy, Back Alley) stay valid under `checkState`; Legacy save ~243 KB → ~124 KB; worst hour tick under 5 ms in Node.
- **Migration:** a 40-day v1.05 Back Alley save (269 KB) loads in v1.06 as valid schema 20 (118 KB, 21 reports, 7 with hourly logs).
- **Browser (Chromium, standalone demo):** new game → loan → first lane → four days → every tab → all 12 facility drawers → reload restores the save; no page or console errors at 320, 390 and 1280 px. Screenshots reviewed for alley, drawers, bowlers, staff, goals, story, startup, branch and cutscene.
- **Performance probe (390 px, Legacy preview, 24 manual hours):** median render 7.3 → 5.4 ms; alley DOM ~1,990 → ~930 elements; failing image requests 116 → 0.
- Hosted `index.html` loads the art and shows the cloud gate without page errors (Firebase itself is unreachable from the test sandbox).

## Unverified
- Live Firebase sign-in, Firestore saves and rules; real iPhone/Android devices (font rendering, `pagehide` flushing in Safari, background pause); long real-time play sessions.
- The dark-route traffic regression reported after v1.05 (not investigated in this release).
