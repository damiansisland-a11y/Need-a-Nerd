// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Damian - Drop your exact Firebase project config object here once generated in the Firebase Console.
// Keep these keys stored securely in your Google Keep 'Tech Specs' note.
const firebaseConfig = {
  apiKey: "AIzaSyDy_QVEtqVCRngMAMTaOn4z8sa1zG90ZiU",
  authDomain: "need-a-nerd-aa736.firebaseapp.com",
  projectId: "need-a-nerd-aa736",
  storageBucket: "need-a-nerd-aa736.firebasestorage.app",
  messagingSenderId: "347483137809",
  appId: "1:347483137809:web:aa0523b0cfc6e7096cceb0"
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
