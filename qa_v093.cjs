const assert=require('assert');const fs=require('fs');const {execFileSync}=require('child_process');const G=require('./engine.js');
let asserts=0;const check=(expr,message)=>{assert(expr,message);asserts++;};
for(const finance of ['standard','growth'])for(const style of G.STARTER_STYLES.map(x=>x.id)){
 const s=G.newGame(1234);check(s.startupPending,'new game wizard');check(G.checkState(s));
 check(G.chooseStartup(s,finance,style).ok);check(!s.startupPending);check(G.checkState(s));
 check(s.cash===600+(finance==='growth'?1800:1000)-G.STARTER_STYLES.find(x=>x.id===style).cost);check(s.loan.balance=== (finance==='growth'?1800:1000));
 check(!G.chooseStartup(s,finance,style).ok);check(G.build(s,'bar').ok,'bar should be available without roof');check(G.build(s,'snack').ok,'snack no prereq');check(G.checkState(s));
 let m=0;for(let d=0;d<21;d++){
  for(let i=0;i<8;i++){const r=G.tickHour(s);check(G.checkState(s));check(s.happiness>=0&&s.happiness<=100);if(r.dayEnded)check(s.hour===G.CLOSE);}
  if(s.day===2){check(s.built.snack,'snack should have finished');check(s.snackStock.fries>0,'new fries stocked');}
  if(s.day===3){check(s.built.bar,'bar should have finished');}
  if(s.day%7===0&&s.loan.balance>=0){m++;}
  G.startNextDay(s);check(G.checkState(s));
 }
 check(s.happinessHistory.length===21,'daily history');check(m===3);check(s.loan.balance<(finance==='growth'?1800:1000),'weekly payments');
}
// Test construction rush at closing while maintaining valid state
{const s=G.newGame();G.chooseStartup(s);check(G.build(s,'proshop').ok);
 for(let i=0;i<8;i++)G.tickHour(s);
 check(s.hour===G.CLOSE);check(s.construction[0].remaining===2);const cost=G.rushCost(s.construction[0]);check(cost>0);
 const cash=s.cash;check(G.rushConstruction(s,'upgrade','proshop').ok);check(s.cash===Math.round((cash-cost)*100)/100);check(s.built.proshop);check(!s.construction.length);check(G.checkState(s));}
// Specialty eligibility and distinct effects
{let s=G.newGame();G.chooseStartup(s);check(!G.chooseSpecialty(s,'family').ok);s.built.roof=true;s.built.bar=true;s.lanes=[1,2,3].map(id=>({id,condition:94}));s.totalServed=110;s.rep=31;check(G.venueLevel(s)>=3);check(G.chooseSpecialty(s,'family').ok);check(s.specialty==='family');check(!G.chooseSpecialty(s,'sport').ok);check(G.checkState(s));}
// land expansion after six lanes
{let s=G.newGame();G.chooseStartup(s,'growth');s.cash=10000;s.lanes=Array.from({length:6},(_,i)=>({id:i+1,condition:95}));
 check(G.laneCapacity(s)===6);check(!G.buyLane(s).ok);check(G.buyLand(s).ok);check(!G.buyLand(s).ok);for(let d=0;d<4;d++){for(let j=0;j<8;j++)G.tickHour(s);if(d!==3)G.startNextDay(s);}check(s.landOwned);check(G.laneCapacity(s)===10);check(G.buyLane(s).ok);check(G.checkState(s));}
// Migration from shipped v0.92 engine's version 7
{let old=G.newGame();G.chooseStartup(old);old.version=7;delete old.startupPending;delete old.loan;delete old.happiness;delete old.happinessHistory;delete old.specialty;delete old.landOwned;delete old.starterStyle;delete old.startupFinance;old.snackStock={soda:2,popcorn:1,hotdog:0,pizza:0,nachos:0,pretzel:0,icecream:0};old.snackPrices={soda:5,popcorn:6,hotdog:9,pizza:11,nachos:10,pretzel:8,icecream:10};old.cash=623;old.built={bar:true};const n=G.migrate(old);check(!!n);check(G.checkState(n));check(n.cash===623);check(!n.startupPending);check(n.built.bar);check(n.snackStock.fries===0);}
console.log('PASS',asserts,'assertions');
