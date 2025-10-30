// src/utils/partners.js
export const MYE_REF = "EM20252B6414";
export const DEFAULT_UTM = {
  utm_source: "waveportals",
  utm_medium: "site",
  utm_campaign: "earthmeta_cta",
};

export function buildPartnerLink(raw) {
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
