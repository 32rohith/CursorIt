import { redirect } from "next/navigation";

// Dock demo is a test route — redirect to dashboard
export default function DockDemoPage() {
  redirect("/dashboard");
} 