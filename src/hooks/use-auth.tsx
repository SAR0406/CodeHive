
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase/client-app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logOut: async () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const logOut = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
