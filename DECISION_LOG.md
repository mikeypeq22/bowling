# v1.06 Design decisions

- No gameplay or balance changes in this release; optimizations and art only, verified by matched simulations against v1.05.
- Render the visible tab only; mark the rest stale. Chosen over a full virtual-DOM rewrite to keep the code familiar and the change small.
- Debounce saves but always flush at day close, page hide and before save-slot switches, so a crash or sign-out can lose at most ~1 second of taps.
- Keep 21 day reports but only 7 days of hour-by-hour logs, to protect the Firestore 1 MiB document limit as saves age.
- Art direction: one generated SVG style (single ink outline, flat fills from a mid-century bowling palette) instead of mixed emoji and AI-rendered images, so every icon looks drawn by the same hand and stays crisp at any size. SVG also suits the later Android/iPhone wrap.
- Fonts bundled locally rather than loaded from Google Fonts, for offline/mobile packaging and privacy.
- Header gauge for Vera appears only when she's a factor, to avoid alarming new players.

# v1.05 Design decisions (unchanged)

- Same six fictional districts for both story campaigns; influence and prestige are not property ownership.
- Legacy path wins district leagues then championship finals, without being forced to buy more property.
- Back Alley territories are unlocked by the player's own wing expansion; need two tactical site wins and prior district control.
- Preserve legacy tournament brackets and all older save progress rather than replace them wholesale.
- Story branch permanently locks per location. Week-three threat + seven-day delay to reduce narrative rush.
- Manual event-booking calendar removed from Compete in response to playtest feedback; prior bookings honored and random offers retained.
