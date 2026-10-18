import test from "node:test";
import assert from "node:assert/strict";
import { STORAGE_KEY, loadItinerary, saveItinerary, sanitizeItems, toItineraryItem } from "./itineraryStorage.js";

const memory = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; } };
};
const place = { id: 1, name: "Kyoto", country: "Japan", admin1: "Kyoto", latitude: 35, longitude: 135, population: 1400000 };

test("round-trips items through storage", () => {
  const s = memory();
  assert.equal(saveItinerary([toItineraryItem(place)], s), true);
  const { items, problem } = loadItinerary(s);
  assert.equal(problem, null);
  assert.equal(items[0].name, "Kyoto");
  assert.equal(items[0].id, "1");
});
test("empty storage gives an empty trip", () => {
  assert.deepEqual(loadItinerary(memory()), { items: [], problem: null });
});
test("malformed JSON is handled safely", () => {
  assert.deepEqual(loadItinerary(memory({ [STORAGE_KEY]: "{oops" })), { items: [], problem: "unreadable" });
});
test("non-array JSON is rejected", () => {
  assert.equal(loadItinerary(memory({ [STORAGE_KEY]: '{"a":1}' })).problem, "unreadable");
});
test("damaged and duplicate entries are dropped", () => {
  const raw = JSON.stringify([place, { ...place }, { id: 2, name: "", latitude: 1, longitude: 1 }, null]);
  const { items, problem } = loadItinerary(memory({ [STORAGE_KEY]: raw }));
  assert.equal(items.length, 1);
  assert.equal(problem, "damaged");
});
test("sanitizeItems keeps only known fields", () => {
  const [item] = sanitizeItems([{ ...place, secret: "x" }]);
  assert.equal("secret" in item, false);
});
test("save reports failure when storage throws", () => {
  const broken = { setItem() { throw new Error("quota"); } };
  assert.equal(saveItinerary([], broken), false);
});
