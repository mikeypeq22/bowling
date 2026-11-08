/* From Gutter to Glory v1.10 — deterministic simulation; no UI dependencies. */
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
function calendar(day){const i=(((day-1)%7)+7)%7;return {week:Math.floor((day-1)/7)+1,weekday:DAYS[i],dayIndex:i};}
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
// v1.03 Department mastery: star levels are calculated from real service, upgrades and capacity.
// Rewards change real business outcomes; once-earned star notices are not repeated after save migration.
const DEPARTMENT_REWARDS={
 lanes:['Open lane bookings','Guest referral bonus','Sealed-lane upkeep reduction','Competitive coaching insight','Championship-ready lanes'],
 snack:['Basic menu','Kitchen efficiency: +$1 per sale','Meal-combo recognition: +$1 per sale','Priority catering reputation','Signature kitchen: +$1 per sale'],
 bar:['Open drinks service','Popular bar: +$1 per drink','Experienced bar: +$1 per drink','Nightlife recognition','Signature drinks: +$1 per drink'],
 arcade:['Entertain guests','Fan favorite: +$1 per play','Prize-corner bonus: +$1 per play','Featured entertainment room','Flagship games: +$1 per play'],
 proshop:['Basic gear counter','Equipment upsell: +$2 per sale','Specialty fitting reputation','Pro shop loyalty bonus','Elite outfitter: +$2 per sale'],
 comfort:['Guest comfort begins','Guests wait more patiently','Extra waiting patience','A welcoming destination','Five-star hospitality'],
 style:['A distinct atmosphere','Higher walk-in interest','Higher walk-in interest','Recognizable neighborhood identity','Destination decor']
};
// v1.04: every department star presents a genuinely purchasable improvement.
const DEPARTMENT_EQUIPMENT={
 lanes:['Lane markings','Fresh lane polishers','Premium pin deck','Coach camera','Championship oil station'],
 snack:['Counter signage','Combo warmer','Faster fry station','Catering prep table','Signature chef station'],
 bar:['Glassware set','Cold storage','Premium cocktail shaker','Guest lounge stools','House drink tap'],
 arcade:['Prize display','Better redemption shelf','Dual game stations','Tournament leaderboard','Deluxe game wall'],
 proshop:['Grip-tape rack','Ball cleaner display','Fitting toolkit','Drilling workbench','Pro-grade resurfacer'],
 comfort:['Floor mats','Waiting bench cushions','Water station','Accessible guest amenities','Premium guest lounge'],
 style:['Welcome mural','Custom wall lights','Branded lane flags','Themed feature wall','Signature entrance sign']
};
function equipmentFor(s,id){return DEPARTMENT_EQUIPMENT[id]?.map((name,i)=>({id,star:i+1,name,cost:[55,110,210,390,680][i],owned:!!s.departmentEquipment?.[id]?.[i+1],unlocked:departmentRewardLevel(s,id)>=i+1}))||[];}
function buyDepartmentEquipment(s,id,star){const item=equipmentFor(s,id).find(x=>x.star===Number(star));if(!item)return {ok:false,reason:'Unknown department improvement'};
 if(!item.unlocked)return {ok:false,reason:`Earn ${star} department stars first`};if(item.owned)return {ok:false,reason:'Already installed'};
 if(!spend(s,item.cost))return {ok:false,reason:'Not enough money for this improvement'};
 s.departmentEquipment??={};s.departmentEquipment[id]??={};s.departmentEquipment[id][star]=true;recordCharge(s,'capex',item.cost);
 note(s,`⭐ Installed ${item.name} in ${id}. This now helps your department operate and adds to its display.`,'build');return {ok:true};}
function equipmentPerks(s,id){return Object.values(s.departmentEquipment?.[id]||{}).filter(Boolean).length;}
function departmentRewardLevel(s,id){return departmentRatings(s)[id]?.stars||0;}
function departmentBenefit(s,id){const r=departmentRewardLevel(s,id),equipment=equipmentPerks(s,id);
 if(id==='snack'||id==='bar'||id==='arcade')return (r>=2?1:0)+(r>=3?1:0)+(r>=5?1:0)+equipment;
 if(id==='proshop')return (r>=2?2:0)+(r>=5?2:0)+equipment*2;
 if(id==='lanes')return (r>=3?.12:0)+equipment*.015;
 if(id==='comfort')return (r>=3?1:0)+Math.floor(equipment/2);
 if(id==='style')return (r>=3?.07:r>=2?.035:0)+equipment*.005;
 return 0;
}
function syncDepartmentRewards(s,silent=false){s.departmentAchievements??={};let newly=[];for(const d of DEPARTMENTS){const current=departmentRewardLevel(s,d.id),had=s.departmentAchievements[d.id]||0;
 if(current>had){for(let n=had+1;n<=current;n++)newly.push({id:d.id,star:n,department:d.name,reward:DEPARTMENT_REWARDS[d.id][n-1]});s.departmentAchievements[d.id]=current;}}
 if(!silent)for(const milestone of newly){note(s,`⭐ ${milestone.department} reached ${milestone.star}★ — ${milestone.reward}.`,'build');log(s,`${milestone.department} reached ${milestone.star}★: ${milestone.reward}.`);}
 return newly;
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
// v1.07: every room has one permanent spot on the floor plan (no free placement). Spots reserve
// room for expansions (base rooms grow to two squares in place) and line up with the wings that unlock them.
const FIXED_SPOTS={snack:{x:0,y:0},bar:{x:2,y:0},proshop:{x:0,y:1},arcade:{x:2,y:1},billiards:{x:0,y:2},partyroom:{x:2,y:2},karaoke:{x:0,y:3},bocce:{x:2,y:3},minigolf:{x:0,y:4},restaurant:{x:2,y:4},lasertag:{x:0,y:5},stage:{x:2,y:5},banquet:{x:0,y:6}};
function findRoomPlacement(s,id,size=1){const spot=FIXED_SPOTS[id];if(!spot)return null;return canPlaceRoom(s,id,spot.x,spot.y,size)?{...spot}:null;}
function fixRoomSpots(s){if(!s||!s.roomPlacements)return s;const next={};for(const id of ROOM_IDS)if(s.roomPlacements[id]||s.built?.[id]||(s.construction||[]).some(j=>j.id===id&&(j.kind==='upgrade'||j.kind==='roomExpand')))next[id]={...FIXED_SPOTS[id]};s.roomPlacements=next;for(const snap of Object.values(s.portfolio?.snapshots||{}))if(snap&&snap!==s)fixRoomSpots(snap);return s;}
function ensureRoom(s,id){if(!ROOM_IDS.includes(id)||s.roomPlacements[id])return true;const pos=findRoomPlacement(s,id,footprint(s,id));if(!pos)return false;s.roomPlacements[id]=pos;return true;}
function moveRoom(s,id,x,y){return {ok:false,reason:'Every room has its own fixed spot on the floor plan.'};
 if(!ROOM_IDS.includes(id)||(!s.built[id]&&!isBuilding(s,id)))return {ok:false,reason:'Build this room first'};
 if(!canPlaceRoom(s,id,x,y))return {ok:false,reason:'This placement overlaps another room or extends beyond the grid'};
 s.roomPlacements[id]={x,y};log(s,`Moved ${getUpgrade(id).title} in the alley layout.`);return {ok:true};}
function expansionCost(id){return ({snack:290,bar:365,proshop:460,arcade:305})[id]||0;}
function expandRoom(s,id){if(!ROOM_IDS.includes(id)||!isBuilt(s,id))return {ok:false,reason:'Build this room first'};
 if(s.roomTiers[id]===2)return {ok:false,reason:'Already expanded'};
 if(s.construction.some(j=>j.kind==='roomExpand'&&j.id===id))return {ok:false,reason:'Expansion already underway'};
 const pos=s.roomPlacements[id]||FIXED_SPOTS[id];if(!pos||!canPlaceRoom(s,id,pos.x,pos.y,2))return {ok:false,reason:'This room cannot grow right now'};s.roomPlacements[id]={...FIXED_SPOTS[id]};
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
 {id:'backalley',name:'The Back Alley',icon:'🌒',tone:'adult-noir',description:'A ruthless after-hours fight for control of your family property. Security, gambling, corruption, dirty deals and lasting consequences.'}
];

// The Back Alley is a separate play loop, built on the shared center simulation.
// All casino stakes are fictional GAME cash from the simulation. No purchase,
// deposits, real-world money, cash-out or real-money gambling is implemented.
const NIGHT_DEFENSES=[
 {id:'entrance',name:'Door Security',icon:'🚪',levels:['Unstaffed','Night Doorman','Trained Door Crew','Reinforced Entrance'],costs:[0,290,470,750],power:[0,14,32,54],descriptions:['A uniformed doorman deters trouble','A reliable two-person night crew','A reinforced door and a trained night shift']},
 {id:'cameras',name:'Camera Network',icon:'📹',levels:['None','Entry Cameras','All-Area Cameras','Monitoring Office'],costs:[0,240,420,690],power:[0,13,29,47],descriptions:['Watch the entrance and corridor','Watch your lanes, lounges and storage','Record incidents and identify patterns']},
 {id:'crew',name:'Staff Preparedness',icon:'🧰',levels:['Unprepared','Safety Briefings','Emergency Drills','Night Manager'],costs:[0,170,330,540],power:[0,10,22,38],descriptions:['Teach the crew how to report threats','Practice a calm emergency response','A night manager handles trouble and protects staff']}
];
const BACK_ALLEY_CHAPTERS=[
 {id:'noir-opening',title:'A Knock After Closing',speaker:'Lou · the old night watchman',text:'Vera knows this place matters to you. She is betting the night shift will make you quit. Get someone at the front door before her people get ideas.',hint:'Build Door Security level 1 in Build → Night Defenses.'},
 {id:'noir-door',title:'The Man in the Gray Coat',speaker:'Rosa · bartender',text:'A stranger asked who closes up and whether our cameras work. He did not buy a drink. I am not frightened. I am just saying our people deserve a safe way home.',hint:'Upgrade cameras and keep the crew safe.'},
 {id:'noir-lounge',title:'Lucky After Dark',speaker:'Dex · regular',text:'The arcade was cute. Vera brought a knife to a business fight. I brought a casino idea: a wheel, a house bankroll, and a sign that says nobody gets credit. Want to find out how lucky this town really is?',hint:'Build the arcade space to open the new Casino Lounge.'},
 {id:'noir-firsthit',title:'The First Broken Promise',speaker:'Bea · league organizer',text:'We found a damaged return in the morning. Vera says it is a coincidence. Grandpa used to say a coincidence is just a problem wearing a nice jacket.',hint:'Repair any damaged rooms, install defenses, and document Vera’s moves.'},
 {id:'noir-crew',title:'Nobody Stands Alone',speaker:'Nell · equipment specialist',text:'The lane crew, the doorman, and the people behind the counter finally trust one another. That is a stronger wall than anything made of brick.',hint:'Prepare your staff and successfully defend against Vera.'},
 {id:'noir-ledger',title:'The Books Never Lie',speaker:'Rosa · the one person still checking receipts',text:'Vera has the permits, the council, and half the cops smiling for her cameras. We have a profitable casino, a paper trail, and a bunch of stubborn bastards who refuse to sell. Keep the books straight or she owns us.',hint:'Run your Casino Lounge and place at least three fictional wagers.'},
 {id:'noir-warning',title:'Someone Talked',speaker:'Lou · head of night security',text:'We heard the next hit is coming. Do not ask where the tip came from. Pay the crew, lock the back door, and show Vera she cannot buy every damn person in this town.',hint:'Prepare for Vera or buy recovery coverage before the next attack.'},
 {id:'noir-accord',title:'The Midnight Accord',speaker:'Grandpa Gus · from his old journal',text:'A bowling alley is not made of pins and polished boards. It is made of people who refuse to be pushed out. Winning is not worth losing your people.',hint:'Finish the Back Alley campaign while keeping the business open.'}
];
function newNightOps(){return {entrance:0,cameras:0,crew:0,defended:0,incidents:0,nightRevenue:0,chapters:[],pending:[],responseWins:0,spins:0,spinsToday:0,lastSpin:'',casinoNet:0,houseNet:0,tableRounds:0,pitBoss:false,insuranceUntil:0,preparedUntil:0,unpaidUntil:0};}
function nightProtection(s){const n=s.campaignStory?.nightOps||newNightOps();const base=NIGHT_DEFENSES.reduce((total,d)=>total+d.power[n[d.id]||0],0);return Math.max(0,Math.floor(base*(n.unpaidUntil>=s.day?.35:1))+(n.preparedUntil>=s.day?27:0));}
function nightPayroll(s){const n=s.campaignStory?.nightOps;return s.campaignStory?.path==='backalley'&&n?((n.entrance||0)*9+(n.cameras||0)*5+(n.crew||0)*6+(n.pitBoss?19:0)):0;}
function nightShift(s){if(s.campaignStory?.path!=='backalley')return;const cost=nightPayroll(s);if(!cost)return;const n=s.campaignStory.nightOps;if(s.cash>=cost){s.cash=money(s.cash-cost);s.today.staffPay=money(s.today.staffPay+cost);s.today.expenses=money(s.today.expenses+cost);n.unpaidUntil=0;}else{n.unpaidUntil=s.day+1;note(s,'⚠ Night crew missed payroll. Security effectiveness is reduced until they are paid.','story');}}
function rivalWarning(s){const c=s.campaignStory;if(c?.path!=='backalley')return '';const op=activeOp(s);if(op){const n=op.launch-s.day;return `🚨 ${op.name}: ${n<=0?'tonight':n===1?'tomorrow night':'in '+n+' nights'}. Your defenses hold about ${Math.round(opRepelChance(s,op)*100)}% of the time; your crew can meet them on the Turf.`;}if(c.turf?.accord)return 'The Midnight Accord holds: Vera keeps away from the building. She still wants her districts back.';const t=c.turf;if(t){const due=(t.nextOpDay||s.day)-s.day;return due<=1?'⚠ A credible tip: Vera’s next operation is close.':`Vera is planning something. Expect a move within about ${due+1} nights.`;}const due=c.nextAIMoveDay-s.day;if(due<=0)return 'Vera has an operation underway. Check your cameras and review your defenses.';if(due<=2)return `⚠ A credible tip: Vera may move within ${due} game day${due===1?'':'s'}.`;return `Vera is gathering resources. Next suspected strike window: ${due} days.`;}
function prepareForRival(s){if(s.campaignStory?.path!=='backalley')return {ok:false,reason:'Back Alley campaign only'};if(s.campaignStory.nightOps.preparedUntil>=s.day)return {ok:false,reason:'Your crew is already prepared'};if(!spend(s,220))return {ok:false,reason:'Need $220'};s.campaignStory.nightOps.preparedUntil=s.day+3;recordCharge(s,'marketingSpend',220);advanceBackAlley(s);return {ok:true};}
function buyNightInsurance(s){if(s.campaignStory?.path!=='backalley')return {ok:false,reason:'Back Alley campaign only'};if(s.campaignStory.nightOps.insuranceUntil>=s.day)return {ok:false,reason:'Coverage already active'};if(!spend(s,340))return {ok:false,reason:'Need $340'};s.campaignStory.nightOps.insuranceUntil=s.day+21;recordCharge(s,'marketingSpend',340);advanceBackAlley(s);return {ok:true};}
function hirePitBoss(s){if(s.campaignStory?.path!=='backalley'||!isBuilt(s,'arcade'))return {ok:false,reason:'Open the Back Alley Casino Lounge first'};const n=s.campaignStory.nightOps;if(n.pitBoss)return {ok:false,reason:'Pit Boss already hired'};if(!spend(s,420))return {ok:false,reason:'Need $420 to hire your Pit Boss'};n.pitBoss=true;recordCharge(s,'capex',420);note(s,'🎰 Hired the Pit Boss to operate fictional-cash table games for visitors. Daily wages $19.','build');return {ok:true};}
function casinoPatronRound(s){const n=s.campaignStory?.nightOps;if(s.campaignStory?.path!=='backalley'||!n?.pitBoss||n.unpaidUntil>=s.day||s.cash<110)return;
 const stake=[8,12,16,20][Math.floor(roll(s)*4)],chance=roll(s),mult=chance<.60?0:chance<.88?2:chance<.98?3:4,payout=stake*mult;
 addIncome(s,'otherIncome',stake);s.cash=money(s.cash-payout);s.today.expenses=money(s.today.expenses+payout);
 n.tableRounds++;n.houseNet=money(n.houseNet+stake-payout);n.nightRevenue+=Math.max(0,stake-payout);
 note(s,`🎰 Casino guest wagered $${stake} in fictional cash and ${mult?'won $'+payout:'lost'}. House result: ${stake-payout>=0?'+':''}$${stake-payout}.`,'arcade');}
function casinoBet(s,stake){if(s.campaignStory?.path!=='backalley'||!isBuilt(s,'arcade'))return {ok:false,reason:'Build the Casino Lounge in The Back Alley first'};const n=s.campaignStory.nightOps;if(![10,25,50,100].includes(stake))return {ok:false,reason:'Select a valid stake'};if(n.spinsToday>=5)return {ok:false,reason:'Only five table bets per game day'};if(!spend(s,stake))return {ok:false,reason:'Insufficient alley cash for this bet'};const chance=roll(s),mult=chance<.60?0:chance<.88?2:chance<.98?3:4;const payout=stake*mult;s.cash=money(s.cash+payout);n.spins++;n.spinsToday++;n.casinoNet=money(n.casinoNet+payout-stake);if(payout>0){s.today.otherIncome=money(s.today.otherIncome+payout);s.today.income=money(s.today.income+payout);}s.today.expenses=money(s.today.expenses+stake);const result=mult?`WON $${payout} on a $${stake} bet (${mult}× gross payout)`:`LOST $${stake} at the table`;n.lastSpin=result;n.nightRevenue+=Math.max(0,payout-stake);note(s,`🎲 ${result}. Fictional game cash only.`,'arcade');advanceBackAlley(s);return {ok:true,message:result,stake,payout,mult};}
function buyNightDefense(s,id){
 if(s.campaignStory?.path!=='backalley')return {ok:false,reason:'Night defenses are available only in The Back Alley'};
 const d=NIGHT_DEFENSES.find(x=>x.id===id);if(!d)return {ok:false,reason:'Unknown security improvement'};
 const n=s.campaignStory.nightOps||=newNightOps(),level=n[id]||0;if(level>=3)return {ok:false,reason:'Already fully upgraded'};
 const cost=d.costs[level+1];if(!spend(s,cost))return {ok:false,reason:'Not enough cash for this upgrade'};
 n[id]=level+1;s.campaignStory.security=clamp(12+nightProtection(s),0,100);recordCharge(s,'capex',cost);
 note(s,`${d.icon} ${d.name} upgraded to ${d.levels[n[id]]}. Vera will have a harder time disrupting the alley.`,'build');advanceBackAlley(s);checkCampaignVictory(s);return {ok:true};
}
function unlockNightChapter(s,id){const n=s.campaignStory?.nightOps;if(!n||n.chapters.includes(id))return false;
 const ch=BACK_ALLEY_CHAPTERS.find(c=>c.id===id);if(!ch)return false;
 n.chapters.push(id);n.pending.push(id);s.eventQueue.push({id:'chapter-'+id,emoji:'🌒',kind:'noir',title:ch.title,text:`${ch.speaker}: “${ch.text}”`,effect:`NEXT: ${ch.hint}`,day:s.day});
 note(s,`🌒 Story: ${ch.title}`,'story');return true;
}
function advanceBackAlley(s){if(s.campaignStory?.path!=='backalley')return;
 const n=s.campaignStory.nightOps||=newNightOps();unlockNightChapter(s,'noir-opening');
 if(n.entrance>=1)unlockNightChapter(s,'noir-door');
 if(s.built.arcade)unlockNightChapter(s,'noir-lounge');
 if(n.incidents>=1)unlockNightChapter(s,'noir-firsthit');
 if(n.spins>=3)unlockNightChapter(s,'noir-ledger');
 if(n.preparedUntil>=s.day||n.insuranceUntil>=s.day)unlockNightChapter(s,'noir-warning');
 if(n.defended>=1&&n.crew>=1)unlockNightChapter(s,'noir-crew');
 if(s.campaignStory.victory)unlockNightChapter(s,'noir-accord');
}
function emergencyResponse(s,id){
 if(s.campaignStory?.path!=='backalley')return {ok:false,reason:'Not a Back Alley incident'};
 const outage=s.outages?.[id];if(!outage||!outage.rival)return {ok:false,reason:'No rival damage to investigate here'};
 if(!s.campaignStory.nightOps.entrance)return {ok:false,reason:'Hire door security before sending the crew to investigate'};
 const cost=70;if(!spend(s,cost))return {ok:false,reason:'Not enough cash for a supervised repair'};
 delete s.outages[id];s.campaignStory.nightOps.responseWins++;s.campaignStory.influence=clamp(s.campaignStory.influence+7,0,100);
 s.rival.pressure=clamp(s.rival.pressure-10,0,100);recordCharge(s,'capex',cost);
 note(s,`🕵️ Your night crew documented the sabotage and reopened ${outage.name}. Vera loses influence.`,'story');advanceBackAlley(s);checkCampaignVictory(s);return {ok:true};
}
function backAlleyArcadeName(s){return s.campaignStory?.path==='backalley'?'Casino Lounge':'Arcade';}
function darkMachineName(id){return ({pinball:'Midnight Jackpot',crane:'Lucky Vault',invaders:'Neon High Stakes',hockey:'House Rules',racer:'Midnight Run'})[id]||id;}

function newCampaign(){return {nightOps:newNightOps(),path:'undecided',chosenDay:0,security:12,influence:0,heat:0,trust:50,defenseWins:0,lastActionDay:0,lastAIMoveDay:0,nextAIMoveDay:0,aiStyle:'uncommitted',aiMemory:[],history:[],victory:false};}
function campaignReady(s){return !s.startupPending&&(s.story?.unlocked||[]).includes('offer')&&s.day>=((s.story.offerDay||15)+7);}
function campaignOf(s){return CAMPAIGN_PATHS.find(p=>p.id===s.campaignStory?.path)||null;}
function chooseCampaign(s,id){
 const path=CAMPAIGN_PATHS.find(p=>p.id===id);
 if(!path)return {ok:false,reason:'Unknown storyline'};
 if(!campaignReady(s))return {ok:false,reason:'The rival has not made her first offer yet'};
 if(s.campaignStory.path!=='undecided')return {ok:false,reason:'This location already chose a permanent storyline'};
 s.campaignStory={...s.campaignStory,path:id,chosenDay:s.day,aiStyle:id==='backalley'?'intimidation':'public-relations',nextAIMoveDay:s.day+6};
 s.story.pending=s.story.pending.filter(x=>x!=='offer');
 s.rival.pressure=Math.max(12,s.rival.pressure);
 if(id==='backalley'){advanceBackAlley(s);const t=turfOf(s);for(const b of s.bowlers)if((b.id==='maya'||b.id==='leo')&&(b.loyalty||0)>=CREW_LOYALTY)b.crewReady=true;s.rival.pressure=Math.max(s.rival.pressure,veraFloor(s));t.nextOpDay=s.day+3;s.campaignStory.nextAIMoveDay=0;turfLedger(s,'🌒','You turned Vera down. She took it personally.','threat');s.eventQueue.push({id:'turf-intro',kind:'noir',emoji:'🌃',title:'Vera’s grip',text:'“You had your chance to sell.” From tonight Vera leans on the alley every single night: lookouts on the corner, paint on your walls, envelopes for your bowlers. Every few days her crew comes for something bigger, and you get a warning first.',effect:'Maya (and Leo, if he has joined) volunteer for your night crew. Open the new 🌃 Turf tab: watch her grip, meet her crews with your bowlers, and take the city back one district at a time.',day:s.day});}
 const msg=id==='backalley'?'🌒 The Back Alley begins. Vera is no longer just a business problem. Protect your crew, choose your contacts carefully, and decide what you are willing to risk.':'🌟 The Legacy begins. Build a landmark strong enough to outlast StrikeCity and rally the town.';
 log(s,msg);note(s,msg,'story');advanceStory(s);return {ok:true,path:id};
}
function campaignMission(s){
 const c=s.campaignStory;
 if(c.path==='backalley')return `Take the city (${DISTRICTS.filter(d=>districtStatus(s,d.id).owner==='player').length}/6 districts) — or win the Midnight Accord: door crew Lv ${c.nightOps.entrance}/2 · cameras Lv ${c.nightOps.cameras}/2 · crew Lv ${c.nightOps.crew}/1 · defended ${c.nightOps.defended}/2 · casino visits ${s.roomVisits.arcade||0}/35 · Vera pressure ${s.rival.pressure}/40 maximum`;
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
function accordReady(s){const c=s.campaignStory,n=c.nightOps;return n.entrance>=2&&n.cameras>=2&&n.crew>=1&&n.defended>=4&&DISTRICTS.filter(d=>districtStatus(s,d.id).owner==='player').length>=3&&s.built.arcade&&(s.roomVisits.arcade||0)>=35&&lanes(s)>=6&&s.rival.pressure<=40;}
function checkCampaignVictory(s){const c=s.campaignStory;if(c.victory)return false;
 if(c.path==='backalley'&&!c.turf?.accord&&accordReady(s)){
  const t=turfOf(s);t.accord=true;advanceBackAlley(s);s.rep=money(s.rep+12);shiftPressure(s,-10);const msg='🌒 The Midnight Accord: Vera sends a single white rose and a note. Her crews will stay away from your building. The streets are another matter.';c.history.unshift({day:s.day,who:'Story',text:msg});turfLedger(s,'🌹','The Midnight Accord: Vera stops hitting the building itself. She still wants the city.','win');s.eventQueue.push({id:'noir-accord',emoji:'🌒',title:'The Midnight Accord',kind:'noir',text:msg,effect:'Milestone: no more raids on your rooms and lanes. Vera still squeezes and still tries to retake districts. Take all six to finish her.'});log(s,msg);return false;
 }
 if(c.path==='legacy'&&(s.tournamentWins.national||0)>0&&s.rival.community>=4&&alleyStars(s)>=4){
  c.victory=true;const msg='🌟 Community Charter: Your National Heritage Cup victory and neighbors safeguard the alley as a beloved landmark.';c.history.unshift({day:s.day,who:'Story',text:msg});s.eventQueue.push({id:'legacy-finale',emoji:'🌟',title:'Community Charter',kind:'good',text:msg,effect:'Campaign complete. Continue improving your bowling center.'});log(s,msg);return true;
 }
 return false;
}
// Deterministic opponent: Vera observes current defenses, pressure, popularity,
// partnerships and heat rather than drawing a purely unrelated event.
function rivalAIMove(s){
 const c=s.campaignStory;if(c.path==='backalley')return veraNight(s);
 if(c.path==='undecided'||c.victory||s.startupPending||s.day<c.nextAIMoveDay)return false;
 if(s.day-(s.lastRandomEventDay??-100)<5)return false;
 const dark=c.path==='backalley',n=c.nightOps||newNightOps(),protection=nightProtection(s);
 let action='permit-challenge',entry;
 if(dark){
  const targets=[...s.lanes.filter(l=>!activeOutage(s,'lane'+l.id)).map(l=>({id:'lane'+l.id,name:'Lane '+l.id})),
   ...['snack','bar','arcade','proshop','restrooms'].filter(id=>id==='restrooms'?s.fixtures.restrooms:s.built[id]).filter(id=>!activeOutage(s,id)).map(id=>({id,name:id==='arcade'?'Casino Lounge':id==='bar'?'Speakeasy':id==='snack'?'Night Grill':id==='proshop'?'Backroom Outfitters':'Restrooms'}))];
  action=c.heat>=45?'paper-trail':s.built.arcade&&n.cameras<2?'neon-blackout':n.entrance<1?'door-intimidation':n.crew<1?'staff-scare':'targeted-sabotage';
  const chance=clamp(.72-protection*.006, .07,.8),success=targets.length>0&&roll(s)<chance;
  const chosen=action==='neon-blackout'?targets.find(t=>t.id==='arcade'):action==='staff-scare'?targets.find(t=>t.id==='bar'||t.id==='snack'):action==='door-intimidation'?targets.find(t=>t.id.startsWith('lane')):null;
  const target=chosen||(targets.length?targets[Math.floor(roll(s)*targets.length)]:null);
  if(success&&target){const baseCost=110+Math.floor(roll(s)*140),insured=n.insuranceUntil>=s.day,cost=insured?Math.max(30,Math.round(baseCost*.4)):baseCost;s.outages[target.id]={name:target.name,cost,day:s.day,rival:true};n.incidents++;
   if(action==='paper-trail'){s.rep=Math.max(0,money(s.rep-2));s.eventBoostFactor=.85;s.eventBoostUntil=s.day+2;}
   if(action==='door-intimidation'){s.eventBoostFactor=.82;s.eventBoostUntil=s.day+2;}
   if(action==='staff-scare')for(const employee of s.employees||[])employee.morale=clamp((employee.morale??70)-5,0,100);
   s.rival.pressure=clamp(s.rival.pressure+12,0,100);c.trust=clamp(c.trust-4,0,100);
   const method={
   'paper-trail':`Vera's lawyers show up with a surprise challenge to your permits. ${target.name} is temporarily sealed, and the bad publicity slows visits.`,
   'neon-blackout':`The power fails in your Casino Lounge after a stranger visits the utility closet. Vera calls it unfortunate luck.`,
   'door-intimidation':`A group of intimidating visitors rattles the entrance and damages ${target.name}. Some customers avoid the alley for two nights.`,
   'staff-scare':`Your crew finds signs of interference at ${target.name}. Everyone is shaken, and staff morale drops.`,
   'targeted-sabotage':`A suspicious overnight malfunction closes ${target.name}. Vera denies involvement, but you recognize her pattern.`
   };
   entry={id:'vera-'+action,kind:'noir',emoji:'🚨',title:({'paper-trail':'A Sudden Permit Challenge','neon-blackout':'The Neon Goes Dark','door-intimidation':'Trouble at the Front Door','staff-scare':'A Warning for the Crew','targeted-sabotage':'Another StrikeCity Interference'})[action],text:method[action],effect:`${target.name} is CLOSED until repaired. ${insured?'Recovery coverage absorbed 60% of the repair bill. ':''}Repair $${cost}; investigate with security for $70.`,repairId:target.id,day:s.day};
  }else{n.defended++;c.influence=clamp(c.influence+6,0,100);c.trust=clamp(c.trust+2,0,100);s.rival.pressure=clamp(s.rival.pressure-8,0,100);
   entry={id:'vera-repelled',kind:'noir',emoji:'🛡️',title:'Your night crew held the line',text:`Vera tried to unsettle the operation, but your security measures stopped the disruption. Staff feel safer and the town notices.`,effect:'Successful defense recorded. Influence +6; Vera pressure −8.',day:s.day};}
  advanceBackAlley(s);
 }else{
  const publicSupport=s.rival.community>=3||s.rep>=60;action=publicSupport?'price-war':'permit-challenge';
  const increase=publicSupport?4:12;s.rival.pressure=clamp(s.rival.pressure+increase,0,100);
  if(action==='price-war'){s.eventBoostFactor=.94;s.eventBoostUntil=s.day+2;}
  entry={id:'vera-'+action,kind:'rival',emoji:'🏢',title:action==='price-war'?'StrikeCity lowers prices':'Vera contests the permits',text:action==='price-war'?'StrikeCity launches a discount campaign. Your regulars still have your back.':'Vera uses paperwork to slow your expansion. Community allies and legal help can counter her.',effect:`Vera pressure +${increase}. Rally neighbors or seek legal help.`,day:s.day};
 }
 c.aiStyle=action;c.lastAIMoveDay=s.day;c.nextAIMoveDay=s.day+6+Math.floor(roll(s)*4);c.aiMemory.unshift({day:s.day,action,pressure:s.rival.pressure});c.aiMemory=c.aiMemory.slice(0,30);
 c.history.unshift({day:s.day,who:'Vera Vale',text:entry.title});c.history=c.history.slice(0,25);
 s.lastRandomEventDay=s.day;s.eventQueue.push(entry);s.eventHistory.unshift(entry);s.eventHistory=s.eventHistory.slice(0,25);
 note(s,`${entry.emoji} ${entry.title}: ${entry.text}`,'story');checkCampaignVictory(s);return true;
}
function freshStory(){return {unlocked:['inheritance'],pending:['inheritance'],charter:false};}
function freshPatrons(){return Object.fromEntries(PATRON_PROFILES.map(p=>[p.id,{id:p.id,visits:0,loyalty:12,lastVisit:0,lastTalk:0,leagueMember:false,disappointed:0}]));}
function openChapter(s,id,silent=false){s.story??=freshStory();if(s.story.unlocked.includes(id))return false;
 const c=STORY_CHAPTERS.find(x=>x.id===id);if(!c)return false;
 s.story.unlocked.push(id);if(id==='offer'&&!s.story.offerDay)s.story.offerDay=s.day;if(!silent){s.story.pending.push(id);log(s,`📖 New chapter: ${c.title}.`);note(s,`New story chapter: ${c.title}`,'story');}return true;}
function advanceStory(s){
 if(!s.startupPending)openChapter(s,'inheritance');
 if(lanes(s)>=1)openChapter(s,'firstlane');
 if(s.day>=15&&lanes(s)>=1)openChapter(s,'offer');
 if(venueLevel(s)>=3&&s.campaignStory?.path!=='undecided')openChapter(s,'established');
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
// v1.08: each regular has a personality and a set of scenes (see PATRON_SCENES below).
// v1.08 regulars' encounters. Each regular has a personality; three answers per scene all sound
// reasonable, and which one lands depends on who is asking. d = loyalty change (hidden from players).
// tier: 0 any time, 1 loyalty >= 35, 2 loyalty >= 60. need: room that must be built. flag: requires an
// earlier answer. set: remembers this answer for a later scene. route: story route only.
const PATRON_SCENES={
 lou:[
  {id:'lou-photo',tier:0,prompt:'Found Gus’s old league photo in my garage. Frame’s cracked. Probably junk.',options:[
   {id:'a',text:'Bring it in. We’ll hang it by the front desk.',d:5,reply:'Hm. Maybe. He’d hate the fuss, though.'},
   {id:'b',text:'Keep it. Sounds like it means more to you than to a wall.',d:13,reply:'…Yeah. Yeah, it does. You’re more like him than you know.',set:'louPhotoKept'},
   {id:'c',text:'Get it reframed first so it looks right.',d:-5,reply:'Now it’s a project. Never mind.'}]},
  {id:'lou-oil',tier:0,prompt:'Lane two’s running a little dry on the left. Not that anyone asked me.',options:[
   {id:'a',text:'I’m asking. What would you change?',d:12,reply:'Finally. Less oil past the arrows, more up front. Gus knew.'},
   {id:'b',text:'Thanks, Lou. I’ll have someone look at it.',d:4,reply:'Sure. Someone.'},
   {id:'c',text:'Seems fine to me, but I appreciate it.',d:-6,reply:'Seemed fine to the last manager too.'}]},
  {id:'lou-music',tier:0,prompt:'Who picked this music? Sounds like a phone falling down the stairs.',options:[
   {id:'a',text:'The younger crowd likes it. We’ll find a balance.',d:10,reply:'Fair. Just not before seven. Deal?'},
   {id:'b',text:'I’ll switch it to the oldies for you right now.',d:-4,reply:'Don’t do that for me. I’m not a museum.'},
   {id:'c',text:'You should’ve heard yesterday’s playlist.',d:5,reply:'Worse? Impossible.'}]},
  {id:'lou-knees',tier:1,prompt:'Doc says I should quit bowling. Bad knees. Says it like it’s easy.',options:[
   {id:'a',text:'Then don’t quit. We’ll find you a lighter ball.',d:6,reply:'You and the doc should fight it out.'},
   {id:'b',text:'Bowl slower. You’ve got nothing to prove here.',d:13,reply:'Nothing to prove. Ha. Tell that to Rosa.'},
   {id:'c',text:'Your health comes first, Lou. Take a break.',d:-3,reply:'Sounds like the doc. Didn’t ask for a second one.'}]},
  {id:'lou-prices',tier:1,prompt:'Heard you raised prices. Gus kept a lane at two bucks for forty years.',options:[
   {id:'a',text:'Gus also nearly lost the building. I’m keeping it open.',d:11,reply:'…Hard to argue with that. Hard to like it, too.'},
   {id:'b',text:'For you, Lou, the old price stands.',d:-5,reply:'I don’t need charity. I need this place to survive.'},
   {id:'c',text:'Nothing’s final. What do you think is fair?',d:7,reply:'Lanes cost money. Just don’t nickel-and-dime the shoes.'}]},
  {id:'lou-fire',tier:2,prompt:'Did Gus ever tell you about the night the pinsetter caught fire?',options:[
   {id:'a',text:'No. Tell me everything.',d:8,reply:'Grab a chair. It’s a long one, and half of it’s even true.'},
   {id:'b',text:'Only about a hundred times.',d:14,reply:'Ha! Then you know he lied about the fire extinguisher.'},
   {id:'c',text:'I’d rather hear about you, actually.',d:3,reply:'Me? Not much to tell. …Okay, maybe one thing.'}]},
  {id:'lou-mantel',tier:1,flag:'louPhotoKept',prompt:'Put Gus’s photo on my mantel. My wife says it watches her cook.',options:[
   {id:'a',text:'Smart wife.',d:9,reply:'Smartest thing in the house. Don’t tell her I said so.'},
   {id:'b',text:'Bring it in someday. When you’re ready.',d:12,reply:'Someday. …Maybe Thursday.'},
   {id:'c',text:'Honestly, it would look better here.',d:-4,reply:'Better? It’s fine where it is.'}]},
  {id:'lou-vera',tier:1,route:'backalley',prompt:'People say Vera’s money is in this place now. True?',options:[
   {id:'a',text:'Some of it. I won’t hide that from you.',d:12,reply:'Then I’ll keep my eyes open. For you, not her.'},
   {id:'b',text:'People say a lot of things, Lou.',d:-3,reply:'That’s what Gus’s partner said in ’89.'},
   {id:'c',text:'Would it change how you feel about the place?',d:4,reply:'…Ask me again in a month.'}]}
 ],
 bea:[
  {id:'bea-cheese',tier:0,prompt:'Your nacho cheese is from a can. I can tell. Everybody can tell.',options:[
   {id:'a',text:'Guilty. Got a better idea?',d:12,reply:'My cousin has a cheese guy. Leave it with me.',set:'beaCheese'},
   {id:'b',text:'It’s what the budget allows for now.',d:4,reply:'Budgets. Hmph. Fair.'},
   {id:'c',text:'Customers haven’t complained.',d:-7,reply:'They complain to ME, sweetheart.'}]},
  {id:'bea-special',tier:0,prompt:'The league wants a Thursday snack special. Should I tell them yes?',options:[
   {id:'a',text:'Yes. Whatever they want.',d:3,reply:'Whatever they want? You haven’t met them.'},
   {id:'b',text:'Let’s try it for a month and see.',d:11,reply:'Sensible. I’ll keep the list.'},
   {id:'c',text:'Not until the counter can handle the rush.',d:6,reply:'Smart. Don’t promise what you can’t cook.'}]},
  {id:'bea-granddaughter',tier:0,prompt:'My granddaughter wants a summer job here. She’s fifteen and thinks she’s forty.',options:[
   {id:'a',text:'Send her over. I’ll find her something.',d:7,reply:'Don’t go easy on her. She’ll walk all over you.'},
   {id:'b',text:'Too young for the counter, but she can help at parties.',d:13,reply:'Ooh, a straight answer. I like you more every week.'},
   {id:'c',text:'Have her apply like everyone else.',d:2,reply:'Fair, I suppose. Cold, but fair.'}]},
  {id:'bea-gossip',tier:1,prompt:'Did you hear about Milo and the girl from the shoe counter? No? Good. Neither did I.',options:[
   {id:'a',text:'My lips are sealed.',d:6,reply:'Good. Mine never are, so somebody has to.'},
   {id:'b',text:'Bea. Tell me everything.',d:12,reply:'Ha! Sit down. Get me a soda first.'},
   {id:'c',text:'I’d rather stay out of it.',d:-2,reply:'Suit yourself. Boring, but suit yourself.'}]},
  {id:'bea-tired',tier:1,prompt:'Long week. My feet hurt, my team lost, and the coffee here is a crime.',options:[
   {id:'a',text:'Coffee’s on me tonight.',d:5,reply:'Bribery. It’s working, a little.'},
   {id:'b',text:'Sit. I’ll bring you something that isn’t coffee.',d:12,reply:'You’re a good egg. Bad at coffee, but a good egg.'},
   {id:'c',text:'Want me to talk to the league about the schedule?',d:-3,reply:'Don’t you dare. I handle my own team.'}]},
  {id:'bea-napkins',tier:2,prompt:'I’ve folded your napkins for a month. I’m not asking for anything. Just noting it.',options:[
   {id:'a',text:'I noticed. Thank you, Bea.',d:9,reply:'Well. Somebody did.'},
   {id:'b',text:'Then your league fees are on the house this month.',d:3,reply:'I said I wasn’t asking. Now I feel like I was.'},
   {id:'c',text:'Want to run the snack special nights? Officially?',d:14,reply:'Officially? With a name tag? Oh, I’d love a name tag.'}]},
  {id:'bea-cheese-guy',tier:0,flag:'beaCheese',prompt:'My cousin’s cheese guy came through. Want to try a sample?',options:[
   {id:'a',text:'Bring it on.',d:10,reply:'Ha! You’ll never go back to the can.'},
   {id:'b',text:'Only if the price works.',d:7,reply:'Smart. It’s a little more. Worth it.'},
   {id:'c',text:'Maybe later. We’re slammed tonight.',d:-6,reply:'He drove forty minutes, but sure. Later.'}]}
 ],
 dex:[
  {id:'dex-board',tier:0,prompt:'I just got the high score on Pinball. Will you put my name on a chalkboard?',options:[
   {id:'a',text:'Beat it twice and it goes up.',d:12,reply:'A challenge. Okay. OKAY. Watch me.',set:'dexBoard'},
   {id:'b',text:'Done. Right by the door.',d:5,reply:'Cool, cool. …Little too easy, though.'},
   {id:'c',text:'We don’t really do that here.',d:-7,reply:'Wow. Okay.'}]},
  {id:'dex-tilt',tier:0,need:'arcade',prompt:'Machine three tilts if you breathe on it. Lost a whole run to it.',options:[
   {id:'a',text:'I’ll get it fixed, and your next game’s free.',d:5,reply:'The game’s nice. The fix matters more.'},
   {id:'b',text:'Show me what happened.',d:12,reply:'Finally, someone who wants the replay.'},
   {id:'c',text:'Tilting is part of pinball, Dex.',d:-4,reply:'Not like THIS it isn’t.'}]},
  {id:'dex-rival',tier:0,prompt:'Some kid’s been gunning for my score. He’s… actually good.',options:[
   {id:'a',text:'Want me to tell him to back off?',d:-6,reply:'What? No. That’s the whole point.'},
   {id:'b',text:'Good. You were getting lazy.',d:13,reply:'Lazy?! …Okay, a little lazy.'},
   {id:'c',text:'Let’s set up a head-to-head night.',d:8,reply:'Like, with people watching? …Yeah.'}]},
  {id:'dex-mom',tier:1,prompt:'My mom says I spend too much time here. She might be right. Don’t tell her.',options:[
   {id:'a',text:'Your secret’s safe. Same time tomorrow?',d:5,reply:'Ha. Probably.'},
   {id:'b',text:'Want a few paid shifts in the arcade? Then she can’t say much.',d:12,reply:'Wait, paid? …I’m telling her it was my idea.'},
   {id:'c',text:'Maybe listen to her a little.',d:-2,reply:'Great. Two moms.'}]},
  {id:'dex-crane',tier:1,prompt:'There’s a trick to the crane machine. I could tell you, but then you’d have to fix it.',options:[
   {id:'a',text:'Tell me, and I’ll fix it.',d:11,reply:'Respect. Most owners pretend they don’t know.'},
   {id:'b',text:'Keep it to yourself, okay?',d:2,reply:'Sure. …It’s still kind of rigged, though.'},
   {id:'c',text:'Is it costing me money?',d:6,reply:'Not much. It’s costing kids their dignity.'}]},
  {id:'dex-tourney',tier:2,prompt:'What if this place ran an arcade tournament? Like, an actual one.',options:[
   {id:'a',text:'Plan it and I’ll back you.',d:14,reply:'Me? Plan it? …I need a clipboard.'},
   {id:'b',text:'Too much hassle right now.',d:-5,reply:'Everything’s hassle until it’s fun.'},
   {id:'c',text:'Only if you promise not to enter.',d:8,reply:'That’s cold. It’s fair. It’s cold.'}]},
  {id:'dex-erased',tier:0,flag:'dexBoard',prompt:'Someone erased my name off the board. Twice. Was it you?',options:[
   {id:'a',text:'Maybe. Beat your score again and find out.',d:12,reply:'Okay. Now it’s personal.'},
   {id:'b',text:'No! I’ll find out who did it.',d:4,reply:'Don’t. Then I’ll never know if I’d have caught them.'},
   {id:'c',text:'Write it in marker this time.',d:7,reply:'…That’s vandalism. I like it.'}]}
 ],
 rosa:[
  {id:'rosa-night',tier:0,prompt:'How about a little community night at the bar? Thursday, maybe?',options:[
   {id:'a',text:'Plan it with me. What do people actually want?',d:8,reply:'Music, cheap fries, and nobody checking the time.'},
   {id:'b',text:'Bring your friends. I’ll handle the rest.',d:12,reply:'Look at you! Okay, I’m bringing everybody.'},
   {id:'c',text:'Let’s wait until the bar has a few good weeks.',d:-5,reply:'Waiting is how nothing ever happens.'}]},
  {id:'rosa-cutoff',tier:0,prompt:'Your bartender cut me off last night. ME.',options:[
   {id:'a',text:'Then you probably needed cutting off.',d:12,reply:'…Rude. Correct, but rude. Tell her I’m sorry.'},
   {id:'b',text:'I’ll have a word with her.',d:-6,reply:'Don’t you dare. She was right and we both know it.'},
   {id:'c',text:'Want your next drink on the house?',d:3,reply:'That’s sweet. Doesn’t fix my pride, though.'}]},
  {id:'rosa-dance',tier:0,prompt:'If the jukebox plays one more slow song, I’m dancing on lane four.',options:[
   {id:'a',text:'Lane four was just oiled. Use lane five.',d:13,reply:'Ha! Lane five it is.'},
   {id:'b',text:'Please don’t. Insurance.',d:3,reply:'Fine. You’re no fun. Sometimes you’re fun.'},
   {id:'c',text:'Pick the next three songs.',d:8,reply:'Power. Finally.'}]},
  {id:'rosa-sister',tier:1,prompt:'My sister’s in town. She thinks bowling is for old men. Help me prove her wrong.',options:[
   {id:'a',text:'Bring her Saturday. First game’s on me.',d:6,reply:'She’ll still complain. But she’ll come.'},
   {id:'b',text:'Bowling IS for old men. Old men are having a great time.',d:12,reply:'Ha! I’m telling her you said that.'},
   {id:'c',text:'Maybe she’d like the arcade more?',d:2,reply:'Maybe. She’d like being right more.'}]},
  {id:'rosa-quiet',tier:1,prompt:'Don’t make a fuss. I’m fine. Just pour me a soda.',options:[
   {id:'a',text:'One soda. I’ll sit here, quietly.',d:14,reply:'…Thank you. Quiet is good tonight.'},
   {id:'b',text:'You sure? You can talk to me.',d:4,reply:'I said I’m fine.'},
   {id:'c',text:'Bad week? I’ll get some music going.',d:-5,reply:'Not tonight. Please.'}]},
  {id:'rosa-toast',tier:2,prompt:'I want to give a toast at league night. About you. Don’t argue.',options:[
   {id:'a',text:'Okay. I won’t argue.',d:9,reply:'Good. It’s mostly embarrassing stories.'},
   {id:'b',text:'Make it about Gus instead.',d:12,reply:'…He’d have liked that. I’ll do both.'},
   {id:'c',text:'Please don’t.',d:-3,reply:'Too late. I wrote it on a napkin.'}]},
  {id:'rosa-suits',tier:1,route:'backalley',prompt:'Men in suits at the back booth again. They tip well. Should I worry?',options:[
   {id:'a',text:'Yes. Stay away from that booth.',d:11,reply:'Okay. Thank you for being straight with me.'},
   {id:'b',text:'They’re business partners. You’re fine.',d:-4,reply:'Business. Sure.'},
   {id:'c',text:'Tips are tips.',d:2,reply:'That’s what my uncle said. Before.'}]}
 ],
 nell:[
  {id:'nell-clean',tier:0,prompt:'These house balls need a proper cleaning. Mind if I do a few?',options:[
   {id:'a',text:'Please. I’d like to learn how you do it.',d:12,reply:'Bring a towel. And patience.'},
   {id:'b',text:'That’s kind, but it’s our job, not yours.',d:6,reply:'Fair. Then do it properly. I’ll check.'},
   {id:'c',text:'Go ahead! You’re the best.',d:2,reply:'“The best” isn’t a cleaning method.'}]},
  {id:'nell-span',tier:0,prompt:'Your pro shop drilled my span a quarter inch too wide.',options:[
   {id:'a',text:'We’ll redrill it for free, today.',d:7,reply:'Today is good. Correct is better.'},
   {id:'b',text:'Show me. I want to understand what went wrong.',d:13,reply:'Okay. Look at the thumb pitch. See?'},
   {id:'c',text:'A quarter inch? Can you really feel that?',d:-8,reply:'Can you feel a stone in your shoe?'}]},
  {id:'nell-lane3',tier:0,prompt:'Lane three is the best lane in the county. Don’t change anything.',options:[
   {id:'a',text:'Noted. What makes it the best?',d:12,reply:'The pin deck is level. Nobody believes me.'},
   {id:'b',text:'We’re resurfacing it next month, actually.',d:2,reply:'…Why would you do that?'},
   {id:'c',text:'That means a lot, coming from you.',d:5,reply:'It’s not a compliment. It’s a measurement.'}]},
  {id:'nell-illegal',tier:1,prompt:'Someone in the league is using an illegal ball. I won’t say who.',options:[
   {id:'a',text:'Then there’s not much I can do, is there?',d:5,reply:'…Fair. Watch the third lane on Thursdays.'},
   {id:'b',text:'I’ll check every ball next week. Everyone’s.',d:12,reply:'Good. No favorites. That’s how it should be.'},
   {id:'c',text:'Is it really that big a deal?',d:-7,reply:'The rules are the whole game.'}]},
  {id:'nell-shoulder',tier:1,prompt:'Your bowlers drop their shoulder on the release. All of them.',options:[
   {id:'a',text:'Could you show them?',d:11,reply:'Fifteen minutes. And they listen, or I leave.'},
   {id:'b',text:'Their coach says the form’s fine.',d:-3,reply:'Then their coach is wrong.'},
   {id:'c',text:'Huh. Even Maya?',d:6,reply:'Especially Maya. She’s good enough to fix it.'}]},
  {id:'nell-collection',tier:2,prompt:'Thinking of selling my old ball collection. Thirty-one balls.',options:[
   {id:'a',text:'Sell them in our pro shop. Keep every dollar.',d:9,reply:'No cut for you? Bad business. …Thank you.'},
   {id:'b',text:'Don’t sell. Lend them to the youth league.',d:14,reply:'…I hadn’t thought of that. Kids should learn on real equipment.'},
   {id:'c',text:'I’d buy the lot for the shop.',d:3,reply:'They’re not inventory. But thank you.'}]}
 ],
 milo:[
  {id:'milo-discount',tier:0,prompt:'My friends asked if we could get a group discount someday.',options:[
   {id:'a',text:'How many friends are we talking?',d:11,reply:'Eleven. Twelve if Gary shows up. Gary never shows up.'},
   {id:'b',text:'Sure. Ten percent off for your crew.',d:3,reply:'Nice! …They’ll still complain.'},
   {id:'c',text:'Bring them first. Then we’ll talk.',d:7,reply:'Ha! A negotiator. I respect it.'}]},
  {id:'milo-shoes',tier:0,prompt:'Do these rental shoes come with a personality upgrade?',options:[
   {id:'a',text:'No, but they come with someone else’s foot smell.',d:12,reply:'HA. Okay, you’re funny. Didn’t expect that.'},
   {id:'b',text:'They’re cleaned after every use, I promise.',d:-3,reply:'Oh… okay. Cool. Cool cool.'},
   {id:'c',text:'Personality’s extra. Two dollars.',d:9,reply:'Worth it. Add two.'}]},
  {id:'milo-gary',tier:0,prompt:'It’s Gary’s birthday. Gary isn’t here. Can we sing anyway?',options:[
   {id:'a',text:'Absolutely. Loudly.',d:12,reply:'Everyone! For Gary!'},
   {id:'b',text:'Maybe keep it down for the other lanes?',d:-5,reply:'Gary would’ve wanted it loud.'},
   {id:'c',text:'Only if you record it for him.',d:8,reply:'Genius. He’s going to hate this.'}]},
  {id:'milo-alone',tier:1,prompt:'Friends cancelled. Again. Mind if I just bowl alone for a bit?',options:[
   {id:'a',text:'Want company? I’ve got ten minutes.',d:13,reply:'…Yeah. Yeah, I’d like that.'},
   {id:'b',text:'Of course. The lane’s yours.',d:5,reply:'Thanks.'},
   {id:'c',text:'Want me to pair you with another group?',d:1,reply:'Nah. Strangers. Not tonight.'}]},
  {id:'milo-costumes',tier:1,prompt:'Idea: glow-in-the-dark bowling, but everyone wears a costume.',options:[
   {id:'a',text:'That’s ridiculous. I love it.',d:12,reply:'THANK you. Everyone else said ridiculous and stopped.'},
   {id:'b',text:'Costumes might slow down the lanes.',d:-4,reply:'Logistics. The enemy of fun.'},
   {id:'c',text:'Write it up and I’ll think about it.',d:3,reply:'Homework. Great.'}]},
  {id:'milo-moving',tier:2,prompt:'I might be moving for a job. Two hours away. Kinda scary.',options:[
   {id:'a',text:'Two hours is nothing. Your lane will be waiting.',d:12,reply:'…Promise? Okay. That helps.'},
   {id:'b',text:'That’s huge! Congratulations!',d:5,reply:'Thanks. Yeah. It is huge.'},
   {id:'c',text:'Do you want to go?',d:9,reply:'Honestly? I don’t know yet.'}]}
 ]
};

// Scene choice uses a hash of day/patron/history instead of the game RNG, so conversations never
// change the economy simulation. Answers are shown in a hashed order with no "right" styling.
function sceneHash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function sceneTier(p){return p.loyalty>=60?2:p.loyalty>=35?1:0;}
function sceneAvailable(s,p,sc){const route=s.campaignStory?.path;return sc.tier<=sceneTier(p)&&(!sc.need||isBuilt(s,sc.need))&&(!sc.flag||p.flags?.[sc.flag])&&(!sc.route||sc.route===route);}
function encounterScene(s,e){const p=s.patrons?.[e?.id],list=PATRON_SCENES[e?.id];if(!p||!list)return null;
 if(e.scene){const known=list.find(x=>x.id===e.scene);if(known)return known;}
 p.seen=Array.isArray(p.seen)?p.seen:[];
 let pool=list.filter(sc=>sceneAvailable(s,p,sc)&&!p.seen.includes(sc.id));
 if(!pool.length){p.seen=p.seen.filter(id=>!list.some(sc=>sc.id===id&&sceneAvailable(s,p,sc)));pool=list.filter(sc=>sceneAvailable(s,p,sc)&&sc.id!==p.lastScene);}
 if(!pool.length)pool=list.filter(sc=>sceneAvailable(s,p,sc));
 const follow=pool.filter(sc=>sc.flag);if(follow.length)pool=follow; // callbacks to earlier answers come first
 const pick=pool[sceneHash(e.id+':'+s.day+':'+p.seen.length)%pool.length];e.scene=pick.id;return pick;}
function encounterOptions(s,e){const sc=encounterScene(s,e);if(!sc)return [];const h=sceneHash(sc.id+':'+s.day);
 const order=[...sc.options].sort((x,y)=>sceneHash(x.id+':'+h)-sceneHash(y.id+':'+h));return order.map(o=>({id:o.id,text:o.text}));}
// Legacy single prompts kept for older references.
const PATRON_DIALOGUES={
 lou:{prompt:'I knew Gus before the first perfect game. Should we hang up his old team photo?',yes:'Hang it up. Gus deserves a wall.',no:'Not until we renovate the place.'},
 bea:{prompt:'The league members want a snack special. Should I spread the word?',yes:'Absolutely! Make it a tradition.',no:'Tell them we are too busy.'},
 dex:{prompt:'I just got the high score. Will you put my name on a chalkboard?',yes:'You earned a spot on the board!',no:'We do not celebrate arcade scores.'},
 rosa:{prompt:'How about a little community night at the bar?',yes:'Bring your friends! We will plan one.',no:'Keep the bar quiet, please.'},
 nell:{prompt:'These bowling balls could use a careful cleaning. Mind if I help?',yes:'Yes, please! We love expert eyes.',no:'I think the equipment is fine.'},
 milo:{prompt:'My friends asked if we could get a group discount someday.',yes:'Tell them they are always welcome.',no:'No discounts. Ever.'}
};
function respondEncounter(s,id,answer){const e=s.encounters[0],p=s.patrons[id];if(!e||e.id!==id||!p)return {ok:false,reason:'That conversation is not available'};
 const profile=PATRON_PROFILES.find(x=>x.id===id),sc=encounterScene(s,e);if(!sc)return {ok:false,reason:'That conversation is not available'};
 const opt=sc.options.find(o=>o.id===answer);if(!opt)return {ok:false,reason:'Choose one of the answers'};
 // A small bonus when the alley already has what this regular loves, only if the answer landed.
 const delta=opt.d+(opt.d>0&&profile.wish&&profile.wish!=='comfort'&&isBuilt(s,profile.wish)?2:0);
 p.loyalty=clamp(p.loyalty+delta,0,100);p.lastTalk=s.day;p.talks=(p.talks||0)+1;p.lastScene=sc.id;p.lastReply=opt.reply;
 p.seen=Array.isArray(p.seen)?p.seen:[];if(!p.seen.includes(sc.id))p.seen.push(sc.id);if(p.seen.length>30)p.seen=p.seen.slice(-30);
 if(opt.set){p.flags=p.flags||{};p.flags[opt.set]=true;}
 s.encounters.shift();
 const mood=delta>=9?'warmer':delta>=1?'same':'cooler';
 note(s,`${profile.name}: “${opt.reply}” (${mood==='warmer'?'friendship grew':mood==='cooler'?'a little cooler':'friendly'})`,'feedback');
 return {ok:true,delta,reply:opt.reply,mood};
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
 const eligible=EVENT_CATALOG.filter(e=>e.kind==='good'||e.kind==='rival'&&s.campaignStory?.path!=='backalley'||e.id==='lane'&&s.lanes.length>0||e.id==='restrooms'&&s.fixtures.restrooms||s.built[e.id]);
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
function newGame(seed=271828){return {version:20,arcadePrices:{},attractionFees:{},shopPrice:12,cityLeagues:{},departmentEquipment:{},seasonHistory:[],circuitWins:{},staffDepartures:[],departmentAchievements:{},staffIssues:[],lastStaffIssueDay:-100,teamStory:{mayaIntroduced:false,leoJoined:false,firstFrame:{status:"locked",shots:[],lastResult:""}},districts:{oldtown:{owner:"vera",victories:0}},tactical:null,battle:null,locationName:'The Back Alley',portfolio:{activeId:'home',snapshots:{},opened:[]},campaignStory:newCampaign(),bookings:[],bookingSerial:0,roomDetails:{},vipGroups:Object.fromEntries(VIP_GROUPS.map(g=>[g.id,{visits:0,lastDay:0}])),hardshipUses:0,emergencyCoverageUntil:0,rival:{pressure:0,community:0,protectionUntil:0,lastResponseDay:0},story:freshStory(),patrons:freshPatrons(),seed:seed>>>0,laneRotation:0,storyCursor:0,day:1,hour:OPEN,cash:600,startupPending:true,startupFinance:null,starterStyle:null,loan:{balance:0,payment:0,initial:0,lastPaymentDay:0},happiness:65,happinessHistory:[],specialty:null,landOwned:false,expansionStage:0,outages:{},lastRandomEventDay:-100,eventBoostUntil:0,eventBoostFactor:1,eventQueue:[],eventHistory:[],lastPartyRequestDay:-100,pendingPartyRequest:null,partyBooking:null,lastEncounterDay:0,encounters:[],partnerships:{school:false,teams:false,charity:false,office:false,neighbors:false},earned:0,rep:0,totalServed:0,minVenueLevel:1,
 built:{roof:true},lanes:[],parts:4,benches:0,construction:[],facilityNotices:[],campaign:null,barStock:0,barPrice:9,barVisits:0,barStockById:Object.fromEntries(DRINKS.map(i=>[i.id,0])),barPrices:Object.fromEntries(DRINKS.map(i=>[i.id,i.price])),arcadeVisits:0,arcadeMachines:{},fixtures:{},wallPaint:'original',league:{active:false,season:0,sessions:0,totalRevenue:0,lastDay:0},nextDayCharges:{capex:0,marketingSpend:0},
 roomPlacements:{},roomTiers:{},roomVisits:{snack:0,bar:0,arcade:0,proshop:0},snackStock:{soda:0,popcorn:0,hotdog:0,pizza:0,nachos:0,pretzel:0,icecream:0,fries:0,burger:0,cheeseburger:0},snackPrices:Object.fromEntries(SNACKS.map(x=>[x.id,x.price])),
 pricing:{lane:18,shoes:3},deliveries:[],lowStockThreshold:3,employees:[],employeeSerial:0,partyCounter:0,queue:[],active:[],sceneGroups:[],
 today:newDayStats(1),lastDay:newDayStats(0),dayReports:[],latestEvents:[],
 ownerXP:0,ownerPoints:0,ownerSkills:{manager:0,coach:0,promoter:0},practiceLeft:3,practiceStreak:0,
 bowlers:[{id:'maya',name:'Maya',focus:22,aim:24,spare:22,power:20,ball:false,confidence:54,loyalty:90,crewReady:true}],
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
 if(j.kind==='lane'){s.lanes.push({id:s.lanes.length+1,condition:96,kits:{},theme:'classic',animationUnlocked:false});s.rep+=1;
 if(!s.teamStory.mayaIntroduced){s.teamStory.mayaIntroduced=true;s.teamStory.firstFrame.status='ready';s.eventQueue.push({id:'maya-arrives',emoji:'🎳',title:'Maya Comes Home',kind:'good',text:'Maya, one of Gus’s former junior-league bowlers, walks into the reopened alley carrying an old team photo. “Gus always said a strike is ten pins and a second chance. Find me a working lane and we’ll start there.”',effect:'Meet Maya under Bowlers. Play her First Frame challenge to help revive Gus’s team.'});}
 }
 else if(j.kind==='land'){s.expansionStage=Math.min(5,expansionStage(s)+1);s.landOwned=true;s.rep+=5;note(s,`Property Wing ${s.expansionStage} is OPEN! ${laneCapacity(s)} total lanes and ${roomRows(s)} rows of shops are now available.`,'build');}
 else if(j.kind==='roomExpand'){s.roomTiers[j.id]=2;s.rep+=3;if(j.id==='snack'){s.snackStock.pretzel+=8;s.snackStock.icecream+=8;}if(j.id==='bar'){s.barStockById.cider+=5;s.barStock+=5;}note(s,`${j.title} now offers more variety and room for customers.`,'build');}
 else{s.built[j.id]=true;if(j.id==='snack'){s.snackStock.soda+=8;s.snackStock.popcorn+=6;s.snackStock.fries+=5;}if(j.id==='bar'){s.barStockById.beer+=8;s.barStockById.wine+=6;s.barStock=14;}if(j.id==='arcade'){s.arcadeMachines.pinball=true;advanceBackAlley(s);}s.rep+=j.id==='roof'?4:3;}
 if((j.kind==='upgrade'&&['snack','bar','arcade','proshop'].includes(j.id))||(j.kind==='roomExpand'&&['snack','bar','arcade','proshop'].includes(j.id))){
  s.facilityNotices??=[];s.facilityNotices.push({id:j.id,tier:j.kind==='roomExpand'?2:1,title:j.title,day:s.day});
 }
 grantXP(s,12);advanceStory(s);syncDepartmentRewards(s);note(s,`Construction complete: ${j.title}! Available next morning.`,'build');log(s,`Completed ${j.title}.`);
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
 s.employees.push({id:s.employeeSerial,name,role,wage:r.wage,morale:78,skill:1,workXP:0,specialty:null,lastTalkDay:0,warnings:0,requestedWage:null,lastWarningDay:0});recordCharge(s,'capex',r.fee);
 note(s,`${name} joined the ${r.name.toLowerCase()} team. Welcome aboard!`,'staff');return {ok:true};}
function setWage(s,id,v){const e=s.employees.find(x=>x.id===Number(id));v=Number(v);if(!e)return {ok:false,reason:'Staff member not found'};
 if(!Number.isInteger(v)||v<8||v>90)return {ok:false,reason:'Daily wages must be $8–$90'};
 e.wage=v;return {ok:true};}
const STAFF_XP=[0,0,8,22,45,78];
const STAFF_CAREERS=['Rookie','Reliable','Specialist','Senior','Manager'];
function expectedWage(e){const base=EMPLOYEE_ROLES[e.role]?.wage||12;return Math.max(base,Math.ceil(base*[1,1.1,1.25,1.4,1.6][Math.min(5,e.skill||1)-1]));}
function staffTrainingCost(e){return 65+(e.skill||1)*35;}
function trainEmployee(s,id){const e=s.employees.find(x=>x.id===Number(id));if(!e)return {ok:false,reason:'Staff member not found'};
 if(e.skill>=5)return {ok:false,reason:'Career level 5 reached'};
 if((e.workXP||0)<STAFF_XP[e.skill+1])return {ok:false,reason:`Earn ${STAFF_XP[e.skill+1]} work XP first; currently ${e.workXP||0}`};
 const cost=staffTrainingCost(e);if(!spend(s,cost))return {ok:false,reason:'Not enough cash'};
 e.skill++;e.morale=clamp(e.morale+9,0,100);recordCharge(s,'capex',cost);
 note(s,`${e.name} promoted to Level ${e.skill} · ${STAFF_CAREERS[e.skill-1]}. Expected daily pay ${expectedWage(e)}.`, 'staff');
 return {ok:true,level:e.skill};}
function specializeEmployee(s,id,specialty){const e=s.employees.find(x=>x.id===Number(id));if(!e||e.skill<3)return {ok:false,reason:'Reach Level 3 to select a specialty'};
 if(e.specialty)return {ok:false,reason:'This employee already has a specialty'};
 const opts=e.role==='snack'?['speed','quality']:e.role==='bar'?['upsell','hospitality']:e.role==='mechanic'?['repairs','parts']:e.role==='proshop'?['upsell','quality']:['speed','quality'];
 if(!opts.includes(specialty))return {ok:false,reason:'Invalid specialty for this role'};
 e.specialty=specialty;e.morale=clamp(e.morale+7,0,100);note(s,`${e.name} chose ${specialty} as a professional specialty.`,'staff');return {ok:true};}
function staffWork(s){const t=s.today||{};const work={snack:t.snackOrders||0,bar:t.barOrders||0,proshop:Math.max(0,Math.min(3,Math.floor((t.served||0)/3))),stocker:s.deliveries?.length?1:0,mechanic:(t.techServices||0)+(t.emergencyRepairs||0)};
 for(const e of s.employees){const same=countStaff(s,e.role)||1;const gained=Math.min(5,Math.floor((work[e.role]||0)/same));e.workXP=(e.workXP||0)+gained;
 // Workload-based, not random unhappiness. Underpaying an established worker has a visible consequence.
 if(e.wage<expectedWage(e))e.morale=clamp(e.morale-3,0,100);
 if(gained>=4)e.morale=clamp(e.morale-1,0,100);
 }
}
function maybeStaffConcern(s){s.staffIssues??=[];s.staffDepartures??=[];
 // A warning is active for several days, not dismissed automatically by closing a window.
 const pending=s.staffIssues[0];if(pending){const e=s.employees.find(x=>x.id===pending.id);if(!e){s.staffIssues.shift();return;}
  if(s.day-pending.day>=5){s.staffIssues.shift();e.warnings=(e.warnings||0)+1;e.lastWarningDay=s.day;e.morale=clamp(e.morale-10,0,100);
    if(e.warnings>=2){s.employees=s.employees.filter(x=>x.id!==e.id);s.staffDepartures.unshift({name:e.name,role:e.role,day:s.day,reason:'Warnings ignored'});s.staffDepartures=s.staffDepartures.slice(0,12);note(s,`🚪 ${e.name} resigned after repeated ignored warnings. The position is vacant; you can hire a replacement.`,'staff');}
    else note(s,`⚠️ ${e.name} gave a final warning about their working conditions. Resolve the next concern or they may resign.`,'staff');}
  return;
 }
 if(s.day-(s.lastStaffIssueDay??-100)<6)return;
 const e=s.employees.find(x=>x.skill>=2&&(x.wage<expectedWage(x)||x.morale<48));if(!e)return;
 const expected=expectedWage(e),demand=clamp(expected+3+Math.floor(roll(s)*7)+(e.warnings||0)*3,expected+2,90);
 e.requestedWage=demand;s.staffIssues.push({id:e.id,day:s.day,reason:e.wage<expected?'raise':'burnout',demand});s.lastStaffIssueDay=s.day;
 note(s,`👥 ${e.name} is demanding $${demand}/day and may quit if ignored. Visit Staff to respond.`,'staff');
}
function resolveStaffConcern(s,choice){const issue=s.staffIssues?.[0];if(!issue)return {ok:false,reason:'No staff conversation pending'};
 const e=s.employees.find(x=>x.id===issue.id);if(!e){s.staffIssues.shift();return {ok:true};}
 if(choice==='raise'){e.wage=Math.max(e.wage,issue.demand||expectedWage(e));e.morale=clamp(e.morale+24,0,100);e.warnings=0;}
 else if(choice==='bonus'){if(!spend(s,65))return {ok:false,reason:'Need $65 to provide a retention bonus'};s.today.expenses=money(s.today.expenses+65);e.morale=clamp(e.morale+20,0,100);e.warnings=0;}
 else if(choice==='listen'){e.morale=clamp(e.morale+8,0,100);e.warnings=Math.max(0,(e.warnings||0)-1);}
 else if(choice==='ignore'){e.warnings=(e.warnings||0)+1;e.morale=clamp(e.morale-12,0,100);
    if(e.warnings>=2){s.employees=s.employees.filter(x=>x.id!==e.id);s.staffDepartures.unshift({name:e.name,role:e.role,day:s.day,reason:'Dismissed demands'});note(s,`🚪 ${e.name} resigned after ignored warnings. Hire a replacement when ready.`,'staff');}}
 else if(choice==='fire'){s.employees=s.employees.filter(x=>x.id!==e.id);s.staffDepartures.unshift({name:e.name,role:e.role,day:s.day,reason:'Fired'});note(s,`📋 ${e.name} was dismissed. The position is open for a replacement.`,'staff');}
 else return {ok:false,reason:'Choose a response'};
 e.lastTalkDay=s.day;e.requestedWage=null;s.staffIssues.shift();
 if(s.employees.some(x=>x.id===e.id))note(s,`${e.name} discussed conditions; new morale ${Math.round(e.morale)}%, wages $${e.wage}.`,'staff');return {ok:true,resigned:!s.employees.some(x=>x.id===e.id)};
}
function fireEmployee(s,id){const e=s.employees.find(x=>x.id===Number(id));if(!e)return {ok:false,reason:'Employee not found'};
 s.employees=s.employees.filter(x=>x.id!==e.id);s.staffIssues=(s.staffIssues||[]).filter(x=>x.id!==e.id);
 s.staffDepartures??=[];s.staffDepartures.unshift({name:e.name,role:e.role,day:s.day,reason:'Fired'});
 note(s,`📋 ${e.name} was let go. Their shift is now vacant and may need a replacement.`,'staff');return {ok:true};}
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
 for(const e of s.employees){total+=e.wage;const base=expectedWage(e);
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
 else if(dest==='shop'){const price=shopPrice(s),f=priceDemand(price,SHOP_PRICE_BASE);if(f<1&&roll(s)>f){note(s,`${groupText(p)} browsed the pro shop but put the supplies back. Pricey.`,'shop',p.id);}else{const paid=price+(s.roomDetails.proshop?5:0);addIncome(s,'otherIncome',paid);s.roomVisits.proshop++;note(s,`${groupText(p)} bought pro-shop supplies (+$${paid}).`,'shop',p.id);}}else{const room=NEW_ATTRACTIONS.find(x=>x.id===dest);if(room){const fee=attractionFee(s,room),f=priceDemand(fee,room.fee);if(f<1&&roll(s)>f){note(s,`${groupText(p)} looked at the ${room.title} prices and changed their minds.`,dest,p.id);return;}const income=fee+(s.roomDetails[dest]?Math.round(fee*.2):0);addIncome(s,'otherIncome',income);s.roomVisits[dest]=(s.roomVisits[dest]||0)+1;note(s,`${groupText(p)} visited ${room.title} (+$${income}).`,dest,p.id);}}
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
 const investments=GUEST_TRAFFIC_BONUS(s,openRooms)+departmentBenefit(s,'style');
 const marketing=(activeCampaign(s)?.boost||0)*2.2;
 const specialty=s.specialty==='community'?.15:s.specialty==='family'?.12:.06;
 const pricePenalty=Math.max(-.18,((s.pricing.lane-18)/18)*.38+((s.pricing.shoes-3)/3)*.13);
 return clamp(.24+reputation+regulars+loyal*.035+capacity+investments+marketing+specialty-pricePenalty,.06,4.25);
}
function trafficMultiplier(s){
 const dow=calendar(s.day).dayIndex, dayFactor=[.70,.78,.85,.96,1.24,1.42,1.20][dow];
 const clockFactor= s.hour<16?.48:s.hour<18?.74:s.hour<20?1.17:1.37;
 const partnerFactor=PARTNERSHIP_CATALOG.reduce((n,p)=>n*(s.partnerships?.[p.id]&&(p.id!=='school'||dow<=4)?1+p.boost:1),1);
 const rivalFactor=s.campaignStory?.path==='backalley'?threatTier(s).traffic*((s.campaignStory.turf?.lookoutUntil||0)>=s.day?.95:1):s.rival?.protectionUntil>=s.day?1:Math.max(.83,1-(s.rival?.pressure||0)*.002);
 const eventFactor=(s.eventBoostUntil>=s.day?(s.eventBoostFactor||1):1)*partnerFactor*rivalFactor;
 return dayFactor*clockFactor*eventFactor;
}
function GUEST_TRAFFIC_BONUS(s,openRooms){return openRooms*.10+Math.max(0,alleyStars(s)-1)*.12+(isBuilt(s,'lights')?.18:0)+s.ownerSkills.promoter*.16+(s.fixtures.neon?.06:0);}
function addIncome(s,category,amount){s.today[category]+=amount;s.today.income+=amount;s.cash=money(s.cash+amount);s.earned+=amount;}
function serviceFactor(s,role){const team=s.employees.filter(e=>e.role===role);if(!team.length)return .7;let happiness=team.reduce((n,e)=>n+e.morale,0)/team.length,skill=team.reduce((n,e)=>n+e.skill,0)/team.length;const specialist=team.some(e=>e.specialty==='speed')?.04:0;return clamp(.75+Math.min(5,skill)*.075+(happiness-70)/330+specialist,.55,1.16);}
// v1.09 pricing. Demand is exactly 1.0 at the default price, so an untouched alley plays the same
// as before; higher prices sell less often, lower prices sell more often (within limits).
const SHOP_PRICE_BASE=12;
function priceDemand(price,base){if(!base)return 1;return clamp(1-.6*((price-base)/base),.45,1.2);}
function avgDemand(list,priceOf,baseOf){if(!list.length)return 1;let n=0;for(const i of list)n+=priceDemand(priceOf(i),baseOf(i));return n/list.length;}
function arcadePrice(s,m){return s.arcadePrices?.[m.id]??m.fee;}
function attractionFee(s,room){return s.attractionFees?.[room.id]??room.fee;}
function shopPrice(s){return s.shopPrice??SHOP_PRICE_BASE;}
const PRICE_RANGES={arcade:m=>[Math.max(1,m.fee-1),m.fee+3],attraction:r=>[Math.round(r.fee*.75),Math.round(r.fee*1.5)],shop:()=>[8,20]};
function setArcadePrice(s,id,delta){const m=MACHINES.find(x=>x.id===id);if(!m)return {ok:false,reason:'Unknown machine'};const [lo,hi]=PRICE_RANGES.arcade(m),v=arcadePrice(s,m)+Math.sign(delta);if(v<lo||v>hi)return {ok:false,reason:'Price outside permitted range'};s.arcadePrices=s.arcadePrices||{};s.arcadePrices[id]=v;return {ok:true};}
function setAttractionFee(s,id,delta){const r=NEW_ATTRACTIONS.find(x=>x.id===id);if(!r)return {ok:false,reason:'Unknown attraction'};const [lo,hi]=PRICE_RANGES.attraction(r),v=attractionFee(s,r)+Math.sign(delta);if(v<lo||v>hi)return {ok:false,reason:'Price outside permitted range'};s.attractionFees=s.attractionFees||{};s.attractionFees[id]=v;return {ok:true};}
function setShopPrice(s,delta){const [lo,hi]=PRICE_RANGES.shop(),v=shopPrice(s)+Math.sign(delta);if(v<lo||v>hi)return {ok:false,reason:'Price outside permitted range'};s.shopPrice=v;return {ok:true};}
function ensurePricing(s){if(!s)return s;s.arcadePrices=s.arcadePrices&&typeof s.arcadePrices==='object'?s.arcadePrices:{};s.attractionFees=s.attractionFees&&typeof s.attractionFees==='object'?s.attractionFees:{};if(!Number.isInteger(s.shopPrice))s.shopPrice=SHOP_PRICE_BASE;for(const snap of Object.values(s.portfolio?.snapshots||{}))if(snap&&snap!==s)ensurePricing(snap);return s;}
function maybeSnack(s,p,reason){if(!isBuilt(s,'snack')||activeOutage(s,'snack')){if(roll(s)<.34)s.today.snackMisses++;return;}if(!staffed(s,'snack')){if(roll(s)<.25)note(s,`${groupText(p)} found the snack counter closed. The popcorn apparently doesn't sell itself.`,'feedback',p.id);return;}
 const eligible=SNACKS.filter(i=>snackUnlocked(s,i.id));
 if(roll(s)>(reason==='wait'?.33:reason==='walkin'?.88:.52)*serviceFactor(s,'snack')*avgDemand(eligible,i=>s.snackPrices[i.id],i=>i.price))return;
 if(!eligible.length)return;
 const item=eligible[Math.floor(roll(s)*eligible.length)];if(s.snackStock[item.id]<=0){s.today.snackMisses++;note(s,`${groupText(p)} wanted ${item.name.toLowerCase()}, but it was sold out.`,'feedback',p.id);return;}
 s.snackStock[item.id]--;const price=s.snackPrices[item.id];addIncome(s,'snackIncome',price+(s.roomDetails.snack?2:0)+departmentBenefit(s,'snack')+(s.employees.some(e=>e.role==='snack'&&e.specialty==='quality')?1:0));s.today.snackOrders++;s.today.spentOnSnacks+=price;
 note(s,`${groupText(p)} bought ${item.name.toLowerCase()} (+$${price}).`,'snack',p.id);s.roomVisits.snack++;if(p.patronId==='bea')s.patrons.bea.loyalty=clamp(s.patrons.bea.loyalty+3,0,100);
}
function maybeBar(s,p,reason){if(!isBuilt(s,'bar')||activeOutage(s,'bar')||!staffed(s,'bar')||roll(s)>((reason==='wait'?.26:reason==='walkin'?.88:.39)+(s.roomTiers.bar===2?.12:0))*serviceFactor(s,'bar')*avgDemand(DRINKS.filter(i=>drinkUnlocked(s,i.id)),i=>s.barPrices[i.id],i=>i.price))return;
 const unlocked=DRINKS.filter(i=>drinkUnlocked(s,i.id));if(!unlocked.length)return;
 const stocked=unlocked.filter(i=>s.barStockById[i.id]>0);if(!stocked.length){s.today.barMisses++;note(s,`${groupText(p)} found the bar out of drinks.`,'feedback',p.id);return;}
 const drink=stocked[Math.floor(roll(s)*stocked.length)];s.barStockById[drink.id]--;s.barStock=Math.max(0,s.barStock-1);const price=s.barPrices[drink.id];addIncome(s,'barIncome',price+(s.specialty==='lounge'?2:0)+(s.roomDetails.bar?2:0)+departmentBenefit(s,'bar')+(s.employees.some(e=>e.role==='bar'&&e.specialty==='upsell')?1:0));s.today.barOrders++;s.barVisits++;s.roomVisits.bar++;if(p.patronId==='rosa')s.patrons.rosa.loyalty=clamp(s.patrons.rosa.loyalty+3,0,100);
 note(s,`${groupText(p)} ordered ${drink.name.toLowerCase()} at the bar (+$${price}).`,'bar',p.id);}
function maybeArcade(s,p){if(!isBuilt(s,'arcade')||activeOutage(s,'arcade')||roll(s)>.88*avgDemand(MACHINES.filter(i=>s.arcadeMachines[i.id]),i=>arcadePrice(s,i),i=>i.fee))return;const owned=MACHINES.filter(i=>s.arcadeMachines[i.id]);if(!owned.length)return;
 const machine=owned[Math.floor(roll(s)*owned.length)];addIncome(s,'otherIncome',arcadePrice(s,machine)+(s.roomDetails.arcade?1:0)+departmentBenefit(s,'arcade'));s.today.arcadePlays++;s.arcadeVisits++;s.roomVisits.arcade++;if(s.campaignStory?.path==='backalley'){casinoPatronRound(s);const tip=s.hour>=18?Math.max(1,Math.floor(machine.fee*.8)):0;if(tip){addIncome(s,'otherIncome',tip);s.campaignStory.nightOps.nightRevenue+=tip;}advanceBackAlley(s);}if(p.patronId==='dex')s.patrons.dex.loyalty=clamp(s.patrons.dex.loyalty+3,0,100);note(s,`${groupText(p)} played ${s.campaignStory?.path==='backalley'?darkMachineName(machine.id):machine.name} at the ${backAlleyArcadeName(s)} (+$${machine.fee}).`,'arcade',p.id);}
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
 'That black sedan followed me for six blocks. Not even a good disguise.','The midnight league is getting a little too mysterious.','My strike was clean. The paperwork? Not so much.','Every alley has secrets. Ours has spare shoes.','Keep your head down, your score up and your receipts neat.','I came for bowling, not a noir detective story.','The bouncer said my split was suspicious.','That neon sign makes everybody look like a suspect.','Vera thinks she owns the cops and the council. Who the hell owns the pinsetters?','StrikeCity thinks it owns the night. We own the ball returns.','Is that a mystery person or just Lou in a trench coat?','I heard the town is choosing sides. The lanes are neutral.','I trust the bartender, but not the seventh frame.','If the cameras caught that gutter ball, I want a damn lawyer.','I know a guy who knows a guy who can bowl a 200.'
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
 if(t.arcadePlays>0)complaints.unshift(`${t.arcadePlays} ${s.campaignStory?.path==='backalley'?'casino games':'arcade games'} played today`);
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
 staffWork(s);payStaff(s);maybeStaffConcern(s);nightShift(s);technicianShift(s);emergencyMechanicShift(s);weeklyPartnerBenefit(s);finishConstruction(s);syncDepartmentRewards(s);restockAuto(s);maybeRecruitLeo(s);if(!rivalAIMove(s))rollRandomEvent(s);checkCampaignVictory(s);t.net=money(t.income-t.expenses);
 s.lastDay=structuredCloneSafe(t);s.dayReports.unshift(structuredCloneSafe(t));s.dayReports=s.dayReports.slice(0,21);compactReports(s);
 log(s,`Closed: ${t.served} groups bowled, ${t.left} left; +$${Math.round(t.net)} net.`);
}
// v1.06: day reports keep their full visitor log for one week only. Older reports keep
// their totals. This keeps local saves and the Firestore document small (Firestore caps a document at 1 MiB).
const REPORT_LOG_DAYS=7,REPORT_LOG_MAX=90;
// v1.06: the home alley is called The Back Alley (formerly Gus’s Town); Riverside keeps its name.
function renameHome(s){const fix=x=>{if(x&&x.locationName==='Gus’s Town')x.locationName='The Back Alley';};fix(s);for(const snap of Object.values(s?.portfolio?.snapshots||{}))fix(snap);return s;}
function compactReports(s){if(!s||!Array.isArray(s.dayReports))return s;s.dayReports.forEach((r,i)=>{if(!r||!Array.isArray(r.events))return;if(i>=REPORT_LOG_DAYS)r.events=[];else if(r.events.length>REPORT_LOG_MAX)r.events=r.events.slice(-REPORT_LOG_MAX);});if(s.lastDay&&Array.isArray(s.lastDay.events)&&s.lastDay.events.length>REPORT_LOG_MAX)s.lastDay.events=s.lastDay.events.slice(-REPORT_LOG_MAX);for(const snap of Object.values(s.portfolio?.snapshots||{}))if(snap&&snap!==s&&Array.isArray(snap.dayReports))compactReports(snap);return s;}
function structuredCloneSafe(obj){return JSON.parse(JSON.stringify(obj));}
function startNextDay(s){if(s.hour<CLOSE)return false;s.day++;s.hour=OPEN;s.today=newDayStats(s.day);if(s.campaignStory?.nightOps)s.campaignStory.nightOps.spinsToday=0;s.today.capex=s.nextDayCharges.capex;s.today.marketingSpend=s.nextDayCharges.marketingSpend;s.today.expenses=s.nextDayCharges.marketingSpend;s.nextDayCharges={capex:0,marketingSpend:0};s.queue=[];s.active=[];s.sceneGroups=[];s.latestEvents=[];s.practiceLeft=3;processDeliveries(s);return true;}
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
 for(const p of s.queue){if(p.waited>=((p.seated||s.fixtures.tv||s.specialty==='community')?4+departmentBenefit(s,'comfort'):2+departmentBenefit(s,'comfort'))){s.today.left++;upsetPatron(s,p);note(s,`${groupText(p)} stormed out: “${quote(s,WAIT_COMPLAINTS)}”`,'left',p.id);}else stillWaiting.push(p);}
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
  addIncome(s,'otherIncome',amount+departmentBenefit(s,'proshop')+(s.employees.some(e=>e.role==='proshop'&&e.specialty==='upsell')?1:0));const guest=s.active[0]?.party;if(guest){note(s,`${groupText(guest)} bought ${product} from the pro shop (+$${amount}).`,'shop',guest.id);s.roomVisits.proshop++;}
 }
 const overhead=money((2.0+lanes(s)*.9+(isBuilt(s,'coaching')?.6:0)+(isBuilt(s,'lights')&&h>=15?1.4:0))*(1-.04*s.ownerSkills.manager));
 s.today.expenses=money(s.today.expenses+overhead);s.cash=money(s.cash-overhead);
 // Upkeep is individual to each lane. The idle technician reduces wear.
 for(const lane of s.lanes){const used=s.active.some(x=>x.laneId===lane.id);if(used){lane.condition=clamp(money(lane.condition-(isBuilt(s,'staff')?.37:.88)*(s.specialty==='sport'?.8:1)*(laneKit(lane,'wood')?.6:1)*(1-departmentBenefit(s,'lanes'))-roll(s)*.28),15,100);}}

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
// v1.03: Maya's two-shot skill challenge, using the same approach/power control as existing practice.
function maybeRecruitLeo(s){if(s.teamStory?.leoJoined||s.startupPending)return false;
 if(s.totalServed<8||lanes(s)<2||!s.teamStory?.firstFrame||s.teamStory.firstFrame.status!=='complete')return false;
 s.teamStory.leoJoined=true;
 if(!s.bowlers.some(b=>b.id==='leo'))s.bowlers.push({id:'leo',name:'Leo',focus:20,aim:22,spare:19,power:24,ball:false,confidence:48,loyalty:65,crewReady:false});
 s.eventQueue.push({id:'leo-arrives',emoji:'🎳',title:'Leo Has a Proposal',kind:'good',text:'Leo, Gus’s favorite equipment tinkerer, has been watching Maya rebuild the team. “I can fix the return, I can pick up spares, and I can bring a really terrible victory dance.”',effect:'Leo joins your bowling roster. Train both bowlers toward the Thursday league and regional events.'});return true;}
function firstFrame(s,angle,spin,power){const f=s.teamStory?.firstFrame;
 if(!f||f.status==='complete')return {ok:false,reason:'Maya’s first frame has already been completed'};
 if(!s.lanes.length)return {ok:false,reason:'Install the first lane to begin Maya’s story'};
 if(s.startupPending)return {ok:false,reason:'Finish opening the bowling alley first'};
 angle=Number(angle);spin=Number(spin);power=Number(power);
 if(![angle,spin,power].every(Number.isFinite))return {ok:false,reason:'Invalid bowling controls'};
 f.status='playing';const shots=f.shots||[];
 const remaining=shots.length===0?10:10-shots[0],skill=(s.bowlers.find(b=>b.id==='maya')?.aim||24);
 const sweet=(100-s.lanes[0].condition)/30;const error=Math.abs(clamp(angle,-10,10)+clamp(spin,-5,5)*.4-sweet),force=Math.abs(clamp(power,60,100)-91);
 const knocked=clamp(Math.floor(remaining-error*.68-force*.07+skill*.025+(roll(s)-.5)*2.5),0,remaining);
 shots.push(knocked);f.shots=shots;f.lastResult=`Maya knocked down ${knocked} of ${remaining} pins.`;
 if(shots.length>=2||knocked===10){f.status='complete';f.total=shots.reduce((n,x)=>n+x,0);const maya=s.bowlers.find(b=>b.id==='maya');maya.confidence=clamp((maya.confidence||50)+6,0,100);maya.focus=Math.min(95,maya.focus+2);grantXP(s,12);
 s.eventQueue.push({id:'maya-first-frame',emoji:'🏆',title:'Gus’s First Frame',kind:'good',text:`Maya finishes her first frame with ${f.total} pins. She hangs Gus’s faded junior-league photo near the lanes. “One frame down. A whole future to go.”`,effect:'Maya gains confidence, +2 Focus and the owner earns 12 XP. Leo can join after two lanes and eight customers.'});
 }
 return {ok:true,knocked,status:f.status,total:f.total||shots.reduce((n,x)=>n+x,0),remaining:f.status==='complete'?0:10-shots[0]};
}
// v1.05: shared city / Legacy district seasons. A league must be won before its title tournament.
const CITY_DISTRICTS=[
 {id:'oldtown',name:'Old Town',wing:0,league:'Gus Memorial League',final:'Old Town Roll-Off',teams:['Pin Pals','Gus Alumni','StrikeCity Starters'],need:105,fee:55,reward:'Neighborhood sponsorship and +3 reputation'},
 {id:'warehouse',name:'Warehouse Row',wing:1,league:'Foundry Workers League',final:'Warehouse Invitational',teams:['Iron Spares','Factory Five','Vale Freight'],need:119,fee:75,reward:'Supplier sponsorship and +4 spare parts'},
 {id:'neon',name:'Neon Strip',wing:2,league:'After Dark League',final:'Neon Cup',teams:['Neon Knights','After Hours','Vale Night Owls'],need:135,fee:105,reward:'Nightlife publicity and +$220'},
 {id:'westend',name:'West End',wing:3,league:'West End Workers League',final:'Workers Championship',teams:['Union Rollers','Corner Kings','Vale Crushers'],need:152,fee:130,reward:'New coaching contacts and +5 reputation'},
 {id:'civic',name:'Civic Center',wing:4,league:'Civic Charity League',final:'City Recognition Cup',teams:['City Hall Strikers','Civic Champs','Vale Counsel'],need:170,fee:170,reward:'Citywide goodwill and +8 reputation'},
 {id:'docks',name:'The Docks',wing:5,league:'Waterfront Premier League',final:'Harbor Heritage Finals',teams:['Dockside Ten','Harbor Legends','Vera’s Elite'],need:189,fee:215,reward:'Heritage city title and +$1200'}
];
function legacyDistrictReady(s,id){const i=CITY_DISTRICTS.findIndex(d=>d.id===id);if(i<0)return false;return i===0||!!s.cityLeagues?.[CITY_DISTRICTS[i-1].id]?.champion;}
function legacyLeague(s,id){
 const d=CITY_DISTRICTS.find(x=>x.id===id);if(!d)return {ok:false,reason:'Unknown district'};
 if(s.campaignStory?.path!=='legacy')return {ok:false,reason:'This circuit belongs to The Legacy'};
 if(!legacyDistrictReady(s,id))return {ok:false,reason:'Earn the previous district championship first'};
 if(!s.league.active)return {ok:false,reason:'Open your home Thursday League first'};
 if(s.lanes.length<6)return {ok:false,reason:'Six home lanes required for district competition'};
 const state=s.cityLeagues[id]??={matches:[],champion:false,lastDay:0,finals:[]};s.cityLeagues[id]=state;
 if(state.champion)return {ok:false,reason:'District championship already earned'};
 if(state.lastDay===s.day)return {ok:false,reason:'One league match or tournament per day'};
 if(state.matches.length>=3&&state.matches.filter(m=>m.won).length>=2)return {ok:false,reason:'Qualified! Play the district final'};
 if(state.matches.length>=3)state.matches=[]; // begin a new short league season
 if(s.cash<d.fee)return {ok:false,reason:'League entry costs $'+d.fee};
 spend(s,d.fee);recordCharge(s,'capex',d.fee);
 const opponent=d.teams[state.matches.length];const skill=teamAvg(s)+(s.built.coaching?8:0)+(s.built.proshop?6:0)+Math.min(9,s.league.sessions*.5);
 const score=Math.round(skill+(roll(s)-.5)*48),other=Math.round(d.need+(state.matches.length*3)+(roll(s)-.5)*42),won=score>=other;
 const match={day:s.day,opponent,score,opponentScore:other,won};state.matches.push(match);state.lastDay=s.day;
 if(won)s.rep=money(s.rep+1);grantXP(s,won?9:5);
 note(s,`🎳 ${d.league}: ${won?'Victory':'Defeat'} against ${opponent}, ${score}–${other}. ${state.matches.filter(m=>m.won).length}/2 wins needed to qualify.`,'league');
 return {ok:true,match,qualified:state.matches.filter(m=>m.won).length>=2};
}
function legacyDistrictFinal(s,id){
 const d=CITY_DISTRICTS.find(x=>x.id===id);if(!d||s.campaignStory?.path!=='legacy')return {ok:false,reason:'Choose a Legacy district final'};
 const state=s.cityLeagues?.[id];if(!state||state.matches.length<3||state.matches.filter(m=>m.won).length<2)return {ok:false,reason:'Win two matches in the district league first'};
 if(state.champion)return {ok:false,reason:'Already the district champion'};
 if(state.lastDay===s.day)return {ok:false,reason:'Return tomorrow for the tournament final'};
 const fee=d.fee+85;if(s.cash<fee)return {ok:false,reason:'Championship entry costs $'+fee};spend(s,fee);recordCharge(s,'capex',fee);
 const bracket=[];let won=true;const skill=teamAvg(s)+(s.built.coaching?11:0)+(s.built.proshop?8:0)+Math.min(10,s.league.sessions*.4);
 for(let i=0;i<3;i++){const score=Math.round(skill+(roll(s)-.5)*44),other=Math.round(d.need+6+i*5+(roll(s)-.5)*42),match={opponent:d.teams[i],score,opponentScore:other,won:score>=other};bracket.push(match);if(!match.won){won=false;break;}}
 state.finals=bracket;state.lastDay=s.day;
 if(won){state.champion=true;s.rep=money(s.rep+4+(id==='civic'?4:0));s.cash=money(s.cash+(id==='docks'?1200:180));if(id==='warehouse')s.parts+=4;grantXP(s,22);note(s,`🏆 ${d.final} won! ${d.reward}. The next city's district league opens.`,'league');}
 else{grantXP(s,8);note(s,`🎳 ${d.final}: a tough finish. Your team can enter again tomorrow; league qualification remains.`,'league');}
 return {ok:true,won,bracket};
}
// Short tactical preview for Back Alley. Crew combat is fictional and player-initiated, not automatic real-world conduct.
const DISTRICTS=[
 {id:'oldtown',name:'Old Town',description:'Hold Gus’s neighborhood and the old loading dock.',reward:'Neighbor trust · +3 reputation',enemy:19,requires:null},
 {id:'warehouse',name:'Warehouse Row',description:'Protect suppliers and break Vera’s delivery blockade.',reward:'Supply discount · +5 parts',enemy:23,requires:'oldtown'},
 {id:'neon',name:'Neon Strip',description:'Compete for control of the entertainment district.',reward:'Nightlife income · +$240',enemy:27,requires:'warehouse'},
 {id:'westend',name:'West End',description:'Win over local workers and safeguard late shifts.',reward:'Staff morale · +6 reputation',enemy:30,requires:'neon'},
 {id:'civic',name:'Civic Center',description:'Expose Vera’s permit pressure and secure public support.',reward:'Permit leverage · -15 rival pressure',enemy:34,requires:'westend'},
 {id:'docks',name:'The Docks',description:'Confront Vera’s final supply stronghold.',reward:'The city is yours · +10 trust',enemy:38,requires:'civic'}
];
function districtUnlocked(s,id){const i=DISTRICTS.findIndex(x=>x.id===id);if(i<0)return false;const d=DISTRICTS[i];return expansionStage(s)>=i&&(!d.requires||s.districts?.[d.requires]?.owner==='player');}
function districtStatus(s,id){return s.districts?.[id]||{owner:'vera',victories:0,sites:0};}
// ───────────────────────── v1.10 TURF WAR (The Back Alley only) ─────────────────────────
// Vera's grip (s.rival.pressure) now moves every night: she leans on the alley by default and
// only the districts you hold, your defenses and your crew push her back. Small "plays" land most
// nights, bigger "operations" are announced with a countdown and can be met head-on in a Showdown.
// Every roll here happens only on the Back Alley route, so Legacy games stay byte-identical.
const THREAT_TIERS=[
 {id:'watching',name:'Watching',min:0,traffic:1,morale:0,lead:2,line:'Vera is watching. For now that is all she is doing.'},
 {id:'circling',name:'Circling',min:25,traffic:.96,morale:0,lead:2,line:'Her people have started showing up where your customers can see them.'},
 {id:'squeezing',name:'Squeezing',min:50,traffic:.9,morale:1,lead:2,line:'Suppliers whisper, staff look over their shoulders, regulars stay home.'},
 {id:'closing',name:'Closing In',min:75,traffic:.84,morale:2,lead:1,line:'Vera smells weakness. Her crews move faster and hit harder.'},
 {id:'allout',name:'All-Out',min:90,traffic:.78,morale:2,lead:1,line:'Vera is coming for the building itself. Push her back now.'}
];
function threatTier(s){const p=s.rival?.pressure||0;let t=THREAT_TIERS[0];for(const x of THREAT_TIERS)if(p>=x.min)t=x;return t;}
function threatIndex(s){return THREAT_TIERS.indexOf(threatTier(s));}
function newTurf(){return {ops:[],ledger:[],injured:{},tired:{},tags:{},lookoutUntil:0,lookoutFaced:0,fightsWon:0,fightsLost:0,opsStopped:0,opsLanded:0,playsFoiled:0,playsLanded:0,opSerial:0,nextOpDay:0,lastDrift:0,introSeen:false,accord:false,cityVictory:false};}
function turfOf(s){const c=s?.campaignStory;if(!c||c.path!=='backalley')return null;if(!c.turf||typeof c.turf!=='object')c.turf=newTurf();else{const d=newTurf();for(const k of Object.keys(d))if(c.turf[k]===undefined||c.turf[k]===null&&d[k]!==null)c.turf[k]=d[k];}return c.turf;}
function turfLedger(s,icon,text,tone='threat'){const t=turfOf(s);if(!t)return;t.ledger.unshift({day:s.day,icon,text,tone});t.ledger=t.ledger.slice(0,24);}
function shiftPressure(s,n){s.rival.pressure=clamp(Math.round((s.rival.pressure||0)+n),0,100);return s.rival.pressure;}
const VERA_TAUNTS=[
 ['Nice little place. Be a shame if people stopped finding it.','I am patient. Your suppliers are not.'],
 ['Every night you stay open costs you something. I can wait.','Your doorman is brave. Bravery is expensive.'],
 ['Your staff go home tired. Lately they go home nervous too.','I bought this block once. I will buy it again.'],
 ['Sign the papers and nobody else gets hurt. Figuratively, of course.','You cannot guard every door, every night.'],
 ['Tonight the lights go out. Tomorrow, so do you.','Look out the window. Those are my people now.']
];
function veraTaunt(s){const i=threatIndex(s),pair=VERA_TAUNTS[i];return pair[(s.day+i)%2];}
// Why the gauge moves: every component is shown to the player on the Turf screen.
function veraFloor(s){const n=DISTRICTS.filter(d=>districtStatus(s,d.id).owner!=='player').length;return n?4*n+6:0;}
function veraDrift(s){
 const c=s.campaignStory,stage=expansionStage(s),parts=[];
 parts.push({label:'Vera leans on you every night',value:1});
 const veraVisible=DISTRICTS.filter((d,i)=>i<=stage&&districtStatus(s,d.id).owner!=='player').length;
 if(veraVisible)parts.push({label:`Her turf next door (${veraVisible} district${veraVisible===1?'':'s'})`,value:Math.min(3,veraVisible)});
 if((c.heat||0)>=50)parts.push({label:'Police suspicion makes you an easy mark',value:1});
 const held=DISTRICTS.filter(d=>districtStatus(s,d.id).owner==='player').length;
 if(held)parts.push({label:`Districts you hold (${held})`,value:-Math.floor((held+1)/2)});
 if(nightProtection(s)>=60)parts.push({label:'Solid night defenses',value:-1});
 if((c.trust||0)>=70)parts.push({label:'The neighborhood has your back',value:-1});
 const raw=parts.reduce((n,p)=>n+p.value,0);return {total:clamp(raw,-4,6),parts};
}
const VERA_PLAYS=[
 {id:'lookout',icon:'🕶️',name:'A lookout on your corner',ok:()=>true,foil:s=>.15+(s.campaignStory.nightOps.entrance||0)*.22,
  hit:s=>{turfOf(s).lookoutUntil=s.day+2;return {p:2,text:'A man in a camel coat leaned on the lamppost across the street all night, counting your customers out loud.'};},
  miss:()=>'Your doorman walked across the street and asked the man in the camel coat if he was lost. He was.'},
 {id:'tag',icon:'🎨',name:'Vera’s mark on your wall',ok:s=>['snack','bar','arcade','proshop'].some(id=>s.built[id]),foil:s=>.12+(s.campaignStory.nightOps.cameras||0)*.22,
  hit:s=>{const rooms=['snack','bar','arcade','proshop'].filter(id=>s.built[id]);const id=rooms[Math.floor(roll(s)*rooms.length)];turfOf(s).tags[id]=s.day+3;s.rep=Math.max(0,money(s.rep-1));return {p:2,text:`Somebody sprayed Vera’s plum “V” across the ${backAlleyRoomName(id)} overnight. Guests noticed.`};},
  miss:()=>'Your cameras caught a teenager with a spray can. One call to his aunt and he scrubbed the wall himself.'},
 {id:'supplier',icon:'🚚',name:'Supplier shakedown',ok:()=>true,foil:s=>districtStatus(s,'warehouse').owner==='player'?1:.08+(s.campaignStory.influence||0)/220,
  hit:s=>{const fee=35+Math.min(90,Math.floor(s.day/3));s.cash=money(s.cash-fee);s.today.expenses=money((s.today.expenses||0)+fee);return {p:2,text:`Your delivery driver was “advised” to add a $${fee} handling fee. You paid it. This time.`};},
  miss:s=>districtStatus(s,'warehouse').owner==='player'?'Vera’s people tried to lean on your driver. Warehouse Row is yours now; he laughed at them.':'A friend from your contacts warned the driver first. The surcharge never happened.'},
 {id:'reviews',icon:'⭐',name:'A wave of fake reviews',ok:()=>true,foil:s=>.1+(s.campaignStory.influence||0)/120,
  hit:s=>{s.rep=Math.max(0,money(s.rep-2));return {p:1,text:'Twelve one-star reviews appeared overnight, all praising StrikeCity’s “clean, safe lanes.”'};},
  miss:()=>'Your contacts traced the fake reviews to one account. They were gone by breakfast.'},
 {id:'followed',icon:'👣',name:'Staff followed home',ok:s=>(s.employees||[]).length>0,foil:s=>.1+(s.campaignStory.nightOps.crew||0)*.25,
  hit:s=>{const e=s.employees[Math.floor(roll(s)*s.employees.length)];e.morale=clamp((e.morale??70)-8,0,100);return {p:2,text:`A dark sedan followed ${e.name} home after close. ${e.name} showed up shaken. Morale −8.`};},
  miss:()=>'Your staff walk out in pairs now, like you drilled. The sedan idled, then gave up.'},
 {id:'poach',icon:'💵',name:'An envelope for your bowler',ok:s=>(s.bowlers||[]).length>0,foil:s=>{const b=[...s.bowlers].sort((a,b)=>(a.loyalty||0)-(b.loyalty||0))[0];return clamp((b.loyalty||50)/115,.1,.9);},
  hit:s=>{const b=[...s.bowlers].sort((a,b)=>(a.loyalty||0)-(b.loyalty||0))[0];b.loyalty=clamp((b.loyalty||50)-6,0,100);b.confidence=clamp((b.confidence||50)-2,0,100);return {p:1,text:`Vera’s driver handed ${b.name} a thick envelope and a StrikeCity jersey. ${b.name} hasn’t said no yet. Loyalty −6.`};},
  miss:s=>{const b=[...s.bowlers].sort((a,b)=>(a.loyalty||0)-(b.loyalty||0))[0];b.loyalty=clamp((b.loyalty||50)+2,0,100);return `Vera’s driver offered ${b.name} an envelope. ${b.name} handed it back unopened, in front of everyone. Loyalty +2.`;}},
 {id:'neighbor',icon:'🏪',name:'The corner store pays up',ok:()=>true,foil:s=>districtStatus(s,'oldtown').owner==='player'?.8:.1,
  hit:s=>{s.campaignStory.trust=clamp(s.campaignStory.trust-3,0,100);return {p:2,text:'Mrs. Ortiz at the corner store started paying Vera’s “neighborhood fee.” Old Town notices who protects whom.'};},
  miss:()=>'Vera’s collector came to Old Town and found your people already sitting in Mrs. Ortiz’s shop.'},
 {id:'wires',icon:'✂️',name:'Cut wires',ok:s=>(s.rival.pressure||0)>=50&&!s.campaignStory.turf?.accord&&s.lanes.some(l=>!activeOutage(s,'lane'+l.id)),foil:s=>.1+nightProtection(s)/150,
  hit:s=>{const open=s.lanes.filter(l=>!activeOutage(s,'lane'+l.id)),l=open[Math.floor(roll(s)*open.length)],cost=60+Math.floor(roll(s)*50);s.outages['lane'+l.id]={name:'Lane '+l.id,cost,day:s.day,rival:true};s.campaignStory.nightOps.incidents++;return {p:3,text:`Lane ${l.id}’s pinsetter wires were cut clean through. It stays dark until you repair it ($${cost}).`};},
  miss:()=>'Your night crew found a stranger in the machine room with wire cutters. He ran.'}
];
function backAlleyRoomName(id){return ({snack:'Night Grill',bar:'Speakeasy',arcade:'Casino Lounge',proshop:'Outfitters'})[id]||id;}
function runVeraPlay(s){
 const p=s.rival.pressure||0,chance=clamp(.4+p/200,.4,.8);if(roll(s)>=chance)return null;
 const pool=VERA_PLAYS.filter(x=>x.ok(s));if(!pool.length)return null;
 const play=pool[Math.floor(roll(s)*pool.length)],t=turfOf(s);
 if(roll(s)<play.foil(s)){shiftPressure(s,-1);s.campaignStory.influence=clamp((s.campaignStory.influence||0)+1,0,100);t.playsFoiled++;const text=play.miss(s);turfLedger(s,'🛡️',`${play.name}, stopped. ${text}`,'win');return {id:play.id,icon:'🛡️',name:play.name,text,foiled:true};}
 const r=play.hit(s);shiftPressure(s,r.p);t.playsLanded++;turfLedger(s,play.icon,`${play.name}. ${r.text}`,'threat');return {id:play.id,icon:play.icon,name:play.name,text:r.text,foiled:false};
}
// ── Operations: announced in advance, met in a Showdown or left to your defenses ──
function opFoes(s,kind){const tier=threatIndex(s),held=DISTRICTS.filter(d=>districtStatus(s,d.id).owner==='player').length;
 const list=['bruiser','lookout'];if(tier>=2||held>=2)list.push('fixer');if(tier>=3||held>=3)list[1]='knox';if(kind==='siege')list.push('bruiser');return list.slice(0,4);}
function opLevel(s){return Math.min(6,threatIndex(s)+Math.floor(DISTRICTS.filter(d=>districtStatus(s,d.id).owner==='player').length/2));}
function announceOp(s){
 const t=turfOf(s),tier=threatTier(s),c=s.campaignStory;
 const held=DISTRICTS.filter(d=>(districtStatus(s,d.id).sites||0)>0);
 let kind='raid',target,name,text;
 if(t.accord){if(!held.length)return null;kind='retake';}
 else if((s.rival.pressure||0)>=90){kind='siege';}
 else if(held.length&&roll(s)<.45)kind='retake';
 if(kind==='retake'){const d=held[Math.floor(roll(s)*held.length)];target='district:'+d.id;name=`Retake ${d.name}`;text=`Vera is sending a crew to take ${d.name} back. If nobody meets them, you lose a site there.`;}
 else{const rooms=['snack','bar','arcade','proshop'].filter(id=>s.built[id]&&!activeOutage(s,id));const pick=rooms.length&&roll(s)<.65?rooms[Math.floor(roll(s)*rooms.length)]:null;
  const laneList=s.lanes.filter(l=>!activeOutage(s,'lane'+l.id));
  if(pick){target='room:'+pick;name=kind==='siege'?`Siege on the ${backAlleyRoomName(pick)}`:`Hit on the ${backAlleyRoomName(pick)}`;}
  else if(laneList.length){const l=laneList[Math.floor(roll(s)*laneList.length)];target='lane:'+l.id;name=kind==='siege'?'Siege on the lanes':`Hit on Lane ${l.id}`;}
  else{target='alley';name='Shakedown at the door';}
  text=kind==='siege'?'Vera is done waiting. A full crew is coming for the building. If they get in, they will wreck more than one room.':`Word on the street: Vera’s crew plans to wreck the ${name.replace(/^Hit on (the )?/,'')}. Your defenses might hold. Your crew definitely could.`;}
 const lead=kind==='siege'?1:tier.lead,op={id:'op'+(++t.opSerial),kind,target,name,text,announced:s.day,launch:s.day+lead,foes:opFoes(s,kind),level:opLevel(s),status:'brewing'};
 t.ops.push(op);t.ops=t.ops.filter(o=>o.status==='brewing'||s.day-o.launch<6).slice(-6);
 turfLedger(s,'🚨',`Vera is planning: ${name}. ${lead===1?'Tomorrow night':'In '+lead+' nights'}.`,'threat');
 c.history.unshift({day:s.day,who:'Vera Vale',text:name});c.history=c.history.slice(0,25);
 s.eventQueue.push({id:'vera-op',kind:'noir',emoji:'🚨',title:name,text:`“${veraTaunt(s)}” ${text}`,effect:`Countdown: ${lead} night${lead===1?'':'s'}. Open 🌃 Turf to meet them with your crew, or trust your defenses (protection ${nightProtection(s)}).`,day:s.day,opId:op.id});
 return op;
}
function opRepelChance(s,op){return clamp(nightProtection(s)*.006-(op?.kind==='siege'?.12:0),.04,.55);}
function activeOp(s){const t=turfOf(s);return t?t.ops.find(o=>o.status==='brewing')||null:null;}
function opTargetName(s,op){if(!op)return '';const [kind,id]=String(op.target).split(':');if(kind==='district')return DISTRICTS.find(d=>d.id===id)?.name||id;if(kind==='room')return backAlleyRoomName(id);if(kind==='lane')return 'Lane '+id;return 'the front door';}
function executeOp(s,op,{passive=true}={}){
 const t=turfOf(s),c=s.campaignStory,n=c.nightOps,[kind,id]=String(op.target).split(':');
 const repel=passive?opRepelChance(s,op):0;
 if(passive&&roll(s)<repel){op.status='repelled';n.defended++;t.opsStopped++;shiftPressure(s,-4);c.influence=clamp(c.influence+3,0,100);
  const text=`Your defenses held without the crew. ${op.name} fizzled at the door.`;turfLedger(s,'🛡️',text,'win');
  s.eventQueue.push({id:'vera-repelled',kind:'noir',emoji:'🛡️',title:'Your night defenses held',text,effect:'Vera pressure −4 · Influence +3 · counts as a repelled attack.',day:s.day});return {repelled:true};}
 op.status='landed';t.opsLanded++;n.incidents++;
 let text='',repairId=null;
 const breakThing=(oid,name)=>{const baseCost=110+Math.floor(roll(s)*140),insured=n.insuranceUntil>=s.day,cost=insured?Math.max(30,Math.round(baseCost*.4)):baseCost;s.outages[oid]={name,cost,day:s.day,rival:true};return cost;};
 if(kind==='district'){const d=DISTRICTS.find(x=>x.id===id),st=districtStatus(s,id),sites=Math.max(0,(st.sites||0)-1);s.districts[id]={...st,owner:sites>=2?'player':'vera',sites,securedDay:sites>=2?st.securedDay:null};shiftPressure(s,8);c.trust=clamp(c.trust-4,0,100);text=`Nobody met Vera’s crew in ${d.name}. They took a site back${st.owner==='player'?' and the district is contested again':''}.`;}
 else if(kind==='room'&&s.built[id]&&!activeOutage(s,id)){const cost=breakThing(id,backAlleyRoomName(id));repairId=id;shiftPressure(s,op.kind==='siege'?12:9);c.trust=clamp(c.trust-4,0,100);text=`Vera’s crew got into the ${backAlleyRoomName(id)}. It is CLOSED until repaired ($${cost}).`;}
 else if(kind==='lane'&&s.lanes.some(l=>String(l.id)===id)&&!activeOutage(s,'lane'+id)){const cost=breakThing('lane'+id,'Lane '+id);repairId='lane'+id;shiftPressure(s,op.kind==='siege'?12:9);c.trust=clamp(c.trust-4,0,100);text=`Lane ${id} was wrecked overnight. It is CLOSED until repaired ($${cost}).`;}
 else{s.rep=Math.max(0,money(s.rep-3));shiftPressure(s,8);text='Vera’s crew blocked your door for an hour and scared off the evening crowd. Reputation −3.';}
 if(op.kind==='siege'){const extra=s.lanes.filter(l=>!activeOutage(s,'lane'+l.id));if(extra.length){const l=extra[Math.floor(roll(s)*extra.length)],cost=breakThing('lane'+l.id,'Lane '+l.id);text+=` They hit Lane ${l.id} on the way out ($${cost}).`;}s.eventBoostFactor=.82;s.eventBoostUntil=s.day+2;s.rival.pressure=Math.min(s.rival.pressure,72);c.heat=clamp((c.heat||0)+10,0,100);text+=' Afterward, police cars sit on the block for days. Vera’s crews pull back a little — and the cops start asking you questions too.';}
 turfLedger(s,'💥',`${op.name} landed. ${text}`,'loss');
 s.eventQueue.push({id:'vera-'+op.kind,kind:'noir',emoji:'💥',title:op.name+' — it happened',text,effect:repairId?`Repair it from the room, or here. Vera pressure is now ${s.rival.pressure}.`:`Vera pressure is now ${s.rival.pressure}.`,repairId,day:s.day});
 return {repelled:false};
}
// Called at day close on the Back Alley route instead of the old 6–9 day strike timer.
// Returns true when it queued a modal message (so a random event does not pile on).
function veraNight(s){
 const c=s.campaignStory,t=turfOf(s);if(!t||t.cityVictory||c.victory||s.startupPending)return false;
 const before=s.rival.pressure||0,lines=[];let modal=false;
 for(const id of Object.keys(t.injured))if(t.injured[id]<=s.day)delete t.injured[id];
 for(const id of Object.keys(t.tags))if(t.tags[id]<=s.day)delete t.tags[id];
 t.tired={};
 const drift=veraDrift(s);shiftPressure(s,drift.total);const floor=veraFloor(s);if(s.rival.pressure<floor)s.rival.pressure=floor;t.lastDrift=s.rival.pressure-before;
 const play=runVeraPlay(s);if(play)lines.push(play);
 const tier=threatTier(s),calm=c.nightOps.crew||0;
 if(tier.morale&&(s.employees||[]).length){const loss=Math.max(0,tier.morale-(calm>=2?1:0));if(loss)for(const e of s.employees)e.morale=clamp((e.morale??70)-loss,0,100);}
 for(const op of t.ops.filter(o=>o.status==='brewing'&&o.launch<=s.day)){executeOp(s,op);modal=true;}
 if(!activeOp(s)){
  if(!t.nextOpDay)t.nextOpDay=s.day+2;
  if(s.day>=t.nextOpDay||(s.rival.pressure>=90&&!t.accord&&s.day-(t.ops.at(-1)?.announced||0)>=2)){modal=!!announceOp(s)||modal;const p=s.rival.pressure||0;t.nextOpDay=s.day+Math.max(3,6-Math.floor(p/25))+Math.floor(roll(s)*2)+(threatTier(s).lead);}
 }
 {const q=s.eventQueue,vi=q.map((e,i)=>String(e.id).startsWith('vera-')||e.id==='turf-intro'?i:-1).filter(i=>i>=0);if(vi.length>4){const drop=new Set(vi.slice(0,vi.length-4));s.eventQueue=q.filter((e,i)=>!drop.has(i));}}
 s.today.vera={start:before,end:s.rival.pressure,drift:drift.total,tier:threatTier(s).name,plays:lines.map(x=>({icon:x.icon,name:x.name,text:x.text,foiled:x.foiled}))};
 c.aiMemory.unshift({day:s.day,action:play?play.id:'drift',pressure:s.rival.pressure});c.aiMemory=c.aiMemory.slice(0,30);
 const nextTier=threatTier(s),beforeIx=THREAT_TIERS.filter(x=>before>=x.min).length-1;if(THREAT_TIERS.indexOf(nextTier)>beforeIx){turfLedger(s,'📈',`Vera’s grip tightened to ${nextTier.name}. ${nextTier.line}`,'threat');if(!modal){s.eventQueue.push({id:'vera-tier',kind:'noir',emoji:'📈',title:`Vera is ${nextTier.name}`,text:`“${veraTaunt(s)}” ${nextTier.line}`,effect:`Guest traffic ×${nextTier.traffic}${nextTier.morale?` · staff morale −${nextTier.morale}/night`:''}. Win fights and hold districts to push her back.`,day:s.day});modal=true;}}
 return modal;
}
// Floor interactions: deal with what you can see.
function confrontLookout(s){const t=turfOf(s);if(!t)return {ok:false,reason:'Back Alley only'};if(t.lookoutUntil<s.day)return {ok:false,reason:'Nobody is watching the door right now'};
 if((s.campaignStory.nightOps.entrance||0)<1)return {ok:false,reason:'Hire a Night Doorman first (Door Security)'};if(t.lookoutFaced===s.day)return {ok:false,reason:'Your doorman already went out once tonight'};
 t.lookoutUntil=s.day-1;t.lookoutFaced=s.day;shiftPressure(s,-1);turfLedger(s,'🚪','Your doorman walked the lookout to the end of the block.','win');return {ok:true};}
function scrubTag(s,id){const t=turfOf(s);if(!t?.tags?.[id])return {ok:false,reason:'Nothing to scrub here'};if(!spend(s,25))return {ok:false,reason:'Need $25 for paint'};delete t.tags[id];shiftPressure(s,-1);recordCharge(s,'capex',25);turfLedger(s,'🧽',`You painted over Vera’s mark on the ${backAlleyRoomName(id)}.`,'win');return {ok:true};}
// ── Crew: every bowler’s training shows up on the street ──
function fighterStats(b){const power=b.power||20,aim=b.aim||20,focus=b.focus||20,spare=b.spare||20,conf=b.confidence??50;
 const top=[['power',power],['aim',aim],['focus',focus],['spare',spare]].reduce((a,x)=>x[1]>a[1]?x:a);
 return {hp:14+Math.round(spare/5)+Math.round(conf/12),dmg:3+Math.floor(power/9)+(b.ball?1:0),hit:clamp(.62+aim/220,.6,.96),crit:clamp(aim/400,.03,.25),resist:clamp(focus/110,.1,.85),armor:Math.floor(focus/30),standFirm:(b.loyalty||0)>=80,skill:SKILLS[top[0]].id,skillStat:top[0]};}
const SKILLS={
 power:{id:'bowl',stat:'power',name:'Bowl Them Over',icon:'🎳',text:'Hits every foe at once.'},
 aim:{id:'pickoff',stat:'aim',name:'Pick Off',icon:'🎯',text:'Never misses, hits hard and stuns the target.'},
 focus:{id:'staredown',stat:'focus',name:'Stare Down',icon:'👁️',text:'Cancels a foe’s move, weakens them for the fight and steadies your crew.'},
 spare:{id:'pickup',stat:'spare',name:'Pick Up the Spare',icon:'🩹',text:'Patches up the most hurt teammate, or gets a downed one back up.'}
};
const SKILL_BY_ID=Object.fromEntries(Object.values(SKILLS).map(k=>[k.id,k]));
const CREW_LOYALTY=55;
function crewStatus(s,b){const t=turfOf(s);if(!t)return 'off';if(t.injured[b.id]>s.day)return 'injured';if(t.tired[b.id])return 'tired';return b.crewReady?'ready':'bench';}
function crewMembers(s){return (s.bowlers||[]).filter(b=>b.crewReady).map(b=>({id:b.id,name:b.name,...fighterStats(b),status:crewStatus(s,b)}));}
function recruitCrew(s,id,ready){const b=s.bowlers.find(x=>x.id===id);if(!b)return {ok:false,reason:'Bowler not found'};
 if(s.campaignStory?.path!=='backalley')return {ok:false,reason:'Crew activity is only available in The Back Alley'};
 if(ready&&(b.loyalty||0)<CREW_LOYALTY)return {ok:false,reason:`${b.name} isn’t ready to take risks for you yet (loyalty ${b.loyalty||0}/${CREW_LOYALTY}). Win together on the lanes first.`};
 b.crewReady=!!ready;note(s,`${b.name} ${ready?'joined the night crew':'went back to bowling-only duties'}.`,'story');return {ok:true};}
function patchUp(s,id){const t=turfOf(s),b=getBowler(s,id);if(!t||!b)return {ok:false,reason:'Not available'};if(!(t.injured[id]>s.day))return {ok:false,reason:`${b.name} is not hurt`};
 if(districtStatus(s,'oldtown').owner!=='player')return {ok:false,reason:'Hold Old Town first — Doc Ramos only works for people who protect the block'};
 if(!spend(s,60))return {ok:false,reason:'Need $60'};delete t.injured[id];recordCharge(s,'capex',60);turfLedger(s,'🩹',`Doc Ramos patched up ${b.name} in the back of the pharmacy.`,'win');return {ok:true};}
// ── Foes ──
const FOES={
 lookout:{name:'Lookout',hp:14,atk:3,dodge:.08,moves:['swing','swing','whistle'],art:'foe.lookout'},
 bruiser:{name:'Bruiser',hp:25,atk:5,dodge:0,moves:['swing','haymaker','swing'],art:'foe.bruiser'},
 fixer:{name:'The Fixer',hp:16,atk:4,dodge:.12,moves:['intimidate','swing','swing'],art:'foe.fixer'},
 knox:{name:'Knox',hp:34,atk:6,dodge:.08,moves:['swing','haymaker','rally','swing'],art:'foe.knox'},
 vera:{name:'Vera Vale',hp:46,atk:7,dodge:.1,moves:['ultimatum','swing','haymaker','rally'],art:'story.vera'}
};
const DISTRICT_FOES={oldtown:[['lookout','lookout'],['bruiser','lookout','lookout']],warehouse:[['bruiser','fixer'],['bruiser','bruiser','lookout']],neon:[['fixer','bruiser','lookout'],['knox','lookout']],westend:[['knox','fixer'],['bruiser','fixer','bruiser']],civic:[['fixer','fixer','bruiser'],['knox','bruiser','fixer']],docks:[['knox','bruiser','lookout'],['vera','knox','bruiser']]};
const SITE_NAMES={oldtown:['the loading dock','Mrs. Ortiz’s block'],warehouse:['the freight gate','Depot 9'],neon:['the Velvet Room','the Neon Strip office'],westend:['the shift-change corner','the union hall'],civic:['the permit office steps','City Hall annex'],docks:['Pier 4','Vera’s warehouse']};
function foeHP(kind,level){return Math.round(FOES[kind].hp*(1+.2*level+.035*level*level));}
function foeAtk(kind,level){return FOES[kind].atk+Math.floor(.6*level+.1*level*level);}
function makeFoe(kind,level,i){const f=FOES[kind];const hp=foeHP(kind,level);return {id:'f'+i,kind,name:f.name,hp,max:hp,atk:foeAtk(kind,level),dodge:f.dodge,moveIx:i,intent:null,stun:false,shaken:false,ko:false,whistled:false};}
function makeFighter(b,bonusHP=0){const st=fighterStats(b),hp=st.hp+bonusHP;return {id:b.id,name:b.name,hp,max:hp,dmg:st.dmg,hit:st.hit,crit:st.crit,resist:st.resist,armor:st.armor,standFirm:st.standFirm,usedStand:false,skill:st.skill,cd:0,guard:false,cover:null,shaken:false,ko:false,acted:false,ally:false};}
function battleRand(s){return roll(s);}
function pickIntent(s,b,f){const alive=b.crew.filter(x=>!x.ko);if(!alive.length)return null;const moves=FOES[f.kind].moves;let type=moves[(f.moveIx+b.round)%moves.length];
 if(type==='whistle'&&(b.whistled||b.foes.length>=4))type='swing';
 if(type==='rally'&&b.foes.filter(x=>!x.ko).length<2&&f.kind!=='vera')type='swing';
 const weakest=[...alive].sort((a,c)=>a.hp/a.max-c.hp/c.max)[0],rnd=alive[Math.floor(battleRand(s)*alive.length)];
 const target=type==='haymaker'?(battleRand(s)<.6?weakest:rnd):type==='intimidate'?[...alive].filter(x=>!x.ally).sort((a,c)=>a.resist-c.resist)[0]||rnd:rnd;
 const power=type==='haymaker'?f.atk*2:f.atk;return {type,target:['rally','whistle','ultimatum'].includes(type)?null:target.id,power};}
function setIntents(s,b){for(const f of b.foes)f.intent=f.ko?null:pickIntent(s,b,f);}
function availableFighters(s){return (s.bowlers||[]).filter(b=>crewStatus(s,b)==='ready');}
function battlePreview(s,{district=null,opId=null}={}){
 const t=turfOf(s);if(!t)return null;let foes,level,title,where;
 if(opId){const op=t.ops.find(o=>o.id===opId&&o.status==='brewing');if(!op)return null;foes=op.foes;level=op.level;title=op.name;where=opTargetName(s,op);}
 else{const d=DISTRICTS.find(x=>x.id===district);if(!d)return null;const i=DISTRICTS.indexOf(d),site=Math.min(2,(districtStatus(s,d.id).sites||0)+1);foes=DISTRICT_FOES[d.id][site-1];level=i;title=`${d.name} · site ${site} of 2`;where=SITE_NAMES[d.id][site-1];}
 const scaled=foes.map(k=>({kind:k,name:FOES[k].name,hp:foeHP(k,level),atk:foeAtk(k,level)}));
 return {title,where,level,foes:scaled,foeHP:scaled.reduce((n,f)=>n+f.hp,0),foeAtk:scaled.reduce((n,f)=>n+f.atk,0)};}
function crewPower(s,ids){const picks=(s.bowlers||[]).filter(b=>ids.includes(b.id)).map(fighterStats);return {hp:picks.reduce((n,x)=>n+x.hp,0),dps:Math.round(picks.reduce((n,x)=>n+x.dmg*x.hit*(1+x.crit*.6),0)*10)/10};}
function startBattle(s,{district=null,opId=null,crew=[]}={}){
 const t=turfOf(s),c=s.campaignStory,n=c.nightOps;if(!t)return {ok:false,reason:'Showdowns belong to The Back Alley'};
 if(t.cityVictory)return {ok:false,reason:'The city is already yours'};
 if(s.battle?.status==='active')return {ok:false,reason:'Finish the current showdown first'};
 const mode=opId?'defend':'attack';
 if(mode==='attack'){const d=DISTRICTS.find(x=>x.id===district);if(!d)return {ok:false,reason:'Unknown district'};
  if(!districtUnlocked(s,d.id))return {ok:false,reason:DISTRICTS.indexOf(d)>expansionStage(s)?`Open Wing ${DISTRICTS.indexOf(d)} of your alley to reach ${d.name}`:'Take the previous district first'};
  if(districtStatus(s,d.id).owner==='player')return {ok:false,reason:'You already hold this district'};}
 else if(!t.ops.some(o=>o.id===opId&&o.status==='brewing'))return {ok:false,reason:'That operation is no longer active'};
 const ready=availableFighters(s),pickIds=(crew.length?crew:ready.map(b=>b.id)).filter(id=>ready.some(b=>b.id===id)).slice(0,3);
 if(!pickIds.length)return {ok:false,reason:ready.length?'Pick at least one fighter':'Nobody on your crew is fit to fight tonight'};
 const pv=battlePreview(s,{district,opId}),bonus=mode==='defend'?(n.crew||0)*3:0;
 const b={status:'active',mode,district:mode==='attack'?district:null,opId,title:pv.title,where:pv.where,level:pv.level,round:1,maxRounds:12,whistled:false,
  crew:pickIds.map(id=>makeFighter(getBowler(s,id),bonus)),foes:pv.foes.map((f,i)=>makeFoe(f.kind,pv.level,i)),log:[],events:[],result:null};
 if(mode==='defend'&&(n.entrance||0)>0){const lv=n.entrance,hp=16+lv*6;b.crew.push({id:'doorman',name:'Doorman',hp,max:hp,dmg:3+lv,hit:.75,crit:.04,resist:.5,armor:1,standFirm:false,usedStand:false,skill:null,cd:0,guard:false,cover:null,shaken:false,ko:false,acted:false,ally:true});}
 const open=[];
 if(mode==='defend'&&(n.cameras||0)>0){const dmg=n.cameras*2;for(const f of b.foes){f.hp=Math.max(1,f.hp-dmg);open.push({type:'hit',from:'cameras',to:f.id,amount:dmg,text:`Your cameras spotted ${f.name} early (−${dmg})`});}}
 if(mode==='attack'&&(c.influence||0)>=25){const dmg=Math.floor(c.influence/25);for(const f of b.foes){f.hp=Math.max(1,f.hp-dmg);open.push({type:'hit',from:'intel',to:f.id,amount:dmg,text:`Your contacts tipped you off: ${f.name} is caught off guard (−${dmg})`});}}
 if(bonus)open.push({type:'info',text:`Your drills pay off: each fighter starts with +${bonus} grit.`});
 setIntents(s,b);b.events=open;b.log=open.map(e=>e.text).concat([mode==='attack'?`You walk into ${pv.where}. ${b.foes.map(f=>f.name).join(', ')} turn around.`:`They’re here. ${b.foes.map(f=>f.name).join(', ')} at the door.`]);
 s.battle=b;return {ok:true};}
function currentActor(b){return b.crew.find(x=>!x.ally&&!x.ko&&!x.acted)||null;}
function crewTarget(b,id){return b.crew.find(x=>x.id===id);}
function liveFoes(b){return b.foes.filter(f=>!f.ko);}
function hurtFoe(s,b,f,amount,ev,from,kind='hit'){f.hp=Math.max(0,f.hp-amount);ev.push({type:kind,from,to:f.id,amount,text:''});if(f.hp<=0&&!f.ko){f.ko=true;f.intent=null;ev.push({type:'ko',to:f.id,text:`${f.name} is down!`});}}
function strikeFoe(s,b,me,f,ev,mult=1,sure=false,bonusHit=0){
 const hitChance=clamp(me.hit-(f.dodge||0)-(me.shaken?.35:0)+bonusHit,.2,.98);
 if(!sure&&battleRand(s)>=hitChance){ev.push({type:'miss',from:me.id,to:f.id,text:`${me.name} swings at ${f.name} and misses${me.shaken?' (shaken)':''}.`});return false;}
 const crit=!sure&&battleRand(s)<me.crit,amount=Math.max(1,Math.round((me.dmg-1+Math.floor(battleRand(s)*5))*mult*(crit?1.6:1)));
 hurtFoe(s,b,f,amount,ev,me.id,crit?'crit':'hit');ev[ev.length-(f.ko?2:1)].text=`${me.name} ${crit?'lands a perfect strike on':'hits'} ${f.name} for ${amount}${crit?'!':''}.`;return true;}
function battleAct(s,{action,target}={}){
 const b=s.battle;if(!b||b.status!=='active')return {ok:false,reason:'No showdown in progress'};
 const me=currentActor(b);if(!me)return {ok:false,reason:'Waiting for the round to finish'};
 const ev=[];const foe=b.foes.find(f=>f.id===target&&!f.ko)||liveFoes(b)[0];
 if(action==='strike'){strikeFoe(s,b,me,foe,ev);}
 else if(action==='guard'){me.guard=true;const others=b.crew.filter(x=>x!==me&&!x.ko);const cover=others.length?[...others].sort((a,c)=>a.hp/a.max-c.hp/c.max)[0]:null;me.cover=cover?.id||null;const heal=Math.min(2,me.max-me.hp);me.hp+=heal;ev.push({type:'guard',from:me.id,to:cover?.id||me.id,amount:heal,text:cover?`${me.name} braces and covers ${cover.name}.`:`${me.name} braces for the next hit.`});}
 else if(action==='skill'){if(me.cd>0)return {ok:false,reason:`${SKILL_BY_ID[me.skill].name} is ready in ${me.cd} round${me.cd===1?'':'s'}`};const sk=me.skill;
  if(sk==='bowl'){ev.push({type:'skill',from:me.id,skill:sk,text:`${me.name}: Bowl Them Over!`});for(const f of liveFoes(b))strikeFoe(s,b,me,f,ev,.75,false,.1);}
  else if(sk==='pickoff'){ev.push({type:'skill',from:me.id,skill:sk,text:`${me.name} lines up the shot…`});strikeFoe(s,b,me,foe,ev,1.4,true);if(!foe.ko){foe.stun=true;ev.push({type:'stun',to:foe.id,text:`${foe.name} is stunned and loses their move.`});}}
  else if(sk==='staredown'){foe.stun=true;if(!foe.shaken){foe.shaken=true;foe.atk=Math.max(1,foe.atk-2);}for(const x of b.crew)x.shaken=false;ev.push({type:'skill',from:me.id,skill:sk,text:`${me.name} stares ${foe.name} down.`});ev.push({type:'stun',to:foe.id,text:`${foe.name} hesitates — move cancelled, hits softer for the rest of the fight. Your crew steadies.`});}
  else if(sk==='pickup'){const down=b.crew.find(x=>x.ko&&!x.ally),hurt=[...b.crew.filter(x=>!x.ko)].sort((a,c)=>a.hp/a.max-c.hp/c.max)[0],who=down||hurt,amount=down?Math.round(down.max*.35):Math.min(who.max-who.hp,6+Math.floor((getBowler(s,me.id)?.spare||20)/8));if(down){down.ko=false;down.hp=amount;down.acted=true;}else who.hp+=amount;ev.push({type:'heal',from:me.id,to:who.id,amount,text:down?`${me.name} gets ${who.name} back on their feet (+${amount}).`:`${me.name} patches up ${who.name} (+${amount}).`});}
  me.cd=3;}
 else return {ok:false,reason:'Choose strike, skill or guard'};
 me.shaken=false;me.acted=true;
 if(!liveFoes(b).length){b.events=ev;b.log=[...b.log,...ev.map(e=>e.text).filter(Boolean)].slice(-12);finishBattle(s,true);return {ok:true,events:ev,status:b.status};}
 if(!currentActor(b))enemyPhase(s,b,ev);
 b.events=ev;b.log=[...b.log,...ev.map(e=>e.text).filter(Boolean)].slice(-12);return {ok:true,events:ev,status:b.status};}
function enemyPhase(s,b,ev){
 for(const a of b.crew.filter(x=>x.ally&&!x.ko)){const f=[...liveFoes(b)].sort((x,y)=>x.hp-y.hp)[0];if(!f)break;strikeFoe(s,b,a,f,ev);}
 if(!liveFoes(b).length){finishBattle(s,true);return;}
 ev.push({type:'phase',text:'Vera’s crew moves.'});
 for(const f of liveFoes(b)){const it=f.intent;if(!it)continue;if(f.stun){f.stun=false;ev.push({type:'stunned',from:f.id,text:`${f.name} is still seeing stars.`});continue;}
  if(it.type==='rally'){for(const x of liveFoes(b)){x.atk+=1;x.hp=Math.min(x.max,x.hp+4);}ev.push({type:'rally',from:f.id,text:`${f.name} barks orders. Vera’s crew hits harder (+1) and catches their breath.`});continue;}
  if(it.type==='whistle'){b.whistled=true;const nf=makeFoe('lookout',b.level,b.foes.length);nf.intent=null;b.foes.push(nf);ev.push({type:'summon',from:f.id,to:nf.id,text:`${f.name} whistles. Another lookout comes around the corner.`});continue;}
  if(it.type==='intimidate'||it.type==='ultimatum'){const targets=it.type==='ultimatum'?b.crew.filter(x=>!x.ko&&!x.ally):[crewTarget(b,it.target)].filter(x=>x&&!x.ko);
   for(const x of targets){if(battleRand(s)<x.resist)ev.push({type:'resist',from:f.id,to:x.id,text:`${x.name} doesn’t flinch.`});else{x.shaken=true;ev.push({type:'shaken',from:f.id,to:x.id,text:`${f.name} gets in ${x.name}’s head. Next swing −35% accuracy.`});}}
   if(it.type==='ultimatum'){const x=targets[0];if(x)hitCrew(s,b,f,x,f.atk,ev);}continue;}
  let x=crewTarget(b,it.target);if(!x||x.ko){const alive=b.crew.filter(y=>!y.ko);if(!alive.length)break;x=alive[0];}
  const guard=b.crew.find(y=>y.guard&&!y.ko&&y.cover===x.id&&y!==x);if(guard){ev.push({type:'cover',from:guard.id,to:x.id,text:`${guard.name} steps in front of ${x.name}.`});x=guard;}
  if(battleRand(s)>=.82){ev.push({type:'miss',from:f.id,to:x.id,text:`${f.name} ${it.type==='haymaker'?'throws a haymaker and':'swings and'} misses ${x.name}.`});continue;}
  hitCrew(s,b,f,x,it.type==='haymaker'?f.atk*2:f.atk,ev,it.type==='haymaker');
  if(!b.crew.some(y=>!y.ko&&!y.ally))break;}
 if(!b.crew.some(y=>!y.ko&&!y.ally)){finishBattle(s,false);return;}
 b.round++;if(b.round>b.maxRounds){ev.push({type:'info',text:'Sirens in the distance. Both crews scatter before anyone wins.'});finishBattle(s,false,true);return;}
 for(const x of b.crew){x.acted=false;x.guard=false;x.cover=null;if(x.cd>0)x.cd--;}
 setIntents(s,b);}
function hitCrew(s,b,f,x,base,ev,big=false){let amount=Math.max(1,base-1+Math.floor(battleRand(s)*5)-x.armor);if(x.guard)amount=Math.max(1,Math.ceil(amount*.4));
 x.hp=Math.max(0,x.hp-amount);ev.push({type:big?'crit':'hit',from:f.id,to:x.id,amount,text:`${f.name} ${big?'lands a haymaker on':'hits'} ${x.name} for ${amount}${x.guard?' (guarded)':''}.`});
 if(x.hp<=0){if(x.standFirm&&!x.usedStand){x.usedStand=true;x.hp=1;ev.push({type:'stand',to:x.id,text:`${x.name} refuses to go down!`});}else{x.ko=true;ev.push({type:'ko',to:x.id,text:`${x.name} is down.`});}}}
function captureSite(s,district){const st=districtStatus(s,district.id),sites=Math.min(2,(st.sites||0)+1),secured=sites===2;s.districts[district.id]={owner:secured?'player':'vera',victories:(st.victories||0)+1,sites,securedDay:secured?s.day:null};return secured;}
function finishBattle(s,won,standoff=false){
 const b=s.battle,t=turfOf(s),c=s.campaignStory;if(!b||b.status!=='active')return;b.status=won?'won':'lost';
 const fighters=b.crew.filter(x=>!x.ally),rewards=[];
 for(const x of fighters){const bw=getBowler(s,x.id);if(!bw)continue;t.tired[x.id]=1;
  if(won){bw.confidence=clamp((bw.confidence||50)+2,0,100);bw.loyalty=clamp((bw.loyalty||50)+1,0,100);if(x.ko)t.injured[x.id]=s.day+2;}
  else{bw.confidence=clamp((bw.confidence||50)-(standoff?1:3),0,100);if(x.ko)t.injured[x.id]=s.day+3;}}
 const hurt=fighters.filter(x=>t.injured[x.id]>s.day).map(x=>x.name);
 if(b.mode==='attack'){const d=DISTRICTS.find(x=>x.id===b.district);
  if(won){const secured=captureSite(s,d);t.fightsWon++;c.defenseWins++;c.trust=clamp(c.trust+5,0,100);s.rep=money(s.rep+(d.id==='westend'?6:3));const drop=d.id==='civic'&&secured?15:secured?12:8;shiftPressure(s,-drop);
   if(secured&&d.id==='warehouse')s.parts+=5;if(secured&&d.id==='neon')s.cash=money(s.cash+240);if(secured&&d.id==='docks')c.trust=clamp(c.trust+10,0,100);
   rewards.push(`Vera pressure −${drop}`,'Trust +5',`Reputation +${d.id==='westend'?6:3}`);if(secured)rewards.push(d.reward);
   b.result={title:secured?`${d.name} is yours`:`You took ${b.where}`,text:secured?`Vera’s people cleared out of ${d.name}. The block breathes again.${DISTRICTS.indexOf(d)<5?' The next district is in reach.':''}`:`One more site and ${d.name} is yours.`,rewards};
   turfLedger(s,'⚔️',secured?`You took ${d.name}. ${d.reward}.`:`You took ${b.where} in ${d.name}. One site to go.`,'win');if(!activeOp(s)&&!t.accord)t.nextOpDay=Math.min(t.nextOpDay||s.day+2,s.day+2);
   note(s,secured?`🌃 ${d.name} secured. ${d.reward}.`:`⚔️ ${d.name}: first site taken.`,'story');checkCityVictory(s);}
  else{t.fightsLost++;shiftPressure(s,standoff?2:5);c.heat=clamp(c.heat+4,0,100);rewards.push(`Vera pressure +${standoff?2:5}`,'Suspicion +4');
   b.result={title:standoff?'Standoff':'Your crew fell back',text:standoff?'Nobody won tonight. Vera will call it a win anyway.':`Vera’s crew held ${b.where}. Train up, rest and come back.`,rewards};turfLedger(s,'🩸',`Your crew lost at ${b.where}.`,'loss');}}
 else{const op=t.ops.find(o=>o.id===b.opId);
  if(won){if(op)op.status='stopped';t.fightsWon++;t.opsStopped++;c.nightOps.defended++;c.defenseWins++;c.influence=clamp(c.influence+4,0,100);c.trust=clamp(c.trust+3,0,100);shiftPressure(s,-10);rewards.push('Vera pressure −10','Influence +4','Trust +3','Counts as a repelled attack');
   b.result={title:'They never got in',text:`${op?op.name:'The operation'} is over before it started. Word gets around fast.`,rewards};turfLedger(s,'🛡️',`Your crew stopped ${op?op.name:'Vera’s operation'} at the door.`,'win');checkCampaignVictory(s);}
  else{t.fightsLost++;rewards.push('The operation goes ahead');b.result={title:standoff?'They slipped past':'They broke through',text:'Your crew couldn’t hold them.',rewards};if(op&&op.status==='brewing')executeOp(s,op,{passive:false});turfLedger(s,'🩸',`Your crew couldn’t stop ${op?op.name:'the operation'}.`,'loss');}}
 if(hurt.length)b.result.rewards.push(`${hurt.join(' & ')} hurt — back on Day ${s.day+(won?2:3)}`);
 b.result.rewards.push('Fighters rest until tomorrow');
 c.history.unshift({day:s.day,who:'Crew',text:b.result.title});c.history=c.history.slice(0,25);}
function fleeBattle(s){const b=s.battle;if(!b||b.status!=='active')return {ok:false,reason:'No showdown in progress'};const t=turfOf(s);b.status='fled';for(const x of b.crew.filter(x=>!x.ally))t.tired[x.id]=1;
 if(b.mode==='attack')shiftPressure(s,3);b.result={title:'You pulled your crew out',text:b.mode==='attack'?'Vera hears you backed down. Pressure +3.':'The operation is still coming. Your defenses will have to hold.',rewards:b.mode==='attack'?['Vera pressure +3']:['Operation still pending']};turfLedger(s,'↩️',`Your crew backed out of ${b.where}.`,'loss');return {ok:true};}
function closeBattle(s){if(s.battle&&s.battle.status!=='active'){s.battle=null;return {ok:true};}return {ok:false,reason:'Showdown still in progress'};}
function battleAuto(s){const b=s.battle;if(!b||b.status!=='active')return {ok:false,reason:'No showdown in progress'};const all=[];
 for(let n=0;n<60&&b.status==='active';n++){const me=currentActor(b);if(!me)break;const foes=liveFoes(b);const threatened=foes.some(f=>f.intent?.type==='haymaker');const weak=[...foes].sort((x,y)=>x.hp-y.hp)[0];
  let action='strike';if(me.cd===0&&(me.skill!=='pickup'||b.crew.some(x=>x.ko&&!x.ally)||b.crew.some(x=>!x.ko&&x.hp<x.max*.5)))action='skill';else if(threatened&&me.hp<me.max*.35)action='guard';
  const big=foes.find(f=>f.intent?.type==='haymaker');const r=battleAct(s,{action,target:(me.skill==='pickoff'||me.skill==='staredown')&&action==='skill'&&big?big.id:weak.id});if(r.events)all.push(...r.events);}
 b.events=all.slice(-14);return {ok:true,status:b.status};}
function checkCityVictory(s){const c=s.campaignStory,t=turfOf(s);if(c.victory||!t)return false;if(!DISTRICTS.every(d=>districtStatus(s,d.id).owner==='player'))return false;
 c.victory=true;t.cityVictory=true;advanceBackAlley(s);s.rep=money(s.rep+15);s.rival.pressure=0;const msg='🌃 The City Is Yours: all six districts stand with The Back Alley. Vera sells the Docks warehouse and leaves town before the week is out.';
 c.history.unshift({day:s.day,who:'Story',text:msg});s.eventQueue.push({id:'noir-finale',emoji:'🌃',title:'The City Is Yours',kind:'noir',text:msg,effect:'Campaign complete. Your bowling center keeps running — and nobody leans on it anymore.'});log(s,msg);return true;}
function ensureTurf(s){const fix=x=>{if(!x)return;if(x.campaignStory?.path==='backalley'){const t=turfOf(x);if(x.campaignStory.victory&&!t.cityVictory){x.campaignStory.victory=false;t.accord=true;t.ledger.unshift({day:x.day,icon:'🌹',text:'Your Midnight Accord still stands: Vera keeps away from the building. The six districts are still hers.',tone:'win'});}if(x.tactical&&x.tactical.status==='active')x.tactical=null;}x.battle??=null;};fix(s);for(const snap of Object.values(s?.portfolio?.snapshots||{}))if(snap&&snap!==s)fix(snap);return s;}
function getBowler(s,id){return s.bowlers.find(x=>x.id===id);}
function trainCost(s,id,stat){const b=getBowler(s,id);if(!b||!['aim','spare','power','focus'].includes(stat))return null;return 45+Math.round(b[stat]*1.45);}
function train(s,id,stat){const b=getBowler(s,id),cost=trainCost(s,id,stat);if(!b||cost===null)return {ok:false,reason:'Invalid training'};if(b[stat]>=95)return {ok:false,reason:'Already maxed'};if(!spend(s,cost))return {ok:false,reason:'Not enough money'};
 const gain=5+(isBuilt(s,'coaching')?2:0)+s.ownerSkills.coach;b[stat]=clamp(b[stat]+gain,0,95);if(s.campaignStory?.path==='backalley')b.loyalty=clamp((b.loyalty||50)+2,0,100);grantXP(s,6);log(s,`${b.name} trained ${stat} (+${gain}).`);return {ok:true};}
function fitBall(s,id){const b=getBowler(s,id);if(!b)return {ok:false,reason:'Bowler not found'};if(!isBuilt(s,'proshop'))return {ok:false,reason:'Build the Pro Shop first'};if(b.ball)return {ok:false,reason:'Already fitted'};if(!spend(s,170))return {ok:false,reason:'Not enough money'};b.ball=true;grantXP(s,8);log(s,`${b.name} got a custom ball.`);return {ok:true};}
function recruit(s){if(lanes(s)<2)return {ok:false,reason:'Need at least two lanes'};if(!s.teamStory.leoJoined)return {ok:false,reason:'Complete Maya’s first frame and welcome Leo before recruiting more bowlers'};if(s.bowlers.length>=4)return {ok:false,reason:'Roster full'};if(!spend(s,320))return {ok:false,reason:'Not enough money'};
 const name=['Jules','Sam','Rory','Parker'][Math.max(0,s.bowlers.length-2)],id='recruit'+s.bowlers.length;const b={id,name,aim:29+Math.floor(roll(s)*8),spare:25+Math.floor(roll(s)*8),power:27+Math.floor(roll(s)*8),focus:24+Math.floor(roll(s)*8),ball:false,confidence:45,loyalty:50,crewReady:false};s.bowlers.push(b);grantXP(s,10);log(s,`${name} joined the team.`);return {ok:true};}
function eligibility(s,t){const reasons=[];if(teamAvg(s)<t.needAvg)reasons.push(`average ${t.needAvg}`);if(s.rep<t.needRep)reasons.push(`reputation ${t.needRep}`);if(t.need.some(x=>!isBuilt(s,x)))reasons.push('facility needed');if(t.needLanes&&lanes(s)<t.needLanes)reasons.push(`${t.needLanes} lanes needed`);if((s.tournamentCooldown[t.id]||0)>s.day)reasons.push(`try again day ${s.tournamentCooldown[t.id]}`);if(s.cash<t.fee)reasons.push(`entry $${t.fee}`);return reasons;}
function tournament(s,id){const t=TOURNAMENTS.find(x=>x.id===id);if(!t)return {ok:false,reason:'Tournament not found'};const missing=eligibility(s,t);if(missing.length)return {ok:false,reason:missing.join(' · ')};spend(s,t.fee);
 const score=Math.round(teamAvg(s)+(roll(s)-.5)*38),rival=Math.round(t.rival+(roll(s)-.5)*18),won=score>=rival,first=!(s.tournamentWins[t.id]||0),payout=won?Math.round(t.firstPrize*(first?1:.35)):Math.round(t.fee*.18);
 s.cash+=payout;s.rep+=won?t.rep:3;grantXP(s,won?24:11);if(won)s.tournamentWins[t.id]=(s.tournamentWins[t.id]||0)+1;advanceStory(s);s.tournamentCooldown[t.id]=s.day+t.cooldown;log(s,`${t.title}: ${won?'CHAMPIONS!':'Keep practicing!'} ${score}–${rival}.`);return {ok:true,won,score,rival,payout,tournament:t.title};}
// Legacy competitive season: a narrated, multi-round bracket with skill AND chance.
const LEAGUE_CIRCUIT=[
 {id:'local',name:'Neighborhood Qualifier',teams:['Kingpin Kids','Frostline Five','Vera’s City Juniors'],qualifier:null},
 {id:'county',name:'County Invitational',teams:['Split City','Golden Pockets','StrikeCity Sentinels'],qualifier:'local'},
 {id:'regional',name:'Regional Showdown',teams:['The Spare Bunch','Northern Kings','Vale’s A-Team'],qualifier:'county'},
 {id:'national',name:'National Heritage Finals',teams:['Coastline Strikers','The Perfect Ten','Vera’s Champions'],qualifier:'regional'}
];
function runLeagueCircuit(s,id){if(s.campaignStory?.path!=='legacy')return {ok:false,reason:'The Legacy competition circuit requires the community story route'};
 const stage=LEAGUE_CIRCUIT.find(c=>c.id===id),base=TOURNAMENTS.find(t=>t.id===id);
 if(!stage)return {ok:false,reason:'Unknown circuit stage'};
 if(stage.qualifier&&!s.circuitWins?.[stage.qualifier])return {ok:false,reason:'Beat the preceding circuit stage first'};
 if(!s.league.active)return {ok:false,reason:'Start the Thursday league to enter the circuit'};
 const missing=eligibility(s,base);if(missing.length)return {ok:false,reason:missing.join(' · ')};
 spend(s,base.fee);const bracket=[];const skill=teamAvg(s)+(s.built.coaching?9:0)+(s.built.proshop?7:0)+(s.league.sessions||0)*.3;
 let won=true;for(let i=0;i<stage.teams.length;i++){const rivalBase=base.rival-9+i*6;
 const score=Math.round(skill+(roll(s)-.5)*34),opponent=Math.round(rivalBase+(roll(s)-.5)*28);
 bracket.push({round:i+1,opponent:stage.teams[i],score,opponentScore:opponent,won:score>=opponent});if(score<opponent){won=false;break;}}
 s.seasonHistory??=[];const result={day:s.day,id,stage:stage.name,won,bracket};s.seasonHistory.unshift(result);s.seasonHistory=s.seasonHistory.slice(0,25);
 s.circuitWins??={};if(won){const first=!s.circuitWins[id];s.circuitWins[id]=(s.circuitWins[id]||0)+1;s.tournamentWins[id]=(s.tournamentWins[id]||0)+1;
 s.rep=money(s.rep+base.rep);s.cash=money(s.cash+Math.round(base.firstPrize*(first?1:.35)));grantXP(s,25);advanceStory(s);note(s,`🏆 ${stage.name} champions! Vera’s competition has been defeated. The next bracket opens.`,'league');}
 else{grantXP(s,10);s.rep=money(s.rep+2);note(s,`🎳 ${stage.name}: the team bowed out, but learned from the match. Train and return stronger.`,'league');}
 s.tournamentCooldown[id]=s.day+base.cooldown;return {ok:true,...result};
}
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
 s.employees=[{id:1,name:'Jo',role:'snack',wage:22,skill:2,morale:81,workXP:18,specialty:null},{id:2,name:'Rae',role:'bar',wage:25,skill:2,morale:85,workXP:19,specialty:null},{id:3,name:'Pat',role:'proshop',wage:23,skill:1,morale:80,workXP:6,specialty:null}];s.employeeSerial=3;
 s.story.unlocked=['inheritance','firstlane','offer','established'];s.story.offerDay=17;s.story.pending=[];s.teamStory={mayaIntroduced:true,leoJoined:true,firstFrame:{status:'complete',shots:[8,2],total:10,lastResult:'Gus’s team photo is back on the wall.'}};s.bowlers.push({id:'leo',name:'Leo',aim:22,spare:19,power:24,focus:20,ball:false,confidence:55,loyalty:70,crewReady:false});syncDepartmentRewards(s,true);
 s.rival.pressure=22;s.rival.community=1;s.ownerXP=310;s.ownerPoints=3;s.loan.balance=780;s.loan.payment=150;s.startupPending=false;
 s.today=newDayStats(s.day);s.lastDay=newDayStats(s.day-1);s.dayReports=[];
 if(mode!=='decision'){chooseCampaign(s,mode);if(mode==='backalley'){s.campaignStory.nightOps.entrance=1;s.campaignStory.security=26;advanceBackAlley(s);const t=turfOf(s);t.lookoutUntil=s.day+1;t.tags.snack=s.day+2;}}
 return checkState(s)?s:null;
}
function checkState(s){return !!(s&&s.version===20&&s.cityLeagues&&s.departmentAchievements&&s.teamStory&&s.districts&&Array.isArray(s.staffIssues)&&s.campaignStory&&s.campaignStory.nightOps&&typeof s.campaignStory.nightOps.pitBoss==='boolean'&&Number.isInteger(s.campaignStory.nightOps.tableRounds)&&s.campaignStory.nightOps.tableRounds>=0&&NIGHT_DEFENSES.every(d=>Number.isInteger(s.campaignStory.nightOps[d.id])&&s.campaignStory.nightOps[d.id]>=0&&s.campaignStory.nightOps[d.id]<=3)&&['undecided','legacy','backalley'].includes(s.campaignStory.path)&&s.portfolio&&['home','riverside'].includes(s.portfolio.activeId)&&Array.isArray(s.portfolio.opened)&&s.portfolio.snapshots&&Object.values(s.portfolio.snapshots).every(v=>v.version===20&&!v.portfolio&&v.campaignStory)&&Array.isArray(s.bookings)&&s.roomDetails&&s.vipGroups&&s.rival&&Number.isInteger(s.hardshipUses)&&s.story&&Array.isArray(s.story.unlocked)&&Array.isArray(s.story.pending)&&typeof s.story.charter==='boolean'&&s.patrons&&PATRON_PROFILES.every(p=>s.patrons[p.id]&&Number.isInteger(s.patrons[p.id].visits)&&s.patrons[p.id].loyalty>=0&&s.patrons[p.id].loyalty<=100)&&Number.isInteger(s.laneRotation)&&s.laneRotation>=0&&Number.isInteger(s.storyCursor)&&typeof s.startupPending==='boolean'&&Number.isFinite(s.happiness)&&s.happiness>=0&&s.happiness<=100&&Array.isArray(s.happinessHistory)&&s.loan&&Number.isFinite(s.loan.balance)&&s.loan.balance>=0&&Array.isArray(s.employees)&&Array.isArray(s.deliveries)&&Array.isArray(s.facilityNotices)&&s.facilityNotices.every(x=>['snack','bar','arcade','proshop'].includes(x.id)&&[1,2].includes(x.tier))&&Number.isInteger(s.lowStockThreshold)&&s.lowStockThreshold>=1&&s.lowStockThreshold<=12&&s.hour>=OPEN&&s.hour<=CLOSE&&s.day>=1&&Number.isFinite(s.cash)&&Number.isFinite(s.rep)&&Number.isInteger(s.parts)&&s.parts>=0&&Number.isInteger(s.benches)&&s.benches>=0&&s.benches<=3&&Number.isInteger(s.barStock)&&s.barStock>=0&&Number.isInteger(s.barPrice)&&s.barPrice>=6&&s.barPrice<=14&&Number.isInteger(s.totalServed)&&s.totalServed>=0&&Number.isInteger(s.minVenueLevel)&&s.minVenueLevel>=1&&s.minVenueLevel<=5&&s.barStockById&&DRINKS.every(i=>Number.isInteger(s.barStockById[i.id])&&s.barStockById[i.id]>=0&&Number.isInteger(s.barPrices[i.id]))&&s.arcadeMachines&&s.fixtures&&PAINTS.some(p=>p.id===s.wallPaint)&&s.league&&Array.isArray(s.construction)&&s.construction.every(j=>j.remaining>0&&j.remaining<=j.total&&['lane','upgrade','roomExpand','land'].includes(j.kind))&&Number.isInteger(s.expansionStage)&&s.expansionStage>=0&&s.expansionStage<=5&&s.outages&&s.partnerships&&Array.isArray(s.eventQueue)&&Array.isArray(s.eventHistory)&&Array.isArray(s.encounters)&&Array.isArray(s.lanes)&&s.lanes.length>=0&&s.lanes.length+pendingLanes(s)<=laneCapacity(s)&&s.lanes.every(l=>Number.isInteger(l.id)&&l.condition>=0&&l.condition<=100&&l.kits&&LANE_KITS.every(k=>typeof l.kits[k.id]==='undefined'||l.kits[k.id]===true)&&SCORE_THEMES.some(t=>t.id===l.theme)&&(l.animationUnlocked===undefined||typeof l.animationUnlocked==='boolean'))&&SNACKS.every(i=>Number.isInteger(s.snackStock[i.id])&&s.snackStock[i.id]>=0)&&s.queue.length<=waitCapacity(s)&&ROOM_IDS.every(id=>(!s.roomPlacements[id]||canPlaceRoom(s,id,s.roomPlacements[id].x,s.roomPlacements[id].y)))&&s.bowlers.every(b=>['aim','spare','power','focus'].every(k=>b[k]>=0&&b[k]<=95)));}
// Preserve v0.3 (and older v0.1/0.2) game progress without editing the old save.
function migrate(legacy){
 if(legacy?.version===20)return checkState(legacy)?ensureTurf(ensurePricing(fixRoomSpots(renameHome(compactReports(legacy))))):null;
 if(legacy?.version===19){const s=structuredCloneSafe(legacy);const upgrade=x=>{x.version=20;x.cityLeagues??={};x.story.offerDay??=(x.story.unlocked.includes('offer')?Math.max(1,x.day-7):0);for(const d of DISTRICTS){const old=x.districts[d.id]||{owner:'vera',victories:0};old.sites??=(old.owner==='player'?2:0);x.districts[d.id]=old;}};upgrade(s);for(const x of Object.values(s.portfolio?.snapshots||{}))upgrade(x);s.log=['v1.05: Shared city districts, league seasons and multi-site territory control introduced; previous wins preserved.',...(s.log||[])].slice(0,60);return checkState(s)?s:null;}

 if(legacy?.version===18){const s=structuredCloneSafe(legacy);const upgrade=x=>{x.version=19;x.departmentEquipment??={};x.seasonHistory??=[];x.circuitWins??={};x.staffDepartures??=[];for(const worker of x.employees||[]){worker.warnings??=0;worker.requestedWage??=null;worker.lastWarningDay??=0;}for(const d of DISTRICTS)x.districts[d.id]??={owner:'vera',victories:0};};
 upgrade(s);for(const x of Object.values(s.portfolio?.snapshots||{}))upgrade(x);
 s.log=['v1.04: Districts, league brackets, real department equipment, and staff resignations added. Existing progress preserved.',...(s.log||[])].slice(0,60);
 return checkState(s)?s:null;}

 if(legacy?.version===17){const s=structuredCloneSafe(legacy);const upgradeLocation=x=>{x.version=18;x.departmentAchievements={};x.staffIssues=[];x.lastStaffIssueDay=-100;
 x.teamStory={mayaIntroduced:true,leoJoined:x.bowlers.some(b=>b.id==='leo'),firstFrame:{status:'complete',shots:[],total:0,lastResult:'Existing bowling team preserved.'}};
 x.districts={oldtown:{owner:'vera',victories:0}};x.tactical=null;
 for(const e of x.employees){e.workXP=Math.max(0,STAFF_XP[Math.min(5,e.skill||1)]||0);e.specialty=null;e.lastTalkDay=0;}
 for(const b of x.bowlers){b.confidence??=50;b.loyalty??=60;b.crewReady??=(b.id==='maya');}
 syncDepartmentRewards(x,true);};upgradeLocation(s);for(const loc of Object.values(s.portfolio?.snapshots||{}))upgradeLocation(loc);
 s.log=['v1.03: Department mastery, staff careers, team stories and Back Alley tactics added. Existing progress kept.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===16){const s=structuredCloneSafe(legacy);s.version=17;const defaults=newNightOps();s.campaignStory??=newCampaign();s.campaignStory.nightOps={...defaults,...(s.campaignStory.nightOps||{})};for(const loc of Object.values(s.portfolio?.snapshots||{})){loc.version=17;loc.campaignStory??=newCampaign();loc.campaignStory.nightOps={...defaults,...(loc.campaignStory.nightOps||{})};}return migrate(s);}
 if(legacy?.version===15){const s=structuredCloneSafe(legacy);s.version=16;s.campaignStory??=newCampaign();s.campaignStory.nightOps??=newNightOps();for(const sub of Object.values(s.portfolio?.snapshots||{})){sub.version=16;sub.campaignStory??=newCampaign();sub.campaignStory.nightOps??=newNightOps();}return migrate(s);}
 if(legacy?.version===14){const s={...structuredCloneSafe(legacy),version:15,locationName:'The Back Alley',portfolio:{activeId:'home',opened:[],snapshots:{}},campaignStory:newCampaign()};s.log=['v1.00: Two story campaigns are now available. Your previous alley remains undecided until Vera’s offer.',...(s.log||[])].slice(0,60);return migrate(s);}
 if(legacy?.version===13){const s={...structuredCloneSafe(legacy),version:14,bookings:[],bookingSerial:0,roomDetails:{},vipGroups:Object.fromEntries(VIP_GROUPS.map(g=>[g.id,{visits:0,lastDay:0}])),hardshipUses:0,emergencyCoverageUntil:0,rival:{pressure:0,community:0,protectionUntil:0,lastResponseDay:0},partnerships:{school:!!legacy.partnerships?.school,teams:false,charity:false,office:false,neighbors:false}};s.log=['v0.99: New contracts, VIPs, room details and rivalry added. Old progress kept.',...(s.log||[])].slice(0,60);return migrate(s);}
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
return {CITY_DISTRICTS,legacyDistrictReady,legacyLeague,legacyDistrictFinal,districtStatus,DEPARTMENT_EQUIPMENT,equipmentFor,buyDepartmentEquipment,fireEmployee,LEAGUE_CIRCUIT,runLeagueCircuit,districtUnlocked,DEPARTMENT_REWARDS,departmentBenefit,syncDepartmentRewards,expectedWage,staffTrainingCost,STAFF_XP,STAFF_CAREERS,specializeEmployee,resolveStaffConcern,firstFrame,maybeRecruitLeo,DISTRICTS,crewMembers,recruitCrew,THREAT_TIERS,threatTier,threatIndex,turfOf,veraDrift,veraFloor,veraTaunt,VERA_PLAYS,activeOp,opRepelChance,opTargetName,accordReady,confrontLookout,scrubTag,fighterStats,SKILLS,SKILL_BY_ID,CREW_LOYALTY,crewStatus,patchUp,FOES,DISTRICT_FOES,SITE_NAMES,battlePreview,crewPower,availableFighters,startBattle,battleAct,battleAuto,fleeBattle,closeBattle,currentActor,backAlleyRoomName,ensureTurf,checkCityVictory,veraNight,hirePitBoss,casinoPatronRound,casinoBet,nightPayroll,nightShift,rivalWarning,prepareForRival,buyNightInsurance,NIGHT_DEFENSES,BACK_ALLEY_CHAPTERS,nightProtection,buyNightDefense,emergencyResponse,advanceBackAlley,backAlleyArcadeName,darkMachineName,CAMPAIGN_PATHS,NOIR_ACTIONS,campaignReady,campaignOf,chooseCampaign,campaignAction,campaignMission,rivalAIMove,checkCampaignVictory,openSecondTown,canOpenSecondTown,switchTown,developmentScenario,OPEN,CLOSE,DAYS,calendar,SEASONAL_ARCS,contractCollision,PARTNERSHIP_CATALOG,BOOKING_TYPES,ROOM_DETAILS,VIP_GROUPS,bookContract,negotiatePartnership,buyRoomDetail,hireEmergencyMechanic,buyEmergencyCoverage,paymentPlanRepair,respondToRival,STORY_CHAPTERS,PATRON_PROFILES,PATRON_DIALOGUES,PATRON_SCENES,priceDemand,arcadePrice,attractionFee,shopPrice,setArcadePrice,setAttractionFee,setShopPrice,PRICE_RANGES,SHOP_PRICE_BASE,encounterScene,encounterOptions,respondEncounter,secureSchoolPartnership,repairCost,repairOutage,respondPartyRequest,EVENT_CATALOG,NEW_ATTRACTIONS,expansionStage,roomRows,nextExpansionCost,activeOutage,incidentCooldownRemaining,trafficMultiplier,DEPARTMENTS,departmentRatings,patronStatus,talkToPatron,advanceStory,LANE_KITS,SCORE_THEMES,STAR_THRESHOLDS,alleyScore,alleyStars,upgradeLane,bulkLaneCost,upgradeAllLanes,setLaneTheme,SPECIALTIES,STARTER_STYLES,chooseStartup,chooseSpecialty,specialtyOf,buyLand,laneCapacity,rushCost,rushConstruction,EMPLOYEE_ROLES,neededStaff,countStaff,staffed,hireEmployee,setWage,trainEmployee,setStockThreshold,incoming,processDeliveries,DRINKS,MACHINES,FIXTURES,PAINTS,LEVELS,nextLevelGoals,drinkUnlocked,restockDrink,setDrinkPrice,machineUnlocked,buyMachine,buyFixture,paintWall,startLeague,MAX_LANES,ROOM_COLS,ROOM_ROWS,ROOM_IDS,FIXED_SPOTS,footprint,canPlaceRoom,findRoomPlacement,moveRoom,expandRoom,expansionCost,startNextDay,UPGRADES,CAMPAIGNS,SNACKS,TOURNAMENTS,PLAYER_SKILLS,newGame,migrate,formatHour,lanes,pendingLanes,nextLaneCost,benchCost,waitCapacity,activeCampaign,venueLevel,venueName,avg,teamAvg,getUpgrade,isBuilding,canBuild,build,buyLane,buyBench,advertise,restockBar,setBarPrice,snackUnlocked,restockSnack,buyParts,serviceLane,setPrice,setSnackPrice,tickHour,runDay,spendOwnerPoint,trainCost,train,fitBall,recruit,eligibility,tournament,bowlShot,checkState};
});
