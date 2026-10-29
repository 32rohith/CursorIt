import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetails from "./project-details-client";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Fetch the project data server-side
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  
  // Handle error or not found case
  if (error || !project) {
    notFound();
  }
  
  // Pass data to client component
  return <ProjectDetails project={project} id={id} />;
} 