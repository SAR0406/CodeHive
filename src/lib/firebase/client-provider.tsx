
'use client';
import { createContext, useContext, type PropsWithChildren } from 'react';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseContextType = {
  app: FirebaseApp | null;
  db: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextType>({ app: null, db: null });

export const FirebaseProvider = ({ children }: PropsWithChildren) => {
  let app: FirebaseApp;
  
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  const db = getFirestore(app);

  return (
    <FirebaseContext.Provider value={{ app, db }}>
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
