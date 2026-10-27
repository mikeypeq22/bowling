# Release v0.93 — Startup to Specialty

**Goal:** make the first alley yours to design and grow, while keeping the idle simulation approachable.

## Added
- Starter capital: $600 fictional savings + either a $1,000 or $1,800 interest-free fictional town loan, repaid weekly from in-game profits (deferred when unaffordable).
- Four starter décor packages, selected before opening. They directly change wall paint and some physical fixtures.
- Flexible build order. Snacks, bar, arcade, and pro shop are not locked behind roof construction. They still need employees and take days to construct.
- Level titles Startup Lanes -> Neighborhood Alley -> Established Alley -> Regional Destination -> Bowling Landmark, with a visible objective checklist that accepts *any* revenue-generating facilities at Levels 3 and 4.
- Four permanent specialties available at Established Alley; each influences different traffic, income, reputation, comfort, or lane-wear behaviors.
- Neighboring lot for $3,600 and four closing cycles when initial six lanes have been filled; expands total possible lanes to ten.
- Three new snack products (fries, hamburger, cheeseburger), with pack costs, sale prices, restocks, unlock milestones and next-day delivery.
- Customer happiness (0–100), computed from served groups (+3), walkouts (−2), shortages (−1 capped), with smoothing across days. Visible in the HUD, Front Desk and Closing Report.
- Optional one-time paid overnight construction completion at the closing report. Confirmation required.

## Preserved
- v0.92 Firebase accounts and player IDs, Google/email sign-in and cloud-save conflict checks.
- Local export/import, browser autosave, league reservations, lane maintenance, business layouts, staff, tournament and event systems.
- Earlier state migration. Existing centers **do not** retroactively receive a loan, decoration wizard, or forced specialty.

## QA
- 3,189 assertion Node suite across starter options, day progression, happiness, costs, construction, specialty, land, and migration.
- Real Chromium rendering checks at 390px phone and 1280px desktop with no JavaScript errors. New starter wizard, bar-first build order, closing report, construction rush, specialty choice, and land purchase interacted with directly.
- Online Firebase service and iPhone login have **not** been retested in this environment.

## Planned, not built
- Second/already-existing bowling center management; switching between locations.
- Detailed specialty-specific tech trees, pro shop repair services, premium house balls and rental shoes.
- More physical floor customization, drag/drop large lots, richer animations, loan refinancing and advanced customer segment simulations.
