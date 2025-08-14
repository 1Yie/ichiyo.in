"use client";
import React, { useEffect } from "react";
import { useThemeSwitcher } from "@/lib/use-theme-switcher";
import { toast } from "sonner";
import { wsManager } from "@/lib/ws-manager";

const ClientThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = React.useState(false);

  useThemeSwitcher();

  useEffect(() => {
    setMounted(true);

    const unsubscribe = wsManager.subscribe(() => {
      toast.info("检测到新版本，请刷新页面", {
        action: {
          label: "刷新页面",
           onClick: () => window.location.replace(window.location.href)
        },
        duration: Infinity,
      });
    });

    return () => unsubscribe();
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

export default ClientThemeProvider;