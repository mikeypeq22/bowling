/* From Gutter to Glory v0.91 · optional Firebase Auth + Firestore cloud saves.
   Google login and per-user data require setting firebase-config.js and deploying
   firestore.rules. Public config is not a secret; Firestore rules enforce privacy. */
const app=window.GTGApp;
const el=id=>document.getElementById(id);
const gate=el('cloudGate');
const hidden=(id,yes)=>el(id).classList.toggle('hidden',!!yes);
let user=null,auth=null,db=null,lib=null,store=null,revision=0,nickname='',blocked=false;
let queue=Promise.resolve(),signedInGeneration=0;
const setStatus=(msg,isError=false)=>{el('cloudStatus').textContent=msg;el('cloudStatus').classList.toggle('error',isError);};
const say=(text,head='Who’s rolling in?')=>{el('cloudGateTitle').textContent=head;el('cloudGateText').textContent=text;};
function actions(...visible){for(const id of ['cloudGoogle','cloudContinue','cloudBrowser','cloudNewGame','cloudLocalDemo','cloudRetry'])hidden(id,!visible.includes(id));}
function gateShown(shown){gate.classList.toggle('hidden',!shown);}
function profile(){
 const name=nickname||(user?.displayName||'Local bowler');
 el('profileName').textContent=name;
 el('profileAccount').textContent=user?.email||'Local browser · no online account';
 el('profileAvatar').textContent=name.trim().charAt(0).toUpperCase()||'🎳';
 el('profileNickname').value=nickname;
 for(const id of ['cloudSignOut','cloudRefresh','cloudSaveNow'])hidden(id,!user);
 hidden('profileSaveName',!user);
}
async function launchDemo(){app.unlockDemo();gateShown(false);profile();setStatus('Local demo mode · automatic browser saves only. Cloud sync is not configured.');}
function fail(reason){say(reason,'The cloud is having a gutter ball');actions('cloudRetry');el('cloudGateNote').textContent='Your saved data remains in this browser. Refresh or retry when you have a connection.';}
let firebaseReady=false;
async function boot(){
 const config=window.GTG_FIREBASE_CONFIG;
 if(!config||!config.apiKey||!config.projectId||!config.authDomain||!config.appId){
  say('Cloud accounts are ready to connect, but the developer has not added their Firebase settings. You can play locally for now.','Local mode — no account needed');
  el('cloudGateNote').textContent='To enable Google sign-in and online saves, follow FIREBASE_SETUP.md and fill in firebase-config.js.';
  actions('cloudLocalDemo');return;
 }
 try{
  say('Connecting securely to your player profile…');actions();
  // No Firebase library downloads unless a real Firebase project is configured.
  const version='12.5.0';
  const [firebase,authorization,firestore]=await Promise.all([
   import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
   import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
   import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
  ]);
  lib={firebase,authorization,firestore};
  const firebaseApp=firebase.initializeApp(config);
  auth=authorization.getAuth(firebaseApp);db=firestore.getFirestore(firebaseApp);
  await authorization.setPersistence(auth,authorization.browserLocalPersistence);
  firebaseReady=true;
  authorization.onAuthStateChanged(auth,async next=>{
   signedInGeneration++;
   const generation=signedInGeneration;
   if(!next){user=null;store=null;blocked=false;app.lockCloud();gateShown(true);
    say('Sign in with Google to open your bowling alley. Your progress is stored privately under your account.','Ready to roll?');
    el('cloudGateNote').textContent='Your game will save to Firestore at each day’s closing, plus when you choose Save now.';
    actions('cloudGoogle');profile();setStatus('Not signed in · game is locked until login');return;}
   user=next;blocked=false;revision=0;nickname=next.displayName||'Bowler';
   store=firestore.doc(db,'players',next.uid);
   gateShown(true);say('Looking for your saved bowling alley…');actions();
   try{
    const docSnap=await firestore.getDocFromServer(store);
    if(generation!==signedInGeneration)return;
    const cloud=docSnap.exists()?docSnap.data():null;
    if(cloud&&!app.validate(cloud.game))throw new Error('Your cloud save could not be validated. No data was replaced.');
    revision=Number(cloud?.revision||0);
    nickname=(cloud?.profile?.nickname||next.displayName||'Bowler').slice(0,28);
    profile();
    const browser=app.readBrowserCandidate(next.uid);
    window.GTGCloudChoice={cloud,browser};
    showSaveChoices();
   }catch(err){if(generation!==signedInGeneration)return;console.error(err);fail('We could not safely load your online save. Nothing was overwritten. '+(err.code||err.message));}
  },err=>{console.error(err);fail('Authentication could not be started. '+(err.code||err.message));});
 }catch(err){console.error(err);fail('Cloud setup failed: '+(err.message||err));}
}
function showSaveChoices(){
 const {cloud,browser}=window.GTGCloudChoice;
 let details='';
 if(cloud){details='☁ Cloud save: '+app.getBrief(cloud.game);}
 if(browser){details+=(details?'\n':'')+'📱 Browser: '+app.getBrief(browser)+' ('+browser.source+')';}
 el('cloudGateBrief').textContent=details||'No saved alley yet. Time to turn a dusty patch of ground into a bowling empire.';
 hidden('cloudGateBrief',!details);
 if(cloud){say('Welcome back, '+nickname+'! Pick the save you want to play. A newer browser save is never uploaded automatically.','Your bowling alley awaits');actions('cloudContinue',...(browser?['cloudBrowser']:[]),'cloudNewGame');}
 else if(browser){say('We found an existing browser game. You can bring it into your new Google account, or start a fresh cloud save.','Bring your alley along?');actions('cloudBrowser','cloudNewGame');}
 else{say('Your new account is ready. Build an alley worthy of the history books.','First frame!');actions('cloudNewGame');}
 el('cloudGateNote').textContent='Choosing a browser game uploads it to this Google account. Choosing a fresh game will replace any existing cloud save after confirmation.';
}
function openGame(snapshot,upload=false){
 if(!user)throw new Error('Sign in required');
 app.unlockCloud(user.uid,snapshot);
 gateShown(false);blocked=false;profile();
 setStatus(upload?'Preparing first cloud save…':'☁ Cloud save loaded. We save after each completed game day.');
 if(upload)saveNow('chosen game');
}
async function chooseCloud(){const cloud=window.GTGCloudChoice?.cloud;if(!cloud)return;try{openGame(cloud.game,false);}catch(e){fail(e.message);}}
async function chooseBrowser(){const browser=window.GTGCloudChoice?.browser;if(!browser)return;
 if(window.GTGCloudChoice.cloud&&!confirm('Replace the cloud game with this browser save? Export a backup first if you may want both.'))return;
 try{openGame(browser,true);}catch(e){fail(e.message);}}
async function chooseNew(){const cloud=window.GTGCloudChoice?.cloud;
 if(cloud&&!confirm('Start a new cloud game? This will replace your existing online progress. Export a backup first.'))return;
 try{openGame(null,true);}catch(e){fail(e.message);}}
async function saveNow(reason='manual'){
 if(!user||!store||blocked){if(blocked)setStatus('Sync paused: another device changed your cloud save. Export a backup, then reload to choose which version to use.',true);return false;}
 const targetUid=user.uid,generation=signedInGeneration;
 // Capture the game state at the time the save was requested, NOT after another day begins.
 const game=JSON.parse(JSON.stringify(app.snapshot()));
 if(!app.validate(game)){setStatus('Save rejected by validation — local backup preserved.',true);return false;}
 const byteCount=new TextEncoder().encode(JSON.stringify(game)).length;
 if(byteCount>750000){setStatus('The save has grown too large for one Firestore document. Export a backup.',true);return false;}
 queue=queue.catch(()=>null).then(async()=>{
  if(!user||user.uid!==targetUid||generation!==signedInGeneration||blocked)return;
  setStatus('☁ Syncing '+reason+'…');
  try{
   const nextRevision=await lib.firestore.runTransaction(db,async tx=>{
    const remote=await tx.get(store);
    const current=remote.exists()?Number(remote.data().revision||0):0;
    if(current!==revision)throw new Error('CLOUD_CONFLICT');
    const data={schemaVersion:1,revision:current+1,game,profile:{nickname:nickname.slice(0,28)},serverSavedAt:lib.firestore.serverTimestamp()};
    tx.set(store,data);
    return current+1;
   });
   revision=nextRevision;
   setStatus('✅ Cloud save current · '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+' · Day '+game.state.day);
  }catch(err){console.error('Cloud save failed',err);
   if(String(err?.message||'').includes('CLOUD_CONFLICT')){blocked=true;setStatus('⚠ Another device has changed this game. Cloud sync stopped to protect both copies. Export your local save, reload, and choose the version to keep.',true);}
   else setStatus('⚠ Cloud sync failed ('+(err.code||err.message)+'). Your browser still holds your game. Use Save now to retry.',true);
  }
 });
 await queue;
 return !blocked;
}
// A single cloud write per game-day closing, plus explicit account/profile actions.
app.registerCloudSave(reason=>{void saveNow(reason);});
el('cloudLocalDemo').onclick=launchDemo;
el('cloudRetry').onclick=()=>location.reload();
el('cloudGoogle').onclick=async()=>{
 if(!firebaseReady)return;
 try{await lib.authorization.signInWithPopup(auth,new lib.authorization.GoogleAuthProvider());}
 catch(err){console.error(err);say('Google sign-in did not finish. Please try again. '+(err.code||''),'Try that sign-in again');actions('cloudGoogle');}
};
el('cloudContinue').onclick=chooseCloud;
el('cloudBrowser').onclick=chooseBrowser;
el('cloudNewGame').onclick=chooseNew;
el('cloudSaveNow').onclick=()=>{if(!user){app.notify('Local demo saves in this browser.',true);return;}void saveNow('manual');};
el('cloudRefresh').onclick=()=>{if(!user)return;app.lockCloud();gateShown(true);say('Reload to safely compare the cloud and browser copies.','Check cloud save');actions('cloudRetry');};
el('cloudSignOut').onclick=async()=>{if(!auth||!user)return;if(!confirm('Sign out? Export a backup if your last game day has not been synced.'))return;
 try{await lib.authorization.signOut(auth);}catch(err){app.notify('Could not sign out: '+(err.message||err),true);}};
el('profileSaveName').onclick=()=>{if(!user){app.notify('Connect an account to keep a cloud profile.',true);return;}
 nickname=el('profileNickname').value.trim().slice(0,28)||user.displayName||'Bowler';profile();void saveNow('profile update');};
profile();
await boot();
