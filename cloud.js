/* From Gutter to Glory v1.02 — Google popup retry, email/password fallback, and cloud saves.
   Firebase web config is public. Never store player passwords or auth tokens in the game state. */
const app=window.GTGApp;
const el=id=>document.getElementById(id);
const gate=el('cloudGate');
const hidden=(id,yes)=>el(id).classList.toggle('hidden',!!yes);
let user=null,auth=null,db=null,lib=null,store=null,revision=0,nickname='',blocked=false;
let queue=Promise.resolve(),signedInGeneration=0,firebaseReady=false,authBusy=false,loginStage='startup';
const AUTH_SDK='12.5.0'; // pinned; update only after real-device regression testing
const setStatus=(msg,isError=false)=>{el('cloudStatus').textContent=msg;el('cloudStatus').classList.toggle('error',isError);};
const say=(message,head='Who’s rolling in?')=>{el('cloudGateTitle').textContent=head;el('cloudGateText').textContent=message;};
function actions(...visible){for(const id of ['cloudGoogle','cloudContinue','cloudBrowser','cloudNewGame','cloudLocalDemo','cloudRetry','cloudResetFresh','cloudDownloadBackup'])hidden(id,!visible.includes(id));}
function gateShown(shown){gate.classList.toggle('hidden',!shown);}
const emailPanel=el('cloudEmailPanel'), emailForm=el('cloudEmailForm');
function showEmailPanel(visible){emailPanel.classList.toggle('hidden',!visible);el('cloudEmailToggle').setAttribute('aria-expanded',String(visible));}
function availableLogin(){actions('cloudGoogle');hidden('cloudEmailToggle',false);showEmailPanel(false);el('cloudLoginHint').textContent='Google login acting up? Try again, or use your linked email and password.';}
function setBusy(yes,label='Connecting…'){
 authBusy=yes;
 for(const id of ['cloudGoogle','cloudEmailSignIn','cloudEmailRegister','cloudForgotPassword','cloudEmailToggle'])el(id).disabled=yes;
 el('cloudGoogle').textContent=yes?'⏳ '+label:'🔑 Sign in with Google';
 el('cloudEmailHint').textContent=yes?'Contacting Firebase securely…':'Passwords go directly to Firebase; they are never stored in your bowling save.';
}
function diagnostic(err,stage){
 const code=typeof err?.code==='string'&&/^[a-z0-9/-]{1,90}$/i.test(err.code)?err.code:'unknown';
 const msg=String(err?.message||'');
 const hint=/missing initial state/i.test(msg)?'missing-initial-state':/sessionStorage/i.test(msg)?'session-storage':'none';
 const record=`GTG v1.02 | stage=${stage} | code=${code} | hint=${hint} | SDK=${AUTH_SDK} | ${new Date().toISOString()}`;
 el('cloudDiagnostic').textContent=record;
 hidden('cloudDiagnostics',false);
 // Do not include email, UID, passwords, tokens, or Firebase credentials in diagnostics.
 console.warn('Bowling auth diagnostic:',record);
 return {code,hint};
}
function friendlyError(err,stage){
 const {code,hint}=diagnostic(err,stage);
 if(hint==='missing-initial-state')return 'The Google sign-in window lost its starting information. Try Google again, or use email and password. Your game has not been reset.';
 const messages={
  'auth/popup-blocked':'Your browser blocked Google’s login window. Allow popups for this site and try again.',
  'auth/popup-closed-by-user':'The Google window closed before login finished. You can give it another shot.',
  'auth/cancelled-popup-request':'Another sign-in interrupted the first one. Tap Google once to retry.',
  'auth/network-request-failed':'The network dropped the ball. Check your connection and retry.',
  'auth/unauthorized-domain':'This website has not been added to Firebase Authorized domains. The developer must add the GitHub Pages hostname.',
  'auth/operation-not-allowed':'Email/password sign-in has not been enabled in Firebase Authentication. The developer must turn it on.',
  'auth/invalid-email':'That email address doesn’t look valid.',
  'auth/invalid-credential':'Those sign-in details weren’t accepted. Check them or use Forgot password.',
  'auth/wrong-password':'That password was not accepted. Try Forgot password.',
  'auth/user-not-found':'No account was found for those details. Try Create account.',
  'auth/email-already-in-use':'This email already has an account. Sign in instead. If you currently use Google, first link a password from Profile settings.',
  'auth/account-exists-with-different-credential':'This email already uses another sign-in method. Sign in with that method, then link a password from Settings.',
  'auth/credential-already-in-use':'That email/password account already exists. Sign in with it separately; linking does not merge existing save files.',
  'auth/provider-already-linked':'This player already has a password sign-in linked.',
  'auth/weak-password':'Choose a longer password (at least 8 characters for this game).',
  'auth/too-many-requests':'There have been too many attempts. Wait a while before trying again.',
  'auth/requires-recent-login':'For security, sign out and sign in again before linking a password.'
 };
 return messages[code]||'Sign-in did not finish ('+code+'). You can retry without losing your browser save.';
}
function authError(err,stage){
 loginStage=stage;
 const message=friendlyError(err,stage);
 say(message,'Google slipped into the gutter!');
 availableLogin();
 el('cloudLoginHint').textContent=message;
 setStatus('Sign-in needs attention: '+(err?.code||'unknown'),true);
 setBusy(false);
}
function profile(){
 const name=nickname||(user?.displayName||'Local bowler');
 el('profileName').textContent=name;
 el('profileAccount').textContent=user?.email||'Local browser · no online account';
 el('profileAvatar').textContent=name.trim().charAt(0).toUpperCase()||'🎳';
 el('profileNickname').value=nickname;
 for(const id of ['cloudSignOut','cloudRefresh','cloudSaveNow','profileCloudReset'])hidden(id,!user);
 hidden('profileSaveName',!user);
 hidden('profileLinkBox',!user);
 if(user){
  const hasPassword=user.providerData?.some(p=>p.providerId==='password');
  const input=el('profileLinkEmail');input.value=user.email||'';
  el('profileLinkPassword').value='';
  el('profileLinkStatus').textContent=hasPassword?'✓ This profile already has email/password sign-in.':'Add a password to this account so you can sign in if Google popups fail.';
  el('profileLinkButton').disabled=!!hasPassword||!user.email;
 }
}
async function launchDemo(){app.unlockDemo();gateShown(false);profile();setStatus('Local demo mode · browser saves only. Cloud sync is not configured.');}
function fail(reason){say(reason,'The cloud is having a gutter ball');actions('cloudRetry',...(user&&store?['cloudResetFresh']:[]),...(window.GTGCloudChoice?.cloud?['cloudDownloadBackup']:[]));hidden('cloudEmailToggle',true);showEmailPanel(false);el('cloudGateNote').textContent='Your browser data was not overwritten. Check Firestore rules or network access, then try again.';}
function showLogin(){
 user=null;store=null;blocked=false;window.GTGCloudChoice=null;app.lockCloud();gateShown(true);
 say('Use Google or an email/password account to load your bowling alley.','Ready to roll?');
 el('cloudGateNote').textContent='Cloud saves belong to the account you sign into. Separate accounts do not automatically share progress.';
 availableLogin();profile();setStatus('Not signed in · your game is paused');
}
async function boot(){
 const config=window.GTG_FIREBASE_CONFIG;
 if(!config||!config.apiKey||!config.projectId||!config.authDomain||!config.appId){
  say('The developer has not added Firebase settings. You can play locally.','Local mode — no account needed');
  el('cloudGateNote').textContent='To enable online saves, follow FIREBASE_SETUP.md and fill in firebase-config.js.';
  actions('cloudLocalDemo');hidden('cloudEmailToggle',true);return;
 }
 try{
  say('Connecting securely to your player profile…');actions();hidden('cloudEmailToggle',true);
  // Do not load remote libraries if the project isn't configured.
  const [firebase,authorization,firestore]=await Promise.all([
   import(`https://www.gstatic.com/firebasejs/${AUTH_SDK}/firebase-app.js`),
   import(`https://www.gstatic.com/firebasejs/${AUTH_SDK}/firebase-auth.js`),
   import(`https://www.gstatic.com/firebasejs/${AUTH_SDK}/firebase-firestore.js`)
  ]);
  lib={firebase,authorization,firestore};
  const firebaseApp=firebase.initializeApp(config);
  auth=authorization.getAuth(firebaseApp);
  db=firestore.getFirestore(firebaseApp);
  await authorization.setPersistence(auth,authorization.browserLocalPersistence);
  if(typeof auth.authStateReady==='function')await auth.authStateReady();
  firebaseReady=true;
  authorization.onAuthStateChanged(auth,async next=>{
   signedInGeneration++;
   const generation=signedInGeneration;
   if(!next){showLogin();return;}
   user=next;blocked=false;revision=0;nickname=next.displayName||'Bowler';window.GTGCloudChoice=null;
   store=firestore.doc(db,'players',next.uid);
   gateShown(true);say('Looking for your saved bowling alley…');actions();hidden('cloudEmailToggle',true);showEmailPanel(false);
   try{
    const docSnap=await firestore.getDocFromServer(store);
    if(generation!==signedInGeneration)return;
    const cloud=docSnap.exists()?docSnap.data():null;
    window.GTGCloudChoice={cloud,browser:null}; // Preserve a copy for export even if the save cannot be parsed.
    if(cloud&&!app.validate(cloud.game))throw new Error('Your cloud save could not be validated. No data was replaced.');
    revision=Number(cloud?.revision||0);
    nickname=(cloud?.profile?.nickname||next.displayName||'Bowler').slice(0,28);
    profile();
    const browser=app.readBrowserCandidate(next.uid);
    window.GTGCloudChoice={cloud,browser};
    showSaveChoices();
   }catch(err){
    if(generation!==signedInGeneration)return;
    diagnostic(err,'firestore-read');
    fail('Login succeeded, but we cannot read the online save ('+(err.code||err.message)+'). No data was replaced. Check Firestore rules for the /players/{uid} path.');
   }
  },err=>{diagnostic(err,'auth-listener');fail('Authentication could not start ('+(err.code||'unknown')+').');});
 }catch(err){diagnostic(err,'firebase-initialize');fail('Cloud setup failed: '+(err.code||err.message));}
}
function showSaveChoices(){
 const {cloud,browser}=window.GTGCloudChoice;
 let details='';
 if(cloud)details='☁ Cloud save: '+app.getBrief(cloud.game);
 if(browser)details+=(details?'\n':'')+'📱 Browser: '+app.getBrief(browser)+' ('+browser.source+')';
 el('cloudGateBrief').textContent=details||'No saved alley yet. Open the empty building and choose how to start.';
 hidden('cloudGateBrief',!details);
 if(cloud){say('Welcome back, '+nickname+'! Choose your game. A newer browser save will not be uploaded automatically.','Your bowling alley awaits');actions('cloudContinue',...(browser?['cloudBrowser']:[]),'cloudNewGame','cloudResetFresh','cloudDownloadBackup');}
 else if(browser){say('We found an existing browser game. Bring it into this account or start fresh.','Bring your alley along?');actions('cloudBrowser','cloudNewGame','cloudResetFresh');}
 else{say('Your account is ready. Time to make some pins nervous.','First frame!');actions('cloudNewGame','cloudResetFresh');}
 hidden('cloudEmailToggle',true);showEmailPanel(false);
 el('cloudGateNote').textContent='Choosing a browser game uploads it to this account. A fresh game replaces an existing cloud save only after confirmation.';
}
function openGame(snapshot,upload=false){
 if(!user)throw new Error('Sign in required');
 app.unlockCloud(user.uid,snapshot);gateShown(false);blocked=false;profile();
 setStatus(upload?'Preparing cloud save…':'☁ Cloud save loaded. We sync at each game-day closing.');
 if(upload)void saveNow('chosen game');
}
async function chooseCloud(){const cloud=window.GTGCloudChoice?.cloud;if(!cloud)return;try{openGame(cloud.game);}catch(e){fail(e.message);}}
async function chooseBrowser(){const browser=window.GTGCloudChoice?.browser;if(!browser)return;
 if(window.GTGCloudChoice.cloud&&!confirm('Replace the cloud game with this browser save? Export a backup first if you want both.'))return;
 try{openGame(browser,true);}catch(e){fail(e.message);}}
async function chooseNew(){const cloud=window.GTGCloudChoice?.cloud;
 if(cloud&&!confirm('Start a new cloud game? This replaces your existing online progress. Export first if needed.'))return;
 try{openGame(null,true);}catch(e){fail(e.message);}}
async function saveNow(reason='manual'){
 if(app.isDevelopmentPreview?.()){setStatus('🧪 Local development preview — cloud saving is disabled to protect your real game. Use Exit Preview in Settings.',true);return false;}
 if(!user||!store||blocked){if(blocked)setStatus('Sync paused: another device changed your cloud save. Export a backup and reload to compare versions.',true);return false;}
 const targetUid=user.uid,generation=signedInGeneration;
 const game=JSON.parse(JSON.stringify(app.snapshot()));
 if(!app.validate(game)){setStatus('Save validation failed. Local backup preserved.',true);return false;}
 if(new TextEncoder().encode(JSON.stringify(game)).length>750000){setStatus('Save too large for a single Firestore document. Export a backup.',true);return false;}
 queue=queue.catch(()=>null).then(async()=>{
  if(!user||user.uid!==targetUid||generation!==signedInGeneration||blocked)return;
  setStatus('☁ Syncing '+reason+'…');
  try{
   const nextRevision=await lib.firestore.runTransaction(db,async tx=>{
    const remote=await tx.get(store);
    const current=remote.exists()?Number(remote.data().revision||0):0;
    if(current!==revision)throw new Error('CLOUD_CONFLICT');
    tx.set(store,{schemaVersion:1,revision:current+1,game,profile:{nickname:nickname.slice(0,28)},serverSavedAt:lib.firestore.serverTimestamp()});
    return current+1;
   });
   revision=nextRevision;
   setStatus('✅ Cloud save current · '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+' · Day '+game.state.day);
  }catch(err){
   if(String(err?.message||'').includes('CLOUD_CONFLICT')){blocked=true;setStatus('⚠ Another device changed this game. Sync stopped. Export your local save, reload, and choose which version to keep.',true);}
   else {diagnostic(err,'firestore-write');setStatus('⚠ Cloud sync failed ('+(err.code||err.message)+'). Browser save remains. Retry with Save now.',true);}
  }
 });
 await queue;
 return !blocked;
}
// Safe reset is a revision-checked REPLACEMENT, never a Firestore delete. This
// follows the existing owner-only rules which intentionally disallow deletes.
function downloadExistingCloud(){
 const cloudRecord=window.GTGCloudChoice?.cloud;
 if(!cloudRecord){app.notify('No readable cloud record has been loaded. Try Retry connection.',true);return;}
 const raw=JSON.stringify(app.validate(cloudRecord.game)?{...cloudRecord.game,exportedAt:new Date().toISOString(),source:'cloud-before-reset-v1.02'}:{exportedAt:new Date().toISOString(),source:'RAW-CLOUD-RECORD-not-importable',record:cloudRecord},null,2);
 const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download='from-gutter-to-glory-CLOUD-BACKUP-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function replaceCloudWithFresh(){
 if(!firebaseReady||!user||!store){app.notify('Sign in to your own account before replacing its cloud game.',true);return;}
 if(app.isDevelopmentPreview?.()){app.notify('Exit Development Preview before changing a real cloud save.',true);return;}
 if(!confirm('This will permanently REPLACE your current online game with a new empty building. Other devices with your old game may need to reload. Have you exported a backup?'))return;
 const answer=prompt('To confirm replacing your cloud game, type RESET CLOUD exactly:');
 if(answer!=='RESET CLOUD'){app.notify('Cloud reset canceled. Nothing changed.');return;}
 const targetUid=user.uid,targetStore=store,generation=signedInGeneration;
 const fresh=app.freshSnapshot();
 if(!app.validate(fresh)){app.notify('Fresh-game validation failed. Nothing changed.',true);return;}
 el('cloudResetFresh').disabled=true;el('profileCloudReset').disabled=true;
 say('Replacing your cloud game… Do not close this tab.','New beginning');
 gateShown(true);actions();setStatus('Preparing a fresh cloud save…');
 try{
  await queue.catch(()=>null); // Drain queued older saves before doing a deliberate overwrite.
  if(!user||user.uid!==targetUid||store!==targetStore||generation!==signedInGeneration)throw new Error('ACCOUNT_CHANGED');
  const nextRevision=await lib.firestore.runTransaction(db,async tx=>{
   const old=await tx.get(targetStore); // Will fail safely if Firestore reads are denied.
   const current=old.exists()?Number(old.data()?.revision||0):0;
   if(!Number.isSafeInteger(current)||current<0)throw new Error('INVALID_REMOTE_REVISION');
   tx.set(targetStore,{schemaVersion:1,revision:current+1,game:fresh,profile:{nickname:nickname.slice(0,28)},serverSavedAt:lib.firestore.serverTimestamp()});
   return current+1;
  });
  if(!user||user.uid!==targetUid||generation!==signedInGeneration)throw new Error('ACCOUNT_CHANGED');
  revision=nextRevision;blocked=false;window.GTGCloudChoice={cloud:null,browser:null};
  app.unlockCloud(targetUid,fresh);gateShown(false);profile();
  setStatus('✅ New cloud game created, revision '+nextRevision+'. Your prior cloud progress was replaced.');
  app.notify('Fresh cloud alley created. Start with the opening story and loan.');
 }catch(err){
  diagnostic(err,'cloud-reset');
  fail('Could not replace the online game ('+(err.code||err.message)+'). If the network interrupted a transaction, refresh and inspect the save before trying again. If permission-denied, publish the owner-only Firestore rules; a reset cannot bypass them.');
  setStatus('⚠ Cloud reset NOT confirmed. Refresh and inspect your cloud save before retrying.',true);
 }finally{el('cloudResetFresh').disabled=false;el('profileCloudReset').disabled=false;}
}
el('cloudResetFresh').onclick=()=>void replaceCloudWithFresh();
el('profileCloudReset').onclick=()=>void replaceCloudWithFresh();
el('cloudDownloadBackup').onclick=downloadExistingCloud;
app.registerCloudSave(reason=>{void saveNow(reason);});

// Authentication controls. Popup actions must start directly from a user click.
el('cloudLocalDemo').onclick=launchDemo;
el('cloudRetry').onclick=()=>location.reload();
el('cloudEmailToggle').onclick=()=>showEmailPanel(emailPanel.classList.contains('hidden'));
el('cloudCopyDiagnostic').onclick=async()=>{
 const content=el('cloudDiagnostic').textContent;
 try{await navigator.clipboard.writeText(content);el('cloudCopyDiagnostic').textContent='✓ Copied';}
 catch(e){el('cloudCopyDiagnostic').textContent='Select the diagnostic above to copy';}
};
el('cloudGoogle').onclick=async()=>{
 if(!firebaseReady||authBusy)return;
 setBusy(true,'Opening Google…');loginStage='google-popup';
 try{await lib.authorization.signInWithPopup(auth,new lib.authorization.GoogleAuthProvider());}
 catch(err){authError(err,'google-popup');return;}
 setBusy(false);
};
const credentials=()=>({email:el('cloudEmail').value.trim(),password:el('cloudPassword').value});
async function emailAttempt(mode){
 if(!firebaseReady||authBusy)return;
 const {email,password}=credentials();
 if(!email||!email.includes('@')){el('cloudEmailHint').textContent='Please enter a valid email address.';return;}
 if(mode==='register'&&password.length<8){el('cloudEmailHint').textContent='Choose a password with at least 8 characters.';return;}
 if(!password){el('cloudEmailHint').textContent='Please enter your password.';return;}
 setBusy(true,mode==='register'?'Making your account…':'Signing in…');
 loginStage=mode==='register'?'email-register':'email-login';
 try{
  if(mode==='register')await lib.authorization.createUserWithEmailAndPassword(auth,email,password);
  else await lib.authorization.signInWithEmailAndPassword(auth,email,password);
  el('cloudPassword').value='';
  setBusy(false);
 }catch(err){
  const message=friendlyError(err,loginStage);
  setStatus('Email sign-in needs attention: '+(err.code||'unknown'),true);
  setBusy(false);
  showEmailPanel(true);
  el('cloudEmailHint').textContent=message;
 }
}
emailForm.onsubmit=event=>{event.preventDefault();void emailAttempt('login');};
el('cloudEmailRegister').onclick=()=>void emailAttempt('register');
el('cloudForgotPassword').onclick=async()=>{
 if(!firebaseReady||authBusy)return;
 const email=el('cloudEmail').value.trim();
 if(!email.includes('@')){el('cloudEmailHint').textContent='Enter your email address first, then choose Forgot password.';return;}
 setBusy(true,'Sending reset…');
 try{
  await lib.authorization.sendPasswordResetEmail(auth,email);
  setBusy(false);showEmailPanel(true);
  el('cloudEmailHint').textContent='If this email has a password account, Firebase will send a reset link. Check your inbox and spam folder.';
 }catch(err){const message=friendlyError(err,'password-reset');setBusy(false);showEmailPanel(true);el('cloudEmailHint').textContent=message;}
};

el('cloudContinue').onclick=chooseCloud;
el('cloudBrowser').onclick=chooseBrowser;
el('cloudNewGame').onclick=chooseNew;
el('cloudSaveNow').onclick=()=>{if(!user){app.notify('Local demo saves in this browser.',true);return;}void saveNow('manual');};
el('cloudRefresh').onclick=()=>{if(!user)return;app.lockCloud();gateShown(true);say('Reload to compare the cloud and browser copies.','Check cloud save');actions('cloudRetry');};
el('cloudSignOut').onclick=async()=>{
 if(!auth||!user)return;
 if(!confirm('Sign out? Export a backup if your last game day was not synced.'))return;
 try{await lib.authorization.signOut(auth);}catch(err){app.notify('Could not sign out: '+(err.code||err.message),true);}
};
el('profileSaveName').onclick=()=>{
 if(!user){app.notify('Connect an account to keep a cloud profile.',true);return;}
 nickname=el('profileNickname').value.trim().slice(0,28)||user.displayName||'Bowler';profile();void saveNow('profile update');
};
// Link a password to an EXISTING signed-in Google UID; no new save record is created.
el('profileLinkButton').onclick=async()=>{
 if(!user||!user.email)return;
 const pwd=el('profileLinkPassword').value;
 if(pwd.length<8){el('profileLinkStatus').textContent='Use a new password of at least 8 characters.';return;}
 if(!confirm('Add email/password sign-in to this exact player account? Use a NEW game password, not your Google password.'))return;
 el('profileLinkButton').disabled=true;
 try{
  const credential=lib.authorization.EmailAuthProvider.credential(user.email,pwd);
  await lib.authorization.linkWithCredential(user,credential);
  el('profileLinkPassword').value='';
  el('profileLinkStatus').textContent='✓ Password sign-in linked to your existing cloud save. You can now use either method.';
  profile();
  app.notify('Email login now uses your existing bowler profile!');
 }catch(err){
  const message=friendlyError(err,'link-password');
  el('profileLinkStatus').textContent=message;
  el('profileLinkButton').disabled=false;
 }
};
profile();
await boot();
