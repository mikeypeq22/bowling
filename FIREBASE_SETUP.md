# From Gutter to Glory v0.91 — Firebase cloud-saving setup

> Owner setup: **required once**. Players only need a Google account afterward. Your existing GitHub Pages hosting remains unchanged.

## The $0 option

Select **Firebase Spark** (no-cost, no credit card), **Cloud Firestore Standard edition**, and **one `(default)` database**. Standard Firestore includes 1 GiB stored data, 50,000 reads per day, 20,000 writes per day, 20,000 deletes per day, and 10 GiB outbound monthly. Firebase Authentication supports Google sign-in on Spark (subject to authentication rate/usage limits). Spark does **not** silently bill overages: service usage may stop if free limits are exceeded. Never upgrade to Blaze or enable a billing account unintentionally.

The game reads one save on login and writes one save after each game day (and when the player manually saves, imports, starts fresh or changes their profile). It does **not** write every few seconds. Firestore transactions also read the player's save on each write, so allow for those additional reads. This is meant for a small prototype, not a prediction of how many players you can afford indefinitely.

## 1. Create your free project

1. Open https://console.firebase.google.com/ and choose **Add project**.
2. Choose **Spark (no-cost)**. Leave Analytics off unless you specifically need it.
3. In Project Settings → Your apps, **add a Web app** (`</>` icon). You do **not** need Firebase Hosting. Copy the **Web app config** shown, NOT any service-account key.

## 2. Turn on Google sign-in

1. Firebase Console → **Build → Authentication → Get started → Sign-in method**.
2. Enable **Google** sign-in, choosing the project support email if prompted.
3. Authentication → **Settings → Authorized domains**: add **your GitHub Pages host**, for example `example.github.io` (without `https://` and without `/repo-name/`). You can also add `localhost` for development testing if needed; Firebase may not include it by default.
4. Use the `authDomain` **exactly as shown** in the Firebase Web app config (typically `YOURPROJECT.firebaseapp.com`). The game uses popup sign-in, not redirect.

## 3. Create Firestore and secure it BEFORE publishing

1. Firebase Console → **Build → Firestore Database → Create database**.
2. Choose **Standard** and the default Firestore database; use a region near your players.
3. Choose **production mode**. Do NOT choose unrestricted test-mode rules.
4. Open **Rules**, replace the entire rule text with the contents of the included `firestore.rules`, and click **Publish**.
5. The rules restrict each signed-in user to `players/{their Firebase UID}`. Players cannot list other saves, read other accounts or delete documents using this app.
6. Test the rules with the Firebase Rules Playground before inviting players.

**Do not skip this:** Without correct Firestore rules, putting a public frontend on GitHub Pages can expose or damage player data.

## 4. Configure the game

Open `firebase-config.js` in the project. Replace `window.GTG_FIREBASE_CONFIG = null;` with the copied Web app configuration object:

```js
window.GTG_FIREBASE_CONFIG = {
  apiKey: "your-web-app-api-key",
  authDomain: "YOURPROJECT.firebaseapp.com",
  projectId: "YOURPROJECT",
  appId: "1:123:web:abc"
};
```

Optional keys such as `messagingSenderId`, `storageBucket` and `measurementId` may be included if Firebase gives them. The **Firebase Web API key** is a normal publicly visible configuration identifier: security relies on **Authentication and Firestore Rules**, not hiding that value.

**Never** publish a private service-account JSON, administrative API credentials, secrets or a password in the repository.

## 5. Publish to GitHub Pages

1. Download and extract `From_Gutter_to_Glory_GitHub_Pages_v0.91.zip`.
2. Configure `firebase-config.js` in the extracted folder.
3. Upload the **files themselves** (including `.nojekyll`, `index.html`, `app.js`, `engine.js`, `style.css`, `cloud.js`, `firebase-config.js` and `assets/`) to the **root of your existing GitHub repository**, replacing the previous version.
4. Repository → **Settings → Pages → Deploy from branch → main → /(root)**.
5. Visit the GitHub Pages URL over HTTPS, sign in with Google, start a cloud game, use **Settings → Save to cloud now**, advance to a closing report, and then reopen the site. Use a second browser to confirm the save loads.

The standalone HTML preview is **local-demo-only** until connected to your online project. Use the multi-file GitHub Pages build for actual cloud saves.

## Existing v0.9 saves

1. Export a backup from v0.9 *before* replacing the site.
2. Sign into the new cloud site.
3. If the previous save is still in the same browser and site origin, the game offers **Use this browser's save**. This migrates it to the signed-in user's cloud document. The choice is explicit to prevent accidental overwrites.
4. If the save isn't found, use **Settings → Import save** after entering the cloud game, then choose **Save to cloud now** (imports also request a cloud sync).

If you switch from a downloaded HTML file to a GitHub Pages URL, browser localStorage is different; exporting and importing is necessary.

## Troubleshooting

- **Cloud services not configured:** You haven't filled in `firebase-config.js` yet. You can use local demo play without authentication.
- **auth/unauthorized-domain:** Add `USERNAME.github.io` to Firebase Authentication's Authorized domains list.
- **permission-denied:** Check that Google Authentication is enabled and your exact `firestore.rules` have been published.
- **Popup blocked/closed:** Tap the login button directly and allow the popup. Google sign-in may be affected by in-app browsers; a regular Chrome/Safari browser can help.
- **No internet:** Login and cloud sync require an internet connection. An already-open game may save locally; review status and manually retry.
- **Conflict detected:** Another device updated the same save. Export the current device's JSON before reloading. On reload, choose the cloud or browser copy to continue; deliberately choosing the browser version will overwrite cloud.
- **Free quotas exceeded:** Remain on Spark and check the Firebase Usage dashboard. Data won't be deleted automatically; some new reads/writes can be blocked until limits reset.

## Data model

Firestore path: `players/{firebaseAuthUid}`

```
{
  schemaVersion: 1,
  revision: 2,
  profile: { nickname: "Alley Ace" },
  game: { state: { ...simulation fields }, lastTick: 123456789 },
  serverSavedAt: <server timestamp>
}
```

Game-state validation is performed on load. Writes use an optimistic revision check in a transaction to prevent silent multi-device overwrites. No chat, passwords, Google access tokens, or sensitive account credentials are written into the save document.

## Future work before a larger public launch

Test Firebase Security Rules in the official Emulator Suite, use App Check/abuse mitigation as appropriate, add a privacy notice and account deletion workflow, introduce monitored quota alarms, and revisit save architecture if history grows close to Firestore's 1 MiB document limit. Google sign-in makes online play possible, but it does not by itself prevent manipulated client-side game stats or cheating.

## v0.92 additional step: Email/Password login

1. Firebase Console → Authentication → Sign-in method.
2. Select **Email/Password**, toggle on **Email/Password** and Save. (Email-link sign-in is not required.)
3. Re-deploy the v0.92 GitHub Pages ZIP contents. The game then shows **Use email & password instead** on the login screen.
4. Existing Google players should use Settings → Player Profile → **Link password to this player** while already signed in with Google. This keeps the same Firebase UID and Firestore save.
5. New players may click Create account. Players with existing separate email accounts must not assume saves merge automatically.
6. Test reset-email delivery and per-user cloud saves. Google popup retry is manual and requires another deliberate tap.

## v1.02 — Replace a broken or unwanted cloud save
Once **signed in as the account owner**, use either the **Replace cloud save** action on the login/failed-load screen or **Settings → Player Profile → Replace my cloud game**. If the existing record was readable, use **Download old cloud save** first. The confirmation requires typing `RESET CLOUD`.

This operation does not delete a Firestore document or Firebase account. It uses a revision-checked Firestore transaction to replace the game data with a fresh empty-building game. This works with the existing owner-only `firestore.rules`. If you still see `permission-denied`, publish and verify those rules in Firestore Console. A client cannot ethically or technically override the rules, and the reset will fail safely. Other signed-in devices must reload after a reset rather than uploading outdated saves.

Network errors during a transaction may leave the commit status unclear. Reload and check the online state before retrying. The reset flow has not been tested against a live Firebase account in this release.
