import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { initials, roleLabel, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [title, setTitle] = useState(profile?.job_title ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [pw, setPw] = useState("");

  const save = async () => {
    if (!profile?.id) return;
    
    const { error } = await supabase
      .from('admin_users')
      .update({
        full_name: name,
        phone: phone,
        job_title: title,
        bio: bio
      })
      .eq('id', profile.id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Profile updated successfully!");
      // Optionally trigger a reload of the profile context here if needed,
      // but a page refresh will fetch the newest data.
    }
  };

  const changePw = async () => {
    if (pw.length < 8) return toast.error("Use at least 8 characters.");
    
    const { error } = await supabase.auth.updateUser({ password: pw });
    
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      setPw("");
      toast.success("Password updated successfully!");
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!profile?.id) return;
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return toast.error(`Upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ photo_url: publicUrl })
      .eq('id', profile.id);

    if (updateError) {
      toast.error(`Error updating profile: ${updateError.message}`);
    } else {
      toast.success("Photo updated successfully! Refresh to see changes.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Personal information and account settings." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1 text-center">
          <div className="relative inline-block">
            <Avatar className="h-28 w-28 mx-auto">
              <AvatarImage src={profile?.photo_url ?? undefined} />
              <AvatarFallback className="text-2xl gradient-primary text-white">{initials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="mt-4 font-bold text-lg">{profile?.full_name}</div>
          <div className="text-sm text-muted-foreground">{profile?.email}</div>
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {profile?.role && <Badge variant="secondary" className="capitalize">{profile.role.replace("_", " ")}</Badge>}
          </div>

        </div>

        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Personal information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Job title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Bio</Label><Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          </div>
          <Button onClick={save} className="gradient-primary text-white">Save changes</Button>

          <div className="border-t border-border pt-4 mt-4">
            <h3 className="font-semibold mb-3">Change password</h3>
            <div className="flex gap-2">
              <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
              <Button onClick={changePw} variant="secondary">Update</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
