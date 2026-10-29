"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Upload, FilePlus2, Loader2 } from "lucide-react";
import "@/app/styles/design-preview.css";
import ImageDesignEditor from "@/components/design/ImageDesignEditor";

export type PresetStyle = {
  id: string;
  name: string;
  image: string;
  uiStyle: Record<string, unknown>;
};

const PRESET_STYLES: PresetStyle[] = [
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    image: "/window.svg",
    uiStyle: {
      theme: "glassmorphism",
      colors: {
        primary: "#ffffff80",
        background: "#0f0f0f",
        text: "#ffffff",
      },
      borderRadius: "16px",
      blur: "20px",
    },
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    image: "/globe.svg",
    uiStyle: {
      theme: "neumorphism",
      colors: {
        primary: "#e0e0e0",
        background: "#d3d3d3",
        text: "#222222",
      },
      shadow: true,
      borderRadius: "12px",
    },
  },
  {
    id: "material",
    name: "Material Design",
    image: "/vercel.svg",
    uiStyle: {
      theme: "material",
      colors: {
        primary: "#6200EE",
        secondary: "#03DAC5",
        background: "#FFFFFF",
        text: "#000000",
      },
    },
  },
];

interface Props {
  projectId: string;
  onComplete: () => void; // called when ready to move to docs step
}

export default function UIDesignClient({ projectId, onComplete }: Props) {
  const [stage, setStage] = useState<"menu" | "preset" | "upload">("menu");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [presetSaving, startTransition] = useTransition();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [designData, setDesignData] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const resetAll = () => {
    setSelectedStyleId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDesignData(null);
    setError(null);
  };

  const handlePresetSelect = (preset: PresetStyle) => {
    setSelectedStyleId(preset.id);
  };

  const savePresetAndContinue = async () => {
    if (!selectedStyleId) return;
    const preset = PRESET_STYLES.find((p) => p.id === selectedStyleId)!;
    startTransition(async () => {
      const { error: dbErr } = await supabase
        .from("projects")
        .update({ ui_style: preset.uiStyle, status: "docs" })
        .eq("id", projectId);
      if (dbErr) {
        setError(dbErr.message);
        return;
      }
      onComplete();
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDesignData(null);
  };

  const analyzeScreenshot = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("projectId", projectId);
      const res = await fetch("/api/ui-style/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      const data = await res.json(); // { uiStyle: markdown or json }
      const uiStyle = data.uiStyle;
      setDesignData(typeof uiStyle === "string" ? uiStyle : JSON.stringify(uiStyle, null, 2));
      // Persist to DB but don't advance status yet.
      await supabase.from("projects").update({ ui_style: uiStyle }).eq("id", projectId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const continueAfterUpload = async () => {
    if (!designData) return;
    const { error: dbErr } = await supabase.from("projects").update({ status: "docs" }).eq("id", projectId);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onComplete();
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-full text-white space-y-8">
      {stage === "menu" && (
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            className="flex-1 sm:flex-none w-full sm:w-80 p-8 border border-white/15 rounded-2xl hover:border-violet-500/80 hover:shadow-lg transition-all backdrop-blur-md bg-white/5 text-left"
            onClick={() => {
              resetAll();
              setStage("preset");
            }}
          >
            <div>
              <h2 className="text-lg font-semibold mb-1">Choose from Preset Templates</h2>
              <p className="text-sm text-white/70">Pick a popular design style and apply it instantly.</p>
            </div>
          </button>
          <button
            className="flex-1 sm:flex-none w-full sm:w-80 p-8 border border-white/15 rounded-2xl hover:border-violet-500/80 hover:shadow-lg transition-all backdrop-blur-md bg-white/5 text-left"
            onClick={() => {
              resetAll();
              setStage("upload");
            }}
          >
            <div>
              <h2 className="text-lg font-semibold mb-1">Upload Your Own Screenshot</h2>
              <p className="text-sm text-white/70">Let our AI reverse-engineer your favorite UI.</p>
            </div>
          </button>
        </div>
      )}

      {stage === "preset" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setStage("menu")}> <ArrowLeft /> </Button>
            <h2 className="text-2xl font-bold">Select a Preset</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handlePresetSelect(style)}
                className={cn(
                  "relative group rounded-xl border-2 overflow-hidden transition-all",
                  selectedStyleId === style.id ? "border-violet-500 shadow-xl" : "border-white/10 hover:border-white/20"
                )}
              >
                <Image src={style.image} alt={style.name} width={400} height={250} className="object-cover w-full h-56" />
                <div className="py-3 text-center text-sm font-medium bg-black/60 backdrop-blur-lg">{style.name}</div>
                {selectedStyleId === style.id && (
                  <span className="absolute top-2 right-2 bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                )}
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end mt-6">
            <Button onClick={savePresetAndContinue} disabled={!selectedStyleId || presetSaving}>
              {presetSaving ? <Loader2 className="animate-spin mr-2" /> : null}
              Next <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {stage === "upload" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setStage("menu")}>
              <ArrowLeft />
            </Button>
            <h2 className="text-2xl font-bold">Upload Screenshot</h2>
          </div>
          <ImageDesignEditor projectId={projectId} />
        </div>
      )}
    </div>
  );
} 