import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SecuritySettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      // supabase-js v2 requires current session; updateUser handles password change
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.message || "Error updating password");
    } finally {
      setChanging(false);
    }
  };

  const handleGlobalSignOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Change password</h3>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
          <Button
            onClick={handleChangePassword}
            disabled={changing}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
          >
            {changing ? "Updating…" : "Update password"}
          </Button>
          {message && <p className="text-xs text-white/60">{message}</p>}
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Sign out everywhere</h3>
          <p className="text-sm text-white/60">
            This will terminate all active sessions on every device.
          </p>
          <Button variant="destructive" onClick={handleGlobalSignOut}>
            Sign out of all sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

const inputClass = cn(
  "w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
);

export default SecuritySettings; 