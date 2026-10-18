export const STORAGE_KEY = "tripwise.itinerary.v1";

const isValid = (i) =>
  i && typeof i === "object" && i.id != null && typeof i.name === "string" && i.name.trim() &&
  Number.isFinite(i.latitude) && Number.isFinite(i.longitude);

/** Keep only well-formed, unique items and only the fields we need. */
export function sanitizeItems(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter(isValid).reduce((out, i) => {
    const id = String(i.id);
    if (seen.has(id)) return out;
    seen.add(id);
    out.push({
      id,
      name: i.name,
      country: typeof i.country === "string" ? i.country : null,
      admin1: typeof i.admin1 === "string" ? i.admin1 : null,
      latitude: i.latitude,
      longitude: i.longitude,
      population: Number.isFinite(i.population) ? i.population : null,
      savedAt: typeof i.savedAt === "string" ? i.savedAt : null,
    });
    return out;
  }, []);
}

export function toItineraryItem(d) {
  return { ...sanitizeItems([d])[0], savedAt: new Date().toISOString() };
}

/** Returns { items, problem } where problem is null | "damaged" | "unreadable". */
export function loadItinerary(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw == null) return { items: [], problem: null };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], problem: "unreadable" };
    const items = sanitizeItems(parsed);
    return { items, problem: items.length < parsed.length ? "damaged" : null };
  } catch {
    return { items: [], problem: "unreadable" };
  }
}

/** Returns true when the write succeeded. */
export function saveItinerary(items, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
