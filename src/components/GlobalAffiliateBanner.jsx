// src/components/GlobalAffiliateBanner.jsx
import { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

/**
 * Props:
 * - title, tagline, to, cta: text/route
 * - bgStyle: "aurora" | "portal" (visual background accent)
 * - sfx: "none" | "wave" | "portal" (hover sound)
 * - widthPct: 0.66..0.85 (rough width proportion on desktop)
 */
export default function GlobalAffiliateBanner({
  title = "Enter the WavePortal",
  tagline = "Experience Portal • Explore • Book • Play",
  to = "/affiliates",
  cta = "Launch",
  bgStyle = "aurora",
  sfx = "wave",
  widthPct = 0.75,
}) {
  const audioRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const cooldownRef = useRef(0);

  // Preload chosen SFX
  useEffect(() => {
    if (sfx === "none") return;
    const src =
      sfx === "portal" ? "/sfx/portal.mp3" :
      sfx === "wave"   ? "/sfx/wave.mp3"   : null;

    if (!src) return;
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = 0.20; // keep this subtle
    a.addEventListener("canplaythrough", () => setCanPlay(true), { once: true });
    audioRef.current = a;
  }, [sfx]);

  
  function playHoverSound() {
    // polite: skip if none configured, or file not ready, or fast repeats
    if (sfx === "none" || !canPlay || !audioRef.current) return;
    const now = performance.now();
    if (now - cooldownRef.current < 600) return; // 600ms cooldown
    cooldownRef.current = now;

    try {
      const a = audioRef.current;
      a.currentTime = 0;
      a.play().catch(() => {/* ignore */});
    } catch { /* ignore */ }
    
    function playClickSound() {
  const a = new Audio("/sfx/portal-open.mp3");
  a.volume = 0.25;
  a.play().catch(() => {});
}

  }

  const widthClamp = `clamp(320px, ${Math.round(widthPct*100)}%, 1100px)`;

  const auraLayers = (
    <>
      {/* faint grid overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          opacity: 0.08,
          background:
            "repeating-linear-gradient(90deg, rgba(0,255,255,.5) 0 1px, transparent 1px 28px)," +
            "repeating-linear-gradient(0deg,  rgba(0,255,255,.5) 0 1px, transparent 1px 28px)",
          pointerEvents: "none",
        }}
      />
      {/* aurora blobs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          left: -30,
          width: 280,
          height: 220,
          filter: "blur(28px)",
          background: "radial-gradient(closest-side, rgba(0,255,255,.20), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -20,
          top: -30,
          width: 240,
          height: 200,
          filter: "blur(26px)",
          background: "radial-gradient(closest-side, rgba(0,170,255,.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </>
  );

  const portalRings = (
    <>
      {/* subtle concentric rings */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          opacity: 0.10,
          background:
            "radial-gradient(circle at 80% 30%, rgba(0,255,255,.25) 0 2px, transparent 3px 100px)," +
            "radial-gradient(circle at 80% 30%, rgba(0,255,255,.15) 0 2px, transparent 4px 160px)",
          pointerEvents: "none",
          filter: "blur(0.3px)",
        }}
      />
      {/* faint diagonal glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          background:
            "linear-gradient(120deg, rgba(0,255,255,.06), rgba(0,0,0,0) 30%, rgba(0,255,255,.06) 60%, rgba(0,0,0,0))",
          pointerEvents: "none",
          opacity: 0.7,
        }}
      />
    </>
  );

  return (
    <section
      aria-label="WavePortals Banner"
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "32px 0 18px",
      }}
    >
      <div
        onPointerEnter={playHoverSound}
        style={{
          position: "relative",
          width: widthClamp,           // ~2/3–3/4 page width
          borderRadius: 16,
          border: "1px solid rgba(0, 255, 255, .18)",
          background: "linear-gradient(180deg,#041118,#071b22 70%,#05171d)",
          boxShadow:
            "0 0 0 1px rgba(0,255,255,.06) inset, 0 0 24px rgba(0,255,255,.08)",
          overflow: "hidden",
        }}
      >
        {/* background design layer */}
        {bgStyle === "portal" ? portalRings : auraLayers}

        {/* content shell */}
        <div
          aria-hidden
          style={{
            position: "relative",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 0 28px rgba(0,255,255,.12) inset",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              border: "1px solid rgba(0, 255, 255, .30)",
              background:
                "radial-gradient(120% 200% at 50% 0%, rgba(0,255,255,.07), rgba(0,0,0,.0) 55%), linear-gradient(180deg,#03151b,#05181e)",
              padding: "18px 18px",
              minHeight: 96,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: 16,
              boxShadow:
                "0 0 0 1px rgba(0,255,255,.06) inset, 0 8px 50px rgba(0,255,255,.08)",
            }}
          >
            <div style={{ position: "relative" }}>
              <h3
  className="glow-text"
  style={{
    margin: 0,
    fontSize: "1.6rem",
    letterSpacing: ".02em",
    fontWeight: 900,
    color: "#00E6FF",                // <— bright cyan (match your screenshot)
    textShadow: "0 0 14px rgba(0,230,255,.55), 0 0 34px rgba(0,230,255,.35)",
    lineHeight: 1.2,
  }}
>
  {title}
</h3>

              <div
                className="muted"
                style={{
                  marginTop: 6,
                  fontSize: ".95rem",
                  color: "#8ddcf2",
                  opacity: 0.9,
                }}
              >
                {tagline}
              </div>
              {/* subtle underline */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -8,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(0,255,255,.05), rgba(0,255,255,.35), rgba(0,255,255,.05))",
                  borderRadius: 2,
                }}
              />
            </div>

            <NavLink
              to={to}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                minWidth: 120,
                padding: "0 18px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
                letterSpacing: ".02em",
                color: "#bff7ff",
                border: "1px solid rgba(0,255,255,.35)",
                boxShadow:
                  "0 0 18px rgba(0,255,255,.14), 0 0 0 1px rgba(0,255,255,.08) inset",
                background:
                  "linear-gradient(180deg, rgba(0,255,255,.10), rgba(0,255,255,.04))",
                transition: "transform .12s ease, box-shadow .12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 26px rgba(0,255,255,.28), 0 0 0 1px rgba(0,255,255,.12) inset";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 18px rgba(0,255,255,.14), 0 0 0 1px rgba(0,255,255,.08) inset";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              aria-label={`${cta} the WavePortal`}
            >
              {cta}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}

