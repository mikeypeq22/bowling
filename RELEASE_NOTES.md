# From Gutter to Glory v1.08 — Closing Report, Staff Room & Regulars

Economy unchanged (60-day matched simulations of both routes are identical to v1.07). Save schema stays 20; v1.07 saves load as-is, including a conversation that was waiting.

## Regulars: real conversations
- **41 scenes** across the six regulars (Lou, Bea, Dex, Rosa, Nell, Milo) instead of one fixed question each. Each regular has a personality, and the answer that lands depends on who's asking: Lou wants honesty without fuss, Nell distrusts flattery, Dex wants a challenge rather than special treatment, Rosa sometimes just wants quiet. The obviously "nice" answer is often not the best one.
- **Three answers that all sound reasonable**, shown in a shuffled order with no highlighted "right" button. In testing, the best answer is equally likely to appear first, second or third.
- **They answer back.** After you choose, the regular replies and the dialog tells you how it landed ("Dex warms up to you", "Lou goes a little quiet"). No numbers shown.
- **Scenes deepen with friendship:** new topics unlock as loyalty passes 35 and 60. Some answers are remembered and lead to a later follow-up (Gus's photo, Dex's chalkboard, Bea's cheese guy). Two scenes are unique to the Back Alley route.
- No scene repeats until a regular has used up their available ones. Picking scenes never uses the game's random numbers, so the economy is unaffected.
- **Goals → Regulars** cards now show each regular's portrait, their last reply to you and how many conversations you've had.

## Closing report, rebuilt
- A short **register tape**: today's take (with money in and out), guest mood, then three compact lines for Guests, Sales and Costs. No more grid of big boxes.
- **Overheard tonight:** guest comments as speech-bubble quotes with a small guest figure and where it was said ("a guest on the lanes"), instead of icon rows.
- **For tomorrow:** problems (snacks sold out, bar empty, walk-outs, lanes needing service) are listed with a button that goes straight to the fix (Restock snacks, Add benches, ...).

## Staff room, condensed
- **Roles** are one compact row each (portrait, status like 1/1, Hire button) and sit beside **Your team** on wide screens. Each employee is a compact row with a morale bar, pay stepper, Promote and Fire.
- The "wants to talk" panel only appears when someone actually wants to talk. Emergency contract and Stockroom sit side by side below.
- The phone page is about half as long as before; on desktop the whole staff room fits on one screen.

## Fixes
- **Wide screens (1000 px and up):** the alley floor stayed visible above every other tab since v1.07. Fixed.
- Tutorial and Build-tab tips no longer mention moving rooms.

---

# From Gutter to Glory v1.07.2 — Lobby moves up, ads move into the Front Desk

- **Lobby above the shops:** Entrance, Front Desk and Waiting Area now sit in one row directly above the Pro Shop, Snack Counter and the other shops (below the lanes and fixtures).
- **Advertise tile removed.** Advertising (flyers, radio, TV) and Community & Business Partnerships are now inside the **Front Desk** panel, with buttons at the top to jump between "Prices & stats" and "Advertising". While a campaign runs, the Front Desk tile shows it (e.g. "📣 Neighborhood Flyers"). The Build tab's Advertising shortcut opens the Front Desk at the advertising section.

# From Gutter to Glory v1.07.1 — Cloud reset fix

- **Fixed: "Replace cloud save with a fresh alley" always failed** with *"Could not replace the online game (invalid-argument)"*. A brand-new alley carried one blank field (the weekday of the "day 0" summary), and Firestore refuses blank (`undefined`) values. Regular saves were cleaned before upload; the reset path was not. Both are fixed: the blank field is gone and the reset data is cleaned before upload. Verified with Firebase's own client validator: the old reset data is rejected with exactly this error, the new data is accepted.
- No data was ever lost: a rejected write changes nothing in the cloud.
- Build number bumped to v1.07.1 so browsers fetch the fixed scripts.

---

# From Gutter to Glory v1.07 — The Floor Plan

The alley screen is rebuilt as a fixed floor plan, modeled on the layout of idle-tycoon bowling games: lanes across the top, shops and activities on the floor below, the lobby at the door. Gameplay and balance are unchanged (60-day matched simulations of both routes give identical results to v1.06). Save schema stays **20**.

## How the alley works now
- **Every shop and activity has its own permanent spot.** Rooms can no longer be placed or moved; the Rearrange tool and "Move room" buttons are gone.
- **Spots you haven't bought are faded** with a wooden price sign (e.g. "Snack Counter $235"). Tap the sign to build it. Short on cash? The sign shows the price in red and tells you what you have.
- **Each wing unlocks the next spots.** Past your current wing, the next wing's spots appear locked ("🔒 Wing 1"). An **Open Wing** sign sits above them with the price, the extra lane spots and the attractions it unlocks; it asks you to fill every lane first, as before. Wing 1 → Billiards & Party Room, Wing 2 → Karaoke & Bocce, Wing 3 → Mini Golf, Wing 4 → Laser Tag & Live Stage, Wing 5 → Banquet Hall & Restaurant.
- **Lanes across the top** with a tab for each ("Lane 3 · Lv 2", where the level counts installed lane equipment). Unbought lanes are grey; the next one carries an **Open Lane** sign with its price. The next wing's lane spots show locked.
- **Room levels:** expanding a Snack Counter, Bar, Pro Shop or Arcade upgrades it to **Lv 2** in the same spot. It no longer needs an empty square beside it.
- **Goals bar** at the top of the floor shows progress to the next alley level; tap it to open Goals.
- **Fixtures row** (restrooms, lockers, racks, TV, art, neon) sits between the lanes and the shops, next to Customize.
- **Lobby row** at the bottom: Entrance (with door security on the Back Alley route), Front Desk, Waiting Area, Advertise.
- On wide screens the floor and The Day's Drama sit side by side.

## Saves
Existing saves load as-is. Rooms you had placed anywhere are moved to their fixed spots automatically.

## Build tab
"Floor Plan" is now **Room Upgrades** (level-2 upgrades only). Buying rooms from the Expansions list still works.

---

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
