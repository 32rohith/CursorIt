"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-white">
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-white/70 mb-6">
            The project you are looking for does not exist or you do not have permission to view it.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 