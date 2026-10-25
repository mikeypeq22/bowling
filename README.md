# From Gutter to Glory — v0.8

A self-contained browser bowling alley management prototype. **v0.8 focuses on mobile usability and first-time onboarding.** Game mechanics and the editable-art asset system carry forward from v0.7.

## Play

- **Standalone:** open `From_Gutter_to_Glory_Playable_v0.8.html` from the companion download. All CSS and JavaScript are bundled; game illustrations fall back to built-in graphics unless you separately add custom assets.
- **Editable web project:** open `index.html` using a static web server or deploy this folder's contents to GitHub Pages.

## Publish to GitHub Pages

1. Create a public GitHub repository (on a GitHub Free account) for the game.
2. Upload `index.html`, `style.css`, `engine.js`, `app.js`, `assets/` and `.nojekyll` to the **root** of your `main` branch. The GitHub Pages-ready ZIP already has this structure.
3. Under repository **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/(root)`.
4. Visit `https://USERNAME.github.io/REPOSITORY/` once the deployment completes.

No build command is required. All references are relative so the game can run at the root of a Pages *project* site.

## What's changed in v0.8

- Header permanently displays **Your Bowling Alley**, alley level/name, game week/day/time and cash.
- All seven management tabs are in the same **sticky header**, directly above the gold divider, including on mobile.
- Removed daily arrival, bowling, snack and net KPI boxes from the live alley. These remain in the end-of-day report and front desk.
- Removed the hourly progress line and bulky clock box. Hour controls are large, separated action buttons.
- Added a four-step first-run guide after the opening dirt-lane scene. It covers clickable facilities, lane servicing, time controls and tab meanings. Reopen it using **?** in the header.
- Made the mobile typography and controls bigger, while preserving the v0.7 bowling alley graphics, room layout, operations, staff, leagues and upgrades.

## Important save information

Gameplay still uses `gutter-to-glory-v07` in browser localStorage, intentionally, so the existing v0.7 save is reused on the *same website origin*. v0.8 UI settings live separately under `gutter-to-glory-ui-v08`; the previous v0.7 UI settings are imported. Moving from a downloaded `file://` build to a GitHub Pages URL does not automatically move saved progress, because browsers isolate website storage by origin.

## Replace images

Put your graphics in `assets/`, then change their references in `assets/asset-map.js`. Existing icon keys and graceful fallbacks are unchanged. See `assets/README.md`.

## Current scope / limitations

This is a single-player offline-first browser prototype. Saves live in the browser; there is no account login, multiplayer, cloud saving, or external database. Smaller screens (below roughly 370px wide) can swipe the sticky tab row horizontally. Browser restrictions may require using a local server for the multi-file project; the standalone HTML is provided for direct opening.
