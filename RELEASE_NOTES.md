# From Gutter to Glory — v1.01: The Night Shift Rebuild

## Main change
The Back Alley is now a different management route, not simply a cosmetic theme and four pressure buttons.

### Features implemented
- Vera's story-choice screen is narrative only. It no longer mentions game AI, and committing to a campaign remains permanent for that location.
- Actual physical door security, cameras and staff preparedness upgrades, each with three paid levels and diminishing sabotage risk. The door-security post is visible beside the front entrance and links to the security panel.
- The Back Alley now has a dedicated **Build → Night Defenses** panel. Upgrades use ordinary in-game cash, not paid currency.
- When Vera strikes, named lanes and open facilities can shut down. Repairs cost money. Once door security is hired, players can investigate and reopen a sabotaged property for $70; an investigation also reduces rival pressure.
- Vera's sabotage tactics vary by conditions and player defenses: a disruption to the Casino Lounge, door intimidation with a visitor dip, a staff scare that affects morale, targeted facility damage, and paperwork pressure that reduces traffic and reputation. Successful protection builds influence and crew trust.
- The arcade is re-presented as **Casino Lounge** in the darker route, with fictional **ticket-prize games** (no wagering, monetary betting or cash-out). Its machines take on noir-style names and it earns an additional entertainment bonus for customer games after 6 PM. Existing arcade equipment and room statistics are preserved when a location switches story routes.
- Other dark-route identities include **Night Grill** (snacks), **Speakeasy** (bar) and **Backroom Outfitters** (pro shop). Their original base inventory and service mechanics remain compatible.
- Six Back Alley story chapters with dialogue from Lou, Rosa, Dex, Bea, Nell, and Grandpa Gus. Chapters open through improvements, actual incidents and story completion.
- The Midnight Accord finale now requires real defenses, two successful defenses, 35 Casino Lounge visits, at least six lanes and manageable rival pressure. Numeric influence buttons are no longer the main path to winning.
- The community-focused Legacy branch still follows its National Heritage Cup and neighborhood-support goals.
- Developer Settings preview remains available with separate local testing data and disabled cloud writes. Intro/tutorial overlay is cleared when entering the preview.
- Legacy v1.00 saves migrate from state version 15 to version 16. Portfolio snapshots gain the new independent night-operation state. The Firebase login and cloud-save integration is preserved without changes to the Firestore document format.

### Scope and tone
This is fictional, mildly threatening comic-noir storytelling. No real-money gambling, drug commerce or graphic harm mechanics are implemented. Teen-or-older is a *design target*, not an official app-store age rating. Casino-themed imagery may be evaluated differently by app-store rating questionnaires.

### Test coverage
- Node engine smoke and expanded Back Alley tests, including save migration, town independence and night-security outcomes.
- Controlled 90-rival-turn comparison (with damaged venues reset between turns): 56 successful disruptions without security versus 8 with maximum defenses, using one deterministic sample. Not a general probability guarantee.
- Chromium interactive checks at 390px and 1280px: Development Preview, Story tab, Build defenses, purchasing cameras, casino-themed room labels, zero page errors in tested flows.
- Live Firebase, iOS Safari and long-form player balancing still need deployment testing. Export a backup of current progress before updating.
