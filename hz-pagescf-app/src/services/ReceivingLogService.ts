import { ReceivingLog } from '../types';
import { apiRequest } from './api';

// Interface for receiving log with snake_case for backend
interface ReceivingLogBackend {
  id?: number;
  lotcode: string;
  company_name: string;
  item_name: string;
  temperature: string;
  date: string;
  general_ingredient_id?: number | null;
  org_id: number;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const toCamelCase = (log: ReceivingLogBackend): ReceivingLog => ({
  id: log.id,
  lotcode: log.lotcode,
  company_name: log.company_name,
  item_name: log.item_name,
  temperature: log.temperature,
  date: log.date,
  general_ingredient_id: log.general_ingredient_id,
  org_id: log.org_id
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const toSnakeCase = (log: ReceivingLog): ReceivingLogBackend => ({
  id: log.id,
  lotcode: log.lotcode,
  company_name: log.company_name,
  item_name: log.item_name,
  temperature: log.temperature,
  date: log.date ? log.date.split('T')[0] : log.date,
  general_ingredient_id: log.general_ingredient_id || null, // Ensure it's explicitly null if undefined
  org_id: log.org_id
});

// ReceivingLog service
export const receivingLogApi = {
  // Get all receiving logs
  getAll: async (): Promise<ReceivingLog[]> => {
    try {
      const response = await apiRequest<ReceivingLogBackend[]>('/receivinglogs');
      return response.map(toCamelCase);
    } catch (error) {
      console.error('Error fetching receiving logs:', error);
      throw error;
    }
  },

  // Get receiving log by ID
  getById: async (id: number): Promise<ReceivingLog> => {
    try {
      const response = await apiRequest<ReceivingLogBackend>(`/receivinglogs/${id}`);
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error fetching receiving log ${id}:`, error);
      throw error;
    }
  },

  // Create new receiving log
  create: async (receivingLog: Omit<ReceivingLog, 'id'>): Promise<ReceivingLog> => {
    try {
      const backendLog = toSnakeCase(receivingLog as ReceivingLog);
      const response = await apiRequest<ReceivingLogBackend>(
        '/receivinglogs', 
        {
          method: 'POST',
          body: JSON.stringify(backendLog)
        }
      );
      return toCamelCase(response);
    } catch (error) {
      console.error('Error creating receiving log:', error);
      throw error;
    }
  },


  // Update receiving log
  update: async (receivingLog: ReceivingLog): Promise<ReceivingLog> => {
    if (!receivingLog.id) {
      throw new Error('Receiving Log ID is required for update');
    }
    
    try {
      const backendLog = toSnakeCase(receivingLog);
      const response = await apiRequest<ReceivingLogBackend>(
        `/receivinglogs/${receivingLog.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendLog)
        }
      );
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error updating receiving log ${receivingLog.id}:`, error);
      throw error;
    }
  },

  // Delete receiving log
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/receivinglogs/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting receiving log ${id}:`, error);
      throw error;
    }
  },

  // Get receiving logs by general ingredient ID
  getByGeneralIngredientId: async (generalIngredientId: number): Promise<ReceivingLog[]> => {
    try {
      const response = await apiRequest<ReceivingLogBackend[]>(`/receivinglogs/general/${generalIngredientId}`);
      return response.map(toCamelCase);
    } catch (error) {
      console.error(`Error fetching receiving logs for general ingredient ${generalIngredientId}:`, error);
      throw error;
    }
  }
};