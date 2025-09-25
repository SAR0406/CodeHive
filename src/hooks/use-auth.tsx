
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface CreditData {
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: CreditData | null;
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
  const [credits, setCredits] = useState<CreditData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const profileRef = doc(db, 'profiles', user.uid);
      
      const unsubscribe = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          setCredits(doc.data() as CreditData);
        } else {
          // You might want to create the profile document here if it doesn't exist
          console.log("No profile document found for user.");
          setCredits({ credits: 100 }); // Default credits
        }
      });

      return () => unsubscribe();
    } else {
      setCredits(null);
    }
  }, [user]);

  const logOut = async () => {
    setLoading(true);
    await auth.signOut();
    setUser(null);
    setCredits(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, credits, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
