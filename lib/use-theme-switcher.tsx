"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Theme = "dark" | "light" | "system";

export function useThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const systemThemeListenerRef = useRef<((e: MediaQueryListEvent) => void) | null>(null);

  // 切换 favicon 的函数
  const setFavicon = (isDark: boolean) => {
    const favicon = document.getElementById("favicon") as HTMLLinkElement | null;
    if (!favicon) return;
    favicon.href = isDark ? "/logo_dark.svg" : "/logo_light.svg";
  };

  // 初始化逻辑
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    let initialTheme: Theme = "system";

    if (
      storedTheme === "dark" ||
      storedTheme === "light" ||
      storedTheme === "system"
    ) {
      initialTheme = storedTheme;
    } else {
      localStorage.setItem("theme", "system");
    }

    setTheme(initialTheme);

    // 初始化媒体查询
    mediaQueryRef.current = window.matchMedia("(prefers-color-scheme: dark)");

    return () => {
      // 组件卸载时清理监听器
      removeSystemListener();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 清理系统主题监听器
  const removeSystemListener = useCallback(() => {
    if (mediaQueryRef.current && systemThemeListenerRef.current) {
      mediaQueryRef.current.removeEventListener(
        "change",
        systemThemeListenerRef.current
      );
      systemThemeListenerRef.current = null;
    }
  }, []);

  // 应用主题
  useEffect(() => {
    if (theme === undefined) return;

    // 每次主题变化时，先清理之前的监听器
    removeSystemListener();

    // 应用当前主题
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setFavicon(true);
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
      setFavicon(false);
    } else {
      // system模式
      const handleSystemChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
        setFavicon(e.matches);
      };

      // 立即应用当前系统主题
      if (mediaQueryRef.current) {
        const isDark = mediaQueryRef.current.matches;
        document.documentElement.classList.toggle("dark", isDark);
        setFavicon(isDark);
      }

      // 添加监听器
      mediaQueryRef.current?.addEventListener("change", handleSystemChange);
      systemThemeListenerRef.current = handleSystemChange;
    }
  }, [theme, removeSystemListener]);

  const setAppTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  return {
    theme: theme || "system",
    setAppTheme,
    isInitialized: theme !== undefined,
  };
}
