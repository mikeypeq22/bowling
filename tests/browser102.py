from playwright.sync_api import sync_playwright
from pathlib import Path
h=Path('/mnt/data/From_Gutter_to_Glory_Playable_v1.02.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (320,390,1280):
  page=browser.new_page(viewport={'width':width,'height':900});errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.on('dialog',lambda d:d.accept())
  page.set_content(h,wait_until='load',timeout=30000);page.wait_for_timeout(250)
  # Cover UI under old startup overlays; dev shortcut is designed for both fresh and active games.
  page.evaluate("""()=>{for(const id of ['welcomeBackdrop','cloudGate','storyBackdrop','startupBackdrop','tutorialBackdrop','facilityBackdrop','daySummaryBackdrop','branchBackdrop','incidentBackdrop','patronBackdrop','cutsceneBackdrop'])document.getElementById(id)?.classList.add('hidden')}""")
  page.locator('#openSettings').click(timeout=5000)
  assert page.locator('[data-dev-scenario="backalley"]').count()==1
  page.locator('[data-dev-scenario="backalley"]').click(timeout=5000)
  page.wait_for_timeout(100)
  assert page.locator('body.noirMode').count()==1,('no dark branch',errors)
  assert 'hidden' not in (page.locator('#devPreviewAlert').get_attribute('class') or '')
  assert page.locator('#sceneRoomGrid').is_visible() is True
  assert 'Casino Lounge' in page.locator('#sceneRoomGrid').inner_text()
  assert 'Gus' in page.locator('#venueName').inner_text()
  page.locator('#sceneRoomGrid [data-open="arcade"]').first.click(timeout=5000)
  assert page.locator('.casinoWagers button').count()==4
  page.locator('[data-hire-pitboss]').click(timeout=5000)
  assert "Pit Boss Hired" in page.locator('.casinoBoss').inner_text()
  casino_before=page.locator('.casinoLast').inner_text()
  page.locator('[data-casino-bet="25"]').click(timeout=5000)
  page.wait_for_timeout(80)
  assert page.locator('.casinoLast').inner_text()!=casino_before
  page.locator('#closeDrawer').click(timeout=5000)
  page.locator('[data-tab="manage"]').first.click(timeout=5000)
  assert page.locator('#nightBuildPanel').is_visible()
  assert 'Night operations' in page.locator('#nightBuildPanel').inner_text()
  page.locator('#nightBuildPanel [data-night-counter]').click(timeout=5000)
  page.wait_for_timeout(80)
  assert 'Prepared through Day' in page.locator('#nightBuildPanel').inner_text()
  page.locator('#openSettings').click(timeout=5000)
  page.locator('#devExitPreview').click(timeout=5000)
  assert page.locator('body.noirMode').count()==0
  assert 'hidden' in (page.locator('#devPreviewAlert').get_attribute('class') or '')
  assert not errors,errors
  print('BROWSER OK',width,'Casino, preview, preparedness, exit')
  if width==390:
   page.locator('[data-dev-scenario="backalley"]').click(timeout=5000)
   page.wait_for_timeout(100)
   page.screenshot(path='/mnt/data/From_Gutter_to_Glory_v1.02/v102_dark_390.png',full_page=True)
  page.close()
 browser.close()
