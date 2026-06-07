/**
 * AuthSkeleton — shown in ProtectedRoute while the auth session is being resolved.
 * Replaces the bare Loader2 spinner with a meaningful shell skeleton so the
 * page doesn't feel blank during the auth initialisation round-trip.
 */
export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border/60 bg-card/50 shrink-0">
        <div className="h-16 border-b border-border/60 px-4 flex items-center">
          <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-muted animate-pulse"
              style={{ animationDelay: `${i * 80}ms`, opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border/60 bg-card/50 flex items-center gap-4 px-6">
          <div className="h-8 w-56 rounded-lg bg-muted animate-pulse flex-1 max-w-sm" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" style={{ animationDelay: "80ms" }} />
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" style={{ animationDelay: "160ms" }} />
          </div>
        </header>

        {/* Content area with auth indicator */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Auth progress bar at the very top */}
          <div className="fixed top-0 left-0 right-0 h-0.5 z-50 overflow-hidden bg-transparent">
            <div
              className="h-full bg-primary animate-[auth-progress_1.8s_ease-in-out_infinite]"
              style={{ width: "40%" }}
            />
          </div>

          {/* Page header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-44 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" style={{ animationDelay: "60ms" }} />
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-muted animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>

          {/* Content cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-64 rounded-2xl bg-muted animate-pulse lg:col-span-2" style={{ animationDelay: "200ms" }} />
            <div className="h-64 rounded-2xl bg-muted animate-pulse" style={{ animationDelay: "280ms" }} />
          </div>
        </main>
      </div>
    </div>
  );
}
