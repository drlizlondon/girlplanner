/**
 * Assistant keys (Queen Mode): made in the browser, shown once, stored only
 * as a SHA-256 hash (supabase/migrations/20261030090000_assistant_keys.sql).
 * The hash must match Postgres encode(digest(key, 'sha256'), 'hex').
 */

export const KEY_PREFIX = "gpk_";

const toBase64Url = (bytes: Uint8Array): string => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** 32 random bytes → "gpk_" + 43 url-safe characters. */
export const generateAssistantKey = (random: Uint8Array = crypto.getRandomValues(new Uint8Array(32))): string => {
  if (random.length < 32) throw new Error("Assistant keys need 32 random bytes.");
  return KEY_PREFIX + toBase64Url(random);
};

export const sha256Hex = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};

/** Last 4 characters, so she can tell keys apart without seeing them. */
export const keyHint = (key: string): string => key.slice(-4);
