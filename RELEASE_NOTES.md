# From Gutter to Glory — v0.98 Release Notes

## The Town Comes Alive Update

### Opening story

**The Last Frame**, Grandpa Gus's inheritance story, appears **before** the startup loan and décor choices for a new game. Removed the extra “The keys are finally yours” opening popup. Existing saves retain unlocked story chapters.

### Random events and repairs

- A daily event check begins on day 7, with roughly a 20% chance **only after the five-day global cooldown has elapsed**. All surprise events, including big-party requests, share the cooldown.
- Positive scenarios include local publicity, recommendations, cash gifts, spare-parts help and visitor surges.
- Negative scenarios include individual lane breakdowns, leaking snacks/bar rooms, restroom issues, and problems in other built departments. The affected location **closes until repaired**. The event offers immediate repair or postponement; the Build view also exposes outstanding repairs.
- Repair costs vary by affected facility; the repair is a player choice. Normal lane servicing is separate from incident repairs.
- One queued surprise or regular-visitor conversation can be addressed at a time, with its state preserved for reopening.

### Business expansion

- `6 → 10 → 14 → 18 → 22 → 24` total *available slots*. Property wing construction opens four lane slots and one shop row per wing, except the last wing adds the final two lane slots. Individual lanes must still be constructed and paid for.
- The shops/activities grid grows from two to seven rows (five squares across), preserving existing room placements when migrating v0.97 saves.
- New **operational** attractions: Billiards and Party Room (first wing), Karaoke (second), Indoor Mini Golf (third), Laser Tag (fourth), Banquet Hall (fifth). Larger attractions occupy two or three grid squares and receive revenue from visitors.
- Other researched amenities (bocce, event stage, fine dining) remain future ideas.

### Community, bookings and guest flow

- Six familiar patrons—Lou, Bea, Dex, Rosa, Nell and Milo—can appear with character prompts, a portrait placeholder and two dialogue options affecting loyalty (positive +12, negative −8).
- Random private-party invitations can be accepted or declined. Accepted parties hold **all finished lanes from 6–8 PM** on a future day and pay **2× the usual lane income** for that two-hour booking. Regular guests may wait or become unhappy.
- Arrival rates vary by opening hour and weekday. Friday, Saturday and Sunday are more popular; weekday afternoons are quieter. Existing reputation, price, advertising, stars and capacity effects remain relevant.
- Advertising offers an optional **local-school partnership** after four lanes, for a one-time $240 in-game fee and a boost to school-day traffic.

### Compatibility

- Save schema v13; automated tests cover migrating v0.97 schema 12, retaining story/loan/customers/lanes, and new event state.
- Google and email account code and existing Firebase client configuration are preserved. Live Firebase sign-in, security rules and cloud save roundtrip have **not** been independently verified for this release.
- The standalone demo saves **locally only**. GitHub Pages build relies on separately configured Firebase for cloud accounts.

### Known limits & next steps

- A large 24-lane property is shown in a longer scrollable layout on mobile; a navigable zoom/pan floor plan is a useful future improvement.
- A full booking-calendar UI, multiple concurrent parties, named parties meeting regulars, staff incident dispatch, and intelligent technician emergency repairs are future work.
- Long-term challenge: maintain an economy where unexpected closures are inconvenient but don't trap a low-cash new player. Monitor reports from human playtests.
