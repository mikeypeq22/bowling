# v1.02 QA and validation

Local automated regression checks:
- `node tests/engine_smoke.js` — passes including story routes, second town and long-run event cooldown.
- `node tests/night_branch.js` — passes with 90 each high/low rival turns; 56 successful disruptions unprotected vs 8 heavily defended under fixed test conditions.
- `node tests/casino102.js` — passes fictional wagers, Pit Boss visitor table wagers, payouts, 5-bet daily cap, day reset, nightly payroll, temporary preparations, insurance and v1.01 save migration including a second town.
- `python tests/browser102.py` — passes 320px, 390px and 1280px chromium browser widths: preview loads the developed alley; Casino Lounge bets and Pit Boss hiring work; counterplan button works; Exit Preview restores the original session. Browser test injects the standalone game into its local page; screenshots available.
- `node --check engine.js app.js cloud.js` — syntax checks pass.

QA limitations:
- Live Firestore reset still requires a configured authenticated Firebase account and rules (no live destructive cloud test was performed).
- iOS Safari, Android device testing, and real hosted-site cache behavior were not verified in this environment.
- The game is not currently an officially rated or licensed real-money gambling game; the casino uses fictional in-game cash only.
- Game balance reflects design assumptions. Probabilities and economy should be playtested before monetization.
