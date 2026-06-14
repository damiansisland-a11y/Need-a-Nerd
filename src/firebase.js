// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Damian - Drop your exact Firebase project config object here once generated in the Firebase Console.
// Keep these keys stored securely in your Google Keep 'Tech Specs' note.
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'need-a-nerd.firebaseapp.com',
  projectId: 'need-a-nerd',
  storageBucket: 'need-a-nerd.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize the zero-friction ecosystem
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Optimise Google SSO for school environments
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, db, googleProvider };
