import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { generateAssistantKey, keyHint, sha256Hex } from "./assistantKey.ts";

test("key shape: prefix + 43 url-safe characters", () => {
  const key = generateAssistantKey(new Uint8Array(32).fill(255));
  assert.match(key, /^gpk_[A-Za-z0-9_-]{43}$/);
  assert.ok(key.length >= 32, "the database refuses keys shorter than 32");
});

test("two keys are never the same", () => {
  assert.notEqual(generateAssistantKey(), generateAssistantKey());
});

test("MUST-FAIL guard: too little randomness is refused", () => {
  assert.throws(() => generateAssistantKey(new Uint8Array(8)), /32 random bytes/);
});

test("hash matches Postgres encode(digest(key,'sha256'),'hex')", async () => {
  const key = "gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  assert.equal(await sha256Hex(key), createHash("sha256").update(key, "utf8").digest("hex"));
  assert.equal(keyHint(key), "aaaa");
});
