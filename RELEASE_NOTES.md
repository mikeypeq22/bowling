# v1.00 — The Two Roads Update

## Implemented

- Playable permanent per-location Legacy/Back Alley decision following Vera's offer, with defer option.
- Noir theme, branch-specific report and dialogue, four risk/reward night decisions, and separate victory requirements.
- Rule-based opponent AI which observes player's stats, memory and schedule; targeted moves 6–9 days apart when the shared 5-day global event cooldown permits.
- Optional Riverside location with its own inventory, cash, calendar, reputation, story choice and locked campaign path. Buy after 6 lanes, 3 stars, a chosen path and $8,000.
- Settings → Development Testing scenario: Day 24, six lanes, stocked facilities, workers, available loan and built amenities. Three preview starting points: rivalry choice, Back Alley chosen, Legacy chosen. Separate test save and cloud-sync block; exit restores real session.
- Migration v0.99 schema 14 → schema 15 while preserving all old progress.

## Known limitations

- Vera's AI is deterministic, rule-based strategy, not an externally hosted learning model.
- This is an initial playable branch, not a full open-world crime game. Teen-oriented implied wrongdoing and reputation choices; no graphic action, weapon combat, contraband simulation or detailed illicit trade.
- Both locations are managed sequentially and do not earn money while inactive; multi-location is an early foundation.
- Events and cosmetic changes are tested locally. **Actual Google/Apple browser authentication, Firestore and cross-device synchronization have not been tested on the live deployed website.**
- This prototype does not establish an official ESRB or Apple age rating.
