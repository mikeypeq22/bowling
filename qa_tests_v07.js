'use strict';
const G=require('./engine'),assert=require('node:assert/strict');let checks=0;
function test(value,msg){assert.ok(value,msg);checks++}
function day(s){G.runDay(s);test(G.checkState(s),`state at day ${s.day}`);return s.today;}
function morning(s){test(G.startNextDay(s),'next day begins');}
function warehouse(){const s=G.newGame(123);s.cash=12000;test(s.version===7,'version 7');test(s.hour===14&&G.CLOSE===22,'2–10pm');
 test(G.build(s,'roof').ok,'roof ordered');day(s);morning(s);day(s);morning(s);test(s.built.roof,'roof ready');
 test(G.build(s,'snack').ok,'snack ordered');day(s);morning(s);day(s);morning(s);test(s.built.snack,'snacks ready');
 const before=s.snackStock.soda;test(!G.staffed(s,'snack'),'counter closed before hiring');
 const sold=s.today.snackOrders;for(let k=0;k<4;k++){day(s);test(s.today.snackOrders===0,'unmanned snack counter cannot sell');morning(s);}
 test(G.hireEmployee(s,'snack').ok,'hire snack employee');test(G.staffed(s,'snack'),'counter staffed');
 test(G.restockSnack(s,'soda').ok,'order soda');test(s.snackStock.soda===before,'order does not instantly appear');test(G.incoming(s,'snack','soda')===10,'soda in transit');
 const wage=s.employees[0].wage,prevMorale=s.employees[0].morale;
 day(s);test(s.today.staffPay===wage,'wage appears in closing');test(s.employees[0].morale>prevMorale,'morale responds to pay');test(s.snackStock.soda<=before,'no delivery before tomorrow (customers can buy existing stock)');
 const closeStock=s.snackStock.soda;morning(s);test(s.snackStock.soda===closeStock+10,'stock delivered following day');test(G.incoming(s,'snack','soda')===0,'delivered parcel removed');
 test(G.setStockThreshold(s,7).ok&&s.lowStockThreshold===7,'threshold adjustable');test(!G.setStockThreshold(s,20).ok,'threshold validated');test(G.setWage(s,s.employees[0].id,18).ok,'change salary');test(G.trainEmployee(s,s.employees[0].id).ok,'staff progression works');
 test(G.checkState(s),'warehouse valid');return s;}
warehouse();
const b=G.newGame(888);b.cash=20000;b.built={roof:true,snack:true,bar:true,proshop:true,arcade:true};b.lanes=Array.from({length:6},(_,i)=>({id:i+1,condition:96}));b.roomPlacements={snack:{x:0,y:0},bar:{x:2,y:0},proshop:{x:0,y:1},arcade:{x:2,y:1}};
b.barStockById.beer=100;b.barStockById.wine=100;b.barStock=200;b.arcadeMachines.pinball=true;
test(!G.staffed(b,'bar'),'bar not staffed');test(G.hireEmployee(b,'bar').ok,'bar hire');test(G.hireEmployee(b,'proshop').ok,'proshop hire');test(G.hireEmployee(b,'snack').ok,'snack hire');
test(G.hireEmployee(b,'stocker').ok,'hire stocker');test(!G.hireEmployee(b,'stocker').ok,'only one stocker');
test(G.startLeague(b).ok,'start six lane league');b.day=4;b.hour=18;
for(let h=18;h<20;h++){G.tickHour(b);test(b.today.leagueHours===h-17,'league reserves consecutive hours');test(b.active.length===0,'all lanes unavailable during league');}
for(let h=20;h<22;h++)G.tickHour(b);
test(b.today.leagueIncome>0&&b.today.leagueHeld,'league pays after two hour session');test(b.league.sessions===1,'one league session');test(b.today.staffPay>0,'payroll during closing');test(b.today.walkIns>=0,'walk-in field');test(G.checkState(b),'league save valid');
const old={...b,version:6};delete old.employees;delete old.deliveries;delete old.lowStockThreshold;const imported=G.migrate(JSON.parse(JSON.stringify(old)));test(imported?.version===7,'old save migrated');test(imported.lanes.length===6,'existing lanes preserved');test(imported.built.bar,'existing bar preserved');test(G.checkState(imported),'migration valid');
let cases=0,nonBowling=0,fees=0;for(let seed=1;seed<=48;seed++){
 const s=G.newGame(seed*1009);s.cash=3000;
 for(let d=1;d<=64;d++){
  if(s.cash>500&&!s.built.roof&&!G.isBuilding(s,'roof'))G.build(s,'roof');
  if(s.cash>650&&s.built.roof&&!s.built.snack&&!G.isBuilding(s,'snack'))G.build(s,'snack');
  if(s.cash>850&&s.built.roof&&!s.built.bar&&!G.isBuilding(s,'bar'))G.build(s,'bar');
  if(s.cash>1250&&s.built.roof&&!s.built.arcade&&!G.isBuilding(s,'arcade'))G.build(s,'arcade');
  if(s.cash>G.nextLaneCost(s)+500&&G.lanes(s)+G.pendingLanes(s)<6)G.buyLane(s);
  for(const r of ['snack','bar','proshop'])if(s.built[r]&&s.cash>G.EMPLOYEE_ROLES[r].fee+200&&G.countStaff(s,r)<G.neededStaff(s,r))G.hireEmployee(s,r);
  for(const item of G.SNACKS)if(G.snackUnlocked(s,item.id)&&s.snackStock[item.id]+G.incoming(s,'snack',item.id)<=3&&s.cash>item.cost+300)G.restockSnack(s,item.id);
  for(const item of G.DRINKS)if(G.drinkUnlocked(s,item.id)&&s.barStockById[item.id]+G.incoming(s,'bar',item.id)<=3&&s.cash>item.cost+300)G.restockDrink(s,item.id);
  for(const lane of s.lanes)if(lane.condition<50&&s.cash>120){if(s.parts<1)G.buyParts(s);G.serviceLane(s,lane.id)}
  if(G.lanes(s)===6&&!s.league.active&&s.cash>600)G.startLeague(s);
  day(s);cases++;
  test(Math.abs(s.today.income-(s.today.laneIncome+s.today.shoeIncome+s.today.snackIncome+s.today.barIncome+s.today.otherIncome+s.today.leagueIncome))<.001,'balanced revenue');
  test(Math.abs(s.today.net-(s.today.income-s.today.expenses))<.001,'net reconciles');
  if(s.today.walkIns)nonBowling++;if(s.today.leagueHeld)fees++;
  if(d<64)morning(s);
 }
}
console.log(JSON.stringify({assertions:checks,daysSimulated:cases,daysWithNonBowlingGuests:nonBowling,leagueDays:fees}));
