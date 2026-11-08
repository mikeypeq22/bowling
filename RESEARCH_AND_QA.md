# v1.10 Local QA report

- **Legacy untouched:** 90-day matched simulations (Legacy, undecided, new game) give identical cash, reputation, RNG seed and Vera pressure to v1.09.
- **Back Alley balance:** 100–150-day policy runs (ignore / defend only / push back) behave as designed (see Release Notes); battle win-rate tables by district, site and crew strength (starter crew → +60 training, two vs. three fighters) give the intended difficulty ramp; Docks site 2 (Vera) is the hardest fight.
- **Saves:** a v1.09 Back Alley save with an unfinished old territory fight migrates (fight cleared, Turf created, valid); an old Midnight Accord victory becomes the milestone; Legacy saves gain no Turf data. 200-day runs valid (Back Alley 108 KB, Legacy 124 KB). A save reloaded in the middle of a Showdown resumes on the right fighter.
- **Firebase client validator** accepts fresh, 30-day Back Alley, mid-Showdown and finished-Showdown saves (no undefined fields).
- **Browser, 390 and 1280 px:** Back Alley preview → Vera's message for an operation → Meet them → lineup → fight (Strike, skill, Guard, target switching) → result → Turf; Turf tab, map, crew cards, Night Moves, Ledger; alley banner, lookout (tap dismisses), wall tag and paint-over banner; closing report "Vera tonight"; Bowlers street line. No page errors.
- **Regression:** new-game smoke test (all tabs, all 16 panels and 15 inner tabs, reload) passes at both widths; panel sweeps for Legacy and Back Alley previews pass with no empty panels; Legacy Compete page unchanged.

## Unverified
- Real devices (iPhone Safari, Android Chrome), live Firebase sign-in and cloud saves.
- Long-term feel of the difficulty curve with a human player; the policy bots fight perfectly and buy defenses on a fixed rule.

---

