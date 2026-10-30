# Development notes — v0.99

Codebase: engine.js is the deterministic game engine, app.js is the UI controller, cloud.js is authentication/save orchestration, index.html + style.css host the interface, assets/asset-map.js maps optional art, Firebase web config unchanged.

The v0.99 engine increments schema version to 14; migrate() accepts version 13 and prior. New state: bookings[], bookingSerial, roomDetails, vipGroups, rival, hardshipUses, emergencyCoverageUntil, additional partnership flags. Save data persists within the existing Firebase `game.state` structure.

The lobby's game clock advances approximately once every 5.2 real seconds with Auto enabled. Timed pauses during dialogs remain.

Future noir rivalry is documented in RIVAL_PATHS_FUTURE_DESIGN.md but not implemented. There is only one community-oriented route in v0.99, with Vera's competing business tactics and the Cup ending already active.
