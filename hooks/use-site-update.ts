"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { wsManager } from "@/lib/ws-manager";

export function useSiteUpdateToast() {
  useEffect(() => {
    const unsubscribe = wsManager.subscribe(() => {
      toast.info("检测到站点更新", {
        description: "请刷新页面以获取最新内容",
        action: {
          label: "刷新页面",
          onClick: () => window.location.replace(window.location.href),
        },
        duration: Infinity,
      });
    });

    return () => unsubscribe();
  }, []);
}
