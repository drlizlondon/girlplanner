import { Task } from "@/types/task";
import {
  initStore,
  TasksStore,
  IdeasStore,
  OppStore,
  PeopleStore,
  TaskTypesStore,
} from "./localStore";

/**
 * Founder OS is local-first. This service preserves the previous async
 * API surface so existing hooks/pages keep working, but every call now
 * reads/writes localStorage via the namespaced stores in localStore.ts.
 *
 * Cloud sync is intentionally not wired here in this pass.
 */
export class DataService {
  private static instance: DataService;
  private initialised = false;

  static getInstance(): DataService {
    if (!DataService.instance) DataService.instance = new DataService();
    return DataService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialised) return;
    initStore();
    this.initialised = true;
  }

  async isUserAuthenticated(): Promise<boolean> {
    return false;
  }

  getStorageType(): "local" | "supabase" {
    return "local";
  }

  // ---- Tasks ----
  async getTasks() { return TasksStore.all(); }
  async addTask(title: string) { return TasksStore.add(title); }
  async updateTask(id: string, patch: Partial<any>) { return TasksStore.update(id, patch); }
  async completeTask(id: string) { return TasksStore.complete(id); }
  async deleteTask(id: string) { return TasksStore.remove(id); }
  async getCompletedTasks() { return TasksStore.completed(); }
  async deleteCompletedTask(id: string) { return TasksStore.removeCompleted(id); }
  async revertTask(id: string) { return TasksStore.revert(id); }
  async getTaskTypes() { return TaskTypesStore.all(); }

  // ---- Ideas ----
  async getIdeas() { return IdeasStore.all(); }
  async addIdea(title: string) { return IdeasStore.add(title); }
  async updateIdea(id: string, patch: Partial<any>) { return IdeasStore.update(id, patch); }
  async deleteIdea(id: string) { return IdeasStore.remove(id); }

  // ---- Contacts / People ----
  async getContacts() { return PeopleStore.all(); }
  async addContact(name: string, comments?: string) { return PeopleStore.add(name, comments || ""); }
  async updateContact(id: string, patch: Partial<any>) { return PeopleStore.update(id, patch); }
  async markContactAsContacted(id: string) { return PeopleStore.markContacted(id); }
  async deleteContact(id: string) { return PeopleStore.remove(id); }
  async getContactHistory() { return PeopleStore.history(); }
  async deleteContactHistory(id: string) { return PeopleStore.removeHistory(id); }

  // ---- Opportunities ----
  async getOpportunities() { return OppStore.all(); }
  async addOpportunity(title: string, deadline?: string, details?: string) {
    return OppStore.add(title, deadline, details);
  }
  async updateOpportunity(id: string, patch: Partial<any>) { return OppStore.update(id, patch); }
  async deleteOpportunity(id: string) { return OppStore.remove(id); }

  // ---- Auth (no-op stubs for legacy callers) ----
  async signIn(_email: string, _password: string) {
    return { data: null, error: new Error("Founder OS is local-only. Sign in is disabled.") };
  }
  async signUp(_email: string, _password: string) {
    return { data: null, error: new Error("Founder OS is local-only. Sign up is disabled.") };
  }
  async signOut() { return { error: null }; }
}

export const dataService = DataService.getInstance();
