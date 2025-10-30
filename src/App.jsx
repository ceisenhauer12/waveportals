// src/App.jsx
import { useState, useMemo, useEffect, useRef, memo } from "react";
import {
  Routes,
  Route,
  NavLink,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createPortal } from "react-dom"; // ← if you also import this later in the file, delete the later one
import CITY_DB from "./data/cities.js";
import { toEmbedUrl } from "./utils/embed.js";
import ScrollToTop from "./components/ScrollToTop.jsx";



/* ===================== GA4 page-view tracker ===================== */
function GAViewTracker() {
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
  }, [location.pathname, location.search]);

  return null;
}

/* ===================== Canonical <link> ===================== */
const CANONICAL_ORIGIN = "https://www.waveportals.com";
function CanonicalTag() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    // normalize: remove trailing "/" except root
    const cleanPath =
      pathname !== "/" && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
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

/* ===================== Page meta (title + description) ===================== */
function usePageMeta(title, description) {
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

/* ===================== Route-specific OG/Twitter tags ===================== */
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

function useShareMeta({ title, description, url, image }) {
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

/* ===================== Partner / referral link helper ===================== */
const MYE_REF = "EM20252B6414";
const DEFAULT_UTM = {
  utm_source: "waveportals",
  utm_medium: "site",
  utm_campaign: "earthmeta_cta",
};
function buildPartnerLink(raw) {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (MYE_REF) u.searchParams.set("ref", MYE_REF);
    for (const [k, v] of Object.entries(DEFAULT_UTM)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return raw;
  }
}

/* ===================== Time helpers & LIVE badge window (CT) ===================== */
/* LIVE badge window: Thursday 9:00–11:00 AM CT (covers ceremony ~9:00–10:45) */
function isInCTLiveWindow() {
  const now = new Date();
  const chicago = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const d = chicago.getDay(); // Thu = 4
  const h = chicago.getHours();
  const m = chicago.getMinutes();
  if (d !== 4) return false;

  const afterStart = h > 9 || (h === 9 && m >= 0);   // >= 9:00
  const beforeEnd  = h < 10 || (h === 10 && m <= 45); // <= 10:45
  return afterStart && beforeEnd;
}

function useIsInCTLiveWindow() {
  const [inWindow, setInWindow] = useState(isInCTLiveWindow());
  useEffect(() => {
    const id = setInterval(() => setInWindow(isInCTLiveWindow()), 15_000);
    return () => clearInterval(id);
  }, []);
  return inWindow;
}

function LiveBadge() {
  const inWindow = useIsInCTLiveWindow();
  if (!inWindow) return null;
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#2a0006",
        border: "1px solid #ff3355",
        color: "#ff5577",
        fontWeight: 700,
        fontSize: "0.8rem",
        textShadow: "0 0 5px #ff2244",
      }}
      title="Expected live window (heuristic)"
    >
      LIVE
    </span>
  );
}

/* ===================== Countdown to next Thursday 9:00 CT ===================== */
function nextThursdayAt0900CT() {
  const now = new Date();
  const chicagoNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  const d = new Date(chicagoNow);
  const day = d.getDay(); // 0..6 (Thu=4)
  const isThu = day === 4;
  const after1100 =
    d.getHours() > 11 || (d.getHours() === 11 && d.getMinutes() > 0);

  let addDays;
  if (isThu && !after1100) addDays = 0;
  else {
    const delta = (4 - day + 7) % 7;
    addDays = delta === 0 ? 7 : delta;
  }
  d.setDate(d.getDate() + addDays);
  d.setHours(9, 0, 0, 0);

  return new Date(
    new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" }))
  );
}

function useCountdownToNextRTC() {
  const [now, setNow] = useState(Date.now());
  const target = useMemo(() => nextThursdayAt0900CT(), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds, diff };
}

function CountdownToRTC() {
  const { days, hours, minutes, seconds, diff } = useCountdownToNextRTC();
  if (diff === 0) return null;
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        Next RTC Graduation Live stream (Thu 9:00 AM CT) in:
      </div>
      <div className="glow-text" style={{ fontWeight: 700 }}>
        {days}d {hours}h {minutes}m {seconds}s
      </div>
    </div>
  );
}

/* ===================== Notes & players ===================== */
function RTCScheduleNote() {
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted">
        RTC Graduation livestream: <strong>Thursdays, 9:00 AM CT</strong>.
      </div>
      <div className="muted" style={{ marginTop: 4 }}>
        If the player shows “unavailable,” it’s before showtime or there’s no
        ceremony this week.
      </div>
    </div>
  );
}

/* ===== Simple in-view lazy mount for iframes (keeps page lighter) ===== */
function useInView(rootMargin = "250px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, rootMargin]);
  return { ref, inView };
}

function DeferredIframe(props) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="video-wrap"
      style={{ marginTop: 12, aspectRatio: "16 / 9" }}
    >
      {inView ? (
        <iframe
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          {...props}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#000" }} />
      )}
    </div>
  );
}

/** Live-or-replay player */
function LiveOrFallbackPlayer({ channelId, fallbackUrl, title }) {
  const [useFallback, setUseFallback] = useState(false);
  const inWindow = useIsInCTLiveWindow();
  const hasUC = !!channelId && channelId.startsWith("UC");
  const embedFallback = toEmbedUrl(fallbackUrl);

  if (!inWindow && embedFallback) {
    return (
      <DeferredIframe
        src={embedFallback}
        title={title ? `${title} (Replay)` : "Replay"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <>
      <div className="video-wrap" style={{ marginTop: 12, aspectRatio: "16 / 9" }}>
        {!useFallback && hasUC && (
          <iframe
            src={`https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(
              channelId
            )}&autoplay=1&mute=1`}
            title={title || "Live Stream"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%" }}
            onError={() => setUseFallback(true)}
          />
        )}
        {(useFallback || !hasUC) && embedFallback ? (
          <iframe
            src={embedFallback}
            title={title ? `${title} (Replay)` : "Replay"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        ) : (useFallback || !hasUC) && !embedFallback ? (
          <div
            className="glow-panel"
            style={{ display: "grid", placeItems: "center", padding: 40 }}
          >
            <span className="muted">
              RTC livestream placeholder — no fallback video configured.
            </span>
          </div>
        ) : null}
      </div>

      <div className="btn-row">
        {channelId && (
          <a
            href={`https://www.youtube.com/${
              channelId.startsWith("@") ? channelId : `channel/${channelId}`
            }/streams`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quiet"
            aria-label="Watch on YouTube"
          >
            Watch on YouTube
          </a>
        )}
        {embedFallback && inWindow && hasUC && !useFallback && (
          <button
            className="btn btn-quiet"
            onClick={() => setUseFallback(true)}
            aria-label="Play replay instead"
          >
            Play replay instead
          </button>
        )}
      </div>

      {inWindow && hasUC && !useFallback && (
        <div className="muted" style={{ marginTop: 8 }}>
          Autoplay is muted by default. Unmute in the player to hear audio.
        </div>
      )}
    </>
  );
}

/* ===================== LazyMount helper (for heavy sections) ===================== */
function LazyMount({ children, rootMargin = "600px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { rootMargin });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, rootMargin]);

  // Reserve a bit of space to avoid layout jump (adjust if needed)
  return <div ref={ref}>{inView ? children : <div style={{ height: 360 }} />}</div>;
}

/* ===================== City image components (local → Picsum fallback) ===================== */
function CityTileImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title || "City image"}
      loading="lazy"
      decoding="async"
      fetchpriority="low"
      width={1600}
      height={900}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
          id
        )}/1600/900`;
      }}
      style={{
        width: "100%",
        height: "180px",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function CityBannerImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title || "City image"}
      loading="lazy"
      decoding="async"
      width={1600}
      height={900}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
          id
        )}/1600/900`;
      }}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}



// ---------- One-time YouTube IFrame API loader ----------
let __ytApiPromise;
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (__ytApiPromise) return __ytApiPromise;
  __ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return __ytApiPromise;
}

/* ===== Rick modal — Ivy clone, but rendered via PORTAL so backdrop clicks work ===== */
function RickEggModal({ open, onClose }) {
  const containerId = "rick-yt-player";
  const playerRef = useRef(null);

  // NEW: if API doesn’t load fast, fall back to a plain iframe
  const [useEmbed, setUseEmbed] = useState(false);
  const fallbackTimerRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent page scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Create / destroy player
  useEffect(() => {
    if (!open) return;

    let destroyed = false;
    loadYouTubeAPI().then((YT) => {
      if (destroyed) return;
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

  useEffect(() => {
    if (!open) return;

    // removed the auto-fallback timer; only fallback on API/player error
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
              onError: () => {
                if (!destroyed) setUseEmbed(true);
              },
            },
          });
        } catch {
          if (!destroyed) setUseEmbed(true);
        }
      })
      .catch(() => {
        if (!destroyed) setUseEmbed(true);
      });

    return () => {
      destroyed = true;
      clearTimeout(fallbackTimerRef.current);
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [open, useEmbed]);

  if (!open) return null;

  // PORTAL = escape any transformed ancestors from the map; clicks hit the backdrop reliably.
  return createPortal(
    <div
      onMouseDown={onClose}     // close on pointer-down (more reliable around iframes)
      onTouchStart={onClose}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 2147483647,
        padding: 16,
        cursor: "zoom-out",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="glow-panel"
        style={{
          width: "min(920px, 96vw)",
          maxHeight: "90vh",
          borderRadius: 12,
          border: "1px solid #044966",
          background: "linear-gradient(180deg, #041b22, #020c10)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          overflow: "hidden",
          cursor: "default",
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
            You got Rick-Rolled! - Freston Road railway bridge — Notting Hill.
          </span>
          <button
            className="btn btn-quiet"
            onClick={onClose}
            aria-label="Close"
            style={{ marginLeft: "auto" }}
          >
            Close
          </button>
        </div>

        {/* Same 16:9 wrapper as Ivy (Rick is 4:3, so you’ll see pillarboxes inside) */}
        <div style={{ padding: 12 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              maxHeight: "70vh",
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
    </div>,
    document.body
  );
}

/* ============================== Map banner (world map with pins) ============================== */
function MapBanner() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Rick Easter Egg modal + hover state
  const [rickOpen, setRickOpen] = useState(false);
  const [rickHover, setRickHover] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setSize((prev) =>
        prev.w === r.width && prev.h === r.height ? prev : { w: r.width, h: r.height }
      );
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const points = useMemo(() => {
    if (!size.w || !size.h) return [];
    return Object.entries(CITY_DB)
      .filter(([, c]) => Array.isArray(c.coords) && c.coords.length === 2)
      .map(([id, c]) => ({ id, title: c.title, coords: c.coords }));
  }, [size.w, size.h]);

  // Project lat/lon into the current container space
  function project([lat, lon]) {
    const x = ((lon + 180) / 360) * size.w;
    const y = ((90 - lat) / 180) * size.h;
    return [x, y];
  }

  // Freston Road railway bridge (under Westway)
  const RICK_COORDS = [51.51373, -0.21926];
  const [rx, ry] = project(RICK_COORDS);

  return (
    <section
      className="glow-panel"
      style={{
        margin: "16px 0",
        border: "1px solid #044966",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #044966",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="glow-text" style={{ fontWeight: 700 }}>
          Explore on the map
        </span>
        <span className="muted" style={{ fontSize: ".9rem" }}>
          Scroll to zoom, drag to move
        </span>
      </div>

      <div
        ref={ref}
        style={{
          width: "100%",
          aspectRatio: "16 / 8",
          background: "radial-gradient(ellipse at top, #012029, #000 70%)",
          position: "relative",
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={6}
          wheel={{ step: 0.2 }}
          doubleClick={{ disabled: true }}
          pinch={{ step: 0.3 }}
        >
          {({ state }) => (
            <TransformComponent>
              <div
                style={{
                  position: "relative",
                  width: size.w,
                  height: size.h,
                  transformOrigin: "0 0",
                }}
              >
                <img
                  src="/images/maps/world-equirect.png"
                  alt="World map"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.9,
                    filter: "saturate(1.1) contrast(1.05)",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Normal city pins */}
                {size.w > 0 &&
                  points.map((p) => {
                    const [x, y] = project(p.coords);
                    return (
                      <MapPin
                        key={p.id}
                        x={x}
                        y={y}
                        id={p.id}
                        title={p.title}
                        scale={state?.scale || 1}
                      />
                    );
                  })}

                {/* Rick pin — same style as MapPin, click opens modal */}
                {size.w > 0 && (
                  <div
                    role="button"
                    aria-label="Click me"
                    title="Click me"
                    onMouseEnter={() => setRickHover(true)}
                    onMouseLeave={() => setRickHover(false)}
                    onClick={() => setRickOpen(true)}
                    style={{
                      position: "absolute",
                      left: rx,
                      top: ry,
                      transform: `translate(-50%, -50%) scale(${1 / (state?.scale || 1)})`,
                      transformOrigin: "50% 50%",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#33ccff",
                      boxShadow: "0 0 4px #33ccff, 0 0 8px rgba(0,255,255,0.5)",
                      border: "1px solid #033",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
                  >
                    {rickHover && (
                      <span
                        role="tooltip"
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "100%",
                          transform: "translate(-50%, -8px)",
                          background: "rgba(5, 30, 40, 0.95)",
                          border: "1px solid #044966",
                          color: "#9eeaff",
                          padding: "6px 8px",
                          borderRadius: 8,
                          whiteSpace: "nowrap",
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,.5)",
                          pointerEvents: "none",
                        }}
                      >
                        Never Give up
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      {/* Rick modal via portal (outside any transformed ancestor) */}
      <RickEggModal open={rickOpen} onClose={() => setRickOpen(false)} />
    </section>
  );
}

/* Memoized to avoid rerender storms on zoom/hover elsewhere */
const MapPin = memo(function MapPin({ x, y, id, title, scale = 1 }) {
  const base = 5; // smaller starting size
  return (
    <NavLink
      to={`/city/${id}`}
      title={title}
      className="map-pin"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 / scale})`,
        transformOrigin: "50% 50%",
        width: base,
        height: base,
        borderRadius: "50%",
        background: "#33ccff",
        boxShadow: "0 0 4px #33ccff, 0 0 8px rgba(0,255,255,0.5)",
        border: "1px solid #033",
        cursor: "pointer",
        zIndex: 2,
      }}
    />
  );
});

/* ============================== Tiny Markdown -> HTML ============================== */
/* Supports: ### headings, **bold**, links [text](url), bullet lists '-', line breaks */
function mdToHtml(md = "") {
  if (!md) return "";
  // escape HTML
  let h = md.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // headings ###
  h = h.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  // bold **text**
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // links [text](url)
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // bullet lists: lines starting with "- " or •
  h = h.replace(/^(?:- |\u2022 )(.*)$/gm, "<li>$1</li>");
  h = h.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>").replace(/<\/ul>\s*<ul>/g, ""); // merge adjacent ULs
  // line breaks → paragraphs (skip if block is h3 or ul)
  h = h
    .split(/\n{2,}/)
    .map((block) => {
      if (/^\s*<h3>/.test(block) || /^\s*<ul>/.test(block)) return block;
      const withBr = block.replace(/\n/g, "<br/>");
      return withBr.trim() ? `<p>${withBr}</p>` : "";
    })
    .join("\n");
  return h;
}

/* ============================== App Shell ============================== */
function GlobalAffiliateBanner() {
  // site-wide holding banner; shows even with no href
  return (
    <div style={{ padding: "8px 16px", marginTop: 16 }}>
      <AffiliateBanner
        href="" // no affiliate yet → placeholder renders
        imgSrc="/images/branding/waveportal-holder.svg"
        ctaLabel="Launch"
        alt="WavePortals placeholder banner"
      />
    </div>
  );
}

// ---------- IvyEasterEgg with hover hint ----------
function IvyEasterEgg({ children, hint = "you let me be" }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Open easter egg"
        // title is a fallback tooltip for touch/assistive tech
        title={hint}
        style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      >
        {children}

        {/* Hover tooltip */}
        {hover && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translate(-50%, -8px)",
              background: "rgba(5, 30, 40, 0.95)",
              border: "1px solid #044966",
              color: "#9eeaff",
              padding: "6px 8px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,.5)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {hint}
          </span>
        )}
      </span>

      <IvyEggModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ---------- Modal for the easter egg ----------
function IvyEggModal({ open, onClose }) {
  const containerId = "ivy-yt-player";
  const playerRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Create / destroy player
  useEffect(() => {
    if (!open) return;

    let destroyed = false;

    loadYouTubeAPI().then((YT) => {
      if (destroyed) return;

      playerRef.current = new YT.Player(containerId, {
        videoId: "YcPPq98OY_w", // ABBA — I Am The City
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            try {
              // Start muted to satisfy autoplay policies, then unmute to 25%.
              e.target.mute();
              e.target.playVideo();
              // The click that opened the modal counts as a user gesture,
              // so we can unmute & set volume right away.
              setTimeout(() => {
                try {
                  e.target.setVolume(25); // 0–100
                  e.target.unMute();
                } catch {}
              }, 0);
            } catch {}
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
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

          <button
            className="btn btn-quiet"
            onClick={onClose}
            aria-label="Close"
            style={{ marginLeft: "auto" }}
          >
            Close
          </button>
        </div>

        {/* Player container with a stable 16:9 box so it always fits */}
        <div style={{ padding: 12 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #044966",
            }}
          >
            <div
              id={containerId}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          </div>

          <p className="muted" style={{ marginTop: 8 }}>
            Tip: click outside the player or press <kbd>Esc</kbd> to close.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const lowCores =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const hiDPRSmall = window.devicePixelRatio > 2 && window.innerWidth < 900;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      ?.matches;
    if (lowCores || hiDPRSmall || reduced) document.body.classList.add("perf");
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <CanonicalTag />
      <ScrollToTop />
      <GAViewTracker />

      <header className="site-header" style={{
        position: "relative",
        borderBottom: "1px solid #022",
        padding: "10px 20px",
        minHeight: 0,
        backgroundImage: "url('/images/branding/wave_portal_2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <NavLink
          to="/"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
          aria-label="WavePortals home"
        >
          <img
            src="/waveportalslogo.png"
            alt="WavePortals logo"
            style={{
              height: 140,
              width: "auto",
              boxShadow: "0 6px 16px rgba(0,0,0,.6)",
            }}
          />
        </NavLink>

        <div
          className="glow-text"
          style={{
            position: "relative",
            zIndex: 1,
            marginLeft: "auto",
            fontSize: "1.4rem",
            fontStyle: "italic",
            fontWeight: 500,
            textShadow: "0 2px 8px rgba(0,0,0,.8)",
            paddingLeft: 12,
          }}
        >
          WavePortals: riding the wave of{" "}
          <a
            href="https://app.earthmeta.ai?ref=EM20252B6414"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 700, color: "#0ff", textDecoration: "none" }}
            aria-label="Open EarthMeta.ai"
          >
            EarthMeta.ai
          </a>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:id" element={<CityDetail />} />
        <Route path="/city/:id/land/:landId" element={<LandDetail />} />
        {/* NEW: sub-land route (must be BEFORE the wildcard) */}
        <Route path="/city/:id/land/:landId/sub/:subId" element={<SubLandDetail />} />
        <Route path="/city/:id/affiliates" element={<CityAffiliates />} />
        <Route path="/404" element={<NotFound />} />
        {/* Keep this LAST */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Site-wide holding banner (shows even without affiliate) */}
      <GlobalAffiliateBanner />

      <footer
        className="glow-footer"
        style={{ padding: "20px 32px", marginTop: 16, textAlign: "center" }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span>© {new Date().getFullYear()} WavePortals — built by</span>
          <IvyEasterEgg>
            <img
              src="/images/branding/ivy-mark.png"
              alt="Ivy logo"
              className="ivy-logo"
              style={{
                height: 48,
                width: "auto",
                transition: "transform 0.3s ease, filter 0.3s ease",
                filter: "brightness(1.2) saturate(1.4)",
                cursor: "pointer",
              }}
            />
          </IvyEasterEgg>
        </div>
      </footer>
    </div>
  );
}


/* =============================== HOME (tiles) =============================== */
function Home() {
  usePageMeta(
    "WavePortals • Featured Cities of IceManWave",
    "Browse featured EarthMeta cities, live cams, casinos, and cultural anchors."
  );
  useShareMeta({
    title: "WavePortals • Featured Cities of IceManWave",
    description: "Explore featured cities with live cams and portals into EarthMeta.",
    url: `${CANONICAL_ORIGIN}/`,
    image: `${CANONICAL_ORIGIN}/images/branding/wave_portal_2.jpg`,
  });

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");

  // progressively reveal cards: paint first batch immediately, rest after idle
  const [renderCount, setRenderCount] = useState(8);
  useEffect(() => {
    let cancelled = false;
    const schedule = window.requestIdleCallback
      ? (cb) => requestIdleCallback(cb, { timeout: 1200 })
      : (cb) => setTimeout(cb, 0);
    schedule(() => {
      if (!cancelled) setRenderCount(9999);
    });
    return () => {
      cancelled = true;
    };
  }, [query, sort]);

  const cities = useMemo(() => {
    const arr = Object.entries(CITY_DB).map(([id, v]) => ({ id, ...v }));
    const q = query.trim().toLowerCase();
    let filtered = q
      ? arr.filter((c) => {
          const hay = (c.title + " " + c.blurb + " " + (c.tags || []).join(" ")).toLowerCase();
          return hay.includes(q);
        })
      : arr;

    if (sort === "az")
      filtered = filtered.slice().sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [query, sort]);

  return (
    <main>
      <h2
        className="glow-text"
        style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 12 }}
      >
        Featured Cities of IceManWave
        <img
          src="/images/branding/icemanwave-logo.png"
          alt="IceManWave logo"
          style={{ height: 72, width: "auto", opacity: 0.9 }}
        />
      </h2>

      {/* NEW: world map banner (lazy-mounted) */}
      <LazyMount rootMargin="800px">
        <MapBanner />
      </LazyMount>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search featured cities, blurbs, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cities"
        />
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort cities"
        >
          <option value="az">Sort A → Z</option>
        </select>
      </div>

      <div className="card-list" style={{ marginTop: 12 }}>
        {cities.slice(0, renderCount).map((c) => (
          <div key={c.id} className="card">
            <div
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #044966",
                marginBottom: 10,
              }}
            >
              <CityTileImage id={c.id} title={c.title} heroImg={c.heroImg} />
            </div>
            <h3>{c.title}</h3>
            <div className="muted clamp-2">{c.blurb}</div>
            {c.tags?.length ? (
              <div className="chips" style={{ marginTop: 8 }}>
                {c.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="btn-row">
              <NavLink to={`/city/${c.id}`} className="btn btn-primary">
                View
              </NavLink>
              {c.earthmetaUrl ? (
                <a
                  href={buildPartnerLink(c.earthmetaUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-quiet"
                  title="Open this city on EarthMeta.ai"
                  aria-label={`Open ${c.title} on EarthMeta.ai`}
                >
                  🌍 EarthMeta
                </a>
              ) : null}
            </div>
          </div>
        ))}
        {!cities.length && <div className="muted">No matches.</div>}
      </div>
    </main>
  );
}

/* ========================= CITY DETAIL (lists lands) ========================= */
function CityDetail() {
  const { id } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  usePageMeta(`${city.title} • WavePortals`, city.blurb);
  useShareMeta({
    title: `${city.title} • WavePortals`,
    description: city.blurb,
    url: `${CANONICAL_ORIGIN}/city/${id}`,
    image: `${CANONICAL_ORIGIN}${city.heroImg || `/images/cities/${id}.jpg`}`,
  });

  return (
    <main>
      <p>
        <NavLink
          to="/"
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back
        </NavLink>
      </p>

      <div
        className="hero"
        style={{
          marginTop: 0,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #044966",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <CityBannerImage id={id} title={city.title} heroImg={city.heroImg} />
          <div
            className="hero-title"
            style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              right: 12,
              fontSize: "1.4rem",
            }}
          >
            {city.title}
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>
        {city.blurb}
      </p>

      <div className="btn-row" style={{ marginTop: 8 }}>
        <NavLink to="/" className="btn btn-quiet">
          ← All cities
        </NavLink>
        <NavLink to={`/city/${id}/affiliates`} className="btn btn-primary">
          Affiliates & Resources
        </NavLink>

        {city.earthmetaUrl ? (
          <a
            href={buildPartnerLink(city.earthmetaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title="Open this city on EarthMeta.ai"
          >
            🌍 View on EarthMeta.ai
          </a>
        ) : null}
      </div>

      <div className="card-list" style={{ marginTop: 12 }}>
        {city.lands?.length ? (
          city.lands.map((land) => (
            <div key={land.id} className="card">
              <h3>{land.name}</h3>
              <div className="muted clamp-2">{land.blurb}</div>
              <div className="btn-row">
                <NavLink
                  to={`/city/${id}/land/${land.id}`}
                  className="btn btn-primary"
                >
                  View
                </NavLink>
              </div>
            </div>
          ))
        ) : (
          <div className="muted">No lands added yet.</div>
        )}
      </div>
    </main>
  );
}

/* ========================= CITY AFFILIATES (generic per-city portal) ========================= */
function CityAffiliates() {
  const { id } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  // Optional fields supported on each city in CITY_DB (all are optional):
  // - city.affiliatesMapUrl: string (Google My Maps or standard map embed URL)
  // - city.featuredPartner: { label, href, imgSrc, ctaLabel }
  // - city.affiliates: Array<{ category: string, items: Array<{ name, description?, href, imgSrc? }> }>

  usePageMeta(`${city.title} • Affiliates & Resources • WavePortals`, city.blurb);
  useShareMeta({
    title: `${city.title} • Affiliates & Resources • WavePortals`,
    description: `Curated partners, lodging, gear, and services for ${city.title}.`,
    url: `${CANONICAL_ORIGIN}/city/${id}/affiliates`,
    image: `${CANONICAL_ORIGIN}${city.heroImg || `/images/cities/${id}.jpg`}`,
  });

  const mapUrl = city.affiliatesMapUrl || ""; // if provided, we’ll embed it
  const featured = city.featuredPartner; // single hero partner (optional)
  const groups = Array.isArray(city.affiliates) ? city.affiliates : [];

  return (
    <main>
      <p>
        <NavLink
          to={`/city/${id}`}
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back to {city.title}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>
        Affiliates & Resources
      </h1>
      <p className="muted">
        Curated partners, lodging, gear, and services to make your visit smoother. We keep this page
        tidy—useful links only, no banner salad. to request your banner reach out at contact@waveportals.com
      </p>

      {/* Featured partner (optional) */}
      {featured?.href ? (
        <section style={{ marginTop: 16 }}>
          <AffiliateBanner
            href={featured.href}
            imgSrc={featured.imgSrc || "/images/branding/waveportal-holder.svg"}
            ctaLabel={featured.ctaLabel || "Shop / Learn More"}
            alt={featured.label || "Featured partner"}
          />
        </section>
      ) : null}

      {/* Map-driven section (optional) */}
      {mapUrl ? (
        <section className="glow-panel" style={{ marginTop: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Interactive Map</h3>
          <p className="muted" style={{ marginTop: 4 }}>
            Tap a pin to open the official site (some links may include our partner tracking).
          </p>
          <div className="video-wrap" style={{ marginTop: 12, aspectRatio: "16 / 9" }}>
            <iframe
              src={mapUrl}
              title={`${city.title} resources map`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, width: "100%", height: "100%", borderRadius: 12 }}
            />
          </div>
        </section>
      ) : null}

      {/* Category groups */}
      {groups.length ? (
        groups.map((g) => (
          <section key={g.category} style={{ marginTop: 16 }}>
            <h3 className="glow-text" style={{ marginBottom: 8 }}>{g.category}</h3>
            <div className="card-list">
              {g.items?.map((it) => (
                <div key={it.name} className="card">
                  {it.imgSrc ? (
                    <div
                      style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid #044966",
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={it.imgSrc}
                        alt={it.name}
                        loading="lazy"
                        style={{ width: "100%", height: 140, objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ) : null}
                  <h4 style={{ marginTop: 0 }}>{it.name}</h4>
                  {it.description ? (
                    <div className="muted clamp-2" style={{ marginBottom: 8 }}>
                      {it.description}
                    </div>
                  ) : null}
                  <div className="btn-row">
                    <a
                      href={buildPartnerLink(it.href)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      {g.category.toLowerCase().includes("hotel") ? "Book Now" : "Open"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="glow-panel" style={{ marginTop: 16, padding: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            No resources added here yet. As we onboard partners, you’ll see hotels, attractions,
            and gear show up—clean, organized, and map-first.
          </p>
        </section>
      )}
    </main>
  );
}
// --- Tracked YouTube embed for GA4 ---
function TrackedYouTubeEmbed({ src, title }) {
  const iframeRef = useRef(null);
  const [embedSrc, setEmbedSrc] = useState("");

  useEffect(() => {
    if (!src) return;
    try {
      const u = new URL(src);
      if (!u.hostname.includes("youtube.com")) { setEmbedSrc(src); return; }
      u.searchParams.set("enablejsapi", "1");
      u.searchParams.set("origin", location.origin);
      setEmbedSrc(u.toString());
    } catch { setEmbedSrc(src); }
  }, [src]);

  useEffect(() => {
    if (!embedSrc || !embedSrc.includes("youtube.com")) return;

    let player, timer, fired = {25:false,50:false,90:false,100:false};
    const send = (name, params={}) => {
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
                  if (!fired[25] && pct >= 25) { fired[25]=true; send("video_progress", { title, progress: "25" }); }
                  if (!fired[50] && pct >= 50) { fired[50]=true; send("video_progress", { title, progress: "50" }); }
                  if (!fired[90] && pct >= 90) { fired[90]=true; send("video_progress", { title, progress: "90" }); }
                  if (!fired[100] && pct >= 99) { fired[100]=true; send("video_complete", { title }); }
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

/* ================= LAND DETAIL (RTC live-or-replay; embeds for others) ================= */
function LandDetail() {
  const { id, landId } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  const land = city.lands?.find((l) => l.id === landId);
  if (!land) return <Navigate to="/404" replace />;

  const embedSrc = toEmbedUrl(land.videoUrl);
  const isRTC = land.channelId === "UCZuVv_Qnvp-2hIqwBIoq5Aw";

  usePageMeta(`${land.name} • ${city.title} • WavePortals`, land.blurb);
  useShareMeta({
    title: `${land.name} • ${city.title} • WavePortals`,
    description: land.blurb,
    url: `${CANONICAL_ORIGIN}/city/${id}/land/${landId}`,
    image: `${CANONICAL_ORIGIN}${city.heroImg || `/images/cities/${id}.jpg`}`,
  });

  return (
    <main>
      <p style={{ marginBottom: 12 }}>
        <NavLink
          to={`/city/${id}`}
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back to {city.title}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>
        {land.name} {isRTC && <LiveBadge />}
      </h1>
      <p className="muted">{land.blurb}</p>

      {isRTC ? (
        <>
          <LiveOrFallbackPlayer
            channelId={land.channelId}
            fallbackUrl={land.fallbackVideoUrl}
            title={land.name}
          />
          <RTCScheduleNote />
          <CountdownToRTC />
        </>
      ) : embedSrc ? (
        <DeferredIframe
          src={embedSrc}
          title={land.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <div
          className="glow-panel"
          style={{ display: "grid", placeItems: "center", padding: 40 }}
        >
          <span className="muted">No video yet</span>
        </div>
      )}

      {/* --- Map embed — Welcome Center ONLY --- */}
      {land.id === "recruit-family-welcome-center" && (
        <section className="glow-panel" style={{ marginTop: 24, padding: 16 }}>
          <h3>Map: Welcome Center, Drill Hall & Gate 8</h3>
          <iframe
            src="https://www.google.com/maps/d/embed?mid=1A4ajxHJ6DaBCJoQm400Etczyfm7OEkc&ehbc=2E312F"
            title="North Chicago graduation locations map"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: "12px", boxShadow: "0 0 15px rgba(0, 255, 255, 0.4)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="btn-row" style={{ marginTop: 12 }}>
            <a
              href="https://www.google.com/maps/d/edit?mid=1A4ajxHJ6DaBCJoQm400Etczyfm7OEkc&usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Interactive Map
            </a>
          </div>
        </section>
      )}

      {/* --- Recruit Family Guide (if provided) --- */}
      {land.info ? (
        <section className="glow-panel" style={{ marginTop: 24, padding: 16 }}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: mdToHtml(land.info) }}
          />
        </section>
      ) : null}

      <div className="btn-row" style={{ marginTop: 12 }}>
        {isRTC && (
          <a
            href="https://www.youtube.com/channel/UCZuVv_Qnvp-2hIqwBIoq5Aw/streams"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quiet"
          >
            Watch on YouTube
          </a>
        )}

        {/* Link to Welcome Center if we're on the Drill Hall page */}
        {land.id === "rtc-ceremonial-drill-hall" &&
          CITY_DB[id]?.lands?.some((l) => l.id === "recruit-family-welcome-center") && (
            <NavLink
              to={`/city/${id}/land/recruit-family-welcome-center`}
              className="btn btn-primary"
            >
              Recruit Family Welcome Center
            </NavLink>
          )}

        <NavLink to={`/city/${id}`} className="btn btn-quiet">
          Back to lands
        </NavLink>
        {city.earthmetaUrl ? (
          <a
            href={buildPartnerLink(city.earthmetaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title="Open this city on EarthMeta.ai"
          >
            🌍 City on EarthMeta.ai
          </a>
        ) : null}
      </div>

      {/* --- Sub-lands (e.g., Wildfire inside Kolmården Zoo) --- */}
      {Array.isArray(land.sublands) && land.sublands.length > 0 && (
        <section className="glow-panel" style={{ marginTop: 24, padding: 16 }}>
          <h3 className="glow-text" style={{ marginTop: 0 }}>Attractions in {land.name}</h3>
          <div className="card-list" style={{ marginTop: 12 }}>
            {land.sublands.map((s) => (
              <div key={s.id} className="card">
                <h4 style={{ marginTop: 0 }}>{s.name}</h4>
                <div className="muted clamp-2">{s.blurb}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <NavLink
                    to={`/city/${id}/land/${land.id}/sub/${s.id}`}
                    className="btn btn-primary"
                  >
                    View
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SubLandDetail() {
  const { id, landId, subId } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  const land = city.lands?.find((l) => l.id === landId);
  if (!land || !Array.isArray(land.sublands)) return <Navigate to="/404" replace />;

  const sub = land.sublands.find((s) => s.id === subId);
  if (!sub) return <Navigate to="/404" replace />;

  const embedSrc = toEmbedUrl(sub.videoUrl);

  usePageMeta(`${sub.name} • ${land.name} • ${city.title} • WavePortals`, sub.blurb);
  useShareMeta({
    title: `${sub.name} • ${land.name} • ${city.title} • WavePortals`,
    description: sub.blurb,
    url: `${CANONICAL_ORIGIN}/city/${id}/land/${landId}/sub/${subId}`,
    image: `${CANONICAL_ORIGIN}${city.heroImg || `/images/cities/${id}.jpg`}`,
  });

  return (
    <main>
      <p style={{ marginBottom: 12 }}>
        <NavLink
          to={`/city/${id}/land/${landId}`}
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back to {land.name}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>{sub.name}</h1>
      <p className="muted">{sub.blurb}</p>

      {embedSrc ? (
        <DeferredIframe
          src={embedSrc}
          title={sub.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <div className="glow-panel" style={{ display: "grid", placeItems: "center", padding: 40 }}>
          <span className="muted">No video yet</span>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 12 }}>
        <NavLink to={`/city/${id}/land/${landId}`} className="btn btn-quiet">
          Back to {land.name}
        </NavLink>
        <NavLink to={`/city/${id}`} className="btn btn-quiet">
          Back to lands
        </NavLink>
        {city.earthmetaUrl ? (
          <a
            href={buildPartnerLink(city.earthmetaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title="Open this city on EarthMeta.ai"
          >
            🌍 City on EarthMeta.ai
          </a>
        ) : null}
      </div>
    </main>
  );
}

/* ====================== Affiliate banner (image-dominant + CTA) ====================== */
function AffiliateBanner({
  href,
  imgSrc = "/images/branding/waveportal-holder.svg",
  ctaLabel = "Launch",
  alt = "WavePortal banner",
}) {
  const bannerInner = (
    <>
      <img
        src={imgSrc}
        alt={alt}
        className="banner-img"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="btn btn-primary cta">{ctaLabel}</span>
    </>
  );

  const commonStyle = { maxWidth: 980, margin: "16px auto 0" };

  // If no href, render a non-clickable placeholder so the banner always shows.
  if (!href) {
    return (
      <div
        className="glow-panel glow-banner"
        style={commonStyle}
        role="img"
        aria-label={alt}
        title={alt}
      >
        {bannerInner}
      </div>
    );
  }

  // Clickable affiliate version
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="glow-panel glow-banner"
      style={commonStyle}
      aria-label={ctaLabel}
      title={ctaLabel}
    >
      {bannerInner}
    </a>
  );
}

/* ===================================== 404 ===================================== */
function NotFound() {
  usePageMeta("Not found • WavePortals", "The page you requested does not exist.");
  useShareMeta({
    title: "Not found • WavePortals",
    description: "The page you requested does not exist.",
    url: `${CANONICAL_ORIGIN}/404`,
    image: `${CANONICAL_ORIGIN}/images/branding/wave_portal_2.jpg`,
  });
  return (
    <main>
      <p className="glow-error">
        That page doesn’t exist.{" "}
        <NavLink
          to="/"
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          Go home
        </NavLink>
        .
      </p>
    </main>
  );
}
