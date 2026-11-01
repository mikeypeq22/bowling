# v1.03 research and QA record

## Executed verification
- Node.js syntax checks on `engine.js` and `app.js`.
- Automated state test for fresh startup → Lane 1 → Maya introduction → completed First Frame → Lane 2 → Leo.
- Employee career promotion from 1 to 5, wage expectations, department mastery rewards, 25-day game simulation and JSON save roundtrip.
- Back Alley Old Town tactical mission: recruit willing bowler, entrance security requirement, six-turn cap and territory result.
- Migration from v1.02 schema 17 to v1.03 schema 18.
- Two-town switching and v1.02 franchise snapshot migration.
- In-memory headless Chromium interface at **320px, 390px and 1280px**. Clicked both shots of Maya's First Frame and started/auto-resolved Old Town encounter; no JavaScript page errors seen in those flows.
- Living Progression Master v3 Word document rendered to 25 page images and reviewed.

## Limits
- Live Firebase, Google sign-in and Cloud Firestore authorization were **not** tested.
- No iPhone/Android device QA, offline synchronization, native app or casino payment integration.
- Old v1.02 progress is preserved by schema migration; backing up before deployment remains recommended.
