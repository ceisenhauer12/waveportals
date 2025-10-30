// src/components/DeferredIframe.jsx
import useInView from "../hooks/useInView.js";

export default function DeferredIframe(props) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="video-wrap"
      style={{ marginTop: 12, aspectRatio: "16 / 9" }}
    >
      {inView ? (
        <iframe
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          {...props}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#000" }} />
      )}
    </div>
  );
}
