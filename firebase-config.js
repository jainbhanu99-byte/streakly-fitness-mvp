/* Firebase project config. These values are NOT secret — they're meant to
   be public in client-side code (Firestore/Auth security is enforced by
   firestore.rules, not by hiding this object). Replace the placeholder
   below with the config from:
   Firebase console → Project settings → Your apps → Web app → firebaseConfig */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCqWle04vRfA8b9iUwtwoF9By5N8o97udc',
  authDomain: 'sprout-bd7f0.firebaseapp.com',
  projectId: 'sprout-bd7f0',
  storageBucket: 'sprout-bd7f0.firebasestorage.app',
  messagingSenderId: '22818690532',
  appId: '1:22818690532:web:eb7c5fbbef0576f40de3f1'
};
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== 'REPLACE_ME';
