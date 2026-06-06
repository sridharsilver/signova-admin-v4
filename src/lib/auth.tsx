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

    // Verify Supabase configuration before attempting authentication
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase configuration missing – set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    // Failsafe: force loading to false after 30 seconds no matter what
    const failsafe = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out, forcing load completion.');
        setLoading(false);
      }
    }, 30000);

    let profilePromise: Promise<void> | null = null;
    const fetchProfile = async (userId: string) => {
      if (profilePromise) return profilePromise;
      
      profilePromise = (async () => {
        try {
          const dbPromise = supabase
            .from("admin_users")
            .select("*")
            .eq("id", userId)
            .single();
            
          const timeoutPromise = new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error("Database query timed out")), 30000)
          );
          
          const { data, error } = await Promise.race([dbPromise, timeoutPromise]);
            
          if (error && error.code !== "PGRST116") {
            console.error("Error fetching profile:", error);
          }
          
          if (data) {
            setProfile(data as Profile);
          } else if (!error || error.code === "PGRST116") {
            setProfile({
              id: userId,
              email: session?.user?.email || "",
              role: "employee",
              permissions: []
            } as Profile);
          }
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
        }
      })();
      
      try {
        await profilePromise;
      } finally {
        profilePromise = null;
      }
    };

    async function loadAuth() {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error("getSession timed out")), 30000)
        );
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
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
        // Fallback to clear session if it timed out
        setSession(null);
        setUser(null);
        setProfile(null);
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
