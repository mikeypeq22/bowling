# Release notes — v0.8 (Mobile-first interface)

## Decisions implemented

- A two-row sticky header contains the main bowling alley identity/status and all seven navigation buttons. The bottom gold rule marks the sticky header boundary.
- Header is intentionally minimal: alley name/level, date/time, cash, help. Reputation, trophies, and daily activity totals remain available elsewhere in the game.
- Removed the redundant alley screen headline and all daily KPI tiles. The live scene now sits immediately below the sticky header.
- Removed the progress bar and the prior clock/time-controls box; the remaining Next hour, Finish day and Auto buttons are still prominent.
- Existing Day's Drama panel remains below the playable scene.
- New guide is four screens with clear language, a back button and skip. It runs after the new-game cutscene and can be reopened from the ? button.
- Gameplay logic and economic values were **not modified** for this UI-focused version.

## Compatibility

- The gameplay save key remains `gutter-to-glory-v07`. UI preferences use `gutter-to-glory-ui-v08` and read `gutter-to-glory-ui-v07` as a fallback.
- Gameplay migration and the existing artwork mapping are preserved.
- When the intro cutscene is dismissed, the tutorial is shown for a fresh save. Existing saved games do not get an unexpected tutorial interruption.
- Both the single-file playable HTML and multi-file GitHub Pages deployment build are generated from the same source.

## Tests

- Unchanged engine: 12,304 existing gameplay assertions, 3,072 simulated game days: PASS.
- Headless Chromium viewport checks: 320, 375, 390, 430, 768 and 1280 pixels: PASS.
- On each: first-run cutscene → four-step tutorial, all seven tabs, Goals, Build/Lanes, help reopen, end-of-day summary, sticky header on scroll, no page-level horizontal overflow: PASS.
- v0.7 UI/save migration smoke check: PASS.
- No JavaScript page errors observed in these browser tests.

## Known limitations

- A very narrow phone may need to horizontally swipe the nav row; it remains vertically sticky.
- Real-device feel, screen-reader exploration and long-session usability still need human playtesting.
- Static deployment itself should be checked on the final GitHub Pages URL; in this test environment direct localhost navigation is restricted, so the browser UI test loaded the equivalent standalone HTML.
