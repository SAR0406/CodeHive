
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBJuPhG0OIuTe4Rj6ASt9MvVMSSGf4yY6s",
  authDomain: "studio-8735887866-b7f30.firebaseapp.com",
  projectId: "studio-8735887866-b7f30",
  storageBucket: "studio-8735887866-b7f30.appspot.com",
  messagingSenderId: "722888612466",
  appId: "1:722888612466:web:ba1516da168634a89ec0eb"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
