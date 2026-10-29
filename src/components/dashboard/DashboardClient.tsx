"use client";

import React from "react";
import SettingsOverlay from "@/components/dashboard/SettingsOverlay";
import { Search, Grid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProjectCard, { ProjectPlatform } from "@/components/ProjectCard";
import '@/app/styles/scrollbar.css'; // Import custom scrollbar styles
import { supabase } from "@/lib/supabase/client";

// Demo projects
const placeholderProjects = [
  {
    id: "demo1",
    name: "AI-Powered Code Assistant",
    description:
      "An intelligent assistant to help developers write code faster and with fewer errors. Integrates directly into the IDE.",
    progress: 45,
    platform: "Web" as ProjectPlatform,
    createdAt: "2024-05-01",
    isDemo: true,
  },
  {
    id: "demo2",
    name: "E-Commerce Platform Redesign",
    description: "A complete overhaul of the existing online store to improve user experience and increase conversion rates.",
    progress: 20,
    platform: "Web" as ProjectPlatform,
    createdAt: "2024-04-20",
    isDemo: true,
  },
  {
    id: "demo3",
    name: "Mobile Health Tracker",
    description: "A cross-platform mobile app for tracking fitness goals, daily activity, and nutrition.",
    progress: 80,
    platform: "Mobile" as ProjectPlatform,
    createdAt: "2024-03-10",
    isDemo: true,
  },
];

export interface UserInfo {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  progress: number;
  platform: ProjectPlatform;
  createdAt: string;
  isDemo: boolean;
}

export interface DashboardClientProps {
  userProjects?: ProjectData[];
  userInfo?: UserInfo;
}

export default function DashboardClient({ 
  userProjects = [], 
  userInfo = undefined
}: DashboardClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [projects, setProjects] = React.useState([
    ...userProjects,
    ...placeholderProjects,
  ]);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const handleDeleteProject = async (projectId: string) => {
    // Optimistically remove the project from the UI
    setProjects((prevProjects) =>
      prevProjects.filter((p) => p.id !== projectId)
    );

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      // Revert the UI if the deletion fails
      setProjects([...userProjects, ...placeholderProjects]);
      // Here you might want to show a toast notification to the user
    }
  };
  // For client-side rendering, use placeholder data by default
  const allProjects = (userProjects.length ? userProjects : []).concat(placeholderProjects);
  const filtered = allProjects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-black">
      {/* Gradient light overlays - positioned underneath everything but visible throughout */}
      <div className="fixed inset-0 pointer-events-none">
                  {/* Purple light */}
          <div
            className="absolute -top-[600px] left-0 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen animate-opacity-strong animate-hue-shift animate-scale-strong"
            style={{
              background:
                "radial-gradient(42% 52% at 65% 15%, #7b22ab 0%, rgba(123,34,171,0) 100%)",
              animationDuration: '15s, 6s',
              animationTimingFunction: 'ease-in-out, ease-in-out',
              animationIterationCount: 'infinite, infinite',
            }}
          />
          {/* Blue light */}
          <div
            className="absolute -top-[600px] left-1/2 -translate-x-1/2 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen animate-opacity-strong animate-hue-shift animate-scale-strong"
            style={{
              background:
                "radial-gradient(39% 48% at 44.5% 15.4%, #4594f0 0%, rgba(69,148,240,0) 100%)",
              animationDuration: '18s, 8s',
              animationTimingFunction: 'ease-in-out, ease-in-out',
              animationIterationCount: 'infinite, infinite',
            }}
          />
      </div>
      
      {/* Main layout - positioned above gradients */}
      <div className="flex min-h-screen text-white">
        {/* Sidebar */}
        <div className="relative w-64 flex-shrink-0">
          <DashboardSidebar user={userInfo} onOpenSettings={() => setIsSettingsOpen(true)} />
          
          {/* Vertical divider */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10"></div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Fixed top section - transparent background with blur */}
          <div className="sticky top-0 z-20 bg-transparent backdrop-blur-md">
            {/* Top bar */}
            <header className="flex items-center justify-between p-6">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                {/* Search Icon button */}
                {!searchOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                  >
                  <Search className="w-5 h-5" />
                </Button>
                )}

                {/* Animated search input */}
                <div
                  className={`relative overflow-hidden transition-all duration-300 ${
                    searchOpen ? 'w-full ml-2' : 'w-0'
                  }`}
                  onMouseLeave={() => {
                    if (search === "") setSearchOpen(false);
                  }}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => {
                      if (search === "") setSearchOpen(false);
                    }}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/10 backdrop-blur-md text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setView("grid")}
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setView("list")}
                >
                  <List className="w-5 h-5" />
                </Button>
                <Link href="/project/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
                  <Plus className="w-4 h-4" /> Create New Project
                </Link>
              </div>
            </header>

            {/* Horizontal divider - fixed with the header */}
            <div className="w-full h-px bg-white/10"></div>
          </div>

          {/* Scrollable projects section */}
          <div
            className="flex-1 overflow-y-auto dashboard-projects-scroll"
            style={{ height: "calc(100vh - 84px)" }}
          >
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-6">Your Projects</h1>
              {filtered.length > 0 ? (
                view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((p) => (
                    <Link
                      key={p.id}
                      href={p.isDemo ? "#" : `/dashboard/project/${p.id}`}
                      className="block h-full"
                      onClick={(e) => {
                        if (p.isDemo) e.preventDefault();
                      }}
                    >
                      <ProjectCard project={p} onDelete={handleDeleteProject} />
                    </Link>
                  ))}
                  {/* Add New Project Card */}
                  <Link href="/project/new" className="block h-full">
                    <div className="h-full flex items-center justify-center rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-colors duration-300">
                      <div className="text-center">
                        <Plus className="mx-auto h-8 w-8 text-white/50" />
                        <p className="mt-2 text-sm font-medium text-white/50">Add New Project</p>
                      </div>
                    </div>
                  </Link>
                </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((p) => (
                      <Link
                        key={p.id}
                        href={p.isDemo ? "#" : `/dashboard/project/${p.id}`}
                        className="block"
                        onClick={(e) => {
                          if (p.isDemo) e.preventDefault();
                        }}
                      >
                        <ProjectCard project={p} onDelete={handleDeleteProject} />
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {isSettingsOpen && <SettingsOverlay onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
} 