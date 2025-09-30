"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Settings,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: Date;
  read: boolean;
  action?: string;
}

export default function PWANotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check browser support
    setIsSupported("Notification" in window && "serviceWorker" in navigator);

    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

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

    // Initial checks
    setIsOnline(navigator.onLine);

    // Load saved notifications
    const savedNotifications = localStorage.getItem("pwa-notifications");
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    }

    // Listen for custom notification events
    const handlePWANotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    window.addEventListener(
      "pwa-notification",
      handlePWANotification as EventListener
    );

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "pwa-notification",
        handlePWANotification as EventListener
      );
    };
  }, []);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep only last 50
      localStorage.setItem("pwa-notifications", JSON.stringify(updated));
      return updated;
    });

    // Show browser notification if permission granted
    if (permission === "granted") {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: newNotification.id,
      });
    }
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        addNotification({
          title: "Notifications Enabled",
          message: "You will now receive notifications for all actions.",
          type: "success",
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("pwa-notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("pwa-notifications");
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem("pwa-notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isSupported) {
    return (
      <div className="relative">
        <Button variant="ghost" size="icon" disabled>
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <AlertCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>PWA Notifications</span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              {isServiceWorkerActive ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* PWA Status */}
          <div className="px-2 py-1">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge
                  variant={isOnline ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Service Worker:</span>
                <Badge
                  variant={isServiceWorkerActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {isServiceWorkerActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Notifications:</span>
                <Badge
                  variant={permission === "granted" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {permission === "granted" ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Permission Request */}
          {permission !== "granted" && (
            <>
              <DropdownMenuItem onClick={requestPermission}>
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Clear All */}
          {notifications.length > 0 && (
            <>
              <DropdownMenuItem onClick={clearAllNotifications}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 border-l-2 ${getNotificationColor(
                    notification.type
                  )} ${!notification.read ? "bg-opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Export function to add notifications from other components
export const addPWANotification = (
  notification: Omit<Notification, "id" | "timestamp" | "read">
) => {
  // This will be called from other components
  const event = new CustomEvent("pwa-notification", { detail: notification });
  window.dispatchEvent(event);
};
