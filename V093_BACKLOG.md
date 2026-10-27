# From Gutter to Glory — v0.93 bookmarked ideas

STATUS: Proposed / deferred. None of these features are implemented in v0.92.

## 1. Overnight expedited construction
- At daily closing, present an optional paid construction rush on projects in progress.
- Pricing scales with the number of days advanced; don't make normal construction intolerably slow to force rush purchases.
- Spend only in-game cash. Do not involve real-money payments.
- Show cost, number of game days saved, resulting completion date, and an explicit confirmation.
- Test affordability, simultaneous projects, closing report interactions, negative cash, and save/load.

## 2. New snack counter recipes
- French fries, hamburger, cheeseburger.
- Unlock through sensible snack popularity / alley level / room size progression.
- Each recipe gets its own stock, supply ordering, next-day delivery, selling price, customer demand and an optional fun customer remark.
- Avoid a flood of separate inventory buttons; organize menu into drink / snacks / meals sections.

## 3. Customer happiness meter
- User inspiration: +3 for a satisfied guest/group, −2 for dissatisfaction or not finding something desired.
- Proposed model (INFERENCE; needs testing): start happiness at 65/100. Score each distinct visiting group at most once per primary visit outcome (+3 satisfied / −2 dissatisfied). For a guest unable to purchase an advertised or requested item, apply at most one additional −1 penalty (avoid multiple penalties for the same shortage).
- Compute daily impact with bounded contribution (e.g. clamp 3×satisfied−2×unsatisfied−1×missingItem, −12, +12), then smooth the 0–100 overall happiness score so a single unlucky day doesn't tank the center's reputation. Consider `target = clamp(65 + 2×dailyImpact, 0, 100)`; `H_next = round(0.85×H_current + 0.15×target)`.
- Display a big readable happiness meter with colored faces, specific causes, and historical trend in the day report; avoid vague star points.
- Ensure happiness is a separate satisfaction metric, not a duplicate of the existing reputation / alley-level gating.
- Research & QA should test empty center, capacity pressure, out-of-stock food, lines, overpriced lanes, amenities, repeat visitors, and consecutive happy days.

## v0.93 priority
1) Expediting projects; 2) three new food items; 3) happiness metric and UI, with economy / customer tests.
