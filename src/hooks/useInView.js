// src/hooks/useInView.js
import { useEffect, useRef, useState } from "react";

export default function useInView(rootMargin = "250px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
