// src/hooks/meta.js
import { useEffect } from "react";

export const CANONICAL_ORIGIN = "https://www.waveportals.com";

// internal helper
function setOrCreate(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/** Page title + description (cleans up on unmount) */
export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const prevDesc = meta.content;
    meta.content = description || "";

    return () => {
      document.title = prevTitle;
      meta.content = prevDesc || "";
    };
  }, [title, description]);
}

/** OG/Twitter share tags */
export function useShareMeta({ title, description, url, image }) {
  useEffect(() => {
    document.title = title || "WavePortals";
    setOrCreate('meta[name="description"]', {
      name: "description",
      content: description || "",
    });

    setOrCreate('meta[property="og:title"]', {
      property: "og:title",
      content: title || "WavePortals",
    });
    setOrCreate('meta[property="og:description"]', {
      property: "og:description",
      content: description || "",
    });
    setOrCreate('meta[property="og:url"]', {
      property: "og:url",
      content: url || CANONICAL_ORIGIN + "/",
    });
    if (image)
      setOrCreate('meta[property="og:image"]', {
        property: "og:image",
        content: image,
      });

    setOrCreate('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title || "WavePortals",
    });
    setOrCreate('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description || "",
    });
    if (image)
      setOrCreate('meta[name="twitter:image"]', {
        name: "twitter:image",
        content: image,
      });
  }, [title, description, url, image]);
}
