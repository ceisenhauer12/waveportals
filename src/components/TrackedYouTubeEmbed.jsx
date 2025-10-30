// src/components/TrackedYouTubeEmbed.jsx
import { useEffect, useRef, useState } from "react";
import { loadYouTubeAPI } from "../utils/youtube.js";

export default function TrackedYouTubeEmbed({ src, title }) {
  const iframeRef = useRef(null);
  const [embedSrc, setEmbedSrc] = useState("");

  // normalize URL to enable JS API + origin
  useEffect(() => {
    if (!src) return;
    try {
      const u = new URL(src);
      if (!u.hostname.includes("youtube.com")) {
        setEmbedSrc(src);
        return;
      }
      u.searchParams.set("enablejsapi", "1");
      u.searchParams.set("origin", location.origin);
      setEmbedSrc(u.toString());
    } catch {
      setEmbedSrc(src);
    }
  }, [src]);

  // wire GA4 tracking to the YouTube player
  useEffect(() => {
    if (!embedSrc || !embedSrc.includes("youtube.com")) return;

    let player, timer;
    const fired = { 25: false, 50: false, 90: false, 100: false };
    const send = (name, params = {}) => {
      if (!window.gtag) return;
      window.gtag("event", name, { event_category: "video", ...params });
    };

    loadYouTubeAPI().then((YT) => {
      if (!iframeRef.current) return;
      player = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => send("video_start", { title }),
          onStateChange: (e) => {
            const s = e.data;
            if (s === YT.PlayerState.PLAYING) {
              timer = timer || setInterval(() => {
                const dur = player.getDuration?.() || 0;
                const cur = player.getCurrentTime?.() || 0;
                if (dur > 0) {
                  const pct = (cur / dur) * 100;
                  if (!fired[25] && pct >= 25) { fired[25] = true; send("video_progress", { title, progress: "25" }); }
                  if (!fired[50] && pct >= 50) { fired[50] = true; send("video_progress", { title, progress: "50" }); }
                  if (!fired[90] && pct >= 90) { fired[90] = true; send("video_progress", { title, progress: "90" }); }
                  if (!fired[100] && pct >= 99) { fired[100] = true; send("video_complete", { title }); }
                }
              }, 1000);
            } else if (s === YT.PlayerState.ENDED) {
              if (!fired[100]) send("video_complete", { title });
              clearInterval(timer); timer = null;
            } else if (s === YT.PlayerState.PAUSED) {
              send("video_pause", { title });
            }
          },
        },
      });
    });

    return () => { try { clearInterval(timer); player?.destroy?.(); } catch {} };
  }, [embedSrc, title]);

  return (
    <div className="video-wrap" style={{ marginTop: 12, aspectRatio: "16/9" }}>
      <iframe
        ref={iframeRef}
        src={embedSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 0, width: "100%", height: "100%" }}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
