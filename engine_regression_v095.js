const assert=require('node:assert/strict'),G=require('./engine.js');let checks=0;
const ok=(v,msg)=>{assert.ok(v,msg);checks++};
for(let seed=1;seed<=32;seed++){
 const s=G.newGame(seed);ok(G.checkState(s),'fresh save');ok(G.alleyStars(s)===0,'empty');
 ok(G.chooseStartup(s,seed%2?'standard':'growth',seed%3?'original':'family').ok,'startup');
 ok(G.buyLane(s).ok,'purchase first lane');
 for(let d=0;d<3;d++){G.runDay(s);ok(G.checkState(s),'after each day');if(s.hour===G.CLOSE)G.startNextDay(s);}
 ok(G.lanes(s)===1,'first lane built');
 s.cash+=3000;
 for(const kit of G.LANE_KITS){ok(G.upgradeLane(s,1,kit.id).ok,kit.id);ok(!G.upgradeLane(s,1,kit.id).ok,'duplicate rejected');ok(G.checkState(s),'valid after upgrade');}
 ok(G.setLaneTheme(s,1,'comic').ok,'animation choice');ok(G.alleyStars(s)>=2,'two stars from upgraded lane');
 ok(!G.setLaneTheme(s,1,'fake').ok,'bad animation rejected');
 const v9=JSON.parse(JSON.stringify(s));v9.version=9;v9.lanes=v9.lanes.map(x=>({id:x.id,condition:x.condition}));const migrated=G.migrate(v9);ok(G.checkState(migrated),'migrated v94');ok(migrated.lanes[0].kits!==null,'kit initialized');ok(migrated.lanes[0].theme==='classic','theme initialized');
 for(let d=0;d<25;d++) {G.runDay(s);if(s.hour===G.CLOSE)G.startNextDay(s);ok(G.checkState(s),'later stability');}
}
// Physical investments alone cannot skip visitation and reputation progression.
const s=G.newGame(42);G.chooseStartup(s,'growth');s.cash=100000;for(let n=0;n<6;n++)G.buyLane(s);for(let n=0;n<2;n++)G.runDay(s);
for(const l of s.lanes){for(const k of G.LANE_KITS)G.upgradeLane(s,l.id,k.id);G.setLaneTheme(s,l.id,'retro');}
ok(G.alleyStars(s)===5,'five stars possible');ok(G.venueLevel(s)===1,'no premature level by spending');s.totalServed=500;s.rep=150;ok(G.venueLevel(s)===5,'all gates met');ok(G.checkState(s),'valid final');
console.log('PASS',checks,'checks; complete star progression verified');
