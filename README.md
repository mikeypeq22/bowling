# From Gutter to Glory — v1.00

**The Two Roads Update** — web-based bowling alley management with optional Teen-oriented cartoon noir branch.

## New features

- After the first formal StrikeCity buyout offer (20 customers served), choose **The Legacy** or **The Back Alley**. The choice is permanent **within that location**. You may defer it and choose later under Goals → Story.
- The Legacy has community and tournament-driven objectives. The Back Alley has a darker palette, alternate night-time dialogue, heightened threat popups, four tradeoff decisions, and its own **Midnight Accord** ending. This story contains implied questionable dealings and threats, without graphic violence. Intended Teen+ tone; **not an official age rating**.
- Vera runs a **rule-based adaptive adversary**. Every 6–9 game days when eligible, her next move uses the player's heat, defense, influence, reputation and local support. Opponent actions share the five-game-day surprise-event cooldown. Vera is not a network/LLM AI; it is local, deterministic simulation logic.
- **Multi-town franchise (initial implementation):** reach six lanes, three Alley Stars, choose your current path and save $8,000 to open Riverside. Switch towns under Settings → Your Towns. Each retains its own progression, cash, day, rating, staffing and story decision; one town may follow Legacy while the other follows Back Alley. Only the active town advances time.
- **Development Testing in Settings:** Jump to the rival decision or load a developed example of either route. Creates a realistic six-lane Day 24 bowling center. **Test mode has an independent browser-save key and blocks cloud synchronization**. Press Exit Preview to restore your real session, or refresh the page. Preview mode is deliberately local-only and disables Auto to give time to inspect screens.

## Playing the game

**Standalone demo:** open `From_Gutter_to_Glory_Playable_v1.00.html` in a browser. This is local-only and requires no Firebase.

**GitHub Pages:** extract `From_Gutter_to_Glory_GitHub_Pages_v1.00.zip` and upload the contents to the root of the GitHub Pages project. Keep `index.html`, `engine.js`, `app.js`, `cloud.js`, `style.css`, `firebase-config.js` and `assets/` side by side. Upload extracted files, not the ZIP itself. The Firebase client config is the same as v0.99; no new Firebase setup is intended.

**Export your live save before upgrading** via Settings → Export Save. v0.99 saves (schema 14) migrate to schema 15. Existing players remain *undecided* about their story until the buyout offer, so previous game choices aren't retroactively locked.

**Cloud safety:** the standalone version is local-only; the development preview on the deployed build is also intentionally local-only. While previewing, the code explicitly stops Firestore writes. The existing live Google/email login and cross-device cloud synchronization still require testing with real devices and Firebase.

## Development files

`engine.js` is the core deterministic simulation; `app.js` manages the UI; `style.css` has the themes; `index.html` contains the overlays and controls; `cloud.js` retains authentication and encrypted-transport cloud functionality. `assets/asset-map.js` maps optional custom art. `tests/engine_smoke.js` checks schema migration, campaign lock-in, AI spacing and separate-location state.

### In-game objectives

- Legacy: win the fictional National Heritage Cup, gain four community allies via outreach, and earn four Alley Stars. The Heritage Charter is an imaginary story award, not an official bowling accreditation.
- Back Alley: 65 Security, 45 Influence, 40 reputation, six bowling lanes and rival pressure at or below 25. Security, contacts, clandestine offers and lay-low choices affect progress, heat and local trust.

No paid or real-world criminal systems are included. This is a fictional story layer over the bowling game.
