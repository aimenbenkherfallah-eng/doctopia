import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { requireSupabase, supabase } from '../lib/supabase';
import { isDemoMode } from '../utils/constants';

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isEditor: false,
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (isDemoMode() || !userId) {
      setProfile(null);
      return null;
    }
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('profiles')
        .select('id, name, role, created_at')
        .eq('id', userId)
        .single();
      if (error) {
        setProfile(null);
        return null;
      }
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;
        if (mounted) setUser(sessionUser);
        if (sessionUser) await fetchProfile(sessionUser.id);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    if (!supabase) return () => { mounted = false; };
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchProfile(u.id);
      else setProfile(null);
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) await fetchProfile(data.user.id);
    return data;
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(() => {
    const role = profile?.role ?? null;
    return {
      user,
      profile,
      role,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user,
      isAdmin: role === 'admin',
      isEditor: role === 'editor' || role === 'admin',
    };
  }, [user, profile, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
