# Decisions — v0.91

- Chosen Firebase Auth (Google popup) + Cloud Firestore on Spark, to keep per-player saving free within quota.
- Kept GitHub Pages hosting; no server deployment required.
- Cloud writes occur once at closing, plus explicit save/profile/reset/import actions, to minimize write quotas.
- One Firestore document per authenticated UID with protected security rules and revision checks.
- Browser saves persist under account-scoped keys; v0.9 migration is deliberate.
- An unconfigured copy can still launch in local-demo mode, but a configured copy requires sign-in to begin play.
- Identity and cloud persistence are separate from game simulation engine; engine remains independently testable.
