# v1.09 Development Notes

**engine.js** — pricing: `s.arcadePrices`, `s.attractionFees`, `s.shopPrice` (added by `newGame` and `ensurePricing` in `migrate`); setters `setArcadePrice`, `setAttractionFee`, `setShopPrice` with `PRICE_RANGES`; `priceDemand(price,base)` = clamp(1 − 0.6·(price−base)/base, 0.45, 1.2). Snack/bar/arcade fold the average menu demand into their existing purchase roll; pro shop and attractions roll a second time only when demand < 1, so default prices consume identical randomness.

**app.js** — `drawerTabs`, `tabBar`, `curTab`; `openDrawer('id:tab')` deep links; panels `snackDrawer`, `barDrawer`, `arcadeDrawer`, `shopDrawer`, `attractionDrawer`, `lanesDrawer`, `buildingHTML`, `nightDefensesHTML`; helpers `upgradeRow`, `deptCard`, `roomUpgradesTab`, `priceRow`. `renderManage`/`showBuildSection` removed; tab `manage` replaced by `regulars` (renders via `renderStoryCommunity`).

**index.html** — Build section removed; `#regulars` section; Goals loses the Regulars sub-tab; lane hall gains the "Lanes & upgrades" button.

# v1.08 Development Notes

**engine.js** — `PATRON_SCENES` (41 scenes; fields: tier, need, flag, set, route; option `d` = hidden loyalty change, `reply`). `encounterScene(s,e)` picks and pins a scene on the queued encounter using an FNV hash of patron/day/history (no game RNG). `encounterOptions` returns options in hashed order without deltas. `respondEncounter(s,id,optionId)` applies the change (+2 if the regular's favourite room is built and the answer landed), records `seen`, `flags`, `talks`, `lastScene`, `lastReply`, and returns `{delta,reply,mood}`. `PATRON_DIALOGUES` is kept but unused.

**app.js** — `showPatronEncounter` renders shuffled answers; choosing shows the reply and mood, then Continue (`data-encounter-done`). `openSummary` rebuilt (`splitFeedback`, `guestAvatar`), with `data-summary-open`/`data-summary-tab` buttons that close the report and go to the fix. `renderEmployees` renders `.rosterRow` and `.teamRow`; concern panel hidden when empty.

**theme.css** — "v1.08" section; desktop `#alley` grid now applies only to `#alley.active`.

# v1.07 Development Notes

**engine.js** — `FIXED_SPOTS` (exported) gives each of the 13 room ids a permanent grid spot; `findRoomPlacement` returns it; `fixRoomSpots(s)` (in `migrate()`, also for the inactive town) moves existing placements onto it; `moveRoom` now refuses; `expandRoom` no longer needs a free neighbouring square. Simulations are identical to v1.06.

**app.js** — `renderRoomGrid` now renders the floor plan (`FLOOR_ROWS`, `roomInfo`, `spotState`, `floorSpot`, `wingGate`); `showScene` renders the lane hall (tabs, owned/grey/next/locked slots) and calls `renderGoalStrip`. New click handlers: `data-build-spot`, `data-buy-wing`. Room-moving code paths (`toggleLayout`, `exitLayout`, `data-room-move`, `data-place-room`, `chooseRoomMove`) removed. Visitors find rooms via `.floorSpot.is-open[data-room]`.

**index.html** — scene markup replaced by `.alleyFloor` (goal strip, lane hall, decor strip, floor plan, lobby). Build tab "Floor Plan" renamed "Room Upgrades".

**theme.css** — "v1.07 fixed alley floor plan" section at the end.

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
