# Research & QA — v1.01

This version implements an original fictional game experience, not a claim about real casino or bowling business practices. The Casino Lounge uses ticket-prize arcade games with an evening entertainment fee; no betting or money withdrawal exists.

### Verified by scripts in `tests/`
- `node tests/engine_smoke.js`
- `node tests/night_branch.js`
- `python tests/browser101_full.py` — Requires Chromium and Playwright and a generated standalone HTML file.

### Results
Deterministic 90-turn controlled tests (resetting disrupted rooms before each simulated rival turn): 56 hits unprotected, 8 hits with maximum defenses. Six distinct story chapter definitions. Separate locations preserve their route. Existing version-15 saves migrate into version-16 state. Interactive Chromium tests at 390px and 1280px were free of JavaScript page errors in covered flows.

### Outstanding manual tests
Google sign-in on iPhone; Google/email account linking; actual Firestore saving and cross-device recovery; slow early-game economy; midgame story chapter pacing; whether long-term incident frequency feels fair; accessible dialog focus/contrast on actual phones; and potential app-store rating implications of casino-themed imagery.
