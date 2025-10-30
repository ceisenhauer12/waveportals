// src/components/AffiliateBanner.jsx
export default function AffiliateBanner({
  href,
  imgSrc = "/images/branding/waveportal-holder.svg",
  ctaLabel = "Launch",
  alt = "WavePortal banner",
}) {
  const inner = (
    <>
      <img
        src={imgSrc}
        alt={alt}
        className="banner-img"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <span className="btn btn-primary cta">{ctaLabel}</span>
    </>
  );

  const wrapStyle = { maxWidth: 980, margin: "16px auto 0" };

  // If no href, render a non-clickable placeholder so it always shows
  if (!href) {
    return (
      <div
        className="glow-panel glow-banner"
        style={wrapStyle}
        role="img"
        aria-label={alt}
        title={alt}
      >
        {inner}
      </div>
    );
  }

  // Clickable affiliate
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="glow-panel glow-banner"
      style={wrapStyle}
      aria-label={ctaLabel}
      title={ctaLabel}
    >
      {inner}
    </a>
  );
}
