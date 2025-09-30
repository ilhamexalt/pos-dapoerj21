"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check service worker status
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerActive(true);
      });
    }

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && isServiceWorkerActive) {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex flex-col gap-2">
        {!isOnline && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        )}
        {!isServiceWorkerActive && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CloudOff className="w-3 h-3" />
            No Cache
          </Badge>
        )}
        {isOnline && isServiceWorkerActive && (
          <Badge variant="default" className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <Cloud className="w-3 h-3" />
            Online & Cached
          </Badge>
        )}
      </div>
    </div>
  );
}
