import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialising with the config from your project settings
const firebaseConfig = {
  apiKey: "", // Add your API Key from your console
  authDomain: "need-a-nerd-aa736.firebaseapp.com",
  projectId: "need-a-nerd-aa736",
  storageBucket: "need-a-nerd-aa736.appspot.com",
  messagingSenderId: "347483137809",
  appId: "1:347483137809:web:aa0523b0cfc6e7096cceb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleCheckIn = async (studentId) => {
    if (!user) return;
    try {
      setStatus('Checking in...');
      // Direct path to your collection as per the Antigravity protocols
      await addDoc(collection(db, 'artifacts', 'portfolio-engine', 'users', user.uid, 'checkins'), {
        studentId: studentId,
        timestamp: new Date().toISOString(),
        status: 'present'
      });
      setStatus('Success!');
    } catch (error) {
      setStatus('Error');
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Student Check-In</h2>
      <button 
        onClick={() => handleCheckIn('STUDENT_001')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Check-in Test Student
      </button>
      <p className="mt-2">Status: {status}</p>
    </div>
  );
}