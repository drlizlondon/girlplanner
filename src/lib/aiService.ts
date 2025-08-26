import { Task } from "@/types/task";

export interface AIResponse {
  response: string;
}

export class AIService {
  private static async callAIFunction(action: string, tasks?: Task[], taskDescription?: string): Promise<string> {
    try {
      const response = await fetch('/supabase/functions/v1/ai-task-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          tasks,
          taskDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI assistance. Please try again.');
    }
  }

  static async prioritizeTasks(tasks: Task[]): Promise<string> {
    return this.callAIFunction('prioritize', tasks);
  }

  static async suggestTasks(tasks: Task[]): Promise<string> {
    return this.callAIFunction('suggest', tasks);
  }

  static async getTaskHelp(taskDescription: string): Promise<string> {
    return this.callAIFunction('assist', undefined, taskDescription);
  }
}