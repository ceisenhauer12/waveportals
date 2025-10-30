import { useEffect, useState } from "react";
import { isInCTLiveWindow } from "../utils/rtcTime.js";

export default function useIsInCTLiveWindow() {
  const [inWindow, setInWindow] = useState(isInCTLiveWindow());
  useEffect(() => {
    const id = setInterval(() => setInWindow(isInCTLiveWindow()), 15_000);
    return () => clearInterval(id);
  }, []);
  return inWindow;
}
