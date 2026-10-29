import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const ReferFriendSettings: React.FC = () => {
  const [link, setLink] = useState<string>("");

  useEffect(() => {
    const genLink = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setLink(`${window.location.origin}/signup?ref=${user.id}`);
      }
    };
    genLink();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="space-y-4">
      <p className="text-white">Share this link with friends and earn rewards:</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/80"
        />
        <Button onClick={copy}>Copy</Button>
      </div>
    </div>
  );
};

export default ReferFriendSettings; 