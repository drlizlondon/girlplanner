import assert from "node:assert/strict";
import test from "node:test";
import { assistantKindLabel } from "./assistantKind.ts";

test("each assistant kind has its label", () => {
  assert.equal(assistantKindLabel("explicit"), "From your summary");
  assert.equal(assistantKindLabel("inferred"), "Inferred");
  assert.equal(assistantKindLabel("claude"), "Claude spotted");
});

test("anything else shows no label (G1: nothing invented)", () => {
  for (const v of [null, undefined, "", "briefing", "chatgpt_import", "Inferred"]) assert.equal(assistantKindLabel(v), null);
});
