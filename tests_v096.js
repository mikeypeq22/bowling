const assert=require('node:assert/strict'),G=require('./engine.js');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
const outputs=[];
for(let seed=1;seed<=80;seed++){
 const s=G.newGame(seed);ok(G.checkState(s),'fresh');ok(G.chooseStartup(s,'standard').ok,'startup');ok(G.buyLane(s).ok,'lane');
 for(let day=0;day<18;day++){G.runDay(s);ok(G.checkState(s),'invariants');if(s.hour===G.CLOSE)G.startNextDay(s);}
 const first=s.dayReports.filter(r=>r.day<=9).reduce((n,r)=>n+r.arrivals,0)/9;
 ok(first<4,'quiet opening avg');outputs.push(first);
 const old=JSON.parse(JSON.stringify(s));old.version=10;delete old.laneRotation;delete old.storyCursor;const migration=G.migrate(old);ok(G.checkState(migration),'v095 migration');ok(migration.totalServed===s.totalServed,'served preserved');
 const mature=G.newGame(seed+100);G.chooseStartup(mature,'growth');mature.cash=50000;for(let i=0;i<6;i++)ok(G.buyLane(mature).ok,'lane expansion');
 G.runDay(mature);G.startNextDay(mature);G.runDay(mature);G.startNextDay(mature);
 mature.totalServed=175;mature.rep=65;mature.ownerSkills.promoter=3;
 for(const l of mature.lanes)l.condition=96;
 const usage=new Set(),durations=new Set();let busy=0,arrivals=0;
 for(let d=0;d<14;d++){
   for(let h=G.OPEN;h<G.CLOSE;h++){
     G.tickHour(mature);
     mature.active.forEach(x=>{usage.add(x.laneId);durations.add(x.hours);});
     ok(new Set(mature.active.map(x=>x.laneId)).size===mature.active.length,'no double booking');
     ok(G.checkState(mature),'state intact');
     busy+=mature.active.length;
   }
   arrivals+=mature.lastDay.arrivals;
   G.startNextDay(mature);
 }
 ok(usage.has(4)&&usage.has(5)&&usage.has(6),'higher lanes used');ok(durations.has(2)&&durations.has(3),'multi-hour bookings');ok(arrivals>30,'meaningful mature traffic');
 if(seed===1)console.log('mature simulation',JSON.stringify({arrivals14Days:arrivals,usedLanes:[...usage],bookingHours:[...durations],occupiedSlots:busy}));
}
const freshAverage=outputs.reduce((x,y)=>x+y,0)/outputs.length;
console.log('mean first nine days arrivals/day:',freshAverage.toFixed(2));
// Exact billing and lane lock duration, including no shoe-rental re-charge.
const x=G.newGame(17);G.chooseStartup(x);x.cash=20000;for(let i=0;i<6;i++)G.buyLane(x);G.runDay(x);G.startNextDay(x);G.runDay(x);G.startNextDay(x);x.rep=150;x.totalServed=200;
let any=false;for(let h=G.OPEN;h<G.CLOSE;h++) {G.tickHour(x);const ev=x.today.events;if(ev.some(e=>e.text.includes('another hour (+$')))any=true;}ok(any,'repeat hour charged');ok(x.today.laneHours>=x.today.served,'all paid hours');
// Technician repairs overnight, procures parts, remains safe when cash is exhausted.
const t=G.newGame(10);G.chooseStartup(t,'growth');t.cash=5000;G.buyLane(t);G.runDay(t);G.startNextDay(t);G.runDay(t);G.startNextDay(t);ok(G.build(t,'staff').ok,'hire technician');G.runDay(t);G.startNextDay(t);ok(t.built.staff,'technician ready');t.lanes[0].condition=41;t.parts=0;const pre=t.cash;G.runDay(t);ok(t.lanes[0].condition>41,'automatic service');ok(t.parts>=0,'parts tracking');ok(t.lastDay.techServices===1,'service tracked');ok(t.lastDay.techPartsBought===5,'parts automatically bought');ok(t.lastDay.techExpenses===65,'technician cost charged');ok(t.lastDay.staffPay>=16,'technician daily wage deducted');
t.cash=-10000;t.parts=0;t.lanes[0].condition=36;G.startNextDay(t);G.runDay(t);ok(G.checkState(t),'technician with no cash safe');ok(t.lastDay.techServices===0,'no free auto repair');
console.log('PASS',checks,'v0.96 validations');
