# v1.05 Development Notes

Baseline v1.04; save schema increment 19 to 20. Added `cityLeagues` by location, `districts[id].sites`, and `story.offerDay`. Existing controlled districts migrate to 2 of 2 sites. The engine adds `CITY_DISTRICTS`, `legacyDistrictReady`, `legacyLeague`, `legacyDistrictFinal`, `districtStatus`; `districtUnlocked` now checks property wing. The app adds the district card grid, interactive actions and a compact incoming-events notice instead of self-booking.

The public online build retains the v1.04 Firebase configuration and cloud save architecture. A new native mobile app, PWA service worker, server-side purchase entitlements, and real-money casino features were not added.
