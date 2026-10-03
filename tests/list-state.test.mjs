import test from "node:test";
import assert from "node:assert/strict";
import { pageNumber, pageItems, updateSearch } from "../src/lib/list-state.ts";

test("malformed page values cannot reach the API", () => {
  for (const value of [
    null,
    "",
    "0",
    "-1",
    "1.5",
    "NaN",
    "Infinity",
    "1000001",
  ])
    assert.equal(pageNumber(value), 1);
  assert.equal(pageNumber("12"), 12);
});
test("pagination handles empty, final and out-of-range pages", () => {
  const values = Array.from({ length: 23 }, (_, i) => i);
  assert.deepEqual(pageItems(values, 3).items, [20, 21, 22]);
  assert.equal(pageItems(values, 99).page, 3);
  assert.deepEqual(pageItems([], 5), {
    page: 1,
    totalPages: 1,
    total: 0,
    items: [],
  });
});
test("URL updates preserve filters, encode search and reset pagination", () => {
  const updated = new URLSearchParams(
    updateSearch("page=8&role=STAFF&search=old", {
      search: "water & road",
      page: "1",
    }),
  );
  assert.equal(updated.get("role"), "STAFF");
  assert.equal(updated.get("search"), "water & road");
  assert.equal(updated.get("page"), "1");
  assert.equal(
    new URLSearchParams(updateSearch(updated.toString(), { search: "" })).has(
      "search",
    ),
    false,
  );
});
