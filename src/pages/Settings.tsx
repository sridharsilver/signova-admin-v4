import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [frontendUrl, setFrontendUrl] = useState(() => localStorage.getItem('frontendUrl') || "https://1signova.pages.dev");

  const saveFrontendUrl = () => {
    localStorage.setItem('frontendUrl', frontendUrl);
    toast.success("Frontend URL updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage organisation configuration." />
      {!isSuperAdmin && <div className="glass-card p-6 text-sm text-muted-foreground">Only administrators can change settings.</div>}

      <div className="grid gap-6">

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
