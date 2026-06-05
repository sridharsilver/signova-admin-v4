import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Profile, useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AVAILABLE_MODULES = [
  { id: "products", label: "Manage Products & Categories" },
  { id: "employees", label: "Manage Employees" },
  { id: "documents", label: "Manage Documents" },
];

export default function Users() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  
  const [role, setRole] = useState("employee");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      toast.error("Failed to load users");
    } else {
      setUsers((data as Profile[]) || []);
    }
    setLoading(false);
  };

  const handleEdit = (u: Profile) => {
    setEditingUser(u);
    setRole(u.role);
    setPermissions(u.permissions || []);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("admin_users")
      .update({ role, permissions })
      .eq("id", editingUser.id);
      
    setSaving(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("User updated successfully");
      setOpen(false);
      fetchUsers();
    }
  };

  const togglePermission = (mod: string) => {
    setPermissions(prev => 
      prev.includes(mod) ? prev.filter(p => p !== mod) : [...prev, mod]
    );
  };

  if (!isSuperAdmin) {
    return <div className="p-8">Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage admin roles and module permissions for your team"
      />
      
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-accent/50">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Permissions</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{u.full_name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.role === 'super_admin' ? 'bg-primary/20 text-primary' : 
                    u.role === 'admin' ? 'bg-blue-500/20 text-blue-600' :
                    u.role === 'managing_director' ? 'bg-purple-500/20 text-purple-600' :
                    u.role === 'manager' ? 'bg-amber-500/20 text-amber-600' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {u.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions?.length > 0 ? (
                      u.permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-full text-[10px] bg-accent border border-border">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {u.role === 'super_admin' ? 'Full Access' : 'None'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
                    <UserCog className="h-4 w-4 mr-2" />
                    Edit Access
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="managing_director">Managing Director</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold block border-t pt-4">Module Permissions</Label>
              {AVAILABLE_MODULES.map(mod => (
                <label key={mod.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={permissions.includes(mod.id)}
                    onChange={() => togglePermission(mod.id)}
                  />
                  <span className="text-sm font-medium">{mod.label}</span>
                </label>
              ))}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary text-white mt-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Save Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
