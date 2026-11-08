/* From Gutter to Glory v1.10 — visual game controller. Gameplay lives in engine.js. */
(()=>{'use strict';
const G=window.BowlingCore;
let KEY='gutter-to-glory-v091-demo',BACKUP='gutter-to-glory-backup-v091-demo';const PREVIOUS='gutter-to-glory-v09',LEGACY='gutter-to-glory-v07',UIKEY='gutter-to-glory-ui-v09',OLDUI='gutter-to-glory-ui-v08';
const MS_HOUR=5200,MAX_OFFLINE_HOURS=24;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const darkCenter=()=>s.campaignStory?.path==='backalley';
const roomName=id=>darkCenter()?({arcade:'Casino Lounge',bar:'Speakeasy',snack:'Night Grill',proshop:'Backroom Outfitters'})[id]||id:({arcade:'Arcade',bar:'Bowling Bar',snack:'Snack Counter',proshop:'Pro Shop'})[id]||id;
const cash=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString();
// v1.06: all built-in art lives in assets/asset-map.js. Nothing is guessed here, so the game
// never requests files that do not exist.
const defaultAssets={};
const assets={...defaultAssets,...window.BOWLING_ASSETS};
// v1.06: each image path is probed once. Known-good art renders without the emoji underneath;
// a missing file is remembered so later renders do not request it again.
const artState=new Map();
function probeArt(path){if(artState.has(path))return artState.get(path);artState.set(path,'pending');const img=new Image();img.onload=()=>artState.set(path,'ok');img.onerror=()=>artState.set(path,'fail');img.src=path;return 'pending';}
const artSrc=key=>{const path=assets[key];return path&&probeArt(path)!=='fail'?path:'';};
window.__gtgArtFailed=p=>artState.set(p,'fail');
const icon=(key,emoji,extra='')=>{const path=artSrc(key);if(!path)return `<span class="icon-art ${extra}" aria-hidden="true"><span>${emoji}</span></span>`;const p=esc(path);
 if(artState.get(path)==='ok')return `<span class="icon-art has-art ${extra}" aria-hidden="true"><img src="${p}" alt="" decoding="async"></span>`;
 return `<span class="icon-art ${extra}" aria-hidden="true"><span>${emoji}</span><img src="${p}" alt="" decoding="async" onload="this.parentNode.classList.add('has-art')" onerror="window.__gtgArtFailed(this.getAttribute('src'));this.remove()"></span>`;};
document.querySelectorAll('[data-icon]').forEach(el=>{el.outerHTML=icon(el.dataset.icon,el.dataset.emoji)});
const starRow=(n,big=false)=>{n=Math.max(0,Math.min(5,Math.round(n||0)));return `<span class="starRow ${big?'big':''}" role="img" aria-label="${n} of 5 stars">${[0,1,2,3,4].map(i=>`<i class="${i<n?'':'off'}"></i>`).join('')}</span>`;};
const DEPT_DRAWER={lanes:'lanes',snack:'snacks',bar:'bar',arcade:'arcade',proshop:'shop',comfort:'benches',style:'decor'};
const DEPT_ART={lanes:'fixture.ballracks',snack:'world.snack',bar:'world.bar',arcade:'world.arcade',proshop:'world.proshop',comfort:'world.benches',style:'fixture.wallart'};
const deptStars=id=>{const r=G.departmentRatings(s)[id];return r?`<div class="deptStarBar">${starRow(r.stars,true)}<span><b>${r.stars}/5</b> department rating</span></div>`:'';};
const storyArtKey=speaker=>{const who=String(speaker||'').split(/[\s·]/)[0].toLowerCase();return who==='grandpa'||who==='gus'?'story.gus':who==='vera'?'story.vera':['lou','bea','dex','rosa','nell','milo'].includes(who)?'patron.'+who:'story.letter';};
const incidentArtKey=e=>({'vera-op':'story.vera','vera-tier':'story.vera','turf-intro':'story.vera','noir-accord':'story.vera','vera-siege':'story.vera','vera-raid':'story.vera','vera-retake':'story.vera','vera-repelled':'ally.doorman','maya-arrives':'bowler.maya','maya-first-frame':'bowler.maya','leo-arrives':'bowler.leo','legacy-finale':'path.legacy','noir-finale':'path.backalley','party-request':'upgrade.partyroom'})[e.id]||(String(e.id||'').startsWith('chapter-')?'path.backalley':e.kind==='request'?'upgrade.partyroom':'misc.none');
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
 if(ui){sceneZoom=100;lowMotion=!!ui.lowMotion;largeText=!!ui.largeText;auto=ui.auto!==false;skipSummaries=ui.skipSummaries===true;introSeen=ui.introSeen===true||introSeen;tab=['alley','regulars','bowlers','tournaments','you','employees','goals','settings'].includes(ui.tab)?ui.tab:'alley';buildSection=['construction','lanes','style','layout','future'].includes(ui.buildSection)?ui.buildSection:'construction';if(typeof ui.tutorialSeen==='boolean')tutorialSeen=ui.tutorialSeen;if(ui.seenTabTips&&typeof ui.seenTabTips==='object')seenTabTips=ui.seenTabTips;}
}catch(e){console.warn('UI preferences could not be loaded',e);}
if(hadSavedGame&&!hadNewUI)tutorialSeen=true;
welcomeOpen=hadSavedGame||hadBrokenSave;
let lastAnnouncedLevel=G.venueLevel(s);
function storeRecovery(){flushSave();try{const old=safeRead(KEY)||safeRead(saveSource||KEY);if(old&&candidateState(old))localStorage.setItem(BACKUP,old);return true;}catch(e){return false;}}
// v1.06: saving serialises the whole alley, so writes are coalesced. save() schedules one
// write shortly after a burst of actions; saveNow() writes immediately (closing, imports,
// switching saves, leaving the page).
let saveTimer=null;const SAVE_DELAY=900;
function saveUI(){if(welcomeOpen||cloudGateOpen)return false;try{localStorage.setItem(UIKEY,JSON.stringify({auto,tab,buildSection,skipSummaries,introSeen,tutorialSeen,seenTabTips,sceneZoom,lowMotion,largeText}));return true;}catch(e){return false;}}
function saveNow(){clearTimeout(saveTimer);saveTimer=null;if(welcomeOpen||cloudGateOpen)return false;try{localStorage.setItem(KEY,JSON.stringify({state:s,lastTick:Date.now()}));saveUI();saveAvailable=true;return true;}catch(e){saveAvailable=false;console.warn('Save unavailable',e);return false;}}
function save(){if(welcomeOpen||cloudGateOpen)return false;if(!saveTimer)saveTimer=setTimeout(saveNow,SAVE_DELAY);return saveAvailable;}
function flushSave(){if(saveTimer)saveNow();}
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
function gotoTab(id,userClick=false){tab=id;if(staleTabs.has(id))renderTab(id);document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===id);if(el.dataset.tab===id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});closeDrawer();saveUI();const tipId=id==='tournaments'&&isTurf()?'turf':id;if(userClick&&!devPreviewMode&&!tutorialOpen&&!startupOpen&&!welcomeOpen&&!cloudGateOpen&&!seenTabTips[tipId]&&!s.startupPending)showTabTip(tipId);}
function openDrawer(id){if(id==='ads')id='desk:ads';const [base,want]=String(id).split(':');id=base;if(want)drawerTabs[id]=want;else if(drawer!==id)drawerTabs[id]=undefined;drawer=id;renderDrawer();$('drawerBackdrop').classList.remove('hidden');$('drawer').classList.remove('hidden');$('closeDrawer').focus();}
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
 <section class="drawerCard"><h3>Your Startup Loan</h3><div class="drawerRow"><span>Outstanding balance</span><b>${cash(s.loan.balance)}</b></div><small>${s.loan.balance?`${cash(s.loan.payment)} due each Sunday if funds are available. Loans in the game have no interest.`:"Paid off! No more Sunday payments."}</small></section><section class="drawerCard"><h3>Customer Happiness <span class="badge">${s.happiness}%</span></h3><div class="meter"><div style="width:${s.happiness}%"></div></div><small>Guests who bowl happily help your rating. Angry walkouts and missing snacks lower it. Closing reports explain the day's change.</small></section><section class="drawerCard"><h3>Set Your Prices</h3>${priceBlock('lane','Bowling lane','Per group · per hour')}${priceBlock('shoes','Shoe rental','Per person · per visit')}<p class="tiny muted">Higher prices earn more per visit, but can reduce guest demand. Adjust them whenever you like.</p></section>
 <section class="drawerCard"><h3>Day ${s.day} · ${s.hour===G.CLOSE?'Closed':G.formatHour(s.hour)}</h3>${reportCards(s.today)}</section>
 <section class="drawerCard"><h3>Guest Feedback</h3>${s.hour===G.CLOSE?tipHTML(s.lastDay):'<p class="muted small">Feedback is collected when the alley closes. Early complaints are suggestions, not harsh penalties.</p>'}</section><button class="full" data-open="diary">Open full daily log</button>`;}
function facilityIllustration(id,forceTier){
 const tier=forceTier||s.roomTiers[id]||1;
 const meta={snack:{name:'Snack Shack',sign:'FRESH SNACKS',basic:[['snack.popcorn','🍿'],['snack.soda','🥤'],['snack.fries','🍟']],upgrade:[['snack.burger','🍔'],['snack.pizza','🍕'],['snack.pretzel','🥨']]},bar:{name:'Bowling Bar',sign:'ON TAP',basic:[['drink.beer','🍺'],['drink.wine','🍷'],['drink.cider','🍎']],upgrade:[['drink.margarita','🍹'],['drink.oldfashioned','🥃'],['drink.mocktail','🥤']]},arcade:{name:'Mini Arcade',sign:'INSERT COIN',basic:[['machine.pinball','🕹️'],['machine.invaders','👾'],['machine.crane','🧸']],upgrade:[['machine.hockey','🏒'],['machine.racer','🏎️']]},proshop:{name:'Pro Shop',sign:'GEAR UP',basic:[['shop.ball','🎳'],['shop.shoes','👟'],['shop.bag','👜']],upgrade:[['shop.towel','🧽'],['shop.spray','🧴'],['shop.tape','🩹']]}}[id];
 if(!meta)return '';
 const key=`facility.${id}.tier${tier}`,path=artSrc(key);
 const items=meta.basic.concat(tier===2?meta.upgrade:[]);
 return `<div class="facilityShowcase ${id} tier-${tier} wall-${esc(s.wallPaint)}" role="img" aria-label="${esc(meta.name)} level ${tier} illustration">
 <div class="facilityDecorTop"><span>${esc(roomName(id))}</span><em>${tier===2?'Expanded room':'Room level 1'}</em></div>
 <div class="facilityWall"><div class="facilitySign">${esc(meta.sign)}</div>${tier===2?`<div class="facilityLamp">${icon('upgrade.lights','💡')}</div>`:''}${s.fixtures.tv?`<div class="facilityTV">${icon('fixture.tv','📺')}</div>`:''}${s.roomDetails[id]?`<div class="facilityLamp" title="Room-specific upgrade installed">${(G.ROOM_DETAILS.find(x=>x.id===id)||{}).icon||'✨'}</div>`:''}<div class="facilityShelf">${items.map(([k,e])=>icon(k,e,'shelfItem')).join('')}</div></div>
 <div class="facilityCounter"><span class="facilityCounterLabel">${tier===2?'Now serving more':'Opening special'}</span><div class="facilityRegister"></div></div><div class="facilityFloor"><span></span><span>${tier===2?'Upgraded':'Ready for customers'}</span></div>
 ${path?`<img class="facilityOverride" src="${esc(path)}" alt="" onerror="this.remove()">`:''}</div>`;
}

function laneDrawer(id){const l=s.lanes.find(x=>x.id===id);if(!l)return '<p>Lane unavailable.</p>';const active=s.sceneGroups.find(x=>x.location==='lane'+id);
 return `<p class="drawerIntro">Customize <b>Lane ${id}</b> with equipment that lasts, makes bowlers smile, and earns Alley Stars. Condition still needs occasional service.</p><section class="drawerCard"><div class="sectionhead"><h3>Lane ${id}</h3><span class="badge ${l.condition<45?'warn':'good'}">${Math.round(l.condition)}% condition</span></div><div class="meter"><div style="width:${l.condition}%"></div></div><div class="drawerRow"><span>Current group</span><b>${active?esc(active.name)+` (${active.size})`:'Vacant'}</b></div><div class="drawerRow"><span>Spare parts</span><b>${s.parts}</b></div><button class="primary full" data-service="${id}" ${l.condition>=98||s.cash<20||s.parts<1?'disabled':''}>🔧 Service Lane ${id} · $20 + 1 part</button></section><section class="drawerCard"><h3>Improve this lane</h3><p class="muted small">Upgrade only this lane here, or visit Build → Your Lanes to outfit every open lane at once.</p>${G.LANE_KITS.map(k=>`<div class="laneUpgradeRow"><div><b>${k.icon} ${esc(k.name)}</b><small>${esc(k.desc)}</small><small class="starReward">Counts toward your Lane Department rating</small></div><button data-lane-kit="${id}:${k.id}" ${l.kits?.[k.id]||s.cash<k.cost?'disabled':''}>${l.kits?.[k.id]?'✓ Installed':cash(k.cost)}</button></div>`).join('')}</section>${l.kits?.scoring?`<section class="drawerCard"><h3>Scoring-screen animations</h3><p class="muted small">Try new styles without buying another computer. Choose the screen that best fits your center.</p><div class="laneThemeList">${G.SCORE_THEMES.map(t=>`<button data-lane-theme="${id}:${t.id}" class="${(l.theme||'classic')===t.id?'active':''}">${t.icon} ${esc(t.name)} ${(l.theme||'classic')===t.id?'✓':''}</button>`).join('')}</div></section>`:''}<section class="drawerCard"><h3>Parts Room</h3><p class="small muted">Buy five replacement parts for $45.</p><button data-buy-parts ${s.cash<45?'disabled':''}>📦 +5 spare parts · $45</button></section>`;}
function partsDrawer(){return `<p class="drawerIntro">There's no separate lane oil resource in v0.3. Each lane has its own condition rating; maintenance costs spare parts plus a small service fee.</p><section class="drawerCard"><h3>Spare Parts <span class="badge">${s.parts} available</span></h3><button data-buy-parts class="primary" ${s.cash<45?'disabled':''}>Buy 5 parts · $45</button></section><div class="laneTiles">${s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}">Lane ${l.id}<br><b>${Math.round(l.condition)}% condition</b><div class="meter"><div style="width:${l.condition}%"></div></div>Tap to service →</button>`).join('')}</div>`;}
function benchesDrawer(){const cost=G.benchCost(s),max=s.benches>=3;return `<p class="drawerIntro">Guests wait for a lane when all lanes are busy. Benches provide <b>two comfortable group spots</b> each, with a longer waiting tolerance. They help, but more lanes still give you more capacity.</p>
 <section class="drawerCard"><h3>Waiting Area</h3><div class="statGrid"><div><small>Installed benches</small><strong>${s.benches}/3</strong></div><div><small>Queue capacity</small><strong>${G.waitCapacity(s)} groups</strong></div></div><p class="small muted">Groups without a bench leave after two waiting hours; seated groups can wait up to four.</p><button class="primary full" data-buy-bench ${max||s.cash<cost?'disabled':''}>${max?'✓ All benches installed':`+ Install bench · ${cash(cost)}`}</button></section>`;}
function adsDrawer(){const active=G.activeCampaign(s);return `<p class="drawerIntro">Choose one campaign at a time. Flyers are affordable; radio and TV bring stronger short-term visitor interest, but can overwhelm a small alley.</p>
 ${active?`<div class="drawerCallout">📣 <b>${esc(active.title)} running</b> · Through day ${active.endDay} · +${Math.round(active.boost*100)} percentage points to hourly arrival chance</div>`:''}
 <section class="drawerCard"><h3>Advertising options</h3>${G.CAMPAIGNS.map(c=>`<div class="drawerRow advertRow"><div><b>${c.icon} ${esc(c.title)}</b><small>${esc(c.desc)}</small><small>+${Math.round(c.boost*100)} points arrival chance · ${c.days} days</small></div><button data-ad="${c.id}" ${active||s.cash<c.cost?'disabled':''}>${cash(c.cost)}</button></div>`).join('')}</section><p class="small muted">Advertising costs appear in operating expenses. More visitors only help when your lanes and waiting area can handle them.</p>`;}

function casinoHTML(){const c=s.campaignStory?.nightOps||{},left=Math.max(0,5-(c.spinsToday||0));return `<section class="drawerCard casinoPanel"><div class="sectionhead"><h3>House of Odds · High Roller Wheel</h3><span class="badge warm">${left} bets left today</span></div><p class="muted small">Place a wager using only fictional in-game dollars from your alley’s cash. 60% bust · 28% double · 10% triple · 2% quadruple. Every spin is a separate gamble. There is no real-money purchase or cash-out.</p><div class="casinoWagers">${[10,25,50,100].map(amount=>`<button data-casino-bet="${amount}" ${left<1||s.cash<amount?'disabled':''}>Bet $${amount}</button>`).join('')}</div><div class="casinoLast">${esc(c.lastSpin||'Place a bet to test your luck.')} · Total spins: ${c.spins||0}</div><div class="casinoBoss"><strong>🎩 Pit Boss · Visitor Tables</strong><p class="muted small">${c.pitBoss?'On shift: guests place fictional table wagers; your business receives stakes and pays winnings. Wages $19/game day.':'Hire a Pit Boss to host visitor wagers and earn (or lose) game cash based on house outcomes.'}</p><p class="muted small">Guest table rounds: ${c.tableRounds||0} · House net: ${cash(c.houseNet||0)}</p><button data-hire-pitboss ${c.pitBoss||s.cash<420?'disabled':''}>${c.pitBoss?'✓ Pit Boss Hired':'Hire Pit Boss · $420'}</button></div></section>`;}

function decorDrawer(){return `<p class="drawerIntro">Customize your building and add useful amenities. Wall paint is cosmetic; fixtures affect guest comfort and business performance.</p><section class="drawerCard"><h3>Wall Color</h3><div class="paintChoices">${G.PAINTS.map(i=>`<button data-paint="${i.id}" class="paintChoice ${s.wallPaint===i.id?'selected':''}" ${s.wallPaint===i.id||s.cash<i.cost?'disabled':''}><span class="paintSwatch paint-${i.id}"></span><b>${esc(i.name)}</b><small>${s.wallPaint===i.id?'✓ Current':cash(i.cost)}</small></button>`).join('')}</div></section><section class="drawerCard"><h3>Fixtures & Decorations</h3>${G.FIXTURES.map(i=>`<div class="menuRow"><span class="menuEmoji">${icon('fixture.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${esc(i.desc)}</small></div><button data-fixture="${i.id}" ${s.fixtures[i.id]||s.cash<i.cost?'disabled':''}>${s.fixtures[i.id]?'✓ Installed':cash(i.cost)}</button></div>`).join('')}</section>`;}
function leagueHTML(){const c=G.calendar(s.day),active=s.league.active;return `<section class="panel leaguePanel"><div class="sectionhead"><div><h2>Thursday Night League</h2><p class="muted tiny">Weekly competition begins once all six lanes are built. Every Thursday, 6–8 PM.</p></div><span class="badge">Week ${c.week} · ${c.weekday}</span></div><div class="leagueOverview"><div><small>Open lanes</small><b>${Math.min(G.lanes(s),6)}/6</b></div><div><small>League sessions</small><b>${s.league.sessions}</b></div><div><small>League income</small><b>${cash(s.league.totalRevenue)}</b></div></div>${active?`<div class="drawerCallout">✅ League active! All six lanes are reserved Thursday 6–8 PM for league bowlers. The weekly league earns fees at Thursday closing.</div>`:`<p class="muted small">${G.lanes(s)<6?'Build your remaining lanes to unlock weekly league nights.':'Six lanes ready! Start a league with a one-time $200 registration and marketing cost.'}</p><button class="primary" data-start-league ${G.lanes(s)<6||s.cash<200?'disabled':''}>${G.lanes(s)<6?'🔒 Unlock at six lanes':'📋 Register Thursday League · $200'}</button>`}</section>`;}
function diaryDrawer(){const openReport=s.today;const history=s.dayReports.filter(r=>r.day!==s.day).slice(0,14);return `<p class="drawerIntro">Every group has an arrival, lane or queue decision, and departure. Snack purchases are recorded individually. Your most recent 14 completed days are saved below. The hour-by-hour log is kept for the last 7 days; older days keep their totals and guest comments.</p>
 <details class="diaryDay" open><summary>Day ${s.day} ${s.hour>=G.CLOSE?'· Closed':'· In progress'} · ${s.today.arrivals} groups arrived</summary><div class="diaryEvents">${eventsHTML(openReport.events)}</div></details>
 ${history.map(r=>`<details class="diaryDay"><summary>Day ${r.day} · ${r.served} bowled · ${cash(r.net)} net</summary><div class="diaryEvents">${reportCards(r)}<h3 style="margin:12px 0 6px">Guest comments</h3>${tipHTML(r)}<h3 style="margin:14px 0 6px">Hourly activity</h3>${r.events?.length?eventsHTML(r.events):'<p class="small muted">Hourly log archived after a week to keep your save small.</p>'}</div></details>`).join('')}`;}
// ===================================================================================
// v1.10: tabbed panels. Everything that belongs to a shop lives in that shop's panel:
// Menu Items (what it sells and stock), Pricing, and Upgrades (level 2, its personality
// upgrade, department equipment, related alley upgrades, staffing).
// ===================================================================================
const drawerTabs={};
const SHOP_TABS=[['items','Menu Items'],['pricing','Pricing'],['upgrades','Upgrades']];
function curTab(list){const t=drawerTabs[drawer];return list.some(x=>x[0]===t)?t:list[0][0];}
function tabBar(list){const cur=curTab(list);return `<div class="drawerTabs" role="tablist">${list.map(([id,label])=>`<button role="tab" aria-selected="${cur===id}" class="${cur===id?'active':''}" data-drawer-tab="${id}">${esc(label)}</button>`).join('')}</div>`;}
const roomLabel=id=>darkCenter()&&({arcade:'Casino Lounge',bar:'Speakeasy',snack:'Night Grill',proshop:'Outfitters'})[id]||G.getUpgrade(id)?.title||id;
// a non-room alley upgrade (Lane Technician, Cosmic Bowling, Coaching Corner, Stockroom Shelves, Covered Building)
function upgradeRow(id){const u=G.getUpgrade(id);if(!u)return '';const done=!!s.built[u.id],job=s.construction.find(j=>j.kind==='upgrade'&&j.id===u.id),miss=u.requires.find(r=>!s.built[r]);
 return `<div class="upRow ${done?'done':''}">${icon('upgrade.'+u.id,u.icon)}<div class="upText"><b>${esc(u.title)}</b><small>${esc(u.desc)}</small></div><button data-build="${u.id}" ${done||job||miss||s.cash<u.cost?'disabled':''}>${done?'✓ Installed':job?'🚧 '+job.remaining+'d left':miss?'Needs '+esc(roomLabel(miss)):cash(u.cost)+' · '+u.days+'d'}</button></div>`;}
// department stars and its equipment ladder (formerly Goals → Ratings)
function deptCard(dept){const d=G.DEPARTMENTS.find(x=>x.id===dept);if(!d)return '';const r=G.departmentRatings(s)[dept];
 return `<section class="drawerCard deptCard"><div class="deptHead"><div><h3>${esc(d.name)} rating</h3><small>${esc(r.tip)}</small></div>${starRow(r.stars,true)}</div><p class="deptReward">Next reward: ${esc(G.DEPARTMENT_REWARDS[dept][Math.min(4,r.stars)]||'Mastered')}</p>
 <div class="equipLadder">${G.equipmentFor(s,dept).map(item=>`<div class="upRow ${item.owned?'done':''} ${item.unlocked?'':'locked'}"><span class="equipStar">${item.star}★</span><div class="upText"><b>${esc(item.name)}</b><small>${item.owned?'Installed':item.unlocked?'Ready to install':'Unlocks at '+item.star+' department star'+(item.star===1?'':'s')}</small></div><button data-equip="${dept}:${item.star}" ${!item.unlocked||item.owned||s.cash<item.cost?'disabled':''}>${item.owned?'✓ Installed':item.unlocked?cash(item.cost):'🔒'}</button></div>`).join('')}</div></section>`;}
function staffCard(roomId){if(!['snack','bar','proshop'].includes(roomId))return '';const ok=G.staffed(s,roomId),need=G.neededStaff(s,roomId),have=G.countStaff(s,roomId);
 return `<div class="drawerCallout ${ok?'':'warnCallout'}">${ok?`Staffed · ${have}/${need} on duty.`:`Closed until you hire ${need-have} more.`} <button class="mini" data-tab="employees">Staff Room</button></div>`;}
function roomLevelCard(roomId){if(!s.built[roomId]||G.NEW_ATTRACTIONS.some(a=>a.id===roomId))return '';const tier=s.roomTiers[roomId]||1,job=s.construction.find(j=>j.kind==='roomExpand'&&j.id===roomId),cost=G.expansionCost(roomId);
 const bonus={snack:'Adds pretzels and ice cream to the menu',bar:'More drink choices and more orders',proshop:'More equipment variety and stronger sales',arcade:'Room for five machines instead of three'}[roomId];
 return `<div class="upRow ${tier===2?'done':''}"><span class="lvBadge">Lv ${tier===2?2:'2'}</span><div class="upText"><b>Level 2 room</b><small>${esc(bonus)}. Needs ${roomId==='arcade'?'no extra staff':'a second employee'}.</small></div><button data-expand-room="${roomId}" ${tier===2||job||s.cash<cost?'disabled':''}>${tier===2?'✓ Level 2':job?'🚧 '+job.remaining+'d left':cash(cost)+' · 2d'}</button></div>`;}
function roomDetailCard(roomId){const c=G.ROOM_DETAILS.find(x=>x.id===roomId);if(!c||!s.built[roomId])return '';
 return `<div class="upRow ${s.roomDetails[c.id]?'done':''}">${icon('upgrade.'+roomId,c.icon)}<div class="upText"><b>${esc(c.name)}</b><small>${esc(c.desc)}</small></div><button data-room-detail="${c.id}" ${s.roomDetails[c.id]||s.cash<c.cost?'disabled':''}>${s.roomDetails[c.id]?'✓ Installed':cash(c.cost)}</button></div>`;}
function roomUpgradesTab(roomId,dept,extra=''){return `<section class="drawerCard"><h3>Room upgrades</h3>${roomLevelCard(roomId)}${roomDetailCard(roomId)}${extra}</section>${dept?deptCard(dept):''}`;}
// a price stepper with a plain-language guest reaction
function guestReaction(price,base){const f=G.priceDemand(price,base);return f>=1.12?['bargain','Bargain · more guests buy']:f>1.001?['good','Good value · a few more buy']:f>.9?['fair','Fair price']:f>.7?['pricey','Pricey · fewer guests buy']:['steep','Steep · many guests pass'];}
function priceRow({art,emoji,name,price,base,lo,hi,minus,plus,note=''}){const [cls,txt]=guestReaction(price,base);
 return `<div class="priceRow">${icon(art,emoji)}<div class="upText"><b>${esc(name)}</b><small>Standard ${cash(base)}${note?' · '+note:''}</small><span class="reaction ${cls}">${txt}</span></div><div class="priceControl"><button class="mini" ${minus} ${price<=lo?'disabled':''} aria-label="Lower the price of ${esc(name)}">−</button><strong>${cash(price)}</strong><button class="mini" ${plus} ${price>=hi?'disabled':''} aria-label="Raise the price of ${esc(name)}">+</button></div></div>`;}
const PRICING_NOTE='<p class="drawerIntro small">Higher prices earn more per sale, but fewer guests buy. Lower prices sell more often and help new items unlock sooner.</p>';
function notBuilt(roomId,text){const job=s.construction.find(j=>j.kind==='upgrade'&&j.id===roomId),u=G.getUpgrade(roomId);
 return `<p class="drawerIntro">${text}</p>${job?`<div class="drawerCallout">🚧 Under construction · opens in ${job.remaining} day${job.remaining===1?'':'s'}.</div>`:`<button class="primary full" data-build-spot="${roomId}">Build the ${esc(roomLabel(roomId))} · ${cash(u.cost)}</button>`}`;}

function snackDrawer(){if(!s.built.snack)return notBuilt('snack','No snack counter yet. Build one to start serving soda and popcorn, then unlock new foods as your alley grows.');
 const tab=curTab(SHOP_TABS),items=G.SNACKS;let body='';
 if(tab==='items')body=`${staffCard('snack')}<section class="drawerCard"><div class="sectionhead"><h3>Menu</h3><span class="badge warm">Alley level ${G.venueLevel(s)}</span></div>${items.map(item=>{const unlocked=G.snackUnlocked(s,item.id),qty=s.snackStock[item.id],inc=G.incoming(s,'snack',item.id);
  return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('snack.'+item.id,item.emoji)}</span><div class="menuInfo"><b>${esc(item.name)}</b><small>${unlocked?`${qty} in stock${qty<=s.lowStockThreshold?' · ⚠ low':''}${inc?' · '+inc+' arriving tomorrow':''}`:`🔒 Alley level ${item.level}${item.visits?` · ${item.visits} snack sales`:''}`}</small></div>${unlocked?`<button data-restock="${item.id}" ${s.cash<item.cost?'disabled':''}>Order +${item.pack} · ${cash(item.cost)}</button>`:''}</div>`;}).join('')}</section><p class="muted small">Orders arrive the next morning. A Stock Clerk can reorder automatically.</p>`;
 if(tab==='pricing')body=PRICING_NOTE+`<section class="drawerCard">${items.filter(i=>G.snackUnlocked(s,i.id)).map(item=>priceRow({art:'snack.'+item.id,emoji:item.emoji,name:item.name,price:s.snackPrices[item.id],base:item.price,lo:item.price-2,hi:item.price+4,minus:`data-menu-price="${item.id}:-1"`,plus:`data-menu-price="${item.id}:1"`,note:'costs '+cash(Math.round(item.cost/item.pack*10)/10)+' each'})).join('')||'<p class="muted small">Unlock a menu item first.</p>'}</section>`;
 if(tab==='upgrades')body=roomUpgradesTab('snack','snack');
 return `${facilityIllustration('snack')}${tabBar(SHOP_TABS)}${body}`;}

function barDrawer(){if(!s.built.bar)return notBuilt('bar','Open the bar to serve beer and wine. New drinks unlock as you sell drinks, grow the alley and upgrade the room.');
 const tab=curTab(SHOP_TABS);let body='';
 if(tab==='items')body=`${staffCard('bar')}<section class="drawerCard"><div class="sectionhead"><h3>Drinks</h3><span class="badge warm">${s.barVisits} sold</span></div>${G.DRINKS.map(i=>{const unlocked=G.drinkUnlocked(s,i.id),stock=s.barStockById[i.id],inc=G.incoming(s,'bar',i.id),reason=i.expandedOnly&&s.roomTiers.bar!==2?'Needs a level 2 bar':`Alley level ${i.level} and ${i.visits} drink sales`;
  return `<div class="menuRow ${unlocked?'':'lockedMenu'}"><span class="menuEmoji">${icon('drink.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(i.name)}</b><small>${unlocked?`${stock} in stock${stock<=s.lowStockThreshold?' · ⚠ low':''}${inc?' · '+inc+' arriving tomorrow':''}`:'🔒 '+reason}</small></div>${unlocked?`<button data-drink-restock="${i.id}" ${s.cash<i.cost?'disabled':''}>Order +${i.pack} · ${cash(i.cost)}</button>`:''}</div>`;}).join('')}</section><p class="muted small">${s.today.barOrders} served today · ${cash(s.today.barIncome)} bar revenue. Orders arrive the next morning.</p>`;
 if(tab==='pricing')body=PRICING_NOTE+`<section class="drawerCard">${G.DRINKS.filter(i=>G.drinkUnlocked(s,i.id)).map(i=>priceRow({art:'drink.'+i.id,emoji:i.emoji,name:i.name,price:s.barPrices[i.id],base:i.price,lo:i.price-2,hi:i.price+5,minus:`data-drink-price="${i.id}:-1"`,plus:`data-drink-price="${i.id}:1"`,note:'costs '+cash(Math.round(i.cost/i.pack*10)/10)+' each'})).join('')||'<p class="muted small">Unlock a drink first.</p>'}</section>`;
 if(tab==='upgrades')body=roomUpgradesTab('bar','bar');
 return `${facilityIllustration('bar')}${tabBar(SHOP_TABS)}${body}`;}

function arcadeDrawer(){if(!s.built.arcade)return notBuilt('arcade',`Build the ${roomName('arcade')} to install your first game. ${darkCenter()?'The Back Alley version is an underground casino with fictional game cash only, never real money.':''}`);
 const tab=curTab(SHOP_TABS),owned=Object.values(s.arcadeMachines).filter(Boolean).length,cap=s.roomTiers.arcade===2?5:3;let body='';
 if(tab==='items')body=`<p class="drawerIntro">${darkCenter()?'The Casino Lounge takes bets in the alley’s fictional game cash. Never real money.':'Buy machines; you earn each time a guest plays. New cabinets unlock with arcade plays.'} ${s.arcadeVisits} plays so far.</p>${darkCenter()?casinoHTML():''}<section class="drawerCard"><div class="sectionhead"><h3>${darkCenter()?'Night games':'Machines'}</h3><span class="badge warm">${owned}/${cap} slots</span></div>${G.MACHINES.map(i=>{const has=!!s.arcadeMachines[i.id],unlocked=G.machineUnlocked(s,i.id),reason=i.expandedOnly&&s.roomTiers.arcade!==2?'Needs a level 2 arcade':`Alley level ${i.level} and ${i.plays} plays`;
  return `<div class="menuRow ${!has&&!unlocked?'lockedMenu':''}"><span class="menuEmoji">${icon('machine.'+i.id,i.emoji)}</span><div class="menuInfo"><b>${esc(darkCenter()?G.darkMachineName(i.id):i.name)}</b><small>${has?`Installed · ${cash(G.arcadePrice(s,i))} a play`:unlocked?'Ready to buy':'🔒 '+reason}</small></div><button data-machine="${i.id}" ${has||!unlocked||owned>=cap||s.cash<i.cost?'disabled':''}>${has?'✓ Owned':!unlocked?'🔒':cash(i.cost)}</button></div>`;}).join('')}</section>`;
 if(tab==='pricing'){const list=G.MACHINES.filter(i=>s.arcadeMachines[i.id]);body=PRICING_NOTE+`<section class="drawerCard">${list.map(i=>{const [lo,hi]=G.PRICE_RANGES.arcade(i);return priceRow({art:'machine.'+i.id,emoji:i.emoji,name:darkCenter()?G.darkMachineName(i.id):i.name,price:G.arcadePrice(s,i),base:i.fee,lo,hi,minus:`data-arcade-price="${i.id}:-1"`,plus:`data-arcade-price="${i.id}:1"`,note:'per play'});}).join('')||'<p class="muted small">Buy a machine first.</p>'}</section>`;}
 if(tab==='upgrades')body=roomUpgradesTab('arcade','arcade',upgradeRow('lights'));
 return `${facilityIllustration('arcade')}${tabBar(SHOP_TABS)}${body}`;}

function shopDrawer(){if(!s.built.proshop)return notBuilt('proshop','A pro shop sells supplies to walk-in guests and fits custom balls for your bowlers.');
 const tab=curTab(SHOP_TABS);let body='';
 if(tab==='items')body=`${staffCard('proshop')}<section class="drawerCard"><h3>What the shop does</h3><div class="menuRow">${icon('shop.bag','👜')}<div class="menuInfo"><b>Bowling supplies</b><small>Walk-in guests buy grip tape, towels and cleaner · ${s.roomVisits.proshop||0} sales so far</small></div></div><div class="menuRow">${icon('shop.ball','🎳')}<div class="menuInfo"><b>Custom ball fitting</b><small>Fit and drill balls for your bowlers to raise their scores</small></div><button data-tab="bowlers">Bowlers</button></div><div class="menuRow">${icon('shop.shoes','👟')}<div class="menuInfo"><b>Team equipment</b><small>Helps your team in league and tournament matches</small></div></div></section>`;
 if(tab==='pricing'){const [lo,hi]=G.PRICE_RANGES.shop();body=PRICING_NOTE+`<section class="drawerCard">${priceRow({art:'shop.bag',emoji:'👜',name:'Supplies bundle',price:G.shopPrice(s),base:G.SHOP_PRICE_BASE,lo,hi,minus:'data-shop-price="-1"',plus:'data-shop-price="1"',note:s.roomDetails.proshop?'+$5 with the Fitting Bench':'per walk-in sale'})}</section>`;}
 if(tab==='upgrades')body=roomUpgradesTab('proshop','proshop',upgradeRow('coaching'));
 return `${facilityIllustration('proshop')}${tabBar(SHOP_TABS)}${body}`;}

function attractionDrawer(room){const tab=curTab(SHOP_TABS);let body='';const fee=G.attractionFee(s,room);
 if(!s.built[room.id])return notBuilt(room.id,esc(room.desc));
 if(tab==='items')body=`<section class="drawerCard"><div class="menuRow">${icon('world.'+room.id,room.icon)}<div class="menuInfo"><b>${esc(room.title)}</b><small>${esc(room.desc)}</small></div></div><div class="drawerRow"><span>Guests served</span><b>${s.roomVisits[room.id]||0}</b></div><div class="drawerRow"><span>Price per visit</span><b>${cash(fee)}${s.roomDetails[room.id]?' + '+cash(Math.round(fee*.2))+' upgrade bonus':''}</b></div></section>`;
 if(tab==='pricing'){const [lo,hi]=G.PRICE_RANGES.attraction(room);body=PRICING_NOTE+`<section class="drawerCard">${priceRow({art:'world.'+room.id,emoji:room.icon,name:room.title,price:fee,base:room.fee,lo,hi,minus:`data-attraction-fee="${room.id}:-1"`,plus:`data-attraction-fee="${room.id}:1"`,note:'per guest visit'})}</section>`;}
 if(tab==='upgrades')body=roomUpgradesTab(room.id,null);
 return tabBar(SHOP_TABS)+body;}

// Lanes: everything from Build → Your Lanes plus lane-wide upgrades
const LANE_TABS=[['lanes','Lanes'],['upgrades','Upgrades']];
function lanesDrawer(){const tab=curTab(LANE_TABS),cap=G.laneCapacity(s),count=G.lanes(s)+G.pendingLanes(s),cost=G.nextLaneCost(s),full=count>=cap;
 if(tab==='lanes')return tabBar(LANE_TABS)+`<section class="drawerCard"><div class="sectionhead"><h3>${G.lanes(s)} open · ${G.pendingLanes(s)} building</h3><span class="badge">${count}/${cap} spots</span></div><div class="laneTiles">${s.lanes.map(l=>`<button class="laneTile" data-open="lane${l.id}"><div class="drawerRow"><span>Lane ${l.id}</span><b>${Math.round(l.condition)}%</b></div><div class="meter"><div style="width:${l.condition}%"></div></div><small class="muted">${l.condition<48?'Needs service':'Inspect & upgrade'} · ${G.LANE_KITS.filter(k=>l.kits?.[k.id]).length}/3 kits</small></button>`).join('')}</div><button class="primary full" data-buy-lane="true" ${full||s.cash<cost?'disabled':''}>${full?'All lane spots used · open the next wing':`Open lane ${count+1} · ${cash(cost)} · 2 days`}</button></section><section class="drawerCard"><h3>Parts room</h3><p class="small muted">${s.parts} spare parts. Each lane service uses one.</p><button data-buy-parts ${s.cash<45?'disabled':''}>+5 spare parts · $45</button></section>`;
 return tabBar(LANE_TABS)+`<section class="drawerCard"><h3>Fit every lane at once</h3><p class="muted small">Adds the kit to every lane missing it, with a 10% bulk discount.</p><div class="bulkKitList">${G.LANE_KITS.map(k=>{const info=G.bulkLaneCost(s,k.id);return `<button data-lane-kit-all="${k.id}" ${!info.count||s.cash<info.cost?'disabled':''}>${k.icon} <b>${esc(k.name)}</b><small>${info.count?info.count+' lane'+(info.count===1?'':'s')+' · '+cash(info.cost):'All lanes fitted'}</small></button>`;}).join('')}</div></section><section class="drawerCard"><h3>Lane hall</h3>${upgradeRow('staff')}${upgradeRow('lights')}</section>${deptCard('lanes')}`;}

// Front Desk → Building: wings, construction queue, future wings
function buildingHTML(){const cap=G.laneCapacity(s),pendingLot=s.construction.find(j=>j.kind==='land'),lotFull=G.lanes(s)+G.pendingLanes(s)>=cap,stage=G.expansionStage(s);
 const future=G.NEW_ATTRACTIONS.map(a=>{const done=s.built[a.id],job=s.construction.find(j=>j.id===a.id);return `<div class="upRow ${done?'done':''} ${stage<a.minExpansion?'locked':''}">${icon('world.'+a.id,a.icon)}<div class="upText"><b>${esc(a.title)}</b><small>${done?'Open':job?'Building · '+job.remaining+'d':stage<a.minExpansion?'Unlocks with Wing '+a.minExpansion:'Ready to build from its spot on the floor'}</small></div></div>`;}).join('');
 return `<section class="drawerCard"><div class="sectionhead"><h3>Property</h3><span class="badge">Wing ${stage}/5</span></div><p class="small">${G.lanes(s)}/${cap} lanes open · ${s.specialty?esc(G.specialtyOf(s).name):'Independent alley'}</p>${stage<5?`<button class="primary full" data-buy-wing="${stage+1}" ${!lotFull||pendingLot?'disabled':''}>${pendingLot?'🚧 Wing '+(stage+1)+' · '+pendingLot.remaining+'d left':!lotFull?'Fill all '+cap+' lanes to open Wing '+(stage+1):'Open Wing '+(stage+1)+' · '+cash(G.nextExpansionCost(s))}</button>`:'<p class="small">Full 24-lane property.</p>'}${s.built.roof?'':upgradeRow('roof')}</section>
 <section class="drawerCard"><h3>Construction</h3>${s.construction.length?s.construction.map(j=>`<div class="constructionItem"><b>${esc(roomLabel(j.id)===j.id?j.title:roomLabel(j.id))}</b><div class="meter"><div style="width:${(j.total-j.remaining)/j.total*100}%"></div></div><small class="muted">${j.remaining} day${j.remaining===1?'':'s'} left · opens after closing</small></div>`).join(''):'<p class="muted small">Nothing under construction.</p>'}</section>
 <section class="drawerCard"><h3>Attractions by wing</h3>${future}</section>`;}

// Door Security: the night defenses that used to sit in Build
function nightDefensesHTML(){const ops=s.campaignStory.nightOps;
 return `<p class="drawerIntro">Protect the entrance, watch your rooms and prepare your night crew. Every level stops more of Vera’s small plays and raises the odds your defenses hold against an operation on their own. In Showdowns at your door: the doorman fights beside your crew, cameras hit them before they arrive, and drills give every fighter extra grit.</p><div class="nightWarning">${G.rivalWarning(s)}</div>
 <section class="drawerCard"><h3>Night operations</h3><p class="small">Security payroll ${cash(G.nightPayroll(s))}/day. ${ops.unpaidUntil>=s.day?'⚠ Crew unpaid: defenses weakened.':'Paid automatically when affordable.'}</p><p class="small">Insurance: ${ops.insuranceUntil>=s.day?'active until Day '+ops.insuranceUntil:'none'} · Prepared through Day ${ops.preparedUntil||0} · Protection ${G.nightProtection(s)} · Attacks repelled ${ops.defended}</p><button data-night-counter ${s.cash<220?'disabled':''}>Prepare for Vera · $220</button> <button data-night-insurance ${s.cash<340||ops.insuranceUntil>=s.day?'disabled':''}>21-day repair coverage · $340</button></section>
 <section class="drawerCard"><h3>Defenses</h3>${G.NIGHT_DEFENSES.map(d=>{const level=ops[d.id],cost=d.costs[level+1];return `<div class="upRow ${level>=3?'done':''}"><span class="lvBadge">${level}/3</span><div class="upText"><b>${d.icon} ${esc(d.name)}</b><small>${esc(d.levels[level])} · ${level<3?esc(d.descriptions[level]):'Fully upgraded'}</small></div><button data-night-defense="${d.id}" ${level>=3||s.cash<cost?'disabled':''}>${level>=3?'✓ Max':cash(cost)}</button></div>`;}).join('')}</section>`;}

function renderDrawer(){if(!drawer)return;const scroll=$('drawerBody').scrollTop;let title='',sub='FACILITY',html='';
 if(drawer==='desk'){title='Front Desk';sub='PRICES, ADVERTISING & BUILDING';const DT=[['prices','Prices & stats'],['ads','Advertising'],['building','Building']],t=curTab(DT);html=tabBar(DT)+(t==='prices'?deskDrawer():t==='ads'?adsDrawer()+`<section class="drawerCard"><h3>Community & Business Partnerships</h3><p>Negotiate deals with schools, youth teams, charities, offices, and neighboring shops. Some deliver weekly revenue; all can bring guests.</p>${G.PARTNERSHIP_CATALOG.map(x=>`<div class="laneUpgradeRow"><div><b>${x.icon} ${esc(x.name)}</b><small>${esc(x.desc)}</small><small>Requires ${x.minLanes} lanes, ${x.minRep} reputation · Weekly income ${cash(x.weekly)}</small></div><button data-partner="${x.id}" ${s.partnerships[x.id]||G.lanes(s)<x.minLanes||s.rep<x.minRep||s.cash<x.cost?'disabled':''}>${s.partnerships[x.id]?'✓ Partner':cash(x.cost)}</button></div>`).join('')}</section>`:buildingHTML());}
 else if(drawer==='snacks'){title=roomName('snack');sub='MENU, PRICING & UPGRADES';html=snackDrawer();}
 else if(drawer==='diary'){title="Day's Story";sub='VISITOR ACTIVITY LOG';html=diaryDrawer();}
 else if(drawer==='parts'){title='Parts & Repairs';sub='OPERATIONS';html=partsDrawer();}
 else if(drawer==='security'){title='Door Security';sub='THE NIGHT SHIFT';html=darkCenter()?nightDefensesHTML():'<p class="drawerIntro">Night security only matters on the Back Alley route.</p>';}
 else if(drawer==='lanes'){title='Lanes';sub='LANES, KITS & LANE UPGRADES';html=lanesDrawer();}
 else if(drawer==='benches'){title='Waiting Area';sub='GUEST COMFORT';const BT=[['benches','Benches'],['upgrades','Upgrades']];html=tabBar(BT)+(curTab(BT)==='benches'?benchesDrawer():deptCard('comfort'));}

 else if(drawer==='bar'){title=roomName('bar');sub='DRINKS, PRICING & UPGRADES';html=barDrawer();}
 else if(drawer.startsWith('lane')){title='Lane '+drawer.slice(4);sub='INDIVIDUAL MAINTENANCE';html=laneDrawer(Number(drawer.slice(4)));}
 else if(drawer==='arcade'){title=roomName('arcade');sub='MACHINES, PRICING & UPGRADES';html=arcadeDrawer();}
 else if(drawer==='decor'){title='Style & Amenities';sub='CUSTOMIZE YOUR ALLEY';const CT=[['decor','Decor & fixtures'],['upgrades','Upgrades']];html=tabBar(CT)+(curTab(CT)==='decor'?decorDrawer():deptCard('style'));}
 else if(G.NEW_ATTRACTIONS.some(a=>a.id===drawer)){const room=G.NEW_ATTRACTIONS.find(a=>a.id===drawer);title=room.title;sub='ATTRACTION';html=attractionDrawer(room);}
 else if(drawer==='shop'){title=roomName('proshop');sub='SUPPLIES & EQUIPMENT';html=shopDrawer();}
 const outageId=drawer==='snacks'?'snack':drawer==='shop'?'proshop':drawer;const outage=s.outages?.[outageId];if(outage){html=`<div class="repairBanner">🚧 ${esc(outage.name)} is CLOSED until repaired.<button data-repair="${esc(outageId)}" ${s.cash<outage.cost?'disabled':''}>Repair · ${cash(outage.cost)}</button> ${darkCenter()&&outage.rival?` <button data-investigate="${esc(outageId)}" ${s.cash<70||!s.campaignStory.nightOps.entrance?'disabled':''}>Investigate · $70</button>`:''} ${s.cash<outage.cost&&s.hardshipUses<2?`<button data-hardship="${esc(outageId)}">Community payment plan</button>`:''}</div>`+html;}
 if(isTurf()&&s.campaignStory.turf?.tags?.[outageId])html=`<div class="repairBanner veraBanner">🎨 Vera’s plum “V” is sprayed across this room. Guests notice.<button data-scrub-tag="${esc(outageId)}" ${s.cash<25?'disabled':''}>Paint over · $25</button></div>`+html;
 $('drawerTitle').textContent=title;$('drawerSub').textContent=sub;$('drawerBody').innerHTML=html;$('drawerBody').scrollTop=scroll;
}
// v1.07: fixed floor plan. Every shop and activity has a permanent spot. Bought spots are lit,
// spots you can buy now are faded with a price sign, and spots behind the next wing stay locked.
const FLOOR_ROWS=[{wing:0,ids:['proshop','snack']},{wing:0,ids:['arcade','bar']},{wing:1,ids:['billiards','partyroom']},{wing:2,ids:['karaoke','bocce']},{wing:3,ids:['minigolf']},{wing:4,ids:['lasertag','stage']},{wing:5,ids:['banquet','restaurant']}];
const ROOM_DRAWER={snack:'snacks',proshop:'shop'};
function roomInfo(id){const u=G.getUpgrade(id),dark=darkCenter();const names={snack:dark?'Night Grill':'Snack Counter',bar:dark?'Speakeasy':'Bowling Bar',proshop:dark?'Outfitters':'Pro Shop',arcade:dark?'Casino Lounge':'Mini Arcade'};
 return {name:names[id]||u.title,emoji:u.icon,art:id==='proshop'?'world.proshop':'world.'+id,cost:u.cost,days:u.days,wing:G.NEW_ATTRACTIONS.find(a=>a.id===id)?.minExpansion||0};}
function spotState(id){if(s.built[id])return 'open';if(s.construction.some(j=>j.kind==='upgrade'&&j.id===id))return 'building';return G.expansionStage(s)<roomInfo(id).wing?'locked':'available';}
function spotGoods(id){const pick=(list,ok,key,n=4)=>list.filter(ok).slice(0,n).map(x=>icon(key+x.id,x.emoji||x.icon||'•','good')).join('');
 if(id==='snack')return pick(G.SNACKS,x=>G.snackUnlocked(s,x.id),'snack.');
 if(id==='bar')return pick(G.DRINKS,x=>G.drinkUnlocked(s,x.id),'drink.');
 if(id==='arcade')return pick(G.MACHINES,x=>s.arcadeMachines?.[x.id],'machine.')||'';
 if(id==='proshop')return ['ball','shoes','bag'].map(k=>icon('shop.'+k,'🎳','good')).join('');
 return '';}
function spotNote(id){if(G.activeOutage(s,id))return '<span class="spotFlag">⚠ Closed</span>';
 const low=id==='snack'?G.SNACKS.filter(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold).length:id==='bar'?G.DRINKS.filter(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold).length:0;
 return low?`<span class="spotFlag">⚠ ${low} low</span>`:'';}
function floorSpot(id){const info=roomInfo(id),state=spotState(id),wide=FLOOR_ROWS.find(r=>r.ids.includes(id)).ids.length===1;
 const cls=`floorSpot spot-${id} is-${state}${wide?' wide':''}`;
 if(state==='open'){const tier=G.NEW_ATTRACTIONS.some(a=>a.id===id)?1:(s.roomTiers[id]||1),expanding=s.construction.find(j=>j.kind==='roomExpand'&&j.id===id);
  return `<button class="${cls}" data-room="${id}" data-open="${ROOM_DRAWER[id]||id}" aria-label="Open ${esc(info.name)}"><span class="spotTag">${esc(info.name)} <b>Lv ${tier}</b>${expanding?` <i>↑ ${expanding.remaining}d</i>`:''}</span>${spotNote(id)}<span class="spotArt">${icon(info.art,info.emoji)}</span><span class="spotCounter">${spotGoods(id)}</span>${s.roomDetails[id]?'<span class="spotCustom" title="Custom room upgrade installed">✨</span>':''}${isTurf()&&s.campaignStory.turf?.tags?.[id]?'<span class="veraTag" title="Vera’s mark. Paint over it from the room panel."><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M5 7L19 35L33 7" fill="none" stroke="#C04FA6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/><path d="M5 7L19 35L33 7" fill="none" stroke="#C04FA6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 35V45M9 15V22M30 13V19" stroke="#C04FA6" stroke-width="2.2" stroke-linecap="round"/><circle cx="19" cy="46" r="1.8" fill="#C04FA6"/></svg></span>':''}</button>`;}
 if(state==='building'){const job=s.construction.find(j=>j.kind==='upgrade'&&j.id===id);
  return `<div class="${cls}" data-room="${id}"><span class="spotArt">${icon(info.art,info.emoji)}</span><span class="spotSign building"><b>${esc(info.name)}</b><small>Building · ${job.remaining}d left</small></span></div>`;}
 if(state==='locked')return `<div class="${cls}" data-room="${id}" aria-label="${esc(info.name)}, unlocks with Wing ${info.wing}"><span class="spotArt">${icon(info.art,info.emoji)}</span><span class="spotLock">🔒 Wing ${info.wing}</span><span class="spotName">${esc(info.name)}</span></div>`;
 return `<button class="${cls}" data-room="${id}" data-build-spot="${id}" ${s.cash<info.cost?'data-short="true"':''} aria-label="Build ${esc(info.name)} for ${cash(info.cost)}"><span class="spotArt">${icon(info.art,info.emoji)}</span><span class="spotSign"><b>${esc(info.name)}</b><strong>${cash(info.cost)}</strong></span></button>`;}
function renderGoalStrip(){const lv=G.venueLevel(s),goals=G.nextLevelGoals(s);const el=$('goalStripText');if(!el)return;
 if(lv>=5||typeof goals[0]==='string'){el.innerHTML='<b>Bowling Landmark</b> · top level reached';$('goalStripFill').style.width='100%';return;}
 const done=goals.filter(g=>g.done).length;el.innerHTML=`<b>Level ${lv+1}: ${esc(G.LEVELS[lv+1].name)}</b> · Goals ${done}/${goals.length}`;$('goalStripFill').style.width=Math.round(done/goals.length*100)+'%';}
function renderRoomGrid(){
 const stage=G.expansionStage(s),rows=FLOOR_ROWS.filter(r=>r.wing<=Math.min(5,stage+1));const out=[];let gateShown=false;
 for(const row of rows){
  if(row.wing>stage&&!gateShown){gateShown=true;out.push(wingGate(stage+1));}
  out.push(`<div class="floorRow ${row.wing>stage?'lockedRow':''}">${row.ids.map(floorSpot).join('')}</div>`);
 }
 if(stage+2<=5)out.push(`<p class="moreWings">More spots open with Wings ${stage+2}–5</p>`);
 $('sceneRoomGrid').innerHTML=out.join('');
}
function wingGate(n){const job=s.construction.find(j=>j.kind==='land'),cost=G.nextExpansionCost(s),full=G.lanes(s)+G.pendingLanes(s)>=G.laneCapacity(s);
 const unlocks=G.NEW_ATTRACTIONS.filter(a=>a.minExpansion===n).map(a=>a.title).join(' & ');
 if(job)return `<div class="wingGate building"><b>Wing ${n} under construction</b><small>${job.remaining} game day${job.remaining===1?'':'s'} left · then +${G.laneCapacity({...s,expansionStage:n})-G.laneCapacity(s)} lanes and ${esc(unlocks)}</small></div>`;
 return `<button class="wingGate" data-buy-wing="${n}" ${!full||s.cash<cost?'data-short="true"':''}><span><b>Open Wing ${n}</b><small>${full?`+${G.laneCapacity({...s,expansionStage:n})-G.laneCapacity(s)} lane spots and ${esc(unlocks)}`:`Fill all ${G.laneCapacity(s)} lanes first`}</small></span><strong>${cash(cost)}</strong></button>`;}


function syncVisitors(events=[],instant=false){const layer=$('visitorLayer'),scene=$('scene'),box=scene.getBoundingClientRect();
 if(!box.width||!box.height)return;
 const center=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:((r.left+r.width/2)-box.left)/box.width*100,y:((r.top+r.height/2)-box.top)/box.height*100};};
 const entrance=center(scene.querySelector('.entranceDoor'))||{x:7,y:83};
 const desk=center($('sceneDesk'))||{x:18,y:45},wait=center($('sceneBenches'))||{x:21,y:72};
 const spot=id=>center(scene.querySelector(`.floorSpot.is-open[data-room="${id}"]`));const rooms={snack:spot('snack'),bar:spot('bar'),arcade:spot('arcade'),shop:spot('proshop')};for(const a of G.NEW_ATTRACTIONS)rooms[a.id]=spot(a.id);
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
function showScene(){const lv=G.venueLevel(s);const phase=!G.lanes(s)?'empty':lv<=2?'neighborhood':lv<=4?'league':'regional';$('scene').className='alleyFloor '+phase+' wall-'+s.wallPaint;renderGoalStrip();
 const scenePath=artSrc('scene.'+phase);const img=$('sceneImage');if(scenePath){if(img.getAttribute('src')!==scenePath){img.hidden=true;img.src=scenePath;img.onload=()=>img.hidden=false;img.onerror=()=>img.hidden=true;}}else img.hidden=true;
 $('sceneMarquee').textContent=''; // formerly redundant banner; the sticky header already shows the venue level
 const wall=G.FIXTURES.filter(i=>s.fixtures[i.id]&&['tv','wallart','neon'].includes(i.id));const floor=G.FIXTURES.filter(i=>s.fixtures[i.id]&&!['tv','wallart','neon'].includes(i.id));
 // v1.06: every purchased fixture (restrooms, lockers, racks, TV, art, neon) sits in one strip above Shops & Activities
 $('sceneWallDecor').innerHTML=[...floor,...wall].map(i=>`<button data-open="decor" title="${esc(i.name)}" aria-label="${esc(i.name)}: open customize" class="worldAmenity">${icon('fixture.'+i.id,i.emoji)}</button>`).join('');
 $('sceneFloorAmenities').replaceChildren();
 for(const id of ['sceneSnack','sceneArcade','sceneShop','sceneBar'])$(id).classList.add('hidden');
 const available=G.SNACKS.filter(i=>G.snackUnlocked(s,i.id));$('sceneSnackStock').textContent=available.length?`${available.filter(x=>s.snackStock[x.id]>0).length}/${available.length} items stocked`:'Menu & stock';
 $('sceneBarStock').textContent=Object.values(s.barStockById).reduce((a,b)=>a+b,0)+' drinks';$('sceneBenchLabel').textContent=s.benches+' / 3 benches';
 const ad=G.activeCampaign(s);$('sceneDeskLabel').textContent=ad?'📣 '+ad.title:'Prices, stats & ads';
 renderRoomGrid();renderTurfFloor();
 const stage=G.expansionStage(s);$('scene').style.setProperty('--wing-stage',stage);$('scene').style.setProperty('--room-rows',G.roomRows(s));$('scene').style.setProperty('--lane-rows',Math.ceil(G.laneCapacity(s)/6));
 const count=G.lanes(s),pending=G.pendingLanes(s);
 const cap=G.laneCapacity(s),nextCap=stage<5?G.laneCapacity({...s,expansionStage:stage+1}):cap,price=G.nextLaneCost(s),nextIdx=count+pending;
 $('sceneLanes').innerHTML=Array.from({length:nextCap},(_,i)=>{
  const id=i+1,l=s.lanes[i],job=s.construction.find(j=>j.kind==='lane'&&j.id==='lane'+id);
  if(l){const league=id<=6&&s.league.active&&G.calendar(s.day).dayIndex===3&&s.hour>=18&&s.hour<20;const occupant=s.sceneGroups.find(x=>x.location==='lane'+id),path=artSrc('world.lane'),lv=1+G.LANE_KITS.filter(k=>l.kits?.[k.id]).length;
   return `<div class="laneSlot owned"><span class="laneTab">Lane ${id}<b>Lv ${lv}</b></span><button class="laneScene ${l.kits?.wood?'laneHardwood':''} ${l.kits?.scoring?'laneDigital':''}" data-open="lane${id}" aria-label="Open lane ${id}, condition ${Math.round(l.condition)} percent">${path?`<img class="lane-image" src="${esc(path)}" alt="">`:''}<span class="laneDamage"><div style="width:${l.condition}%"></div></span>${league?`<span class="laneAvatar">${icon('misc.trophy','🏆')}</span>`:occupant?`<span class="laneAvatar">${icon('shop.ball','🎳')}</span>`:''}<span class="laneStatus">${G.activeOutage(s,'lane'+id)?'🛠 Closed':league?'League':occupant?(s.active.find(a=>a.laneId===id)?.hours||1)+'h left':Math.round(l.condition)+'%'}</span></button></div>`;}
  if(job)return `<div class="laneSlot building"><span class="laneTab">Lane ${id}</span><div class="laneGhost"><span class="laneSign building" title="Lane ${id} opens in ${job.remaining} game day${job.remaining===1?'':'s'}"><small>🚧 ${job.remaining}d</small></span></div></div>`;
  if(i>=cap)return `<div class="laneSlot locked"><span class="laneTab">🔒 Wing ${stage+1}</span><div class="laneGhost"></div></div>`;
  if(i===nextIdx)return `<div class="laneSlot next ${i%6===0?'edgeL':i%6>=4?'edgeR':''}"><span class="laneTab">Lane ${id}</span><div class="laneGhost"><button class="laneSign" data-buy-lane="true" ${s.cash<price?'data-short="true"':''} aria-label="Open lane ${id} for ${cash(price)}"><b>Open Lane ${id}</b><strong>${cash(price)}</strong></button></div></div>`;
  return `<div class="laneSlot"><span class="laneTab">Lane ${id}</span><div class="laneGhost"></div></div>`;
 }).join('');
 $('constructionRibbon').innerHTML=s.construction.length?`🚧 ${s.construction.length} project${s.construction.length===1?'':'s'} underway · ${esc(s.construction.map(j=>j.title+' ('+j.remaining+'d)').join(' · '))}`:'';
 $('constructionRibbon').hidden=!s.construction.length;
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
 const branchSelect=G.campaignReady(s)&&camp.path==='undecided'?`<div class="campaignDecisionNotice"><h3>Vera's offer demands an answer</h3><p>Two permanent stories; your decision belongs to <b>${esc(s.locationName)}</b>, not your whole franchise.</p><button class="primary" data-show-branch>Choose your rivalry path →</button></div>`:'';
 const night=camp.nightOps||{entrance:0,cameras:0,crew:0,defended:0,incidents:0,nightRevenue:0,chapters:[]};
 const defensePanel=dark?`<section class="nightDefenseBoard"><h3>Protect Your Doors & Crew</h3><p>Actual equipment and staff. Vera can close lanes and businesses until you repair them. Each improvement reduces the likelihood of a successful attack.</p><div class="defenseTiles">${G.NIGHT_DEFENSES.map(d=>{const lev=night[d.id]||0,cost=d.costs[lev+1];return `<article class="defenseTile"><strong>${d.icon} ${d.name} · Lv ${lev}/3</strong><small>${esc(d.levels[lev])}</small><p>${lev<3?esc(d.descriptions[lev]):'Fully upgraded — ready for trouble.'}</p><button data-night-defense="${d.id}" ${lev>=3||s.cash<cost?'disabled':''}>${lev>=3?'✓ Fully protected':'Upgrade · '+cash(cost)}</button></article>`}).join('')}</div><p class="muted small">Protection ${G.nightProtection(s)} · Attacks repelled: ${night.defended} · Disruptions: ${night.incidents} · Night-game bonuses: ${cash(night.nightRevenue)}</p><button data-open="security" class="primary">Night defenses</button></section>`:'';
 const noirmenu=dark?`<div class="noirDashboard"><h3>The Back Alley · Keep the Lights On</h3><p class="muted small">The town is watching. Keep the staff safe, operate your night businesses and stop Vera from driving you out.</p><p><b>Your fight:</b> ${esc(G.campaignMission(s))}</p><p><button class="primary" data-tab="tournaments">🌃 Open the Turf</button></p><div class="noirStats"><span>🛡️ Defenses <b>${G.nightProtection(s)}</b></span><span>🕵️ Influence <b>${camp.influence}/100</b></span><span>🚨 Suspicion <b>${camp.heat}/100</b></span><span>🤝 Crew Trust <b>${camp.trust}/100</b></span></div>${defensePanel}<h3>The Night Shift Chronicles</h3><div class="nightChapters">${G.BACK_ALLEY_CHAPTERS.map((ch,i)=>{const unlocked=night.chapters?.includes(ch.id);return `<article class="storyCard ${unlocked?'unlocked':'locked'}">${unlocked?icon(storyArtKey(ch.speaker),'🌒','chapterArt'):'<span class="lockedMark" aria-hidden="true"></span>'}<div><b>${unlocked?esc(ch.title):'Chapter '+(i+1)+' — ???'}</b>${unlocked?`<p><small>${esc(ch.speaker)}</small></p><p>${esc(ch.text)}</p><small>🎯 ${esc(ch.hint)}</small>`:''}</div></article>`}).join('')}</div><p class="muted small">Your old relationship choices still matter, but they no longer replace building defenses or keeping facilities operating.</p>${camp.turf?.cityVictory?'<p class="victoryText">🌃 The City Is Yours — Vera has left town.</p>':camp.turf?.accord?'<p class="victoryText">🌹 The Midnight Accord holds: Vera keeps away from your building. The districts are still in play.</p>':''}</div>`:'';
 const legacyMenu=camp.path==='legacy'?`<p>🌟 <b>The Legacy:</b> Win the National Heritage Cup, build 4 community alliances and earn 4 Alley Stars. <small>${esc(G.campaignMission(s))}</small></p><div class="contractActions"><button data-rival="outreach" ${s.cash<145?'disabled':''}>Community outreach · $145</button><button data-rival="legal" ${s.cash<260?'disabled':''}>Legal counsel · $260</button></div>${camp.victory?'<p class="victoryText">🌟 Community Charter awarded!</p>':''}`:'';
 const history=(camp.aiMemory||[]).slice(0,4).map(item=>`<div class="aiMove"><b>Day ${item.day}</b> · ${esc(item.action.replaceAll('-',' '))} · Pressure ${item.pressure}</div>`).join('');
 $('storyPanel').innerHTML=`<div class="sectionhead"><div><small class="eyebrow">${dark?'THE NIGHT SHIFT · THE BACK ALLEY':"GRANDPA GUS’S LEGACY"}</small><h2>${dark?'The Back Alley':'The Last Frame'}</h2><p class="muted small">${dark?'Vera wants you out. Upgrade your defenses, keep the night businesses running, and stand by your crew.':'Your family alley versus Vera Vale’s StrikeCity. The town’s future depends on your choices.'}</p></div><span class="badge ${camp.victory?'warm':''}">${selected?selected.icon+' '+selected.name:'📜 RIVALRY UNDECIDED'}</span></div>${branchSelect}<div class="storyCards">${(dark?G.STORY_CHAPTERS.filter(ch=>['inheritance','firstlane','offer','established'].includes(ch.id)):G.STORY_CHAPTERS).map((chapter,i)=>`<div class="storyCard ${story.unlocked.includes(chapter.id)?'unlocked':'locked'}">${story.unlocked.includes(chapter.id)?icon(storyArtKey(chapter.speaker),chapter.icon,'chapterArt'):'<span class="lockedMark" aria-hidden="true"></span>'}<div><b>${story.unlocked.includes(chapter.id)?esc((dark&&chapter.id==='established'?'The Other Missing Page':chapter.title)):'Chapter '+(i+1)+' — ???'}</b><small>${story.unlocked.includes(chapter.id)?esc(chapter.speaker):'Keep building to unlock'}</small>${story.unlocked.includes(chapter.id)?`<p>${esc(dark&&chapter.id==='established'?'Gus’s ledger points to six neighborhoods where Vera has bought favors and threatened suppliers. Old Town is only the beginning.':dark&&chapter.id==='national'?'Your tournament victory earns attention, but the Midnight Accord will be won through protecting people and dismantling Vera’s grip.':chapter.text)}</p><small>🎯 ${esc(dark&&chapter.id==='established'?'Secure Old Town’s two sites; property wings reveal new districts.':dark&&chapter.id==='national'?'Keep the lanes running and complete the Back Alley objectives.':chapter.hint)}</small>`:''}</div></div>`).join('')}</div><section class="rivalPanel"><h3>Vera Vale's Pressure Campaign</h3><p>Vera’s pressure: <b>${s.rival.pressure}/100</b>. She adapts her interference to your defenses and how much support you have.</p><div class="meter"><div style="width:${s.rival.pressure}%"></div></div>${legacyMenu}${noirmenu}${!selected?'<p class="muted small">The campaign choice unlocks after the first formal buyout offer. You can keep operating the alley until then.</p>':''}<h3 style="margin-top:14px">Vera's recent moves</h3>${history||'<p class="muted small">Vera is studying your business. No targeted moves yet.</p>'}${dark?'<small>Vera moves every night now. Her full ledger is on the Turf tab.</small>':`<small>Vera may act again after: ${selected?'Day '+camp.nextAIMoveDay:'after you choose a path'}. The five-game-day global surprise-event cooldown still applies.</small>`}</section>`;

 const regulars=G.PATRON_PROFILES.map(c=>{const p=s.patrons[c.id],status=G.patronStatus(p),seen=p.visits>0;
 return `<article class="regularCard"><div class="regularTop"><span class="regularAvatar">${seen?icon('patron.'+c.id,'🙂','portrait'):'❔'}</span><div><strong>${esc(c.name)}</strong><small>${esc(status)} · ${p.visits} visits · ${p.loyalty}/100 loyalty</small></div><span class="badge">${p.leagueMember?'👟 LEAGUE':p.visits>=3?'❤️ FAMILIAR':'👤'}</span></div><div class="meter"><div style="width:${p.loyalty}%"></div></div><p class="muted small">${seen?esc(c.trait):'Visit your center to meet this local.'}</p>${p.lastReply?`<p class="regularQuote">“${esc(p.lastReply)}”<small>${p.talks||0} conversation${(p.talks||0)===1?'':'s'}</small></p>`:''}${seen?`<div class="regularActions"><button data-patron="${c.id}:chat" ${p.lastTalk===s.day?'disabled':''}>Chat</button><button data-patron="${c.id}:treat" ${p.lastTalk===s.day||s.cash<12?'disabled':''}>Treat · $12</button>${s.league.active&&!p.leagueMember?`<button data-patron="${c.id}:invite" ${p.lastTalk===s.day||p.visits<3||p.loyalty<55?'disabled':''}>Invite to league</button>`:''}</div>`:''}</article>`}).join('');
 $('regularsPanel').innerHTML=`<div class="sectionhead"><div><h2>Town Regulars</h2><p class="muted small">Familiar visitors return, remember your hospitality and might join your league. Each can chat once per game day.</p></div><span class="badge">${Object.values(s.patrons).filter(p=>G.patronStatus(p)!=='Not met yet').length} / 6 met</span></div><div class="regularGrid">${regulars}</div><h3>Returning VIP Groups</h3><p class="muted small">🗓️ A seasonal story celebration comes around roughly every 28 game days, beginning on Day 14. A new surprise can only appear after the five-day event cooldown.</p><p class="muted small">Different groups visit more often as the center grows. Watch for seasonal celebrations and loyalty milestones.</p><div class="ratingGrid">${G.VIP_GROUPS.map(g=>`<div class="ratingTile"><b>${g.icon} ${esc(g.name)}</b><p>${esc(g.trait)}</p><small>${s.vipGroups[g.id].visits} visits · last seen ${s.vipGroups[g.id].lastDay?'Day '+s.vipGroups[g.id].lastDay:'not yet'}</small></div>`).join('')}</div>`;
 $('departmentsPanel').innerHTML=`<div class="sectionhead"><div><h2>Department Report Cards</h2><p class="muted small">Each department earns 0–5 stars by operating, welcoming guests and improving equipment. Equipment is installed from each department’s Upgrades tab.</p></div><span class="badge warm">${rank}/35 stars earned · Alley ${G.alleyStars(s)}★</span></div><div class="ratingGrid">${G.DEPARTMENTS.map(d=>{const r=rat[d.id];return `<div class="ratingTile"><div>${icon(DEPT_ART[d.id]||'misc.none',d.icon)}<b>${esc(d.name)}</b></div><strong>${starRow(r.stars,true)}</strong><small>${d.id==='lanes'?r.usage+' paid lane-hours':d.id==='comfort'||d.id==='style'?r.upgrades+' improvements':r.usage+' customer interactions'}</small><p>${esc(r.tip)}</p><p class="muted small">🎁 ${esc(G.DEPARTMENT_REWARDS[d.id][Math.min(4,r.stars)]||'Mastered')}</p>${(()=>{const eq=G.equipmentFor(s,d.id),owned=eq.filter(x=>x.owned).length,ready=eq.filter(x=>x.unlocked&&!x.owned).length;return `<div class="deptLink"><small>${owned}/5 equipment installed${ready?` · <b>${ready} ready to install</b>`:''}</small><button class="mini" data-open="${DEPT_DRAWER[d.id]}:upgrades">Open upgrades</button></div>`;})()}</div>`}).join('')}</div><p class="muted tiny">Overall stars: 1★ at 3 department points, 2★ at 8, 3★ at 14, 4★ at 21, and 5★ at 29. Story chapters and customer satisfaction are tracked separately.</p>`;
 showGoalSection();

}
function renderFranchise(){
 const ids=['home',...(s.portfolio?.opened||[])],active=s.portfolio?.activeId||'home';
 $('franchisePanel').innerHTML=`<h2>Your Towns</h2><p class="muted small">Each town has its own business, save progress, economy, and permanent rivalry path. Switch towns anytime. Game days advance only in the active town.</p><div class="townChoices">${ids.map(id=>{const state=id===active?s:s.portfolio?.snapshots?.[id];const path=G.campaignOf(state||{});return `<button data-switch-town="${id}" ${id===active?'disabled':''}><b>${id==='home'?'🏠 The Back Alley':'🌉 Riverside'}</b><small>${path?path.icon+' '+path.name:'📜 Campaign undecided'} · ${G.lanes(state||s)} lanes ${id===active?'· CURRENT':''}</small></button>`;}).join('')}</div>${!ids.includes('riverside')?`<p class="muted small">An optional second town lets you choose the opposite storyline later. Requires a chosen path, six lanes, 3 Alley Stars and $8,000.</p><button data-open-second-town ${!G.canOpenSecondTown(s)?'disabled':''}>Open Riverside · $8,000</button>`:''}`;
}
function showBranchDecision(force=false){
 if(branchOpen||storyOpen||summaryOpen||facilityNoticeOpen||welcomeOpen||cloudGateOpen||tutorialOpen||startupOpen||incidentOpen||patronOpen||s.campaignStory?.path!=='undecided'||!G.campaignReady(s)||(!force&&s.campaignStory.promptDismissed))return false;
 branchOpen=true;$('branchBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function hideBranchDecision(){branchOpen=false;$('branchBackdrop').classList.add('hidden');}
function exitDevelopmentPreview(){flushSave();
 if(!devPreviewMode)return;
 if(!devOriginal){toast('Real game session cannot be located. Refresh the page to reload your authenticated save.',true);return;}
 s=devOriginal.state;KEY=devOriginal.key;BACKUP=devOriginal.backup;cloudMode=devOriginal.cloudMode;devPreviewMode=false;devOriginal=null;
 branchOpen=false;hideBranchDecision();auto=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();
 render();gotoTab('settings');save();toast('Back to your real game. Development preview did not sync to the cloud.');
}
function prepareDevelopment(mode){flushSave();
 const labels={decision:'a developed alley at the rivalry decision',backalley:'a developed alley already committed to The Back Alley',legacy:'a developed Legacy campaign'};
 if(!confirm('DEV TEST ONLY: Replace your current active game with '+labels[mode]+'?\n\nA recovery copy will be kept when browser storage allows. Export your current save for a permanent backup.'))return;
 const test=G.developmentScenario(mode);if(!test){toast('Could not construct a valid test alley.',true);return;}
 storeRecovery();if(!devPreviewMode)devOriginal={key:KEY,backup:BACKUP,cloudMode,state:structuredClone(s)};devPreviewMode=true;KEY='gutter-to-glory-v102-development-preview';BACKUP='gutter-to-glory-v102-development-backup';cloudMode=false;s=test;introSeen=true;tutorialSeen=true;welcomeOpen=false;summaryOpen=false;storyOpen=false;incidentOpen=false;patronOpen=false;branchOpen=false;facilityNoticeOpen=false;cutsceneOpen=false;tutorialOpen=false;startupOpen=false;tabTipId=null;hideBranchDecision();
 for(const id of ['storyBackdrop','incidentBackdrop','patronBackdrop','facilityBackdrop','daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop','startupBackdrop'])$(id).classList.add('hidden');
 seenTabTips={...seenTabTips,goals:true,manage:true,alley:true};tab='alley';goalSection='story';auto=false;lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab('alley');save();syncVisitors([],true);
 toast('PREVIEW LOADED: '+G.lanes(s)+' lanes · '+cash(s.cash)+' · '+(G.campaignOf(s)?.name||'Rival decision')+'. Auto time paused.');if(mode==='decision')showBranchDecision(true);
}
function veraPill(){const p=Math.round(s.rival?.pressure||0);const turf=isTurf();const active=turf||(s.story?.offerDay>0&&p>0);if(!active)return '';
 if(!turf)return `<button type="button" class="pressurePill" data-tab="goals" title="Vera's pressure on your alley: ${p} of 100. Open Goals to respond."><span>Vera</span><span class="track" aria-hidden="true"><span class="fill" style="width:${p}%"></span></span><b>${p}</b></button>`;
 const ix=G.threatIndex(s),tier=G.threatTier(s),op=G.activeOp(s);
 return `<button type="button" class="pressurePill grip tier-${ix} ${op?'hasOp':''}" data-tab="tournaments" title="Vera's grip: ${esc(tier.name)}, ${p} of 100.${op?' '+esc(op.name)+': '+opWhen(op).toLowerCase()+'.':''} Open the Turf."><span>${esc(tier.name)}</span><span class="track" aria-hidden="true"><span class="fill" style="width:${p}%"></span></span><b>${p}</b>${op?`<em class="opBadge" aria-label="Vera moves ${opWhen(op).toLowerCase()}">🚨${Math.max(0,op.launch-s.day)}</em>`:''}</button>`;}
let navKey='';
function syncTurfNav(){const btn=document.querySelector('nav [data-tab="tournaments"]');if(!btn)return;const on=isTurf(),op=on&&G.activeOp(s),key=on+'|'+(op?op.launch-s.day:'');if(key===navKey)return;navKey=key;
 btn.innerHTML=on?`${icon('nav.turf','🌃')}Turf${op?`<em class="navAlert" aria-label="Vera moves soon">${Math.max(0,op.launch-s.day)}</em>`:''}`:`${icon('nav.tournaments','🏆')}Compete`;btn.classList.toggle('turfNav',on);}
function renderTurfFloor(){const sc=$('scene');if(!sc)return;const on=isTurf(),ix=on?G.threatIndex(s):-1;for(let i=0;i<5;i++)sc.classList.toggle('grip-'+i,ix===i);
 const alert=$('turfAlert'),look=$('sceneLookout');if(!alert||!look)return;if(!on){alert.classList.add('hidden');look.classList.add('hidden');return;}
 const t=G.turfOf(s),op=G.activeOp(s);alert.classList.toggle('hidden',!op);
 if(op){alert.dataset.showdownOp=op.id;alert.innerHTML=`<b>🚨 ${esc(op.name)}</b><span>${opWhen(op)} · ${G.availableFighters(s).length?'Meet them →':'Crew resting · see Turf'}</span>`;}else delete alert.dataset.showdownOp;
 look.classList.toggle('hidden',!(t.lookoutUntil>=s.day));}
function renderHUD(){const sec=$('sceneSecurity');if(sec){sec.classList.toggle('hidden',!darkCenter());if(darkCenter()){const lv=s.campaignStory.nightOps.entrance;sec.querySelector('small').textContent=lv?'Level '+lv+' · '+G.NIGHT_DEFENSES[0].levels[lv]:'Hire your first doorman';}}const level=G.venueLevel(s);$('venueName').textContent=s.locationName||'The Back Alley';const route=G.campaignOf(s)?.name;$('levelLabel').textContent=`LEVEL ${level} · ${route?route.toUpperCase()+' ROUTE · ':''}${G.venueName(s).toUpperCase()}${s.specialty?' · '+G.specialtyOf(s).name.toUpperCase():''} · ⭐ ${G.alleyStars(s)}/5${devPreviewMode?' · 🧪 TEST PREVIEW':''}`;
 $('nextHour').textContent=s.hour>=G.CLOSE?'▶ Start next day':'▶ Next hour';$('toggleAuto').textContent=auto?'⏸ Pause Auto':'▶ Resume Auto';$('clockStatus').textContent=auto?'Automatic time: On · Advances every few seconds':'Automatic time: Paused · Use the buttons to advance';
 const completed=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;
 $('hudStats').innerHTML=`<span class="datePill" title="Game week, day and time"><b>W${G.calendar(s.day).week} ${G.calendar(s.day).weekday.slice(0,3)}</b> ${s.hour===G.CLOSE?'10 PM':G.formatHour(s.hour)}</span><span class="moneyPill" title="Cash on hand"><b>${cash(s.cash)}</b></span><span class="happyPill mood-${s.happiness>=78?'high':s.happiness>=52?'mid':'low'}" title="How guests feel about their visits"><i class="moodDot" aria-hidden="true"></i><b>${s.happiness}%</b><span class="srOnly"> guest happiness</span></span>${veraPill()}`;
}
function renderGoals(){const completed=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;
 const goals=G.nextLevelGoals(s);
 $('nextGoal').innerHTML=`<div class="starShowcase"><strong>${starRow(G.alleyStars(s),true)}</strong><span>Alley Stars combine department ratings earned through real customer visits and improvements. Guest happiness is separate.</span></div><h2>${G.venueLevel(s)>=5?'LEGENDARY ALLEY!':'Level '+(G.venueLevel(s)+1)+' — '+G.LEVELS[G.venueLevel(s)+1]?.name}</h2><div class="goalChecklist">${goals.map(g=>typeof g==='string'?esc(g):`<div class="${g.done?'complete':''}">${g.done?'✅':'◻️'} ${esc(g.label)}</div>`).join('')}</div>`;
 $('goalLevelBadge').textContent=`⭐ ${G.alleyStars(s)}/5 stars · ${G.alleyScore(s)}/35 department points`;
 const spec=G.specialtyOf(s);
 $('specialtyPanel').innerHTML=spec?`<div class="specialtyHeader"><span>${spec.icon}</span><div><h2>Your specialty: ${esc(spec.name)}</h2><p>${esc(spec.desc)}</p></div></div><p class="muted small">This is the identity of your first alley. Later versions may allow you to open a second location with a completely different specialty.</p>`:
 G.venueLevel(s)>=3?`<h2>Choose your alley's specialty</h2><p class="muted small">Your center is established. What do you want to be known for? Choose once for this location; each direction gives a different bonus.</p><div class="specialtyChoices">${G.SPECIALTIES.map(x=>`<button data-specialty="${x.id}" class="specialtyChoice"><b>${x.icon} ${esc(x.name)}</b><small>${esc(x.tag)}</small><small>${esc(x.desc)}</small></button>`).join('')}</div>`:
 `<h2>Your future specialty</h2><p class="muted small">Reach <b>Established Alley (Level 3)</b> to choose between Family Funhouse, Serious Strikes, Social Lounge, and Neighborhood Classic. You won't be forced down one building order.</p>`;
 $('goalSideQuests').innerHTML=`<div class="quest">🎳 <b>${G.lanes(s)}/${G.laneCapacity(s)} lanes</b><small>${s.league.active?'League running!':'Six lanes unlock Thursday league nights'}</small></div><div class="quest">👥 <b>${s.employees.length} employees</b><small>Hire staff to open the counters</small></div><div class="quest">📦 <b>${s.deliveries.length} deliveries</b><small>All orders arrive next morning</small></div><div class="quest">🏆 <b>${completed}/4 trophies</b><small>Keep training your bowlers</small></div>`;
 renderStoryCommunity();
}
function renderStockWarnings(){
 const lowSnack=s.built.snack&&G.SNACKS.some(i=>G.snackUnlocked(s,i.id)&&s.snackStock[i.id]<=s.lowStockThreshold);
 const lowBar=s.built.bar&&G.DRINKS.some(i=>G.drinkUnlocked(s,i.id)&&s.barStockById[i.id]<=s.lowStockThreshold);
 $('stockWarning').classList.toggle('hidden',!lowSnack);
 $('stockWarning').textContent='⚠ Snacks running low';
 $('stockWarningBar').classList.toggle('hidden',!lowBar);
 $('stockWarningBar').textContent='⚠ Bar stock running low';
}
const sceneFixtureLabel=()=>{const n=G.FIXTURES.filter(i=>s.fixtures[i.id]).length;return n+(n===1?' amenity':' amenities');};
function renderAlley(){$('miniEvents').innerHTML=eventsHTML(s.today.events.slice(-8));renderStockWarnings();showScene();$('sceneFixtures').textContent=sceneFixtureLabel();}

function streetLine(b){const st=G.fighterStats(b),sk=G.SKILL_BY_ID[st.skill],status=G.crewStatus(s,b);return `<div class="streetLine"><b>🌃 On the street</b><span title="Health in a Showdown (from Spare + confidence)">❤ ${st.hp}</span><span title="Damage per hit (from Power + ball)">👊 ${st.dmg}</span><span title="Chance to land a hit (from Aim)">🎯 ${Math.round(st.hit*100)}%</span><span title="Chance to shrug off threats (from Focus)">🧠 ${Math.round(st.resist*100)}%</span><span>${sk.icon} ${esc(sk.name)}</span><small>${b.crewReady?'On the night crew':`Loyalty ${b.loyalty||0}/${G.CREW_LOYALTY} to join the crew`} · each training session +2 loyalty${status==='injured'?' · hurt right now':''}</small></div>`;}
function renderBowlers(){if(!s.bowlers.some(b=>b.id===selectedBowler))selectedBowler=s.bowlers[0].id;
 $('recruit').disabled=s.cash<320||G.lanes(s)<2||s.bowlers.length>=4||!s.teamStory.leoJoined;
 $('roster').innerHTML=s.bowlers.map(b=>`<button class="rosterChoice ${b.id===selectedBowler?'active':''}" data-bowler="${esc(b.id)}">${icon('bowler.'+b.id,'👤','portrait')}<span><b>${esc(b.name)}</b><small>Average ${G.avg(b)} · Confidence ${b.confidence??50}%</small></span></button>`).join('');
 const b=s.bowlers.find(x=>x.id===selectedBowler);
 $('bowlerDetail').innerHTML=`<div class="athleteBanner">${icon('bowler.'+b.id,'👤','portrait')}<div><h2>${esc(b.name)}</h2><span class="badge">Projected average ${G.avg(b)}</span> <span class="badge ${b.ball?'good':''}">${b.ball?'🎳 Custom-fitted ball':'Standard house ball'}</span></div></div><div class="skillGrid">${[['aim','🎯 Aim'],['spare','🎳 Spares'],['power','💪 Power'],['focus','🧠 Focus']].map(([key,label])=>`<div class="skillBox"><div class="skillTop"><b>${label}</b><b>${b[key]}/95</b></div><div class="meter"><div style="width:${b[key]/95*100}%"></div></div><button data-train="${b.id}:${key}" ${b[key]>=95||s.cash<G.trainCost(s,b.id,key)?'disabled':''}>+ Train · ${cash(G.trainCost(s,b.id,key))}</button></div>`).join('')}</div>${isTurf()?streetLine(b):''}<div style="margin-top:15px"><button data-ball="${b.id}" ${!s.built.proshop||b.ball||s.cash<170?'disabled':''}>${b.ball?'✓ Ball fitted':'🎳 Custom ball · $170'}</button> <span class="muted small">${!s.built.proshop?'Unlock Pro Shop for custom equipment.':'A better ball boosts this bowler’s projected average.'}</span></div>`;
 renderFirstFrame();
}
function renderFirstFrame(){const el=$('firstFramePanel');if(!el)return;const f=s.teamStory?.firstFrame||{status:'locked',shots:[]};
 const available=G.lanes(s)>0&&f.status!=='complete'&&!s.startupPending;
 el.innerHTML=`<div class="sectionhead"><div><h2>Maya's First Frame</h2><p class="muted small">Gus coached Maya as a junior. Help her bowl a two-shot frame using angle, spin, and power. This is a small story challenge; standard practice remains available in Compete.</p></div><span class="badge">${f.status==='complete'?'✓ Completed':available?'Ready to roll':'Install Lane 1'}</span></div>
 <p>${f.status==='complete'?`Maya scored ${f.total} pins and put Gus's old team photo on the wall. +2 Focus, +6 Confidence. Leo joins after two lanes and eight bowling customers.`:f.status==='playing'?`First shot: ${f.shots[0]} pins. Aim for the remaining ${10-f.shots[0]}.`:'Maya is your first team captain. Her first frame begins when the first lane opens.'}</p>
 ${f.status!=='complete'?`<div class="bowlingVisual" aria-label="Interactive view down a bowling lane"><div class="pinDeck">${Array.from({length:10},(_,i)=>`<span class="visualPin" data-pin="${i}">🎳</span>`).join('')}</div><div class="laneAimTrack"><div class="laneAimLine" id="laneAimLine"></div><span class="aimBowlingBall" id="aimBowlingBall" aria-label="Bowling ball position">🔵</span></div><div class="aimLabels"><small>← Move left</small><small>Move right →</small></div><div class="ballPathHint" id="ballPathHint">Slide the position control; spin curves the path.</div></div><div class="practiceSliders"><label>Ball position <b id="fAngleLabel">0</b><input id="fAngle" type="range" min="-10" max="10" value="0"></label><label>Spin <b id="fSpinLabel">0</b><input id="fSpin" type="range" min="-5" max="5" value="0"></label><label>Power <b id="fPowerLabel">92%</b><input id="fPower" type="range" min="60" max="100" value="92"></label></div><button data-first-frame class="primary" ${available?'':'disabled'}>${f.status==='playing'?'Roll second shot':'Bowl with Maya'}</button>`:''}
 <p class="muted small">${esc(f.lastResult||'Try a straight release with strong, controlled power. The lane surface affects your aim.')}</p>`;
 function previewAim(){const ball=$('aimBowlingBall'),line=$('laneAimLine');if(!ball)return;const angle=Number($('fAngle')?.value||0),spin=Number($('fSpin')?.value||0);ball.style.left=`${50+angle*3.4}%`;if(line){line.style.transform=`translateX(${angle*2.2}px) rotate(${spin*4}deg)`;}const hint=$('ballPathHint');if(hint)hint.textContent=`Position ${angle>0?'right':angle<0?'left':'center'} ${angle} · ${spin===0?'straight ball':spin>0?'curving right':'curving left'} · Power ${$('fPower').value}%`;}
 for(const [id,tag] of [['fAngle','fAngleLabel'],['fSpin','fSpinLabel'],['fPower','fPowerLabel']]){const input=$(id);if(input)input.oninput=()=>{$(tag).textContent=input.value+(id==='fPower'?'%':'');previewAim();};}previewAim();
}
// ───────────────────────── v1.10 TURF WAR UI (The Back Alley) ─────────────────────────
// One place for the whole fight against Vera: her grip, her next operation, the city map,
// your crew (built from the bowlers you train) and her ledger. Showdowns open as a full-screen
// turn-based fight with animated hits, telegraphed enemy moves and a result card.
let turfSel=null,showdownOpen=false,showdownCtx=null,showdownPick=[],showdownTarget=null,showdownAnim=false,showdownLog=[];
const isTurf=()=>s.campaignStory?.path==='backalley';
const TIER_COLORS=['#6E8C8A','#B9739F','#D4708F','#E0553F','#FF3B2F'];
const opWhen=op=>{const n=op.launch-s.day;return n<=0?'Tonight':n===1?'Tomorrow night':`In ${n} nights`;};
const foeArt=k=>'foe.'+k,unitArt=u=>u.id==='doorman'?'ally.doorman':u.kind?'foe.'+u.kind:'bowler.'+u.id;
const FOE_EMOJI={lookout:'🕶️',bruiser:'🥊',fixer:'💼',knox:'🦾',vera:'🌹'};
function gripGauge(p,big=false){const segs=G.THREAT_TIERS.map((t,i)=>{const next=G.THREAT_TIERS[i+1]?.min??100;return `<span class="gripSeg" style="flex:${next-t.min};--seg:${TIER_COLORS[i]}"><small>${big?esc(t.name):''}</small></span>`;}).join('');
 return `<div class="gripGauge ${big?'big':''}" role="img" aria-label="Vera's grip ${p} of 100"><div class="gripTrack">${segs}</div><span class="gripNeedle" style="left:${p}%"></span></div>`;}
// City map: six districts drawn around the alley. Plum = Vera, teal = yours, stripes = contested.
const MAP_SHAPES={
 neon:{d:'M14 10H152L146 78L22 70Z',lx:82,ly:40},
 westend:{d:'M190 10H328L322 72L196 80Z',lx:258,ly:42},
 warehouse:{d:'M8 82L118 90L124 156L10 160Z',lx:62,ly:124},
 civic:{d:'M216 92L330 84V156L222 158Z',lx:274,ly:124},
 oldtown:{d:'M12 172L126 168L138 238H16Z',lx:72,ly:206},
 docks:{d:'M206 170L330 168V238H200Z',lx:266,ly:200}
};
function cityMapSVG(){const op=G.activeOp(s),stage=G.expansionStage(s),opD=op&&op.target.startsWith('district:')?op.target.split(':')[1]:null;
 const blocks=G.DISTRICTS.map((d,i)=>{const st=G.districtStatus(s,d.id),sh=MAP_SHAPES[d.id],owned=st.owner==='player',contested=!owned&&(st.sites||0)>0,reach=G.districtUnlocked(s,d.id),seen=i<=stage;
  const cls=`dist ${owned?'mine':contested?'contested':'vera'} ${seen?'':'fog'} ${reach&&!owned?'reach':''} ${turfSel===d.id?'sel':''}`;
  const pips=[0,1].map(k=>`<circle cx="${sh.lx-7+k*14}" cy="${sh.ly+13}" r="4.2" class="pip ${k<(st.sites||0)?'on':''}"/>`).join('');
  return `<g class="${cls}" data-turf-district="${d.id}" tabindex="0" role="button" aria-label="${esc(d.name)}: ${owned?'yours':contested?'contested, '+st.sites+' of 2 sites':'held by Vera'}${seen?'':', hidden until Wing '+i}"><path d="${sh.d}"/>${seen?`<text x="${sh.lx}" y="${sh.ly}" class="dname">${esc(d.name.toUpperCase())}</text>${pips}`:`<text x="${sh.lx}" y="${sh.ly+4}" class="dname">WING ${i}</text>`}${opD===d.id?`<g class="opPin" transform="translate(${sh.lx+34} ${sh.ly-18})"><circle r="9"/><text y="4">!</text></g>`:''}</g>`;}).join('');
 const alleyHit=op&&!opD;
 return `<svg class="cityMap" viewBox="0 0 340 248" aria-label="Map of the city districts"><defs><pattern id="veraHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#4B2347"/><rect width="2.4" height="7" fill="#6B3463"/></pattern><pattern id="contestHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#4B2347"/><rect width="5" height="10" fill="#2E8C8F"/></pattern></defs>
 <rect width="340" height="248" rx="10" class="streets"/><path d="M0 164H340M170 0V248M0 80H340" class="road"/><path d="M196 238Q262 226 340 232V248H196Z" class="water"/>${blocks}
 <g class="alleyHQ ${alleyHit?'hit':''}" transform="translate(170 124)"><rect x="-34" y="-24" width="68" height="48" rx="6"/><text y="-4" class="hqName">THE BACK</text><text y="9" class="hqName">ALLEY</text>${alleyHit?'<g class="opPin" transform="translate(30 -24)"><circle r="9"/><text y="4">!</text></g>':''}</g></svg>`;}
function districtPanel(){const d=G.DISTRICTS.find(x=>x.id===turfSel)||G.DISTRICTS.find(x=>G.districtStatus(s,x.id).owner!=='player')||G.DISTRICTS[0];turfSel=d.id;
 const i=G.DISTRICTS.indexOf(d),st=G.districtStatus(s,d.id),owned=st.owner==='player',reach=G.districtUnlocked(s,d.id),sites=G.SITE_NAMES[d.id];
 const why=owned?'':i>G.expansionStage(s)?`Open Wing ${i} of your alley to reach ${d.name}.`:!reach?`Take ${G.DISTRICTS[i-1].name} first.`:'';
 const pv=!owned&&reach?G.battlePreview(s,{district:d.id}):null,ready=G.availableFighters(s).length;
 return `<article class="districtPanel ${owned?'mine':''}"><div class="dpHead"><b>${esc(d.name)}</b><span class="badge ${owned?'good':''}">${owned?'YOURS':st.sites?'CONTESTED':'VERA’S'}</span></div><p>${esc(d.description)}</p>
 <ol class="siteList">${sites.map((n,k)=>`<li class="${k<(st.sites||0)?'taken':''}">${k<(st.sites||0)?'✓':k===(st.sites||0)&&!owned?'⚔':'·'} ${esc(n)}</li>`).join('')}</ol>
 <p class="small"><b>Reward:</b> ${esc(d.reward)}</p>
 ${pv?`<div class="foeStrip">${pv.foes.map(f=>`<span class="foeChip">${icon(foeArt(f.kind),FOE_EMOJI[f.kind],'portrait')}<span><b>${esc(f.name)}</b><small>❤ ${f.hp} · 👊 ${f.atk}</small></span></span>`).join('')}</div><button class="primary" data-showdown-district="${d.id}" ${ready?'':'disabled'}>⚔ Take ${esc(pv.where)}</button>${ready?'':'<p class="muted small">Nobody on your crew is fit to fight tonight. Fighters rest overnight.</p>'}`:owned?`<p class="muted small">Holding it lowers Vera’s nightly push. She may send a crew to take it back.</p>`:`<p class="lockNote">🔒 ${esc(why)}</p>`}</article>`;}
function crewCard(b){const st=G.fighterStats(b),status=G.crewStatus(s,b),sk=G.SKILL_BY_ID[st.skill],t=G.turfOf(s),loyal=(b.loyalty||0)>=G.CREW_LOYALTY;
 const label={ready:'Ready',tired:'Resting tonight',injured:`Hurt · back Day ${t.injured[b.id]}`,bench:'Not on crew'}[status];
 const statBar=(lab,val,max,txt)=>`<div class="cStat"><span>${lab}</span><i><b style="width:${Math.min(100,val/max*100)}%"></b></i><em>${txt}</em></div>`;
 return `<article class="crewCard is-${status}"><div class="ccTop">${icon('bowler.'+b.id,'👤','portrait')}<div><b>${esc(b.name)}</b><span class="cStatus">${label}</span></div>${st.standFirm?'<span class="standFirm" title="Loyalty 80+: survives one knockout blow per fight">🔥 Won’t go down</span>':''}</div>
 ${statBar('Grit',st.hp,40,st.hp+' HP')}${statBar('Hit',st.dmg,14,st.dmg+' dmg')}${statBar('Aim',st.hit*100,100,Math.round(st.hit*100)+'%')}${statBar('Nerve',st.resist*100,90,Math.round(st.resist*100)+'%')}
 <p class="ccSkill">${sk.icon} <b>${esc(sk.name)}</b> <small>${esc(sk.text)} (best stat: ${esc(st.skillStat)})</small></p>
 <div class="ccFoot"><small>Loyalty ${b.loyalty||0}${b.crewReady?'':'/'+G.CREW_LOYALTY}</small>${b.crewReady?`<button class="mini" data-crew="${b.id}:0">Bench</button>`:`<button class="mini ${loyal?'primary':''}" data-crew="${b.id}:1" ${loyal?'':'disabled'}>${loyal?'Invite to crew':'Needs loyalty '+G.CREW_LOYALTY}</button>`}${status==='injured'?`<button class="mini" data-patch="${b.id}" ${G.districtStatus(s,'oldtown').owner==='player'&&s.cash>=60?'':'disabled'}>🩹 Doc Ramos · $60</button>`:''}</div></article>`;}
function renderTurf(){const el=$('turfBoard');if(!el)return;const on=isTurf();el.classList.toggle('hidden',!on);
 $('competeEyebrow').textContent=on?'THE BACK ALLEY · AFTER DARK':'ROAD TO GLORY';$('competeTitle').textContent=on?'Turf War':'Leagues & Tournaments';$('competeLede').textContent=on?'Vera leans on you every night. Meet her crews, take the city back block by block, and keep the lanes open.':'Build six lanes to host weekly leagues. Train your bowlers to win tournaments.';$('turfCompeteHead')?.classList.toggle('hidden',!on);
 if(!on)return;
 const t=G.turfOf(s),c=s.campaignStory,p=Math.round(s.rival.pressure||0),tier=G.threatTier(s),ix=G.threatIndex(s),drift=G.veraDrift(s),op=G.activeOp(s),held=G.DISTRICTS.filter(d=>G.districtStatus(s,d.id).owner==='player').length;
 const last=t.lastDrift||0,ops=c.nightOps,cool=s.day-c.lastActionDay<2;
 const effects=[tier.traffic<1?`Guests ×${tier.traffic}`:'No effect on guests yet',tier.morale?`Staff morale −${tier.morale}/night`:'',ix>=3?'Her crews get one night less warning':'',ix>=4&&!t.accord?'Sieges every few nights':''].filter(Boolean);
 const accordChecks=[[ops.entrance>=2,'Door crew Lv 2'],[ops.cameras>=2,'Cameras Lv 2'],[ops.crew>=1,'Staff drills Lv 1'],[ops.defended>=4,`Attacks repelled ${ops.defended}/4`],[held>=3,`Districts ${held}/3`],[(s.roomVisits.arcade||0)>=35&&s.built.arcade,'Casino Lounge, 35 visits'],[G.lanes(s)>=6,'6 lanes'],[p<=40,'Vera’s grip ≤ 40']];
 el.innerHTML=`<section class="gripHero tier-${ix}"><div class="gripVera">${icon('story.vera','🌹','gripPortrait')}<div><small class="eyebrow">VERA VALE · STRIKECITY</small><blockquote>“${esc(G.veraTaunt(s))}”</blockquote></div></div>
 <div class="gripRead"><span class="gripTier">${esc(tier.name)}</span><b class="gripNum">${p}</b><span class="gripDrift ${last>0?'up':last<0?'down':''}">${last>0?'▲ +'+last:last<0?'▼ '+last:'—'} last night</span></div>
 ${gripGauge(p,true)}<p class="gripLine">${esc(tier.line)}</p><ul class="gripEffects">${effects.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>
 <details class="gripWhy"><summary>Why her grip moves every night</summary><ul>${drift.parts.map(x=>`<li><span>${esc(x.label)}</span><b class="${x.value>0?'up':'down'}">${x.value>0?'+':''}${x.value}</b></li>`).join('')}<li class="total"><span>Every night</span><b class="${drift.total>0?'up':'down'}">${drift.total>0?'+':''}${drift.total}</b></li></ul><p class="muted small">On top of that her people try something small most nights (stopped by your doorman, cameras, drills, contacts and districts). Winning a showdown knocks her back 8–12. She can’t drop below ${G.veraFloor(s)} while she still holds ${6-held} district${6-held===1?'':'s'}.</p></details></section>
 ${op?`<section class="opCard ${op.launch-s.day<=0?'urgent':''}"><div class="opStamp">🚨 ${op.kind==='siege'?'SIEGE':op.kind==='retake'?'COUNTERATTACK':'OPERATION'}</div><div class="opClock"><b>${opWhen(op)}</b><small>Day ${op.launch} at close</small></div><h3>${esc(op.name)}</h3><p>${esc(op.text)}</p>
  <div class="foeStrip">${op.foes.map(k=>`<span class="foeChip">${icon(foeArt(k),FOE_EMOJI[k],'portrait')}<span><b>${esc(G.FOES[k].name)}</b></span></span>`).join('')}</div>
  <div class="opActions"><button class="primary" data-showdown-op="${op.id}" ${G.availableFighters(s).length?'':'disabled'}>Meet them →</button><span class="small">Or trust your defenses: they hold about <b>${Math.round(G.opRepelChance(s,op)*100)}%</b> of the time.</span></div></section>`
 :`<section class="opCard quiet"><div class="opStamp">🌒 QUIET</div><p>${esc(G.rivalWarning(s))}</p></section>`}
 <section class="turfPanel"><div class="sectionhead"><div><h2>The City</h2><p class="muted small">Each wing of your alley reveals another district. Take both sites to hold it.</p></div><span class="badge ${held?'good':''}">${held}/6 held</span></div><div class="mapWrap">${cityMapSVG()}<div class="mapLegend"><span><i class="lg vera"></i>Vera</span><span><i class="lg contested"></i>Contested</span><span><i class="lg mine"></i>Yours</span><span><i class="lg op"></i>Her next move</span></div></div>${districtPanel()}</section>
 <section class="turfPanel"><div class="sectionhead"><div><h2>Your Crew</h2><p class="muted small">Training on the lanes shows up on the street. <b>Spare</b> = grit, <b>Power</b> = hits, <b>Aim</b> = accuracy & crits, <b>Focus</b> = nerve. Training also earns loyalty (+2). Up to three fight at once.</p></div><span class="badge">${G.availableFighters(s).length} ready</span></div><div class="crewGrid">${s.bowlers.map(crewCard).join('')}</div>${s.bowlers.length<4?'<p class="muted small">Recruit more bowlers on the Bowlers tab. Newcomers start at loyalty 50.</p>':''}</section>
 <section class="turfPanel"><div class="sectionhead"><div><h2>Night Moves</h2><p class="muted small">One big decision every two nights. Defenses stop her small plays and give your Showdowns a doorman, camera ambush and drilled crew.</p></div><button class="mini" data-open="security">🚪 Defenses · ${G.nightProtection(s)}</button></div>
  <div class="noirStats"><span>🕵️ Influence <b>${c.influence}</b></span><span>🚨 Suspicion <b>${c.heat}</b></span><span>🤝 Trust <b>${c.trust}</b></span><span>🛡️ Repelled <b>${ops.defended}</b></span></div>
  <div class="nightMoves">${G.NOIR_ACTIONS.map(a=>`<button data-noir-action="${a.id}" ${cool||s.cash<a.cost?'disabled':''}><b>${esc(a.name)}</b><small>${a.cost?cash(a.cost):'Free'} · ${esc(a.description)}</small></button>`).join('')}</div>${cool?`<p class="muted small">Next big decision on Day ${c.lastActionDay+2}.</p>`:''}</section>
 <section class="turfPanel"><div class="sectionhead"><div><h2>Vera’s Ledger</h2><p class="muted small">Everything she tried, and what you did about it.</p></div><span class="badge">${t.playsFoiled+t.opsStopped} stopped · ${t.playsLanded+t.opsLanded} landed</span></div><ol class="ledger">${t.ledger.slice(0,10).map(l=>`<li class="${l.tone}"><span class="lgDay">D${l.day}</span><span class="lgIcon">${l.icon}</span><span>${esc(l.text)}</span></li>`).join('')||'<li>Nothing yet. Enjoy it.</li>'}</ol></section>
 <section class="turfPanel endgame"><h2>How this ends</h2><div class="endRow"><div><b>🌃 The City Is Yours</b><p class="small">Take all six districts. Vera leaves town.</p><div class="endBar"><i style="width:${held/6*100}%"></i></div><small>${held}/6 districts</small></div><div><b>🌹 The Midnight Accord ${t.accord?'· EARNED':''}</b><p class="small">Milestone: Vera stops hitting your building.</p><ul class="checks">${accordChecks.map(([ok,txt])=>`<li class="${ok||t.accord?'ok':''}">${ok||t.accord?'✓':'·'} ${esc(txt)}</li>`).join('')}</ul></div></div></section>`;}
// ── Showdown ──
function openShowdown(ctx){if(!isTurf())return;if(s.battle){showdownCtx=null;}else{const pv=G.battlePreview(s,ctx);if(!pv){toast('That fight is no longer on.',true);return;}showdownCtx=ctx;showdownPick=G.availableFighters(s).slice(0,3).map(b=>b.id);}
 showdownOpen=true;showdownLog=[];closeDrawer();$('showdownBackdrop').classList.remove('hidden');renderShowdown();lastTick=Date.now();}
function closeShowdown(){showdownOpen=false;showdownCtx=null;showdownTarget=null;$('showdownBackdrop').classList.add('hidden');lastTick=Date.now();render();save();showNextOpeningNotice();}
function oddsLabel(r){return r<.55?['Long odds','bad']:r<.85?['Risky','warn']:r<1.25?['Even fight','mid']:['You’re favored','good'];}
function intentHTML(f,b){const it=f.intent;if(f.ko)return '';if(f.stun)return '<span class="sdIntent stun">💫 Stunned</span>';if(!it)return '';const who=b.crew.find(x=>x.id===it.target)?.name||'';
 const tip=({swing:`Next: swings at ${who} for about ${it.power}`,haymaker:`Next: a haymaker at ${who}, about ${it.power}. Guard or stun to blunt it.`,intimidate:`Next: threatens ${who} (−35% accuracy unless they keep their nerve)`,rally:'Next: rallies the crew (+1 damage, +4 health)',whistle:'Next: whistles for another lookout',ultimatum:'Next: threatens your whole crew and hits'})[it.type]||'';
 return `<span class="sdIntent ${it.type}" title="${esc(tip)}">${({swing:`👊${it.power} ${esc(who)}`,haymaker:`🥊${it.power} ${esc(who)}`,intimidate:`😠 ${esc(who)}`,rally:'📣 Rally',whistle:'📢 Backup',ultimatum:'⚠ Everyone'})[it.type]||''}</span>`;}
function unitHTML(u,side,b){const pct=Math.max(0,u.hp/u.max*100),actor=G.currentActor(b),isActor=actor&&actor.id===u.id,target=side==='foe'&&!u.ko&&showdownTarget===u.id;
 const chips=[u.guard?'🛡':'',u.shaken?'😰':'',side==='foe'&&u.shaken?'💢−2':'',side==='crew'&&!u.ally&&u.cd>0?`⏳${u.cd}`:'',u.ally?'ALLY':''].filter(Boolean).map(x=>`<i>${x}</i>`).join('');
 const tag=side==='foe'&&!u.ko?'button':'div';
 return `<${tag} class="sdUnit ${side} ${u.ko?'ko':''} ${isActor?'actor':''} ${target?'targeted':''}" data-unit="${u.id}" ${tag==='button'?`data-sd-target="${u.id}" aria-label="Target ${esc(u.name)}, ${u.hp} of ${u.max} health"`:''}>${side==='foe'?intentHTML(u,b):''}<span class="sdPortrait">${icon(unitArt(u),side==='foe'?FOE_EMOJI[u.kind]:'👤','portrait')}</span><b class="sdName">${esc(u.name)}</b><span class="sdHp"><i style="width:${pct}%"></i></span><small class="sdHpNum" data-hp="${u.hp}" data-max="${u.max}">${u.hp}/${u.max}</small><span class="sdChips">${chips}</span></${tag}>`;}
function renderShowdown(){const box=$('showdown');if(!box)return;const b=s.battle;
 if(b&&b.status!=='active'&&b.result){const won=b.status==='won';box.className='showdown result '+(won?'won':'lost');
  box.innerHTML=`<div class="sdResult"><span class="sdStamp">${won?'WON':b.status==='fled'?'BACKED OFF':'LOST'}</span><h2 id="showdownTitle">${esc(b.result.title)}</h2><p>${esc(b.result.text)}</p><div class="sdCrewRow">${b.crew.map(x=>`<span class="sdMini ${x.ko?'ko':''}">${icon(unitArt(x),'👤','portrait')}<small>${esc(x.name)}</small></span>`).join('')}</div><ul class="sdRewards">${b.result.rewards.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><button class="primary" data-sd-close>Back to the Turf</button></div>`;return;}
 if(b&&b.status==='active'){const actor=G.currentActor(b);if(!showdownTarget||!b.foes.some(f=>f.id===showdownTarget&&!f.ko))showdownTarget=b.foes.find(f=>!f.ko)?.id||null;const tgt=b.foes.find(f=>f.id===showdownTarget);
  const sk=actor&&G.SKILL_BY_ID[actor.skill];box.className='showdown fight mode-'+b.mode;
  box.innerHTML=`<header class="sdHead"><div><small class="eyebrow">${b.mode==='defend'?'DEFENDING':'TAKING'} · ROUND ${b.round}/${b.maxRounds}</small><h2 id="showdownTitle">${esc(b.title)}</h2></div><button class="mini" data-sd-flee>Back off</button></header>
  <div class="sdStage"><div class="sdRow foes">${b.foes.map(f=>unitHTML(f,'foe',b)).join('')}</div><div class="sdBanner" id="sdBanner"></div><div class="sdRow crew">${b.crew.map(x=>unitHTML(x,'crew',b)).join('')}</div></div>
  <p class="sdLog" id="sdLog" aria-live="polite">${esc((b.log||[]).slice(-1)[0]||'')}</p>
  <div class="sdControls">${actor?`<div class="sdWho">${icon('bowler.'+actor.id,'👤','portrait')}<span><b>${esc(actor.name)}’s move</b><small>Target: ${esc(tgt?.name||'—')} · tap a foe to switch</small></span></div>
   <div class="sdActions"><button class="sdAct strike" data-sd-act="strike"><b>👊 Strike</b><small>${actor.dmg}–${actor.dmg+3} dmg · ${Math.round(Math.max(.2,actor.hit-(tgt?.dodge||0)-(actor.shaken?.35:0))*100)}%</small></button><button class="sdAct skill" data-sd-act="skill" ${actor.cd>0?'disabled':''}><b>${sk.icon} ${esc(sk.name)}</b><small>${actor.cd>0?'Ready in '+actor.cd:esc(sk.text)}</small></button><button class="sdAct guard" data-sd-act="guard"><b>🛡 Guard</b><small>Take 60% less, cover the weakest</small></button></div>`:'<p class="muted">Vera’s crew is moving…</p>'}
   <button class="mini sdAuto" data-sd-auto>⏩ Auto-finish</button></div>`;return;}
 const ctx=showdownCtx;if(!ctx){closeShowdown();return;}const pv=G.battlePreview(s,ctx);if(!pv){closeShowdown();return;}
 const ready=G.availableFighters(s),cp=G.crewPower(s,showdownPick),n=s.campaignStory.nightOps,mode=ctx.opId?'defend':'attack';
 const bonusHP=mode==='defend'?(n.crew||0)*3:0,doorHP=mode==='defend'&&n.entrance?(16+n.entrance*6):0,ambush=mode==='defend'?(n.cameras||0)*2:Math.floor((s.campaignStory.influence||0)/25);
 const ourScore=(cp.hp+bonusHP*showdownPick.length+doorHP)*(cp.dps+(doorHP?(3+n.entrance)*.75:0)),theirScore=Math.max(1,(pv.foeHP-ambush*pv.foes.length)*pv.foeAtk*1.05),ratio=ourScore/theirScore,[oddTxt,oddCls]=oddsLabel(ratio);
 box.className='showdown lineup';
 box.innerHTML=`<header class="sdHead"><div><small class="eyebrow">${mode==='defend'?'THEY’RE COMING':'SHOWDOWN'}</small><h2 id="showdownTitle">${esc(pv.title)}</h2><p class="small">${mode==='defend'?'Meet them at '+esc(pv.where)+' before they get in.':'Your crew walks into '+esc(pv.where)+'.'}</p></div><button class="mini" data-sd-cancel>✕</button></header>
 <div class="sdLineup"><div class="sdRow foes">${pv.foes.map(f=>`<div class="sdUnit foe preview"><span class="sdPortrait">${icon(foeArt(f.kind),FOE_EMOJI[f.kind],'portrait')}</span><b class="sdName">${esc(f.name)}</b><small>❤ ${f.hp} · 👊 ${f.atk}</small></div>`).join('')}</div>
 <div class="sdVs"><span>VS</span></div>
 <p class="small sdPickHint">Pick up to three fighters (${showdownPick.length}/3):</p>
 <div class="sdRow pick">${s.bowlers.map(bw=>{const st=G.crewStatus(s,bw),on=showdownPick.includes(bw.id),fs=G.fighterStats(bw);return `<button class="sdUnit crew pickable ${on?'picked':''} is-${st}" data-sd-pick="${bw.id}" ${st==='ready'?'':'disabled'} aria-pressed="${on}"><span class="sdPortrait">${icon('bowler.'+bw.id,'👤','portrait')}</span><b class="sdName">${esc(bw.name)}</b><small>${st==='ready'?`❤ ${fs.hp} · 👊 ${fs.dmg} · 🎯 ${Math.round(fs.hit*100)}%`:({tired:'Resting',injured:'Hurt',bench:'Not on crew'})[st]}</small></button>`;}).join('')}</div></div>
 <div class="sdOdds ${oddCls}"><span>${esc(oddTxt)}</span><div class="sdOddsBar"><i style="width:${Math.max(6,Math.min(94,ratio/(1+ratio)*100))}%"></i></div><small>Your crew vs. theirs</small></div>
 <ul class="sdBonuses">${doorHP?`<li>🚪 Your doorman fights with you (❤ ${doorHP})</li>`:''}${ambush&&mode==='defend'?`<li>📹 Cameras spot them early: −${ambush} to each</li>`:''}${ambush&&mode==='attack'?`<li>🕵️ Your contacts tip you off: −${ambush} to each</li>`:''}${bonusHP?`<li>🧰 Drills: +${bonusHP} grit per fighter</li>`:''}${!doorHP&&!ambush&&!bonusHP?'<li class="muted">No backup. Defenses and contacts add allies and ambushes here.</li>':''}</ul>
 <footer class="sdFoot"><button class="primary" data-sd-start ${showdownPick.length?'':'disabled'}>⚔ Start the showdown</button><button data-sd-cancel>Not tonight</button></footer>`;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function floatOn(el,text,cls){if(!el)return;const f=document.createElement('span');f.className='sdFloat '+cls;f.textContent=text;el.append(f);setTimeout(()=>f.remove(),1100);}
function bumpHP(el,delta){if(!el)return;const num=el.querySelector('.sdHpNum'),bar=el.querySelector('.sdHp i');if(!num)return;const max=+num.dataset.max,hp=Math.max(0,Math.min(max,+num.dataset.hp+delta));num.dataset.hp=hp;num.textContent=hp+'/'+max;if(bar)bar.style.width=(hp/max*100)+'%';}
async function playEvents(events,{noBump=false}={}){const box=$('showdown');showdownAnim=true;box.classList.add('busy');const fast=lowMotion;
 const unit=id=>box.querySelector(`.sdUnit[data-unit="${id}"]`),log=$('sdLog'),banner=$('sdBanner');
 for(const e of events){if(log&&e.text)log.textContent=e.text;const from=unit(e.from),to=unit(e.to);
  if(e.type==='phase'){if(banner){banner.textContent='Vera’s crew moves';banner.classList.add('show');}await wait(fast?0:450);banner?.classList.remove('show');continue;}
  if(from&&['hit','crit','miss'].includes(e.type)){from.classList.remove('lunge');void from.offsetWidth;from.classList.add('lunge');}
  if(e.type==='hit'||e.type==='crit'){if(to){to.classList.remove('shake');void to.offsetWidth;to.classList.add('shake');if(!noBump)bumpHP(to,-e.amount);floatOn(to,(e.type==='crit'?'💥 ':'−')+e.amount,e.type==='crit'?'crit':'dmg');}}
  else if(e.type==='miss')floatOn(to,'MISS','miss');
  else if(e.type==='heal'){bumpHP(to,e.amount);floatOn(to,'+'+e.amount,'heal');to?.classList.remove('ko');}
  else if(e.type==='guard'){floatOn(from,'🛡','heal');if(e.amount)bumpHP(from,e.amount);}
  else if(e.type==='cover')floatOn(from,'🛡 COVER','heal');
  else if(e.type==='ko')to?.classList.add('ko');
  else if(e.type==='stun'||e.type==='stunned')floatOn(to||from,'💫','stun');
  else if(e.type==='shaken')floatOn(to,'😰','stun');
  else if(e.type==='resist')floatOn(to,'✊','heal');
  else if(e.type==='rally')floatOn(from,'📣','stun');
  else if(e.type==='summon')floatOn(from,'📢','stun');
  else if(e.type==='stand'){bumpHP(to,1);floatOn(to,'🔥 STILL UP','crit');}
  else if(e.type==='skill')floatOn(from,'✨','heal');
  await wait(fast?0:(e.type==='skill'?320:e.type==='info'?240:430));}
 box.classList.remove('busy');showdownAnim=false;renderShowdown();if(s.battle&&s.battle.status!=='active'){save();render();}}
$('showdownBackdrop').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||showdownAnim)return;e.stopPropagation();
 if(b.dataset.sdPick){const id=b.dataset.sdPick;showdownPick=showdownPick.includes(id)?showdownPick.filter(x=>x!==id):showdownPick.length<3?[...showdownPick,id]:showdownPick;renderShowdown();return;}
 if(b.dataset.sdCancel!==undefined){closeShowdown();return;}
 if(b.dataset.sdStart!==undefined){const r=G.startBattle(s,{...showdownCtx,crew:showdownPick});if(!r.ok){toast(r.reason,true);return;}showdownCtx=null;save();renderShowdown();if(s.battle.events?.length)playEvents(s.battle.events,{noBump:true});return;}
 if(b.dataset.sdTarget){showdownTarget=b.dataset.sdTarget;renderShowdown();return;}
 if(b.dataset.sdAct){const r=G.battleAct(s,{action:b.dataset.sdAct,target:showdownTarget});if(!r.ok){toast(r.reason,true);return;}save();playEvents(r.events||[]);return;}
 if(b.dataset.sdAuto!==undefined){G.battleAuto(s);save();renderShowdown();render();return;}
 if(b.dataset.sdFlee!==undefined){if(!confirm('Pull your crew out? Your fighters still rest until tomorrow.'))return;G.fleeBattle(s);save();renderShowdown();return;}
 if(b.dataset.sdClose!==undefined){G.closeBattle(s);closeShowdown();return;}});
document.addEventListener('keydown',e=>{if(!showdownOpen||showdownAnim)return;if(e.key==='Escape'&&!s.battle)closeShowdown();});
// City map clicks (SVG groups, not buttons)
document.addEventListener('click',e=>{const g=e.target.closest('[data-turf-district]');if(!g)return;turfSel=g.dataset.turfDistrict;renderTurf();document.querySelector('.districtPanel')?.scrollIntoView({block:'nearest',behavior:lowMotion?'auto':'smooth'});});
document.addEventListener('keydown',e=>{const g=e.target.closest?.('[data-turf-district]');if(!g||!['Enter',' '].includes(e.key))return;e.preventDefault();turfSel=g.dataset.turfDistrict;renderTurf();document.querySelector(`[data-turf-district="${turfSel}"]`)?.focus();});

function renderBookings(){
 const target=$('bookingPanel');if(!target)return;
 const upcoming=(s.bookings||[]).filter(b=>b.status==='booked'&&b.day>=s.day).sort((a,b)=>a.day-b.day);
 target.innerHTML=`<div class="sectionhead"><div><h2>Upcoming Event Requests</h2><p class="muted small">Special parties and private events are offered through incoming phone calls and surprise requests. Accept or decline them when they arrive; no manual booking calendar is needed.</p></div><span class="badge">${upcoming.length} accepted</span></div>${upcoming.length?`<div class="bookingList">${upcoming.map(b=>`<div><b>${esc(b.name)}</b><small>Day ${b.day} · ${G.formatHour(b.start)}–${G.formatHour(b.end)} · ${esc(b.status)}</small></div>`).join('')}</div>`:'<p class="muted small">No upcoming events yet. Keep an eye out for the next incoming party request!</p>'}`;
}
function renderTournaments(){renderTurf();renderBookings();$('leagueBoard').innerHTML=leagueHTML();const count=G.TOURNAMENTS.filter(t=>s.tournamentWins[t.id]).length;$('trophyCount').textContent=count+' / 4 trophies';$('tournamentsList').innerHTML=G.TOURNAMENTS.map(t=>{const missing=G.eligibility(s,t),wins=s.tournamentWins[t.id]||0;return `<article class="tournament">${icon('misc.trophy',wins?'🥇':'🏆')}<div><h3>${esc(t.title)}${wins?' ✓':''}</h3><p>Team avg ${G.teamAvg(s)}/${t.needAvg} · Rep ${Math.floor(s.rep)}/${t.needRep}</p><p>Entry ${cash(t.fee)} · Prize ${cash(t.firstPrize)}</p><p>${missing.length?'🔒 '+esc(missing.join(' · ')):'✅ Ready to compete'}</p></div><button data-tour="${t.id}" ${missing.length?'disabled':''}>Compete</button></article>`;}).join('');const circuit=$('legacyCircuit');if(circuit){const isLegacy=s.campaignStory?.path==='legacy';circuit.classList.toggle('hidden',!isLegacy);if(isLegacy){
 const last=s.seasonHistory?.[0];circuit.innerHTML=`<div class="sectionhead"><div><h2>Legacy Championship Circuit</h2><p class="muted small">Thursday leagues lead to qualifying brackets, rival squads and Vera's strongest teams. Each match is simulated separately, with skills, coaching, pro-shop equipment and chance affecting the result.</p></div><span class="badge">${Object.keys(s.circuitWins||{}).length}/4 titles</span></div>
 <h3>District League Seasons</h3><p class="muted small">Win at least two of three scheduled matches to qualify for each district's final. Winning the final earns local recognition and unlocks the next district. Build a stronger team to face tougher opponents.</p>
 <div class="cityDistrictGrid">${G.CITY_DISTRICTS.map((d,i)=>{const state=s.cityLeagues?.[d.id]||{matches:[],champion:false,lastDay:0,finals:[]};const wins=state.matches.filter(m=>m.won).length,ready=G.legacyDistrictReady(s,d.id),finished=state.matches.length===3,qualified=finished&&wins>=2;
 return `<article class="cityDistrictCard ${state.champion?'districtWon':''}"><div class="cityCardHeader"><b>${state.champion?'🏆':ready?'🎳':'🔒'} ${esc(d.name)}</b><small>${state.champion?'RECOGNIZED':ready?'OPEN':'LOCKED'}</small></div><p>${esc(d.league)} · Team benchmark ${d.need}</p><p><b>Season:</b> ${wins} wins / ${state.matches.length} played</p><p class="muted small">${esc(d.reward)}</p><button data-district-league="${d.id}" ${!ready||state.champion||!s.league.active||state.lastDay===s.day||qualified?'disabled':''}>${finished&&wins<2?'Start new season':'Play next league match'} · ${cash(d.fee)}</button><button data-district-final="${d.id}" ${!qualified||state.champion||state.lastDay===s.day?'disabled':''}>District final · ${cash(d.fee+85)}</button>${state.matches.length?`<div class="cityMatchHistory">${state.matches.map(m=>`<small>${m.won?'✅':'❌'} ${esc(m.opponent)} ${m.score}–${m.opponentScore}</small>`).join('')}</div>`:''}${state.finals?.length?`<div class="cityMatchHistory"><b>Championship rounds</b>${state.finals.map(m=>`<small>${m.won?'✅':'❌'} ${esc(m.opponent)} ${m.score}–${m.opponentScore}</small>`).join('')}</div>`:''}</article>`}).join('')}</div>
 <h3>National Championship Brackets</h3>
 <div class="circuitStages">${G.LEAGUE_CIRCUIT.map(stage=>{const t=G.TOURNAMENTS.find(x=>x.id===stage.id),need=G.eligibility(s,t),prev=stage.qualifier&&!s.circuitWins?.[stage.qualifier],ready=s.league.active&&!prev&&!need.length;
 return `<article class="circuitStage"><h3>${s.circuitWins?.[stage.id]?'🥇':'🎳'} ${esc(stage.name)}</h3><small>Opponents: ${esc(stage.teams.join(' → '))}</small><p>${prev?'🔒 Win the previous qualifying bracket':!s.league.active?'🔒 Start Thursday League first':need.length?'🔒 '+esc(need.join(' · ')):'Ready for the bracket'}</p><button data-run-circuit="${stage.id}" ${ready?'':'disabled'}>Enter bracket · ${cash(t.fee)}</button></article>`}).join('')}</div>
 ${last?`<div class="bracketResults"><h3>${last.won?'🏆':'🎳'} Day ${last.day} · ${esc(last.stage)} · ${last.won?'CHAMPIONS':'Eliminated'}</h3>${last.bracket.map(m=>`<div class="bracketMatch ${m.won?'matchWin':'matchLoss'}"><span>Round ${m.round}</span><b>Your team ${m.score} – ${m.opponentScore} ${esc(m.opponent)}</b><span>${m.won?'WIN':'LOSS'}</span></div>`).join('')}</div>`:'<p class="muted small">Complete a bracket to see each round and its results here.</p>'}`;}}
$('practiceCount').textContent=G.lanes(s)?`${s.practiceLeft} rolls remaining`:'Build a lane to unlock practice';$('roll').disabled=s.practiceLeft<=0||!G.lanes(s);}
function renderYou(){const level=1+Math.floor(s.ownerXP/60),progress=s.ownerXP%60;$('ownerLevel').textContent='LEVEL '+level;$('ownerPoints').textContent=s.ownerPoints+' skill points';$('ownerXPLabel').textContent=progress+' / 60 XP to next level';$('ownerBar').style.width=progress/60*100+'%';$('ownerTitle').textContent=level<3?'Rookie Owner':level<6?'Neighborhood Favorite':level<10?'Community Legend':'Bowling Tycoon';
 $('ownerSkills').innerHTML=G.PLAYER_SKILLS.map(k=>`<div class="ownerSkill"><div><h3>${esc(k.label)} · Lv ${s.ownerSkills[k.id]}/6</h3><p>${esc(k.desc)}</p></div><button data-owner="${k.id}" ${s.ownerPoints<=0||s.ownerSkills[k.id]>=6?'disabled':''}>+ Improve</button></div>`).join('');
 const ownerPath=artSrc('misc.owner');if(ownerPath){if(!$('ownerArt').firstElementChild)$('ownerArt').innerHTML=`<img src="${esc(ownerPath)}" alt="Your game character" onload="this.closest('.ownerAvatar').classList.add('hasArt')" onerror="this.closest('.ownerAvatar').classList.remove('hasArt');this.remove()">`;}else $('ownerArt').replaceChildren();}

function renderEmployees(){let wage=s.employees.reduce((n,e)=>n+e.wage,0)+(s.built.staff?16:0);
 $('staffPayBadge').textContent=cash(wage)+' / day payroll';
 // v1.08: one compact roster row per role instead of a big card each.
 const roleRow=(art,emoji,name,status,cls,note,action)=>`<div class="rosterRow ${cls}">${icon(art,emoji,'portrait')}<div class="rosterText"><b>${esc(name)}</b><small>${note}</small></div><span class="rosterStatus">${status}</span>${action}</div>`;
 $('staffRoles').innerHTML=Object.entries(G.EMPLOYEE_ROLES).map(([id,r])=>{
  const required=G.neededStaff(s,id),count=G.countStaff(s,id),eligible=id==='stocker'?s.built.snack||s.built.bar:id==='mechanic'?G.lanes(s)>=2:!!s.built[id],filled=!!eligible&&count>=required,optional=id==='stocker'||id==='mechanic';
  const note=!eligible?(id==='mechanic'?'Needs 2 lanes':id==='stocker'?'Needs a snack counter or bar':'Build the room first'):id==='stocker'?'Optional · orders low stock at closing':id==='mechanic'?'Optional · handles night closures':filled?'Open for business':'Room stays closed until staffed';
  const status=!eligible?'Locked':`${count}/${required}`;const cls=!eligible?'locked':filled?'ok':optional?'optional':'short';
  const action=!eligible?'':filled?'<span class="rosterDone">✓</span>':`<button class="mini ${optional?'':'primary'}" data-hire="${id}" ${s.cash<r.fee?'disabled':''}>Hire ${cash(r.fee)}</button>`;
  return roleRow('employee.'+id,'👤',r.name,status,cls,note,action);
 }).join('')+roleRow('upgrade.staff','🔧','Lane Technician',s.built.staff?'On duty':'Not hired',s.built.staff?'ok':'optional',s.built.staff?'Services lanes at 70% · $16/day + $20 per repair':'Automates lane service · hire in Lanes → Upgrades',s.built.staff?'<span class="rosterDone">✓</span>':'<button class="mini" data-open="lanes:upgrades">Lanes</button>');
 $('emergencyCoveragePanel').innerHTML=`<h3>Emergency Service Contract</h3><p>Coverage lasts 28 game days and reduces repair costs. An Emergency Mechanic handles shutdowns automatically when you can afford labor and have spare parts.</p><button data-emergency-coverage ${s.emergencyCoverageUntil>=s.day||G.lanes(s)<2||s.cash<160?'disabled':''}>${s.emergencyCoverageUntil>=s.day?'✓ Covered until Day '+s.emergencyCoverageUntil:'Purchase 28-day coverage · $160'}</button>`;
 $('deliveryBadge').textContent=s.deliveries.length+' packages en route';
 $('stockControls').innerHTML=`${s.built.automation?'':upgradeRow('automation')}<p>Low stock means <b>${s.lowStockThreshold} or fewer</b> units. The Stock Clerk places orders at closing; deliveries arrive the following morning.</p><div class="thresholdControl"><b>Low stock trigger</b><button data-threshold="-1" ${s.lowStockThreshold<=1?'disabled':''}>−</button><strong>${s.lowStockThreshold}</strong><button data-threshold="1" ${s.lowStockThreshold>=12?'disabled':''}>+</button></div><div class="deliveryList">${s.deliveries.length?s.deliveries.map(d=>`<div>📦 ${esc(d.name)} ×${d.amount} · Week ${G.calendar(d.arriveDay).week}, ${G.calendar(d.arriveDay).weekday}</div>`).join(''):'📭 No deliveries currently scheduled'}</div>`;
 $('staffList').innerHTML=s.employees.length?s.employees.map(e=>{const next=e.skill<5?G.STAFF_XP[e.skill+1]:null,required=G.expectedWage(e),cost=G.staffTrainingCost(e),ready=e.skill<5&&(e.workXP||0)>=next;const specialties=e.skill>=3&&!e.specialty?(e.role==='snack'?['speed','quality']:e.role==='bar'?['upsell','hospitality']:e.role==='mechanic'?['repairs','parts']:e.role==='proshop'?['upsell','quality']:['speed','quality']):[];
  const low=e.wage<required,morale=Math.round(e.morale);
  return `<div class="teamRow">${icon('employee.'+e.role,'👤','portrait')}<div class="teamMain"><div class="teamName"><b>${esc(e.name)}</b><span class="lvChip">Lv ${e.skill}</span><small>${esc(G.EMPLOYEE_ROLES[e.role].name)} · ${esc(G.STAFF_CAREERS[e.skill-1])}${e.specialty?' · '+esc(e.specialty):''}</small></div>
   <div class="teamMeters"><span class="moraleBar" title="Morale ${morale}%"><i style="width:${morale}%" class="${morale<40?'bad':morale<65?'mid':''}"></i></span><small>Morale ${morale}%</small><small>XP ${e.workXP||0}${next!==null?'/'+next:''}</small></div>
   <div class="teamControls"><span class="wageStep"><button class="mini" data-wage="${e.id}:-1" ${e.wage<=8?'disabled':''} aria-label="Lower ${esc(e.name)}'s pay">−</button><b class="${low?'lowPay':''}" title="Expected ${cash(required)}/day">${cash(e.wage)}/day</b><button class="mini" data-wage="${e.id}:1" ${e.wage>=90?'disabled':''} aria-label="Raise ${esc(e.name)}'s pay">+</button></span>
   <button class="mini" data-train-staff="${e.id}" ${!ready||s.cash<cost?'disabled':''}>${e.skill>=5?'Manager':ready?'Promote · '+cash(cost):'Promote'}</button><button data-fire-staff="${e.id}" class="mini dangerButton" title="Dismiss this employee and open their role">Fire</button></div>
   ${low?`<small class="payNote">Expects ${cash(required)}/day</small>`:''}${specialties.length?`<div class="specialtyPick"><small>Choose a specialty:</small>${specialties.map(v=>`<button class="mini" data-staff-specialty="${e.id}:${v}">${esc(v)}</button>`).join('')}</div>`:''}</div></div>`;}).join(''):'<div class="staffEmpty">It’s just you and a lot of unpaid bowling pins. Hire someone when a counter opens.</div>';
 const issue=s.staffIssues?.[0],person=issue?s.employees.find(e=>e.id===issue.id):null;
 $('staffConcernPanel').innerHTML=person?`<h3>${esc(person.name)} wants to talk</h3><p>${issue.reason==='raise'?'They demand a salary beyond the normal rate for this role.':'They feel exhausted and want more recognition.'} Requested wage: <b>${cash(issue.demand||G.expectedWage(person))}/day</b> (normal expectation ${cash(G.expectedWage(person))}). Respond within five game days; ${person.warnings||0} ignored warning(s).</p><div class="tacticalActions"><button data-staff-concern="raise">Agree to requested raise</button><button data-staff-concern="bonus" ${s.cash<65?'disabled':''}>Retention bonus · $65</button><button data-staff-concern="listen">Discuss workload</button><button data-staff-concern="ignore">Ignore demand ⚠️</button><button data-staff-concern="fire" class="dangerButton">Fire & replace</button></div>`:`<h3>Staff conversations</h3><p class="muted small">No unresolved concerns. Repeated ignored warnings can lead to resignations; empty roles can be refilled.</p>${(s.staffDepartures||[]).slice(0,3).map(x=>`<small>🚪 Day ${x.day}: ${esc(x.name)} (${esc(x.role)}) — ${esc(x.reason)}</small>`).join('<p></p>')}`;
 $('staffConcernPanel').classList.toggle('hidden',!person);if(!person&&(s.staffDepartures||[]).length)$('staffList').insertAdjacentHTML('beforeend',`<p class="departures">${(s.staffDepartures||[]).slice(0,3).map(x=>`Day ${x.day}: ${esc(x.name)} (${esc(x.role)}) left: ${esc(x.reason)}`).join('<br>')}</p>`);
}
// v1.06: render only what the player can see. The header renders every time; tab
// bodies are rebuilt when visible and marked stale otherwise, then rebuilt on the next visit.
const TAB_RENDERERS={alley:renderAlley,regulars:renderStoryCommunity,bowlers:renderBowlers,tournaments:renderTournaments,you:renderYou,employees:renderEmployees,goals:renderGoals,settings:renderSettingsTab};
const staleTabs=new Set(Object.keys(TAB_RENDERERS));
function renderTab(id){const fn=TAB_RENDERERS[id];if(!fn)return;fn();staleTabs.delete(id);}
function renderSettingsTab(){renderFranchise();$('skipSummarySetting').checked=skipSummaries;const status=$('saveStatus');if(status)status.textContent=devPreviewMode?'🧪 LOCAL TEST MODE — cloud saving is DISABLED. Real progress remains separate.':saveAvailable?'Autosave is on · local to this browser':'Browser storage is unavailable — export a backup file';$('devPreviewAlert').classList.toggle('hidden',!devPreviewMode);$('devExitPreview').classList.toggle('hidden',!devPreviewMode);}
function render(all=false){document.body.classList.toggle('noirMode',s.campaignStory?.path==='backalley');syncTurfNav();document.body.classList.toggle('legacyMode',s.campaignStory?.path==='legacy');applyAccessibility();renderHUD();
 for(const id of Object.keys(TAB_RENDERERS))staleTabs.add(id);
 if(all)for(const id of Object.keys(TAB_RENDERERS))renderTab(id);else renderTab(tab);}
function renderOvernightRush(){const target=$('overnightRush');if(!target)return;
 const jobs=s.construction||[];target.innerHTML=jobs.length?`<h3>Overnight Construction Crew</h3><p class="muted small">Skip the remaining wait for one project with in-game cash. Optional—regular construction finishes for free.</p><div class="rushList">${jobs.map(j=>{const cost=G.rushCost(j);return `<div class="rushRow"><span><b>🚧 ${esc(j.title)}</b><small>${j.remaining} day${j.remaining===1?'':'s'} left</small></span><button data-rush="${esc(j.kind)}:${esc(j.id)}" ${s.cash<cost?'disabled':''}>Rush · ${cash(cost)}</button></div>`;}).join('')}</div>`:'<p class="muted small">✅ All projects are finished or you have no construction underway tonight.</p>';
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
 storyOpen=true;$('storyIcon').innerHTML=icon(storyArtKey(c.speaker),c.icon,'storyArt');$('storyTitle').textContent=s.campaignStory?.path==='backalley'&&id==='established'?'The Other Missing Page':c.title;$('storySpeaker').textContent=c.speaker;$('storyText').textContent=s.campaignStory.path==='backalley'&&id==='established'?'Inside Gus’s ledger is a second page, written in a different hand. It lists six neighborhoods where Vera has bought influence, frightened suppliers, and buried old debts. Gus circled one line: The alley is ours only if the city stays ours. Lou says we should start by protecting Old Town and building allies, one block at a time.':s.campaignStory.path==='backalley'&&id==='national'?'The tournament win brings good publicity, but the Midnight Accord is still yours to earn.':c.text;$('storyHint').textContent='🎯 '+(s.campaignStory.path==='backalley'&&id==='established'?'Build your entrance security, secure both sites in Old Town, then open new property wings to reach Vera’s other territories.':s.campaignStory.path==='backalley'&&id==='national'?'Keep the business thriving while you complete the Back Alley mission.':c.hint);
 $('storyBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
$('storyContinue').onclick=()=>{if(!storyOpen)return;storyOpen=false;$('storyBackdrop').classList.add('hidden');s.story.pending.shift();save();lastTick=Date.now();if(s.startupPending){showStartup();return;}if(!showNextOpeningNotice()&&!tutorialSeen)showTutorial();};
function showIncident(){
 if(showdownOpen||branchOpen||incidentOpen||patronOpen||summaryOpen||storyOpen||facilityNoticeOpen||startupOpen||cutsceneOpen||cloudGateOpen||welcomeOpen)return false;
 const e=s.eventQueue?.[0];if(!e)return false;incidentOpen=true;
 $('incidentIcon').innerHTML=icon(incidentArtKey(e),e.emoji||'🎳','storyArt');$('incidentTitle').textContent=e.title;$('incidentText').textContent=e.text;$('incidentEffect').textContent=e.effect||'';
 $('incidentKind').textContent=e.kind==='request'?'PRIVATE BOOKING REQUEST':e.kind==='bad'?'OH NO! AN ALLEY EMERGENCY':e.kind==='rival'?'STRIKECITY MAKES A MOVE':e.kind==='noir'?'AFTER HOURS · A MESSAGE FROM VERA':'LUCKY BREAK!';
 $('incidentActions').innerHTML=e.kind==='request'?`<button class="primary" data-party-choice="yes">Book the party</button><button data-party-choice="no">No thanks</button>`:
 e.repairId?`<button data-repair-event="${esc(e.repairId)}" class="primary" ${s.cash<G.repairCost(s,e.repairId)?'disabled':''}>Repair · ${cash(G.repairCost(s,e.repairId))}</button>${darkCenter()&&s.outages[e.repairId]?.rival?`<button data-investigate-event="${esc(e.repairId)}" ${s.cash<70||!s.campaignStory.nightOps.entrance?'disabled':''}>Investigate with security · $70</button>`:''}<button data-close-incident>Later — view in Build</button>`:
 e.id==='vera-op'&&e.opId&&G.activeOp(s)?.id===e.opId?`<button class="primary" data-incident-showdown="${esc(e.opId)}" ${G.availableFighters(s).length?'':'disabled'}>Meet them →</button><button data-close-incident>Trust my defenses</button>`:
 ['turf-intro','vera-tier','noir-accord'].includes(e.id)?'<button class="primary" data-incident-turf>Open the Turf →</button><button data-close-incident>Later</button>':
 '<button data-close-incident class="primary">Got it →</button>';
 $('incidentBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function closeIncident(){incidentOpen=false;$('incidentBackdrop').classList.add('hidden');s.eventQueue.shift();save();lastTick=Date.now();if(!showNextOpeningNotice())render();}
function showPatronEncounter(){
 if(showdownOpen||branchOpen||incidentOpen||patronOpen||summaryOpen||storyOpen||facilityNoticeOpen||startupOpen||cutsceneOpen||cloudGateOpen||welcomeOpen)return false;
 const enc=s.encounters?.[0];if(!enc)return false;const p=G.PATRON_PROFILES.find(x=>x.id===enc.id),talk=G.encounterScene(s,enc),options=talk?G.encounterOptions(s,enc):[];if(!p||!talk||!options.length){s.encounters.shift();return false;}
 patronOpen=true;const guestEmoji=({lou:'🎳',bea:'👟',dex:'🕹️',rosa:'🍹',nell:'🛍️',milo:'😎'})[p.id]||'🙂';$('patronPicture').innerHTML=icon('patron.'+p.id,guestEmoji);
 $('patronTitle').textContent=p.name;$('patronKicker').textContent=`${p.trait}`;$('patronSpeech').textContent='“'+talk.prompt+'”';$('patronSpeech').classList.remove('reply');
 $('patronActions').innerHTML=options.map(o=>`<button class="answer" data-encounter="${p.id}:${o.id}">${esc(o.text)}</button>`).join('');$('patronMood').textContent='';$('patronMood').className='patronMood';
 $('patronBackdrop').classList.remove('hidden');lastTick=Date.now();return true;
}
function closePatronEncounter(){patronOpen=false;$('patronBackdrop').classList.add('hidden');save();lastTick=Date.now();if(!showNextOpeningNotice())render();}
function showNextOpeningNotice(){
 if(showdownOpen||branchOpen||summaryOpen||facilityNoticeOpen||welcomeOpen||cloudGateOpen||storyOpen)return false;
 if(s.battle&&isTurf()&&!incidentOpen&&!patronOpen){openShowdown({});return true;}
 const notice=s.facilityNotices?.[0];
 if(!notice){if(showStoryNotice())return true;if(showBranchDecision())return true;if(showIncident())return true;if(showPatronEncounter())return true;if(pendingCutscene){const lvl=pendingCutscene;pendingCutscene=null;showCutscene(lvl);return true;}return false;}
 const detail=FACILITY_TIPS[notice.id];if(!detail)return false;
 facilityNoticeOpen=true;
 $('facilityTitle').textContent=darkCenter()?`${roomName(notice.id)} ${notice.tier===2?'just expanded!':'is open for the night!'}`:(notice.tier===2?`${detail.title.replace(' is ready!',' just expanded!').replace(' is open for business!',' just expanded!')}`:detail.title);
 $('facilityNoticePicture').innerHTML=facilityIllustration(notice.id,notice.tier);
 $('facilityNoticeText').textContent=notice.tier===2?`You doubled your ${notice.id==='proshop'?'pro shop':notice.id} floor space! The improved room looks better, offers new possibilities, and may need another employee.`:detail.text;
 const tips=notice.tier===2?['⬆ Level 2 rooms stay in the same spot on the floor and serve more guests.','👥 Food counters, bars, and pro shops need TWO employees when expanded. The arcade needs none.',...detail.points.slice(0,2)]:detail.points;
 $('facilityNoticeTips').innerHTML=(darkCenter()&&notice.id==='arcade'?['🎰 The Casino Lounge uses fictional ticket-prize games; no real-money or virtual-money wagering.','🌒 More guests visit at night. Each game played after 6 PM adds a nightlife bonus.','🛡️ Protect this attraction with cameras and door security in Build.',...tips.slice(2)]:tips).map(t=>`<div>${esc(t)}</div>`).join('');
 $('facilityBackdrop').classList.remove('hidden');lastTick=Date.now();save();return true;
}
$('facilityContinue').onclick=()=>{if(!facilityNoticeOpen)return;facilityNoticeOpen=false;
 $('facilityBackdrop').classList.add('hidden');s.facilityNotices.shift();lastTick=Date.now();save();if(!showNextOpeningNotice())render();};
function closeSummary(startTomorrow=true){$('daySummaryBackdrop').classList.add('hidden');summaryOpen=false;
 if(startTomorrow&&s.hour===G.CLOSE)G.startNextDay(s);lastTick=Date.now();render();save();showNextOpeningNotice();}
// v1.08 closing report: a short register tape of the day, then what guests actually said
// (as quotes, not icon rows), then a to-do list for tomorrow with buttons that go straight there.
function splitFeedback(lines){const quotes=[],todo=[],notes=[];const seen=new Set();
 for(const raw of lines){const x=String(raw);if(seen.has(x))continue;seen.add(x);
  const q=x.match(/^Overheard ([^:]+):\s*[“"](.+)[”"]\s*$/);
  if(q){quotes.push({where:q[1].replace(/^on the /,'on the ').trim(),text:q[2]});continue;}
  if(/snack/i.test(x)&&/(could not be filled|ran out|sold out)/i.test(x)){todo.push({text:x,open:'snacks',label:'Restock snacks'});continue;}
  if(/bar|drink/i.test(x)&&/(ran out|restock|could not)/i.test(x)){todo.push({text:x,open:'bar',label:'Restock the bar'});continue;}
  if(/lanes? need service/i.test(x)){todo.push({text:x,open:'lanes',label:'Service lanes'});continue;}
  if(/walked out|stormed out/i.test(x)){todo.push({text:x,open:'benches',label:'Add benches'});continue;}
  notes.push(x);}
 return {quotes,todo,notes};}
function guestAvatar(seed){const shirts=['#ec9985','#c3a8e2','#8ed1bf','#a9cbed','#efcd83','#f2a0b4'],skins=['#F4CFA8','#E0A878','#B57A4E','#7B4C2E'];let h=0;for(const c of seed)h=(h*31+c.charCodeAt(0))>>>0;
 return `<span class="guestAvatar" aria-hidden="true" style="--shirt:${shirts[h%shirts.length]};--skin:${skins[(h>>3)%skins.length]}"></span>`;}
function veraTape(v){const d=v.end-v.start;return `<div class="tapeVera"><div class="tvHead"><span>Vera tonight</span><b>${v.start} → ${v.end}</b><em class="${d>0?'up':d<0?'down':''}">${d>0?'▲ +'+d:d<0?'▼ '+d:'±0'} · ${esc(v.tier)}</em></div>${(v.plays||[]).map(x=>`<p class="${x.foiled?'foiled':'landed'}"><span>${x.foiled?'🛡️':x.icon}</span><span><b>${esc(x.name)}${x.foiled?' — stopped':''}</b> ${esc(x.text)}</span></p>`).join('')||'<p class="quietVera">No moves from her people tonight. That never lasts.</p>'}<button class="mini" data-summary-tab="tournaments">Open the Turf</button></div>`;}
function openSummary(report){if(!report)return;summaryOpen=true;
 $('daySummaryTitle').textContent=`Week ${G.calendar(report.day).week} · ${G.calendar(report.day).weekday}`;
 const f=report.facilities||{snack:s.built.snack,bar:s.built.bar,arcade:s.built.arcade};
 const row=(label,items)=>{items=items.filter(Boolean);return items.length?`<div class="tapeRow"><span class="tapeLabel">${label}</span><div class="tapeItems">${items.join('')}</div></div>`:'';};
 const item=(n,label,cls='')=>`<span class="tapeItem ${cls}"><b>${esc(String(n))}</b> ${esc(label)}</span>`;
 const mood=report.happiness??s.happiness,md=report.happinessDelta||0;
 const {quotes,todo,notes}=splitFeedback(report.feedback||[]);
 $('daySummaryBody').innerHTML=`<div class="tapeTop"><div class="tapeNet"><small>${s.campaignStory?.path==='backalley'?'Tonight’s take':'Today’s take'}</small><strong class="${report.net>=0?'positive':'negative'}">${report.net>=0?'':'−'}${cash(Math.abs(report.net))}</strong><span>${cash(report.income||0)} in · ${cash(report.expenses||0)} out</span></div><div class="tapeMood mood-${mood>=78?'high':mood>=52?'mid':'low'}"><small>Guest mood</small><b>${mood}%</b><span>${md>=0?'▲':'▼'} ${Math.abs(md)} today</span></div></div>
 ${report.vera&&isTurf()?veraTape(report.vera):''}
 <div class="tape">${row('Guests',[item(report.arrivals||0,'visitors'),item(report.served||0,'bowled'),report.left?item(report.left,'walked out','bad'):'',report.walkIns?item(report.walkIns,'food & fun only'):''])}
 ${row('Sales',[f.snack?item(report.snackOrders||0,'snacks'):'',f.bar?item(report.barOrders||0,'drinks'):'',f.arcade?item(report.arcadePlays||0,'arcade plays'):'',(s.league.active||report.leagueHeld)?item(cash(report.leagueIncome||0),'league'):'',report.partyHeld?item(cash(report.partyIncome||0),'private party'):''])}
 ${row('Costs',[report.staffPay?item(cash(report.staffPay),'wages'):'',report.loanPayment?item(cash(report.loanPayment),'loan'):'',report.capex?item(cash(report.capex),'building'):'',report.marketingSpend?item(cash(report.marketingSpend),'ads'):''])}</div>
 <h3 class="summarySubtitle">Overheard tonight</h3>${quotes.length?`<div class="quotes">${quotes.slice(-3).map((q,i)=>`<figure class="quote">${guestAvatar(q.text)}<blockquote>${esc(q.text)}</blockquote><figcaption>a guest ${esc(q.where)}</figcaption></figure>`).join('')}</div>`:`<p class="quietNight">A quiet night. Nobody had anything memorable to say, which is its own kind of review.</p>`}
 ${todo.length?`<h3 class="summarySubtitle">For tomorrow</h3><ul class="todoList">${todo.map(t=>`<li><span>${esc(t.text)}</span><button class="mini" ${t.open?`data-summary-open="${t.open}"`:`data-summary-tab="${t.tab}"`}>${esc(t.label)}</button></li>`).join('')}</ul>`:''}
 ${notes.length?`<ul class="noteList">${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:''}`;
 renderOvernightRush();
 $('skipFutureSummaries').checked=skipSummaries;
 $('daySummaryBackdrop').classList.remove('hidden');$('summaryContinue').focus();}
const TUTORIAL_STEPS=[
 {target:'#hudStats',icon:'⏱️',title:'How game time works',body:'Time advances ONE game hour about every 5 seconds while Auto is on. Each day runs from 2 PM to 10 PM. Customers arrive, bowl, and spend money as hours pass. At 10 PM the closing report appears; construction and deliveries move forward by game days, not real-world days.',tip:'Settings → Game Clock can pause Auto, advance one hour manually, or finish the current day. You can take your time!'},
 {target:'#sceneDesk',icon:'🛎️',title:'Tap the front desk',body:'Set game and shoe prices, look back on your daily stats, and run advertising here. Everything on the alley floor is interactive!',tip:'Try the desk after this tour to see your first business decisions.'},
 {target:'#sceneLanes',icon:'🎳',title:'Your lanes need love',body:'Tap an empty lane spot to install a lane. Once customers bowl on it, the condition drops. Tap a lane to service it or install better hardwood, ball returns and scoring screens.',tip:'The Lanes & upgrades button above the lanes lists every lane.'},
 {target:'#sceneRoomGrid',icon:'🔨',title:'Build your own kind of alley',body:'Tap a faded spot on the floor to build it. Each shop’s panel has Menu Items, Pricing and Upgrades. You can start with snacks OR a bar, or something else entirely.',tip:'The building is yours. No snack-first rule.'},
 {target:'#openSettings',icon:'⚙️',title:'Time and saves are in Settings',body:'The alley runs from 2 PM to 10 PM. Visit Settings to pause the game, adjust time, back up saves and return to tutorials.',tip:'Explore the tabs! Each one gives you a one-time guided explanation.'}
];
const TAB_GUIDES={
 alley:['👀','Your living alley','Watch guests arrive and tap lanes, rooms and the front desk to manage them.'],
 regulars:['🤝','Your regulars','Six locals come back again and again. Talk with them when they drop by; each has a personality and remembers how you treat them.'],
 bowlers:['🎳','Meet your bowlers','Recruit and train bowlers for tournaments. Better skills and equipment make a stronger team.'],
 turf:['🌃','The Turf War','Vera’s grip rises a little every night and her people try something most nights. Every few nights she announces an operation with a countdown: meet it in a Showdown with up to three bowlers, or trust your defenses. Take districts on the map to push her back for good.'],
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
 const cutPath=artSrc(key);art.style.setProperty('--cutscene-image',cutPath?`url("${cutPath.replace(/"/g,'')}")`:'none');art.classList.toggle('hasArt',!!cutPath);
 $('cutsceneBuilding').lastElementChild.textContent=level===1?'YOUR FUTURE BOWLING ALLEY':G.venueName(s).toUpperCase();
 $('cutsceneContinue').textContent=intro?'Open your alley →':'Continue the adventure →';
 $('cutsceneBackdrop').classList.remove('hidden');save();}
function endCutscene(){$('cutsceneBackdrop').classList.add('hidden');cutsceneOpen=false;lastTick=Date.now();save();if(introCutscene&&s.startupPending)showStartup();else if(introCutscene&&!tutorialSeen)showTutorial();introCutscene=false;}
function checkClosing(result,oldLevel){if(result.dayEnded){saveNow();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('day-close');const newLevel=G.venueLevel(s);if(newLevel>lastAnnouncedLevel){pendingCutscene=newLevel;lastAnnouncedLevel=newLevel;}
 if(!skipSummaries)openSummary(s.lastDay);else if(!showNextOpeningNotice()&&!auto)toast(`Day ${s.day} closed. Next hour starts tomorrow.`);}
}
$('cutsceneContinue').onclick=endCutscene;$('cutsceneSkip').onclick=endCutscene;
$('summaryContinue').onclick=()=>closeSummary(true);
$('closeSummary').onclick=()=>closeSummary(true);
$('summaryDesk').onclick=()=>{closeSummary(true);openDrawer('desk');};
$('daySummaryBody').addEventListener('click',e=>{const b=e.target.closest('[data-summary-open],[data-summary-tab]');if(!b)return;e.stopPropagation();closeSummary(true);if(b.dataset.summaryOpen)openDrawer(b.dataset.summaryOpen);else gotoTab(b.dataset.summaryTab,true);});
$('skipFutureSummaries').onchange=e=>{skipSummaries=e.target.checked;$('skipSummarySetting').checked=skipSummaries;save();};
$('lowMotionSetting').onchange=e=>{lowMotion=e.target.checked;applyAccessibility();save();};
$('largeTextSetting').onchange=e=>{largeText=e.target.checked;applyAccessibility();save();};
$('skipSummarySetting').onchange=e=>{skipSummaries=e.target.checked;save();};
$('daySummaryBackdrop').onclick=e=>{if(e.target===$('daySummaryBackdrop'))closeSummary(true);};
function stepHour(manual=false){if(showdownOpen||welcomeOpen||summaryOpen||cutsceneOpen||tutorialOpen||startupOpen||facilityNoticeOpen||storyOpen||incidentOpen||patronOpen||s.startupPending)return;const oldLevel=G.venueLevel(s),result=G.tickHour(s);lastTick=Date.now();render();syncVisitors(result.events);save();checkClosing(result,oldLevel);
 if(manual&&!result.dayEnded)toast(`${G.formatHour(result.hour)}–${G.formatHour(result.hour+1)} · ${result.events.filter(x=>x.type==='arrival').length} group arrivals.`);
 if(drawer)renderDrawer();return result;}
function finishDay(){if(showdownOpen||welcomeOpen||summaryOpen||cutsceneOpen||tutorialOpen||startupOpen||facilityNoticeOpen||storyOpen||s.startupPending)return;const oldLevel=G.venueLevel(s);let count=0,result;do{result=G.tickHour(s);count++;}while(!result.dayEnded&&count<9);
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
function beginNewGame(){flushSave();storeRecovery();hideWelcome();closeDrawer();s=G.newGame();lastTick=Date.now();auto=true;tab='alley';buildSection='construction';skipSummaries=false;introSeen=false;tutorialSeen=false;summaryOpen=false;pendingCutscene=null;cutsceneOpen=false;tutorialOpen=false;layoutMode=false;movingRoom=null;lastAnnouncedLevel=1;
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
function useImportedSave(keepRecovery=true){flushSave();if(!importPending)return;if(keepRecovery)storeRecovery();s=importPending;importPending=null;hideWelcome();$('importConfirmBackdrop').classList.add('hidden');$('daySummaryBackdrop').classList.add('hidden');$('cutsceneBackdrop').classList.add('hidden');$('tutorialBackdrop').classList.add('hidden');summaryOpen=false;tutorialOpen=false;cutsceneOpen=false;introSeen=true;tutorialSeen=true;tab='alley';lastAnnouncedLevel=G.venueLevel(s);lastTick=Date.now();render();gotoTab('alley');syncVisitors([],true);save();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('import');if(s.hour===G.CLOSE&&!skipSummaries&&s.lastDay?.day===s.day)openSummary(s.lastDay);toast('Bowling alley imported!');}
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
 if(b.hasAttribute('data-hire-pitboss')){perform(G.hirePitBoss(s),'Pit Boss hired. Casino tables are open!');if(drawer==='arcade')renderDrawer();return;}
 if(b.dataset.casinoBet){const stake=Number(b.dataset.casinoBet);const result=G.casinoBet(s,stake);if(perform(result, result.ok?result.message:null))renderDrawer();return;}
 if(b.dataset.nightCounter){perform(G.prepareForRival(s),'Your crew prepared for the next attack.');return;}
 if(b.dataset.nightInsurance){perform(G.buyNightInsurance(s),'Night-shift recovery coverage activated.');return;}
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
 if(b.dataset.encounter){const [id,answer]=b.dataset.encounter.split(':');const said=b.textContent;const response=G.respondEncounter(s,id,answer);if(!response.ok){toast(response.reason,true);return;}
  const who=G.PATRON_PROFILES.find(x=>x.id===id)?.name||'They';save();
  $('patronSpeech').innerHTML=`<span class="youSaid">You: “${esc(said)}”</span>“${esc(response.reply)}”`;$('patronSpeech').classList.add('reply');
  $('patronMood').textContent=response.mood==='warmer'?`${who} warms up to you.`:response.mood==='cooler'?`${who} goes a little quiet.`:`${who} seems fine with that.`;$('patronMood').className='patronMood '+response.mood;
  $('patronActions').innerHTML='<button class="primary" data-encounter-done>Continue</button>';$('patronActions').querySelector('button').focus();return;}
 if(b.dataset.encounterDone!==undefined){closePatronEncounter();return;}
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
 if(b.dataset.expandRoom){perform(G.expandRoom(s,b.dataset.expandRoom),'Room expansion started!');return;}
 if(b.dataset.finance){selectedFinance=b.dataset.finance;startupPreview();return;}
 if(b.dataset.starterStyle){selectedStyle=b.dataset.starterStyle;startupPreview();return;}
 if(b.dataset.specialty){if(confirm('Make '+(G.SPECIALTIES.find(x=>x.id===b.dataset.specialty)?.name||'this choice')+' the identity of your first alley? This choice is permanent for this location.')){if(perform(G.chooseSpecialty(s,b.dataset.specialty),'Your alley has found its specialty!')){if(cloudMode&&cloudSaveSignal)cloudSaveSignal('specialty');}}return;}
 if(b.dataset.buyLand!==undefined){perform(G.buyLand(s),'The neighbors are selling! Four new lanes coming soon.');return;}
 if(b.dataset.rush){const [kind,id]=b.dataset.rush.split(':');const j=s.construction.find(x=>x.kind===kind&&x.id===id);if(!j)return;const cost=G.rushCost(j);if(confirm(`Bring in the overnight crew for ${j.title}? Pay ${cash(cost)} to finish it now?`)){if(perform(G.rushConstruction(s,kind,id),'Construction rushed!')){renderOvernightRush();if(cloudMode&&cloudSaveSignal)cloudSaveSignal('rush');}}return;}

 
 if(b.dataset.hire){perform(G.hireEmployee(s,b.dataset.hire),'New hire! Somebody tell the pins.');return;}
 if(b.dataset.wage){const [id,d]=b.dataset.wage.split(':');const e=s.employees.find(x=>x.id===Number(id));if(e)perform(G.setWage(s,id,e.wage+Number(d)));return;}
 if(b.dataset.staffSpecialty){const [id,kind]=b.dataset.staffSpecialty.split(':');perform(G.specializeEmployee(s,id,kind),'Professional specialty selected!');return;}
 if(b.dataset.equip){const [dept,star]=b.dataset.equip.split(':');perform(G.buyDepartmentEquipment(s,dept,Number(star)),'Department equipment installed.');return;}
 if(b.dataset.fireStaff){if(confirm('Dismiss this employee? Their position will become vacant, and you can hire a replacement.'))perform(G.fireEmployee(s,b.dataset.fireStaff),'Employee dismissed.');return;}
 if(b.dataset.districtLeague){perform(G.legacyLeague(s,b.dataset.districtLeague),'District league match recorded.');return;}
 if(b.dataset.districtFinal){const r=G.legacyDistrictFinal(s,b.dataset.districtFinal);perform(r,r.ok?(r.won?'District championship won!':'Championship complete — improve your team and try again.'):'');return;}
 if(b.dataset.runCircuit){const r=G.runLeagueCircuit(s,b.dataset.runCircuit);perform(r,r.ok?(r.won?'🏆 Bracket champions!':'Your team was eliminated. Train and try again.'):'');return;}
 if(b.dataset.staffConcern){perform(G.resolveStaffConcern(s,b.dataset.staffConcern),'Staff concern resolved.');return;}
 if(b.dataset.firstFrame!==undefined){const result=G.firstFrame(s,$('fAngle').value,$('fSpin').value,$('fPower').value);perform(result,result.ok?`Maya knocked down ${result.knocked} pins!`:null);return;}
 if(b.dataset.crew){const [id,enabled]=b.dataset.crew.split(':');perform(G.recruitCrew(s,id,enabled==='1'),'Crew assignment updated');return;}
 if(b.dataset.showdownDistrict){openShowdown({district:b.dataset.showdownDistrict});return;}
 if(b.dataset.showdownOp){openShowdown({opId:b.dataset.showdownOp});return;}
 if(b.dataset.patch){perform(G.patchUp(s,b.dataset.patch),'Doc Ramos patched them up.');return;}
 if(b.dataset.lookout!==undefined){perform(G.confrontLookout(s),'Your doorman walked the lookout off the block.');return;}
 if(b.dataset.scrubTag){perform(G.scrubTag(s,b.dataset.scrubTag),'Painted over. Vera’s mark is gone.');return;}
 if(b.dataset.incidentShowdown){const id=b.dataset.incidentShowdown;incidentOpen=false;$('incidentBackdrop').classList.add('hidden');s.eventQueue.shift();save();openShowdown({opId:id});return;}
 if(b.dataset.incidentTurf!==undefined){closeIncident();gotoTab('tournaments');return;}
 if(b.dataset.trainStaff){perform(G.trainEmployee(s,b.dataset.trainStaff),'Employee leveled up!');return;}
 if(b.dataset.threshold){perform(G.setStockThreshold(s,s.lowStockThreshold+Number(b.dataset.threshold)),'Low-stock trigger adjusted.');return;}
 if(b.dataset.tab){gotoTab(b.dataset.tab,true);return;}
 if(b.dataset.open){openDrawer(b.dataset.open);return;}
 if(b.dataset.drawerTab){drawerTabs[drawer]=b.dataset.drawerTab;renderDrawer();$('drawerBody').scrollTop=0;return;}
 if(b.dataset.arcadePrice){const [id,d]=b.dataset.arcadePrice.split(':');perform(G.setArcadePrice(s,id,+d));return;}
 if(b.dataset.attractionFee){const [id,d]=b.dataset.attractionFee.split(':');perform(G.setAttractionFee(s,id,+d));return;}
 if(b.dataset.shopPrice){perform(G.setShopPrice(s,+b.dataset.shopPrice));return;}
 if(b.dataset.deskJump){$(b.dataset.deskJump)?.scrollIntoView({block:'start',behavior:lowMotion?'auto':'smooth'});return;}
 if(b.dataset.buildSpot){const id=b.dataset.buildSpot,info=roomInfo(id);if(s.cash<info.cost){toast(`${info.name} costs ${cash(info.cost)}. You have ${cash(s.cash)}.`,true);return;}if(confirm(`Build the ${info.name} for ${cash(info.cost)}? It opens in ${info.days} game day${info.days===1?'':'s'}.`))perform(G.build(s,id),info.name+' construction started!');return;}
 if(b.dataset.buyWing){const cost=G.nextExpansionCost(s);if(G.lanes(s)+G.pendingLanes(s)<G.laneCapacity(s)){toast(`Open all ${G.laneCapacity(s)} lanes before Wing ${b.dataset.buyWing}.`,true);return;}if(s.cash<cost){toast(`Wing ${b.dataset.buyWing} costs ${cash(cost)}. You have ${cash(s.cash)}.`,true);return;}if(confirm(`Open Wing ${b.dataset.buyWing} for ${cash(cost)}? Construction takes a few game days, then new lane spots and attractions unlock.`))perform(G.buyLand(s),'Wing '+b.dataset.buyWing+' construction started!');return;}
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
setInterval(()=>{const now=Date.now();if(auto&&!document.hidden&&!showdownOpen&&!cloudGateOpen&&!welcomeOpen&&!summaryOpen&&!cutsceneOpen&&!tutorialOpen&&!startupOpen&&!facilityNoticeOpen&&!incidentOpen&&!patronOpen&&!storyOpen&&!s.startupPending&&now-lastTick>=MS_HOUR){
 try{const lv=G.venueLevel(s),result=G.tickHour(s);lastTick=now;render();syncVisitors(result.events);if(drawer)renderDrawer();save();checkClosing(result,lv);}
 catch(e){auto=false;lastTick=Date.now();console.error('Game clock paused to protect save',e);toast('Clock paused to protect your game. Open Settings to export a backup.',true);saveNow();}
}},250);
render();gotoTab(tab);syncVisitors([],true);
addEventListener('pagehide',flushSave);document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();else lastTick=Math.max(lastTick,Date.now()-MS_HOUR);});
// Cloud bootstrapping decides when to unlock the clock, avoiding running the game
// before login and before the cloud/local save choice is complete.
function unlockDemo(){flushSave();
 cloudMode=false;KEY='gutter-to-glory-v091-demo';BACKUP='gutter-to-glory-backup-v091-demo';
 const d=candidateState(safeRead(KEY));if(d){s=d.state;hadSavedGame=true;introSeen=true;tutorialSeen=true;}
 cloudGateOpen=false;lastAnnouncedLevel=G.venueLevel(s);
 if(hadSavedGame||hadBrokenSave){showWelcome();}else{welcomeOpen=false;render();gotoTab('alley');introSeen=true;showStoryNotice();}
}
function readBrowserCandidate(uid){
 const saved=candidateState(safeRead('gutter-to-glory-v091-user-'+uid));
 return saved?{...saved,source:'this account on this browser'}:hadSavedGame?{state:s,lastTick,source:'v0.9 browser save'}:null;
}
function unlockCloud(uid,snapshot,source='cloud'){flushSave();
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
function lockCloud(){flushSave();cloudGateOpen=true;welcomeOpen=true;cloudMode=false;closeDrawer();
 for(const id of ['welcomeBackdrop','daySummaryBackdrop','cutsceneBackdrop','tutorialBackdrop','facilityBackdrop','storyBackdrop','incidentBackdrop','patronBackdrop','branchBackdrop'])$(id).classList.add('hidden');facilityNoticeOpen=false;
 summaryOpen=false;cutsceneOpen=false;tutorialOpen=false;s=G.newGame();lastTick=Date.now();render();}
window.GTGApp={
 unlockDemo,unlockCloud,lockCloud,readBrowserCandidate,
 validate(snapshot){try{const v=G.migrate(snapshot?.state||snapshot);return !!v&&G.checkState(v);}catch{return false;}},
 snapshot(){return {state:structuredClone(s),lastTick:Date.now()};},
 registerCloudSave(fn){cloudSaveSignal=fn;},
 freshSnapshot(){return JSON.parse(JSON.stringify({state:G.newGame(),lastTick:Date.now()}));},
 isDevelopmentPreview(){return devPreviewMode;},
 notify(message,error=false){toast(message,error);},
 getBrief(snapshot){const v=G.migrate(snapshot.state||snapshot);return `Week ${G.calendar(v.day).week} · ${G.calendar(v.day).weekday} · Level ${G.venueLevel(v)} · ${cash(v.cash)}`;},
 getLevel(){return G.venueLevel(s);},getDay(){return s.day;}
};
})();
