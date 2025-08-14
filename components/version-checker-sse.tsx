"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const VersionCheckerSSE: React.FC = () => {
  const hasShownToast = useRef(false);

  useEffect(() => {
    const evtSource = new EventSource("/api/version/stream");

    evtSource.addEventListener("version", (event: MessageEvent<string>) => {
      JSON.parse(event.data);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.info("站点已更新，请刷新页面获取最新内容", {
          action: { label: "刷新页面", onClick: () => window.location.reload() },
          duration: Infinity,
          onDismiss: () => { hasShownToast.current = false; }
        });
      }
    });

    return () => evtSource.close();
  }, []);

  return null;
};
