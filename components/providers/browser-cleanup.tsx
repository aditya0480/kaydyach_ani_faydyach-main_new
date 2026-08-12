"use client";

import { useEffect } from "react";

export function BrowserCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.info("Service worker unregistered");
          }
        });
      }
    });

    if (!("caches" in window)) {
      return;
    }

    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }, []);

  return null;
}
