"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-500" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            It looks like you're not connected to the internet. Some features
            may not be available.
          </p>

          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              disabled={!isOnline}
              className="w-full"
              variant={isOnline ? "default" : "secondary"}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOnline ? "Retry Connection" : "Waiting for Connection..."}
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </div>

          {isOnline && (
            <div className="text-center text-sm text-green-600">
              ✓ Connection restored! You can now retry.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
