# Development Workstream — v0.96

## Source
- `engine.js` — state schema 11, traffic model, sessions and technician operations
- `app.js` — lane occupancy labels, paid-hour report, staff display, front-desk text
- `style.css` — widened lane/room grid and repositioned controls; mobile-specific overrides
- `index.html` — removed obsolete printed marquee text
- `cloud.js`, `firebase-config.js`, `firestore.rules` — copied without changing account/save infrastructure
- `assets/asset-map.js` — unchanged replacement artwork mapping

## Test methodology
Run `node engine_regression_v095.js` and `node tests_v096.js` in the project directory. Browser checks were executed via the development harness against in-memory assembled HTML because this environment blocked file URL navigation; `test_ui096.py` and the screenshot previews remain in the full project archive.

## Later enhancements
Optional traffic heat map by hour, leagues with variable opening times, technician pay/morale settings, visitor preferences, customizable session pricing, queue reservation/wait estimate, room-specific art choices, cloud integration tests on real iPhones.
