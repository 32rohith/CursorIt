"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import ProjectLayout from "@/components/layouts/ProjectLayout";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TechOption = {
  id: string;
  name: string;
  description: string;
  isRecommended?: boolean;
};

type ProjectData = {
  platform: "Web" | "Mobile" | "Desktop";
  name: string;
  description: string;
  brainstorming_context?: any;
};

const APP_OPTIONS: TechOption[] = [
  { id: "capacitor", name: "Capacitor", description: "Cross-platform native runtime" },
  { id: "expo", name: "Expo", description: "React Native development platform" },
  { id: "flutter", name: "Flutter", description: "Google's UI toolkit for mobile" },
  { id: "framework7", name: "Framework7", description: "Mobile UI framework" },
  { id: "ionic", name: "Ionic", description: "Cross-platform mobile app development" },
  { id: "kotlin", name: "Kotlin Android", description: "Native Android development" },
  { id: "nativescript", name: "NativeScript", description: "Native mobile development" },
  { id: "react-native", name: "React Native", description: "Build native apps using React" },
  { id: "swiftui", name: "SwiftUI", description: "Native iOS app development" },
];

const FRONTEND_OPTIONS: TechOption[] = [
  { id: "angular", name: "Angular", description: "Platform for building web applications" },
  { id: "astro", name: "Astro", description: "Static site build tool" },
  { id: "materialui", name: "MaterialUI", description: "Material UI" },
  { id: "nextjs", name: "Next.js", description: "React framework for production" },
  { id: "nuxtjs", name: "Nuxt.js", description: "Vue.js framework for production" },
  { id: "qwik", name: "Qwik", description: "HTML-first framework" },
  { id: "react", name: "React", description: "JavaScript library for user interfaces" },
  { id: "remix", name: "Remix", description: "Full stack web framework" },
  { id: "solidjs", name: "Solid.js", description: "Simple and performant reactivity" },
  { id: "svelte", name: "Svelte", description: "Cybernetically enhanced web apps" },
  { id: "vuejs", name: "Vue.js", description: "Progressive JavaScript framework" },
];

const BACKEND_OPTIONS: TechOption[] = [
  { id: "aspnet", name: "ASP.NET Core", description: "Cross-platform .NET framework" },
  { id: "django", name: "Django", description: "High-level Python web framework" },
  { id: "express", name: "Express.js", description: "Fast, unopinionated web framework for Node.js" },
  { id: "fastapi", name: "FastAPI", description: "Modern Python web framework" },
  { id: "fiber", name: "Fiber", description: "Express-inspired web framework for Go" },
  { id: "laravel", name: "Laravel", description: "PHP web application framework" },
  { id: "nestjs", name: "NestJS", description: "Progressive Node.js framework" },
  { id: "phoenix", name: "Phoenix", description: "Web framework for Elixir" },
  { id: "rails", name: "Ruby on Rails", description: "Web application framework for Ruby" },
  { id: "spring", name: "Spring Boot", description: "Enterprise Java framework" },
];

const DESKTOP_OPTIONS: TechOption[] = [
  { id: "avalonia", name: "Avalonia", description: "Cross-platform .NET UI framework" },
  { id: "electron", name: "Electron", description: "Build cross-platform desktop apps" },
  { id: "gtk", name: "GTK", description: "GNOME desktop development toolkit" },
  { id: "javafx", name: "JavaFX", description: "Java desktop applications" },
  { id: "neutralino", name: "Neutralino", description: "Lightweight desktop apps" },
  { id: "qt", name: "Qt", description: "Cross-platform desktop development" },
  { id: "tauri", name: "Tauri", description: "Build smaller, faster desktop apps" },
  { id: "wails", name: "Wails", description: "Build desktop apps using Go" },
];

export default function TechStackPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    frontend?: string;
    backend?: string;
    single?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to determine recommended options based on project context
  const getRecommendedOptions = (projectData: ProjectData) => {
    const { platform, description, brainstorming_context, name } = projectData;
    const brainstormingText = brainstorming_context ? JSON.stringify(brainstorming_context) : '';
    const content = `${name} ${description} ${brainstormingText}`.toLowerCase();
    
    // Simple keyword-based recommendation for vibe coding ease
    if (platform === "Mobile") {
      if (content.includes("react") || content.includes("javascript")) return "expo";
      if (content.includes("native") || content.includes("performance")) return "react-native";
      return "expo"; // Default recommendation for ease of vibe coding
    }
    
    if (platform === "Desktop") {
      if (content.includes("web") || content.includes("javascript")) return "electron";
      if (content.includes("performance") || content.includes("native")) return "tauri";
      return "electron"; // Default recommendation for ease of vibe coding
    }
    
    if (platform === "Web") {
      let frontend = "nextjs"; // Default frontend recommendation
      let backend = "express"; // Default backend recommendation
      
      if (content.includes("vue")) frontend = "nuxtjs";
      if (content.includes("angular")) frontend = "angular";
      if (content.includes("svelte")) frontend = "svelte";
      
      if (content.includes("python")) backend = "fastapi";
      if (content.includes("django")) backend = "django";
      if (content.includes("java")) backend = "spring";
      if (content.includes("php")) backend = "laravel";
      
      return { frontend, backend };
    }
    
    return null;
  };

  useEffect(() => {
    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: project, error: fetchError } = await supabase
          .from("projects")
          .select("platform, name, description, brainstorming_context")
          .eq("id", projectId)
          .single();

        if (fetchError) throw fetchError;
        if (!project) throw new Error("Project not found");

        setProjectData(project);
        
        // Set recommended options
        const recommended = getRecommendedOptions(project);
        if (recommended) {
          if (typeof recommended === "string") {
            setSelectedOptions({ single: recommended });
          } else {
            setSelectedOptions({ 
              frontend: recommended.frontend, 
              backend: recommended.backend 
            });
          }
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const handleNext = async () => {
    if (!projectData) return;
    
    // Validate selections based on platform
    if (projectData.platform === "Web") {
      if (!selectedOptions.frontend || !selectedOptions.backend) return;
    } else {
      if (!selectedOptions.single) return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const techStackData = projectData.platform === "Web" 
        ? { 
            platform: projectData.platform,
            frontend: selectedOptions.frontend,
            backend: selectedOptions.backend
          }
        : {
            platform: projectData.platform,
            technology: selectedOptions.single
          };

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          tech_stack: techStackData,
          status: "flowchart",
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      router.push(`/project/${projectId}/flowchart`);
    } catch (err: any) {
      setError(`Failed to save selection: ${err.message}`);
      setIsSaving(false);
    }
  };

  const renderLoadingState = () => (
    <div className="text-center">
      <Sparkles className="mx-auto h-12 w-12 text-violet-400 animate-pulse" />
      <h2 className="mt-4 text-xl font-medium text-white">Loading your tech stack options...</h2>
      <p className="mt-2 text-sm text-white/60">This will just take a moment.</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
      <h2 className="text-xl font-medium text-red-400">An Error Occurred</h2>
      <p className="mt-2 text-sm text-white/80">{error}</p>
      <Button onClick={() => window.location.reload()} className="mt-4">
        Try Again
      </Button>
    </div>
  );

  const renderTechOptions = () => {
    if (!projectData) return null;

    const { platform } = projectData;
    const recommended = getRecommendedOptions(projectData);

    if (platform === "Web") {
      return (
        <div className="space-y-8">
          {/* Frontend Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Choose Frontend Technology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRONTEND_OPTIONS.map((option) => (
                <TechOptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOptions.frontend === option.id}
                  isRecommended={typeof recommended === "object" && recommended?.frontend === option.id}
                  onSelect={() => setSelectedOptions(prev => ({ ...prev, frontend: option.id }))}
                />
              ))}
            </div>
          </div>

          {/* Backend Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Choose Backend Technology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BACKEND_OPTIONS.map((option) => (
                <TechOptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOptions.backend === option.id}
                  isRecommended={typeof recommended === "object" && recommended?.backend === option.id}
                  onSelect={() => setSelectedOptions(prev => ({ ...prev, backend: option.id }))}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // For Mobile/Desktop platforms
    const options = platform === "Mobile" ? APP_OPTIONS : DESKTOP_OPTIONS;
    
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">
          Choose {platform === "Mobile" ? "App" : "Desktop"} Technology
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((option) => (
            <TechOptionCard
              key={option.id}
              option={option}
              isSelected={selectedOptions.single === option.id}
              isRecommended={recommended === option.id}
              onSelect={() => setSelectedOptions(prev => ({ ...prev, single: option.id }))}
            />
          ))}
        </div>
      </div>
    );
  };

  const isReadyToNext = () => {
    if (!projectData) return false;
    if (projectData.platform === "Web") {
      return selectedOptions.frontend && selectedOptions.backend;
    }
    return selectedOptions.single;
  };

  return (
    <ProjectLayout projectId={projectId}>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden p-4 sm:p-8">
        <div className="pointer-events-none absolute inset-0 z-0 bg-grid-white/[0.05]" />
        <div className="relative w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2 text-center">Choose Your Tech Stack</h1>
            <p className="text-white/60 text-sm mb-8 text-center">
              Select the technologies for your {projectData?.platform.toLowerCase()} project. Recommended options are highlighted for optimal vibe coding experience.
            </p>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" exit={{ opacity: 0 }}>
                  {renderLoadingState()}
                </motion.div>
              ) : error ? (
                <motion.div key="error" exit={{ opacity: 0 }}>
                  {renderErrorState()}
                </motion.div>
              ) : (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {renderTechOptions()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {!isLoading && !error && projectData && (
            <div className="mt-10 flex justify-end">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={isSaving || !isReadyToNext()}
                className="px-8 bg-violet-600 hover:bg-violet-700 flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Next: Create Flowchart"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProjectLayout>
  );
}

const TechOptionCard = ({
  option,
  isSelected,
  isRecommended,
  onSelect,
}: {
  option: TechOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) => {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={cn(
        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden min-h-[120px] flex flex-col justify-between",
        isSelected
          ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
          : isRecommended
          ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
          : "border-white/10 bg-white/5 hover:border-white/20"
      )}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Check className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Recommended Badge */}
      {isRecommended && !isSelected && (
        <div className="absolute top-0 left-4 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-black shadow-lg">
            <Star className="h-3 w-3" />
            Recommended
          </div>
        </div>
      )}
      
      <div className="flex-1">
        <h4 className="font-semibold text-white mb-2 text-sm">{option.name}</h4>
        <p className="text-xs text-white/70 leading-relaxed">{option.description}</p>
      </div>
    </motion.div>
  );
}; 