"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientHoverCardProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: "default" | "primary" | "accent";
}

export function GradientHoverCard({
  children,
  className,
  isSelected = false,
  onClick,
  variant = "default",
}: GradientHoverCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          outerGradient: "linear-gradient(163deg, #a855f7 0%, #3b82f6 100%)",
          glowColor: "rgba(168, 85, 247, 0.4)",
          selectedGlow: "rgba(168, 85, 247, 0.6)",
        };
      case "accent":
        return {
          outerGradient: "linear-gradient(163deg, #06b6d4 0%, #8b5cf6 100%)",
          glowColor: "rgba(6, 182, 212, 0.4)",
          selectedGlow: "rgba(6, 182, 212, 0.6)",
        };
      default:
        return {
          outerGradient: "linear-gradient(163deg, #6366f1 0%, #a855f7 100%)",
          glowColor: "rgba(99, 102, 241, 0.4)",
          selectedGlow: "rgba(99, 102, 241, 0.6)",
        };
    }
  };

  const variantStyles = getVariantStyles();

  const getHoverGradient = () => {
    switch (variant) {
      case "primary":
        return "from-purple-500/20 via-blue-500/10 to-transparent";
      case "accent":
        return "from-cyan-500/20 via-violet-500/10 to-transparent";
      default:
        return "from-indigo-500/20 via-purple-500/10 to-transparent";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg transition-all duration-300 cursor-pointer group",
        "hover:-translate-y-1 hover:shadow-xl hover:border-white/20",
        isSelected && "selected -translate-y-1 shadow-xl border-white/20",
        className
      )}
      onClick={onClick}
    >
      {/* Gradient hover effect - similar to dashboard cards */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br transition-opacity -z-10",
        `bg-gradient-to-br ${getHoverGradient()}`,
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />
      
      {/* Background gradient - always visible glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent -z-20" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>


    </div>
  );
}

export default GradientHoverCard;
