import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { localStorageAPI, initializeLocalStorage } from "./localStorage";

// Data service that automatically switches between localStorage and Supabase
export class DataService {
  private static instance: DataService;
  private isAuthenticated = false;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async initialize(): Promise<void> {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    this.isAuthenticated = !!user;
    
    // If not authenticated, initialize localStorage
    if (!this.isAuthenticated) {
      initializeLocalStorage();
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    this.isAuthenticated = !!user;
    return this.isAuthenticated;
  }

  // Task operations that auto-switch between storage methods
  async getTasks(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getTasks();
    }
  }

  async addTask(title: string): Promise<any> {
    if (this.isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title,
          type: '_none',
          priority: 'low',
          additional_info: '',
          thoughts: '',
          completed: false,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.addTask(title);
    }
  }

  async updateTask(taskId: string, updates: Partial<any>): Promise<any> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.updateTask(taskId, updates);
    }
  }

  async completeTask(taskId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.completeTask(taskId);
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteTask(taskId);
    }
  }

  async getCompletedTasks(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', true)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getCompletedTasks();
    }
  }

  async deleteCompletedTask(taskId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteCompletedTask(taskId);
    }
  }

  async revertTask(taskId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: false, 
          completed_at: null 
        })
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.revertTask(taskId);
    }
  }

  async getTaskTypes(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('task_types')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getTaskTypes();
    }
  }

  async getIdeas(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getIdeas();
    }
  }

  async addIdea(title: string): Promise<any> {
    if (this.isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('ideas')
        .insert([{ title, details: '', user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.addIdea(title);
    }
  }

  async updateIdea(ideaId: string, updates: Partial<any>): Promise<any> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('ideas')
        .update(updates)
        .eq('id', ideaId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.updateIdea(ideaId, updates);
    }
  }

  async deleteIdea(ideaId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteIdea(ideaId);
    }
  }

  // Contact operations
  async getContacts(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('contacts')
        .select('*')
        .eq('contacted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getContacts();
    }
  }

  async addContact(name: string, comments?: string): Promise<any> {
    if (this.isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('contacts')
        .insert([{ name, comments: comments || '', contacted: false, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.addContact(name, comments);
    }
  }

  async updateContact(contactId: string, updates: Partial<any>): Promise<any> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.updateContact(contactId, updates);
    }
  }

  async markContactAsContacted(contactId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      // Get the contact first
      const { data: contact, error: fetchError } = await (supabase as any)
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Add to history
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error: historyError } = await (supabase as any)
        .from('contact_history')
        .insert([{
          user_id: user.id,
          name: contact.name,
          comments: contact.comments,
          created_at: contact.created_at
        }]);
      
      if (historyError) throw historyError;
      
      // Delete from contacts
      const { error: deleteError } = await (supabase as any)
        .from('contacts')
        .delete()
        .eq('id', contactId);
      
      if (deleteError) throw deleteError;
      return true;
    } else {
      return localStorageAPI.markContactAsContacted(contactId);
    }
  }

  async deleteContact(contactId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await (supabase as any)
        .from('contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteContact(contactId);
    }
  }

  async getContactHistory(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('contact_history')
        .select('*')
        .order('contacted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getContactHistory();
    }
  }

  async deleteContactHistory(historyId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await (supabase as any)
        .from('contact_history')
        .delete()
        .eq('id', historyId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteContactHistory(historyId);
    }
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      this.isAuthenticated = true;
    }
    
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    this.isAuthenticated = false;
    return { error };
  }

  getStorageType(): 'local' | 'supabase' {
    return this.isAuthenticated ? 'supabase' : 'local';
  }

  // Opportunity operations
  async getOpportunities(): Promise<any[]> {
    if (this.isAuthenticated) {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return localStorageAPI.getOpportunities();
    }
  }

  async addOpportunity(title: string, deadline_date?: string, details?: string): Promise<any> {
    if (this.isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{
          title,
          deadline_date: deadline_date || null,
          details: details || null,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.addOpportunity(title, deadline_date, details);
    }
  }

  async updateOpportunity(opportunityId: string, updates: Partial<any>): Promise<any> {
    if (this.isAuthenticated) {
      const { data, error } = await (supabase as any)
        .from('opportunities')
        .update(updates)
        .eq('id', opportunityId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return localStorageAPI.updateOpportunity(opportunityId, updates);
    }
  }

  async deleteOpportunity(opportunityId: string): Promise<boolean> {
    if (this.isAuthenticated) {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);
      
      if (error) throw error;
      return true;
    } else {
      return localStorageAPI.deleteOpportunity(opportunityId);
    }
  }
}

export const dataService = DataService.getInstance();