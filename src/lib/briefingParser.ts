// Deterministic markdown parser for Daily Executive Processing reports.
// No AI. Splits by `##` / `###` headings and bullet items.

export type SuggestionType =
  | "priority_action"
  | "follow_up"
  | "insight"
  | "question"
  | "idea";

export interface ParsedSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  project?: string;
  priority?: "high" | "medium" | "low";
  source_section: string;
}

export interface ProjectUpdate {
  project: string;
  updates: string[];
  next_steps: string[];
}

export interface ParsedBriefing {
  overview: string;
  executive_signals: string;
  priority_actions: ParsedSuggestion[];
  follow_ups: ParsedSuggestion[];
  project_updates: ProjectUpdate[];
  strategic_insights: ParsedSuggestion[];
  open_questions: ParsedSuggestion[];
  parked_ideas: ParsedSuggestion[];
}

const SECTION_ALIASES: Record<string, keyof ParsedBriefing | "skip"> = {
  overview: "overview",
  summary: "overview",
  "executive signals": "executive_signals",
  signals: "executive_signals",
  "priority actions": "priority_actions",
  "priorities": "priority_actions",
  "actions": "priority_actions",
  "possible follow ups": "follow_ups",
  "follow ups": "follow_ups",
  "follow-ups": "follow_ups",
  "project updates": "project_updates",
  "projects": "project_updates",
  "strategic insights": "strategic_insights",
  "insights": "strategic_insights",
  "open questions": "open_questions",
  "questions": "open_questions",
  "parked ideas": "parked_ideas",
  "ideas": "parked_ideas",
};

const stripHeading = (line: string) =>
  line.replace(/^#+\s*/, "").trim();

const isHeading = (line: string) => /^#{1,6}\s+/.test(line);
const isBullet = (line: string) => /^\s*[-*•]\s+/.test(line);
const stripBullet = (line: string) =>
  line.replace(/^\s*[-*•]\s+/, "").trim();

function detectPriority(text: string): "high" | "medium" | "low" {
  const t = text.toLowerCase();
  if (/(urgent|asap|critical|p0|high)/.test(t)) return "high";
  if (/(low|nice to have|whenever)/.test(t)) return "low";
  return "medium";
}

function detectProject(text: string): string | undefined {
  // [Project] or **Project** prefix
  const bracket = text.match(/^\[([^\]]+)\]/);
  if (bracket) return bracket[1].trim();
  const bold = text.match(/^\*\*([^*]+)\*\*\s*[:\-—]/);
  if (bold) return bold[1].trim();
  return undefined;
}

function parseBulletAsSuggestion(
  bullet: string,
  type: SuggestionType,
  source: string,
): ParsedSuggestion {
  // Split title / description on first " — ", " - ", or ":"
  const cleaned = bullet
    .replace(/^\[([^\]]+)\]\s*/, "")
    .replace(/^\*\*([^*]+)\*\*\s*[:\-—]\s*/, "");
  const splitMatch = cleaned.match(/^(.+?)\s+[—–-]\s+(.+)$/) ||
    cleaned.match(/^([^:]+):\s+(.+)$/);
  const title = splitMatch ? splitMatch[1].trim() : cleaned.trim();
  const description = splitMatch ? splitMatch[2].trim() : "";
  return {
    type,
    title: title.slice(0, 280),
    description,
    project: detectProject(bullet),
    priority: detectPriority(bullet),
    source_section: source,
  };
}

export function parseBriefing(raw: string): ParsedBriefing {
  const result: ParsedBriefing = {
    overview: "",
    executive_signals: "",
    priority_actions: [],
    follow_ups: [],
    project_updates: [],
    strategic_insights: [],
    open_questions: [],
    parked_ideas: [],
  };

  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  let currentKey: keyof ParsedBriefing | "skip" | null = null;
  let currentSourceLabel = "";
  let buffer: string[] = [];
  let currentProject: ProjectUpdate | null = null;
  let projectSubMode: "updates" | "next_steps" | null = null;

  const flushTextBuffer = () => {
    if (!currentKey || currentKey === "skip") {
      buffer = [];
      return;
    }
    const text = buffer.join("\n").trim();
    if (!text) {
      buffer = [];
      return;
    }
    if (currentKey === "overview" || currentKey === "executive_signals") {
      result[currentKey] = (result[currentKey] ? result[currentKey] + "\n\n" : "") + text;
    }
    buffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    if (isHeading(line)) {
      flushTextBuffer();
      const heading = stripHeading(line).toLowerCase();
      const matched = Object.keys(SECTION_ALIASES).find((k) =>
        heading === k || heading.startsWith(k),
      );
      if (matched) {
        currentKey = SECTION_ALIASES[matched];
        currentSourceLabel = stripHeading(line);
        currentProject = null;
        projectSubMode = null;
      } else if (currentKey === "project_updates") {
        // Sub-heading inside Project Updates → project name OR Updates/Next Steps
        const sub = heading;
        if (/^next steps?/.test(sub)) {
          projectSubMode = "next_steps";
        } else if (/^updates?/.test(sub)) {
          projectSubMode = "updates";
        } else {
          currentProject = { project: stripHeading(line), updates: [], next_steps: [] };
          result.project_updates.push(currentProject);
          projectSubMode = "updates";
        }
      } else {
        currentKey = "skip";
      }
      continue;
    }

    if (!currentKey || currentKey === "skip") continue;

    if (isBullet(line)) {
      const item = stripBullet(line);
      if (!item) continue;
      switch (currentKey) {
        case "priority_actions":
          result.priority_actions.push(parseBulletAsSuggestion(item, "priority_action", currentSourceLabel));
          break;
        case "follow_ups":
          result.follow_ups.push(parseBulletAsSuggestion(item, "follow_up", currentSourceLabel));
          break;
        case "strategic_insights":
          result.strategic_insights.push(parseBulletAsSuggestion(item, "insight", currentSourceLabel));
          break;
        case "open_questions":
          result.open_questions.push(parseBulletAsSuggestion(item, "question", currentSourceLabel));
          break;
        case "parked_ideas":
          result.parked_ideas.push(parseBulletAsSuggestion(item, "idea", currentSourceLabel));
          break;
        case "project_updates":
          if (!currentProject) {
            currentProject = { project: "General", updates: [], next_steps: [] };
            result.project_updates.push(currentProject);
            projectSubMode = "updates";
          }
          if (projectSubMode === "next_steps") currentProject.next_steps.push(item);
          else currentProject.updates.push(item);
          break;
        case "overview":
        case "executive_signals":
          buffer.push("• " + item);
          break;
      }
      continue;
    }

    // Plain text line
    buffer.push(line);
  }

  flushTextBuffer();

  return result;
}