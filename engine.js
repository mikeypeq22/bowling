/* From Gutter to Glory v0.95 — deterministic simulation; no UI dependencies. */
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
const MAX_LANES=10;
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
function laneCapacity(s){return s.landOwned?10:6;}
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
 log(s,`Leased an empty bowling building, selected ${look.name} and a $${principal} town microloan. Available funds: $${s.cash}.`);
 note(s,`The empty bowling center is yours. Pick a lane or facility to build and make it your own!`,'build');return {ok:true};
}
function buyLand(s){
 if(s.landOwned||s.construction.some(j=>j.kind==='land'))return {ok:false,reason:'The neighboring lot is already yours or being purchased'};
 if(lanes(s)+pendingLanes(s)<6)return {ok:false,reason:'Fill your first six lane spaces before buying more land'};
 const cost=3600;if(!spend(s,cost))return {ok:false,reason:'The neighboring lot costs $3,600'};
 recordCharge(s,'capex',cost);s.construction.push({kind:'land',id:'land',title:'Neighboring Lot (+4 lane slots)',remaining:4,total:4,startDay:s.day});log(s,'Purchased the neighboring lot. Four days until four more lane spaces open.');return {ok:true,days:4};
}
function rushCost(job){return Math.round(55+job.remaining*75);}
function rushConstruction(s,kind,id){
 if(s.hour!==CLOSE)return {ok:false,reason:'Construction rushes are only available at the closing report'};
 const job=s.construction.find(j=>j.kind===kind&&j.id===id);if(!job)return {ok:false,reason:'That project is no longer under construction'};
 const cost=rushCost(job);if(!spend(s,cost))return {ok:false,reason:'Not enough cash for the overnight crew'};
 recordCharge(s,'capex',cost);job.remaining=1;finishSingleConstruction(s,job);s.construction=s.construction.filter(x=>x!==job);
 log(s,`Paid $${cost} to rush ${job.title} overnight!`);return {ok:true,cost};
}

const ROOM_COLS=5,ROOM_ROWS=2,ROOM_IDS=['snack','bar','proshop','arcade'];
const UPGRADES=[
 {id:'roof',title:'Covered Building',cost:175,days:2,requires:[],desc:'Already part of every new starter property.',icon:'🏠'},
 {id:'snack',title:'Snack Counter',cost:235,days:2,requires:[],desc:'Sell soda, popcorn, hot dogs and more as your alley levels up.',icon:'🍿'},
 {id:'bar',title:'Bowling Bar',cost:410,days:3,requires:[],desc:'A drinks counter adds a second refreshment business.',icon:'🍹'},
 {id:'arcade',title:'Mini Arcade',cost:680,days:3,requires:[],desc:'Earn extra money from guests and groups waiting for lanes.',icon:'🕹️'},
 {id:'staff',title:'Hire Lane Technician',cost:510,days:1,requires:['roof'],desc:'Automatically services worn lanes and buys spare parts as needed. Costs $16/day plus repair supplies.',icon:'🔧'},
 {id:'proshop',title:'Pro Shop',cost:1250,days:3,requires:[],desc:'Fit bowling balls and earn equipment income from guests.',icon:'🛍️'},
 {id:'coaching',title:'Coaching Corner',cost:1400,days:3,requires:['proshop'],desc:'Train your bowlers more efficiently.',icon:'📋'},
 {id:'lights',title:'Cosmic Bowling',cost:1350,days:3,requires:['arcade'],desc:'Brighten late afternoons with glowing lanes and extra interest.',icon:'✨'},
 {id:'automation',title:'Stockroom Shelves',cost:360,days:1,requires:[],desc:'A tidy place for incoming deliveries. Hire a Stock Clerk in Staff to order automatically.',icon:'📦'}
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
 {id:'national',title:'National Invitational',needAvg:207,needRep:80,need:['lights'],fee:800,firstPrize:5300,rival:211,rep:35,cooldown:10}
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
// Alley Stars measure the physical experience: spaces, fittings, and improved lanes.
// They are separate from guest happiness and reputation. All points are permanent investments.
const STAR_THRESHOLDS=[0,2,10,20,34,50];
const LANE_KITS=[
 {id:'wood',name:'Hardwood Lane Surface',icon:'🪵',cost:245,score:3,desc:'Sealed hardwood resists wear: roughly 40% less deterioration per game.'},
 {id:'return',name:'Smooth Ball Return',icon:'🎳',cost:185,score:2,desc:'Quieter, faster return. More guests leave smiling.'},
 {id:'scoring',name:'Digital Scoring Console',icon:'🖥️',cost:315,score:3,desc:'Interactive scoring and new screen animations. Boosts alley appeal.'}
];
const SCORE_THEMES=[
 {id:'classic',name:'Classic Pins',icon:'🎳',score:0},
 {id:'comic',name:'Comic Chaos',icon:'💥',score:1},
 {id:'cosmic',name:'Cosmic Party',icon:'🚀',score:1},
 {id:'retro',name:'Retro Pixels',icon:'👾',score:1}
];
function laneKit(l,id){return !!l?.kits?.[id];}
function alleyScore(s){
 const lanePoints=s.lanes.reduce((n,l)=>n+2+(laneKit(l,'wood')?3:0)+(laneKit(l,'return')?2:0)+(laneKit(l,'scoring')?3:0)+(laneKit(l,'scoring')&&l.animationUnlocked?1:0),0);
 const rooms=['snack','bar','arcade','proshop'].reduce((n,id)=>n+(s.built[id]?4+(s.roomTiers?.[id]===2?3:0):0),0);
 const fixtures=FIXTURES.reduce((n,f)=>n+(s.fixtures[f.id]?2:0),0);
 const machines=Math.max(0,Object.values(s.arcadeMachines||{}).filter(Boolean).length-1)*2;
 const utility=['coaching','lights','staff','automation'].reduce((n,id)=>n+(s.built[id]?2:0),0);
 return lanePoints+rooms+fixtures+machines+utility+(s.wallPaint!=='original'?2:0)+s.benches;
}
function alleyStars(s){const score=alleyScore(s);let stars=0;for(let i=1;i<STAR_THRESHOLDS.length;i++)if(score>=STAR_THRESHOLDS[i])stars=i;return stars;}
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
 {label:`Alley Stars: ${p.stars}/${star} (appeal ${p.score}/${STAR_THRESHOLDS[star]} points)`,done:p.stars>=star},
 {label:`${p.lanes}/${laneGoal} open lanes`,done:p.lanes>=laneGoal},
 {label:`${Math.min(p.served,servedGoal)}/${servedGoal} groups bowled`,done:p.served>=servedGoal},
 {label:`${p.rep}/${repGoal} reputation`,done:p.rep>=repGoal}
 ];}
function upgradeLane(s,id,kit){const l=s.lanes.find(x=>x.id===Number(id)),u=LANE_KITS.find(x=>x.id===kit);
 if(!l||!u)return {ok:false,reason:'Choose a built lane and valid equipment'};
 l.kits??={};if(l.kits[kit])return {ok:false,reason:'Equipment already installed'};
 if(!spend(s,u.cost))return {ok:false,reason:'Not enough money for this lane upgrade'};
 l.kits[kit]=true;recordCharge(s,'capex',u.cost);note(s,`Lane ${l.id} got ${u.name}! +${u.score} alley appeal.`,'build');log(s,`Upgraded lane ${l.id}: ${u.name}.`);return {ok:true};}
function setLaneTheme(s,id,theme){const l=s.lanes.find(x=>x.id===Number(id)),t=SCORE_THEMES.find(x=>x.id===theme);
 if(!l||!t)return {ok:false,reason:'Unknown lane or scoring animation'};
 if(!laneKit(l,'scoring'))return {ok:false,reason:'Install Digital Scoring first'};
 l.theme=theme;if(theme!=='classic')l.animationUnlocked=true;note(s,`Lane ${l.id} now shows ${t.name} animations.`,'build');return {ok:true};}
function avg(b){return Math.round(clamp(60+b.aim*.75+b.spare*.55+b.power*.35+b.focus*.25+(b.ball?12:0),50,260));}
function teamAvg(s){const b=[...s.bowlers].sort((a,b)=>avg(b)-avg(a)).slice(0,2);return Math.round(b.reduce((n,x)=>n+avg(x),0)/b.length);}
function getUpgrade(id){return UPGRADES.find(x=>x.id===id);}
function footprint(s,id){return s.roomTiers?.[id]===2||s.construction.some(j=>j.kind==='roomExpand'&&j.id===id)?2:1;}
function canPlaceRoom(s,id,x,y,size=footprint(s,id)){
 if(!ROOM_IDS.includes(id)||!Number.isInteger(x)||!Number.isInteger(y)||x<0||x+size>ROOM_COLS||y<0||y>=ROOM_ROWS)return false;
 for(const [other,pos] of Object.entries(s.roomPlacements||{})){
  if(other===id||!ROOM_IDS.includes(other))continue;
  if(pos.y===y && x<pos.x+footprint(s,other) && x+size>pos.x)return false;
 }
 return true;
}
function findRoomPlacement(s,id,size=1){const preferred={snack:[0,0],bar:[2,0],proshop:[0,1],arcade:[2,1]},[px,py]=preferred[id]||[0,0];
 if(canPlaceRoom(s,id,px,py,size))return {x:px,y:py};
 for(let y=0;y<ROOM_ROWS;y++)for(let x=0;x+size<=ROOM_COLS;x++)if(canPlaceRoom(s,id,x,y,size))return {x,y};return null;
}
function ensureRoom(s,id){if(!ROOM_IDS.includes(id)||s.roomPlacements[id])return true;const pos=findRoomPlacement(s,id);if(!pos)return false;s.roomPlacements[id]=pos;return true;}
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
function newDayStats(day){return {satisfied:0,unhappy:0,happinessDelta:0,loanPayment:0,techServices:0,techPartsBought:0,techExpenses:0,laneHours:0,day,week:calendar(day).week,weekday:calendar(day).weekday,arcadePlays:0,leagueIncome:0,leagueHeld:false,leagueHours:0,arrivals:0,served:0,left:0,waited:0,benchSaves:0,spentOnSnacks:0,snackOrders:0,snackMisses:0,barOrders:0,barMisses:0,walkIns:0,staffPay:0,laneIncome:0,shoeIncome:0,snackIncome:0,barIncome:0,otherIncome:0,marketingSpend:0,capex:0,expenses:0,income:0,net:0,groups:[],feedback:[],events:[]};}
function newGame(seed=271828){return {version:11,seed:seed>>>0,laneRotation:0,storyCursor:0,day:1,hour:OPEN,cash:600,startupPending:true,startupFinance:null,starterStyle:null,loan:{balance:0,payment:0,initial:0,lastPaymentDay:0},happiness:65,happinessHistory:[],specialty:null,landOwned:false,earned:0,rep:0,totalServed:0,minVenueLevel:1,
 built:{roof:true},lanes:[],parts:4,benches:0,construction:[],facilityNotices:[],campaign:null,barStock:0,barPrice:9,barVisits:0,barStockById:Object.fromEntries(DRINKS.map(i=>[i.id,0])),barPrices:Object.fromEntries(DRINKS.map(i=>[i.id,i.price])),arcadeVisits:0,arcadeMachines:{},fixtures:{},wallPaint:'original',league:{active:false,season:0,sessions:0,totalRevenue:0,lastDay:0},nextDayCharges:{capex:0,marketingSpend:0},
 roomPlacements:{},roomTiers:{},roomVisits:{snack:0,bar:0,arcade:0,proshop:0},snackStock:{soda:0,popcorn:0,hotdog:0,pizza:0,nachos:0,pretzel:0,icecream:0,fries:0,burger:0,cheeseburger:0},snackPrices:Object.fromEntries(SNACKS.map(x=>[x.id,x.price])),
 pricing:{lane:18,shoes:3},deliveries:[],lowStockThreshold:3,employees:[],employeeSerial:0,partyCounter:0,queue:[],active:[],sceneGroups:[],
 today:newDayStats(1),lastDay:newDayStats(0),dayReports:[],latestEvents:[],
 ownerXP:0,ownerPoints:0,ownerSkills:{manager:0,coach:0,promoter:0},practiceLeft:3,practiceStreak:0,
 bowlers:[{id:'maya',name:'Maya',focus:22,aim:24,spare:22,power:20,ball:false},{id:'leo',name:'Leo',focus:20,aim:22,spare:19,power:24,ball:false}],
 tournamentWins:{},tournamentCooldown:{},log:['Day 1 · The keys to an empty bowling building are yours. Choose your loan, paint the walls, then build your first lane!']};}
function log(s,text){s.log.unshift(`Day ${s.day} · ${text}`);s.log=s.log.slice(0,60);}
function note(s,text,type='visit',partyId=null){const e={hour:s.hour,minute:0,text,type,partyId};s.today.events.push(e);s.latestEvents.push(e);s.latestEvents=s.latestEvents.slice(-30);}
function spend(s,amount){if(s.cash<amount)return false;s.cash=money(s.cash-amount);return true;}
function grantXP(s,n){const before=Math.floor(s.ownerXP/60);s.ownerXP+=n;s.ownerPoints+=Math.floor(s.ownerXP/60)-before;}
function isBuilding(s,id){return s.construction.some(j=>j.kind==='upgrade'&&j.id===id);}
function recordCharge(s,kind,value){if(s.hour===CLOSE)s.nextDayCharges[kind]+=value;else{s.today[kind]+=value;if(kind==='marketingSpend'){s.today.expenses+=value;s.today.net=money(s.today.income-s.today.expenses);}}}
function canBuild(s,id){const u=getUpgrade(id);return !!u&&!isBuilt(s,id)&&!isBuilding(s,id)&&u.requires.every(x=>isBuilt(s,x))&&s.cash>=u.cost&&(!ROOM_IDS.includes(id)||!!s.roomPlacements[id]||!!findRoomPlacement(s,id));}
function build(s,id){const u=getUpgrade(id);if(!u)return {ok:false,reason:'Unknown improvement'};
 if(isBuilt(s,id))return {ok:false,reason:'Already built'};if(isBuilding(s,id))return {ok:false,reason:'Already under construction'};
 if(!u.requires.every(x=>isBuilt(s,x)))return {ok:false,reason:'Finish the required room first'};
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
 else if(j.kind==='land'){s.landOwned=true;s.rep+=5;note(s,'The adjoining lot is open! Four more lane positions are now available.','build');}
 else if(j.kind==='roomExpand'){s.roomTiers[j.id]=2;s.rep+=3;if(j.id==='snack'){s.snackStock.pretzel+=8;s.snackStock.icecream+=8;}if(j.id==='bar'){s.barStockById.cider+=5;s.barStock+=5;}note(s,`${j.title} now offers more variety and room for customers.`,'build');}
 else{s.built[j.id]=true;if(j.id==='snack'){s.snackStock.soda+=8;s.snackStock.popcorn+=6;s.snackStock.fries+=5;}if(j.id==='bar'){s.barStockById.beer+=8;s.barStockById.wine+=6;s.barStock=14;}if(j.id==='arcade')s.arcadeMachines.pinball=true;s.rep+=j.id==='roof'?4:3;}
 if((j.kind==='upgrade'&&['snack','bar','arcade','proshop'].includes(j.id))||(j.kind==='roomExpand'&&['snack','bar','arcade','proshop'].includes(j.id))){
  s.facilityNotices??=[];s.facilityNotices.push({id:j.id,tier:j.kind==='roomExpand'?2:1,title:j.title,day:s.day});
 }
 grantXP(s,12);note(s,`Construction complete: ${j.title}! Available next morning.`,'build');log(s,`Completed ${j.title}.`);
}
function finishConstruction(s){const left=[];for(const j of s.construction){j.remaining--;if(j.remaining>0)left.push(j);else finishSingleConstruction(s,j);}s.construction=left;}
const EMPLOYEE_ROLES={snack:{name:'Snack Counter',fee:48,wage:12},bar:{name:'Bowling Bar',fee:58,wage:14},proshop:{name:'Pro Shop',fee:68,wage:15},stocker:{name:'Stock Clerk',fee:100,wage:16}};
const EMPLOYEE_NAMES=['Jo','Rae','Pat','Dani','Max','Kit','Sky','Bev','Toni','Jules','Frankie','Nico'];
function neededStaff(s,role){if(role==='stocker')return 1;if(!isBuilt(s,role))return 0;return s.roomTiers[role]===2?2:1;}
function countStaff(s,role){return (s.employees||[]).filter(e=>e.role===role).length;}
function staffed(s,role){return countStaff(s,role)>=neededStaff(s,role)&&neededStaff(s,role)>0;}
function hireEmployee(s,role){const r=EMPLOYEE_ROLES[role];if(!r)return {ok:false,reason:'Unknown position'};
 if(role==='stocker'&&!isBuilt(s,'snack')&&!isBuilt(s,'bar'))return {ok:false,reason:'Open a snack counter or bar first'};
 if(role!=='stocker'&&!isBuilt(s,role))return {ok:false,reason:'Build that facility first'};
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
function startLeague(s){if(lanes(s)<6)return {ok:false,reason:'Build all six lanes first'};if(s.league.active)return {ok:false,reason:'Weekly league is already active'};if(!spend(s,200))return {ok:false,reason:'League registration and promotion costs $200'};s.league.active=true;s.league.season++;s.league.sessions=0;s.league.lastDay=0;recordCharge(s,'capex',200);note(s,'Thursday Night League registrations opened! All six lanes are reserved Thursday 6–8 PM.','league');return {ok:true};}
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
function newParty(s){s.partyCounter++;return {id:s.partyCounter,name:GUEST_NAMES[Math.floor(roll(s)*GUEST_NAMES.length)],size:2+Math.floor(roll(s)*3),waited:0};}
function walkIn(s){const choices=[];if(staffed(s,'snack'))choices.push('snack');if(staffed(s,'bar'))choices.push('bar');if(isBuilt(s,'arcade'))choices.push('arcade');if(staffed(s,'proshop'))choices.push('shop');
 if(!choices.length)return;
 const p=newParty(s),dest=choices[Math.floor(roll(s)*choices.length)];s.today.arrivals++;s.today.walkIns++;
 note(s,`${groupText(p)} popped in just for ${dest==='snack'?'a bite':dest==='bar'?'a drink':dest==='arcade'?'the arcade':'some gear'} — no bowling tonight.`,'arrival',p.id);
 if(dest==='snack')maybeSnack(s,p,'walkin');else if(dest==='bar')maybeBar(s,p,'walkin');else if(dest==='arcade')maybeArcade(s,p);
 else {addIncome(s,'otherIncome',12);s.roomVisits.proshop++;note(s,`${groupText(p)} bought pro-shop supplies (+$12).`,'shop',p.id);}
}
function groupText(p){return `${p.name}'s group (${p.size})`;}
// Expected bowling groups per hour, not a near-guaranteed arrival on each of three rolls.
// Early days are quiet; demand grows with track record, investment and promotion.
function chanceOfArrival(s){
 const n=lanes(s),openRooms=['snack','bar','arcade','proshop'].filter(id=>s.built[id]).length;
 const reputation=Math.min(.70,Math.max(0,s.rep)/100*.70);
 const regulars=Math.min(.46,(s.totalServed||0)/110*.46);
 const capacity=Math.max(0,n-1)*.17;
 const investments=GUEST_TRAFFIC_BONUS(s,openRooms);
 const marketing=(activeCampaign(s)?.boost||0)*2.2;
 const specialty=s.specialty==='community'?.15:s.specialty==='family'?.12:.06;
 const pricePenalty=Math.max(-.18,((s.pricing.lane-18)/18)*.38+((s.pricing.shoes-3)/3)*.13);
 return clamp(.24+reputation+regulars+capacity+investments+marketing+specialty-pricePenalty,.06,4.25);
}
function GUEST_TRAFFIC_BONUS(s,openRooms){return openRooms*.10+Math.max(0,alleyStars(s)-1)*.12+(isBuilt(s,'lights')?.18:0)+s.ownerSkills.promoter*.16+(s.fixtures.neon?.06:0);}
function addIncome(s,category,amount){s.today[category]+=amount;s.today.income+=amount;s.cash=money(s.cash+amount);s.earned+=amount;}
function serviceFactor(s,role){const team=s.employees.filter(e=>e.role===role);if(!team.length)return .7;let happiness=team.reduce((n,e)=>n+e.morale,0)/team.length,skill=team.reduce((n,e)=>n+e.skill,0)/team.length;return clamp(.75+skill*.075+(happiness-70)/330,.55,1.12);}
function maybeSnack(s,p,reason){if(!isBuilt(s,'snack')){if(roll(s)<.34)s.today.snackMisses++;return;}if(!staffed(s,'snack')){if(roll(s)<.25)note(s,`${groupText(p)} found the snack counter closed. The popcorn apparently doesn't sell itself.`,'feedback',p.id);return;}
 if(roll(s)>(reason==='wait'?.33:reason==='walkin'?.88:.52)*serviceFactor(s,'snack'))return;
 const eligible=SNACKS.filter(i=>snackUnlocked(s,i.id));if(!eligible.length)return;
 const item=eligible[Math.floor(roll(s)*eligible.length)];if(s.snackStock[item.id]<=0){s.today.snackMisses++;note(s,`${groupText(p)} wanted ${item.name.toLowerCase()}, but it was sold out.`,'feedback',p.id);return;}
 s.snackStock[item.id]--;const price=s.snackPrices[item.id];addIncome(s,'snackIncome',price);s.today.snackOrders++;s.today.spentOnSnacks+=price;
 note(s,`${groupText(p)} bought ${item.name.toLowerCase()} (+$${price}).`,'snack',p.id);s.roomVisits.snack++;
}
function maybeBar(s,p,reason){if(!isBuilt(s,'bar')||!staffed(s,'bar')||roll(s)>((reason==='wait'?.26:reason==='walkin'?.88:.39)+(s.roomTiers.bar===2?.12:0))*serviceFactor(s,'bar'))return;
 const unlocked=DRINKS.filter(i=>drinkUnlocked(s,i.id));if(!unlocked.length)return;
 const stocked=unlocked.filter(i=>s.barStockById[i.id]>0);if(!stocked.length){s.today.barMisses++;note(s,`${groupText(p)} found the bar out of drinks.`,'feedback',p.id);return;}
 const drink=stocked[Math.floor(roll(s)*stocked.length)];s.barStockById[drink.id]--;s.barStock=Math.max(0,s.barStock-1);const price=s.barPrices[drink.id];addIncome(s,'barIncome',price+(s.specialty==='lounge'?2:0));s.today.barOrders++;s.barVisits++;s.roomVisits.bar++;
 note(s,`${groupText(p)} ordered ${drink.name.toLowerCase()} at the bar (+$${price}).`,'bar',p.id);}
function maybeArcade(s,p){if(!isBuilt(s,'arcade')||roll(s)>.88)return;const owned=MACHINES.filter(i=>s.arcadeMachines[i.id]);if(!owned.length)return;
 const machine=owned[Math.floor(roll(s)*owned.length)];addIncome(s,'otherIncome',machine.fee);s.today.arcadePlays++;s.arcadeVisits++;s.roomVisits.arcade++;note(s,`${groupText(p)} played ${machine.name} (+$${machine.fee}).`,'arcade',p.id);}
function serve(s,p,free){
 // Rotate lane assignments so even quieter alleys use lanes 4, 5 and 6.
 const rotation=s.laneRotation||0;const pick=free.findIndex(l=>l.id>rotation);const lane=free.splice(pick>=0?pick:0,1)[0];
 s.laneRotation=lane.id;
 const rollDuration=roll(s);const desiredHours=rollDuration<.34?1:rollDuration<.77?2:3;
 const hours=Math.min(desiredHours,CLOSE-s.hour);
 const fare=s.pricing.lane,shoe=s.pricing.shoes*p.size;addIncome(s,'laneIncome',fare);s.today.laneHours++;addIncome(s,'shoeIncome',shoe);
 if(laneKit(lane,'return')){s.today.happyReturns=(s.today.happyReturns||0)+1;}
 s.active.push({party:p,laneId:lane.id,ends:s.hour+hours,hours});s.today.served++;s.totalServed++;s.today.groups.push({id:p.id,name:p.name,size:p.size,lane:lane.id,waited:p.waited,hours});
 note(s,`${groupText(p)} checked in${p.waited?' after waiting '+p.waited+' hr':''}; booked lane ${lane.id} for ${hours} hour${hours===1?'':'s'}.`,'bowling',p.id);
 if(p.waited)s.today.waited++;maybeSnack(s,p,'start');maybeBar(s,p,'start');maybeArcade(s,p);if(s.fixtures.lockers&&roll(s)<.35)addIncome(s,'otherIncome',4);
}
const ALLEY_GOSSIP=[
 'My bowling ball has better social skills than I do.','That strike was brought to you by blind luck.','Who put the gutter there? I was AIMING for that.','My split has its own zip code.','I bowl better when nobody is watching. So, never.','Can we order confidence by the pitcher?','I promised myself I would not celebrate a seven. Here we are.','The pins moved. I have witnesses.','That was a practice throw. Every throw is a practice throw.','I think my rental shoes are judging me.','Call the pro shop: I need a new personality.','If bowling were easy, my uncle would still find a way to complain.','My lucky socks filed for unemployment.','Bowling is 10% skill and 90% pointing at the pins.','We are technically a professional team in our own group chat.','The snack counter deserves a trophy.','My bowling name is The Spare Apparent.','I would like to challenge the pinsetter to a rematch.','I threw a curve ball. The ball did not get the memo.','Do the pins accept apologies?','That ball took the scenic route.','Who turned up gravity on this lane?','I got ten! Across three frames!','My strategy is to intimidate the ball.','We should rename this lane Emotional Damage.','I have bowled worse, but only on television.','Let the record show: the lane started it.','My ball wants a transfer to another team.','That was supposed to be a trick shot.','Is it too late to switch to darts?','Someone please turn on the strike magnet.','My high score is classified information.','I think the ball just unfollowed me.','The tenth frame has betrayed my entire family.','The secret is a dramatic follow-through. The result is optional.','I can hear the gutter laughing at me.','A three-hour bowling session counts as cardio, right?','My bowling coach is a YouTube comment.','I call that one the accidental masterpiece.','The pins are unionizing against me.'
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
 if(t.arrivals>=5&&!s.fixtures.restrooms&&s.day>=8)complaints.push('Guests would appreciate proper restrooms');
 if(t.arrivals>=5&&!s.fixtures.ballracks&&s.day>=12)complaints.push('A better selection of house balls would help guests');
 if(t.arcadePlays>0)complaints.unshift(`${t.arcadePlays} arcade games played today`);
 t.feedback=complaints;
 if(t.served>0)s.rep=money(s.rep+Math.min(2,t.served*.19)+(s.fixtures.restrooms?.2:0)+(s.fixtures.ballracks?.12:0)+(s.specialty==='community'?.12:0));
 if(s.day>4&&t.left>t.served+2)s.rep=Math.max(0,money(s.rep-.35));
 if(s.league.active&&t.leagueHours===2&&calendar(s.day).dayIndex===3&&s.league.lastDay!==s.day){
  const quality=s.lanes.reduce((n,l)=>n+l.condition,0)/s.lanes.length;const payout=Math.round((125+s.rep*.35+quality*.22+roll(s)*45)*(s.specialty==='sport'?1.2:1));
  addIncome(s,'leagueIncome',payout);s.league.totalRevenue+=payout;s.league.sessions++;s.league.lastDay=s.day;t.leagueHeld=true;s.rep=money(s.rep+2.5);grantXP(s,14);
  note(s,`Thursday League night! ${s.league.sessions} weekly session(s) hosted, +$${payout} in fees and refreshments.`,'league');
 }
 if(t.left>0)complaints.push('Overheard outside: “'+quote(s,WAIT_COMPLAINTS)+'”');
 if(!isBuilt(s,'snack')&&t.arrivals>0&&s.lanes.length>0)complaints.push(['"Not even a bag of chips? Bold business strategy."','"I expected strikes, not a hunger strike."','"Do the pins come with a side of fries?"'][s.day%3]);
 if(t.served>0&&t.left===0)complaints.push('Overheard on the lanes: “'+quote(s,ALLEY_GOSSIP)+'”');
 // Count each primary bowling visit once; shortages add a small, bounded penalty.
 t.satisfied=t.served;t.unhappy=t.left;
 const score=clamp(3*t.satisfied-2*t.unhappy-Math.min(5,(t.snackMisses||0)+(t.barMisses||0))+Math.min(5,t.happyReturns||0),-12,15);
 const target=clamp(65+score*2+(s.specialty==='family'&&s.fixtures.wallart?4:0),0,100);
 const oldH=s.happiness;s.happiness=clamp(Math.round(.82*s.happiness+.18*target),0,100);t.happinessDelta=s.happiness-oldH;t.happiness=s.happiness;
 s.happinessHistory.push({day:s.day,value:s.happiness});s.happinessHistory=s.happinessHistory.slice(-35);
 if(s.loan.balance>0&&calendar(s.day).dayIndex===6&&s.loan.lastPaymentDay!==s.day){
  const due=Math.min(s.loan.balance,s.loan.payment);if(s.cash>=due){s.cash=money(s.cash-due);s.loan.balance=money(s.loan.balance-due);t.loanPayment=due;t.expenses=money(t.expenses+due);s.loan.lastPaymentDay=s.day;log(s,`Paid $${due} toward the startup loan.`);}
  else complaints.push('The town loan payment was deferred until you have enough cash.');
 }
 payStaff(s);technicianShift(s);finishConstruction(s);restockAuto(s);t.net=money(t.income-t.expenses);
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
 const leagueEvening=s.league.active&&calendar(s.day).dayIndex===3&&h>=18&&h<20;if(leagueEvening){s.today.leagueHours++;note(s,'Thursday league has commandeered ALL SIX lanes until 8 PM. Walk-ins may need to wait.','league');}
 const free=s.lanes.filter(l=>l.condition>20&&(!leagueEvening||l.id>6)&&!s.active.some(x=>x.laneId===l.id)); // league reserves the original six lanes, even after land expansion
 for(const [i,p] of s.queue.entries()){p.waited++;p.seated=i<s.benches*2;if(p.waited===2&&(p.seated||s.fixtures.tv)){s.today.benchSaves++;note(s,`${groupText(p)} is comfortable on the waiting bench and decided to stay.`,'bench',p.id);}}
 const stillWaiting=[];
 for(const p of s.queue){if(p.waited>=((p.seated||s.fixtures.tv||s.specialty==='community')?4:2)){s.today.left++;note(s,`${groupText(p)} stormed out: “${quote(s,WAIT_COMPLAINTS)}”`,'left',p.id);}else stillWaiting.push(p);}
 s.queue=stillWaiting;
 while(free.length&&s.queue.length)serve(s,s.queue.shift(),free);
 // No bowling traffic before the FIRST lane opens; shop-only customers may still visit.
 // A building without lanes is a quiet pre-opening construction site, not a queue disaster.
 // Three opportunities for group arrivals within an hour once lanes are usable.
 const demand=s.lanes.length?chanceOfArrival(s):0;
 let arrivals=0;
 for(let i=0;i<5;i++)if(roll(s)<Math.min(.85,demand/5))arrivals++;
 for(let i=0;i<arrivals;i++){
   const p=newParty(s);s.today.arrivals++;note(s,`${groupText(p)} arrived at the front desk.`,'arrival',p.id);
   if(roll(s)<.26)note(s,`Overheard from ${p.name}: “${quote(s,ALLEY_GOSSIP)}”`,'feedback',p.id);
   if(free.length)serve(s,p,free);
   else if(s.queue.length<waitCapacity(s)){p.seated=s.queue.length<s.benches*2;s.queue.push(p);maybeSnack(s,p,'wait');maybeBar(s,p,'wait');maybeArcade(s,p);note(s,`${groupText(p)} is ${p.seated?'seated on a bench':'waiting'} for a lane.`,'waiting',p.id);}
   else{s.today.left++;note(s,`${groupText(p)} stomped out: “${quote(s,WAIT_COMPLAINTS)}”`,'left',p.id);}
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
   for(const x of s.active){note(s,`${groupText(x.party)} finished their ${x.hours||1}-hour booking on lane ${x.laneId} at closing.`,'exit',x.party.id);maybeSnack(s,x.party,'exit');maybeBar(s,x.party,'exit');}
   for(const x of s.queue){s.today.left++;note(s,`${groupText(x)} left grumbling: "I've spent the whole night watching other people bowl."`,'left',x.id);}
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
 s.cash+=payout;s.rep+=won?t.rep:3;grantXP(s,won?24:11);if(won)s.tournamentWins[t.id]=(s.tournamentWins[t.id]||0)+1;s.tournamentCooldown[t.id]=s.day+t.cooldown;log(s,`${t.title}: ${won?'CHAMPIONS!':'Keep practicing!'} ${score}–${rival}.`);return {ok:true,won,score,rival,payout,tournament:t.title};}
function bowlShot(s,angle,spin,power){if(!s.lanes.length)return {ok:false,reason:'Build your first lane before practicing'};if(s.practiceLeft<=0)return {ok:false,reason:'Practice resets tomorrow'};angle=Number(angle);spin=Number(spin);power=Number(power);if(![angle,spin,power].every(Number.isFinite))return {ok:false,reason:'Invalid shot'};
 angle=clamp(angle,-10,10);spin=clamp(spin,-5,5);power=clamp(power,60,100);const condition=s.lanes[0].condition;const sweet=(100-condition)/28;const down=clamp(Math.round(10-Math.abs(angle+spin*.5-sweet)*1.35-(100-power)/29+(roll(s)-.5)*2.2),0,10);
 s.practiceLeft--;grantXP(s,down===10?5:2);s.practiceStreak=down===10?s.practiceStreak+1:0;log(s,`Practice: ${down===10?'STRIKE!':down+' pins'}.`);return {ok:true,down,result:down===10?'STRIKE!':down+' pins down'};}
function checkState(s){return !!(s&&s.version===11&&Number.isInteger(s.laneRotation)&&s.laneRotation>=0&&Number.isInteger(s.storyCursor)&&typeof s.startupPending==='boolean'&&Number.isFinite(s.happiness)&&s.happiness>=0&&s.happiness<=100&&Array.isArray(s.happinessHistory)&&s.loan&&Number.isFinite(s.loan.balance)&&s.loan.balance>=0&&Array.isArray(s.employees)&&Array.isArray(s.deliveries)&&Array.isArray(s.facilityNotices)&&s.facilityNotices.every(x=>['snack','bar','arcade','proshop'].includes(x.id)&&[1,2].includes(x.tier))&&Number.isInteger(s.lowStockThreshold)&&s.lowStockThreshold>=1&&s.lowStockThreshold<=12&&s.hour>=OPEN&&s.hour<=CLOSE&&s.day>=1&&Number.isFinite(s.cash)&&Number.isFinite(s.rep)&&Number.isInteger(s.parts)&&s.parts>=0&&Number.isInteger(s.benches)&&s.benches>=0&&s.benches<=3&&Number.isInteger(s.barStock)&&s.barStock>=0&&Number.isInteger(s.barPrice)&&s.barPrice>=6&&s.barPrice<=14&&Number.isInteger(s.totalServed)&&s.totalServed>=0&&Number.isInteger(s.minVenueLevel)&&s.minVenueLevel>=1&&s.minVenueLevel<=5&&s.barStockById&&DRINKS.every(i=>Number.isInteger(s.barStockById[i.id])&&s.barStockById[i.id]>=0&&Number.isInteger(s.barPrices[i.id]))&&s.arcadeMachines&&s.fixtures&&PAINTS.some(p=>p.id===s.wallPaint)&&s.league&&Array.isArray(s.construction)&&s.construction.every(j=>j.remaining>0&&j.remaining<=j.total&&['lane','upgrade','roomExpand','land'].includes(j.kind))&&Array.isArray(s.lanes)&&s.lanes.length>=0&&s.lanes.length+pendingLanes(s)<=laneCapacity(s)&&s.lanes.every(l=>Number.isInteger(l.id)&&l.condition>=0&&l.condition<=100&&l.kits&&LANE_KITS.every(k=>typeof l.kits[k.id]==='undefined'||l.kits[k.id]===true)&&SCORE_THEMES.some(t=>t.id===l.theme)&&(l.animationUnlocked===undefined||typeof l.animationUnlocked==='boolean'))&&SNACKS.every(i=>Number.isInteger(s.snackStock[i.id])&&s.snackStock[i.id]>=0)&&s.queue.length<=waitCapacity(s)&&ROOM_IDS.every(id=>(!s.roomPlacements[id]||canPlaceRoom(s,id,s.roomPlacements[id].x,s.roomPlacements[id].y)))&&s.bowlers.every(b=>['aim','spare','power','focus'].every(k=>b[k]>=0&&b[k]<=95)));}
// Preserve v0.3 (and older v0.1/0.2) game progress without editing the old save.
function migrate(legacy){
 if(legacy?.version===11)return checkState(legacy)?legacy:null;
 if(legacy?.version===10){const s={...structuredCloneSafe(legacy),version:11,laneRotation:0,storyCursor:0};s.today={...newDayStats(s.day),...s.today};s.lastDay={...newDayStats(s.lastDay?.day||0),...s.lastDay};s.dayReports=(s.dayReports||[]).map(r=>({...newDayStats(r.day),...r}));s.log=['v0.96: Rotating lanes, longer sessions, and technician automation are ready. Progress is preserved.',...(s.log||[])].slice(0,60);return checkState(s)?s:null;}
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
return {OPEN,CLOSE,DAYS,calendar,LANE_KITS,SCORE_THEMES,STAR_THRESHOLDS,alleyScore,alleyStars,upgradeLane,setLaneTheme,SPECIALTIES,STARTER_STYLES,chooseStartup,chooseSpecialty,specialtyOf,buyLand,laneCapacity,rushCost,rushConstruction,EMPLOYEE_ROLES,neededStaff,countStaff,staffed,hireEmployee,setWage,trainEmployee,setStockThreshold,incoming,processDeliveries,DRINKS,MACHINES,FIXTURES,PAINTS,LEVELS,nextLevelGoals,drinkUnlocked,restockDrink,setDrinkPrice,machineUnlocked,buyMachine,buyFixture,paintWall,startLeague,MAX_LANES,ROOM_COLS,ROOM_ROWS,ROOM_IDS,footprint,canPlaceRoom,findRoomPlacement,moveRoom,expandRoom,expansionCost,startNextDay,UPGRADES,CAMPAIGNS,SNACKS,TOURNAMENTS,PLAYER_SKILLS,newGame,migrate,formatHour,lanes,pendingLanes,nextLaneCost,benchCost,waitCapacity,activeCampaign,venueLevel,venueName,avg,teamAvg,getUpgrade,isBuilding,canBuild,build,buyLane,buyBench,advertise,restockBar,setBarPrice,snackUnlocked,restockSnack,buyParts,serviceLane,setPrice,setSnackPrice,tickHour,runDay,spendOwnerPoint,trainCost,train,fitBall,recruit,eligibility,tournament,bowlShot,checkState};
});
