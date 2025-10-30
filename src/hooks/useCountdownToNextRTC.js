import { useEffect, useMemo, useState } from "react";
import { nextThursdayAt0900CT } from "../utils/rtcTime.js";

export default function useCountdownToNextRTC() {
  const [now, setNow] = useState(Date.now());
  const target = useMemo(() => nextThursdayAt0900CT(), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const s = Math.floor(diff / 1000);
  return {
    diff,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
