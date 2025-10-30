// src/pages/NotFound.jsx
import { NavLink } from "react-router-dom";
import { usePageMeta, useShareMeta, CANONICAL_ORIGIN } from "../hooks/meta.js";

export default function NotFound() {
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
