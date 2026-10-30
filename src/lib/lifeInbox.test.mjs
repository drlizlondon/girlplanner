import assert from "node:assert/strict";
import test from "node:test";
import { lifeInboxUrl } from "./lifeInbox.ts";

const id = "3f2b9c1e-1111-4aaa-9bbb-0123456789ab";

test("link carries the task id, title, notes and due date", () => {
  const url = new URL(lifeInboxUrl({ id, title: " Send the proposal ", additional_info: "Ask Sam & co", dueDate: new Date(2026, 10, 4, 9) }));
  assert.equal(url.origin + url.pathname, "https://bigpictureplanner.app/planner/");
  const p = Object.fromEntries(url.searchParams);
  assert.deepEqual(p, { add_to_inbox: "1", from: "girlplanner", ref: id, title: "Send the proposal", notes: "Ask Sam & co", due: "2026-11-04" });
});

test("MUST-FAIL guard: the ref is the task id, so BPP can spot a repeat", () => {
  const a = new URL(lifeInboxUrl({ id, title: "A" })).searchParams.get("ref");
  const b = new URL(lifeInboxUrl({ id, title: "A renamed" })).searchParams.get("ref");
  assert.equal(a, id);
  assert.equal(a, b);
});

test("no notes or due date: those params are left out", () => {
  const p = new URL(lifeInboxUrl({ id, title: "A", additional_info: "  ", dueDate: undefined })).searchParams;
  assert.equal(p.has("notes"), false);
  assert.equal(p.has("due"), false);
});
