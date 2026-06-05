import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AppRole = "super_admin" | "admin" | "manager" | "managing_director" | "employee";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  permissions: string[];
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (module: string) => boolean;
  isSuperAdmin: boolean;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Failsafe: force loading to false after 5 seconds no matter what
    const failsafe = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth initialization timed out, forcing load completion.");
        setLoading(false);
      }
    }, 5000);

    async function loadAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(failsafe);
      }
    }

    loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
      clearTimeout(failsafe);
    });

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isSuperAdmin = profile?.role === "super_admin";

  const hasPermission = (module: string) => {
    if (!profile) return false;
    if (isSuperAdmin) return true;
    return profile.permissions?.includes(module) ?? false;
  };

  return (
    <Ctx.Provider value={{ user, session, profile, loading, signOut, hasPermission, isSuperAdmin }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
