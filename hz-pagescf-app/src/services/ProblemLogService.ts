import { ProblemLog } from '../types';
import { apiRequest, ApiResponse, ApiError } from './api';

// Interface for problem log with snake_case for backend
interface ProblemLogBackend {
  id?: number;
  is_open: boolean;
  date_opened: string;
  customer_name: string;
  problem_type: string;
  assigned_to: number[];
  problem_description: string;
  recall: boolean;
  date_resolved?: string;
  org_id: number;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const toCamelCase = (log: ProblemLogBackend): ProblemLog => ({
  id: log.id,
  isOpen: log.is_open,
  dateOpened: log.date_opened,
  customerName: log.customer_name,
  problemType: log.problem_type,
  assignedTo: log.assigned_to || [],
  problemDescription: log.problem_description,
  recall: log.recall,
  dateResolved: log.date_resolved,
  org_id: log.org_id
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const toSnakeCase = (log: ProblemLog): ProblemLogBackend => ({
  id: log.id,
  is_open: log.isOpen,
  date_opened: log.dateOpened ? log.dateOpened.split('T')[0] : log.dateOpened,
  customer_name: log.customerName,
  problem_type: log.problemType,
  assigned_to: log.assignedTo || [],
  problem_description: log.problemDescription,
  recall: log.recall,
  date_resolved: log.dateResolved ? log.dateResolved.split('T')[0] : log.dateResolved,
  org_id: log.org_id || 0 // Ensure org_id is present
});

// ProblemLog service
export const problemLogApi = {
  // Get all problem logs
  getAll: async (): Promise<ProblemLog[]> => {
    try {
      const response = await apiRequest<ProblemLogBackend[]>('/problemlogs');
      console.log('Raw problem logs response:', response);
      
      // Convert from snake_case to camelCase
      return response.map(toCamelCase);
    } catch (error) {
      console.error('Error fetching problem logs:', error);
      throw error;
    }
  },

  // Get all open problem logs
  getOpenLogs: async (): Promise<ProblemLog[]> => {
    try {
      const logs = await problemLogApi.getAll();
      return logs.filter(log => log.isOpen);
    } catch (error) {
      console.error('Error fetching open problem logs:', error);
      throw error;
    }
  },

  // Get problem log by ID
  getById: async (id: number): Promise<ProblemLog> => {
    try {
      const response = await apiRequest<ProblemLogBackend>(`/problemlogs/${id}`);
      console.log('Raw problem log response:', response);
      
      // Convert from snake_case to camelCase
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error fetching problem log ${id}:`, error);
      throw error;
    }
  },

  // Create new problem log
  create: async (problemLog: Omit<ProblemLog, 'id'>): Promise<ProblemLog> => {
    try {
      // Log the problem log data for debugging
      console.log('Creating problem log with data:', problemLog);
      
      // Convert to backend field names (snake_case)
      const backendProblemLog = toSnakeCase(problemLog as ProblemLog);
      
      console.log('Backend-formatted problem log data:', backendProblemLog);
      
      const response = await apiRequest<ProblemLogBackend>(
        '/problemlogs',
        {
          method: 'POST',
          body: JSON.stringify(backendProblemLog)
        }
      );
      
      console.log('Problem log creation response:', response);
      
      // Convert back to frontend format
      return toCamelCase(response);
    } catch (error) {
      console.error('Error creating problem log:', error);
      throw error;
    }
  },

  // Update problem log
  update: async (problemLog: ProblemLog): Promise<ProblemLog> => {
    if (!problemLog.id) {
      throw new Error('Problem Log ID is required for update');
    }
    
    try {
      // Log the problem log data for debugging
      console.log('Updating problem log with data:', problemLog);
      
      // Convert to backend field names (snake_case)
      const backendProblemLog = toSnakeCase(problemLog);
      
      console.log('Backend-formatted problem log data for update:', backendProblemLog);
      
      const response = await apiRequest<ProblemLogBackend>(
        `/problemlogs/${problemLog.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendProblemLog)
        }
      );
      
      console.log('Problem log update response:', response);
      
      // Convert back to frontend format
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error updating problem log ${problemLog.id}:`, error);
      throw error;
    }
  },

  // Delete problem log
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/problemlogs/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting problem log ${id}:`, error);
      throw error;
    }
  }
};