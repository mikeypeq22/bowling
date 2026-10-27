# From Gutter to Glory — v0.96

An idle/building game blended with an authentic bowling-center simulation. **v0.96 improves the alley scene, customer traffic, session lengths and lane maintenance.**

## How to play / deploy
- `From_Gutter_to_Glory_Playable_v0.96.html`: offline single-file demo. Local saves only; no Google sign-in/cloud saving.
- `From_Gutter_to_Glory_GitHub_Pages_v0.96.zip`: extract into the ROOT of the existing `mikeypeq22/bowling` repository. It contains `index.html`, JavaScript, CSS, asset mapping and Firebase configuration. Google account access requires the previously configured Firebase project and published Firestore rules.
- `From_Gutter_to_Glory_Project_v0.96.zip`: editable source, reference notes, tests, and image asset switchboard.

**Back up your v0.95 game in Settings before deploying or starting a new game.** Older saves use the same account document and are migrated to state version 11; the migration retains lane purchases, staff, inventory, construction, money, and progress.

## Main changes
1. **Alley visual:** Front Desk, Waiting Area, and Advertising aligned vertically above the entrance; remove the redundant corner venue marquee; the lane bank and shops are wider; Customize sits directly above the shop grid.
2. **Believable demand:** Early bowling traffic is lower; it grows with reputation, bowling regulars, extra lanes, facility investment, Alley Stars, owner promotion skill, and advertising. Higher lane prices reduce demand. Unlike the old algorithm, no arrival is guaranteed every hour.
3. **All lanes used:** Round-robin lane allocation distributes parties across the available, functioning lanes instead of always selecting Lane 1. Active lanes stay reserved until sessions finish; Thursday League still uses the first six lanes as before.
4. **1–3 hour sessions:** Randomized 1-, 2- or 3-hour bookings, capped by closing at 10 PM. Charge group lane rental for **each** hour; shoes once per visit. Waiting groups must wait for a session to finish. Closing reports include lane-hours sold.
5. **More dialogue:** Over 40 varied lane-side lines and 15 separate annoyed wait-line quips, with rotation and small seeded variation to reduce repetition.
6. **Automatic technician:** The existing `Hire Lane Technician` build upgrade now has a real nightly shift, with an additional $16 daily contract. It automatically maintains lanes at or below 70% condition (+34) for $20 and purchases 5 spare parts for $45 when supplies run low and funds are available. Purchase/repair details appear in the activity log, staff screen, and closing report.

## Notes
- The technician does not produce free repairs when cash or parts are insufficient. Players can still service lanes manually.
- Early/mature traffic figures in the QA notes are scripted simulations, NOT promises about actual player strategies.
- Artwork still uses `assets/asset-map.js`; moving the graphical hotspots does not change image filenames.
- All older real-time cloud and Google/Firebase logic is preserved; live account permissions and iPhone authentication still require real-world verification.
