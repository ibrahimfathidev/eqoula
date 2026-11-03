import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfile, type Profile } from "@/lib/data";

interface AuthState {
  session: Session | null;
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const current = data.session ?? null;
    setSession(current);
    if (current?.user) {
      const p = await fetchMyProfile(current.user.id);
      setProfile(p);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // Identity change: re-render routes so guards re-evaluate.
      router.invalidate();
      if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
      } else {
        void refresh();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [refresh, router]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }, [queryClient, router]);

  return (
    <AuthContext.Provider
      value={{ session, userId: session?.user?.id ?? null, profile, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Where a signed-in user should land, given their profile (or lack of one). */
export function destinationFor(profile: Profile | null): string {
  if (!profile) return "/onboarding";
  return profile.role === "educator" ? "/org" : "/dashboard";
}
