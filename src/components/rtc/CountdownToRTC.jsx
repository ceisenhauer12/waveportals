import useCountdownToNextRTC from "../../hooks/useCountdownToNextRTC.js";

export default function CountdownToRTC() {
  const { days, hours, minutes, seconds, diff } = useCountdownToNextRTC();
  if (diff === 0) return null;
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        Next RTC Graduation Live stream (Thu 9:00 AM CT) in:
      </div>
      <div className="glow-text" style={{ fontWeight: 700 }}>
        {days}d {hours}h {minutes}m {seconds}s
      </div>
    </div>
  );
}
