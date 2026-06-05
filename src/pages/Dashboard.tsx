import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Users, CalendarDays, FolderOpen, CheckCircle2, Megaphone, PartyPopper } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useAuth } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const palette = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

export default function Dashboard() {
  const { profile } = useAuth();
  const [kpi, setKpi] = useState({ headcount: 0, onLeaveToday: 0, pending: 0, docs: 0 });
  const [leaveByType, setLeaveByType] = useState<{ name: string; value: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; present: number; leave: number }[]>([]);
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; created_at: string; pinned: boolean }[]>([]);

  useEffect(() => {
    const mockHolidays = [
      { date: "2024-12-25", name: "Christmas Day" },
      { date: "2025-01-01", name: "New Year's Day" },
      { date: "2025-01-26", name: "Republic Day" },
    ];
    const mockAnnouncements = [
      { id: "1", title: "Annual General Meeting", body: "The AGM will be held on Friday at 3 PM in the main hall. Attendance is mandatory for all department heads.", created_at: new Date().toISOString(), pinned: true },
      { id: "2", title: "New Health Insurance Policy", body: "We have updated our health insurance provider. Please check your email for the new policy details.", created_at: new Date(Date.now() - 86400000).toISOString(), pinned: false },
      { id: "3", title: "Office Renovation", body: "The 3rd floor will be undergoing renovations starting next week. Please use the temporary workspace on the 2nd floor.", created_at: new Date(Date.now() - 172800000).toISOString(), pinned: false },
    ];
    const mockMonthly = [
      { month: "Jan", present: 22, leave: 2 },
      { month: "Feb", present: 20, leave: 4 },
      { month: "Mar", present: 23, leave: 1 },
      { month: "Apr", present: 21, leave: 3 },
      { month: "May", present: 24, leave: 0 },
      { month: "Jun", present: 19, leave: 5 },
    ];
    const mockLeaveByType = [
      { name: "Annual Leave", value: 45 },
      { name: "Sick Leave", value: 12 },
      { name: "Casual Leave", value: 8 },
      { name: "Maternity Leave", value: 2 },
    ];

    setKpi({
      headcount: 128,
      onLeaveToday: 5,
      pending: 12,
      docs: 342,
    });
    setLeaveByType(mockLeaveByType);
    setMonthly(mockMonthly);
    setHolidays(mockHolidays);
    setAnnouncements(mockAnnouncements);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${profile?.full_name?.split(" ")[0] || ""} 👋`} description="Here's what's happening across your organisation today." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Headcount" value={kpi.headcount} icon={Users} accent="primary" />
        <KpiCard label="On leave today" value={kpi.onLeaveToday} icon={CalendarDays} accent="info" />
        <KpiCard label="Pending approvals" value={kpi.pending} icon={CheckCircle2} accent="warning" />
        <KpiCard label="Documents" value={kpi.docs} icon={FolderOpen} accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Monthly attendance</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="leave" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Leave by type</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={leaveByType.length ? leaveByType : [{ name: "No data", value: 1 }]} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {(leaveByType.length ? leaveByType : [{ name: "x", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {leaveByType.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl border border-border/60 hover:bg-muted/40 transition">
                <div className="flex items-center gap-2">
                  {a.pinned && <Badge variant="secondary" className="text-[10px]">Pinned</Badge>}
                  <span className="text-sm font-medium">{a.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.body}</p>
                <span className="text-[10px] text-muted-foreground">{fmtDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PartyPopper className="h-4 w-4 text-warning" />
            <h3 className="font-semibold">Upcoming holidays</h3>
          </div>
          <div className="space-y-2">
            {holidays.length === 0 && <p className="text-sm text-muted-foreground">No upcoming holidays.</p>}
            {holidays.map((h) => (
              <div key={h.date} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <span className="text-sm font-medium">{h.name}</span>
                <span className="text-xs text-muted-foreground">{fmtDate(h.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
