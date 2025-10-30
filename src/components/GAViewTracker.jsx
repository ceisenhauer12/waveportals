// src/components/GAViewTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function GAViewTracker() {
  const location = useLocation();
  const isDev = import.meta?.env?.DEV;

  useEffect(() => {
    const url = location.pathname + location.search;
    if (!window.gtag) {
      if (isDev) console.info("[GA] gtag missing (possibly blocked) for", url);
      return;
    }
    window.gtag("event", "page_view", {
      page_title: document.title || "WavePortals",
      page_location: window.location.origin + url,
      page_path: url,
      debug_mode: !!isDev,
    });
    if (isDev) console.info("[GA] page_view →", url);
  }, [location.pathname, location.search, isDev]);

  return null;
}
