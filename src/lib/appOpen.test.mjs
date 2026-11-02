import assert from "node:assert/strict";
import test from "node:test";
import { londonDate, shouldRecordOpen } from "./appOpen.ts";

test("London date: BST evening 23:30 UTC on 1 Jun is already 2 Jun", () => {
  assert.equal(londonDate(new Date("2026-06-01T23:30:00Z")), "2026-06-02");
});

test("London date: GMT winter 23:30 UTC stays the same day", () => {
  assert.equal(londonDate(new Date("2026-11-02T23:30:00Z")), "2026-11-02");
});

test("format is YYYY-MM-DD", () => {
  assert.match(londonDate(new Date("2026-11-02T07:45:00Z")), /^\d{4}-\d{2}-\d{2}$/);
});

test("records once per day, again on a new day", () => {
  assert.equal(shouldRecordOpen(null, "2026-11-02"), true);
  assert.equal(shouldRecordOpen("2026-11-02", "2026-11-02"), false);
  assert.equal(shouldRecordOpen("2026-11-02", "2026-11-03"), true);
});
