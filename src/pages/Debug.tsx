import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Debug() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("Not logged in");
        return;
      }
      
      const { data: userData, error: userError } = await supabase
        .from("admin_users")
        .select("*");
        
      if (userError) setError(userError);
      else setData(userData);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", color: "white" }}>
      <h1>Debug DB Data</h1>
      <pre style={{ background: "#222", padding: 20 }}>
        {error ? JSON.stringify(error, null, 2) : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
