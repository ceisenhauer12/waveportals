// src/App.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  NavLink,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

/* ===================== Canonical <link> ===================== */
const CANONICAL_ORIGIN = "https://www.waveportals.com";
function CanonicalTag() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    // normalize: remove trailing "/" except root
    const cleanPath =
      pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const href = CANONICAL_ORIGIN + cleanPath + search;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [pathname, search]);
  return null;
}

/* ===================== Page meta (title + description) ===================== */
function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const prevDesc = meta.content;
    meta.content = description || "";

    return () => {
      document.title = prevTitle;
      meta.content = prevDesc || "";
    };
  }, [title, description]);
}

/* ===================== Partner / referral link helper ===================== */
const MYE_REF = ""; // <-- drop your myearthmeta referral code here when you get it
const DEFAULT_UTM = {
  utm_source: "waveportals",
  utm_medium: "site",
  utm_campaign: "earthmeta_cta",
};
function buildPartnerLink(raw) {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (MYE_REF) u.searchParams.set("ref", MYE_REF);
    for (const [k, v] of Object.entries(DEFAULT_UTM)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return raw;
  }
}

/* ===================== Time helpers & LIVE badge window (CT) ===================== */
function isInCTLiveWindow() {
  const now = new Date();
  const chicago = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  const d = chicago.getDay(); // Thu = 4
  const h = chicago.getHours();
  const m = chicago.getMinutes();
  if (d !== 4) return false;
  const afterStart = h > 9 || (h === 9 && m >= 30);
  const beforeEnd = h < 12 || (h === 12 && m <= 30);
  return afterStart && beforeEnd;
}

function useIsInCTLiveWindow() {
  const [inWindow, setInWindow] = useState(isInCTLiveWindow());
  useEffect(() => {
    const id = setInterval(() => setInWindow(isInCTLiveWindow()), 15_000);
    return () => clearInterval(id);
  }, []);
  return inWindow;
}

function LiveBadge() {
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

/* ===================== Countdown to next Thursday 9:30 CT ===================== */
function nextThursdayAt0930CT() {
  const now = new Date();
  const chicagoNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  const d = new Date(chicagoNow);
  const day = d.getDay(); // 0..6 (Thu=4)
  const isThu = day === 4;
  const after1230 =
    d.getHours() > 12 || (d.getHours() === 12 && d.getMinutes() > 30);

  let addDays;
  if (isThu && !after1230) addDays = 0;
  else {
    const delta = (4 - day + 7) % 7;
    addDays = delta === 0 ? 7 : delta;
  }
  d.setDate(d.getDate() + addDays);
  d.setHours(9, 30, 0, 0);

  return new Date(
    new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" }))
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
  if (diff === 0) return null;
  return (
    <div className="affiliate" style={{ marginTop: 12 }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        Next RTC Graduation Live stream (Thu 9:30 AM CT) in:
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
        If the player shows “unavailable,” it’s before showtime or there’s no
        ceremony this week.
      </div>
    </div>
  );
}

/* ===== Simple in-view lazy mount for iframes (keeps page lighter) ===== */
function useInView(rootMargin = "250px") {
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

function DeferredIframe(props) {
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

/** Live-or-replay player */
function LiveOrFallbackPlayer({ channelId, fallbackUrl, title }) {
  const [useFallback, setUseFallback] = useState(false);
  const inWindow = useIsInCTLiveWindow();
  const hasUC = !!channelId && channelId.startsWith("UC");
  const embedFallback = toEmbedUrl(fallbackUrl);

  if (!inWindow && embedFallback) {
    return (
      <DeferredIframe
        src={embedFallback}
        title={title ? `${title} (Replay)` : "Replay"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <>
      <div className="video-wrap" style={{ marginTop: 12, aspectRatio: "16 / 9" }}>
        {!useFallback && hasUC && (
          <iframe
            src={`https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(
              channelId
            )}&autoplay=1&mute=1`}
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
          <div
            className="glow-panel"
            style={{ display: "grid", placeItems: "center", padding: 40 }}
          >
            <span className="muted">
              RTC livestream placeholder — no fallback video configured.
            </span>
          </div>
        ) : null}
      </div>

      <div className="btn-row">
        {channelId && (
          <a
            href={`https://www.youtube.com/${
              channelId.startsWith("@") ? channelId : `channel/${channelId}`
            }/streams`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quiet"
            aria-label="Watch on YouTube"
          >
            Watch on YouTube
          </a>
        )}
        {embedFallback && inWindow && hasUC && !useFallback && (
          <button
            className="btn btn-quiet"
            onClick={() => setUseFallback(true)}
            aria-label="Play replay instead"
          >
            Play replay instead
          </button>
        )}
      </div>

      {inWindow && hasUC && !useFallback && (
        <div className="muted" style={{ marginTop: 8 }}>
          Autoplay is muted by default. Unmute in the player to hear audio.
        </div>
      )}
    </>
  );
}

/* ===================== City image components (local → Picsum fallback) ===================== */
function CityTileImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title || "City image"}
      loading="lazy"
      decoding="async"
      fetchpriority="low"
      width={1600}
      height={900}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
          id
        )}/1600/900`;
      }}
      style={{
        width: "100%",
        height: "180px",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function CityBannerImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title || "City image"}
      loading="lazy"
      width={1600}
      height={900}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
          id
        )}/1600/900`;
      }}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

/* ============================== Scroll restore ============================== */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // "instant" is not standard, but browsers ignore unknown behavior; it's fine.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/* ============================== App Shell ============================== */
export default function App() {
  useEffect(() => {
    const lowCores =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const hiDPRSmall = window.devicePixelRatio > 2 && window.innerWidth < 900;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      ?.matches;
    if (lowCores || hiDPRSmall || reduced) document.body.classList.add("perf");
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <CanonicalTag />
      <ScrollToTop />

      <header
        style={{
          position: "relative",
          borderBottom: "1px solid #022",
          padding: "28px 48px",
          minHeight: "50px",
          backgroundImage: "url('/images/branding/wave_portal_2.jpg')",
          backgroundSize: "100% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <NavLink
          to="/"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
          aria-label="WavePortals home"
        >
          <img
            src="/waveportalslogo.png"
            alt="WavePortals logo"
            style={{
              height: 140,
              width: "auto",
              boxShadow: "0 6px 16px rgba(0,0,0,.6)",
            }}
          />
        </NavLink>

        <div
          className="glow-text"
          style={{
            position: "relative",
            zIndex: 1,
            marginLeft: "auto",
            fontSize: "1.4rem",
            fontStyle: "italic",
            fontWeight: 500,
            textShadow: "0 2px 8px rgba(0,0,0,.8)",
            paddingLeft: 12,
          }}
        >
          WavePortals: riding the wave of{" "}
          <a
            href="https://earthmeta.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 700, color: "#0ff", textDecoration: "none" }}
            aria-label="Open EarthMeta.ai"
          >
            EarthMeta.ai
          </a>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:id" element={<CityDetail />} />
        <Route path="/city/:id/land/:landId" element={<LandDetail />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <footer
        className="glow-footer"
        style={{ padding: "20px 32px", marginTop: 32, textAlign: "center" }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span>© {new Date().getFullYear()} WavePortals — built by</span>
          <img
            src="/images/branding/ivy-mark.png"
            alt="Ivy logo"
            className="ivy-logo"
            style={{
              height: 48,
              width: "auto",
              transition: "transform 0.3s ease, filter 0.3s ease",
              filter: "brightness(1.2) saturate(1.4)",
            }}
          />
        </div>
      </footer>
    </div>
  );
}

/* ============================== CITY & LAND DATA ============================== */
const CITY_DB = {
  "north-chicago": {
    title: "North Chicago – US Navy RTC",
    blurb:
      "Great Lakes Naval Station gateway. Hospitality, graduation events, and family lodging funnels.",
    tags: ["Navy", "Hospitality", "Family Traffic"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/1714183257322253755729502084421709477194",
    lands: [
      {
        id: "rtc-ceremonial-drill-hall",
        name: "RTC Ceremonial Drill Hall",
        blurb:
          "Graduation ceremonies hub; anchor for weekend surges and family itineraries.",
        channelId: "UCZuVv_Qnvp-2hIqwBIoq5Aw",
        videoUrl: "",
        fallbackVideoUrl: "https://www.youtube.com/watch?v=7l7a1uigRg4",
        affiliateUrl:
          "https://www.navygear.com/?utm_source=waveportals&utm_medium=affiliate&utm_campaign=rtc",
      },
    ],
  },

  "baden-at": {
    title: "Baden bei Wien, Austria – Spa & UNESCO",
    blurb:
      "Prestigious spa town with Roman spa heritage, UNESCO recognition, Casino Baden, and Beethoven history.",
    tags: ["UNESCO", "Casino", "Beethoven"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/101096994512716552136651044731009297320",
    lands: [
      {
        id: "casino-baden",
        name: "Casino Baden",
        blurb: "High-traffic entertainment anchor with regional draw.",
        videoUrl: "https://www.youtube.com/watch?v=TB4LEtAShe0",
        affiliateUrl: "https://www.casinos.at/casinos/baden",
      },
      {
        id: "beethovenhaus",
        name: "Beethovenhaus",
        blurb:
          "Historic residence & museum celebrating Beethoven’s summers in Baden where he composed Symphony #9 famously called Ode to Joy",
        videoUrl: "https://youtu.be/CLB5LanzHEc?feature=shared&t=3726",
        affiliateUrl: "",
      },
    ],
  },

  "varmdo-se": {
    title: "Värmdö (Viggsö Island), Sweden – ABBA cottage",
    blurb: "The ABBA cottage landmark in the Stockholm archipelago.",
    tags: ["ABBA", "Archipelago", "Pilgrimage"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/1981164889395449286388285702829111517",
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

  "deadwood-sd": {
    title: "Deadwood, SD – Legendary Old West town",
    blurb: "Historic saloons and casinos in a Black Hills Old West setting.",
    tags: ["Old West", "Casinos", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/152919129197892936510323545052036063139",
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

  "durant-ok": {
    title: "Durant, OK – Home of the Choctaw Indian Nation",
    blurb: "Cultural Center, Casino & Resort.",
    tags: ["Choctaw", "Casino", "Resort"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3102497881153330170438973525061606546437",
    lands: [
      {
        id: "choctaw-casino-resort",
        name: "Choctaw Casino & Resort",
        blurb: "Stay Awhile. Play Awhile",
        videoUrl: "https://www.youtube.com/watch?v=GP3MUj5O9Yw",
        affiliateUrl: "",
      },
      {
        id: "choctaw-cultural-center",
        name: "Choctaw Cultural Center",
        blurb: "Fascinating history of the Choctaw Indian Nation.",
        videoUrl: "https://www.youtube.com/watch?v=nnyqzGxGLXU",
        affiliateUrl: "",
      },
    ],
  },

  "galveston-tx": {
    title: "Galveston, TX – Gulf Coast tourism hub",
    blurb: "Beaches, cruises, and The Strand historic district.",
    tags: ["Beaches", "Cruises", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3796720729377725520913484692403980473937",
    lands: [
      {
        id: "the-strand",
        name: "The Strand Historic District @ Saengerfest Park",
        blurb:
          "Victorian-era downtown: brick-lined blocks of shops, museums, and nightlife.",
        videoUrl:
          "https://www.youtube.com/embed/QIBmMEbLtKw?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1",
        affiliateUrl: "",
      },
    ],
  },

  "roskilde-dk": {
    title: "Roskilde, Denmark – Festival city",
    blurb:
      "World-renowned for the Roskilde Festival; historic cathedral town.",
    tags: ["Festival", "Music", "Culture"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3010604377317538654113723260261144075391",
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

  "cluj-napoca-ro": {
    title: "Cluj-Napoca, Romania – University & culture",
    blurb: "Major university center; home of the UNTOLD Festival.",
    tags: ["University", "Festival", "Tech"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/392837052132320215465070341702007820571",
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

  "colmar-fr": {
    title: "Colmar, France – Alsace jewel",
    blurb: "Picturesque old town; inspiration for Beauty and the Beast.",
    tags: ["Alsace", "Old Town", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/50561775335783996739267028111362698303",
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

  "college-park-md": {
    title: "College Park, MD – University of Maryland",
    blurb: "Academia, research, and proximity to Washington, D.C.",
    tags: ["University", "Research", "DC Area"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/42171341694941743383174122333559370955",
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

  "jeonju-kr": {
    title: "Jeonju, South Korea – UNESCO & food",
    blurb: "UNESCO-listed historic center; birthplace of bibimbap.",
    tags: ["UNESCO", "Food", "Hanok"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/2887003481325296536527846355464262990798",
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

  "ostrava-cz": {
    title: "Ostrava, Czech Republic – Industry to culture",
    blurb: "Industrial city turned culture/tech hub.",
    tags: ["Tech", "Industry", "Culture"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/8620721531334460754235230511301466764",
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

  "reutlingen-de": {
    title: "Reutlingen, Germany – Near Stuttgart",
    blurb: "Historic German city; high livability and strong economy.",
    tags: ["Historic", "Economy", "Baden-Württemberg"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/292573116128912471666181257203360368220",
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

  "round-rock-tx": {
    title: "Round Rock, TX – Dell & sports",
    blurb: "Dell HQ, Dell Diamond, and Kalahari Falls.",
    tags: ["Tech", "Baseball", "Resort"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/50838639324434473282824924603582481238",
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
    tags: ["Sports", "Concerts", "Growth"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/2117950553333762095295601353507265581",
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
    blurb:
      "Direct tie to DFW Airport; huge utility for travel and tourism.",
    tags: ["DFW", "Tourism", "Transit"],
    // Fix: remove wrong Durant link until you have the real one
    earthmetaUrl: "https://app.earthmeta.ai/city/2471320665400692406924760230033371170721",
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

  "norrkoping-se": {
    title: "Norrköping, Sweden – Reinvented industrial hub",
    blurb:
      "Historic industrial core turned into a tech & creative cluster.",
    tags: ["Tech", "Creative", "Industrial"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/328978773740509271303684149061232454165",
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

  "carolina-pr": {
    title: "Carolina, Puerto Rico – SJU gateway",
    blurb:
      "Right next to San Juan’s airport; casino resorts & high tourism.",
    tags: ["SJU", "Resorts", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/955592025429317683616476297681314486268",
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
  usePageMeta(
    "WavePortals • Cities & Lands of IceManWave",
    "Browse WavePortals’ EarthMeta cities, lands, live cams, casinos, and cultural anchors."
  );

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

    if (sort === "az")
      filtered = filtered.slice().sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [query, sort]);

  return (
    <main>
      <h2
        className="glow-text"
        style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 12 }}
      >
        Cities and Lands of IceManWave
        <img
          src="/images/branding/icemanwave-logo.png"
          alt="IceManWave logo"
          style={{ height: 72, width: "auto", opacity: 0.9 }}
        />
      </h2>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search cities, blurbs, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cities"
        />
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort cities"
        >
          <option value="az">Sort A → Z</option>
        </select>
      </div>

      <div className="card-list" style={{ marginTop: 12 }}>
        {cities.map((c) => (
          <div key={c.id} className="card">
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
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="btn-row">
              <NavLink to={`/city/${c.id}`} className="btn btn-primary">
                View
              </NavLink>
              {c.earthmetaUrl ? (
                <a
                  href={buildPartnerLink(c.earthmetaUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-quiet"
                  title="Open this city on EarthMeta.ai"
                  aria-label={`Open ${c.title} on EarthMeta.ai`}
                >
                  🌍 EarthMeta
                </a>
              ) : null}
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

  usePageMeta(`${city.title} • WavePortals`, city.blurb);

  return (
    <main>
      <p>
        <NavLink
          to="/"
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back
        </NavLink>
      </p>

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

      <p className="muted" style={{ marginTop: 8 }}>
        {city.blurb}
      </p>

      <div className="btn-row" style={{ marginTop: 8 }}>
        <NavLink to="/" className="btn btn-quiet">
          ← All cities
        </NavLink>
        {city.earthmetaUrl ? (
          <a
            href={buildPartnerLink(city.earthmetaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title="Open this city on EarthMeta.ai"
          >
            🌍 View on EarthMeta.ai
          </a>
        ) : null}
      </div>

      <div className="card-list" style={{ marginTop: 12 }}>
        {city.lands?.length ? (
          city.lands.map((land) => (
            <div key={land.id} className="card">
              <h3>{land.name}</h3>
              <div className="muted clamp-2">{land.blurb}</div>
              <div className="btn-row">
                <NavLink
                  to={`/city/${id}/land/${land.id}`}
                  className="btn btn-primary"
                >
                  View
                </NavLink>
              </div>
            </div>
          ))
        ) : (
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

  usePageMeta(`${land.name} • ${city.title} • WavePortals`, land.blurb);

  return (
    <main>
      <p style={{ marginBottom: 12 }}>
        <NavLink
          to={`/city/${id}`}
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          ← Back to {city.title}
        </NavLink>
      </p>

      <h1 className="glow-text" style={{ marginTop: 0 }}>
        {land.name} {isRTC && <LiveBadge />}
      </h1>
      <p className="muted">{land.blurb}</p>

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
        <DeferredIframe
          src={embedSrc}
          title={land.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <div
          className="glow-panel"
          style={{ display: "grid", placeItems: "center", padding: 40 }}
        >
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
        <NavLink to={`/city/${id}`} className="btn btn-quiet">
          Back to lands
        </NavLink>
        {city.earthmetaUrl ? (
          <a
            href={buildPartnerLink(city.earthmetaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title="Open this city on EarthMeta.ai"
          >
            🌍 City on EarthMeta.ai
          </a>
        ) : null}
      </div>

      <div style={{ marginTop: 24 }}>
        {land.affiliateUrl ? (
          <AffiliateBanner
            href={land.affiliateUrl}
            imgSrc="/images/branding/waveportal-holder.svg"
            ctaLabel="Launch"
          />
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

    // Already /embed — return as is
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return u.toString();
    }

    // youtu.be/<id>[?t=...]
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      const params = new URLSearchParams();
      const keep = [
        "start",
        "t",
        "autoplay",
        "mute",
        "playsinline",
        "rel",
        "modestbranding",
        "controls",
      ];
      for (const k of keep) if (u.searchParams.has(k)) params.set(k, u.searchParams.get(k));
      if (!params.has("start") && params.has("t")) {
        const t = params.get("t");
        const secs = /^\d+$/.test(t) ? Number(t) : 0;
        params.set("start", String(secs));
        params.delete("t");
      }
      return `https://www.youtube.com/embed/${id}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      const id = u.searchParams.get("v");
      const params = new URLSearchParams();
      const keep = [
        "start",
        "t",
        "autoplay",
        "mute",
        "playsinline",
        "rel",
        "modestbranding",
        "controls",
      ];
      for (const k of keep) if (u.searchParams.has(k)) params.set(k, u.searchParams.get(k));
      if (!params.has("start") && params.has("t")) {
        const t = params.get("t");
        const secs = /^\d+$/.test(t) ? Number(t) : 0;
        params.set("start", String(secs));
        params.delete("t");
      }
      return `https://www.youtube.com/embed/${id}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
    }

    return "";
  } catch {
    return "";
  }
}

/* ====================== Affiliate banner (image-dominant + CTA) ====================== */
function AffiliateBanner({
  href,
  imgSrc = "/images/branding/waveportal-holder.svg",
  ctaLabel = "Launch",
  alt = "WavePortal banner",
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="glow-panel glow-banner"
      style={{ maxWidth: 980, margin: "16px auto 0" }}
      aria-label={ctaLabel}
      title={ctaLabel}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="banner-img"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="btn btn-primary cta">{ctaLabel}</span>
    </a>
  );
}

/* ===================================== 404 ===================================== */
function NotFound() {
  usePageMeta("Not found • WavePortals", "The page you requested does not exist.");
  return (
    <main>
      <p className="glow-error">
        That page doesn’t exist.{" "}
        <NavLink
          to="/"
          className="glow-text glow-hover"
          style={{ textDecoration: "none" }}
        >
          Go home
        </NavLink>
        .
      </p>
    </main>
  );
}
