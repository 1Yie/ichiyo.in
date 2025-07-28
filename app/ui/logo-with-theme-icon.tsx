"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function LogoWithThemeIcon() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  const logoSrc = currentTheme === "dark" ? "/logo_light.svg" : "/logo_dark.svg";

  return (
    <Link href="/" className="flex items-center gap-2 self-center font-medium">
      <div className="bg-accent-foreground p-0.5 text-accent-foreground flex size-6 items-center justify-center rounded-md">
        <Image src={logoSrc} alt="logo" width={24} height={24} />
      </div>
      ichiyo.in
    </Link>
  );
}
