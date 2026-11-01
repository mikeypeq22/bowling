# v1.05 Local QA report

## Verified
- Core engine parses; test suite: targeted checks for new-game, day-15+ threat, 7-game-day branch delay, district league matches, qualification and finals, territory site ownership, wing gates, migration from v1.04 schema 19 to schema 20, current state validation.
- Browser: constructed local-only standalone HTML, checked at 320, 390 and 1280 pixel widths. Legacy and Back Alley district interfaces render six district cards with no JavaScript page errors in these flows.
- Save separation: the existing two-town portfolio structure is preserved and migrated for inactive towns as well.
- Word: rendered v4.3 master at 35 pages, visually reviewed the appended design and release ledger.

## Unverified
- Live Firebase and Google/iPhone authentication; in-app account switching and Firestore rules; extended economic rebalancing; full click-path across every game feature; traffic-regression root cause.

## Balance to watch
- Whether two tactical site fights per district feel repetitive; whether match qualification of two wins in three suits team advancement; whether wing requirements pace district unlocks; whether one optional second alley remains preferable to mandatory ownership in six districts.
