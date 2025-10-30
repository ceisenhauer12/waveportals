// src/pages/CityDetail.jsx
import { NavLink, useParams, Navigate } from "react-router-dom";
import CITY_DB from "../data/cities.js";
import { CityBannerImage } from "../components/CityImages.jsx";
import { buildPartnerLink } from "../utils/partners.js";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";

export default function CityDetail() {
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
        <NavLink to="/" className="glow-text glow-hover" style={{ textDecoration: "none" }}>
          ← Back
        </NavLink>
      </p>

      <div
        className="hero"
        style={{ marginTop: 0, borderRadius: 12, overflow: "hidden", border: "1px solid #044966" }}
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
        <NavLink to="/" className="btn btn-quiet">← All cities</NavLink>
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
                <NavLink to={`/city/${id}/land/${land.id}`} className="btn btn-primary">
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
