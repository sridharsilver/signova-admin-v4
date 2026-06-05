import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Debug() {
  const [state, setState] = useState<any>({ status: "loading..." });

  useEffect(() => {
    async function load() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          setState({ status: "Not logged in", sessionError });
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from("admin_users")
          .select("*");
          
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
