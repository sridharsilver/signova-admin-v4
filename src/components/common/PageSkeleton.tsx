/**
 * PageSkeleton — used as the <Suspense> fallback for lazy-loaded routes.
 * Shows a shimmering layout that matches the AppShell so there's no flash of blank screen.
 */
export function PageSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background animate-pulse">
      {/* Sidebar placeholder */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border/60 bg-card/50 shrink-0">
        <div className="h-16 border-b border-border/60 px-4 flex items-center">
          <div className="h-8 w-28 rounded-lg bg-muted" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-muted" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar placeholder */}
        <header className="h-16 border-b border-border/60 bg-card/50 flex items-center gap-4 px-6">
          <div className="h-8 w-56 rounded-lg bg-muted flex-1 max-w-sm" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-8 w-24 rounded-lg bg-muted" />
          </div>
        </header>

        {/* Page content placeholder */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Page header */}
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-80 rounded-lg bg-muted" />
          </div>
          {/* KPI cards row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted" />
            ))}
          </div>
          {/* Content cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-64 rounded-2xl bg-muted lg:col-span-2" />
            <div className="h-64 rounded-2xl bg-muted" />
          </div>
        </main>
      </div>
    </div>
  );
}
