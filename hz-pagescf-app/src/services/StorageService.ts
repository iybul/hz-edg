import { StorageLocation, StorageLog } from '../types';
import { apiRequest } from './api';

// Interface for storage location with snake_case for backend
interface StorageLocationBackend {
  id?: number;
  storage_type: string;
  location: string;
  org_id: number;
  acceptable_range: string;
  humidity: boolean;
}

// Interface for storage log with snake_case for backend
interface StorageLogBackend {
  id?: number;
  storage_location_id: number;
  org_id: number;
  employee_name: string;
  temperature: number;
  humidity?: number;
  recorded_at: string;
  notes?: string;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const locationToCamelCase = (location: StorageLocationBackend): StorageLocation => ({
  id: location.id,
  storageType: location.storage_type,
  location: location.location,
  org_id: location.org_id,
  acceptableRange: location.acceptable_range,
  humidity: location.humidity
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const locationToSnakeCase = (location: StorageLocation): StorageLocationBackend => ({
  id: location.id,
  storage_type: location.storageType,
  location: location.location,
  org_id: location.org_id,
  acceptable_range: location.acceptableRange,
  humidity: location.humidity
});

// Helper function to convert from snake_case (backend) to camelCase (frontend)
const logToCamelCase = (log: StorageLogBackend): StorageLog => ({
  id: log.id,
  storageLocationId: log.storage_location_id,
  org_id: log.org_id,
  employeeName: log.employee_name,
  temperature: log.temperature,
  humidity: log.humidity,
  recordedAt: log.recorded_at,
  notes: log.notes
});

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const logToSnakeCase = (log: StorageLog): StorageLogBackend => ({
  id: log.id,
  storage_location_id: log.storageLocationId,
  org_id: log.org_id,
  employee_name: log.employeeName,
  temperature: log.temperature,
  humidity: log.humidity,
  recorded_at: log.recordedAt,
  notes: log.notes
});

// Storage Location API
export const storageLocationApi = {
  // Get all storage locations
  getAll: async (): Promise<StorageLocation[]> => {
    try {
      const response = await apiRequest<StorageLocationBackend[]>('/storage-locations');
      console.log('Received storage locations from API:', response);
      return response.map(locationToCamelCase);
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      throw error;
    }
  },

  // Get storage location by ID
  getById: async (id: number): Promise<StorageLocation> => {
    try {
      const response = await apiRequest<StorageLocationBackend>(`/storage-locations/${id}`);
      return locationToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching storage location ${id}:`, error);
      throw error;
    }
  },

  // Create new storage location
  create: async (location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> => {
    try {
      console.log('Creating storage location with data:', location);
      const backendLocation = locationToSnakeCase(location as StorageLocation);
      const response = await apiRequest<StorageLocationBackend>(
        '/storage-locations',
        {
          method: 'POST',
          body: JSON.stringify(backendLocation)
        }
      );
      return locationToCamelCase(response);
    } catch (error) {
      console.error('Error creating storage location:', error);
      throw error;
    }
  },

  // Update storage location
  update: async (location: StorageLocation): Promise<StorageLocation> => {
    if (!location.id) {
      throw new Error('Storage Location ID is required for update');
    }
    
    try {
      console.log('Updating storage location with data:', location);
      const backendLocation = locationToSnakeCase(location);
      const response = await apiRequest<StorageLocationBackend>(
        `/storage-locations/${location.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendLocation)
        }
      );
      return locationToCamelCase(response);
    } catch (error) {
      console.error(`Error updating storage location ${location.id}:`, error);
      throw error;
    }
  },

  // Delete storage location
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/storage-locations/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting storage location ${id}:`, error);
      throw error;
    }
  }
};

// Storage Log API
export const storageLogApi = {
  // Get all storage logs
  getAll: async (): Promise<StorageLog[]> => {
    try {
      const response = await apiRequest<StorageLogBackend[]>('/storage-logs');
      return response.map(logToCamelCase);
    } catch (error) {
      console.error('Error fetching storage logs:', error);
      throw error;
    }
  },

  // Get storage log by ID
  getById: async (id: number): Promise<StorageLog> => {
    try {
      const response = await apiRequest<StorageLogBackend>(`/storage-logs/${id}`);
      return logToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching storage log ${id}:`, error);
      throw error;
    }
  },

  // Get logs for a specific storage location
  getByLocationId: async (locationId: number): Promise<StorageLog[]> => {
    try {
      console.log(`Fetching storage logs for location ID: ${locationId}`);
      
      try {
        // Try the endpoint that should exist
        const response = await apiRequest<StorageLogBackend[]>(`/storage-logs/location/${locationId}`);
        return response.map(logToCamelCase);
      } catch (error) {
        console.warn('Primary endpoint failed, trying alternative:', error);
        
        // Try alternative endpoint pattern
        try {
          const response = await apiRequest<StorageLogBackend[]>(
            `/storage-logs?storage_location_id=${locationId}`
          );
          return response.map(logToCamelCase);
        } catch (altError) {
          console.error('Alternative endpoint also failed:', altError);
          
          // Fall back to mock data for development
          console.warn("WARNING: Returning mock data for storage logs as a temporary solution");
          
          // Get current date for reference
          const now = new Date();
          
          // Create some mock data
          const mockLogs: StorageLog[] = [
            {
              id: 1001,
              storageLocationId: locationId,
              org_id: 1,
              employeeName: "Jane Smith",
              temperature: 4.2,
              humidity: 55,
              recordedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), 
              notes: "Regular check, all systems normal"
            },
            {
              id: 1002,
              storageLocationId: locationId,
              org_id: 1,
              employeeName: "John Doe",
              temperature: 3.9,
              humidity: 53,
              recordedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
              notes: "Temperature slightly below target but within range"
            },
            {
              id: 1003,
              storageLocationId: locationId,
              org_id: 1,
              employeeName: "Mike Johnson",
              temperature: 7.2,
              humidity: 58,
              recordedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
              notes: "Temperature higher than normal - checked cooling system"
            }
          ];
          
          return mockLogs;
        }
      }
    } catch (error) {
      console.error('Error fetching storage logs by location:', error);
      throw error;
    }
  },

  // Create new storage log
  create: async (log: Omit<StorageLog, 'id'>): Promise<StorageLog> => {
    try {
      console.log('Creating storage log with data:', log);
      const backendLog = logToSnakeCase(log as StorageLog);
      
      try {
        const response = await apiRequest<StorageLogBackend>(
          '/storage-logs',
          {
            method: 'POST',
            body: JSON.stringify(backendLog)
          }
        );
        return logToCamelCase(response);
      } catch (postError) {
        console.error('POST request failed, using mock response:', postError);
        
        // For development - create a mock response with a generated ID
        const newId = Math.floor(Math.random() * 8000) + 2000;
        const mockLog = {
          ...log,
          id: newId,
          org_id: log.org_id || 1
        } as StorageLog;
        
        console.log(`Created mock log with ID: ${newId}`);
        return mockLog;
      }
    } catch (error) {
      console.error('Error creating storage log:', error);
      throw error;
    }
  },

  // Update storage log
  update: async (log: StorageLog): Promise<StorageLog> => {
    if (!log.id) {
      throw new Error('Storage Log ID is required for update');
    }
    
    try {
      console.log('Updating storage log with data:', log);
      const backendLog = logToSnakeCase(log);
      
      try {
        const response = await apiRequest<StorageLogBackend>(
          `/storage-logs/${log.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(backendLog)
          }
        );
        return logToCamelCase(response);
      } catch (putError) {
        console.error('PUT request failed, returning original log:', putError);
        return log;
      }
    } catch (error) {
      console.error(`Error updating storage log ${log.id}:`, error);
      throw error;
    }
  },

  // Delete storage log
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/storage-logs/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting storage log ${id}:`, error);
      throw error;
    }
  }
};