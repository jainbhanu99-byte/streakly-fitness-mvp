/* Firebase project config. These values are NOT secret — they're meant to
   be public in client-side code (Firestore/Auth security is enforced by
   firestore.rules, not by hiding this object). Replace the placeholder
   below with the config from:
   Firebase console → Project settings → Your apps → Web app → firebaseConfig */
const FIREBASE_CONFIG = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME'
};
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== 'REPLACE_ME';
