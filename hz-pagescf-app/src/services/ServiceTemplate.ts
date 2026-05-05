/**
 * Service Template
 * 
 * This file provides a template for creating new API service modules
 * that work with the updated authentication system. Copy this file and
 * replace EntityType with your specific entity (e.g., Employee, Recipe, etc.).
 */

// Replace this with your actual entity type import
// import { YourEntityType } from '../types';
import { apiRequest } from './api';

// Replace this with your actual entity type
// This is just a placeholder for the template
interface EntityType {
  id?: number;
  name: string;
  org_id: number;
}

// Interface for backend entity with snake_case properties
interface EntityTypeBackend {
  id?: number;
  // Add all properties in snake_case format
  name: string;
  org_id: number;
  // Example: created_at: string;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const toCamelCase = (entity: EntityTypeBackend): EntityType => ({
  id: entity.id,
  // Convert all properties to camelCase
  name: entity.name,
  org_id: entity.org_id,
  // Example: createdAt: entity.created_at,
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const toSnakeCase = (entity: EntityType): EntityTypeBackend => ({
  id: entity.id,
  // Convert all properties to snake_case
  name: entity.name,
  org_id: entity.org_id,
  // Format dates: date_field: entity.dateField ? entity.dateField.split('T')[0] : entity.dateField,
});

// API service
export const entityTypeApi = {
  // Get all entities
  getAll: async (): Promise<EntityType[]> => {
    try {
      const response = await apiRequest<EntityTypeBackend[]>('/entity-types');  // Replace with actual endpoint
      return response.map(toCamelCase);
    } catch (error) {
      console.error('Error fetching entity types:', error);
      throw error;
    }
  },

  // Get entity by ID
  getById: async (id: number): Promise<EntityType> => {
    try {
      const response = await apiRequest<EntityTypeBackend>(`/entity-types/${id}`);  // Replace with actual endpoint
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error fetching entity type ${id}:`, error);
      throw error;
    }
  },

  // Create new entity
  create: async (entity: Omit<EntityType, 'id'>): Promise<EntityType> => {
    try {
      const backendEntity = toSnakeCase(entity as EntityType);
      const response = await apiRequest<EntityTypeBackend>(
        '/entity-types',  // Replace with actual endpoint
        {
          method: 'POST',
          body: JSON.stringify(backendEntity)
        }
      );
      return toCamelCase(response);
    } catch (error) {
      console.error('Error creating entity type:', error);
      throw error;
    }
  },

  // Update entity
  update: async (entity: EntityType): Promise<EntityType> => {
    if (!entity.id) {
      throw new Error('Entity ID is required for update');
    }
    
    try {
      const backendEntity = toSnakeCase(entity);
      const response = await apiRequest<EntityTypeBackend>(
        `/entity-types/${entity.id}`,  // Replace with actual endpoint
        {
          method: 'PUT',
          body: JSON.stringify(backendEntity)
        }
      );
      return toCamelCase(response);
    } catch (error) {
      console.error(`Error updating entity type ${entity.id}:`, error);
      throw error;
    }
  },

  // Delete entity
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/entity-types/${id}`, { method: 'DELETE' });  // Replace with actual endpoint
    } catch (error) {
      console.error(`Error deleting entity type ${id}:`, error);
      throw error;
    }
  }
};