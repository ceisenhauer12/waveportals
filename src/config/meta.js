// src/config/meta.js
import { useEffect } from "react";

/**
 * Sets document title and <meta name="description">.
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;

    if (typeof description === "string") {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
}

/**
 * Sets Open Graph / Twitter cards. Pass any subset you need.
 *   useShareMeta({ title, description, image, url })
 */
export function useShareMeta({ title, description, image, url } = {}) {
  useEffect(() => {
    const setMeta = (key, content) => {
      if (!content) return;
      let el =
        document.querySelector(`meta[property="${key}"]`) ||
        document.querySelector(`meta[name="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        // Prefer property= for OG/Twitter
        if (key.startsWith("og:") || key.startsWith("twitter:")) {
          el.setAttribute("property", key);
        } else {
          el.setAttribute("name", key);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (title) {
      document.title = title;
      setMeta("og:title", title);
      setMeta("twitter:title", title);
    }
    if (description) {
      setMeta("og:description", description);
      setMeta("twitter:description", description);
    }
    if (image) {
      setMeta("og:image", image);
      setMeta("twitter:image", image);
    }
    if (url) setMeta("og:url", url);
  }, [title, description, image, url]);
}
