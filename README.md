# From Gutter to Glory — v0.94

**The Empty Building / Grand Opening update**  
A bowling center building game with an optional idle clock, real operating choices, and replaceable visual assets.

## Start a new game
1. Choose local play in the standalone demo, or sign in in the configured GitHub Pages version.
2. The opening cutscene introduces an **empty building** (roof and walls included, no lanes). You have $600 fictional personal savings and pick an interest-free fictional startup loan ($1,000 / $85 per Sunday or $1,800 / $150 per Sunday).
3. Pick a starter wall/furnishing style. Once you have the keys, build lane 1 for **$160** (2 game days). You can also start with a snack bar, a bar, arcade, or pro shop in **any order**, subject to cash and floor space.
4. Bowling demand waits for your first completed lane, preventing absurd angry lineups at an unopened center. Staffed snack/bar counters or a working arcade can attract non-bowling visitors before the first lane opens.
5. Every major facility completion (snack, bar, arcade, pro shop) produces a **grand-opening teaching popup** after the daily closing report; room expansions receive a separate explanation. Messages remain queued across save/reopen and appear one at a time.
6. Open Snacks, Bar, Arcade, or Pro Shop by tapping its room square. Above each menu, a new **illustrated room view** visibly differs between 1-square and 2-square tiers. Optional artwork replacements override the illustration.

## Reminders and mechanics
- Snack and bar orders arrive the **following game morning**. Ordering does **not** refill current stock.
- Low-stock warnings are **separate for snacks and bar** in the alley, and room tiles display their own warnings. Set your threshold under Staff.
- Snack and bar each require one worker, two when expanded; pro shop likewise. Arcade machines require no employees. A Stock Clerk can automate ordering once hired (purchases arrive the following morning).
- Room-specific upgrades such as snack-only TVs, condiment stations, seating and better ovens are **planned**, not yet purchasable. Global TV fixtures currently appear in room previews when installed.
- First property houses up to six lanes, after which adjacent land can increase capacity to ten. Specialty choice and other v0.93 systems remain.

## Launch on GitHub Pages
1. Unzip `From_Gutter_to_Glory_GitHub_Pages_v0.94.zip`.
2. Upload the **contents**, including `index.html`, `style.css`, `engine.js`, `app.js`, `cloud.js`, `firebase-config.js`, `.nojekyll` and `assets/`, to the **repository root** of `mikeypeq22/bowling`.
3. GitHub Pages settings: build from `main`, `/(root)`. The live URL remains `https://mikeypeq22.github.io/bowling/`.
4. Firebase configuration was inherited from your v0.93 setup. Authentication and cloud saving require the Firebase services and security rules to be correctly configured. Do not commit service account credentials. **The online login/cloud save has not been verified live against Firebase in this testing environment.**

## Art changes
`assets/asset-map.js` now includes `scene.empty`, `cutscene.empty` and eight `facility.<room>.tier<1|2>` mappings. For example, put `assets/facility-snack-tier2.png` in the assets folder and it will replace the built-in expanded snack preview. Missing artwork falls back to CSS illustration. Read `assets/README.md` for the full list.

## Save compatibility
Existing v0.93 (state version 8) and older cloud/browser saves migrate to state version **9** and **KEEP their original lanes**, cash, staff, and buildings. The empty-building start applies to **new games only**. Export your v0.93 save before changing production files. Online accounts retain the same UID-based document format.

## QA
- `node qa_v094.cjs`: **4,769 game assertions passed** across new/legacy starts, construction, shortages and save transitions.
- Browser smoke tests: **390px phone and 1280px desktop**, opening wizard, manual time, first lane, snack completion notice, drawer illustration. No JS page errors observed.
- Four different facility completions and notification queue verified through the deterministic game engine.

See `RELEASE_NOTES.md`, `RESEARCH_AND_QA.md`, `DECISION_LOG.md`, and `V095_PARKING_LOT.md` for details and planned follow-up features.
