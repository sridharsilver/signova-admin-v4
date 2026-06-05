import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import logo from "@/assets/signova-logo.png";
import logoWhite from "@/assets/signova-logo-white.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [fullName, setFullName] = useState("");

  if (!loading && user) return <Navigate to="/" replace />;

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setBusy(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Wait for a super admin to grant you access.");
      setMode("signin");
    }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setBusy(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reset email sent if the address exists.");
      setMode("signin");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative gradient-primary items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <img src={logoWhite} alt="Signova" className="h-14 mx-auto object-contain drop-shadow-lg" />
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome to <span className="text-gradient">OrgSphere</span>
          </h1>
          <p className="text-white/80">
            Your modern enterprise intranet for employees, leave, documents and more — secure, fast, and beautifully simple.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {["Products", "Categories", "Users"].map((t) => (
              <div key={t} className="glass-card p-3 text-xs font-medium text-white">{t}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <img src={logo} alt="Signova" className="h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin"
                ? "Enter your credentials to access the intranet."
                : mode === "signup"
                ? "Set up your account (Requires Super Admin approval)."
                : "We'll email you a secure link to reset your password."}
            </p>
          </div>
          <form onSubmit={mode === "signin" ? onSignIn : mode === "signup" ? onSignUp : onForgot} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@company.com" />
              </div>
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full gradient-primary text-white shadow-glow" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
            {mode !== "signin" && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("signin")}>
                Back to sign in
              </Button>
            )}
            {mode === "signin" && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("signup")}>
                Need an account? Sign up
              </Button>
            )}
          </form>
          <p className="text-xs text-muted-foreground text-center">
            {mode === "signup" ? "Your account must be approved by an administrator." : "Use the email your administrator provisioned for you."}
          </p>
        </div>
      </div>
    </div>
  );
}
