
'use client';
import { createContext, useContext, type PropsWithChildren } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { app, db, auth } from './firebase'; // Import the initialized instances

type FirebaseContextType = {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
};

// The context now holds the single, initialized instances.
const FirebaseContext = createContext<FirebaseContextType>({ app, db, auth });

export const FirebaseProvider = ({ children }: PropsWithChildren) => {
  // The value is now constant, ensuring all consumers get the same Firebase instances.
  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
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
