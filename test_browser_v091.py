from pathlib import Path
from playwright.sync_api import sync_playwright
P=Path(__file__).parent
html=(P.parent/'From_Gutter_to_Glory_Playable_v0.91.html').read_text()
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(320,740),(390,844),(768,900),(1280,850)]:
  ctx=b.new_context(viewport={'width':w,'height':h});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(d,k)?d[k]:null,setItem:(k,v)=>{d[k]=String(v)},removeItem:k=>{delete d[k]},clear:()=>{Object.keys(d).forEach(k=>delete d[k])}}});window.__readStorage=()=>({...d});}''');page.set_content(html,wait_until='load');page.locator('#cloudLocalDemo').wait_for()
  assert page.locator('#cloudGate').is_visible()
  page.locator('#cloudLocalDemo').click()
  assert page.locator('#cloudGate').is_hidden()
  assert page.locator('#cutsceneBackdrop').is_visible()
  page.locator('#cutsceneSkip').click();page.locator('#tutorialSkip').click()
  page.locator('#openSettings').click()
  assert page.locator('#playerProfilePanel').is_visible()
  assert page.locator('#cloudSaveNow').is_hidden()
  page.locator('#toggleAuto').click();page.locator('#nextHour').click()
  assert '3:00 PM' in page.locator('#hudStats').inner_text()
  page.locator('#save').click();assert page.evaluate('window.__readStorage()["gutter-to-glory-v091-demo"]')
  # Re-render with same localStorage backing (set_content keeps document origin)
  page.set_content(html,wait_until='load');page.locator('#cloudLocalDemo').click()
  assert page.locator('#welcomeBackdrop').is_visible(),'Reload should ask continue'
  page.locator('#welcomeContinue').click();assert '3:00 PM' in page.locator('#hudStats').inner_text()
  assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2
  assert not errors,(w,errors)
  if w==390:page.screenshot(path=str(P/'mobile_preview_v091.png'),full_page=False)
  print('PASS guest',w,'reopen settings clock and local save')
  ctx.close()
 b.close()
