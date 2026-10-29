"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface GradientBorderButtonProps extends Omit<ButtonProps, 'variant'> {
  /** gradient variant, primary uses project purple→blue */
  variant?: "primary" | "accent" | "default";
  /** glow strength */
  glow?: "none" | "light" | "medium" | "strong";
}

const gradients = {
  primary: {
    from: "#a855f7",
    to: "#3b82f6",
  },
  accent: {
    from: "#06b6d4",
    to: "#8b5cf6",
  },
  default: {
    from: "#6366f1",
    to: "#a855f7",
  },
} as const;

export function GradientBorderButton({
  children,
  className,
  variant = "primary",
  glow = "light",
  disabled,
  ...props
}: GradientBorderButtonProps) {
  const { from, to } = gradients[variant];

  const glowSize = glow === "strong" ? 40 : glow === "medium" ? 25 : glow === "light" ? 15 : 0;

  // disabled simple glass button
  if (disabled) {
    return (
      <Button
        {...props}
        disabled
        className={cn(
          "px-8 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-md opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className={cn("relative inline-block group", className)}>
      {/* Gradient outline (2 px) */}
      <div
        className="absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
        style={{ background: `linear-gradient(163deg, ${from} 0%, ${to} 100%)` }}
      />

      {/* Glow */}
      {glow !== "none" && (
        <div
          className="absolute inset-0 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 ${glowSize}px 1px ${from}4D`, // 30% opacity
            filter: "blur(6px)",
          }}
        />
      )}

      {/* Inner glass button with 2px padding to reveal outline */}
      <div className="relative rounded-md p-[2px]">
        <Button
          {...props}
          className={cn(
            "relative z-10 w-full px-8 rounded-md bg-white/5 backdrop-blur-sm border border-white/10 text-white transition-transform duration-200",
            "group-hover:scale-[0.98]"
          )}
        >
          {children}
        </Button>
      </div>
    </div>
  );
}

export default GradientBorderButton;
