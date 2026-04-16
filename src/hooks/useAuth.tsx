import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const ADMIN_CHECK_TIMEOUT = 5000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminCheckRef = useRef<string | null>(null);

  const checkAdmin = async (userId: string) => {
    if (adminCheckRef.current === userId) return;
    adminCheckRef.current = userId;
    try {
      const result = await Promise.race([
        supabase.rpc("is_admin"),
        new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("Admin check timed out")), ADMIN_CHECK_TIMEOUT)
        ),
      ]);
      setIsAdmin(!!result.data);
    } catch (err) {
      console.error("Admin check failed:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        if (!mounted) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await checkAdmin(sess.user.id);
        } else {
          setIsAdmin(false);
          adminCheckRef.current = null;
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await checkAdmin(sess.user.id);
      }
      setLoading(false);
    });

    // Fallback: if loading is still true after 6s, force it off
    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Reset admin cache so re-check happens after login
    adminCheckRef.current = null;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    adminCheckRef.current = null;
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
