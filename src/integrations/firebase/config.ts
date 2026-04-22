import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD5uZt3DUqIKllEyFPC9MOvnA6QIeHOI74",
  authDomain: "literacy-quiz-8a0e9.firebaseapp.com",
  databaseURL: "https://literacy-quiz-8a0e9-default-rtdb.firebaseio.com/",
  projectId: "literacy-quiz-8a0e9",
  storageBucket: "literacy-quiz-8a0e9.firebasestorage.app",
  messagingSenderId: "593953618362",
  appId: "1:593953618362:web:67285f3fca5fc9fe0a0583",
  measurementId: "G-241RZEJQB1",
};

let app;
let db;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  isSupported().then((supported) => {
    if (supported && app) getAnalytics(app);
  }).catch(() => {});

  db = getDatabase(app);
} catch (error) {
  console.error("[Firebase] Initialization failed:", error);
}

export { db };
export default app;
