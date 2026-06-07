import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the session to localStorage on every sign-in
    persistSession: true,
    // Silently refresh the JWT before it expires (prevents sudden logouts)
    autoRefreshToken: true,
    // Read auth tokens from the URL hash (for magic links / OAuth)
    detectSessionInUrl: true,
    // ⚠️ Do NOT override storageKey — Supabase uses a project-specific default
    // key derived from the project URL. Overriding it causes existing sessions
    // to be 'lost', forcing a slow server-side validation on every page load.
  },
});


