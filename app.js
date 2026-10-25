/* From Gutter to Glory v0.8 — visual game controller. Gameplay lives in engine.js. */
(()=>{'use strict';
const G=window.BowlingCore;
const KEY='gutter-to-glory-v07',PREVIOUS='gutter-to-glory-v06',LEGACY='gutter-to-glory-v05',UIKEY='gutter-to-glory-ui-v08',OLDUI='gutter-to-glory-ui-v07';
const MS_HOUR=5200,MAX_OFFLINE_HOURS=24;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString();
const defaultAssets={
 'scene.backyard':'assets/venue-backyard.png','scene.neighborhood':'assets/venue-neighborhood.png','scene.league':'assets/venue-league.png','scene.regional':'assets/venue-regional.png',
 'world.lane':'assets/lane.png','world.desk':'assets/front-desk.png','world.snack':'assets/snack-counter.png','world.arcade':'assets/arcade.png','world.proshop':'assets/pro-shop.png','world.visitor':'assets/customer.png','world.bar':'assets/bar.png','world.benches':'assets/benches.png','world.ads':'assets/advertising.png','world.empty':'assets/floor-tile.png','cutscene.dirt':'assets/cutscene-dirt.png','cutscene.level2':'assets/cutscene-level2.png','cutscene.level3':'assets/cutscene-level3.png','cutscene.level4':'assets/cutscene-level4.png','cutscene.level5':'assets/cutscene-level5.png',
 'nav.alley':'assets/nav-alley.png','nav.manage':'assets/nav-manage.png','nav.bowlers':'assets/nav-bowlers.png','nav.tournaments':'assets/nav-tournaments.png','nav.you':'assets/nav-you.png','nav.employees':'assets/nav-employees.png','nav.goals':'assets/nav-goals.png',
 'employee.snack':'assets/employee-snack.png','employee.bar':'assets/employee-bar.png','employee.proshop':'assets/employee-proshop.png','employee.stocker':'assets/employee-stocker.png',
 'bowler.maya':'assets/bowler-maya.png','bowler.leo':'assets/bowler-leo.png','bowler.recruit2':'assets/bowler-jules.png','bowler.recruit3':'assets/bowler-sam.png',
 'supply.parts':'assets/parts.png','misc.trophy':'assets/trophy.png','misc.owner':'assets/owner.png'
};
G.UPGRADES.forEach(u=>{defaultAssets['upgrade.'+u.id]='assets/upgrade-'+u.id+'.png'});
G.SNACKS.forEach(item=>{defaultAssets['snack.'+item.id]='assets/snack-'+item.id+'.png'});
G.DRINKS.forEach(item=>{defaultAssets['drink.'+item.id]='assets/drink-'+item.id+'.png'});
G.MACHINES.forEach(item=>{defaultAssets['machine.'+item.id]='assets/machine-'+item.id+'.png'});
G.FIXTURES.forEach(item=>{defaultAssets['fixture.'+item.id]='assets/fixture-'+item.id+'.png'});
const assets={...defaultAssets,...window.BOWLING_ASSETS};
const icon=(key,emoji,extra='')=>`<span class="icon-art ${extra}" aria-hidden="true"><span>${emoji}</span>${assets[key]?`<img src="${esc(assets[key])}" alt="" onerror="this.remove()">`:''}</span>`;
document.querySelectorAll('[data-icon]').forEach(el=>{el.outerHTML=icon(el.dataset.icon,el.dataset.emoji)});
let s=G.newGame(),auto=true,tab='alley',buildSection='construction',drawer=null,selectedBowler='maya',lastTick=Date.now(),timerToast=null,summaryOpen=false,skipSummaries=false,introSeen=false,layoutMode=false,movingRoom=null,cutsceneOpen=false,pendingCutscene=null,tutorialSeen=false,tutorialOpen=false,tutorialStep=0,introCutscene=false,hadSavedGame=false,hadNewUI=false;
try{let saved=JSON.parse(localStorage.getItem(KEY));if(saved?.state&&G.checkState(saved.state)){s=saved.state;lastTick=Number(saved.lastTick)||Date.now();introSeen=true;hadSavedGame=true;}else{
 for(const key of [PREVIOUS,LEGACY,'gutter-to-glory-v04','gutter-to-glory-v03']){const old=JSON.parse(localStorage.getItem(key));if(old?.state){const migrated=G.migrate(old.state);if(migrated){s=migrated;lastTick=Number(old.lastTick)||Date.now();introSeen=true;hadSavedGame=true;break;}}}}
 const newUI=localStorage.getItem(UIKEY);hadNewUI=!!newUI;const ui=JSON.parse(newUI||localStorage.getItem(OLDUI)||localStorage.getItem('gutter-to-glory-ui-v04'));if(ui){auto=ui.auto!==false;if(typeof ui.tutorialSeen==='boolean')tutorialSeen=ui.tutorialSeen;skipSummaries=ui.skipSummaries===true;introSeen=ui.introSeen===true||introSeen;tab=['alley','manage','bowlers','tournaments','you','employees','goals'].includes(ui.tab)?ui.tab:'alley';buildSection=['construction','lanes','style','layout'].includes(ui.buildSection)?ui.buildSection:'construction';}
}catch(e){console.warn('Save cannot be loaded',e);}
if(hadSavedGame&&!hadNewUI)tutorialSeen=true;
let lastAnnouncedLevel=G.venueLevel(s);
function save(){try{localStorage.setItem(KEY,JSON.stringify({state:s,lastTick}));localStorage.setItem(UIKEY,JSON.stringify({auto,tab,buildSection,skipSummaries,introSeen,tutorialSeen}));}catch(e){console.warn('Save unavailable',e);}}
function toast(message,error=false){const el=$('toast');el.textContent=message;el.className='toast show'+(error?' error':'');clearTimeout(timerToast);timerToast=setTimeout(()=>el.className='toast',3500);}
function perform(action,message){if(!action.ok){toast(action.reason||'Not available',true);return false;}save();render();syncVisitors();if(drawer)renderDrawer();if(message)toast(message);return true;}
function gotoTab(id){tab=id;document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===id);if(el.dataset.tab===id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});closeDrawer();save();}
function openDrawer(id){drawer=id;renderDrawer();$('drawerBackdrop').classList.remove('hidden');$('drawer').classList.remove('hidden');$('closeDrawer').focus();}
function closeDrawer(){drawer=null;$('drawer').classList.add('hidden');$('drawerBackdrop').classList.add('hidden');}
function priceBlock(key,label,note){const n=s.pricing[key],min=key==='lane'?10:0,max=key==='lane'?35:8;return `<div class="drawerRow"><div><b>${label}</b><small>${note}</small></div><div class="priceControl"><button data-price="${key}:-1" ${n<=min?'disabled':''} aria-label="Decrease ${label}">−</button><strong>$${n}</strong><button data-price="${key}:1" ${n>=max?'disabled':''} aria-label="Increase ${label}">+</button></div></div>`;}
function reportCards(report){const r=report||{},items=[
 ['Arrivals',r.arrivals||0],['Groups bowled',r.served||0],['Waited for lane',r.waited||0],['Left angry',r.left||0],
 ['Revenue',cash(r.income||0)],['Operating costs',cash(r.expenses||0)],['Bowling + shoes',cash((r.laneIncome||0)+(r.shoeIncome||0))]];
 if((r.facilities?r.facilities.snack:s.built.snack))items.push(['Snack orders',r.snackOrders||0]);
 if((r.facilities?r.facilities.bar:s.built.bar))items.push(['Bar drinks',r.barOrders||0]);
 if((r.facilities?r.facilities.arcade:s.built.arcade))items.push(['Arcade plays',r.arcadePlays||0]);
 if(s.league.active||r.leagueHeld)items.push(['League money',cash(r.leagueIncome||0)]);
 if(s.employees.length||r.staffPay)items.push(['Staff wages',cash(r.staffPay||0)]);
 if(r.walkIns)items.push(['Non-bowling visitors',r.walkIns]);
 if(r.capex)items.push(['Construction investment',cash(r.capex)]);
 if(r.marketingSpend)items.push(['Advertising',cash(r.marketingSpend)]);
 items.push(['Net (before construction)',cash(r.net||0)]);
 return '<div class="statGrid">'+items.map(([title,val])=>`<div><small>${esc(title)}</small><strong>${esc(val)}</strong></div>`).join('')+'</div>';}
function eventsHTML(events){if(!events?.length)return '<p class="small muted">Nothing recorded yet. Advance the clock and watch your guests!</p>';
 return [...events].reverse().map(e=>`<div class="event ${esc(e.type)}"><span class="eventTime">${G.formatHour(e.hour).replace(':00','')}</span><span>${esc(e.text)}</span></div>`).join('');}
function tipHTML(report){return (report.feedback||[]).length?report.feedback.map(x=>`<div class="review">💬 <span>${esc(x)}</span></div>`).join(''):'<p class="muted small">No recurring problems to report yet. Keep an eye on capacity, maintenance, and snacks.</p>';}
function deskDrawer(){return `<p class="drawerIntro">Your front desk manages check-ins, pricing and daily performance. Each group rents a lane for <b>one game hour</b> and may also rent shoes or buy snacks.</p>
 <section class="drawerCard"><h3>💵 Set Your Prices</h3>${priceBlock('lane','Bowling lane','One group · one hour')}${priceBlock('shoes','Shoe rental','Per person · per visit')}<p class="tiny muted">Higher prices earn more per visit, but can reduce guest demand. Adjust them whenever you like.</p></section>
 <section class="drawerCard"><h3>📊 Day ${s.day} · ${s.hour===G.CLOSE?'Closed':G.formatHour(s.hour)}</h3>${reportCards(s.today)}</section>
 <section class="drawerCard"><h3>💬 Guest Feedback</h3>${s.hour===G.CLOSE?tipHTML(s.lastDay):'<p class="muted small">Feedback is collected when the alley closes. Early complaints are suggestions, not harsh penalties.</p>'}</section><button class="full" data-open="diary">📖 Open full daily log</button>`;}
function snackDrawer(){if(!s.built.snack)return `<p class="drawerIntro">No snack counter yet. Build one to start serving soda and popcorn, then unlock new foods as your alley levels up.</p><button data-tab="manage" class="primary">🔨 View expansions</button>`;
 const level=G.venueLevel(s);
 return `<div class="drawerCallout">${G.staffed(s,'snack')?'✅ Counter staffed and serving.':'🚨 Counter CLOSED: hire '+(G.neededStaff(s,'snack')-G.countStaff(s,'snack'))+' worker(s) in the Staff Room.'} <button data-tab="employees">👥 Staff Room →</button></div><p class="drawerIntro">Unlock more snacks by improving your alley. Each food has its <b>own stock</b>, price, and restock cost. Visitors really buy them during the day. <b>Orders arrive the following morning</b> — buy ahead!</p><section class="drawerCard"><div class="sectionhead"><h3>🍽️ Your Menu</h3><span class="badge warm">Alley level ${level}</span></div>${G.SNACKS.map(item=>{const unlocked=G.snackUnlocked(s,item.id),qty=s.snackStock[item.id],price=s.snackPrices[item.id];return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('snack.'+item.id,item.emoji)}</span><div class="menuInfo"><b>${esc(item.name)}</b><small>${unlocked?`In stock: ${qty} ${qty<=s.lowStockThreshold?'⚠️ LOW':''}`:`🔒 Unlock at alley level ${item.level}`}</small><small>${unlocked?`Sale price $${price} · ${G.incoming(s,'snack',item.id)?G.incoming(s,'snack',item.id)+' arriving tomorrow':'no delivery scheduled'}`:'Grow your alley to unlock'}</small></div>${unlocked?`<div class="menuActions"><div class="priceControl"><button class="mini" data-menu-price="${item.id}:-1" ${price<=item.price-2?'disabled':''}>−</button><strong>$${price}</strong><button class="mini" data-menu-price="${item.id}:1" ${price>=item.price+4?'disabled':''}>+</button></div><button data-restock="${item.id}" ${s.cash<item.cost?'disabled':''}>📦 Order +${item.pack} · ${cash(item.cost)}</button></div>`:'<span>🔒</span>'}</div>`}).join('')}</section><div class="drawerCallout">📦 Orders arrive NEXT MORNING. A Stock Clerk can automatically order when stock falls to your chosen low-stock threshold.</div>`;}
function laneDrawer(id){const l=s.lanes.find(x=>x.id===id);if(!l)return '<p>Lane unavailable.</p>';const active=s.sceneGroups.find(x=>x.location==='lane'+id);
 return `<p class="drawerIntro">Lane ${id} is maintained independently. Lanes wear down when used. Keep spare parts for an occasional service.</p><section class="drawerCard"><div class="sectionhead"><h3>🎳 Lane ${id}</h3><span class="badge ${l.condition<45?'warn':'good'}">${Math.round(l.condition)}% condition</span></div><div class="meter"><div style="width:${l.condition}%"></div></div><div class="drawerRow"><span>Current group</span><b>${active?esc(active.name)+` (${active.size})`:'Vacant'}</b></div><div class="drawerRow"><span>Spare parts</span><b>${s.parts}</b></div><button class="primary full" data-service="${id}" ${l.condition>=98||s.cash<20||s.parts<1?'disabled':''}>🔧 Service Lane ${id} · $20 + 1 part</button></section><section class="drawerCard"><h3>⚙️ Parts Room</h3><p class="small muted">Order five replacement parts for $45.</p><button data-buy-parts ${s.cash<45?'disabled':''}>📦 +5 spare parts · $45</button></section>`;}
function partsDrawer(){return `<p class="drawerIntro">There's no separate lane oil resource in v0.3. Each lane has its own condition rating; maintenance costs spare parts plus a small service fee.</p><section class="drawerCard"><h3>⚙️ Spare Parts <span class="badge">${s.parts} available</span></h3><button data-buy-parts class="primary" ${s.cash<45?'disabled':''}>Buy 5 parts · $45</button></section><div class="laneTiles">${s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}">🎳 Lane ${l.id}<br><b>${Math.round(l.condition)}% condition</b><div class="meter"><div style="width:${l.condition}%"></div></div>Tap to service →</button>`).join('')}</div>`;}
function benchesDrawer(){const cost=G.benchCost(s),max=s.benches>=3;return `<p class="drawerIntro">Guests wait for a lane when all lanes are busy. Benches provide <b>two comfortable group spots</b> each, with a longer waiting tolerance. They help, but more lanes still give you more capacity.</p>
 <section class="drawerCard"><h3>🪑 Waiting Area</h3><div class="statGrid"><div><small>Installed benches</small><strong>${s.benches}/3</strong></div><div><small>Queue capacity</small><strong>${G.waitCapacity(s)} groups</strong></div></div><p class="small muted">Groups without a bench leave after two waiting hours; seated groups can wait up to four.</p><button class="primary full" data-buy-bench ${max||s.cash<cost?'disabled':''}>${max?'✓ All benches installed':`+ Install bench · ${cash(cost)}`}</button></section>`;}
function adsDrawer(){const active=G.activeCampaign(s);return `<p class="drawerIntro">Choose one campaign at a time. Flyers are affordable; radio and TV bring stronger short-term visitor interest, but can overwhelm a small alley.</p>
 ${active?`<div class="drawerCallout">📣 <b>${esc(active.title)} running</b> · Through day ${active.endDay} · +${Math.round(active.boost*100)} percentage points to hourly arrival chance</div>`:''}
 <section class="drawerCard"><h3>📣 Advertising options</h3>${G.CAMPAIGNS.map(c=>`<div class="drawerRow advertRow"><div><b>${c.icon} ${esc(c.title)}</b><small>${esc(c.desc)}</small><small>+${Math.round(c.boost*100)} points arrival chance · ${c.days} days</small></div><button data-ad="${c.id}" ${active||s.cash<c.cost?'disabled':''}>${cash(c.cost)}</button></div>`).join('')}</section><p class="small muted">Advertising costs appear in operating expenses. More visitors only help when your lanes and waiting area can handle them.</p>`;}
function barDrawer(){if(!s.built.bar){const job=s.construction.find(j=>j.id==='bar');return `<p class="drawerIntro">Open the bar to serve beer and wine. Unlock new drinks by selling drinks, upgrading the alley, and expanding the room.</p><button data-tab="manage" class="primary">${job?'🚧 Under construction':'🔨 Build the bar'}</button>`;}
 const lv=G.venueLevel(s);
 return `<div class="drawerCallout">${G.staffed(s,'bar')?'✅ Bartenders on duty.':'🚨 Bar CLOSED: hire '+(G.neededStaff(s,'bar')-G.countStaff(s,'bar'))+' worker(s).'} <button data-tab="employees">👥 Staff Room →</button></div><p class="drawerIntro">Your bar has <b>${s.barVisits} lifetime drink sales</b>. Sell drinks to gain experience and unlock new recipes. Every drink has its own stock and price. <b>Supply orders arrive the next morning.</b></p><section class="drawerCard"><div class="sectionhead"><h3>🍹 Drink Menu</h3><span class="badge warm">Level ${lv} · ${s.barVisits} sales</span></div>${G.DRINKS.map(i=>{const unlocked=G.drinkUnlocked(s,i.id),stock=s.barStockById[i.id],price=s.barPrices[i.id],reason=i.expandedOnly&&s.roomTiers.bar!==2?'Expand the bar to 2 squares':`Needs alley Lv ${i.level} and ${i.visits} drink sales`;return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('drink.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${unlocked?`In stock ${stock} · ${G.incoming(s,'bar',i.id)} incoming ${stock<=s.lowStockThreshold?'⚠️ LOW':''}`:'🔒 '+reason}</small></div>${unlocked?`<div class="menuActions"><div class="priceControl"><button data-drink-price="${i.id}:-1" ${price<=i.price-2?'disabled':''}>−</button><strong>${cash(price)}</strong><button data-drink-price="${i.id}:1" ${price>=i.price+5?'disabled':''}>+</button></div><button data-drink-restock="${i.id}" ${s.cash<i.cost?'disabled':''}>📦 Order +${i.pack} · ${cash(i.cost)}</button></div>`:'🔒'}</div>`}).join('')}</section><div class="drawerCallout">🍺 ${s.today.barOrders} served today · ${cash(s.today.barIncome)} bar revenue</div>`;}
function arcadeDrawer(){if(!s.built.arcade)return '<p class="drawerIntro">Build the arcade to install pinball, then choose new machines as guests play.</p><button data-tab="manage" class="primary">🔨 View arcade construction</button>';
 const owned=Object.values(s.arcadeMachines).filter(Boolean).length,cap=s.roomTiers.arcade===2?5:3;
 return `<p class="drawerIntro">Buy arcade machines, earn money when a real guest plays one, and unlock new cabinets through <b>arcade visits</b>. ${s.arcadeVisits} plays so far.</p><section class="drawerCard"><div class="sectionhead"><h3>🕹️ Your Machines</h3><span class="badge warm">${owned}/${cap} slots</span></div>${G.MACHINES.map(i=>{const has=!!s.arcadeMachines[i.id],unlocked=G.machineUnlocked(s,i.id),reason=i.expandedOnly&&s.roomTiers.arcade!==2?'Requires a two-square arcade':`Needs alley Lv ${i.level} and ${i.plays} plays`;return `<div class="menuRow ${!has&&!unlocked?'lockedMenu':''}"><span class="menuEmoji">${icon('machine.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${has?`Installed · ${cash(i.fee)} per play`:unlocked?'Ready to purchase':'🔒 '+reason}</small></div><button data-machine="${i.id}" ${has||!unlocked||owned>=cap||s.cash<i.cost?'disabled':''}>${has?'✓ Owned':!unlocked?'🔒':cash(i.cost)}</button></div>`}).join('')}</section><div class="drawerCallout">👾 ${s.today.arcadePlays} plays today · Expand the arcade for more room and games.</div>`;}
function decorDrawer(){return `<p class="drawerIntro">Customize your building and add useful amenities. Wall paint is cosmetic; fixtures affect guest comfort and business performance.</p><section class="drawerCard"><h3>🎨 Wall Color</h3><div class="paintChoices">${G.PAINTS.map(i=>`<button data-paint="${i.id}" class="paintChoice ${s.wallPaint===i.id?'selected':''}" ${s.wallPaint===i.id||s.cash<i.cost?'disabled':''}><span class="paintSwatch paint-${i.id}"></span><b>${esc(i.name)}</b><small>${s.wallPaint===i.id?'✓ Current':cash(i.cost)}</small></button>`).join('')}</div></section><section class="drawerCard"><h3>🛋️ Fixtures & Decorations</h3>${G.FIXTURES.map(i=>`<div class="menuRow"><span class="menuEmoji">${icon('fixture.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${esc(i.desc)}</small></div><button data-fixture="${i.id}" ${s.fixtures[i.id]||s.cash<i.cost?'disabled':''}>${s.fixtures[i.id]?'✓ Installed':cash(i.cost)}</button></div>`).join('')}</section>`;}
function leagueHTML(){const c=G.calendar(s.day),active=s.league.active;return `<section class="panel leaguePanel"><div class="sectionhead"><div><h2>🎳 Thursday Night League</h2><p class="muted tiny">Weekly competition begins once all six lanes are built. Every Thursday, 6–8 PM.</p></div><span class="badge">Week ${c.week} · ${c.weekday}</span></div><div class="leagueOverview"><div><small>Open lanes</small><b>${G.lanes(s)}/6</b></div><div><small>League sessions</small><b>${s.league.sessions}</b></div><div><small>League income</small><b>${cash(s.league.totalRevenue)}</b></div></div>${active?`<div class="drawerCallout">✅ League active! All six lanes are reserved Thursday 6–8 PM for league bowlers. The weekly league earns fees at Thursday closing.</div>`:`<p class="muted small">${G.lanes(s)<6?'Build your remaining lanes to unlock weekly league nights.':'Six lanes ready! Start a league with a one-time $200 registration and marketing cost.'}</p><button class="primary" data-start-league ${G.lanes(s)<6||s.cash<200?'disabled':''}>${G.lanes(s)<6?'🔒 Unlock at six lanes':'📋 Register Thursday League · $200'}</button>`}</section>`;}
function diaryDrawer(){const openReport=s.today;const history=s.dayReports.filter(r=>r.day!==s.day).slice(0,14);return `<p class="drawerIntro">Every group has an arrival, lane or queue decision, and departure. Snack purchases are recorded individually. Your most recent 14 completed days are saved below.</p>
 <details class="diaryDay" open><summary>📅 Day ${s.day} ${s.hour>=G.CLOSE?'· Closed':'· In progress'} · ${s.today.arrivals} groups arrived</summary><div class="diaryEvents">${eventsHTML(openReport.events)}</div></details>
 ${history.map(r=>`<details class="diaryDay"><summary>📅 Day ${r.day} · ${r.served} bowled · ${cash(r.net)} net</summary><div class="diaryEvents">${reportCards(r)}<h3 style="margin:12px 0 6px">Guest comments</h3>${tipHTML(r)}<h3 style="margin:14px 0 6px">Hourly activity</h3>${eventsHTML(r.events)}</div></details>`).join('')}`;}
function renderDrawer(){if(!drawer)return;const scroll=$('drawerBody').scrollTop;let title='',sub='FACILITY',html='';
 if(drawer==='desk'){title='Front Desk';sub='PRICING & DAILY REPORT';html=deskDrawer();}
 else if(drawer==='snacks'){title='Snack Counter';sub='MENU & INVENTORY';html=snackDrawer();}
 else if(drawer==='diary'){title="Day's Story";sub='VISITOR ACTIVITY LOG';html=diaryDrawer();}
 else if(drawer==='parts'){title='Parts & Repairs';sub='OPERATIONS';html=partsDrawer();}
 else if(drawer==='benches'){title='Waiting Benches';sub='GUEST COMFORT';html=benchesDrawer();}
 else if(drawer==='ads'){title='Advertising';sub='ATTRACT CUSTOMERS';html=adsDrawer();}
 else if(drawer==='bar'){title='Bowling Bar';sub='DRINKS & STOCK';html=barDrawer();}
 else if(drawer.startsWith('lane')){title='Lane '+drawer.slice(4);sub='INDIVIDUAL MAINTENANCE';html=laneDrawer(Number(drawer.slice(4)));}
 else if(drawer==='arcade'){title='Arcade';sub='GAMES & MACHINES';html=arcadeDrawer();}
 else if(drawer==='decor'){title='Style & Amenities';sub='CUSTOMIZE YOUR ALLEY';html=decorDrawer();}
 else if(drawer==='shop'){title='Pro Shop';sub='TEAM EQUIPMENT';html='<p class="drawerIntro">Your pro shop sells equipment and fits custom bowling balls for your team. <b>'+ (G.staffed(s,'proshop')?'Clerk on duty.':'Closed until you hire '+(G.neededStaff(s,'proshop')-G.countStaff(s,'proshop'))+' clerk(s)!') +'</b></p><button class="full" data-tab="employees">👥 Hire staff</button><button class="full primary" data-tab="bowlers">👟 Equip your bowlers</button>';}
 if(G.ROOM_IDS.includes(drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer)&&s.built[drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer]){
  const roomId=drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer;
  const tier=s.roomTiers[roomId]||1,job=s.construction.find(j=>j.kind==='roomExpand'&&j.id===roomId),cost=G.expansionCost(roomId);
  const bonus={snack:'Adds pretzels and ice cream to the menu',bar:'More drink choices and more potential orders',proshop:'More equipment variety and stronger sales',arcade:'More games and additional arcade income'}[roomId];
  html+=`<section class="drawerCard"><h3>🧩 Floor Space · ${tier} square${tier===1?'':'s'}</h3><p class="muted small">${bonus}. Move the room for free in Alley Layout mode. Expansion occupies the square directly to its right.</p><button class="primary full" data-expand-room="${roomId}" ${tier===2||job||s.cash<cost?'disabled':''}>${tier===2?'✓ Expanded':job?'🚧 '+job.remaining+' days remaining':'⬜ Expand to 2 squares · '+cash(cost)+' · 2d'}</button><button class="full" data-room-move="${roomId}">✥ Move room on layout</button></section>`;
 }
 $('drawerTitle').textContent=title;$('drawerSub').textContent=sub;$('drawerBody').innerHTML=html;$('drawerBody').scrollTop=scroll;
}
function renderRoomGrid(){
 const grid=$('sceneRoomGrid'),tiles=[];const occupied=new Set();
 const info={snack:['🍿','Snacks'],bar:['🍹','Bar'],proshop:['🛍️','Pro Shop'],arcade:['🕹️','Arcade']};
 for(const id of G.ROOM_IDS){const pos=s.roomPlacements[id];if(!pos)continue;
  const w=G.footprint(s,id);for(let k=0;k<w;k++)occupied.add(`${pos.x+k},${pos.y}`);
  const live=s.built[id],building=s.construction.find(j=>j.id===id),[emoji,label]=info[id];
  const low=(id==='snack'?G.SNACKS.filter(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold).length:id==='bar'?G.DRINKS.filter(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold).length:0);const text=live?label:'🚧 '+label,iconKey=id==='proshop'?'world.proshop':'world.'+id;
  tiles.push(`<button class="roomTile ${live?'':'building'} ${movingRoom===id?'moving':''} ${w===2?'expanded':''}" style="grid-column:${pos.x+1} / span ${w};grid-row:${pos.y+1}" ${layoutMode?`data-room-move="${id}"`:`data-open="${id==='snack'?'snacks':id==='proshop'?'shop':id}"`} title="${layoutMode?'Select room to move':`Open ${label}`}">${icon(iconKey,emoji)}<strong>${esc(text)}</strong>${low?'<span class="tileLow">⚠ '+low+' LOW</span>':w===2?'<small>EXPANDED</small>':building?'<small>'+building.remaining+'d left</small>':''}</button>`);
 }
 for(let y=0;y<G.ROOM_ROWS;y++)for(let x=0;x<G.ROOM_COLS;x++)if(!occupied.has(`${x},${y}`))tiles.push(`<button class="roomTile roomEmpty ${layoutMode?'editing':''}" style="grid-column:${x+1};grid-row:${y+1}" ${layoutMode&&movingRoom?`data-place-room="${x}:${y}"`:''} aria-label="Empty square ${x+1},${y+1}">${layoutMode&&movingRoom?'+':icon('world.empty','·')}</button>`);
 grid.innerHTML=tiles.join('');
 $('toggleLayout').textContent=layoutMode?'✓ Done arranging':'✥ Rearrange rooms';$('toggleLayout').classList.toggle('primary',layoutMode);
 $('layoutHint').textContent=layoutMode?(movingRoom?'Tap an empty square to move '+info[movingRoom][1]+'. Two-square rooms need two free squares.':'Select any room to move, then tap an empty square.'):'Rooms occupy squares. Move them anytime, free.';
}
function chooseRoomMove(id){layoutMode=true;movingRoom=id;gotoTab('alley');renderRoomGrid();toast('Select an empty square for '+id+'.');}
function syncVisitors(events=[],instant=false){const layer=$('visitorLayer'),scene=$('scene'),box=scene.getBoundingClientRect();
 if(!box.width||!box.height)return;
 const center=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:((r.left+r.width/2)-box.left)/box.width*100,y:((r.top+r.height/2)-box.top)/box.height*100};};
 const entrance=center(scene.querySelector('.entranceDoor'))||{x:7,y:83};
 const desk=center($('sceneDesk'))||{x:18,y:45},wait=center($('sceneBenches'))||{x:21,y:72};
 const rooms={snack:center(scene.querySelector('[data-open="snacks"].roomTile')),bar:center(scene.querySelector('[data-open="bar"].roomTile')),arcade:center(scene.querySelector('[data-open="arcade"].roomTile')),shop:center(scene.querySelector('[data-open="shop"].roomTile'))};
 const arrivals=new Set(events.filter(e=>e.type==='arrival').map(e=>e.partyId));
 const visits=new Map();for(const e of events){if(['snack','bar','arcade','shop'].includes(e.type)&&e.partyId!=null)visits.set(String(e.partyId),e.type);}
 const desired=new Map(s.sceneGroups.map(p=>[String(p.id),p]));
 const stagedOut=new Set();
 for(const node of [...layer.children])if(node.dataset.party&&!desired.has(node.dataset.party)){
  const visit=visits.get(node.dataset.party),destination=rooms[visit];
  if(destination&&!instant){stagedOut.add(node.dataset.party);node.style.left=destination.x+'%';node.style.top=destination.y+'%';setTimeout(()=>{node.style.left=entrance.x+'%';node.style.top=entrance.y+'%';node.style.opacity='0';},1500);setTimeout(()=>node.remove(),2700);}
  else{node.style.left=entrance.x+'%';node.style.top=entrance.y+'%';node.style.opacity='0';setTimeout(()=>{if(node.isConnected&&!desired.has(node.dataset.party))node.remove();},1150);}
 }
 for(const [key,party] of desired){let node=layer.querySelector(`[data-party="${key}"]`);
  const id=Number(key);if(!node){node=document.createElement('div');node.className='visitor';node.dataset.party=key;node.style.left=entrance.x+'%';node.style.top=entrance.y+'%';node.style.opacity='1';node.style.setProperty('--shirt',['#ec9985','#c3a8e2','#8ed1bf','#a9cbed','#efcd83'][id%5]);
   const label=document.createElement('span');label.className='groupMarker';label.textContent='×'+party.size;node.append(label);
   if(assets['world.visitor']){const img=document.createElement('img');img.src=assets['world.visitor'];img.onerror=()=>img.remove();img.onload=()=>node.classList.add('hasImage');node.append(img);}layer.append(node);
  }
  const laneId=party.location.startsWith('lane')?Number(party.location.slice(4)):null;
  const target=laneId?center(scene.querySelector(`.laneScene[data-open="lane${laneId}"]`)):wait;
  if(!target)continue;
  const idTag=String(party.id);node.title=`${party.name}'s group → ${laneId?'Lane '+laneId:'waiting bench'}`;
  const place=dest=>{if(node.isConnected&&desired.has(idTag)){node.style.left=dest.x+'%';node.style.top=dest.y+'%';}};
  if(instant){place(target);continue;}
  if(arrivals.has(party.id)){setTimeout(()=>place(desk),70);const stop=rooms[visits.get(key)];if(stop)setTimeout(()=>place(stop),860);setTimeout(()=>place(target),stop?1860:1230);}else if(rooms[visits.get(key)]){place(rooms[visits.get(key)]);setTimeout(()=>place(target),1250);}else place(target);
 }
 // Animated walk-in customers for departures and immediate retail visits, even when no lane is assigned.
 if(!instant)for(const e of events.filter(e=>['snack','bar','arcade','shop'].includes(e.type)&&!desired.has(String(e.partyId))&&!stagedOut.has(String(e.partyId)))){
  const target=rooms[e.type];if(!target)continue;const ghost=document.createElement('div');ghost.className='visitor passingVisitor';ghost.style.left=entrance.x+'%';ghost.style.top=entrance.y+'%';ghost.style.opacity='1';ghost.innerHTML='<span class="groupMarker">●</span>';layer.append(ghost);setTimeout(()=>{ghost.style.left=target.x+'%';ghost.style.top=target.y+'%';},90);setTimeout(()=>{ghost.style.left=entrance.x+'%';ghost.style.top=entrance.y+'%';ghost.style.opacity='0';},1560);setTimeout(()=>ghost.remove(),2700);
 }
}
function showScene(){const lv=G.venueLevel(s);const phase=lv===1&&!s.built.roof?'backyard':lv<=2?'neighborhood':lv<=4?'league':'regional';$('scene').className='scene '+phase+' wall-'+s.wallPaint;
 const scenePath=assets['scene.'+phase];const img=$('sceneImage');if(scenePath){if(img.getAttribute('src')!==scenePath){img.hidden=true;img.src=scenePath;img.onload=()=>img.hidden=false;img.onerror=()=>img.hidden=true;}}else img.hidden=true;
 $('sceneMarquee').innerHTML=esc(G.venueName(s).toUpperCase())+'<small>OPEN FOR FUN!</small>';
 const wall=G.FIXTURES.filter(i=>s.fixtures[i.id]&&['tv','wallart','neon'].includes(i.id));const floor=G.FIXTURES.filter(i=>s.fixtures[i.id]&&!['tv','wallart','neon'].includes(i.id));
 $('sceneWallDecor').innerHTML=wall.map(i=>`<button data-open="decor" title="${esc(i.name)}" class="worldAmenity">${icon('fixture.'+i.id,i.emoji)}</button>`).join('');
 $('sceneFloorAmenities').innerHTML=floor.map(i=>`<button data-open="decor" title="${esc(i.name)}" class="worldAmenity">${icon('fixture.'+i.id,i.emoji)}</button>`).join('');
 for(const id of ['sceneSnack','sceneArcade','sceneShop','sceneBar'])$(id).classList.add('hidden');
 const available=G.SNACKS.filter(i=>G.snackUnlocked(s,i.id));$('sceneSnackStock').textContent=available.length?`${available.filter(x=>s.snackStock[x.id]>0).length}/${available.length} items stocked`:'Menu & stock';
 $('sceneBarStock').textContent=Object.values(s.barStockById).reduce((a,b)=>a+b,0)+' drinks';$('sceneBenchLabel').textContent=s.benches+' / 3 benches';
 const ad=G.activeCampaign(s);$('sceneAdsLabel').textContent=ad?ad.title:'Grow traffic';
 renderRoomGrid();
 const count=G.lanes(s),pending=G.pendingLanes(s);
 $('sceneLanes').innerHTML=Array.from({length:G.MAX_LANES},(_,i)=>{
  const id=i+1,l=s.lanes[i],job=s.construction.find(j=>j.kind==='lane'&&j.id==='lane'+id);
  if(l){const league=s.league.active&&G.calendar(s.day).dayIndex===3&&s.hour>=18&&s.hour<20;const occupant=s.sceneGroups.find(x=>x.location==='lane'+id),path=assets['world.lane'];return `<button class="laneScene" data-open="lane${id}" aria-label="Open lane ${id}, condition ${Math.round(l.condition)} percent">${path?`<img class="lane-image" src="${esc(path)}" alt="" onerror="this.remove()">`:''}<span class="laneDamage"><div style="width:${l.condition}%"></div></span><span class="laneNumber">${id}</span>${league?'<span class="laneAvatar">🏆</span>':occupant?'<span class="laneAvatar">🎳</span>':''}<span class="laneStatus">${league?'🏆 League':occupant?'🎳 In use':Math.round(l.condition)+'%'}</span></button>`;}
  if(job)return `<button class="laneGhost building" disabled aria-label="Lane ${id} under construction"><span class="ghostPlus">🚧</span><small>${job.remaining}d</small></button>`;
  const next=i===count+pending,price=G.nextLaneCost(s);return `<button class="laneGhost ${next?'nextLane':''}" ${next?'data-buy-lane="true"':''} ${next&&s.cash<price?'disabled':''} title="${next?'Build another lane for '+cash(price):'Future lane slot'}" aria-label="${next?'Order lane '+id+' for '+cash(price):'Future lane '+id}"><span class="ghostPlus">${next?'+':'·'}</span><small>${next?cash(price):'Future'}</small></button>`;
 }).join('');
 $('constructionRibbon').innerHTML=s.construction.length?`🚧 ${s.construction.length} project${s.construction.length===1?'':'s'} underway · ${esc(s.construction.map(j=>j.title+' ('+j.remaining+'d)').join(' · '))}`:'';
 $('occupancyCount').textContent=(s.sceneGroups.filter(x=>x.kind==='bowling').length+(s.league.active&&G.calendar(s.day).dayIndex===3&&s.hour>=18&&s.hour<20?6:0))+'/'+G.lanes(s);$('waitingCount').textContent=s.queue.length;
}
function renderAlley(){const level=G.venueLevel(s);$('venueName').textContent='Your Bowling Alley';$('levelLabel').textContent=`LEVEL ${level} · ${G.venueName(s).toUpperCase()}`;
 $('nextHour').textContent=s.hour>=G.CLOSE?'▶ Start next day':'▶ Next hour';$('toggleAuto').textContent=auto?'⏸ Auto on':'▶ Auto off';
 $('miniEvents').innerHTML=eventsHTML(s.today.events.slice(-8));
 const completed=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;
 $('hudStats').innerHTML=`<span class="datePill">📅 <b>W${G.calendar(s.day).week} ${G.calendar(s.day).weekday.slice(0,3)} · ${s.hour===G.CLOSE?'10 PM':G.formatHour(s.hour)}</b></span><span class="moneyPill">💵 <b>${cash(s.cash)}</b></span>`;
 const goals=G.nextLevelGoals(s);
 $('nextGoal').innerHTML=`<h2>${G.venueLevel(s)>=5?'LEGENDARY ALLEY!':'Level '+(G.venueLevel(s)+1)+' — '+G.LEVELS[G.venueLevel(s)+1]?.name}</h2><div class="goalChecklist">${goals.map(g=>typeof g==='string'?esc(g):`<div class="${g.done?'complete':''}">${g.done?'✅':'◻️'} ${esc(g.label)}</div>`).join('')}</div>`;
 $('goalLevelBadge').textContent='Alley Level '+G.venueLevel(s);
 $('goalSideQuests').innerHTML=`<div class="quest">🎳 <b>${G.lanes(s)}/6 lanes</b><small>${s.league.active?'League running!':'Six lanes unlock Thursday league nights'}</small></div><div class="quest">👥 <b>${s.employees.length} employees</b><small>Hire staff to open the counters</small></div><div class="quest">📦 <b>${s.deliveries.length} deliveries</b><small>All orders arrive next morning</small></div><div class="quest">🏆 <b>${completed}/4 trophies</b><small>Keep training your bowlers</small></div>`;
 const lowSnack=s.built.snack&&G.SNACKS.some(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold);
 const lowBar=s.built.bar&&G.DRINKS.some(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold);
 $('stockWarning').classList.toggle('hidden',!lowSnack&&!lowBar);
 $('stockWarning').textContent=lowSnack?'⚠ Snacks running low':'⚠ Bar stock running low';
 $('stockWarning').dataset.open=lowSnack?'snacks':'bar';
 showScene();
}
function renderManage(){$('upgradeCount').textContent=`${G.UPGRADES.filter(x=>s.built[x.id]).length}/${G.UPGRADES.length} opened`;
 $('manageParts').textContent=`${s.parts} spare parts`;
 $('manageSnack').querySelector('small').textContent=s.built.snack?'Recipes & stock':G.isBuilding(s,'snack')?'Under construction':'Build a counter to unlock';
 $('manageBenches').textContent=`${s.benches}/3 benches · ${G.waitCapacity(s)} groups waiting`;
 $('manageAds').textContent=G.activeCampaign(s)?.title||'Flyers, radio, television';$('manageBar').textContent=s.built.bar?`${s.barVisits} drinks sold · ${s.barStock} in stock`:'Build your drinks counter';
 $('installedAmenities').innerHTML=G.FIXTURES.filter(i=>s.fixtures[i.id]).map(i=>`<span>${i.emoji} ${esc(i.name)}</span>`).join('')||'<span>✨ No amenities yet · Add your first!</span>'; $('sceneFixtures').textContent=G.FIXTURES.filter(i=>s.fixtures[i.id]).length+' amenities';
 $('constructionCount').textContent=s.construction.length+' underway';
 $('constructionList').innerHTML=s.construction.length?s.construction.map(j=>`<div class="constructionItem"><b>🚧 ${esc(j.title)}</b><div class="meter"><div style="width:${(j.total-j.remaining)/j.total*100}%"></div></div><small class="muted">${j.remaining} day${j.remaining===1?'':'s'} remaining · Opens after closing</small></div>`).join(''):'<p class="muted small">No active construction. New rooms take a few days to finish; your existing lanes keep earning while you build.</p>';
 $('laneStatus').textContent=G.lanes(s)+' open · '+G.pendingLanes(s)+' building';
 $('laneTiles').innerHTML=s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}"><div class="drawerRow"><span>🎳 Lane ${l.id}</span><b>${Math.round(l.condition)}%</b></div><div class="meter"><div style="width:${l.condition}%"></div></div><small class="muted">${l.condition<48?'Needs service':'Tap to inspect & service'}</small></button>`).join('');
 $('roomUpgradeList').innerHTML=G.ROOM_IDS.filter(id=>s.built[id]).map(id=>{const tier=s.roomTiers[id]||1,job=s.construction.find(j=>j.kind==='roomExpand'&&j.id===id),u=G.getUpgrade(id),cost=G.expansionCost(id);return `<div class="roomUpgradeRow"><strong>${esc(u.icon+' '+u.title)}</strong><small>${tier===2?'Expanded · 2 squares':job?'🚧 '+job.remaining+' days remaining':'1 square'}</small><button data-expand-room="${id}" ${tier===2||job||s.cash<cost?'disabled':''}>${tier===2?'✓ Done':job?'Building':cash(cost)+' · 2d'}</button></div>`;}).join('')||'<p class="muted small">Build a snack counter, bar, pro shop, or arcade to start arranging the floor.</p>';
 const max=G.lanes(s)+G.pendingLanes(s)>=G.MAX_LANES;const cost=G.nextLaneCost(s);$('buyLane').disabled=max||s.cash<cost;$('buyLane').textContent=max?'✓ Six lane slots filled':`+ Build lane ${G.lanes(s)+G.pendingLanes(s)+1} · ${cash(cost)} · 2 days`;
 $('upgradeTiles').innerHTML=G.UPGRADES.map(u=>{const done=!!s.built[u.id],job=s.construction.find(j=>j.kind==='upgrade'&&j.id===u.id),miss=u.requires.find(r=>!s.built[r]);return `<article class="upgrade ${done?'done':''}">${icon('upgrade.'+u.id,u.icon)}<h3>${esc(u.title)}</h3><p>${esc(u.desc)}</p><button data-build="${u.id}" ${done||job||miss||s.cash<u.cost?'disabled':''}>${done?'✓ OPEN':job?'🚧 '+job.remaining+'d left':miss?'🔒 '+esc(G.getUpgrade(miss).title):cash(u.cost)+' · '+u.days+'d'}</button></article>`;}).join('');
}
function renderBowlers(){if(!s.bowlers.some(b=>b.id===selectedBowler))selectedBowler=s.bowlers[0].id;
 $('recruit').disabled=s.cash<320||G.lanes(s)<2||s.bowlers.length>=4;
 $('roster').innerHTML=s.bowlers.map(b=>`<button class="rosterChoice ${b.id===selectedBowler?'active':''}" data-bowler="${esc(b.id)}">${icon('bowler.'+b.id,'👤','portrait')}<span><b>${esc(b.name)}</b><small>Average ${G.avg(b)}</small></span></button>`).join('');
 const b=s.bowlers.find(x=>x.id===selectedBowler);
 $('bowlerDetail').innerHTML=`<div class="athleteBanner">${icon('bowler.'+b.id,'👤','portrait')}<div><h2>${esc(b.name)}</h2><span class="badge">Projected average ${G.avg(b)}</span> <span class="badge ${b.ball?'good':''}">${b.ball?'🎳 Custom-fitted ball':'Standard house ball'}</span></div></div><div class="skillGrid">${[['aim','🎯 Aim'],['spare','🎳 Spares'],['power','💪 Power'],['focus','🧠 Focus']].map(([key,label])=>`<div class="skillBox"><div class="skillTop"><b>${label}</b><b>${b[key]}/95</b></div><div class="meter"><div style="width:${b[key]/95*100}%"></div></div><button data-train="${b.id}:${key}" ${b[key]>=95||s.cash<G.trainCost(s,b.id,key)?'disabled':''}>+ Train · ${cash(G.trainCost(s,b.id,key))}</button></div>`).join('')}</div><div style="margin-top:15px"><button data-ball="${b.id}" ${!s.built.proshop||b.ball||s.cash<170?'disabled':''}>${b.ball?'✓ Ball fitted':'🎳 Custom ball · $170'}</button> <span class="muted small">${!s.built.proshop?'Unlock Pro Shop for custom equipment.':'A better ball boosts this bowler’s projected average.'}</span></div>`;
}
function renderTournaments(){$('leagueBoard').innerHTML=leagueHTML();const count=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;$('trophyCount').textContent=count+' / 4 trophies';$('tournamentsList').innerHTML=G.TOURNAMENTS.map(t=>{const missing=G.eligibility(s,t),wins=s.tournamentWins[t.id]||0;return `<article class="tournament">${icon('misc.trophy',wins?'🥇':'🏆')}<div><h3>${esc(t.title)}${wins?' ✓':''}</h3><p>Team avg ${G.teamAvg(s)}/${t.needAvg} · Rep ${Math.floor(s.rep)}/${t.needRep}</p><p>Entry ${cash(t.fee)} · Prize ${cash(t.firstPrize)}</p><p>${missing.length?'🔒 '+esc(missing.join(' · ')):'✅ Ready to compete'}</p></div><button data-tour="${t.id}" ${missing.length?'disabled':''}>Compete</button></article>`;}).join('');$('practiceCount').textContent=`${s.practiceLeft} rolls remaining`;$('roll').disabled=s.practiceLeft<=0;}
function renderYou(){const level=1+Math.floor(s.ownerXP/60),progress=s.ownerXP%60;$('ownerLevel').textContent='LEVEL '+level;$('ownerPoints').textContent=s.ownerPoints+' skill points';$('ownerXPLabel').textContent=progress+' / 60 XP to next level';$('ownerBar').style.width=progress/60*100+'%';$('ownerTitle').textContent=level<3?'Rookie Owner':level<6?'Neighborhood Favorite':level<10?'Community Legend':'Bowling Tycoon';
 $('ownerSkills').innerHTML=G.PLAYER_SKILLS.map(k=>`<div class="ownerSkill"><div><h3>${esc(k.label)} · Lv ${s.ownerSkills[k.id]}/6</h3><p>${esc(k.desc)}</p></div><button data-owner="${k.id}" ${s.ownerPoints<=0||s.ownerSkills[k.id]>=6?'disabled':''}>+ Improve</button></div>`).join('');
 if(assets['misc.owner']){$('ownerArt').innerHTML=`<img src="${esc(assets['misc.owner'])}" alt="Your game character" onerror="this.remove()">`;}else $('ownerArt').replaceChildren();}
function showBuildSection(){document.querySelectorAll('[data-section]').forEach(el=>el.classList.toggle('active',el.dataset.section===buildSection));document.querySelectorAll('[data-build-section]').forEach(b=>b.classList.toggle('active',b.dataset.buildSection===buildSection));}
function renderEmployees(){let wage=s.employees.reduce((n,e)=>n+e.wage,0);
 $('staffPayBadge').textContent=cash(wage)+' / day payroll';
 $('staffRoles').innerHTML=Object.entries(G.EMPLOYEE_ROLES).map(([id,r])=>{
  const required=G.neededStaff(s,id),count=G.countStaff(s,id),eligible=id==='stocker'?s.built.snack||s.built.bar:!!s.built[id],filled=!!eligible&&count>=required;
  return `<article class="staffRole panel"><h3>${id==='snack'?'🍿':id==='bar'?'🍺':id==='proshop'?'🎳':'📦'} ${esc(r.name)}</h3><b>${eligible?count+'/'+required+' staffed':'🔒 Locked'}</b><p>${!eligible?'Build the room first':id==='stocker'?'Optional · orders low inventory automatically':filled?'✅ Open for business!':'⚠️ Closed until fully staffed'}</p><button data-hire="${id}" ${!eligible||filled||s.cash<r.fee?'disabled':''}>${!eligible?'🔒 Build first':filled?'✓ Crew complete':`Hire · ${cash(r.fee)}`}</button></article>`;
 }).join('');
 $('deliveryBadge').textContent=s.deliveries.length+' packages en route';
 $('stockControls').innerHTML=`<p>Low stock means <b>${s.lowStockThreshold} or fewer</b> units. The Stock Clerk places orders at closing; deliveries arrive the following morning.</p><div class="thresholdControl"><b>Low stock trigger</b><button data-threshold="-1" ${s.lowStockThreshold<=1?'disabled':''}>−</button><strong>${s.lowStockThreshold}</strong><button data-threshold="1" ${s.lowStockThreshold>=12?'disabled':''}>+</button></div><div class="deliveryList">${s.deliveries.length?s.deliveries.map(d=>`<div>📦 ${esc(d.name)} ×${d.amount} · Week ${G.calendar(d.arriveDay).week}, ${G.calendar(d.arriveDay).weekday}</div>`).join(''):'📭 No deliveries currently scheduled'}</div>`;
 $('staffList').innerHTML=s.employees.length?s.employees.map(e=>`<div class="employeeCard"><div class="employeePortrait">${icon('employee.'+e.role,e.role==='snack'?'🍿':e.role==='bar'?'🍹':e.role==='proshop'?'🎳':'📦')}</div><div class="employeeDetails"><h3>${esc(e.name)} <small>Lv ${e.skill}</small></h3><p>${esc(G.EMPLOYEE_ROLES[e.role].name)} · Happiness ${Math.round(e.morale)}%</p><div class="moraleMeter"><div style="width:${e.morale}%"></div></div><div class="wageControl"><span>Daily pay:</span><button data-wage="${e.id}:-1" ${e.wage<=8?'disabled':''}>−</button><b>${cash(e.wage)}</b><button data-wage="${e.id}:1" ${e.wage>=32?'disabled':''}>+</button><button data-train-staff="${e.id}" ${e.skill>=3||s.cash<65+e.skill*35?'disabled':''}>${e.skill>=3?'✓ Trained':'🎓 Train · '+cash(65+e.skill*35)}</button></div></div></div>`).join(''):'<div class="staffEmpty">🫠 It’s just you and a lot of unpaid bowling pins. Hire someone when a counter opens.</div>';
}
function render(){renderAlley();renderManage();renderBowlers();renderTournaments();renderYou();renderEmployees();showBuildSection();$('skipSummarySetting').checked=skipSummaries;}
function closeSummary(startTomorrow=true){$('daySummaryBackdrop').classList.add('hidden');summaryOpen=false;
 if(startTomorrow&&s.hour===G.CLOSE)G.startNextDay(s);lastTick=Date.now();render();save();if(pendingCutscene){const level=pendingCutscene;pendingCutscene=null;showCutscene(level);}}
function openSummary(report){if(!report)return;summaryOpen=true;
 $('daySummaryTitle').textContent=`Week ${G.calendar(report.day).week} · ${G.calendar(report.day).weekday} complete!`;
 const feedback=report.feedback||[];
 const daily=[['Visitors',report.arrivals],['Bowled',report.served],['Stormed out',report.left]];
 if(report.walkIns)daily.push(['Food & fun only',report.walkIns]);
 if((report.facilities?report.facilities.snack:s.built.snack))daily.push(['Snack orders',report.snackOrders||0]);
 if((report.facilities?report.facilities.bar:s.built.bar))daily.push(['Bar drinks',report.barOrders||0]);
 if((report.facilities?report.facilities.arcade:s.built.arcade))daily.push(['Arcade plays',report.arcadePlays||0]);
 if(s.league.active||report.leagueHeld)daily.push(['League revenue',cash(report.leagueIncome||0)]);
 if(report.staffPay)daily.push(['Staff wages',cash(report.staffPay)]);
 if(report.capex)daily.push(['Spent building',cash(report.capex)]);
 $('daySummaryBody').innerHTML=`<div class="summaryHeadline"><span>📣 THE LAST PIN HAS FALLEN</span><strong class="${report.net>=0?'positive':'negative'}">${cash(report.net)} operating net</strong></div>
 <div class="summaryGrid">${daily.map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
 <h3 class="summarySubtitle">🎤 Overheard at the alley</h3>${feedback.length?feedback.slice(-2).map(x=>`<div class="review">💬 ${esc(x)}</div>`).join(''):'<p class="muted small">"Nothing fell apart today. I can live with that." — Your accountant</p>'}
 <p class="muted tiny">Daily operating net includes wages and supply purchases; construction costs are shown separately.</p>`;
 $('skipFutureSummaries').checked=skipSummaries;
 $('daySummaryBackdrop').classList.remove('hidden');$('summaryContinue').focus();}
const TUTORIAL_STEPS=[
 {icon:'👆',title:'Everything is tappable!',body:'This is your bowling alley. Tap the front desk to change prices, tap the waiting area for benches, and tap a snack counter or bar to manage its menu.',tip:'Tip: Try tapping a building or lane in the alley picture.'},
 {icon:'🎳',title:'Keep your lanes rolling',body:'Guests use a lane for one game hour. Lanes wear out over time. Tap a lane to check its condition and service it using spare parts. Build extra lanes when the queue gets long.',tip:'Tip: Build → Your Lanes shows every lane in one place.'},
 {icon:'⏰',title:'Run the clock',body:'Your alley opens at 2 PM and closes at 10 PM. Use Next hour or Finish day, or turn on Auto. Your closing report shows how the business did, then you can start the next day.',tip:'Tip: The current week, day, time and cash stay at the top.'},
 {icon:'🗂️',title:'Where to find things',body:'Alley is your live scene. Build has construction, lanes and decorations. Bowlers lets you train your team; Compete has tournaments and leagues. Staff hires workers, You upgrades your skills, and Goals tracks progress.',tip:'Tip: Swipe the top row of tabs if your screen is narrow. Tap ? any time to reopen this guide.'}
];
function renderTutorial(){const t=TUTORIAL_STEPS[tutorialStep];$('tutorialStepLabel').textContent=(tutorialStep+1)+' OF '+TUTORIAL_STEPS.length;$('tutorialEmoji').textContent=t.icon;$('tutorialTitle').textContent=t.title;$('tutorialText').textContent=t.body;$('tutorialTip').textContent=t.tip;$('tutorialBack').disabled=tutorialStep===0;$('tutorialNext').textContent=tutorialStep===TUTORIAL_STEPS.length-1?"Let's roll! 🎳":'Next →';$('tutorialDots').innerHTML=TUTORIAL_STEPS.map((_,i)=>`<span class="${i===tutorialStep?'active':''}"></span>`).join('');}
function showTutorial(start=0){tutorialOpen=true;tutorialStep=start;renderTutorial();$('tutorialBackdrop').classList.remove('hidden');$('tutorialNext').focus();lastTick=Date.now();}
function closeTutorial(){tutorialOpen=false;tutorialSeen=true;$('tutorialBackdrop').classList.add('hidden');lastTick=Date.now();save();}
$('openTutorial').onclick=()=>showTutorial();$('tutorialSkip').onclick=closeTutorial;$('tutorialBack').onclick=()=>{if(tutorialStep>0){tutorialStep--;renderTutorial();}};$('tutorialNext').onclick=()=>{if(tutorialStep>=TUTORIAL_STEPS.length-1)closeTutorial();else{tutorialStep++;renderTutorial();}};
function showCutscene(level){cutsceneOpen=true;introSeen=true;introCutscene=level===1;const intro=level===1;
 const headings={1:'A dirt lane and a dream!',2:'We have walls!',3:'A real neighborhood favorite!',4:'The town is talking!',5:'Bowling empire unlocked!'};
 const captions={1:'A little dirt, a few pins, and plenty of ambition. Every great alley begins somewhere.',2:'From muddy beginnings to a covered center. Listen to that roof go up!',3:'More people, more lanes, more possibilities.',4:'A bigger, busier bowling destination. The competitors are noticing.',5:'Lights, lanes, and legends. You built something special.'};
 $('cutsceneTitle').textContent=headings[level]||'A new era of bowling!';$('cutsceneCaption').textContent=captions[level]||'Your bowling center has leveled up!';
 const art=$('cutsceneArt');art.className='cutsceneArt level-'+level;
 const key=level===1?'cutscene.dirt':'cutscene.level'+level;
 art.style.setProperty('--cutscene-image',assets[key]?`url("${assets[key].replace(/"/g,'')}")`:'none');
 $('cutsceneBuilding').lastElementChild.textContent=level===1?'DIRT ROAD BOWLING':G.venueName(s).toUpperCase();
 $('cutsceneContinue').textContent=intro?'Open your alley →':'Continue the adventure →';
 $('cutsceneBackdrop').classList.remove('hidden');save();}
function endCutscene(){$('cutsceneBackdrop').classList.add('hidden');cutsceneOpen=false;lastTick=Date.now();save();if(introCutscene&&!tutorialSeen)showTutorial();introCutscene=false;}
function checkClosing(result,oldLevel){if(result.dayEnded){const newLevel=G.venueLevel(s);if(newLevel>lastAnnouncedLevel){pendingCutscene=newLevel;lastAnnouncedLevel=newLevel;}
 if(!skipSummaries)openSummary(s.lastDay);else{if(pendingCutscene){const lvl=pendingCutscene;pendingCutscene=null;showCutscene(lvl);}else if(!auto)toast(`Day ${s.day} closed. Next hour starts tomorrow.`);}}
}
$('cutsceneContinue').onclick=endCutscene;$('cutsceneSkip').onclick=endCutscene;
$('summaryContinue').onclick=()=>closeSummary(true);
$('closeSummary').onclick=()=>closeSummary(true);
$('summaryDesk').onclick=()=>{closeSummary(true);openDrawer('desk');};
$('skipFutureSummaries').onchange=e=>{skipSummaries=e.target.checked;$('skipSummarySetting').checked=skipSummaries;save();};
$('skipSummarySetting').onchange=e=>{skipSummaries=e.target.checked;save();};
$('daySummaryBackdrop').onclick=e=>{if(e.target===$('daySummaryBackdrop'))closeSummary(true);};
function stepHour(manual=false){if(summaryOpen||cutsceneOpen||tutorialOpen)return;const oldLevel=G.venueLevel(s),result=G.tickHour(s);lastTick=Date.now();render();syncVisitors(result.events);save();checkClosing(result,oldLevel);
 if(manual&&!result.dayEnded)toast(`${G.formatHour(result.hour)}–${G.formatHour(result.hour+1)} · ${result.events.filter(x=>x.type==='arrival').length} group arrivals.`);
 if(drawer)renderDrawer();return result;}
function finishDay(){if(summaryOpen||cutsceneOpen||tutorialOpen)return;const oldLevel=G.venueLevel(s);let count=0,result;do{result=G.tickHour(s);count++;}while(!result.dayEnded&&count<9);
 lastTick=Date.now();render();syncVisitors(result.events);save();if(drawer)renderDrawer();checkClosing(result,oldLevel);}
$('nextHour').onclick=()=>stepHour(true);$('endDay').onclick=finishDay;$('toggleAuto').onclick=()=>{auto=!auto;lastTick=Date.now();render();save();toast(auto?'Auto time resumed.':'Auto time paused.');};$('recruit').onclick=()=>perform(G.recruit(s),'Welcome to the team!');$('save').onclick=()=>{save();toast('Game saved to this browser.');};
$('reset').onclick=()=>{if(confirm('Start over? Your current save will be replaced.')){s=G.newGame();lastTick=Date.now();auto=true;summaryOpen=false;skipSummaries=false;introSeen=true;tutorialSeen=false;pendingCutscene=null;layoutMode=false;movingRoom=null;lastAnnouncedLevel=1;$('daySummaryBackdrop').classList.add('hidden');$('visitorLayer').replaceChildren();save();render();gotoTab('alley');showCutscene(1);}};
$('closeDrawer').onclick=closeDrawer;$('drawerBackdrop').onclick=closeDrawer;document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(tutorialOpen)closeTutorial();else if(cutsceneOpen)endCutscene();else if(summaryOpen)closeSummary(true);else if(drawer)closeDrawer();}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.id==='toggleLayout'){layoutMode=!layoutMode;movingRoom=null;if(layoutMode){gotoTab('alley');$('exitLayout').classList.remove('hidden');}else $('exitLayout').classList.add('hidden');renderRoomGrid();return;}
 if(b.dataset.roomMove){if(!s.built[b.dataset.roomMove]&&!G.isBuilding(s,b.dataset.roomMove))return;closeDrawer();layoutMode=true;movingRoom=b.dataset.roomMove;gotoTab('alley');$('exitLayout').classList.remove('hidden');renderRoomGrid();toast('Tap an empty floor square to move your '+b.dataset.roomMove+'.');return;}
 if(b.dataset.placeRoom){const [x,y]=b.dataset.placeRoom.split(':').map(Number);if(perform(G.moveRoom(s,movingRoom,x,y),'Room moved!')){movingRoom=null;renderRoomGrid();}return;}
 if(b.dataset.expandRoom){perform(G.expandRoom(s,b.dataset.expandRoom),'Room expansion started!');return;}
 if(b.dataset.buildSection){buildSection=b.dataset.buildSection;showBuildSection();save();return;}
 if(b.id==='exitLayout'){layoutMode=false;movingRoom=null;renderRoomGrid();$('exitLayout').classList.add('hidden');return;}
 if(b.dataset.hire){perform(G.hireEmployee(s,b.dataset.hire),'New hire! Somebody tell the pins.');return;}
 if(b.dataset.wage){const [id,d]=b.dataset.wage.split(':');const e=s.employees.find(x=>x.id===Number(id));if(e)perform(G.setWage(s,id,e.wage+Number(d)));return;}
 if(b.dataset.trainStaff){perform(G.trainEmployee(s,b.dataset.trainStaff),'Employee leveled up!');return;}
 if(b.dataset.threshold){perform(G.setStockThreshold(s,s.lowStockThreshold+Number(b.dataset.threshold)),'Low-stock trigger adjusted.');return;}
 if(b.dataset.tab){gotoTab(b.dataset.tab);return;}
 if(b.dataset.open){openDrawer(b.dataset.open);return;}
 if(b.dataset.build){const u=G.getUpgrade(b.dataset.build);perform(G.build(s,b.dataset.build),u.title+' construction started!');return;}
 if(b.dataset.buyLane!==undefined){perform(G.buyLane(s),'Your new lane is under construction!');return;}
 if(b.dataset.buyBench!==undefined){perform(G.buyBench(s),'A waiting bench was installed!');return;}
 if(b.dataset.ad){perform(G.advertise(s,b.dataset.ad),'Advertising campaign started!');return;}
 if(b.dataset.restockBar!==undefined){perform(G.restockBar(s),'Beer restocked.');return;}
 if(b.dataset.drinkRestock){perform(G.restockDrink(s,b.dataset.drinkRestock),'Drink delivery booked for tomorrow morning!');return;}
 if(b.dataset.drinkPrice){const [id,v]=b.dataset.drinkPrice.split(':');perform(G.setDrinkPrice(s,id,s.barPrices[id]+Number(v)));return;}
 if(b.dataset.machine){perform(G.buyMachine(s,b.dataset.machine),'New arcade machine installed!');return;}
 if(b.dataset.fixture){perform(G.buyFixture(s,b.dataset.fixture),'Your alley has a new fixture!');return;}
 if(b.dataset.paint){perform(G.paintWall(s,b.dataset.paint),'Freshly painted!');return;}
 if(b.dataset.startLeague!==undefined){perform(G.startLeague(s),'Your weekly league is now open!');return;}
 if(b.dataset.barPrice){perform(G.setBarPrice(s,s.barPrice+Number(b.dataset.barPrice)));return;}
 if(b.dataset.buyParts!==undefined){perform(G.buyParts(s),'Spare parts restocked.');return;}
 if(b.dataset.service){perform(G.serviceLane(s,Number(b.dataset.service)),'Lane '+b.dataset.service+' serviced.');return;}
 if(b.dataset.restock){perform(G.restockSnack(s,b.dataset.restock),'Order placed! Delivery tomorrow morning.');return;}
 if(b.dataset.price){const [k,v]=b.dataset.price.split(':');perform(G.setPrice(s,k,s.pricing[k]+Number(v)));return;}
 if(b.dataset.menuPrice){const [k,v]=b.dataset.menuPrice.split(':');perform(G.setSnackPrice(s,k,s.snackPrices[k]+Number(v)));return;}
 if(b.dataset.bowler){selectedBowler=b.dataset.bowler;renderBowlers();return;}
 if(b.dataset.train){const [id,k]=b.dataset.train.split(':');perform(G.train(s,id,k),'Training complete!');return;}
 if(b.dataset.ball){perform(G.fitBall(s,b.dataset.ball),'Custom ball fitted!');return;}
 if(b.dataset.owner){perform(G.spendOwnerPoint(s,b.dataset.owner),'Owner skill improved!');return;}
 if(b.dataset.tour){const r=G.tournament(s,b.dataset.tour);perform(r,r.ok?(r.won?'🏆 Championship won!':'Your team fought hard!')+` ${r.score}–${r.rival}`:null);return;}
});
for(const k of ['angle','spin','power']){$(k).oninput=()=>{$('v'+k[0].toUpperCase()+k.slice(1)).textContent=$(k).value+(k==='power'?'%':'');};$(k).dispatchEvent(new Event('input'));}
$('roll').onclick=()=>{const r=G.bowlShot(s,$('angle').value,$('spin').value,$('power').value);if(perform(r))$('shotResult').textContent=r.result;};
// Each simulated hour updates real groups. The summary pauses Auto unless explicitly skipped.
// Offline progress stops at the first unsummarized closing to avoid silently losing reports.
const savedNow=Date.now();if(introSeen&&s.hour===G.CLOSE&&!skipSummaries&&s.lastDay.day===s.day)openSummary(s.lastDay);
if(auto&&introSeen&&!summaryOpen&&!tutorialOpen){const hours=Math.min(MAX_OFFLINE_HOURS,Math.floor(Math.max(0,savedNow-lastTick)/MS_HOUR));
 if(hours){for(let i=0;i<hours;i++){const lv=G.venueLevel(s),r=G.tickHour(s);if(r.dayEnded){if(G.venueLevel(s)>lastAnnouncedLevel){pendingCutscene=G.venueLevel(s);lastAnnouncedLevel=G.venueLevel(s);}if(!skipSummaries){openSummary(s.lastDay);break;}if(pendingCutscene)break;}}lastTick=Date.now();save();}}
setInterval(()=>{const now=Date.now();if(auto&&!summaryOpen&&!cutsceneOpen&&!tutorialOpen&&now-lastTick>=MS_HOUR){const lv=G.venueLevel(s);const result=G.tickHour(s);lastTick=now;render();syncVisitors(result.events);if(drawer)renderDrawer();save();checkClosing(result,lv);}
},160);
render();gotoTab(tab);syncVisitors([],true);
if(!introSeen){showCutscene(1);}else if(!tutorialSeen&&!summaryOpen){showTutorial();}else if(pendingCutscene&&!summaryOpen){const lv=pendingCutscene;pendingCutscene=null;showCutscene(lv);}
if(s.hour===G.CLOSE&&!summaryOpen&&!skipSummaries)openSummary(s.lastDay);
save();
})();
