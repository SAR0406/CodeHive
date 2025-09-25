// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  // This check ensures Firebase is only initialized on the client side.
  // It avoids build errors during server-side rendering (SSR).
  if (typeof window === 'undefined') {
    return;
  }

  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API key is not defined. Please check your environment variables.");
  }
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// Call initializeFirebase to ensure it's set up on first client-side load
initializeFirebase();

function getFirebaseApp(): FirebaseApp {
    if (!app) initializeFirebase();
    return app;
}

function getFirebaseAuth(): Auth {
    if (!auth) initializeFirebase();
    return auth;
}

function getFirebaseDb(): Firestore {
    if (!db) initializeFirebase();
    return db;
}


export { getFirebaseApp, getFirebaseAuth, getFirebaseDb };
