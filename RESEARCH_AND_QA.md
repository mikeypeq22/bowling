# Research & QA — v0.91

**Verified official sources**
- Firebase pricing/Spark: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Firestore free limits: https://firebase.google.com/docs/firestore/pricing
- Firebase Google authentication: https://firebase.google.com/docs/auth/web/google-signin
- Firestore user-scoped rules: https://firebase.google.com/docs/firestore/security/rules-conditions
- Supabase free alternative: https://supabase.com/pricing
- GitHub Pages static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

**QA targets:** legacy save migration, local-demo mode, account sign-in gate, initial cloud load, choose-browser-vs-cloud, conflict detection, closing trigger, local backups, profile edits, logout, denied cross-user access, quota errors, mobile layout. Live Firebase rules testing must be completed in the owner's project; it cannot be honestly marked complete using an unauthenticated local build.

**Results from this build**
- Existing engine regression (`qa_tests_v07.js`): 12,304 assertions passed over 3,072 simulated days.
- Standalone local-demo browser test (`test_browser_v091.py`): passed at 320, 390, 768, 1280 px for startup gate, cutscene, tutorial, Settings, manual hour, local save, and browser re-entry.
- Mocked Firebase browser integration (`test_cloud_mock_v091.py`): passed Google account callback, new cloud game creation, end-of-day write, profile update, returning account loading a previous online save, and version-conflict blocking.
- **Not verified:** real Firebase Auth, actual Firestore Rules authorization, payment-plan quota behavior or GitHub Pages deployment. These require the owner's real Firebase project and browser and remain explicit release prerequisites.
