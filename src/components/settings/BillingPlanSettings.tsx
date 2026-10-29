import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const BillingPlanSettings: React.FC = () => {
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();
      setTier(data?.subscription_tier ?? "free");
      setLoading(false);
    };
    fetchTier();
  }, []);

  if (loading) return <p className="text-white/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <p className="text-white text-lg font-semibold">Current plan: <span className="capitalize">{tier}</span></p>
      <Button disabled className="opacity-60">Upgrade (coming soon)</Button>
    </div>
  );
};

export default BillingPlanSettings; 