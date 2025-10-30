// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import CITY_DB from "../data/cities.js";
import { buildPartnerLink } from "../utils/partners.js";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";
import LazyMount from "../components/LazyMount.jsx";
import { CityTileImage } from "../components/CityImages.jsx";
import { MapBanner } from "../components/MapBanner.jsx";

export default function Home() {
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

      {/* World map banner (lazy-mounted) */}
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
