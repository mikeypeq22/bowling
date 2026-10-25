# Release notes — v0.7 · The Staff Room & Scorecard Update

**Status:** Playable local browser prototype. Features described below implemented and tested.

## Gameplay changes

1. **Staffed shops:** All sales at the snack counter, bar and pro shop stop until enough staff are hired (1 for one-square shops; 2 for two-square shops). Staff wage is deducted at each close. Optional training (up to level 3) and morale (15–100) influence snack, drink and pro shop customer purchase chances. Lower wages reduce morale gradually; no staff turnover yet. The arcade needs no employee.
2. **Supply lead time:** New snack and drink orders are deducted from cash when ordered but are kept in a delivery queue until the next morning. Initial inventory still comes with construction completion. A Stock Clerk can auto-order at closing when current and incoming stock are at/below a configurable threshold (default 3).
3. **Distinct retail visitors:** Some groups drop in for snacks, drinks, arcade, or the pro shop without bowling. Their receipts are recorded and their simulated movement resolves the current positions of the actual room tiles.
4. **Leagues:** All six lanes are reserved on Thursday 6–8 PM. The two-hour event generates league payout at closing. Regular walk-ins may need to wait.
5. **Business hours:** Eight one-hour steps now run from **2 PM to 10 PM**.

## UI and navigation changes

- Flat, comical arcade-inspired UI: reduced glossy/gradient panels, stronger borders, yellows and punchier copy.
- Four distinct Build subsections: Construction, Your Lanes, Customize, Floor Plan.
- Main navigation gains **Staff** and **Goals**.
- The main alley's statistics appear beside the heading; daily guest story appears below the scene. Alley Pulse and the sidebar Next Goal are removed.
- Low-stock alerts appear as a button above the alley and a badge on individual snack and bar room tiles.
- Conditional end-of-day cards hide revenue categories for facilities that weren't operating during the reported day. Short customer jokes and grumpy exit quotes now vary by circumstance/day.
- New built-in employee icons are replaceable in `assets/asset-map.js` with `employee.snack`, `employee.bar`, `employee.proshop`, `employee.stocker`. Goals and Staff nav icons are also replaceable.

## Automated verification

- `qa_tests_v07.js`: **12,304 assertions passed** across **3,072 simulated game days** (48 scripted 64-day runs). It checks economic reconciliation, next-day inventory fulfillment, staffing eligibility, wages, morale and training, threshold changes, walk-in-only traffic, six-lane league reservations, and v0.6 save migration.
- `browser_test_v07.py`: Chromium desktop and mobile smoke tests passed. Checked new and rich game states, tab switching and menu subsection switching, wage and training buttons, automated and manual deliveries, report filtering, moving bar→lane animation, all-lane league reservation and phone-sized page overflow. No JavaScript page errors detected in these checks.
- A separate 30-seed scripted 90-day purchasing strategy reached six lanes between days 15–18 and regional level between days 24–26, with no negative ending cash observations in these simulations. These are not human playtest measurements or promises of player experience.

## Carryovers and boundaries

- Existing bowling art, customization fixtures, room movement, optional skill-shot game, bowler development and tournaments retained.
- There are no new sprites or image dependencies required to play: fallback CSS/emoji works without image files.
- Staff do not have individual shifts, job applicants, firing or career branches. The Stock Clerk handles restocking only for unlocked snacks/drinks, not lane spare parts.
