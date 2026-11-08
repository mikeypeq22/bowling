# v1.10 Development Notes

**engine.js — Turf War block** (replaces `startTactical`/`tacticalTurn`/`tacticalAuto`; everything only runs when `campaignStory.path==='backalley'`, so Legacy consumes identical randomness).
- State: `campaignStory.turf` (`newTurf`, lazily created by `turfOf`): `ops[]`, `ledger[]` (24), `injured{id:returnDay}`, `tired{}` (reset nightly), `tags{room:untilDay}`, `lookoutUntil`, counters, `nextOpDay`, `lastDrift`, `accord`, `cityVictory`. Top-level `s.battle` (null when idle). `migrate` (v20) runs `ensureTurf`: clears an active legacy `s.tactical`, converts an old Accord victory into the milestone.
- Night: `rivalAIMove` → `veraNight` on this route: `veraDrift` (shown in UI) + `veraFloor`, one `VERA_PLAYS` roll (chance .4 + pressure/200), tier morale drain, executes due ops (`executeOp`: passive repel = `opRepelChance` = protection × .006, capped .55), announces the next (`announceOp`). Writes `today.vera` for the closing report; caps queued Vera messages at 4. Random events of kind `rival` are skipped on this route.
- Tiers: `THREAT_TIERS` (traffic factor used in `trafficMultiplier`, morale, op lead time). Lookout adds ×0.95 traffic.
- Battle: `startBattle({district|opId, crew})`, `battleAct({action:'strike'|'skill'|'guard', target})` → `{events}` for animation, `battleAuto`, `fleeBattle`, `closeBattle`, `battlePreview`, `crewPower`. Stats from `fighterStats(bowler)`. Foes `FOES` scaled by `foeHP/foeAtk(level)`; district lineups `DISTRICT_FOES`; op lineups `opFoes`. Results: `finishBattle` → `captureSite`, `checkCityVictory`.
- Other: `confrontLookout`, `scrubTag`, `patchUp`, `recruitCrew` (loyalty ≥ `CREW_LOYALTY`), `train` adds +2 loyalty on this route, `accordReady`, `rivalWarning` describes the active op.

**app.js** — `renderTurf` (tab `tournaments` on this route; `#turfBoard`), `cityMapSVG`, `districtPanel`, `crewCard`, Showdown (`openShowdown`, `renderShowdown`, `playEvents` with `lowMotion` skipping waits, `#showdownBackdrop` listener), `veraPill`, `syncTurfNav`, `renderTurfFloor` (`#turfAlert`, `#sceneLookout`, `grip-N` on the scene), `veraTape` (closing report), `streetLine` (Bowlers). `showdownOpen` pauses the clock and blocks other pop-ups; `showNextOpeningNotice` reopens an unfinished Showdown after reload. `renderTactics` removed.

**index.html** — `#turfBoard`, `#turfCompeteHead`, headline ids on the Compete section, `#turfAlert`, `#sceneLookout`, `#showdownBackdrop`; `#tacticsPanel` removed. **theme.css** — "v1.10 Turf War" section.

**QA tools** (outside the ZIP): `turf_sim.js` (win rates by district/site and crew strength), `turf_run.js` (long runs with passive / defend / active policies), `turf_qa.js`, `turf_floor.js`, `turf_incident.js`.

