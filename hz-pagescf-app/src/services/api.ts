import { Organization, Employee, Recipe, Ingredient, Batch, GeneralIngredient } from '../types';

export interface ApiResponse<T> {
  data?: T;
  status?: number;
  error?: string;
}

// Error type for API errors
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Check if we have an environment variable for the API URL, otherwise use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api';

// Create a reusable fetch function that includes auth headers
export const apiRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  // Always grab the token directly from localStorage
  const token = localStorage.getItem('hazardZeroToken');
  console.log(`API Request to ${endpoint}`, { 
    hasToken: !!token, 
    tokenStart: token ? token.substring(0, 15) + '...' : 'none',
    tokenLength: token?.length || 0 
  });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth header if token exists
  if (token) {
    // Clean token - remove any extra whitespace
    let cleanToken = token.trim();
    
    // Check if token already includes 'Bearer' prefix
    if (cleanToken.startsWith('Bearer ')) {
      headers['Authorization'] = cleanToken;
      console.log('Using token with existing Bearer prefix');
    } else {
      headers['Authorization'] = `Bearer ${cleanToken}`;
      console.log('Adding Bearer prefix to token');
    }
    
    // Force read back the token to ensure it's correctly set
    const authHeader = headers['Authorization'];
    if (authHeader) {
      console.log('Authorization header:', 
        authHeader.substring(0, Math.min(30, authHeader.length)) + '...');
    }
    
    // Refresh the token in localStorage to ensure it's properly stored
    localStorage.setItem('hazardZeroToken', cleanToken);
  } else {
    console.warn('No token found in localStorage for API request to', endpoint);
  }
  
  const requestUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`Sending request to: ${requestUrl}`, { method: options.method || 'GET', headers });
  
  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers,
    });
    
    console.log(`Response from ${endpoint}:`, { 
      status: response.status, 
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, string>)
    });
    
    // Track if we've already started a redirect to prevent multiple redirects
    const hasRedirected = sessionStorage.getItem('redirectingToLogin');
    
    // Handle 401 Unauthorized errors globally
    if (response.status === 401) {
      console.error('Unauthorized (401) response detected for endpoint:', endpoint);
      
      // Get response text for debugging
      const responseText = await response.text();
      console.error('401 Response body:', responseText);
      
      // Clear token if expired/invalid
      console.log('Received 401 Unauthorized response - clearing auth state');
      localStorage.removeItem('hazardZeroToken');
      localStorage.removeItem('hazardZeroOrgId');
      
      // Only redirect once to avoid multiple redirects
      if (!hasRedirected) {
        // Set a flag to prevent multiple redirects
        sessionStorage.setItem('redirectingToLogin', 'true');
        
        // Delay redirect slightly to allow logs to complete
        setTimeout(() => {
          console.log('Redirecting to login page after 401 response');
          sessionStorage.removeItem('redirectingToLogin');
          window.location.href = '/login';
        }, 500);
      } else {
        console.log('Already redirecting to login page, skipping additional redirect');
      }
      
      throw new ApiError('Session expired. Please login again.', 401);
    }
    
    // For non-ok responses, throw error with status and message
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response (${response.status}) for ${requestUrl}:`, responseText);
      
      let errData: Record<string, any> = {};
      try {
        errData = JSON.parse(responseText);
      } catch (e) {
        console.warn('Failed to parse error response as JSON, raw response:', responseText);
      }
      
      // Specific handling for 500 errors
      if (response.status === 500) {
        console.error(`Server error details for ${endpoint}:`, {
          status: response.status,
          url: requestUrl,
          responseText,
          headers: response.headers
        });
      }
      
      throw new ApiError(
        (errData && errData.error) || response.statusText || 'API request failed', 
        response.status, 
        errData
      );
    }
    
    // For empty responses (like 204 No Content)
    if (response.status === 204) {
      return null as T;
    }
    
    // Read the response as text first
    const responseText = await response.text();
    
    // If empty response, return null
    if (!responseText.trim()) {
      console.log(`Empty response body from ${endpoint}`);
      return null as T;
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(responseText) as T;
      console.log(`Parsed response from ${endpoint}:`, data);
      return data;
    } catch (e) {
      console.error(`Failed to parse response from ${endpoint} as JSON:`, responseText);
      throw new ApiError(`Invalid JSON response from ${endpoint}`, response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API request failed:', error);
    throw new ApiError('Network error', 0);
  }
};

// Error handling is now done directly in the apiRequest function

// API methods for each entity with type safety
export const recipeApi = {
  getAll: () => apiRequest<Recipe[]>('/recipes'),
  getById: (id: number) => apiRequest<Recipe>(`/recipes/${id}`),
  create: (data: Recipe) => apiRequest<Recipe>('/recipes', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: Recipe) => apiRequest<Recipe>(`/recipes/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/recipes/${id}`, { method: 'DELETE' }),
};

export const batchApi = {
  getAll: () => apiRequest<Batch[]>('/batches'),
  getById: (id: number) => apiRequest<Batch>(`/batches/${id}`),
  create: (data: Batch) => apiRequest<Batch>('/batches', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: Batch) => apiRequest<Batch>(`/batches/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/batches/${id}`, { method: 'DELETE' }),
};

export const ingredientApi = {
  getAll: () => apiRequest<Ingredient[]>('/ingredients'),
  getById: (id: number) => apiRequest<Ingredient>(`/ingredients/${id}`),
  create: (data: Ingredient) => apiRequest<Ingredient>('/ingredients', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: Ingredient) => apiRequest<Ingredient>(`/ingredients/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/ingredients/${id}`, { method: 'DELETE' }),
};

// General ingredient API
export const generalIngredientApi = {
  getAll: () => apiRequest<GeneralIngredient[]>('/general-ingredients'),
  getById: (id: number) => apiRequest<GeneralIngredient>(`/general-ingredients/${id}`),
  create: (data: GeneralIngredient) => apiRequest<GeneralIngredient>('/general-ingredients', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: GeneralIngredient) => apiRequest<GeneralIngredient>(`/general-ingredients/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/general-ingredients/${id}`, { method: 'DELETE' }),
  getIngredientsByGeneralId: (id: number) => apiRequest<Ingredient[]>(`/general-ingredients/${id}/ingredients`),
};
// // Authentication services
// export const authService = {
//   // Login
//   login: async (email: string, password: string): Promise<ApiResponse<{ token: string; organization: Organization }>> => {
//     try {
//       const response: AxiosResponse<{ token: string; organization: Organization }> = 
//         await api.post('/auth/login', { email, password });
//       return { data: response.data };
//     } catch (error) {
//       return handleError(error);
//     }
//   },

//   // Register
//   register: async (name: string, email: string, password: string): Promise<ApiResponse<{ token: string; organization: Organization }>> => {
//     try {
//       const response: AxiosResponse<{ token: string; organization: Organization }> = 
//         await api.post('/auth/register', { name, email, password });
//       return { data: response.data };
//     } catch (error) {
//       return handleError(error);
//     }
//   },

//   // Logout
//   logout: async (): Promise<ApiResponse<void>> => {
//     try {
//       await api.post('/auth/logout');
//       return { data: undefined };
//     } catch (error) {
//       return handleError(error);
//     }
//   }
// };

// Organization API using the new pattern
export const organizationApi = {
  getAll: () => apiRequest<Organization[]>('/orgs'),
  getById: (id: number) => apiRequest<Organization>(`/orgs/${id}`),
  create: (data: Organization) => apiRequest<Organization>('/orgs', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: Organization) => apiRequest<Organization>(`/orgs/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/orgs/${id}`, { method: 'DELETE' }),
};

// Employee API using the new pattern
export const employeeApi = {
  getAll: () => apiRequest<Employee[]>('/employees'),
  getById: (id: number) => apiRequest<Employee>(`/employees/${id}`),
  create: (data: Omit<Employee, 'id'>) => apiRequest<Employee>('/employees', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: Employee) => apiRequest<Employee>(`/employees/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiRequest<null>(`/employees/${id}`, { method: 'DELETE' }),
};

// Recipe API is already defined in the modern format above (lines 100-112)

// Ingredient API is already defined in the modern format above (lines 128-140)

// Batch API is already defined in the modern format above (lines 114-126)

// Report APIs are now defined in the ReportService.ts file
// The reportApi is exported from services/index.ts

// Export apiRequest and ApiError for use in other service files