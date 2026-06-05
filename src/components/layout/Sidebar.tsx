import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ChevronLeft, Package, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "@/assets/signova-logo.png";
import logoWhite from "@/assets/signova-logo-white.png";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth";

export function Sidebar({ collapsed, onToggle, isMobile = false }: { collapsed: boolean; onToggle: () => void; isMobile?: boolean }) {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const { hasPermission, isSuperAdmin } = useAuth();
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        !isMobile && "hidden md:flex sticky top-0 h-screen",
        isMobile && "h-full w-full",
        !isMobile && (collapsed ? "w-[72px]" : "w-64")
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        {collapsed ? (
          <img src={logo} alt="Signova" className="h-8 w-8 object-contain" style={{ objectPosition: "left" }} />
        ) : (
          <img
            src={theme === "dark" ? logoWhite : logo}
            alt="Signova"
            className="h-8 w-auto object-contain"
          />
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          )}
        >
          <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Dashboard</span>}
        </NavLink>
        
        {hasPermission('products') && (
          <>
            <NavLink
              to="/products"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/products"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <Package className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Products</span>}
            </NavLink>

            <NavLink
              to="/products/categories"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/products/categories"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <ListTree className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Categories</span>}
            </NavLink>
          </>
        )}

        {hasPermission('employees') && (
          <>
            <NavLink
              to="/employees"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/employees"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {!collapsed && <span className="truncate">Employees</span>}
            </NavLink>
            <NavLink
              to="/leave"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/leave"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              {!collapsed && <span className="truncate">Leave</span>}
            </NavLink>
            <NavLink
              to="/attendance"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/attendance"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {!collapsed && <span className="truncate">Attendance</span>}
            </NavLink>
          </>
        )}

        {hasPermission('documents') && (
          <NavLink
            to="/documents"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === "/documents"
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            {!collapsed && <span className="truncate">Documents</span>}
          </NavLink>
        )}

        <NavLink
          to="/announcements"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/announcements"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m8.5 10.5-1.72-1.72a2 2 0 0 0-2.83 0L2.5 10.2A2 2 0 0 0 2.5 13l2.25 2.25"/><path d="M10 12v6a2 2 0 0 0 2 2h.5a2 2 0 0 0 2-2v-4.5"/><path d="m14 12 1.34 1.34a2 2 0 0 0 2.82 0l2.4-2.4a2 2 0 0 0 0-2.82l-1.34-1.34"/><path d="M12.5 10.5 10 8l2.25-2.25a2 2 0 0 1 2.83 0l1.72 1.72"/></svg>
          {!collapsed && <span className="truncate">Announcements</span>}
        </NavLink>

        <NavLink
          to="/reports"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/reports"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          {!collapsed && <span className="truncate">Reports</span>}
        </NavLink>

        {isSuperAdmin && (
          <NavLink
            to="/users"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-4 border-t border-sidebar-border pt-4",
              pathname === "/users"
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            )}
          >
            <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">User Management</span>}
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {!collapsed && <span className="truncate">Settings</span>}
        </NavLink>
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onToggle}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
