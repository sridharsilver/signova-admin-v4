import { useRef, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Upload, FileText, Download, Trash2, Search } from "lucide-react";
import { fmtDate } from "@/lib/format";

interface Doc {
  id: string; name: string; storage_path: string; size_bytes: number;
  mime_type: string | null; uploaded_by: string | null; created_at: string;
  approval_status: string;
}

const mockDocs: Doc[] = [
  { id: "1", name: "Employee Handbook.pdf", storage_path: "mock/handbook.pdf", size_bytes: 245000, mime_type: "application/pdf", uploaded_by: "mock-uid", created_at: new Date().toISOString(), approval_status: "approved" },
  { id: "2", name: "IT Policy.docx", storage_path: "mock/it-policy.docx", size_bytes: 128000, mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploaded_by: "mock-uid", created_at: new Date(Date.now() - 86400000).toISOString(), approval_status: "approved" },
  { id: "3", name: "Company Logo.png", storage_path: "mock/logo.png", size_bytes: 56000, mime_type: "image/png", uploaded_by: "mock-uid", created_at: new Date(Date.now() - 172800000).toISOString(), approval_status: "approved" },
];

export default function Documents() {
  const { user, isAdminOrHr } = useAuth();
  const [docs, setDocs] = useState<Doc[]>(mockDocs);
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    toast.success("Uploaded (static mode)");
  };

  const download = (d: Doc) => {
    toast.success(`Downloading ${d.name} (static mode)`);
  };

  const remove = (d: Doc) => {
    if (!confirm(`Delete ${d.name}?`)) return;
    setDocs((prev) => prev.filter((x) => x.id !== d.id));
    toast.success("Deleted");
  };

  const filtered = docs.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Secure document storage with versioning."
        actions={<Button onClick={() => fileRef.current?.click()} className="gradient-primary text-white"><Upload className="h-4 w-4 mr-2" />Upload</Button>}
      />
      <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
        className={`glass-card p-8 text-center border-2 border-dashed transition ${drag ? "border-primary bg-accent/40" : "border-border"}`}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
        <div className="mt-2 font-medium">Drag and drop files here</div>
        <div className="text-xs text-muted-foreground">or click Upload above</div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="glass-card p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground">{(d.size_bytes / 1024).toFixed(1)} KB · {fmtDate(d.created_at)}</div>
              <Badge variant="secondary" className="mt-1 text-[10px]">{d.approval_status}</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => download(d)}><Download className="h-4 w-4" /></Button>
              {(isAdminOrHr || d.uploaded_by === user?.id) && (
                <Button size="icon" variant="ghost" onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-12">No documents yet.</div>}
      </div>
    </div>
  );
}
