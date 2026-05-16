import { SK, readJSON, writeJSON, uid, nowISO } from "./storageKeys";

export interface LTask {
  id: string;
  title: string;
  type: string;
  priority: "low" | "medium" | "high";
  additional_info: string;
  thoughts: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  project?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface LIdea {
  id: string;
  title: string;
  details: string | null;
  created_at: string;
  archived?: boolean;
}

export interface LOpportunity {
  id: string;
  title: string;
  deadline_date: string | null;
  details: string | null;
  created_at: string;
  updated_at: string;
  archived?: boolean;
}

export interface LPerson {
  id: string;
  name: string;
  comments: string;
  contacted: boolean;
  created_at: string;
}

export interface LPersonHistory {
  id: string;
  name: string;
  comments: string;
  contacted_at: string;
  created_at: string;
}

export interface LProject {
  id: string;
  name: string;
  notes: string;
  status: "active" | "archived";
  created_at: string;
}

export interface LSuggestion {
  id: string;
  task_id?: string | null;
  original_task_title?: string | null;
  type: string; // priority_action | follow_up | insight | question | idea | next_action | decision | draft | research | admin | project_note
  title: string;
  description: string;
  recommendation?: string;
  next_actions?: string;
  draft_text?: string;
  target_section?: string;
  source: "briefing" | "chatgpt_import" | "manual";
  status: "pending" | "accepted" | "archived";
  priority?: string | null;
  project?: string | null;
  briefing_id?: string | null;
  created_at: string;
}

export interface LBriefing {
  id: string;
  briefing_date: string; // YYYY-MM-DD
  raw_text: string;
  overview: string | null;
  executive_signals: string | null;
  project_updates: any[];
  strategic_insights: any[];
  open_questions: any[];
  parked_ideas: any[];
  created_at: string;
}

export interface LChatExport {
  id: string;
  created_at: string;
  task_count: number;
  content: string;
}

export interface LChatImport {
  id: string;
  created_at: string;
  raw_text: string;
  parsed: boolean;
  suggestion_count: number;
}

const DEFAULT_TASK_TYPES = [
  { id: uid(), value: "Personal" },
  { id: uid(), value: "Work" },
  { id: uid(), value: "Health" },
  { id: uid(), value: "Finance" },
  { id: uid(), value: "Education" },
];

export function initStore() {
  if (!localStorage.getItem(SK.taskTypes)) writeJSON(SK.taskTypes, DEFAULT_TASK_TYPES);
  for (const k of [
    SK.tasks, SK.completedTasks, SK.ideas, SK.opportunities, SK.people, SK.peopleHistory,
    SK.projects, SK.processingInbox, SK.archive, SK.chatgptExports, SK.chatgptImports,
    SK.pendingSuggestions, SK.acceptedSuggestions, SK.archivedSuggestions,
  ]) {
    if (!localStorage.getItem(k)) writeJSON(k, []);
  }
}

// --- generic helpers ---
function list<T>(k: string) { return readJSON<T[]>(k, []); }
function save<T>(k: string, v: T[]) { writeJSON(k, v); }

// --- Tasks ---
export const TasksStore = {
  all: () => list<LTask>(SK.tasks),
  add: (title: string): LTask => {
    const t: LTask = {
      id: uid(), title, type: "_none", priority: "low", additional_info: "",
      thoughts: "", due_date: null, completed: false, completed_at: null,
      created_at: nowISO(),
    };
    save(SK.tasks, [t, ...list<LTask>(SK.tasks)]);
    return t;
  },
  update: (id: string, patch: Partial<LTask>): LTask | null => {
    const items = list<LTask>(SK.tasks);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch };
    save(SK.tasks, items);
    return items[i];
  },
  complete: (id: string): boolean => {
    const items = list<LTask>(SK.tasks);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return false;
    const done = { ...items[i], completed: true, completed_at: nowISO() };
    items.splice(i, 1);
    save(SK.tasks, items);
    save(SK.completedTasks, [done, ...list<LTask>(SK.completedTasks)]);
    return true;
  },
  remove: (id: string): boolean => {
    const items = list<LTask>(SK.tasks);
    const next = items.filter((x) => x.id !== id);
    if (next.length === items.length) return false;
    save(SK.tasks, next);
    return true;
  },
  completed: () => list<LTask>(SK.completedTasks),
  removeCompleted: (id: string) => {
    const items = list<LTask>(SK.completedTasks).filter((x) => x.id !== id);
    save(SK.completedTasks, items);
    return true;
  },
  revert: (id: string): boolean => {
    const c = list<LTask>(SK.completedTasks);
    const i = c.findIndex((x) => x.id === id);
    if (i === -1) return false;
    const t = { ...c[i], completed: false, completed_at: null };
    c.splice(i, 1);
    save(SK.completedTasks, c);
    save(SK.tasks, [t, ...list<LTask>(SK.tasks)]);
    return true;
  },
};

// --- Ideas ---
export const IdeasStore = {
  all: () => list<LIdea>(SK.ideas).filter((i) => !i.archived),
  archived: () => list<LIdea>(SK.ideas).filter((i) => i.archived),
  add: (title: string, details = ""): LIdea => {
    const i: LIdea = { id: uid(), title, details, created_at: nowISO() };
    save(SK.ideas, [i, ...list<LIdea>(SK.ideas)]);
    return i;
  },
  update: (id: string, patch: Partial<LIdea>): LIdea | null => {
    const items = list<LIdea>(SK.ideas);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch };
    save(SK.ideas, items);
    return items[i];
  },
  remove: (id: string) => {
    save(SK.ideas, list<LIdea>(SK.ideas).filter((x) => x.id !== id));
    return true;
  },
};

// --- Opportunities ---
export const OppStore = {
  all: () => list<LOpportunity>(SK.opportunities).filter((o) => !o.archived),
  archived: () => list<LOpportunity>(SK.opportunities).filter((o) => o.archived),
  add: (title: string, deadline_date?: string, details?: string): LOpportunity => {
    const o: LOpportunity = {
      id: uid(), title, deadline_date: deadline_date || null,
      details: details || null, created_at: nowISO(), updated_at: nowISO(),
    };
    save(SK.opportunities, [o, ...list<LOpportunity>(SK.opportunities)]);
    return o;
  },
  update: (id: string, patch: Partial<LOpportunity>): LOpportunity | null => {
    const items = list<LOpportunity>(SK.opportunities);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch, updated_at: nowISO() };
    save(SK.opportunities, items);
    return items[i];
  },
  remove: (id: string) => {
    save(SK.opportunities, list<LOpportunity>(SK.opportunities).filter((x) => x.id !== id));
    return true;
  },
};

// --- People ---
export const PeopleStore = {
  all: () => list<LPerson>(SK.people).filter((p) => !p.contacted),
  add: (name: string, comments = ""): LPerson => {
    const p: LPerson = { id: uid(), name, comments, contacted: false, created_at: nowISO() };
    save(SK.people, [p, ...list<LPerson>(SK.people)]);
    return p;
  },
  update: (id: string, patch: Partial<LPerson>) => {
    const items = list<LPerson>(SK.people);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch };
    save(SK.people, items);
    return items[i];
  },
  markContacted: (id: string): boolean => {
    const items = list<LPerson>(SK.people);
    const p = items.find((x) => x.id === id);
    if (!p) return false;
    const h: LPersonHistory = {
      id: uid(), name: p.name, comments: p.comments,
      contacted_at: nowISO(), created_at: p.created_at,
    };
    save(SK.peopleHistory, [h, ...list<LPersonHistory>(SK.peopleHistory)]);
    save(SK.people, items.filter((x) => x.id !== id));
    return true;
  },
  remove: (id: string) => {
    save(SK.people, list<LPerson>(SK.people).filter((x) => x.id !== id));
    return true;
  },
  history: () => list<LPersonHistory>(SK.peopleHistory),
  removeHistory: (id: string) => {
    save(SK.peopleHistory, list<LPersonHistory>(SK.peopleHistory).filter((x) => x.id !== id));
    return true;
  },
};

// --- Projects ---
export const ProjectsStore = {
  all: () => list<LProject>(SK.projects).filter((p) => p.status === "active"),
  archived: () => list<LProject>(SK.projects).filter((p) => p.status === "archived"),
  add: (name: string, notes = ""): LProject => {
    const p: LProject = { id: uid(), name, notes, status: "active", created_at: nowISO() };
    save(SK.projects, [p, ...list<LProject>(SK.projects)]);
    return p;
  },
  update: (id: string, patch: Partial<LProject>) => {
    const items = list<LProject>(SK.projects);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch };
    save(SK.projects, items);
    return items[i];
  },
  remove: (id: string) => {
    save(SK.projects, list<LProject>(SK.projects).filter((x) => x.id !== id));
    return true;
  },
};

// --- Suggestions ---
export const SuggestionsStore = {
  pending: () => list<LSuggestion>(SK.pendingSuggestions),
  accepted: () => list<LSuggestion>(SK.acceptedSuggestions),
  archived: () => list<LSuggestion>(SK.archivedSuggestions),
  addPending: (s: Omit<LSuggestion, "id" | "created_at" | "status">): LSuggestion => {
    const row: LSuggestion = { ...s, id: uid(), created_at: nowISO(), status: "pending" };
    save(SK.pendingSuggestions, [row, ...list<LSuggestion>(SK.pendingSuggestions)]);
    return row;
  },
  addPendingMany: (items: Omit<LSuggestion, "id" | "created_at" | "status">[]) => {
    const rows: LSuggestion[] = items.map((s) => ({ ...s, id: uid(), created_at: nowISO(), status: "pending" }));
    save(SK.pendingSuggestions, [...rows, ...list<LSuggestion>(SK.pendingSuggestions)]);
    return rows;
  },
  update: (id: string, patch: Partial<LSuggestion>) => {
    const items = list<LSuggestion>(SK.pendingSuggestions);
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    items[i] = { ...items[i], ...patch };
    save(SK.pendingSuggestions, items);
    return items[i];
  },
  accept: (id: string) => {
    const items = list<LSuggestion>(SK.pendingSuggestions);
    const s = items.find((x) => x.id === id);
    if (!s) return null;
    const updated = { ...s, status: "accepted" as const };
    save(SK.pendingSuggestions, items.filter((x) => x.id !== id));
    save(SK.acceptedSuggestions, [updated, ...list<LSuggestion>(SK.acceptedSuggestions)]);
    return updated;
  },
  archive: (id: string) => {
    const items = list<LSuggestion>(SK.pendingSuggestions);
    const s = items.find((x) => x.id === id);
    if (!s) return null;
    const updated = { ...s, status: "archived" as const };
    save(SK.pendingSuggestions, items.filter((x) => x.id !== id));
    save(SK.archivedSuggestions, [updated, ...list<LSuggestion>(SK.archivedSuggestions)]);
    return updated;
  },
  remove: (id: string) => {
    for (const k of [SK.pendingSuggestions, SK.acceptedSuggestions, SK.archivedSuggestions]) {
      save(k, list<LSuggestion>(k).filter((x) => x.id !== id));
    }
    return true;
  },
};

// --- Briefings ---
export const BriefingsStore = {
  all: () => list<LBriefing>(SK.processingInbox),
  add: (raw_text: string, parsed: Partial<LBriefing>): LBriefing => {
    const b: LBriefing = {
      id: uid(),
      briefing_date: new Date().toISOString().slice(0, 10),
      raw_text,
      overview: parsed.overview || null,
      executive_signals: parsed.executive_signals || null,
      project_updates: parsed.project_updates || [],
      strategic_insights: parsed.strategic_insights || [],
      open_questions: parsed.open_questions || [],
      parked_ideas: parsed.parked_ideas || [],
      created_at: nowISO(),
    };
    save(SK.processingInbox, [b, ...list<LBriefing>(SK.processingInbox)]);
    return b;
  },
  remove: (id: string) => {
    save(SK.processingInbox, list<LBriefing>(SK.processingInbox).filter((x) => x.id !== id));
    return true;
  },
};

// --- ChatGPT exports / imports ---
export const ChatGPTStore = {
  exports: () => list<LChatExport>(SK.chatgptExports),
  saveExport: (content: string, task_count: number): LChatExport => {
    const e: LChatExport = { id: uid(), created_at: nowISO(), task_count, content };
    save(SK.chatgptExports, [e, ...list<LChatExport>(SK.chatgptExports)].slice(0, 50));
    return e;
  },
  imports: () => list<LChatImport>(SK.chatgptImports),
  saveImport: (raw_text: string, parsed: boolean, suggestion_count: number): LChatImport => {
    const e: LChatImport = { id: uid(), created_at: nowISO(), raw_text, parsed, suggestion_count };
    save(SK.chatgptImports, [e, ...list<LChatImport>(SK.chatgptImports)].slice(0, 50));
    return e;
  },
};

export const TaskTypesStore = {
  all: () => list<{ id: string; value: string }>(SK.taskTypes),
};