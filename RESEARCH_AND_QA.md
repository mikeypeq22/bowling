# Research & QA — v1.00

## Verified in local tests

- Node engine tests cover fresh schema, migration from v14, permanent branch choice, contradictory choice rejection, Back Alley risk/cost choices, adaptive AI action scheduling, prevention of less-than-five-day surprise event spacing, two-town purchases and switching, and separate story locks.
- 120 additional daily simulations from a developed Back Alley scenario: 14 targeted Vera moves and 19 scheduled major events with no gap under five game days. Counts are seed-dependent.
- Chromium browser checks at 320px, 390px and 1280px: active story selection, changed color palette, dark management actions, Settings development shortcut, preview/cloud-sync isolation, route reversal on returning to real save, and no observed JavaScript exceptions.
- Additional Chromium screenshots at 390px and 1280px for path decision, Back Alley screen and Settings preview.

## Not verified

- Real Firebase login, external cloud credentials, public GitHub Pages deployment, iOS/Safari behavior, and payment systems. These require an online environment and real test devices.
- Full long-run economic balance across all possible combinations of 24 lanes, two towns, major incidents and story choices.

## Safety

- Development preview never triggers a cloud save. Manual cloud writes are rejected while preview is active; preview state uses a different local-storage key.
- Permanent route choice can be reversed only by resetting or replacing a town through save import / developer testing, not through ordinary gameplay.
