import { redirect } from "next/navigation";

// Standalone flowchart demo is deprecated — flowchart requires a project context.
// Redirect to dashboard where the user can pick or create a project.
export default function FlowchartPage() {
  redirect("/dashboard");
} 