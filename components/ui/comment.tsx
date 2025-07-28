"use client";

import { useEffect, useRef } from "react";
import Artalk from "artalk";
import { useTheme } from "next-themes";

export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || !resolvedTheme) return;

    let isDark = resolvedTheme === "dark";

    const artalk = new Artalk({
      el: containerRef.current,
      pageKey: window.location.pathname,
      pageTitle: document.title,
      server: "https://artalk.ichiyo.in/",
      site: "ichiyo.in Artalk",
      darkMode: isDark,
      flatMode: "auto",
    });

    const updateArtalkTheme = () => {
      const newIsDark = document.documentElement.classList.contains("dark");
      if (newIsDark !== isDark) {
        isDark = newIsDark;
        artalk.setDarkMode(isDark);
      }
    };

    // 监听 html class 改变（next-themes 会修改 html class）
    const observer = new MutationObserver(updateArtalkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      artalk.destroy();
    };
  }, [resolvedTheme]);

  return <div ref={containerRef}></div>;
}
