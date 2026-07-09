/* Initializes Firebase (compat SDK, plain globals — same pattern as every
   other file in this app, no bundler). auth/db are null until a real
   config is dropped into firebase-config.js, so the rest of the app can
   always check `if (auth) { ... }` and fall back to local-only behavior. */
let auth = null;
let db = null;

if (typeof firebase !== 'undefined' && FIREBASE_CONFIGURED) {
  firebase.initializeApp(FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();
}

function isSignedIn() { return !!(auth && auth.currentUser); }
function currentUid() { return auth && auth.currentUser ? auth.currentUser.uid : null; }
