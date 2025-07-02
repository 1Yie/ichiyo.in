"use client";

import { useEffect, useRef } from "react";
import Artalk from "artalk";

export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 从 localStorage 和系统偏好中判断
    const getThemeMode = (): boolean => {
      const theme = localStorage.getItem("theme");

      if (theme === "dark") return true;
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false; // 默认 light
    };

    let isDark = getThemeMode();

    const artalk = new Artalk({
      el: containerRef.current,
      pageKey: window.location.pathname,
      pageTitle: document.title,
      server: "https://artalk.ichiyo.in/",
      site: "blog-artalk",
      darkMode: isDark,
      flatMode: "auto",
    });

    // 主题切换逻辑
    const updateArtalkTheme = () => {
      const newIsDark = getThemeMode();
      if (newIsDark !== isDark) {
        isDark = newIsDark;
        artalk.setDarkMode(isDark);
      }
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (localStorage.getItem("theme") === "system") {
        updateArtalkTheme();
      }
    });

    // 监听 html class 改变
    const observer = new MutationObserver(() => {
      updateArtalkTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 监听 localStorage 改变（跨标签页）
    window.addEventListener("storage", (e) => {
      if (e.key === "theme") updateArtalkTheme();
    });

    // 监听自定义事件（本页主动切换时触发）
    window.addEventListener("theme-change", updateArtalkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateArtalkTheme);
      window.removeEventListener("storage", updateArtalkTheme);
      window.removeEventListener("theme-change", updateArtalkTheme);
      artalk.destroy();
    };
  }, []);

  return <div ref={containerRef}></div>;
}
