import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ children, className }) => (
  <div className={cn("relative inline-block rounded-full overflow-hidden", className)}>
    {children}
  </div>
);

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const AvatarImage: React.FC<AvatarImageProps> = ({ className, ...props }) => (
  <img
    className={cn("w-full h-full object-cover", className)}
    alt={props.alt || "Avatar"}
    {...props}
  />
);

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <span
    className={cn("flex items-center justify-center w-full h-full bg-white/10 text-white text-sm", className)}
    {...props}
  >
    {children}
  </span>
);

export default Avatar; 