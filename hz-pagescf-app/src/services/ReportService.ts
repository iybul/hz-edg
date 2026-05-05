import { ReportQuery } from '../types';
import { apiRequest } from './api';

// Helper function to build URL with query parameters
const buildReportUrl = (endpoint: string, queryParams?: ReportQuery): string => {
  if (!queryParams) return endpoint;
  
  const params = new URLSearchParams();
  
  if (queryParams.date_start) {
    params.append('date_start', queryParams.date_start);
  }
  
  if (queryParams.date_end) {
    params.append('date_end', queryParams.date_end);
  }
  
  if (queryParams.lotcode) {
    params.append('lotcode', queryParams.lotcode);
  }
  
  const queryString = params.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Report API
export const reportApi = {
  // Download batch report as CSV
  downloadBatchReport: async (queryParams?: ReportQuery): Promise<Blob> => {
    try {
      const url = buildReportUrl('/reports/batches', queryParams);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download batch report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading batch report:', error);
      throw error;
    }
  },
  
  // Download recipe report as CSV
  downloadRecipeReport: async (queryParams?: ReportQuery): Promise<Blob> => {
    try {
      const url = buildReportUrl('/reports/recipes', queryParams);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download recipe report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading recipe report:', error);
      throw error;
    }
  },
  
  // Download ingredient report as CSV
  downloadIngredientReport: async (queryParams?: ReportQuery): Promise<Blob> => {
    try {
      const url = buildReportUrl('/reports/ingredients', queryParams);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download ingredient report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading ingredient report:', error);
      throw error;
    }
  },
  
  // Download receiving log report as CSV
  downloadReceivingLogReport: async (queryParams?: ReportQuery): Promise<Blob> => {
    try {
      const url = buildReportUrl('/reports/receivinglogs', queryParams);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download receiving log report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading receiving log report:', error);
      throw error;
    }
  },
  
  // Download storage log report as CSV
  downloadStorageLogReport: async (queryParams?: ReportQuery): Promise<Blob> => {
    try {
      const url = buildReportUrl('/reports/storagelogs', queryParams);
      
      // Use fetch directly for blob response
      const token = localStorage.getItem('hazardZeroToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api'}${url}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download storage log report: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading storage log report:', error);
      throw error;
    }
  }
};