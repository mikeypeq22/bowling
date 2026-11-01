# FROM GUTTER TO GLORY
## Progression, People, Rivals & Mini-Games: Living Master v3

**Status:** LIVING DESIGN + IMPLEMENTATION LOG — playable v1.03 release; sections below retain original design proposals unless marked in the implementation ledger.  
**Baseline inspected:** v1.02 code; actual delivered changes verified against v1.03 (`state.version = 18`).  
**Design principle:** Make every upgrade lead to a new decision, character moment, service, or opportunity—not merely a higher number. Preserve the readable idle/business game; put deeper systems behind optional screens and automation.

> **Vocabulary and evidence:** **CURRENT** means present in the inspected v1.02 source. **PROPOSED** means design awaiting implementation and playtests. **TARGET** means an illustrative balancing number, not a confirmed in-game price or progression value. **DEFERRED** means intentionally outside the first playable v1.03 scope.

---


# Version history and implementation ledger (living)

**Rule for future versions:** Record every addition, removal, and scope change here after code and browser testing. Label **IMPLEMENTED**, **PARTIAL**, **DEFERRED**, and **REMOVED** explicitly. A proposal in later sections does not imply it is playable.

| Release | Major implementation | Removed / changed / deferred |
|---|---|---|
| v0.93 | Startup loans, opening decor, staged property choices, department ordering freedom, optional overnight construction rush, new snacks, customer happiness | Replaced fixed snack-first progression |
| v0.94 | Start with an empty building, build the first lane, facility-opening tutorials, visual room stages and inventory alerts | Removed the old dirt-lane start |
| v0.95 | Guided UI tips, mobile closing-report fix, individual lane equipment and first Alley Star scoring | Removed accounting boilerplate from report |
| v0.96 | Rebalanced demand, rotational lane assignments, 1–3-hour sessions, auto Lane Technician, expanded overheard lines | Replaced early-lane-first customer assignment |
| v0.97 | Gus's family story, department star ratings, six named repeat patrons, center-wide lane kits | Broke overall rating into seven contributing departments |
| v0.98 | 6→10→14→18→22→24 lane capacity, new room wings, scheduled event gaps, breakdowns, booked parties, interactive patron choices | Relocated and expanded shops with each wing |
| v0.99 | Contracts, partners, VIPs, emergency coverage, Vera business rivalry, map zoom and time tooltip | Dark branch planned, not yet playable |
| v1.00 | Permanent two-route choice, rule-based Vera tactics, two separate locations, isolated development preview | Campaign path locked per town |
| v1.01 | Night defenses, sabotage shutdowns, casino-themed lounge, separate Back Alley story objectives | Replaced pressure-only branch with tangible defense mechanics |
| v1.02 | Fixed version labels, cloud-save replacement flow, casino fictional-cash wagering, payroll and rival warnings | Real-money gambling intentionally excluded |
| **v1.03** | **Department star perks, five-level employee career track with experience and morale decisions, Maya's two-shot First Frame, Leo's early joining story, Old Town crew battle and territory ownership** | **Animated casino wheel, full season board, larger turf map, multiple career questlines and advanced employee scheduling remain DEFERRED** |

## v1.03 detailed delivery checklist

| Track / feature | Delivery status | Verified behavior and exact scope |
|---|---|---|
| Department Star mastery | **IMPLEMENTED — initial** | Seven departments retain 0–5 calculated stars. New milestone notices are logged; perks alter actual snack/drink/arcade/pro-shop sales, lane wear, waiting patience and decor-driven traffic. |
| Milestone reward catalogs | **IMPLEMENTED — initial** | Each department has five named milestone descriptions; new earnings and service benefits scale at selected star levels. More distinct products/services per star remain future work. |
| Employee XP & 5 career levels | **IMPLEMENTED** | Work XP from real work unlocks paid promotion through Rookie → Reliable → Specialist → Senior → Manager. Promotion cost, daily wage expectation and morale are visible. |
| Employee specialties | **IMPLEMENTED — initial** | One specialization choice at level 3. Speed, quality and upsell types have direct effects in relevant service or earnings; other specialty names are groundwork for later depth. |
| Staff dissatisfaction | **IMPLEMENTED — initial** | Underpayment or burnout can trigger a conversation after a minimum spacing. Raise, bonus and listening options change wages/cash/morale. No randomized firing or full staff scheduling yet. |
| Maya's beginning | **IMPLEMENTED for new games** | Maya is the first bowler. Completion of Lane 1 triggers her introductory story and unlocks a first-frame challenge. |
| First Frame mini-game | **IMPLEMENTED — playable slice** | Two throws maximum, with angle/spin/power sliders, displayed pin result, +2 Maya Focus, confidence and owner XP on completion. Not yet animated pins or swipe release. |
| Leo recruitment | **IMPLEMENTED for new games** | Leo arrives after Maya's challenge, two lanes and eight served groups. Existing saves retain their original bowlers. |
| Back Alley crew and Old Town | **IMPLEMENTED — playable prototype** | Willing named bowlers can join the crew. Install Door Security, confront Vera's crew in a 1–6-turn action/defense/assist encounter, optionally auto-resolve, and secure Old Town for an immediate reputation/trust/pressure reward. |
| Bigger territory and tactics | **DEFERRED** | Other districts, equipment/fatigue systems, opponent squad composition, procedural mission objectives and persistent territory battles remain design-only. |
| Expanded tournament season | **DEFERRED** | Original tournaments and practice remain; full season brackets, match lineups and long-form personal stories need later versions. |
| Additional mini-games | **DEFERRED** | Animated casino wheel, Twenty-One, billiards trick-shot, karaoke, pinball and mini-golf challenges remain in the separate mini-game atlas. |
| Save migration | **IMPLEMENTED** | New save schema version 18. v1.02 saves (version 17), including inactive town snapshots, migrate with existing lanes, finances, employees, story path and bowlers preserved. |

### Balancing notes and known limits (v1.03)

- Promotions are capped at Level 5 and gated by XP milestones of 8, 22, 45 and 78 earned work XP; actual promotion requires paying a training fee. Wage expectations scale by career level, making underpayment a morale tradeoff rather than a forced transaction.
- Department star rewards currently supplement the existing star-driven alley-level thresholds rather than replacing them. Stars still depend on usage and investment. Previously earned stars in old saves are backfilled silently to avoid repeating every announcement.
- The first tactical mission is intentionally short and stylized; it demonstrates the new branch direction without pretending the entire territory strategy game is complete.
- The dark route remains per location. The Legacy route is not assigned territory combat.
- Firebase configurations are preserved, but authentication and cloud-save behavior require **live deployed testing**; in-container automated and browser tests do not establish real iPhone or Firestore reliability.

---

# 1. Executive direction

The game has **four interlocking progression tracks**, not one massive level bar:

1. **The property:** Improve lanes and departments → earn Department Stars → earn overall Alley Stars → grow the business, qualify for better contracts, expand, and eventually operate other locations.
2. **The people who run it:** Employees gain experience, develop specialties, expect better pay, form relationships, and can become frustrated or quit. Good management should be as important as buying equipment.
3. **The home team:** Bowlers have names, histories, skills and rivalries. Training leads from neighborhood matches to the National Heritage Cup; story reveals why they stay with Grandpa Gus's place.
4. **The chosen campaign:** The Legacy grows through community relationships, leagues, sponsorship and prestige. The Back Alley grows through nightlife economics, crew loyalty, defensive upgrades, territorial influence and tactical encounters with Vera's organization.

The optional mini-games live *inside* these tracks. They enhance the story and grant modest rewards but must never be required to keep a profitable idle business alive.

### Four linked loops

| Loop | What the player does | Reward | Risk / tension |
|---|---|---|---|
| Build & operate | Open rooms, install equipment, serve customers | Department Stars, revenue, new menu options | Operating costs, repairs, stock and wait times |
| Lead people | Hire, train, schedule, recognize, negotiate wages | Faster service, better sales conversion, reliable automation | Payroll, morale, disagreements and turnover |
| Develop bowlers | Train, play optional challenges, enter tournament seasons | Championship eligibility, rival scenes, sponsors | Fatigue, confidence, entry fees and setbacks |
| Defend or unite | Community partnerships **or** Back Alley crew/territory missions | Story chapters, influence, town access, campaign-specific endings | Vera's counter-moves and meaningful tradeoffs |

**Important:** The Legacy should remain a complete experience, not the “simple mode”; The Back Alley should have genuinely different systems, not just reskinned buttons. A future second location may follow the opposite campaign, because campaign identity is stored per town.

---

# 2. What v1.02 actually has (the baseline)

- **CURRENT:** Seven rated departments: Bowling Lanes, Snack Counter, Bowling Bar, Arcade, Pro Shop, Guest Comfort, Look & Feel. Each currently contributes 0–5 stars; the total is 0–35.
- **CURRENT:** Overall five-star thresholds occur at department-star totals **3, 8, 14, 21, 29**, with additional lane, group-count and reputation gates for venue progression. The current five venue tiers culminate in Bowling Landmark.
- **CURRENT:** Snack/bar/arcade/pro-shop department ratings primarily count visits, expansion and a room improvement. **Missing:** meaningful rewards when each department gains a star.
- **CURRENT:** Most employees begin with skill 1, morale 78 and role-specific daily wages. Training goes only to skill 3; wages are adjustable within $8–$32. Skill and morale modestly affect service performance. Morale already reacts to wage fairness, and intimidation can lower morale.
- **CURRENT:** Two bowlers, **Maya and Leo**, are present at the start with Aim, Spares, Power and Focus. You can buy stat training and fit balls; there is little identity-driven story. Team performance currently uses the best two bowlers; the roster can grow to four.
- **CURRENT:** Local, County, Regional and National tournaments exist. The national win supports the Legacy campaign's Heritage Charter.
- **CURRENT:** The Back Alley has security equipment, Vera sabotage, a Casino Lounge with fictional-cash wagering, crime-drama chapters and a separate campaign. It does **not** have a controllable crew, turn-based combat or territory ownership.
- **CURRENT:** Random major events have a minimum separation of five game days, and different towns have their own game-state snapshots.

**Interpretation:** We do not need to throw away the engine. We need to connect its existing progression numbers to unlocks, stories, management consequences and player choices.

---

# 3. Department progression: stars that actually mean something

## 3.1 What a Department Star should represent

Department Stars measure *development* rather than merely how expensive a room looks. For staffed, revenue-producing rooms, three broad requirements should work together:

- **Investment:** Build the room; install or improve equipment; expand its physical footprint.
- **Real demand:** Serve actual visitors, sell items, or conduct sessions. No phantom sales and no buying five stars without operating the business.
- **Service quality:** Keep the department open, stocked and adequately staffed; satisfy customers. A larger kitchen is not an excellent kitchen if all its customers walk away hungry.

**Proposed model:** Each department has five permanent star milestones. To earn the next star, meet a *usage milestone* and *one of several upgrade choices*, plus a modest service-quality condition at higher tiers. Stars once earned are permanent for construction progression; however, a separate live **Service Health** value (0–100) determines whether the room receives its full operational bonus. Thus a five-star bar stays a five-star achievement, but a broken or understaffed bar cannot print money.

This is cleaner than a star rating constantly disappearing because of one unlucky repair. It also permits permanent unlocks and preserves older saves.

### Generic star ladder (TARGET; exact requirements must be tuned)

| Department rank | Meaning | What must happen | What the player receives |
|---|---|---|---|
| 0 — Not opened | Empty location | No functioning department | Future plans only |
| ★ — Open | First functioning version | Build or install it | Basic sales/service; first tutorial |
| ★★ — Growing | Customers are using it | Moderate cumulative visits + one modest improvement | New product, service, setting or efficiency feature |
| ★★★ — Established | Locals trust the department | More visits + equipment or expansion | Specialty choices, staff role or contract type |
| ★★★★ — Destination | Visitors seek it out | Strong usage + satisfaction + advanced upgrades | High-end catalog, contracts, new narrative/regulars |
| ★★★★★ — Signature | Town-famous department | Sustained service + premium build + milestone | Signature feature, visual showcase, meaningful campaign reward |

**Anti-grind rule:** Counting lifetime visitors alone is insufficient above two stars. At higher tiers, require recent department satisfaction and actual investment. Do not allow repeated transactions by one guest to artificially inflate demand.

## 3.2 Department reward matrix

Every department receives **a new unlock or choice at every star**. The examples below are design proposals, not current items.

| Department | ★ Open | ★★ Growing | ★★★ Established | ★★★★ Destination | ★★★★★ Signature |
|---|---|---|---|---|---|
| **Lanes** | Basic open bowling | Better lane oil/cleaning schedules | Select a lane-house identity; advanced ball returns | Lane-side reservation options; event-ready equipment | Pro-caliber lane package, premium championships and display |
| **Snacks / Night Grill** | Basics, fries | Burgers, faster fryer, menu board | Cheeseburgers, improved ovens, meal combos | Catering orders, premium counter/booths | Signature menu + dedicated food event and room artwork |
| **Bar / Speakeasy** | Basic drinks | Drink selection and better storage | Bartender specializations, happy-hour scheduling | Live music partnership, VIP booths | Signature house beverage menu and premium evening bookings |
| **Arcade / Casino Lounge** | Simple games or fictional table room | Add machines or table selection | Prize/redemption upgrade **or** expanded casino floor | Tournaments, specialty nights, dedicated manager | Signature attraction and route-specific high-profile event |
| **Pro Shop / Backroom Outfitters** | Basic supplies | Ball cleaners, tape, towels, bags | Balls, shoes, fittings and professional driller | Resurfacing/repairs, pro packages | Custom high-performance fitting studio and sponsor deal |
| **Guest Comfort** | Clean restroom / initial seating | More seating and lockers | Improved accessibility and wayfinding | Family or VIP service amenities | Full comfort-service package; reduces complaint likelihood |
| **Look & Feel** | Foundational décor | Room theme and signage | Local artwork or moody noir interior set | Coordinated premium theme / lighting | A landmark visual identity and photographable showcase |

**Design note:** Bar rank rewards in the Back Alley should have distinct visuals, customers and story implications; the slot can remain `bar` internally. Arcade and Casino Lounge can share a construction grid position and high-level staffing code, while their revenue rules, catalogs, mini-games, risks and goals differ. This balances maintainability and dramatic player-facing variety.

## 3.3 Additional attractions and future expansion

Billiards, karaoke, mini golf, party room, laser tag, stage, bocce, banquet and restaurant should not each increase the maximum Alley Star score without a rebalance. Otherwise a 24-lane complex earns five stars just by owning dozens of things.

**Recommended:** Keep seven **core category ratings** (0–35) for compatibility. Optional attractions contribute to a matching department's progress (e.g., billiards/laser tag to Entertainment, restaurant to Food), unlock specialized trophies and event contracts, and can have their **own optional 0–5 local rating** without altering the original 35-point denominator. Later consider renaming departments to Food, Nightlife, Entertainment, Retail, Bowling, Comfort, Atmosphere while retaining stable internal IDs for saves.

## 3.4 Overall Alley Stars and actual venue level rewards

**Keep the v1.02 3 / 8 / 14 / 21 / 29 overall-star thresholds initially**; avoid rebalancing a working save system at the same time as adding staff and combat. Current venue levels also require lanes, visitors and reputation, and these constraints should remain until playtests show they're too restrictive.

| Alley tier | Existing identity | Proposed new moment/reward |
|---|---|---|
| 1 | Startup Lanes | Choose a recognizable personality: lean operation, family-friendly or night-market orientation |
| 2 | Neighborhood Alley | New local event type, partnerships and first memorable media coverage |
| 3 | Established Alley | Your chosen specialty matters; Vera's buyout story decision unlocks at the appropriate narrative milestone |
| 4 | Regional Destination | Regional tournament season, more sophisticated staff positions, new expansion and campaign missions |
| 5 | Bowling Landmark | A major city recognition chapter, championship infrastructure, franchise tools and late-campaign challenges |

At every venue level-up: show **one concise celebration** with (a) earned star/tier, (b) exact new things unlocked, and (c) a single Next step. No mandatory multi-screen tutorial flood.

## 3.5 Star rewards must not break the economy

- Do **not** grant ever-increasing free daily cash just because a star was reached.
- Small passive increases (e.g., 2–4% service efficiency at key milestones) must be capped and require staffing, inventory and visitors.
- First-time cash, XP or décor awards are okay but awarded **once per department-star transition**, stored in the save.
- Equipment and training should provide different advantages: kitchen equipment increases throughput/capability; trained cooks reduce waste or improve satisfaction; advertising provides demand.
- **Department screen UI:** “Food ★★☆☆☆ • 21/30 orders toward ★★★ • Need improved oven • Unlock: Meal Combos.” Let people plan without searching menus.

---

# 4. Employee progression: a workplace, not an upgrade vending machine

## 4.1 Career levels (PROPOSED)

The existing skill 1–3 is a useful base. Grow it into a visible **five-level career system**, with experience from actual work and paid training for specializations. Avoid making players manually click training every game day.

| Career level | Job title | How they advance | Benefit | Wage implication |
|---|---|---|---|---|
| 1 | Rookie | Hired | Normal throughput, occasional mistakes | Entry-level wage |
| 2 | Reliable | Work shifts + one training milestone | Fewer lost sales / faster service | Expects a modest raise |
| 3 | Specialist | Department XP + specialization choice | Better product recommendation or maintenance | Mid-career salary |
| 4 | Senior | Sustained good performance + recognition | Department support bonus / mentors new staff | Higher wage |
| 5 | Manager / Veteran | Excellent tenure and promoted responsibility | Automation, schedule planning or complex service | Premium wage plus manager duties |

**TARGET salary progression:** relative to role's starting wage, expected compensation approximately ×1.00, ×1.10, ×1.25, ×1.40, ×1.60 at career levels 1–5. These are illustrative; actual integer daily salaries and current $8–$32 limits must be rebalanced. Higher earnings should come from *more valuable work*, not just an opaque sales multiplier.

### Five employee systems, with clear purposes

1. **Work XP:** Earn from meaningful tasks performed—customers served, stock orders completed, lanes repaired—not every hour passively. Milestones cannot be bought outright.
2. **Skill level:** Changes throughput, service mistakes, repair quality or uptime, with modest capped bonuses.
3. **Morale (0–100):** Reacts to pay fairness, workload, repairs, Vera's intimidation, achievements, recognition, disagreements and events. Already exists in v1.02, so extend it rather than inventing another opaque meter.
4. **Tenure and expectations:** Experienced workers eventually ask for improved wages, training, a better schedule or a promotion. They have a reason, not just a random salary demand.
5. **Specialization:** One meaningful choice at level 3: e.g. **Fast Service** versus **High-Quality Service** for snack workers; **Repair Speed** versus **Parts Efficiency** for technicians; **Upselling** versus **VIP Hospitality** for bartenders.

## 4.2 Disgruntled workers and staff stories

A disgruntled employee should be a **story event with a cause and options**, not arbitrary punishment.

| Trigger | Character moment | Player options | Consequences |
|---|---|---|---|
| Pay below expected range after promotion | “I've been running this counter longer than the sign's worked.” | Raise salary / offer bonus / discuss later | Morale, cash, loyalty and future requests |
| Repeatedly overloaded department | Worker asks for help on Friday nights | Hire another worker / upgrade equipment / refuse | Throughput, fatigue and complaint risk |
| Skilled worker feels stagnant | Requests specialist training | Fund training / propose mentorship / decline | New specialization, goodwill or frustration |
| Successful department hits milestone | Worker wants recognition | Public praise / cash bonus / ignore | Morale, loyalty and positive story scene |
| Vera intimidation (Back Alley) | Staff member fears for safety | Improve security / protect worker / push them to stay | Security, loyalty, reputation and employee availability |
| Ethical objection to shady deals | Trusted worker challenges a choice | Be transparent / promise safety / dismiss concern | Staff trust, possible resignation or campaign complication |

**Scheduling guardrails (TARGET):** One major employee conflict per center every 7–12 game days at most; avoid stacking on the five-day *random-world-event* clock if it makes gameplay exhausting. Smaller conversations may occur more often, but important popups should queue until a natural pause/closing report. Provide an affordable non-cash resolution to most issues. Repeatedly neglected morale below ~30 can lead to resignations after warnings; no instant firing due to a single random roll.

**Visible status:** A single Staff Card shows Level, Morale, Expected Wage and Specialty, plus “Wants to talk” if an event is ready. Provide a later **General Manager** upgrade to auto-handle routine raises within a budget, scheduling and onboarding. Keep payroll predictable and show the extra cost *before* promotion.

## 4.3 Sales and productivity rules

- A staffed, stocked counter must still be required for sales. Employee level cannot fabricate customers or inventory.
- Skill level boosts **actual transactions**: reduced missed orders, faster queue handling, more chance of a relevant add-on sale; a tentative maximum +10–12% efficiency/upsell impact at top level.
- Higher wage is a real ongoing cost in the closing report; profitability depends on demand and role fit.
- Overstaffing may help during league nights and parties but can be unprofitable Monday afternoons. Shifts can be added later.
- Specialization provides more personality than generic “+3% all revenue.”

---

# 5. Bowlers: give the team a reason to exist

## 5.1 Starting with a real character, not an unexplained roster

**CURRENT:** Fresh games already include both **Maya and Leo**, but the story does not meaningfully introduce them. We should use those names rather than invent a completely unrelated starting cast.

**Recommended new-game opening:** After Grandpa Gus's Last Frame letter, introduce **Maya**—a former junior-league bowler whom Gus coached. She has kept one faded photo and comes back to help rescue the alley. She is your **first captain**, with a short introductory training challenge as soon as Lane 1 opens. **Leo** is a friendly competitor and equipment tinkerer who joins after the center proves it can stay open (an early story milestone). This is the narrative proposal; existing saves with both characters must keep both.

A good opening exchange:

> **Maya:** “Gus always said a strike is ten pins and a second chance. He never mentioned we'd have to build the lane first.”
>
> **Player:** “Can you help me bring the team back?”
>
> **Maya:** “Find me a working lane. We'll start there.”

Maya's first goal isn't Nationals. It's to get the old team photograph back on the wall, host an exhibition match and persuade the town that Gus's center deserves a second chance.

## 5.2 Bowler progression framework

| Stage | Story beat | Gameplay | Reward |
|---|---|---|---|
| Neighborhood Rookie | Maya practices on the newly installed lane | One-frame challenge; training fundamentals | Introduces bowling interaction; small XP |
| Club Regular | Leo arrives; friendly competition begins | Choose team captain, coaching plan | First personal relationship scenes |
| League Contender | Six lanes and Thursday league reopen | Bowlers develop chemistry and work with regulars | League bonuses and sponsorship interest |
| County Challenger | First meaningful external opposition | Choose tournament lineup and lane-conditioning practice | New coaches, balls and character chapters |
| Regional Prospect | Vera sponsors an opposing team | Injuries/fatigue or confidence setbacks, equipment focus | Rival-story escalation and regional recognition |
| National Finalist | The Heritage Cup approaches | Best lineup, optional bowling mini-game, strategic preparation | Major conclusion for Legacy; different significance for Back Alley |

**Player control:** Start with two core bowlers in the transition period, recruit up to four (current maximum), and later consider reserves. For tournament matches, choose which two compete rather than automatically using the best two every time; larger team competitions can arrive after a rules and UI redesign. Preserve the current tournament requirements during migration.

### Individual development

- **Current stats retained:** Aim, Spares, Power, Focus (0–95) and custom ball fitted yes/no.
- **Proposed new metadata:** Experience, Confidence, Fatigue, Team Chemistry, Loyalty, personality/traits, favorite lane condition and story chapter. These should modify play in modest, visible ways; do not force six new micromanagement chores.
- **Training plans:** Precision, Spares, Power or Mental Game. The selected plan can run automatically for a few days at a known cost; optional one-frame mini-game gives a small capped bonus.
- **Meaningful setbacks:** Losing a tournament can unlock a constructive scene or new technique rather than just another retry timer.
- **Character identity:** Maya (captain, loyal to Gus); Leo (inventor/equipment-minded); later recruits with distinct strengths and conflicts. Personal dialogue changes slightly by campaign.

## 5.3 A season, not a sequence of detached tournament buttons

Introduce a **Season Board**: practice → league matches → local qualifying → county event → regional bracket → national championship. A season has a deadline and a few decisions but **does not permanently lock players out** if they fail. Bowler fatigue, lane condition, team chemistry, sponsor commitments and optional mini-game performance influence results.

**Back Alley divergence:** Winning the championship is not the sole victory condition. Some bowlers may support your defense crew, while others refuse to be involved. Reaching the championship can still matter for legitimacy, sponsorship, leverage against Vera and town trust.

---

# 6. The Back Alley: playable crew tactics and territorial rivalry

## 6.1 Make this a separate *campaign layer*, not a separate engine

The same building simulation handles customers, rooms, staff, wages, inventory, construction and saving. The Back Alley adds a **Crew & Territory** screen, tactical encounters and darker missions. The Legacy adds deeper community campaigns, volunteers, fundraisers and tournament circuits. Different routes can exist in different towns simultaneously.

**Tone:** Adult crime drama—credible threats, crooked deals, morally difficult decisions, rough language and occasional stylized brawls. It should not feel like a family-friendly arcade with a black skin, but the fights need not be graphic. The requested GTA-style feel comes from a reactive city, risky alliances, turf, consequences and opportunities, not from teaching real-world crime techniques.

## 6.2 Bowlers can also join the crew—but should not all be forced to

Your best bowlers are already named characters. Some may choose to protect Gus's legacy physically. Each character has **two separate stat sets**:

| Bowling identity | Crew identity |
|---|---|
| Aim, Spares, Power, Focus | Grit, Reflex, Nerve, Street Savvy |
| Ball fit and tournament experience | Protective gear / support role / readiness |
| Chemistry with teammates | Loyalty to the crew / trust in the player |
| Bowling fatigue | Tactical fatigue and recovery |

**Crucial design rule:** A great bowler is not automatically a great fighter, and a quiet bowler may be exceptionally good at de-escalation or planning. Give characters the choice to refuse crew work. This leads to interesting stories and avoids turning the bowling team into interchangeable combat units.

Roles: **Anchor** (holds a position), **Runner** (mobility/objectives), **Face** (persuasion), **Technician** (sabotage detection/repair support), **Enforcer** (direct defense). Avoid making every mission solvable only by violence.

Maya could be fiercely protective of the building but dislike excessive aggression; Leo could prefer gadgets, escape plans and evidence gathering. Character loyalty and story choices determine their participation. A player who ignores a character's boundaries risks losing their confidence or, after serious warning, their involvement in the crew.

## 6.3 Turn-based confrontation mini-game (PROPOSED vertical slice)

<details>
<summary>Example encounter — Midnight at the Loading Dock</summary>

**Situation:** Vera's hired crew arrives after closing to intimidate staff and damage the power room. Your camera network warns you in advance.

**Team:** Choose three available characters (a bowler/crew member, doorman and support character). Each gets **2 action points per round** and selects among three or four obvious actions: **Move / Defend / Confront / Assist**, with a character-specific ability. The encounter lasts a maximum of 4–6 rounds on a small tile board.

**Objectives:** Protect a room, keep the crew safe, and drive away the intruders. Player can win by securing objectives, taking the opponent out of action in a stylized brawl, or persuading them to withdraw. Vera's crew uses simple threat priorities based on visible defenses and objectives.

**Consequences:** A win protects the venue and builds crew confidence. A loss can close a room, create a repair bill, increase pressure and cause recovery downtime. Nobody is permanently destroyed by a single failed fight.

**Automation:** Auto-resolve should use the **same stats, risk and reward caps** as manual play, so idle-game players aren't forced into a tactical game they dislike.
</details>

**Tactical content and presentation:** Stylized impacts, non-graphic injuries, threats, profanity and property damage fit an adult-oriented noir direction. Keep civilian guests out of tactical targets. Use clear win conditions, readable grid controls and a fast auto-resolve option. Any future formal age rating would need a separate content assessment.

**Do not allow unlimited tactical farming.** Story battles are tied to Vera's operations and district pressure, not a free-money repeat button. Player-initiated territory missions can be scheduled separately from the existing minimum five-day spacing between **random** events; make that distinction explicit.

## 6.4 Territory is more than a map with six colored squares

The city should have a handful of **recognizable districts**, each with an owner, pressure level, notable businesses/characters and a strategic resource. Vera begins with the stronger network; Gus's alley is your home base.

| District | Character | Why it matters | How it can change hands |
|---|---|---|---|
| **Old Town** | Gus's neighborhood | Community trust and recruits | Community support, defense mission |
| **Warehouse Row** | Industrial outskirts | Supplies and security contracts | Negotiation, crew mission, evidence |
| **Neon Strip** | Nightlife corridor | Casino/Speakeasy demand, contacts | Venue quality, alliances, tactical encounter |
| **West End** | Working-class rival turf | Worker loyalty and repair costs | Protect workers, contest Vera's interference |
| **Civic Center** | Officials and tournament venues | Permits, reputation, story control | Public support, influence, official event outcome |
| **The Docks** | Final Vera stronghold | Late-campaign mission and leverage | Multi-stage finale with prior objectives |

This is a **fictional map**, not an added real-world location search feature. Each district creates one or two understandable benefits, not a dozen hidden currencies.

### Simple territory loop

**Investigate** Vera's next move → **prepare** gear/security/crew → **choose an approach** (make allies / negotiate / confront) → **resolve** a short encounter → **hold** the district with modest upkeep → **respond** to Vera's counterattack.

- Control earns **Influence** or strategic discounts, but not unlimited passive cash.
- Vera can attempt to reclaim poorly defended districts. The rival action system should see territory, crew health, security coverage and player reputation.
- Districts have an **attention/Heat** cost for aggressive choices. Too much Heat prompts investigations, reduced trust and temporarily more difficult contracts.
- Peaceful alternatives should be possible at meaningful cost, but the route remains morally complicated.
- **No softlock:** Losing the last district outside the home alley is recoverable. The player may regroup, train, negotiate and try again.
- Unlock new districts through story and business milestones, not simply by spending cash.

## 6.5 Vera should feel like an adversary with a plan

**Current:** Vera already adapts some sabotage actions to security and Heat. **Next:** Give her a small strategic playbook and telegraph her intent.

- **Economy attack:** undercut an evening deal, poach a partner or cause a supplier issue.
- **Pressure attack:** intimidate employees, spread a rumor, interfere with permits.
- **Physical interference:** shut down a targeted lane or business when security is weak.
- **Territory attack:** pressure a contested district and force a defensive choice.
- **Story attack:** offer a key character a deal that tests loyalty.

The player sees clues (“StrikeCity vans were spotted near Warehouse Row”), chooses whether to invest or intervene, and experiences consequences. Vera must have **bounded resources and cooldowns**, avoid repeating one action too often and sometimes retreat when she loses. This is the difference between a rival that feels strategic and one that randomly punishes progress.

### Sample Back Alley chapter sequence (PROPOSED)

1. **The Buyout:** Vera offers a suspiciously generous deal; choose the permanent Back Alley path.
2. **Night Watch:** Recruit the first protective crew and repair a deliberate act of interference.
3. **Blood in the Ledger** *(title only; violence stays non-graphic)*: Discover missing revenue and a compromised supplier.
4. **Neon Territory:** Compete for business and allegiance on the Neon Strip; first controllable district.
5. **A Friend on Both Sides:** One familiar bowler is offered money by Vera; loyalty choices have consequences.
6. **Warehouse Rules:** Defend a supply relationship using tactics or negotiation.
7. **The City Has Eyes:** Security cameras identify a larger conspiracy, creating a branching evidence mission.
8. **The Midnight Accord:** Final multi-stage confrontation involving territory, loyal characters, venue success and Vera's leverage.

The Legacy route needs a parallel depth of character chapters (sponsorship pressure, a school fundraiser, tournament rivals, a historic preservation vote and a final Heritage Cup season). **Neither** campaign should be perceived as content-poor next to the other.

---

# 7. Mini-games: integrate them with progression, not as distractions

This section **preserves and extends** the v1.02 mini-game atlas. The first playable experiments should support the main loops rather than demand a new standalone game engine.

| Priority | Game | Campaign / location | Player interaction | Meaningful reward |
|---|---|---|---|---|
| **1** | **One-Frame Bowling Challenge** | Lanes and tournaments; both routes | Aim, power/spin and two deliveries (or simplified tap mode) | Small capped training XP, fan excitement, story practice |
| **2** | **Animated High Roller Wheel** | Back Alley Casino Lounge | Choose fictional-cash stake, watch optional animation | Risk/reward; casino venue progression; no real cash |
| **3** | **Loading-Dock Tactics** | Back Alley crew missions | Select 3 crew; 2 action points each; turn-based objectives | Protect a facility, claim/defend a first district |
| 4 | Twenty-One | Casino Lounge | Hit / stand / double (clear rules) | Optional fictional-cash activity |
| 5 | Billiards Trick Shot | Billiards room | Aim cue and power | Room XP and visitor story |
| 6 | Karaoke Encore | Bar/stage | Optional taps on beats | Event bonus and customer satisfaction |
| 7 | Mini Golf Putting | Mini golf | Direction and power | Attraction popularity |
| 8 | Pinball Bonus Round | Arcade | Flipper buttons | Small entertainment reward |
| 9 | Security planning / laser-tag variant | Night security or laser tag | Place units / protect objectives | Crew practice or attraction experience |

### Mini-game rules

- **Optional:** Let a player skip or auto-resolve every mini-game and still complete the story, with a small but fair difference in rewards for skillful play.
- **Short:** First bowling round ~30–60 seconds; first tactics encounter 2–4 minutes, with a fast auto-resolve option. Times are design targets, not measured game performance.
- **Honest RNG:** Determine money outcomes once in the game engine. Animations only visualize a recorded result. Never allow repeat taps to resolve a wager twice.
- **Economy cap:** Per-day rewards capped; no unlimited player XP or cash through leaving and reopening a mini-game.
- **Fairness:** Display casino odds, gross payout, net change and available fictional funds. Do not let betting with the operating wallet become the *required* fastest path to progression. Consider a separate recreational bankroll earned through the venue if playtesting finds bankruptcy spirals.
- **Accessibility:** Large buttons, reduced-motion/skip-animation mode, keyboard controls, non-timed alternatives, no color-only signals and readable 320px layouts.
- **Save safety:** In-progress encounter snapshots resume safely or revert to a deterministic checkpoint without awarding duplicate prizes.

---

# 8. Example playthrough: how the loops feel together

**Days 1–7 — The reopening.** Player meets Maya, gets the first lane installed, chooses a modest snack counter or bar, opens the bowling mini-game tutorial, and hires one employee. A department earns ★ when it opens; a second star arrives after actual customers and an equipment improvement. Maya has a personal reason to stay.

**Days 8–20 — The growing pains.** The snack worker becomes Reliable and asks for a raise; the player can grant it or invest in equipment that makes work easier. Leo's first personal story arrives. Training and the first local competition become interesting rather than purely numeric.

**Early established era — A fork in the road.** Vera presents the buyout offer. A Legacy player deepens community partnerships and prepares for County/Regional seasons. A Back Alley player hires a night doorman, grows the Casino Lounge and begins defending the alley against targeted trouble.

**Midgame — The unique campaign systems mature.** Legacy earns district support through partnerships, charity events and tournament seasons; Back Alley enters its first optional tactical encounter on the Neon Strip and builds a loyal crew. Employee management remains important in *both* stories.

**Late game — Two credible endings.** Legacy earns a landmark designation by combining bowling excellence, customer trust and a national victory. Back Alley defends key districts, keeps the core business solvent and resolves Vera's leverage through a multi-stage finale. A second town can choose the other path.

---

# 9. Recommended implementation order: v1.03 vertical slice, then expansions

**Don't attempt every proposal in one release.** The risk is destabilizing the already complicated save/economy system.

| Priority | Proposed release | Deliverable | Why this first |
|---|---|---|---|
| **P0** | **v1.03** | Rewards for Department Stars (start with Lanes and Food), milestone tracking, clear “next unlock” UI | Makes existing investment feel worthwhile |
| **P0** | **v1.03** | Employee XP/level 1–5 prototype, expected wages and one disgruntled event chain | Adds recurring management decisions |
| **P0** | **v1.03** | Maya's introduction and first character chapter; preserve Leo on migrated saves | Gives the bowling team an emotional beginning |
| **P0** | **v1.03** | One-frame bowling mini-game in a short interactive demo, with a skip/auto option | Proves touch interaction and optional rewards |
| **P1** | **v1.03 if stable** | Back Alley tactical prototype: one fixed 3-character fight/defense encounter and one test district | Validates the new campaign identity before building an entire city |
| P1 | v1.04 | Department rewards for all seven areas, employee specialties, morale event pool, team relationships | Fills in progression breadth |
| P1 | v1.04–1.05 | Multi-district territory map, reactive Vera objectives, larger crew roster, campaign-specific content | Builds strategic depth after a prototype is fun |
| P2 | Future | Career scheduling, union/worker stories, full tournament seasons, advanced facilities and additional mini-games | High design/testing cost; not essential to first proof |

**Suggested separate development-test presets:** `Department Star Testing`, `Employee Career & Conflict`, `Maya/Leo Team Story`, `Back Alley: First Tactical Encounter`, and `Back Alley: First Territory`. Keep their saves local-only and ensure Exit Preview returns to the genuine save, as in v1.02.

---

# 10. Architecture and migration guardrails

**Save state, each town:**

```
center.departmentProgress = {
  lanes: { highestStar: 1, rewardsGranted: [1], usageMilestones: {...} },
  snack: { highestStar: 2, rewardsGranted: [1,2], usageMilestones: {...} }
}
center.employees[] = {
  id, role, wage, morale, skill, careerXP, careerLevel,
  specialty, tenureDays, expectedWage, conflictCooldownDay, loyalty
}
center.bowlers[] = {
  id, aim, spare, power, focus, ball,
  bowlerXP, confidence, fatigue, loyalty, storyFlags,
  crewEligible, crewRole, crewStats, tacticalFatigue
}
center.campaignStory.backAlley = {
  districts: {...}, crew: [...], veraPlan: {...},
  conflictHistory: [...], pendingBattle: null
}
```

These are **illustrative target fields**, not current v1.02 keys. Do not replace existing `employees.skill`, `employees.morale`, `bowlers.*`, `portfolio` or `campaignStory.path` abruptly. Add defaults for older saves, keep department star awards idempotent and separate long-term star achievement from real-time Service Health.

**Further guardrails:**

- No global stat leak: one town's crew, events, finances and campaign do not change the other town unless a specifically designed transfer action exists.
- No fraudulent cloud grants: server-side purchase verification remains necessary before any future real-money cosmetic items; **do not** couple fictional casino wagers to money that can be purchased or cashed out.
- No infinite rewarding from reloading, save migration, mini-game animation replay, star recalculation, advancing hours, or switching towns.
- Test offline/save conflict handling, Firebase reset and browser restore on actual iPhones separately; a design document does not establish platform compatibility.
- Visually separate **Alley Stars**, **Department Stars**, **Service Health**, **Employee Levels**, **Bowler Skills**, **Crew Readiness** and **District Control** with simple labels. Never show seven progress bars on the main alley map.

---

# 11. QA acceptance criteria and balance targets

1. **Department stars:** A freshly built department gets ★; serving customers and investing produces ★★; overstocking/understaffing cannot generate fictitious progress; awards fire once and never duplicate after reload.
2. **Venue progression:** Existing saves retain their recorded venue milestones; total department contribution remains 0–35; new optional attractions do not inflate the denominator.
3. **Staff:** A trained worker really completes more profitable work; the payroll increase remains visible; repeated morale incidents respect cooldowns; there is always a reasonable recovery from low morale.
4. **People:** Maya receives a narrative introduction on new games; existing saves with Maya and Leo don't lose either; tournament qualification and stat training continue to work.
5. **Crew:** A crew battle has clear win/loss effects, tactical decisions, and an auto-resolve option. An injured/fatigued bowler cannot instantly work every role at no cost.
6. **Vera:** Counterattacks are tied to visible player strengths, vulnerabilities and territory. Defending a district changes outcomes. Existing random event minimum spacing stays five game days.
7. **Territory:** A losing player can rebuild; district bonuses are bounded; the map is usable by touch; a second town retains a different route independently.
8. **Mini-games:** Controls fit 320px mobile, function on desktop and can pause. Repeating or interrupting animations never creates free money.
9. **Economy:** Compare starting, six-lane and 24-lane centers, with and without employee training; compare Legacy and Back Alley cashflow; prohibit mandatory casino wagering to fund core repairs.
10. **Tone:** Legacy keeps humor and warmth. Back Alley has adult/noir dialogue, suspense and stylized fighting without graphic gore; platform age ratings remain to be determined after content review.

**Suggested analytics for playtests:** days to second Department Star; average payroll share of sales; service missed-order rates; frequency of staff conflicts; recruitment and tournament win rate; tactical win rate by difficulty; district recovery time; random-event intervals; first 10 days when players abandon a session. Record these in QA logs without collecting personal account data.

---

# 12. Decision board — recommendations, not commitments

| Question | My recommended default | Alternate worth testing |
|---|---|---|
| Are stars permanent? | Yes: permanent achievement + live Service Health | Stars decay if standards collapse (risk: frustrating) |
| What do stars unlock? | New products/services and specific equipment with minor capped bonuses | Pure passive cash bonus (not recommended) |
| Employee growth | Work XP + training + specialization; wages rise reasonably | Training purchases only (too shallow) |
| Employee complaints | Cause-based stories with responses and cooldowns | Unpredictable resignations (too punitive) |
| Starting bowler story | Maya is Gus's old pupil and first captain; Leo joins through story on new saves | Offer a starter captain choice between Maya and Leo |
| Who fights for Back Alley? | Voluntary mix of bowlers, door staff and named locals, with separate tactical stats | Every bowler fights by default (weakens character identity) |
| How do territories change hands? | Negotiation, business influence **or** short tactical encounters | Combat-only conquest (too repetitive) |
| Manual fighting required? | No; auto-resolve remains fair and available | Mandatory fights (clashes with idle hybrid) |
| First playable v1.03 focus | Department rewards, employee careers, Maya arc, one-frame bowling and one tactical prototype | Full city conquest and all mini-games at once (high risk) |

## Final design recommendation

**The alley is your kingdom, the employees are its heartbeat, the bowlers are its heroes, and the rival campaign is its conflict.** Let the player choose where to spend time: renovating, mentoring people, winning tournaments, or—in The Back Alley—contesting turf and protecting the crew. All of those choices should feed a shared sense of progress, but they should not collapse into one generic star meter.

**Next action:** review the decision board, choose which v1.03 vertical slice feels most compelling, and playtest it before increasing the content breadth. This document is the expanded planning foundation, **not a claim that these systems are already in the game**.
