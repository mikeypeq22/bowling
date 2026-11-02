# v1.06 Development Notes

Baseline v1.05; save schema unchanged (20).

**engine.js** — `renameHome(s)` (in `migrate()`, also for the inactive town) renames the home location from “Gus’s Town” to “The Back Alley”; `newGame()` uses the new name. `compactReports(s)` runs after each day closes and inside `migrate()` for schema-20 saves (also for the inactive second town): reports older than 7 days drop their `events` array; recent logs are capped at 90 entries. No other engine changes.

**app.js**
- `render(all=false)`: header (`renderHUD`) every time; `TAB_RENDERERS[tab]` for the visible tab; every other tab goes into `staleTabs` and is rebuilt by `gotoTab`. The old `renderAlley` was split into `renderHUD`, `renderAlley` (scene + feed), `renderGoals` and `renderStockWarnings`; `renderSettingsTab` holds the former tail of `render()`.
- `save()` now schedules `saveNow()` after 900 ms; `flushSave()` writes a pending save immediately. `saveUI()` writes only UI preferences. `saveNow()` is called at day close; `flushSave()` at the start of `storeRecovery`, `prepareDevelopment`, `exitDevelopmentPreview`, `unlockCloud`, `lockCloud`, `beginNewGame`, `useImportedSave`, `unlockDemo` and on `pagehide`/`visibilitychange`.
- `icon()` probes each image path once (`artState`); `artSrc(key)` returns a path unless it is known to be missing. `defaultAssets` is empty — `assets/asset-map.js` is the only source of image paths.
- New helpers: `starRow`, `deptStars`, `veraPill`, `storyArtKey`, `incidentArtKey`.
- Clock interval 160 → 250 ms and skipped while `document.hidden`.
- Fix: `prepareDevelopment` now closes the startup dialog.

**theme.css** — visual layer over `style.css` (tokens, fonts, marquee header, scoresheet nav, scene, lanes, dialogs, phone header grid, noir palette).

**tools/** — `art.py` (all art from shared helpers and one palette), `build_demo.py` (standalone demo with art and fonts as data URIs).
