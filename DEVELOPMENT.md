# Development note — v1.03

Starting point: v1.02 archive from GitHub Pages release.

Core module: `engine.js`, game state schema version 18. New keys: `departmentAchievements`, `teamStory`, `staffIssues`, `districts`, `tactical`; extended employees and bowlers. v17 migration supports inactive-town snapshots.

UI: `app.js` adds department reward targets, employee XP/career and issue UI, Maya's first-frame controls in Bowlers, Crew & Territory in Goals → Story. Responsive styles in `style.css`.

No external JS frameworks or cloud database schema changes. `cloud.js` remains v1.02-compatible and uses corrected v1.03 diagnostic label.

New full roadmap: `PROGRESSION_MASTER_v3.md`, with tracked version history and detailed status distinctions.
