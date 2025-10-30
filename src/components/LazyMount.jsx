// src/components/LazyMount.jsx
import { useEffect, useRef, useState } from "react";

export default function LazyMount({ children, rootMargin = "600px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { rootMargin });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, rootMargin]);

  // Reserve space to avoid layout jump before mount
  return <div ref={ref}>{inView ? children : <div style={{ height: 360 }} />}</div>;
}
