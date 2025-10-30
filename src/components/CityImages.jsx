// src/components/CityImages.jsx
export function CityTileImage({ id, title, heroImg }) {
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
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(id)}/1600/900`;
      }}
      style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
    />
  );
}

export function CityBannerImage({ id, title, heroImg }) {
  const initialSrc = heroImg || `/images/cities/${id}.jpg`;
  return (
    <img
      src={initialSrc}
      alt={title || "City image"}
      loading="lazy"
      decoding="async"
      width={1600}
      height={900}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(id)}/1600/900`;
      }}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}
