"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  type ProjectStep,
  getAffectedSteps,
  resetCompletedSteps,
  markStepsForRedo,
  getStepState,
  canAccessStep,
  STEPS,
} from "@/lib/step-dependencies";

interface UseStepNavigationProps {
  projectId: string;
  currentStep: ProjectStep;
}

export function useStepNavigation({ projectId, currentStep }: UseStepNavigationProps) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<ProjectStep[]>([]);
  const [needsRedoSteps, setNeedsRedoSteps] = useState<ProjectStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingStepChange, setPendingStepChange] = useState<{
    step: ProjectStep;
    callback: () => void;
  } | null>(null);

  // Load project completion state
  const loadCompletionState = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("completed_steps, needs_redo_steps")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error loading project completion state:", error);
        return;
      }

      if (data) {
        setCompletedSteps(data.completed_steps || []);
        setNeedsRedoSteps(data.needs_redo_steps || []);
      }
    } catch (error) {
      console.error("Error loading completion state:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Save completion state to database
  const saveCompletionState = useCallback(async (
    newCompletedSteps: ProjectStep[],
    newNeedsRedoSteps: ProjectStep[] = needsRedoSteps
  ) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          completed_steps: newCompletedSteps,
          needs_redo_steps: newNeedsRedoSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) {
        console.error("Error saving completion state:", error);
        return false;
      }

      setCompletedSteps(newCompletedSteps);
      setNeedsRedoSteps(newNeedsRedoSteps);
      return true;
    } catch (error) {
      console.error("Error saving completion state:", error);
      return false;
    }
  }, [projectId, needsRedoSteps]);

  // Mark current step as completed
  const markStepCompleted = useCallback(async (step: ProjectStep) => {
    if (completedSteps.includes(step)) return true;

    const newCompletedSteps = [...completedSteps, step];
    const newNeedsRedoSteps = needsRedoSteps.filter(s => s !== step);
    
    return await saveCompletionState(newCompletedSteps, newNeedsRedoSteps);
  }, [completedSteps, needsRedoSteps, saveCompletionState]);

  // Reset data for affected steps when a step is changed
  const resetAffectedSteps = useCallback(async (changedStep: ProjectStep) => {
    const affectedSteps = getAffectedSteps(changedStep);
    const newCompletedSteps = resetCompletedSteps(changedStep, completedSteps);
    const newNeedsRedoSteps = markStepsForRedo(changedStep, completedSteps);

    // Reset data in database for affected steps
    const resetData: Record<string, null> = {};
    
    affectedSteps.forEach(step => {
      switch (step) {
        case 3:
          resetData.brainstorming_context = null;
          break;
        case 4:
          resetData.tech_stack = null;
          break;
        case 5:
          resetData.workflow_diagram = null;
          break;
        case 6:
          resetData.ui_style = null;
          break;
        case 7:
          resetData.generated_files = null;
          break;
      }
    });

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          ...resetData,
          completed_steps: newCompletedSteps,
          needs_redo_steps: newNeedsRedoSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) {
        console.error("Error resetting affected steps:", error);
        return false;
      }

      setCompletedSteps(newCompletedSteps);
      setNeedsRedoSteps(newNeedsRedoSteps);
      return true;
    } catch (error) {
      console.error("Error resetting affected steps:", error);
      return false;
    }
  }, [completedSteps, projectId]);

  // Navigate to a step with proper validation
  const navigateToStep = useCallback((targetStep: ProjectStep) => {
    // Check if step can be accessed
    if (!canAccessStep(targetStep, completedSteps)) {
      console.warn(`Cannot access step ${targetStep} - missing dependencies`);
      return;
    }

    const stepPath = STEPS[targetStep].path;
    const fullPath = `/project/${projectId}${stepPath}`;
    router.push(fullPath);
  }, [completedSteps, projectId, router]);

  // Handle step change with warning if needed
  const handleStepChange = useCallback((
    targetStep: ProjectStep,
    changeCallback: () => void
  ) => {
    const affectedSteps = getAffectedSteps(targetStep);
    const hasCompletedAffectedSteps = affectedSteps.some(step => 
      completedSteps.includes(step)
    );

    if (hasCompletedAffectedSteps) {
      // Show warning dialog
      setPendingStepChange({ step: targetStep, callback: changeCallback });
      setShowWarning(true);
    } else {
      // No warning needed, proceed directly
      changeCallback();
    }
  }, [completedSteps]);

  // Confirm step change after warning
  const confirmStepChange = useCallback(async () => {
    if (!pendingStepChange) return;

    const success = await resetAffectedSteps(pendingStepChange.step);
    if (success) {
      pendingStepChange.callback();
    }

    setPendingStepChange(null);
    setShowWarning(false);
  }, [pendingStepChange, resetAffectedSteps]);

  // Cancel step change
  const cancelStepChange = useCallback(() => {
    setPendingStepChange(null);
    setShowWarning(false);
  }, []);

  // Get step state for UI
  const getStepStateForUI = useCallback((step: ProjectStep) => {
    return getStepState(step, completedSteps, needsRedoSteps);
  }, [completedSteps, needsRedoSteps]);

  // Load completion state on mount
  useEffect(() => {
    loadCompletionState();
  }, [loadCompletionState]);

  return {
    completedSteps,
    needsRedoSteps,
    isLoading,
    showWarning,
    pendingStepChange,
    markStepCompleted,
    navigateToStep,
    handleStepChange,
    confirmStepChange,
    cancelStepChange,
    getStepStateForUI,
    resetAffectedSteps,
  };
}
