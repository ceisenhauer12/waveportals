// src/components/SiteHeader.jsx
import { NavLink } from "react-router-dom";

export default function SiteHeader() {
  return (
    <header
      className="site-header"
      style={{
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
      }}
    >
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
  );
}
