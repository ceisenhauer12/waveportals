// src/pages/LandDetail.jsx
import React, { useState } from "react";
import { NavLink, useParams, Navigate } from "react-router-dom";
import CITY_DB from "../data/cities.js";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";
import { buildPartnerLink } from "../utils/partners.js";
import toMarkdownHtml from "../utils/markdown.js"; // default export per your setup
import { toEmbedUrl } from "../utils/embed.js";
import DeferredIframe from "../components/DeferredIframe.jsx";
import LiveBadge from "../components/rtc/LiveBadge.jsx";
import RTCScheduleNote from "../components/rtc/RTCScheduleNote.jsx";
import CountdownToRTC from "../components/rtc/CountdownToRTC.jsx";
import useIsInCTLiveWindow from "../hooks/useIsInCTLiveWindow.js";

/** Live-or-replay player (same behavior as before, just local to this page) */
function LiveOrFallbackPlayer({ channelId, fallbackUrl, title }) {
  const [useFallback, setUseFallback] = React.useState(false);
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

export default function LandDetail() {
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

      {/* Special map embed — Welcome Center ONLY */}
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

      {/* Recruit Family Guide (markdown → HTML) */}
      {land.info ? (
        <section className="glow-panel" style={{ marginTop: 24, padding: 16 }}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: toMarkdownHtml(land.info) }}
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

        {/* Link to Welcome Center if on Drill Hall page */}
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

      {/* Sub-lands list (if present) */}
      {Array.isArray(land.sublands) && land.sublands.length > 0 && (
        <section className="glow-panel" style={{ marginTop: 24, padding: 16 }}>
          <h3 className="glow-text" style={{ marginTop: 0 }}>
            Attractions in {land.name}
          </h3>
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
