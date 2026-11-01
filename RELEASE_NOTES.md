# From Gutter to Glory v1.05 — Shared City & District Leagues

This builds on **v1.04** without altering the old version. Browser entry point: `index.html`; standalone local-save test: `PLAYABLE_DEMO.html` (not for deployment as a GitHub Pages index).

## Playable additions

- **Legacy district leagues:** six neighborhoods, each with three match days; win at least two games to qualify, then play a simulated three-round district final. Scores depend on actual bowler skill, coaching and pro-shop quality, league experience, and chance. District champions unlock the next neighborhood. Earlier four tournament brackets remain available.
- **Back Alley wing-gated territories:** Old Town is initially accessible. Subsequent districts unlock with each corresponding property wing, subject to controlling the prior district. Each neighborhood requires two successful tactical site encounters before it counts as secured.
- **Shared city identity:** same six districts with campaign-specific objectives and bounded fictional cash, reputation, spare-parts or trust rewards. Owning a bowling center in every district is **not** required. The optional second town retains its own campaign.
- **Story corrections:** Vera's first formal threat requires an operating lane and day >= 15. The permanent branch choice unlocks seven game days after the initial threat. A Back Alley version of “The Missing Page” explains Vera's six-neighborhood network; the Legacy explanation remains.
- **Events UI:** Removed the self-service booking calendar from Compete. Incoming party/event offers remain available; existing bookings continue to be paid and honored.
- **Save migration:** schema 19 → 20 migrates existing v1.04 games, their second location, established championship wins and previously secured districts (now 2/2 sites).

## Verification performed locally

- JS syntax checks for `engine.js`, `app.js`, `cloud.js`.
- Targeted deterministic state assertions for first threat, decision delay, Legacy season/qualifier/final, site fights, expansion gates, save migration and schema validity.
- Standalone bundle rendered in Chromium at **320px, 390px, 1280px**; both district screens display six cards with no JS exceptions during the checked flows.
- Word Progression Master v4.3 rendered and visually inspected.

## Still planned / not verified

- Reported dark-route traffic regression: root cause not yet identified by a matched real-play trace.
- Leo recruitment pacing, explicit Maya training onboarding, prominent department star icons, always-visible Vera pressure bar, entrance-security placement, richer phone-call narratives.
- District submaps, defensive counterattacks, full weekly league schedule, distinct characters for each district, live Firebase read/write and iOS testing.

**Deployment:** Export a backup of existing saved game. Upload the *contents* of the GitHub Pages ZIP to your existing repository root. Verify v1.05 in the title/welcome screens. Do not publish `PLAYABLE_DEMO.html` as `index.html`, because it is local save only.
