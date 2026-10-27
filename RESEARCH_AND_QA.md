# Research and QA agent — v0.93

## Grounding
This update builds on the existing Bowling Research Master (v1), which covers actual bowling center formats, staffing, food service, arcades, pro shop operations, league capacity, tournaments, and evolving business concepts. Fictional startup loans and construction prices are **design figures**, not verified business costs.

## Completed tests
- Engine parse: `node --check engine.js`
- UI parse: `node --check app.js`
- `node qa_v093.cjs`: **3,189 passing assertions**; eight combinations of startup financing and décor, 21 simulated game days each, happiness and loan invariants, land acquisition, specialty requirements, construction rush, and previous-save migration.
- Chromium: viewport 390 × 844 and 1280 × 850, startup wizard, no-roof bar construction, day-end summary, optional rush, scene controls and screenshots. **No runtime exceptions** in those checks.
- Additional Chromium: startup modal screenshot, enabled specialty choosing at Level 3, confirmed display and construction button for adjacent land.

## Open QA items
- Live Google OAuth and email/password authentication on iOS and desktop with `mikeypeq22.github.io`, plus actual Firebase document read/write, conflict protection and cloud migration.
- Human playtesting for 25–50 day cycles and weekly loan pressure.
- Happiness tuning: a single played group currently counts satisfied unless they leave before starting; in a future version account for individual wait duration and service quality directly.
- Better visual rendering for ten lanes within a constrained mobile scene; it fits now but may require a camera/zoom system in a later release.
- Multi-location save structure, per-property accounting, choosing second specialties, and switching centers.
