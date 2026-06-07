import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { queryCache } from "./queryCache";

export type AppRole = "super_admin" | "admin" | "manager" | "managing_director" | "employee";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  permissions: string[];
  photo_url?: string | null;
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

// ── Persistent profile cache (sessionStorage) ─────────────────────────────────
// Rule: ONLY real DB profiles are cached — fallbacks are NEVER cached.
// This prevents a failed fetch from locking in a wrong role across sessions.

const CACHE_KEY_PREFIX = "signova-admin-profile-";

function getCachedProfile(userId: string): Profile | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + userId);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch { return null; }
}
function setCachedProfile(userId: string, p: Profile): void {
  try { sessionStorage.setItem(CACHE_KEY_PREFIX + userId, JSON.stringify(p)); }
  catch { /* unavailable in some private-mode contexts */ }
}
function clearCachedProfile(userId: string): void {
  try { sessionStorage.removeItem(CACHE_KEY_PREFIX + userId); }
  catch { /* noop */ }
}

// ── Synchronous localStorage session reader ───────────────────────────────────
// Reads and reconstructs the full Supabase Session object WITHOUT any network
// call. Supabase v2 stores the complete session (including user, tokens, expiry)
// under: sb-<projectRef>-auth-token
//
// This lets us set session/user/profile state instantly on page load, then
// validate in the background — completely eliminating the slow getSession() from
// the critical render path.

interface LocalSession {
  session: Session;         // full reconstructed Session object
  userId: string;
  expiresAt: number;        // unix seconds
}

function readLocalSession(): LocalSession | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const userId: string | undefined = parsed?.user?.id;
      if (!userId) continue;
      // Cast the stored object to Session — Supabase stores it in the same shape
      return {
        session: parsed as Session,
        userId,
        expiresAt: parsed?.expires_at ?? 0,
      };
    }
  } catch { /* noop */ }
  return null;
}

/** Returns true if the stored token has less than 60 s until expiry. */
function isTokenExpired({ expiresAt }: LocalSession): boolean {
  return Date.now() / 1000 > expiresAt - 60;
}

// ── Silently fetch & cache profile from DB ────────────────────────────────────
// Returns: fresh DB profile (caches it) | existing cache | null
// NEVER caches a fallback — callers handle the null/fallback case themselves.
async function fetchAndCacheProfile(
  userId: string,
  s: Session | null,
  existingCache: Profile | null,
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Profile fetch error:", error);
    }

    if (data) {
      const p: Profile = { ...data, role: data.role || "employee" };
      setCachedProfile(userId, p);
      return p;
    }
    // DB row not found — keep existing cache (preserves real role) rather than
    // downgrading to "employee" fallback
    return existingCache;
  } catch (err) {
    console.error("Unexpected profile fetch error:", err);
    return existingCache; // error: keep what we had
  }
}

function buildFallback(userId: string, s: Session | null): Profile {
  return {
    id: userId,
    email: s?.user?.email ?? "",
    full_name: s?.user?.user_metadata?.full_name ?? null,
    role: "employee",
    permissions: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
      setLoading(false);
      return;
    }

    // Failsafe ONLY for the slow path (expired token needing server refresh).
    // Does NOT sign out — just unblocks the loading screen so the user isn't frozen.
    const failsafe = setTimeout(() => {
      if (mounted) {
        console.warn("⏱ Supabase token refresh is slow (project may be waking up). Rendering with current state.");
        setLoading(false);
      }
    }, 12_000);

    async function loadAuth() {
      // ── FAST PATH ── valid token + cached profile, zero network calls ─────
      // Check localStorage synchronously — no network, no wait.
      const local = readLocalSession();
      const cached = local ? getCachedProfile(local.userId) : null;

      if (local && cached && !isTokenExpired(local)) {
        // ✅ Render the full UI immediately from localStorage + sessionStorage
        if (mounted) {
          setSession(local.session);
          setUser(local.session.user);
          setProfile(cached);
          setLoading(false);
          clearTimeout(failsafe);
        }

        // Background: silently re-validate with Supabase and refresh profile.
        // User never sees a loading state during this step.
        supabase.auth.getSession()
          .then(async ({ data: { session } }) => {
            if (!mounted) return;
            if (session) {
              setSession(session);
              setUser(session.user);
              const fresh = await fetchAndCacheProfile(session.user.id, session, cached);
              if (mounted && fresh) setProfile(fresh);
            } else {
              // Server says session is gone — sign out cleanly
              clearCachedProfile(local.userId);
              setSession(null); setUser(null); setProfile(null);
            }
          })
          .catch((err) => console.error("Background session refresh failed:", err));

        return; // ✅ Done — UI is already painted
      }

      // ── SLOW PATH ── expired token or no cache, must call getSession() ────
      // This hits the network (Supabase token refresh) and may take several
      // seconds if the project is waking up. The failsafe above covers > 12 s.
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userId = session.user.id;
          // If cache from earlier is present (e.g. stale token was refreshed),
          // show it immediately and re-fetch in background.
          if (cached) {
            setProfile(cached);
            setLoading(false);
            clearTimeout(failsafe);
            fetchAndCacheProfile(userId, session, cached).then((fresh) => {
              if (mounted && fresh) setProfile(fresh);
            });
          } else {
            // Cold start — wait for fresh profile before unblocking
            const dbProfile = await fetchAndCacheProfile(userId, session, null);
            if (mounted) setProfile(dbProfile ?? buildFallback(userId, session));
          }
        } else {
          // No session at all
          if (local) clearCachedProfile(local.userId);
          if (mounted) { setSession(null); setUser(null); setProfile(null); }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        // On error: keep optimistic cache if we had one, otherwise clear
        if (!cached && mounted) { setSession(null); setUser(null); setProfile(null); }
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(failsafe);
      }
    }

    loadAuth();

    // Handle auth events after the initial load (sign-in, sign-out, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "INITIAL_SESSION") return; // handled by loadAuth

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userId = session.user.id;
          const existing = getCachedProfile(userId);
          const fresh = await fetchAndCacheProfile(userId, session, existing);
          if (mounted) setProfile(fresh ?? buildFallback(userId, session));
        } else {
          if (user) clearCachedProfile(user.id);
          if (mounted) setProfile(null);
        }

        if (mounted) { setLoading(false); clearTimeout(failsafe); }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    if (user) clearCachedProfile(user.id);
    queryCache.clear();
    await supabase.auth.signOut();
  }, [user]);

  const isSuperAdmin = useMemo(() => profile?.role === "super_admin", [profile?.role]);

  const hasPermission = useCallback(
    (module: string) => {
      if (!profile) return false;
      if (isSuperAdmin) return true;
      return profile.permissions?.includes(module) ?? false;
    },
    [profile, isSuperAdmin]
  );

  const value = useMemo<AuthCtx>(
    () => ({ user, session, profile, loading, signOut, hasPermission, isSuperAdmin }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, profile, loading, isSuperAdmin]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
