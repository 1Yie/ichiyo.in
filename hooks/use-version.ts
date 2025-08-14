import { useEffect, useState } from 'react';

interface VersionData {
  version: string;
  timestamp: number;
}

interface UseVersionCheckReturn {
  hasUpdate: boolean;
  newVersion: VersionData | null;
  checkVersion: () => void;
  dismissUpdate: () => void;
}

export function useVersionCheck(): UseVersionCheckReturn {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState<VersionData | null>(null);

  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // 监听来自 Service Worker 的消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'VERSION_UPDATE') {
          setNewVersion(event.data.version);
          setHasUpdate(true);
        }
      });
    }

    return () => {
      // 清理事件监听器
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', () => {});
      }
    };
  }, []);

  const checkVersion = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_VERSION'
      });
    }
  };

  const dismissUpdate = () => {
    setHasUpdate(false);
    setNewVersion(null);
  };

  return {
    hasUpdate,
    newVersion,
    checkVersion,
    dismissUpdate
  };
}