import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

// Simple static suggestions for now. Can be replaced with Gemini-generated data later.
const SUGGESTIONS = [
  {
    id: uuidv4(),
    name: "Next.js + Supabase (AI-Ready)",
    description:
      "Full-stack TypeScript stack using Next.js App Router, Supabase for auth/db, Tailwind + shadcn/ui. Optimised for AI pair-programming workflows.",
    isTopPick: true,
    components: {
      Frontend: "Next.js 15 (React 19) + TypeScript",
      Styling: "Tailwind CSS 4 + shadcn/ui",
      "Backend & Database": "Supabase Postgres, Edge Functions",
      Deployment: "Vercel / Supabase Hosting",
    },
    pros: [
      "Server components & edge-friendly",
      "Built-in Auth & Realtime via Supabase",
      "Great DX for TypeScript & AI tools",
    ],
    cons: ["Tightly coupled to Supabase services"],
  },
  {
    id: uuidv4(),
    name: "Remix + PlanetScale",
    description:
      "React-based Remix framework with MySQL database via PlanetScale. Suitable for dynamic apps that need edge-first performance.",
    isTopPick: false,
    components: {
      Frontend: "Remix (React 19) + TypeScript",
      Styling: "Tailwind CSS 4",
      "Backend & Database": "Prisma ORM + PlanetScale MySQL",
      Deployment: "Vercel / Fly.io",
    },
    pros: ["Nested routes with data loading", "Edge-optimised"],
    cons: ["Smaller ecosystem compared to Next.js"],
  },
  {
    id: uuidv4(),
    name: "SvelteKit + Firebase",
    description:
      "SvelteKit front-end with Firebase for auth, Firestore, and functions. Minimal bundle sizes and rapid prototyping.",
    isTopPick: false,
    components: {
      Frontend: "SvelteKit",
      Styling: "Tailwind CSS",
      "Backend & Database": "Firebase (Auth, Firestore)",
      Deployment: "Firebase Hosting / Vercel",
    },
    pros: ["Small bundle size", "Realtime database built-in"],
    cons: ["Vendor lock-in", "JavaScript-only (no TS by default)"]
  },
];

export async function POST(req: NextRequest) {
  try {
    const { projectId } = (await req.json()) as { projectId?: string };

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Validate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user owns the project (basic check)
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projErr || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // In the future, use Gemini to tailor recommendations based on project brief
    return NextResponse.json({ recommendations: SUGGESTIONS });
  } catch (err) {
    console.error("Error in tech-stack/recommend route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 