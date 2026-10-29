import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

const ProfileSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    avatar_url: null,
    email: "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({
          display_name: data.display_name ?? "",
          avatar_url: data.avatar_url,
          email: data.email ?? user.email,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!uploadFile) return profile.avatar_url;
    const fileExt = uploadFile.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, uploadFile, { upsert: true });
    if (error) {
      console.error("Avatar upload failed", error.message);
      return profile.avatar_url;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data?.publicUrl ?? profile.avatar_url;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const avatar_url = await uploadAvatar();
      const updates = { display_name: profile.display_name, avatar_url };
      await supabase.from("profiles").update(updates).eq("id", user.id);
      setUploadFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-white/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 flex-wrap">
        <label className="relative cursor-pointer group">
          <Avatar className="h-20 w-20 border border-white/10 group-hover:ring-2 group-hover:ring-white/20 transition">
            {uploadFile ? (
              <AvatarImage src={URL.createObjectURL(uploadFile)} />
            ) : profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} />
            ) : (
              <AvatarFallback>
                {profile.display_name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0"
            onChange={handleFileChange}
          />
        </label>

        <div className="flex-1 min-w-[200px] space-y-2">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Display name
            </label>
            <input
              type="text"
              value={profile.display_name ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
              }
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              )}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Primary email
            </label>
            <input
              type="email"
              value={profile.email ?? ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/60"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings; 