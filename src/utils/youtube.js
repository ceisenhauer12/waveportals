// src/utils/youtube.js
let __ytApiPromise;

/** Loads the YouTube IFrame API once and returns window.YT */
export function loadYouTubeAPI() {
  // Already loaded?
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);

  // In-flight?
  if (__ytApiPromise) return __ytApiPromise;

  // Start loading
  __ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });

  return __ytApiPromise;
}

