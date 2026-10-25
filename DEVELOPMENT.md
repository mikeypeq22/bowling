# Development notes — v0.8

## Files

- `index.html`: new sticky header/nav markup, uncluttered alley view, tutorial modal.
- `style.css`: appended v0.8 responsive overrides, mobile navigation and tutorial presentation.
- `app.js`: minimal changes to HUD rendering and new tutorial lifecycle; no new engine logic.
- `engine.js`: unchanged v0.7 gameplay engine.
- `assets/asset-map.js`: unchanged artwork switchboard.
- `build_standalone.py`: bundles the project into standalone HTML.

## Preservation and deployment

Keep the gameplay state key `gutter-to-glory-v07` until we intentionally introduce a versioned state migration. UI preferences use `gutter-to-glory-ui-v08`, falling back to v0.7 UI. `?` reopens onboarding at any time.

## Development smoke checks

`node qa_tests_v07.js` checks engine behavior. `python browser_smoke_v08.py` checks mobile/desktop interactions against the generated standalone HTML using Chromium/Playwright. The static GitHub Pages project is already a root-level site: `index.html`, `style.css`, `engine.js`, `app.js`, `assets/`, `.nojekyll`.

## Next priorities

1. Touch-test on physical mobile browsers, especially tiny room labels.
2. Consider clearer badges for maintenance and delivery alerts that do not bloat the header.
3. Keep creating the alley visuals as replaceable assets instead of hardwiring them into the UI.
