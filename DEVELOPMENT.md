# Development Agent — v0.94

- Simulation engine: save schema v9, initializes `lanes:[]`, `built.roof:true`, `facilityNotices:[]`. v8 saves migrate without losing original lane/building state.
- `finishSingleConstruction` enqueues a serializable notice for each room build or expansion. UI shows notices after closing summary, or directly when summary skip is enabled. Acknowledgment dequeues and triggers the next notice, then any pending alley-level cutscene. Timer stops while dialog is open.
- UI: `facilityIllustration(room,tier)` builds a mobile-friendly fallback room illustration using DOM/CSS; path `facility.<room>.tier<1|2>` in asset map overrides with user artwork. Background follows wall paint; a purchased global TV appears visually.
- Anti-frustration: no bowling arrivals or queue/angry departures at zero lanes; the simulation still runs pre-opening days and supports non-bowling customers once facilities operate.
- Warning badges: snack & bar have distinct top-level buttons, and per-room low-stock counts remain.
- Login and cloud code are unchanged. Do not replace Firebase UID/rules or expose service-account keys. Test production authentication manually after uploading.
- Next: room-specific upgrades, more customer-facing personalization, expanded construction/amenities.
