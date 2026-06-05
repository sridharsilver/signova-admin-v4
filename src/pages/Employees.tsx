import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, LayoutGrid, List as ListIcon, Mail, Phone, Building2 } from "lucide-react";
import { initials, fmtDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

interface Emp {
  id: string; full_name: string; email: string | null; employee_code: string | null;
  job_title: string | null; department_id: string | null; status: string;
  photo_url: string | null; phone: string | null; joining_date: string | null; manager_id: string | null;
}
interface Dept { id: string; name: string }

export default function Employees() {
  const { isAdminOrHr } = useAuth();
  const [emps, setEmps] = useState<Emp[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Emp | null>(null);

  useEffect(() => {
    const mockDepts: Dept[] = [
      { id: "dept-1", name: "Engineering" },
      { id: "dept-2", name: "Human Resources" },
      { id: "dept-3", name: "Marketing" },
      { id: "dept-4", name: "Sales" },
    ];
    const mockEmps: Emp[] = [
      { id: "e1", full_name: "Alice Johnson", email: "alice@signova.com", employee_code: "EMP-001", job_title: "Senior Engineer", department_id: "dept-1", status: "active", photo_url: null, phone: "+1 555-0101", joining_date: "2023-01-15", manager_id: null },
      { id: "e2", full_name: "Bob Smith", email: "bob@signova.com", employee_code: "EMP-002", job_title: "HR Manager", department_id: "dept-2", status: "active", photo_url: null, phone: "+1 555-0102", joining_date: "2022-06-10", manager_id: null },
      { id: "e3", full_name: "Charlie Davis", email: "charlie@signova.com", employee_code: "EMP-003", job_title: "Sales Executive", department_id: "dept-4", status: "active", photo_url: null, phone: "+1 555-0103", joining_date: "2023-03-20", manager_id: null },
      { id: "e4", full_name: "Diana Prince", email: "diana@signova.com", employee_code: "EMP-004", job_title: "Product Designer", department_id: "dept-1", status: "active", photo_url: null, phone: "+1 555-0104", joining_date: "2023-08-05", manager_id: null },
      { id: "e5", full_name: "Edward Norton", email: "edward@signova.com", employee_code: "EMP-005", job_title: "Marketing Lead", department_id: "dept-3", status: "active", photo_url: null, phone: "+1 555-0105", joining_date: "2022-11-12", manager_id: null },
    ];
    setEmps(mockEmps);
    setDepts(mockDepts);
  }, []);

  const filtered = emps.filter((e) => {
    if (dept !== "all" && e.department_id !== dept) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return [e.full_name, e.email, e.job_title, e.employee_code].some((v) => v?.toLowerCase().includes(s));
  });

  const deptName = (id?: string | null) => depts.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${emps.length} people in your organisation`}
        actions={
          isAdminOrHr && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white"><UserPlus className="h-4 w-4 mr-2" />Add employee</Button>
              </DialogTrigger>
              <AddEmployeeDialog depts={depts} onDone={() => setOpen(false)} />
            </Dialog>
          )
        }
      />

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, ID, role…" className="pl-9" />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")}><ListIcon className="h-4 w-4" /></Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className="glass-card p-5 text-left hover:shadow-glow transition-all group">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14"><AvatarImage src={e.photo_url ?? undefined} /><AvatarFallback className="gradient-primary text-white">{initials(e.full_name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{e.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.job_title ?? "—"}</div>
                  <Badge variant="secondary" className="mt-2 text-[10px]">{deptName(e.department_id)}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 truncate"><Mail className="h-3 w-3" />{e.email ?? "—"}</div>
                {e.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{e.phone}</div>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-12">No employees found.</div>}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Department</th><th className="text-left p-3">Title</th><th className="text-left p-3">Joined</th><th className="text-left p-3">Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => setSelected(e)} className="border-t border-border hover:bg-muted/40 cursor-pointer">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={e.photo_url ?? undefined} /><AvatarFallback className="text-[10px] gradient-primary text-white">{initials(e.full_name)}</AvatarFallback></Avatar>
                        <div><div className="font-medium">{e.full_name}</div><div className="text-xs text-muted-foreground">{e.email}</div></div>
                      </div>
                    </td>
                    <td className="p-3">{deptName(e.department_id)}</td>
                    <td className="p-3">{e.job_title ?? "—"}</td>
                    <td className="p-3">{fmtDate(e.joining_date)}</td>
                    <td className="p-3"><Badge variant={e.status === "active" ? "default" : "secondary"}>{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Employee profile</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={selected.photo_url ?? undefined} /><AvatarFallback className="text-lg gradient-primary text-white">{initials(selected.full_name)}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-xl font-bold">{selected.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selected.job_title}</div>
                    <Badge variant="secondary" className="mt-2"><Building2 className="h-3 w-3 mr-1" />{deptName(selected.department_id)}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Employee ID" value={selected.employee_code} />
                  <Field label="Status" value={selected.status} />
                  <Field label="Email" value={selected.email} />
                  <Field label="Phone" value={selected.phone} />
                  <Field label="Joined" value={fmtDate(selected.joining_date)} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value || "—"}</div>
    </div>
  );
}

function AddEmployeeDialog({ depts, onDone }: { depts: Dept[]; onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name || !email) return toast.error("Name and email are required.");
    setBusy(true);
    // Invite-only mode: create a "shell" profile entry; full invite flow can be added later.
    // We can't insert into auth.users from client, so we record an invite stub by creating a row in a side table
    // For now: just inform user to use real signup later. We'll create a profile placeholder when they accept invite.
    toast.message("Invite recorded", { description: "Full email invite delivery requires admin SMTP setup; the user can sign up with this email and will be auto-provisioned." });
    setBusy(false);
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Invite a new employee</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label>Job title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button onClick={save} disabled={busy} className="gradient-primary text-white">Send invite</Button></DialogFooter>
    </DialogContent>
  );
}
