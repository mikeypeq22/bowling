# From Gutter to Glory — v0.99

**The Town Comes Alive Update** · browser-based, mobile-first bowling-center management game.

## What's new

- Grandpa Gus's **The Last Frame** story is shown before selecting a startup loan. The old “The keys are finally yours” popup is gone.
- **Random town events** start after day 6, with a shared minimum of **five full game days** between events. Some bring customers, reputation, supplies or cash; others close individual lanes or facilities pending a paid repair.
- **Private party requests** arrive as an event: accept or decline a booking. Accepted parties reserve the entire bowling center for two hours at **double lane rental income**, at the possible cost of disappointed walk-ins.
- **Property wings:** the original six-lane property expands in stages to 10, 14, 18, 22 and finally **24 lane slots**. Each wing adds another row of shops. Players purchase **each lane individually** after the property expansion is complete.
- Six new purchasable attractions across the wings: **Billiards, Party Room, Karaoke, Indoor Mini Golf, Laser Tag and Banquet Hall.** Several occupy two or three floor-grid squares. More advanced attractions are still future ideas.
- **Regular visitors** can start an on-screen conversation; choices increase or decrease their loyalty. Conversations are stored in game progress.
- **Daypart and weekly seasonality:** late evenings and Friday–Sunday tend to be busier than early afternoons and the first weekdays. **School partnerships** become available under advertising for suitable centers.

## Playing and deploying

- Open `From_Gutter_to_Glory_Playable_v0.99.html` for the standalone version; it saves in your browser and **does not** use cloud sign-in.
- Extract `From_Gutter_to_Glory_GitHub_Pages_v0.99.zip` and upload **its contents**, including `index.html`, `engine.js`, `app.js`, `cloud.js`, `style.css`, `firebase-config.js`, and the `assets` directory, into the root of your GitHub Pages repository. Do not upload the ZIP unchanged.
- The full source and release/testing notes are in `From_Gutter_to_Glory_Project_v0.99.zip`.
- **Back up your current game** from Settings → Export before replacing live files.

## Saving, security and compatibility

- Save schema is now **v14** and includes migration from v0.98/v13 and earlier versions. Existing loans, lanes, staff, story and regulars are retained. Do not clear local browser storage before exporting a backup.
- The previous Firebase project client configuration is retained. These files **do not** create or configure a Firebase project automatically. Cloud login and saving must be tested on the deployed site; they have not been verified live for this release.
- `firebase-config.js` contains Firebase *public browser-app configuration*, not a service account key. Never place administrator credentials in GitHub. Apply the provided `firestore.rules` in Firebase Console and keep each user's documents private.

## Art customizations

Art paths are centralized in `assets/asset-map.js`. Players can supply custom PNG, WebP or other browser-supported graphics in `assets/`, and then change the filename in the map. Missing images fall back to built-in visuals. New patron and attraction artwork slots are available.

## Current limitations

- The random-event cooldown is **at least five days**, not an exact repeating event schedule; some periods will be quiet.
- Event repairs are intentional player decisions. The Lane Technician's ordinary servicing does not automatically repair exceptional incident closures.
- The user interface shows all 24 lanes on a tall, scrollable mobile screen; larger properties will need a more compact camera/zoom system in a later version.
- Parties reserve lanes, but there is not yet a reservation calendar with multiple simultaneous advance bookings.
- The fictional National Heritage Cup/Heritage Charter and Vera Vale story remain narrative/game systems, not real accreditations.

## What v0.99 adds

See `RELEASE_NOTES.md` for full feature details. The new clock tutorial, booking calendar, partnerships, VIP groups, emergency mechanic, personal room details, later attractions, rival business pressure, community repair assistance, and mobile map/accessibility controls are now available. `RIVAL_PATHS_FUTURE_DESIGN.md` contains the proposed *optional* darker story mode; it is not a playable campaign in this release.

### Deployment

Upload the **contents** of the v0.99 GitHub Pages ZIP to your existing GitHub Pages repository, replacing older source files. Preserve backups of your cloud and exported save before updating. The Firebase config remains from the previously configured project. Local standalone HTML is demo-only and does not upload to Firestore. Real Firebase sign-in and saves must still be verified on physical devices.
