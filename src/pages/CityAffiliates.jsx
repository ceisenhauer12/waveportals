// src/pages/CityAffiliates.jsx
import { NavLink, useParams, Navigate } from "react-router-dom";
import CITY_DB from "../data/cities.js";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";
import { buildPartnerLink } from "../utils/partners.js";
import AffiliateBanner from "../components/AffiliateBanner.jsx";

export default function CityAffiliates() {
  const { id } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  // Meta
  usePageMeta(`${city.title} • Affiliates & Resources • WavePortals`, city.blurb);
  useShareMeta({
    title: `${city.title} • Affiliates & Resources • WavePortals`,
    description: `Curated partners, lodging, gear, and services for ${city.title}.`,
    url: `${CANONICAL_ORIGIN}/city/${id}/affiliates`,
    image: `${CANONICAL_ORIGIN}${city.heroImg || `/images/cities/${id}.jpg`}`,
  });

  // Optional data on each city record
  const mapUrl = city.affiliatesMapUrl || "";
  const featured = city.featuredPartner; // { label, href, imgSrc?, ctaLabel? }
  const groups = Array.isArray(city.affiliates) ? city.affiliates : [];

  return (
    <main>
      <p>
        <NavLink to={`/city/${id}`} className="glow-text glow-hover" style={{ textDecoration: "none" }}>
          ← Back to {city.title}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>
        Affiliates & Resources
      </h1>
      <p className="muted">
        Curated partners, lodging, gear, and services to make your visit smoother. We keep this page
        tidy—useful links only, no banner salad. To request your banner: contact@waveportals.com
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
                      {g.category?.toLowerCase?.().includes("hotel") ? "Book Now" : "Open"}
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
