# From Gutter to Glory — Mini-Game Design Atlas (Planning for v1.03)

**Status: design only. None of these are completed interactive games in v1.02.**

## Core principle
Mini-games should be optional diversions that give the player a reason to step away from dashboards. A player who ignores mini-games must still be able to grow the alley and complete the main campaign. Mobile input should use taps, swipes or a few big buttons. Each activity needs a time limit or turn cap, replayable challenge and reward balanced against the idle economy.

## Candidate ranking
| Priority | Mini-game | Where | Core interaction | Business impact |
|---|---|---|---|---|
| 1 | **One-Frame Bowling Challenge** | Lanes / Competitions | Aim, time and swipe to release; attempt 2 throws at 10 pins | XP, reputation, spectator excitement; no forced gameplay |
| 2 | **Casino High Roller Wheel** | Back Alley Casino Lounge | Animated wheel, choose fictional cash stake, show probability and payout | Risk to venue cash, suspense, casino story progress |
| 3 | **Twenty-One (Blackjack-style)** | Casino Lounge | Hit, stand and optionally double down; house follows a transparent rule | True player decisions in a chance-based game; game cash only |
| 4 | **Billiards Trick Shot** | Billiards room | Set cue angle/power and sink a highlighted ball | Room popularity, minor skill-based reward |
| 5 | **Karaoke Encore** | Speakeasy / stage | Tap beats on-screen; variable difficulty and scoring | Crowd satisfaction, repeat visits |
| 6 | **Mini Golf Putting** | Mini Golf wing | Set direction and drag to control power, watch ricochets | Attraction appeal and optional bonus |
| 7 | **Laser Tag / Alley Security Tactics** | Expanded wing / Back Alley | Short turn-based placement of team members and coverage | Staff confidence and security, not graphic combat |
| 8 | **Pinball Bonus Round** | Arcade | Simple flippers with accessible on-screen controls | Arcade prizes and leaderboard |

## v1.03 suggested initial scope
Build *One-Frame Bowling Challenge* and an actual animated *High Roller Wheel*, with robust mobile inputs, separate help/tutorial, predictable results, and sound toggle. If they are fun and stable, follow with Twenty-One. Do not implement eight mediocre mini-games all at once.

### Casino fairness, funds and content
All casino wagering remains strictly **fictional in-game cash**; no deposits, cash-out, cash-equivalent prizes, paid chips or real-money gambling. Display odds, stakes, gross payout and net gain/loss before wagering. Keep safeguards against accidentally losing the entire operating balance. Do not allow simultaneous spins, repeated taps during animation or transaction replays. Store only final results in game state. Current v1.02 High Roller Wheel has a theoretical return of 94%, so the house edge is 6%; tune after playtests.

### Architecture
Create a separate `minigames/` module with `gameId`, `status`, `seed`, `wager`, `startedAt`, `outcome`, and per-day participation tracking. Use a single global game-state operation that atomically pays the wager and records results, rather than UI-only deductions. The engine must always be authoritative; decorative animations may never determine cash outcomes. Compatible with standalone HTML and Firebase save exports.

### Accessibility
Large touch targets, no timing-only way to progress the main storyline, optional slow mode and reduced motion, keyboard support on desktop, clear text readouts (not color only), and ability to skip animations after outcomes are recorded.

### Story opportunities
The Legacy route can host school competitions and bowling challenges; The Back Alley can run high-stakes fictional table games and security tactics. This distinction should influence dialogue, business visitors and goals. Preserve the option for different towns to use different gameplay modules.

### Open design questions
- Should casino wagers use the same wallet as construction or a separate *fictional* gameplay bankroll earned by operating the lounge? The first creates tension; the second limits loss spirals. v1.02 currently uses the venue cash balance with a five-bet cap.
- Should arcade/mini-games offer optional automation through a manager, and when?
- Do mini-games appear as 30–60-second side activities or longer challenges?
- Should challenges reward stars, XP, fictional cash or customer loyalty, and how do we avoid exploit loops?
