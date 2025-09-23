
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
import { doc, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore';

interface CreditData {
    balance: number;
    escrowBalance: number;
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
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const creditRef = doc(db, 'credits', user.uid);

        // Use onSnapshot to listen for real-time updates to credits
        const unsubCredits = onSnapshot(creditRef, (snapshot) => {
          if (snapshot.exists()) {
            setCredits(snapshot.data() as CreditData);
          } else {
            // User exists but credit doc doesn't. This can happen on first login.
            // We will create it along with the user doc if needed.
             // Let's check the user doc first.
            const unsubUser = onSnapshot(userRef, async (userSnap) => {
                if (!userSnap.exists()) {
                    // This is a new user, create both user and credit documents in a batch
                    try {
                        const batch = writeBatch(db);
                        
                        // Set user data
                        batch.set(userRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            createdAt: serverTimestamp(),
                        });

                        // Set initial credits
                        batch.set(creditRef, { balance: 100, escrowBalance: 0 });

                        await batch.commit();
                        setCredits({ balance: 100, escrowBalance: 0 });
                    } catch (error) {
                        console.error("Error creating new user documents:", error);
                    }
                }
                 unsubUser(); // We only need to check this once.
            });
          }
        });

        // Set the user and stop loading
        setLoading(false);

        // Return cleanup function for credit listener
        return () => unsubCredits();

      } else {
        setUser(null);
        setCredits(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);


  const logOut = async () => {
    setLoading(true);
    await signOut(auth);
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
