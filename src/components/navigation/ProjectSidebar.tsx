"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Laptop,
  Brain,
  Braces,
  ActivitySquare,
  PaintBucket,
  FileCode,
  AlertTriangle
} from "lucide-react";
import { VerticalDock, DockIcon, DockItem, DockLabel } from "@/components/ui/vertical-dock";
import { useStepNavigation } from "@/lib/hooks/useStepNavigation";
import { STEPS, type ProjectStep, getAffectedSteps } from "@/lib/step-dependencies";
import StepChangeWarningDialog from "@/components/ui/step-change-warning-dialog";

// Map step numbers to icons
const stepIcons: Record<ProjectStep, React.ElementType> = {
  1: FileText,
  2: Laptop,
  3: Brain,
  4: Braces,
  5: ActivitySquare,
  6: PaintBucket,
  7: FileCode,
};

interface ProjectSidebarProps {
  projectId: string;
  currentStep: ProjectStep;
}

export default function ProjectSidebar({ projectId, currentStep }: ProjectSidebarProps) {
  const {
    completedSteps,
    needsRedoSteps,
    isLoading,
    showWarning,
    pendingStepChange,
    navigateToStep,
    confirmStepChange,
    cancelStepChange,
    getStepStateForUI,
  } = useStepNavigation({ projectId, currentStep });

  const handleStepClick = (targetStep: ProjectStep) => {
    const stepState = getStepStateForUI(targetStep);
    
    // Only allow navigation to completed steps or current step
    if (stepState === 'completed' || targetStep === currentStep) {
      navigateToStep(targetStep);
    }
  };

  const getStepStyling = (step: ProjectStep) => {
    const stepState = getStepStateForUI(step);
    const isCurrent = step === currentStep;
    
    switch (stepState) {
      case 'completed':
        return {
          containerClass: `aspect-square rounded-full ${isCurrent ? "bg-purple-600" : "bg-green-600"} cursor-pointer hover:scale-110 transition-transform`,
          iconClass: "text-white",
          clickable: true,
        };
      case 'needs-redo':
        return {
          containerClass: `aspect-square rounded-full ${isCurrent ? "bg-orange-600" : "bg-orange-500"} cursor-pointer hover:scale-110 transition-transform border-2 border-orange-300`,
          iconClass: "text-white",
          clickable: true,
        };
      case 'incomplete':
        return {
          containerClass: `aspect-square rounded-full ${isCurrent ? "bg-purple-600" : "bg-neutral-700"} ${isCurrent ? "cursor-pointer" : "cursor-not-allowed"} opacity-70`,
          iconClass: isCurrent ? "text-white" : "text-neutral-400",
          clickable: isCurrent,
        };
      case 'inaccessible':
        return {
          containerClass: "aspect-square rounded-full bg-neutral-800 cursor-not-allowed opacity-40",
          iconClass: "text-neutral-500",
          clickable: false,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col gap-4 p-4 bg-neutral-900 rounded-r-2xl">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div key={step} className="w-12 h-12 rounded-full bg-neutral-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
        <VerticalDock>
          {([1, 2, 3, 4, 5, 6, 7] as ProjectStep[]).map((step) => {
            const Icon = stepIcons[step];
            const stepInfo = STEPS[step];
            const styling = getStepStyling(step);
            const stepState = getStepStateForUI(step);

            return (
              <DockItem
                key={step}
                onClick={() => styling.clickable && handleStepClick(step)}
                className={styling.containerClass}
              >
                <DockLabel>
                  {stepInfo.name}
                  {stepState === 'needs-redo' && (
                    <div className="flex items-center gap-1 mt-1 text-orange-300">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">Needs Redo</span>
                    </div>
                  )}
                  {stepState === 'inaccessible' && (
                    <div className="text-xs text-neutral-500 mt-1">
                      Complete previous steps first
                    </div>
                  )}
                </DockLabel>
                <DockIcon>
                  <Icon className={`h-full w-full ${styling.iconClass}`} />
                  {stepState === 'needs-redo' && (
                    <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-orange-300" />
                  )}
                </DockIcon>
              </DockItem>
            );
          })}
        </VerticalDock>
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
    </>
  );
}