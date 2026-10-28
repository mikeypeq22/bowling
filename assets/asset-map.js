/* FROM GUTTER TO GLORY — IMAGE SWITCHBOARD (v0.7)
 * Drop an image into this assets folder, then change the filename below.
 * Or use the suggested filename and change NOTHING.
 * You do not need to edit index.html, engine.js, or game logic.
 * PNG, JPG, WebP, GIF and SVG work; transparent PNG/WebP are ideal for icons.
 * Missing images safely fall back to the built-in graphics / emoji.
 */
window.BOWLING_ASSETS = {
  // v0.94: These are optional override images. Missing files use drawn fallback artwork.
  'scene.empty': 'assets/venue-empty.png',
  'cutscene.empty': 'assets/cutscene-empty.png',
  'facility.snack.tier1': 'assets/facility-snack-tier1.png',
  'facility.snack.tier2': 'assets/facility-snack-tier2.png',
  'facility.bar.tier1': 'assets/facility-bar-tier1.png',
  'facility.bar.tier2': 'assets/facility-bar-tier2.png',
  'facility.arcade.tier1': 'assets/facility-arcade-tier1.png',
  'facility.arcade.tier2': 'assets/facility-arcade-tier2.png',
  'facility.proshop.tier1': 'assets/facility-proshop-tier1.png',
  'facility.proshop.tier2': 'assets/facility-proshop-tier2.png',
  'snack.fries': 'assets/snack-fries.png',
  'snack.burger': 'assets/snack-burger.png',
  'snack.cheeseburger': 'assets/snack-cheeseburger.png',
  // Scenes: a background behind the animated customers and lane overlays.
  'scene.backyard':      'assets/venue-backyard.png',
  'scene.neighborhood':  'assets/venue-neighborhood.png',
  'scene.league':        'assets/venue-league.png',
  'scene.regional':      'assets/venue-regional.png',

  // In-world objects. Replace each with one transparent image if you like.
  'world.lane':          'assets/lane.png',
  'world.desk':          'assets/front-desk.png',
  'world.snack':         'assets/snack-counter.png',
  'world.arcade':        'assets/arcade.png',
  'world.proshop':       'assets/pro-shop.png',
  'world.visitor':       'assets/customer.png',
  'world.bar':           'assets/bar.png',
  'world.benches':       'assets/benches.png',
  'world.ads':           'assets/advertising.png',
  'world.empty':         'assets/floor-tile.png', // optional artwork for empty grid squares

  // Main navigation icons: all are easy to swap.
  'nav.alley':           'assets/nav-alley.png',
  'nav.manage':          'assets/nav-manage.png',
  'nav.bowlers':         'assets/nav-bowlers.png',
  'nav.tournaments':     'assets/nav-tournaments.png',
  'nav.you':             'assets/nav-you.png',
  'nav.employees':       'assets/nav-employees.png',
  'nav.goals':           'assets/nav-goals.png',

  // Local regulars — optional portraits for conversational encounters.
  'patron.lou': 'assets/patron-lou.png',
  'patron.bea': 'assets/patron-bea.png',
  'patron.dex': 'assets/patron-dex.png',
  'patron.rosa': 'assets/patron-rosa.png',
  'patron.nell': 'assets/patron-nell.png',
  'patron.milo': 'assets/patron-milo.png',

  // Staff portraits/icons — one per role.
  'employee.snack':     'assets/employee-snack.png',
  'employee.bar':       'assets/employee-bar.png',
  'employee.proshop':   'assets/employee-proshop.png',
  'employee.stocker':   'assets/employee-stocker.png',

  // Bowler portraits: works for current roster and future hires.
  'bowler.maya':         'assets/bowler-maya.png',
  'bowler.leo':          'assets/bowler-leo.png',
  'bowler.recruit2':     'assets/bowler-jules.png',
  'bowler.recruit3':     'assets/bowler-sam.png',

  // New expansion attractions.
  'world.billiards': 'assets/room-billiards.png',
  'upgrade.billiards': 'assets/upgrade-billiards.png',
  'world.partyroom': 'assets/room-partyroom.png',
  'upgrade.partyroom': 'assets/upgrade-partyroom.png',
  'world.karaoke': 'assets/room-karaoke.png',
  'upgrade.karaoke': 'assets/upgrade-karaoke.png',
  'world.minigolf': 'assets/room-minigolf.png',
  'upgrade.minigolf': 'assets/upgrade-minigolf.png',
  'world.lasertag': 'assets/room-lasertag.png',
  'upgrade.lasertag': 'assets/upgrade-lasertag.png',
  'world.banquet': 'assets/room-banquet.png',
  'upgrade.banquet': 'assets/upgrade-banquet.png',

  // Supplies and facilities.
  'supply.parts':        'assets/parts.png',
  'upgrade.roof':        'assets/upgrade-roof.png',
  'upgrade.snack':       'assets/upgrade-snack.png',
  'upgrade.bar':         'assets/upgrade-bar.png',
  'upgrade.arcade':      'assets/upgrade-arcade.png',
  'upgrade.staff':       'assets/upgrade-staff.png',
  'upgrade.proshop':     'assets/upgrade-proshop.png',
  'upgrade.coaching':    'assets/upgrade-coaching.png',
  'upgrade.lights':      'assets/upgrade-lights.png',
  'upgrade.automation':  'assets/upgrade-automation.png',
  // Per-item food artwork: show in the clickable snack menu.
  'snack.soda':          'assets/snack-soda.png',
  'snack.popcorn':       'assets/snack-popcorn.png',
  'snack.hotdog':        'assets/snack-hotdog.png',
  'snack.pizza':         'assets/snack-pizza.png',
  'snack.nachos':        'assets/snack-nachos.png',
  'snack.pretzel':       'assets/snack-pretzel.png',
  'snack.icecream':      'assets/snack-icecream.png',

  // v0.6 — individual drinks for the bar menu.
  'drink.beer':          'assets/drink-beer.png',
  'drink.wine':          'assets/drink-wine.png',
  'drink.cider':         'assets/drink-cider.png',
  'drink.margarita':     'assets/drink-margarita.png',
  'drink.mocktail':      'assets/drink-mocktail.png',
  'drink.oldfashioned':  'assets/drink-oldfashioned.png',

  // v0.6 — arcade cabinet and game images.
  'machine.pinball':     'assets/machine-pinball.png',
  'machine.crane':       'assets/machine-crane.png',
  'machine.invaders':    'assets/machine-invaders.png',
  'machine.hockey':      'assets/machine-hockey.png',
  'machine.racer':       'assets/machine-racer.png',

  // v0.6 — furnishings/functional guest amenities.
  'fixture.restrooms':   'assets/fixture-restrooms.png',
  'fixture.lockers':     'assets/fixture-lockers.png',
  'fixture.ballracks':   'assets/fixture-ballracks.png',
  'fixture.tv':          'assets/fixture-tv.png',
  'fixture.wallart':     'assets/fixture-wallart.png',
  'fixture.neon':        'assets/fixture-neon.png',

  // Animated upgrade sequences: optional backgrounds under the built-in cutscene.
  'cutscene.dirt':       'assets/cutscene-dirt.png',
  'cutscene.level2':     'assets/cutscene-level2.png',
  'cutscene.level3':     'assets/cutscene-level3.png',
  'cutscene.level4':     'assets/cutscene-level4.png',
  'cutscene.level5':     'assets/cutscene-level5.png',
  'misc.trophy':         'assets/trophy.png',
  'misc.owner':          'assets/owner.png'
};
