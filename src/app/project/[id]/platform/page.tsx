"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe, Smartphone, Monitor } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import ProjectLayout from "@/components/layouts/ProjectLayout";
import GradientHoverCard from "@/components/ui/gradient-hover-card";
import { useStepNavigation } from "@/lib/hooks/useStepNavigation";
import StepChangeWarningDialog from "@/components/ui/step-change-warning-dialog";
import { getAffectedSteps } from "@/lib/step-dependencies";

export default function PlatformSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const [selectedPlatform, setSelectedPlatform] = useState<"Web" | "Mobile" | "Desktop" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { markStepCompleted, handleStepChange, showWarning, pendingStepChange, confirmStepChange, cancelStepChange } = useStepNavigation({
    projectId,
    currentStep: 2,
  });

  const handlePlatformSelect = async () => {
    if (!selectedPlatform) return;

    // Use handleStepChange to show warning if needed
    handleStepChange(2, async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from("projects")
          .update({ 
            platform: selectedPlatform,
            status: 'brainstorming'  // Update to next step in the flow
          })
          .eq('id', projectId);

        if (updateError) {
          console.error("Error updating project platform:", updateError);
          setError(`Failed to update project: ${updateError.message}`);
          return;
        }

        // Mark step as completed
        await markStepCompleted(2);

        // Navigate to the next step
        router.push(`/project/${projectId}/brainstorming`);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  const PlatformCard = ({ 
    platform, 
    icon: Icon, 
    title, 
    description 
  }: { 
    platform: "Web" | "Mobile" | "Desktop"; 
    icon: React.ElementType; 
    title: string; 
    description: string 
  }) => {
    const getCardVariant = () => {
      switch (platform) {
        case "Web":
          return "primary";
        case "Mobile":
          return "accent";
        case "Desktop":
          return "default";
        default:
          return "default";
      }
    };

    return (
      <GradientHoverCard
        className="w-full h-[254px]"
        isSelected={selectedPlatform === platform}
        onClick={() => setSelectedPlatform(platform)}
        variant={getCardVariant()}
      >
        <div className="flex flex-col items-center justify-center p-6 h-full">
          <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-3 text-center">{title}</h3>
          <p className="text-white/80 text-sm text-center leading-relaxed px-2 min-h-[3rem] flex items-center">{description}</p>
        </div>
      </GradientHoverCard>
    );
  };

  return (
    <ProjectLayout projectId={projectId}>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden py-10">
        {/* Background lights */}
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

        <div className="relative w-full max-w-4xl p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-center">Choose Platform</h1>
          <p className="text-white/60 text-sm mb-8 text-center">
            Select the type of application you want to build
          </p>

          {error && (
            <div className="w-full mb-6 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-white text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <PlatformCard
              platform="Web"
              icon={Globe}
              title="Web Application"
              description="Build a responsive website or web application accessible from browsers"
            />
            <PlatformCard
              platform="Mobile"
              icon={Smartphone}
              title="Mobile Application"
              description="Create a native or hybrid app for iOS and Android devices"
            />
            <PlatformCard
              platform="Desktop"
              icon={Monitor}
              title="Desktop Application"
              description="Develop a cross-platform desktop application for Windows, Mac and Linux"
            />
          </div>

          {/* Continue button - only show when platform is selected */}
          {selectedPlatform && (
            <div className="flex justify-center animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <Button
                size="lg"
                onClick={handlePlatformSelect}
                disabled={isLoading}
                className="px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 transition-colors"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Warning Dialog */}
      {showWarning && pendingStepChange && (
        <StepChangeWarningDialog
          open={showWarning}
          onOpenChange={() => {}}
          changedStep={pendingStepChange.step}
          affectedSteps={getAffectedSteps(pendingStepChange.step)}
          onConfirm={confirmStepChange}
          onCancel={cancelStepChange}
        />
      )}
    </ProjectLayout>
  );
} 