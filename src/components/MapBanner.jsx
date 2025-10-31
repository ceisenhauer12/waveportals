// src/components/MapBanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RickEggModal from "./modals/RickEggModal.jsx";
import MapPin from "./ui/MapPin.jsx";
import CITY_DB from "../data/cities.js";

export function MapBanner() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [rickOpen, setRickOpen] = useState(false);
  const [rickHover, setRickHover] = useState(false);

  useEffect(() => {
    function onResize() {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const points = useMemo(() => {
    return Object.entries(CITY_DB)
      .filter(([, c]) => Array.isArray(c.coords) && c.coords.length === 2)
      .map(([id, c]) => ({ id, title: c.title, coords: c.coords }));
  }, []);

  function project([lat, lon]) {
    const x = ((lon + 180) / 360) * size.w;
    const y = ((90 - lat) / 180) * size.h;
    return [x, y];
  }

  const RICK_COORDS = [51.51373, -0.21926];
  const [rx, ry] = project(RICK_COORDS);

  return (
    <section
      className="glow-panel"
      style={{
        margin: "16px 0",
        border: "1px solid #044966",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #044966",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="glow-text" style={{ fontWeight: 700 }}>Explore on the map</span>
        <span className="muted" style={{ fontSize: ".9rem" }}>Scroll to zoom, drag to move</span>
      </div>

      <div
        ref={ref}
        style={{
          width: "100%",
          aspectRatio: "16 / 8",
          background: "radial-gradient(ellipse at top, #012029, #000 70%)",
          position: "relative",
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={6}
          wheel={{ step: 0.2 }}
          doubleClick={{ disabled: true }}
          pinch={{ step: 0.3 }}
        >
          {({ state }) => (
            <TransformComponent>
              <div
                style={{
                  position: "relative",
                  width: size.w,
                  height: size.h,
                  transformOrigin: "0 0",
                }}
              >
                <img
                  src="/images/maps/world-equirect.png"
                  alt="World map"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.9,
                    filter: "saturate(1.1) contrast(1.05)",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />

                {/* City pins */}
                {size.w > 0 && points.map((p) => {
                  const [x, y] = project(p.coords);
                  return (
                    <MapPin
                      key={p.id}
                      x={x}
                      y={y}
                      id={p.id}
                      title={p.title}
                      scale={state?.scale || 1}
                    />
                  );
                })}

                {/* Rick roll pin */}
                {size.w > 0 && (
                  <div
                    role="button"
                    aria-label="Click me"
                    title="Click me"
                    onMouseEnter={() => setRickHover(true)}
                    onMouseLeave={() => setRickHover(false)}
                    onClick={() => setRickOpen(true)}
                    style={{
                      position: "absolute",
                      left: rx,
                      top: ry,
                      transform: `translate(-50%, -50%) scale(${1 / (state?.scale || 1)})`,
                      transformOrigin: "50% 50%",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#33ccff",
                      boxShadow: "0 0 4px #33ccff, 0 0 8px rgba(0,255,255,0.5)",
                      border: "1px solid #033",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
                  >
                    {rickHover && (
                      <span
                        role="tooltip"
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "100%",
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
                        }}
                      >
                        Never Give up
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      <RickEggModal open={rickOpen} onClose={() => setRickOpen(false)} />
    </section>
  );
}
