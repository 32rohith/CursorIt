"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID and ensure profile exists on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();
        
        if (profileError || !profile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.user_metadata?.name || user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url,
              subscription_tier: 'free',
              project_count: 0
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError("Failed to create user profile. Please try again.");
            return;
          }
        }
        
        setUserId(user.id);
      }
    };
    
    fetchUser();
  }, []);

  const handleNext = async () => {
    if (name.trim().length === 0) return;
    
    // Make sure user is logged in
    if (!userId) {
      setError("You must be logged in to create a project");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          status: 'platform',  // First step in our process
          user_id: userId      // Set the user_id field to the current user
        })
        .select("id")
        .single();
      
      if (insertError) {
        console.error("Error creating project:", insertError);
        setError(`Failed to create project: ${insertError.message}`);
        return;
      }
      
      // Successfully created project, redirect to platform selection
      router.push(`/project/${data.id}/platform`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* lights reuse */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <div
          className="absolute -top-[600px] left-0 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(42% 52% at 65% 15%, #7b22ab 0%, rgba(123,34,171,0) 100%)",
          }}
        />
        <div
          className="absolute -top-[600px] left-1/2 -translate-x-1/2 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(39% 48% at 44.5% 15.4%, #4594f0 0%, rgba(69,148,240,0) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-white/60 text-sm mb-6">
          Give your project a name and brief description.
        </p>

        {error && (
          <div className="w-full mb-4 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-white text-sm">
            {error}
          </div>
        )}

        {!userId && (
          <div className="w-full mb-4 px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-white text-sm">
            You need to be signed in to create a project. Please sign in first.
          </div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description (optional)"
          rows={3}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-black/40 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
        />

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="default"
            size="default"
            onClick={handleNext}
            disabled={name.trim().length === 0 || isLoading || !userId}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
} 