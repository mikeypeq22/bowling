from playwright.sync_api import sync_playwright
from pathlib import Path
import sys
html=Path('/mnt/data/From_Gutter_to_Glory_Playable_v1.01.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [390,1280]:
  page=browser.new_page(viewport={'width':width,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.set_content(html,wait_until='domcontentloaded',timeout=30000)
   page.wait_for_timeout(500)
   print('initial',width,'title',page.title(),'error',errors[:3])
   page.screenshot(path=f'/mnt/data/From_Gutter_to_Glory_v1.01/v101_open_{width}.png')
   page.evaluate('''() => {
      window.GTGApp.unlockDemo();
      document.getElementById('cloudGate').classList.add('hidden');
      for(const a of ['welcomeBackdrop','startupBackdrop','storyBackdrop','tutorialBackdrop','daySummaryBackdrop','facilityBackdrop','cutsceneBackdrop','incidentBackdrop','patronBackdrop','branchBackdrop'])document.getElementById(a)?.classList.add('hidden');
   }''')
   page.wait_for_timeout(350)
   print('has security?',page.locator('#sceneSecurity').count(),'has nightbuild?',page.locator('#nightBuildPanel').count())
   page.screenshot(path=f'/mnt/data/From_Gutter_to_Glory_v1.01/v101_current_{width}.png')
  except Exception as e:print('ERROR',str(e)[:550])
  page.close()
 browser.close()
