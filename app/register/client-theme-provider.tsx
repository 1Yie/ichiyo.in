"use client";

import React, { useState, useEffect } from "react";
import { useThemeSwitcher } from "@/lib/use-theme-switcher";

const ClientThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useThemeSwitcher();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

export default ClientThemeProvider;
