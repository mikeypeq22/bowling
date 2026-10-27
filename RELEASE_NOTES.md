# Release v0.94 — Empty Building & Room Grand Openings

## Shipped
- Changed new games from a preexisting dirt lane to a roofed but **empty building** with **zero lanes**. First lane is a $160, two-day construction choice.
- Opening loan and décor choices remain; sidebar, alley, startup story and tutorial updated. Intro cutscene describes getting keys to the building.
- No invented bowling arrivals or waiting complaints while lane count is zero; other staffed businesses can still receive non-bowling customers.
- Teaching popups for **Snack Counter, Bowling Bar, Arcade, Pro Shop** upon their construction completing, delivered after the day report; support multiple notices and save/reopen; room expansions also explained.
- Snack popup emphasizes **next-morning deliveries**, stock counts, employees, threshold and future **Stock Clerk** automation.
- Bar popup emphasizes individual drinks, delayed delivery, stock warnings, and required bartenders. Arcade popup emphasizes actual playable machines and no staffing need; pro shop popup explains employee and team equipment.
- Snack/bar/arcade/proshop drawer displays a graphical *room snapshot*, which gets visibly fancier on a 2-square expansion, above its inventory or management choices. Installed global TV appears in the preview.
- Introduced separate, simultaneously visible **Snacks low-stock** and **Bar low-stock** warnings; individual rooms retain low stock badges.
- 10 optional swappable images: 2 empty-venue scenes, 8 facility-level pictures (see `assets/asset-map.js`).

## Preserved
- All current snack/bar items, deliveries, staff, loans, weekly league, six-plus lane land expansion, specializations, cosmetics, customer happiness, daily reports and the cloud authentication/sign-in architecture.
- Migrates save version 8 -> version 9 without resetting buildings, lane counts, owner/bowler/team progress or cash. New startup sequence is only for new saves.

## Not yet built
- Purchasing individual furnishings **inside** the snack counter or bar (snack TV, oven upgrades, condiment displays, extra seats).
- Pro shop itemized inventory and low-stock warning (requires an actual goods catalog; now only snack and bar track units).
- Real iPhone Firebase and Firestore end-to-end verification following deployment.

## Tests
- 4,769 deterministic assertions passed.
- 390px mobile & 1280px desktop browser flow and illustrative snack popup passed with zero observed JavaScript errors.
- Existing v0.93 save-migration test passed; one full legacy v0.92 migration path also passed.
