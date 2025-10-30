// src/App.jsx
import { useEffect } from "react";
import "./App.css";

// Shell bits
import CanonicalTag from "./components/CanonicalTag.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import GAViewTracker from "./components/GAViewTracker.jsx";

// Layout
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import GlobalAffiliateBanner from "./components/GlobalAffiliateBanner.jsx";

// Routes
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  // Lightweight perf hinting — unchanged behavior
  useEffect(() => {
    const lowCores =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const hiDPRSmall = window.devicePixelRatio > 2 && window.innerWidth < 900;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (lowCores || hiDPRSmall || reduced) document.body.classList.add("perf");
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <CanonicalTag />
      <ScrollToTop />
      <GAViewTracker />

      <SiteHeader />

      <AppRoutes />

      {/* Site-wide holding banner (shows even without affiliate) */}
      <GlobalAffiliateBanner />

      <SiteFooter />
    </div>
  );
}
