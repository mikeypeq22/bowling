from pathlib import Path
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading, os, json
P=Path(__file__).parent
html=(P.parent/"From_Gutter_to_Glory_Playable_v0.8.html").read_text()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 errors=[]
 for width,height in [(320,740),(375,812),(390,844),(430,932),(768,930),(1280,850)]:
  ctx=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
  page=ctx.new_page();page.on('pageerror',lambda e,w=width:errors.append((w,str(e))))
  page.set_content(html,wait_until='load')
  assert page.locator('#cutsceneBackdrop').is_visible(),(width,'intro cutscene')
  page.locator('#cutsceneSkip').click()
  assert page.locator('#tutorialBackdrop').is_visible(),(width,'tutorial')
  assert page.locator('#tutorialTitle').inner_text()=='Everything is tappable!'
  # time should not progress during tutorial on fresh game
  assert page.locator('#hudStats').inner_text().find('W1')!=-1
  for step in [1,2,3]:
   page.locator('#tutorialNext').click()
   assert page.locator('#tutorialStepLabel').inner_text().startswith(str(step+1)),width
  page.locator('#tutorialNext').click()
  assert page.locator('#tutorialBackdrop').is_hidden()
  assert page.locator('#venueName').inner_text()=='Your Bowling Alley'
  assert 'LEVEL 1' in page.locator('#levelLabel').inner_text()
  assert page.locator('#hudStats .datePill').is_visible()
  assert page.locator('#hudStats .moneyPill').is_visible()
  assert page.locator('nav.nav button').count()==7
  assert page.locator('#todayArrivals').count()==0
  assert page.locator('#timeProgress').count()==0
  assert page.locator('.alleyActions button').count()==3
  widthOverflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
  assert widthOverflow<=1,(width,'overflow',widthOverflow)
  before=page.locator('.hud').bounding_box()
  page.evaluate('window.scrollTo(0,800)');page.wait_for_timeout(120)
  after=page.locator('.hud').bounding_box()
  assert abs(after['y'])<3,(width,'sticky header',after)
  assert page.locator('nav.nav').is_visible()
  # nav interaction, no lost toolbar
  page.locator('[data-tab="goals"]').first.click(force=True)
  assert page.locator('#goals').is_visible()
  assert page.locator('#nextGoal').is_visible()
  page.locator('[data-tab="manage"]').first.click(force=True)
  assert page.locator('#manage').is_visible()
  page.locator('[data-build-section="lanes"]').click()
  assert page.locator('#laneTiles').is_visible()
  page.locator('[data-tab="alley"]').first.click(force=True)
  page.locator('#openTutorial').click()
  assert page.locator('#tutorialBackdrop').is_visible()
  page.locator('#tutorialSkip').click()
  assert page.locator('#tutorialBackdrop').is_hidden()
  # summary unchanged
  page.locator('#endDay').click(force=True)
  assert page.locator('#daySummaryBackdrop').is_visible(),(width,'summary')
  text=page.locator('#daySummaryBody').inner_text()
  for item in ['Snack orders','Bar drinks','Arcade plays','League revenue']:
   assert item not in text,(width,item)
  page.locator('#summaryContinue').click()
  assert 'Tue' in page.locator('#hudStats .datePill').inner_text(),page.locator('#hudStats .datePill').inner_text()
  if width in [390,1280]:
   page.locator('#alley').scroll_into_view_if_needed();page.screenshot(path=str(P/f'v08_{width}.png'),full_page=False)
  print('PASS',width,'sticky header; tutorial; tabs; day report; no horizontal overflow')
  ctx.close()
 # Test migrating save from v0.7 with existing UI; tutorial does not unexpectedly interrupt
 ctx=b.new_context(viewport={'width':390,'height':844})
 page=ctx.new_page();page.evaluate("""()=>{const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(data,k)?data[k]:null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""");page.set_content(html);page.locator('#cutsceneSkip').click();page.locator('#tutorialSkip').click()
 page.evaluate("""()=>{const ui={auto:false,tab:'bowlers',buildSection:'lanes',skipSummaries:true,introSeen:true};localStorage.removeItem('gutter-to-glory-ui-v08');localStorage.setItem('gutter-to-glory-ui-v07',JSON.stringify(ui));}""")
 page.set_content(html)
 assert page.locator('#tutorialBackdrop').is_hidden()
 assert page.locator('#bowlers').is_visible()
 assert page.locator('#hudStats .moneyPill').is_visible()
 print('PASS saved-game UI migration')
 ctx.close();b.close()
 assert not errors,errors
 print('Browser JavaScript errors: none')

