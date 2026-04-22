import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD5uZt3DUqIKllEyFPC9MOvnA6QIeHOI74",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "literacy-quiz-8a0e9.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://literacy-quiz-8a0e9-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "literacy-quiz-8a0e9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "literacy-quiz-8a0e9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "593953618362",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:593953618362:web:67285f3fca5fc9fe0a0583",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-241RZEJQB1",
};

// Prevent duplicate app initialization (Vite HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics — only in browser and if supported
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export const db = getDatabase(app);
export default app;
