"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle,
  ChevronUp,
  ChevronDown, 
  Settings,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  user?: { name?: string; email?: string; avatarUrl?: string };
  onOpenSettings: () => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ user, onOpenSettings }) => {
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({
    "Project 01": true,
    "Project 02": false
  });
  
  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };
  
  // Mock data for projects
  const projects = [
    {
      name: "Project 01",
      icon: "sparkle",
      tasks: [
        { name: "Logo & Branding", completed: true },
        { name: "Wireframes", completed: false },
        { name: "Website Design", completed: false }
      ]
    },
    {
      name: "Project 02",
      icon: "star",
      tasks: []
    }
  ];

  // Get user initials for avatar fallback
  const getInitials = (): string => {
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "DK"; // Default fallback
  };

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col">
      {/* Sparkle emoji in top left */}
      <div className="absolute top-6 left-6">
        <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Navigation - better spacing to match reference */}
      <nav className="flex-1 px-4 pt-24 pb-6 space-y-3">


        {/* Projects Section */}
        <div className="pt-8">
          <p className="text-xs text-zinc-500 font-medium tracking-wider px-3 mb-4">PROJECTS</p>
          
          {projects.map((project) => (
            <div key={project.name} className="mb-2">
              <div 
                className="flex items-center justify-between px-3 py-2 text-white/80 hover:bg-zinc-800 hover:text-white rounded-lg cursor-pointer"
                onClick={() => toggleProject(project.name)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-indigo-400">
                    {project.icon === "sparkle" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                </span>
                  <span className="text-base font-medium">{project.name}</span>
                </div>
                {expandedProjects[project.name] ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
              
              {expandedProjects[project.name] && project.tasks.length > 0 && (
                <div className="pl-11 ml-1 border-l border-zinc-800">
                  {project.tasks.map((task) => (
                    <div key={task.name} className="flex items-center gap-2 py-2 pl-3 text-white/60">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-white/40" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/40" />
                      )}
                      <span className={`text-sm ${task.completed ? 'text-white/40' : 'text-white/60'}`}>{task.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/80 hover:bg-zinc-800 hover:text-white transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <span className="text-base font-medium">Settings</span>
          </div>
        </button>
        
        <div className="mt-4 px-3 py-2 flex items-center gap-3">
          <Avatar className="w-8 h-8 rounded-full bg-zinc-700 text-white">
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user?.name || user?.email || "User"} />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/50">{user?.email || "info@mail.com"}</span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar; 