import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, LogIn, LogOut } from "lucide-react";
import { fmtDate } from "@/lib/format";

interface Att { id: string; date: string; check_in: string | null; check_out: string | null; status: string }

const todayDate = new Date().toISOString().slice(0, 10);

const mockHistory: Att[] = [
  { id: "1", date: todayDate, check_in: new Date(new Date().setHours(9, 0, 0)).toISOString(), check_out: null, status: "present" },
  { id: "2", date: "2024-05-11", check_in: "2024-05-11T09:15:00Z", check_out: "2024-05-11T18:05:00Z", status: "present" },
  { id: "3", date: "2024-05-10", check_in: "2024-05-10T08:50:00Z", check_out: "2024-05-10T17:30:00Z", status: "present" },
  { id: "4", date: "2024-05-09", check_in: "2024-05-09T09:00:00Z", check_out: "2024-05-09T18:00:00Z", status: "present" },
];

export default function Attendance() {
  const [today] = useState<Att | null>(mockHistory.find((r) => r.date === todayDate) ?? null);
  const [history] = useState<Att[]>(mockHistory);

  const checkIn = () => {
    toast.success("Checked in (static mode)");
  };

  const checkOut = () => {
    toast.success("Checked out (static mode)");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track your daily presence." />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Today</div>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/40">
              <div className="text-xs text-muted-foreground">Check in</div>
              <div className="text-lg font-semibold">{today?.check_in ? new Date(today.check_in).toLocaleTimeString() : "—"}</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/40">
              <div className="text-xs text-muted-foreground">Check out</div>
              <div className="text-lg font-semibold">{today?.check_out ? new Date(today.check_out).toLocaleTimeString() : "—"}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={checkIn} disabled={!!today?.check_in} className="gradient-primary text-white">
              <LogIn className="h-4 w-4 mr-2" />Check in
            </Button>
            <Button onClick={checkOut} disabled={!today?.check_in || !!today?.check_out} variant="secondary">
              <LogOut className="h-4 w-4 mr-2" />Check out
            </Button>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground">This month</div>
          <div className="text-3xl font-bold mt-2">{history.filter((h) => h.date.startsWith(todayDate.slice(0, 7))).length}</div>
          <div className="text-xs text-muted-foreground">days marked</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Recent activity</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Check in</th><th className="text-left p-3">Check out</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No attendance records yet.</td></tr>}
              {history.map((h) => (
                <tr key={h.id} className="border-t border-border">
                  <td className="p-3 font-medium">{fmtDate(h.date)}</td>
                  <td className="p-3 text-muted-foreground">{h.check_in ? new Date(h.check_in).toLocaleTimeString() : "—"}</td>
                  <td className="p-3 text-muted-foreground">{h.check_out ? new Date(h.check_out).toLocaleTimeString() : "—"}</td>
                  <td className="p-3"><Badge variant="secondary">{h.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
