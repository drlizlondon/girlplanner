export type SuggestionType =
  | "next_action"
  | "decision"
  | "draft"
  | "research"
  | "admin"
  | "follow_up"
  | "project_note";

export interface ParsedChatGPTSuggestion {
  taskId: string | null;
  type: SuggestionType;
  title: string;
  recommendation: string;
  nextSteps: string[];
  draft: string;
}

const VALID_TYPES = new Set<SuggestionType>([
  "next_action","decision","draft","research","admin","follow_up","project_note",
]);

function normaliseType(t: string): SuggestionType {
  const s = t.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (VALID_TYPES.has(s as SuggestionType) ? s : "next_action") as SuggestionType;
}

export function parseChatGPTReturn(raw: string): ParsedChatGPTSuggestion[] {
  if (!raw?.trim()) return [];
  const blockRegex = /===\s*TASK\s*([A-Za-z0-9-]+)?\s*===([\s\S]*?)===\s*END\s*===/gi;
  const out: ParsedChatGPTSuggestion[] = [];
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(raw)) !== null) {
    const taskId = m[1] && m[1] !== "id" ? m[1] : null;
    const body = m[2];
    out.push(parseBlock(body, taskId));
  }
  return out;
}

function parseBlock(body: string, taskId: string | null): ParsedChatGPTSuggestion {
  const get = (key: string): string => {
    const r = new RegExp(`^\\s*${key}\\s*:\\s*(.*)$`, "im");
    const m = body.match(r);
    return m ? m[1].trim() : "";
  };

  // next_steps as bullet list under the "next_steps:" line
  const stepsMatch = body.match(/^\s*next_steps\s*:\s*([\s\S]*?)(?=^\s*(?:draft|type|title|recommendation)\s*:|$)/im);
  const steps: string[] = [];
  if (stepsMatch) {
    stepsMatch[1].split(/\r?\n/).forEach((line) => {
      const t = line.replace(/^[\s\-\*•]+/, "").trim();
      if (t) steps.push(t);
    });
  }

  // draft: pipe block until next === or eof
  let draft = "";
  const draftMatch = body.match(/^\s*draft\s*:\s*\|?\s*\n([\s\S]*?)(?=\n\s*(?:type|title|recommendation|next_steps)\s*:|$)/im);
  if (draftMatch) {
    draft = draftMatch[1].replace(/\n\s*$/g, "").replace(/^( {2}|\t)/gm, "").trim();
  } else {
    const single = body.match(/^\s*draft\s*:\s*(.+)$/im);
    if (single) draft = single[1].trim();
  }

  return {
    taskId,
    type: normaliseType(get("type") || "next_action"),
    title: get("title") || "Untitled suggestion",
    recommendation: get("recommendation"),
    nextSteps: steps,
    draft,
  };
}