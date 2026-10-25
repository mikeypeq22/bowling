# From Gutter to Glory — v0.7

A cozy-but-detailed local-browser bowling-alley building, idle and management game. The v0.7 release focuses on a **flat, playful scorecard-inspired UI** and the staff, stock and guest-life systems.

## Play

- Double-click the separate `From_Gutter_to_Glory_Playable_v0.7.html` file for the easiest standalone preview.
- For editable artwork, use this **full project**: keep `index.html`, `engine.js`, `app.js`, `style.css` and `assets/` together, then open `index.html`. Your browser's local-file rules may restrict some saves; serving the folder locally can help.
- Progress saves locally in the browser using `gutter-to-glory-v07`. v0.6 saves are automatically migrated when the browser shares the same storage origin. Earlier saves may also be converted. Exchanging HTML files does not necessarily share browser storage; keep a copy of your old file and ZIP.
- Day is eight hourly shifts, **2:00 PM to 10:00 PM**. Week 1 starts on Monday. Auto advances the clock, but the closing report pauses by default; only the explicit skip setting bypasses it.

## What's new in v0.7

### User interface

- Reduced gradients, flatter arcade-style button and card treatments, warmer typography and more humorous guest feedback.
- Headline statistics beside *Your Bowling Alley*; *The Day’s Drama* moves **below** the main scene. No more Alley Pulse.
- Separate **Goals** and **Staff** navigation tabs. Build now has **Construction**, **Your Lanes**, **Customize**, **Floor Plan** sections.
- The room layout controls now live in Build → Floor Plan. Choose *Rearrange rooms* to enter alley layout mode.
- Low-stock flags appear at the top of the alley and directly on snack/bar tiles.

### Employees and stock

- Snack, bar and pro shop require **one employee per single-square room, or two if expanded**. An arcade needs no staff.
- Hiring costs a one-time fee. Staff receive **daily wages at close**. You can adjust each wage from $8 to $32 and pay to train to level 3. Better morale and staff training improve sales probabilities; low wages slowly reduce morale. Staff never permanently quit in this early version.
- The optional **Stock Clerk** automatically orders unlocked low-stock items when the alley closes. Set a threshold (1–12) in Staff. Incoming orders are counted to avoid overordering.
- Manual snack and bar orders **pay immediately but arrive the next morning**. A new delivery list shows what's coming. Starting inventory is included with new counters.

### Guests and leagues

- When food/bar/arcade/pro shop is available, some visitors drop in just for a drink, food, games, or equipment. Their actions are logged with the right room destinations.
- On Thursday, a registered six-lane league takes **all six lanes from 6:00–8:00 PM**. Other bowling groups may wait or leave; receipts are awarded at closing if the full two-hour session occurred.
- Closing reports only show optional food, bar, arcade and league metrics for services operating at closing, rather than showing zeros for never-built facilities. Funny but actionable comments appear when there's no food or wait times are bad.

## Files and agent workstreams

- `engine.js` — deterministic state, transactions, economy, hourly events, arrivals, payroll, deliveries and progression.
- `app.js` — screens, menus, visitor path animation, save management and closing reports.
- `style.css` — original alley scene graphics plus revised v0.7 flat retro UI.
- `assets/asset-map.js` — change one image path to replace menus, staff icon portraits, rooms, fixtures and scenery.
- `qa_tests_v07.js` — repeatable engine tests; run using `node qa_tests_v07.js`.
- `browser_test_v07.py` — headless Chromium interaction checks; requires Python Playwright, Chromium and an accompanying standalone build.
- `build_standalone.py` — reconstructs the single HTML playable.
- `RESEARCH_AND_QA.md` and `DEVELOPMENT.md` — our two separate workstreams (not independent background agents).
- `DECISION_LOG.md`, `RELEASE_NOTES.md` — design history and release scope.

## Known limitations

- Employees are simplified game roles, not shift schedulers. No hiring interviews, firing or turnover yet.
- Retail walk-in behavior and customer quotes are simulated, not representative of real sales or staffing economics.
- The game is local/single-player. Only six bowling lanes, four placeable room types, and one Thursday league are implemented.
- Graphics are prototypes. The detailed mini bowling scene remains intentionally unchanged; most changes are in the menus and HUD.
- Human playtesting is still needed to judge whether the pacing feels fun.
