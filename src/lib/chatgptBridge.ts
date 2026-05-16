import { LTask, LSuggestion } from "./localStore";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function buildExport(tasks: LTask[]): string {
  const lines: string[] = [];
  lines.push("FOUNDER_OS_CHATGPT_EXPORT");
  lines.push(`DATE: ${todayISO()}`);
  lines.push(`DASHBOARD_CONTEXT: Founder OS local-first dashboard`);
  lines.push(`SELECTED_TASK_COUNT: ${tasks.length}`);
  lines.push("");
  lines.push("INSTRUCTIONS:");
  lines.push(
    "Treat each task as a separate item. For each one, provide a clear recommendation, next steps, any useful draft wording or structured output, and then create a dashboard-ready return block that can be pasted back into the dashboard.",
  );
  lines.push("");
  lines.push("RETURN_FORMAT_REQUIRED:");
  lines.push("FOUNDER_OS_CHATGPT_RETURN");
  lines.push(`DATE: ${todayISO()}`);
  lines.push("");
  lines.push("TASK_RESPONSE:");
  lines.push("TASK_ID:");
  lines.push("SUGGESTION_TYPE:");
  lines.push("ORIGINAL_TASK_TITLE:");
  lines.push("RECOMMENDATION:");
  lines.push("NEXT_ACTIONS:");
  lines.push("DRAFT_TEXT:");
  lines.push("DASHBOARD_READY_CARD:");
  lines.push("TARGET_SECTION:");
  lines.push("STATUS:");
  lines.push("END_TASK_RESPONSE");
  lines.push("");
  lines.push("TASKS:");
  lines.push("");

  for (const t of tasks) {
    lines.push("TASK:");
    lines.push(`TASK_ID: ${t.id}`);
    lines.push(`TITLE: ${t.title}`);
    lines.push(`PROJECT: ${t.project || ""}`);
    lines.push(`STATUS: ${t.status || (t.completed ? "completed" : "open")}`);
    lines.push(`PRIORITY: ${t.priority || ""}`);
    lines.push(`DUE_DATE: ${t.due_date || ""}`);
    lines.push(`NOTES: ${(t.notes || t.additional_info || "").replace(/\n/g, " ")}`);
    lines.push(`HELP_REQUESTED: `);
    lines.push("END_TASK");
    lines.push("");
  }

  return lines.join("\n");
}

export interface ParsedReturnItem {
  task_id?: string;
  suggestion_type?: string;
  original_task_title?: string;
  recommendation?: string;
  next_actions?: string;
  draft_text?: string;
  dashboard_ready_card?: string;
  target_section?: string;
  status?: string;
}

const FIELD_KEYS = [
  "TASK_ID",
  "SUGGESTION_TYPE",
  "ORIGINAL_TASK_TITLE",
  "RECOMMENDATION",
  "NEXT_ACTIONS",
  "DRAFT_TEXT",
  "DASHBOARD_READY_CARD",
  "TARGET_SECTION",
  "STATUS",
] as const;

function fieldToKey(f: string): keyof ParsedReturnItem | null {
  const map: Record<string, keyof ParsedReturnItem> = {
    TASK_ID: "task_id",
    SUGGESTION_TYPE: "suggestion_type",
    ORIGINAL_TASK_TITLE: "original_task_title",
    RECOMMENDATION: "recommendation",
    NEXT_ACTIONS: "next_actions",
    DRAFT_TEXT: "draft_text",
    DASHBOARD_READY_CARD: "dashboard_ready_card",
    TARGET_SECTION: "target_section",
    STATUS: "status",
  };
  return map[f] || null;
}

export function parseReturn(text: string): {
  ok: boolean;
  items: ParsedReturnItem[];
  reason?: string;
} {
  if (!text || !text.includes("FOUNDER_OS_CHATGPT_RETURN")) {
    return { ok: false, items: [], reason: "Missing FOUNDER_OS_CHATGPT_RETURN header." };
  }

  const items: ParsedReturnItem[] = [];
  const blocks = text.split(/TASK_RESPONSE\s*:?/g).slice(1);

  for (const block of blocks) {
    const end = block.search(/END_TASK_RESPONSE/);
    if (end === -1) continue;
    const body = block.slice(0, end);

    const item: ParsedReturnItem = {};
    const lines = body.split(/\r?\n/);
    let currentKey: keyof ParsedReturnItem | null = null;
    let buffer: string[] = [];
    const flush = () => {
      if (currentKey) {
        const val = buffer.join("\n").trim();
        if (val) (item as any)[currentKey] = val;
      }
      buffer = [];
    };
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z_]+)\s*:\s*(.*)$/);
      if (m && FIELD_KEYS.includes(m[1] as any)) {
        flush();
        currentKey = fieldToKey(m[1]);
        buffer = m[2] ? [m[2]] : [];
      } else if (currentKey) {
        buffer.push(line);
      }
    }
    flush();

    // require at least a recommendation or original title to count
    if (item.recommendation || item.original_task_title || item.dashboard_ready_card) {
      items.push(item);
    }
  }

  if (items.length === 0) {
    return { ok: false, items: [], reason: "Found header but no parsable TASK_RESPONSE blocks." };
  }

  return { ok: true, items };
}

export function returnItemToSuggestion(
  r: ParsedReturnItem,
): Omit<LSuggestion, "id" | "created_at" | "status"> {
  const type = (r.suggestion_type || "next_action").toLowerCase().replace(/\s+/g, "_");
  const title =
    r.dashboard_ready_card?.split("\n")[0]?.trim() ||
    r.original_task_title ||
    r.recommendation?.split("\n")[0]?.trim() ||
    "Suggestion";
  return {
    task_id: r.task_id || null,
    original_task_title: r.original_task_title || null,
    type,
    title,
    description: r.dashboard_ready_card || r.recommendation || "",
    recommendation: r.recommendation || "",
    next_actions: r.next_actions || "",
    draft_text: r.draft_text || "",
    target_section: r.target_section || "",
    source: "chatgpt_import",
    project: null,
    priority: null,
    briefing_id: null,
  };
}