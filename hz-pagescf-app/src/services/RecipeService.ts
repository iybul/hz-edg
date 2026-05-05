import { Recipe, RecipeStep } from '../types';
import { apiRequest } from './api';

// Interface for recipe step with snake_case for backend
interface RecipeStepBackend {
  id?: number;
  recipe_id?: number;
  step_number: number;
  instructions: string;
}

// Interface for recipe with snake_case for backend
interface RecipeBackend {
  id?: number;
  recipecode: string;
  name: string;
  date_made: string;
  org_id: number;
  general_ingredient_ids: number[];
  steps: RecipeStepBackend[];
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const recipeToCamelCase = (recipe: RecipeBackend): Recipe => ({
  id: recipe.id,
  recipecode: recipe.recipecode,
  name: recipe.name,
  date_made: recipe.date_made,
  org_id: recipe.org_id,
  general_ingredient_ids: recipe.general_ingredient_ids,
  steps: recipe.steps.map((step: RecipeStepBackend): RecipeStep => ({
    id: step.id,
    recipe_id: step.recipe_id,
    step_number: step.step_number,
    instructions: step.instructions
  }))
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const recipeToSnakeCase = (recipe: Recipe): RecipeBackend => ({
  id: recipe.id,
  recipecode: recipe.recipecode,
  name: recipe.name,
  date_made: recipe.date_made,
  org_id: recipe.org_id,
  general_ingredient_ids: recipe.general_ingredient_ids,
  steps: recipe.steps.map((step: RecipeStep): RecipeStepBackend => ({
    id: step.id,
    recipe_id: step.recipe_id,
    step_number: step.step_number,
    instructions: step.instructions
  }))
});

// Recipe API
export const recipeApi = {
  // Get all recipes
  getAll: async (): Promise<Recipe[]> => {
    try {
      const response = await apiRequest<RecipeBackend[]>('/recipes');
      return response.map(recipeToCamelCase);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Get recipe by ID
  getById: async (id: number): Promise<Recipe> => {
    try {
      const response = await apiRequest<RecipeBackend>(`/recipes/${id}`);
      return recipeToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  },

  // Create new recipe
  create: async (recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
    try {
      console.log('Creating recipe with data:', recipe);
      const backendRecipe = recipeToSnakeCase(recipe as Recipe);
      const response = await apiRequest<RecipeBackend>(
        '/recipes',
        {
          method: 'POST',
          body: JSON.stringify(backendRecipe)
        }
      );
      return recipeToCamelCase(response);
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Update recipe
  update: async (recipe: Recipe): Promise<Recipe> => {
    if (!recipe.id) {
      throw new Error('Recipe ID is required for update');
    }
    
    try {
      console.log('Updating recipe with data:', recipe);
      const backendRecipe = recipeToSnakeCase(recipe);
      const response = await apiRequest<RecipeBackend>(
        `/recipes/${recipe.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendRecipe)
        }
      );
      return recipeToCamelCase(response);
    } catch (error) {
      console.error(`Error updating recipe ${recipe.id}:`, error);
      throw error;
    }
  },

  // Delete recipe
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/recipes/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting recipe ${id}:`, error);
      throw error;
    }
  }
};