// src/components/IvyEasterEgg.jsx
import { useState } from "react";
import IvyEggModal from "./IvyEggModal.jsx";

export default function IvyEasterEgg({ children, hint = "you let me be" }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Open easter egg"
        title={hint}
        style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      >
        {children}

        {hover && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translate(-50%, -8px)",
              background: "rgba(5, 30, 40, 0.95)",
              border: "1px solid #044966",
              color: "#9eeaff",
              padding: "6px 8px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,.5)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {hint}
          </span>
        )}
      </span>

      <IvyEggModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

