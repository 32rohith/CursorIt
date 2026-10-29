"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Upload, ArrowRight, Loader2, X, FileImage } from "lucide-react";

interface ImageDesignEditorProps {
  projectId: string;
}

export default function ImageDesignEditor({ projectId }: ImageDesignEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [designData, setDesignData] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDesignData(null);
    setError(null);
  };

  const analyzeScreenshot = async () => {
    if (!selectedFile) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("projectId", projectId);
      
      const res = await fetch("/api/ui-style/analyze", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      
      const data = await res.json();
      const uiStyle = data.uiStyle;
      
      setDesignData(typeof uiStyle === "string" ? uiStyle : JSON.stringify(uiStyle, null, 2));
      
      // Persist to DB but don't advance status yet
      await supabase
        .from("projects")
        .update({ ui_style: uiStyle })
        .eq("id", projectId);
        
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const continueToNext = async () => {
    if (!designData) return;
    
    try {
      const { error: dbErr } = await supabase
        .from("projects")
        .update({ status: "docs" })
        .eq("id", projectId);
        
      if (dbErr) {
        setError(dbErr.message);
        return;
      }
      
      // Navigate to docs page
      window.location.href = `/project/${projectId}/docs`;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDesignData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        
        {!selectedFile ? (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors cursor-pointer bg-white/5 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-white/60" />
              <p className="mb-2 text-sm text-white/80">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-white/60">PNG, JPG, JPEG up to 5MB</p>
            </div>
          </label>
        ) : (
          <div className="relative border border-white/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="icon"
                variant="ghost"
                onClick={clearSelection}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {previewUrl && (
              <div className="relative w-full h-64">
                <Image
                  src={previewUrl}
                  alt="Screenshot preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FileImage className="w-4 h-4" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-white/60">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !designData && (
        <div className="flex justify-center">
          <Button
            onClick={analyzeScreenshot}
            disabled={analyzing}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Analyzing Design...
              </>
            ) : (
              <>
                <FileImage className="mr-2 w-4 h-4" />
                Analyze Screenshot
              </>
            )}
          </Button>
        </div>
      )}

      {/* Analysis Results */}
      {designData && (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              ✓ Analysis Complete
            </h3>
            <p className="text-sm text-white/80">
              Your UI design has been analyzed and the style guide has been generated.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white/90 mb-2">
              Generated Style Guide Preview:
            </h4>
            <div className="max-h-32 overflow-y-auto text-xs text-white/70 font-mono bg-black/20 p-3 rounded border border-white/5">
              {designData}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={continueToNext}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Continue to Docs
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}