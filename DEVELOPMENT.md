# Development — v1.00

## Architecture

One simulation module and UI for both campaigns; `campaignStory` tracks per-location route, metrics, AI memory and victory; `portfolio` stores each parked location without a nested `portfolio` property, preventing recursive saves. `switchTown` returns a new valid root state, permitting existing save and render flows to work. `migrate` upgrades v14 data safely.

## Future

- More longform branching scenes, staff loyalty, consequential relationship quests and finale cutscenes.
- Deeper AI telegraphing and counter-strategy for Vera, configurable difficulty and battle logs.
- Location switching UI accessible from the alley top navigation.
- PWA and Capacitor prototype after the mobile save path is stabilized.

Dev-test scenarios use independent storage and reject cloud writes in `cloud.js` until exited.
