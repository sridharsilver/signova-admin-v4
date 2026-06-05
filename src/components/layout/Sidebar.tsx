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
