import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Profile = { name: string; college: string; city: string };

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; code?: string }>;
  signUp: (email: string, password: string, profile: Profile) => Promise<{ error: string | null }>;
  resendSignupConfirmation: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        // Defer profile fetch to avoid deadlocks
        setTimeout(() => fetchProfile(s.user.id), 0);
      } else {
        setProfile(null);
      }
    });
    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) fetchProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchProfile(id: string) {
    const { data } = await supabase.from("profiles").select("name,college,city").eq("id", id).maybeSingle();
    if (data) setProfile(data as Profile);
  }

  const value: AuthCtx = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null, code: error?.code };
    },
    async signUp(email, password, p) {
      // Do not set emailRedirectTo here: GoTrue validates it against the project's redirect allow list.
      // A missing entry causes errors like "Invalid path specified in request URL". Confirmation links
      // use the Site URL from Supabase Dashboard → Authentication → URL Configuration.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: p },
      });
      return { error: error?.message ?? null };
    },
    async resendSignupConfirmation(email) {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
