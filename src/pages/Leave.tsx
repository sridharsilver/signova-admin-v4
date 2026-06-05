import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalIcon, Check, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";
import { differenceInCalendarDays } from "date-fns";

interface LeaveType { id: string; name: string; code: string; color: string }
interface LeaveReq {
  id: string; user_id: string; leave_type_id: string;
  start_date: string; end_date: string; days: number;
  reason: string | null; status: string; created_at: string;
}
interface Balance { leave_type_id: string; allocated: number; used: number; year: number }

const statusBadge: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default", pending: "secondary", manager_approved: "secondary",
  rejected: "destructive", cancelled: "secondary",
};

const mockTypes: LeaveType[] = [
  { id: "t1", name: "Annual Leave", code: "AL", color: "hsl(var(--primary))" },
  { id: "t2", name: "Sick Leave", code: "SL", color: "hsl(var(--destructive))" },
  { id: "t3", name: "Casual Leave", code: "CL", color: "hsl(var(--warning))" },
  { id: "t4", name: "Maternity Leave", code: "ML", color: "hsl(var(--info))" },
];
const mockMine: LeaveReq[] = [
  { id: "m1", user_id: "mock-uid", leave_type_id: "t1", start_date: "2024-06-01", end_date: "2024-06-05", days: 5, reason: "Summer vacation", status: "approved", created_at: new Date().toISOString() },
  { id: "m2", user_id: "mock-uid", leave_type_id: "t2", start_date: "2024-05-02", end_date: "2024-05-02", days: 1, reason: "Fever", status: "approved", created_at: new Date().toISOString() },
];
const mockAll: LeaveReq[] = [
  ...mockMine,
  { id: "a1", user_id: "u2", leave_type_id: "t1", start_date: "2024-05-20", end_date: "2024-05-22", days: 3, reason: "Family event", status: "pending", created_at: new Date().toISOString() },
  { id: "a2", user_id: "u3", leave_type_id: "t3", start_date: "2024-05-15", end_date: "2024-05-15", days: 1, reason: "Personal work", status: "manager_approved", created_at: new Date().toISOString() },
];
const mockBalances: Balance[] = [
  { leave_type_id: "t1", allocated: 20, used: 5, year: 2024 },
  { leave_type_id: "t2", allocated: 12, used: 1, year: 2024 },
  { leave_type_id: "t3", allocated: 10, used: 0, year: 2024 },
  { leave_type_id: "t4", allocated: 90, used: 0, year: 2024 },
];
const mockProfiles: Record<string, { full_name: string }> = {
  "mock-uid": { full_name: "Signova Administrator" },
  "u2": { full_name: "Alice Johnson" },
  "u3": { full_name: "Bob Smith" },
};

export default function Leave() {
  const { isAdminOrHr, hasRole } = useAuth();
  const [types] = useState<LeaveType[]>(mockTypes);
  const [mine] = useState<LeaveReq[]>(mockMine);
  const [all] = useState<LeaveReq[]>(mockAll);
  const [balances] = useState<Balance[]>(mockBalances);
  const [profiles] = useState<Record<string, { full_name: string }>>(mockProfiles);
  const [open, setOpen] = useState(false);

  const updateStatus = (id: string, status: string) => {
    toast.success(`Leave ${status} (static mode)`);
  };

  const pending = all.filter((r) => r.status === "pending" || r.status === "manager_approved");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Apply for leave, track balances, and manage approvals."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" />Apply for leave</Button>
            </DialogTrigger>
            <ApplyDialog types={types} onDone={() => setOpen(false)} />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types.map((t) => {
          const b = balances.find((x) => x.leave_type_id === t.id);
          const remaining = (b?.allocated ?? 0) - (b?.used ?? 0);
          return (
            <div key={t.id} className="glass-card p-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.name}</span>
              </div>
              <div className="mt-2 text-3xl font-bold">{remaining}</div>
              <div className="text-xs text-muted-foreground">of {b?.allocated ?? 0} days remaining</div>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My leaves</TabsTrigger>
          <TabsTrigger value="approvals">Approvals {pending.length > 0 && <Badge variant="secondary" className="ml-2">{pending.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4">
          <LeaveTable rows={mine} types={types} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          {pending.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground">Nothing pending. 🎉</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((r) => (
                <div key={r.id} className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{profiles[r.user_id]?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{types.find((t) => t.id === r.leave_type_id)?.name}</div>
                    </div>
                    <Badge variant={statusBadge[r.status]}>{r.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-3 text-sm flex items-center gap-2 text-muted-foreground">
                    <CalIcon className="h-3 w-3" />
                    {fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {r.days}d
                  </div>
                  {r.reason && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.reason}</p>}
                  {(isAdminOrHr || hasRole("dept_manager")) && (
                    <div className="mt-3 flex gap-2">
                      {hasRole("dept_manager") && r.status === "pending" && !isAdminOrHr && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(r.id, "manager_approved")}>
                          <Check className="h-3 w-3 mr-1" />Approve (Manager)
                        </Button>
                      )}
                      {isAdminOrHr && (
                        <Button size="sm" className="gradient-primary text-white" onClick={() => updateStatus(r.id, "approved")}>
                          <Check className="h-3 w-3 mr-1" />Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")}>
                        <X className="h-3 w-3 mr-1" />Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <LeaveTable rows={all} types={types} profiles={profiles} showUser />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeaveTable({ rows, types, profiles, showUser }: { rows: LeaveReq[]; types: LeaveType[]; profiles?: Record<string, { full_name: string }>; showUser?: boolean }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {showUser && <th className="text-left p-3">Employee</th>}
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Dates</th>
              <th className="text-left p-3">Days</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No leave records yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                {showUser && <td className="p-3 font-medium">{profiles?.[r.user_id]?.full_name ?? "—"}</td>}
                <td className="p-3">{types.find((t) => t.id === r.leave_type_id)?.name}</td>
                <td className="p-3 text-muted-foreground">{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</td>
                <td className="p-3">{r.days}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{r.reason}</td>
                <td className="p-3"><Badge variant={statusBadge[r.status] ?? "secondary"}>{r.status.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplyDialog({ types, onDone }: { types: LeaveType[]; onDone: () => void }) {
  const [type, setType] = useState<string>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const days = start && end ? Math.max(1, differenceInCalendarDays(new Date(end), new Date(start)) + 1) : 0;

  const submit = () => {
    if (!type || !start || !end) return toast.error("Fill all fields.");
    toast.success("Leave request submitted (static mode)");
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Apply for leave</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>From</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="space-y-2"><Label>To</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        {days > 0 && <div className="text-xs text-muted-foreground">{days} day{days > 1 ? "s" : ""}</div>}
        <div className="space-y-2"><Label>Reason</Label><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </div>
      <DialogFooter><Button onClick={submit} className="gradient-primary text-white">Submit request</Button></DialogFooter>
    </DialogContent>
  );
}
