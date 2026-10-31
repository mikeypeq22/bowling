const assert=require('assert');const G=require('../engine.js');
const make=()=>G.developmentScenario('backalley');
let s=make();assert(G.checkState(s));assert.strictEqual(s.version,16);assert(s.campaignStory.nightOps.entrance===1);assert(G.BACK_ALLEY_CHAPTERS.length>=6);assert(G.campaignMission(s).includes('door crew'));assert(!G.chooseCampaign(s,'legacy').ok);
s.cash=30000;const start=s.cash;
assert(G.buyNightDefense(s,'entrance').ok);assert.strictEqual(s.campaignStory.nightOps.entrance,2);
assert(G.buyNightDefense(s,'cameras').ok);assert(G.buyNightDefense(s,'crew').ok);assert.strictEqual(s.campaignStory.nightOps.cameras,1);assert(s.cash<start);
assert(G.checkState(s));assert(s.campaignStory.nightOps.chapters.includes('noir-door'));
let low=make();low.cash=50000;low.campaignStory.nightOps.entrance=0;low.campaignStory.security=12;let hi=G.migrate(JSON.parse(JSON.stringify(low)));hi.seed=low.seed;for(const defense of G.NIGHT_DEFENSES){while(hi.campaignStory.nightOps[defense.id]<3)assert(G.buyNightDefense(hi,defense.id).ok);}assert(G.nightProtection(hi)>G.nightProtection(low));
let attacksL=0,defendedL=0,attacksH=0,defendedH=0;
for(let i=0;i<90;i++){
 for(const [state,out] of [[low,'L'],[hi,'H']]){
  state.day+=9;state.lastRandomEventDay=-100;state.campaignStory.nextAIMoveDay=state.day;state.cash=50000;state.outages={};
  assert(G.rivalAIMove(state));
 }
}
attacksL=low.campaignStory.nightOps.incidents;attacksH=hi.campaignStory.nightOps.incidents;
defendedL=low.campaignStory.nightOps.defended;defendedH=hi.campaignStory.nightOps.defended;
assert(attacksL>attacksH,`Expected high security to reduce incidents: ${attacksL} vs ${attacksH}`);
low.outages.lane1={name:'Lane 1',cost:160,day:low.day,rival:true};const closures=Object.entries(low.outages).filter(([_,v])=>v.rival);assert(closures.length>0);
const [target,o]=closures[0];assert(!G.emergencyResponse(low,target).ok,'no door crew');assert(G.buyNightDefense(low,'entrance').ok);assert(G.emergencyResponse(low,target).ok);assert(!low.outages[target]);
assert(G.checkState(low));assert(G.checkState(hi));
const v100=G.developmentScenario('legacy');v100.version=15;delete v100.campaignStory.nightOps;const oldCash=v100.cash;assert(G.checkState(G.migrate(v100)));assert(G.migrate(v100).cash===oldCash);
let legacy=G.developmentScenario('legacy');assert(!G.buyNightDefense(legacy,'entrance').ok);assert(G.backAlleyArcadeName(legacy)==='Arcade');assert(G.backAlleyArcadeName(hi)==='Casino Lounge');
let secondary=G.developmentScenario('backalley');secondary.cash=30000;secondary.rep=140;secondary.roomVisits.snack=500;secondary.roomVisits.bar=500;secondary.roomVisits.arcade=500;secondary.roomVisits.proshop=500;secondary.totalServed=1000;secondary.lanes.forEach(l=>{l.kits={wood:true,return:true,scoring:true}});secondary.fixtures={...secondary.fixtures,tv:true,lockers:true,neon:true,wallart:true};secondary.wallPaint='midnight';assert(G.openSecondTown(secondary).ok);const river=G.switchTown(secondary,'riverside');assert(G.checkState(river));assert.strictEqual(river.campaignStory.path,'undecided');assert.strictEqual(G.switchTown(river,'home').campaignStory.nightOps.entrance,1);
console.log(JSON.stringify({passed:true,lowIncidents:attacksL,highIncidents:attacksH,lowDefenses:defendedL,highDefenses:defendedH,securityDifference:G.nightProtection(hi)-G.nightProtection(low),chapters:G.BACK_ALLEY_CHAPTERS.length},null,2));
