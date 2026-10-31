/* From Gutter to Glory v1.00 — deterministic simulation; no UI dependencies. */
(function(root,factory){const core=factory();if(typeof module==='object'&&module.exports)module.exports=core;root.BowlingCore=core;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const OPEN=14,CLOSE=22;
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DRINKS=[
 {id:'beer',name:'Beer',emoji:'🍺',price:8,pack:12,cost:38,visits:0,level:1},
 {id:'wine',name:'Wine',emoji:'🍷',price:10,pack:10,cost:44,visits:0,level:1},
 {id:'cider',name:'Hard Cider',emoji:'🍎',price:9,pack:10,cost:39,visits:14,level:2},
 {id:'margarita',name:'Margarita',emoji:'🍹',price:14,pack:8,cost:48,visits:30,level:3,expandedOnly:true},
 {id:'mocktail',name:'Specialty Mocktail',emoji:'🥤',price:12,pack:8,cost:37,visits:42,level:3,expandedOnly:true},
 {id:'oldfashioned',name:'Old Fashioned',emoji:'🥃',price:16,pack:7,cost:51,visits:65,level:4,expandedOnly:true}
];
const MACHINES=[
 {id:'pinball',name:'Pinball',emoji:'🎰',cost:0,fee:3,plays:0,level:1},
 {id:'crane',name:'Claw Machine',emoji:'🧸',cost:185,fee:4,plays:0,level:1},
 {id:'invaders',name:'Galaxy Invaders',emoji:'👾',cost:255,fee:5,plays:8,level:2},
 {id:'hockey',name:'Air Hockey',emoji:'🏒',cost:375,fee:6,plays:25,level:3,expandedOnly:true},
 {id:'racer',name:'Retro Racer',emoji:'🏎️',cost:450,fee:7,plays:45,level:4,expandedOnly:true}
];
const FIXTURES=[
 {id:'restrooms',name:'Guest Restrooms',emoji:'🚻',cost:230,desc:'Improves guest comfort and reduces complaints.'},
 {id:'lockers',name:'Rental Lockers',emoji:'🔐',cost:170,desc:'A small extra fee from some bowling groups.'},
 {id:'ballracks',name:'House Ball Shelves',emoji:'🎳',cost:140,desc:'Makes getting onto lanes easier and brings guests back.'},
 {id:'tv',name:'Wall Televisions',emoji:'📺',cost:220,desc:'Entertains waiting guests and improves patience.'},
 {id:'wallart',name:'Bowling Wall Art',emoji:'🖼️',cost:85,desc:'Adds personality and a little popularity.'},
 {id:'neon',name:'Neon Wall Sign',emoji:'🌟',cost:155,desc:'Adds a little evening atmosphere.'}
];
const PAINTS=[{id:'original',name:'Original Walls',cost:0},{id:'ocean',name:'Ocean Teal',cost:110},{id:'berry',name:'Berry Pop',cost:110},{id:'sunset',name:'Sunset Gold',cost:110},{id:'midnight',name:'Midnight Blue',cost:145}];
function calendar(day){return {week:Math.floor((day-1)/7)+1,weekday:DAYS[(day-1)%7],dayIndex:(day-1)%7};}
const MAX_LANES=24;
const CAPACITY_STAGES=[6,10,14,18,22,24];
const NEW_ATTRACTIONS=[
 {id:'billiards',title:'Billiards Room',icon:'🎱',cost:1150,days:3,minExpansion:1,slots:2,fee:14,desc:'Pool tables draw new guests and give league bowlers a reason to linger.'},
 {id:'partyroom',title:'Party Room',icon:'🎂',cost:1450,days:3,minExpansion:1,slots:2,fee:19,desc:'A private space for birthdays, celebrations and families.'},
 {id:'karaoke',title:'Karaoke Lounge',icon:'🎤',cost:1900,days:4,minExpansion:2,slots:2,fee:16,desc:'Singing nights and a reason to stay after the last strike.'},
 {id:'minigolf',title:'Indoor Mini Golf',icon:'⛳',cost:2800,days:4,minExpansion:3,slots:2,fee:22,desc:'A compact indoor course for families and groups.'},
 {id:'lasertag',title:'Laser Tag',icon:'🔫',cost:3800,days:5,minExpansion:4,slots:2,fee:28,desc:'Team battles for families, schools and big parties.'},
 {id:'banquet',title:'Banquet Hall',icon:'🎉',cost:4700,days:5,minExpansion:5,slots:3,fee:35,desc:'Large booked events with higher-value guests.'},
 {id:'bocce',title:'Bocce Court',icon:'🥎',cost:2100,days:3,minExpansion:2,slots:2,fee:17,desc:'A relaxed indoor court for families, teams, and league nights.'},
 {id:'stage',title:'Live Event Stage',icon:'🎸',cost:3350,days:4,minExpansion:4,slots:2,fee:23,desc:'Local bands, karaoke finals, and visiting comedians perform here.'},
 {id:'restaurant',title:'Full-Service Restaurant',icon:'🍽️',cost:5500,days:6,minExpansion:5,slots:3,fee:42,desc:'A dining destination that attracts higher-value guests.'}
];
const EVENT_CATALOG=[
 {id:'viral',emoji:'📣',kind:'good',title:'A little town goes wild',text:'A customer showed everyone their strike dance. The video is trending locally.',effect:'Traffic rises for the next two days.'},
 {id:'review',emoji:'🌟',kind:'good',title:'Five stars, one spelling mistake',text:'A glowing review has locals asking about your alley.',effect:'Reputation and customer happiness improve.'},
 {id:'donation',emoji:'💌',kind:'good',title:'A surprise from Gus’s friends',text:'The old league alumni left a little donation in the mailbox.',effect:'Receive a modest cash bonus.'},
 {id:'supplier',emoji:'📦',kind:'good',title:'The supplier owes you one',text:'A delivery truck brought a free box of spare parts.',effect:'Receive spare parts at no charge.'},
 {id:'school',emoji:'🏫',kind:'good',title:'The school newsletter mentioned you',text:'Families are looking for somewhere fun after class.',effect:'Extra customers over the next two days.'},
 {id:'nostalgia',emoji:'📺',kind:'good',title:'A throwback on local television',text:'An old clip of Gus bowling a turkey has everyone feeling nostalgic.',effect:'Reputation improves.'},
 {id:'birthday',emoji:'🎂',kind:'good',title:'The birthday club sends a thank-you',text:'A party parent left a generous tip and a glowing note.',effect:'Receive extra in-game cash.'},
 {id:'neighborhood',emoji:'🏘️',kind:'good',title:'The neighbors rally around you',text:'A neighborhood group nominated the alley as a favorite local hangout.',effect:'Happiness and reputation rise.'},
 {id:'partsbonus',emoji:'🧰',kind:'good',title:'Free technician samples',text:'The parts distributor sent a welcome box for the maintenance shelf.',effect:'Five spare parts arrive free.'},
 {id:'mystery',emoji:'🌠',kind:'good',title:'A famous strike in a little town',text:'A visiting bowler hit an incredible game. Everybody is talking.',effect:'A short-lived visitor surge.'},
 {id:'lane',emoji:'🔧',kind:'bad',title:'The ball return has opinions',text:'One lane has seized up and will stay closed until repaired.',effect:'Pay for repairs before that lane can take customers.'},
 {id:'snack',emoji:'💧',kind:'bad',title:'A surprise indoor waterfall',text:'A leaky pipe closed the snack counter. Even the popcorn looks worried.',effect:'The snack counter is closed until you repair it.'},
 {id:'bar',emoji:'🧊',kind:'bad',title:'The ice machine revolts',text:'A plumbing leak has shut down the bar.',effect:'The bar is closed until you repair it.'},
 {id:'restrooms',emoji:'🚻',kind:'bad',title:'Restroom Out of Order',text:'The plumbing decided to take an unscheduled vacation.',effect:'Restrooms provide no comfort until repaired.'},
 {id:'arcade',emoji:'⚡',kind:'bad',title:'The arcade throws a tantrum',text:'A power fault has closed the arcade.',effect:'Arcade income pauses until repaired.'},
 {id:'proshop',emoji:'🧯',kind:'bad',title:'The pro shop springs a leak',text:'A burst pipe is threatening the shoe boxes.',effect:'Pro shop sales pause until repairs are completed.'},
 {id:'billiards',emoji:'🎱',kind:'bad',title:'The pool tables need help',text:'A water leak in the new wing has closed billiards.',effect:'Billiards temporarily stops serving visitors.'},
 {id:'partyroom',emoji:'🎂',kind:'bad',title:'A wall of very wet balloons',text:'A pipe above the party room leaked onto the decorations.',effect:'The party room is closed until fixed.'},
 {id:'karaoke',emoji:'🎤',kind:'bad',title:'Silence has fallen upon karaoke',text:'The sound system and ceiling are not on speaking terms.',effect:'Karaoke is closed until repaired.'},
 {id:'pricewar',emoji:'🏢',kind:'rival',title:'StrikeCity offers cut-price lanes',text:'Vera Vale is buying billboards advertising discounted bowling across town.',effect:'A short-lived slowdown in visitor demand.'},
 {id:'smear',emoji:'🗞️',kind:'rival',title:'Vera questions Gus’s legacy',text:'StrikeCity published a snarky article about your family alley.',effect:'A temporary reputation setback, or less with community support.'},
 {id:'rivaloffer',emoji:'📜',kind:'rival',title:'Vera sends another buyout letter',text:'StrikeCity offers to acquire the property. The letter is annoyingly scented.',effect:'The pressure rises; respond through neighborhood outreach or legal counsel.'}

];
const PARTNERSHIP_CATALOG=[
 {id:'school',name:'Local High School',icon:'🏫',cost:240,minLanes:4,minRep:0,boost:.12,weekly:0,desc:'More weekday school and family traffic.'},
 {id:'teams',name:'Youth Bowling Teams',icon:'👟',cost:360,minLanes:6,minRep:10,boost:.09,weekly:60,desc:'Weekly practice fees and loyal league families.'},
 {id:'charity',name:'Neighborhood Charities',icon:'❤️',cost:280,minLanes:3,minRep:12,boost:.08,weekly:0,desc:'Local goodwill, charity nights and reputation.'},
 {id:'office',name:'Local Employers',icon:'🏢',cost:500,minLanes:6,minRep:25,boost:.10,weekly:95,desc:'Corporate bowling nights and recurring team-building groups.'},
 {id:'neighbors',name:'Nearby Businesses',icon:'🤝',cost:310,minLanes:2,minRep:8,boost:.07,weekly:35,desc:'Cross-promotions, lunch-time visits and discounts.'}
];
const BOOKING_TYPES=[
 {id:'birthday',name:'Birthday Party',icon:'🎂',minLanes:2,deposit:90,total:420,cater:110,bonus:145,desc:'Two-hour birthday package with a reserved lane block.'},
 {id:'school',name:'School Field Trip',icon:'🏫',minLanes:4,deposit:120,total:620,cater:140,bonus:170,desc:'Afternoon youth bowling with optional catering.'},
 {id:'office',name:'Corporate Bowling Night',icon:'🏢',minLanes:6,deposit:230,total:1100,cater:275,bonus:360,desc:'Premium after-work booking; fewer lanes for walk-ins.'},
 {id:'charity',name:'Charity Tournament',icon:'❤️',minLanes:4,deposit:140,total:730,cater:160,bonus:190,desc:'A fundraiser that also strengthens local reputation.'},
 {id:'team',name:'Visiting Team Practice',icon:'🎳',minLanes:6,deposit:95,total:510,cater:95,bonus:115,desc:'Reserve six lanes for a visiting team. Your regular Thursday league still has priority.'},
 {id:'outreach',name:'Off-Site Community Booth',icon:'🚚',minLanes:1,deposit:45,total:215,cater:0,bonus:0,offsite:true,desc:'Promote Grandpa Gus’s alley at a local fair. No bowling lanes are reserved.'}
];
const ROOM_DETAILS=[
 {id:'snack',name:'Better Snack Ovens',icon:'🍕',cost:190,bonus:1,desc:'Hotter food, happier customers.'},
 {id:'bar',name:'Lounge Seating',icon:'🛋️',cost:240,bonus:1,desc:'Make the bar more comfortable and welcoming.'},
 {id:'arcade',name:'Neon Prize Wall',icon:'🎁',cost:210,bonus:1,desc:'A showcase for arcade prizes and trophies.'},
 {id:'proshop',name:'Professional Fitting Bench',icon:'🧰',cost:310,bonus:1,desc:'A clean professional corner for pro-shop visitors.'},
 {id:'billiards',name:'Premium Pool Tables',icon:'🎱',cost:320,bonus:1,desc:'A billiards room worthy of the neighborhood league.'},
 {id:'partyroom',name:'Party Decorations',icon:'🎈',cost:190,bonus:1,desc:'Birthday banners and easy-clean furniture.'},
 {id:'karaoke',name:'Stage Lights',icon:'🎤',cost:290,bonus:1,desc:'Make karaoke nights feel like concerts.'},
 {id:'minigolf',name:'Glow Golf',icon:'⛳',cost:350,bonus:1,desc:'Light up the putting course.'},
 {id:'lasertag',name:'Arena Effects',icon:'✨',cost:400,bonus:1,desc:'A more immersive laser-tag arena.'},
 {id:'banquet',name:'Formal Tables',icon:'🍽️',cost:400,bonus:1,desc:'A polished banquet presentation.'},
 {id:'bocce',name:'Tournament Bocce Markers',icon:'🥎',cost:260,bonus:1,desc:'Make the court ready for serious social competition.'},
 {id:'stage',name:'Professional Sound System',icon:'🎵',cost:440,bonus:1,desc:'Better sound for bands and comedy nights.'},
 {id:'restaurant',name:'Chef’s Open Kitchen',icon:'👨‍🍳',cost:490,bonus:1,desc:'Give guests a beautiful view of the kitchen.'}
];
const SEASONAL_ARCS=[
 {id:'gusday',name:'Grandpa Gus Memorial Roll-Off',emoji:'💌',text:'The old league sends photos of Gus and invites the town to roll in his honor.',reward:'Reputation +3 and community goodwill.'},
 {id:'students',name:'Back-to-School Bowling Week',emoji:'🎒',text:'Students and families want an afternoon together before the new term.',reward:'Three days of extra customer traffic.'},
 {id:'retro',name:'Retro Night Revisited',emoji:'🪩',text:'The Silver Strikers challenge the Cosmic Cosplayers to an unforgettable themed evening.',reward:'Extra tips and a burst of excitement.'},
 {id:'charity',name:'Bowl for the Neighborhood',emoji:'🤝',text:'The Firehouse Rollers organize a benefit bowling night to support local families.',reward:'Reputation and VIP loyalty improve.'}
];
const VIP_GROUPS=[
 {id:'silver',name:'Silver Strikers',icon:'👵',trait:'Retired league legends who love a fair price',boost:3},
 {id:'cosplay',name:'Cosmic Cosplayers',icon:'👾',trait:'Arcade enthusiasts with a flair for dramatic entrances',boost:2},
 {id:'firefighters',name:'Firehouse Rollers',icon:'🚒',trait:'Community volunteers who bring friends',boost:4}
];
const PARTY_REQUEST_NAMES=['Office Team-Building Night','Big Birthday Bowling Bash','Neighborhood Reunion','Company Appreciation Night','School Staff Party','Retirement Strike Party'];
function expansionStage(s){return Math.max(0,Math.min(5,Number.isInteger(s.expansionStage)?s.expansionStage:(s.landOwned?1:0)));}
function roomRows(s){return 2+expansionStage(s);}
function nextExpansionCost(s){return 3600+expansionStage(s)*1950;}
function activeOutage(s,id){return !!s.outages?.[String(id)];}
function incidentCooldownRemaining(s){return Math.max(0,5-(s.day-(s.lastRandomEventDay||-100)));}

const SPECIALTIES=[
 {id:'family',name:'Family Funhouse',icon:'🎈',tag:'Parties, snacks and arcade',desc:'More food-and-fun visitors and a little extra happiness.'},
 {id:'sport',name:'Serious Strikes',icon:'🏆',tag:'Leagues & competitive bowling',desc:'Extra league income and less lane wear.'},
 {id:'lounge',name:'The Social Lounge',icon:'🍹',tag:'Bar, nightlife and atmosphere',desc:'More guests stop by and drinks earn a little extra.'},
 {id:'community',name:'Neighborhood Classic',icon:'❤️',tag:'Regulars and local charm',desc:'More patient guests and a reputation bonus.'}
];
const STARTER_STYLES=[
 {id:'original',name:'Bare-Bones Bargain',icon:'🪵',paint:'original',fixture:null,cost:0,desc:'Keep every dollar for construction.'},
 {id:'family',name:'A Little Family Flair',icon:'🎨',paint:'berry',fixture:'wallart',cost:110,desc:'Berry-colored walls and cheerful bowling art.'},
 {id:'lounge',name:'Retro After Dark',icon:'🌙',paint:'midnight',fixture:'neon',cost:150,desc:'Midnight walls and a glowing neon sign.'},
 {id:'sport',name:'Ready to Roll',icon:'🎳',paint:'ocean',fixture:'ballracks',cost:130,desc:'Teal paint and easy-access house-ball shelves.'}
];
function laneCapacity(s){return CAPACITY_STAGES[expansionStage(s)];}
function specialtyOf(s){return SPECIALTIES.find(x=>x.id===s.specialty)||null;}
function chooseSpecialty(s,id){const spec=SPECIALTIES.find(x=>x.id===id);if(!spec)return {ok:false,reason:'Choose a real specialty'};if(venueLevel(s)<3)return {ok:false,reason:'Reach Established Alley first'};if(s.specialty)return {ok:false,reason:'Your first alley already has a specialty'};s.specialty=id;s.rep=money(s.rep+4);log(s,`Specialized as ${spec.name}!`);note(s,`Your center is now ${spec.name}. The locals are talking!`,'build');return {ok:true};}
function chooseStartup(s,finance='standard',style='original'){
 if(!s.startupPending)return {ok:false,reason:'Your business is already open'};
 if(!['standard','growth'].includes(finance))return {ok:false,reason:'Choose a loan option'};
 const look=STARTER_STYLES.find(x=>x.id===style);if(!look)return {ok:false,reason:'Choose a starter look'};
 const principal=finance==='growth'?1800:1000,capital=600+principal;
 if(capital<look.cost)return {ok:false,reason:'Insufficient starting funds'};
 s.loan={balance:principal,payment:finance==='growth'?150:85,initial:principal,lastPaymentDay:0};
 s.cash=capital-look.cost;s.wallPaint=look.paint;if(look.fixture)s.fixtures[look.fixture]=true;
 s.startupPending=false;s.startupFinance=finance;s.starterStyle=style;
 advanceStory(s);
 log(s,`Inherited Grandpa Gus's empty bowling building, selected ${look.name} and a $${principal} town restoration loan. Available funds: $${s.cash}.`);
 note(s,`The empty bowling center is yours. Pick a lane or facility to build and make it your own!`,'build');return {ok:true};
}
function buyLand(s){
 const stage=expansionStage(s),cap=laneCapacity(s);
 if(stage>=5)return {ok:false,reason:'The 24-lane property is fully expanded'};
 if(s.construction.some(j=>j.kind==='land'))return {ok:false,reason:'A wing is already under construction'};
 if(lanes(s)+pendingLanes(s)<cap)return {ok:false,reason:`Build all ${cap} available lanes before expanding the next wing`};
 const cost=nextExpansionCost(s);if(!spend(s,cost))return {ok:false,reason:`The next property wing costs $${cost.toLocaleString()}`};
 const nextCap=CAPACITY_STAGES[stage+1];recordCharge(s,'capex',cost);
 s.construction.push({kind:'land',id:'land',title:`Property Wing ${stage+1} (${nextCap} total lane spaces + shop row)`,remaining:4+stage,total:4+stage,startDay:s.day});
 log(s,`Purchased land for Wing ${stage+1}. More lane slots and another shops-and-activities row are coming.`);
 return {ok:true,days:4+stage};
}
function rushCost(job){return Math.round(55+job.remaining*75);}
function rushConstruction(s,kind,id){
 if(s.hour!==CLOSE)return {ok:false,reason:'Construction rushes are only available at the closing report'};
 const job=s.construction.find(j=>j.kind===kind&&j.id===id);if(!job)return {ok:false,reason:'That project is no longer under construction'};
 const cost=rushCost(job);if(!spend(s,cost))return {ok:false,reason:'Not enough cash for the overnight crew'};
 recordCharge(s,'capex',cost);job.remaining=1;finishSingleConstruction(s,job);s.construction=s.construction.filter(x=>x!==job);
 log(s,`Paid $${cost} to rush ${job.title} overnight!`);return {ok:true,cost};
}

const ROOM_COLS=5,ROOM_ROWS=7,ROOM_IDS=['snack','bar','proshop','arcade',...NEW_ATTRACTIONS.map(x=>x.id)];
const UPGRADES=[
 {id:'roof',title:'Covered Building',cost:175,days:2,requires:[],desc:'Already part of every new starter property.',icon:'🏠'},
 {id:'snack',title:'Snack Counter',cost:235,days:2,requires:[],desc:'Sell soda, popcorn, hot dogs and more as your alley levels up.',icon:'🍿'},
 {id:'bar',title:'Bowling Bar',cost:410,days:3,requires:[],desc:'A drinks counter adds a second refreshment business.',icon:'🍹'},
 {id:'arcade',title:'Mini Arcade',cost:680,days:3,requires:[],desc:'Earn extra money from guests and groups waiting for lanes.',icon:'🕹️'},
 {id:'staff',title:'Hire Lane Technician',cost:510,days:1,requires:['roof'],desc:'Automatically services worn lanes and buys spare parts as needed. Costs $16/day plus repair supplies.',icon:'🔧'},
 {id:'proshop',title:'Pro Shop',cost:1250,days:3,requires:[],desc:'Fit bowling balls and earn equipment income from guests.',icon:'🛍️'},
 {id:'coaching',title:'Coaching Corner',cost:1400,days:3,requires:['proshop'],desc:'Train your bowlers more efficiently.',icon:'📋'},
 {id:'lights',title:'Cosmic Bowling',cost:1350,days:3,requires:['arcade'],desc:'Brighten late afternoons with glowing lanes and extra interest.',icon:'✨'},
 {id:'automation',title:'Stockroom Shelves',cost:360,days:1,requires:[],desc:'A tidy place for incoming deliveries. Hire a Stock Clerk in Staff to order automatically.',icon:'📦'},
 ...NEW_ATTRACTIONS.map(a=>({id:a.id,title:a.title,cost:a.cost,days:a.days,requires:[],desc:a.desc,icon:a.icon}))
];
const CAMPAIGNS=[
 {id:'flyers',title:'Neighborhood Flyers',cost:55,days:2,boost:.11,icon:'📄',desc:'A little extra foot traffic for two game days.'},
 {id:'radio',title:'Local Radio',cost:165,days:3,boost:.23,icon:'📻',desc:'A broader local audience for three game days.'},
 {id:'tv',title:'TV Commercial',cost:460,days:4,boost:.37,icon:'📺',desc:'A big burst of interest for four game days.'}
];
const SNACKS=[
 {id:'soda',name:'Soda',emoji:'🥤',level:1,price:5,pack:10,cost:16},
 {id:'popcorn',name:'Popcorn',emoji:'🍿',level:1,price:6,pack:8,cost:17},
 {id:'hotdog',name:'Hot Dog',emoji:'🌭',level:3,price:9,pack:8,cost:32},
 {id:'pizza',name:'Pizza Slice',emoji:'🍕',level:4,price:11,pack:8,cost:39},
 {id:'nachos',name:'Nachos',emoji:'🧀',level:5,price:10,pack:8,cost:35},
 {id:'pretzel',name:'Soft Pretzel',emoji:'🥨',level:2,expandedOnly:true,price:8,pack:8,cost:27},
 {id:'icecream',name:'Ice Cream',emoji:'🍦',level:3,expandedOnly:true,price:10,pack:8,cost:34},
 {id:'fries',name:'French Fries',emoji:'🍟',level:1,price:8,pack:10,cost:28},
 {id:'burger',name:'Hamburger',emoji:'🍔',level:2,visits:12,price:13,pack:8,cost:43},
 {id:'cheeseburger',name:'Cheeseburger',emoji:'🧀',level:3,visits:28,price:15,pack:8,cost:48}
];
const TOURNAMENTS=[
 {id:'local',title:'Neighborhood Cup',needAvg:108,needRep:4,need:[],fee:70,firstPrize:420,rival:106,rep:12,cooldown:4},
 {id:'county',title:'County Classic',needAvg:140,needRep:20,need:['proshop'],fee:180,firstPrize:1000,rival:144,rep:18,cooldown:6},
 {id:'regional',title:'Regional Open',needAvg:174,needRep:44,need:['coaching'],needLanes:3,fee:350,firstPrize:2250,rival:177,rep:26,cooldown:8},
 {id:'national',title:'National Heritage Cup',needAvg:207,needRep:80,need:['lights'],fee:800,firstPrize:5300,rival:211,rep:35,cooldown:10}
];
const PLAYER_SKILLS=[
 {id:'manager',label:'Operations',desc:'Reduce hourly overhead by 4% per level'},
 {id:'coach',label:'Coaching',desc:'Increase training improvement by 1 per level'},
 {id:'promoter',label:'Publicity',desc:'Attract a little more walk-in traffic per level'}
];
const GUEST_NAMES=['Morgan','Sam','Avery','Taylor','Chris','Jordan','Riley','Alex','Casey','Jamie','Drew','Parker','Kai','Mia','Devon','Harper','Nico','Ellis'];
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function roll(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function money(n){return Math.round(n*100)/100;}
function formatHour(h){return (h===12?12:h>12?h-12:h)+':00 '+(h>=12?'PM':'AM');}
function isBuilt(s,id){return !!s.built[id];}
function lanes(s){return s.lanes.length;}
function pendingLanes(s){return s.construction.filter(j=>j.kind==='lane').length;}
function nextLaneCost(s){return 160+85*(lanes(s)+pendingLanes(s));}
function waitCapacity(s){return 1+s.benches*2;}
function activeCampaign(s){return s.campaign&&s.day>=s.campaign.startDay&&s.day<=s.campaign.endDay?s.campaign:null;}
const LEVELS=[null,
 {name:'Startup Lanes',desc:'Find your first customers and make the place your own.'},
 {name:'Neighborhood Alley',desc:'Add shelter and get your second lane humming.'},
 {name:'Established Alley',desc:'A true local business with room to specialize.'},
 {name:'Regional Destination',desc:'Bigger crowds and a clear identity.'},
 {name:'Bowling Landmark',desc:'An acclaimed alley ready for its next location.'}];
// Department ratings: real usage PLUS actual improvements. Totals power the 5-star venue rating.
// Ratings range 0 (not open) to 5. They are calculated, never stored, so saves remain compact.
const DEPARTMENTS=[
 {id:'lanes',name:'Bowling Lanes',icon:'🎳'},
 {id:'snack',name:'Snack Counter',icon:'🍿'},
 {id:'bar',name:'Bowling Bar',icon:'🍹'},
 {id:'arcade',name:'Arcade',icon:'🕹️'},
 {id:'proshop',name:'Pro Shop',icon:'🛍️'},
 {id:'comfort',name:'Guest Comfort',icon:'🪑'},
 {id:'style',name:'Look & Feel',icon:'🎨'}
];
const STAR_THRESHOLDS=[0,3,8,14,21,29];
const LANE_KITS=[
 {id:'wood',name:'Hardwood Lane Surface',icon:'🪵',cost:245,score:3,desc:'Sealed hardwood resists wear: roughly 40% less deterioration per game.'},
 {id:'return',name:'Smooth Ball Return',icon:'🎳',cost:185,score:2,desc:'Quieter, faster return. More guests leave smiling.'},
 {id:'scoring',name:'Digital Scoring Console',icon:'🖥️',cost:315,score:3,desc:'Interactive scoring and new screen animations. Counts toward your Lane Department rating.'}
];
const SCORE_THEMES=[
 {id:'classic',name:'Classic Pins',icon:'🎳',score:0},
 {id:'comic',name:'Comic Chaos',icon:'💥',score:1},
 {id:'cosmic',name:'Cosmic Party',icon:'🚀',score:1},
 {id:'retro',name:'Retro Pixels',icon:'👾',score:1}
];
function laneKit(l,id){return !!l?.kits?.[id];}
function departmentRatings(s){
 const n=lanes(s),kits=s.lanes.reduce((v,l)=>v+LANE_KITS.filter(k=>laneKit(l,k.id)).length,0);
 const laneHours=(s.dayReports||[]).reduce((v,r)=>v+(r.laneHours||0),0)+(s.today?.laneHours||0);
 const laneStars=n===0?0:clamp(1+(n>=2?1:0)+(n>=4?1:0)+(kits>=3||laneHours>=90?1:0)+(n>=6&&kits>=6?1:0),1,5);
 const result={lanes:{stars:laneStars,usage:laneHours,upgrades:kits,tip:'Add lanes, install lane equipment and keep bowlers coming back.'}};
 for(const id of ['snack','bar','arcade','proshop']){
  const visits=Math.max(0,s.roomVisits?.[id]||0),built=!!s.built[id],expanded=(s.roomTiers?.[id]||1)>=2;
  const stars=!built?0:1+(visits>=6?1:0)+(visits>=24?1:0)+(expanded?1:0)+(expanded&&visits>=60?1:0)+(s.roomDetails?.[id]?1:0);
  const starsCapped=Math.min(5,stars);
  result[id]={stars:starsCapped,usage:visits,upgrades:(expanded?1:0)+(s.roomDetails?.[id]?1:0),tip:!built?'Build the room to start earning stars.':'Serve more guests and expand the room to grow its rating.'};
 }
 const comforts=(s.benches||0)+['restrooms','lockers','ballracks','tv'].filter(id=>s.fixtures[id]).length;
 const decor=['wallart','neon','tv'].filter(id=>s.fixtures[id]).length+(s.wallPaint!=='original'?1:0)+(s.starterStyle&&s.starterStyle!=='original'?1:0)+Math.min(2,NEW_ATTRACTIONS.filter(a=>s.built[a.id]).length);
 result.comfort={stars:clamp(Math.floor(comforts*.85),0,5),usage:comforts,upgrades:comforts,tip:'Add benches, restrooms, lockers, house-ball shelves and TVs.'};
 result.style={stars:clamp(decor+(s.built.lights?1:0),0,5),usage:decor,upgrades:decor,tip:'Refresh walls, hang art, add neon signs and install visual attractions.'};
 return result;
}
function alleyScore(s){return Object.values(departmentRatings(s)).reduce((n,d)=>n+d.stars,0);}
function alleyStars(s){const score=alleyScore(s);let stars=0;for(let i=1;i<STAR_THRESHOLDS.length;i++)if(score>=STAR_THRESHOLDS[i])stars=i;return stars;}
// The original v0.96 formula is retained solely to protect existing save milestones.
function previousAlleyScore(s){
 const lanePoints=s.lanes.reduce((n,l)=>n+2+(laneKit(l,'wood')?3:0)+(laneKit(l,'return')?2:0)+(laneKit(l,'scoring')?3:0)+(laneKit(l,'scoring')&&l.animationUnlocked?1:0),0);
 const rooms=['snack','bar','arcade','proshop'].reduce((n,id)=>n+(s.built[id]?4+(s.roomTiers?.[id]===2?3:0):0),0);
 const fixtures=FIXTURES.reduce((n,f)=>n+(s.fixtures[f.id]?2:0),0);
 const machines=Math.max(0,Object.values(s.arcadeMachines||{}).filter(Boolean).length-1)*2;
 const utility=['coaching','lights','staff','automation'].reduce((n,id)=>n+(s.built[id]?2:0),0);
 return lanePoints+rooms+fixtures+machines+utility+(s.wallPaint!=='original'?2:0)+s.benches;
}
function previousLevel(s){const oldScore=previousAlleyScore(s), oldStars=[2,10,20,34,50].filter(x=>oldScore>=x).length;
 const n=lanes(s),r=Math.floor(s.rep),v=s.totalServed||0;
 return n>=6&&oldStars>=5&&v>=290&&r>=90?5:n>=4&&oldStars>=4&&v>=155&&r>=50?4:n>=3&&oldStars>=3&&v>=75&&r>=23?3:n>=2&&oldStars>=2&&v>=20&&r>=8?2:1;
}
function progress(s){return {served:s.totalServed||0,rep:Math.floor(s.rep),lanes:lanes(s),facilities:['snack','bar','proshop','arcade'].filter(x=>isBuilt(s,x)).length,score:alleyScore(s),stars:alleyStars(s)};}
function venueLevel(s){const p=progress(s);
 const earned=p.lanes>=6&&p.stars>=5&&p.served>=290&&p.rep>=90?5:
 p.lanes>=4&&p.stars>=4&&p.served>=155&&p.rep>=50?4:
 p.lanes>=3&&p.stars>=3&&p.served>=75&&p.rep>=23?3:
 p.lanes>=2&&p.stars>=2&&p.served>=20&&p.rep>=8?2:1;
 return Math.max(earned,s.minVenueLevel||1);}
function venueName(s){return lanes(s)===0?'Empty Building':LEVELS[venueLevel(s)].name;}
function nextLevelGoals(s){const l=venueLevel(s)+1;if(l>5)return ['Maximum level reached — think about another bowling center someday!'];
 const p=progress(s),star= l===2?2:l===3?3:l===4?4:5;
 const needs={2:[2,20,8],3:[3,75,23],4:[4,155,50],5:[6,290,90]};
 const [laneGoal,servedGoal,repGoal]=needs[l];return [
 {label:`Alley Stars: ${p.stars}/${star} (department stars ${p.score}/${STAR_THRESHOLDS[star]})`,done:p.stars>=star},
 {label:`${p.lanes}/${laneGoal} open lanes`,done:p.lanes>=laneGoal},
 {label:`${Math.min(p.served,servedGoal)}/${servedGoal} groups bowled`,done:p.served>=servedGoal},
 {label:`${p.rep}/${repGoal} reputation`,done:p.rep>=repGoal}
 ];}
function upgradeLane(s,id,kit){const l=s.lanes.find(x=>x.id===Number(id)),u=LANE_KITS.find(x=>x.id===kit);
 if(!l||!u)return {ok:false,reason:'Choose a built lane and valid equipment'};
 l.kits??={};if(l.kits[kit])return {ok:false,reason:'Equipment already installed'};
 if(!spend(s,u.cost))return {ok:false,reason:'Not enough money for this lane upgrade'};
 l.kits[kit]=true;recordCharge(s,'capex',u.cost);note(s,`Lane ${l.id} got ${u.name}! It strengthens your Lane Department rating.`,'build');log(s,`Upgraded lane ${l.id}: ${u.name}.`);return {ok:true};}
function bulkLaneCost(s,id){const kit=LANE_KITS.find(k=>k.id===id),count=kit?s.lanes.filter(l=>!laneKit(l,id)).length:0;return {count,cost:kit?Math.round(kit.cost*count*.9):0};}
function upgradeAllLanes(s,id){const kit=LANE_KITS.find(k=>k.id===id);if(!kit)return {ok:false,reason:'Unknown lane equipment'};
 const {count,cost}=bulkLaneCost(s,id);if(!count)return {ok:false,reason:'All open lanes already have this kit'};
 if(!spend(s,cost))return {ok:false,reason:'Not enough cash for the center-wide upgrade'};
 for(const lane of s.lanes)if(!laneKit(lane,id)){lane.kits??={};lane.kits[id]=true;}
 recordCharge(s,'capex',cost);log(s,`Equipped ${count} lanes with ${kit.name} for $${cost}.`);note(s,`All ${count} unequipped lanes got ${kit.name}!`,'build');return {ok:true,count,cost};}
function setLaneTheme(s,id,theme){const l=s.lanes.find(x=>x.id===Number(id)),t=SCORE_THEMES.find(x=>x.id===theme);
 if(!l||!t)return {ok:false,reason:'Unknown lane or scoring animation'};
 if(!laneKit(l,'scoring'))return {ok:false,reason:'Install Digital Scoring first'};
 l.theme=theme;if(theme!=='classic')l.animationUnlocked=true;note(s,`Lane ${l.id} now shows ${t.name} animations.`,'build');return {ok:true};}
function avg(b){return Math.round(clamp(60+b.aim*.75+b.spare*.55+b.power*.35+b.focus*.25+(b.ball?12:0),50,260));}
function teamAvg(s){const b=[...s.bowlers].sort((a,b)=>avg(b)-avg(a)).slice(0,2);return Math.round(b.reduce((n,x)=>n+avg(x),0)/b.length);}
function getUpgrade(id){return UPGRADES.find(x=>x.id===id);}
function footprint(s,id){const attraction=NEW_ATTRACTIONS.find(x=>x.id===id);if(attraction)return attraction.slots;return s.roomTiers?.[id]===2||s.construction.some(j=>j.kind==='roomExpand'&&j.id===id)?2:1;}
function canPlaceRoom(s,id,x,y,size=footprint(s,id)){
 if(!ROOM_IDS.includes(id)||!Number.isInteger(x)||!Number.isInteger(y)||x<0||x+size>ROOM_COLS||y<0||y>=roomRows(s))return false;
 for(const [other,pos] of Object.entries(s.roomPlacements||{})){
  if(other===id||!ROOM_IDS.includes(other))continue;
  if(pos.y===y && x<pos.x+footprint(s,other) && x+size>pos.x)return false;
 }
 return true;
}
function findRoomPlacement(s,id,size=1){const preferred={snack:[0,0],bar:[2,0],proshop:[0,1],arcade:[2,1]},[px,py]=preferred[id]||[0,Math.max(2,roomRows(s)-1)];
 if(canPlaceRoom(s,id,px,py,size))return {x:px,y:py};
 for(let y=0;y<roomRows(s);y++)for(let x=0;x+size<=ROOM_COLS;x++)if(canPlaceRoom(s,id,x,y,size))return {x,y};return null;
}
function ensureRoom(s,id){if(!ROOM_IDS.includes(id)||s.roomPlacements[id])return true;const pos=findRoomPlacement(s,id,footprint(s,id));if(!pos)return false;s.roomPlacements[id]=pos;return true;}
function moveRoom(s,id,x,y){if(!ROOM_IDS.includes(id)||(!s.built[id]&&!isBuilding(s,id)))return {ok:false,reason:'Build this room first'};
 if(!canPlaceRoom(s,id,x,y))return {ok:false,reason:'This placement overlaps another room or extends beyond the grid'};
 s.roomPlacements[id]={x,y};log(s,`Moved ${getUpgrade(id).title} in the alley layout.`);return {ok:true};}
function expansionCost(id){return ({snack:290,bar:365,proshop:460,arcade:305})[id]||0;}
function expandRoom(s,id){if(!ROOM_IDS.includes(id)||!isBuilt(s,id))return {ok:false,reason:'Build this room first'};
 if(s.roomTiers[id]===2)return {ok:false,reason:'Already expanded'};
 if(s.construction.some(j=>j.kind==='roomExpand'&&j.id===id))return {ok:false,reason:'Expansion already underway'};
 const pos=s.roomPlacements[id];if(!pos||!canPlaceRoom(s,id,pos.x,pos.y,2))return {ok:false,reason:'Move this room to a spot with an empty square on its right first'};
 const cost=expansionCost(id);if(!spend(s,cost))return {ok:false,reason:'Not enough money'};
 recordCharge(s,'capex',cost);const title=getUpgrade(id).title+' Expansion';s.construction.push({kind:'roomExpand',id,title,remaining:2,total:2,startDay:s.day});log(s,`Started ${title}: a two-square room in two game days.`);return {ok:true,days:2};}
// Fictional narrative: the Heritage Charter is a made-up game honor, not a real USBC accreditation.
const STORY_CHAPTERS=[
 {id:'inheritance',title:'The Last Frame',speaker:'Grandpa Gus · letter',icon:'💌',text:'If you are reading this, the old bowling center is yours. I left you four walls, a roof, a box of crooked trophies, and one very stubborn dream. Do not let Vera Vale turn our lanes into a parking lot. Love, Grandpa Gus.',hint:'Pick a loan, make the building yours, and install your first lane.'},
 {id:'firstlane',title:'The First Roll',speaker:'Lou · family friend',icon:'🎳',text:'That sound? A bowling ball hitting pins. I have not heard it in years. Grandpa Gus would have cried. He always did when someone bowled a seven.',hint:'Bring in customers, improve the building and listen to your visitors.'},
 {id:'offer',title:'A Very Polite Threat',speaker:'Vera Vale · StrikeCity Properties',icon:'📃',text:'Congratulations on your little business. My company would love to purchase this property. You have a beautiful location for a parking structure. Think it over.',hint:'The sale is optional; no deadline will take your alley away. Keep growing.'},
 {id:'established',title:'The Missing Page',speaker:'Grandpa Gus · old league ledger',icon:'📖',text:'One page of Gus’s ledger is marked THE HERITAGE CHARTER: win the fictional National Heritage Cup with your home team, and the town will honor the center as a community landmark. Vera cannot buy a story that everyone owns.',hint:'Choose a specialty, build your team and prepare for higher tournaments.'},
 {id:'league',title:'A League of Their Own',speaker:'Bea · league organizer',icon:'👟',text:'Six lanes! That is enough to bring Thursday league night back. Grandpa used to say the best thing about bowling was having people who showed up every week — even when they were terrible.',hint:'Meet returning visitors and invite loyal regulars to join the league.'},
 {id:'regional',title:'The Rival Rolls In',speaker:'Vera Vale · StrikeCity Properties',icon:'🏆',text:'I see the regional trophy. My sponsored team will be waiting at Nationals. Bring your best bowlers. And please do not bring that ridiculous mascot.',hint:'Train and equip your team for the National Heritage Cup.'},
 {id:'national',title:'Gus Would Be Proud',speaker:'Town Heritage Committee · fictional honor',icon:'🌟',text:'You won the National Heritage Cup! The alley receives the Heritage Charter, a fictional game distinction celebrating the family business. The property is safe from Vera’s offer, and the bowling center is officially part of the town’s history.',hint:'You have finished the first story arc. Keep improving your alley and building your community!'}
];
const PATRON_PROFILES=[
 {id:'lou',name:'Lou',trait:'Has bowled here since Gus ran the place',wish:'lanes',quote:'The pins never stood a chance. My knees, on the other hand…'},
 {id:'bea',name:'Bea',trait:'Auntie of every league bowler',wish:'snack',quote:'I came for the strikes. I stayed for the fries.'},
 {id:'dex',name:'Dex',trait:'Arcade high-score hunter',wish:'arcade',quote:'My initials on that pinball machine are a historical landmark.'},
 {id:'rosa',name:'Rosa',trait:'Loves a lively evening and good drinks',wish:'bar',quote:'Does this drink come with a spare? Asking for a friend.'},
 {id:'nell',name:'Nell',trait:'Cares about clean lanes and good equipment',wish:'proshop',quote:'If your thumb tape is wrong, everything is wrong.'},
 {id:'milo',name:'Milo',trait:'Shows up with friends and endless questions',wish:'comfort',quote:'Do these shoes come with a personality upgrade?'}
];
// Persistent, location-specific rivalry. Neither choosing a branch nor a dev preview
// alters other properties stored in the portfolio.
const CAMPAIGN_PATHS=[
 {id:'legacy',name:'The Legacy',icon:'🌟',tone:'warm',description:'Save the alley through tournaments, community trust and a nationally recognized landmark.'},
 {id:'backalley',name:'The Back Alley',icon:'🌒',tone:'teen-noir',description:'A noir-flavored struggle of security, favors and consequences. No graphic violence or detailed criminal instruction.'}
];
function newCampaign(){return {path:'undecided',chosenDay:0,security:12,influence:0,heat:0,trust:50,defenseWins:0,lastActionDay:0,lastAIMoveDay:0,nextAIMoveDay:0,aiStyle:'uncommitted',aiMemory:[],history:[],victory:false};}
function campaignReady(s){return !s.startupPending&&(s.story?.unlocked||[]).includes('offer');}
function campaignOf(s){return CAMPAIGN_PATHS.find(p=>p.id===s.campaignStory?.path)||null;}
function chooseCampaign(s,id){
 const path=CAMPAIGN_PATHS.find(p=>p.id===id);
 if(!path)return {ok:false,reason:'Unknown storyline'};
 if(!campaignReady(s))return {ok:false,reason:'The rival has not made her first offer yet'};
 if(s.campaignStory.path!=='undecided')return {ok:false,reason:'This location already chose a permanent storyline'};
 s.campaignStory={...s.campaignStory,path:id,chosenDay:s.day,aiStyle:id==='backalley'?'intimidation':'public-relations',nextAIMoveDay:s.day+6};
 s.story.pending=s.story.pending.filter(x=>x!=='offer');
 s.rival.pressure=Math.max(12,s.rival.pressure);
 const msg=id==='backalley'?'🌒 The Back Alley begins. Vera is no longer just a business problem. Protect your crew, choose your contacts carefully, and decide what you are willing to risk.':'🌟 The Legacy begins. Build a landmark strong enough to outlast StrikeCity and rally the town.';
 log(s,msg);note(s,msg,'story');return {ok:true,path:id};
}
function campaignMission(s){
 const c=s.campaignStory;
 if(c.path==='backalley')return `Midnight Accord: ${c.security}/65 security · ${c.influence}/45 influence · ${Math.round(s.rep)}/40 reputation · ${lanes(s)}/6 lanes · Vera pressure ${s.rival.pressure}/25 maximum`;
 if(c.path==='legacy')return `Heritage Charter: ${s.tournamentWins.national||0} national victories · ${s.rival.community}/4 neighborhood allies · ${alleyStars(s)}/4 alley stars`;
 return 'Continue until Vera sends her first buyout offer.';
}
const NOIR_ACTIONS=[
 {id:'reinforce',name:'🔐 Reinforce the alley',cost:230,description:'Locks, cameras and trained security. Security +18, trust +2, rival pressure −9.'},
 {id:'contacts',name:'🕴️ Cultivate contacts',cost:190,description:'Listen to after-hours rumors. Influence +15, pressure −8; Heat +8 and trust −2.'},
 {id:'shady',name:'🃏 Take an after-hours deal',cost:0,description:'Earn $290 with strings attached. Heat +22, trust −8 and rival pressure +7.'},
 {id:'quiet',name:'🕯️ Keep your head down',cost:85,description:'Invest in calm operations. Heat −18, trust +5, rival pressure −5.'}
];
function campaignAction(s,id){
 const c=s.campaignStory;
 if(c.path!=='backalley')return {ok:false,reason:'Available only in The Back Alley campaign'};
 if(c.victory)return {ok:false,reason:'This campaign has reached its ending'};
 if(s.day-c.lastActionDay<2)return {ok:false,reason:'You can make a major underworld decision once every two days'};
 const action=NOIR_ACTIONS.find(a=>a.id===id);if(!action)return {ok:false,reason:'Unknown decision'};
 if(!spend(s,action.cost))return {ok:false,reason:'Not enough money'};
 if(id==='reinforce'){c.security=clamp(c.security+18,0,100);c.trust=clamp(c.trust+2,0,100);s.rival.pressure=clamp(s.rival.pressure-9,0,100);}
 if(id==='contacts'){c.influence=clamp(c.influence+15,0,100);c.heat=clamp(c.heat+8,0,100);c.trust=clamp(c.trust-2,0,100);s.rival.pressure=clamp(s.rival.pressure-8,0,100);}
 if(id==='shady'){s.cash=money(s.cash+290);c.heat=clamp(c.heat+22,0,100);c.trust=clamp(c.trust-8,0,100);s.rival.pressure=clamp(s.rival.pressure+7,0,100);}
 if(id==='quiet'){c.heat=clamp(c.heat-18,0,100);c.trust=clamp(c.trust+5,0,100);s.rival.pressure=clamp(s.rival.pressure-5,0,100);}
 c.lastActionDay=s.day;if(action.cost)recordCharge(s,'marketingSpend',action.cost);
 c.history.unshift({day:s.day,who:'Player',text:action.name});c.history=c.history.slice(0,25);
 note(s,`🌒 ${action.name}: ${action.description}`,'story');checkCampaignVictory(s);
 return {ok:true};
}
function checkCampaignVictory(s){const c=s.campaignStory;if(c.victory)return false;
 if(c.path==='backalley'&&c.security>=65&&c.influence>=45&&s.rep>=40&&lanes(s)>=6&&s.rival.pressure<=25){
  c.victory=true;s.rep=money(s.rep+12);const msg='🌒 Midnight Accord: Vera backs down after your neighborhood network and security team hold the line. You kept the lanes open—but the city will remember every compromise.';c.history.unshift({day:s.day,who:'Story',text:msg});s.eventQueue.push({id:'noir-finale',emoji:'🌒',title:'The Midnight Accord',kind:'noir',text:msg,effect:'Campaign complete. Your bowling center continues to operate.'});log(s,msg);return true;
 }
 if(c.path==='legacy'&&(s.tournamentWins.national||0)>0&&s.rival.community>=4&&alleyStars(s)>=4){
  c.victory=true;const msg='🌟 Community Charter: Your National Heritage Cup victory and neighbors safeguard the alley as a beloved landmark.';c.history.unshift({day:s.day,who:'Story',text:msg});s.eventQueue.push({id:'legacy-finale',emoji:'🌟',title:'Community Charter',kind:'good',text:msg,effect:'Campaign complete. Continue improving your bowling center.'});log(s,msg);return true;
 }
 return false;
}
// Deterministic opponent: Vera observes current defenses, pressure, popularity,
// partnerships and heat rather than drawing a purely unrelated event.
function rivalAIMove(s){
 const c=s.campaignStory;if(c.path==='undecided'||c.victory||s.startupPending||s.day<c.nextAIMoveDay)return false;
 if(s.day-(s.lastRandomEventDay??-100)<5)return false;
 const guarded=c.security>=45,connected=c.influence>=30,publicSupport=s.rival.community>=3||s.rep>=60;
 const action=c.path==='backalley'?(c.heat>=35?'paper-trail':guarded?'supplier-pressure':connected?'watchers':'night-threat'):(publicSupport?'price-war':'permit-challenge');
 const mitigated=action==='night-threat'&&guarded||action==='watchers'&&connected||publicSupport&&action==='price-war';
 const increase=mitigated?4:action==='night-threat'?16:12;
 s.rival.pressure=clamp(s.rival.pressure+increase,0,100);
 if(action==='night-threat')c.trust=clamp(c.trust-(guarded?1:4),0,100);
 if(action==='paper-trail')c.heat=clamp(c.heat+5,0,100);
 if(action==='supplier-pressure')s.eventBoostFactor=.88;
 if(action==='price-war')s.eventBoostFactor=publicSupport?.94:.79;
 if(['supplier-pressure','price-war'].includes(action))s.eventBoostUntil=s.day+2;
 const headlines={
  'paper-trail':['A name on the wrong paperwork','Vera has started asking pointed questions about your late-night associations. Suspicion rises.'],
  'supplier-pressure':['An unexpected delivery delay','StrikeCity is squeezing local suppliers. Your upgraded security prevents more serious trouble.'],
  'watchers':['Unknown cars in the parking lot','Vera tests your nerves with an intimidating show of interest. Your local contacts know who to call.'],
  'night-threat':['A warning after closing','Someone has been leaving unsettling messages for the staff. You need better security.'],
  'price-war':['StrikeCity undercuts your prices','Vera runs an aggressive discount campaign. Your loyal customers soften the impact.'],
  'permit-challenge':['A suspiciously timed inspection','Vera challenges your permits. Documents and community allies help you prepare.']
 };
 const [title,text]=headlines[action],entry={id:'vera-ai-'+action,kind:c.path==='backalley'?'noir':'rival',emoji:c.path==='backalley'?'🌒':'🏢',title,text,effect:`Vera pressure +${increase}. AI observed: ${action.replace(/-/g,' ')}. Build your countermeasures.`,day:s.day};
 c.aiStyle=action;c.lastAIMoveDay=s.day;c.nextAIMoveDay=s.day+6+Math.floor(roll(s)*4);c.aiMemory.unshift({day:s.day,action,pressure:s.rival.pressure});c.aiMemory=c.aiMemory.slice(0,30);
 c.history.unshift({day:s.day,who:'Vera AI',text:title});c.history=c.history.slice(0,25);
 s.lastRandomEventDay=s.day;s.eventQueue.push(entry);s.eventHistory.unshift(entry);s.eventHistory=s.eventHistory.slice(0,25);note(s,`${entry.emoji} ${title}: ${text}`,'story');checkCampaignVictory(s);return true;
}
function freshStory(){return {unlocked:['inheritance'],pending:['inheritance'],charter:false};}
function freshPatrons(){return Object.fromEntries(PATRON_PROFILES.map(p=>[p.id,{id:p.id,visits:0,loyalty:12,lastVisit:0,lastTalk:0,leagueMember:false,disappointed:0}]));}
function openChapter(s,id,silent=false){s.story??=freshStory();if(s.story.unlocked.includes(id))return false;
 const c=STORY_CHAPTERS.find(x=>x.id===id);if(!c)return false;
 s.story.unlocked.push(id);if(!silent){s.story.pending.push(id);log(s,`📖 New chapter: ${c.title}.`);note(s,`New story chapter: ${c.title}`,'story');}return true;}
function advanceStory(s){
 if(!s.startupPending)openChapter(s,'inheritance');
 if(lanes(s)>=1)openChapter(s,'firstlane');
 if(s.totalServed>=20)openChapter(s,'offer');
 if(venueLevel(s)>=3)openChapter(s,'established');
 if(s.league.active)openChapter(s,'league');
 if((s.tournamentWins?.regional||0)>0)openChapter(s,'regional');
 if((s.tournamentWins?.national||0)>0){openChapter(s,'national');if(s.campaignStory?.path!=='backalley'){if(!s.story.charter){s.rival.pressure=0;s.rep=money(s.rep+10);note(s,'🏆 The National Heritage Cup victory silenced StrikeCity. Your community rallied to protect the alley!','story');}s.story.charter=true;}}
 checkCampaignVictory(s);
}
function patronStatus(p){return p.leagueMember?'League Member':p.visits>=3&&p.loyalty>=35?'Regular':p.visits?'Visitor':'Not met yet';}
function greetPatron(s,party,experience='bowling'){
 if(!party.patronId)return;
 const p=s.patrons?.[party.patronId];if(!p)return;
 p.visits++;p.lastVisit=s.day;queueEncounter(s,party);
 p.loyalty=clamp(p.loyalty+(experience==='bowling'?7:5)+(s.specialty==='community'?2:0),0,100);
 if(p.visits===3){note(s,`${party.name} is becoming a familiar face. Maybe have a chat on the Goals tab!`,'feedback',party.id);}
}
function upsetPatron(s,party){const p=s.patrons?.[party.patronId];if(p){p.loyalty=clamp(p.loyalty-9,0,100);p.disappointed++;}}
function talkToPatron(s,id,action='chat'){
 const p=s.patrons?.[id],profile=PATRON_PROFILES.find(x=>x.id===id);if(!p||!profile)return {ok:false,reason:'Unknown visitor'};
 if(!p.visits)return {ok:false,reason:'Wait until you meet this person at your alley'};
 if(p.lastTalk===s.day)return {ok:false,reason:'You already spent time with them today'};
 if(action==='invite'){
  if(!s.league.active||lanes(s)<6)return {ok:false,reason:'Start a six-lane Thursday league first'};
  if(p.visits<3||p.loyalty<55)return {ok:false,reason:'Build loyalty to 55 and welcome them at least 3 times'};
  p.leagueMember=true;p.loyalty=clamp(p.loyalty+5,0,100);
  note(s,`${profile.name} joined the Thursday league! “I even have matching socks.”`,'league');
 }else if(action==='treat'){
  if(!spend(s,12))return {ok:false,reason:'Not enough cash for the complimentary treat'};
  s.today.expenses=money(s.today.expenses+12);p.loyalty=clamp(p.loyalty+16,0,100);
  note(s,`You treated ${profile.name} to something special. ${profile.name}: “${profile.quote}”`,'feedback');
 }else if(action==='chat'){
  p.loyalty=clamp(p.loyalty+9,0,100);
  note(s,`You chatted with ${profile.name}: “${profile.quote}”`,'feedback');
 }else return {ok:false,reason:'Unknown interaction'};
 p.lastTalk=s.day;s.encounters=s.encounters.filter(e=>e.id!==id);return {ok:true};
}
function queueEncounter(s,p){
 if(!p?.patronId||s.lastEncounterDay===s.day||s.patrons?.[p.patronId]?.lastTalk===s.day||s.encounters.some(x=>x.id===p.patronId))return;
 const profile=PATRON_PROFILES.find(x=>x.id===p.patronId);if(!profile||roll(s)>.6)return;
 s.lastEncounterDay=s.day;s.encounters.push({id:profile.id,day:s.day});
}
const PATRON_DIALOGUES={
 lou:{prompt:'I knew Gus before the first perfect game. Should we hang up his old team photo?',yes:'Hang it up. Gus deserves a wall.',no:'Not until we renovate the place.'},
 bea:{prompt:'The league members want a snack special. Should I spread the word?',yes:'Absolutely! Make it a tradition.',no:'Tell them we are too busy.'},
 dex:{prompt:'I just got the high score. Will you put my name on a chalkboard?',yes:'You earned a spot on the board!',no:'We do not celebrate arcade scores.'},
 rosa:{prompt:'How about a little community night at the bar?',yes:'Bring your friends! We will plan one.',no:'Keep the bar quiet, please.'},
 nell:{prompt:'These bowling balls could use a careful cleaning. Mind if I help?',yes:'Yes, please! We love expert eyes.',no:'I think the equipment is fine.'},
 milo:{prompt:'My friends asked if we could get a group discount someday.',yes:'Tell them they are always welcome.',no:'No discounts. Ever.'}
};
function respondEncounter(s,id,answer){const e=s.encounters[0],p=s.patrons[id];if(!e||e.id!==id||!p)return {ok:false,reason:'That conversation is not available'};
 const profile=PATRON_PROFILES.find(x=>x.id===id),good=answer==='yes';if(!['yes','no','listen'].includes(answer))return {ok:false,reason:'Choose one of the answers'};
 const delta=answer==='listen'?(isBuilt(s,profile.wish)?7:3):good?12:-8;p.loyalty=clamp(p.loyalty+delta,0,100);p.lastTalk=s.day;s.encounters.shift();
 note(s,`${profile.name}: “${good?'You made my day!':answer==='listen'?'Thanks for hearing me out.':'Well, I suppose that is your call.'}” (${delta>0?'+':''}${delta} loyalty)`,'feedback');
 return {ok:true,delta};
}
function repairCost(s,id){return s.outages?.[String(id)]?.cost||0;}
function repairOutage(s,id){const broken=s.outages?.[String(id)];if(!broken)return {ok:false,reason:'Nothing is broken here'};
 const cost=s.emergencyCoverageUntil>=s.day?Math.ceil(broken.cost*.7):broken.cost;
 if(!spend(s,cost))return {ok:false,reason:`Repairs cost $${cost}. A community payment plan is also available.`};
 s.today.expenses=money(s.today.expenses+cost);delete s.outages[String(id)];log(s,`Repaired ${broken.name} for $${cost}.`);note(s,`🔧 ${broken.name} has reopened!`,'build');return {ok:true,cost};
}
function buyRoomDetail(s,id){const option=ROOM_DETAILS.find(x=>x.id===id);if(!option||!isBuilt(s,id))return {ok:false,reason:'Build this room first'};
 if(s.roomDetails[id])return {ok:false,reason:'Already installed'};if(!spend(s,option.cost))return {ok:false,reason:'Not enough cash'};
 s.roomDetails[id]=true;recordCharge(s,'capex',option.cost);s.rep=money(s.rep+.7);note(s,`${option.icon} Added ${option.name} to ${id}.`,'build');return {ok:true};}
function negotiatePartnership(s,id){const x=PARTNERSHIP_CATALOG.find(x=>x.id===id);if(!x)return {ok:false,reason:'Unknown partner'};
 if(s.partnerships[id])return {ok:false,reason:'Already partnered'};if(lanes(s)<x.minLanes||s.rep<x.minRep)return {ok:false,reason:`Needs ${x.minLanes} lanes and ${x.minRep} reputation`};
 if(!spend(s,x.cost))return {ok:false,reason:'Not enough cash for the sponsorship'};s.partnerships[id]=true;recordCharge(s,'marketingSpend',x.cost);s.rep=money(s.rep+(id==='charity'?5:2));
 note(s,`${x.icon} New partnership: ${x.name}. ${x.desc}`,'marketing');return {ok:true};}
function contractCollision(s,day,start,end){return (s.bookings||[]).some(b=>b.day===day&&b.status==='booked'&&start<b.end&&end>b.start)||!!(s.partyBooking&&s.partyBooking.day===day&&start<s.partyBooking.end&&end>s.partyBooking.start)||!!(s.league.active&&calendar(day).dayIndex===3&&start<20&&end>18);}
function bookContract(s,id,daysAhead=3,catering=false){const t=BOOKING_TYPES.find(x=>x.id===id);if(!t)return {ok:false,reason:'Unknown event type'};
 if(lanes(s)<t.minLanes)return {ok:false,reason:`Need ${t.minLanes} lanes for this event`};daysAhead=Number(daysAhead);if(!Number.isInteger(daysAhead)||daysAhead<2||daysAhead>14)return {ok:false,reason:'Book between 2 and 14 days ahead'};
 const day=s.day+daysAhead,start=id==='school'||id==='outreach'?15:18,end=start+2;if(!t.offsite&&contractCollision(s,day,start,end))return {ok:false,reason:'Another booking or league already uses that time'};
 const cateringCost=catering?t.cater:0;if(!spend(s,cateringCost))return {ok:false,reason:'Not enough money to prepare catering'};
 const deposit=t.deposit,remaining=t.total-deposit+(catering?t.bonus:0);
 s.cash=money(s.cash+deposit);s.earned=money(s.earned+deposit);s.today.partyIncome=money(s.today.partyIncome+deposit);s.today.income=money(s.today.income+deposit);
 if(cateringCost){s.today.expenses=money(s.today.expenses+cateringCost);s.today.net=money(s.today.income-s.today.expenses);}
 s.bookingSerial++;const booked={id:s.bookingSerial,type:id,name:t.name,day,start,end,deposit,remaining,catering:!!catering,offsite:!!t.offsite,paid:false,status:'booked'};
 s.bookings.push(booked);s.bookings=s.bookings.filter(b=>b.status==='booked'||b.day>=s.day-45);note(s,`📆 ${t.name} booked for Day ${day} (${formatHour(start)}–${formatHour(end)}). Deposit +$${deposit}.${catering?' Catering confirmed.':''}`,'league');return {ok:true,booking:booked};}
function hireEmergencyMechanic(s){return hireEmployee(s,'mechanic');}
function buyEmergencyCoverage(s){if(s.emergencyCoverageUntil>=s.day)return {ok:false,reason:'Already covered'};
 if(lanes(s)<2)return {ok:false,reason:'Open two lanes first'};if(!spend(s,160))return {ok:false,reason:'Coverage costs $160'};
 s.emergencyCoverageUntil=s.day+28;recordCharge(s,'capex',160);note(s,'🛡️ Emergency service coverage: 28 game days of discounted repairs.','staff');return {ok:true};}
function paymentPlanRepair(s,id){const outage=s.outages?.[String(id)];if(!outage)return {ok:false,reason:'No repairs needed'};
 if(s.hardshipUses>=2)return {ok:false,reason:'Your two community repair grants have already been used'};
 if(s.cash>=outage.cost)return {ok:false,reason:'Pay the standard repair fee when affordable'};
 const paid=Math.max(0,Math.min(s.cash,Math.floor(outage.cost*.25))),financed=outage.cost-paid;
 s.cash=money(s.cash-paid);s.loan.balance=money(s.loan.balance+financed);s.loan.payment=Math.max(35,s.loan.payment||35);s.hardshipUses++;
 delete s.outages[String(id)];s.rep=Math.max(0,money(s.rep-1));note(s,`❤️ Community repair assistance reopened ${outage.name}; $${financed} added to your loan. (${s.hardshipUses}/2 grants.)`,'staff');return {ok:true,financed};}
function respondToRival(s,choice){if(s.campaignStory?.path==='backalley')return {ok:false,reason:'This town is committed to the Back Alley campaign; use its security and influence options'};if(!['outreach','legal'].includes(choice))return {ok:false,reason:'Choose an appropriate response'};
 const cost=choice==='outreach'?145:260;if(!spend(s,cost))return {ok:false,reason:'Not enough cash'};
 recordCharge(s,'marketingSpend',cost);s.rival.pressure=Math.max(0,s.rival.pressure-(choice==='outreach'?16:28));s.rival.lastResponseDay=s.day;
 if(choice==='outreach'){s.rep=money(s.rep+3);s.rival.community+=1;}else s.rival.protectionUntil=s.day+21;
 note(s,choice==='outreach'?'❤️ The neighborhood rallied behind your alley.':'⚖️ A local attorney reviewed Vera’s threats; your business is protected for 21 days.','marketing');checkCampaignVictory(s);return {ok:true};}
function emergencyMechanicShift(s){if(!countStaff(s,'mechanic'))return;
 const outages=Object.entries(s.outages||{});if(!outages.length)return;
 if(s.parts<2&&s.cash>=45){s.parts+=5;s.cash=money(s.cash-45);s.today.expenses=money(s.today.expenses+45);note(s,'🧰 Emergency mechanic purchased five spare parts ($45).','staff');}
 for(const [id,o] of outages){if(s.parts<1)break;const cost=Math.max(12,Math.ceil(o.cost*(s.emergencyCoverageUntil>=s.day?.3:.55)));
  if(s.cash<cost)continue;s.cash=money(s.cash-cost);s.parts--;s.today.expenses=money(s.today.expenses+cost);delete s.outages[id];note(s,`🧰 The emergency mechanic reopened ${o.name} automatically for $${cost} and one spare part.`,'staff');}
}
function weeklyPartnerBenefit(s){if(calendar(s.day).dayIndex!==6)return;
 for(const p of PARTNERSHIP_CATALOG){if(!s.partnerships[p.id])continue;if(p.weekly)addIncome(s,'otherIncome',p.weekly);
  if(p.id==='charity')s.rep=money(s.rep+1);}
}
function checkVIPGroup(s){if(s.startupPending||lanes(s)<3||s.day<8||roll(s)>.10)return;
 const v=VIP_GROUPS[Math.floor(roll(s)*VIP_GROUPS.length)];const record=s.vipGroups[v.id];record.visits++;record.lastDay=s.day;
 const bonus=Math.round(24+v.boost*lanes(s));addIncome(s,'otherIncome',bonus);note(s,`${v.icon} ${v.name} returned! ${v.trait}. Group sales +$${bonus}.`,'feedback');
 if(record.visits===3){s.rep=money(s.rep+2);note(s,`${v.name} are now recognized VIP regulars! Reputation +2.`,'feedback');}
}
function secureSchoolPartnership(s){return negotiatePartnership(s,'school');}
function legacySchoolPartnership(s){
 if(s.partnerships?.school)return {ok:false,reason:'The local school partnership is already active'};
 if(lanes(s)<4)return {ok:false,reason:'Four lanes are needed before the local school can partner with you'};
 if(!spend(s,240))return {ok:false,reason:'Sponsorship costs $240'};
 s.partnerships.school=true;s.rep=money(s.rep+4);recordCharge(s,'marketingSpend',240);
 note(s,'🏫 Signed a local-school partnership. More youth and family visits Monday–Friday!','marketing');return {ok:true};
}
function respondPartyRequest(s,accept){const request=s.pendingPartyRequest;if(!request)return {ok:false,reason:'No booking request waiting'};
 if(accept&&contractCollision(s,request.day,request.start,request.end))return {ok:false,reason:'A league or signed contract already has those lanes. Decline this offer.'};
 if(accept){s.partyBooking={...request,status:'accepted'};note(s,`Booked ${request.name}: all lanes reserved ${formatHour(request.start)}–${formatHour(request.end)} on Day ${request.day}, for 2× the normal lane rate.`,'league');}
 else note(s,`Declined ${request.name}. Your regular visitors will have the lanes to themselves.`,'feedback');
 s.pendingPartyRequest=null;return {ok:true,accepted:!!accept};
}
function rollRandomEvent(s){
 if(s.startupPending||s.day<7||s.day-(s.lastRandomEventDay||-100)<5)return false;
 if(s.day%28===14&&s.lanes.length>0){const arc=SEASONAL_ARCS[(Math.floor(s.day/28))%SEASONAL_ARCS.length];const entry={id:'season-'+arc.id,title:arc.name,emoji:arc.emoji,kind:'good',text:arc.text,effect:arc.reward,day:s.day};s.lastRandomEventDay=s.day;s.eventQueue.push(entry);s.eventHistory.unshift(entry);s.eventHistory=s.eventHistory.slice(0,25);
  if(arc.id==='students'){s.eventBoostFactor=1.6;s.eventBoostUntil=s.day+2;}else if(arc.id==='retro')s.cash=money(s.cash+145);else{s.rep=money(s.rep+3);if(arc.id==='charity')for(const p of Object.values(s.patrons||{}))p.loyalty=clamp(p.loyalty+3,0,100);}
  note(s,`${arc.emoji} ${arc.name}: ${arc.text}`,'story');return true;}
 if(roll(s)>.20)return false;
 const eligible=EVENT_CATALOG.filter(e=>e.kind==='good'||e.kind==='rival'||e.id==='lane'&&s.lanes.length>0||e.id==='restrooms'&&s.fixtures.restrooms||s.built[e.id]);
 if(!eligible.length)return false;
 // Party invitations are also random events, and share the five-day cooldown.
 if(s.day>=9&&s.lanes.length>=2&&!s.pendingPartyRequest&&!s.partyBooking&&s.day-s.lastPartyRequestDay>=10&&roll(s)<.27){
  const name=PARTY_REQUEST_NAMES[Math.floor(roll(s)*PARTY_REQUEST_NAMES.length)];
  const day=s.day+2+(calendar(s.day+2).dayIndex===3?1:0),request={name,day,start:18,end:20,multiplier:2};
  s.pendingPartyRequest=request;s.lastPartyRequestDay=s.day;s.lastRandomEventDay=s.day;
  s.eventQueue.push({id:'party-request',title:'A big party wants your lanes!',emoji:'🎉',kind:'request',text:`${name} wants to reserve ALL ${lanes(s)} current lanes on Day ${day}, 6–8 PM. They offer DOUBLE normal lane income, but walk-ins may be annoyed.`,effect:'Accept or decline this booking.'});
  return true;
 }
 const chosen=eligible[Math.floor(roll(s)*eligible.length)];
 if(chosen.kind==='bad'&&activeOutage(s,chosen.id))return false;
 s.lastRandomEventDay=s.day;const entry={...chosen,day:s.day};
 if(chosen.kind==='rival'){
  s.rival.pressure=Math.min(100,s.rival.pressure+12);if(chosen.id==='pricewar'){s.eventBoostFactor=s.rival.protectionUntil>=s.day?.95:.72;s.eventBoostUntil=s.day+3;}
  else if(chosen.id==='smear')s.rep=Math.max(0,money(s.rep-(s.rival.community?1:3)));
  entry.effect+=' StrikeCity pressure '+s.rival.pressure+'/100. Go to Goals → Story to respond.';
 }else if(chosen.kind==='good'){
  if(['viral','school','mystery'].includes(chosen.id)){s.eventBoostFactor=chosen.id==='viral'?1.85:chosen.id==='mystery'?1.7:1.6;s.eventBoostUntil=s.day+2;}
  if(['review','neighborhood','nostalgia'].includes(chosen.id)){s.rep=money(s.rep+(chosen.id==='nostalgia'?2:3));s.happiness=clamp(s.happiness+(chosen.id==='neighborhood'?4:2),0,100);}
  if(['donation','birthday'].includes(chosen.id))s.cash=money(s.cash+(chosen.id==='birthday'?120:180));
  if(['supplier','partsbonus'].includes(chosen.id))s.parts+=5;
 }else{
  let id=chosen.id,name=chosen.title;if(id==='lane'){const open=s.lanes.filter(l=>!activeOutage(s,'lane'+l.id));if(!open.length)return false;id='lane'+open[Math.floor(roll(s)*open.length)].id;name='Lane '+id.slice(4);}
  else if(id==='snack')name='Snack Counter';else if(id==='bar')name='Bowling Bar';else if(id==='arcade')name='Arcade';else if(id==='restrooms')name='Guest Restrooms';
  const cost=id.startsWith('lane')?55: id==='restrooms'?60:90;
  s.outages[id]={name,cost,day:s.day};entry.repairId=id;entry.effect+=` Repair cost: $${cost}.`;
 }
 s.eventQueue.push(entry);s.eventHistory.unshift(entry);s.eventHistory=s.eventHistory.slice(0,25);
 note(s,`${entry.emoji} ${entry.title}: ${entry.text}`,'feedback');
 return true;
}
function newDayStats(day){return {partyIncome:0,partyHeld:false,eventNotes:[],satisfied:0,unhappy:0,happinessDelta:0,loanPayment:0,techServices:0,techPartsBought:0,techExpenses:0,laneHours:0,day,week:calendar(day).week,weekday:calendar(day).weekday,arcadePlays:0,leagueIncome:0,leagueHeld:false,leagueHours:0,arrivals:0,served:0,left:0,waited:0,benchSaves:0,spentOnSnacks:0,snackOrders:0,snackMisses:0,barOrders:0,barMisses:0,walkIns:0,staffPay:0,laneIncome:0,shoeIncome:0,snackIncome:0,barIncome:0,otherIncome:0,marketingSpend:0,capex:0,expenses:0,income:0,net:0,groups:[],feedback:[],events:[]};}
function newGame(seed=271828){return {version:15,locationName:'Gus’s Town',portfolio:{activeId:'home',snapshots:{},opened:[]},campaignStory:newCampaign(),bookings:[],bookingSerial:0,roomDetails:{},vipGroups:Object.fromEntries(VIP_GROUPS.map(g=>[g.id,{visits:0,lastDay:0}])),hardshipUses:0,emergencyCoverageUntil:0,rival:{pressure:0,community:0,protectionUntil:0,lastResponseDay:0},story:freshStory(),patrons:freshPatrons(),seed:seed>>>0,laneRotation:0,storyCursor:0,day:1,hour:OPEN,cash:600,startupPending:true,startupFinance:null,starterStyle:null,loan:{balance:0,payment:0,initial:0,lastPaymentDay:0},happiness:65,happinessHistory:[],specialty:null,landOwned:false,expansionStage:0,outages:{},lastRandomEventDay:-100,eventBoostUntil:0,eventBoostFactor:1,eventQueue:[],eventHistory:[],lastPartyRequestDay:-100,pendingPartyRequest:null,partyBooking:null,lastEncounterDay:0,encounters:[],partnerships:{school:false,teams:false,charity:false,office:false,neighbors:false},earned:0,rep:0,totalServed:0,minVenueLevel:1,
 built:{roof:true},lanes:[],parts:4,benches:0,construction:[],facilityNotices:[],campaign:null,barStock:0,barPrice:9,barVisits:0,barStockById:Object.fromEntries(DRINKS.map(i=>[i.id,0])),barPrices:Object.fromEntries(DRINKS.map(i=>[i.id,i.price])),arcadeVisits:0,arcadeMachines:{},fixtures:{},wallPaint:'original',league:{active:false,season:0,sessions:0,totalRevenue:0,lastDay:0},nextDayCharges:{capex:0,marketingSpend:0},
 roomPlacements:{},roomTiers:{},roomVisits:{snack:0,bar:0,arcade:0,proshop:0},snackStock:{soda:0,popcorn:0,hotdog:0,pizza:0,nachos:0,pretzel:0,icecream:0,fries:0,burger:0,cheeseburger:0},snackPrices:Object.fromEntries(SNACKS.map(x=>[x.id,x.price])),
 pricing:{lane:18,shoes:3},deliveries:[],lowStockThreshold:3,employees:[],employeeSerial:0,partyCounter:0,queue:[],active:[],sceneGroups:[],
 today:newDayStats(1),lastDay:newDayStats(0),dayReports:[],latestEvents:[],
 ownerXP:0,ownerPoints:0,ownerSkills:{manager:0,coach:0,promoter:0},practiceLeft:3,practiceStreak:0,
 bowlers:[{id:'maya',name:'Maya',focus:22,aim:24,spare:22,power:20,ball:false},{id:'leo',name:'Leo',focus:20,aim:22,spare:19,power:24,ball:false}],
 tournamentWins:{},tournamentCooldown:{},log:['Day 1 · Grandpa Gus left an empty bowling center and a letter. His dream starts here.']};}
function log(s,text){s.log.unshift(`Day ${s.day} · ${text}`);s.log=s.log.slice(0,60);}
function note(s,text,type='visit',partyId=null){const e={hour:s.hour,minute:0,text,type,partyId};s.today.events.push(e);s.latestEvents.push(e);s.latestEvents=s.latestEvents.slice(-30);}
function spend(s,amount){if(s.cash<amount)return false;s.cash=money(s.cash-amount);return true;}
function grantXP(s,n){const before=Math.floor(s.ownerXP/60);s.ownerXP+=n;s.ownerPoints+=Math.floor(s.ownerXP/60)-before;}
function isBuilding(s,id){return s.construction.some(j=>j.kind==='upgrade'&&j.id===id);}
function recordCharge(s,kind,value){if(s.hour===CLOSE)s.nextDayCharges[kind]+=value;else{s.today[kind]+=value;if(kind==='marketingSpend'){s.today.expenses+=value;s.today.net=money(s.today.income-s.today.expenses);}}}
function canBuild(s,id){const u=getUpgrade(id),wing=NEW_ATTRACTIONS.find(a=>a.id===id);return (!wing||expansionStage(s)>=wing.minExpansion)&&!!u&&!isBuilt(s,id)&&!isBuilding(s,id)&&u.requires.every(x=>isBuilt(s,x))&&s.cash>=u.cost&&(!ROOM_IDS.includes(id)||!!s.roomPlacements[id]||!!findRoomPlacement(s,id,footprint(s,id)));}
function build(s,id){const u=getUpgrade(id);if(!u)return {ok:false,reason:'Unknown improvement'};
 if(isBuilt(s,id))return {ok:false,reason:'Already built'};if(isBuilding(s,id))return {ok:false,reason:'Already under construction'};
 if(!u.requires.every(x=>isBuilt(s,x)))return {ok:false,reason:'Finish the required room first'};
 const wing=NEW_ATTRACTIONS.find(a=>a.id===id);if(wing&&expansionStage(s)<wing.minExpansion)return {ok:false,reason:`Purchase Wing ${wing.minExpansion} to unlock ${wing.title}`};
 if(s.cash<u.cost)return {ok:false,reason:'Not enough money'};
 if(ROOM_IDS.includes(id)&&!ensureRoom(s,id))return {ok:false,reason:'No room on the layout. Move another room first.'};
 spend(s,u.cost);
 recordCharge(s,'capex',u.cost);
 s.construction.push({kind:'upgrade',id,title:u.title,remaining:u.days,total:u.days,startDay:s.day});
 log(s,`Started ${u.title}; ${u.days} game days of construction.`);return {ok:true,days:u.days};}
function buyLane(s){if(lanes(s)+pendingLanes(s)>=laneCapacity(s))return {ok:false,reason:'All lane slots on this lot are filled. Buy neighboring land to expand.'};
 const cost=nextLaneCost(s);if(!spend(s,cost))return {ok:false,reason:'Not enough money'};
 recordCharge(s,'capex',cost);const id=lanes(s)+pendingLanes(s)+1;
 s.construction.push({kind:'lane',id:'lane'+id,title:'Lane '+id,remaining:2,total:2,startDay:s.day});
 log(s,`Started lane ${id}; two game days until opening.`);return {ok:true,days:2};}
function benchCost(s){return 70+s.benches*55;}
function buyBench(s){if(s.benches>=3)return {ok:false,reason:'All three waiting benches are installed'};
 const cost=benchCost(s);if(!spend(s,cost))return {ok:false,reason:'Not enough money'};
 s.benches++;recordCharge(s,'capex',cost);grantXP(s,4);note(s,`Installed waiting bench ${s.benches}. Guests now have more comfortable places to wait.`,'build');return {ok:true};}
function advertise(s,id){const c=CAMPAIGNS.find(x=>x.id===id);if(!c)return {ok:false,reason:'Unknown advertisement'};
 if(activeCampaign(s)||(s.campaign&&s.campaign.endDay>=s.day))return {ok:false,reason:'Another campaign is still running'};
 if(!spend(s,c.cost))return {ok:false,reason:'Not enough money'};
 recordCharge(s,'marketingSpend',c.cost);const first=s.hour===CLOSE?s.day+1:s.day;
 s.campaign={id,title:c.title,boost:c.boost,startDay:first,endDay:first+c.days-1};
 note(s,`Launched ${c.title}; more visitors expected through day ${s.campaign.endDay}.`,'marketing');return {ok:true};}
function finishSingleConstruction(s,j){
 if(j.kind==='lane'){s.lanes.push({id:s.lanes.length+1,condition:96,kits:{},theme:'classic',animationUnlocked:false});s.rep+=1;}
 else if(j.kind==='land'){s.expansionStage=Math.min(5,expansionStage(s)+1);s.landOwned=true;s.rep+=5;note(s,`Property Wing ${s.expansionStage} is OPEN! ${laneCapacity(s)} total lanes and ${roomRows(s)} rows of shops are now available.`,'build');}
 else if(j.kind==='roomExpand'){s.roomTiers[j.id]=2;s.rep+=3;if(j.id==='snack'){s.snackStock.pretzel+=8;s.snackStock.icecream+=8;}if(j.id==='bar'){s.barStockById.cider+=5;s.barStock+=5;}note(s,`${j.title} now offers more variety and room for customers.`,'build');}
 else{s.built[j.id]=true;if(j.id==='snack'){s.snackStock.soda+=8;s.snackStock.popcorn+=6;s.snackStock.fries+=5;}if(j.id==='bar'){s.barStockById.beer+=8;s.barStockById.wine+=6;s.barStock=14;}if(j.id==='arcade')s.arcadeMachines.pinball=true;s.rep+=j.id==='roof'?4:3;}
 if((j.kind==='upgrade'&&['snack','bar','arcade','proshop'].includes(j.id))||(j.kind==='roomExpand'&&['snack','bar','arcade','proshop'].includes(j.id))){
  s.facilityNotices??=[];s.facilityNotices.push({id:j.id,tier:j.kind==='roomExpand'?2:1,title:j.title,day:s.day});
 }
 grantXP(s,12);advanceStory(s);note(s,`Construction complete: ${j.title}! Available next morning.`,'build');log(s,`Completed ${j.title}.`);
}
function finishConstruction(s){const left=[];for(const j of s.construction){j.remaining--;if(j.remaining>0)left.push(j);else finishSingleConstruction(s,j);}s.construction=left;}
const EMPLOYEE_ROLES={mechanic:{name:'Emergency Mechanic',fee:320,wage:25},snack:{name:'Snack Counter',fee:48,wage:12},bar:{name:'Bowling Bar',fee:58,wage:14},proshop:{name:'Pro Shop',fee:68,wage:15},stocker:{name:'Stock Clerk',fee:100,wage:16}};
const EMPLOYEE_NAMES=['Jo','Rae','Pat','Dani','Max','Kit','Sky','Bev','Toni','Jules','Frankie','Nico'];
function neededStaff(s,role){if(role==='stocker'||role==='mechanic')return 1;if(!isBuilt(s,role))return 0;return s.roomTiers[role]===2?2:1;}
function countStaff(s,role){return (s.employees||[]).filter(e=>e.role===role).length;}
function staffed(s,role){return !activeOutage(s,role)&&countStaff(s,role)>=neededStaff(s,role)&&neededStaff(s,role)>0;}
function hireEmployee(s,role){const r=EMPLOYEE_ROLES[role];if(!r)return {ok:false,reason:'Unknown position'};
 if(role==='mechanic'&&lanes(s)<2)return {ok:false,reason:'Open two lanes before hiring the emergency mechanic'};
 if(role==='stocker'&&!isBuilt(s,'snack')&&!isBuilt(s,'bar'))return {ok:false,reason:'Open a snack counter or bar first'};
 if(!['stocker','mechanic'].includes(role)&&!isBuilt(s,role))return {ok:false,reason:'Build that facility first'};
 if(countStaff(s,role)>=neededStaff(s,role))return {ok:false,reason:'All positions are filled'};
 if(!spend(s,r.fee))return {ok:false,reason:'Not enough cash for hiring and training'};
 s.employeeSerial++;const name=EMPLOYEE_NAMES[(s.employeeSerial-1)%EMPLOYEE_NAMES.length];
 s.employees.push({id:s.employeeSerial,name,role,wage:r.wage,morale:78,skill:1});recordCharge(s,'capex',r.fee);
 note(s,`${name} joined the ${r.name.toLowerCase()} team. Welcome aboard!`,'staff');return {ok:true};}
function setWage(s,id,v){const e=s.employees.find(x=>x.id===Number(id));v=Number(v);if(!e)return {ok:false,reason:'Staff member not found'};
 if(!Number.isInteger(v)||v<8||v>32)return {ok:false,reason:'Daily wages must be $8–$32'};
 e.wage=v;return {ok:true};}
function trainEmployee(s,id){const e=s.employees.find(x=>x.id===Number(id));if(!e)return {ok:false,reason:'Staff member not found'};
 if(e.skill>=3)return {ok:false,reason:'Already fully trained'};let cost=65+e.skill*35;if(!spend(s,cost))return {ok:false,reason:'Not enough cash'};
 e.skill++;e.morale=clamp(e.morale+12,0,100);recordCharge(s,'capex',cost);note(s,`${e.name} completed training (Lv ${e.skill}).`,'staff');return {ok:true};}
function setStockThreshold(s,n){n=Number(n);if(!Number.isInteger(n)||n<1||n>12)return {ok:false,reason:'Choose a trigger between 1 and 12'};s.lowStockThreshold=n;return {ok:true};}
function incoming(s,type,id){return (s.deliveries||[]).reduce((n,j)=>n+(j.kind===type&&j.id===id?j.amount:0),0);}
function processDeliveries(s){const later=[];
 for(const d of s.deliveries){if(d.arriveDay>s.day){later.push(d);continue;}
  if(d.kind==='snack'){s.snackStock[d.id]=(s.snackStock[d.id]||0)+d.amount;}
  else if(d.kind==='bar'){s.barStockById[d.id]=(s.barStockById[d.id]||0)+d.amount;}
  note(s,`Delivery! ${d.amount} × ${d.name} arrived and went onto the shelves.`,'delivery');
 }
 s.deliveries=later;s.barStock=Object.values(s.barStockById).reduce((a,b)=>a+b,0);
}
function orderStock(s,kind,id,amount,cost,name){if(!spend(s,cost))return {ok:false,reason:'Not enough cash for the order'};
 s.deliveries.push({kind,id,amount,name,cost,arriveDay:s.day+1});
 // Supplies are operating purchases when ordered; no second charge at delivery.
 s.today.expenses=money(s.today.expenses+cost);s.today.net=money(s.today.income-s.today.expenses);
 note(s,`Ordered ${amount} × ${name}. Delivery tomorrow morning — not magically teleported!`,'order');return {ok:true,arriveDay:s.day+1};}
function payStaff(s){let total=0;
 for(const e of s.employees){total+=e.wage;const base=EMPLOYEE_ROLES[e.role].wage;
  e.morale=clamp(e.morale+(e.wage>=base+3?2:e.wage>=base?1:e.wage<base-2?-4:-2)+(e.skill>=2?1:0),15,100);
  if(e.morale<40&&s.day%3===0)note(s,`${e.name}: "Love my job. It's the paycheck I'm trying to meet."`,'feedback');
 }
 if(isBuilt(s,'staff'))total+=16; // daily Lane Technician contract, separate from servicing and spare parts
 total=money(total);s.today.staffPay=total;s.today.expenses=money(s.today.expenses+total);s.cash=money(s.cash-total);}
function drinkUnlocked(s,id){const i=DRINKS.find(x=>x.id===id);return !!(i&&isBuilt(s,'bar')&&s.barVisits>=i.visits&&venueLevel(s)>=i.level&&(!i.expandedOnly||s.roomTiers.bar===2));}
function restockDrink(s,id){const i=DRINKS.find(x=>x.id===id);if(!drinkUnlocked(s,id))return {ok:false,reason:'Drink not unlocked yet'};return orderStock(s,'bar',id,i.pack,i.cost,i.name);}
function setDrinkPrice(s,id,v){const i=DRINKS.find(x=>x.id===id);v=Number(v);if(!i||!Number.isInteger(v)||v<i.price-2||v>i.price+5)return {ok:false,reason:'Price outside permitted range'};s.barPrices[id]=v;return {ok:true};}
function restockBar(s){return restockDrink(s,'beer');}
function setBarPrice(s,v){return setDrinkPrice(s,'beer',v);}
function machineUnlocked(s,id){const i=MACHINES.find(x=>x.id===id);return !!(i&&isBuilt(s,'arcade')&&s.arcadeVisits>=i.plays&&venueLevel(s)>=i.level&&(!i.expandedOnly||s.roomTiers.arcade===2));}
function buyMachine(s,id){const i=MACHINES.find(x=>x.id===id);if(!machineUnlocked(s,id))return {ok:false,reason:'Machine not unlocked yet'};if(s.arcadeMachines[id])return {ok:false,reason:'Already owned'};const cap=s.roomTiers.arcade===2?5:3;if(Object.values(s.arcadeMachines).filter(Boolean).length>=cap)return {ok:false,reason:'Expand the arcade to fit more machines'};if(!spend(s,i.cost))return {ok:false,reason:'Not enough cash'};s.arcadeMachines[id]=true;recordCharge(s,'capex',i.cost);note(s,`Installed ${i.name} in the arcade.`,'build');return {ok:true};}
function buyFixture(s,id){const i=FIXTURES.find(x=>x.id===id);if(!i)return {ok:false,reason:'Unknown improvement'};if(s.fixtures[id])return {ok:false,reason:'Already installed'};if(!spend(s,i.cost))return {ok:false,reason:'Not enough cash'};s.fixtures[id]=true;recordCharge(s,'capex',i.cost);s.rep=money(s.rep+(id==='wallart'||id==='neon'?1.5:.8));note(s,`Installed ${i.name}.`,'build');return {ok:true};}
function paintWall(s,id){const i=PAINTS.find(x=>x.id===id);if(!i)return {ok:false,reason:'Unknown paint'};if(id===s.wallPaint)return {ok:false,reason:'Already using this color'};if(!spend(s,i.cost))return {ok:false,reason:'Not enough cash'};s.wallPaint=id;recordCharge(s,'capex',i.cost);note(s,`Painted the walls ${i.name}.`,'build');return {ok:true};}
function startLeague(s){if(lanes(s)<6)return {ok:false,reason:'Build all six lanes first'};if(s.league.active)return {ok:false,reason:'Weekly league is already active'};if(!spend(s,200))return {ok:false,reason:'League registration and promotion costs $200'};s.league.active=true;advanceStory(s);s.league.season++;s.league.sessions=0;s.league.lastDay=0;recordCharge(s,'capex',200);note(s,'Thursday Night League registrations opened! All six lanes are reserved Thursday 6–8 PM.','league');return {ok:true};}
function snackUnlocked(s,id){const item=SNACKS.find(x=>x.id===id);return !!(item&&isBuilt(s,'snack')&&venueLevel(s)>=item.level&&(s.roomVisits.snack||0)>=(item.visits||0)&&(!item.expandedOnly||s.roomTiers.snack===2));}
function restockSnack(s,id){const item=SNACKS.find(x=>x.id===id);if(!item)return {ok:false,reason:'Unknown menu item'};
 if(!snackUnlocked(s,id))return {ok:false,reason:`Unlock at level ${item.level} and after ${item.visits||0} snack orders`};return orderStock(s,'snack',id,item.pack,item.cost,item.name);}
function buyParts(s){if(!spend(s,45))return {ok:false,reason:'Not enough money'};s.parts+=5;log(s,'Bought 5 spare parts.');return {ok:true};}
function technicianShift(s){
 if(!isBuilt(s,'staff')||!s.lanes.length)return;
 const needsRepair=s.lanes.some(l=>l.condition<=70);
 // Stock up only when it is useful; leave cash for the labor charge.
 if((s.parts<=2||needsRepair&&s.parts===0)&&s.cash>=65){
  s.cash=money(s.cash-45);s.parts+=5;s.today.techPartsBought+=5;s.today.techExpenses=money(s.today.techExpenses+45);s.today.expenses=money(s.today.expenses+45);
  note(s,'🔧 The lane technician automatically purchased a 5-pack of spare parts ($45).','staff');
 }
 for(const lane of s.lanes){
  if(lane.condition>70||s.parts<1||s.cash<20)continue;
  lane.condition=clamp(money(lane.condition+34),0,100);s.parts--;s.cash=money(s.cash-20);s.today.techServices++;s.today.techExpenses=money(s.today.techExpenses+20);s.today.expenses=money(s.today.expenses+20);
  note(s,`🔧 Technician serviced lane ${lane.id} automatically (+34 condition, $20).`,'staff');
 }
 if(needsRepair&&s.lanes.some(l=>l.condition<=70))note(s,'🔧 Technician needs more spare parts or operating cash to finish the lane repairs.','staff');
}
function serviceLane(s,id){const lane=s.lanes.find(x=>x.id===Number(id));if(!lane)return {ok:false,reason:'Lane not found'};
 if(lane.condition>=98)return {ok:false,reason:'Lane is in great condition'};if(s.parts<1)return {ok:false,reason:'Restock spare parts first'};
 if(!spend(s,20))return {ok:false,reason:'Service costs $20'};
 s.parts-=1;lane.condition=clamp(lane.condition+34,0,100);log(s,`Serviced lane ${lane.id} (+34 condition).`);return {ok:true};}
function setPrice(s,key,value){const limits={lane:[10,35],shoes:[0,8]},range=limits[key],num=Number(value);
 if(!range||!Number.isFinite(num)||!Number.isInteger(num)||num<range[0]||num>range[1])return {ok:false,reason:'Price outside permitted range'};
 s.pricing[key]=num;return {ok:true};}
function setSnackPrice(s,id,value){const item=SNACKS.find(x=>x.id===id),num=Number(value);if(!item||!Number.isInteger(num)||num<item.price-2||num>item.price+4)return {ok:false,reason:'Invalid snack price'};
 s.snackPrices[id]=num;return {ok:true};}
function restockAuto(s){if(!countStaff(s,'stocker'))return;
 const buffer=s.lowStockThreshold||3;
 for(const item of SNACKS)if(snackUnlocked(s,item.id)&&s.snackStock[item.id]+incoming(s,'snack',item.id)<=buffer&&s.cash>=item.cost+70)restockSnack(s,item.id);
 for(const i of DRINKS)if(drinkUnlocked(s,i.id)&&s.barStockById[i.id]+incoming(s,'bar',i.id)<=buffer&&s.cash>=i.cost+70)restockDrink(s,i.id);
}
function newParty(s){s.partyCounter++;
 const loyal=PATRON_PROFILES.filter(p=>s.patrons?.[p.id]?.visits>0),weight=Math.min(.34,.12+loyal.length*.028);
 const pick=roll(s)<weight?PATRON_PROFILES[Math.floor(roll(s)*PATRON_PROFILES.length)]:null;
 return {id:s.partyCounter,patronId:pick?.id||null,name:pick?.name||GUEST_NAMES[Math.floor(roll(s)*GUEST_NAMES.length)],size:2+Math.floor(roll(s)*3),waited:0};}
function walkIn(s){const choices=[];if(staffed(s,'snack'))choices.push('snack');if(staffed(s,'bar'))choices.push('bar');if(isBuilt(s,'arcade'))choices.push('arcade');if(staffed(s,'proshop'))choices.push('shop');for(const x of NEW_ATTRACTIONS)if(s.built[x.id]&&!activeOutage(s,x.id))choices.push(x.id);
 if(!choices.length)return;
 const p=newParty(s),dest=choices[Math.floor(roll(s)*choices.length)];s.today.arrivals++;s.today.walkIns++;greetPatron(s,p,'walkin');
 note(s,`${groupText(p)} popped in just for ${dest==='snack'?'a bite':dest==='bar'?'a drink':dest==='arcade'?'the arcade':'some gear'} — no bowling tonight.`,'arrival',p.id);
 if(dest==='snack')maybeSnack(s,p,'walkin');else if(dest==='bar')maybeBar(s,p,'walkin');else if(dest==='arcade')maybeArcade(s,p);
 else if(dest==='shop'){addIncome(s,'otherIncome',s.roomDetails.proshop?17:12);s.roomVisits.proshop++;note(s,`${groupText(p)} bought pro-shop supplies (+$12).`,'shop',p.id);}else{const room=NEW_ATTRACTIONS.find(x=>x.id===dest);if(room){const income=room.fee+(s.roomDetails[dest]?Math.round(room.fee*.2):0);addIncome(s,'otherIncome',income);s.roomVisits[dest]=(s.roomVisits[dest]||0)+1;note(s,`${groupText(p)} visited ${room.title} (+$${income}).`,dest,p.id);}}
}
function groupText(p){return `${p.name}'s group (${p.size})`;}
// Expected bowling groups per hour, not a near-guaranteed arrival on each of three rolls.
// Early days are quiet; demand grows with track record, investment and promotion.
function chanceOfArrival(s){
 const loyal=s.patrons?Object.values(s.patrons).filter(p=>p.visits>=3&&p.loyalty>=35).length:0;
 const n=lanes(s),openRooms=['snack','bar','arcade','proshop'].filter(id=>s.built[id]).length;
 const reputation=Math.min(.70,Math.max(0,s.rep)/100*.70);
 const regulars=Math.min(.46,(s.totalServed||0)/110*.46);
 const capacity=Math.max(0,n-1)*.17;
 const investments=GUEST_TRAFFIC_BONUS(s,openRooms);
 const marketing=(activeCampaign(s)?.boost||0)*2.2;
 const specialty=s.specialty==='community'?.15:s.specialty==='family'?.12:.06;
 const pricePenalty=Math.max(-.18,((s.pricing.lane-18)/18)*.38+((s.pricing.shoes-3)/3)*.13);
 return clamp(.24+reputation+regulars+loyal*.035+capacity+investments+marketing+specialty-pricePenalty,.06,4.25);
}
function trafficMultiplier(s){
 const dow=calendar(s.day).dayIndex, dayFactor=[.70,.78,.85,.96,1.24,1.42,1.20][dow];
 const clockFactor= s.hour<16?.48:s.hour<18?.74:s.hour<20?1.17:1.37;
 const partnerFactor=PARTNERSHIP_CATALOG.reduce((n,p)=>n*(s.partnerships?.[p.id]&&(p.id!=='school'||dow<=4)?1+p.boost:1),1);
 const rivalFactor=s.rival?.protectionUntil>=s.day?1:Math.max(.83,1-(s.rival?.pressure||0)*.002);
 const eventFactor=(s.eventBoostUntil>=s.day?(s.eventBoostFactor||1):1)*partnerFactor*rivalFactor;
 return dayFactor*clockFactor*eventFactor;
}
function GUEST_TRAFFIC_BONUS(s,openRooms){return openRooms*.10+Math.max(0,alleyStars(s)-1)*.12+(isBuilt(s,'lights')?.18:0)+s.ownerSkills.promoter*.16+(s.fixtures.neon?.06:0);}
function addIncome(s,category,amount){s.today[category]+=amount;s.today.income+=amount;s.cash=money(s.cash+amount);s.earned+=amount;}
function serviceFactor(s,role){const team=s.employees.filter(e=>e.role===role);if(!team.length)return .7;let happiness=team.reduce((n,e)=>n+e.morale,0)/team.length,skill=team.reduce((n,e)=>n+e.skill,0)/team.length;return clamp(.75+skill*.075+(happiness-70)/330,.55,1.12);}
function maybeSnack(s,p,reason){if(!isBuilt(s,'snack')||activeOutage(s,'snack')){if(roll(s)<.34)s.today.snackMisses++;return;}if(!staffed(s,'snack')){if(roll(s)<.25)note(s,`${groupText(p)} found the snack counter closed. The popcorn apparently doesn't sell itself.`,'feedback',p.id);return;}
 if(roll(s)>(reason==='wait'?.33:reason==='walkin'?.88:.52)*serviceFactor(s,'snack'))return;
 const eligible=SNACKS.filter(i=>snackUnlocked(s,i.id));if(!eligible.length)return;
 const item=eligible[Math.floor(roll(s)*eligible.length)];if(s.snackStock[item.id]<=0){s.today.snackMisses++;note(s,`${groupText(p)} wanted ${item.name.toLowerCase()}, but it was sold out.`,'feedback',p.id);return;}
 s.snackStock[item.id]--;const price=s.snackPrices[item.id];addIncome(s,'snackIncome',price+(s.roomDetails.snack?2:0));s.today.snackOrders++;s.today.spentOnSnacks+=price;
 note(s,`${groupText(p)} bought ${item.name.toLowerCase()} (+$${price}).`,'snack',p.id);s.roomVisits.snack++;if(p.patronId==='bea')s.patrons.bea.loyalty=clamp(s.patrons.bea.loyalty+3,0,100);
}
function maybeBar(s,p,reason){if(!isBuilt(s,'bar')||activeOutage(s,'bar')||!staffed(s,'bar')||roll(s)>((reason==='wait'?.26:reason==='walkin'?.88:.39)+(s.roomTiers.bar===2?.12:0))*serviceFactor(s,'bar'))return;
 const unlocked=DRINKS.filter(i=>drinkUnlocked(s,i.id));if(!unlocked.length)return;
 const stocked=unlocked.filter(i=>s.barStockById[i.id]>0);if(!stocked.length){s.today.barMisses++;note(s,`${groupText(p)} found the bar out of drinks.`,'feedback',p.id);return;}
 const drink=stocked[Math.floor(roll(s)*stocked.length)];s.barStockById[drink.id]--;s.barStock=Math.max(0,s.barStock-1);const price=s.barPrices[drink.id];addIncome(s,'barIncome',price+(s.specialty==='lounge'?2:0)+(s.roomDetails.bar?2:0));s.today.barOrders++;s.barVisits++;s.roomVisits.bar++;if(p.patronId==='rosa')s.patrons.rosa.loyalty=clamp(s.patrons.rosa.loyalty+3,0,100);
 note(s,`${groupText(p)} ordered ${drink.name.toLowerCase()} at the bar (+$${price}).`,'bar',p.id);}
function maybeArcade(s,p){if(!isBuilt(s,'arcade')||activeOutage(s,'arcade')||roll(s)>.88)return;const owned=MACHINES.filter(i=>s.arcadeMachines[i.id]);if(!owned.length)return;
 const machine=owned[Math.floor(roll(s)*owned.length)];addIncome(s,'otherIncome',machine.fee+(s.roomDetails.arcade?1:0));s.today.arcadePlays++;s.arcadeVisits++;s.roomVisits.arcade++;if(p.patronId==='dex')s.patrons.dex.loyalty=clamp(s.patrons.dex.loyalty+3,0,100);note(s,`${groupText(p)} played ${machine.name} (+$${machine.fee}).`,'arcade',p.id);}
function serve(s,p,free){
 // Rotate lane assignments so even quieter alleys use lanes 4, 5 and 6.
 const rotation=s.laneRotation||0;const pick=free.findIndex(l=>l.id>rotation);const lane=free.splice(pick>=0?pick:0,1)[0];
 s.laneRotation=lane.id;
 const rollDuration=roll(s);const desiredHours=rollDuration<.34?1:rollDuration<.77?2:3;
 const bookingStart=s.partyBooking?.status==='accepted'&&s.partyBooking.day===s.day?s.partyBooking.start:CLOSE;
 const leagueStart=s.league.active&&calendar(s.day).dayIndex===3&&lane.id<=6?18:CLOSE;
 const hours=Math.max(1,Math.min(desiredHours,CLOSE-s.hour,bookingStart>s.hour?bookingStart-s.hour:CLOSE-s.hour,leagueStart>s.hour?leagueStart-s.hour:CLOSE-s.hour));
 const fare=s.pricing.lane,shoe=s.pricing.shoes*p.size;addIncome(s,'laneIncome',fare);s.today.laneHours++;addIncome(s,'shoeIncome',shoe);
 if(laneKit(lane,'return')){s.today.happyReturns=(s.today.happyReturns||0)+1;}
 greetPatron(s,p,'bowling');s.active.push({party:p,laneId:lane.id,ends:s.hour+hours,hours});s.today.served++;s.totalServed++;s.today.groups.push({id:p.id,name:p.name,size:p.size,lane:lane.id,waited:p.waited,hours});
 note(s,`${groupText(p)} checked in${p.waited?' after waiting '+p.waited+' hr':''}; booked lane ${lane.id} for ${hours} hour${hours===1?'':'s'}.`,'bowling',p.id);
 if(p.waited)s.today.waited++;maybeSnack(s,p,'start');maybeBar(s,p,'start');maybeArcade(s,p);if(s.fixtures.lockers&&roll(s)<.35)addIncome(s,'otherIncome',4);
}
const ALLEY_GOSSIP=[
 'My bowling ball has better social skills than I do.','That strike was brought to you by blind luck.','Who put the gutter there? I was AIMING for that.','My split has its own zip code.','I bowl better when nobody is watching. So, never.','Can we order confidence by the pitcher?','I promised myself I would not celebrate a seven. Here we are.','The pins moved. I have witnesses.','That was a practice throw. Every throw is a practice throw.','I think my rental shoes are judging me.','Call the pro shop: I need a new personality.','If bowling were easy, my uncle would still find a way to complain.','My lucky socks filed for unemployment.','Bowling is 10% skill and 90% pointing at the pins.','We are technically a professional team in our own group chat.','The snack counter deserves a trophy.','My bowling name is The Spare Apparent.','I would like to challenge the pinsetter to a rematch.','I threw a curve ball. The ball did not get the memo.','Do the pins accept apologies?','That ball took the scenic route.','Who turned up gravity on this lane?','I got ten! Across three frames!','My strategy is to intimidate the ball.','We should rename this lane Emotional Damage.','I have bowled worse, but only on television.','Let the record show: the lane started it.','My ball wants a transfer to another team.','That was supposed to be a trick shot.','Is it too late to switch to darts?','Someone please turn on the strike magnet.','My high score is classified information.','I think the ball just unfollowed me.','The tenth frame has betrayed my entire family.','The secret is a dramatic follow-through. The result is optional.','I can hear the gutter laughing at me.','A three-hour bowling session counts as cardio, right?','My bowling coach is a YouTube comment.','I call that one the accidental masterpiece.','The pins are unionizing against me.'
];
const NOIR_GOSSIP=[
 'That dark car has circled three times. Maybe it just really likes bowling.','The midnight league is getting a little too mysterious.','My strike was clean. The paperwork? Not so much.','Every alley has secrets. Ours has spare shoes.','Keep your head down, your score up and your receipts neat.','I came for bowling, not a noir detective story.','The bouncer said my split was suspicious.','That neon sign makes everybody look like a suspect.','Nobody asked about the envelope. Not even the pins.','StrikeCity thinks it owns the night. We own the ball returns.','Is that a mystery person or just Lou in a trench coat?','I heard the town is choosing sides. The lanes are neutral.','I trust the bartender, but not the seventh frame.','The security cameras caught my worst gutter ball. Evidence destroyed, please.','I know a guy who knows a guy who can bowl a 200.'
];
const WAIT_COMPLAINTS=[
 'I have aged approximately seven bowling seasons in this line.','My reservation was with the twenty-first century!','I have seen glaciers finish faster than this queue.','I could have bowled three games at home. With soup cans.','Put me down for the lane opening in 2042.','This wait is longer than a director’s cut of my life.','The only thing rolling here is my patience.','We came to bowl, not to earn a waiting-room degree.','My shoes have gone out of fashion while we waited.','The bench and I are now in a committed relationship.','I aged enough to qualify for the senior league.','My patience just rolled a gutter ball.','I am leaving a review with excessive punctuation.','Tell the lane when it opens that I waited heroically.','This queue needs its own refreshment stand.'
];
function quote(s,lines){s.storyCursor=((s.storyCursor||0)+7)%100000;return lines[(s.storyCursor+Math.floor(roll(s)*3))%lines.length];}
function finishDay(s){const t=s.today;t.facilities={snack:isBuilt(s,'snack'),bar:isBuilt(s,'bar'),arcade:isBuilt(s,'arcade')};
 const complaints=[];
 if(t.left>0)complaints.push(`${t.left} frustrated group${t.left===1?'':'s'} walked out after the wait. More lanes or benches could help.`);
 if(t.waited>0)complaints.push(`${t.waited} group${t.waited===1?'':'s'} waited for a lane`);
 
 if(t.snackMisses>0&&isBuilt(s,'snack'))complaints.push(`${t.snackMisses} snack request${t.snackMisses===1?'':'s'} could not be filled`);
 if(t.barMisses>0)complaints.push('Bar drinks ran out — consider restocking');
 if(t.benchSaves>0)complaints.unshift(`${t.benchSaves} waiting group${t.benchSaves===1?'':'s'} stayed thanks to your benches`);
 if(s.lanes.some(l=>l.condition<48))complaints.push('One or more lanes need service');
 if(t.arrivals>=5&&(!s.fixtures.restrooms||activeOutage(s,'restrooms'))&&s.day>=8)complaints.push('Guests would appreciate proper restrooms');
 if(t.arrivals>=5&&!s.fixtures.ballracks&&s.day>=12)complaints.push('A better selection of house balls would help guests');
 if(t.arcadePlays>0)complaints.unshift(`${t.arcadePlays} arcade games played today`);
 t.feedback=complaints;
 if(t.served>0)s.rep=money(s.rep+Math.min(2,t.served*.19)+(s.fixtures.restrooms?.2:0)+(s.fixtures.ballracks?.12:0)+(s.specialty==='community'?.12:0));
 if(s.day>4&&t.left>t.served+2)s.rep=Math.max(0,money(s.rep-.35));
 if(s.league.active&&t.leagueHours===2&&calendar(s.day).dayIndex===3&&s.league.lastDay!==s.day){
  const quality=s.lanes.reduce((n,l)=>n+l.condition,0)/s.lanes.length;const leagueFriends=Object.values(s.patrons||{}).filter(p=>p.leagueMember).length;const payout=Math.round(((125+s.rep*.35+quality*.22+roll(s)*45)*(s.specialty==='sport'?1.2:1))+leagueFriends*8);
  addIncome(s,'leagueIncome',payout);s.league.totalRevenue+=payout;s.league.sessions++;s.league.lastDay=s.day;t.leagueHeld=true;s.rep=money(s.rep+2.5);grantXP(s,14);
  note(s,`Thursday League night! ${s.league.sessions} weekly session(s) hosted, +$${payout} in fees and refreshments.`,'league');
 }
 advanceStory(s);
 if(t.left>0)complaints.push('Overheard outside: “'+quote(s,WAIT_COMPLAINTS)+'”');
 if(!isBuilt(s,'snack')&&t.arrivals>0&&s.lanes.length>0)complaints.push(['"Not even a bag of chips? Bold business strategy."','"I expected strikes, not a hunger strike."','"Do the pins come with a side of fries?"'][s.day%3]);
 if(t.served>0&&t.left===0)complaints.push('Overheard on the lanes: “'+quote(s,s.campaignStory?.path==='backalley'?NOIR_GOSSIP:ALLEY_GOSSIP)+'”');
 // Count each primary bowling visit once; shortages add a small, bounded penalty.
 t.satisfied=t.served;t.unhappy=t.left;
 const score=clamp(3*t.satisfied-2*t.unhappy-Math.min(5,(t.snackMisses||0)+(t.barMisses||0))+Math.min(5,t.happyReturns||0)+(s.roomDetails.snack?1:0)+(s.roomDetails.bar?1:0),-12,15);
 const target=clamp(65+score*2+(s.specialty==='family'&&s.fixtures.wallart?4:0),0,100);
 const oldH=s.happiness;s.happiness=clamp(Math.round(.82*s.happiness+.18*target),0,100);t.happinessDelta=s.happiness-oldH;t.happiness=s.happiness;
 s.happinessHistory.push({day:s.day,value:s.happiness});s.happinessHistory=s.happinessHistory.slice(-35);
 if(s.loan.balance>0&&calendar(s.day).dayIndex===6&&s.loan.lastPaymentDay!==s.day){
  const due=Math.min(s.loan.balance,s.loan.payment);if(s.cash>=due){s.cash=money(s.cash-due);s.loan.balance=money(s.loan.balance-due);t.loanPayment=due;t.expenses=money(t.expenses+due);s.loan.lastPaymentDay=s.day;log(s,`Paid $${due} toward the startup loan.`);}
  else complaints.push('The town loan payment was deferred until you have enough cash.');
 }
 payStaff(s);technicianShift(s);emergencyMechanicShift(s);weeklyPartnerBenefit(s);finishConstruction(s);restockAuto(s);if(!rivalAIMove(s))rollRandomEvent(s);checkCampaignVictory(s);t.net=money(t.income-t.expenses);
 s.lastDay=structuredCloneSafe(t);s.dayReports.unshift(structuredCloneSafe(t));s.dayReports=s.dayReports.slice(0,21);
 log(s,`Closed: ${t.served} groups bowled, ${t.left} left; +$${Math.round(t.net)} net.`);
}
function structuredCloneSafe(obj){return JSON.parse(JSON.stringify(obj));}
function startNextDay(s){if(s.hour<CLOSE)return false;s.day++;s.hour=OPEN;s.today=newDayStats(s.day);s.today.capex=s.nextDayCharges.capex;s.today.marketingSpend=s.nextDayCharges.marketingSpend;s.today.expenses=s.nextDayCharges.marketingSpend;s.nextDayCharges={capex:0,marketingSpend:0};s.queue=[];s.active=[];s.sceneGroups=[];s.latestEvents=[];s.practiceLeft=3;processDeliveries(s);return true;}
function tickHour(s){
 if(s.hour>=CLOSE)startNextDay(s);
 const h=s.hour;s.latestEvents=[];const oldSessions=s.active;s.active=[];
 for(const old of oldSessions){
  if((old.ends??h)>h){
   s.active.push(old);addIncome(s,'laneIncome',s.pricing.lane);s.today.laneHours++;
   note(s,`${groupText(old.party)} stayed on lane ${old.laneId} another hour (+$${s.pricing.lane}).`,'bowling',old.party.id);
  }else{note(s,`${groupText(old.party)} finished their session on lane ${old.laneId} and headed out.`,'exit',old.party.id);maybeSnack(s,old.party,'exit');maybeBar(s,old.party,'exit');}
 }
 const calendarBooking=(s.bookings||[]).find(b=>b.status==='booked'&&b.day===s.day&&h>=b.start&&h<b.end&&!b.paid);
 const venueBooking=(s.bookings||[]).find(b=>b.status==='booked'&&!b.offsite&&b.day===s.day&&h>=b.start&&h<b.end);
 if(calendarBooking&&!calendarBooking.paid){addIncome(s,'partyIncome',calendarBooking.remaining);calendarBooking.paid=true;note(s,`📆 ${calendarBooking.name} checked in! Final contract payment +$${calendarBooking.remaining}.`,'league');}
 const booking=!!venueBooking||s.partyBooking&&s.partyBooking.status==='accepted'&&s.partyBooking.day===s.day&&h>=s.partyBooking.start&&h<s.partyBooking.end;
 const leagueEvening=s.league.active&&calendar(s.day).dayIndex===3&&h>=18&&h<20;if(leagueEvening){s.today.leagueHours++;note(s,'Thursday league has commandeered ALL SIX lanes until 8 PM. Walk-ins may need to wait.','league');}
 if(booking){s.today.partyHeld=true;if(!venueBooking){const amount=lanes(s)*s.pricing.lane*2;addIncome(s,'partyIncome',amount);note(s,`🎉 ${s.partyBooking.name} has reserved every lane, earning +$${amount} this hour.`,'league');}}
 const free=s.lanes.filter(l=>l.condition>20&&!activeOutage(s,'lane'+l.id)&&!booking&&(!leagueEvening||l.id>6)&&!s.active.some(x=>x.laneId===l.id)); // league reserves the original six lanes, even after land expansion
 for(const [i,p] of s.queue.entries()){p.waited++;p.seated=i<s.benches*2;if(p.waited===2&&(p.seated||s.fixtures.tv)){s.today.benchSaves++;note(s,`${groupText(p)} is comfortable on the waiting bench and decided to stay.`,'bench',p.id);}}
 const stillWaiting=[];
 for(const p of s.queue){if(p.waited>=((p.seated||s.fixtures.tv||s.specialty==='community')?4:2)){s.today.left++;upsetPatron(s,p);note(s,`${groupText(p)} stormed out: “${quote(s,WAIT_COMPLAINTS)}”`,'left',p.id);}else stillWaiting.push(p);}
 s.queue=stillWaiting;
 while(free.length&&s.queue.length)serve(s,s.queue.shift(),free);
 // No bowling traffic before the FIRST lane opens; shop-only customers may still visit.
 // A building without lanes is a quiet pre-opening construction site, not a queue disaster.
 // Three opportunities for group arrivals within an hour once lanes are usable.
 const demand=s.lanes.length?chanceOfArrival(s)*trafficMultiplier(s):0;
 if(h===18)checkVIPGroup(s);
 let arrivals=0;
 for(let i=0;i<5;i++)if(roll(s)<Math.min(.85,demand/5))arrivals++;
 for(let i=0;i<arrivals;i++){
   const p=newParty(s);s.today.arrivals++;note(s,`${groupText(p)} arrived at the front desk.`,'arrival',p.id);
   if(roll(s)<.26)note(s,`Overheard from ${p.name}: “${quote(s,s.campaignStory?.path==='backalley'?NOIR_GOSSIP:ALLEY_GOSSIP)}”`,'feedback',p.id);
   if(free.length)serve(s,p,free);
   else if(s.queue.length<waitCapacity(s)){p.seated=s.queue.length<s.benches*2;s.queue.push(p);maybeSnack(s,p,'wait');maybeBar(s,p,'wait');maybeArcade(s,p);note(s,`${groupText(p)} is ${p.seated?'seated on a bench':'waiting'} for a lane.`,'waiting',p.id);}
   else{s.today.left++;upsetPatron(s,p);note(s,`${groupText(p)} stomped out: “${quote(s,WAIT_COMPLAINTS)}”`,'left',p.id);}
 }
 // Some visitors are here for the shops, not the bowling. Real purchases are logged with room destinations.
 if((isBuilt(s,'snack')||isBuilt(s,'bar')||isBuilt(s,'arcade'))&&roll(s)<.28+(activeCampaign(s)?.boost||0)/3+(s.specialty==='family'?.12:0)+(s.specialty==='lounge'?.08:0))walkIn(s);
 // Individual arcade machines are played by actual parties; no automatic imaginary revenue.
 if(staffed(s,'proshop')&&s.today.served>0&&roll(s)<(s.roomTiers.proshop===2?.44:.27)*serviceFactor(s,'proshop')){
  const upgraded=s.roomTiers.proshop===2,products=upgraded?['grip tape','bowling glove','cleaning kit','bowling ball polish']:['bowling supplies'];
  const product=products[Math.floor(roll(s)*products.length)],amount=upgraded?19:12;
  addIncome(s,'otherIncome',amount);const guest=s.active[0]?.party;if(guest){note(s,`${groupText(guest)} bought ${product} from the pro shop (+$${amount}).`,'shop',guest.id);s.roomVisits.proshop++;}
 }
 const overhead=money((2.0+lanes(s)*.9+(isBuilt(s,'coaching')?.6:0)+(isBuilt(s,'lights')&&h>=15?1.4:0))*(1-.04*s.ownerSkills.manager));
 s.today.expenses=money(s.today.expenses+overhead);s.cash=money(s.cash-overhead);
 // Upkeep is individual to each lane. The idle technician reduces wear.
 for(const lane of s.lanes){const used=s.active.some(x=>x.laneId===lane.id);if(used){lane.condition=clamp(money(lane.condition-(isBuilt(s,'staff')?.37:.88)*(s.specialty==='sport'?.8:1)*(laneKit(lane,'wood')?.6:1)-roll(s)*.28),15,100);}}

 s.sceneGroups=[...s.active.map(x=>({id:x.party.id,name:x.party.name,size:x.party.size,location:'lane'+x.laneId,kind:'bowling'})),
 ...s.queue.map(x=>({id:x.id,name:x.name,size:x.size,location:'wait',kind:'waiting'}))];
 s.hour++;s.today.net=money(s.today.income-s.today.expenses);grantXP(s,1);
 if(s.hour===CLOSE){
   for(const b of s.bookings||[])if(b.day===s.day&&b.status==='booked'){b.status='complete';if(b.type==='charity')s.rep=money(s.rep+2);}
   if(s.partyBooking?.day===s.day)s.partyBooking=null;
   for(const x of s.active){note(s,`${groupText(x.party)} finished their ${x.hours||1}-hour booking on lane ${x.laneId} at closing.`,'exit',x.party.id);maybeSnack(s,x.party,'exit');maybeBar(s,x.party,'exit');}
   for(const x of s.queue){s.today.left++;upsetPatron(s,x);note(s,`${groupText(x)} left grumbling: "I've spent the whole night watching other people bowl."`,'left',x.id);}
   s.active=[];s.queue=[];s.sceneGroups=[];
   finishDay(s);
 }
 return {ok:true,hour:h,events:structuredCloneSafe(s.latestEvents),dayEnded:s.hour===CLOSE};
}
function runDay(s){let result;do{result=tickHour(s);}while(!result.dayEnded);return s.lastDay;}
function spendOwnerPoint(s,id){if(!PLAYER_SKILLS.some(x=>x.id===id))return {ok:false,reason:'Unknown skill'};if(s.ownerPoints<1)return {ok:false,reason:'Earn an owner level first'};if(s.ownerSkills[id]>=6)return {ok:false,reason:'Skill maxed'};s.ownerPoints--;s.ownerSkills[id]++;log(s,`Improved ${id}.`);return {ok:true};}
function getBowler(s,id){return s.bowlers.find(x=>x.id===id);}
function trainCost(s,id,stat){const b=getBowler(s,id);if(!b||!['aim','spare','power','focus'].includes(stat))return null;return 45+Math.round(b[stat]*1.45);}
function train(s,id,stat){const b=getBowler(s,id),cost=trainCost(s,id,stat);if(!b||cost===null)return {ok:false,reason:'Invalid training'};if(b[stat]>=95)return {ok:false,reason:'Already maxed'};if(!spend(s,cost))return {ok:false,reason:'Not enough money'};
 const gain=5+(isBuilt(s,'coaching')?2:0)+s.ownerSkills.coach;b[stat]=clamp(b[stat]+gain,0,95);grantXP(s,6);log(s,`${b.name} trained ${stat} (+${gain}).`);return {ok:true};}
function fitBall(s,id){const b=getBowler(s,id);if(!b)return {ok:false,reason:'Bowler not found'};if(!isBuilt(s,'proshop'))return {ok:false,reason:'Build the Pro Shop first'};if(b.ball)return {ok:false,reason:'Already fitted'};if(!spend(s,170))return {ok:false,reason:'Not enough money'};b.ball=true;grantXP(s,8);log(s,`${b.name} got a custom ball.`);return {ok:true};}
function recruit(s){if(lanes(s)<2)return {ok:false,reason:'Need at least two lanes'};if(s.bowlers.length>=4)return {ok:false,reason:'Roster full'};if(!spend(s,320))return {ok:false,reason:'Not enough money'};
 const name=['Jules','Sam','Rory','Parker'][s.bowlers.length-2],id='recruit'+s.bowlers.length;const b={id,name,aim:29+Math.floor(roll(s)*8),spare:25+Math.floor(roll(s)*8),power:27+Math.floor(roll(s)*8),focus:24+Math.floor(roll(s)*8),ball:false};s.bowlers.push(b);grantXP(s,10);log(s,`${name} joined the team.`);return {ok:true};}
function eligibility(s,t){const reasons=[];if(teamAvg(s)<t.needAvg)reasons.push(`average ${t.needAvg}`);if(s.rep<t.needRep)reasons.push(`reputation ${t.needRep}`);if(t.need.some(x=>!isBuilt(s,x)))reasons.push('facility needed');if(t.needLanes&&lanes(s)<t.needLanes)reasons.push(`${t.needLanes} lanes needed`);if((s.tournamentCooldown[t.id]||0)>s.day)reasons.push(`try again day ${s.tournamentCooldown[t.id]}`);if(s.cash<t.fee)reasons.push(`entry $${t.fee}`);return reasons;}
function tournament(s,id){const t=TOURNAMENTS.find(x=>x.id===id);if(!t)return {ok:false,reason:'Tournament not found'};const missing=eligibility(s,t);if(missing.length)return {ok:false,reason:missing.join(' · ')};spend(s,t.fee);
 const score=Math.round(teamAvg(s)+(roll(s)-.5)*38),rival=Math.round(t.rival+(roll(s)-.5)*18),won=score>=rival,first=!(s.tournamentWins[t.id]||0),payout=won?Math.round(t.firstPrize*(first?1:.35)):Math.round(t.fee*.18);
 s.cash+=payout;s.rep+=won?t.rep:3;grantXP(s,won?24:11);if(won)s.tournamentWins[t.id]=(s.tournamentWins[t.id]||0)+1;advanceStory(s);s.tournamentCooldown[t.id]=s.day+t.cooldown;log(s,`${t.title}: ${won?'CHAMPIONS!':'Keep practicing!'} ${score}–${rival}.`);return {ok:true,won,score,rival,payout,tournament:t.title};}
function bowlShot(s,angle,spin,power){if(!s.lanes.length)return {ok:false,reason:'Build your first lane before practicing'};if(s.practiceLeft<=0)return {ok:false,reason:'Practice resets tomorrow'};angle=Number(angle);spin=Number(spin);power=Number(power);if(![angle,spin,power].every(Number.isFinite))return {ok:false,reason:'Invalid shot'};
 angle=clamp(angle,-10,10);spin=clamp(spin,-5,5);power=clamp(power,60,100);const condition=s.lanes[0].condition;const sweet=(100-condition)/28;const down=clamp(Math.round(10-Math.abs(angle+spin*.5-sweet)*1.35-(100-power)/29+(roll(s)-.5)*2.2),0,10);
 s.practiceLeft--;grantXP(s,down===10?5:2);s.practiceStreak=down===10?s.practiceStreak+1:0;log(s,`Practice: ${down===10?'STRIKE!':down+' pins'}.`);return {ok:true,down,result:down===10?'STRIKE!':down+' pins down'};}
// Two playable towns share game code but keep entirely separate cash,
// business clocks, upgrades, customer relationships, and *locked* story routes.
function snapshotCenter(s){const copy=structuredCloneSafe(s);delete copy.portfolio;return copy;}
function canOpenSecondTown(s){return s.portfolio&&s.portfolio.activeId==='home'&&!s.portfolio.opened.includes('riverside')&&s.cash>=8000&&lanes(s)>=6&&alleyStars(s)>=3&&s.campaignStory.path!=='undecided';}
function openSecondTown(s){if(!canOpenSecondTown(s))return {ok:false,reason:'To open Riverside: choose a campaign, own 6 lanes, earn 3 Alley Stars and have $8,000.'};
 s.cash=money(s.cash-8000);recordCharge(s,'capex',8000);
 const other=newGame((s.seed+102971)>>>0);other.locationName='Riverside';other.portfolio=undefined;other.cash=1800;other.startupPending=false;other.startupFinance='franchise';other.starterStyle='original';other.story={unlocked:['inheritance'],pending:[],charter:false};other.log=['Day 1 · Riverside is your second town. It has its own budget and may choose a different story route.'];
 s.portfolio.snapshots.riverside=snapshotCenter(other);s.portfolio.opened.push('riverside');log(s,'Opened a second bowling center in Riverside. Both locations have independent story decisions.');return {ok:true};
}
function switchTown(s,id){
 const port=s.portfolio;if(!port)return null;if(id===port.activeId)return s;
 if(!['home',...port.opened].includes(id))return null;
 const next=port.snapshots[id];if(!next)return null;
 const snapshots={...port.snapshots,[port.activeId]:snapshotCenter(s)};delete snapshots[id];
 const result={...structuredCloneSafe(next),portfolio:{activeId:id,opened:[...port.opened],snapshots}};
 return checkState(result)?result:null;
}
// DEV ONLY: a fresh realistic midgame scenario. Never writes user saves on its own.
function developmentScenario(mode='decision'){
 if(!['decision','backalley','legacy'].includes(mode))return null;
 const s=newGame(110093);chooseStartup(s,'growth','original');s.day=24;s.hour=OPEN;s.cash=5800;s.rep=42;s.totalServed=74;s.happiness=78;s.minVenueLevel=3;s.parts=11;s.benches=2;s.fixtures={...s.fixtures,restrooms:true,tv:true,ballracks:true};s.built={roof:true,snack:true,bar:true,arcade:true,proshop:true,lights:true};
 for(const id of ['snack','bar','arcade','proshop'])ensureRoom(s,id);
 s.lanes=Array.from({length:6},(_,i)=>({id:i+1,condition:86+i%3*3,kits:{wood:true,return:true},theme:'classic',animationUnlocked:false}));
 s.snackStock.soda=18;s.snackStock.popcorn=12;s.snackStock.fries=10;s.barStockById.beer=12;s.barStockById.wine=8;s.barStock=20;s.arcadeMachines.pinball=true;s.roomVisits.snack=36;s.roomVisits.bar=25;s.roomVisits.arcade=30;s.roomVisits.proshop=12;
 s.employees=[{id:1,role:'snack',wage:22,level:1},{id:2,role:'bar',wage:25,level:1},{id:3,role:'proshop',wage:23,level:1}];s.employeeSerial=3;
 s.story.unlocked=['inheritance','firstlane','offer','established'];s.story.pending=[];
 s.rival.pressure=22;s.rival.community=1;s.ownerXP=310;s.ownerPoints=3;s.loan.balance=780;s.loan.payment=150;s.startupPending=false;
 s.today=newDayStats(s.day);s.lastDay=newDayStats(s.day-1);s.dayReports=[];
 if(mode!=='decision')chooseCampaign(s,mode);
 return checkState(s)?s:null;
}
function checkState(s){return !!(s&&s.version===15&&s.campaignStory&&['undecided','legacy','backalley'].includes(s.campaignStory.path)&&s.portfolio&&['home','riverside'].includes(s.portfolio.activeId)&&Array.isArray(s.portfolio.opened)&&s.portfolio.snapshots&&Object.values(s.portfolio.snapshots).every(v=>v.version===15&&!v.portfolio&&v.campaignStory)&&Array.isArray(s.bookings)&&s.roomDetails&&s.vipGroups&&s.rival&&Number.isInteger(s.hardshipUses)&&s.story&&Array.isArray(s.story.unlocked)&&Array.isArray(s.story.pending)&&typeof s.story.charter==='boolean'&&s.patrons&&PATRON_PROFILES.every(p=>s.patrons[p.id]&&Number.isInteger(s.patrons[p.id].visits)&&s.patrons[p.id].loyalty>=0&&s.patrons[p.id].loyalty<=100)&&Number.isInteger(s.laneRotation)&&s.laneRotation>=0&&Number.isInteger(s.storyCursor)&&typeof s.startupPending==='boolean'&&Number.isFinite(s.happiness)&&s.happiness>=0&&s.happiness<=100&&Array.isArray(s.happinessHistory)&&s.loan&&Number.isFinite(s.loan.balance)&&s.loan.balance>=0&&Array.isArray(s.employees)&&Array.isArray(s.deliveries)&&Array.isArray(s.facilityNotices)&&s.facilityNotices.every(x=>['snack','bar','arcade','proshop'].includes(x.id)&&[1,2].includes(x.tier))&&Number.isInteger(s.lowStockThreshold)&&s.lowStockThreshold>=1&&s.lowStockThreshold<=12&&s.hour>=OPEN&&s.hour<=CLOSE&&s.day>=1&&Number.isFinite(s.cash)&&Number.isFinite(s.rep)&&Number.isInteger(s.parts)&&s.parts>=0&&Number.isInteger(s.benches)&&s.benches>=0&&s.benches<=3&&Number.isInteger(s.barStock)&&s.barStock>=0&&Number.isInteger(s.barPrice)&&s.barPrice>=6&&s.barPrice<=14&&Number.isInteger(s.totalServed)&&s.totalServed>=0&&Number.isInteger(s.minVenueLevel)&&s.minVenueLevel>=1&&s.minVenueLevel<=5&&s.barStockById&&DRINKS.every(i=>Number.isInteger(s.barStockById[i.id])&&s.barStockById[i.id]>=0&&Number.isInteger(s.barPrices[i.id]))&&s.arcadeMachines&&s.fixtures&&PAINTS.some(p=>p.id===s.wallPaint)&&s.league&&Array.isArray(s.construction)&&s.construction.every(j=>j.remaining>0&&j.remaining<=j.total&&['lane','upgrade','roomExpand','land'].includes(j.kind))&&Number.isInteger(s.expansionStage)&&s.expansionStage>=0&&s.expansionStage<=5&&s.outages&&s.partnerships&&Array.isArray(s.eventQueue)&&Array.isArray(s.eventHistory)&&Array.isArray(s.encounters)&&Array.isArray(s.lanes)&&s.lanes.length>=0&&s.lanes.length+pendingLanes(s)<=laneCapacity(s)&&s.lanes.every(l=>Number.isInteger(l.id)&&l.condition>=0&&l.condition<=100&&l.kits&&LANE_KITS.every(k=>typeof l.kits[k.id]==='undefined'||l.kits[k.id]===true)&&SCORE_THEMES.some(t=>t.id===l.theme)&&(l.animationUnlocked===undefined||typeof l.animationUnlocked==='boolean'))&&SNACKS.every(i=>Number.isInteger(s.snackStock[i.id])&&s.snackStock[i.id]>=0)&&s.queue.length<=waitCapacity(s)&&ROOM_IDS.every(id=>(!s.roomPlacements[id]||canPlaceRoom(s,id,s.roomPlacements[id].x,s.roomPlacements[id].y)))&&s.bowlers.every(b=>['aim','spare','power','focus'].every(k=>b[k]>=0&&b[k]<=95)));}
// Preserve v0.3 (and older v0.1/0.2) game progress without editing the old save.
function migrate(legacy){
 if(legacy?.version===15)return checkState(legacy)?legacy:null;
 if(legacy?.version===14){const s={...structuredCloneSafe(legacy),version:15,locationName:'Gus’s Town',portfolio:{activeId:'home',opened:[],snapshots:{}},campaignStory:newCampaign()};s.log=['v1.00: Two story campaigns are now available. Your previous alley remains undecided until Vera’s offer.',...(s.log||[])].slice(0,60);return checkState(s)?s:null;}
 if(legacy?.version===13){const s={...structuredCloneSafe(legacy),version:14,bookings:[],bookingSerial:0,roomDetails:{},vipGroups:Object.fromEntries(VIP_GROUPS.map(g=>[g.id,{visits:0,lastDay:0}])),hardshipUses:0,emergencyCoverageUntil:0,rival:{pressure:0,community:0,protectionUntil:0,lastResponseDay:0},partnerships:{school:!!legacy.partnerships?.school,teams:false,charity:false,office:false,neighbors:false}};s.log=['v0.99: New contracts, VIPs, room details and rivalry added. Old progress kept.',...(s.log||[])].slice(0,60);return checkState(s)?s:null;}
 if(legacy?.version===12){const s={...structuredCloneSafe(legacy),version:13,expansionStage:legacy.landOwned?1:0,outages:{},lastRandomEventDay:-100,eventBoostUntil:0,eventBoostFactor:1,eventQueue:[],eventHistory:[],lastPartyRequestDay:-100,pendingPartyRequest:null,partyBooking:null,lastEncounterDay:0,encounters:[],partnerships:{school:false}};
  s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));
  s.story={...s.story,unlocked:[...new Set(['inheritance',...(s.story?.unlocked||[])])],pending:(s.story?.pending||[]).filter(id=>id!=='inheritance')};
  s.log=['v0.98: Your existing lanes, rooms and Gus’s story are preserved. New wings and incidents are available.',...(s.log||[])].slice(0,60);
  return migrate(s);}

 if(legacy?.version===11){const s={...structuredCloneSafe(legacy),version:12,story:freshStory(),patrons:freshPatrons()};
  s.minVenueLevel=Math.max(s.minVenueLevel||1,previousLevel(s));
  if(!s.startupPending){for(const chapter of STORY_CHAPTERS){let earned=chapter.id==='inheritance'||chapter.id==='firstlane'&&lanes(s)>0||chapter.id==='offer'&&s.totalServed>=20||chapter.id==='established'&&s.minVenueLevel>=3||chapter.id==='league'&&s.league.active||chapter.id==='regional'&&!!s.tournamentWins.regional||chapter.id==='national'&&!!s.tournamentWins.national;if(earned)openChapter(s,chapter.id,true);}}
  s.story.charter=!!s.tournamentWins.national;
  s.log=['v0.97: Grandpa Gus’s story and department ratings are here. Your original progress is safe.',...(s.log||[])].slice(0,60);return migrate(s);}

 if(legacy?.version===10){const s={...structuredCloneSafe(legacy),version:11,laneRotation:0,storyCursor:0};s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));s.log=['v0.96: Rotating lanes, longer sessions, and technician automation are ready. Progress is preserved.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===9){const s={...structuredCloneSafe(legacy),version:10,lanes:legacy.lanes.map(l=>({...l,kits:{...l.kits},theme:l.theme||'classic',animationUnlocked:!!l.animationUnlocked}))};s.log=['v0.95: Alley Stars and lane upgrade systems are ready. Existing progress is preserved.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===8){const s={...newGame(legacy.seed),...structuredCloneSafe(legacy),version:9,facilityNotices:[]};
  s.log=['v0.94: Your existing alley and its lanes are preserved.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===7){const base=newGame(legacy.seed);const s={...base,...structuredCloneSafe(legacy),version:8,startupPending:false,startupFinance:'legacy',starterStyle:'original',loan:{...base.loan},specialty:null,landOwned:false,happiness:65,happinessHistory:[]};
  s.snackStock={...base.snackStock,...s.snackStock};s.snackPrices={...base.snackPrices,...s.snackPrices};
  s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));
  s.log=['v0.93: Your existing alley, cash and progress were preserved. New startup choices apply to NEW games only.',...(s.log||[])].slice(0,60);
  return migrate(s);}

 if(legacy?.version===6){const base=newGame(legacy.seed);const s={...base,...structuredCloneSafe(legacy),version:7,employees:[],employeeSerial:0,deliveries:[],lowStockThreshold:3};
 s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));
 s.log=['v0.7: Staff are now needed for counters. Open Staff to hire your first team member.',...(s.log||[])].slice(0,60);
 return migrate(s);}
 if(legacy?.version===5){const n=newGame(legacy.seed),s={...n,...structuredCloneSafe(legacy),version:6,totalServed:Math.max(0,(legacy.dayReports||[]).reduce((x,r)=>x+(r.served||0),0)+((legacy.dayReports||[]).some(r=>r.day===legacy.today?.day)?0:(legacy.today?.served||0))),minVenueLevel:legacy.built?.lights&&legacy.lanes?.length>=3?5:legacy.built?.proshop||(legacy.built?.bar&&legacy.lanes?.length>=3)?4:legacy.built?.snack||legacy.lanes?.length>=3?3:legacy.built?.roof?2:1,barVisits:(legacy.dayReports||[]).reduce((x,r)=>x+(r.barOrders||0),0)+((legacy.dayReports||[]).some(r=>r.day===legacy.today?.day)?0:(legacy.today?.barOrders||0)),roomVisits:{snack:0,bar:0,arcade:0,proshop:0},barStockById:{...n.barStockById,beer:Math.ceil((legacy.barStock||0)*.6),wine:Math.floor((legacy.barStock||0)*.4)},barPrices:{...n.barPrices},arcadeMachines:legacy.built.arcade?{pinball:true}:{},arcadeVisits:0,fixtures:{},wallPaint:'original',league:{...n.league}};
  s.roomVisits.bar=s.barVisits;s.roomVisits.snack=(legacy.dayReports||[]).reduce((x,r)=>x+(r.snackOrders||0),0);s.barStock=Object.values(s.barStockById).reduce((a,b)=>a+b,0);s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));s.log=['Upgraded to v0.6 — previous lanes, construction and money preserved.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===4){const s={...structuredCloneSafe(legacy),version:5,roomPlacements:{},roomTiers:{}};for(const id of ROOM_IDS)if(s.built[id]||s.construction.some(j=>j.id===id))ensureRoom(s,id);for(const item of SNACKS){s.snackStock[item.id]??=0;s.snackPrices[item.id]??=item.price;}s.log=['Save upgraded to v0.5. Existing lanes and rooms retained.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===1){const s=newGame(legacy.seed||271828);s.day=legacy.day||1;s.cash=money(legacy.cash??90);s.earned=legacy.earned||0;s.rep=legacy.rep||0;s.built={...legacy.built};s.lanes=Array.from({length:1+Number(!!s.built.lane2)+Number(!!s.built.lane3)},(_,i)=>({id:i+1,condition:clamp(legacy.condition||88,15,100)}));s.parts=Math.max(0,Math.floor(legacy.parts||0));if(s.built.snack){s.snackStock.soda=Math.max(3,Math.floor((legacy.food||0)/2));s.snackStock.popcorn=Math.max(3,Math.ceil((legacy.food||0)/2));}s.ownerXP=legacy.ownerXP||0;s.ownerPoints=legacy.ownerPoints||0;s.ownerSkills={...s.ownerSkills,...legacy.ownerSkills};s.practiceLeft=legacy.practiceLeft??3;s.practiceStreak=legacy.practiceStreak||0;s.bowlers=legacy.bowlers||s.bowlers;s.tournamentWins={...legacy.tournamentWins};s.tournamentCooldown={...legacy.tournamentCooldown};s.log=['Save upgraded to v0.4; your buildings and bowlers were preserved.',...(legacy.log||[])].slice(0,60);return migrate({...s,version:4}) ;}
 if(legacy?.version!==3)return null;
 const s={...newGame(legacy.seed||271828),...structuredCloneSafe(legacy),version:4,benches:Math.max(0,Math.ceil(((legacy.queue||[]).length-1)/2)),barStock:0,barPrice:9,construction:[],campaign:null,nextDayCharges:{capex:0,marketingSpend:0}};
 s.today={...newDayStats(legacy.today?.day||legacy.day),...legacy.today};s.lastDay={...newDayStats(legacy.lastDay?.day||0),...legacy.lastDay};
 s.dayReports=(legacy.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));
 // v0.3 lane2/lane3 were already built; keep all existing lanes immediately usable.
 s.log=['Save upgraded to v0.4. Your existing rooms, lanes and bowlers are ready.',...(legacy.log||[])].slice(0,60);
 return migrate(s);}
return {CAMPAIGN_PATHS,NOIR_ACTIONS,campaignReady,campaignOf,chooseCampaign,campaignAction,campaignMission,rivalAIMove,checkCampaignVictory,openSecondTown,canOpenSecondTown,switchTown,developmentScenario,OPEN,CLOSE,DAYS,calendar,SEASONAL_ARCS,contractCollision,PARTNERSHIP_CATALOG,BOOKING_TYPES,ROOM_DETAILS,VIP_GROUPS,bookContract,negotiatePartnership,buyRoomDetail,hireEmergencyMechanic,buyEmergencyCoverage,paymentPlanRepair,respondToRival,STORY_CHAPTERS,PATRON_PROFILES,PATRON_DIALOGUES,respondEncounter,secureSchoolPartnership,repairCost,repairOutage,respondPartyRequest,EVENT_CATALOG,NEW_ATTRACTIONS,expansionStage,roomRows,nextExpansionCost,activeOutage,incidentCooldownRemaining,trafficMultiplier,DEPARTMENTS,departmentRatings,patronStatus,talkToPatron,advanceStory,LANE_KITS,SCORE_THEMES,STAR_THRESHOLDS,alleyScore,alleyStars,upgradeLane,bulkLaneCost,upgradeAllLanes,setLaneTheme,SPECIALTIES,STARTER_STYLES,chooseStartup,chooseSpecialty,specialtyOf,buyLand,laneCapacity,rushCost,rushConstruction,EMPLOYEE_ROLES,neededStaff,countStaff,staffed,hireEmployee,setWage,trainEmployee,setStockThreshold,incoming,processDeliveries,DRINKS,MACHINES,FIXTURES,PAINTS,LEVELS,nextLevelGoals,drinkUnlocked,restockDrink,setDrinkPrice,machineUnlocked,buyMachine,buyFixture,paintWall,startLeague,MAX_LANES,ROOM_COLS,ROOM_ROWS,ROOM_IDS,footprint,canPlaceRoom,findRoomPlacement,moveRoom,expandRoom,expansionCost,startNextDay,UPGRADES,CAMPAIGNS,SNACKS,TOURNAMENTS,PLAYER_SKILLS,newGame,migrate,formatHour,lanes,pendingLanes,nextLaneCost,benchCost,waitCapacity,activeCampaign,venueLevel,venueName,avg,teamAvg,getUpgrade,isBuilding,canBuild,build,buyLane,buyBench,advertise,restockBar,setBarPrice,snackUnlocked,restockSnack,buyParts,serviceLane,setPrice,setSnackPrice,tickHour,runDay,spendOwnerPoint,trainCost,train,fitBall,recruit,eligibility,tournament,bowlShot,checkState};
});
