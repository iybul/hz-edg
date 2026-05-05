import { Batch } from '../types';
import { apiRequest } from './api';

// Interface for batch with snake_case for backend
interface BatchBackend {
  id?: number;
  org_id: number;
  employee: string;
  recipecode: string; // Updated from recipe_lotcode
  batch_lot_code: string;
  ingredient_lotcodes: string[]; // Updated from ingredients
  amount_ingredients: number[];
  date_made: string;
  amount_made: string;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const batchToCamelCase = (batch: BatchBackend): Batch => ({
  id: batch.id,
  org_id: batch.org_id,
  employee: batch.employee,
  recipecode: batch.recipecode,
  batch_lot_code: batch.batch_lot_code,
  ingredient_lotcodes: batch.ingredient_lotcodes,
  amount_ingredients: batch.amount_ingredients,
  date_made: batch.date_made,
  amount_made: batch.amount_made
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const batchToSnakeCase = (batch: Batch): BatchBackend => ({
  id: batch.id,
  org_id: batch.org_id,
  employee: batch.employee,
  recipecode: batch.recipecode,
  batch_lot_code: batch.batch_lot_code,
  ingredient_lotcodes: batch.ingredient_lotcodes,
  amount_ingredients: batch.amount_ingredients,
  date_made: batch.date_made,
  amount_made: batch.amount_made
});

// Batch API
export const batchApi = {
  // Get all batches
  getAll: async (): Promise<Batch[]> => {
    try {
      const response = await apiRequest<BatchBackend[]>('/batches');
      return response.map(batchToCamelCase);
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Get batch by ID
  getById: async (id: number): Promise<Batch> => {
    try {
      const response = await apiRequest<BatchBackend>(`/batches/${id}`);
      return batchToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching batch ${id}:`, error);
      throw error;
    }
  },

  // Create new batch
  create: async (batch: Omit<Batch, 'id'>): Promise<Batch> => {
    try {
      console.log('Creating batch with data:', batch);
      const backendBatch = batchToSnakeCase(batch as Batch);
      const response = await apiRequest<BatchBackend>(
        '/batches',
        {
          method: 'POST',
          body: JSON.stringify(backendBatch)
        }
      );
      return batchToCamelCase(response);
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update batch
  update: async (batch: Batch): Promise<Batch> => {
    if (!batch.id) {
      throw new Error('Batch ID is required for update');
    }
    
    try {
      console.log('Updating batch with data:', batch);
      const backendBatch = batchToSnakeCase(batch);
      const response = await apiRequest<BatchBackend>(
        `/batches/${batch.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendBatch)
        }
      );
      return batchToCamelCase(response);
    } catch (error) {
      console.error(`Error updating batch ${batch.id}:`, error);
      throw error;
    }
  },

  // Delete batch
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/batches/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting batch ${id}:`, error);
      throw error;
    }
  }
};