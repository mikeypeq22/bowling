# From Gutter to Glory
## Bowling Industry Research & Possibilities Atlas
**Research baseline:** October 25, 2026  
**Status:** Pre-v0.93 exploration — no features approved by this report  
**Purpose:** Record the widest useful set of real-world bowling practices and possible mechanics, so the project can choose later instead of forgetting ideas.

> **Read this first.** Entries marked **REAL** describe documented bowling practices/products; **DESIGN** is a proposed translation into the game, not a claim about the industry; **VERIFY** flags a factual, licensing, legal, or numerical detail that needs confirmation before implementation. Source IDs [S01]–[S39] link to the reference register at the end. Vendor descriptions establish that a capability exists, not independent proof of its sales impact. This is a research/idea catalog, not a business plan or cost quotation.

# 1. Executive findings

1. **Two different questions define an alley.** One is *venue identity* (traditional league center, boutique lounge, family entertainment center, tournament venue, etc.). The other is *bowling discipline/equipment* (tenpin, duckpin, candlepin, five-pin, ninepin, mini bowling; free-fall or certified string pinsetters). The game can support both dimensions independently. [S01][S02][S03][S04]
2. **A real center is a system of linked businesses.** Separate revenue lines include open bowling, leagues, tournaments, parties, shoe rental, locker rental, food, alcoholic beverages, arcade, pro shop, and other entertainment. [S05]
3. **Pro shops are retail stores AND specialist workshops.** They sell balls, bags, shoes, cleaners and accessories, but also measure, fit, drill, install inserts, plug holes, repair, clean, polish, detox and resurface balls. The drilling machines are shop equipment, not normally an item sold to visiting bowlers. [S06][S07][S08][S09]
4. **Competitive bowling can support years of gameplay.** Scratch vs handicap; singles, doubles, trios and teams; all-events; Baker and Scotch Doubles; no-tap, 3-6-9, best-ball, headpin and sport-pattern competitions; leagues, qualifying rounds, brackets, match play, stepladders and finals. [S10][S11][S12][S13]
5. **Lane maintenance is more complex than one repair number.** Lane surface, pinsetter, ball return, scoring, electronics, cleanliness and lane conditions are separate concerns. For a fun game, separate *daily service* from *unexpected faults*, and automate routine work as the business scales. [S14][S15][S16]
6. **Customer stories can connect all systems.** A league bowler may need a new thumb insert, buy fries, complain about a malfunctioning ball return, enter the league, and return next week; a birthday family may need bumpers, pizza, an arcade, and a party room. This is a **DESIGN** opportunity: the same visitor creates linked events rather than independent counters.
7. **Similar games are useful for distinct reasons.** Bowling Alley Simulator tests deep operational simulation; Lane Legends tests readable idle progression and colorful regulars; Arcade Paradise tests collectible and playable machines; Kairosoft's sports-management model tests athlete/facility development. None alone is the full target for this project. [S17][S18][S19][S20]
8. **Most promising identity:** A characterful *hybrid* of a readable idle/building game and an authentic bowling-center simulator, with optional depth rather than compulsory chores. This is a **DESIGN** conclusion, not market validation.

# 2. Two axes: venue business models versus bowling disciplines

## 2.1 Venue/business models (REAL)

| Venue | What distinguishes it | Distinct game opportunities |
|---|---|---|
| Traditional neighborhood center | Tenpin lanes, regulars, leagues, modest grill/bar/pro shop | Reputation in town; loyal regulars; predictable weekly income; lane repairs |
| Competitive league center | Multiple lanes and dedicated league schedule | Average tracking, standings, handicap, player relationships, lane allocation |
| Tournament / championship center | Consistent equipment, scheduling, staff, practice facilities | Host bids, certification, sponsors, oil-condition options, spectators, finals |
| Family entertainment center (FEC) | Bowling plus arcade, laser tag, mini golf, parties, etc. | Young families, party bookings, cross-selling attractions, capacity conflicts |
| Boutique bowling lounge | Premium design, hospitality, cocktails, groups/social nights | Decor rating, service speed, VIP lanes, music, ambiance |
| Hybrid bowling destination | Traditional bowling plus elevated dining / attractions | Branching investment strategies; appeal to both league and casual bowlers |
| Social/mini/duckpin venue | Small-format, accessible social activity often attached to dining | Tiny-footprint layouts, short sessions, walk-in social groups |
| Private/resort/hotel lanes | Small lane count embedded in another operation | Exclusive bookings, suites, premium clients; not necessarily a standalone center |
| Training academy / youth-development center | Coaches, drills, practice and athlete development | Skill trees, school programs, clinics, scholarship events |
| Retro/heritage center | Nostalgic identity, traditional equipment and decor | Preservation vs modernization, vintage furniture, events and storytelling |
| Mobile/pop-up concept | Portable or temporary social bowling setup | **DESIGN** only: festivals, charity nights, marketing; feasibility varies |

US Bowling and Brunswick independently describe traditional, boutique, family-entertainment and hybrid market categories. The academy, heritage and mobile game branches are plausible extensions, not a universal industry classification. [S01][S02][S03]

## 2.2 Bowling disciplines and formats (REAL)

| Format | How it differs | Game implications | Caveat |
|---|---|---|---|
| Tenpin | Ten full-size pins; familiar two-ball frames | Default scoring, mainstream leagues and pro shop equipment | Certification and rule requirements matter in real tournaments |
| Standard/regulation duckpin | Ten squat pins; small balls, three rolls per frame | Different scoring model, distinct regulars/equipment | Do not conflate with all commercial *mini duckpin* systems |
| Candlepin | Tall narrow pins, small balls; three balls per frame; distinctive deadwood rules | Regional specialist venue; challenging spares and identity | See ICBA rulebook [S21] |
| Canadian five-pin | Five pins with unequal values 2-3-5-3-2 and three deliveries/frame | New scoring strategy, Canadian regional expansion | Requires separate scoring implementation [S22] |
| Ninepin / Kegeln | European club and sport traditions; nine pins | Continental branch, club competition and dedicated venue | Rules and playing structures vary by discipline/region [S23] |
| Mini bowling / rollerball | Scaled-down footprint, shorter lanes, lighter equipment | Secondary attraction for an FEC or boutique bar | Often recreational, not a tenpin-certified lane [S03] |
| Tenpin with free-fall pinsetters | Pins fall freely; conventional machinery | Authentic competition and machinery-maintenance path | More moving parts in some machine designs |
| Tenpin with certified string pinsetters | Pins connected to strings, subject to approved specifications | Cost/maintenance tradeoffs; certified competitions | USBC treats certified string equipment under its own framework [S24] |
| Wood versus synthetic lane surface | Different installation and maintenance characteristics | Heritage/restoration vs newer surface upgrades | Neither should be an automatic “bad lane” label [S15] |
| Bumper / assisted bowling | Rails/ramps make participation easier | Inclusivity, children's parties, accessibility ratings | Not interchangeable with regulation competition |

**Critical distinction:** A candlepin alley is not simply a tenpin center with smaller graphics: balls, pins, rules, expectations and customer cultures change. Supporting each as a full playable scoring simulation is a major separate project.

## 2.3 Venue progression should branch (DESIGN)

Instead of Dirt → Neighborhood → Regional → Bigger Regional → Best Alley, consider: **Start Up → Established Alley → Choose specialties**.

Possible specializations (NOT mutually exclusive): Family Fun; League House; Pro Training; Party Headquarters; Boutique & Bar; Arcade Empire; Tournament Host; Historic Heritage; Duckpin Side Wing. A player may invest in several while building a distinctive identity. *Reputation*, *physical capacity* and *service quality* should be separate from a single numerical building level.

# 3. Physical building and spatial systems

## 3.1 Bowling lane zone (REAL)

- Approach, foul line and detection; lane surface and gutters; pin deck, pins, pinsetting mechanism; ball return and racks; scoring equipment, overhead displays, lane-control desk; seating and tables; bumper rails and assistive ramps. [S14][S15][S16]
- Lanes may be booked by game or hour; single lane or lane pairs; group sizes and bowling duration vary. Reservations and leagues change available public capacity. [S25]
- Lane condition can be recreational house, Challenge or Sport. USBC identifies house oil patterns as more forgiving and Sport patterns as demanding more precision. [S26]
- Decoration layers can differ by lane or lane pair: screens, masking units, carpets, lighting, colored returns, seating, lane effects. Supplier scoring systems also offer game modes beyond standard scoring. [S15][S27]

**DESIGN options:** lane ID, condition percentage, down-for-service timer, pinsetter quality, house-ball availability, scoring software version, bumper toggle, theme, target audience, per-lane revenue, reservations, assigned party, league restriction, special condition, video replay. **Keep the center’s physical grid readable on mobile.**

## 3.2 Guest areas (REAL and DESIGN inventory)

- Entrance, exterior sign, sidewalk, parking, doors, lobby and welcome mat.
- Reception/front desk, payments, reservations, shoe rental, return chute, size racks, receipts and lost-and-found.
- Waiting benches, booths, lounge couches, tables, water station, vending and self-service kiosks.
- Food counter, prep kitchen, fryers, refrigerators/freezers, sinks, cold-storage shelving, ovens, food pickup, laneside ordering.
- Bar counter, taps, wine storage, cold storage, mixing station, tables and seating, nonalcoholic drinks.
- Arcade machine grid, ticket/redemption counter, prize shelves, change/card kiosk, repair corner.
- Pro shop retail wall, ball displays, bag/shoe shelves, sizing and measuring desk, technician workbench, drilling zone, repair machines.
- Party rooms, private/VIP lanes, banquet room, event stage, DJ booth, photo wall.
- Restrooms, accessible restrooms, baby changing station, janitorial closet, utility room, employee lounge, office, break room, lockers.
- Behind-the-scenes equipment room, storage, electrical, HVAC, cleaning equipment, delivery entrance, trash/recycling.
- Extras: billiards, darts, karaoke, laser tag, mini golf, bocce, ping-pong, outdoor games, bowling museum, trophy case, training/video room. [S01][S02][S04][S05][S28]

**DESIGN:** Zone-based grid (lanes, shops, staff/service rooms, decorative wall items); each has a footprint and path to the front desk, but avoid creating a traffic-control puzzle unless that proves fun. Furniture can be decorative, capacity-enhancing or functional; label which.

# 4. Pro shop encyclopedia: what to stock and what to do

## 4.1 Retail — what customers buy (REAL)

| Category | Stock/variants | Possible demand driver |
|---|---|---|
| Bowling balls | Plastic/polyester spare balls; urethane; reactive-resin solid, pearl and hybrid; different weights, colors, core shapes, price tiers | Casual vs competitive ability; lane conditions; personalized arsenal |
| Bowling shoes | Basic shoes; performance shoes; right/left-handed options; interchangeable slide soles/heels | Rentals convert to ownership; serious league bowlers return |
| Bowling bags | Single-ball tote; 2-ball roller; 3-ball roller; accessory pouch; 4+ tournament carriers | Number of owned balls, tournament travel |
| Towels & shammies | Microfiber towels, leather/shammy pads, see-saws | Every serious bowler cleans oil from balls |
| Ball cleaning products | Approved cleaners, foam/wipes, polish, pads | Ball use, lane conditions, shop services |
| Grip consumables | Finger/thumb tape, skin-protection tape, rosin/grip sacks, powders | Fit and hand condition |
| Inserts and custom grips | Finger grips, thumb slugs, interchangeable thumb components | Fit/personalization; technicians install some |
| Support & protection | Wrist braces, gloves, elbow/knee supports, shoe covers | Comfort/technique/individual choice |
| Shoe parts | Replacement slide soles, heels, guards, laces | Performance shoe ownership |
| Small accessories | Ball cups, ball carriers, ball stands, accessory cases | Convenience/merchandise |
| Clothing | Bowling jerseys, team shirts, polos, hats, hoodies, custom embroidered/sublimated apparel | League identity; team sponsorship |
| Gifts & collectibles | Gift cards, mini pins, souvenirs, bowling-themed gifts | Family visitors, parties and holiday purchases |
| Refurbished goods | Reconditioned used balls, clearance bags, beginner starter bundles | Cost-conscious newcomers |

Ball coverstock families, symmetry and various performance tiers are real; whether a particular ball is tournament-legal can depend on organization and event rules. Product categories are verified by major retailer and manufacturer catalogs. [S07][S08][S09][S29][S30][S31]

## 4.2 Pro shop services — specialist workshop (REAL)

1. Ball fitting: hand size, span, finger/thumb pitch and position, conventional vs fingertip fit.
2. Drill new ball for customer; drill to match bowling style and equipment choice.
3. Replace inserts, thumb slug or interchangeable thumb system.
4. Plug holes, redrill, enlarge/rescale holes, repair minor damage subject to suitability.
5. Surface alteration: sanding, polishing, changing grit, resurfacing.
6. Oil extraction or deep “detox” treatments; cleaning and conditioning.
7. Assess ball motion, axis/positive-axis-point (PAP) and other measurements.
8. Sell special orders, fit-and-drill packages, maintenance subscriptions.
9. Offer beginner equipment consultations, lane-condition recommendations, coaching referrals.
10. Offer gift-card or league-member discounts. [S06][S07][S08]

## 4.3 Workshop tools/equipment — the shop owns these (REAL)

**Yes, drilling equipment belongs in the pro shop.** A specialist may need a ball-drilling machine or drill press/jig; clamps; drill bits; measuring/pitch gauges; rulers/calipers; layout tools; balancing tools; sanders, resurfacing spinner, sanding pads and polishers; oil-extraction/revivor unit; plug resin and dams; glue/epoxy; grip insert/removal tools; interchangeable-grip kits; proper dust collection, protective equipment and training. [S08][S09]

**DESIGN service upgrade path:** Shelf of accessories → fitting bench → drilling station → cleaning/resurfacing → repair and customization → master technician / coaching suite. Equipment is a *shop capital expense*; grips, polishing pads, cleaner and plug material are *consumables*; drilling is a *customer service with labor and delivery time*. Do not sell “drill machines” as if all ordinary bowlers buy them.

## 4.4 Game-worthy pro shop mechanics (DESIGN)

- Inventory tracks retail SKUs in groups (not hundreds of individual brands at first).
- Fitting skill increases satisfaction and player accuracy more than expensive equipment alone.
- A ball may have fit, weight, grip, coverstock, surface and age/condition variables; present 2–3 visible choices to novices.
- A league bowler may request regripping or resurfacing before Thursday night.
- Pro shop staff get a separate technician skill and appointment queue.
- A popular bowlers’ “ball arsenal” includes spare ball and strike ball, not one endlessly upgraded ball.
- The shop can be owner-operated, employee-operated or independently leased; these are distinct business models.
- Used gear trade-in and “starter kits” can serve early-game customers.
- Special event: drilling mistake; rush turnaround; ball return damages a customer's ball; tournament equipment legality audit.

# 5. Competitions, leagues, events and progression

## 5.1 Actual contest/scoring structures (REAL)

| Format | Mechanic | Why it matters in game |
|---|---|---|
| Scratch | Actual pinfall only; no handicap | Strong bowlers dominate; elite challenge |
| Handicap | Added pins based on established average and chosen formula | Fairer social leagues; mixed skill groups |
| Singles | Individual score | Intro tournaments, player ranking |
| Doubles | Two bowlers as a team | Friend chemistry and alternate-skill teams |
| Trios / 4-player / 5-player team | Combined team scores | Team management and scheduling |
| All-events | Aggregate across multiple tournament disciplines | Long-term consistency / prestige |
| Baker | Teammates alternate frames in one shared game | Player order and teamwork matter |
| Scotch Doubles | Partners alternate individual deliveries or lead-off under defined variant | Pairing compatibility matters |
| No-tap | Certain near-strikes score as strikes | Accessible/fun events; more high scores |
| 3-6-9 | Free strikes in predetermined frames | Quirky casual event |
| Best ball | Choose best applicable result per frame | Fast-paced alternative event |
| Headpin challenge | Must hit/knock down headpin to score | Precision-oriented competition |
| Sport / Challenge condition | Harder/different lane pattern | Unlock elite competitions and specialist coaching |
| Brackets / elimination | Advance by beating opponents | Drama and broadcast-style milestones |
| Match play | Head-to-head matches, often after qualifying | Rival narratives |
| Stepladder final | Seeded matches with progressive advancement | Climactic final rounds |
| Pro-am | Amateurs paired with skilled/pro bowlers | Special promotional event |
| Virtual/cross-center tournament | Different venues submit real league scores | Asynchronous competition, low-capacity tournament |

These are documented formats, but their exact legality, scoring and restrictions vary by sanction and event. For example, a USBC-certified Junior Gold qualifier cannot simply substitute a fun no-tap event for a qualifying scratch event. [S10][S11][S12][S13][S32]

## 5.2 Competition scale ladder (DESIGN)

- Community: first strike, highest weekly game, best new bowler, family night score challenge.
- Local: singles bracket, 9-pin no-tap party tournament, Wednesday doubles, charity bowl-a-thon.
- Alley league: 5–15 week short-season fun league or 16–36 week traditional league; weekly tables, awards and payouts. Those ranges are examples from an operator's current league FAQ, not required lengths. [S25]
- County/city: team championship, high-average competition, youth/family event.
- Regional: qualifying, multiple squads, spectator setup, sponsor banners and prize fund.
- State/national fantasy-inspired: senior, youth, collegiate, women's, open/mixed, high-performance, pro-am, long-form championship.
- World/international: unlock distinct disciplines, specialist bowlers and venues.
- Showcase: broadcast lights, commentary, live crowd, televised-style stepladder, celebrity exhibition.

**Important:** We can *take inspiration* from USBC/PBA structures but should not imply the fictional game awards officially sanctioned titles or use protected competition marks/logos without permission.

## 5.3 What tournament hosting requires (REAL + DESIGN)

A tournament involves rules, eligibility, entry fees, lanes/squad schedules, staff, lane conditions, entry averages and possible handicaps, standings, prize fund, sponsors, promotion and dispute handling. In game terms: tournament quality = prepared lanes + score system + staffing + guest amenities + reputation, rather than “pay entry fee, roll dice.” [S10][S13]

**DESIGN options:** lane bookings may displace walk-ins; extra fans buy concessions; player team needs rest, coaching and ball service; prize payouts versus event profit must be distinct; reputation can rise even when the house team loses if the event is well run.

# 6. Bowling development, equipment and training

## 6.1 Bowler attributes (DESIGN translation of REAL concepts)

- Fundamental skills: accuracy, spare conversion, consistency, release/control, approach timing, ball speed and revs, lane reading, shot adjustment, mental composure, fatigue control.
- Equipment fit: ball weight suitability, custom grip, surface/coverstock compatibility, shoes, training aids.
- Styles: straight bowler, stroker, tweener, cranker, two-handed, power player, precision spare specialist; bowling terminology is documented by equipment manufacturers. [S29]
- Context: house condition versus sport condition, busy conditions/oil transition, crowd pressure, tournament fatigue, travel, team morale.
- Coach training: introductory through USBC Level I, Bronze, Silver and Gold are real coaching education levels; game could fictionalize proficiency tiers. [S33]

**DESIGN:** Skill should improve on a decelerating curve; coaching and practice give specific boosts, equipment adds small compatibility bonuses; no single purchasable ball should make a novice professional overnight. Record last games, personal best, average, spare %, strike %, equipment, confidence, fitness and relationships. Optional manual minigame can give a modest result modifier without being mandatory.

## 6.2 Player identity and long arcs (DESIGN)

- Customer → regular → league bowler → house team → regional athlete → mentor/pro coach.
- Young beginner, adult casual, senior veteran, ambitious student, returning champion, left-handed specialist, two-handed rookie, disabled participant with adapted technique, social bowler who never competes.
- Rivalries, friendships, mentor pairings, family members, coaching philosophies, slump and rebound, favorite lane, preferred snack, unlucky ball, trophy shelf, retirement, returning alumni.
- Player's own character can choose Owner / Coach / Bowler / Promoter paths that change decision opportunities (without locking people out of the whole game).

# 7. Food, bar, arcade and entertainment

## 7.1 Snack and restaurant categories (REAL)

- Quick drinks: fountain soda, bottled water, lemonade, iced tea, coffee, hot chocolate, slushies.
- Simple snacks: popcorn, chips, candy, pretzels, nachos, peanuts, cookies, ice cream.
- Fried appetizers: fries, loaded fries, tots, onion rings, mozzarella sticks, cheese curds, fried pickles, jalapeño poppers, wings, tenders.
- Mains: hot dogs, corn dogs, pizza (cheese/pepperoni/specialty), hamburger, cheeseburger, chicken sandwich, veggie burger, wraps, salads, tacos.
- Family/bundle: combo meals, pitcher + pizza, party platter, kid's menu, birthday cake package.
- Higher-end restaurant branch: flatbreads, artisan pizza, gourmet burgers, specialty sandwiches, desserts, made-to-order bowls.
- Ingredient/operations categories: frozen goods, bread, fresh vegetables, dairy, oil, sauces, condiments, cups/napkins/boxes, cold-storage space, cook time and prep labor. Examples from operating bowling center menus substantiate the category range, not a required menu. [S34][S35]

**Pre-bookmarked v0.93:** Add fries, hamburger and cheeseburger as distinct menu lines with demand, storage, prices and next-day delivery. **DESIGN:** avoid separate hand-ordering of salt and every topping at first. Later, a “kitchen complexity” option can expose deeper ingredient handling for players who want it.

## 7.2 Bar and beverage branches (REAL and DESIGN)

- Beer/wine; bottled and draft choices; soft drinks and zero-proof cocktails; mixed cocktails and signature house drinks.
- Potential modules: taps, glassware, refrigeration, ice, mixers, bar stools, lounge tables, menu design, bartender skills, stockroom.
- Drink sales may correlate with adults' social visits, parties and premium/lounge identity. **DESIGN:** unlock new recipes from customer demand and bartender skill, not only building level.
- **VERIFY/regulatory:** age checks, alcohol licensing, staff training, local laws and responsible service. We should not turn unsafe service into a rewarding mechanic.

## 7.3 Arcade and side-attraction catalog (REAL examples + DESIGN)

- Arcade: pinball, claw/crane, classic fixed shooter or space-themed cabinet, rhythm/dance game, driving/racing, air hockey, basketball toss, skee-ball, redemption ticket machines, prize wheel, VR cabinet.
- Games/activities: darts, billiards, shuffleboard, ping-pong, karaoke, mini golf, laser tag, escape-room style attraction, bocce, cornhole, lounge live music.
- Revenue models: coin play, stored-value card, timed session, prize redemption, party bundles, machine lease/rental, maintenance and prizes. Real center suppliers explicitly support arcade plus bowling and other attractions. [S01][S02][S04]
- **DESIGN:** Arcade machines have *attractiveness, earnings, reliability and novelty*. Players buy machines, rearrange them, set ticket cost, restock prizes and optionally play tiny minigames, but automate the arcade when busy.

# 8. Real operational management and customer systems

## 8.1 Customer segments (REAL audience, DESIGN behavior)

| Segment | What they seek | In-game consequences |
|---|---|---|
| Walk-in casual friends | Immediate lane, reasonable price, fun | Wait tolerance low, food upsell moderate |
| Families with children | Bumpers, ramps, simple food, safe seating | Higher amenity expectations; party bookings |
| Birthday groups | Coordinated booking, food and arcade | Larger revenue, larger capacity conflict |
| Weekly league players | Reliable lane conditions, starts on time, equipment service | Recurring income, stronger loyalty |
| Competitive tournament bowlers | Fair conditions, specialist pro shop, timely scoring | High expectations, potential prestige |
| Teen arcade visitors | Accessible machines, snacks, social space | Can visit without bowling |
| Bar-only / dining guests | Social experience, seats, prompt service | Can visit without bowling |
| Corporate event guests | Booking, food/drink package, private space | Large future reservation |
| Seniors / accessible-bowling participants | Comfortable seating, ramps, accessibility | Inclusivity and long-term loyalty |
| Visitors & tourists | Themed experience, convenient booking | Seasonal spikes and reviews |

## 8.2 Realistic customer journey (DESIGN)

Arrival → choose reason for visit → check lane/room availability → wait or take alternative activity → seat / start bowling or visit bar/snacks → optional extra purchases → pay / leave → log satisfaction plus a memorable quote → decide return probability. Route avatars to the *actual assigned coordinates* of every moveable room or lane; use a per-group event trail rather than random decorative people.

**Proposed happiness formula (DESIGN, not research):** Keep overall reputation/happiness from 0–100, begin at 65 or 70; each group has a 0–100 experience score; after closing, change center happiness by a *small bounded amount* from the mean of that day's groups, weighted by participation and recency. Your earlier +3 satisfied/–2 unhappy is a possible simple point ledger, but raw additive totals will hit 100 too quickly as volume grows. Compare additive, weighted-average and rolling-7-day methods through simulation before choosing. Track categories: bowling availability, waiting, food, staff, pricing, cleanliness, amenities and fun. Show a headline score and a drill-down so it is actionable, not punitive.

**Comedic quotes (DESIGN):** “I came here to throw strikes, not spend my retirement in line.”; “The fries were worth a spare.”; “This ball return is taking a personal day.”; “I was promised a birthday party, not a dissertation on lane maintenance.” Tone should stay playful, never cruel to guests or staff.

## 8.3 Revenue and expenses (REAL)

**Revenue:** lane games/hour rentals, shoes, leagues and lineage, tournaments, event bookings, party packages, food, beverages, bar, arcade, pro shop retail/services, lockers, gift cards, sponsorships, loyalty subscriptions, other amusements. [S05]

**Costs:** rent/lease, construction, lane/equipment leases, wages and training, cleaning/service parts, pinsetters/ball returns/electronics, inventory and delivery, utilities and HVAC, advertising, insurance, licenses, IT and payment costs, events/prizes and refunds. Financial examples should stay *game balance figures*, not falsely labeled as industry average costs.

**DESIGN metrics:** group arrivals, guests served, lane utilization, wait abandon rate, staff coverage, lost-sales reasons, item stockouts, food/drink attach rate, repeat visits, customer happiness, league utilization, maintenance backlog, net profit, cash runway, forecast reservations. Put details in Front Desk and Closing Report, not permanent screen clutter.

## 8.4 Maintenance schedule and choices (REAL + DESIGN)

- Per opening: visual lane/approach inspection, ball returns/pinsetters/scoring, cleanliness, restrooms and safety checks.
- During operation: jam handling, lane service, refunds/reassignments, cleanup and spill response.
- Weekly: pinsetter and ball return checks, parts and rental equipment, scoring/lighting, selected deeper servicing.
- Periodic: planned machine servicing, lane condition equipment checks, building/HVAC and safety review. Follow equipment-specific manufacturer manuals for any real-world procedures. [S14][S16]
- **DESIGN:** maintenance per lane has wear and risk; auto-maintenance tech handles ordinary service; rare faults trigger decisions; a long-term maintenance plan reduces random disruptions. Wood/synthetic lanes or certified string/free-fall systems can adjust service mix, but no universal invented maintenance percentages.

## 8.5 Staffing structure (REAL job families + DESIGN)

General manager, assistant manager, desk attendant, lane attendant, mechanic/technician, porter/cleaner, snack cook, kitchen lead, bartender/server, arcade attendant/prize clerk, pro shop operator/ball driller, coach, tournament coordinator, events/party host, stock clerk, bookkeeper/marketing coordinator.

**DESIGN:** start with a few cross-trained employees, then specialist roles; talent rating + training + wages + happiness + workload + schedule. **Anti-chore rule:** one staffing dashboard with vacancies and simple auto-assign, not one pop-up per employee per hour. Specialty staff unlock richer services instead of arbitrary passive percentage boosts.

# 9. What comparable games suggest

| Game/source | Documented strengths | Lesson for our game | Risk of copying |
|---|---|---|---|
| Bowling Alley Simulator (2026) | 3D first-person operations, lanes, food, staffing, growth; later added cabinets/decor | A comprehensive bowling-center fantasy is possible | Don't imitate their exact UI, art, feature presentation or assets [S17] |
| Lane Legends: Idle Bowling | Lanes, pinsetters, quirky characters, boosted activities, themed worlds, offline accumulation | Clear upgrades and recognizable regulars create readable idle appeal | Avoid unwanted idle pressure or monetization mechanics [S18] |
| Arcade Paradise | Make a rundown business prosper through individually playable arcade machines | Optional playable arcade machines can make purchases feel substantial | Full suite of minigames is high effort [S19] |
| Pocket League Story (Kairosoft) | Facilities affect athlete training, money, ranking, team recruitment | Connect building upgrades directly to bowler arcs and sponsor/reputation systems | Training UX must remain simple on a phone [S20] |
| Brunswick Sync scoring games | Alternative bowling games, 3-6-9, no-tap and themed scoring | Different score rules add variety without inventing entirely new ball physics | Licensing specific branded games may be needed [S27] |

## 9.1 What players and bowlers say (ANECDOTAL COMMUNITY EVIDENCE)

These are individual public comments, **not representative survey statistics**. They are useful sources of design hypotheses:

- In a pro-shop inventory discussion, bowlers repeatedly requested emergency consumables: tape, replacement grips/inserts, cleaners, shammies, shoe-slide parts, rosin, sanding pads and blister care. **DESIGN:** a small pro shop can have genuine value before it can afford a drilling machine; a tournament creates last-minute accessory demand. [S36]
- Other bowlers stressed getting a personal ball *fitted and drilled well* rather than just buying the cheapest ball. **DESIGN:** technician trust and fit quality could matter more than retailer item rarity. [S37]
- Tycoon-game players described late-stage micromanagement becoming repetitive, and wished for a manager or more delegation. **DESIGN:** each new system should eventually unlock automation, rather than adding infinite daily checklist tasks. [S38]
- String pinsetter discussion shows that enthusiasts do not all view pin action the same way; avoid an absolute “string is strictly better” upgrade narrative. [S39]

**Key synthesis (DESIGN):** Multiple viable play loops: (1) run a day; (2) improve facility; (3) welcome different visitor types; (4) train favorite bowlers; (5) compete; (6) recover from mishaps. A game should not demand that all six loops be attended to on every day.

# 10. Comprehensive, unapologetically expansive ideas catalog

These are **possibilities, not scope commitments**. IDs make them easy to reference later. Tags: **R** documented real business/format inspiration, **D** purely game-design possibility, **V** verify feasibility/rights. Everything below requires design/testing before implementation.

## Buildings / layout (B)

- **B01** Exterior sign / custom name; **B02** paved driveway; **B03** parking capacity; **B04** covered entrance; **B05** display windows; **B06** front desk counter; **B07** rental shoe wall; **B08** ball rack/shelves; **B09** benches; **B10** lounges/sofas.
- **B11** Booth seating; **B12** restrooms; **B13** accessible restroom; **B14** lockers; **B15** party room; **B16** VIP room; **B17** arcade; **B18** redemption prizes; **B19** pro shop; **B20** pro shop workshop.
- **B21** Snack counter; **B22** prep kitchen; **B23** bar; **B24** restaurant; **B25** training/coach studio; **B26** trophy hall; **B27** spectator seats; **B28** scoreboard wall; **B29** staff lounge; **B30** equipment/mechanical room.
- **B31** Second building floor (D); **B32** seasonal patio (D); **B33** loading/storeroom; **B34** staff office; **B35** kids corner; **B36** photo booth; **B37** bowling museum (D); **B38** emergency generator (D); **B39** sound system; **B40** custom naming of rooms (D).

## Lane/equipment tech (L)

- **L01** Any-time lane purchase; **L02** separate wear meters; **L03** free-fall vs certified string upgrade paths; **L04** wood-vs-synthetic visual choices; **L05** lane bumper rails; **L06** assistive ramp; **L07** ball return upgrade; **L08** pinsetter speed; **L09** scoring touchscreen; **L10** overhead TV/animations.
- **L11** House lane pattern; **L12** challenge condition; **L13** sport condition; **L14** removable lane theme; **L15** seat/ball-return theme; **L16** practice lane reservation; **L17** emergency fault service; **L18** replacement parts stock; **L19** preventative maintenance contract; **L20** automatic daily service staffing.
- **L21** Lane rental pricing by time/day (D); **L22** reserved-league signs; **L23** lane-condition transition simulation (D); **L24** scoring fun modes; **L25** private lane rentals; **L26** split-style facility wings (V); **L27** arcade minilane (R); **L28** per-lane fan view; **L29** bulk service scheduling; **L30** visible mechanic working.

## Pro shop / gear (P)

- **P01** Plastic spare balls; **P02** entry reactive balls; **P03** urethane; **P04** mid-tier reactive; **P05** high-performance covers; **P06** multiple ball weights; **P07** custom-fit drilling; **P08** used/refurbished balls; **P09** special-order catalog; **P10** starter bundle.
- **P11** Shoe rental conversion; **P12** performance shoes; **P13** replacement soles; **P14** single tote; **P15** double roller; **P16** triple travel roller; **P17** custom team jersey; **P18** towels/shammies; **P19** cleaner; **P20** polishing pads.
- **P21** Thumb tape; **P22** rosin/grip sacks; **P23** finger inserts; **P24** interchangeable-thumb system; **P25** wrist supports; **P26** ball drilling jig; **P27** ball spinner; **P28** deep-clean revivor; **P29** hole plugging; **P30** ball resurface service.
- **P31** Pro shop appointment queue; **P32** technician skill; **P33** fitting error/rework; **P34** spare-ball strategy; **P35** equipment fit score; **P36** equipment repair; **P37** event gear legality check; **P38** team sponsorship; **P39** gear trade-in; **P40** seasonal limited-edition *fictional* balls (D).

## Food / beverage / arcade (F)

- **F01** Fries; **F02** hamburger; **F03** cheeseburger; **F04** hot dogs; **F05** pizza; **F06** wings; **F07** pretzels; **F08** nachos; **F09** popcorn; **F10** ice cream.
- **F11** Loaded tots; **F12** chicken strips; **F13** onion rings; **F14** candy; **F15** soda fountains; **F16** coffee; **F17** slushies; **F18** beer; **F19** wine; **F20** mocktails.
- **F21** Specialty cocktails (V); **F22** bartender recipes; **F23** kitchen appliances; **F24** recipe bundles; **F25** menu favorites; **F26** party combo packages; **F27** laneside ordering; **F28** arrival-next-day stock; **F29** refrigeration upgrades; **F30** spoilage (optional depth D).
- **F31** Pinball machine; **F32** crane game; **F33** space cabinet; **F34** air hockey; **F35** rhythm game; **F36** racing game; **F37** prize tickets; **F38** token/card kiosk; **F39** karaoke; **F40** billiards.
- **F41** Mini golf; **F42** laser tag; **F43** VR cabinet; **F44** redemption prize shelves; **F45** claw prize restocking; **F46** arcade machine repairs; **F47** mini scoring minigame; **F48** arcade leaderboard; **F49** limited-time arcade tournament; **F50** themed food week (D).

## Guests / staffing / economy (C)

- **C01** Distinct guest intentions; **C02** walk-in-only snack/bar/arcade visits; **C03** movement to actual room coords; **C04** group waiting patience; **C05** bench boost; **C06** accessible needs; **C07** return-customer identity; **C08** complaint categories; **C09** witty quotations; **C10** overall happiness.
- **C11** Department satisfaction; **C12** 7-day mood trend; **C13** weather/season (D); **C14** school holiday demand (D); **C15** competitor venue in town (D); **C16** local press review (D); **C17** fan/loyalty card; **C18** coupons and vouchers; **C19** birthday reservations; **C20** wedding/corporate parties.
- **C21** Wage/happiness system; **C22** cross-training; **C23** mechanic specialist; **C24** pro shop technician; **C25** bowler coach; **C26** event coordinator; **C27** bartender; **C28** kitchen lead; **C29** arcade technician; **C30** inventory purchasing clerk.
- **C31** Auto-restock threshold; **C32** supplier delivery times; **C33** express delivery surcharge; **C34** marketing flyers; **C35** radio; **C36** local TV; **C37** social-media posts; **C38** sponsorships; **C39** cash-flow forecast; **C40** detailed closing report only when requested.

## Competition / characters (T)

- **T01** Social league; **T02** short-season league; **T03** scratch league; **T04** handicap league; **T05** senior league; **T06** youth league; **T07** family league; **T08** mixed doubles; **T09** trios; **T10** team league.
- **T11** Tuesday practice club; **T12** Baker league; **T13** Scotch Doubles; **T14** no-tap; **T15** 3-6-9 night; **T16** best ball; **T17** sport shot league; **T18** tournament qualifier; **T19** match-play bracket; **T20** stepladder final.
- **T21** Local trophy event; **T22** charity fundraiser; **T23** scholarship-themed fictional event; **T24** corporate bowl-off; **T25** pro-am exhibition; **T26** regional host bid; **T27** sponsor-funded event; **T28** all-events championship; **T29** senior circuit; **T30** fictional world invitational.
- **T31** Bowler role styles; **T32** training plans; **T33** coaching certifications-inspired tiers; **T34** team chemistry; **T35** athlete equipment arsenal; **T36** tour travel (D); **T37** rival story arc; **T38** injury/fatigue *optional and sensitive* (D); **T39** retirement-to-coach; **T40** fictional Hall of Fame.

## Cosmetic / narrative / whimsical (W)

- **W01** Walls/carpets; **W02** neon retro; **W03** wood-paneled heritage; **W04** space-theme night; **W05** disco/cosmic lighting; **W06** beach theme; **W07** Halloween; **W08** winter lodge; **W09** bowling mascot; **W10** exterior giant pin sign.
- **W11** Customer review jokes; **W12** pun-filled staff nicknames; **W13** rotating specials sign; **W14** birthday announcements; **W15** manager's trophy shelf; **W16** wall of shame for absurd gutter balls; **W17** retro arcade poster; **W18** bowling history display; **W19** cutscene for facility evolutions; **W20** owner avatar customization.
- **W21** Forgotten shoe found under bench event (D); **W22** mischievous ball-return gremlin (D); **W23** themed tournaments; **W24** employee of the month; **W25** secret celebrity bowler (D); **W26** regular who orders exactly one pretzel (D); **W27** unlucky lane folklore (D); **W28** mascot costume night; **W29** bowling-themed merch line; **W30** jukebox/soundtrack (respect music rights).

# 11. Design decisions worth testing before adding content

## High-value research questions — not final recommendations

1. **At what player level should specializations begin?** Test after first 4–6 lanes versus after first regular league. Avoid penalizing generalist players.
2. **How deep should the pro shop be?** Start with retail + 2–3 services versus a full equipment fit/arsenal interface.
3. **What is a fair happiness model?** Simulate customer-volume bias, recency effects and whether one bad day can be recovered from quickly.
4. **How long does one “day” feel on a phone?** Preserve the current 2–10 PM hours; special tournaments may occupy pre-opening setup or reserve specific hours.
5. **What level of manual intervention feels pleasant?** Test restaurant resupply, lane maintenance and staff management with auto assistants, to prevent endless tapping.
6. **What should we do with distinct bowling disciplines?** Prefer a research-only annex until the base tenpin simulation is balanced; different scoring systems and lane art substantially expand QA.
7. **What kind of guest feedback is actionable?** Compare an overall score plus top two complaint categories against a long report.
8. **Can players progress without tournaments?** Competing should be rewarding; hospitality-first players should also be viable.
9. **How would themed expansions interact with a small floor grid?** Use expandable zones/room footprints rather than adding endless cramped buttons.
10. **How will we handle performance in GitHub Pages on iPhones?** Save events compactly, avoid excessive animated DOM nodes, and test older mobile devices.

## Early, middle, and future candidate clusters — for discussion ONLY

- **Already bookmarked for v0.93:** expedited construction at daily closing; fries, hamburger and cheeseburger; visible guest happiness metric.
- **Potential v0.94–0.96 theme (not approved):** fuller pro shop with retail + workshop; customer return visits; league roster/standings; party packages.
- **Potential later “choose your center” expansion (not approved):** Family, Competitive, Boutique, Hybrid paths; training academy; alternative pin sports; multi-venue enterprise.
- **Evergreen low-cost polish:** improved funny character lines, clearer status icons, exterior sign customization, trophies, customer journey visibility.

# 12. Explicit research limitations and responsible design cautions

- **Scope:** Desk research of official sport rules, vendors/operators, product catalogs and comparable games; **no firsthand operator interviews**, gameplay playtests or financial audit. Vendor claims may be promotional.
- **Numbers:** No unsupported universal cost, conversion, machine lifespan or equipment pricing assumptions are presented. Actual prices and operations vary by region and supplier. Use simulated game-balance costs separately and label them fictional.
- **Regulation:** Alcohol service, food safety, public accessibility, child/youth programs, tournament sanctioning and prize structures are subject to applicable requirements. Implement fantasy mechanics without presenting them as legal guidance.
- **Privacy:** For future account and character systems, avoid exposing real player identity, minor data or private profile information; cloud-security design remains its own workstream.
- **Trademark/licensing:** USBC/PBA and real brand names appear here as research sources; in the game, use original names, logos and fictional event brands unless permission is obtained.
- **Accessibility:** Support ramps, bumpers, readable UI, color-independent alerts, and optional controls. Accessibility should unlock participation and delight, not be portrayed as a “negative customer problem.”
- **Alternatives:** A center may specialize in one discipline. Multi-format alleys should be a deliberate capital decision, not a requirement for every player.
- **Decision process:** Keep a **research catalog** separate from the **approved development backlog**. No idea gets promoted from this report merely because it was written down.

# 13. Source register — research references

The sources below support real-world entries; descriptions after the colon state why each is relevant. Links were reviewed during October 2026 research. Some rules documents predate this project and should be rechecked if reused in a real certified event.

- **[S01]** US Bowling — Business models: https://usbowling.com/plan-your-center/
- **[S02]** Brunswick Bowling — Markets and center types: https://brunswickbowling.com/bowling-centers/build-a-center/markets
- **[S03]** US Bowling — Portfolio of traditional, boutique, hybrid and mini centers: https://usbowling.com/project-portfolio/
- **[S04]** Brunswick Bowling — Center operations, pinsetters, scoring, duckpin and projection: https://brunswickbowling.com/bowling-centers/equipment-parts-supplies/center-operations
- **[S05]** International Bowling Industry — Center revenue and profit/loss categories: https://bowlingindustry.com/does-your-profit-and-loss-statement
- **[S06]** Ralph's Pro Shop — Fitting, ball repairs, inventory, surface work: https://ralphsproshopelkhart.com/
- **[S07]** Hudsonville Lanes — Pro shop services and products: https://hudsonvillelanes.com/pro-shop/
- **[S08]** Bowling Ball Depot — Specialist pro-shop supplies: https://www.bowlingballdepot.com/pro-shop-supplies/
- **[S09]** Innovative Bowling Products — Drilling, measuring, sanding, revivor equipment: https://innovativebowling.com/
- **[S10]** USBC — Tournament resources and sample formats: https://bowl.com/rules/tournament-resources
- **[S11]** USBC — 2026 Open Championships (singles, doubles, team, all-events): https://bowl.com/news/2026-usbc-open-championships-concludes-run-in-reno
- **[S12]** PBA — Example five-person Baker stepladder competition: https://www.pba.com/tournaments/2026/2026-pba-elite-league-battle-brands-pres-beatbox
- **[S13]** USBC — Tournament Manager's Manual (2022, PDF): https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/Rules-TournamentManagersManual.pdf
- **[S14]** US Bowling — Bowling center maintenance checklist: https://usbowling.com/articles/your-2026-bowling-center-maintenance-checklist/
- **[S15]** Brunswick — Lane systems, bumpers, ball returns and lights: https://brunswickbowling.com/bowling-centers/equipment-parts-supplies/center-operations/lanes
- **[S16]** MaintBoard — Maintenance checklist and equipment breakdown: https://maintboard.com/bowling-alley-maintenance-checklist
- **[S17]** Steam — Bowling Alley Simulator: https://store.steampowered.com/app/4465600/Bowling_Alley_Simulator/
- **[S18]** Google Play — Lane Legends: Idle Bowling: https://play.google.com/store/apps/details?id=com.itzyla.strikeinc
- **[S19]** Steam — Arcade Paradise: https://store.steampowered.com/app/1388870/Arcade_Paradise
- **[S20]** Kairosoft community wiki — Pocket League Story facility/team mechanics: https://kairosoft.wiki.gg/wiki/Facilities_%28Pocket_League_Story%29
- **[S21]** International Candlepin Bowling Association — Rules: https://www.candlepin.org/icba-rules-regulations
- **[S22]** Canadian Five Pin Bowlers' Association — Rules (PDF archive): https://www.traditionalsports.org/images/sports/north_america/5_pin_bowling/English_Rule_Book.pdf
- **[S23]** World Ninepin Bowling Association — Club competitions: https://portal.wnba-nbc.com/
- **[S24]** USBC — String pinsetter information, separate certified competition: https://bowl.com/rules/string-pin-information
- **[S25]** Bowlero — League formats, season lengths, handicap and prize fund: https://www.bowlero.com/faqs?faqAnchor=lane-reservations
- **[S26]** USBC — Sport, Challenge and house lane conditions: https://bowl.com/sport-bowling/information
- **[S27]** Brunswick — Scoring game varieties: https://brunswickbowling.com/bowling-centers/equipment-parts-supplies/center-operations/sync/scoring/games
- **[S28]** B&B Theatres — Hybrid entertainment model with traditional and duckpin bowling: https://www.bbtheatres.com/entertainment-experiences/
- **[S29]** Storm — Bowling terminology, cores, surfaces, equipment: https://www.stormbowling.com/bowling-terminology-definitions/
- **[S30]** Bowling.com — Bags, shoes, balls and pro shop retail categories: https://www.bowling.com/
- **[S31]** Bowling.com — Detailed bowling accessories catalog: https://www.bowling.com/shopping/all/bowling-accessories
- **[S32]** USBC — League options, including scratch, sport, competitive and youth: https://bowl.com/about-us/league-options
- **[S33]** USBC — Bowling coaching education: https://bowl.com/coaching/information
- **[S34]** Wells Bowling Lanes — Example bowling center menu: https://wellsbowlinglanes.com/Menu/
- **[S35]** 10pin Bowling Lounge — Food, drink and laneside service: https://www.10pinchicago.com/food-and-drink/

- **[S36]** Reddit r/Bowling — Tournament pro-shop necessities discussion (2025; anecdotal): https://www.reddit.com/r/Bowling/comments/1nimzcv
- **[S37]** Reddit r/Bowling — Pro shop fitting versus online purchasing (2023; anecdotal): https://www.reddit.com/r/Bowling/comments/162xglg
- **[S38]** Reddit r/tycoon — Micromanagement fatigue and desire for delegation (2025; anecdotal): https://www.reddit.com/r/tycoon/comments/1kn3ewp
- **[S39]** Reddit r/Bowling — String pinsetter player reactions (2026; anecdotal): https://www.reddit.com/r/Bowling/comments/1rg3m8a/bowled_on_strings_for_the_first_time_and_i_didnt/

# 14. Reusable decision worksheet

When reviewing this report, classify any idea in one of these states:

| Decision | Meaning |
|---|---|
| **Keep for next build** | Specific to next version; write acceptance criteria |
| **Prototype/test first** | Need an isolated experiment or simulated balance |
| **Later** | Good direction, not next-stage scope |
| **Research further** | More operator or official evidence required |
| **Discard for now** | Save to ideas pile; do not delete from research archive |

For each selected idea, log: idea ID; why it helps player experience; player action; visible feedback; gameplay consequences; prerequisite systems; effort (S/M/L/XL); balance risk; accessibility impact; data/save migration impact; verification criteria.

**Principle:** “It doesn't need to be perfect to be valuable.” Keep experimental ideas, label uncertainties, and only promote them after the user chooses the direction.
