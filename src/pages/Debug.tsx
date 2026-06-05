import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Debug() {
  const [state, setState] = useState<any>({ status: "loading..." });

  useEffect(() => {
    async function load() {
      try {
        setState({ status: "loading session..." });
        
        const sessionPromise = supabase.auth.getSession();
        const timeout1 = new Promise((_, reject) => setTimeout(() => reject(new Error("getSession TIMEOUT")), 5000));
        const { data: sessionData, error: sessionError } = await Promise.race([sessionPromise, timeout1]) as any;
        
        if (sessionError || !sessionData?.session) {
          setState({ status: "Not logged in", sessionError });
          return;
        }
        
        setState({ status: "loading DB..." });
        const dbPromise = supabase.from("admin_users").select("*");
        const timeout2 = new Promise((_, reject) => setTimeout(() => reject(new Error("Database Query TIMEOUT")), 5000));
        const { data: userData, error: userError } = await Promise.race([dbPromise, timeout2]) as any;
          
        setState({
          status: "Loaded",
          user_id: sessionData.session.user.id,
          user_email: sessionData.session.user.email,
          db_error: userError,
          db_data: userData
        });
      } catch (e: any) {
        setState({ status: "Crash", error: e?.message || String(e) });
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", color: "white" }}>
      <h1>Debug DB Data</h1>
      <pre style={{ background: "#222", padding: 20 }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
