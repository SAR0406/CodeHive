
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app, db } from '@/lib/firebase/client-app';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: number | null;
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
  const [credits, setCredits] = useState<number | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const creditRef = doc(db, 'credits', user.uid);
      const unsubscribe = onSnapshot(creditRef, (snapshot) => {
        if (snapshot.exists()) {
          setCredits(snapshot.data().balance);
        } else {
          // If the user is new, create their credit document
          setDoc(creditRef, { balance: 1250 }).then(() => {
            setCredits(1250);
          });
        }
      });
      return () => unsubscribe();
    } else {
      setCredits(null);
    }
  }, [user]);

  const logOut = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
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
