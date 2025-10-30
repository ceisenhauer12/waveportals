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


import CITY_DB from "./data/cities.js";
import { toEmbedUrl } from "./utils/embed.js";
import ScrollToTop from "./components/ScrollToTop.jsx";
import GAViewTracker from "./components/GAViewTracker.jsx";
import { createPortal } from "react-dom";
import { loadYouTubeAPI } from "./utils/youtube";
import { MapBanner } from "./components/MapBanner.jsx";
import AffiliateBanner from "./components/AffiliateBanner.jsx";
import IvyEasterEgg from "./components/IvyEasterEgg.jsx";
import CanonicalTag from "./components/CanonicalTag.jsx";
import { CANONICAL_ORIGIN, usePageMeta, useShareMeta } from "./hooks/meta.js";
import mdToHtml from "./utils/markdown.js";
import { buildPartnerLink } from "./utils/partners.js";
import DeferredIframe from "./components/DeferredIframe.jsx";
import { CityTileImage, CityBannerImage } from "./components/CityImages.jsx";
import MapPin from "./components/MapPin.jsx";
import useIsInCTLiveWindow from "./hooks/useIsInCTLiveWindow.js";
import LiveBadge from "./components/rtc/LiveBadge.jsx";
import RTCScheduleNote from "./components/rtc/RTCScheduleNote.jsx";
import CountdownToRTC from "./components/rtc/CountdownToRTC.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import CityDetail from "./pages/CityDetail.jsx";
import CityAffiliates from "./pages/CityAffiliates.jsx";
import LandDetail from "./pages/LandDetail.jsx";




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


