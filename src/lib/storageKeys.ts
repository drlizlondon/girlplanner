export const SK = {
  theme: "founderOS.theme",
  tasks: "founderOS.tasks",
  completedTasks: "founderOS.completedTasks",
  ideas: "founderOS.ideas",
  opportunities: "founderOS.opportunities",
  people: "founderOS.people",
  peopleHistory: "founderOS.peopleHistory",
  projects: "founderOS.projects",
  processingInbox: "founderOS.processingInbox",
  archive: "founderOS.archive",
  chatgptExports: "founderOS.chatgptExports",
  chatgptImports: "founderOS.chatgptImports",
  pendingSuggestions: "founderOS.pendingSuggestions",
  acceptedSuggestions: "founderOS.acceptedSuggestions",
  archivedSuggestions: "founderOS.archivedSuggestions",
  lastExport: "founderOS.lastExport",
  taskTypes: "founderOS.taskTypes",
} as const;

export type StorageKey = typeof SK[keyof typeof SK];

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("storage write failed", key, e);
  }
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}