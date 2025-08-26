import { Task } from "@/types/task";

export interface AIResponse {
  response: string;
}

export class AIService {
  private static async callAIFunction(action: string, tasks?: Task[], taskDescription?: string): Promise<string> {
    console.log('AIService: Starting call with action:', action);
    console.log('AIService: Tasks count:', tasks?.length || 0);
    
    try {
      const url = `${window.location.origin}/supabase/functions/v1/ai-task-helper`;
      console.log('AIService: Calling URL:', url);
      
      const requestBody = {
        action,
        tasks,
        taskDescription,
      };
      console.log('AIService: Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AIService: Response status:', response.status);
      console.log('AIService: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AIService: Error response text:', errorText);
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const data: AIResponse = await response.json();
      console.log('AIService: Success response:', data);
      return data.response;
    } catch (error) {
      console.error('AIService: Full error details:', error);
      if (error instanceof Error) {
        console.error('AIService: Error message:', error.message);
        console.error('AIService: Error stack:', error.stack);
      }
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