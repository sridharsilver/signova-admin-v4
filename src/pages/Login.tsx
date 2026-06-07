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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-animated-mesh relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-glow/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card-strong p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/10 rounded-2xl shadow-sm backdrop-blur-md border border-white/20 dark:bg-black/10 dark:border-white/10">
                <img src={logo} alt="Signova" className="h-10 object-contain block dark:hidden" width={120} height={40} />
                <img src={logoWhite} alt="Signova" className="h-10 object-contain hidden dark:block" width={120} height={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Enter your credentials to access the intranet."
                : mode === "signup"
                ? "Set up your account (Requires Super Admin approval)."
                : "We'll email you a secure link to reset your password."}
            </p>
          </div>

          {/* Indeterminate progress bar shown during API call */}
          {busy && (
            <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '60%', marginLeft: '-20%', animation: 'auth-bar 1.5s ease-in-out infinite' }} />
            </div>
          )}

          <form onSubmit={mode === "signin" ? onSignIn : mode === "signup" ? onSignUp : onForgot} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                <Label htmlFor="fullName" className="text-foreground/80">Full name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="bg-background/50 border-border/50 focus:bg-background transition-colors" />
              </div>
            )}
            
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-foreground/80">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors" placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2 group animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:text-primary-glow hover:underline transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gradient-primary text-white shadow-glow hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
            
            <div className="flex flex-col space-y-2 pt-2">
              {mode !== "signin" && (
                <Button type="button" variant="ghost" className="w-full hover:bg-muted/50 transition-colors" onClick={() => setMode("signin")}>
                  Back to sign in
                </Button>
              )}
            </div>
          </form>

          <p className="text-xs text-muted-foreground/80 text-center mt-6">
            {mode === "signup" ? "Your account must be approved by an administrator." : "Use the email your administrator provisioned for you."}
          </p>
        </div>
      </div>
    </div>
  );
}
