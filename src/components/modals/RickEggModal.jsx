// src/components/RickEggModal.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadYouTubeAPI } from "../../utils/youtube";

export default function RickEggModal({ open, onClose }) {
  const containerId = "rick-yt-player";
  const playerRef = useRef(null);
  const [useEmbed, setUseEmbed] = useState(false);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Build YouTube player; fallback to simple iframe on error
  useEffect(() => {
    if (!open) return;

    let destroyed = false;

    loadYouTubeAPI()
      .then((YT) => {
        if (destroyed || !YT || useEmbed) return;
        try {
          playerRef.current = new YT.Player(containerId, {
            videoId: "dQw4w9WgXcQ",
            playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
            events: {
              onReady: (e) => {
                try {
                  e.target.mute();
                  e.target.playVideo();
                  setTimeout(() => {
                    try { e.target.setVolume(25); e.target.unMute(); } catch {}
                  }, 0);
                } catch {}
              },
              onError: () => { if (!destroyed) setUseEmbed(true); },
            },
          });
        } catch {
          if (!destroyed) setUseEmbed(true);
        }
      })
      .catch(() => { if (!destroyed) setUseEmbed(true); });

    return () => {
      destroyed = true;
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [open, useEmbed]);

  if (!open) return null;

  return createPortal(
    <div
      onMouseDown={onClose}
      onTouchStart={onClose}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "grid", placeItems: "center", zIndex: 2147483647,
        padding: 16, cursor: "zoom-out",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="glow-panel"
        style={{
          width: "min(920px, 96vw)", maxHeight: "90vh",
          borderRadius: 12, border: "1px solid #044966",
          background: "linear-gradient(180deg, #041b22, #020c10)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)", overflow: "hidden", cursor: "default",
        }}
      >
        <div
          style={{
            padding: "10px 12px", display: "flex", alignItems: "center",
            gap: 8, borderBottom: "1px solid #044966",
          }}
        >
          <span className="glow-text" style={{ fontWeight: 800, color: "#9eeaff" }}>
            You got Rick-Rolled! - Freston Road railway bridge — Notting Hill.
          </span>
          <button className="btn btn-quiet" onClick={onClose} aria-label="Close" style={{ marginLeft: "auto" }}>
            Close
          </button>
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              position: "relative", width: "100%", aspectRatio: "16 / 9", maxHeight: "70vh",
              borderRadius: 10, overflow: "hidden", border: "1px solid #044966", background: "#000",
            }}
          >
            {useEmbed ? (
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1"
                title="Rick Astley"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 0, width: "100%", height: "100%" }}
              />
            ) : (
              <div id={containerId} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            )}
          </div>

          <p className="muted" style={{ marginTop: 8 }}>
            Tip: click outside the player or press <kbd>Esc</kbd> to close.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
