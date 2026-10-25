# Decision log

## v0.8 — Approved mobile simplification

**Research & QA role:** Preserve clear tasks, accessible touch targets, a live game scene, and controls users can find at any scroll position. Check small screens and continuity of saved games.

**Development role:** Reorganize the shell without touching the economic simulation or the alley's visual core; introduce an opt-in repeatable tutorial and ensure the new UI is GitHub Pages compatible.

### Locked decisions

1. Header shows the plain title **Your Bowling Alley**, plus its current level/venue subtitle. Date/time and cash live at the upper right.
2. Navigation is part of the sticky header, above its gold dividing line.
3. Live daily counters and the visual time-progress track were removed from the alley view. Closing reports remain the source of daily performance metrics.
4. The Day's Drama appears after the alley scene and hourly control buttons.
5. A first-time tutorial explicitly explains clickable facilities, lane wear and servicing, hours and closing reports, and all seven tabs.
6. No gameplay balancing or save wipe in the mobile UI release.

### Parking lot / ideas not discarded

- A dedicated accessibility mode with even larger controls and typography.
- A more extensive guided tutorial with highlighted hotspots and example actions.
- Optional nav personalization / rearrangement.
- Pinned low-stock and lane-maintenance badges in the sticky header (only if they do not crowd it).
