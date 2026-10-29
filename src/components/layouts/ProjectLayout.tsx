"use client";

import { usePathname } from "next/navigation";
import ProjectSidebar from "@/components/navigation/ProjectSidebar";
import { cn } from "@/lib/utils";
import { type ProjectStep } from "@/lib/step-dependencies";
import PhaseGate from "@/components/layouts/PhaseGate";

interface ProjectLayoutProps {
  projectId: string;
  children: React.ReactNode;
  transparentBg?: boolean;
}

export default function ProjectLayout({ projectId, children, transparentBg = false }: ProjectLayoutProps) {
  const pathname = usePathname();

  // Determine current step based on path
  const getCurrentStep = (): ProjectStep => {
    if (pathname.includes('/platform')) return 2;
    if (pathname.includes('/brainstorming')) return 3;
    if (pathname.includes('/tech-stack')) return 4;
    if (pathname.includes('/flowchart')) return 5;
    if (pathname.includes('/ui-design')) return 6;
    if (pathname.includes('/docs')) return 7;
    return 1; // Default to project naming stage
  };

  const currentStep = getCurrentStep();

  return (
    <div className={cn(
      "relative min-h-screen",
      !transparentBg && "bg-black"
    )}>
      {/* Project Sidebar Navigation */}
      <ProjectSidebar 
        projectId={projectId} 
        currentStep={currentStep} 
      />
      
      {/* Main Content centered with padding to accommodate the sidebar */}
      <div className="flex justify-center">
        <div className="w-full max-w-screen-xl">
          {children}
        </div>
      </div>
    </div>
  );
} 