// src/pages/Affiliates.jsx
import { NavLink } from "react-router-dom";
import { usePageMeta, useShareMeta } from "../config/meta.js";

const CATS = [
  {
    id: "hotels",
    title: "Hotels",
    blurb: "Stay near the action.",
    items: [
      { name: "Sample Hotel One", href: "#", note: "Placeholder" },
      { name: "Sample Hotel Two", href: "#", note: "Placeholder" },
    ],
  },
  {
    id: "rental-cars",
    title: "Rental Cars",
    blurb: "Get around in style.",
    items: [
      { name: "AutoCo Rental", href: "#", note: "Placeholder" },
      { name: "CityDrive", href: "#", note: "Placeholder" },
    ],
  },
  {
    id: "tickets",
    title: "Ticket Vendors",
    blurb: "Events, attractions, and more.",
    items: [
      { name: "TixMaster", href: "#", note: "Placeholder" },
      { name: "SeatRocket", href: "#", note: "Placeholder" },
    ],
  },
  {
    id: "merch",
    title: "Merchandise",
    blurb: "Repping WavePortals in the wild.",
    items: [
      { name: "Wave Store", href: "#", note: "Placeholder" },
      { name: "Meta Threadz", href: "#", note: "Placeholder" },
    ],
  },
];

export default function Affiliates() {
  usePageMeta("Affiliates • WavePortals", "Directory of affiliate categories for WavePortals.");
  useShareMeta({
    title: "Affiliates • WavePortals",
    description: "Hotels, rental cars, tickets, merch — partners directory.",
  });

  return (
    <main style={{ maxWidth: 1080, margin: "24px auto", padding: "0 12px" }}>
      <header className="glow-panel" style={{ padding: 16, borderRadius: 12 }}>
        <h1 className="glow-text" style={{ margin: 0 }}>Directory</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Categories with links
        </p>
      </header>

      <section style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {CATS.map((cat) => (
          <article key={cat.id} className="glow-panel" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <h2 className="glow-text" style={{ margin: 0 }}>{cat.title}</h2>
              <a href={`#${cat.id}`} className="muted" style={{ textDecoration: "none" }}>#{cat.id}</a>
            </div>
            <p className="muted" style={{ marginTop: 6 }}>{cat.blurb}</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
              marginTop: 12
            }}>
              {cat.items.map((it, idx) => (
                <div key={idx} className="glow-panel" style={{ padding: 12, borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{it.name}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{it.note}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glow-text"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        textDecoration: "none",
                        border: "1px solid #044966",
                        padding: "6px 10px",
                        borderRadius: 8
                      }}
                    >
                      Launch
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        <NavLink
          to="/"
          className="glow-text"
          style={{
            textDecoration: "none",
            border: "1px solid #044966",
            padding: "10px 14px",
            borderRadius: 10
          }}
        >
          ← Back to Home
        </NavLink>
      </footer>
    </main>
  );
}
