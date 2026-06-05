import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Pin, Megaphone } from "lucide-react";
import { fmtDate } from "@/lib/format";

interface Ann {
  id: string; title: string; body: string; pinned: boolean; important: boolean; created_at: string;
  author_id: string | null;
}

const mockAnnouncements: Ann[] = [
  { id: "1", title: "New Employee Onboarding", body: "We are excited to welcome 5 new members to the engineering team this week. Please make them feel at home!", pinned: true, important: false, created_at: new Date().toISOString(), author_id: null },
  { id: "2", title: "Policy Update: Remote Work", body: "Our remote work policy has been updated. Employees can now request up to 3 days of work-from-home per week.", pinned: false, important: true, created_at: new Date(Date.now() - 86400000).toISOString(), author_id: null },
  { id: "3", title: "Cafeteria Menu Update", body: "Check out the new healthy options available in the cafeteria starting Monday!", pinned: false, important: false, created_at: new Date(Date.now() - 172800000).toISOString(), author_id: null },
  { id: "4", title: "IT Maintenance Window", body: "The internal servers will be down for maintenance this Saturday from 2 AM to 6 AM.", pinned: false, important: true, created_at: new Date(Date.now() - 259200000).toISOString(), author_id: null },
];

export default function Announcements() {
  const { isAdminOrHr, hasRole } = useAuth();
  const canPost = isAdminOrHr || hasRole("dept_manager");
  const [items, setItems] = useState<Ann[]>(mockAnnouncements);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Company news and notice board"
        actions={canPost && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" />New announcement</Button></DialogTrigger>
            <NewAnn onDone={(a) => { setOpen(false); setItems((prev) => [a, ...prev]); }} />
          </Dialog>
        )}
      />
      <div className="space-y-4">
        {items.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground">No announcements yet.</div>}
        {items.map((a) => (
          <article key={a.id} className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{a.title}</h3>
                  {a.pinned && <Badge variant="secondary"><Pin className="h-3 w-3 mr-1" />Pinned</Badge>}
                  {a.important && <Badge className="bg-warning text-warning-foreground">Important</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
                <div className="text-xs text-muted-foreground mt-3">{fmtDate(a.created_at)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function NewAnn({ onDone }: { onDone: (a: Ann) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [important, setImportant] = useState(false);

  const submit = () => {
    if (!title || !body) return toast.error("Title and body required.");
    toast.success("Announcement posted");
    onDone({
      id: crypto.randomUUID(),
      title, body, pinned, important,
      created_at: new Date().toISOString(),
      author_id: null,
    });
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Body</Label><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm"><Switch checked={pinned} onCheckedChange={setPinned} />Pin</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={important} onCheckedChange={setImportant} />Mark important</label>
        </div>
      </div>
      <DialogFooter><Button onClick={submit} className="gradient-primary text-white">Publish</Button></DialogFooter>
    </DialogContent>
  );
}
