# v1.08 Local QA report

- 60-day matched simulations (Legacy, Back Alley): identical cash and reputation to v1.07; 200-day runs valid.
- Conversation balance: across 360 test encounters the best answer appeared in position 1/2/3 in 123/124/113 cases. Best answers by letter: a 23, b 17, c 1 before shuffling.
- A v1.07 save with a queued conversation migrates; the conversation can be answered and the state validates.
- Firebase client validator accepts both a fresh reset save and a save after conversations.
- Browser at 390 and 1280 px: closing report, conversation (question → reply → Continue), staff room and Goals → Regulars reviewed by screenshot; smoke test, wing test: no page errors. Only one tab is visible at a time at 1280 px.

---

# v1.07 Local QA report

## Verified
- `node --check` on all scripts. 60-day matched simulations of both routes: identical cash and reputation to v1.06; 200-day runs stay valid.
- All 13 rooms fit their fixed spots at once with every base room at level 2 (`checkState` passes). Each attraction's spot becomes buildable exactly when its wing is owned.
- A v1.06 save with rooms moved to non-standard squares migrates to the fixed spots and validates.
- Browser (Chromium, standalone demo) at 320, 390 and 1280 px: new game shows six grey lanes with "Open Lane 1 $160", faded shop spots with prices and locked Wing 1 spots. Legacy preview: Open Wing 1 → construction → Wing 1 finishes → four new lane spots and Billiards/Party Room become buildable; building Billiards from its sign shows the construction state; Back Alley preview renders in the dark palette. Smoke test (every tab, every drawer, reload) passes with no page errors.

## Unverified
- Live Firebase and real devices (unchanged from v1.06).

---

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
