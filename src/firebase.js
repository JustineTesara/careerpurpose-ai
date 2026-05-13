// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbV8OJihPRr93iHJH6AWfAaf9Ewi64X2Y",
  authDomain: "careerpurpose-ai.firebaseapp.com",
  projectId: "careerpurpose-ai",
  storageBucket: "careerpurpose-ai.firebasestorage.app",
  messagingSenderId: "420440668930",
  appId: "1:420440668930:web:372186d84d66306773a01b",
  measurementId: "G-YY7KMJHEH8",
};

// Initialize app FIRST before anything else
const app = initializeApp(firebaseConfig);

// Then initialize services AFTER app is ready
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export at the bottom, never inline
export { auth, provider, db };
