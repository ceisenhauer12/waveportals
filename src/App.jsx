// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { Routes, Route, NavLink, useParams, Navigate } from "react-router-dom";

import "./App.css";

/* ===================== Time helpers & LIVE badge window (CT) ===================== */

function isInCTLiveWindow() {
  const now = new Date();
  const chicago = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const d = chicago.getDay(); // Thu = 4
  const h = chicago.getHours();
  const m = chicago.getMinutes();

  // Window: Thursday 09:30 -> 12:30 CT
  if (d !== 4) return false;
  const afterStart = (h > 9) || (h === 9 && m >= 30);
  const beforeEnd  = (h < 12) || (h === 12 && m <= 30);
  return afterStart && beforeEnd;
}

function LiveBadge() {
  if (!isInCTLiveWindow()) return null;
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

/* ===================== Countdown to next Thursday 9:30 CT ===================== */

function nextThursdayAt0930CT() {
  const now = new Date();
  const chicagoNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const d = new Date(chicagoNow);
  const day = d.getDay(); // 0..6 (Thu=4)

  // If it's already Thursday past 12:30, point to next week
  const isThu = day === 4;
  const after1230 =
    d.getHours() > 12 || (d.getHours() === 12 && d.getMinutes() > 30);

  let addDays;
  if (isThu && !after1230) {
    addDays = 0;
  } else {
    const delta = (4 - day + 7) % 7;
    addDays = delta === 0 ? 7 : delta;
  }

  d.setDate(d.getDate() + addDays);
  d.setHours(9, 30, 0, 0);

  return new Date(
    new Date(
      d.toLocaleString("en-US", { timeZone: "America/Chicago" })
    )
  );
}

function useCountdownToNextRTC() {
  const [now, setNow] = useState(Date.now());
  const target = useMemo(() => nextThursdayAt0930CT(), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds, diff };
}

function CountdownToRTC() {
  const { days, hours, minutes, seconds, diff } = useCountdownToNextRTC();
  if (diff === 0) return null; // we're in/after the window—no countdown
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        Next RTC Graduation stream (Thu 9:30 AM CT) in:
      </div>
      <div className="glow-text" style={{ fontWeight: 700 }}>
        {days}d {hours}h {minutes}m {seconds}s
      </div>
    </div>
  );
}

/* ===================== Notes & players ===================== */

function RTCScheduleNote() {
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted">
        RTC Graduation livestream: <strong>Thursdays, 9:30 AM CT</strong>.
      </div>
      <div className="muted" style={{ marginTop: 4 }}>
        If the player shows “unavailable,” it’s before showtime or there’s no ceremony this week.
      </div>
    </div>
  );
}

/** Live-or-replay player:
 * - Outside Thu 9:30–12:30 CT → show replay immediately (if provided)
 * - Inside window → try live; if YT refuses, user can switch to replay
 */
function LiveOrFallbackPlayer({ channelId, fallbackUrl, title }) {
  const [useFallback, setUseFallback] = useState(false);
  const inWindow = isInCTLiveWindow();
  const hasUC = !!channelId && channelId.startsWith("UC");
  const embedFallback = toEmbedUrl(fallbackUrl);

  // Outside the window, just show the replay (if configured)
  if (!inWindow && embedFallback) {
    return (
      <div className="video-wrap" style={{ marginTop: 12 }}>
        <iframe
          src={embedFallback}
          title={title ? `${title} (Replay)` : "Replay"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // During the window: attempt live; allow manual fallback
  return (
    <>
      <div className="video-wrap" style={{ marginTop: 12 }}>
        {!useFallback && hasUC && (
          <iframe
            src={`https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&autoplay=1&mute=1`}
            title={title || "Live Stream"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%" }}
            onError={() => setUseFallback(true)}
          />
        )}

        {(useFallback || !hasUC) && embedFallback ? (
          <iframe
            src={embedFallback}
            title={title ? `${title} (Replay)` : "Replay"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        ) : (useFallback || !hasUC) && !embedFallback ? (
          <div className="glow-panel" style={{ display: "grid", placeItems: "center", padding: 40 }}>
            <span className="muted">RTC livestream placeholder — no fallback video configured.</span>
          </div>
        ) : null}
      </div>

      {/* Helper actions under the player */}
      <div className="btn-row">
        {channelId && (
          <a
            href={`https://www.youtube.com/${channelId.startsWith("@") ? channelId : `channel/${channelId}`}/streams`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quiet"
          >
            Watch on YouTube
          </a>
        )}
        {embedFallback && inWindow && hasUC && !useFallback && (
          <button className="btn btn-quiet" onClick={() => setUseFallback(true)}>
            Play replay instead
          </button>
        )}
      </div>
    </>
  );
}

/* ===================== City image components (local → Picsum fallback) ===================== */

function CityTileImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null; // prevent loops
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(id)}/1600/900`;
      }}
      style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
    />
  );
}

function CityBannerImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(id)}/1600/900`;
      }}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

/* ============================== App Shell ============================== */

export default function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid #022",
          padding: "28px 48px",
          display: "flex",
          gap: 24,
          alignItems: "center",
          background: "#000",
        }}
      >
        <NavLink
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}
        >
          <img
  src="/waveportalslogo.png"
  alt="WavePortals logo"
  className="logo-img"
  style={{ height: 100, width: "auto" }}
/>
          <span className="glow-text" style={{ fontWeight: 800, fontSize: "2rem" }}>
            WavePortals.com
          </span>
        </NavLink>
        <div style={{ marginLeft: "auto", fontSize: "1.2rem" }} className="glow-text">
          Metaverse gateways by IceManWave
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:id" element={<CityDetail />} />
        <Route path="/city/:id/land/:landId" element={<LandDetail />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <footer style={{ padding: "20px 32px", marginTop: 32, textAlign: "center" }} className="glow-footer">
        © {new Date().getFullYear()} WavePortals — built by Ivy
      </footer>
    </div>
  );
}

/* ============================== CITY & LAND DATA ============================== */
/* Add heroImg if you want to override; otherwise it tries /public/images/cities/<id>.jpg → Picsum */
const CITY_DB = {
  // 🇺🇸 Illinois
  "north-chicago": {
    title: "North Chicago – US Navy RTC",
    blurb:
      "Great Lakes Naval Station gateway. Hospitality, graduation events, and family lodging funnels.",
    // heroImg: "/images/cities/north-chicago.jpg",
    tags: ["Navy", "Hospitality", "Family Traffic"],
    lands: [
      {
        id: "rtc-ceremonial-drill-hall",
        name: "RTC Ceremonial Drill Hall",
        blurb: "Graduation ceremonies hub; anchor for weekend surges and family itineraries.",
        channelId: "UCZuVv_Qnvp-2hIqwBIoq5Aw", // RTC Public Affairs UC channel ID
        videoUrl: "", // optional single past event
        fallbackVideoUrl: "https://www.youtube.com/watch?v=7l7a1uigRg4", // replay filler
        affiliateUrl: "https://www.navygear.com/?utm_source=waveportals&utm_medium=affiliate&utm_campaign=rtc",

      },
    ],
  },

  // 🇦🇹 Austria
  "baden-at": {
    title: "Baden bei Wien, Austria – Spa & UNESCO",
    blurb:
      "Prestigious spa town with Roman spa heritage, UNESCO recognition, Casino Baden, and Beethoven history.",
    // heroImg: "/images/cities/baden-at.jpg",
    tags: ["UNESCO", "Casino", "Beethoven"],
    lands: [
      {
        id: "casino-baden",
        name: "Casino Baden",
        blurb: "High-traffic entertainment anchor with regional draw.",
        videoUrl: "",
        affiliateUrl: "",
      },
      {
        id: "beethovenhaus",
        name: "Beethovenhaus",
        blurb: "Historic residence & museum celebrating Beethoven’s summers in Baden.",
        videoUrl: "https://www.youtube.com/watch?v=hdWyYn0E4Ys&t=760s",
        affiliateUrl: "",
      },
    ],
  },

  // 🇸🇪 Sweden
  "varmdo-se": {
    title: "Värmdö (Viggsö Island), Sweden – ABBA cottage",
    blurb: "The ABBA cottage landmark in the Stockholm archipelago.",
    // heroImg: "/images/cities/varmdo-se.jpg",
    tags: ["ABBA", "Archipelago", "Pilgrimage"],
    lands: [
      {
        id: "viggso-abba-cottage",
        name: "Viggsö ABBA Cottage",
        blurb: "Iconic songwriting hideaway; essential ABBA stop.",
        videoUrl: "https://www.youtube.com/watch?v=FHDRRiX1now",
        affiliateUrl: "",
      },
    ],
  },

  // 🇺🇸 South Dakota
  "deadwood-sd": {
    title: "Deadwood, SD – Legendary Old West town",
    blurb: "Historic saloons and casinos in a Black Hills Old West setting.",
    // heroImg: "/images/cities/deadwood-sd.jpg",
    tags: ["Old West", "Casinos", "Tourism"],
    lands: [
      {
        id: "saloon-no-10",
        name: "Saloon No. 10 / Main Street",
        blurb: "Wild Bill lore + high foot traffic on Main.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇺🇸 Oklahoma
  "durant-ok": {
    title: "Durant, OK – Home of the Choctaw Indian Nation",
    blurb: "Cultural Center, Casino & Resort.",
    // heroImg: "/images/cities/durant-ok.jpg",
    tags: ["Choctaw", "Casino", "Resort"],
    lands: [
      {
        id: "choctaw-casino-resort",
        name: "Choctaw Casino & Resort",
        blurb: "Flagship entertainment and hospitality anchor.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇺🇸 Texas
  "galveston-tx": {
    title: "Galveston, TX – Gulf Coast tourism hub",
    blurb: "Beaches, cruises, and The Strand historic district.",
    // heroImg: "/images/cities/galveston-tx.jpg",
    tags: ["Beaches", "Cruises", "Tourism"],
    lands: [
      {
        id: "the-strand",
        name: "The Strand Historic District",
        blurb: "Shops, museums, and cruise passenger flow.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇩🇰 Denmark
  "roskilde-dk": {
    title: "Roskilde, Denmark – Festival city",
    blurb: "World-renowned for the Roskilde Festival; historic cathedral town.",
    // heroImg: "/images/cities/roskilde-dk.jpg",
    tags: ["Festival", "Music", "Culture"],
    lands: [
      {
        id: "roskilde-festival-grounds",
        name: "Roskilde Festival Grounds",
        blurb: "One of Europe’s largest music festivals.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇷🇴 Romania
  "cluj-napoca-ro": {
    title: "Cluj-Napoca, Romania – University & culture",
    blurb: "Major university center; home of the UNTOLD Festival.",
    // heroImg: "/images/cities/cluj-napoca-ro.jpg",
    tags: ["University", "Festival", "Tech"],
    lands: [
      {
        id: "cluj-arena-untold",
        name: "Cluj Arena / UNTOLD",
        blurb: "Festival epicenter with massive international draw.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇫🇷 France
  "colmar-fr": {
    title: "Colmar, France – Alsace jewel",
    blurb: "Picturesque old town; inspiration for Beauty and the Beast.",
    // heroImg: "/images/cities/colmar-fr.jpg",
    tags: ["Alsace", "Old Town", "Tourism"],
    lands: [
      {
        id: "little-venice",
        name: "Little Venice",
        blurb: "Iconic canals and timbered houses.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇺🇸 Maryland
  "college-park-md": {
    title: "College Park, MD – University of Maryland",
    blurb: "Academia, research, and proximity to Washington, D.C.",
    // heroImg: "/images/cities/college-park-md.jpg",
    tags: ["University", "Research", "DC Area"],
    lands: [
      {
        id: "xfinity-center",
        name: "Xfinity Center",
        blurb: "Maryland Terrapins arena and events hub.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇰🇷 South Korea
  "jeonju-kr": {
    title: "Jeonju, South Korea – UNESCO & food",
    blurb: "UNESCO-listed historic center; birthplace of bibimbap.",
    // heroImg: "/images/cities/jeonju-kr.jpg",
    tags: ["UNESCO", "Food", "Hanok"],
    lands: [
      {
        id: "jeonju-hanok-village",
        name: "Jeonju Hanok Village",
        blurb: "Traditional architecture and culinary magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇨🇿 Czech Republic
  "ostrava-cz": {
    title: "Ostrava, Czech Republic – Industry to culture",
    blurb: "Industrial city turned culture/tech hub.",
    // heroImg: "/images/cities/ostrava-cz.jpg",
    tags: ["Tech", "Industry", "Culture"],
    lands: [
      {
        id: "dolni-vitkovice",
        name: "Dolní Vítkovice",
        blurb: "Legendary industrial complex reborn as culture zone.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇩🇪 Germany
  "reutlingen-de": {
    title: "Reutlingen, Germany – Near Stuttgart",
    blurb: "Historic German city; high livability and strong economy.",
    // heroImg: "/images/cities/reutlingen-de.jpg",
    tags: ["Historic", "Economy", "Baden-Württemberg"],
    lands: [
      {
        id: "marienkirche",
        name: "Marienkirche",
        blurb: "Gothic church and city symbol.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇺🇸 Texas
  "round-rock-tx": {
    title: "Round Rock, TX – Dell & sports",
    blurb: "Dell HQ, Dell Diamond, and Kalahari Falls.",
    // heroImg: "/images/cities/round-rock-tx.jpg",
    tags: ["Tech", "Baseball", "Resort"],
    lands: [
      {
        id: "dell-diamond",
        name: "Dell Diamond",
        blurb: "Home of the Round Rock Express; family sports magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "cedar-park-tx": {
    title: "Cedar Park, TX – Austin metro growth",
    blurb: "Strong in sports and concerts (H-E-B Center).",
    // heroImg: "/images/cities/cedar-park-tx.jpg",
    tags: ["Sports", "Concerts", "Growth"],
    lands: [
      {
        id: "heb-center",
        name: "H-E-B Center",
        blurb: "Arena for AHL hockey, concerts, and events.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "grapevine-tx": {
    title: "Grapevine, TX – DFW gateway",
    blurb: "Direct tie to DFW Airport; huge utility for travel and tourism.",
    // heroImg: "/images/cities/grapevine-tx.jpg",
    tags: ["DFW", "Tourism", "Transit"],
    lands: [
      {
        id: "gaylord-texan",
        name: "Gaylord Texan",
        blurb: "Convention/resort juggernaut + seasonal events.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇸🇪 Sweden
  "norrkoping-se": {
    title: "Norrköping, Sweden – Reinvented industrial hub",
    blurb: "Historic industrial core turned into a tech & creative cluster.",
    // heroImg: "/images/cities/norrkoping-se.jpg",
    tags: ["Tech", "Creative", "Industrial"],
    lands: [
      {
        id: "visualization-center-c",
        name: "Visualization Center C",
        blurb: "Science visualization and education magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  // 🇵🇷 Puerto Rico
  "carolina-pr": {
    title: "Carolina, Puerto Rico – SJU gateway",
    blurb: "Right next to San Juan’s airport; casino resorts & high tourism.",
    // heroImg: "/images/cities/carolina-pr.jpg",
    tags: ["SJU", "Resorts", "Tourism"],
    lands: [
      {
        id: "isla-verde-beach",
        name: "Isla Verde Beachfront",
        blurb: "Resort-lined beach; premium foot traffic.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },
};

/* =============================== HOME (tiles) =============================== */

function Home() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");

  const cities = useMemo(() => {
    const arr = Object.entries(CITY_DB).map(([id, v]) => ({ id, ...v }));
    const q = query.trim().toLowerCase();
    let filtered = q
      ? arr.filter((c) => {
          const hay = (c.title + " " + c.blurb + " " + (c.tags || []).join(" ")).toLowerCase();
          return hay.includes(q);
        })
      : arr;

    if (sort === "az") {
      filtered = filtered.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [query, sort]);

  return (
    <main>
      <h2 className="glow-text" style={{ marginTop: 0 }}>Cities & Land</h2>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="input"
          placeholder="Search cities, blurbs, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="az">Sort A → Z</option>
        </select>
      </div>

      {/* Tiles */}
      <div className="card-list" style={{ marginTop: 12 }}>
        {cities.map((c) => (
          <div key={c.id} className="card">
            {/* hero image (local first, then Picsum) */}
            <div
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #044966",
                marginBottom: 10,
              }}
            >
              <CityTileImage id={c.id} title={c.title} heroImg={c.heroImg} />
            </div>
            <h3>{c.title}</h3>
            <div className="muted clamp-2">{c.blurb}</div>
            {c.tags?.length ? (
              <div className="chips" style={{ marginTop: 8 }}>
                {c.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            ) : null}
            <div className="btn-row">
              <NavLink to={`/city/${c.id}`} className="btn btn-primary">View</NavLink>
            </div>
          </div>
        ))}
        {!cities.length && <div className="muted">No matches.</div>}
      </div>
    </main>
  );
}

/* ========================= CITY DETAIL (lists lands) ========================= */

function CityDetail() {
  const { id } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  return (
    <main>
      <p>
        <NavLink to="/" className="glow-text glow-hover" style={{ textDecoration: "none" }}>
          ← Back
        </NavLink>
      </p>

      {/* City hero banner (local first, then Picsum) */}
      <div
        className="hero"
        style={{
          marginTop: 0,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #044966",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <CityBannerImage id={id} title={city.title} heroImg={city.heroImg} />
          <div
            className="hero-title"
            style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              right: 12,
              fontSize: "1.4rem",
            }}
          >
            {city.title}
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>{city.blurb}</p>

      <div className="card-list" style={{ marginTop: 12 }}>
        {city.lands?.length ? city.lands.map((land) => (
          <div key={land.id} className="card">
            <h3>{land.name}</h3>
            <div className="muted clamp-2">{land.blurb}</div>
            <div className="btn-row">
              <NavLink to={`/city/${id}/land/${land.id}`} className="btn btn-primary">
                View
              </NavLink>
            </div>
          </div>
        )) : (
          <div className="muted">No lands added yet.</div>
        )}
      </div>
    </main>
  );
}

/* ================= LAND DETAIL (RTC live-or-replay; embeds for others) ================= */

function LandDetail() {
  const { id, landId } = useParams();
  const city = CITY_DB[id];
  if (!city) return <Navigate to="/404" replace />;

  const land = city.lands?.find((l) => l.id === landId);
  if (!land) return <Navigate to="/404" replace />;

  const embedSrc = toEmbedUrl(land.videoUrl);
  const isRTC = land.channelId === "UCZuVv_Qnvp-2hIqwBIoq5Aw";

  return (
    <main>
      <p style={{ marginBottom: 12 }}>
        <NavLink to={`/city/${id}`} className="glow-text glow-hover" style={{ textDecoration: "none" }}>
          ← Back to {city.title}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>
        {land.name} {isRTC && <LiveBadge />}
      </h1>
      <p className="muted">{land.blurb}</p>

      {/* RTC uses live-or-replay with schedule + countdown; others just embed video if present */}
      {isRTC ? (
        <>
          <LiveOrFallbackPlayer
            channelId={land.channelId}
            fallbackUrl={land.fallbackVideoUrl}
            title={land.name}
          />
          <RTCScheduleNote />
          <CountdownToRTC />
        </>
      ) : embedSrc ? (
        <div className="video-wrap" style={{ marginTop: 12 }}>
          <iframe
            src={embedSrc}
            title={land.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        </div>
      ) : (
        <div className="glow-panel" style={{ display: "grid", placeItems: "center", padding: 40 }}>
          <span className="muted">No video yet</span>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 12 }}>
        {isRTC && (
          <a
            href="https://www.youtube.com/channel/UCZuVv_Qnvp-2hIqwBIoq5Aw/streams"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quiet"
          >
            Watch on YouTube
          </a>
        )}
        <NavLink to={`/city/${id}`} className="btn btn-quiet">Back to lands</NavLink>
      </div>

      <div className="affiliate" style={{ marginTop: 24, textAlign: "center" }}>
  {land.affiliateUrl ? (
    <a
      href={land.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        padding: 12,
        border: "1px solid #044966",
        borderRadius: 8,
        background: "#000",
      }}
    >
      <img
        src="/images/affiliate/navygear.png"
        alt="NavyGear Affiliate"
        style={{ maxHeight: 60, width: "auto" }}
      />
    </a>
  ) : (
    <span className="muted">Affiliate spot (add your link in CITY_DB)</span>
  )}
</div>

    </main>
  );
}

/* ============================== Utility: watch → embed ============================== */
function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    }
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url; // already embed form
    }
    return "";
  } catch {
    return "";
  }
}
/* ====================== Affiliate banner ====================== */
function AffiliateBanner({ href, label = "Shop NavyGear.com", note = "Officially licensed gear" }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="glow-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: "1px solid #044966",
        textDecoration: "none",
        marginTop: 16,
      }}
      title="Affiliate link"
    >
      <img
        src="/images/affiliates/navygear-logo.png"
        alt="NavyGear"
        style={{ height: 28, width: "auto", filter: "drop-shadow(0 0 6px rgba(0,255,255,.25))" }}
        onError={(e) => {
          // icon fallback if you haven’t added a logo yet
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ display: "grid" }}>
        <strong style={{ color: "#0ff" }}>{label}</strong>
        <span className="muted" style={{ fontSize: ".9rem" }}>{note}</span>
      </div>
      <span style={{ marginLeft: "auto" }} className="btn btn-primary">Shop</span>
    </a>
  );
}

/* ===================================== 404 ===================================== */

function NotFound() {
  return (
    <main>
      <p className="glow-error">
        That page doesn’t exist.{" "}
        <NavLink to="/" className="glow-text glow-hover" style={{ textDecoration: "none" }}>
          Go home
        </NavLink>
        .
      </p>
    </main>
  );
}
