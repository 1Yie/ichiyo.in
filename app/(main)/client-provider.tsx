"use client";
import React, { useEffect } from "react";
import { useThemeSwitcher } from "@/lib/use-theme-switcher";
import { useSiteUpdateToast } from "@/hooks/use-site-update";

const ClientThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  useThemeSwitcher();
  useSiteUpdateToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
};

export default ClientThemeProvider;
