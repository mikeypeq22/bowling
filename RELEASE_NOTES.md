# v0.91 Release Notes

## Changes

- New sign-in splash, player nickname/profile in Settings, sign out, and cloud status.
- When configured, Google Authentication is required to enter a cloud game.
- Stores only one document per player under `players/{uid}`.
- Saves at end of game day and explicitly on profile changes, reset, import or manual Save Now.
- Validates migrated saves; offers safe local-vs-cloud selection to prevent overwriting old saves automatically.
- Guarded Firestore transactions detect changes from another device and pause syncing until player reconciles.
- Config missing: local-demo mode remains fully functional (no account and no cloud saving).
- Includes Firestore Rules, a detailed Spark deployment guide, and backup instructions.

## Known limitations

- Actual authentication with a real Firebase project cannot be validated without project credentials and published Firestore Rules. End-to-end deployment verification is required by the owner.
- No email/password sign-in; Google popup sign-in only in this version.
- Without connectivity a configured cloud account cannot start a *new* sign-in. Existing gameplay may be locally saved, but cloud sync depends on network service.
- One game per player account for now. No multiple save slots, leaderboards, or social features.
- Players must explicitly decide between conflicting local/browser versions and remote versions. Account switching does not erase old v0.9 browser files; the current account's live save is scoped by Firebase UID.
- GitHub Pages remains public for game code; Firebase security rules enforce private data.
