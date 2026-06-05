import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, module }: { children: React.ReactNode; module?: string }) {
  const { user, loading, hasPermission } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Authenticating...</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm text-center">If you are stuck on this screen, please check your internet connection or ensure Supabase is configured correctly.</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (module && !hasPermission(module)) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to access the {module} module.</p>
      </div>
    );
  }

  return <>{children}</>;
}
