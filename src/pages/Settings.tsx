import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { queryCache } from "@/lib/queryCache";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [frontendUrl, setFrontendUrl] = useState("https://1signova.pages.dev");
  const [showProductPageQR, setShowProductPageQR] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) fetchSettings();
    else setLoading(false);
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      const data = await queryCache.get(
        'frontend_settings',
        async () => {
          const { data, error } = await supabase.from('frontend_settings').select('value').eq('key', 'admin_config').maybeSingle();
          if (error && error.code !== 'PGRST116') throw error;
          return data;
        },
        10 * 60_000,
        (fresh) => {
          if (fresh?.value) {
            setFrontendUrl(fresh.value.frontendUrl || "https://1signova.pages.dev");
            setShowProductPageQR(fresh.value.showProductPageQR !== false);
          }
        }
      );
      if (data?.value) {
        setFrontendUrl(data.value.frontendUrl || "https://1signova.pages.dev");
        setShowProductPageQR(data.value.showProductPageQR !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveFrontendUrl = async () => {
    const { error } = await supabase.from('frontend_settings').upsert({ 
      key: 'admin_config', 
      value: { frontendUrl, showProductPageQR } 
    });
    if (error) toast.error("Failed to save Frontend URL");
    else {
      queryCache.invalidate('frontend_settings');
      toast.success("Frontend URL updated");
    }
  };

  const toggleProductPageQR = async (checked: boolean) => {
    setShowProductPageQR(checked);
    const { error } = await supabase.from('frontend_settings').upsert({ 
      key: 'admin_config', 
      value: { frontendUrl, showProductPageQR: checked } 
    });
    if (error) {
      toast.error("Failed to save QR setting");
      setShowProductPageQR(!checked); // revert
    } else {
      queryCache.invalidate('frontend_settings');
      toast.success(`Product Page QR ${checked ? 'enabled' : 'disabled'}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage organisation configuration." />
      {!isSuperAdmin && <div className="glass-card p-6 text-sm text-muted-foreground">Only administrators can change settings.</div>}

      <div className="grid gap-6">

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">System Configuration</h3>
          {isSuperAdmin ? (
            loading ? (
              <div className="flex items-center text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading config...
              </div>
            ) : (
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
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col gap-1">
                      <span>Show Product Page QR</span>
                      <span className="font-normal text-xs text-muted-foreground">Enable or disable the Product Page QR code generator globally</span>
                    </Label>
                    <Switch 
                      checked={showProductPageQR} 
                      onCheckedChange={toggleProductPageQR} 
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="text-sm text-muted-foreground">Only administrators can change system configuration.</div>
          )}
        </div>
      </div>
    </div>
  );
}
