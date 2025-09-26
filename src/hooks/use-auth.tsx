
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getFirestore } from 'firebase/firestore';
import { useFirebase } from '@/lib/firebase/client-provider';

// Define a separate type for the profile data to keep things clean.
interface ProfileData {
  credits: number;
  // Add other profile fields here if needed
}

// Define the shape of our Auth context.
interface AuthContextType {
  user: User | null;
  credits: ProfileData | null;
  loading: boolean;
  logOut: () => Promise<void>;
}

// Create the context with a default value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component that will wrap our application.
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { app } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sign the user out.
  const logOut = async () => {
    if (!app) return;
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    setCredits(null);
  };
  
  // Function to create a user profile if it doesn't exist
  const createUserProfile = async (user: User) => {
    if (!app) return;
    const db = getFirestore(app);
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // User is new, create a profile with default values
      await setDoc(profileRef, {
        id: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        credits: 100, // Starting credits
        reputation: 0,
        created_at: new Date()
      });
    }
  };


  useEffect(() => {
    if (!app) {
      setLoading(false);
      return;
    }
    const auth = getAuth(app);
    
    // Set up a listener for authentication state changes.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await createUserProfile(user);
      }
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts.
    return () => unsubscribe();
  }, [app]);

  useEffect(() => {
    // This effect listens for changes to the user's profile in the database.
    if (user && app) {
      const db = getFirestore(app);
      const profileRef = doc(db, 'profiles', user.uid);
      
      const unsubscribe = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            setCredits(doc.data() as ProfileData);
        } else {
            // This might happen briefly if the profile is being created
            setCredits(null);
        }
      }, (error) => {
          console.error("Error listening to profile changes:", error);
          setCredits(null);
      });

      // Cleanup the channel when the component unmounts or the user changes.
      return () => unsubscribe();
    }
  }, [user, app]);

  // The value provided to the context consumers.
  const value = {
    user,
    credits,
    loading,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
