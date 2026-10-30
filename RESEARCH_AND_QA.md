# v0.99 — Research and QA

## Engineering scope

The full v0.99 parking lot is represented in this build. Key areas: zoomable 24-lane map; signed event booking calendar with deposits/catering/outreach; five partnership types; named VIP groups and light seasonal events; emergency mechanic and optional coverage; bocce/stage/restaurant and room-specific customization; Vera Vale rival-business behavior and storyline responses; two financial hardship repair plans; low-motion and larger text settings.

## Coverage

- Node syntax validation of game engine and controller.
- Deterministic simulation spanning 350 days checked for state validity and five-day incident cooldown.
- v0.98 game save migration validated (schema 13→14), keeping day and cash.
- Browser smoke tests at 320px, 390px and 1280px. Checked first-time clock tutorial, booking calendar, future wings catalog, rival/story panel, VIP groups, and map zoom. No runtime JavaScript page errors in these smoke tests.
- Additional tests cover partnership purchases, booking conflicts, event payouts and deposits, mechanic repairs, repair coverage, and national story trigger.

## Deployment limitations

External live Firebase Auth/Firestore cloud saving and mobile Safari behavior have not been tested here. Actual store packaging and real-money billing are not part of v0.99.
