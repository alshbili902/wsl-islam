"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore service worker registration errors on unsupported origins
      });
    }
  }, []);

  return null;
}
