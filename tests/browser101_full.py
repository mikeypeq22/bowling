from playwright.sync_api import sync_playwright
from pathlib import Path
h=Path('/mnt/data/From_Gutter_to_Glory_Playable_v1.01.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w in (390,1280):
  page=b.new_page(viewport={'width':w,'height':844});errs=[]
  page.on('pageerror',lambda e:errs.append(str(e)))
  page.on('dialog',lambda dialog:dialog.accept())
  page.set_content(h,wait_until='domcontentloaded');page.wait_for_timeout(300)
  page.evaluate("""() => {for(const id of ['welcomeBackdrop','cloudGate','storyBackdrop','startupBackdrop','tutorialBackdrop','facilityBackdrop','daySummaryBackdrop','branchBackdrop','incidentBackdrop','patronBackdrop','cutsceneBackdrop'])document.getElementById(id)?.classList.add('hidden');}""")
  page.locator('#openSettings').click(timeout=5000)
  page.locator('[data-dev-scenario="backalley"]').click(timeout=5000)
  page.wait_for_timeout(250)
  print('mode',w,'settings dark?',page.locator('body.noirMode').count(), 'story dark?',page.locator('#storyPanel').inner_text()[:150],'errors',errs[:3])
  assert page.locator('body.noirMode').count()==1
  assert page.locator('#sceneSecurity').count()==1
  page.screenshot(path=f'/mnt/data/From_Gutter_to_Glory_v1.01/v101_story_{w}.png',full_page=True)
  page.locator('[data-tab="manage"]').first.click(timeout=5000)
  page.wait_for_timeout(150)
  print('nightBuild?',page.locator('#nightBuildPanel').is_visible(),'defense buttons',page.locator('#nightBuildPanel [data-night-defense]').count())
  assert page.locator('#nightBuildPanel').is_visible()
  page.locator('#nightBuildPanel [data-night-defense="cameras"]').click(timeout=5000)
  page.wait_for_timeout(200)
  print('camera level',page.locator('#nightBuildPanel').inner_text()[:160], 'errors',errs[:3])
  assert 'Level 1/3' in page.locator('#nightBuildPanel').inner_text()
  page.screenshot(path=f'/mnt/data/From_Gutter_to_Glory_v1.01/v101_security_{w}.png',full_page=True)
  page.locator('[data-tab="alley"]').first.click(timeout=5000)
  print('casino on scene',page.locator('#sceneRoomGrid').inner_text()[:100])
  assert 'Casino Lounge' in page.locator('#sceneRoomGrid').inner_text()
  assert not errs,errs
  page.close()
 b.close()
