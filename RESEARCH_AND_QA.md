# Research & QA workstream — v0.7

The Research & QA workstream is a separate set of responsibilities; it is **not** an autonomous, always-running agent. It tests game behavior, challenges balancing assumptions and records bugs before the Development workstream packages each release.

## Verified by automated engine tests

- v0.6 → v0.7 save migration preserves built rooms and lane count while initializing new payroll and delivery fields.
- Day is 14:00–22:00, Monday–Sunday weekly cycle.
- Snack/bar ordering removes cash immediately, queues deliveries for the next morning, and does not inflate stock until delivery. Daily supply costs and wages are reflected in net income.
- Counter sales require full staffing; a two-tile shop needs two. Arcade remains self-service.
- Workers have per-day salary, morale, optional paid training and improvements to service sales probability.
- A stock clerk avoids ordering duplicate packs already in transit and uses the configurable low-stock trigger.
- Customers can come just to purchase food, drinks, games or supplies; appropriate event types are generated.
- Full six-lane Thursday event blocks all six lanes at 18:00 and 19:00 and earns revenue only if both hours occur.
- Income and operating-net equations reconcile in a 48-seed × 64-day stress pass: **12,304 assertions**.

## Verified through browser interactions

- Fresh and fully developed alley loads, cutscene, navigation and four build submenus.
- Closing report omits unbuilt business lines, has customer voices, and persists the explicit skip setting.
- Hiring, payroll price stepper, training, stock threshold, staff drawer messaging, delayed delivery.
- Moving a bar to a different grid square; animated group walks to the **moved** bar and then assigned lane.
- Six lane labels change to league status for the two-hour Thursday block.
- Mobile has no page-width overflow at a 390px viewport; staff and goals accessible.

## Research vs inference

- **Verified (code):** Game procedures and calculations above are confirmed by tests.
- **Inference / design choice:** Stock Clerk, wages, morale, guest probabilities, two-hour league reservations and drink demand are deliberately simplified for enjoyment and teachable progression. They are not intended as accurate real-world bowling-center financial models.
- **Still unverified:** Human play enjoyment, accessibility with screen readers/keyboard-only controls, long-session frame rate, all mobile browser variants, and actual player preference for funny versus repetitive comments.

## Future research and regression needs

- Validate whether the one-employee-per-tile rule is intuitive, and whether expanded venues should use scheduling and shift coverage instead of raw headcount.
- Sample player feedback on delivery lag (should there be emergency same-day deliveries for a premium fee?).
- Keep price/wage economy balanced without penalizing early players. Add a toggle to show payroll and staff morale impact in the front desk.
- Evaluate multiple league schedule types (full-house vs split-lane league, special events).
- Build recurring tests for one-hour service interactions during auto-play, week rollover, and manual saved-game export/import.
