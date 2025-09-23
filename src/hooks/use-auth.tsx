
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface CreditData {
  balance: number;
  escrow_balance: number;
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
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<CreditData | null>(null);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch profile/credits in a separate function
        const { data: profile } = await supabase.from('profiles').select('balance, escrow_balance').eq('id', user.id).single();
        if (profile) {
          setCredits(profile);
        } else {
          // Profile doesn't exist, create it. This happens on first sign-in.
          const { data: newProfile, error } = await supabase.from('profiles').insert({ id: user.id, email: user.email, display_name: user.user_metadata.full_name, photo_url: user.user_metadata.avatar_url, balance: 100, escrow_balance: 0 }).select('balance, escrow_balance').single();
          if (error) console.error('Error creating profile:', error);
          if (newProfile) setCredits(newProfile);
        }
      }
      setLoading(false);
    };

    getInitialData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (event === 'SIGNED_IN' && currentUser) {
            // Refetch or create profile on sign in
             const fetchProfile = async () => {
                let { data: profile, error } = await supabase.from('profiles').select('balance, escrow_balance').eq('id', currentUser.id).single();
                if (error && error.code === 'PGRST116') { // code for "Not a single row" means no profile
                    const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({ id: currentUser.id, email: currentUser.email, display_name: currentUser.user_metadata.full_name, photo_url: currentUser.user_metadata.avatar_url, balance: 100, escrow_balance: 0 }).select('balance, escrow_balance').single();
                    if(insertError) console.error("Error creating profile on sign in:", insertError);
                    else setCredits(newProfile);
                } else if (profile) {
                    setCredits(profile);
                }
             };
             fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setCredits(null);
        }
      }
    );

    // Profile updates listener
    const profileSubscription = supabase.channel('public:profiles')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, (payload) => {
            const { balance, escrow_balance } = payload.new as { balance: number; escrow_balance: number };
            setCredits({ balance, escrow_balance });
        })
        .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(profileSubscription);
    };
  }, [supabase, user?.id]);

  const logOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
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
