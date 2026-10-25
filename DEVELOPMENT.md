# Design & Development workstream — v0.7

The Development workstream implements approved features and UI changes, then hands them to Research & QA. It is not an autonomous background agent.

## Architecture

- `engine.js` — pure synchronous deterministic game simulation. All transactions use `spend`, revenues use `addIncome`, wages and order expenses are applied to `today.expenses`; `startNextDay` applies deliveries.
- `app.js` — stateful screens, seven main tabs, Build subnav, drawers, customer path visualization, summary/cutscene handlers and localStorage.
- `style.css` — v0.7 overrides appended, leaving familiar alley scene and visitor CSS mostly intact. Uses no external CSS packages.
- `assets/asset-map.js` — stable logical artwork IDs and easy-to-replace file names.

## New persistent game state (`version: 7`)

- `employees: [{id, name, role, wage, morale, skill}]`
- `employeeSerial: number`
- `deliveries: [{kind, id, amount, name, cost, arriveDay}]`
- `lowStockThreshold: integer (1–12)`
- `today.walkIns`, `today.staffPay`, `today.leagueHours`, `today.facilities`

## Staffing

- `neededStaff` maps one shop square → one worker, two squares → two workers, one Stock Clerk maximum; if deficient, sales are blocked.
- `hireEmployee` charges an onboarding fee and adds a stable, generated ID/name.
- `setWage` adjusts wages $8–$32/day; `trainEmployee` costs money and raises skill/morale up to level 3.
- `payStaff` subtracts wages from cash at closing. Wages below role baseline decrease morale. `serviceFactor` modifies shop purchase chance by team average skill/morale. Nobody quits yet.

## Deliveries and automation

- `restockSnack` / `restockDrink` route through `orderStock`; inventory changes only when `processDeliveries` runs on the following `startNextDay`.
- `restockAuto` executes at closing, places orders if low stock is at/below the threshold (considering incoming deliveries) and there is enough working cash. The Stock Clerk requires at least one built snack counter or bar. Spare parts are still manual.
- Construction completion adds free starting snack or drink stock as before.

## Views

- New `#employees` and `#goals` sections.
- Build has `data-build-section`: `construction`, `lanes`, `style`, `layout`.
- Alley KPI tiles moved to headline; event feed is below the scene; hidden pulse removed.
- Conditional day reports use `report.facilities` snapshot taken before construction completion at close.
- Visitor renderer still resolves DOM room coordinates every time; tile movement remains supported.
- UI localStorage uses new `gutter-to-glory-v07`; previous v0.6 and v0.5 saves migrated if visible under the same origin.

## Running tests and building

```bash
node qa_tests_v07.js
python build_standalone.py
python browser_test_v07.py
```

The standalone builder writes `../From_Gutter_to_Glory_Playable_v0.7.html`. The browser test expects Chromium/Playwright. If tests change the standalone file, regenerate it before release.

## Next candidates (not committed)

- More unique customer one-liners and employee personality traits.
- A proper order book with supplier lead times, reordering bundles and optional emergency deliveries.
- Individual employee shifts, promotion paths, turnover and fairness warnings.
- League schedule variants, league participant profiles and weekly standings.
- A visual style system with user-provided PNG icon packs.
