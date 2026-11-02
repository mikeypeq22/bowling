# From Gutter to Glory v1.06 — Performance & Visual Refresh

Builds on **v1.05** without changing gameplay: a matched 60-day simulation of both routes produces identical cash, reputation and calendar in v1.05 and v1.06. Save schema stays **20**; v1.05 saves load as-is.

## Faster
- **Only the visible screen renders.** v1.05 rebuilt all seven tabs on every game hour and every tap. v1.06 renders the header plus the visible tab and rebuilds other tabs when you open them. In a headless test the alley screen's DOM dropped from ~2,000 to ~930 elements.
- **Saves are coalesced.** Bursts of taps produce one write (~0.9 s later). Saves are still written immediately at day close, when the page is hidden or closed, and before switching save slots (cloud sign-in/out, dev preview, import, reset). Switching tabs no longer re-serialises the whole alley.
- **Smaller saves.** The hour-by-hour visitor log is kept for the last 7 days (totals and comments for all 21). A simulated 200-day save shrinks from ~243 KB to ~124 KB, keeping cloud saves far from Firestore's 1 MiB document limit. Older saves are compacted when loaded.
- **No more broken-image requests.** v1.05 pointed every icon at a PNG that didn't exist and re-requested it on every render (100+ failed requests in a short session). v1.06 ships the art and remembers any missing file instead of asking again.
- **Clock pauses in the background.** The game no longer advances while the browser tab or phone app is hidden.

## New look
- **One drawn art set** (`assets/art/`, 91 SVG files, ~115 KB): navigation, all rooms and facilities, every snack, drink, arcade machine, fixture and attraction, pro-shop goods, lane pin decks, 19 character portraits (Gus, Vera, the six regulars, staff roles, bowlers, you), and building scenes for each level-up.
- **Type:** Bowlby One for signage and headings, Barlow for the interface — both bundled (no Google Fonts call).
- **Header** reads like an alley marquee over a maple lane strip and now simply says **The Back Alley** (the home alley's new name; saves still called "Gus’s Town" are renamed on load, Riverside keeps its name). The story route moved to the small line underneath.
- **Menu** keeps the original separate rounded buttons and emoji icons; all seven now fit on 320 px phones. (Drawn `nav-*` icons remain in `assets/art/` if you ever want to map them.)
- **Fixtures and decor** you buy (restrooms, lockers, ball racks, TV, wall art, neon) now sit together in one row above Shops & Activities instead of down the left side of the lanes.
- **Venue map zoom bar removed**; the map always shows at 100%.
- Decorative emoji removed from headings and buttons; facility panels, story letters, patron chats and story cards now show the matching artwork.
- Back Alley route keeps its own plum/neon palette.

## Playtest items closed
- **Department stars** drawn as filled/empty stars on Ratings and Goals, and prominently in the Snacks and Bar panels.
- **Vera's pressure** gauge in the header once she's active (always on the Back Alley route). Tap it to jump to Goals.
- **Door security** now sits on the entrance door and no longer covers the Waiting Area on phones.

## Fixes
- Phone header: venue name no longer overlaps the date and cash.
- All seven menu buttons now fit at 320 px (Staff and Goals used to be off-screen).
- Loading a Development Testing scenario while the startup dialog was open left the clock stuck.
- Stock warnings on room tiles no longer cover the room picture.

## Deployment
Export your current save from Settings first. Upload the **contents** of this ZIP to the repository root, including the new `theme.css`, `assets/art/` and `assets/fonts/` folders. Hard-refresh and confirm "v1.06" on the opening screen. `PLAYABLE_DEMO.html` stays local-save-only and should not replace `index.html`. `tools/` is optional (art and demo build scripts) and harmless to deploy.
