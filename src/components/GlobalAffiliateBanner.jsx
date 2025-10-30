// src/components/GlobalAffiliateBanner.jsx
import AffiliateBanner from "./AffiliateBanner.jsx";

export default function GlobalAffiliateBanner() {
  // site-wide holding banner; shows even with no href
  return (
    <div style={{ padding: "8px 16px", marginTop: 16 }}>
      <AffiliateBanner
        href="" // no affiliate yet → placeholder renders
        imgSrc="/images/branding/waveportal-holder.svg"
        ctaLabel="Launch"
        alt="WavePortals placeholder banner"
      />
    </div>
  );
}
