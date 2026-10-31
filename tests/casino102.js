const assert=require('assert'),G=require('../engine.js');
let s=G.developmentScenario('backalley');assert(G.checkState(s)&&s.version===17);
assert(G.BACK_ALLEY_CHAPTERS.length>=8);
assert(G.hirePitBoss(s).ok);assert(!G.hirePitBoss(s).ok);let beforeHouse=s.campaignStory.nightOps.tableRounds;G.casinoPatronRound(s);assert(s.campaignStory.nightOps.tableRounds===beforeHouse+1);
const cash=s.cash,prior=s.campaignStory.nightOps.spins;let outcomes=[];
for(let i=0;i<5;i++){const r=G.casinoBet(s,25);assert(r.ok);outcomes.push(r);assert([0,2,3,4].includes(r.mult));assert(r.payout===r.mult*25);assert(G.checkState(s));}
assert(s.campaignStory.nightOps.spins===prior+5);
assert(!G.casinoBet(s,10).ok,'no more than five bets');
assert(!G.casinoBet(s,15).ok,'invalid stake');
assert(s.campaignStory.nightOps.chapters.includes('noir-ledger'));
s.hour=G.CLOSE;assert(G.startNextDay(s));assert(s.campaignStory.nightOps.spinsToday===0);assert(G.casinoBet(s,10).ok);
let no=G.developmentScenario('legacy');assert(!G.casinoBet(no,10).ok);assert(!G.prepareForRival(no).ok);assert(!G.buyNightInsurance(no).ok);
s.cash=5000;assert(G.buyNightInsurance(s).ok);assert(s.campaignStory.nightOps.insuranceUntil===s.day+21);assert(G.prepareForRival(s).ok);assert(G.nightProtection(s)>=27);
const before=s.cash,paid=G.nightPayroll(s);assert(paid>0);G.nightShift(s);assert(s.cash===before-paid);
const old=G.developmentScenario('backalley');old.version=16;const oldGold=old.cash;const oldDay=old.day;delete old.campaignStory.nightOps.spins;delete old.campaignStory.nightOps.spinsToday;delete old.campaignStory.nightOps.insuranceUntil;const restored=G.migrate(old);assert(restored&&G.checkState(restored));assert(restored.cash===oldGold&&restored.day===oldDay&&restored.campaignStory.nightOps.spins===0);
const multi=G.developmentScenario('backalley');multi.cash=50000;multi.rep=140;multi.roomVisits.snack=500;multi.roomVisits.bar=500;multi.roomVisits.arcade=500;multi.roomVisits.proshop=500;multi.totalServed=1000;multi.lanes.forEach(l=>{l.kits={wood:true,return:true,scoring:true}});multi.fixtures={...multi.fixtures,tv:true,lockers:true,neon:true,wallart:true};multi.wallPaint='midnight';assert(G.openSecondTown(multi).ok);multi.version=16;multi.portfolio.snapshots.riverside.version=16;const migrated=G.migrate(multi);assert(G.checkState(migrated));assert(migrated.portfolio.snapshots.riverside.version===17);
console.log(JSON.stringify({passed:true,spins:outcomes.map(x=>x.mult),testVersion:restored.version,nightPayroll:paid,migratedSecondTown:migrated.portfolio.snapshots.riverside.version},null,2));
