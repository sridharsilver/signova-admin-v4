import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Reports() {
  const [byDept] = useState<{ name: string; count: number }[]>([
    { name: "Engineering", count: 45 },
    { name: "Marketing", count: 22 },
    { name: "Human Resources", count: 12 },
    { name: "Sales", count: 28 },
    { name: "Finance", count: 15 },
    { name: "Operations", count: 8 },
  ]);
  const [byStatus] = useState<{ status: string; count: number }[]>([
    { status: "approved", count: 120 },
    { status: "pending", count: 15 },
    { status: "rejected", count: 8 },
    { status: "cancelled", count: 5 },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="High-level analytics across the organisation." />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Headcount by department</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Leave requests by status</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--info))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="glass-card p-5 text-sm text-muted-foreground">
        PDF and Excel exports will be available in the next release.
      </div>
    </div>
  );
}
