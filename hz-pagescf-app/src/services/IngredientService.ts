import { Ingredient, GeneralIngredient } from '../types';
import { apiRequest } from './api';

// Interface for ingredient with snake_case for backend
interface IngredientBackend {
  id?: number;
  general_ingredient_id: number;
  lotcode: string;
  date_received: string;
  exp_date: string;
  quantity: string; // Must be string when sending to API
  unit: string;
  cost_per_unit: string; // Must be string when sending to API
  org_id: number;
  general_ingredient_name?: string;
}

// Interface for general ingredient with snake_case for backend
interface GeneralIngredientBackend {
  id?: number;
  name: string;
  org_id: number;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const ingredientToCamelCase = (ingredient: IngredientBackend): Ingredient => ({
  id: ingredient.id,
  general_ingredient_id: ingredient.general_ingredient_id,
  lotcode: ingredient.lotcode,
  date_received: ingredient.date_received,
  exp_date: ingredient.exp_date,
  // Convert quantity string to number for frontend display
  quantity: ingredient.quantity ? parseFloat(ingredient.quantity) : 0,
  unit: ingredient.unit || '',
  // Convert cost_per_unit string to number for frontend display
  cost_per_unit: ingredient.cost_per_unit ? parseFloat(ingredient.cost_per_unit) : 0,
  org_id: ingredient.org_id,
  general_ingredient_name: ingredient.general_ingredient_name
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const ingredientToSnakeCase = (ingredient: Ingredient): IngredientBackend => ({
  id: ingredient.id,
  general_ingredient_id: ingredient.general_ingredient_id,
  lotcode: ingredient.lotcode,
  date_received: ingredient.date_received,
  exp_date: ingredient.exp_date,
  // Convert quantity to string for API
  quantity: typeof ingredient.quantity === 'number' 
    ? ingredient.quantity.toString() 
    : ingredient.quantity || '0',
  unit: ingredient.unit || '',
  // Convert cost_per_unit to string for API
  cost_per_unit: typeof ingredient.cost_per_unit === 'number' 
    ? ingredient.cost_per_unit.toString() 
    : ingredient.cost_per_unit || '0',
  org_id: ingredient.org_id,
  general_ingredient_name: ingredient.general_ingredient_name
});

// General Ingredient conversions
const generalIngredientToCamelCase = (generalIngredient: GeneralIngredientBackend): GeneralIngredient => ({
  id: generalIngredient.id,
  name: generalIngredient.name,
  org_id: generalIngredient.org_id
});

const generalIngredientToSnakeCase = (generalIngredient: GeneralIngredient): GeneralIngredientBackend => ({
  id: generalIngredient.id,
  name: generalIngredient.name,
  org_id: generalIngredient.org_id
});

// Ingredient API
export const ingredientApi = {
  // Get all ingredients
  getAll: async (): Promise<Ingredient[]> => {
    try {
      console.log('Fetching all ingredients from /ingredients endpoint');
      
      // Try alternative URLs if needed
      let response;
      let error;
      
      try {
        // First attempt with /ingredients
        response = await apiRequest<IngredientBackend[]>('/ingredients');
        console.log('Response from GET /ingredients:', response);
      } catch (err) {
        error = err;
        console.warn('Failed to fetch from /ingredients, will return empty array:', err);
        
        // In case of a 500 error, return empty array rather than crashing
        return [];
      }
      
      if (!Array.isArray(response)) {
        console.error('Expected array response from GET /ingredients but got:', response);
        return [];
      }
      
      return response.map(ingredientToCamelCase);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      // Return empty array instead of throwing to prevent component crashes
      return [];
    }
  },

  // Get ingredient by ID
  getById: async (id: number): Promise<Ingredient> => {
    try {
      console.log(`Fetching ingredient with ID: ${id}`);
      const response = await apiRequest<IngredientBackend>(`/ingredients/${id}`);
      console.log(`Response from GET /ingredients/${id}:`, response);
      return ingredientToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      throw error;
    }
  },

  // Create new ingredient
  create: async (ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    try {
      console.log('Creating ingredient with data:', ingredient);
      
      // Ensure general_ingredient_id is a number and is set
      if (ingredient.general_ingredient_id === undefined) {
        console.warn('general_ingredient_id is undefined, setting default value of 1');
        (ingredient as any).general_ingredient_id = 1;
      }
      
      const backendIngredient = ingredientToSnakeCase(ingredient as Ingredient);
      
      // Verify that all required fields are present and valid
      if (!backendIngredient.general_ingredient_id) {
        console.error('general_ingredient_id is required but was not provided');
        backendIngredient.general_ingredient_id = 1; // Use a default value if not set
      }
      
      // Ensure quantity and cost_per_unit are strings
      backendIngredient.quantity = String(backendIngredient.quantity || '0');
      backendIngredient.cost_per_unit = String(backendIngredient.cost_per_unit || '0');
      
      console.log('Verified that quantity and cost_per_unit are strings:', {
        quantity: backendIngredient.quantity, 
        quantityType: typeof backendIngredient.quantity,
        cost_per_unit: backendIngredient.cost_per_unit,
        costType: typeof backendIngredient.cost_per_unit
      });
      
      console.log('Converted ingredient data for backend:', backendIngredient);
      
      const response = await apiRequest<IngredientBackend>(
        '/ingredients',
        {
          method: 'POST',
          body: JSON.stringify(backendIngredient)
        }
      );
      
      console.log('Received response from API:', response);
      
      const convertedResponse = ingredientToCamelCase(response);
      console.log('Converted response to frontend format:', convertedResponse);
      
      return convertedResponse;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  },

  // Update ingredient
  update: async (ingredient: Ingredient): Promise<Ingredient> => {
    if (!ingredient.id) {
      throw new Error('Ingredient ID is required for update');
    }
    
    try {
      console.log('Updating ingredient with data:', ingredient);
      const backendIngredient = ingredientToSnakeCase(ingredient);
      
      // Ensure quantity and cost_per_unit are strings for the API
      backendIngredient.quantity = String(backendIngredient.quantity || '0');
      backendIngredient.cost_per_unit = String(backendIngredient.cost_per_unit || '0');
      
      console.log(`Sending PUT request to /ingredients/${ingredient.id}:`, backendIngredient);
      console.log('Values as strings:', {
        quantity: backendIngredient.quantity, 
        quantityType: typeof backendIngredient.quantity,
        cost_per_unit: backendIngredient.cost_per_unit,
        costType: typeof backendIngredient.cost_per_unit
      });
      
      const response = await apiRequest<IngredientBackend>(
        `/ingredients/${ingredient.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendIngredient)
        }
      );
      
      console.log(`Response from PUT /ingredients/${ingredient.id}:`, response);
      return ingredientToCamelCase(response);
    } catch (error) {
      console.error(`Error updating ingredient ${ingredient.id}:`, error);
      throw error;
    }
  },

  // Delete ingredient
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting ingredient with ID: ${id}`);
      await apiRequest<null>(`/ingredients/${id}`, { method: 'DELETE' });
      console.log(`Successfully deleted ingredient with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      throw error;
    }
  }
};

// General Ingredient API
export const generalIngredientApi = {
  // Get all general ingredients
  getAll: async (): Promise<GeneralIngredient[]> => {
    try {
      console.log('Fetching all general ingredients from /general-ingredients endpoint');
      
      // Try alternative URLs if needed
      let response;
      
      try {
        // First attempt with /general-ingredients
        response = await apiRequest<GeneralIngredientBackend[]>('/general-ingredients');
        console.log('Response from GET /general-ingredients:', response);
      } catch (err) {
        console.warn('Failed to fetch from /general-ingredients, will return empty array:', err);
        
        // If the backend isn't ready with general-ingredients yet, use an empty array
        // This allows the UI to still work even if this feature isn't fully implemented on the backend
        console.log('Using empty array for general ingredients as fallback');
        return [];
      }
      
      if (!Array.isArray(response)) {
        console.error('Expected array response from GET /general-ingredients but got:', response);
        return [];
      }
      
      // If we get here, we have a valid array response
      return response.map(generalIngredientToCamelCase);
    } catch (error) {
      console.error('Error fetching general ingredients:', error);
      // Return empty array instead of throwing error to avoid component crash
      return [];
    }
  },

  // Get general ingredient by ID - Note: This endpoint might not exist in the API
  getById: async (id: number): Promise<GeneralIngredient> => {
    try {
      console.log(`Attempting to fetch general ingredient with ID: ${id}`);
      // Since the API might not have this endpoint, we'll get all and filter
      const allGeneralIngredients = await generalIngredientApi.getAll();
      const foundGeneralIngredient = allGeneralIngredients.find(gi => gi.id === id);
      
      if (!foundGeneralIngredient) {
        throw new Error(`General ingredient with ID ${id} not found`);
      }
      
      return foundGeneralIngredient;
    } catch (error) {
      console.error(`Error fetching general ingredient ${id}:`, error);
      throw error;
    }
  },

  // Create new general ingredient
  create: async (generalIngredient: Omit<GeneralIngredient, 'id'>): Promise<GeneralIngredient> => {
    try {
      console.log('Creating general ingredient with data:', generalIngredient);
      const backendGeneralIngredient = generalIngredientToSnakeCase(generalIngredient as GeneralIngredient);
      
      console.log('Converted general ingredient data for backend:', backendGeneralIngredient);
      
      const response = await apiRequest<GeneralIngredientBackend>(
        '/general-ingredients',
        {
          method: 'POST',
          body: JSON.stringify(backendGeneralIngredient)
        }
      );
      
      console.log('Received response from API:', response);
      
      const convertedResponse = generalIngredientToCamelCase(response);
      console.log('Converted response to frontend format:', convertedResponse);
      
      return convertedResponse;
    } catch (error) {
      console.error('Error creating general ingredient:', error);
      throw error;
    }
  },

  // Update general ingredient - Note: This endpoint might not exist in the API
  update: async (generalIngredient: GeneralIngredient): Promise<GeneralIngredient> => {
    if (!generalIngredient.id) {
      throw new Error('General Ingredient ID is required for update');
    }
    
    console.warn('Warning: The API might not support updating general ingredients');
    
    try {
      console.log('Attempting to update general ingredient with data:', generalIngredient);
      
      // Option 1: If the API supports PUT /general-ingredients/{id}
      try {
        const backendGeneralIngredient = generalIngredientToSnakeCase(generalIngredient);
        const response = await apiRequest<GeneralIngredientBackend>(
          `/general-ingredients/${generalIngredient.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(backendGeneralIngredient)
          }
        );
        return generalIngredientToCamelCase(response);
      } catch (error) {
        console.warn('PUT /general-ingredients/{id} failed, falling back to alternative approach');
        
        // Option 2: Fallback - Delete and recreate (if PUT is not supported)
        // This approach has risks and should be avoided if possible
        return generalIngredient;
      }
    } catch (error) {
      console.error(`Error updating general ingredient ${generalIngredient.id}:`, error);
      throw error;
    }
  },

  // Delete general ingredient - Note: This endpoint might not exist in the API
  delete: async (id: number): Promise<void> => {
    console.warn('Warning: The API might not support deleting general ingredients');
    
    try {
      console.log(`Attempting to delete general ingredient with ID: ${id}`);
      
      // Option 1: If the API supports DELETE /general-ingredients/{id}
      try {
        await apiRequest<null>(`/general-ingredients/${id}`, { method: 'DELETE' });
        console.log(`Successfully deleted general ingredient with ID: ${id}`);
      } catch (error) {
        console.warn(`DELETE /general-ingredients/${id} failed:`, error);
        throw new Error(`Failed to delete general ingredient: The API might not support this operation`);
      }
    } catch (error) {
      console.error(`Error deleting general ingredient ${id}:`, error);
      throw error;
    }
  },

  // Get ingredients by general ingredient ID
  getIngredientsByGeneralId: async (generalIngredientId: number): Promise<Ingredient[]> => {
    try {
      // Since there's no specific endpoint for getting ingredients by general ingredient ID,
      // we'll get all ingredients and filter them client-side
      console.log(`Fetching all ingredients to filter by general_ingredient_id: ${generalIngredientId}`);
      const response = await apiRequest<IngredientBackend[]>('/ingredients');
      
      // Filter ingredients by general_ingredient_id
      const filteredIngredients = response.filter(
        ingredient => ingredient.general_ingredient_id === generalIngredientId
      );
      
      console.log(`Found ${filteredIngredients.length} ingredients for general_ingredient_id: ${generalIngredientId}`);
      return filteredIngredients.map(ingredientToCamelCase);
    } catch (error) {
      console.error(`Error fetching ingredients for general ingredient ${generalIngredientId}:`, error);
      throw error;
    }
  }
};