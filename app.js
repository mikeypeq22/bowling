/* From Gutter to Glory v1.01 — visual game controller. Gameplay lives in engine.js. */
(()=>{'use strict';
const G=window.BowlingCore;
let KEY='gutter-to-glory-v091-demo',BACKUP='gutter-to-glory-backup-v091-demo';const PREVIOUS='gutter-to-glory-v09',LEGACY='gutter-to-glory-v07',UIKEY='gutter-to-glory-ui-v09',OLDUI='gutter-to-glory-ui-v08';
const MS_HOUR=5200,MAX_OFFLINE_HOURS=24;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const darkCenter=()=>s.campaignStory?.path==='backalley';
const roomName=id=>darkCenter()?({arcade:'Casino Lounge',bar:'Speakeasy',snack:'Night Grill',proshop:'Backroom Outfitters'})[id]||id:({arcade:'Arcade',bar:'Bowling Bar',snack:'Snack Counter',proshop:'Pro Shop'})[id]||id;
const cash=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString();
const defaultAssets={
 'scene.backyard':'assets/venue-backyard.png','scene.empty':'assets/venue-empty.png','scene.neighborhood':'assets/venue-neighborhood.png','scene.league':'assets/venue-league.png','scene.regional':'assets/venue-regional.png',
 'facility.snack.tier1':'assets/facility-snack-tier1.png','facility.snack.tier2':'assets/facility-snack-tier2.png','facility.bar.tier1':'assets/facility-bar-tier1.png','facility.bar.tier2':'assets/facility-bar-tier2.png','facility.arcade.tier1':'assets/facility-arcade-tier1.png','facility.arcade.tier2':'assets/facility-arcade-tier2.png','facility.proshop.tier1':'assets/facility-proshop-tier1.png','facility.proshop.tier2':'assets/facility-proshop-tier2.png','world.lane':'assets/lane.png','world.desk':'assets/front-desk.png','world.snack':'assets/snack-counter.png','world.arcade':'assets/arcade.png','world.proshop':'assets/pro-shop.png','world.visitor':'assets/customer.png','world.bar':'assets/bar.png','world.benches':'assets/benches.png','world.ads':'assets/advertising.png','world.empty':'assets/floor-tile.png','cutscene.dirt':'assets/cutscene-dirt.png','cutscene.level2':'assets/cutscene-level2.png','cutscene.level3':'assets/cutscene-level3.png','cutscene.level4':'assets/cutscene-level4.png','cutscene.level5':'assets/cutscene-level5.png',
 'nav.alley':'assets/nav-alley.png','nav.manage':'assets/nav-manage.png','nav.bowlers':'assets/nav-bowlers.png','nav.tournaments':'assets/nav-tournaments.png','nav.you':'assets/nav-you.png','nav.employees':'assets/nav-employees.png','nav.goals':'assets/nav-goals.png',
 'patron.lou':'assets/patron-lou.png','patron.bea':'assets/patron-bea.png','patron.dex':'assets/patron-dex.png','patron.rosa':'assets/patron-rosa.png','patron.nell':'assets/patron-nell.png','patron.milo':'assets/patron-milo.png',
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
let s=G.newGame(),auto=true,tab='alley',buildSection='construction',drawer=null,selectedBowler='maya',lastTick=Date.now(),timerToast=null,summaryOpen=false,skipSummaries=false,introSeen=false,layoutMode=false,movingRoom=null,cutsceneOpen=false,pendingCutscene=null,tutorialSeen=false,tutorialOpen=false,tutorialStep=0,introCutscene=false,hadSavedGame=false,hadNewUI=false,welcomeOpen=false,hadBrokenSave=false,saveSource=null,importPending=null,saveAvailable=true,resetFromSettings=false;
let cloudGateOpen=true,cloudSaveSignal=null,cloudMode=false,devPreviewMode=false,devOriginal=null;
let guideMode='intro',tabTipId=null,seenTabTips={};
let storyOpen=false,incidentOpen=false,patronOpen=false,branchOpen=false,goalSection='story';
let sceneZoom=100,lowMotion=false,largeText=false,bookingDayAhead=3;
let selectedFinance='standard',selectedStyle='original',startupOpen=false,facilityNoticeOpen=false;
function safeRead(key){try{return localStorage.getItem(key);}catch(e){saveAvailable=false;return null;}}
function safeJSON(raw){try{return JSON.parse(raw);}catch(e){return null;}}
function candidateState(raw){const data=safeJSON(raw);if(!data)return null;const value=data.state||data;try{const migrated=G.migrate(value);return migrated&&G.checkState(migrated)?{state:migrated,lastTick:Math.min(Date.now(),Number(data.lastTick)||Date.now())}:null;}catch(e){return null;}}
for(const k of [KEY,PREVIOUS,LEGACY,'gutter-to-glory-v05','gutter-to-glory-v04','gutter-to-glory-v03']){
 const raw=safeRead(k);if(!raw)continue;
 const data=candidateState(raw);if(data){s=data.state;lastTick=data.lastTick;introSeen=true;hadSavedGame=true;saveSource=k;break;}
 hadBrokenSave=true;
}
try{const raw=safeRead(UIKEY);hadNewUI=!!raw;const ui=safeJSON(raw||safeRead(OLDUI)||safeRead('gutter-to-glory-ui-v07')||safeRead('gutter-to-glory-ui-v04'));
 if(ui){sceneZoom=Math.max(80,Math.min(140,Number(ui.sceneZoom)||100));lowMotion=!!ui.lowMotion;largeText=!!ui.largeText;auto=ui.auto!==false;skipSummaries=ui.skipSummaries===true;introSeen=ui.introSeen===true||introSeen;tab=['alley','manage','bowlers','tournaments','you','employees','goals','settings'].includes(ui.tab)?ui.tab:'alley';buildSection=['construction','lanes','style','layout','future'].includes(ui.buildSection)?ui.buildSection:'construction';if(typeof ui.tutorialSeen==='boolean')tutorialSeen=ui.tutorialSeen;if(ui.seenTabTips&&typeof ui.seenTabTips==='object')seenTabTips=ui.seenTabTips;}
}catch(e){console.warn('UI preferences could not be loaded',e);}
if(hadSavedGame&&!hadNewUI)tutorialSeen=true;
welcomeOpen=hadSavedGame||hadBrokenSave;
let lastAnnouncedLevel=G.venueLevel(s);
function storeRecovery(){try{const old=safeRead(KEY)||safeRead(saveSource||KEY);if(old&&candidateState(old))localStorage.setItem(BACKUP,old);return true;}catch(e){return false;}}
function save(){if(welcomeOpen||cloudGateOpen)return false;try{localStorage.setItem(KEY,JSON.stringify({state:s,lastTick:Date.now()}));localStorage.setItem(UIKEY,JSON.stringify({auto,tab,buildSection,skipSummaries,introSeen,tutorialSeen,seenTabTips,sceneZoom,lowMotion,largeText}));saveAvailable=true;return true;}catch(e){saveAvailable=false;console.warn('Save unavailable',e);return false;}}
function applyAccessibility(){document.body.classList.toggle('lowMotion',lowMotion);document.body.classList.toggle('largeText',largeText);$('scene').style.zoom=sceneZoom+'%';if($('sceneZoomValue'))$('sceneZoomValue').textContent=sceneZoom+'%';if($('lowMotionSetting'))$('lowMotionSetting').checked=lowMotion;if($('largeTextSetting'))$('largeTextSetting').checked=largeText;}
function toast(message,error=false){const el=$('toast');el.textContent=message;el.className='toast show'+(error?' error':'');clearTimeout(timerToast);timerToast=setTimeout(()=>el.className='toast',3500);}
function startupPreview(){
 const loan=selectedFinance==='growth'?1800:1000,payment=selectedFinance==='growth'?150:85;
 const style=G.STARTER_STYLES.find(x=>x.id===selectedStyle)||G.STARTER_STYLES[0];
 $('startupReceipt').innerHTML=`<strong>🧾 Your opening budget</strong><div><span>Personal savings</span><b>${cash(600)}</b></div><div><span>Town loan (0% in-game interest)</span><b>${cash(loan)}</b></div><div><span>Opening decor</span><b>−${cash(style.cost)}</b></div><div class="total"><span>READY TO BUILD</span><b>${cash(600+loan-style.cost)}</b></div><small>${cash(payment)} due each Sunday while the loan is outstanding. Keep some cash for employees, supplies and repairs.</small>`;
 document.querySelectorAll('[data-finance]').forEach(el=>el.classList.toggle('chosen',el.dataset.finance===selectedFinance));
 document.querySelectorAll('[data-starter-style]').forEach(el=>el.classList.toggle('chosen',el.dataset.starterStyle===selectedStyle));
}
function showStartup(){if(!s.startupPending||cloudGateOpen)return;startupOpen=true;
 $('startupLoans').innerHTML=[['standard','Easy Does It','Borrow $1,000 · $85 every Sunday · open with $1,600','🪙'],['growth','Big Swing','Borrow $1,800 · $150 every Sunday · open with $2,400','🚀']].map(([id,title,sub,emo])=>`<button data-finance="${id}" class="startupOption"><span>${emo}</span><b>${title}</b><small>${sub}</small></button>`).join('');
 $('startupStyles').innerHTML=G.STARTER_STYLES.map(x=>`<button data-starter-style="${x.id}" class="startupOption"><span>${x.icon}</span><b>${esc(x.name)}</b><small>${esc(x.desc)}</small><small>${x.cost?cash(x.cost):'FREE'}</small></button>`).join('');
 startupPreview();$('startupBackdrop').classList.remove('hidden');lastTick=Date.now();
}
function hideStartup(){startupOpen=false;$('startupBackdrop').classList.add('hidden');lastTick=Date.now();}
$('startupLaunch').onclick=()=>{if(perform(G.chooseStartup(s,selectedFinance,selectedStyle))){
 hideStartup();if(!showNextOpeningNotice()&&!tutorialSeen)showTutorial();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('startup');}};
function perform(action,message){if(!action.ok){toast(action.reason||'Not available',true);return false;}save();render();syncVisitors();if(drawer)renderDrawer();if(message)toast(message);return true;}
function gotoTab(id,userClick=false){tab=id;document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===id);if(el.dataset.tab===id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});closeDrawer();save();if(userClick&&!tutorialOpen&&!startupOpen&&!welcomeOpen&&!cloudGateOpen&&!seenTabTips[id]&&!s.startupPending)showTabTip(id);}
function openDrawer(id){drawer=id;renderDrawer();$('drawerBackdrop').classList.remove('hidden');$('drawer').classList.remove('hidden');$('closeDrawer').focus();}
function closeDrawer(){drawer=null;$('drawer').classList.add('hidden');$('drawerBackdrop').classList.add('hidden');}
function priceBlock(key,label,note){const n=s.pricing[key],min=key==='lane'?10:0,max=key==='lane'?35:8;return `<div class="drawerRow"><div><b>${label}</b><small>${note}</small></div><div class="priceControl"><button data-price="${key}:-1" ${n<=min?'disabled':''} aria-label="Decrease ${label}">−</button><strong>$${n}</strong><button data-price="${key}:1" ${n>=max?'disabled':''} aria-label="Increase ${label}">+</button></div></div>`;}
function reportCards(report){const r=report||{},items=[
 ['Arrivals',r.arrivals||0],['Groups bowled',r.served||0],['Waited for lane',r.waited||0],['Left angry',r.left||0],
 ['Revenue',cash(r.income||0)],['Operating costs',cash(r.expenses||0)],['Bowling + shoes',cash((r.laneIncome||0)+(r.shoeIncome||0))]];
 if(r.laneHours)items.push(['Paid lane-hours',r.laneHours]);
 if((r.facilities?r.facilities.snack:s.built.snack))items.push(['Snack orders',r.snackOrders||0]);
 if((r.facilities?r.facilities.bar:s.built.bar))items.push(['Bar drinks',r.barOrders||0]);
 if((r.facilities?r.facilities.arcade:s.built.arcade))items.push(['Arcade plays',r.arcadePlays||0]);
 if(s.league.active||r.leagueHeld)items.push(['League money',cash(r.leagueIncome||0)]);
 if(r.partyHeld)items.push(['Full-alley party income',cash(r.partyIncome||0)]);
 if(s.employees.length||r.staffPay)items.push(['Staff wages',cash(r.staffPay||0)]);
 if(r.techServices||r.techPartsBought)items.push(['Technician: repairs / parts',`${r.techServices||0} serviced · ${r.techPartsBought||0} parts bought`]);
 if(r.happiness!==undefined)items.push(['Guest happiness',r.happiness+'%']);
 if(r.loanPayment)items.push(['Loan repaid',cash(r.loanPayment)]);
 if(r.walkIns)items.push(['Non-bowling visitors',r.walkIns]);
 if(r.capex)items.push(['Construction investment',cash(r.capex)]);
 if(r.marketingSpend)items.push(['Advertising',cash(r.marketingSpend)]);
 items.push(['Net (before construction)',cash(r.net||0)]);
 return '<div class="statGrid">'+items.map(([title,val])=>`<div><small>${esc(title)}</small><strong>${esc(val)}</strong></div>`).join('')+'</div>';}
function eventsHTML(events){if(!events?.length)return '<p class="small muted">Nothing recorded yet. Advance the clock and watch your guests!</p>';
 return [...events].reverse().map(e=>`<div class="event ${esc(e.type)}"><span class="eventTime">${G.formatHour(e.hour).replace(':00','')}</span><span>${esc(e.text)}</span></div>`).join('');}
function tipHTML(report){return (report.feedback||[]).length?report.feedback.map(x=>`<div class="review">💬 <span>${esc(x)}</span></div>`).join(''):'<p class="muted small">No recurring problems to report yet. Keep an eye on capacity, maintenance, and snacks.</p>';}
function deskDrawer(){return `<p class="drawerIntro">Your front desk manages check-ins, pricing and daily performance. Groups can book a lane for <b>1–3 game hours</b>, paying for each hour. The lane stays occupied for the whole session. Shoes are charged once per visit.</p>
 <section class="drawerCard"><h3>🏦 Your Startup Loan</h3><div class="drawerRow"><span>Outstanding balance</span><b>${cash(s.loan.balance)}</b></div><small>${s.loan.balance?`${cash(s.loan.payment)} due each Sunday if funds are available. Loans in the game have no interest.`:"Paid off! No more Sunday payments."}</small></section><section class="drawerCard"><h3>💛 Customer Happiness <span class="badge">${s.happiness}%</span></h3><div class="meter"><div style="width:${s.happiness}%"></div></div><small>Guests who bowl happily help your rating. Angry walkouts and missing snacks lower it. Closing reports explain the day's change.</small></section><section class="drawerCard"><h3>💵 Set Your Prices</h3>${priceBlock('lane','Bowling lane','Per group · per hour')}${priceBlock('shoes','Shoe rental','Per person · per visit')}<p class="tiny muted">Higher prices earn more per visit, but can reduce guest demand. Adjust them whenever you like.</p></section>
 <section class="drawerCard"><h3>📊 Day ${s.day} · ${s.hour===G.CLOSE?'Closed':G.formatHour(s.hour)}</h3>${reportCards(s.today)}</section>
 <section class="drawerCard"><h3>💬 Guest Feedback</h3>${s.hour===G.CLOSE?tipHTML(s.lastDay):'<p class="muted small">Feedback is collected when the alley closes. Early complaints are suggestions, not harsh penalties.</p>'}</section><button class="full" data-open="diary">📖 Open full daily log</button>`;}
function facilityIllustration(id,forceTier){
 const tier=forceTier||s.roomTiers[id]||1;
 const meta={snack:{name:'SNACK SHACK',sign:'FRESH SNACKS',basic:['🍿','🥤','🍟'],upgrade:['🍔','🍕','🥨']},bar:{name:'BOWLING BAR',sign:'GOOD TIMES ON TAP',basic:['🍺','🍷','🍾'],upgrade:['🍹','🥃','🥤']},arcade:{name:'MINI ARCADE',sign:'INSERT COIN',basic:['🕹️','🎰','👾'],upgrade:['🧸','🏒','🏎️']},proshop:{name:'PRO SHOP',sign:'GEAR UP',basic:['🎳','👟','👜'],upgrade:['🧽','🧴','🔧']}}[id];
 if(!meta)return '';
 const key=`facility.${id}.tier${tier}`,path=assets[key];
 const items=meta.basic.concat(tier===2?meta.upgrade:[]);
 return `<div class="facilityShowcase ${id} tier-${tier} wall-${esc(s.wallPaint)}" role="img" aria-label="${esc(meta.name)} level ${tier} illustration">
 <div class="facilityDecorTop"><span>${tier===2?'✦ '+meta.name+' PLUS ✦':meta.name}</span><em>ROOM ${tier===2?'EXPANDED':'LEVEL 1'}</em></div>
 <div class="facilityWall"><div class="facilitySign">${esc(meta.sign)}</div>${tier===2?'<div class="facilityLamp">💡</div>':''}${s.fixtures.tv?'<div class="facilityTV">📺</div>':''}${s.roomDetails[id]?`<div class="facilityLamp" title="Room-specific upgrade installed">${(G.ROOM_DETAILS.find(x=>x.id===id)||{}).icon||'✨'}</div>`:''}<div class="facilityShelf">${items.map(i=>`<span>${i}</span>`).join('')}</div></div>
 <div class="facilityCounter"><span class="facilityCounterLabel">${tier===2?'⭐ NOW SERVING MORE':'OPENING SPECIAL'}</span><div class="facilityRegister">▣</div></div><div class="facilityFloor"><span>${tier===2?'🪑 &nbsp; 🪑 &nbsp; 🌿':'📦 &nbsp; 🧹'}</span><span>${tier===2?'✨ UPGRADED ✨':'READY FOR CUSTOMERS'}</span></div>
 ${path?`<img class="facilityOverride" src="${esc(path)}" alt="" onerror="this.remove()">`:''}</div>`;
}
function snackDrawer(){if(!s.built.snack)return `<p class="drawerIntro">No snack counter yet. Build one to start serving soda and popcorn, then unlock new foods as your alley levels up.</p><button data-tab="manage" class="primary">🔨 View expansions</button>`;
 const level=G.venueLevel(s);
 return `${facilityIllustration('snack')}<div class="drawerCallout">${G.staffed(s,'snack')?'✅ Counter staffed and serving.':'🚨 Counter CLOSED: hire '+(G.neededStaff(s,'snack')-G.countStaff(s,'snack'))+' worker(s) in the Staff Room.'} <button data-tab="employees">👥 Staff Room →</button></div><p class="drawerIntro">New foods unlock as your alley grows and your snack counter serves more customers. Each food has its <b>own stock</b>, price, and restock cost. Visitors really buy them during the day. <b>Orders arrive the following morning</b> — buy ahead!</p><section class="drawerCard"><div class="sectionhead"><h3>🍽️ Your Menu</h3><span class="badge warm">Alley level ${level}</span></div>${G.SNACKS.map(item=>{const unlocked=G.snackUnlocked(s,item.id),qty=s.snackStock[item.id],price=s.snackPrices[item.id];return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('snack.'+item.id,item.emoji)}</span><div class="menuInfo"><b>${esc(item.name)}</b><small>${unlocked?`In stock: ${qty} ${qty<=s.lowStockThreshold?'⚠️ LOW':''}`:`🔒 Level ${item.level}${item.visits?` · ${item.visits} snack sales`:``}`}</small><small>${unlocked?`Sale price $${price} · ${G.incoming(s,'snack',item.id)?G.incoming(s,'snack',item.id)+' arriving tomorrow':'no delivery scheduled'}`:'Grow your center and serve more snack customers to unlock'}</small></div>${unlocked?`<div class="menuActions"><div class="priceControl"><button class="mini" data-menu-price="${item.id}:-1" ${price<=item.price-2?'disabled':''}>−</button><strong>$${price}</strong><button class="mini" data-menu-price="${item.id}:1" ${price>=item.price+4?'disabled':''}>+</button></div><button data-restock="${item.id}" ${s.cash<item.cost?'disabled':''}>📦 Order +${item.pack} · ${cash(item.cost)}</button></div>`:'<span>🔒</span>'}</div>`}).join('')}</section><div class="drawerCallout">📦 Orders arrive NEXT MORNING. A Stock Clerk can automatically order when stock falls to your chosen low-stock threshold.</div>`;}
function laneDrawer(id){const l=s.lanes.find(x=>x.id===id);if(!l)return '<p>Lane unavailable.</p>';const active=s.sceneGroups.find(x=>x.location==='lane'+id);
 return `<p class="drawerIntro">Customize <b>Lane ${id}</b> with equipment that lasts, makes bowlers smile, and earns Alley Stars. Condition still needs occasional service.</p><section class="drawerCard"><div class="sectionhead"><h3>🎳 Lane ${id}</h3><span class="badge ${l.condition<45?'warn':'good'}">${Math.round(l.condition)}% condition</span></div><div class="meter"><div style="width:${l.condition}%"></div></div><div class="drawerRow"><span>Current group</span><b>${active?esc(active.name)+` (${active.size})`:'Vacant'}</b></div><div class="drawerRow"><span>Spare parts</span><b>${s.parts}</b></div><button class="primary full" data-service="${id}" ${l.condition>=98||s.cash<20||s.parts<1?'disabled':''}>🔧 Service Lane ${id} · $20 + 1 part</button></section><section class="drawerCard"><h3>⭐ Improve this lane</h3><p class="muted small">Upgrade only this lane here, or visit Build → Your Lanes to outfit every open lane at once.</p>${G.LANE_KITS.map(k=>`<div class="laneUpgradeRow"><div><b>${k.icon} ${esc(k.name)}</b><small>${esc(k.desc)}</small><small class="starReward">Counts toward your Lane Department rating</small></div><button data-lane-kit="${id}:${k.id}" ${l.kits?.[k.id]||s.cash<k.cost?'disabled':''}>${l.kits?.[k.id]?'✓ Installed':cash(k.cost)}</button></div>`).join('')}</section>${l.kits?.scoring?`<section class="drawerCard"><h3>🎬 Scoring-screen animations</h3><p class="muted small">Try new styles without buying another computer. Choose the screen that best fits your center.</p><div class="laneThemeList">${G.SCORE_THEMES.map(t=>`<button data-lane-theme="${id}:${t.id}" class="${(l.theme||'classic')===t.id?'active':''}">${t.icon} ${esc(t.name)} ${(l.theme||'classic')===t.id?'✓':''}</button>`).join('')}</div></section>`:''}<section class="drawerCard"><h3>⚙️ Parts Room</h3><p class="small muted">Buy five replacement parts for $45.</p><button data-buy-parts ${s.cash<45?'disabled':''}>📦 +5 spare parts · $45</button></section>`;}
function partsDrawer(){return `<p class="drawerIntro">There's no separate lane oil resource in v0.3. Each lane has its own condition rating; maintenance costs spare parts plus a small service fee.</p><section class="drawerCard"><h3>⚙️ Spare Parts <span class="badge">${s.parts} available</span></h3><button data-buy-parts class="primary" ${s.cash<45?'disabled':''}>Buy 5 parts · $45</button></section><div class="laneTiles">${s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}">🎳 Lane ${l.id}<br><b>${Math.round(l.condition)}% condition</b><div class="meter"><div style="width:${l.condition}%"></div></div>Tap to service →</button>`).join('')}</div>`;}
function benchesDrawer(){const cost=G.benchCost(s),max=s.benches>=3;return `<p class="drawerIntro">Guests wait for a lane when all lanes are busy. Benches provide <b>two comfortable group spots</b> each, with a longer waiting tolerance. They help, but more lanes still give you more capacity.</p>
 <section class="drawerCard"><h3>🪑 Waiting Area</h3><div class="statGrid"><div><small>Installed benches</small><strong>${s.benches}/3</strong></div><div><small>Queue capacity</small><strong>${G.waitCapacity(s)} groups</strong></div></div><p class="small muted">Groups without a bench leave after two waiting hours; seated groups can wait up to four.</p><button class="primary full" data-buy-bench ${max||s.cash<cost?'disabled':''}>${max?'✓ All benches installed':`+ Install bench · ${cash(cost)}`}</button></section>`;}
function adsDrawer(){const active=G.activeCampaign(s);return `<p class="drawerIntro">Choose one campaign at a time. Flyers are affordable; radio and TV bring stronger short-term visitor interest, but can overwhelm a small alley.</p>
 ${active?`<div class="drawerCallout">📣 <b>${esc(active.title)} running</b> · Through day ${active.endDay} · +${Math.round(active.boost*100)} percentage points to hourly arrival chance</div>`:''}
 <section class="drawerCard"><h3>📣 Advertising options</h3>${G.CAMPAIGNS.map(c=>`<div class="drawerRow advertRow"><div><b>${c.icon} ${esc(c.title)}</b><small>${esc(c.desc)}</small><small>+${Math.round(c.boost*100)} points arrival chance · ${c.days} days</small></div><button data-ad="${c.id}" ${active||s.cash<c.cost?'disabled':''}>${cash(c.cost)}</button></div>`).join('')}</section><p class="small muted">Advertising costs appear in operating expenses. More visitors only help when your lanes and waiting area can handle them.</p>`;}
function barDrawer(){if(!s.built.bar){const job=s.construction.find(j=>j.id==='bar');return `<p class="drawerIntro">Open the bar to serve beer and wine. Unlock new drinks by selling drinks, upgrading the alley, and expanding the room.</p><button data-tab="manage" class="primary">${job?'🚧 Under construction':'🔨 Build the bar'}</button>`;}
 const lv=G.venueLevel(s);
 return `${facilityIllustration('bar')}<div class="drawerCallout">${G.staffed(s,'bar')?'✅ Bartenders on duty.':'🚨 Bar CLOSED: hire '+(G.neededStaff(s,'bar')-G.countStaff(s,'bar'))+' worker(s).'} <button data-tab="employees">👥 Staff Room →</button></div><p class="drawerIntro">Your bar has <b>${s.barVisits} lifetime drink sales</b>. Sell drinks to gain experience and unlock new recipes. Every drink has its own stock and price. <b>Supply orders arrive the next morning.</b></p><section class="drawerCard"><div class="sectionhead"><h3>🍹 Drink Menu</h3><span class="badge warm">Level ${lv} · ${s.barVisits} sales</span></div>${G.DRINKS.map(i=>{const unlocked=G.drinkUnlocked(s,i.id),stock=s.barStockById[i.id],price=s.barPrices[i.id],reason=i.expandedOnly&&s.roomTiers.bar!==2?'Expand the bar to 2 squares':`Needs alley Lv ${i.level} and ${i.visits} drink sales`;return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('drink.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${unlocked?`In stock ${stock} · ${G.incoming(s,'bar',i.id)} incoming ${stock<=s.lowStockThreshold?'⚠️ LOW':''}`:'🔒 '+reason}</small></div>${unlocked?`<div class="menuActions"><div class="priceControl"><button data-drink-price="${i.id}:-1" ${price<=i.price-2?'disabled':''}>−</button><strong>${cash(price)}</strong><button data-drink-price="${i.id}:1" ${price>=i.price+5?'disabled':''}>+</button></div><button data-drink-restock="${i.id}" ${s.cash<i.cost?'disabled':''}>📦 Order +${i.pack} · ${cash(i.cost)}</button></div>`:'🔒'}</div>`}).join('')}</section><div class="drawerCallout">🍺 ${s.today.barOrders} served today · ${cash(s.today.barIncome)} bar revenue</div>`;}
function arcadeDrawer(){if(!s.built.arcade)return `<p class="drawerIntro">Build the ${roomName('arcade')} to install your first game and earn night-time entertainment income. The Back Alley lounge uses fictional prize tickets—no real-money wagers.</p><button data-tab="manage" class="primary">🔨 View construction</button>`;
 const owned=Object.values(s.arcadeMachines).filter(Boolean).length,cap=s.roomTiers.arcade===2?5:3;
 return `${facilityIllustration('arcade')}<p class="drawerIntro">${darkCenter()?'The Casino Lounge hosts ticket-only neon games. Evening visits generate additional entertainment revenue; visitors never wager real or virtual cash.':'Buy arcade machines, earn money when a real guest plays one, and unlock new cabinets through <b>arcade visits</b>.'} ${s.arcadeVisits} plays so far.</p><section class="drawerCard"><div class="sectionhead"><h3>${darkCenter()?'🎰 Night Games':'🕹️ Your Machines'}</h3><span class="badge warm">${owned}/${cap} slots</span></div>${G.MACHINES.map(i=>{const has=!!s.arcadeMachines[i.id],unlocked=G.machineUnlocked(s,i.id),reason=i.expandedOnly&&s.roomTiers.arcade!==2?'Requires a two-square arcade':`Needs alley Lv ${i.level} and ${i.plays} plays`;return `<div class="menuRow ${!has&&!unlocked?'lockedMenu':''}"><span class="menuEmoji">${icon('machine.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(darkCenter()?G.darkMachineName(i.id):i.name)}</b><small>${has?`Installed · ${cash(i.fee)} per play`:unlocked?'Ready to purchase':'🔒 '+reason}</small></div><button data-machine="${i.id}" ${has||!unlocked||owned>=cap||s.cash<i.cost?'disabled':''}>${has?'✓ Owned':!unlocked?'🔒':cash(i.cost)}</button></div>`}).join('')}</section><div class="drawerCallout">${darkCenter()?'🎰':'👾'} ${s.today.arcadePlays} games today · Expand the ${roomName('arcade')} for more room and games.</div>`;}
function decorDrawer(){return `<p class="drawerIntro">Customize your building and add useful amenities. Wall paint is cosmetic; fixtures affect guest comfort and business performance.</p><section class="drawerCard"><h3>🎨 Wall Color</h3><div class="paintChoices">${G.PAINTS.map(i=>`<button data-paint="${i.id}" class="paintChoice ${s.wallPaint===i.id?'selected':''}" ${s.wallPaint===i.id||s.cash<i.cost?'disabled':''}><span class="paintSwatch paint-${i.id}"></span><b>${esc(i.name)}</b><small>${s.wallPaint===i.id?'✓ Current':cash(i.cost)}</small></button>`).join('')}</div></section><section class="drawerCard"><h3>🛋️ Fixtures & Decorations</h3>${G.FIXTURES.map(i=>`<div class="menuRow"><span class="menuEmoji">${icon('fixture.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${esc(i.desc)}</small></div><button data-fixture="${i.id}" ${s.fixtures[i.id]||s.cash<i.cost?'disabled':''}>${s.fixtures[i.id]?'✓ Installed':cash(i.cost)}</button></div>`).join('')}</section>`;}
function leagueHTML(){const c=G.calendar(s.day),active=s.league.active;return `<section class="panel leaguePanel"><div class="sectionhead"><div><h2>🎳 Thursday Night League</h2><p class="muted tiny">Weekly competition begins once all six lanes are built. Every Thursday, 6–8 PM.</p></div><span class="badge">Week ${c.week} · ${c.weekday}</span></div><div class="leagueOverview"><div><small>Open lanes</small><b>${Math.min(G.lanes(s),6)}/6</b></div><div><small>League sessions</small><b>${s.league.sessions}</b></div><div><small>League income</small><b>${cash(s.league.totalRevenue)}</b></div></div>${active?`<div class="drawerCallout">✅ League active! All six lanes are reserved Thursday 6–8 PM for league bowlers. The weekly league earns fees at Thursday closing.</div>`:`<p class="muted small">${G.lanes(s)<6?'Build your remaining lanes to unlock weekly league nights.':'Six lanes ready! Start a league with a one-time $200 registration and marketing cost.'}</p><button class="primary" data-start-league ${G.lanes(s)<6||s.cash<200?'disabled':''}>${G.lanes(s)<6?'🔒 Unlock at six lanes':'📋 Register Thursday League · $200'}</button>`}</section>`;}
function diaryDrawer(){const openReport=s.today;const history=s.dayReports.filter(r=>r.day!==s.day).slice(0,14);return `<p class="drawerIntro">Every group has an arrival, lane or queue decision, and departure. Snack purchases are recorded individually. Your most recent 14 completed days are saved below.</p>
 <details class="diaryDay" open><summary>📅 Day ${s.day} ${s.hour>=G.CLOSE?'· Closed':'· In progress'} · ${s.today.arrivals} groups arrived</summary><div class="diaryEvents">${eventsHTML(openReport.events)}</div></details>
 ${history.map(r=>`<details class="diaryDay"><summary>📅 Day ${r.day} · ${r.served} bowled · ${cash(r.net)} net</summary><div class="diaryEvents">${reportCards(r)}<h3 style="margin:12px 0 6px">Guest comments</h3>${tipHTML(r)}<h3 style="margin:14px 0 6px">Hourly activity</h3>${eventsHTML(r.events)}</div></details>`).join('')}`;}
function renderDrawer(){if(!drawer)return;const scroll=$('drawerBody').scrollTop;let title='',sub='FACILITY',html='';
 if(drawer==='desk'){title='Front Desk';sub='PRICING & DAILY REPORT';html=deskDrawer();}
 else if(drawer==='snacks'){title=roomName('snack');sub='MENU & INVENTORY';html=snackDrawer();}
 else if(drawer==='diary'){title="Day's Story";sub='VISITOR ACTIVITY LOG';html=diaryDrawer();}
 else if(drawer==='parts'){title='Parts & Repairs';sub='OPERATIONS';html=partsDrawer();}
 else if(drawer==='security'){title='Door Security';sub='THE NIGHT SHIFT';html=`<p class="drawerIntro">Protect the entrance, watch your rooms and prepare your staff. Install and upgrade defenses under Build → Night Defenses. Every improvement lowers the chance that Vera can close a room or lane.</p><button class="primary full" data-tab="manage">🛠️ Upgrade Night Defenses</button><p>Current protection: ${G.nightProtection(s)}/139 · Repelled attacks ${s.campaignStory.nightOps.defended}</p>`;}
 else if(drawer==='benches'){title='Waiting Benches';sub='GUEST COMFORT';html=benchesDrawer();}
 else if(drawer==='ads'){title='Advertising';sub='ATTRACT CUSTOMERS';html=adsDrawer()+`<section class="drawerCard"><h3>🤝 Community & Business Partnerships</h3><p>Negotiate deals with schools, youth teams, charities, offices, and neighboring shops. Some deliver weekly revenue; all can bring guests.</p>${G.PARTNERSHIP_CATALOG.map(x=>`<div class="laneUpgradeRow"><div><b>${x.icon} ${esc(x.name)}</b><small>${esc(x.desc)}</small><small>Requires ${x.minLanes} lanes, ${x.minRep} reputation · Weekly income ${cash(x.weekly)}</small></div><button data-partner="${x.id}" ${s.partnerships[x.id]||G.lanes(s)<x.minLanes||s.rep<x.minRep||s.cash<x.cost?'disabled':''}>${s.partnerships[x.id]?'✓ Partner':cash(x.cost)}</button></div>`).join('')}</section>`;}
 else if(drawer==='bar'){title=roomName('bar');sub='DRINKS & STOCK';html=barDrawer();}
 else if(drawer.startsWith('lane')){title='Lane '+drawer.slice(4);sub='INDIVIDUAL MAINTENANCE';html=laneDrawer(Number(drawer.slice(4)));}
 else if(drawer==='arcade'){title=roomName('arcade');sub='GAMES & MACHINES';html=arcadeDrawer();}
 else if(drawer==='decor'){title='Style & Amenities';sub='CUSTOMIZE YOUR ALLEY';html=decorDrawer();}
 else if(G.NEW_ATTRACTIONS.some(a=>a.id===drawer)){const room=G.NEW_ATTRACTIONS.find(a=>a.id===drawer);title=room.title;sub='NEW WING ATTRACTION';html=`<div class="drawerCard"><h3>${room.icon} ${esc(room.title)}</h3><p>${esc(room.desc)}</p><p>Guests served: <b>${s.roomVisits[room.id]||0}</b> · Income per visit: <b>${cash(room.fee)}</b></p><button data-room-move="${room.id}">✥ Move room on the floor</button></div>`;}
 else if(drawer==='shop'){title=roomName('proshop');sub='TEAM EQUIPMENT';html=facilityIllustration('proshop')+'<p class="drawerIntro">Your pro shop sells equipment and fits custom bowling balls for your team. <b>'+ (G.staffed(s,'proshop')?'Clerk on duty.':'Closed until you hire '+(G.neededStaff(s,'proshop')-G.countStaff(s,'proshop'))+' clerk(s)!') +'</b></p><button class="full" data-tab="employees">👥 Hire staff</button><button class="full primary" data-tab="bowlers">👟 Equip your bowlers</button>';}
 if(['snack','bar','arcade','proshop'].includes(drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer)&&s.built[drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer]){
  const roomId=drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer;
  const tier=s.roomTiers[roomId]||1,job=s.construction.find(j=>j.kind==='roomExpand'&&j.id===roomId),cost=G.expansionCost(roomId);
  const bonus={snack:'Adds pretzels and ice cream to the menu',bar:'More drink choices and more potential orders',proshop:'More equipment variety and stronger sales',arcade:'More games and additional arcade income'}[roomId];
  html+=`<section class="drawerCard"><h3>🧩 Floor Space · ${tier} square${tier===1?'':'s'}</h3><p class="muted small">${bonus}. Move the room for free in Alley Layout mode. Expansion occupies the square directly to its right.</p><button class="primary full" data-expand-room="${roomId}" ${tier===2||job||s.cash<cost?'disabled':''}>${tier===2?'✓ Expanded':job?'🚧 '+job.remaining+' days remaining':'⬜ Expand to 2 squares · '+cash(cost)+' · 2d'}</button><button class="full" data-room-move="${roomId}">✥ Move room on layout</button></section>`;
 }
 const detailId=drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer;const custom=G.ROOM_DETAILS.find(x=>x.id===detailId);
 if(custom&&s.built[detailId])html+=`<section class="drawerCard"><h3>${custom.icon} Give this room its personality</h3><p>${esc(custom.desc)}</p><button class="primary full" data-room-detail="${custom.id}" ${s.roomDetails[custom.id]||s.cash<custom.cost?'disabled':''}>${s.roomDetails[custom.id]?'✓ '+esc(custom.name)+' installed':'Install '+esc(custom.name)+' · '+cash(custom.cost)}</button></section>`;
 const outageId=drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer;const outage=s.outages?.[outageId];if(outage){html=`<div class="repairBanner">🚧 ${esc(outage.name)} is CLOSED until repaired.<button data-repair="${esc(outageId)}" ${s.cash<outage.cost?'disabled':''}>🔧 Repair · ${cash(outage.cost)}</button> ${darkCenter()&&outage.rival?` <button data-investigate="${esc(outageId)}" ${s.cash<70||!s.campaignStory.nightOps.entrance?'disabled':''}>🕵️ Investigate · $70</button>`:''} ${s.cash<outage.cost&&s.hardshipUses<2?`<button data-hardship="${esc(outageId)}">❤️ Community payment plan</button>`:''}</div>`+html;}
 $('drawerTitle').textContent=title;$('drawerSub').textContent=sub;$('drawerBody').innerHTML=html;$('drawerBody').scrollTop=scroll;
}
function renderRoomGrid(){
 const grid=$('sceneRoomGrid'),tiles=[];const occupied=new Set();
 const info={snack:['🍿',darkCenter()?'Night Grill':'Snacks'],bar:['🍹',darkCenter()?'Speakeasy':'Bar'],proshop:['🛍️',darkCenter()?'Outfitters':'Pro Shop'],arcade:['🎰',darkCenter()?'Casino Lounge':'Arcade'],...Object.fromEntries(G.NEW_ATTRACTIONS.map(a=>[a.id,[a.icon,a.title]]))};
 grid.style.gridTemplateRows=`repeat(${G.roomRows(s)},minmax(0,1fr))`;
 for(const id of G.ROOM_IDS){const pos=s.roomPlacements[id];if(!pos)continue;
  const w=G.footprint(s,id);for(let k=0;k<w;k++)occupied.add(`${pos.x+k},${pos.y}`);
  const live=s.built[id],building=s.construction.find(j=>j.id===id),[emoji,label]=info[id];
  const low=(id==='snack'?G.SNACKS.filter(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold).length:id==='bar'?G.DRINKS.filter(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold).length:0);const text=live?label:'🚧 '+label,iconKey=id==='proshop'?'world.proshop':'world.'+id;
  tiles.push(`<button class="roomTile ${live?'':'building'} ${movingRoom===id?'moving':''} ${w===2?'expanded':''}" style="grid-column:${pos.x+1} / span ${w};grid-row:${pos.y+1}" ${layoutMode?`data-room-move="${id}"`:`data-open="${id==='snack'?'snacks':id==='proshop'?'shop':id}"`} title="${layoutMode?'Select room to move':`Open ${label}`}">${icon(iconKey,emoji)}<strong>${esc(text)}</strong>${G.activeOutage(s,id)?'<span class="tileLow">⚠ CLOSED</span>':low?'<span class="tileLow">⚠ '+low+' LOW</span>':w>1?'<small>'+w+' SPACES</small>':building?'<small>'+building.remaining+'d left</small>':''}${s.roomDetails[id]?'<small>✨ CUSTOM</small>':''}</button>`);
 }
 for(let y=0;y<G.roomRows(s);y++)for(let x=0;x<G.ROOM_COLS;x++)if(!occupied.has(`${x},${y}`))tiles.push(`<button class="roomTile roomEmpty ${layoutMode?'editing':''}" style="grid-column:${x+1};grid-row:${y+1}" ${layoutMode&&movingRoom?`data-place-room="${x}:${y}"`:''} aria-label="Empty square ${x+1},${y+1}">${layoutMode&&movingRoom?'+':icon('world.empty','·')}</button>`);
 grid.innerHTML=tiles.join('');
 $('toggleLayout').textContent=layoutMode?'✓ Done arranging':'✥ Rearrange rooms';$('toggleLayout').classList.toggle('primary',layoutMode);
 $('layoutHint').textContent=layoutMode?(movingRoom?'Tap an empty square to move '+info[movingRoom][1]+'. Larger rooms need two or three consecutive free squares.':'Select any room to move, then tap an empty square.'):'Rooms occupy squares. Move them anytime, free.';
}
function chooseRoomMove(id){layoutMode=true;movingRoom=id;gotoTab('alley');renderRoomGrid();toast('Select an empty square for '+id+'.');}
function syncVisitors(events=[],instant=false){const layer=$('visitorLayer'),scene=$('scene'),box=scene.getBoundingClientRect();
 if(!box.width||!box.height)return;
 const center=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:((r.left+r.width/2)-box.left)/box.width*100,y:((r.top+r.height/2)-box.top)/box.height*100};};
 const entrance=center(scene.querySelector('.entranceDoor'))||{x:7,y:83};
 const desk=center($('sceneDesk'))||{x:18,y:45},wait=center($('sceneBenches'))||{x:21,y:72};
 const rooms={snack:center(scene.querySelector('[data-open="snacks"].roomTile')),bar:center(scene.querySelector('[data-open="bar"].roomTile')),arcade:center(scene.querySelector('[data-open="arcade"].roomTile')),shop:center(scene.querySelector('[data-open="shop"].roomTile'))};for(const a of G.NEW_ATTRACTIONS)rooms[a.id]=center(scene.querySelector(`[data-open="${a.id}"].roomTile`));
 const arrivals=new Set(events.filter(e=>e.type==='arrival').map(e=>e.partyId));
 const visits=new Map();for(const e of events){if(['snack','bar','arcade','shop',...G.NEW_ATTRACTIONS.map(a=>a.id)].includes(e.type)&&e.partyId!=null)visits.set(String(e.partyId),e.type);}
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
 if(!instant)for(const e of events.filter(e=>['snack','bar','arcade','shop',...G.NEW_ATTRACTIONS.map(a=>a.id)].includes(e.type)&&!desired.has(String(e.partyId))&&!stagedOut.has(String(e.partyId)))){
  const target=rooms[e.type];if(!target)continue;const ghost=document.createElement('div');ghost.className='visitor passingVisitor';ghost.style.left=entrance.x+'%';ghost.style.top=entrance.y+'%';ghost.style.opacity='1';ghost.innerHTML='<span class="groupMarker">●</span>';layer.append(ghost);setTimeout(()=>{ghost.style.left=target.x+'%';ghost.style.top=target.y+'%';},90);setTimeout(()=>{ghost.style.left=entrance.x+'%';ghost.style.top=entrance.y+'%';ghost.style.opacity='0';},1560);setTimeout(()=>ghost.remove(),2700);
 }
}
function showScene(){const lv=G.venueLevel(s);const phase=!G.lanes(s)?'empty':lv<=2?'neighborhood':lv<=4?'league':'regional';$('scene').className='scene '+phase+' wall-'+s.wallPaint;
 const scenePath=assets['scene.'+phase];const img=$('sceneImage');if(scenePath){if(img.getAttribute('src')!==scenePath){img.hidden=true;img.src=scenePath;img.onload=()=>img.hidden=false;img.onerror=()=>img.hidden=true;}}else img.hidden=true;
 $('sceneMarquee').textContent=''; // formerly redundant banner; the sticky header already shows the venue level
 const wall=G.FIXTURES.filter(i=>s.fixtures[i.id]&&['tv','wallart','neon'].includes(i.id));const floor=G.FIXTURES.filter(i=>s.fixtures[i.id]&&!['tv','wallart','neon'].includes(i.id));
 $('sceneWallDecor').innerHTML=wall.map(i=>`<button data-open="decor" title="${esc(i.name)}" class="worldAmenity">${icon('fixture.'+i.id,i.emoji)}</button>`).join('');
 $('sceneFloorAmenities').innerHTML=floor.map(i=>`<button data-open="decor" title="${esc(i.name)}" class="worldAmenity">${icon('fixture.'+i.id,i.emoji)}</button>`).join('');
 for(const id of ['sceneSnack','sceneArcade','sceneShop','sceneBar'])$(id).classList.add('hidden');
 const available=G.SNACKS.filter(i=>G.snackUnlocked(s,i.id));$('sceneSnackStock').textContent=available.length?`${available.filter(x=>s.snackStock[x.id]>0).length}/${available.length} items stocked`:'Menu & stock';
 $('sceneBarStock').textContent=Object.values(s.barStockById).reduce((a,b)=>a+b,0)+' drinks';$('sceneBenchLabel').textContent=s.benches+' / 3 benches';
 const ad=G.activeCampaign(s);$('sceneAdsLabel').textContent=ad?ad.title:'Grow traffic';
 renderRoomGrid();
 const stage=G.expansionStage(s);$('scene').style.setProperty('--wing-stage',stage);$('scene').style.setProperty('--room-rows',G.roomRows(s));$('scene').style.setProperty('--lane-rows',Math.ceil(G.laneCapacity(s)/6));
 const count=G.lanes(s),pending=G.pendingLanes(s);
 $('sceneLanes').style.gridTemplateColumns='repeat(6,minmax(0,1fr))';
 $('sceneLanes').style.gridTemplateRows=`repeat(${Math.ceil(G.laneCapacity(s)/6)},minmax(0,1fr))`;
 $('sceneLanes').classList.toggle('expandedLot',G.laneCapacity(s)>6);$('sceneLanes').classList.toggle('emptyBank',!G.lanes(s));
 $('sceneLanes').innerHTML=Array.from({length:G.laneCapacity(s)},(_,i)=>{
  const id=i+1,l=s.lanes[i],job=s.construction.find(j=>j.kind==='lane'&&j.id==='lane'+id);
  if(l){const league=id<=6&&s.league.active&&G.calendar(s.day).dayIndex===3&&s.hour>=18&&s.hour<20;const occupant=s.sceneGroups.find(x=>x.location==='lane'+id),path=assets['world.lane'];return `<button class="laneScene ${l.kits?.wood?'laneHardwood':''} ${l.kits?.scoring?'laneDigital':''}" data-open="lane${id}" aria-label="Open lane ${id}, condition ${Math.round(l.condition)} percent">${path?`<img class="lane-image" src="${esc(path)}" alt="" onerror="this.remove()">`:''}<span class="laneDamage"><div style="width:${l.condition}%"></div></span><span class="laneNumber">${id}</span>${league?'<span class="laneAvatar">🏆</span>':occupant?'<span class="laneAvatar">🎳</span>':''}<span class="laneStatus">${G.activeOutage(s,'lane'+id)?'🛠 Closed':league?'🏆 League':occupant?'🎳 '+(s.active.find(a=>a.laneId===id)?.hours||1)+'h':Math.round(l.condition)+'%'}</span></button>`;}
  if(job)return `<button class="laneGhost building" disabled aria-label="Lane ${id} under construction"><span class="ghostPlus">🚧</span><small>${job.remaining}d</small></button>`;
  const next=i===count+pending,price=G.nextLaneCost(s);return `<button class="laneGhost ${next?'nextLane':''}" ${next?'data-buy-lane="true"':''} ${next&&s.cash<price?'disabled':''} title="${next?'Build another lane for '+cash(price):'Future lane slot'}" aria-label="${next?'Order lane '+id+' for '+cash(price):'Future lane '+id}"><span class="ghostPlus">${next?'+':'·'}</span><small>${next?cash(price):'Future'}</small></button>`;
 }).join('');
 $('constructionRibbon').innerHTML=s.construction.length?`🚧 ${s.construction.length} project${s.construction.length===1?'':'s'} underway · ${esc(s.construction.map(j=>j.title+' ('+j.remaining+'d)').join(' · '))}`:'';
 $('occupancyCount').textContent=(s.sceneGroups.filter(x=>x.kind==='bowling').length+(s.league.active&&G.calendar(s.day).dayIndex===3&&s.hour>=18&&s.hour<20?6:0))+'/'+G.lanes(s);$('waitingCount').textContent=s.queue.length;
}
const FUTURE_WINGS=[
 {id:'karaoke',icon:'🎤',name:'Karaoke Lounge',space:'2 squares',idea:'Song nights, staff and a new kind of regular.'},
 {id:'billiards',icon:'🎱',name:'Billiards Room',space:'2 squares',idea:'Pool tables, tournament nights and casual traffic.'},
 {id:'lasertag',icon:'🔫',name:'Laser Tag',space:'2 squares',idea:'Team events and equipment upkeep.'},
 {id:'minigolf',icon:'⛳',name:'Indoor Mini Golf',space:'2 squares',idea:'Family rounds, themed holes and outdoor space.'},
 {icon:'🥎',name:'Bocce Court',space:'1 square',idea:'Challenging matches and low-key leagues.'},
 {id:'partyroom',icon:'🎂',name:'Party Room',space:'2 squares',idea:'Birthday bookings, packages and catering.'},
 {id:'banquet',icon:'🎊',name:'Banquet Hall',space:'3 squares',idea:'Larger gatherings and booked events.'},
 {icon:'🎸',name:'Event Stage',space:'1 square',idea:'Music, comedy and audience draw.'},
 {icon:'🍽️',name:'Full-Service Restaurant',space:'2+ squares',idea:'Menu design, chefs, tables and meal service.'}
];
function showGoalSection(){document.querySelectorAll('[data-goal-section]').forEach(el=>{el.hidden=el.dataset.goalSection!==goalSection;});document.querySelectorAll('[data-goal-nav]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.goalNav===goalSection);btn.setAttribute('aria-pressed',String(btn.dataset.goalNav===goalSection));});}
function renderStoryCommunity(){
 const story=s.story||{unlocked:[],pending:[],charter:false},rat=G.departmentRatings(s),rank=G.alleyScore(s);
 const camp=s.campaignStory,selected=G.campaignOf(s),dark=camp.path==='backalley';
 const branchSelect=G.campaignReady(s)&&camp.path==='undecided'?`<div class="campaignDecisionNotice"><h3>📜 Vera's offer demands an answer</h3><p>Two permanent stories; your decision belongs to <b>${esc(s.locationName)}</b>, not your whole franchise.</p><button class="primary" data-show-branch>Choose your rivalry path →</button></div>`:'';
 const night=camp.nightOps||{entrance:0,cameras:0,crew:0,defended:0,incidents:0,nightRevenue:0,chapters:[]};
 const defensePanel=dark?`<section class="nightDefenseBoard"><h3>🚪 Protect Your Doors & Crew</h3><p>Actual equipment and staff. Vera can close lanes and businesses until you repair them. Each improvement reduces the likelihood of a successful attack.</p><div class="defenseTiles">${G.NIGHT_DEFENSES.map(d=>{const lev=night[d.id]||0,cost=d.costs[lev+1];return `<article class="defenseTile"><strong>${d.icon} ${d.name} · Lv ${lev}/3</strong><small>${esc(d.levels[lev])}</small><p>${lev<3?esc(d.descriptions[lev]):'Fully upgraded — ready for trouble.'}</p><button data-night-defense="${d.id}" ${lev>=3||s.cash<cost?'disabled':''}>${lev>=3?'✓ Fully protected':'Upgrade · '+cash(cost)}</button></article>`}).join('')}</div><p class="muted small">Protection ${G.nightProtection(s)}/139 · Attacks repelled: ${night.defended} · Disruptions: ${night.incidents} · Night-game bonuses: ${cash(night.nightRevenue)}</p><button data-tab="manage" class="primary">🛠️ Visit Build & Repairs</button></section>`:'';
 const noirmenu=dark?`<div class="noirDashboard"><h3>🌒 The Back Alley · Keep the Lights On</h3><p class="muted small">The town is watching. Keep the staff safe, operate your night businesses and stop Vera from driving you out.</p><p><b>Your next mission:</b> ${esc(G.campaignMission(s))}</p><div class="noirStats"><span>🛡️ Defenses <b>${G.nightProtection(s)}</b></span><span>🕵️ Influence <b>${camp.influence}/100</b></span><span>🚨 Suspicion <b>${camp.heat}/100</b></span><span>🤝 Crew Trust <b>${camp.trust}/100</b></span></div>${defensePanel}<h3>📖 The Night Shift Chronicles</h3><div class="nightChapters">${G.BACK_ALLEY_CHAPTERS.map((ch,i)=>{const unlocked=night.chapters?.includes(ch.id);return `<article class="storyCard ${unlocked?'unlocked':'locked'}"><span>${unlocked?'🌒':'🔒'}</span><div><b>${unlocked?esc(ch.title):'Chapter '+(i+1)+' — ???'}</b>${unlocked?`<p><small>${esc(ch.speaker)}</small></p><p>${esc(ch.text)}</p><small>🎯 ${esc(ch.hint)}</small>`:''}</div></article>`}).join('')}</div><p class="muted small">Your old relationship choices still matter, but they no longer replace building defenses or keeping facilities operating.</p>${camp.victory?'<p class="victoryText">🌒 The Midnight Accord — Vera’s campaign has collapsed. The night shift is yours.</p>':''}</div>`:'';
 const legacyMenu=camp.path==='legacy'?`<p>🌟 <b>The Legacy:</b> Win the National Heritage Cup, build 4 community alliances and earn 4 Alley Stars. <small>${esc(G.campaignMission(s))}</small></p><div class="contractActions"><button data-rival="outreach" ${s.cash<145?'disabled':''}>❤️ Community outreach · $145</button><button data-rival="legal" ${s.cash<260?'disabled':''}>⚖️ Legal counsel · $260</button></div>${camp.victory?'<p class="victoryText">🌟 Community Charter awarded!</p>':''}`:'';
 const history=(camp.aiMemory||[]).slice(0,4).map(item=>`<div class="aiMove"><b>Day ${item.day}</b> · ${esc(item.action.replaceAll('-',' '))} · Pressure ${item.pressure}</div>`).join('');
 $('storyPanel').innerHTML=`<div class="sectionhead"><div><small class="eyebrow">${dark?'THE NIGHT SHIFT · THE BACK ALLEY':"GRANDPA GUS’S LEGACY"}</small><h2>${dark?'🌒 The Back Alley':'📖 The Last Frame'}</h2><p class="muted small">${dark?'Vera wants you out. Upgrade your defenses, keep the night businesses running, and stand by your crew.':'Your family alley versus Vera Vale’s StrikeCity. The town’s future depends on your choices.'}</p></div><span class="badge ${camp.victory?'warm':''}">${selected?selected.icon+' '+selected.name:'📜 RIVALRY UNDECIDED'}</span></div>${branchSelect}<div class="storyCards">${(dark?G.STORY_CHAPTERS.filter(ch=>['inheritance','firstlane','offer'].includes(ch.id)):G.STORY_CHAPTERS).map((chapter,i)=>`<div class="storyCard ${story.unlocked.includes(chapter.id)?'unlocked':'locked'}"><span>${story.unlocked.includes(chapter.id)?chapter.icon:'🔒'}</span><div><b>${story.unlocked.includes(chapter.id)?esc(chapter.title):'Chapter '+(i+1)+' — ???'}</b><small>${story.unlocked.includes(chapter.id)?esc(chapter.speaker):'Keep building to unlock'}</small>${story.unlocked.includes(chapter.id)?`<p>${esc(dark&&chapter.id==='national'?'Your tournament victory earns attention, but the Midnight Accord will be won through protecting people and dismantling Vera’s grip.':chapter.text)}</p><small>🎯 ${esc(dark&&chapter.id==='national'?'Keep the lanes running and complete the Back Alley objectives.':chapter.hint)}</small>`:''}</div></div>`).join('')}</div><section class="rivalPanel"><h3>🏢 Vera Vale's Pressure Campaign</h3><p>Vera’s pressure: <b>${s.rival.pressure}/100</b>. She adapts her interference to your defenses and how much support you have.</p><div class="meter"><div style="width:${s.rival.pressure}%"></div></div>${legacyMenu}${noirmenu}${!selected?'<p class="muted small">The campaign choice unlocks after the first formal buyout offer. You can keep operating the alley until then.</p>':''}<h3 style="margin-top:14px">📁 Vera's recent moves</h3>${history||'<p class="muted small">Vera is studying your business. No targeted moves yet.</p>'}<small>Vera may act again after: ${selected?'Day '+camp.nextAIMoveDay:'after you choose a path'}. The five-game-day global surprise-event cooldown still applies.</small></section>`;

 const regulars=G.PATRON_PROFILES.map(c=>{const p=s.patrons[c.id],status=G.patronStatus(p),seen=p.visits>0;
 return `<article class="regularCard"><div class="regularTop"><span class="regularAvatar">${seen?'🙂':'❔'}</span><div><strong>${esc(c.name)}</strong><small>${esc(status)} · ${p.visits} visits · ${p.loyalty}/100 loyalty</small></div><span class="badge">${p.leagueMember?'👟 LEAGUE':p.visits>=3?'❤️ FAMILIAR':'👤'}</span></div><div class="meter"><div style="width:${p.loyalty}%"></div></div><p class="muted small">${seen?esc(c.trait)+' · Likes '+esc(c.wish):'Visit your center to meet this local.'}</p>${seen?`<div class="regularActions"><button data-patron="${c.id}:chat" ${p.lastTalk===s.day?'disabled':''}>💬 Chat</button><button data-patron="${c.id}:treat" ${p.lastTalk===s.day||s.cash<12?'disabled':''}>🍬 Treat · $12</button>${s.league.active&&!p.leagueMember?`<button data-patron="${c.id}:invite" ${p.lastTalk===s.day||p.visits<3||p.loyalty<55?'disabled':''}>👟 Invite to league</button>`:''}</div>`:''}</article>`}).join('');
 $('regularsPanel').innerHTML=`<div class="sectionhead"><div><h2>❤️ Town Regulars</h2><p class="muted small">Familiar visitors return, remember your hospitality and might join your league. Each can chat once per game day.</p></div><span class="badge">${Object.values(s.patrons).filter(p=>G.patronStatus(p)!=='Not met yet').length} / 6 met</span></div><div class="regularGrid">${regulars}</div><h3>🌟 Returning VIP Groups</h3><p class="muted small">🗓️ A seasonal story celebration comes around roughly every 28 game days, beginning on Day 14. A new surprise can only appear after the five-day event cooldown.</p><p class="muted small">Different groups visit more often as the center grows. Watch for seasonal celebrations and loyalty milestones.</p><div class="ratingGrid">${G.VIP_GROUPS.map(g=>`<div class="ratingTile"><b>${g.icon} ${esc(g.name)}</b><p>${esc(g.trait)}</p><small>${s.vipGroups[g.id].visits} visits · last seen ${s.vipGroups[g.id].lastDay?'Day '+s.vipGroups[g.id].lastDay:'not yet'}</small></div>`).join('')}</div>`;
 $('departmentsPanel').innerHTML=`<div class="sectionhead"><div><h2>⭐ Department Report Cards</h2><p class="muted small">Each department earns 0–5 stars by operating, welcoming guests and improving equipment. The total advances your overall alley rating.</p></div><span class="badge warm">${rank}/35 stars earned · Alley ${G.alleyStars(s)}★</span></div><div class="ratingGrid">${G.DEPARTMENTS.map(d=>{const r=rat[d.id];return `<div class="ratingTile"><div><span>${d.icon}</span><b>${esc(d.name)}</b></div><strong>${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</strong><small>${d.id==='lanes'?r.usage+' paid lane-hours':d.id==='comfort'||d.id==='style'?r.upgrades+' improvements':r.usage+' customer interactions'}</small><p>${esc(r.tip)}</p></div>`}).join('')}</div><p class="muted tiny">Overall stars: 1★ at 3 department points, 2★ at 8, 3★ at 14, 4★ at 21, and 5★ at 29. Story chapters and customer satisfaction are tracked separately.</p>`;
 showGoalSection();
 $('futureWings').innerHTML=[...FUTURE_WINGS,...G.NEW_ATTRACTIONS.filter(a=>!FUTURE_WINGS.some(f=>f.id===a.id)).map(a=>({id:a.id,icon:a.icon,name:a.title,space:a.slots+' spaces',idea:a.desc}))].map(w=>{const a=G.NEW_ATTRACTIONS.find(x=>x.id===w.id),done=a&&s.built[a.id],job=a&&s.construction.find(j=>j.id===a.id),unlocked=a&&G.expansionStage(s)>=a.minExpansion;return `<article class="futureWing"><span>${w.icon}</span><div><strong>${esc(w.name)}</strong><small>${esc(w.space)} ${a?'· unlocks in wing '+a.minExpansion:'· future concept'}</small><p>${esc(w.idea)}</p>${a?`<button data-build="${a.id}" ${done||job||!unlocked||s.cash<a.cost?'disabled':''}>${done?'✓ OPEN':job?'🚧 '+job.remaining+' days':!unlocked?'🔒 Expand Wing '+a.minExpansion:'Build · '+cash(a.cost)+' · '+a.days+'d'}</button>`:'<small>Planned for a later version</small>'}</div></article>`}).join('');
}
function renderFranchise(){
 const ids=['home',...(s.portfolio?.opened||[])],active=s.portfolio?.activeId||'home';
 $('franchisePanel').innerHTML=`<h2>🏘️ Your Towns</h2><p class="muted small">Each town has its own business, save progress, economy, and permanent rivalry path. Switch towns anytime. Game days advance only in the active town.</p><div class="townChoices">${ids.map(id=>{const state=id===active?s:s.portfolio?.snapshots?.[id];const path=G.campaignOf(state||{});return `<button data-switch-town="${id}" ${id===active?'disabled':''}><b>${id==='home'?'🏠 Gus’s Town':'🌉 Riverside'}</b><small>${path?path.icon+' '+path.name:'📜 Campaign undecided'} · ${G.lanes(state||s)} lanes ${id===active?'· CURRENT':''}</small></button>`;}).join('')}</div>${!ids.includes('riverside')?`<p class="muted small">An optional second town lets you choose the opposite storyline later. Requires a chosen path, six lanes, 3 Alley Stars and $8,000.</p><button data-open-second-town ${!G.canOpenSecondTown(s)?'disabled':''}>🌉 Open Riverside · $8,000</button>`:''}`;
}
function showBranchDecision(force=false){
 if(branchOpen||storyOpen||summaryOpen||facilityNoticeOpen||welcomeOpen||cloudGateOpen||tutorialOpen||startupOpen||incidentOpen||patronOpen||s.campaignStory?.path!=='undecided'||!G.campaignReady(s)||(!force&&s.campaignStory.promptDismissed))return false;
 branchOpen=true;$('branchBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function hideBranchDecision(){branchOpen=false;$('branchBackdrop').classList.add('hidden');}
function exitDevelopmentPreview(){
 if(!devPreviewMode)return;
 if(!devOriginal){toast('Real game session cannot be located. Refresh the page to reload your authenticated save.',true);return;}
 s=devOriginal.state;KEY=devOriginal.key;BACKUP=devOriginal.backup;cloudMode=devOriginal.cloudMode;devPreviewMode=false;devOriginal=null;
 branchOpen=false;hideBranchDecision();auto=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();
 render();gotoTab('settings');save();toast('Back to your real game. Development preview did not sync to the cloud.');
}
function prepareDevelopment(mode){
 const labels={decision:'a developed alley at the rivalry decision',backalley:'a developed alley already committed to The Back Alley',legacy:'a developed Legacy campaign'};
 if(!confirm('DEV TEST ONLY: Replace your current active game with '+labels[mode]+'?\n\nA recovery copy will be kept when browser storage allows. Export your current save for a permanent backup.'))return;
 const test=G.developmentScenario(mode);if(!test){toast('Could not construct a valid test alley.',true);return;}
 storeRecovery();if(!devPreviewMode)devOriginal={key:KEY,backup:BACKUP,cloudMode,state:structuredClone(s)};devPreviewMode=true;KEY='gutter-to-glory-v100-development-preview';BACKUP='gutter-to-glory-v100-development-backup';cloudMode=false;s=test;introSeen=true;tutorialSeen=true;welcomeOpen=false;summaryOpen=false;storyOpen=false;incidentOpen=false;patronOpen=false;branchOpen=false;facilityNoticeOpen=false;cutsceneOpen=false;tutorialOpen=false;tabTipId=null;hideBranchDecision();
 for(const id of ['storyBackdrop','incidentBackdrop','patronBackdrop','facilityBackdrop','daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop'])$(id).classList.add('hidden');
 seenTabTips={...seenTabTips,goals:true,manage:true,alley:true};tab='goals';goalSection='story';auto=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab('goals');showGoalSection();save();
 toast('Development preview loaded. Auto time is paused.');if(mode==='decision')showBranchDecision(true);
}
function renderAlley(){const sec=$('sceneSecurity');if(sec){sec.classList.toggle('hidden',!darkCenter());if(darkCenter()){const lv=s.campaignStory.nightOps.entrance;sec.querySelector('small').textContent=lv?'Level '+lv+' · '+G.NIGHT_DEFENSES[0].levels[lv]:'Hire your first doorman';}}const level=G.venueLevel(s);$('venueName').textContent=(s.locationName||'Your Bowling Alley')+' · '+(G.campaignOf(s)?.name||'Bowling Alley');$('levelLabel').textContent=`LEVEL ${level} · ${G.venueName(s).toUpperCase()}${s.specialty?' · '+G.specialtyOf(s).name.toUpperCase():''} · ⭐ ${G.alleyStars(s)}/5`;
 $('nextHour').textContent=s.hour>=G.CLOSE?'▶ Start next day':'▶ Next hour';$('toggleAuto').textContent=auto?'⏸ Pause Auto':'▶ Resume Auto';$('clockStatus').textContent=auto?'Automatic time: On · Advances every few seconds':'Automatic time: Paused · Use the buttons to advance';
 $('miniEvents').innerHTML=eventsHTML(s.today.events.slice(-8));
 const completed=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;
 $('hudStats').innerHTML=`<span class="datePill">📅 <b>W${G.calendar(s.day).week} ${G.calendar(s.day).weekday.slice(0,3)} · ${s.hour===G.CLOSE?'10 PM':G.formatHour(s.hour)}</b></span><span class="moneyPill">💵 <b>${cash(s.cash)}</b></span><span class="happyPill" title="How customers feel about their visits">${s.happiness>=78?'😄':s.happiness>=52?'🙂':'😠'} <b>${s.happiness}%</b></span>`;
 const goals=G.nextLevelGoals(s);
 $('nextGoal').innerHTML=`<div class="starShowcase"><strong>${'⭐'.repeat(G.alleyStars(s))}${'☆'.repeat(5-G.alleyStars(s))}</strong><span>Alley Stars combine department ratings earned through real customer visits and improvements. Guest happiness is separate.</span></div><h2>${G.venueLevel(s)>=5?'LEGENDARY ALLEY!':'Level '+(G.venueLevel(s)+1)+' — '+G.LEVELS[G.venueLevel(s)+1]?.name}</h2><div class="goalChecklist">${goals.map(g=>typeof g==='string'?esc(g):`<div class="${g.done?'complete':''}">${g.done?'✅':'◻️'} ${esc(g.label)}</div>`).join('')}</div>`;
 $('goalLevelBadge').textContent=`⭐ ${G.alleyStars(s)}/5 stars · ${G.alleyScore(s)}/35 department points`;
 const spec=G.specialtyOf(s);
 $('specialtyPanel').innerHTML=spec?`<div class="specialtyHeader"><span>${spec.icon}</span><div><h2>Your specialty: ${esc(spec.name)}</h2><p>${esc(spec.desc)}</p></div></div><p class="muted small">This is the identity of your first alley. Later versions may allow you to open a second location with a completely different specialty.</p>`:
 G.venueLevel(s)>=3?`<h2>✨ Choose your alley's specialty</h2><p class="muted small">Your center is established. What do you want to be known for? Choose once for this location; each direction gives a different bonus.</p><div class="specialtyChoices">${G.SPECIALTIES.map(x=>`<button data-specialty="${x.id}" class="specialtyChoice"><b>${x.icon} ${esc(x.name)}</b><small>${esc(x.tag)}</small><small>${esc(x.desc)}</small></button>`).join('')}</div>`:
 `<h2>🔒 Your future specialty</h2><p class="muted small">Reach <b>Established Alley (Level 3)</b> to choose between Family Funhouse, Serious Strikes, Social Lounge, and Neighborhood Classic. You won't be forced down one building order.</p>`;
 $('goalSideQuests').innerHTML=`<div class="quest">🎳 <b>${G.lanes(s)}/${G.laneCapacity(s)} lanes</b><small>${s.league.active?'League running!':'Six lanes unlock Thursday league nights'}</small></div><div class="quest">👥 <b>${s.employees.length} employees</b><small>Hire staff to open the counters</small></div><div class="quest">📦 <b>${s.deliveries.length} deliveries</b><small>All orders arrive next morning</small></div><div class="quest">🏆 <b>${completed}/4 trophies</b><small>Keep training your bowlers</small></div>`;
 renderStoryCommunity();
 const lowSnack=s.built.snack&&G.SNACKS.some(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold);
 const lowBar=s.built.bar&&G.DRINKS.some(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold);
 $('stockWarning').classList.toggle('hidden',!lowSnack);
 $('stockWarning').textContent='⚠ Snacks running low';
 $('stockWarningBar').classList.toggle('hidden',!lowBar);
 $('stockWarningBar').textContent='⚠ Bar stock running low';
 showScene();
}
function renderManage(){const el=$('nightBuildPanel');if(el){el.classList.toggle('hidden',!darkCenter());if(darkCenter()){el.innerHTML=`<h2>🛡️ Night Defenses · Secure the Building</h2><p class="muted small">Build real security at the entrance, install monitoring cameras, and train the night crew. Vera can sabotage an unprotected lane or business. Investments improve your odds of stopping her.</p><div class="defenseTiles">${G.NIGHT_DEFENSES.map(d=>{const level=s.campaignStory.nightOps[d.id],cost=d.costs[level+1];return `<article class="defenseTile"><strong>${d.icon} ${d.name}</strong><small>Level ${level}/3 · ${esc(d.levels[level])}</small><p>${level<3?esc(d.descriptions[level]):'Fully upgraded'}</p><button data-night-defense="${d.id}" ${level>=3||s.cash<cost?'disabled':''}>${level>=3?'✓ Fully Upgraded':'Install / Improve · '+cash(cost)}</button></article>`}).join('')}</div>`;}}
 const cap=G.laneCapacity(s),pendingLot=s.construction.find(j=>j.kind==='land'),lotFull=G.lanes(s)+G.pendingLanes(s)>=cap;
 $('propertyPanel').innerHTML=`<div class="propertyTop"><span class="propertyEmoji">🏡</span><div><h2>Growing your family's bowling center</h2><p>${G.lanes(s)}/${cap} lanes open · ${G.roomRows(s)} rows of shops · Wing ${G.expansionStage(s)}/5</p></div></div><div class="propertyActions"><span class="badge">${s.specialty?'✨ '+esc(G.specialtyOf(s).name):'🌱 Independent startup'}</span>${G.expansionStage(s)<5?`<button data-buy-land ${!lotFull||pendingLot||s.cash<G.nextExpansionCost(s)?'disabled':''}>${pendingLot?'🚧 Building new wing · '+pendingLot.remaining+'d':!lotFull?'🔒 Fill all '+cap+' lane spaces first':'🗺️ Expand property · '+cash(G.nextExpansionCost(s))}</button>`:'<span class="badge">🏆 Full 24-lane property</span>'}</div><p class="propertyProgress">Every property wing adds one Shops & Activities row and up to four more lane spaces (the last adds two). Build the new lanes individually. Wing 1 unlocks billiards and party rooms; later wings unlock karaoke, mini golf, laser tag and banquet events.</p>${Object.keys(s.outages||{}).length?`<div class="repairBanner"><b>🚨 Facilities temporarily closed</b>${Object.entries(s.outages).map(([id,o])=>`<div>${esc(o.name)} — <button data-repair="${esc(id)}" ${s.cash<o.cost?'disabled':''}>Repair for ${cash(o.cost)}</button>${darkCenter()&&o.rival?` <button data-investigate="${esc(id)}" ${s.cash<70||!s.campaignStory.nightOps.entrance?'disabled':''}>🕵️ Investigate & reopen · $70</button>`:''}${s.cash<o.cost&&s.hardshipUses<2?` <button data-hardship="${esc(id)}">❤️ Payment plan (${s.hardshipUses}/2 used)</button>`:''}</div>`).join('')}</div>`:''}`;
 $('upgradeCount').textContent=`${G.UPGRADES.filter(x=>s.built[x.id]).length}/${G.UPGRADES.length} opened`;
 $('manageParts').textContent=`${s.parts} spare parts`;
 $('manageSnack').querySelector('strong').textContent=darkCenter()?'Night Grill':'Snack Menu';document.querySelector('[data-open="bar"].feature strong').textContent=darkCenter()?'Speakeasy':'Bowling Bar';$('manageSnack').querySelector('small').textContent=s.built.snack?'Recipes & stock':G.isBuilding(s,'snack')?'Under construction':'Build a counter to unlock';
 $('manageBenches').textContent=`${s.benches}/3 benches · ${G.waitCapacity(s)} groups waiting`;
 $('manageAds').textContent=G.activeCampaign(s)?.title||'Flyers, radio, television';$('manageBar').textContent=s.built.bar?`${s.barVisits} drinks sold · ${s.barStock} in stock`:'Build your drinks counter';
 $('installedAmenities').innerHTML=G.FIXTURES.filter(i=>s.fixtures[i.id]).map(i=>`<span>${i.emoji} ${esc(i.name)}</span>`).join('')||'<span>✨ No amenities yet · Add your first!</span>'; $('sceneFixtures').textContent=G.FIXTURES.filter(i=>s.fixtures[i.id]).length+' amenities';
 $('constructionCount').textContent=s.construction.length+' underway';
 $('constructionList').innerHTML=s.construction.length?s.construction.map(j=>`<div class="constructionItem"><b>🚧 ${esc(darkCenter()&&({arcade:'Casino Lounge',bar:'Speakeasy',snack:'Night Grill',proshop:'Backroom Outfitters'})[j.id]||j.title)}</b><div class="meter"><div style="width:${(j.total-j.remaining)/j.total*100}%"></div></div><small class="muted">${j.remaining} day${j.remaining===1?'':'s'} remaining · Opens after closing</small></div>`).join(''):'<p class="muted small">No active construction. New wings unlock new attractions. Customers keep visiting while your crew works.</p>';
 $('laneStatus').textContent=G.lanes(s)+' open · '+G.pendingLanes(s)+' building';
 $('laneTiles').innerHTML=s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}"><div class="drawerRow"><span>🎳 Lane ${l.id}</span><b>${Math.round(l.condition)}%</b></div><div class="meter"><div style="width:${l.condition}%"></div></div><small class="muted">${l.condition<48?'Needs service':'Inspect & upgrade'} · ${G.LANE_KITS.filter(k=>l.kits?.[k.id]).length}/3 kits</small></button>`).join('');
 $('bulkLaneKits').innerHTML=s.lanes.length?`<h3>🎳 Upgrade all lanes at once</h3><p class="muted small">Fit every lane missing a particular upgrade, with a 10% bulk discount. Newly built lanes can be equipped later.</p><div class="bulkKitList">${G.LANE_KITS.map(k=>{const info=G.bulkLaneCost(s,k.id);return `<button data-lane-kit-all="${k.id}" ${!info.count||s.cash<info.cost?'disabled':''}>${k.icon} <b>${esc(k.name)}</b><small>${info.count?info.count+' lane'+(info.count===1?'':'s')+' · '+cash(info.cost):'All installed ✓'}</small></button>`}).join('')}</div>`:'<p class="muted small">Install a lane to unlock center-wide equipment packages.</p>';
 $('roomUpgradeList').innerHTML=G.ROOM_IDS.filter(id=>s.built[id]&&!G.NEW_ATTRACTIONS.some(a=>a.id===id)).map(id=>{const tier=s.roomTiers[id]||1,job=s.construction.find(j=>j.kind==='roomExpand'&&j.id===id),u=G.getUpgrade(id),cost=G.expansionCost(id);return `<div class="roomUpgradeRow"><strong>${esc(u.icon+' '+u.title)}</strong><small>${tier===2?'Expanded · 2 squares':job?'🚧 '+job.remaining+' days remaining':'1 square'}</small><button data-expand-room="${id}" ${tier===2||job||s.cash<cost?'disabled':''}>${tier===2?'✓ Done':job?'Building':cash(cost)+' · 2d'}</button></div>`;}).join('')||'<p class="muted small">Build a snack counter, bar, pro shop, or arcade to start arranging the floor.</p>';
 const max=G.lanes(s)+G.pendingLanes(s)>=G.laneCapacity(s);const cost=G.nextLaneCost(s);$('buyLane').disabled=max||s.cash<cost;$('buyLane').textContent=max?'✓ Lot is full — see Property expansion':`+ Build lane ${G.lanes(s)+G.pendingLanes(s)+1} · ${cash(cost)} · 2 days`;
 $('upgradeTiles').innerHTML=G.UPGRADES.map(u=>{const done=!!s.built[u.id],job=s.construction.find(j=>j.kind==='upgrade'&&j.id===u.id),miss=u.requires.find(r=>!s.built[r]);const wing=G.NEW_ATTRACTIONS.find(a=>a.id===u.id),wingLocked=wing&&G.expansionStage(s)<wing.minExpansion;return `<article class="upgrade ${done?'done':''}">${icon('upgrade.'+u.id,u.icon)}<h3>${esc(darkCenter()&&({arcade:'Casino Lounge',bar:'Speakeasy',snack:'Night Grill',proshop:'Backroom Outfitters'})[u.id]||u.title)}</h3><p>${esc(u.desc)}</p><button data-build="${u.id}" ${done||job||miss||wingLocked||s.cash<u.cost?'disabled':''}>${done?'✓ OPEN':job?'🚧 '+job.remaining+'d left':wingLocked?'🔒 Wing '+wing.minExpansion:miss?'🔒 '+esc(G.getUpgrade(miss).title):cash(u.cost)+' · '+u.days+'d'}</button></article>`;}).join('');
}
function renderBowlers(){if(!s.bowlers.some(b=>b.id===selectedBowler))selectedBowler=s.bowlers[0].id;
 $('recruit').disabled=s.cash<320||G.lanes(s)<2||s.bowlers.length>=4;
 $('roster').innerHTML=s.bowlers.map(b=>`<button class="rosterChoice ${b.id===selectedBowler?'active':''}" data-bowler="${esc(b.id)}">${icon('bowler.'+b.id,'👤','portrait')}<span><b>${esc(b.name)}</b><small>Average ${G.avg(b)}</small></span></button>`).join('');
 const b=s.bowlers.find(x=>x.id===selectedBowler);
 $('bowlerDetail').innerHTML=`<div class="athleteBanner">${icon('bowler.'+b.id,'👤','portrait')}<div><h2>${esc(b.name)}</h2><span class="badge">Projected average ${G.avg(b)}</span> <span class="badge ${b.ball?'good':''}">${b.ball?'🎳 Custom-fitted ball':'Standard house ball'}</span></div></div><div class="skillGrid">${[['aim','🎯 Aim'],['spare','🎳 Spares'],['power','💪 Power'],['focus','🧠 Focus']].map(([key,label])=>`<div class="skillBox"><div class="skillTop"><b>${label}</b><b>${b[key]}/95</b></div><div class="meter"><div style="width:${b[key]/95*100}%"></div></div><button data-train="${b.id}:${key}" ${b[key]>=95||s.cash<G.trainCost(s,b.id,key)?'disabled':''}>+ Train · ${cash(G.trainCost(s,b.id,key))}</button></div>`).join('')}</div><div style="margin-top:15px"><button data-ball="${b.id}" ${!s.built.proshop||b.ball||s.cash<170?'disabled':''}>${b.ball?'✓ Ball fitted':'🎳 Custom ball · $170'}</button> <span class="muted small">${!s.built.proshop?'Unlock Pro Shop for custom equipment.':'A better ball boosts this bowler’s projected average.'}</span></div>`;
}
function renderBookings(){const target=$('bookingPanel');if(!target)return;
 const day=s.day+bookingDayAhead;const dow=G.calendar(day).weekday;const contracts=(s.bookings||[]).slice().sort((a,b)=>a.day-b.day);
 target.innerHTML=`<div class="sectionhead"><div><h2>📆 Event Bookings & Contracts</h2><p class="muted small">Reserve lanes 2–14 days ahead, take a deposit today, and collect the remainder when the group arrives. Catering costs money now but increases the final payment.</p></div><span class="badge">${contracts.filter(x=>x.status==='booked').length} booked</span></div>
 <div class="calendarDays">${Array.from({length:13},(_,i)=>i+2).map(n=>`<button data-booking-day="${n}" class="${bookingDayAhead===n?'active':''}" aria-pressed="${bookingDayAhead===n}">Day ${s.day+n}<small>${G.calendar(s.day+n).weekday.slice(0,3)}</small></button>`).join('')}</div><p><b>Selected:</b> ${dow}, Day ${day}. Select a future day before signing a contract. League-night bookings are not allowed during Thursday's 6–8 PM league.</p>
 <div class="bookingCards">${G.BOOKING_TYPES.map(t=>{const start=t.id==='school'?15:18;const collision=!t.offsite&&G.contractCollision(s,day,start,start+2);const ready=G.lanes(s)>=t.minLanes&&!collision;return `<article class="panel bookingCard"><h3>${t.icon} ${esc(t.name)}</h3><p>${esc(t.desc)} · ${t.minLanes}+ lanes</p><small>Deposit ${cash(t.deposit)} now · Remaining ${cash(t.total-t.deposit)} on event day</small><div class="contractActions"><button data-book-event="${t.id}:0" ${!ready?'disabled':''}>Book standard</button><button data-book-event="${t.id}:1" ${!ready||!t.cater||s.cash<t.cater?'disabled':''}>+ Catering · ${cash(t.cater)}</button></div>${!ready?`<small>🔒 ${collision?'Booking conflict':t.minLanes+' lanes needed'}</small>`:''}</article>`;}).join('')}</div>
 <p class="muted small">🏆 Weekly league: Thursdays, 6–8 PM, on the first six lanes when active. Off-site outreach uses no lanes.</p><h3>📅 Upcoming bookings</h3><div class="bookingList">${contracts.length?contracts.map(b=>`<div><b>${esc(b.name)}</b><small>Day ${b.day} · ${G.formatHour(b.start)}–${G.formatHour(b.end)} · ${esc(b.status)} ${b.catering?'· Catering':''}</small></div>`).join(''):'<p class="muted small">No future events signed yet. Private bookings can also arrive as surprise requests.</p>'}</div>`;
}
function renderTournaments(){renderBookings();$('leagueBoard').innerHTML=leagueHTML();const count=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;$('trophyCount').textContent=count+' / 4 trophies';$('tournamentsList').innerHTML=G.TOURNAMENTS.map(t=>{const missing=G.eligibility(s,t),wins=s.tournamentWins[t.id]||0;return `<article class="tournament">${icon('misc.trophy',wins?'🥇':'🏆')}<div><h3>${esc(t.title)}${wins?' ✓':''}</h3><p>Team avg ${G.teamAvg(s)}/${t.needAvg} · Rep ${Math.floor(s.rep)}/${t.needRep}</p><p>Entry ${cash(t.fee)} · Prize ${cash(t.firstPrize)}</p><p>${missing.length?'🔒 '+esc(missing.join(' · ')):'✅ Ready to compete'}</p></div><button data-tour="${t.id}" ${missing.length?'disabled':''}>Compete</button></article>`;}).join('');$('practiceCount').textContent=G.lanes(s)?`${s.practiceLeft} rolls remaining`:'Build a lane to unlock practice';$('roll').disabled=s.practiceLeft<=0||!G.lanes(s);}
function renderYou(){const level=1+Math.floor(s.ownerXP/60),progress=s.ownerXP%60;$('ownerLevel').textContent='LEVEL '+level;$('ownerPoints').textContent=s.ownerPoints+' skill points';$('ownerXPLabel').textContent=progress+' / 60 XP to next level';$('ownerBar').style.width=progress/60*100+'%';$('ownerTitle').textContent=level<3?'Rookie Owner':level<6?'Neighborhood Favorite':level<10?'Community Legend':'Bowling Tycoon';
 $('ownerSkills').innerHTML=G.PLAYER_SKILLS.map(k=>`<div class="ownerSkill"><div><h3>${esc(k.label)} · Lv ${s.ownerSkills[k.id]}/6</h3><p>${esc(k.desc)}</p></div><button data-owner="${k.id}" ${s.ownerPoints<=0||s.ownerSkills[k.id]>=6?'disabled':''}>+ Improve</button></div>`).join('');
 if(assets['misc.owner']){$('ownerArt').innerHTML=`<img src="${esc(assets['misc.owner'])}" alt="Your game character" onerror="this.remove()">`;}else $('ownerArt').replaceChildren();}
function showBuildSection(){document.querySelectorAll('[data-section]').forEach(el=>el.classList.toggle('active',el.dataset.section===buildSection));document.querySelectorAll('[data-build-section]').forEach(b=>b.classList.toggle('active',b.dataset.buildSection===buildSection));}
function renderEmployees(){let wage=s.employees.reduce((n,e)=>n+e.wage,0)+(s.built.staff?16:0);
 $('staffPayBadge').textContent=cash(wage)+' / day payroll';
 $('staffRoles').innerHTML=Object.entries(G.EMPLOYEE_ROLES).map(([id,r])=>{
  const required=G.neededStaff(s,id),count=G.countStaff(s,id),eligible=id==='stocker'?s.built.snack||s.built.bar:id==='mechanic'?G.lanes(s)>=2:!!s.built[id],filled=!!eligible&&count>=required;
  return `<article class="staffRole panel"><h3>${id==='snack'?'🍿':id==='bar'?'🍺':id==='proshop'?'🎳':id==='mechanic'?'🧰':'📦'} ${esc(r.name)}</h3><b>${eligible?count+'/'+required+' staffed':'🔒 Locked'}</b><p>${!eligible?'Build the room first':id==='stocker'?'Optional · orders low inventory automatically':id==='mechanic'?'Responds to emergency room closures at night, uses parts and charges for labor.':filled?'✅ Open for business!':'⚠️ Closed until fully staffed'}</p><button data-hire="${id}" ${!eligible||filled||s.cash<r.fee?'disabled':''}>${!eligible?'🔒 Build first':filled?'✓ Crew complete':`Hire · ${cash(r.fee)}`}</button></article>`;
 }).join('')+`<article class="staffRole panel"><h3>🔧 Lane Technician</h3><b>${s.built.staff?'✅ ON DUTY':'🔒 Not hired yet'}</b><p>${s.built.staff?'Services all lanes automatically when condition reaches 70% or below. Automatically buys 5 spare parts for $45 when needed. $16/day contract plus $20 per repair.':'Hire through Build → Construction to automate lane servicing and spare-parts purchasing.'}</p>${s.built.staff?'<span class="badge">Auto maintenance enabled</span>':'<button data-tab="manage">🛠️ Go to Construction</button>'}</article>`;
 $('emergencyCoveragePanel').innerHTML=`<h3>🛡️ Emergency Service Contract</h3><p>Coverage lasts 28 game days and reduces repair costs. An Emergency Mechanic handles shutdowns automatically when you can afford labor and have spare parts.</p><button data-emergency-coverage ${s.emergencyCoverageUntil>=s.day||G.lanes(s)<2||s.cash<160?'disabled':''}>${s.emergencyCoverageUntil>=s.day?'✓ Covered until Day '+s.emergencyCoverageUntil:'Purchase 28-day coverage · $160'}</button>`;
 $('deliveryBadge').textContent=s.deliveries.length+' packages en route';
 $('stockControls').innerHTML=`<p>Low stock means <b>${s.lowStockThreshold} or fewer</b> units. The Stock Clerk places orders at closing; deliveries arrive the following morning.</p><div class="thresholdControl"><b>Low stock trigger</b><button data-threshold="-1" ${s.lowStockThreshold<=1?'disabled':''}>−</button><strong>${s.lowStockThreshold}</strong><button data-threshold="1" ${s.lowStockThreshold>=12?'disabled':''}>+</button></div><div class="deliveryList">${s.deliveries.length?s.deliveries.map(d=>`<div>📦 ${esc(d.name)} ×${d.amount} · Week ${G.calendar(d.arriveDay).week}, ${G.calendar(d.arriveDay).weekday}</div>`).join(''):'📭 No deliveries currently scheduled'}</div>`;
 $('staffList').innerHTML=s.employees.length?s.employees.map(e=>`<div class="employeeCard"><div class="employeePortrait">${icon('employee.'+e.role,e.role==='snack'?'🍿':e.role==='bar'?'🍹':e.role==='proshop'?'🎳':'📦')}</div><div class="employeeDetails"><h3>${esc(e.name)} <small>Lv ${e.skill}</small></h3><p>${esc(G.EMPLOYEE_ROLES[e.role].name)} · Happiness ${Math.round(e.morale)}%</p><div class="moraleMeter"><div style="width:${e.morale}%"></div></div><div class="wageControl"><span>Daily pay:</span><button data-wage="${e.id}:-1" ${e.wage<=8?'disabled':''}>−</button><b>${cash(e.wage)}</b><button data-wage="${e.id}:1" ${e.wage>=32?'disabled':''}>+</button><button data-train-staff="${e.id}" ${e.skill>=3||s.cash<65+e.skill*35?'disabled':''}>${e.skill>=3?'✓ Trained':'🎓 Train · '+cash(65+e.skill*35)}</button></div></div></div>`).join(''):'<div class="staffEmpty">🫠 It’s just you and a lot of unpaid bowling pins. Hire someone when a counter opens.</div>';
}
function render(){document.body.classList.toggle('noirMode',s.campaignStory?.path==='backalley');document.body.classList.toggle('legacyMode',s.campaignStory?.path==='legacy');renderFranchise();applyAccessibility();renderAlley();renderManage();renderBowlers();renderTournaments();renderYou();renderEmployees();showBuildSection();$('skipSummarySetting').checked=skipSummaries;const status=$('saveStatus');if(status)status.textContent=devPreviewMode?'🧪 LOCAL TEST MODE — cloud saving is DISABLED. Real progress remains separate.':saveAvailable?'Autosave is on · local to this browser':'Browser storage is unavailable — export a backup file';$('devPreviewAlert').classList.toggle('hidden',!devPreviewMode);$('devExitPreview').classList.toggle('hidden',!devPreviewMode);}
function renderOvernightRush(){const target=$('overnightRush');if(!target)return;
 const jobs=s.construction||[];target.innerHTML=jobs.length?`<h3>🌙 Overnight Construction Crew</h3><p class="muted small">Skip the remaining wait for one project with in-game cash. Optional—regular construction finishes for free.</p><div class="rushList">${jobs.map(j=>{const cost=G.rushCost(j);return `<div class="rushRow"><span><b>🚧 ${esc(j.title)}</b><small>${j.remaining} day${j.remaining===1?'':'s'} left</small></span><button data-rush="${esc(j.kind)}:${esc(j.id)}" ${s.cash<cost?'disabled':''}>Rush · ${cash(cost)}</button></div>`;}).join('')}</div>`:'<p class="muted small">✅ All projects are finished or you have no construction underway tonight.</p>';
}
const FACILITY_TIPS={
 snack:{title:'The Snack Counter is ready!',text:'The scent of popcorn is finally stronger than the scent of construction dust.',points:['📦 Tap Snacks to order individual foods. Supplies arrive the NEXT game morning—not instantly.','📉 Watch the low-stock badge and the number left for each food. Order BEFORE you run out.','👥 Hire a snack employee from Staff to start making sales. An expanded counter needs TWO.','🤖 Later, hire a Stock Clerk to reorder food automatically whenever stock reaches your chosen threshold.']},
 bar:{title:'The Bar is open for business!',text:'Someone has already asked whether the happy hour includes free strikes. It does not.',points:['🍺 Tap Bar to see individual drinks such as beer and wine, and set their prices.','📦 Order drinks in advance. Deliveries arrive the NEXT game morning.','⚠️ Watch the bar low-stock badge and restock BEFORE running out.','👥 Hire a bartender in Staff. A two-square bar requires TWO. The optional Stock Clerk can automatically order drinks.']},
 arcade:{title:'The Arcade is ready to play!',text:'The pinball machine has already become the loudest employee. Luckily, it works for free.',points:['🕹️ Tap Arcade to see the machines you own and buy more games.','🪙 Visiting customers actually play machines, generating revenue and unlocking additional cabinets.','🤖 Machines do not need employees or snack-style daily inventory.','⬜ Expand to two squares to fit more cabinets and unlock more variety.']},
 proshop:{title:'The Pro Shop is ready!',text:'Finally, someone who can explain why bowling balls have holes.',points:['🎳 Tap Pro Shop to access equipment and fitting.','👥 Hire a pro-shop employee from Staff before sales can begin. A larger shop needs TWO.','👜 Use the Bowlers tab to fit your team with better equipment.','🔧 The shop will get more supplies and specialized services in later versions.']}
};
function showStoryNotice(){
 if(branchOpen||storyOpen||summaryOpen||facilityNoticeOpen||welcomeOpen||cloudGateOpen||tutorialOpen||startupOpen)return false;
 const id=s.story?.pending?.[0];const c=G.STORY_CHAPTERS.find(x=>x.id===id);if(!c)return false;
 storyOpen=true;$('storyIcon').textContent=c.icon;$('storyTitle').textContent=c.title;$('storySpeaker').textContent=c.speaker;$('storyText').textContent=s.campaignStory.path==='backalley'&&id==='national'?'The tournament win brings good publicity, but the Midnight Accord is still yours to earn.':c.text;$('storyHint').textContent='🎯 '+(s.campaignStory.path==='backalley'&&id==='national'?'Keep the business thriving while you complete the Back Alley mission.':c.hint);
 $('storyBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
$('storyContinue').onclick=()=>{if(!storyOpen)return;storyOpen=false;$('storyBackdrop').classList.add('hidden');s.story.pending.shift();save();lastTick=Date.now();if(s.startupPending){showStartup();return;}if(!showNextOpeningNotice()&&!tutorialSeen)showTutorial();};
function showIncident(){
 if(branchOpen||incidentOpen||patronOpen||summaryOpen||storyOpen||facilityNoticeOpen||startupOpen||cutsceneOpen||cloudGateOpen||welcomeOpen)return false;
 const e=s.eventQueue?.[0];if(!e)return false;incidentOpen=true;
 $('incidentIcon').textContent=e.emoji||'🎳';$('incidentTitle').textContent=e.title;$('incidentText').textContent=e.text;$('incidentEffect').textContent=e.effect||'';
 $('incidentKind').textContent=e.kind==='request'?'PRIVATE BOOKING REQUEST':e.kind==='bad'?'OH NO! AN ALLEY EMERGENCY':e.kind==='rival'?'STRIKECITY MAKES A MOVE':e.kind==='noir'?'AFTER HOURS · A MESSAGE FROM VERA':'LUCKY BREAK!';
 $('incidentActions').innerHTML=e.kind==='request'?`<button class="primary" data-party-choice="yes">✅ Book the party</button><button data-party-choice="no">No thanks</button>`:
 e.repairId?`<button data-repair-event="${esc(e.repairId)}" class="primary" ${s.cash<G.repairCost(s,e.repairId)?'disabled':''}>🔧 Repair · ${cash(G.repairCost(s,e.repairId))}</button>${darkCenter()&&s.outages[e.repairId]?.rival?`<button data-investigate-event="${esc(e.repairId)}" ${s.cash<70||!s.campaignStory.nightOps.entrance?'disabled':''}>🕵️ Investigate with security · $70</button>`:''}<button data-close-incident>Later — view in Build</button>`:
 '<button data-close-incident class="primary">Got it →</button>';
 $('incidentBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function closeIncident(){incidentOpen=false;$('incidentBackdrop').classList.add('hidden');s.eventQueue.shift();save();lastTick=Date.now();if(!showNextOpeningNotice())render();}
function showPatronEncounter(){
 if(branchOpen||incidentOpen||patronOpen||summaryOpen||storyOpen||facilityNoticeOpen||startupOpen||cutsceneOpen||cloudGateOpen||welcomeOpen)return false;
 const enc=s.encounters?.[0];if(!enc)return false;const p=G.PATRON_PROFILES.find(x=>x.id===enc.id),talk=G.PATRON_DIALOGUES[enc.id];if(!p||!talk){s.encounters.shift();return false;}
 patronOpen=true;const guestEmoji=({lou:'🎳',bea:'👟',dex:'🕹️',rosa:'🍹',nell:'🛍️',milo:'😎'})[p.id]||'🙂';$('patronPicture').innerHTML=icon('patron.'+p.id,guestEmoji);
 $('patronTitle').textContent=p.name+' dropped by!';$('patronSpeech').textContent='“'+talk.prompt+'”';
 $('patronActions').innerHTML=`<button class="primary" data-encounter="${p.id}:yes">💛 ${esc(talk.yes)}</button><button data-encounter="${p.id}:listen">💬 Hear them out</button><button data-encounter="${p.id}:no">${esc(talk.no)}</button>`;
 $('patronBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function closePatronEncounter(){patronOpen=false;$('patronBackdrop').classList.add('hidden');save();lastTick=Date.now();if(!showNextOpeningNotice())render();}
function showNextOpeningNotice(){
 if(branchOpen||summaryOpen||facilityNoticeOpen||welcomeOpen||cloudGateOpen||storyOpen)return false;
 const notice=s.facilityNotices?.[0];
 if(!notice){if(showStoryNotice())return true;if(showBranchDecision())return true;if(showIncident())return true;if(showPatronEncounter())return true;if(pendingCutscene){const lvl=pendingCutscene;pendingCutscene=null;showCutscene(lvl);return true;}return false;}
 const detail=FACILITY_TIPS[notice.id];if(!detail)return false;
 facilityNoticeOpen=true;
 $('facilityTitle').textContent=darkCenter()?`${roomName(notice.id)} ${notice.tier===2?'just expanded!':'is open for the night!'}`:(notice.tier===2?`${detail.title.replace(' is ready!',' just expanded!').replace(' is open for business!',' just expanded!')}`:detail.title);
 $('facilityNoticePicture').innerHTML=facilityIllustration(notice.id,notice.tier);
 $('facilityNoticeText').textContent=notice.tier===2?`You doubled your ${notice.id==='proshop'?'pro shop':notice.id} floor space! The improved room looks better, offers new possibilities, and may need another employee.`:detail.text;
 const tips=notice.tier===2?['🧩 Expanded rooms occupy TWO floor squares. You can rearrange their location from the Floor Plan.','👥 Food counters, bars, and pro shops need TWO employees when expanded. The arcade needs none.',...detail.points.slice(0,2)]:detail.points;
 $('facilityNoticeTips').innerHTML=(darkCenter()&&notice.id==='arcade'?['🎰 The Casino Lounge uses fictional ticket-prize games; no real-money or virtual-money wagering.','🌒 More guests visit at night. Each game played after 6 PM adds a nightlife bonus.','🛡️ Protect this attraction with cameras and door security in Build.',...tips.slice(2)]:tips).map(t=>`<div>${esc(t)}</div>`).join('');
 $('facilityBackdrop').classList.remove('hidden');lastTick=Date.now();save();return true;
}
$('facilityContinue').onclick=()=>{if(!facilityNoticeOpen)return;facilityNoticeOpen=false;
 $('facilityBackdrop').classList.add('hidden');s.facilityNotices.shift();lastTick=Date.now();save();if(!showNextOpeningNotice())render();};
function closeSummary(startTomorrow=true){$('daySummaryBackdrop').classList.add('hidden');summaryOpen=false;
 if(startTomorrow&&s.hour===G.CLOSE)G.startNextDay(s);lastTick=Date.now();render();save();showNextOpeningNotice();}
function openSummary(report){if(!report)return;summaryOpen=true;
 $('daySummaryTitle').textContent=`Week ${G.calendar(report.day).week} · ${G.calendar(report.day).weekday} complete!`;
 const feedback=report.feedback||[];
 const daily=[['Visitors',report.arrivals],['Bowled',report.served],['Stormed out',report.left]];
 if(report.walkIns)daily.push(['Food & fun only',report.walkIns]);
 if((report.facilities?report.facilities.snack:s.built.snack))daily.push(['Snack orders',report.snackOrders||0]);
 if((report.facilities?report.facilities.bar:s.built.bar))daily.push(['Bar drinks',report.barOrders||0]);
 if((report.facilities?report.facilities.arcade:s.built.arcade))daily.push(['Arcade plays',report.arcadePlays||0]);
 if(s.league.active||report.leagueHeld)daily.push(['League revenue',cash(report.leagueIncome||0)]);
 if(report.partyHeld)daily.push(['🎉 Private party',cash(report.partyIncome||0)]);
 daily.push(['💛 Customer mood',`${report.happiness??s.happiness}% (${(report.happinessDelta||0)>=0?'+':''}${report.happinessDelta||0})`]);
 if(report.loanPayment)daily.push(['Loan payment',cash(report.loanPayment)]);
 if(report.staffPay)daily.push(['Staff wages',cash(report.staffPay)]);
 if(report.capex)daily.push(['Spent building',cash(report.capex)]);
 $('daySummaryBody').innerHTML=`<div class="summaryHeadline"><span>${s.campaignStory?.path==='backalley'?'🌒 AFTER HOURS · THE NIGHT REPORT':'📣 THE LAST PIN HAS FALLEN'}</span><strong class="${report.net>=0?'positive':'negative'}">${cash(report.net)} operating net</strong></div>
 <div class="summaryGrid">${daily.map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
 <h3 class="summarySubtitle">🎤 Overheard at the alley</h3>${feedback.length?feedback.slice(-2).map(x=>`<div class="review">💬 ${esc(x)}</div>`).join(''):'<p class="muted small">"Nothing fell apart today. I can live with that." — Your accountant</p>'}
 `;
 renderOvernightRush();
 $('skipFutureSummaries').checked=skipSummaries;
 $('daySummaryBackdrop').classList.remove('hidden');$('summaryContinue').focus();}
const TUTORIAL_STEPS=[
 {target:'#hudStats',icon:'⏱️',title:'How game time works',body:'Time advances ONE game hour about every 5 seconds while Auto is on. Each day runs from 2 PM to 10 PM. Customers arrive, bowl, and spend money as hours pass. At 10 PM the closing report appears; construction and deliveries move forward by game days, not real-world days.',tip:'Settings → Game Clock can pause Auto, advance one hour manually, or finish the current day. You can take your time!'},
 {target:'#sceneDesk',icon:'🛎️',title:'Tap the front desk',body:'Set game and shoe prices here, and look back on your daily stats. Everything in this alley picture is interactive!',tip:'Try the desk after this tour to see your first business decisions.'},
 {target:'#sceneLanes',icon:'🎳',title:'Your lanes need love',body:'Tap an empty lane spot to install a lane. Once customers bowl on it, the condition drops. Tap a lane to service it or install better hardwood, ball returns and scoring screens.',tip:'Your Lanes in Build also lists every lane.'},
 {target:'nav [data-tab="manage"]',icon:'🔨',title:'Build your own kind of alley',body:'Open Build for construction, lane upgrades, decorating and room placement. You can start with snacks OR a bar—or something else entirely.',tip:'The building is yours. No snack-first rule.'},
 {target:'#openSettings',icon:'⚙️',title:'Time and saves are in Settings',body:'The alley runs from 2 PM to 10 PM. Visit Settings to pause the game, adjust time, back up saves and return to tutorials.',tip:'Explore the tabs! Each one gives you a one-time guided explanation.'}
];
const TAB_GUIDES={
 alley:['👀','Your living alley','Watch guests arrive and tap lanes, rooms and the front desk to manage them.'],
 manage:['🔨','Build, Upgrade, Rearrange','Construction handles new rooms. Your Lanes holds lane equipment. Customize handles décor. Floor Plan moves rooms.'],
 bowlers:['🎳','Meet your bowlers','Recruit and train bowlers for tournaments. Better skills and equipment make a stronger team.'],
 tournaments:['🏆','Compete for glory','Enter tournaments, practice optional shots and start a Thursday league when you have six lanes.'],
 you:['🧢','You run this place','Spend your owner skill points on management, coaching or promotions as your business grows.'],
 employees:['👥','Hire the crew','The snack bar, drinks counter and pro shop must be staffed. Train employees and set wages here.'],
 goals:['⭐','Grow your Alley Stars','Room visits and actual improvements earn department stars. Combine department stars with reputation and visitors to level up.'],
 settings:['⚙️','The control room','Automatic time advances about one game hour per five real seconds, from 2 PM to 10 PM. Pause time, tap Next Hour or Finish Day, or export your save here.']
};
function guideTarget(){const selector=guideMode==='tab'?`nav [data-tab="${tabTipId}"]`:(TUTORIAL_STEPS[tutorialStep]?.target||'#sceneDesk');return document.querySelector(selector);}
function placeGuide(){if(!tutorialOpen)return;const target=guideTarget(),spot=$('guideSpot'),arr=$('guideArrow');if(!target){spot.style.display='none';arr.style.display='none';return;}
 const r=target.getBoundingClientRect(),visible=r.bottom>4&&r.top<innerHeight-5;
 if(!visible&&guideMode==='intro'){target.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});requestAnimationFrame(placeGuide);return;}
 const left=Math.max(5,r.left-4),top=Math.max(5,r.top-4),w=Math.min(innerWidth-left-5,r.width+8),h=Math.min(innerHeight-top-5,r.height+8);
 Object.assign(spot.style,{display:'block',left:left+'px',top:top+'px',width:w+'px',height:h+'px'});
 const bubble=$('tutorialBackdrop').querySelector('.guidedBubble'),availableAbove=Math.max(0,top-12),availableBelow=Math.max(0,innerHeight-(top+h)-12),onTop=availableAbove>availableBelow;
 const space=Math.max(155,onTop?availableAbove:availableBelow);bubble.style.maxHeight=Math.min(370,space-7)+'px';
 bubble.style.top=onTop?'7px':'auto';bubble.style.bottom=onTop?'auto':Math.max(7,Math.min(innerHeight-145,innerHeight-(top+h)-6))+'px';
 // On phones prefer the opposite edge of the highlighted element, without hiding Next.
 if(onTop){bubble.style.top='7px';bubble.style.bottom='auto';}else{bubble.style.top=Math.min(innerHeight-170,top+h+32)+'px';bubble.style.bottom='auto';}
 arr.textContent=onTop?'⬇':'⬆';Object.assign(arr.style,{display:'block',left:Math.min(innerWidth-36,Math.max(8,left+w/2-13))+'px',top:(onTop?Math.max(6,top-35):Math.min(innerHeight-40,top+h+4))+'px'});
}
function renderTutorial(){const t=guideMode==='tab'?{icon:TAB_GUIDES[tabTipId][0],title:TAB_GUIDES[tabTipId][1],body:TAB_GUIDES[tabTipId][2],tip:'You can explore this tab now. This explanation will not keep popping up.'}:TUTORIAL_STEPS[tutorialStep];
 $('tutorialStepLabel').textContent=guideMode==='tab'?'FIRST VISIT TO THIS TAB':(tutorialStep+1)+' OF '+TUTORIAL_STEPS.length;
 $('tutorialEmoji').textContent=t.icon;$('tutorialTitle').textContent=t.title;$('tutorialText').textContent=t.body;$('tutorialTip').textContent=t.tip;
 $('tutorialBack').hidden=guideMode==='tab';$('tutorialBack').disabled=tutorialStep===0;
 $('tutorialNext').textContent=guideMode==='tab'?'Got it ✓':tutorialStep===TUTORIAL_STEPS.length-1?'Start bowling! 🎳':'Next →';
 $('tutorialDots').innerHTML=guideMode==='tab'?'':TUTORIAL_STEPS.map((_,i)=>`<span class="${i===tutorialStep?'active':''}"></span>`).join('');
 requestAnimationFrame(placeGuide);
}
function showTutorial(start=0){guideMode='intro';tutorialOpen=true;tutorialStep=start;gotoTab('alley');$('tutorialBackdrop').classList.remove('hidden');renderTutorial();lastTick=Date.now();}
function showTabTip(id){if(!TAB_GUIDES[id]||seenTabTips[id])return;seenTabTips[id]=true;tabTipId=id;guideMode='tab';tutorialOpen=true;$('tutorialBackdrop').classList.remove('hidden');renderTutorial();lastTick=Date.now();save();}
function closeTutorial(){tutorialOpen=false;if(guideMode==='intro')tutorialSeen=true;$('tutorialBackdrop').classList.add('hidden');lastTick=Date.now();save();}
window.addEventListener('resize',placeGuide);window.addEventListener('scroll',()=>{if(tutorialOpen)requestAnimationFrame(placeGuide);},true);
$('openSettings').onclick=()=>gotoTab('settings',true);$('openTutorial').onclick=()=>showTutorial();$('tutorialSkip').onclick=closeTutorial;$('tutorialBack').onclick=()=>{if(tutorialStep>0){tutorialStep--;renderTutorial();}};$('tutorialNext').onclick=()=>{if(guideMode==='tab'||tutorialStep>=TUTORIAL_STEPS.length-1)closeTutorial();else{tutorialStep++;renderTutorial();}};
function showCutscene(level){cutsceneOpen=true;introSeen=true;introCutscene=level===1;const intro=level===1;
 const headings={1:'Grandpa Gus’s old alley',2:'The neighborhood has noticed!',3:'A real neighborhood favorite!',4:'The town is talking!',5:'Bowling empire unlocked!'};
 const captions={1:'A perfectly empty building. The floor is yours. The loan officer is already calling. Pick your first project!',2:'Business is building! More lanes, more visitors, and fewer empty corners.',3:'More people, more lanes, more possibilities.',4:'A bigger, busier bowling destination. The competitors are noticing.',5:'Lights, lanes, and legends. You built something special.'};
 $('cutsceneTitle').textContent=headings[level]||'A new era of bowling!';$('cutsceneCaption').textContent=captions[level]||'Your bowling center has leveled up!';
 const art=$('cutsceneArt');art.className='cutsceneArt level-'+level;
 const key=level===1?'cutscene.empty':'cutscene.level'+level;
 art.style.setProperty('--cutscene-image',assets[key]?`url("${assets[key].replace(/"/g,'')}")`:'none');
 $('cutsceneBuilding').lastElementChild.textContent=level===1?'YOUR FUTURE BOWLING ALLEY':G.venueName(s).toUpperCase();
 $('cutsceneContinue').textContent=intro?'Open your alley →':'Continue the adventure →';
 $('cutsceneBackdrop').classList.remove('hidden');save();}
function endCutscene(){$('cutsceneBackdrop').classList.add('hidden');cutsceneOpen=false;lastTick=Date.now();save();if(introCutscene&&s.startupPending)showStartup();else if(introCutscene&&!tutorialSeen)showTutorial();introCutscene=false;}
function checkClosing(result,oldLevel){if(result.dayEnded){if(cloudMode&&cloudSaveSignal)cloudSaveSignal('day-close');const newLevel=G.venueLevel(s);if(newLevel>lastAnnouncedLevel){pendingCutscene=newLevel;lastAnnouncedLevel=newLevel;}
 if(!skipSummaries)openSummary(s.lastDay);else if(!showNextOpeningNotice()&&!auto)toast(`Day ${s.day} closed. Next hour starts tomorrow.`);}
}
$('cutsceneContinue').onclick=endCutscene;$('cutsceneSkip').onclick=endCutscene;
$('summaryContinue').onclick=()=>closeSummary(true);
$('closeSummary').onclick=()=>closeSummary(true);
$('summaryDesk').onclick=()=>{closeSummary(true);openDrawer('desk');};
$('skipFutureSummaries').onchange=e=>{skipSummaries=e.target.checked;$('skipSummarySetting').checked=skipSummaries;save();};
$('lowMotionSetting').onchange=e=>{lowMotion=e.target.checked;applyAccessibility();save();};
$('largeTextSetting').onchange=e=>{largeText=e.target.checked;applyAccessibility();save();};
$('skipSummarySetting').onchange=e=>{skipSummaries=e.target.checked;save();};
$('daySummaryBackdrop').onclick=e=>{if(e.target===$('daySummaryBackdrop'))closeSummary(true);};
function stepHour(manual=false){if(welcomeOpen||summaryOpen||cutsceneOpen||tutorialOpen||startupOpen||facilityNoticeOpen||storyOpen||incidentOpen||patronOpen||s.startupPending)return;const oldLevel=G.venueLevel(s),result=G.tickHour(s);lastTick=Date.now();render();syncVisitors(result.events);save();checkClosing(result,oldLevel);
 if(manual&&!result.dayEnded)toast(`${G.formatHour(result.hour)}–${G.formatHour(result.hour+1)} · ${result.events.filter(x=>x.type==='arrival').length} group arrivals.`);
 if(drawer)renderDrawer();return result;}
function finishDay(){if(welcomeOpen||summaryOpen||cutsceneOpen||tutorialOpen||startupOpen||facilityNoticeOpen||storyOpen||s.startupPending)return;const oldLevel=G.venueLevel(s);let count=0,result;do{result=G.tickHour(s);count++;}while(!result.dayEnded&&count<9);
 lastTick=Date.now();render();syncVisitors(result.events);save();if(drawer)renderDrawer();checkClosing(result,oldLevel);}
$('nextHour').onclick=()=>stepHour(true);$('endDay').onclick=finishDay;$('toggleAuto').onclick=()=>{auto=!auto;lastTick=Date.now();render();save();toast(auto?'Auto time resumed.':'Auto time paused.');};$('recruit').onclick=()=>perform(G.recruit(s),'Welcome to the team!');$('save').onclick=()=>{save();toast('Game saved to this browser.');};
$('reset').onclick=()=>openResetConfirm();

function showWelcome(){
 welcomeOpen=true;const isSaved=hadSavedGame;
 $('welcomeTitle').textContent=isSaved?'Back for another frame?':'Oops — we could not read that save';
 $('welcomeDescription').textContent=isSaved?'Your bowling alley is ready whenever you are.':'We found old save data, but it could not be restored safely. You can import a backup or begin again.';
 $('welcomeDetails').textContent=isSaved?`Week ${G.calendar(s.day).week} · ${G.calendar(s.day).weekday} · Alley level ${G.venueLevel(s)} · ${cash(s.cash)}`:'Your existing browser data has not been overwritten.';
 $('welcomeContinue').classList.toggle('hidden',!isSaved);
 $('welcomeConfirm').classList.add('hidden');$('welcomeChoice').classList.remove('hidden');$('welcomeBackdrop').classList.remove('hidden');
}
function hideWelcome(){welcomeOpen=false;$('welcomeBackdrop').classList.add('hidden');lastTick=Date.now();}
function resumeLoaded(){hideWelcome();render();gotoTab(tab);syncVisitors([],true);
 // On reload, do not silently advance hours in bulk or leave the game looking frozen.
 if(s.hour===G.CLOSE&&!skipSummaries&&s.lastDay&&s.lastDay.day===s.day)openSummary(s.lastDay);
 else if(s.facilityNotices?.length||s.story?.pending?.length||s.eventQueue?.length||s.encounters?.length)showNextOpeningNotice();
 else if(!introSeen){introSeen=true;if(!showStoryNotice())showStartup();}
 else if(s.startupPending){if(!showStoryNotice())showStartup();}
 else if(!tutorialSeen)showTutorial();
 save();
}
function beginNewGame(){storeRecovery();hideWelcome();closeDrawer();s=G.newGame();lastTick=Date.now();auto=true;tab='alley';buildSection='construction';skipSummaries=false;introSeen=false;tutorialSeen=false;summaryOpen=false;pendingCutscene=null;cutsceneOpen=false;tutorialOpen=false;layoutMode=false;movingRoom=null;lastAnnouncedLevel=1;
 for(const id of ['daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop','startupBackdrop','facilityBackdrop','storyBackdrop','incidentBackdrop','patronBackdrop','branchBackdrop'])$(id).classList.add('hidden');facilityNoticeOpen=false;storyOpen=false;incidentOpen=false;patronOpen=false;branchOpen=false;$('visitorLayer').replaceChildren();render();gotoTab('alley');save();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('new-game');introSeen=true;showStoryNotice();
}
function openResetConfirm(){
 resetFromSettings=!welcomeOpen;
 if(welcomeOpen){$('welcomeChoice').classList.add('hidden');$('welcomeConfirm').classList.remove('hidden');return;}
 showWelcome();$('welcomeTitle').textContent='New game, who dis?';$('welcomeDescription').textContent='Your current game can be kept in the recovery slot.';
 $('welcomeChoice').classList.add('hidden');$('welcomeConfirm').classList.remove('hidden');
}
function exportSave(){
 try{const data={format:'from-gutter-to-glory-save',exportVersion:1,exportedAt:new Date().toISOString(),state:s};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`gutter-to-glory-week-${G.calendar(s.day).week}-day-${s.day}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('Save downloaded. Keep it somewhere safe!');
 }catch(e){toast('Could not export the save.',true);}
}
async function readImportedFile(file){
 if(!file)return;
 if(file.size>4_000_000){toast('That save file is too large (4 MB maximum).',true);return;}
 try{const raw=await file.text(),data=safeJSON(raw);
 if(!data||data.format&&data.format!=='from-gutter-to-glory-save')throw Error('Invalid format');
 const candidate=candidateState(raw);
 if(!candidate)throw Error('Invalid save structure');
 importPending=candidate.state;
 const d=G.calendar(importPending.day);$('importConfirmDetails').textContent=`Week ${d.week}, ${d.weekday} · ${G.venueName(importPending)} · ${cash(importPending.cash)}`;
 $('importConfirmBackdrop').classList.remove('hidden');
 }catch(e){toast('That file is not a compatible bowling alley save.',true);}
}
function useImportedSave(keepRecovery=true){if(!importPending)return;if(keepRecovery)storeRecovery();s=importPending;importPending=null;hideWelcome();$('importConfirmBackdrop').classList.add('hidden');$('daySummaryBackdrop').classList.add('hidden');$('cutsceneBackdrop').classList.add('hidden');$('tutorialBackdrop').classList.add('hidden');summaryOpen=false;tutorialOpen=false;cutsceneOpen=false;introSeen=true;tutorialSeen=true;tab='alley';lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab('alley');syncVisitors([],true);save();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('import');if(s.hour===G.CLOSE&&!skipSummaries&&s.lastDay?.day===s.day)openSummary(s.lastDay);toast('Bowling alley imported!');}
$('welcomeContinue').onclick=resumeLoaded;
$('welcomeNew').onclick=openResetConfirm;
$('welcomeCancel').onclick=()=>{$('welcomeConfirm').classList.add('hidden');$('welcomeChoice').classList.remove('hidden');if(resetFromSettings){hideWelcome();resetFromSettings=false;}};
$('welcomeConfirmReset').onclick=beginNewGame;
$('welcomeImport').onclick=()=>$('importSaveFile').click();
$('exportSave').onclick=exportSave;
$('importSave').onclick=()=>$('importSaveFile').click();
$('importSaveFile').onchange=async e=>{await readImportedFile(e.target.files[0]);e.target.value='';};
$('importCancel').onclick=()=>{importPending=null;$('importConfirmBackdrop').classList.add('hidden');};
$('importConfirm').onclick=()=>useImportedSave();
$('restoreBackup').onclick=()=>{const raw=safeRead(BACKUP);const b=candidateState(raw);if(!b){toast('No recoverable previous game is stored here.',true);return;}if(!confirm('Restore the previous game? Export your current game first if you want to keep both.'))return;importPending=b.state;useImportedSave(false);};
$('closeDrawer').onclick=closeDrawer;$('drawerBackdrop').onclick=closeDrawer;document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(tutorialOpen)closeTutorial();else if(incidentOpen||patronOpen||facilityNoticeOpen){}else if(cutsceneOpen)endCutscene();else if(summaryOpen)closeSummary(true);else if(drawer)closeDrawer();}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.showBranch!==undefined){showBranchDecision(true);return;}
 if(b.dataset.campaignChoice){const path=b.dataset.campaignChoice;const label=G.CAMPAIGN_PATHS.find(x=>x.id===path)?.name;if(!label)return;if(!confirm('Permanently commit '+s.locationName+' to '+label+'? This location cannot switch to the other storyline. A different town may choose differently.'))return;const r=G.chooseCampaign(s,path);if(!r.ok){toast(r.reason,true);return;}hideBranchDecision();render();save();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('campaign');toast(label+' begins!');return;}
 if(b.dataset.branchLater!==undefined){s.campaignStory.promptDismissed=true;hideBranchDecision();render();save();return;}
 if(b.dataset.nightDefense){perform(G.buyNightDefense(s,b.dataset.nightDefense),'Night-shift security upgraded.');return;}
 if(b.dataset.investigate){perform(G.emergencyResponse(s,b.dataset.investigate),'Your night crew reopened the business.');return;}
 if(b.dataset.investigateEvent){const outcome=G.emergencyResponse(s,b.dataset.investigateEvent);if(!outcome.ok){toast(outcome.reason,true);return;}closeIncident();return;}
 if(b.dataset.noirAction){perform(G.campaignAction(s,b.dataset.noirAction),'Night operations decision made.');return;}
 if(b.id==='devExitPreview'){exitDevelopmentPreview();return;}
 if(b.dataset.devScenario){prepareDevelopment(b.dataset.devScenario);return;}
 if(b.dataset.openSecondTown!==undefined){if(!confirm('Spend $8,000 to open a new empty building in Riverside? Its finances, game time, and story path will be separate.'))return;perform(G.openSecondTown(s),'Your second town is open! Switch locations from Settings.');return;}
 if(b.dataset.switchTown){const next=G.switchTown(s,b.dataset.switchTown);if(!next){toast('Unable to switch to that location.',true);return;}s=next;auto=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab('settings');save();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('switch-town');toast('Switched to '+s.locationName+'; auto time paused.');return;}
 if(b.dataset.laneKitAll){perform(G.upgradeAllLanes(s,b.dataset.laneKitAll),'Center-wide equipment installed!');return;}
 if(b.dataset.goalNav){goalSection=b.dataset.goalNav;showGoalSection();return;}
 if(b.dataset.closeIncident!==undefined){closeIncident();return;}
 if(b.dataset.repairEvent){const outcome=G.repairOutage(s,b.dataset.repairEvent);if(!outcome.ok){toast(outcome.reason,true);return;}closeIncident();return;}
 if(b.dataset.repair){perform(G.repairOutage(s,b.dataset.repair),'Repairs completed. Back in business!');return;}
 if(b.dataset.partyChoice){const outcome=G.respondPartyRequest(s,b.dataset.partyChoice==='yes');if(outcome.ok)closeIncident();else toast(outcome.reason,true);return;}
 if(b.dataset.encounter){const [id,answer]=b.dataset.encounter.split(':');const response=G.respondEncounter(s,id,answer);if(response.ok){closePatronEncounter();toast(response.delta>0?'Friendship grew!':'They seem a little disappointed.');}else toast(response.reason,true);return;}
 if(b.dataset.bookingDay){bookingDayAhead=Number(b.dataset.bookingDay);renderBookings();return;}
 if(b.dataset.bookEvent){const [id,cater]=b.dataset.bookEvent.split(':');perform(G.bookContract(s,id,bookingDayAhead,cater==='1'),'Event contract signed!');return;}
 if(b.dataset.partner){perform(G.negotiatePartnership(s,b.dataset.partner),'Community partnership secured!');return;}
 if(b.dataset.roomDetail){perform(G.buyRoomDetail(s,b.dataset.roomDetail),'Room personalized!');return;}
 if(b.dataset.emergencyCoverage!==undefined){perform(G.buyEmergencyCoverage(s),'Emergency service coverage purchased!');return;}
 if(b.dataset.hardship){perform(G.paymentPlanRepair(s,b.dataset.hardship),'Community assistance repaired your facility!');return;}
 if(b.dataset.rival){perform(G.respondToRival(s,b.dataset.rival),'You responded to StrikeCity!');return;}
 if(b.dataset.mapZoom){sceneZoom=Math.max(80,Math.min(140,sceneZoom+Number(b.dataset.mapZoom)));applyAccessibility();save();return;}
 if(b.dataset.focusScene){document.getElementById(b.dataset.focusScene)?.scrollIntoView({block:'center',inline:'nearest',behavior:lowMotion?'instant':'smooth'});return;}
 if(b.dataset.schoolPartnership!==undefined){perform(G.secureSchoolPartnership(s),'Your school partnership is official!');return;}
 if(b.dataset.patron){const [id,action]=b.dataset.patron.split(':');perform(G.talkToPatron(s,id,action),action==='invite'?'New league member!':'You made their day a little brighter.');return;}
 if(b.id==='toggleLayout'){layoutMode=!layoutMode;movingRoom=null;if(layoutMode){gotoTab('alley');$('exitLayout').classList.remove('hidden');}else $('exitLayout').classList.add('hidden');renderRoomGrid();return;}
 if(b.dataset.roomMove){if(!s.built[b.dataset.roomMove]&&!G.isBuilding(s,b.dataset.roomMove))return;closeDrawer();layoutMode=true;movingRoom=b.dataset.roomMove;gotoTab('alley');$('exitLayout').classList.remove('hidden');renderRoomGrid();toast('Tap an empty floor square to move your '+b.dataset.roomMove+'.');return;}
 if(b.dataset.placeRoom){const [x,y]=b.dataset.placeRoom.split(':').map(Number);if(perform(G.moveRoom(s,movingRoom,x,y),'Room moved!')){movingRoom=null;renderRoomGrid();}return;}
 if(b.dataset.expandRoom){perform(G.expandRoom(s,b.dataset.expandRoom),'Room expansion started!');return;}
 if(b.dataset.finance){selectedFinance=b.dataset.finance;startupPreview();return;}
 if(b.dataset.starterStyle){selectedStyle=b.dataset.starterStyle;startupPreview();return;}
 if(b.dataset.specialty){if(confirm('Make '+(G.SPECIALTIES.find(x=>x.id===b.dataset.specialty)?.name||'this choice')+' the identity of your first alley? This choice is permanent for this location.')){if(perform(G.chooseSpecialty(s,b.dataset.specialty),'Your alley has found its specialty!')){if(cloudMode&&cloudSaveSignal)cloudSaveSignal('specialty');}}return;}
 if(b.dataset.buyLand!==undefined){perform(G.buyLand(s),'The neighbors are selling! Four new lanes coming soon.');return;}
 if(b.dataset.rush){const [kind,id]=b.dataset.rush.split(':');const j=s.construction.find(x=>x.kind===kind&&x.id===id);if(!j)return;const cost=G.rushCost(j);if(confirm(`Bring in the overnight crew for ${j.title}? Pay ${cash(cost)} to finish it now?`)){if(perform(G.rushConstruction(s,kind,id),'Construction rushed!')){renderOvernightRush();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('rush');}}return;}
 if(b.dataset.buildSection){buildSection=b.dataset.buildSection;showBuildSection();save();return;}
 if(b.id==='exitLayout'){layoutMode=false;movingRoom=null;renderRoomGrid();$('exitLayout').classList.add('hidden');return;}
 if(b.dataset.hire){perform(G.hireEmployee(s,b.dataset.hire),'New hire! Somebody tell the pins.');return;}
 if(b.dataset.wage){const [id,d]=b.dataset.wage.split(':');const e=s.employees.find(x=>x.id===Number(id));if(e)perform(G.setWage(s,id,e.wage+Number(d)));return;}
 if(b.dataset.trainStaff){perform(G.trainEmployee(s,b.dataset.trainStaff),'Employee leveled up!');return;}
 if(b.dataset.threshold){perform(G.setStockThreshold(s,s.lowStockThreshold+Number(b.dataset.threshold)),'Low-stock trigger adjusted.');return;}
 if(b.dataset.tab){gotoTab(b.dataset.tab,true);return;}
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
 if(b.dataset.laneKit){const [id,kit]=b.dataset.laneKit.split(':');perform(G.upgradeLane(s,id,kit),'Lane '+id+' improved!');return;}
 if(b.dataset.laneTheme){const [id,theme]=b.dataset.laneTheme.split(':');perform(G.setLaneTheme(s,id,theme),'New scoring animation selected!');return;}
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
// v0.9: Reopen deliberately. Never simulate days while the player is choosing a save.
setInterval(()=>{const now=Date.now();if(auto&&!cloudGateOpen&&!welcomeOpen&&!summaryOpen&&!cutsceneOpen&&!tutorialOpen&&!startupOpen&&!facilityNoticeOpen&&!incidentOpen&&!patronOpen&&!storyOpen&&!s.startupPending&&now-lastTick>=MS_HOUR){
 try{const lv=G.venueLevel(s),result=G.tickHour(s);lastTick=now;render();syncVisitors(result.events);if(drawer)renderDrawer();save();checkClosing(result,lv);}
 catch(e){auto=false;lastTick=Date.now();console.error('Game clock paused to protect save',e);toast('Clock paused to protect your game. Open Settings to export a backup.',true);save();}
}},160);
render();gotoTab(tab);syncVisitors([],true);
// Cloud bootstrapping decides when to unlock the clock, avoiding running the game
// before login and before the cloud/local save choice is complete.
function unlockDemo(){
 cloudMode=false;KEY='gutter-to-glory-v091-demo';BACKUP='gutter-to-glory-backup-v091-demo';
 const d=candidateState(safeRead(KEY));if(d){s=d.state;hadSavedGame=true;introSeen=true;tutorialSeen=true;}
 cloudGateOpen=false;lastAnnouncedLevel=G.venueLevel(s);
 if(hadSavedGame||hadBrokenSave){showWelcome();}else{welcomeOpen=false;render();gotoTab('alley');introSeen=true;showStoryNotice();}
}
function readBrowserCandidate(uid){
 const saved=candidateState(safeRead('gutter-to-glory-v091-user-'+uid));
 return saved?{...saved,source:'this account on this browser'}:hadSavedGame?{state:s,lastTick,source:'v0.9 browser save'}:null;
}
function unlockCloud(uid,snapshot,source='cloud'){
 cloudMode=true;KEY='gutter-to-glory-v091-user-'+uid;BACKUP='gutter-to-glory-v091-backup-'+uid;
 for(const id of ['welcomeBackdrop','daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop','facilityBackdrop','storyBackdrop','incidentBackdrop','patronBackdrop','branchBackdrop'])$(id).classList.add('hidden');facilityNoticeOpen=false;
 closeDrawer();summaryOpen=false;cutsceneOpen=false;tutorialOpen=false;storyOpen=false;incidentOpen=false;patronOpen=false;branchOpen=false;
 if(snapshot){const imported=G.migrate(snapshot.state||snapshot);if(!imported||!G.checkState(imported))throw Error('Save file was rejected by the game engine');
   s=imported;introSeen=true;tutorialSeen=true;welcomeOpen=false;}
 else{s=G.newGame();introSeen=false;tutorialSeen=false;welcomeOpen=false;skipSummaries=false;tab='alley';auto=true;}
 cloudGateOpen=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab(tab);syncVisitors([],true);save();
 if(!snapshot){introSeen=true;showStoryNotice();}
 else if(s.startupPending)showStartup();
 else if(s.facilityNotices?.length||s.story?.pending?.length||s.eventQueue?.length||s.encounters?.length)showNextOpeningNotice();
 else if(s.hour===G.CLOSE&&!skipSummaries&&s.lastDay?.day===s.day)openSummary(s.lastDay);
}
function lockCloud(){cloudGateOpen=true;welcomeOpen=true;cloudMode=false;closeDrawer();
 for(const id of ['welcomeBackdrop','daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop','facilityBackdrop','storyBackdrop','incidentBackdrop','patronBackdrop','branchBackdrop'])$(id).classList.add('hidden');facilityNoticeOpen=false;
 summaryOpen=false;cutsceneOpen=false;tutorialOpen=false;s=G.newGame();lastTick=Date.now();render();}
window.GTGApp={
 unlockDemo,unlockCloud,lockCloud,readBrowserCandidate,
 validate(snapshot){try{const v=G.migrate(snapshot?.state||snapshot);return !!v&&G.checkState(v);}catch{return false;}},
 snapshot(){return {state:structuredClone(s),lastTick:Date.now()};},
 registerCloudSave(fn){cloudSaveSignal=fn;},
 isDevelopmentPreview(){return devPreviewMode;},
 notify(message,error=false){toast(message,error);},
 getBrief(snapshot){const v=G.migrate(snapshot.state||snapshot);return `Week ${G.calendar(v.day).week} · ${G.calendar(v.day).weekday} · Level ${G.venueLevel(v)} · ${cash(v.cash)}`;},
 getLevel(){return G.venueLevel(s);},getDay(){return s.day;}
};
})();
