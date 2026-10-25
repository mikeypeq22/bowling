from pathlib import Path
from playwright.sync_api import sync_playwright
P=Path(__file__).parent
html=(P.parent/'From_Gutter_to_Glory_Playable_v0.7.html').read_text()
rich=html.replace('let s=G.newGame(),auto=true', '''let s=(()=>{const a=G.newGame(5105);a.cash=22000;a.rep=70;a.totalServed=260;a.built={roof:true,snack:true,bar:true,proshop:true,arcade:true};a.lanes=Array.from({length:6},(_,i)=>({id:i+1,condition:97}));a.roomPlacements={snack:{x:0,y:0},bar:{x:2,y:0},proshop:{x:0,y:1},arcade:{x:2,y:1}};a.snackStock.soda=20;a.snackStock.popcorn=19;a.barStockById.beer=30;a.barStockById.wine=20;a.barStock=50;a.arcadeMachines.pinball=true;return a})(),auto=true''')
assert rich!=html
rich=rich.replace('render();gotoTab(tab);syncVisitors([],true);','render();gotoTab(tab);syncVisitors([],true);window.__debug={state:()=>s,paint:render,visitors:syncVisitors};')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 errors=[]
 fresh=b.new_page(viewport={'width':1280,'height':850});fresh.on('pageerror',lambda e:errors.append('fresh:'+str(e)))
 fresh.set_content(html,wait_until='load');assert fresh.locator('#cutsceneBackdrop').is_visible();fresh.locator('#cutsceneSkip').click()
 assert fresh.locator('nav.nav button').count()==7
 fresh.locator('#endDay').click();assert fresh.locator('#daySummaryBackdrop').is_visible()
 text=fresh.locator('#daySummaryBody').inner_text()
 for notyet in ['Snack orders','Bar drinks','Arcade plays','League revenue']:
  assert notyet not in text,notyet
 assert 'Overheard at the alley' in text
 fresh.locator('#summaryContinue').click();assert 'Tuesday' in fresh.locator('#gameClock').inner_text()
 fresh.locator('[data-tab="manage"]').first.click()
 for id in ['lanes','style','layout','construction']:
  fresh.locator(f'[data-build-section="{id}"]').click()
  assert fresh.locator(f'[data-section="{id}"]').is_visible()
 fresh.locator('[data-tab="employees"]').first.click()
 assert '🔒 Locked' in fresh.locator('#staffRoles').inner_text()
 assert fresh.locator('[data-hire="bar"]').is_disabled()
 print('Fresh: clock, report filtering, seven tabs, build sections and locked jobs PASS')
 r=b.new_page(viewport={'width':1280,'height':900});r.on('pageerror',lambda e:errors.append('rich:'+str(e)))
 r.set_content(rich,wait_until='load');r.locator('#cutsceneSkip').click()
 r.locator('#sceneRoomGrid [data-open="bar"]').click();assert 'Bar CLOSED' in r.locator('#drawerBody').inner_text();r.locator('#closeDrawer').click()
 r.locator('[data-tab="employees"]').first.click()
 for role in ['bar','snack','proshop']:
  r.locator(f'[data-hire="{role}"]').click()
  assert r.evaluate(f'window.__debug.state().employees.some(x=>x.role==="{role}")')
 r.locator('[data-hire="stocker"]').click()
 r.locator('[data-threshold="1"]').click();assert r.evaluate('window.__debug.state().lowStockThreshold')==4
 r.locator('[data-wage="1:1"]').click();assert r.evaluate('window.__debug.state().employees[0].wage')==15
 r.locator('[data-train-staff="1"]').click();assert r.evaluate('window.__debug.state().employees[0].skill')==2
 r.locator('[data-tab="alley"]').first.click()
 r.locator('#sceneRoomGrid [data-open="snacks"]').click()
 stock=r.evaluate('window.__debug.state().snackStock.soda')
 r.locator('[data-restock="soda"]').click()
 assert r.evaluate('window.__debug.state().snackStock.soda')==stock
 assert r.evaluate('window.__debug.state().deliveries.some(x=>x.id==="soda"&&x.amount===10)')
 assert 'arriving tomorrow' in r.locator('#drawerBody').inner_text()
 r.locator('#closeDrawer').click()
 r.locator('#sceneRoomGrid [data-open="bar"]').click();r.locator('[data-drink-restock="beer"]').click()
 assert r.evaluate('window.__debug.state().deliveries.some(x=>x.id==="beer")')
 r.locator('#closeDrawer').click()
 r.locator('#endDay').click()
 assert r.locator('#daySummaryBackdrop').is_visible()
 assert 'Staff wages' in r.locator('#daySummaryBody').inner_text()
 closeSoda=r.evaluate('window.__debug.state().snackStock.soda')
 r.locator('#summaryContinue').click()
 assert r.evaluate('window.__debug.state().snackStock.soda')==closeSoda+10
 assert not r.evaluate('window.__debug.state().deliveries.some(x=>x.id==="soda")')
 print('Rich: hiring, happiness training, wage, threshold and next-morning deliveries PASS')
 # Layout + move a real bar; next visitors should stop at the actual new position
 r.locator('[data-tab="manage"]').first.click();r.locator('[data-build-section="layout"]').click();r.locator('#toggleLayout').click()
 r.locator('[data-room-move="bar"]').first.click();r.locator('[data-place-room="4:0"]').click()
 r.locator('#exitLayout').click()
 assert 'grid-column:5 ' in r.locator('#sceneRoomGrid [data-open="bar"]').get_attribute('style')
 r.evaluate("""()=>{const s=window.__debug.state();s.sceneGroups=[{id:911,name:'Mina',size:3,location:'lane3',kind:'bowling'}];window.__debug.paint();const el=document.createElement('style');el.innerHTML='#visitorLayer .visitor{transition-duration:.05s!important}';document.head.append(el);window.__debug.visitors([{type:'arrival',partyId:911},{type:'bar',partyId:911}],false)}""")
 r.wait_for_timeout(1170)
 vb=r.locator('#visitorLayer [data-party="911"]').bounding_box();room=r.locator('#sceneRoomGrid [data-open="bar"]').bounding_box()
 assert abs((vb['x']+vb['width']/2)-(room['x']+room['width']/2))<28,(vb,room)
 r.wait_for_timeout(910)
 vb=r.locator('#visitorLayer [data-party="911"]').bounding_box();lane=r.locator('#sceneLanes [data-open="lane3"]').bounding_box()
 assert abs((vb['x']+vb['width']/2)-(lane['x']+lane['width']/2))<28,(vb,lane)
 print('Pathfinding: moved bar → real lane 3 PASS')
 # Full league reservation test, then advance to later that evening
 r.evaluate("""()=>{const s=window.__debug.state();s.day=4;s.hour=18;s.league.active=true;s.league.season=1;s.today=window.BowlingCore.newGame(222).today;s.today.day=4;s.sceneGroups=[];window.__debug.paint();}""")
 assert r.locator('.laneScene .laneStatus').all_inner_texts().count('🏆 League')==6
 r.locator('#endDay').click();assert r.locator('#daySummaryBackdrop').is_visible()
 assert r.evaluate('window.__debug.state().today.leagueIncome')>0
 assert r.evaluate('window.__debug.state().today.leagueHours')==2
 print('League: all six lanes for two evening hours PASS')
 r.screenshot(path=str(P/'v07_desktop.png'),full_page=True)
 m=b.new_page(viewport={'width':390,'height':844});m.on('pageerror',lambda e:errors.append('mobile:'+str(e)));m.set_content(rich,wait_until='load');m.locator('#cutsceneSkip').click()
 assert m.evaluate('document.documentElement.scrollWidth-window.innerWidth')<=0
 m.locator('[data-tab="employees"]').first.click();assert m.locator('#staffRoles .staffRole').count()==4
 m.locator('[data-tab="goals"]').first.click();assert m.locator('#nextGoal').is_visible()
 m.screenshot(path=str(P/'v07_mobile.png'),full_page=True)
 print('Mobile: no overflow, staff and goals tabs PASS')
 assert not errors,errors
 print('BROWSER ERRORS: none')
 b.close()
