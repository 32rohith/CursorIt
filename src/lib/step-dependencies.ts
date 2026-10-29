/**
 * Step Dependencies and Navigation System
 * Manages step completion tracking and data consistency
 */

export type ProjectStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StepInfo {
  id: ProjectStep;
  name: string;
  path: string;
  dependencies: ProjectStep[]; // Steps that affect this step
  affects: ProjectStep[]; // Steps this step affects when changed
}

export const STEPS: Record<ProjectStep, StepInfo> = {
  1: {
    id: 1,
    name: "Project Naming",
    path: "",
    dependencies: [],
    affects: [], // Project name doesn't affect other steps
  },
  2: {
    id: 2,
    name: "Platform Selection",
    path: "/platform",
    dependencies: [],
    affects: [3, 4, 5, 6, 7], // Affects everything after platform
  },
  3: {
    id: 3,
    name: "Brainstorming",
    path: "/brainstorming",
    dependencies: [2],
    affects: [4, 5, 6, 7], // Affects everything after brainstorming
  },
  4: {
    id: 4,
    name: "Tech Stack",
    path: "/tech-stack",
    dependencies: [2, 3],
    affects: [7], // Only affects documentation
  },
  5: {
    id: 5,
    name: "Flowchart",
    path: "/flowchart",
    dependencies: [2, 3, 4],
    affects: [7], // Only affects documentation
  },
  6: {
    id: 6,
    name: "UI Design",
    path: "/ui-design",
    dependencies: [2, 3, 4, 5],
    affects: [7], // Only affects documentation
  },
  7: {
    id: 7,
    name: "Docs",
    path: "/docs",
    dependencies: [2, 3, 4, 5, 6],
    affects: [], // Final step
  },
};

/**
 * Get steps that will be affected if the given step is changed
 */
export function getAffectedSteps(changedStep: ProjectStep): ProjectStep[] {
  return STEPS[changedStep].affects;
}

/**
 * Get steps that need to be completed before the given step
 */
export function getRequiredSteps(targetStep: ProjectStep): ProjectStep[] {
  return STEPS[targetStep].dependencies;
}

/**
 * Check if a step can be accessed based on completed steps
 */
export function canAccessStep(targetStep: ProjectStep, completedSteps: ProjectStep[]): boolean {
  const requiredSteps = getRequiredSteps(targetStep);
  return requiredSteps.every(step => completedSteps.includes(step));
}

/**
 * Get the visual state of a step based on completion and dependencies
 */
export function getStepState(
  step: ProjectStep,
  completedSteps: ProjectStep[],
  needsRedoSteps: ProjectStep[] = []
): 'completed' | 'needs-redo' | 'incomplete' | 'inaccessible' {
  if (needsRedoSteps.includes(step)) {
    return 'needs-redo';
  }
  
  if (completedSteps.includes(step)) {
    return 'completed';
  }
  
  if (canAccessStep(step, completedSteps)) {
    return 'incomplete';
  }
  
  return 'inaccessible';
}

/**
 * Mark steps that need to be redone after changing a step
 */
export function markStepsForRedo(
  changedStep: ProjectStep,
  completedSteps: ProjectStep[]
): ProjectStep[] {
  const affectedSteps = getAffectedSteps(changedStep);
  return affectedSteps.filter(step => completedSteps.includes(step));
}

/**
 * Remove completed status from affected steps
 */
export function resetCompletedSteps(
  changedStep: ProjectStep,
  completedSteps: ProjectStep[]
): ProjectStep[] {
  const affectedSteps = getAffectedSteps(changedStep);
  return completedSteps.filter(step => !affectedSteps.includes(step));
}

/**
 * Get user-friendly names for steps (for warning dialogs)
 */
export function getStepNames(steps: ProjectStep[]): string[] {
  return steps.map(step => STEPS[step].name);
}

/**
 * Get the next step in the sequence
 */
export function getNextStep(currentStep: ProjectStep): ProjectStep | null {
  const nextStep = (currentStep + 1) as ProjectStep;
  return nextStep <= 7 ? nextStep : null;
}

/**
 * Generate warning message for step changes
 */
export function generateWarningMessage(
  changedStep: ProjectStep,
  affectedSteps: ProjectStep[]
): string {
  const stepName = STEPS[changedStep].name;
  const affectedNames = getStepNames(affectedSteps);
  
  if (affectedNames.length === 0) {
    return `Changing ${stepName} will not affect other steps.`;
  }
  
  return `⚠️ Change ${stepName}

Changing the ${stepName.toLowerCase()} will reset the following steps:
${affectedNames.map(name => `• ${name}`).join('\n')}

All data in these steps will be lost. Do you want to continue?`;
}
