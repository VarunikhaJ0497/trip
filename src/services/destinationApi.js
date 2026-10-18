// All network access lives here so UI components stay free of fetch logic.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export const MIN_QUERY_LENGTH = 2; // the geocoding API ignores 1-character searches
export const MAX_QUERY_LENGTH = 80;

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

/** Returns an error message for invalid input, or null when the query is fine. */
export function validateQuery(raw) {
  const q = String(raw ?? "").trim();
  if (!q) return "Enter a place name to search.";
  if (q.length < MIN_QUERY_LENGTH) return `Type at least ${MIN_QUERY_LENGTH} characters.`;
  if (q.length > MAX_QUERY_LENGTH) return `Keep the search under ${MAX_QUERY_LENGTH} characters.`;
  if (!/\p{L}/u.test(q)) return "Search needs at least one letter, for example “Lisbon”.";
  return null;
}

/** Maps one raw API record to the shape the app uses; returns null if it is unusable. */
export function normalizeResult(r) {
  if (!r || typeof r !== "object") return null;
  if (r.id == null || typeof r.name !== "string" || !r.name.trim()) return null;
  if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) return null;
  return {
    id: String(r.id),
    name: r.name,
    country: r.country ?? null,
    countryCode: r.country_code ?? null,
    admin1: r.admin1 ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
    population: Number.isFinite(r.population) && r.population > 0 ? r.population : null,
    timezone: r.timezone ?? null,
  };
}

export async function searchDestinations(query, signal) {
  const q = String(query ?? "").trim();
  const invalid = validateQuery(q);
  if (invalid) throw new ApiError(invalid);

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=30&language=en&format=json`;
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Couldn’t reach the destination service. Check your internet connection and try again.");
  }
  if (!res.ok) throw new ApiError(`The destination service returned an error (HTTP ${res.status}).`);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new ApiError("The destination service sent a response we couldn’t read.");
  }
  if (!data || typeof data !== "object") throw new ApiError("The destination service sent an unexpected response.");
  if (data.results === undefined) return []; // the API omits `results` when nothing matches
  if (!Array.isArray(data.results)) throw new ApiError("The destination service sent an unexpected response.");

  const seen = new Set();
  return data.results
    .map(normalizeResult)
    .filter((d) => d && !seen.has(d.id) && seen.add(d.id));
}

/**
 * Optional enrichment: a Wikipedia summary (text + photo) for the details view.
 * Resolves to null when there is no trustworthy match. Only AbortError is re-thrown.
 */
export async function fetchWikipediaSummary(destination, signal) {
  try {
    const title = encodeURIComponent(destination.name.replace(/ /g, "_"));
    const res = await fetch(WIKIPEDIA_SUMMARY_URL + title, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.type !== "standard" || !data.extract) return null;
    // Guard against same-name pages about a different place.
    const text = `${data.extract} ${data.description ?? ""}`.toLowerCase();
    const hints = [destination.country, destination.admin1].filter(Boolean).map((s) => s.toLowerCase());
    if (hints.length && !hints.some((h) => text.includes(h))) return null;
    return {
      extract: data.extract,
      photo: data.thumbnail?.source ?? null,
      url: data.content_urls?.desktop?.page ?? null,
    };
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    return null;
  }
}
