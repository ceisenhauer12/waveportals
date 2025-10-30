// src/components/IvyEggModal.jsx
import { useEffect, useRef } from "react";
import { loadYouTubeAPI } from "../utils/youtube.js";

export default function IvyEggModal({ open, onClose }) {
  const containerId = "ivy-yt-player";
  const playerRef = useRef(null);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Create/destroy YT player
  useEffect(() => {
    if (!open) return;
    let destroyed = false;

    loadYouTubeAPI().then((YT) => {
      if (destroyed) return;
      playerRef.current = new YT.Player(containerId, {
        videoId: "YcPPq98OY_w", // ABBA — I Am The City
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
        },
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glow-panel"
        style={{
          width: "min(920px, 96vw)",
          borderRadius: 12,
          border: "1px solid #044966",
          background: "linear-gradient(180deg, #041b22, #020c10)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #044966",
          }}
        >
          <span className="glow-text" style={{ fontWeight: 800, color: "#9eeaff" }}>
            you let me be
          </span>
          <span className="muted" style={{ fontSize: ".9rem" }}>
            — thanks for finding the easter egg
          </span>
          <button className="btn btn-quiet" onClick={onClose} aria-label="Close" style={{ marginLeft: "auto" }}>
            Close
          </button>
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #044966",
              background: "#000",
            }}
          >
            <div id={containerId} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Tip: click outside the player or press <kbd>Esc</kbd> to close.
          </p>
        </div>
      </div>
    </div>
  );
}
