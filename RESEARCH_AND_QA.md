# Research & QA Agent — v0.94

## Verification
- **Game engine:** `node qa_v094.cjs` returned **4,769 passing assertions** across 48 combinations of startup financing / seed, 9 simulated days each, plus targeted inventory delivery and migration tests.
- **Pre-opening:** fresh state has zero lanes, a roofed building, and can be configured by the player. No bowling visitors appear before first lane, so the first two building days do not create fictitious angry departures.
- **Construction:** lane 1 completed at end of day 2. Snack can complete at end of day 2, bar end of day 3. All four facility completions enqueue notices. Expanding a room enqueues a distinct notice.
- **Inventory:** staff needed to serve; manual restock orders have no immediate inventory effect and appear after `startNextDay()`.
- **Migration:** version 8 games keep their one or more lanes, existing staff/rooms/cash and migrate to version 9. Also verified an original v0.92 version 7 state migrates to v9.
- **UI smoke testing:** Playwright Chromium on 390 × 844 and 1280 × 900: Google-disabled local-demo gate, opening wizard, loan/decor, 0-lane scene, building snacks/first lane, closing reports, completion popup, snack preview, engine state validation, no page JavaScript errors.
- **Production Firebase:** *not tested*; requires live credentials/auth domain and Firestore rule checks on GitHub Pages and real mobile Safari.

## Known UX questions
- Test player enthusiasm for empty-building startup; does the $160 first lane feel rewarding, or should installation be quicker than two days?
- Is the after-summary teaching sequence intuitive when three facilities finish simultaneously?
- Should room-level previews eventually become isometric room plans and drag-and-drop add-ons?
- Customer demand and happiness weights remain test hypotheses, not actual market data.
