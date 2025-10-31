// src/components/MapPin.jsx
import { memo } from "react";
import { NavLink } from "react-router-dom";

function MapPinBase({ x, y, id, title, scale = 1 }) {
  const base = 5;
  return (
    <NavLink
      to={`/city/${id}`}
      title={title}
      className="map-pin"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 / scale})`,
        transformOrigin: "50% 50%",
        width: base,
        height: base,
        borderRadius: "50%",
        background: "#33ccff",
        boxShadow: "0 0 4px #33ccff, 0 0 8px rgba(0,255,255,0.5)", // ← fixed: closing quote
        border: "1px solid #033",
        cursor: "pointer",
        zIndex: 2,
      }}
    />
  );
}

export default memo(MapPinBase);

