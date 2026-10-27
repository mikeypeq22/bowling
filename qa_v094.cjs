const A=require('assert');const G=require('./engine.js');let tested=0;
const assert=(v,m)=>{A.ok(v,m);tested++};
for(let seed=1;seed<=24;seed++)for(const loan of ['standard','growth']){
 const s=G.newGame(seed);assert(G.checkState(s),'blank state valid');assert(s.lanes.length===0,'empty building');assert(!!s.built.roof,'walls/roof exist');assert(!G.bowlShot(s,0,0,90).ok,'no practice before lanes');
 assert(G.chooseStartup(s,loan,'original').ok,'loan');assert(G.checkState(s));
 if(seed%2===0){assert(G.build(s,'bar').ok,'bar first supported');assert(G.build(s,'snack').ok,'snack second');}
 else {assert(G.build(s,'snack').ok,'snack first');assert(G.build(s,'bar').ok,'bar second');}
 assert(G.buyLane(s).ok,'first lane');
 for(let day=0;day<9;day++){
   for(let h=0;h<8;h++){
     G.tickHour(s);assert(G.checkState(s),'valid after tick');
   }
   if(day===0){assert(s.lanes.length===0,'no premature lane');assert(s.today.arrivals===0,'no bowling before first lane');assert(s.today.left===0,'no angry non-existent guests');}
   if(day===1){assert(s.lanes.length===1,'first lane complete');assert(s.facilityNotices.some(x=>x.id==='snack'&&x.tier===1),'snack notification queued');}
   if(day===2)assert(s.facilityNotices.some(x=>x.id==='bar'),'bar notification queued');
   G.startNextDay(s);assert(G.checkState(s),'valid new day');
 }
 const before=s.cash;assert(s.lanes.length===1,'lane stays');assert(s.built.snack&&s.built.bar,'facilities finished');assert(before>-500,'economy no catastrophic spiral');
}
{let s=G.newGame();G.chooseStartup(s,'growth');s.cash=5000;G.build(s,'snack');for(let day=0;day<2;day++){for(let h=0;h<8;h++)G.tickHour(s);G.startNextDay(s)}
 assert(G.checkState(s),'snack live');assert(s.facilityNotices.length===1);assert(!G.staffed(s,'snack'),'needs hire');assert(G.hireEmployee(s,'snack').ok);
 assert(G.restockSnack(s,'soda').ok);const start=s.snackStock.soda;assert(G.incoming(s,'snack','soda')>0,'delivery pending');assert(s.snackStock.soda===start,'not instant');
 for(let h=0;h<8;h++)G.tickHour(s);G.startNextDay(s);assert(s.snackStock.soda>start,'next morning delivery');
 const loc=G.findRoomPlacement(s,'snack',2);if(loc&&G.expandRoom(s,'snack').ok){for(let day=0;day<2;day++){for(let h=0;h<8;h++)G.tickHour(s);G.startNextDay(s)} assert(s.facilityNotices.some(x=>x.tier===2),'expanded announcement');}
}
// Migration: previously saved v0.93 games have lanes; they are not replaced with empty buildings.
{const old=require('./tests/engine_v093.cjs');let saved=old.newGame();old.chooseStartup(saved);saved.cash=1337;const migrated=G.migrate(saved);assert(G.checkState(migrated));assert(migrated.lanes.length===1,'lane stays from old');assert(migrated.cash===1337);assert(migrated.facilityNotices.length===0);}
// v0.92 version 7 migration
{const old=require('./tests/engine_v092.cjs');let s=old.newGame();assert(s.version===7);const m=G.migrate(s);assert(!!m,'old migration');assert(G.checkState(m));assert(m.lanes.length===1);}
console.log('PASS',tested,'checks');
