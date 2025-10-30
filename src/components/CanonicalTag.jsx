// src/components/CanonicalTag.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CANONICAL_ORIGIN } from "../hooks/meta.js";

export default function CanonicalTag() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // normalize: remove trailing "/" except root
    const cleanPath =
      pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const href = CANONICAL_ORIGIN + cleanPath + search;

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [pathname, search]);

  return null;
}
