import { AuditLog, AuditLogFilter } from '../types';
import { apiRequest } from './api';

// Interface for audit log with snake_case for backend (if needed)
interface AuditLogBackend {
  id?: number;
  user_id: number;
  org_id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  previous_state?: any;
  new_state: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Helper function to build URL with query parameters
const buildUrl = (endpoint: string, filter?: AuditLogFilter): string => {
  if (!filter) return endpoint;
  
  const params = new URLSearchParams();
  
  if (filter.entity_type) params.append('entity_type', filter.entity_type);
  if (filter.entity_id) params.append('entity_id', filter.entity_id.toString());
  if (filter.date_start) params.append('date_start', filter.date_start);
  if (filter.date_end) params.append('date_end', filter.date_end);
  if (filter.action_type) params.append('action_type', filter.action_type);
  
  const queryString = params.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Helper function to convert from snake_case (backend) to camelCase (frontend)
// In this case, the audit log structure already matches, so this is a pass-through
const auditLogToCamelCase = (log: AuditLogBackend): AuditLog => log as unknown as AuditLog;

// Audit API
export const auditApi = {
  // Get all audit logs with optional filtering
  getAll: async (filter?: AuditLogFilter): Promise<AuditLog[]> => {
    try {
      const url = buildUrl('/audit', filter);
      const response = await apiRequest<AuditLogBackend[]>(url);
      return response.map(auditLogToCamelCase);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Get a specific audit log by ID
  getById: async (id: number): Promise<AuditLog> => {
    try {
      const response = await apiRequest<AuditLogBackend>(`/audit/${id}`);
      return auditLogToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching audit log ${id}:`, error);
      throw error;
    }
  },

  // Get entity change history
  getEntityHistory: async (entityType: string, entityId: number): Promise<AuditLog[]> => {
    try {
      const response = await apiRequest<AuditLogBackend[]>(`/audit/entity/${entityType}/${entityId}`);
      return response.map(auditLogToCamelCase);
    } catch (error) {
      console.error(`Error fetching history for ${entityType}/${entityId}:`, error);
      throw error;
    }
  },

  // Download audit log report as CSV
  downloadReport: async (filter?: AuditLogFilter): Promise<Blob> => {
    try {
      const url = buildUrl('/reports/audit', filter);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading audit report:', error);
      throw error;
    }
  }
};

export default auditApi;