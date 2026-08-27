"use client";

import { useCallback, useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true),
  );

  useEffect(() => {
    const sync = () => {
      setIsOnline(navigator.onLine);
    };

    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const recheck = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  return { isOnline, recheck };
}
