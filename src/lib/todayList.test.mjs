import assert from "node:assert/strict";
import test from "node:test";
import { sortToday, nextPriority, dueLabel, dateFromInput, dateToInput } from "./todayList.ts";

const now = new Date(2026, 10, 1, 9); // Sun 1 Nov 2026
const d = (day) => new Date(2026, 10, day, 12);

// A5 fixture: 2 overdue, 2 dated, 2 undated, mixed priorities.
const fixture = [
  { id: "undated-low", priority: "low", created_at: "2026-10-30T10:00:00Z" },
  { id: "dated-5-med", priority: "medium", dueDate: d(5) },
  { id: "overdue-30oct-low", priority: "low", dueDate: new Date(2026, 9, 30, 12) },
  { id: "undated-high", priority: "high", created_at: "2026-10-01T10:00:00Z" },
  { id: "dated-3-high", priority: "high", dueDate: d(3) },
  { id: "overdue-28oct-med", priority: "medium", dueDate: new Date(2026, 9, 28, 12) },
];
const expected = ["overdue-28oct-med", "overdue-30oct-low", "dated-3-high", "dated-5-med", "undated-high", "undated-low"];

test("A5 sort: overdue, then by date, then undated; priority within each", () => {
  assert.deepEqual(sortToday(fixture, now).map((t) => t.id), expected);
});

test("A5 MUST-FAIL guard: a reversed order does not pass the same check", () => {
  const reversed = [...sortToday(fixture, now)].reverse().map((t) => t.id);
  assert.notDeepEqual(reversed, expected);
});

test("same priority and no date: newest first", () => {
  const out = sortToday([
    { id: "old", priority: "medium", created_at: "2026-10-01T00:00:00Z" },
    { id: "new", priority: "medium", created_at: "2026-10-31T00:00:00Z" },
  ], now).map((t) => t.id);
  assert.deepEqual(out, ["new", "old"]);
});

test("A3 priority chip cycles Medium -> High -> Low -> Medium", () => {
  assert.equal(nextPriority("medium"), "high");
  assert.equal(nextPriority("high"), "low");
  assert.equal(nextPriority("low"), "medium");
});

test("due labels", () => {
  assert.deepEqual(dueLabel(undefined, now), { text: "Add date", overdue: false });
  assert.deepEqual(dueLabel(d(1), now), { text: "Today", overdue: false });
  assert.deepEqual(dueLabel(d(2), now), { text: "Tomorrow", overdue: false });
  assert.deepEqual(dueLabel(d(3), now), { text: "Tue 3 Nov", overdue: false });
  assert.deepEqual(dueLabel(new Date(2026, 9, 30, 12), now), { text: "Overdue · 30 Oct", overdue: true });
});

test("date input round-trips at local noon", () => {
  const picked = dateFromInput("2026-11-03");
  assert.equal(picked.getHours(), 12);
  assert.equal(dateToInput(picked), "2026-11-03");
  assert.equal(dateFromInput(""), undefined);
});
