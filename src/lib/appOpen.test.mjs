import assert from "node:assert/strict";
import test from "node:test";
import { londonDate, shouldRecordOpen, RECORD_EVERY_MS } from "./appOpen.ts";

test("London date: BST evening 23:30 UTC on 1 Jun is already 2 Jun", () => {
  assert.equal(londonDate(new Date("2026-06-01T23:30:00Z")), "2026-06-02");
});

test("London date: GMT winter 23:30 UTC stays the same day", () => {
  assert.equal(londonDate(new Date("2026-11-02T23:30:00Z")), "2026-11-02");
});

test("format is YYYY-MM-DD", () => {
  assert.match(londonDate(new Date("2026-11-02T07:45:00Z")), /^\d{4}-\d{2}-\d{2}$/);
});

test("records on first open, then at most every 10 minutes, including later the same day", () => {
  const t0 = Date.parse("2026-11-02T07:30:00Z");
  assert.equal(shouldRecordOpen(null, t0), true);
  assert.equal(shouldRecordOpen(t0, t0 + 5 * 60 * 1000), false);
  // 07:30 open, then 08:00 after the 07:45 message: must record again.
  assert.equal(shouldRecordOpen(t0, t0 + 30 * 60 * 1000), true);
  assert.equal(RECORD_EVERY_MS, 600000);
});
