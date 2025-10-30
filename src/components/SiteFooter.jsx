// src/components/SiteFooter.jsx
import IvyEasterEgg from "./IvyEasterEgg.jsx";

export default function SiteFooter() {
  return (
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
  );
}
