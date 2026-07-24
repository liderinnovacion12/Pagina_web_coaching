"use client";

import { useTheme } from "@/components/ThemeProvider";

interface LogoNCSProps {
  height?: number;
  className?: string;
}

// Image is 919×443 px total; each half is 459.5×443 (aspect ratio ≈ 1.037)
// dark version = left half, light version = right half
export function LogoNCS({ height = 44, className }: LogoNCSProps) {
  const { theme } = useTheme();

  return (
    <div
      role="img"
      aria-label="NCS Realty Hub"
      className={className}
      style={{
        height,
        aspectRatio: "919 / 886",
        backgroundImage: "url(/images/logo-ncs.jpg)",
        backgroundSize: "auto 100%",
        backgroundPosition: theme === "dark" ? "0 0" : "right 0",
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}
