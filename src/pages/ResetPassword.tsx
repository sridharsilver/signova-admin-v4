import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Use at least 8 characters.");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Password updated (static mode)");
      nav("/");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background gradient-hero">
      <form onSubmit={submit} className="glass-card-strong p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose something strong and unique.</p>
        <div className="space-y-2">
          <Label>New password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        </div>
        <Button className="w-full gradient-primary text-white" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
