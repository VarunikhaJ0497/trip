import test from "node:test";
import assert from "node:assert/strict";
import { filterAndSort, getCountries, formatLocation } from "./destinations.js";

const data = [
  { id: "1", name: "Paris", country: "France", population: 2100000 },
  { id: "2", name: "Paris", country: "United States", population: null },
  { id: "3", name: "Parisot", country: "France", population: 700 },
  { id: "4", name: "Aparis", country: "Spain", population: 5000 },
];

test("getCountries returns unique, sorted countries present in results", () => {
  assert.deepEqual(getCountries(data), ["France", "Spain", "United States"]);
});
test("country filter narrows results", () => {
  assert.equal(filterAndSort(data, { country: "France" }).length, 2);
});
test("alphabetical sort works both ways", () => {
  assert.equal(filterAndSort(data, { sort: "name-asc" })[0].name, "Aparis");
  assert.equal(filterAndSort(data, { sort: "name-desc" })[0].name, "Parisot");
});
test("population sort puts missing values last in both directions", () => {
  assert.equal(filterAndSort(data, { sort: "pop-desc" }).at(-1).population, null);
  assert.equal(filterAndSort(data, { sort: "pop-asc" }).at(-1).population, null);
  assert.equal(filterAndSort(data, { sort: "pop-desc" })[0].population, 2100000);
});
test("filter and sort combine without mutating the input", () => {
  const copy = JSON.stringify(data);
  const out = filterAndSort(data, { country: "France", sort: "pop-asc" });
  assert.deepEqual(out.map((d) => d.id), ["3", "1"]);
  assert.equal(JSON.stringify(data), copy);
});
test("formatLocation handles missing parts", () => {
  assert.equal(formatLocation({ admin1: "Tamil Nadu", country: "India" }), "Tamil Nadu, India");
  assert.equal(formatLocation({}), "Location unavailable");
});
