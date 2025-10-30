// src/pages/SubLandDetail.jsx
import { NavLink, useParams, Navigate } from "react-router-dom";
import CITY_DB from "../data/cities.js";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";
import { buildPartnerLink } from "../utils/partners.js";
import { toEmbedUrl } from "../utils/embed.js";
import DeferredIframe from "../components/DeferredIframe.jsx";

export default function SubLandDetail() {
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
