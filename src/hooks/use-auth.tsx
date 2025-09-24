
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
  useCallback,
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

  const fetchAndSetProfile = useCallback(async (userId: string, userEmail?: string, fullName?: string, avatarUrl?: string) => {
    // First, try to fetch the existing profile
    let { data: profile, error } = await supabase.from('profiles').select('balance, escrow_balance').eq('id', userId).single();

    if (error && error.code === 'PGRST116') { // "PGRST116" is the code for "Not a single row found"
        // Profile doesn't exist, create it.
        const { data: newProfile, error: insertError } = await supabase.from('profiles')
            .insert({ 
                id: userId, 
                email: userEmail, 
                display_name: fullName, 
                photo_url: avatarUrl, 
                balance: 100, // Starting balance
                escrow_balance: 0 
            })
            .select('balance, escrow_balance')
            .single();

        if (insertError) {
            console.error('Error creating profile on sign-in:', insertError);
            setCredits(null); // Ensure credits are reset if profile creation fails
        } else if (newProfile) {
            setCredits(newProfile);
        }
    } else if (profile) {
        setCredits(profile);
    } else if (error) {
        console.error('Error fetching profile:', error);
        setCredits(null); // Reset credits on error
    }
  }, [supabase]);


  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchAndSetProfile(currentUser.id, currentUser.email, currentUser.user_metadata.full_name, currentUser.user_metadata.avatar_url);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(true);

        if (event === 'SIGNED_IN' && currentUser) {
            await fetchAndSetProfile(currentUser.id, currentUser.email, currentUser.user_metadata.full_name, currentUser.user_metadata.avatar_url);
        } else if (event === 'SIGNED_OUT') {
          setCredits(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchAndSetProfile]);
  
  useEffect(() => {
      // This listener reacts to real-time updates on the profiles table
      if (!user) return;

      const profileSubscription = supabase.channel(`public:profiles:id=eq.${user.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
              const { balance, escrow_balance } = payload.new as { balance: number; escrow_balance: number };
              setCredits({ balance, escrow_balance });
          })
          .subscribe();

      return () => {
          supabase.removeChannel(profileSubscription);
      };
  }, [user, supabase]);


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
