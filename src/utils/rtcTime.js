// src/utils/rtcTime.js

/** Thu 9:00–10:45 AM America/Chicago (heuristic) */
export function isInCTLiveWindow() {
  const now = new Date();
  const chicago = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const d = chicago.getDay();    // Thu = 4
  const h = chicago.getHours();
  const m = chicago.getMinutes();
  if (d !== 4) return false;
  const afterStart = h > 9 || (h === 9 && m >= 0);   // >= 09:00
  const beforeEnd  = h < 10 || (h === 10 && m <= 45); // <= 10:45
  return afterStart && beforeEnd;
}

/** Next Thursday at 09:00 CT */
export function nextThursdayAt0900CT() {
  const now = new Date();
  const chicagoNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const d = new Date(chicagoNow);
  const day = d.getDay(); // 0..6 (Thu=4)
  const isThu = day === 4;
  const after1100 = d.getHours() > 11 || (d.getHours() === 11 && d.getMinutes() > 0);

  let addDays;
  if (isThu && !after1100) addDays = 0;
  else {
    const delta = (4 - day + 7) % 7;
    addDays = delta === 0 ? 7 : delta;
  }
  d.setDate(d.getDate() + addDays);
  d.setHours(9, 0, 0, 0);

  return new Date(new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" })));
}
