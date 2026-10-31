# Development — v1.01

**Architecture:** shared `engine.js` (version 16), campaign-specific state in `campaignStory.nightOps` stored separately per town, `app.js` UI switches by `campaignStory.path`, existing `cloud.js` Firebase unchanged.

The dark path now depends on actual revenue generating venue operations, security purchases, and successfully handling sabotage. Avoid regressions in existing game-day scheduling, incident cooldown, local storage and Firestore. Long-term options: security staffing costs, animated staff at the entrance, specialized Casino Lounge artwork, consequences across the town, dynamic minor characters, deeper multiweek storylines, and optional campaign difficulty.

**Privacy & purchases:** there are no in-app purchases or real-money gambling; casino-themed machines use ordinary attraction fees and tickets only.
