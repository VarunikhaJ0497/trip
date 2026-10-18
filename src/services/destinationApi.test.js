import test from "node:test";
import assert from "node:assert/strict";
import { validateQuery, normalizeResult, searchDestinations, ApiError } from "./destinationApi.js";

const mockFetch = (impl) => { globalThis.fetch = impl; };
const json = (body, init = {}) => ({ ok: true, status: 200, json: async () => body, ...init });

test("validateQuery rejects blank, short, long and letterless input", () => {
  assert.ok(validateQuery("   "));
  assert.ok(validateQuery("a"));
  assert.ok(validateQuery("x".repeat(81)));
  assert.ok(validateQuery("12345"));
  assert.equal(validateQuery("  Tokyo "), null);
});
test("normalizeResult maps API fields and nulls missing population", () => {
  const r = normalizeResult({ id: 5, name: "Tokyo", latitude: 35.6, longitude: 139.7, country: "Japan", country_code: "JP", admin1: "Tokyo" });
  assert.equal(r.population, null);
  assert.equal(r.countryCode, "JP");
  assert.equal(normalizeResult({ id: 1, name: "Bad" }), null);
});
test("search returns [] when the API omits results", async () => {
  mockFetch(async () => json({ generationtime_ms: 1 }));
  assert.deepEqual(await searchDestinations("zzzzzz"), []);
});
test("search never calls the network for invalid input", async () => {
  let calls = 0;
  mockFetch(async () => { calls++; return json({}); });
  await assert.rejects(searchDestinations(" "), ApiError);
  assert.equal(calls, 0);
});
test("HTTP errors and network failures become friendly ApiErrors", async () => {
  mockFetch(async () => json({}, { ok: false, status: 503 }));
  await assert.rejects(searchDestinations("Paris"), /HTTP 503/);
  mockFetch(async () => { throw new TypeError("fail"); });
  await assert.rejects(searchDestinations("Paris"), /Couldn’t reach/);
});
test("malformed JSON and bad shapes are reported", async () => {
  mockFetch(async () => ({ ok: true, status: 200, json: async () => { throw new Error("bad"); } }));
  await assert.rejects(searchDestinations("Paris"), /couldn’t read/);
  mockFetch(async () => json({ results: "nope" }));
  await assert.rejects(searchDestinations("Paris"), /unexpected/);
});
test("duplicate ids are removed", async () => {
  const row = { id: 1, name: "A", latitude: 1, longitude: 1 };
  mockFetch(async () => json({ results: [row, row] }));
  assert.equal((await searchDestinations("Aa")).length, 1);
});
