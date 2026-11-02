import assert from "node:assert/strict";
import test from "node:test";
import { newTaskFromText } from "./newTask.ts";

test("MUST-FAIL guard: a task added with only text is Medium with no due date", () => {
  assert.deepEqual(newTaskFromText("  Buy milk "), { title: "Buy milk", priority: "medium", dueDate: null });
});

test("blank text adds nothing", () => {
  assert.equal(newTaskFromText("   "), null);
});
