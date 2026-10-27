# Research & QA Workstream — v0.96

## Test evidence
**ENGINE VERIFIED:** 1,540 legacy checks + 20,572 v0.96 assertions. The tests cover save validity, old-save migration, event and income integrity, duration distribution, six-lane usage, nightly technicians, parts depletion and cash guards.

**SIMULATED BALANCE:** The first nine days of a one-lane startup averaged **2.20 groups/day** across 80 seeds (construction days included). For an artificial established six-lane center (rep 65, 175 historical groups served, promoter 3), one seed yielded **318 arrivals in 14 days**, booking lengths of 1, 2 and 3 hours, and all six lanes used; this sample is deliberately not a natural progression forecast.

**BROWSER LAYOUT TESTED:** In-memory Chromium rendering at viewport widths **320, 390, 1280**. Measured positions show the desk/benches above the entrance and larger room/lane bank. Six-lane mobile preview rendered. No JavaScript page errors recorded in the selected flows.

**NOT YET VERIFIED:** iOS Safari, human-player engagement / pacing, live Firebase authentication and cloud saves on GitHub Pages, real-world economics.

## Gameplay risks
1. Extra hour bookings increase revenue but also produce longer waits; benches and late-game lane count need continued balancing.
2. Round-robin is fair across usable lanes but does not model real lane location preferences.
3. Technician costs are fixed for now; automated purchases are skipped if funds are insufficient. Check bankrupt or negative-balance playthroughs before launch.
4. More quotes reduce repetition but all text is still English-only.
