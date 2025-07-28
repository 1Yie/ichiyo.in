"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface TeamLogoProps {
  lightSrc: string;
  darkSrc: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function TeamLogo({ lightSrc, darkSrc, alt = "logo", width = 24, height = 24, className }: TeamLogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const src = currentTheme === "dark" ? darkSrc : lightSrc;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      priority
    />
  );
}
