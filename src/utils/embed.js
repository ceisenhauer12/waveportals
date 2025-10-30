// src/utils/embed.js
export function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);

    // already /embed
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return u.toString();
    }

    // youtu.be/<id>?t=...
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      const params = new URLSearchParams();
      const keep = ["start","t","autoplay","mute","playsinline","rel","modestbranding","controls"];
      for (const k of keep) if (u.searchParams.has(k)) params.set(k, u.searchParams.get(k));
      if (!params.has("start") && params.has("t")) {
        const t = params.get("t");
        const secs = /^\d+$/.test(t) ? Number(t) : 0;
        params.set("start", String(secs));
        params.delete("t");
      }
      return `https://www.youtube.com/embed/${id}${params.toString() ? `?${params}` : ""}`;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      const id = u.searchParams.get("v");
      const params = new URLSearchParams();
      const keep = ["start","t","autoplay","mute","playsinline","rel","modestbranding","controls"];
      for (const k of keep) if (u.searchParams.has(k)) params.set(k, u.searchParams.get(k));
      if (!params.has("start") && params.has("t")) {
        const t = params.get("t");
        const secs = /^\d+$/.test(t) ? Number(t) : 0;
        params.set("start", String(secs));
        params.delete("t");
      }
      return `https://www.youtube.com/embed/${id}${params.toString() ? `?${params}` : ""}`;
    }

    return "";
  } catch {
    return "";
  }
}
