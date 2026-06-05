import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Dept { id: string; name: string; code: string; description: string | null }
interface Holiday { id: string; date: string; name: string }

const mockDepts: Dept[] = [
  { id: "1", name: "Engineering", code: "ENG", description: "Product development" },
  { id: "2", name: "Marketing", code: "MKT", description: "Brand and growth" },
  { id: "3", name: "Human Resources", code: "HR", description: "People and culture" },
];
const mockHols: Holiday[] = [
  { id: "1", date: "2024-12-25", name: "Christmas Day" },
  { id: "2", date: "2025-01-01", name: "New Year's Day" },
];

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [depts, setDepts] = useState<Dept[]>(mockDepts);
  const [hols, setHols] = useState<Holiday[]>(mockHols);
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const [newHol, setNewHol] = useState({ date: "", name: "" });
  const [frontendUrl, setFrontendUrl] = useState(() => localStorage.getItem('frontendUrl') || "https://1signova.pages.dev");

  const saveFrontendUrl = () => {
    localStorage.setItem('frontendUrl', frontendUrl);
    toast.success("Frontend URL updated");
  };

  const addDept = () => {
    if (!newDept.name || !newDept.code) return;
    setDepts((prev) => [...prev, { id: crypto.randomUUID(), name: newDept.name, code: newDept.code, description: null }]);
    setNewDept({ name: "", code: "" });
    toast.success("Department added");
  };
  const delDept = (id: string) => {
    setDepts((prev) => prev.filter((d) => d.id !== id));
    toast.success("Department removed");
  };
  const addHol = () => {
    if (!newHol.date || !newHol.name) return;
    setHols((prev) => [...prev, { id: crypto.randomUUID(), ...newHol }]);
    setNewHol({ date: "", name: "" });
    toast.success("Holiday added");
  };
  const delHol = (id: string) => {
    setHols((prev) => prev.filter((h) => h.id !== id));
    toast.success("Holiday removed");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage organisation configuration." />
      {!isSuperAdmin && <div className="glass-card p-6 text-sm text-muted-foreground">Only administrators can change settings.</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3">Departments</h3>
          {isSuperAdmin && (
            <div className="flex gap-2 mb-4">
              <Input placeholder="Name" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} />
              <Input placeholder="Code" className="w-24" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })} />
              <Button onClick={addDept}><Plus className="h-4 w-4" /></Button>
            </div>
          )}
          <div className="space-y-2">
            {depts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div><div className="font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{d.code}</div></div>
                {isSuperAdmin && <Button size="icon" variant="ghost" onClick={() => delDept(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3">Holidays</h3>
          {isSuperAdmin && (
            <div className="flex gap-2 mb-4">
              <Input type="date" value={newHol.date} onChange={(e) => setNewHol({ ...newHol, date: e.target.value })} />
              <Input placeholder="Name" value={newHol.name} onChange={(e) => setNewHol({ ...newHol, name: e.target.value })} />
              <Button onClick={addHol}><Plus className="h-4 w-4" /></Button>
            </div>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {hols.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div><div className="font-medium">{h.name}</div><div className="text-xs text-muted-foreground">{h.date}</div></div>
                {isSuperAdmin && <Button size="icon" variant="ghost" onClick={() => delHol(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">System Configuration</h3>
          {isSuperAdmin ? (
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label>Frontend Public URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={frontendUrl} 
                    onChange={(e) => setFrontendUrl(e.target.value)} 
                    placeholder="e.g. https://1signova.pages.dev" 
                  />
                  <Button onClick={saveFrontendUrl}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for generating QR codes to point to the correct public website.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Only administrators can change system configuration.</div>
          )}
        </div>
      </div>
    </div>
  );
}
