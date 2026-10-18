export const SORT_OPTIONS = [
  { value: "relevance", label: "Best match" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "pop-desc", label: "Population (high to low)" },
  { value: "pop-asc", label: "Population (low to high)" },
];

/** Countries that actually appear in the current results. */
export function getCountries(results) {
  return [...new Set(results.map((r) => r.country).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

const byName = (a, b) => a.name.localeCompare(b.name);
// Missing populations always sort last, in both directions.
const byPopulation = (dir) => (a, b) => {
  if (a.population == null && b.population == null) return byName(a, b);
  if (a.population == null) return 1;
  if (b.population == null) return -1;
  return dir * (a.population - b.population) || byName(a, b);
};

export function filterAndSort(results, { country = "all", sort = "relevance" } = {}) {
  const list = country === "all" ? [...results] : results.filter((r) => r.country === country);
  switch (sort) {
    case "name-asc": return list.sort(byName);
    case "name-desc": return list.sort((a, b) => byName(b, a));
    case "pop-desc": return list.sort(byPopulation(-1));
    case "pop-asc": return list.sort(byPopulation(1));
    default: return list; // keep the API's own ranking
  }
}

export const formatLocation = (d) => [d.admin1, d.country].filter(Boolean).join(", ") || "Location unavailable";
export const formatPopulation = (n) => (n == null ? "Not available" : new Intl.NumberFormat("en").format(n));
export const formatCoords = (d) => `${d.latitude.toFixed(3)}°, ${d.longitude.toFixed(3)}°`;
export const mapUrl = (d) =>
  `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=10/${d.latitude}/${d.longitude}`;

/** Stable 0–4 index so each place keeps the same placeholder colour. */
export function toneIndex(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 5;
}
