
'use client';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({ app: null, auth: null, db: null });

export const FirebaseProvider = ({ children }: PropsWithChildren) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
      const initializedApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      setApp(initializedApp);
      setAuth(getAuth(initializedApp));
      setDb(getFirestore(initializedApp));
    }
  }, []);
  

  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
