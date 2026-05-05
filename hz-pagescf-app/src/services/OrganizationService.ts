import { Organization } from '../types';
import { apiRequest } from './api';

// Interface for organization with snake_case for backend (if needed)
interface OrganizationBackend {
  id?: number;
  name: string;
  email: string;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const orgToCamelCase = (org: OrganizationBackend): Organization => org as unknown as Organization;

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const orgToSnakeCase = (org: Organization): OrganizationBackend => org as unknown as OrganizationBackend;

// Organization API
export const organizationApi = {
  // Get all organizations
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await apiRequest<OrganizationBackend[]>('/orgs');
      return response.map(orgToCamelCase);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Get organization by ID
  getById: async (id: number): Promise<Organization> => {
    try {
      const response = await apiRequest<OrganizationBackend>(`/orgs/${id}`);
      return orgToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  },

  // Get current organization 
  getCurrent: async (): Promise<Organization> => {
    try {
      const response = await apiRequest<OrganizationBackend>('/orgs/current');
      return orgToCamelCase(response);
    } catch (error) {
      console.error('Error fetching current organization:', error);
      throw error;
    }
  },

  // Create new organization
  create: async (org: Omit<Organization, 'id'>): Promise<Organization> => {
    try {
      console.log('Creating organization with data:', org);
      const backendOrg = orgToSnakeCase(org as Organization);
      const response = await apiRequest<OrganizationBackend>(
        '/orgs',
        {
          method: 'POST',
          body: JSON.stringify(backendOrg)
        }
      );
      return orgToCamelCase(response);
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  // Update organization
  update: async (org: Organization): Promise<Organization> => {
    if (!org.id) {
      throw new Error('Organization ID is required for update');
    }
    
    try {
      console.log('Updating organization with data:', org);
      const backendOrg = orgToSnakeCase(org);
      const response = await apiRequest<OrganizationBackend>(
        `/orgs/${org.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendOrg)
        }
      );
      return orgToCamelCase(response);
    } catch (error) {
      console.error(`Error updating organization ${org.id}:`, error);
      throw error;
    }
  },

  // Delete organization
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/orgs/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  }
};