# v0.98 — Development Workstream

## Core architecture

The engine is in `engine.js`; rendering and interactions are in `app.js`; layout in `index.html`/`style.css`; Firebase adapter in `cloud.js`, with public app config in `firebase-config.js`. Asset substitution lives in `assets/asset-map.js`. The standalone demo inlines the UI and engine and deliberately uses local saves.

Save state is schema **13**. The v12→v13 migration initializes `expansionStage`, `outages`, random-event queue/history, party booking, regular encounters and school partnership while preserving existing player progress.

## Feature summary

- Story-first wizard; loans and décor remain available after story.
- Random-event queue with positive/negative outcomes; outages physically disable selected lanes and facilities. Repair choices share the modal system.
- Property stage and dynamic shop grid to 24 lanes / 7 rows; six actual new attractions with visit revenue and footprints.
- Dialogue prompts tied to real named visitors and loyalty changes.
- Two-hour full-lane private bookings with doubled lane-rate income, competing normal guest demand; local school partnership.
- Daypart/weekend arrival coefficients.

## Regression priorities for v0.99

1. Ensure no visual overlay blocks shop-grid tiles on small phones.
2. Verify live Google/email sign-in and Firestore save roundtrip on `mikeypeq22.github.io/bowling/`.
3. Check gameplay at 6, 10, 18 and 24 lanes under both budget and growth strategies, including repair affordability.
4. Verify simultaneous queued incident / closing report / story events survive reload in same order.
5. Add venue map navigation, booking calendar and character art when the system stabilizes.
