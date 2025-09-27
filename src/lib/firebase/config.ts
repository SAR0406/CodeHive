'use client';
import { createContext, useContext, type PropsWithChildren } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { app, db, auth } from './firebase';

type FirebaseContextType = {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
};

const FirebaseContext = createContext<FirebaseContextType>({ app: null, db: null, auth: null });

export const FirebaseProvider = ({ children }: PropsWithChildren) => {
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