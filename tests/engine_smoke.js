const assert=require('assert');const G=require('../engine.js');
let c=G.developmentScenario('decision');assert(G.checkState(c));assert(!G.chooseCampaign(c,'backalley___').ok);assert(G.campaignReady(c));
assert(G.chooseCampaign(c,'backalley').ok);assert(!G.chooseCampaign(c,'legacy').ok);assert(G.campaignOf(c).id==='backalley');
assert(G.campaignAction(c,'reinforce').ok);assert(!G.campaignAction(c,'contacts').ok);c.day+=2;assert(G.campaignAction(c,'contacts').ok);assert(c.campaignStory.heat===8);
const first=c.campaignStory.nextAIMoveDay;c.day=first;c.lastRandomEventDay=-100;const action=G.rivalAIMove(c);assert(action);assert(c.campaignStory.aiMemory.length===1);assert(c.campaignStory.nextAIMoveDay>c.day);
// event spacing: force a second AI turn on a prohibited day
c.campaignStory.nextAIMoveDay=c.day+1;c.day++;assert(!G.rivalAIMove(c));
assert(G.checkState(c));
// Old saves migrated without lost cash/lanes/reputation
const l=G.developmentScenario('legacy');const old=JSON.parse(JSON.stringify(l));delete old.campaignStory;delete old.portfolio;delete old.locationName;old.version=14;
let migrated=G.migrate(old);assert(G.checkState(migrated));assert(migrated.lanes.length===6);assert(migrated.cash===old.cash);assert(migrated.campaignStory.path==='undecided');
// Two towns choose DIFFERENT locked branches, switching preserves them
let town=G.developmentScenario('backalley');town.cash=24000;town.rep=140;town.roomVisits.snack=500;town.roomVisits.bar=500;town.roomVisits.arcade=500;town.roomVisits.proshop=500;town.totalServed=1000;town.lanes.forEach(l=>{l.kits={wood:true,return:true,scoring:true}});town.fixtures={...town.fixtures,tv:true,lockers:true,neon:true,wallart:true};town.wallPaint='midnight';
assert(G.alleyStars(town)>=3, 'need three stars '+G.alleyStars(town));assert(G.canOpenSecondTown(town));assert(G.openSecondTown(town).ok);assert(G.checkState(town));const homeCash=town.cash;
let river=G.switchTown(town,'riverside');assert(river);assert(G.checkState(river));assert(river.campaignStory.path==='undecided');assert(river.locationName==='Riverside');assert(river.cash===1800);river.totalServed=23;G.advanceStory(river);assert(G.campaignReady(river));assert(G.chooseCampaign(river,'legacy').ok);assert(!G.chooseCampaign(river,'backalley').ok);
let home=G.switchTown(river,'home');assert(G.checkState(home));assert(home.cash===homeCash);assert(home.campaignStory.path==='backalley');let riverAgain=G.switchTown(home,'riverside');assert(G.checkState(riverAgain));assert(riverAgain.campaignStory.path==='legacy');
// long run simulate AI + random events respecting cooldown across types
let run=G.developmentScenario('backalley');run.cash=50000;run.built.staff=true;run.parts=50;
let events=[];for(let i=0;i<120;i++){if(run.hour===G.CLOSE)G.startNextDay(run);G.runDay(run);if(run.eventHistory[0]?.day===run.day)events.push(run.day);assert(G.checkState(run),'Invalid at day '+run.day);}for(let i=1;i<events.length;i++)assert(events[i]-events[i-1]>=5,`events too near ${events[i-1]} ${events[i]}`);
console.log(JSON.stringify({passed:true,aiMoves:run.campaignStory.aiMemory.length,events:events.length,days:run.day,portfolio:riverAgain.portfolio.opened,cash:homeCash,star:G.alleyStars(town)},null,2));
