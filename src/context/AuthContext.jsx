import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // Full row from the `employe` table — includes role, nom, prenom, solde_conge, etc.
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // fetchProfile is intentionally self-contained: it catches every failure
  // internally and signs the user out when the profile row cannot be resolved.
  // This prevents a permanently broken state where the auth token exists but
  // points to a user with no corresponding employe row (e.g. after a failed
  // two-step employee creation, or a corrupted admin-client session write).
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('employe')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) throw error ?? new Error('No profile row for this user');
      setProfile(data);
    } catch (err) {
      console.error('[AuthContext] fetchProfile failed — clearing session:', err.message);
      setProfile(null);
      // Sign out so onAuthStateChange fires with null session, the app
      // redirects to /login, and isLoading is never left as true.
      await supabase.auth.signOut();
    }
  }

  useEffect(() => {
    let mounted = true;
    // Guards onAuthStateChange from processing any event (SIGNED_IN,
    // INITIAL_SESSION, etc.) that fires while initializePromise is still
    // pending. Without this, the SIGNED_IN emitted by _recoverAndRefresh()
    // causes fetchProfile → getSession → await initializePromise → deadlock.
    let initCompleted = false;

    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) throw error;
        setSession(session);
        if (session?.user) await fetchProfile(session.user.id);
      } catch (err) {
        console.error('[AuthContext] init error:', err);
        if (mounted) { setSession(null); setProfile(null); }
      } finally {
        initCompleted = true;
        if (mounted) setIsLoading(false);
      }
    }

    init();

    // Only handle events that fire AFTER init() has completed. Events emitted
    // during initializePromise (INITIAL_SESSION, the SIGNED_IN from
    // _recoverAndRefresh) are skipped — init() already captured that state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !initCompleted || event === 'INITIAL_SESSION') return;
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /** Returns { data, error } — caller handles navigation */
  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const logout = async () => {
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
