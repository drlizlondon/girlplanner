// Small label shown on a review card for suggestions an assistant added.
// Null for everything else (briefings, ChatGPT imports): no label is invented.
export function assistantKindLabel(kind: string | null | undefined): string | null {
  if (kind === "explicit") return "From your summary";
  if (kind === "inferred") return "Inferred";
  if (kind === "claude") return "Claude spotted";
  return null;
}
