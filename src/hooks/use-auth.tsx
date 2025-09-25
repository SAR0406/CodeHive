
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

interface ProfileData {
  credits: number;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: ProfileData | null;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  credits: null,
  logOut: async () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<ProfileData | null>(null);
  
  const logOut = async () => {
    setLoading(true);
    const auth = getFirebaseAuth();
    await auth.signOut();
    setUser(null);
    setCredits(null);
    setLoading(false);
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const profileRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(profileRef);
        if (!docSnap.exists()) {
          // Create a new profile document if it doesn't exist
          try {
            await setDoc(profileRef, {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              credits: 100, // Initial credits for new users
            });
          } catch (error) {
            console.error("Error creating user profile:", error);
          }
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const db = getFirebaseDb();
      const profileRef = doc(db, 'profiles', user.uid);
      
      const unsubscribe = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          setCredits(doc.data() as ProfileData);
        } else {
          setCredits(null);
        }
      });

      return () => unsubscribe();
    } else {
      setCredits(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, credits, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
