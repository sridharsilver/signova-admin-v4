import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, module }: { children: React.ReactNode; module?: string }) {
  const { user, loading, hasPermission } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="h-screen w-full bg-background" />;
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
