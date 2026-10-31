# From Gutter to Glory v1.02 — No More False Starts

## Release focus
This release responds to deployed v1.01 feedback: incorrect welcome version, development preview confusion, no safe path to replace a broken/unwanted cloud save, and a Back Alley campaign that still felt too tame.

### Confirmed repairs
- **Corrected version badges** on the login and welcome screens. v1.01 accidentally still said v1.00 in both places.
- **Cache-busted assets** (`?v=1.02` on stylesheet and JS) to prevent mixed deployments, especially on mobile.
- **Developer Preview immediately opens the populated alley scene**, visibly displays its campaign, six lanes and money, suppresses first-use tutorial prompts while testing, and uses a separate v1.02 local save slot. The original account and live cloud sync remain untouched; Exit Preview restores the original game.
- **Confirmed cloud replacement option**, offered in the login/failed-load gate and from Settings when authenticated. It requires a separate `RESET CLOUD` confirmation. It replaces the player's own Firestore game transactionally using a new empty-building snapshot and increments its revision; it does **not** delete the Auth account or Firestore document. It will not bypass unreadable/unauthorized Firestore access. Where a cloud record was successfully loaded, players can first download an importable backup if valid, or the raw record for inspection if invalid. Existing Firestore security rules remain unchanged.

### Back Alley additions
- **Casino Lounge wagering**: High Roller Wheel offers $10/$25/$50/$100 stakes from the *fictional alley cash balance*, with losses and gross payouts tracked in both cash and the daily report. There are five spins per game day. Payout odds: 60% lose stake, 28% return double, 10% return triple, 2% return quadruple (94% theoretical return). Not a real-money gambling product: no purchased chips, deposits, withdrawals, payments, or cash-out.
- **Pit Boss and visitor tables**: Hire a Pit Boss for $420 plus $19/game-day wages to operate patron wagering. Visitor table stakes and payouts affect casino business cash in addition to your direct wheel bets.
- **Night crew payroll**: Door security, cameras, and training carry daily operating costs. An unpaid crew loses effectiveness until paid. No free automatic protection indefinitely.
- **Rival warnings and counterplanning**: Visible warnings before Vera's suspected next move, a temporary prep action that affects actual sabotage outcomes, and 21-day repair coverage reducing the direct cost of rival damage.
- **Expanded mature crime-drama atmosphere**: More profanity, corruption, intimidation and underworld language in Back Alley only. The Legacy campaign retains its family-friendly character. Age rating has *not* been certified.
- **New story chapters**: The Books Never Lie and Someone Talked, unlocked by casino wagers and preparing for Vera's next attack.

### Preservation
- Core Bowling/Legacy functionality is preserved.
- Save state migrated from v1.01 (version 16) to v1.02 (version 17), including other town snapshots.
- Firebase client setup, email/password/Google login, and revision-checked cloud writes retained.
- Device-specific live Firebase success, actual iPhone Google login, and production Firestore permissions **have not been verified**.

### Planned, not built (v1.03+)
Animated casino games, full blackjack strategy, bowling skill games, billiards, laser-tag defense, character-specific underworld story encounters, richer security NPC animations, real native-app testing, and more franchise narrative remain future work. See `V103_MINIGAME_DESIGN.md`.
