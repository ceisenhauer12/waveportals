import useIsInCTLiveWindow from "../../hooks/useIsInCTLiveWindow.js";

export default function LiveBadge() {
  const inWindow = useIsInCTLiveWindow();
  if (!inWindow) return null;
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#2a0006",
        border: "1px solid #ff3355",
        color: "#ff5577",
        fontWeight: 700,
        fontSize: "0.8rem",
        textShadow: "0 0 5px #ff2244",
      }}
      title="Expected live window (heuristic)"
    >
      LIVE
    </span>
  );
}
