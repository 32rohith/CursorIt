import { redirect } from "next/navigation";

// This page is deprecated — brainstorming requires a project context.
// Redirect to dashboard where the user can pick or create a project.
export default function BrainstormingPage() {
  redirect("/dashboard");
}