import { Bell, Moon, Search, Sun, LogOut, User as UserIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, roleLabel } from "@/lib/format";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, unread, markAllRead } = useNotifications();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search employees, leave, documents…" className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background" />
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              {unread > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</div>
              ) : (
                items.slice(0, 12).map((n) => (
                  <Link key={n.id} to={n.link ?? "#"} className="block p-3 hover:bg-muted/60 border-b last:border-0">
                    <div className="flex items-start gap-2">
                      {!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{n.title}</div>
                        {n.body && <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3 h-10">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.photo_url ?? undefined} />
                <AvatarFallback className="text-xs gradient-primary text-white">
                  {initials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold truncate max-w-[140px]">{profile?.full_name || "User"}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{profile?.role?.replace("_", " ") || "No Role"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground">{profile?.email}</span>
                {profile?.role && (
                  <Badge variant="secondary" className="mt-2 w-fit text-[10px] capitalize">
                    {profile.role.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => { await signOut(); navigate("/login"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
