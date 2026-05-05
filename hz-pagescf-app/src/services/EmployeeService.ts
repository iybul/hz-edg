import { Employee } from '../types';
import { apiRequest } from './api';

// Interface for employee with snake_case for backend (if needed)
interface EmployeeBackend {
  id?: number;
  name: string;
  role: string;
  org_id: number;
}

// Helper function to convert from snake_case (backend) to camelCase (frontend)
// In this case, the properties match, so it's a simple pass-through
const employeeToCamelCase = (employee: EmployeeBackend): Employee => employee as unknown as Employee;

// Helper function to convert from camelCase (frontend) to snake_case (backend)
const employeeToSnakeCase = (employee: Employee): EmployeeBackend => employee as unknown as EmployeeBackend;

// Employee API
export const employeeApi = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    try {
      const response = await apiRequest<EmployeeBackend[]>('/employees');
      return response.map(employeeToCamelCase);
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get employee by ID
  getById: async (id: number): Promise<Employee> => {
    try {
      const response = await apiRequest<EmployeeBackend>(`/employees/${id}`);
      return employeeToCamelCase(response);
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  // Create new employee
  create: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    try {
      console.log('Creating employee with data:', employee);
      const backendEmployee = employeeToSnakeCase(employee as Employee);
      const response = await apiRequest<EmployeeBackend>(
        '/employees',
        {
          method: 'POST',
          body: JSON.stringify(backendEmployee)
        }
      );
      return employeeToCamelCase(response);
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee
  update: async (employee: Employee): Promise<Employee> => {
    if (!employee.id) {
      throw new Error('Employee ID is required for update');
    }
    
    try {
      console.log('Updating employee with data:', employee);
      const backendEmployee = employeeToSnakeCase(employee);
      const response = await apiRequest<EmployeeBackend>(
        `/employees/${employee.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendEmployee)
        }
      );
      return employeeToCamelCase(response);
    } catch (error) {
      console.error(`Error updating employee ${employee.id}:`, error);
      throw error;
    }
  },

  // Delete employee
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest<null>(`/employees/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  }
};