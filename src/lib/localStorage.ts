import { Task } from "@/types/task";

// Local storage keys
const TASKS_KEY = "my-agenda-tasks";
const COMPLETED_TASKS_KEY = "my-agenda-completed-tasks";
const IDEAS_KEY = "my-agenda-ideas";
const TASK_TYPES_KEY = "my-agenda-task-types";
const OPPORTUNITIES_KEY = "my-agenda-opportunities";

// Generate a simple UUID-like ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default task types
const DEFAULT_TASK_TYPES = [
  { id: generateId(), value: "Personal" },
  { id: generateId(), value: "Work" },
  { id: generateId(), value: "Health" },
  { id: generateId(), value: "Finance" },
  { id: generateId(), value: "Education" },
];

// Task interface for local storage
interface LocalTask {
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
}

// Idea interface for local storage
interface LocalIdea {
  id: string;
  title: string;
  details: string | null;
  created_at: string;
}

// Task type interface
interface TaskType {
  id: string;
  value: string;
}

// Opportunity interface for local storage
interface LocalOpportunity {
  id: string;
  title: string;
  deadline_date: string | null;
  details: string | null;
  created_at: string;
  updated_at: string;
}

// Initialize default data
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(TASK_TYPES_KEY)) {
    localStorage.setItem(TASK_TYPES_KEY, JSON.stringify(DEFAULT_TASK_TYPES));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(COMPLETED_TASKS_KEY)) {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(IDEAS_KEY)) {
    localStorage.setItem(IDEAS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(OPPORTUNITIES_KEY)) {
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify([]));
  }
};

// Task operations
export const localStorageAPI = {
  // Tasks
  getTasks: (): LocalTask[] => {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addTask: (title: string): LocalTask => {
    const tasks = localStorageAPI.getTasks();
    const newTask: LocalTask = {
      id: generateId(),
      title,
      type: "_none",
      priority: "low",
      additional_info: "",
      thoughts: "",
      due_date: null,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    
    tasks.unshift(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<LocalTask>): LocalTask | null => {
    const tasks = localStorageAPI.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return tasks[taskIndex];
  },

  completeTask: (taskId: string): boolean => {
    const tasks = localStorageAPI.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return false;
    
    const completedTask = {
      ...tasks[taskIndex],
      completed: true,
      completed_at: new Date().toISOString()
    };
    
    // Remove from active tasks
    tasks.splice(taskIndex, 1);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    
    // Add to completed tasks
    const completedTasks = localStorageAPI.getCompletedTasks();
    completedTasks.unshift(completedTask);
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    
    return true;
  },

  deleteTask: (taskId: string): boolean => {
    const tasks = localStorageAPI.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    if (filteredTasks.length === tasks.length) return false;
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
    return true;
  },

  // Completed tasks
  getCompletedTasks: (): LocalTask[] => {
    const data = localStorage.getItem(COMPLETED_TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteCompletedTask: (taskId: string): boolean => {
    const completedTasks = localStorageAPI.getCompletedTasks();
    const filteredTasks = completedTasks.filter(t => t.id !== taskId);
    
    if (filteredTasks.length === completedTasks.length) return false;
    
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(filteredTasks));
    return true;
  },

  revertTask: (taskId: string): boolean => {
    const completedTasks = localStorageAPI.getCompletedTasks();
    const taskIndex = completedTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return false;
    
    const revertedTask = {
      ...completedTasks[taskIndex],
      completed: false,
      completed_at: null
    };
    
    // Remove from completed tasks
    completedTasks.splice(taskIndex, 1);
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    
    // Add to active tasks
    const tasks = localStorageAPI.getTasks();
    tasks.unshift(revertedTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    
    return true;
  },

  // Task types
  getTaskTypes: (): TaskType[] => {
    const data = localStorage.getItem(TASK_TYPES_KEY);
    return data ? JSON.parse(data) : DEFAULT_TASK_TYPES;
  },

  // Ideas
  getIdeas: (): LocalIdea[] => {
    const data = localStorage.getItem(IDEAS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addIdea: (title: string): LocalIdea => {
    const ideas = localStorageAPI.getIdeas();
    const newIdea: LocalIdea = {
      id: generateId(),
      title,
      details: "",
      created_at: new Date().toISOString(),
    };
    
    ideas.unshift(newIdea);
    localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
    return newIdea;
  },

  updateIdea: (ideaId: string, updates: Partial<LocalIdea>): LocalIdea | null => {
    const ideas = localStorageAPI.getIdeas();
    const ideaIndex = ideas.findIndex(i => i.id === ideaId);
    
    if (ideaIndex === -1) return null;
    
    ideas[ideaIndex] = { ...ideas[ideaIndex], ...updates };
    localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
    return ideas[ideaIndex];
  },

  deleteIdea: (ideaId: string): boolean => {
    const ideas = localStorageAPI.getIdeas();
    const filteredIdeas = ideas.filter(i => i.id !== ideaId);
    
    if (filteredIdeas.length === ideas.length) return false;
    
    localStorage.setItem(IDEAS_KEY, JSON.stringify(filteredIdeas));
    return true;
  },

  // Contact operations
  getContacts: (): any[] => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    return contacts.filter((c: any) => !c.contacted);
  },

  addContact: (name: string, comments?: string): any => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const newContact = {
      id: generateId(),
      name,
      comments: comments || '',
      contacted: false,
      created_at: new Date().toISOString()
    };
    contacts.unshift(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    return newContact;
  },

  updateContact: (contactId: string, updates: any): any => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const updatedContacts = contacts.map((c: any) =>
      c.id === contactId ? { ...c, ...updates } : c
    );
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    return updatedContacts.find((c: any) => c.id === contactId);
  },

  markContactAsContacted: (contactId: string): boolean => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const contact = contacts.find((c: any) => c.id === contactId);
    if (!contact) return false;

    // Add to history
    const history = JSON.parse(localStorage.getItem('contact_history') || '[]');
    history.unshift({
      id: generateId(),
      name: contact.name,
      comments: contact.comments,
      contacted_at: new Date().toISOString(),
      created_at: contact.created_at
    });
    localStorage.setItem('contact_history', JSON.stringify(history));

    // Remove from contacts
    const updatedContacts = contacts.filter((c: any) => c.id !== contactId);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    return true;
  },

  deleteContact: (contactId: string): boolean => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const updatedContacts = contacts.filter((c: any) => c.id !== contactId);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    return true;
  },

  getContactHistory: (): any[] => {
    return JSON.parse(localStorage.getItem('contact_history') || '[]');
  },

  deleteContactHistory: (historyId: string): boolean => {
    const history = JSON.parse(localStorage.getItem('contact_history') || '[]');
    const updatedHistory = history.filter((h: any) => h.id !== historyId);
    localStorage.setItem('contact_history', JSON.stringify(updatedHistory));
    return true;
  },

  // Opportunity operations
  getOpportunities: (): LocalOpportunity[] => {
    const data = localStorage.getItem(OPPORTUNITIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  addOpportunity: (title: string, deadline_date?: string, details?: string): LocalOpportunity => {
    const opportunities = localStorageAPI.getOpportunities();
    const newOpportunity: LocalOpportunity = {
      id: generateId(),
      title,
      deadline_date: deadline_date || null,
      details: details || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    opportunities.unshift(newOpportunity);
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(opportunities));
    return newOpportunity;
  },

  updateOpportunity: (opportunityId: string, updates: Partial<LocalOpportunity>): LocalOpportunity | null => {
    const opportunities = localStorageAPI.getOpportunities();
    const opportunityIndex = opportunities.findIndex(o => o.id === opportunityId);
    
    if (opportunityIndex === -1) return null;
    
    opportunities[opportunityIndex] = { 
      ...opportunities[opportunityIndex], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(opportunities));
    return opportunities[opportunityIndex];
  },

  deleteOpportunity: (opportunityId: string): boolean => {
    const opportunities = localStorageAPI.getOpportunities();
    const filteredOpportunities = opportunities.filter(o => o.id !== opportunityId);
    
    if (filteredOpportunities.length === opportunities.length) return false;
    
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(filteredOpportunities));
    return true;
  }
};