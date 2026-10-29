export const PHASES = [
  "platform",
  "brainstorming",
  "tech_stack",
  "flowchart",
  "ui_design",
  "docs",
  "complete",
] as const;

export type Phase = typeof PHASES[number];

export const getPhaseIndex = (phase: string | null | undefined): number => {
  return PHASES.indexOf((phase ?? "platform") as Phase);
}; 