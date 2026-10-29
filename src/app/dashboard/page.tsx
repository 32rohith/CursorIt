import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUser } from "@/lib/supabase/server";
import DashboardClient from '@/components/dashboard/DashboardClient';
import { ProjectPlatform } from '@/components/ProjectCard';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper function to calculate progress based on status
const calculateProgress = (status: string): number => {
  const steps = ['platform', 'brainstorming', 'tech_stack', 'flowchart', 'ui_design', 'docs', 'complete'];
  const currentStep = steps.indexOf(status);

  if (currentStep === -1) {
    return 5; // Default minimum progress
  }

  const progress = Math.max(5, Math.min(100, Math.round((currentStep / (steps.length - 1)) * 100)));
  return progress;
};

export default async function DashboardPage() {
  // Create a Supabase client using cookies
  const cookieStore = await cookies();
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll: () => { }, // No-op, we don't need to set cookies in this case
      },
    }
  );

  // Get authenticated user
  const user = await getUser().catch((err) => {
    console.error("Dashboard: Error fetching user:", err);
    return null;
  });

  // Fetch user's projects
  let userProjects: Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    platform: ProjectPlatform;
    createdAt: string;
    status: string;
    isDemo: boolean;
  }> = [];
  if (user) {
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Dashboard: Error fetching projects:", error);
      } else if (projects) {
        userProjects = projects.map(project => {
          try {
            const platform: ProjectPlatform = 
              project.platform === "Mobile" || project.platform === "Desktop" 
                ? project.platform 
                : "Web";

            return {
              id: project.id,
              name: project.name,
              description: project.description || "No description provided",
              progress: calculateProgress(project.status),
              platform,
              createdAt: new Date(project.created_at).toISOString().split('T')[0],
              status: project.status,
              isDemo: false,
            };
          } catch (mappingError) {
            console.error("Dashboard: Error mapping project:", project, "Error:", mappingError instanceof Error ? mappingError.message : "Unknown mapping error");
            return null;
          }
        }).filter(Boolean) as typeof userProjects; // Remove any null entries
      } else {
        // No projects data returned
      }
    } catch (fetchError) {
      console.error("Dashboard: Failed to fetch projects:", fetchError);
    }
  } else {
    // No user found, userProjects remains empty
  }

  // User info for sidebar
  const userInfo = user ? {
    name: user.user_metadata?.name,
    email: user.email,
    avatarUrl: user.user_metadata?.avatar_url
  } : undefined;

  // Return the client component with the fetched data
  return <DashboardClient userProjects={userProjects} userInfo={userInfo} />;
} 