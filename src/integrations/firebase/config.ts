import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app;
let db;

try {
  // Only initialize if databaseURL is provided
  if (firebaseConfig.databaseURL) {
    // Prevent duplicate app initialization (Vite HMR)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // Analytics — only in browser and if supported
    isSupported().then((supported) => {
      if (supported && app) getAnalytics(app);
    }).catch(() => {});

    db = getDatabase(app);
  } else {
    console.warn("[Firebase] Database URL not configured. Firebase features disabled.");
  }
} catch (error) {
  console.error("[Firebase] Initialization failed:", error);
}

export { db };
export default app;
