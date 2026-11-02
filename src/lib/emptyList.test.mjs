import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_LIST_MESSAGE, showEmptyListMessage } from "./emptyList.ts";

test("empty list shows the line, one task hides it", () => {
  assert.equal(showEmptyListMessage(0), true);
  assert.equal(showEmptyListMessage(1), false);
  assert.equal(showEmptyListMessage(5), false);
});

test("MUST-FAIL guard: the exact wording is fixed", () => {
  assert.equal(EMPTY_LIST_MESSAGE, "Nothing here yet. Type your first task above and tap Add.");
});
