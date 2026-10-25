from pathlib import Path
from playwright.sync_api import sync_playwright
P=Path('/mnt/data/From_Gutter_to_Glory_v0.7')
html=(P.parent/'From_Gutter_to_Glory_Playable_v0.7.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    errors=[]
    pg=browser.new_page(viewport={'width':1365,'height':900});pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.set_content(html,wait_until='load')
    print('intro',pg.locator('#cutsceneBackdrop').is_visible(),'nav',pg.locator('nav.nav button').count(),'staff',pg.locator('#staffRoles').inner_text()[:70],'clock',pg.locator('#gameClock').inner_text())
    if pg.locator('#cutsceneBackdrop').is_visible():pg.locator('#cutsceneSkip').click()
    pg.locator('[data-tab="manage"]').first.click()
    pg.locator('[data-build-section="lanes"]').click(); print('lanes?',pg.locator('#laneTiles').is_visible())
    pg.locator('[data-build-section="style"]').click();print('style?',pg.locator('.makeoverPanel').is_visible())
    pg.locator('[data-tab="employees"]').first.click();print('staff?',pg.locator('#staffRoles').is_visible(),pg.locator('#staffRoles .staffRole').count())
    pg.locator('[data-tab="goals"]').first.click();print('goals?',pg.locator('#nextGoal').is_visible())
    pg.locator('[data-tab="alley"]').first.click();pg.locator('#endDay').click()
    print('report?',pg.locator('#daySummaryBackdrop').is_visible(),pg.locator('#daySummaryBody').inner_text()[:400])
    pg.locator('#summaryContinue').click();print('next',pg.locator('#gameClock').inner_text())
    pg.screenshot(path=str(P/'v07_desktop.png'),full_page=True)
    m=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1);m.on('pageerror',lambda e:errors.append('mobile:'+str(e)));m.set_content(html,wait_until='load');
    if m.locator('#cutsceneBackdrop').is_visible():m.locator('#cutsceneSkip').click()
    print('mobile overflow',m.evaluate('document.documentElement.scrollWidth-window.innerWidth'))
    m.screenshot(path=str(P/'v07_mobile.png'),full_page=True)
    print('page errors',errors)
    browser.close()
