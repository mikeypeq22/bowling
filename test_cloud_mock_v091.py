from pathlib import Path
from playwright.sync_api import sync_playwright
import re
P=Path(__file__).parent
html=(P.parent/'From_Gutter_to_Glory_Playable_v0.91.html').read_text()
html=html.replace('window.GTG_FIREBASE_CONFIG = null;', 'window.GTG_FIREBASE_CONFIG = {apiKey:"TEST",projectId:"test",authDomain:"test.firebaseapp.com",appId:"1:test:web:123"};')
mock='''
<script>
window.__firebaseDoc=null;
window.__fakeUser=null;
window.FAKE={
 firebase:{initializeApp:cfg=>({})},
 authorization:{getAuth:()=>({}),browserLocalPersistence:{},setPersistence:async()=>{},GoogleAuthProvider:class {},
  onAuthStateChanged:(auth,cb)=>{window.__authCb=cb; Promise.resolve().then(()=>cb(window.__fakeUser));},
  signInWithPopup:async()=>{window.__fakeUser={uid:'user42',displayName:'Alex Bowler',email:'alex@example.net'};await window.__authCb(window.__fakeUser);return{user:window.__fakeUser};},
  signOut:async()=>{window.__fakeUser=null;await window.__authCb(null)}},
 firestore:{getFirestore:()=>({}),doc:(db,col,uid)=>({col,uid}),getDocFromServer:async()=>({exists:()=>!!window.__firebaseDoc,data:()=>window.__firebaseDoc}),
  serverTimestamp:()=>Date.now(),
  runTransaction:async(db,cb)=>{let pending;const tx={get:async()=>({exists:()=>!!window.__firebaseDoc,data:()=>window.__firebaseDoc}),set:(ref,d)=>{pending=d}};const result=await cb(tx);window.__firebaseDoc=pending;return result;}}
};
</script>
'''
html=html.replace('<script>\n;(async()=>{', mock+'<script>\n;(async()=>{')
pattern=r"  const version='12\.5\.0';\n  const \[firebase,authorization,firestore\]=await Promise\.all\(\[.*?\n  \]\);"
html,n=re.subn(pattern,'  const {firebase,authorization,firestore}=window.FAKE;',html,flags=re.S);assert n==1,n
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=b.new_context(viewport={'width':390,'height':844});p=context.new_page()
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.evaluate('''() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k],clear:()=>{for(const k in d)delete d[k]}}});window.__readStorage=()=>({...d});}''')
 p.set_content(html,wait_until='load');p.locator('#cloudGoogle').wait_for();assert p.locator('#cloudGate').is_visible()
 p.locator('#cloudGoogle').click();p.locator('#cloudNewGame').wait_for();p.locator('#cloudNewGame').click()
 assert p.locator('#cloudGate').is_hidden(),'Signed in and new game'
 p.locator('#cutsceneSkip').click();p.locator('#tutorialSkip').click()
 p.locator('#openSettings').click();assert 'alex@example.net' in p.locator('#profileAccount').inner_text().lower()
 p.locator('#toggleAuto').click();p.locator('#endDay').click()
 assert p.locator('#daySummaryBackdrop').is_visible(),'Day closed'
 p.wait_for_function('window.__firebaseDoc&&window.__firebaseDoc.game.state.hour===22',{ 'timeout':5000}) if False else None
 p.wait_for_function('window.__firebaseDoc && window.__firebaseDoc.game.state.hour === 22')
 cloud=p.evaluate('window.__firebaseDoc');assert cloud['revision']>=2,cloud
 print('PASS Google sign-in mock, first cloud save, closing cloud write; revision',cloud['revision'])
 p.locator('#summaryContinue').click()
 p.locator('#openSettings').click();p.locator('#profileNickname').fill('Queen of Lanes');p.locator('#profileSaveName').click()
 p.wait_for_function('window.__firebaseDoc?.profile.nickname === "Queen of Lanes"')
 print('PASS profile saved to cloud')
 # Reload a returning logged-in player and select the existing online game.
 prior=p.evaluate('window.__firebaseDoc')
 import json
 again=html.replace('window.__firebaseDoc=null;', 'window.__firebaseDoc='+json.dumps(prior)+';').replace('window.__fakeUser=null;', 'window.__fakeUser={uid:\'user42\',displayName:\'Alex Bowler\',email:\'alex@example.net\'};')
 p.set_content(again,wait_until='load')
 p.locator('#cloudContinue').wait_for()
 p.locator('#cloudContinue').click()
 assert p.locator('#cloudGate').is_hidden()
 p.locator('#openSettings').click()
 assert p.locator('#profileName').inner_text()=='Queen of Lanes'
 print('PASS returning account loads cloud data and nickname')
 # another device writes a newer revision; the client must stop overwriting
 p.evaluate('window.__firebaseDoc.revision += 1')
 p.locator('#cloudSaveNow').click()
 p.wait_for_function('document.getElementById("cloudStatus").textContent.toLowerCase().includes("sync stopped")')
 assert 'sync stopped' in p.locator('#cloudStatus').inner_text().lower()
 print('PASS concurrent writer conflict blocked')
 assert not errors,errors
 b.close()
