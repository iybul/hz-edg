import { Task, Checklist } from '../types';
import { apiRequest } from './api';

// Interface for task with snake_case for backend (if needed)
interface TaskBackend {
  id?: number;
  name: string;
  description: string;
  org_id: number;
  completed: boolean;
}

// Interface for checklist with snake_case for backend (if needed)
interface ChecklistBackend {
  id?: number;
  tasks: number[];
  interval: number;
  org_id: number;
  completed: boolean;
}

// Helper functions to convert between snake_case and camelCase if needed
// In this case, the properties match so these are simple pass-throughs
const taskToCamelCase = (task: TaskBackend): Task => task as unknown as Task;
const taskToSnakeCase = (task: Task): TaskBackend => task as unknown as TaskBackend;
const checklistToCamelCase = (checklist: ChecklistBackend): Checklist => checklist as unknown as Checklist;
const checklistToSnakeCase = (checklist: Checklist): ChecklistBackend => checklist as unknown as ChecklistBackend;

// Task API
export const taskApi = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    try {
      const response = await apiRequest<TaskBackend[]>('/tasks');
      return response.map(taskToCamelCase);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get task by ID
  getById: async (id: number): Promise<Task> => {
    try {
      const response = await apiRequest<TaskBackend>(`/tasks/${id}`);
      return taskToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  // Create new task
  create: async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
      console.log('Creating task with data:', task);
      const backendTask = taskToSnakeCase(task as Task);
      const response = await apiRequest<TaskBackend>(
        '/tasks',
        {
          method: 'POST',
          body: JSON.stringify(backendTask)
        }
      );
      return taskToCamelCase(response);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  update: async (task: Task): Promise<Task> => {
    if (!task.id) {
      throw new Error('Task ID is required for update');
    }
    
    try {
      console.log('Updating task with data:', task);
      const backendTask = taskToSnakeCase(task);
      const response = await apiRequest<TaskBackend>(
        `/tasks/${task.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendTask)
        }
      );
      return taskToCamelCase(response);
    } catch (error) {
      console.error(`Error updating task ${task.id}:`, error);
      throw error;
    }
  },

  // Delete task
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/tasks/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }
};

// Checklist API
export const checklistApi = {
  // Get all checklists
  getAll: async (): Promise<Checklist[]> => {
    try {
      const response = await apiRequest<ChecklistBackend[]>('/checklists');
      return response.map(checklistToCamelCase);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      throw error;
    }
  },

  // Get checklist by ID
  getById: async (id: number): Promise<Checklist> => {
    try {
      const response = await apiRequest<ChecklistBackend>(`/checklists/${id}`);
      return checklistToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching checklist ${id}:`, error);
      throw error;
    }
  },

  // Create new checklist
  create: async (checklist: Omit<Checklist, 'id'>): Promise<Checklist> => {
    try {
      console.log('Creating checklist with data:', checklist);
      const backendChecklist = checklistToSnakeCase(checklist as Checklist);
      const response = await apiRequest<ChecklistBackend>(
        '/checklists',
        {
          method: 'POST',
          body: JSON.stringify(backendChecklist)
        }
      );
      return checklistToCamelCase(response);
    } catch (error) {
      console.error('Error creating checklist:', error);
      throw error;
    }
  },

  // Update checklist
  update: async (checklist: Checklist): Promise<Checklist> => {
    if (!checklist.id) {
      throw new Error('Checklist ID is required for update');
    }
    
    try {
      console.log('Updating checklist with data:', checklist);
      const backendChecklist = checklistToSnakeCase(checklist);
      const response = await apiRequest<ChecklistBackend>(
        `/checklists/${checklist.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendChecklist)
        }
      );
      return checklistToCamelCase(response);
    } catch (error) {
      console.error(`Error updating checklist ${checklist.id}:`, error);
      throw error;
    }
  },

  // Delete checklist
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/checklists/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting checklist ${id}:`, error);
      throw error;
    }
  },
  
  // Get today's checklists 
  getTodayChecklists: async (): Promise<Checklist[]> => {
    try {
      const checklists = await checklistApi.getAll();
      
      // Filter checklists based on interval (daily=1, weekly=7, monthly=30)
      const today = new Date();
      const dayOfMonth = today.getDate();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      return checklists.filter(checklist => {
        // Daily checklists
        if (checklist.interval === 1) return true;
        
        // Weekly checklists (show on Mondays)
        if (checklist.interval === 7 && dayOfWeek === 1) return true;
        
        // Monthly checklists (show on 1st of month)
        if (checklist.interval === 30 && dayOfMonth === 1) return true;
        
        return false;
      });
    } catch (error) {
      console.error('Error fetching today\'s checklists:', error);
      throw error;
    }
  }
};