# Research and Quality Assurance — v0.8

## Hypothesis

The high-value information on a mobile bowling management game's main screen is the **live alley**, navigation, cash and time. Intrusive KPI tiles make the game look more like a dashboard and reduce the visible space dedicated to the interactive scene.

## Verification undertaken

The scripted headless Chromium test covers six viewport widths: 320, 375, 390, 430, 768 and 1280 pixels. It asserts that the header remains at the top after a long scroll, that there is no page-level horizontal overflow, that all seven navigation tabs are present and functional, and that the new onboarding flow and closing reports behave correctly. It also reopens the tutorial using the header help button and checks prior saved-UI migration.

The existing, unchanged engine test suite completed 12,304 assertions over 3,072 simulated game days, ensuring that this visual change did not require changing economic mechanics.

## Still to test with humans

- Legibility and button comfort on actual Android/iOS devices.
- Whether a seven-item nav row feels intuitive at 320px, where horizontal swiping is required.
- Whether the first-time tutorial's four panels communicate enough without being too long.
- Whether the scene's tiny built-in room labels need alternative large-print interactions on phones.

## Evidence type

- **VERIFIED / Automated:** test assertions and Chromium checks above.
- **INFERENCE / Design:** streamlining the first viewport should improve usability; real-world human feedback is still necessary.
