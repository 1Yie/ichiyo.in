"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export type Theme = "system" | "light" | "dark";

export function useThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 切换 favicon
  const setFavicon = (isDark: boolean) => {
    const favicon = document.getElementById("favicon") as HTMLLinkElement | null;
    if (!favicon) return;
    favicon.href = isDark ? "/logo_dark.svg" : "/logo_light.svg";
  };

  // 根据 resolvedTheme 设置 favicon
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setFavicon(true);
    } else if (resolvedTheme === "light") {
      setFavicon(false);
    }
  }, [resolvedTheme]);

  return {
    theme: theme || "system",      // 用户设置的主题
    resolvedTheme,                 // 实际生效的主题（考虑 system 情况）
    setAppTheme: setTheme,
    isInitialized: Boolean(resolvedTheme),
  };
}
